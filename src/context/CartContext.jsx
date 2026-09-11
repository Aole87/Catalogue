import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import ApiClient from '../utils/ApiClient';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState({
    id: null,
    items: [],
    totals: {
      subtotal: '0.00',
      discountTotal: '0.00',
      shippingTotal: '0.00',
      taxTotal: '0.00',
      grandTotal: '0.00',
      totalItems: 0,
      tier: 'GENERAL',
    },
  });
  const [loading, setLoading] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((current) => (current === message ? null : current));
    }, 3000);
  };

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const res = await ApiClient.getCart();
      if (res?.data) {
        setCart(res.data);
      }
    } catch (err) {
      console.error('Failed to load cart:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen((prev) => !prev);

  const addToCart = async (productId, quantity = 1, vehicleVariantId = null, shouldOpenDrawer = true) => {
    try {
      setLoading(true);
      const res = await ApiClient.addToCart(productId, quantity, vehicleVariantId);
      if (res?.data) {
        setCart(res.data);
        showToast('เพิ่มสินค้าลงตะกร้าเรียบร้อยแล้ว');
        if (shouldOpenDrawer) {
          setIsCartOpen(true);
        }
      }
      return res?.data;
    } catch (err) {
      console.error('Failed to add to cart:', err);
      showToast(err.message || 'ไม่สามารถเพิ่มสินค้าลงตะกร้าได้');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      setLoading(true);
      const res = await ApiClient.updateCartItem(itemId, quantity);
      if (res?.data) {
        setCart(res.data);
      }
      return res?.data;
    } catch (err) {
      console.error('Failed to update cart item:', err);
      showToast(err.message || 'ไม่สามารถปรับปรุงจำนวนสินค้าได้');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (itemId) => {
    try {
      setLoading(true);
      const res = await ApiClient.removeCartItem(itemId);
      if (res?.data) {
        setCart(res.data);
        showToast('นำสินค้าออกจากตะกร้าแล้ว');
      }
      return res?.data;
    } catch (err) {
      console.error('Failed to remove cart item:', err);
      showToast(err.message || 'ไม่สามารถลบสินค้าได้');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      const res = await ApiClient.clearCart();
      if (res?.data) {
        setCart(res.data);
      }
    } catch (err) {
      console.error('Failed to clear cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    cart,
    items: cart.items || [],
    totals: cart.totals || {
      subtotal: '0.00',
      discountTotal: '0.00',
      shippingTotal: '0.00',
      taxTotal: '0.00',
      grandTotal: '0.00',
      totalItems: 0,
      tier: 'GENERAL',
    },
    totalItems: cart.totals?.totalItems ?? (cart.items || []).reduce((sum, i) => sum + i.quantity, 0),
    loading,
    isCartOpen,
    openCart,
    closeCart,
    toggleCart,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    refreshCart: fetchCart,
    toastMessage,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-slate-900/95 px-4 py-3 text-sm font-medium text-white shadow-2xl backdrop-blur-md border border-slate-700 animate-slide-up">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400"></span>
          <span>{toastMessage}</span>
        </div>
      )}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
