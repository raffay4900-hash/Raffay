import React, { useState } from 'react';
import { Product } from '../types';
import { ShoppingCart, Zap, Star, Eye } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  onViewDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onBuyNow,
  onViewDetails,
}) => {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const fallbackImage = '/placeholder-fallback.svg';
  const primaryImage = product.images && product.images.length > 0
    ? (imageError ? fallbackImage : product.images[0])
    : fallbackImage;

  const hasDiscount = product.discountPrice !== undefined && product.discountPrice < product.price;
  const currentPrice = hasDiscount ? product.discountPrice! : product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice!) / product.price) * 100)
    : 0;

  const isOutOfStock = product.stock <= 0;

  return (
    <div
      className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 flex flex-col overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Box */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-100 dark:bg-slate-800 cursor-pointer" onClick={() => onViewDetails(product)}>
        <img
          src={primaryImage}
          alt={product.name}
          onError={() => setImageError(true)}
          className={`h-full w-full object-cover object-center transition-transform duration-500 ${
            isHovered ? 'scale-105' : 'scale-100'
          }`}
          loading="lazy"
        />

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {hasDiscount && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500 text-slate-950 shadow-md">
              -{discountPercent}% OFF
            </span>
          )}
          {product.isFeatured && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-600 text-white shadow-md">
              Featured
            </span>
          )}
        </div>

        {/* Stock Status Badge */}
        <div className="absolute top-3 right-3 z-10">
          {isOutOfStock ? (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-600/90 text-white backdrop-blur-md">
              Out of Stock
            </span>
          ) : product.stock < 5 ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300/50">
              Only {product.stock} left
            </span>
          ) : null}
        </div>

        {/* Quick View Button on Hover */}
        <div
          className={`absolute inset-0 bg-black/20 backdrop-blur-[2px] flex items-center justify-center transition-opacity duration-200 ${
            isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(product);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-white font-medium text-xs shadow-lg hover:scale-105 transition-transform"
          >
            <Eye className="w-3.5 h-3.5" />
            Quick View
          </button>
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase">
              {product.category}
            </span>
            <div className="flex items-center gap-1 text-xs text-amber-500 font-medium">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{product.rating || '4.9'}</span>
              <span className="text-slate-400">({product.reviewsCount || 42})</span>
            </div>
          </div>

          <h3
            onClick={() => onViewDetails(product)}
            className="text-base font-semibold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer line-clamp-1 mb-1.5"
            title={product.name}
          >
            {product.name}
          </h3>

          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
            {product.description}
          </p>
        </div>

        <div>
          {/* Price Row */}
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-xl font-bold text-slate-900 dark:text-white">
              ${currentPrice.toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-sm font-medium text-slate-400 line-through">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>

          {/* Action Buttons: Add to Cart & Buy Now */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onAddToCart(product)}
              disabled={isOutOfStock}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Add to Cart</span>
            </button>

            <button
              onClick={() => onBuyNow(product)}
              disabled={isOutOfStock}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Buy Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
