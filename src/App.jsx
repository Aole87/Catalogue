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
import { LanguageProvider } from './context/LanguageContext';
import { CartDrawer } from './components/cart/CartDrawer';
import ApiClient from './utils/apiClient';

function AppContent() {
  const [page, setPage] = useState(() => {
    if (window.location.hash === '#admin' || window.location.pathname.startsWith('/admin')) {
      return 'admin';
    }
    return 'home';
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [filters, setFilters] = useState({});
  const [orderParams, setOrderParams] = useState({});

  // Sync page state with browser URL hash
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#admin' || window.location.pathname.startsWith('/admin')) {
        setPage('admin');
      } else if (hash === '#checkout') {
        setPage('checkout');
      } else if (hash === '#orders') {
        setPage('my-orders');
      } else if (hash === '#login') {
        setPage('login');
      } else if (hash === '#register') {
        setPage('register');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

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

    if (target === 'admin') {
      window.location.hash = 'admin';
    } else if (target === 'home') {
      window.location.hash = '';
    } else {
      window.location.hash = target;
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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans max-w-full overflow-x-hidden">
      {renderPage()}
      <CartDrawer onNavigate={navigate} />
    </div>
  );
}

export function App() {
  return (
    <LanguageProvider>
      <VehicleProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </VehicleProvider>
    </LanguageProvider>
  );
}

export default App;
