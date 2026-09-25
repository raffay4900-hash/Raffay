import React, { useState, useRef, useEffect } from 'react';
import { Product } from '../types';
import {
  ShoppingBag,
  Search,
  SlidersHorizontal,
  Menu,
  X,
  Shield,
  Layers,
  Sparkles,
  PhoneCall
} from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenAdmin: () => void;
  products: Product[];
  onSelectProduct: (product: Product) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  cartCount,
  onOpenCart,
  onOpenAdmin,
  products,
  onSelectProduct,
  searchQuery,
  onSearchChange,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close search suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const suggestions = searchQuery.trim()
    ? products
        .filter((p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 5)
    : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    onNavigate('products');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      {/* Top Banner */}
      <div className="bg-slate-900 dark:bg-slate-950 text-white text-[11px] py-1.5 px-4 text-center font-medium border-b border-slate-800 flex items-center justify-between">
        <div className="hidden sm:flex items-center gap-2 text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Spring Promotion: Use code <strong>LOGI10</strong> for 10% off</span>
        </div>
        <div className="mx-auto sm:mx-0 flex items-center gap-4">
          <span>Free Express Shipping Worldwide on orders over $100</span>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={onOpenAdmin}
            className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
          >
            <Shield className="w-3 h-3" />
            <span>Admin Portal</span>
          </button>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20 gap-4">
          {/* Brand Logo */}
          <div
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 cursor-pointer select-none shrink-0"
          >
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-indigo-500/20">
              L
            </div>
            <div>
              <span className="font-extrabold text-lg md:text-xl tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                LOGI <span className="text-indigo-600 dark:text-indigo-400">MARKETING</span>
              </span>
              <span className="text-[10px] tracking-wider uppercase font-semibold text-slate-400 block -mt-1">
                Premium Store & Catalog
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <button
              onClick={() => onNavigate('home')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                currentView === 'home'
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40'
                  : 'text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => onNavigate('products')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                currentView === 'products'
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40'
                  : 'text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400'
              }`}
            >
              All Products
            </button>

            <button
              onClick={() => onNavigate('categories')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                currentView === 'categories'
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40'
                  : 'text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400'
              }`}
            >
              Categories
            </button>

            <button
              onClick={() => onNavigate('contact')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                currentView === 'contact'
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40'
                  : 'text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400'
              }`}
            >
              Contact
            </button>
          </nav>

          {/* Search Bar with live autocomplete */}
          <div
            ref={searchContainerRef}
            className="hidden lg:block relative flex-1 max-w-xs xl:max-w-sm"
          >
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search products, gear, tech..."
                  value={searchQuery}
                  onChange={(e) => {
                    onSearchChange(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all"
                />
              </div>
            </form>

            {/* Suggestions Popover */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 z-50">
                <span className="text-[10px] font-bold text-slate-400 uppercase px-3 py-1 block">
                  Quick Product Matches
                </span>
                {suggestions.map((p) => {
                  const img = (p.images && p.images[0]) || '/placeholder-fallback.svg';
                  return (
                    <div
                      key={p.id}
                      onClick={() => {
                        onSelectProduct(p);
                        setShowSuggestions(false);
                      }}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                    >
                      <img
                        src={img}
                        alt={p.name}
                        className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                          {p.name}
                        </div>
                        <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold">
                          ${(p.discountPrice || p.price).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Action Icons: Search trigger (mobile), Admin Portal Button, Cart Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Trigger for Mobile */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="lg:hidden p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Admin Portal Button */}
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs font-bold transition-colors cursor-pointer"
              title="Open Admin Dashboard"
            >
              <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="hidden sm:inline">Admin</span>
            </button>

            {/* Shopping Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow">
                  {cartCount}
                </span>
              )}
              <span className="hidden md:inline text-xs font-bold pl-0.5">Cart</span>
            </button>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar Dropdown */}
        {searchOpen && (
          <div className="lg:hidden pb-4 pt-1">
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-transparent focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 pt-2 pb-6 space-y-2 animate-in slide-in-from-top-2 duration-200">
          <button
            onClick={() => {
              onNavigate('home');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Home
          </button>
          <button
            onClick={() => {
              onNavigate('products');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            All Products
          </button>
          <button
            onClick={() => {
              onNavigate('categories');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Categories
          </button>
          <button
            onClick={() => {
              onNavigate('contact');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Contact
          </button>
          <button
            onClick={() => {
              onOpenAdmin();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 flex items-center gap-2"
          >
            <Shield className="w-4 h-4" />
            <span>Admin Portal</span>
          </button>
        </div>
      )}
    </header>
  );
};
