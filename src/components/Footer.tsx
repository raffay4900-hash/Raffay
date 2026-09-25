import React from 'react';
import { ShieldCheck, Truck, RotateCcw, Headphones, Heart } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenAdmin }) => {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-xs transition-colors">
      {/* Trust & Guarantee Bar */}
      <div className="border-b border-slate-850 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-950/80 border border-indigo-800/40 text-indigo-400 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs">Free Global Shipping</h4>
              <p className="text-[11px] text-slate-500">On all orders over $100</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-800/40 text-emerald-400 flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs">30-Day Guarantee</h4>
              <p className="text-[11px] text-slate-500">100% money back returns</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-sky-950/80 border border-sky-800/40 text-sky-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs">2-Year Official Warranty</h4>
              <p className="text-[11px] text-slate-500">Genuine authentic quality</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-800/40 text-amber-400 flex items-center justify-center shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs">24/7 Expert Support</h4>
              <p className="text-[11px] text-slate-500">Dedicated assistance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-base">
                L
              </div>
              <span className="font-extrabold text-base text-white tracking-tight">
                LOGI MARKETING
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Curating premium lifestyle electronics, studio acoustics, ergonomic tech, and modern travel gear. Engineered for creators and visionaries.
            </p>
            <div className="text-[11px] text-slate-500">
              Cloud Database: <span className="text-emerald-400 font-semibold">Active & Synced</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-3">
              Shop Catalog
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Featured Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('products')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  All Products
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('categories')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Product Categories
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Customer Support & FAQ
                </button>
              </li>
            </ul>
          </div>

          {/* Management & Admin */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-3">
              Store Management
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={onOpenAdmin}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Admin Dashboard</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenAdmin}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Add Product (Upload Image)
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenAdmin}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  View Cloud Orders
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenAdmin}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Permanent Public Image URLs
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs">
              Stay Connected
            </h4>
            <p className="text-slate-400 text-xs">
              Subscribe for exclusive member drops, new gear releases, and seasonal flash coupons.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs flex-1 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => alert('Thank you for subscribing to LOGI MARKETING updates!')}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer transition-colors"
              >
                Join
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 mt-8 border-t border-slate-850 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} LOGI MARKETING Inc. All rights reserved. Persistent cross-device storage enabled.
          </div>
          <div className="flex items-center gap-4">
            <span>Secure Cloud Infrastructure</span>
            <span>•</span>
            <span>256-Bit SSL</span>
            <span>•</span>
            <span>Permanent Image CDN</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
