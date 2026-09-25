import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { Product, Order, ContactMessage } from './types';
import { INITIAL_PRODUCTS } from './data/initialProducts';

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validate connection on boot
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();

// Initial database seeding if empty
let seedingPromise: Promise<void> | null = null;
export async function ensureProductsSeeded(): Promise<void> {
  if (seedingPromise) return seedingPromise;
  seedingPromise = (async () => {
    const productsPath = 'products';
    try {
      const snap = await getDocs(collection(db, productsPath));
      if (snap.empty) {
        console.log('Seeding initial products to Firestore...');
        const now = new Date().toISOString();
        for (const item of INITIAL_PRODUCTS) {
          const productDoc: Product = {
            ...item,
            createdAt: now,
            updatedAt: now,
          };
          await setDoc(doc(db, productsPath, item.id), productDoc);
        }
        console.log('Initial products successfully seeded!');
      }
    } catch (error) {
      console.warn('Seeding check warning:', error);
      // Non-fatal, application will continue
    }
  })();
  return seedingPromise;
}

// Image compression and permanent upload helper
export async function compressAndUploadImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = async () => {
      try {
        const rawDataUrl = reader.result as string;
        
        // Compress using HTML Canvas
        const img = new Image();
        img.onerror = () => reject(new Error('Invalid image format'));
        img.onload = async () => {
          try {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            const maxDimension = 1200;

            if (width > maxDimension || height > maxDimension) {
              if (width > height) {
                height = Math.round((height * maxDimension) / width);
                width = maxDimension;
              } else {
                width = Math.round((width * maxDimension) / height);
                height = maxDimension;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              throw new Error('Canvas context not available');
            }

            // High-quality render
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, width, height);

            // Compress as WebP or JPEG
            const compressedDataUrl = canvas.toDataURL('image/webp', 0.85);

            // 1. Upload to persistent server storage
            let publicUrl = '';
            try {
              const res = await fetch('/api/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  dataUrl: compressedDataUrl,
                  fileName: file.name
                })
              });
              if (res.ok) {
                const data = await res.json();
                if (data.url) {
                  // Resolve absolute URL so it is accessible from any device or mobile phone
                  publicUrl = new URL(data.url, window.location.origin).href;
                }
              }
            } catch (netErr) {
              console.warn('Server upload fallback:', netErr);
            }

            // Generate unique image ID
            const imageId = `img_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
            
            // If server returned a public URL, use it; otherwise fallback to permanent dataUrl
            const finalUrl = publicUrl || compressedDataUrl;

            // Also persist record in Firestore images collection
            try {
              await setDoc(doc(db, 'images', imageId), {
                id: imageId,
                url: finalUrl,
                fileName: file.name,
                dataUrl: compressedDataUrl.length < 750000 ? compressedDataUrl : '',
                createdAt: new Date().toISOString()
              });
            } catch (fsErr) {
              console.warn('Failed to index image metadata to Firestore:', fsErr);
            }

            resolve(finalUrl);
          } catch (compErr) {
            reject(compErr);
          }
        };
        img.src = rawDataUrl;
      } catch (err) {
        reject(err);
      }
    };
    reader.readAsDataURL(file);
  });
}

// Product Management API
export async function addProductToDb(product: Omit<Product, 'createdAt' | 'updatedAt'>): Promise<Product> {
  const path = 'products';
  const now = new Date().toISOString();
  const fullProduct: Product = {
    ...product,
    createdAt: now,
    updatedAt: now
  };
  try {
    await setDoc(doc(db, path, fullProduct.id), fullProduct);
    return fullProduct;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${path}/${fullProduct.id}`);
  }
}

export async function updateProductInDb(id: string, updates: Partial<Product>): Promise<void> {
  const path = `products/${id}`;
  try {
    const updatedData = {
      ...updates,
      updatedAt: new Date().toISOString()
    };
    await updateDoc(doc(db, 'products', id), updatedData);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteProductFromDb(id: string): Promise<void> {
  const path = `products/${id}`;
  try {
    await deleteDoc(doc(db, 'products', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Order Management API
export async function createOrderInDb(order: Order): Promise<void> {
  const path = `orders/${order.id}`;
  try {
    await setDoc(doc(db, 'orders', order.id), order);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function fetchOrdersFromDb(): Promise<Order[]> {
  const path = 'orders';
  try {
    const snap = await getDocs(collection(db, path));
    return snap.docs.map(d => d.data() as Order);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

// Contact Inquiry API
export async function submitContactInquiry(inquiry: ContactMessage): Promise<void> {
  const path = `inquiries/${inquiry.id}`;
  try {
    await setDoc(doc(db, 'inquiries', inquiry.id), inquiry);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}
