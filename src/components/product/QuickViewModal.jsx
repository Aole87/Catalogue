import React, { useState, useEffect } from 'react';
import {
  X, Star, Heart, ShoppingBag, Plus, Minus, CheckCircle2,
  XCircle, HelpCircle, ShieldCheck, Truck, RotateCcw, Eye, ArrowRight, Package
} from 'lucide-react';
import { useVehicle } from '../../context/VehicleContext';
import { useCart } from '../../context/CartContext';
import PriceDisplay from './PriceDisplay';
import CompatibilityBadge from './CompatibilityBadge';

export const QuickViewModal = ({ product, isOpen, onClose, onNavigate }) => {
  const { selectedVehicle, isVehicleSelected, openSelectorModal } = useVehicle();
  const { addToCart } = useCart();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setSelectedImageIndex(0);
      setQuantity(1);
      setImageError(false);
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen || !product) return null;

  // Extract images
  const images = [];
  if (product.images && product.images.length > 0) {
    product.images.forEach((img) => {
      if (typeof img === 'string') images.push(img);
      else if (img.url) images.push(img.url);
    });
  } else if (product.primaryImage) {
    images.push(product.primaryImage);
  }

  const currentImage = images[selectedImageIndex] || null;

  // Extract price & brand
  const price = product.effectivePrice?.amount ?? product.prices?.[0]?.price ?? product.price;
  const compareAtPrice = product.effectivePrice?.compareAtPrice ?? product.prices?.[0]?.compareAtPrice ?? product.compareAtPrice;
  const tier = product.effectivePrice?.tier ?? product.prices?.[0]?.tier;
  const brandName = product.brand?.name || 'OEM GENUINE';

  const discountPct = compareAtPrice && compareAtPrice > price
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : null;

  const handleAddToCart = () => {
    setAddedAnimation(true);
    addToCart(product.id, quantity, selectedVehicle?.variantId || null, true);
    setTimeout(() => {
      setAddedAnimation(false);
      onClose();
    }, 400);
  };

  const handleBuyNow = () => {
    addToCart(product.id, quantity, selectedVehicle?.variantId || null, false);
    onClose();
    if (onNavigate) {
      onNavigate('checkout');
    }
  };

  const handleViewFullDetails = () => {
    onClose();
    if (onNavigate) {
      onNavigate('product-detail', { product });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0e1932]/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div className="relative bg-white rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden z-10 border border-slate-100 max-h-[90vh] flex flex-col md:flex-row">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Product Image & Gallery */}
        <div className="md:w-1/2 p-6 sm:p-8 bg-[#f8fafc] flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-100">
          <div className="relative w-full aspect-square bg-white rounded-2xl p-4 flex items-center justify-center border border-slate-200/80 group">
            {discountPct && (
              <span className="absolute top-3 left-3 bg-[#ff4c1a] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-xs z-10">
                -{discountPct}%
              </span>
            )}

            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs border border-slate-200 px-2 py-0.5 rounded-full flex items-center gap-1 text-[10px] text-slate-600 font-bold shadow-xs">
              <Eye className="w-3 h-3 text-[#215ada]" />
              <span>3 watching</span>
            </div>

            {currentImage && !imageError ? (
              <img
                src={currentImage}
                alt={product.name}
                onError={() => setImageError(true)}
                className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-300 gap-1">
                <Package className="w-12 h-12 stroke-[1.2]" />
                <span className="text-[10px] font-mono text-slate-400">NO IMAGE</span>
              </div>
            )}
          </div>

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="flex items-center gap-2 mt-4 overflow-x-auto no-scrollbar pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedImageIndex(idx);
                    setImageError(false);
                  }}
                  className={`w-14 h-14 rounded-xl border-2 overflow-hidden shrink-0 bg-white p-1 transition-all ${
                    selectedImageIndex === idx ? 'border-[#215ada] shadow-xs' : 'border-slate-200 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}

          {/* Value Badges */}
          <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-200/60 text-[11px] text-slate-500 font-medium">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#215ada]" />
              <span>100% Genuine Part</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-[#ff4c1a]" />
              <span>Fast 1-2 Day Delivery</span>
            </div>
          </div>
        </div>

        {/* Right Side: Product Details & Controls */}
        <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto max-h-[90vh] space-y-4">
          <div>
            {/* Brand & SKU */}
            <div className="flex items-center justify-between gap-2 mb-2 pr-8">
              <span className="text-xs font-black uppercase tracking-wider text-[#215ada] bg-blue-50 px-2.5 py-0.5 rounded-full">
                {brandName}
              </span>
              {product.sku && (
                <span className="text-[11px] font-mono text-slate-400">
                  SKU: {product.sku}
                </span>
              )}
            </div>

            {/* Product Title */}
            <h3 className="text-lg sm:text-xl font-black text-[#0e1932] tracking-tight leading-snug mb-2">
              {product.name}
            </h3>

            {/* Star Ratings */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center text-amber-400 text-xs">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current text-amber-400" />
                ))}
              </div>
              <span className="text-xs font-bold text-slate-700">4.9</span>
              <span className="text-[11px] text-slate-400">(24 Reviews)</span>
              <span className="ml-auto text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                ● In Stock
              </span>
            </div>

            {/* Price Box */}
            <div className="p-3.5 rounded-2xl bg-[#f4f6fb] border border-slate-200/80 mb-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Special Price</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-[#215ada] font-mono">
                    ฿{Number(price || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </span>
                  {compareAtPrice && compareAtPrice > price && (
                    <span className="text-xs font-semibold text-slate-400 line-through">
                      ฿{Number(compareAtPrice).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                    </span>
                  )}
                </div>
              </div>
              {tier && tier !== 'RETAIL' && (
                <span className="px-2.5 py-1 rounded-full bg-[#215ada] text-white text-[10px] font-bold">
                  {tier}
                </span>
              )}
            </div>

            {/* Vehicle Compatibility Status */}
            <div className="mb-4">
              {isVehicleSelected && selectedVehicle ? (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Fits {selectedVehicle.makeName} {selectedVehicle.modelName}</span>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-[#f8fafc] border border-slate-200 text-slate-600 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Verify vehicle compatibility</span>
                  </div>
                  <button
                    onClick={openSelectorModal}
                    className="text-[#215ada] font-bold hover:underline text-[11px]"
                  >
                    Select Model →
                  </button>
                </div>
              )}
            </div>

            {/* Short Description */}
            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
              {product.shortDescription || product.description || 'Premium grade direct OEM replacement component with precision tolerance engineering and high durability warranty.'}
            </p>
          </div>

          {/* Actions & Quantity */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-3">
              {/* Stepper */}
              <div className="flex items-center border-2 border-slate-200 rounded-full p-0.5 bg-white">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-8 text-center font-bold text-xs font-mono">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                className={`flex-1 py-3 px-4 rounded-full bg-[#215ada] hover:bg-[#163d94] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition-all ${
                  addedAnimation ? 'scale-95 bg-emerald-600' : ''
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add to Cart</span>
              </button>

              {/* Buy Now */}
              <button
                onClick={handleBuyNow}
                className="flex-1 py-3 px-4 rounded-full bg-[#ff4c1a] hover:bg-[#ff3400] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-orange-950/20 transition-all"
              >
                <span>Buy Now</span>
              </button>

              {/* Wishlist */}
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`p-3 rounded-full border-2 transition-colors ${
                  isLiked ? 'border-rose-500 text-rose-500 bg-rose-50' : 'border-slate-200 text-slate-400 hover:text-rose-500'
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* View Full Product Details Link */}
            <button
              onClick={handleViewFullDetails}
              className="w-full py-2.5 text-center text-xs font-bold text-[#215ada] hover:text-[#163d94] flex items-center justify-center gap-1.5 transition-colors group"
            >
              <span>View Full Product Details & Compatibility</span>
              <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
