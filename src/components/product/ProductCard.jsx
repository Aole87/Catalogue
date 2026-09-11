import React, { useState } from 'react';
import { Package, ExternalLink, ShieldCheck, ShoppingBag, Star, Heart, Eye } from 'lucide-react';
import PriceDisplay from './PriceDisplay';
import CompatibilityBadge from './CompatibilityBadge';
import { useVehicle } from '../../context/VehicleContext';
import { useCart } from '../../context/CartContext';

export const ProductCard = ({ product, onClick, onQuickView }) => {
  const { selectedVehicle, isVehicleSelected } = useVehicle();
  const { addToCart } = useCart();
  const [imageError, setImageError] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);

  if (!product) return null;

  // Extract primary image
  const imageUrl = !imageError && (
    product.primaryImage ||
    product.images?.[0]?.url ||
    (Array.isArray(product.images) && typeof product.images[0] === 'string' ? product.images[0] : null)
  );

  // Extract price
  const price = product.effectivePrice?.amount ?? product.prices?.[0]?.price ?? product.price;
  const compareAtPrice = product.effectivePrice?.compareAtPrice ?? product.prices?.[0]?.compareAtPrice ?? product.compareAtPrice;
  const tier = product.effectivePrice?.tier ?? product.prices?.[0]?.tier;

  // Brand Name
  const brandName = product.brand?.name || 'OEM GENUINE';

  // Vehicle display string
  const vehicleSummary = selectedVehicle
    ? `${selectedVehicle.makeName} ${selectedVehicle.modelName} ${selectedVehicle.generationCode || ''}`.trim()
    : null;

  // Calculate discount percentage if compareAtPrice is available
  const discountPct = compareAtPrice && compareAtPrice > price
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : null;

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      className="group bg-white rounded-3xl border border-slate-200/90 hover:border-[#215ada] p-4 flex flex-col justify-between transition-all duration-300 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#215ada] cursor-pointer relative"
    >
      <div>
        {/* Top Badges & Wishlist Action */}
        <div className="flex items-center justify-between gap-2 mb-2">
          {discountPct ? (
            <span className="px-2 py-0.5 rounded-lg bg-[#ff4c1a] text-white text-[10px] font-black tracking-tight shadow-xs">
              -{discountPct}%
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-lg bg-blue-50 text-[#215ada] text-[10px] font-bold">
              GENUINE
            </span>
          )}

          <div className="flex items-center gap-1.5">
            {/* Live Viewers Indicator */}
            <div className="bg-slate-50 border border-slate-200/80 px-1.5 py-0.5 rounded-full flex items-center gap-1 text-[9px] text-slate-500 font-bold">
              <Eye className="w-2.5 h-2.5 text-[#215ada]" />
              <span>2</span>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsLiked(!isLiked);
              }}
              className={`p-1.5 rounded-full transition-all ${
                isLiked ? 'text-rose-500 bg-rose-50 scale-110' : 'text-slate-400 hover:text-rose-500 hover:bg-slate-100'
              }`}
              title="Wishlist"
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Product Image Container with Hover Quick View */}
        <div className="w-full aspect-[4/3] bg-[#f8fafc] rounded-2xl overflow-hidden mb-3 relative flex items-center justify-center border border-slate-100 group-hover:bg-blue-50/20 transition-colors">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              loading="lazy"
              onError={() => setImageError(true)}
              className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-300 gap-1">
              <Package className="w-10 h-10 stroke-[1.5]" />
              <span className="text-[10px] font-mono text-slate-400">NO IMAGE</span>
            </div>
          )}

          {/* Quick SKU / OEM Tag */}
          {product.sku && (
            <span className="absolute bottom-2 right-2 bg-slate-900/80 backdrop-blur-xs text-slate-100 text-[9px] font-mono font-medium px-2 py-0.5 rounded-md shadow-xs">
              {product.sku}
            </span>
          )}

          {/* Hover Quick View Trigger Pill */}
          {onQuickView && (
            <div className="absolute inset-x-0 bottom-2 flex justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickView(product);
                }}
                className="px-3 py-1 rounded-full bg-white/95 text-slate-800 text-[11px] font-bold shadow-md flex items-center gap-1.5 hover:bg-[#215ada] hover:text-white transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Quick View</span>
              </button>
            </div>
          )}
        </div>

        {/* Brand & Star Rating */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#215ada]">
            {brandName}
          </span>
          <div className="flex items-center text-amber-400 text-[10px]">
            <Star className="w-3 h-3 fill-current" />
            <span className="ml-1 text-slate-500 font-bold">4.9</span>
          </div>
        </div>

        {/* Product Name */}
        <h4 className="text-xs sm:text-sm font-bold text-[#0e1932] line-clamp-2 leading-snug group-hover:text-[#215ada] transition-colors mb-2.5">
          {product.name}
        </h4>

        {/* Fitment Status Badge */}
        <div className="mb-3">
          {isVehicleSelected ? (
            <CompatibilityBadge
              status={true}
              vehicleName={vehicleSummary}
              size="sm"
            />
          ) : (
            <CompatibilityBadge size="sm" />
          )}
        </div>
      </div>

      {/* Footer Area: Price & Add to Cart Button */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <PriceDisplay
          price={price}
          compareAtPrice={compareAtPrice}
          tier={tier}
          size="md"
        />

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setAddedAnimation(true);
            addToCart(product.id, 1, selectedVehicle?.variantId || null, true);
            setTimeout(() => setAddedAnimation(false), 400);
          }}
          className={`w-10 h-10 rounded-2xl bg-[#215ada] hover:bg-[#163d94] text-white flex items-center justify-center transition-all shadow-md shadow-blue-600/20 hover:scale-105 shrink-0 ${
            addedAnimation ? 'bg-emerald-600 scale-95' : ''
          }`}
          title="เพิ่มลงตะกร้า"
          aria-label="Add to cart"
        >
          <ShoppingBag className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
