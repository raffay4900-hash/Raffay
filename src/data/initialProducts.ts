import { Product } from '../types';

export const INITIAL_PRODUCTS: Omit<Product, 'createdAt' | 'updatedAt'>[] = [
  {
    id: "prod-logi-pro-anc",
    name: "LOGI Studio ANC Pro Wireless Headphones",
    description: "High-fidelity spatial audio with active hybrid noise cancellation, 45-hour battery life, plush memory foam ear cushions, and ultra-low latency bluetooth 5.3 connectivity. Perfect for creators, travelers, and music enthusiasts.",
    price: 189.99,
    discountPrice: 149.99,
    category: "Audio & Headphones",
    stock: 24,
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1000&q=80"
    ],
    isFeatured: true,
    rating: 4.9,
    reviewsCount: 142,
    tags: ["Best Seller", "ANC", "Wireless"]
  },
  {
    id: "prod-logi-chronograph",
    name: "LOGI Chrono Precision Titanium Watch",
    description: "Aerospace-grade titanium casing, sapphire crystal face with anti-reflective coating, 5ATM water resistance, and an authentic Japanese automatic movement. Engineered for elegance in the boardroom and resilience outdoors.",
    price: 249.99,
    discountPrice: 199.99,
    category: "Smartwatches & Wearables",
    stock: 18,
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&w=1000&q=80"
    ],
    isFeatured: true,
    rating: 4.8,
    reviewsCount: 98,
    tags: ["Luxury", "Titanium", "Water Resistant"]
  },
  {
    id: "prod-logi-mech-keyboard",
    name: "LOGI Horizon Wireless Mechanical Keyboard",
    description: "Compact 75% layout featuring hot-swappable lubed linear switches, custom PBT dye-sub keycaps, per-key RGB backlighting, gasket mount structure, and seamless multi-device tri-mode connection.",
    price: 139.99,
    discountPrice: 119.99,
    category: "Computer & Office Tech",
    stock: 32,
    images: [
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=1000&q=80"
    ],
    isFeatured: true,
    rating: 4.9,
    reviewsCount: 215,
    tags: ["Hot Swap", "RGB", "Wireless"]
  },
  {
    id: "prod-logi-minimal-backpack",
    name: "LOGI All-Weather Urban Commuter Backpack",
    description: "Waterproof Cordura ballistic nylon exterior with magnetic Fidlock closures, dedicated 16-inch fleece laptop sleeve, hidden RFID security pockets, and ergonomic airflow back cushioning.",
    price: 119.99,
    discountPrice: 89.99,
    category: "Bags & Travel Gear",
    stock: 28,
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=1000&q=80"
    ],
    isFeatured: false,
    rating: 4.7,
    reviewsCount: 76,
    tags: ["Waterproof", "Ergonomic"]
  },
  {
    id: "prod-logi-stream-webcam",
    name: "LOGI UltraCam 4K HDR Streaming Camera",
    description: "Broadcast-grade 4K 60FPS sensor with AI facial auto-framing, dual beamforming noise-cancelling microphones, magnetic privacy shutter, and HDR auto-exposure compensation.",
    price: 169.99,
    discountPrice: 139.99,
    category: "Computer & Office Tech",
    stock: 15,
    images: [
      "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=1000&q=80"
    ],
    isFeatured: true,
    rating: 4.8,
    reviewsCount: 88,
    tags: ["4K HDR", "Studio Quality"]
  },
  {
    id: "prod-logi-smart-speaker",
    name: "LOGI SoundSphere 360 Acoustic Speaker",
    description: "Room-filling 360-degree acoustic fidelity featuring dual passive radiators, deep bass reflex, aluminum unibody build, IPX7 water resistance, and 20-hour wireless playtime.",
    price: 99.99,
    discountPrice: 79.99,
    category: "Audio & Headphones",
    stock: 45,
    images: [
      "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1000&q=80"
    ],
    isFeatured: false,
    rating: 4.6,
    reviewsCount: 64,
    tags: ["360 Audio", "IPX7"]
  },
  {
    id: "prod-logi-wireless-charger",
    name: "LOGI MagBase 3-in-1 Fast Wireless Stand",
    description: "Premium anodized aluminum charging dock that simultaneously fast-charges your phone, smartwatch, and earbuds with certified magnetic alignment and intelligent thermal regulation.",
    price: 69.99,
    discountPrice: 49.99,
    category: "Accessories & Power",
    stock: 50,
    images: [
      "https://images.unsplash.com/photo-1622445262464-84b1456045b6?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=1000&q=80"
    ],
    isFeatured: false,
    rating: 4.7,
    reviewsCount: 112,
    tags: ["Fast Charge", "Magnetic"]
  },
  {
    id: "prod-logi-sunglasses",
    name: "LOGI Polarized Aviator Classic Shades",
    description: "Ultralight stainless steel frames with polarized UV400 hydrophobic lenses that eliminate glare while providing true-color visual contrast. Includes magnetic vegan leather carrying case.",
    price: 79.99,
    discountPrice: 59.99,
    category: "Bags & Travel Gear",
    stock: 35,
    images: [
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=1000&q=80"
    ],
    isFeatured: false,
    rating: 4.8,
    reviewsCount: 52,
    tags: ["UV400", "Polarized"]
  }
];

export const CATEGORIES = [
  {
    id: "all",
    name: "All Products",
    slug: "all",
    description: "Browse the complete collection of LOGI MARKETING premium gear",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "audio",
    name: "Audio & Headphones",
    slug: "audio",
    description: "Studio monitors, active noise-cancelling headphones and speakers",
    image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "wearables",
    name: "Smartwatches & Wearables",
    slug: "wearables",
    description: "Precision chronographs and fitness smart accessories",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "tech",
    name: "Computer & Office Tech",
    slug: "tech",
    description: "Keyboards, 4K webcams, ergonomic workstation peripherals",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "travel",
    name: "Bags & Travel Gear",
    slug: "travel",
    description: "Weatherproof backpacks, luggage and travel accessories",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "power",
    name: "Accessories & Power",
    slug: "power",
    description: "Magnetic wireless chargers, high-speed docks and cables",
    image: "https://images.unsplash.com/photo-1622445262464-84b1456045b6?auto=format&fit=crop&w=600&q=80"
  }
];
