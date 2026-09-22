import React, { useState } from 'react';
import { Package, Heart, ShieldCheck, ShoppingCart, Truck, Lock, Star } from 'lucide-react';
import { useVehicle } from '../../context/VehicleContext';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';

export const ProductCard = ({ product, user, onClick, onRequireLogin }) => {
  const { selectedVehicle } = useVehicle();
  const { addToCart } = useCart();
  const { t, lang } = useLanguage();
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
  const price = product.effectivePrice?.amount ?? product.prices?.[0]?.price ?? product.price ?? 0;
  const compareAtPrice = product.effectivePrice?.compareAtPrice ?? product.prices?.[0]?.compareAtPrice ?? product.compareAtPrice ?? null;

  // Brand Name
  const brandName = product.brand?.name || 'OEM GENUINE';

  // Calculate discount percentage
  const discountPct = compareAtPrice && compareAtPrice > price
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : null;

  const reviewCount = product.reviewCount || product._count?.reviews || 0;
  
  // Format price
  const formatPrice = (amount) => {
    return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 0 }).format(amount);
  };

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      className="group bg-white rounded-2xl border border-slate-200 hover:border-[#f97316]/50 flex flex-col justify-between transition-all duration-300 hover:shadow-lg cursor-pointer relative overflow-hidden h-full"
    >
      {/* Top Badges */}
      <div className="absolute top-3 left-3 z-10 flex gap-2">
        <div className={`px-2.5 py-0.5 rounded-full text-white text-[9px] font-black tracking-wider shadow-sm ${product.badgeColor || 'bg-[#f97316]'}`}>
          {product.badge || 'ขายดี'}
        </div>
      </div>

      {/* Wishlist Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsLiked(!isLiked);
        }}
        className="absolute top-3 right-3 p-1.5 z-10 rounded-full transition-all text-blue-300 hover:text-rose-500 bg-transparent"
      >
        <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
      </button>

      {/* Product Image Container */}
      <div className="w-full aspect-[4/3] bg-white relative flex items-center justify-center p-3 sm:p-5">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            loading="lazy"
            onError={() => setImageError(true)}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <Package className="w-8 h-8 sm:w-10 sm:h-10 stroke-[1.5] text-slate-200" />
        )}
      </div>

      {/* Content Area */}
      <div className="p-3 sm:p-4 pt-0 flex flex-col flex-grow">
        {/* Brand */}
        <div className="flex items-center gap-1.5 mb-1 sm:mb-1.5">
           <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
              <span className="text-[7px] font-black text-[#0d3c90]">{brandName.charAt(0)}</span>
           </div>
           <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-[#0d3c90] truncate">
             {brandName}
           </span>
        </div>

        {/* Product Name */}
        <h4 className="text-xs sm:text-[13px] font-bold text-[#0c1a38] line-clamp-2 leading-snug group-hover:text-[#0d3c90] transition-colors h-[34px] sm:h-[38px] mb-1.5 sm:mb-2">
          {product.name}
        </h4>
        {/* Product SKU & Brief Specs */}
        {product.sku && (
          <div className="text-[10px] text-slate-400 font-mono mb-1 truncate">
            รหัสสินค้า: {product.sku}
          </div>
        )}

        {/* Star Rating & In Stock */}
        <div className="flex items-center justify-between text-[10px] mb-2 sm:mb-2.5">
          <div className="flex items-center text-[#f59e0b]">
            <div className="flex gap-[1px]">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-2.5 h-2.5 sm:w-[11px] sm:h-[11px] fill-current" />
              ))}
            </div>
            <span className="ml-1 text-slate-400 font-bold text-[9px] sm:text-[10px]">({reviewCount})</span>
          </div>
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
            ● พร้อมส่ง
          </span>
        </div>

        <div className="mt-auto pt-1">
          {/* Price Section: Only for logged-in members */}
          {user && price !== null && price !== undefined ? (
            <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-2.5 flex-wrap">
              <span className="text-base sm:text-[18px] font-black text-[#dc2626] tracking-tight leading-none">
                {formatPrice(price).replace('THB', '฿')}
              </span>
              {compareAtPrice && compareAtPrice > price && (
                <span className="text-[10px] sm:text-[11px] text-slate-400 line-through font-bold leading-none">{formatPrice(compareAtPrice).replace('THB', '฿')}</span>
              )}
              {discountPct && (
                <span className="bg-[#dc2626] text-white text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded font-black ml-auto leading-none">
                  -{discountPct}%
                </span>
              )}
            </div>
          ) : (
            <div className="h-5 sm:h-6 mb-2 sm:mb-2.5 flex items-center">
              <span className="text-[10px] text-slate-400 font-semibold italic">{lang === 'en' ? 'Members Only' : 'เฉพาะสมาชิก'}</span>
            </div>
          )}

          {/* Features */}
          <div className="flex items-center gap-2 sm:gap-4 mb-2 sm:mb-2.5 text-[8px] sm:text-[9px] text-[#0c1a38] font-bold">
            <span className="flex items-center gap-1"><Truck className="w-3 h-3 text-blue-500" /> {lang === 'en' ? 'Free Ship' : 'ส่งฟรี'}</span>
            <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-blue-500" /> {lang === 'en' ? 'Genuine' : 'ของแท้ 100%'}</span>
          </div>

          {/* Action Button: Add to Cart if Logged in, or Prompt Login */}
          {user ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                addToCart(product.id, 1, selectedVehicle?.variantId || null, true);
                setAddedAnimation(true);
                setTimeout(() => setAddedAnimation(false), 900);
              }}
              className={`w-full py-1.5 sm:py-2 rounded-xl ${
                addedAnimation ? 'bg-emerald-600' : 'bg-[#f97316] hover:bg-[#ea580c]'
              } text-white font-bold text-[11px] sm:text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>{addedAnimation ? (lang === 'en' ? 'Added!' : 'เพิ่มแล้ว!') : (lang === 'en' ? 'Add to Cart' : 'หยิบใส่ตะกร้า')}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onRequireLogin) onRequireLogin();
                else if (onClick) onClick();
              }}
              className="w-full py-1.5 sm:py-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-[#215ada] font-bold text-[11px] sm:text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <Lock className="w-3.5 h-3.5 text-[#215ada]" />
              <span>{lang === 'en' ? 'Log in to Order' : 'เข้าสู่ระบบเพื่อสั่งซื้อ'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
