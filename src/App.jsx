import React, { useState, useEffect } from 'react';
import Home from './pages/Home';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import MyOrders from './pages/MyOrders';
import { VehicleProvider } from './context/VehicleContext';
import { CartProvider } from './context/CartContext';
import { CartDrawer } from './components/cart/CartDrawer';
import ApiClient from './utils/apiClient';

function AppContent() {
  const [page, setPage] = useState('home');
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [filters, setFilters] = useState({});
  const [orderParams, setOrderParams] = useState({});

  // Check existing session
  useEffect(() => {
    let mounted = true;
    const checkSession = async () => {
      try {
        const res = await ApiClient.getMe();
        if (mounted && res?.user) {
          setUser(res.user);
          const hasAdminRole = res.user.roles?.some(
            (r) => ['SUPER_ADMIN', 'ADMIN', 'CATALOG_MANAGER'].includes(r.name)
          );
          if (hasAdminRole) setIsAdmin(true);
        }
      } catch (e) {
        // Unauthenticated session, normal for guest visitors
      }
    };
    checkSession();
    return () => { mounted = false; };
  }, []);

  const navigate = (target, params = {}) => {
    if (target === 'product-detail') {
      setSelectedProduct(params.product);
    }
    if (target === 'product-list') {
      setFilters(params.filters || {});
    }
    if (target === 'order-confirmation') {
      setOrderParams(params);
    }
    setPage(target);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPage = () => {
    switch (page) {
      case 'home':
        return <Home navigate={navigate} user={user} setUser={setUser} />;
      case 'product-list':
        return <ProductList navigate={navigate} user={user} setUser={setUser} initialFilters={filters} />;
      case 'product-detail':
        return <ProductDetail navigate={navigate} user={user} setUser={setUser} product={selectedProduct} />;
      case 'checkout':
        return <Checkout onNavigate={navigate} user={user} />;
      case 'order-confirmation':
        return (
          <OrderConfirmation
            orderNumber={orderParams.orderNumber}
            initialOrder={orderParams.order}
            onNavigate={navigate}
          />
        );
      case 'login':
        return <Login navigate={navigate} setUser={setUser} />;
      case 'register':
        return <Register navigate={navigate} />;
      case 'my-orders':
        return <MyOrders navigate={navigate} user={user} />;
      case 'admin':
        return <AdminDashboard navigate={navigate} setIsAdmin={setIsAdmin} />;
      default:
        return <Home navigate={navigate} user={user} setUser={setUser} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {renderPage()}
      <CartDrawer onNavigate={navigate} />
      {!isAdmin && (
        <button
          onClick={() => navigate('admin')}
          className="fixed bottom-4 right-4 bg-slate-900/80 hover:bg-slate-900 text-slate-300 hover:text-white text-xs px-3 py-1.5 rounded-full shadow-lg border border-slate-700/60 backdrop-blur-sm transition-all z-30 opacity-60 hover:opacity-100"
        >
          Staff / Admin Portal
        </button>
      )}
    </div>
  );
}

export function App() {
  return (
    <VehicleProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </VehicleProvider>
  );
}

export default App;
