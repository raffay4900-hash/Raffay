import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db, ensureProductsSeeded, handleFirestoreError, OperationType } from './firebase';
import { Product, CartItem, Order, Category } from './types';
import { CATEGORIES } from './data/initialProducts';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { AdminDashboard } from './components/AdminDashboard';
import { ContactSection } from './components/ContactSection';
import { ToastContainer, ToastMessage } from './components/Toast';
import {
  ArrowRight,
  Sparkles,
  ShoppingBag,
  Shield,
  Layers,
  CheckCircle,
  Truck,
  RotateCcw,
  Zap,
  SlidersHorizontal,
  RefreshCw,
  Search,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'products' | 'categories' | 'contact'>('home');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cart State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  // Modals & Navigation State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Catalog Filtering & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [onlyInStock, setOnlyInStock] = useState(false);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // 1. Initial Firestore setup & real-time synchronization
  useEffect(() => {
    let unsubscribeProducts: (() => void) | null = null;
    let unsubscribeOrders: (() => void) | null = null;

    async function initStore() {
      try {
        setIsLoading(true);
        // Ensure sample products seeded in Firestore if collection is empty
        await ensureProductsSeeded();

        // Real-time listener for Products collection
        const productsCol = collection(db, 'products');
        unsubscribeProducts = onSnapshot(
          productsCol,
          (snapshot) => {
            const list: Product[] = [];
            snapshot.forEach((doc) => {
              list.push(doc.data() as Product);
            });
            setProducts(list);
            setIsLoading(false);
          },
          (error) => {
            console.error('Products listener error:', error);
            handleFirestoreError(error, OperationType.LIST, 'products');
            setIsLoading(false);
          }
        );

        // Real-time listener for Orders collection
        const ordersCol = collection(db, 'orders');
        unsubscribeOrders = onSnapshot(
          ordersCol,
          (snapshot) => {
            const orderList: Order[] = [];
            snapshot.forEach((doc) => {
              orderList.push(doc.data() as Order);
            });
            // Sort by newest first
            orderList.sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            setOrders(orderList);
          },
          (error) => {
            console.warn('Orders listener error:', error);
          }
        );
      } catch (err) {
        console.error('Store initialization error:', err);
        setIsLoading(false);
      }
    }

    initStore();

    return () => {
      if (unsubscribeProducts) unsubscribeProducts();
      if (unsubscribeOrders) unsubscribeOrders();
    };
  }, []);

  // Cart operations
  const handleAddToCart = (product: Product, quantity = 1) => {
    if (product.stock <= 0) {
      addToast(`"${product.name}" is currently out of stock.`, 'error');
      return;
    }

    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        const newQty = Math.min(product.stock, existing.quantity + quantity);
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: newQty } : item
        );
      } else {
        return [...prev, { product, quantity: Math.min(product.stock, quantity) }];
      }
    });

    addToast(`Added "${product.name}" (${quantity}x) to cart!`, 'success');
  };

  const handleBuyNow = (product: Product, quantity = 1) => {
    handleAddToCart(product, quantity);
    setIsCheckoutOpen(true);
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
    addToast('Item removed from cart.', 'info');
  };

  const handleClearCart = () => {
    setCartItems([]);
    addToast('Cart cleared.', 'info');
  };

  const handleApplyDiscount = (code: string): boolean => {
    if (code === 'LOGI10') {
      setDiscountCode('LOGI10');
      setAppliedDiscount(10);
      addToast('Coupon LOGI10 applied: 10% discount!', 'success');
      return true;
    } else if (code === 'SAVE20') {
      setDiscountCode('SAVE20');
      setAppliedDiscount(20);
      addToast('Coupon SAVE20 applied: 20% discount!', 'success');
      return true;
    }
    return false;
  };

  const handleOrderCompleted = (order: Order) => {
    setCompletedOrder(order);
    setCartItems([]);
    addToast('Order confirmed and saved to cloud database!', 'success');
  };

  // Filtered & Sorted Products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      searchQuery === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'all' ||
      p.category.toLowerCase() === selectedCategory.toLowerCase() ||
      (selectedCategory === 'audio' && p.category.includes('Audio')) ||
      (selectedCategory === 'wearables' && p.category.includes('Wearables')) ||
      (selectedCategory === 'tech' && p.category.includes('Computer')) ||
      (selectedCategory === 'travel' && p.category.includes('Travel')) ||
      (selectedCategory === 'power' && p.category.includes('Power'));

    const matchesStock = !onlyInStock || p.stock > 0;

    return matchesSearch && matchesCategory && matchesStock;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = a.discountPrice || a.price;
    const priceB = b.discountPrice || b.price;

    if (sortBy === 'price-asc') return priceA - priceB;
    if (sortBy === 'price-desc') return priceB - priceA;
    if (sortBy === 'rating') return (b.rating || 4.5) - (a.rating || 4.5);
    // default: featured first
    return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
  });

  const featuredProducts = products.filter((p) => p.isFeatured).slice(0, 4);
  const totalCartCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Navigation Bar */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view as any)}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        products={products}
        onSelectProduct={(p) => setSelectedProduct(p)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Content Body */}
      <main className="flex-1">
        {/* ========================================================
            VIEW 1: HOME PAGE
           ======================================================== */}
        {currentView === 'home' && (
          <div className="space-y-16 md:space-y-24 pb-16">
            {/* HERO BANNER SECTION */}
            <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white pt-12 pb-20 md:pt-20 md:pb-32 px-4 sm:px-6 lg:px-8">
              {/* Subtle Ambient Background Gradients */}
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />

              <div className="max-w-7xl mx-auto relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                  <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>LOGI MARKETING • Official Direct Online Catalog</span>
                    </div>

                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white">
                      Engineered for <br className="hidden sm:inline" />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-300 to-indigo-200">
                        Modern Visionaries
                      </span>
                    </h1>

                    <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
                      Discover high-performance audio, titanium chronographs, mechanical tech, and all-weather commute gear. Backed by persistent cloud synchronization and real-time inventory.
                    </p>

                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                      <button
                        onClick={() => setCurrentView('products')}
                        className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-xl shadow-indigo-600/25 hover:shadow-indigo-600/40 transition-all cursor-pointer"
                      >
                        <span>Explore Full Catalog ({products.length})</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setIsAdminOpen(true)}
                        className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700/80 text-slate-200 font-semibold text-sm transition-all cursor-pointer"
                      >
                        <Shield className="w-4 h-4 text-indigo-400" />
                        <span>Admin Portal (Upload Images)</span>
                      </button>
                    </div>

                    {/* Stats pills */}
                    <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800/80 max-w-lg mx-auto lg:mx-0 text-left">
                      <div>
                        <div className="text-2xl font-extrabold text-white">100%</div>
                        <div className="text-xs text-slate-400">Authentic Gear</div>
                      </div>
                      <div>
                        <div className="text-2xl font-extrabold text-white">24/7</div>
                        <div className="text-xs text-slate-400">Cloud DB Sync</div>
                      </div>
                      <div>
                        <div className="text-2xl font-extrabold text-white">30-Day</div>
                        <div className="text-xs text-slate-400">Money Back</div>
                      </div>
                    </div>
                  </div>

                  {/* Hero Showcase Card */}
                  <div className="lg:col-span-5 relative">
                    <div className="relative mx-auto max-w-md rounded-3xl bg-slate-800/80 border border-slate-700 p-3 shadow-2xl backdrop-blur-xl">
                      <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-slate-900">
                        <img
                          src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80"
                          alt="Hero Product"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 left-3 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                          FLAGSHIP
                        </div>
                        <div className="absolute bottom-3 left-3 right-3 bg-slate-950/85 backdrop-blur-md p-3.5 rounded-xl border border-slate-700 flex items-center justify-between">
                          <div>
                            <div className="text-xs font-bold text-white">LOGI Studio ANC Pro</div>
                            <div className="text-[11px] text-indigo-400 font-semibold">$149.99 <span className="line-through text-slate-400">$189.99</span></div>
                          </div>
                          <button
                            onClick={() => {
                              const p = products[0];
                              if (p) setSelectedProduct(p);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer"
                          >
                            View
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* CATEGORIES STRIP */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Curated Categories
                  </span>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                    Explore by Collection
                  </h2>
                </div>
                <button
                  onClick={() => setCurrentView('categories')}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>View All Collections</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {CATEGORIES.filter((c) => c.slug !== 'all').map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.slug);
                      setCurrentView('products');
                    }}
                    className="group relative rounded-2xl overflow-hidden aspect-4/5 bg-slate-900 cursor-pointer shadow-md hover:shadow-xl transition-all duration-300"
                  >
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-75 group-hover:opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent flex flex-col justify-end p-4">
                      <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {cat.name}
                      </h3>
                      <p className="text-[11px] text-slate-300 line-clamp-1 mt-0.5">
                        {cat.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* FEATURED PRODUCTS SHOWCASE */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Trending Highlights
                  </span>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                    Featured Products
                  </h2>
                </div>
                <button
                  onClick={() => setCurrentView('products')}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Browse Catalog ({products.length})
                </button>
              </div>

              {isLoading ? (
                <div className="py-16 text-center text-slate-400">
                  <RefreshCw className="w-8 h-8 mx-auto animate-spin text-indigo-500 mb-2" />
                  <p className="text-xs font-semibold">Connecting to online database...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {featuredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={(p) => handleAddToCart(p, 1)}
                      onBuyNow={(p) => handleBuyNow(p, 1)}
                      onViewDetails={(p) => setSelectedProduct(p)}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* VALUE PROPOSITION STRIP */}
            <section className="bg-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
                  <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/60">
                    <Truck className="w-8 h-8 text-indigo-400 mb-3 mx-auto md:mx-0" />
                    <h3 className="text-base font-bold text-white mb-1">
                      Fast Tracked Logistics
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Every order is processed and packaged with multi-layer tamper protection and dispatched within 24 hours.
                    </p>
                  </div>

                  <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/60">
                    <Shield className="w-8 h-8 text-emerald-400 mb-3 mx-auto md:mx-0" />
                    <h3 className="text-base font-bold text-white mb-1">
                      Real Persistent Cloud Data
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Products and uploaded images are hosted permanently. What you see is synchronized seamlessly across phones, tablets, and computers.
                    </p>
                  </div>

                  <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/60">
                    <Zap className="w-8 h-8 text-amber-400 mb-3 mx-auto md:mx-0" />
                    <h3 className="text-base font-bold text-white mb-1">
                      Instant Admin Management
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Easily add new products, upload images directly from phone camera or gallery, adjust inventory, and review orders in real time.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* CONTACT PREVIEW */}
            <ContactSection showToast={addToast} />
          </div>
        )}

        {/* ========================================================
            VIEW 2: PRODUCTS CATALOG
           ======================================================== */}
        {currentView === 'products' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-8">
            {/* Catalog Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Full Store Inventory
                </span>
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                  LOGI MARKETING Products ({sortedProducts.length})
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Loaded live from persistent Firestore database.
                </p>
              </div>

              {/* Controls & Sorting */}
              <div className="flex flex-wrap items-center gap-3">
                {/* In Stock Only checkbox */}
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800">
                  <input
                    type="checkbox"
                    checked={onlyInStock}
                    onChange={(e) => setOnlyInStock(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>In Stock Only</span>
                </label>

                {/* Sort selector */}
                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-xs text-slate-400 font-medium">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="text-xs font-bold bg-transparent text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                  >
                    <option value="featured">Featured First</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="rating">Top Rated</option>
                  </select>
                </div>

                {/* Admin Quick Add */}
                <button
                  onClick={() => setIsAdminOpen(true)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin Panel</span>
                </button>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    selectedCategory === cat.slug
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Search query tag */}
            {searchQuery && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-xs">
                <span>
                  Showing results for query: <strong>"{searchQuery}"</strong>
                </span>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                >
                  Clear Search
                </button>
              </div>
            )}

            {/* Product Cards Grid */}
            {isLoading ? (
              <div className="py-24 text-center text-slate-400">
                <RefreshCw className="w-10 h-10 mx-auto animate-spin text-indigo-500 mb-3" />
                <p className="font-semibold text-sm">Fetching products from Firestore...</p>
              </div>
            ) : sortedProducts.length === 0 ? (
              <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
                <ShoppingBag className="w-12 h-12 mx-auto text-slate-400 mb-3" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                  No products matched your criteria
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
                  Try adjusting your filters, clearing your search query, or add a new product via the Admin Portal.
                </p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setSearchQuery('');
                      setOnlyInStock(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold"
                  >
                    Reset Filters
                  </button>
                  <button
                    onClick={() => setIsAdminOpen(true)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
                  >
                    Add Product as Admin
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sortedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={(p) => handleAddToCart(p, 1)}
                    onBuyNow={(p) => handleBuyNow(p, 1)}
                    onViewDetails={(p) => setSelectedProduct(p)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            VIEW 3: CATEGORIES DIRECTORY
           ======================================================== */}
        {currentView === 'categories' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Explore Catalogs
              </span>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                Product Categories
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Browse dedicated collections curated for performance and lifestyle.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {CATEGORIES.map((cat) => {
                const count =
                  cat.slug === 'all'
                    ? products.length
                    : products.filter(
                        (p) =>
                          p.category.toLowerCase().includes(cat.name.toLowerCase().split(' ')[0]) ||
                          (cat.slug === 'audio' && p.category.includes('Audio')) ||
                          (cat.slug === 'wearables' && p.category.includes('Wearables')) ||
                          (cat.slug === 'tech' && p.category.includes('Computer')) ||
                          (cat.slug === 'travel' && p.category.includes('Travel')) ||
                          (cat.slug === 'power' && p.category.includes('Power'))
                      ).length;

                return (
                  <div
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.slug);
                      setCurrentView('products');
                    }}
                    className="group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div className="relative aspect-video overflow-hidden bg-slate-900">
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-white font-bold text-xs px-2.5 py-1 rounded-full">
                        {count} item{count === 1 ? '' : 's'}
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4 leading-relaxed">
                        {cat.description}
                      </p>
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                        <span>Browse Collection</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================
            VIEW 4: CONTACT & SUPPORT
           ======================================================== */}
        {currentView === 'contact' && (
          <ContactSection showToast={addToast} />
        )}
      </main>

      {/* Cart Sliding Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
        discountCode={discountCode}
        appliedDiscount={appliedDiscount}
        onApplyDiscount={handleApplyDiscount}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={selectedProduct !== null}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={(p, q) => handleAddToCart(p, q)}
        onBuyNow={(p, q) => handleBuyNow(p, q)}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        appliedDiscount={appliedDiscount}
        onOrderCompleted={handleOrderCompleted}
      />

      {/* Order Success Receipt Modal */}
      <OrderSuccessModal
        order={completedOrder}
        isOpen={completedOrder !== null}
        onClose={() => setCompletedOrder(null)}
        onViewOrders={() => {
          setCompletedOrder(null);
          setIsAdminOpen(true);
        }}
      />

      {/* Admin Dashboard Suite */}
      {isAdminOpen && (
        <AdminDashboard
          products={products}
          orders={orders}
          onRefreshData={() => {
            // Firestore onSnapshot automatically keeps products updated
            addToast('Synchronized with Firestore database!', 'success');
          }}
          onClose={() => setIsAdminOpen(false)}
          showToast={addToast}
        />
      )}

      {/* Footer */}
      <Footer
        onNavigate={(view) => setCurrentView(view as any)}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />
    </div>
  );
}
