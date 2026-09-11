import React from 'react';
import { useCart } from '../../context/CartContext';
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Car,
  Package,
  CheckCircle2,
} from 'lucide-react';

export function CartDrawer({ onNavigate }) {
  const {
    isCartOpen,
    closeCart,
    items,
    totals,
    updateQuantity,
    removeItem,
    clearCart,
    loading,
  } = useCart();

  if (!isCartOpen) return null;

  const subtotalNum = Number(totals.subtotal || 0);
  const freeShippingThreshold = 2000;
  const progressPercent = Math.min(100, (subtotalNum / freeShippingThreshold) * 100);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotalNum);

  const formatTHB = (val) => {
    return Number(val || 0).toLocaleString('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handleCheckoutClick = () => {
    closeCart();
    if (onNavigate) {
      onNavigate('checkout');
    } else {
      window.location.hash = '#checkout';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#0e1932]/70 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-slide-left">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-[#0e1932] text-white">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#215ada] text-white">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-black tracking-tight text-white flex items-center gap-2">
                  Shopping Cart
                  <span className="rounded-full bg-[#ff4c1a] text-white px-2 py-0.5 text-xs font-bold">
                    {totals.totalItems || items.length}
                  </span>
                </h2>
                <p className="text-[11px] text-slate-400">
                  {totals.tier === 'GARAGE' ? '⚙️ Garage Tier Pricing' : totals.tier === 'SHOP' ? '🏢 Shop Tier Pricing' : 'Standard Verified Price'}
                </p>
              </div>
            </div>
            <button
              onClick={closeCart}
              className="rounded-full p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
              aria-label="Close cart"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Free Shipping Progress Meter */}
          <div className="bg-[#f4f6fb] border-b border-slate-100 px-6 py-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
              <span>
                {remainingForFreeShipping > 0
                  ? `Add ฿${formatTHB(remainingForFreeShipping)} more to get FREE DELIVERY! 🚚`
                  : '🎉 You have unlocked FREE DELIVERY!'}
              </span>
              <span className="font-bold text-[#215ada]">{Math.round(progressPercent)}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${remainingForFreeShipping === 0 ? 'bg-emerald-500' : 'bg-[#215ada]'}`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Item List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-slate-100">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-16 text-center text-slate-400">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f4f6fb] text-slate-400 mb-4">
                  <Package className="h-8 w-8" />
                </div>
                <h3 className="text-base font-bold text-[#0e1932] mb-1">Your cart is empty</h3>
                <p className="text-xs text-slate-500 max-w-xs mb-6">
                  Browse our genuine & performance auto parts catalog to add items.
                </p>
                <button
                  onClick={() => {
                    closeCart();
                    if (onNavigate) onNavigate('product-list');
                  }}
                  className="inline-flex items-center gap-2 rounded-full bg-[#215ada] px-6 py-3 text-xs font-bold text-white shadow-md shadow-blue-600/20 hover:bg-[#163d94] transition-all"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="py-4 flex gap-3.5 group">
                  {/* Thumbnail */}
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-[#f8fafc] flex items-center justify-center p-1.5">
                    {item.primaryImage ? (
                      <img
                        src={item.primaryImage}
                        alt={item.productName}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <Package className="h-8 w-8 text-slate-300" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex flex-1 flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-[#0e1932] truncate leading-snug">
                          {item.productName}
                        </h4>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-slate-400 hover:text-rose-500 p-1 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {item.sku && (
                        <p className="text-[10px] text-slate-400 font-mono">SKU: {item.sku}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-slate-200 rounded-full p-0.5 bg-slate-50">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={loading}
                          className="w-6 h-6 rounded-full hover:bg-white flex items-center justify-center text-slate-600 transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-slate-800 font-mono">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={loading}
                          className="w-6 h-6 rounded-full hover:bg-white flex items-center justify-center text-slate-600 transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Line Price */}
                      <div className="text-right">
                        <div className="text-xs font-black text-[#215ada] font-mono">
                          ฿{formatTHB(item.lineTotal || (item.unitPrice * item.quantity))}
                        </div>
                        {item.quantity > 1 && (
                          <div className="text-[10px] text-slate-400 font-mono">
                            ฿{formatTHB(item.unitPrice)} / each
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout */}
          {items.length > 0 && (
            <div className="border-t border-slate-100 bg-white p-6 space-y-4 shadow-lg">
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900 font-mono">฿{formatTHB(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Shipping</span>
                  <span className="font-semibold text-slate-900">
                    {remainingForFreeShipping === 0 ? 'FREE' : '฿120.00'}
                  </span>
                </div>
                <div className="flex justify-between text-base font-black text-[#0e1932] pt-2 border-t border-slate-100">
                  <span>Total</span>
                  <span className="text-[#215ada] font-mono">฿{formatTHB(totals.total)}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCheckoutClick}
                  className="flex-1 py-3.5 px-6 rounded-full bg-[#ff4c1a] hover:bg-[#ff3400] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-950/20 transition-all transform hover:-translate-y-0.5"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CartDrawer;
