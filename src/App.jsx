import React, { useState, useEffect } from 'react';
import Home from './pages/Home';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  const [page, setPage] = useState('home');
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [filters, setFilters] = useState({});

  const navigate = (target, params = {}) => {
    if (target === 'product-detail') {
      setSelectedProduct(params.product);
    }
    if (target === 'product-list') {
      setFilters(params.filters || {});
    }
    setPage(target);
  };

  const renderPage = () => {
    switch (page) {
      case 'home':
        return <Home navigate={navigate} user={user} />;
      case 'product-list':
        return <ProductList navigate={navigate} user={user} initialFilters={filters} />;
      case 'product-detail':
        return <ProductDetail navigate={navigate} user={user} product={selectedProduct} />;
      case 'login':
        return <Login navigate={navigate} setUser={setUser} />;
      case 'register':
        return <Register navigate={navigate} />;
      case 'admin':
        return <AdminDashboard navigate={navigate} setIsAdmin={setIsAdmin} />;
      default:
        return <Home navigate={navigate} user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderPage()}
      {!isAdmin && (
        <button 
          onClick={() => navigate('admin')} 
          className="fixed bottom-4 right-4 bg-gray-800 text-white text-xs px-3 py-1 rounded-full opacity-50 hover:opacity-100"
        >
          Admin Panel
        </button>
      )}
    </div>
  );
}

export default App;
