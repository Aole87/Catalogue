import React, { useState, useEffect } from 'react';
import {
  X, Star, Heart, ShoppingBag, Plus, Minus, CheckCircle2,
  XCircle, HelpCircle, ShieldCheck, Truck, RotateCcw, Eye, ArrowRight, Package, Lock
} from 'lucide-react';
import { useVehicle } from '../../context/VehicleContext';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import PriceDisplay from './PriceDisplay';
import CompatibilityBadge from './CompatibilityBadge';

export const QuickViewModal = ({ product, isOpen, onClose, onNavigate, user }) => {
  const { selectedVehicle, isVehicleSelected, openSelectorModal } = useVehicle();
  const { addToCart } = useCart();
  const { t, lang } = useLanguage();

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
    if (!user) {
      onClose();
      onNavigate?.('login');
      return;
    }
    setAddedAnimation(true);
    addToCart(product.id, quantity, selectedVehicle?.variantId || null, true);
    setTimeout(() => {
      setAddedAnimation(false);
      onClose();
    }, 400);
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
            {discountPct && user && (
              <span className="absolute top-3 left-3 bg-[#f97316] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-xs z-10">
                -{discountPct}%
              </span>
            )}

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
        </div>

        {/* Right Side: Product Details & Member Controls */}
        <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto max-h-[90vh] space-y-4 text-xs">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2 pr-8">
              <span className="text-xs font-black uppercase tracking-wider text-[#0d3c90] bg-blue-50 px-2.5 py-0.5 rounded-full">
                {brandName}
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-black text-[#0e1932] tracking-tight leading-snug mb-2">
              {product.name}
            </h3>

            {/* Short Description */}
            {(product.shortDescription || product.description) && (
              <p className="text-xs text-slate-500 leading-relaxed mb-3 line-clamp-3">
                {product.shortDescription || product.description}
              </p>
            )}

            {/* Price Box: Only for logged-in members */}
            {user && price !== null && price !== undefined && (
              <div className="p-4 rounded-2xl bg-[#f4f6fb] border border-slate-200/80 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Price</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-[#0d3c90] font-mono">
                        ฿{Number(price || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quantity and Actions */}
            {user ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 py-3 px-4 rounded-full bg-[#0d3c90] hover:bg-[#072a63] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  onNavigate?.('login');
                }}
                className="w-full py-3 px-4 rounded-full bg-blue-50 hover:bg-blue-100 border border-blue-200 text-[#215ada] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <Lock className="w-4 h-4 text-[#215ada]" />
                <span>{lang === 'en' ? 'Log in to Order' : 'เข้าสู่ระบบเพื่อสั่งซื้อ'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
