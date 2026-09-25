import React, { useState, useRef } from 'react';
import { Product, Order } from '../types';
import {
  addProductToDb,
  updateProductInDb,
  deleteProductFromDb,
  compressAndUploadImage,
  ensureProductsSeeded
} from '../firebase';
import {
  Plus,
  Trash2,
  Edit3,
  Upload,
  Image as ImageIcon,
  CheckCircle,
  Package,
  ShoppingBag,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Search,
  Eye,
  AlertTriangle,
  X
} from 'lucide-react';

interface AdminDashboardProps {
  products: Product[];
  orders: Order[];
  onRefreshData: () => void;
  onClose: () => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  orders,
  onRefreshData,
  onClose,
  showToast,
}) => {
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'storage'>('products');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State for Add / Edit
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Audio & Headphones');
  const [formCustomCategory, setFormCustomCategory] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formDiscountPrice, setFormDiscountPrice] = useState('');
  const [formStock, setFormStock] = useState('20');
  const [formDescription, setFormDescription] = useState('');
  const [formImages, setFormImages] = useState<string[]>([]);
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const existingCategories = [
    'Audio & Headphones',
    'Smartwatches & Wearables',
    'Computer & Office Tech',
    'Bags & Travel Gear',
    'Accessories & Power',
    'Other / Custom'
  ];

  // Open modal in Add mode
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormCategory('Audio & Headphones');
    setFormCustomCategory('');
    setFormPrice('');
    setFormDiscountPrice('');
    setFormStock('20');
    setFormDescription('');
    setFormImages([]);
    setFormIsFeatured(false);
    setIsAddModalOpen(true);
  };

  // Open modal in Edit mode
  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormName(product.name);
    if (existingCategories.includes(product.category)) {
      setFormCategory(product.category);
      setFormCustomCategory('');
    } else {
      setFormCategory('Other / Custom');
      setFormCustomCategory(product.category);
    }
    setFormPrice(product.price.toString());
    setFormDiscountPrice(product.discountPrice ? product.discountPrice.toString() : '');
    setFormStock(product.stock.toString());
    setFormDescription(product.description || '');
    setFormImages(product.images || []);
    setFormIsFeatured(product.isFeatured || false);
    setIsAddModalOpen(true);
  };

  // Handle uploading product images from phone or computer
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(`Processing ${files.length} image(s)...`);

    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress(`Optimizing & uploading image ${i + 1} of ${files.length}...`);
        const publicUrl = await compressAndUploadImage(file);
        uploadedUrls.push(publicUrl);
      }

      setFormImages((prev) => [...prev, ...uploadedUrls]);
      showToast(`Successfully uploaded ${uploadedUrls.length} permanent public image(s)!`, 'success');
    } catch (err: any) {
      console.error('Upload failed:', err);
      showToast(err.message || 'Image upload failed. Please try again.', 'error');
    } finally {
      setIsUploading(false);
      setUploadProgress('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Handle adding external public image URL
  const handleAddUrlImage = () => {
    if (!urlInput.trim()) return;
    try {
      new URL(urlInput.trim());
      setFormImages((prev) => [...prev, urlInput.trim()]);
      setUrlInput('');
      showToast('Image URL added successfully', 'success');
    } catch {
      showToast('Please enter a valid HTTP/HTTPS image URL', 'error');
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit Add or Edit Product
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast('Please enter a product name', 'error');
      return;
    }
    const priceNum = parseFloat(formPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      showToast('Please enter a valid positive price', 'error');
      return;
    }
    const stockNum = parseInt(formStock, 10);
    if (isNaN(stockNum) || stockNum < 0) {
      showToast('Please enter a valid stock count', 'error');
      return;
    }

    if (formImages.length === 0) {
      showToast('Please upload or provide at least one product image', 'error');
      return;
    }

    const finalCategory =
      formCategory === 'Other / Custom' && formCustomCategory.trim()
        ? formCustomCategory.trim()
        : formCategory;

    const discountNum = formDiscountPrice ? parseFloat(formDiscountPrice) : undefined;

    setIsSaving(true);
    try {
      if (editingProduct) {
        // Update product
        await updateProductInDb(editingProduct.id, {
          name: formName.trim(),
          category: finalCategory,
          price: priceNum,
          discountPrice: discountNum,
          stock: stockNum,
          description: formDescription.trim(),
          images: formImages,
          isFeatured: formIsFeatured,
        });
        showToast(`Product "${formName}" updated in online database!`, 'success');
      } else {
        // Create new product with unique ID
        const productId = `prod-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
        await addProductToDb({
          id: productId,
          name: formName.trim(),
          category: finalCategory,
          price: priceNum,
          discountPrice: discountNum,
          stock: stockNum,
          description: formDescription.trim(),
          images: formImages,
          isFeatured: formIsFeatured,
          rating: 5.0,
          reviewsCount: 1,
        });
        showToast(`Product "${formName}" created and stored permanently!`, 'success');
      }

      setIsAddModalOpen(false);
      onRefreshData();
    } catch (err: any) {
      console.error('Failed to save product:', err);
      showToast(err.message || 'Failed to save product in database', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete product
  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${name}" from the database?`)) {
      return;
    }
    try {
      await deleteProductFromDb(id);
      showToast(`Product "${name}" deleted from online database`, 'success');
      onRefreshData();
    } catch (err: any) {
      console.error('Delete error:', err);
      showToast(err.message || 'Failed to delete product', 'error');
    }
  };

  // Quick stock adjuster (+ / - 5)
  const handleQuickStock = async (product: Product, delta: number) => {
    const newStock = Math.max(0, product.stock + delta);
    try {
      await updateProductInDb(product.id, { stock: newStock });
      onRefreshData();
    } catch (err: any) {
      showToast('Failed to update stock', 'error');
    }
  };

  // Copy public URL
  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    showToast('Public image URL copied to clipboard!', 'info');
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  // Seed sample products
  const handleSeedCatalog = async () => {
    try {
      await ensureProductsSeeded();
      showToast('Sample products re-seeded in online database!', 'success');
      onRefreshData();
    } catch (err: any) {
      showToast('Seeding error: ' + err.message, 'error');
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalCatalogValue = products.reduce(
    (sum, p) => sum + (p.discountPrice || p.price) * p.stock,
    0
  );
  const totalOrdersValue = orders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex flex-col">
      {/* Top Navbar */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between text-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-lg">
            LM
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base tracking-tight">LOGI MARKETING Admin Portal</h1>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                Live Cloud DB
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Persistent online catalog, cross-device image management & orders
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onRefreshData}
            title="Refresh database records"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Sync DB</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 bg-slate-950 p-6 md:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <span className="text-xs text-slate-400 font-medium">Total Products</span>
              <div className="text-2xl font-bold text-white mt-1">{products.length}</div>
              <span className="text-[11px] text-emerald-400">Dynamically loaded from Firestore</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <span className="text-xs text-slate-400 font-medium">Stock Inventory Value</span>
              <div className="text-2xl font-bold text-white mt-1">
                ${totalCatalogValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <span className="text-[11px] text-indigo-400">{products.reduce((s, p) => s + p.stock, 0)} total units</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <span className="text-xs text-slate-400 font-medium">Customer Orders</span>
              <div className="text-2xl font-bold text-white mt-1">{orders.length}</div>
              <span className="text-[11px] text-amber-400">Total Revenue: ${totalOrdersValue.toFixed(2)}</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <span className="text-xs text-slate-400 font-medium">Permanent Image Storage</span>
              <div className="text-2xl font-bold text-emerald-400 mt-1">Active & Public</div>
              <span className="text-[11px] text-slate-400">Accessible across all devices</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('products')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === 'products'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                Products Management ({products.length})
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === 'orders'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                Customer Orders ({orders.length})
              </button>

              <button
                onClick={() => setActiveTab('storage')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === 'storage'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                Image Storage & Public URLs
              </button>
            </div>

            {activeTab === 'products' && (
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search products or IDs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-1.5 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 w-56"
                  />
                </div>
                <button
                  onClick={handleSeedCatalog}
                  title="Reseed sample products if empty"
                  className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium cursor-pointer"
                >
                  Reseed Demo Items
                </button>
              </div>
            )}
          </div>

          {/* TAB 1: Products Table */}
          {activeTab === 'products' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
                    <tr>
                      <th className="py-3.5 px-4">Product Image</th>
                      <th className="py-3.5 px-4">Title & Details</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Price / Discount</th>
                      <th className="py-3.5 px-4">Stock Inventory</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-200">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400">
                          <Package className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                          <p className="font-semibold text-sm">No products found in online database.</p>
                          <p className="text-xs text-slate-500 mt-1">
                            Click "Add Product" above to upload an item and images from your phone or computer.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((p) => {
                        const img = (p.images && p.images[0]) || '/placeholder-fallback.svg';
                        return (
                          <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                            {/* Image Thumbnail */}
                            <td className="py-3 px-4">
                              <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0 relative group">
                                <img
                                  src={img}
                                  alt={p.name}
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/placeholder-fallback.svg';
                                  }}
                                  className="w-full h-full object-cover"
                                />
                                {p.images && p.images.length > 1 && (
                                  <span className="absolute bottom-0.5 right-0.5 bg-black/80 text-white text-[9px] font-bold px-1 rounded">
                                    +{p.images.length - 1}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Details */}
                            <td className="py-3 px-4">
                              <div className="font-bold text-white text-sm line-clamp-1">{p.name}</div>
                              <div className="font-mono text-[10px] text-slate-400">{p.id}</div>
                              {p.isFeatured && (
                                <span className="inline-block mt-0.5 text-[10px] font-semibold text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded-full border border-indigo-800/50">
                                  Featured Home
                                </span>
                              )}
                            </td>

                            {/* Category */}
                            <td className="py-3 px-4">
                              <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-medium">
                                {p.category}
                              </span>
                            </td>

                            {/* Price */}
                            <td className="py-3 px-4">
                              <div className="font-bold text-white">
                                ${((p.discountPrice || p.price)).toFixed(2)}
                              </div>
                              {p.discountPrice && (
                                <div className="text-[11px] text-slate-500 line-through">
                                  ${p.price.toFixed(2)}
                                </div>
                              )}
                            </td>

                            {/* Stock */}
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-2 py-0.5 rounded-md font-semibold text-[11px] ${
                                    p.stock <= 0
                                      ? 'bg-rose-950/80 text-rose-300 border border-rose-800/50'
                                      : p.stock < 5
                                      ? 'bg-amber-950/80 text-amber-300 border border-amber-800/50'
                                      : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/50'
                                  }`}
                                >
                                  {p.stock <= 0 ? 'Out of Stock' : `${p.stock} in stock`}
                                </span>

                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleQuickStock(p, -1)}
                                    title="Decrease stock by 1"
                                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                                  >
                                    -
                                  </button>
                                  <button
                                    onClick={() => handleQuickStock(p, 1)}
                                    title="Increase stock by 1"
                                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleOpenEditModal(p)}
                                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                                  title="Edit Product"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(p.id, p.name)}
                                  className="p-2 rounded-lg bg-slate-800 hover:bg-rose-950/80 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                                  title="Delete Product"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: Customer Orders */}
          {activeTab === 'orders' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl p-6">
              <h2 className="text-base font-bold text-white mb-4">
                Real-Time Customer Orders ({orders.length})
              </h2>

              {orders.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <ShoppingBag className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                  <p className="font-semibold text-sm">No orders recorded yet.</p>
                  <p className="text-xs text-slate-500 mt-1">
                    When customers complete checkout on the website, their orders will appear here automatically.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                        <div>
                          <span className="font-mono font-bold text-white text-sm">{ord.id}</span>
                          <span className="text-xs text-slate-500 ml-3">
                            {new Date(ord.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800/60">
                            {ord.paymentMethod}
                          </span>
                          <span className="text-base font-extrabold text-emerald-400">
                            ${ord.total.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
                        <div>
                          <span className="text-slate-500 font-semibold block mb-0.5">Customer</span>
                          <div className="font-bold text-white">{ord.customerName}</div>
                          <div>{ord.customerEmail}</div>
                          <div>{ord.customerPhone}</div>
                        </div>

                        <div>
                          <span className="text-slate-500 font-semibold block mb-0.5">Shipping Destination</span>
                          <div>{ord.shippingAddress}</div>
                          <div>{ord.city} {ord.postalCode}</div>
                        </div>

                        <div>
                          <span className="text-slate-500 font-semibold block mb-0.5">Order Line Items</span>
                          <div className="space-y-1">
                            {ord.items.map((i, idx) => (
                              <div key={idx} className="flex justify-between">
                                <span className="truncate max-w-[180px]">
                                  {i.quantity}x {i.name}
                                </span>
                                <span className="font-medium">${(i.price * i.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Image Storage & Public URLs Inspector */}
          {activeTab === 'storage' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div>
                <h2 className="text-base font-bold text-white">
                  Cross-Device Public Image Storage Inspector
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  All images uploaded by the admin are hosted permanently and accessible via public HTTP URLs.
                  You can copy and test any URL in private windows or another mobile phone to verify cross-device accessibility.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                {products.flatMap((p) =>
                  (p.images || []).map((imgUrl, idx) => (
                    <div
                      key={`${p.id}-${idx}`}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-3"
                    >
                      <div className="flex gap-3 items-center">
                        <div className="w-16 h-16 rounded-lg bg-slate-900 overflow-hidden shrink-0 border border-slate-800">
                          <img
                            src={imgUrl}
                            alt=""
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder-fallback.svg';
                            }}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-white truncate">{p.name}</div>
                          <div className="text-[10px] text-slate-400">Image Asset #{idx + 1}</div>
                          <div className="font-mono text-[10px] text-indigo-400 truncate mt-1">
                            {imgUrl}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                        <button
                          onClick={() => handleCopyUrl(imgUrl)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
                        >
                          {copiedUrl === imgUrl ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy URL</span>
                            </>
                          )}
                        </button>

                        <a
                          href={imgUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                          title="Open public image in new browser tab"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ADD / EDIT PRODUCT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl text-white my-8 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold mb-1">
              {editingProduct ? 'Edit Product in Database' : 'Add New Product to Database'}
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Saved permanently to the online cloud database and visible across all devices.
            </p>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              {/* Product Name */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. LOGI Pro Wireless Bluetooth ANC Headset"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 text-sm"
                />
              </div>

              {/* Category & Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  >
                    {existingCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  {formCategory === 'Other / Custom' && (
                    <input
                      type="text"
                      placeholder="Type custom category name"
                      value={formCustomCategory}
                      onChange={(e) => setFormCustomCategory(e.target.value)}
                      className="w-full mt-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                    />
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    placeholder="20"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Regular Price ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="149.99"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Discount / Sale Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formDiscountPrice}
                    onChange={(e) => setFormDiscountPrice(e.target.value)}
                    placeholder="119.99 (Optional)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Product Description
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Detail the technical specifications, materials, design, and key benefits..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* PRODUCT IMAGES SECTION */}
              <div className="pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <label className="font-bold text-white text-xs uppercase tracking-wider">
                    Product Images (Permanent Online Storage)
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {formImages.length} image(s) attached
                  </span>
                </div>

                {/* Upload Button Box */}
                <div className="p-4 rounded-2xl bg-slate-950 border-2 border-dashed border-slate-800 text-center space-y-3">
                  <div className="flex items-center justify-center gap-2 text-indigo-400">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-200">
                      Upload product images from phone or computer
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Images are automatically compressed & saved to permanent public storage.
                    </p>
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="admin-file-upload"
                  />

                  <div className="flex justify-center gap-2">
                    <label
                      htmlFor="admin-file-upload"
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs cursor-pointer shadow transition-all inline-flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploading ? 'Uploading...' : 'Choose Files'}</span>
                    </label>
                  </div>

                  {isUploading && (
                    <div className="text-xs text-amber-400 font-medium animate-pulse">
                      {uploadProgress}
                    </div>
                  )}

                  {/* Or External URL input */}
                  <div className="pt-2 border-t border-slate-800/80 flex gap-2">
                    <input
                      type="url"
                      placeholder="Or paste public image URL (e.g. Unsplash, CDN)"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddUrlImage}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer"
                    >
                      Add URL
                    </button>
                  </div>
                </div>

                {/* Uploaded Images Preview Gallery */}
                {formImages.length > 0 && (
                  <div className="flex gap-2.5 mt-3 overflow-x-auto pb-2">
                    {formImages.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0 group"
                      >
                        <img
                          src={img}
                          alt={`Uploaded ${idx + 1}`}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder-fallback.svg';
                          }}
                          className="w-full h-full object-cover"
                        />
                        {idx === 0 && (
                          <span className="absolute top-1 left-1 bg-indigo-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                            Primary
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1 right-1 p-1 rounded-full bg-rose-600/90 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove image"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Featured Switch */}
              <div className="pt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featured-check"
                  checked={formIsFeatured}
                  onChange={(e) => setFormIsFeatured(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 bg-slate-950 border-slate-800"
                />
                <label htmlFor="featured-check" className="text-slate-300 font-medium cursor-pointer">
                  Feature this product on homepage showcases
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || isUploading}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? 'Saving to Database...' : editingProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
