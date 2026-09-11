import React, { useState } from 'react';
import {
  Package, Heart, ShoppingBag, Star, Eye, ShieldCheck,
  CheckCircle2, Plus, Minus, Truck
} from 'lucide-react';
import PriceDisplay from './PriceDisplay';
import CompatibilityBadge from './CompatibilityBadge';
import { useVehicle } from '../../context/VehicleContext';
import { useCart } from '../../context/CartContext';

export const ProductListCard = ({ product, onClick, onQuickView }) => {
  const { selectedVehicle, isVehicleSelected } = useVehicle();
  const { addToCart } = useCart();
  const [imageError, setImageError] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const imageUrl = !imageError && (
    product.primaryImage ||
    product.images?.[0]?.url ||
    (Array.isArray(product.images) && typeof product.images[0] === 'string' ? product.images[0] : null)
  );

  const price = product.effectivePrice?.amount ?? product.prices?.[0]?.price ?? product.price;
  const compareAtPrice = product.effectivePrice?.compareAtPrice ?? product.prices?.[0]?.compareAtPrice ?? product.compareAtPrice;
  const tier = product.effectivePrice?.tier ?? product.prices?.[0]?.tier;
  const brandName = product.brand?.name || 'OEM GENUINE';

  const discountPct = compareAtPrice && compareAtPrice > price
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : null;

  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-3xl border border-slate-200/90 hover:border-[#215ada] p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all duration-300 hover:shadow-xl cursor-pointer relative"
    >
      {/* 1. Product Image with Action Badges */}
      <div className="w-full md:w-56 aspect-[4/3] md:aspect-square bg-[#f8fafc] rounded-2xl overflow-hidden relative flex items-center justify-center border border-slate-100 shrink-0 group-hover:bg-blue-50/20 transition-colors">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            loading="lazy"
            onError={() => setImageError(true)}
            className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-300 gap-1">
            <Package className="w-10 h-10 stroke-[1.5]" />
            <span className="text-[10px] font-mono text-slate-400">NO IMAGE</span>
          </div>
        )}

        {discountPct && (
          <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-lg bg-[#ff4c1a] text-white text-[10px] font-black shadow-xs">
            -{discountPct}%
          </span>
        )}

        <div className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-xs border border-slate-200 px-1.5 py-0.5 rounded-full flex items-center gap-1 text-[9px] text-slate-600 font-bold shadow-xs">
          <Eye className="w-2.5 h-2.5 text-[#215ada]" />
          <span>2</span>
        </div>

        {/* Floating Quick Action Buttons */}
        <div className="absolute bottom-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onQuickView && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onQuickView(product);
              }}
              className="w-8 h-8 rounded-full bg-white/95 text-slate-700 hover:text-[#215ada] shadow-md flex items-center justify-center transition-transform hover:scale-110"
              title="Quick View"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsLiked(!isLiked);
            }}
            className={`w-8 h-8 rounded-full bg-white/95 shadow-md flex items-center justify-center transition-transform hover:scale-110 ${
              isLiked ? 'text-rose-500' : 'text-slate-500 hover:text-rose-500'
            }`}
            title="Wishlist"
          >
            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. Center Content: Brand, Title, Description, Fitment */}
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-[#215ada] bg-blue-50 px-2.5 py-0.5 rounded-full">
            {brandName}
          </span>
          {product.sku && (
            <span className="text-xs font-mono text-slate-400">
              SKU: {product.sku}
            </span>
          )}
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full ml-auto md:ml-0">
            ● In Stock
          </span>
        </div>

        <h3 className="text-base sm:text-lg font-bold text-[#0e1932] group-hover:text-[#215ada] transition-colors leading-snug">
          {product.name}
        </h3>

        <div className="flex items-center gap-2">
          <div className="flex items-center text-amber-400 text-xs">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="w-3 h-3 fill-current" />
            ))}
          </div>
          <span className="text-xs font-bold text-slate-700">4.9</span>
          <span className="text-xs text-slate-400">(18 reviews)</span>
        </div>

        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
          {product.shortDescription || product.description || 'Certified OEM grade component engineered for exact vehicle match, long service life, and rigorous performance reliability.'}
        </p>

        <div className="pt-1">
          <CompatibilityBadge size="sm" />
        </div>
      </div>

      {/* 3. Right Side: Price & Cart Action */}
      <div className="w-full md:w-56 p-4 rounded-2xl bg-[#f4f6fb] border border-slate-200/70 flex flex-col justify-between shrink-0 space-y-3">
        <div>
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Price</span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black text-[#215ada] font-mono">
              ฿{Number(price || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </span>
            {compareAtPrice && compareAtPrice > price && (
              <span className="text-xs font-semibold text-slate-400 line-through">
                ฿{Number(compareAtPrice).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center border border-slate-200 rounded-full p-0.5 bg-white shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setQuantity((q) => Math.max(1, q - 1));
              }}
              className="w-6 h-6 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-6 text-center font-bold text-xs font-mono">{quantity}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setQuantity((q) => q + 1);
              }}
              className="w-6 h-6 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product.id, quantity, selectedVehicle?.variantId || null, true);
            }}
            className="flex-1 py-2 px-3 rounded-full bg-[#215ada] hover:bg-[#163d94] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20 transition-all hover:scale-105"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductListCard;
