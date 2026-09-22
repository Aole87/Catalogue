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
import ArticlesPage from './pages/ArticlesPage';
import ContactPage from './pages/ContactPage';
import ArticleDetailPage from './pages/ArticleDetailPage';
import { VehicleProvider } from './context/VehicleContext';
import { CartProvider } from './context/CartContext';
import { LanguageProvider } from './context/LanguageContext';
import { SettingsProvider } from './context/SettingsContext';
import { CartDrawer } from './components/cart/CartDrawer';
import ApiClient from './utils/apiClient';

function AppContent() {
  const resolvePageFromHash = (hashStr) => {
    const raw = (hashStr || (typeof window !== 'undefined' ? window.location.hash : '') || '').replace(/^#\/?/, '');
    if (raw === 'admin' || (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin'))) return 'admin';
    if (raw === 'checkout') return 'checkout';
    if (raw === 'orders' || raw === 'my-orders') return 'my-orders';
    if (raw === 'articles' || raw === 'news') return 'articles';
    if (raw === 'contact' || raw === 'about') return 'contact';
    if (raw === 'article-detail' || raw.startsWith('article')) return 'article-detail';
    if (raw === 'login') return 'login';
    if (raw === 'register') return 'register';
    if (raw === 'product-list' || raw === 'products' || raw === 'catalog' || raw === 'categories') return 'product-list';
    if (raw === 'product-detail' || raw.startsWith('product')) return 'product-detail';
    if (!raw || raw === 'home') return 'home';
    return raw;
  };

  const [page, setPage] = useState(() => resolvePageFromHash());
  const [isAdmin, setIsAdmin] = useState(false);

  // 1. Persistent User Auth State (Survives clicks, navigation & reloads)
  const [user, setUserState] = useState(() => {
    try {
      const savedUser = localStorage.getItem('mobex_auth_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  const updateUser = (newUser) => {
    setUserState(newUser);
    if (newUser) {
      try {
        localStorage.setItem('mobex_auth_user', JSON.stringify(newUser));
        const hasAdminRole = newUser.roles?.some(
          (r) => ['SUPER_ADMIN', 'ADMIN', 'CATALOG_MANAGER'].includes(r.name || r)
        );
        if (hasAdminRole) setIsAdmin(true);
      } catch (e) {}
    } else {
      try {
        localStorage.removeItem('mobex_auth_user');
        setIsAdmin(false);
      } catch (e) {}
    }
  };

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [filters, setFilters] = useState({});
  const [orderParams, setOrderParams] = useState({});

  // Sync page state with browser URL hash
  useEffect(() => {
    const handleHashChange = () => {
      const targetPage = resolvePageFromHash();
      setPage(targetPage);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Check existing session with backend API
  useEffect(() => {
    let mounted = true;
    const checkSession = async () => {
      try {
        const res = await ApiClient.getMe();
        const currentUser = res?.data?.user || res?.user;
        if (mounted && currentUser) {
          updateUser(currentUser);
        }
      } catch (e) {
        // Only clear user if the server explicitly rejects the session with 401 Unauthorized
        if (e?.status === 401 || e?.message?.includes('401') || e?.message?.includes('Unauthorized')) {
          if (mounted) updateUser(null);
        }
      }
    };
    checkSession();
    return () => { mounted = false; };
  }, []);

  const navigate = (target, params = {}) => {
    let resolved = target;
    if (target === 'products' || target === 'catalog' || target === 'categories') {
      resolved = 'product-list';
    } else if (target === 'orders') {
      resolved = 'my-orders';
    } else if (target === 'news') {
      resolved = 'articles';
    } else if (target === 'about') {
      resolved = 'contact';
    }

    if (resolved === 'product-detail') {
      setSelectedProduct(params.product || null);
    }
    if (resolved === 'product-list') {
      setFilters(params.filters || {});
    }
    if (resolved === 'order-confirmation') {
      setOrderParams(params);
    }
    if (resolved === 'article-detail') {
      setSelectedArticle(params.article || null);
    }

    if (resolved === 'admin') {
      window.location.hash = 'admin';
    } else if (resolved === 'home') {
      window.location.hash = '';
    } else {
      window.location.hash = resolved;
    }

    setPage(resolved);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPage = () => {
    switch (page) {
      case 'home':
        return <Home navigate={navigate} user={user} setUser={updateUser} />;
      case 'product-list':
        return <ProductList navigate={navigate} user={user} setUser={updateUser} initialFilters={filters} />;
      case 'product-detail':
        return <ProductDetail navigate={navigate} user={user} setUser={updateUser} product={selectedProduct} />;
      case 'checkout':
        return <Checkout onNavigate={navigate} user={user} setUser={updateUser} />;
      case 'order-confirmation':
        return (
          <OrderConfirmation
            orderNumber={orderParams.orderNumber}
            initialOrder={orderParams.order}
            onNavigate={navigate}
          />
        );
      case 'login':
        return <Login navigate={navigate} setUser={updateUser} />;
      case 'register':
        return <Register navigate={navigate} setUser={updateUser} />;
      case 'my-orders':
        return <MyOrders navigate={navigate} user={user} setUser={updateUser} />;
      case 'articles':
        return <ArticlesPage navigate={navigate} user={user} setUser={updateUser} />;
      case 'article-detail':
        return <ArticleDetailPage article={selectedArticle} navigate={navigate} user={user} setUser={updateUser} />;
      case 'contact':
        return <ContactPage navigate={navigate} user={user} setUser={updateUser} />;
      case 'admin':
        return <AdminDashboard navigate={navigate} setIsAdmin={setIsAdmin} />;
      default:
        return <Home navigate={navigate} user={user} setUser={updateUser} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans max-w-full overflow-x-hidden">
      {renderPage()}
      <CartDrawer onNavigate={navigate} />
    </div>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 text-center">
          <div className="max-w-md bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
            <h2 className="text-xl font-black text-slate-900 mb-2">เกิดข้อผิดพลาดในการโหลดหน้าเว็บ</h2>
            <p className="text-sm text-slate-500 mb-6">
              {this.state.error?.message || 'An unexpected error occurred. Please reload the page.'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.hash = '';
                window.location.reload();
              }}
              className="px-6 py-2.5 bg-[#0c3175] text-white font-bold rounded-xl shadow hover:bg-blue-900 transition-colors"
            >
              โหลดใหม่อีกครั้ง (Reload)
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <SettingsProvider>
          <VehicleProvider>
            <CartProvider>
              <AppContent />
            </CartProvider>
          </VehicleProvider>
        </SettingsProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
