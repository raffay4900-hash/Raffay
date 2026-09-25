import React, { useState } from 'react';
import { Product } from '../types';
import { X, ShoppingCart, Zap, Star, ShieldCheck, Truck, RotateCcw, Check } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onBuyNow: (product: Product, quantity: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onBuyNow,
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [imageErrorMap, setImageErrorMap] = useState<Record<number, boolean>>({});

  if (!isOpen || !product) return null;

  const fallbackImage = '/placeholder-fallback.svg';
  const images = product.images && product.images.length > 0 ? product.images : [fallbackImage];

  const currentDisplayImage = imageErrorMap[selectedImageIndex]
    ? fallbackImage
    : images[selectedImageIndex] || fallbackImage;

  const hasDiscount = product.discountPrice !== undefined && product.discountPrice < product.price;
  const currentPrice = hasDiscount ? product.discountPrice! : product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice!) / product.price) * 100)
    : 0;

  const isOutOfStock = product.stock <= 0;

  const handleImageError = (index: number) => {
    setImageErrorMap(prev => ({ ...prev, [index]: true }));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="relative bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Gallery View */}
          <div className="p-6 md:p-8 bg-slate-50 dark:bg-slate-800/40 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800">
            {/* Main Stage Image */}
            <div className="relative aspect-square w-full max-w-md rounded-2xl overflow-hidden bg-white dark:bg-slate-800 shadow-md border border-slate-200/80 dark:border-slate-700/80">
              <img
                src={currentDisplayImage}
                alt={product.name}
                onError={() => handleImageError(selectedImageIndex)}
                className="w-full h-full object-cover object-center transition-all duration-300"
              />
              {hasDiscount && (
                <div className="absolute top-3 left-3 bg-amber-500 text-slate-950 font-bold text-xs px-3 py-1 rounded-full shadow">
                  SAVE {discountPercent}%
                </div>
              )}
            </div>

            {/* Thumbnail Selectors (Multiple images support) */}
            {images.length > 1 && (
              <div className="flex gap-2.5 mt-4 overflow-x-auto max-w-full pb-2 px-1">
                {images.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                      selectedImageIndex === idx
                        ? 'border-indigo-600 scale-105 shadow-md'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-400 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={imageErrorMap[idx] ? fallbackImage : imgUrl}
                      alt={`Thumbnail ${idx + 1}`}
                      onError={() => handleImageError(idx)}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details & Purchase Panel */}
          <div className="p-6 md:p-8 flex flex-col justify-between">
            <div>
              {/* Category & Rating */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  {product.category}
                </span>
                <div className="flex items-center gap-1.5 text-xs text-amber-500 font-semibold">
                  <Star className="w-4 h-4 fill-current" />
                  <span>{product.rating || '4.9'}</span>
                  <span className="text-slate-400">({product.reviewsCount || 42} reviews)</span>
                </div>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                {product.name}
              </h2>

              {/* Price & Stock */}
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  ${currentPrice.toFixed(2)}
                </span>
                {hasDiscount && (
                  <span className="text-lg text-slate-400 line-through">
                    ${product.price.toFixed(2)}
                  </span>
                )}
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    isOutOfStock
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                  }`}
                >
                  {isOutOfStock ? 'Out of Stock' : `In Stock (${product.stock} units)`}
                </span>
              </div>

              {/* Description */}
              <div className="prose prose-sm text-slate-600 dark:text-slate-300 mb-6">
                <p className="leading-relaxed">{product.description}</p>
              </div>

              {/* Badges / Value Props */}
              <div className="grid grid-cols-2 gap-3 mb-6 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Truck className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>Free Express Delivery over $100</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <RotateCcw className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>30-Day Hassle-Free Returns</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>2-Year Official Brand Warranty</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Check className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>100% Genuine Guaranteed</span>
                </div>
              </div>
            </div>

            {/* Quantity and Actions */}
            <div>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Quantity
                </span>
                <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="px-3 py-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold transition-colors disabled:opacity-30 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-4 py-1.5 text-sm font-semibold text-slate-800 dark:text-white">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock || isOutOfStock}
                    className="px-3 py-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold transition-colors disabled:opacity-30 cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => onAddToCart(product, quantity)}
                  disabled={isOutOfStock}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold text-sm hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>

                <button
                  onClick={() => onBuyNow(product, quantity)}
                  disabled={isOutOfStock}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>Buy Now</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
