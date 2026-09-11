import React, { useState } from 'react';
import {
  Search,
  User,
  LogIn,
  LogOut,
  Menu,
  X,
  Shield,
  ChevronDown,
  ShoppingBag,
  Heart,
  Phone,
  Layers,
  Car,
  ClipboardList,
  Sparkles,
  ArrowRight,
  Globe,
  Sliders
} from 'lucide-react';
import { useVehicle } from '../../context/VehicleContext';
import { useCart } from '../../context/CartContext';
import VehicleBadge from '../vehicle/VehicleBadge';
import ApiClient from '../../utils/apiClient';

export const Navbar = ({
  navigate,
  user,
  setUser,
  onSearchSubmit,
  className = '',
}) => {
  const { selectedVehicle, openSelectorModal } = useVehicle();
  const { openCart, totalItems, cartTotal } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearchSubmit) {
      onSearchSubmit(searchTerm);
    } else {
      navigate?.('product-list', {
        filters: {
          search: searchTerm,
          category: selectedCategory !== 'All Categories' ? selectedCategory.toLowerCase() : undefined
        }
      });
    }
  };

  const handleLogout = async () => {
    try {
      await ApiClient.logout();
    } catch (e) {
      console.error('Logout error', e);
    } finally {
      setUser?.(null);
      setIsUserMenuOpen(false);
      navigate?.('home');
    }
  };

  return (
    <header className={`w-full z-40 bg-white font-sans ${className}`}>
      {/* 1. Top Main Bar: Logo, Search with Category Pill & Black Search Button, Wishlist, Cart */}
      <div className="border-b border-slate-100 py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 lg:gap-8">
          {/* Logo */}
          <button
            onClick={() => navigate?.('home')}
            className="flex items-center gap-2 group text-left focus:outline-none shrink-0"
          >
            <div className="text-2xl sm:text-3xl font-black tracking-tight text-[#0e1932] flex items-center">
              <span>UNIMART</span>
              <span className="w-2 h-2 rounded-full bg-[#215ada] ml-1"></span>
            </div>
          </button>

          {/* Center Search Input with Category Dropdown & Black Search Button */}
          <div className="flex-1 max-w-2xl hidden md:block">
            <form
              onSubmit={handleSearch}
              className="flex items-center rounded-full border border-slate-200 bg-[#f8fafc] p-1 shadow-xs focus-within:border-[#215ada] focus-within:ring-2 focus-within:ring-[#215ada]/10 transition-all"
            >
              {/* Category selector */}
              <div className="relative shrink-0">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-transparent text-slate-700 text-xs font-semibold px-4 py-2 pr-8 border-r border-slate-200 focus:outline-none cursor-pointer appearance-none"
                >
                  <option>All Categories</option>
                  <option>Brakes & Rotors</option>
                  <option>Engine & Ignition</option>
                  <option>Oils & Fluids</option>
                  <option>Filters</option>
                  <option>Suspension</option>
                  <option>Tech & Sensors</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
              </div>

              {/* Text Input */}
              <input
                type="text"
                placeholder="Search Products, Brands, Categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-transparent px-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
              />

              {/* Black Search Button */}
              <button
                type="submit"
                className="bg-[#0e1932] hover:bg-[#215ada] text-white px-6 py-2 rounded-full flex items-center justify-center transition-all shrink-0 font-bold text-xs gap-1.5 shadow-sm"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search</span>
              </button>
            </form>
          </div>

          {/* Right Action Icons: Vehicle Fitment, Wishlist, Cart, Account */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* Vehicle Selector Badge */}
            <div className="hidden sm:block">
              <VehicleBadge vehicle={selectedVehicle} onClick={openSelectorModal} />
            </div>

            {/* Wishlist Icon */}
            <button
              onClick={() => navigate?.('product-list')}
              className="relative p-2 rounded-full text-slate-700 hover:text-[#215ada] hover:bg-slate-100 transition-colors hidden sm:flex items-center justify-center"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#215ada] text-[9px] font-bold text-white shadow-sm">
                0
              </span>
            </button>

            {/* Cart Button with Total Amount */}
            <button
              onClick={openCart}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-full hover:bg-slate-100 text-slate-800 transition-all group"
              title="Shopping Cart"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 text-[#0e1932] group-hover:text-[#215ada] transition-colors" />
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#ff4c1a] text-[9px] font-bold text-white shadow-sm">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-black text-[#0e1932] group-hover:text-[#215ada] leading-none">
                  ฿{Number(cartTotal || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </button>

            {/* User Account / Auth */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-100 text-xs font-semibold text-slate-800 transition-colors border border-slate-200"
                >
                  <div className="w-7 h-7 rounded-full bg-[#215ada] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    {user.first_name?.[0] || user.firstName?.[0] || 'U'}
                  </div>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 text-xs text-slate-700 animate-scale-in">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <div className="font-bold text-slate-900">{user.first_name} {user.last_name}</div>
                      <div className="text-[11px] text-slate-400 truncate">{user.email}</div>
                      <div className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#215ada]">
                        {user.business_type || 'MEMBER'}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        navigate?.('my-orders');
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                    >
                      <ClipboardList className="w-4 h-4 text-slate-400" />
                      <span>Order History</span>
                    </button>

                    {user.roles?.some((r) => ['SUPER_ADMIN', 'ADMIN', 'CATALOG_MANAGER'].includes(r.name)) && (
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          navigate?.('admin');
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-[#215ada] font-semibold"
                      >
                        <Shield className="w-4 h-4 text-[#215ada]" />
                        <span>Admin Dashboard</span>
                      </button>
                    )}

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 hover:bg-rose-50 flex items-center gap-2 text-rose-600 font-semibold"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => navigate?.('login')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-[#0e1932] hover:text-[#215ada] hover:bg-slate-100 transition-colors"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:text-slate-900 md:hidden"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="mt-3 md:hidden">
          <form onSubmit={handleSearch} className="relative w-full">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 text-slate-900 placeholder-slate-400 text-xs rounded-full pl-9 pr-4 py-2.5 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#215ada]"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </form>
        </div>
      </div>

      {/* 2. Royal Blue Ribbon Bar (#215ada) with Nav Links and Support Info */}
      <nav className="bg-[#215ada] text-white px-4 sm:px-6 lg:px-8 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left Nav Menu Links */}
          <div className="flex items-center gap-8 text-xs font-bold py-3">
            <button
              onClick={() => navigate?.('home')}
              className="hover:text-blue-200 transition-colors flex items-center gap-1 font-extrabold"
            >
              <span>Home</span>
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>
            <button
              onClick={() => navigate?.('product-list')}
              className="hover:text-blue-200 transition-colors flex items-center gap-1"
            >
              <span>Shop</span>
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>
            <button
              onClick={() => navigate?.('product-list', { filters: { featured: true } })}
              className="hover:text-blue-200 transition-colors"
            >
              Deals
            </button>
            <button
              onClick={() => openSelectorModal()}
              className="hover:text-blue-200 transition-colors flex items-center gap-1.5"
            >
              <Car className="w-3.5 h-3.5 text-blue-200" />
              <span>Vehicle Fitment</span>
            </button>
            <button
              onClick={() => navigate?.('product-list')}
              className="hover:text-blue-200 transition-colors"
            >
              About Us
            </button>
            <button
              onClick={() => navigate?.('product-list')}
              className="hover:text-blue-200 transition-colors"
            >
              Contact Us
            </button>
          </div>

          {/* Right Support Hotline & Language */}
          <div className="flex items-center gap-6 text-xs text-blue-100 py-3">
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-white" />
              <span>Need Help? <strong>(123) 456 7890</strong></span>
            </div>
            <span>|</span>
            <div className="flex items-center gap-3">
              <span className="hover:text-white cursor-pointer flex items-center gap-1">
                English <ChevronDown className="w-3 h-3" />
              </span>
              <span className="hover:text-white cursor-pointer flex items-center gap-1">
                USD / THB <ChevronDown className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* 3. Sub-Category Strip (Clean horizontal links) */}
      <div className="bg-white border-b border-slate-100 py-2 px-4 sm:px-6 lg:px-8 hidden lg:block overflow-x-auto">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6 text-[11px] font-semibold text-slate-600 whitespace-nowrap">
          {[
            { id: 'brakes', label: 'Brakes & Rotors' },
            { id: 'engine', label: 'Engine & Ignition' },
            { id: 'fluids', label: 'Synthetic Oils & Fluids' },
            { id: 'filters', label: 'Filters & Intake' },
            { id: 'suspension', label: 'Suspension & Steering' },
            { id: 'electrical', label: 'Sensors & Electrical' },
            { id: 'body', label: 'Lighting & Body' },
            { id: 'transmission', label: 'Transmission & Drivetrain' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => navigate?.('product-list', { filters: { category: cat.id } })}
              className="hover:text-[#215ada] transition-colors py-1 hover:underline underline-offset-4"
            >
              {cat.label}
            </button>
          ))}
          <button
            onClick={() => navigate?.('product-list')}
            className="text-[#215ada] font-bold hover:underline flex items-center gap-1"
          >
            <span>More</span>
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 p-4 space-y-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl mb-2">
            <VehicleBadge vehicle={selectedVehicle} onClick={openSelectorModal} />
          </div>
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              navigate?.('home');
            }}
            className="w-full text-left py-2 font-bold text-slate-900 hover:text-[#215ada]"
          >
            Home
          </button>
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              navigate?.('product-list');
            }}
            className="w-full text-left py-2 font-bold text-slate-900 hover:text-[#215ada]"
          >
            Shop All
          </button>
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              navigate?.('product-list', { filters: { featured: true } });
            }}
            className="w-full text-left py-2 font-bold text-[#ff4c1a]"
          >
            Today's Deals
          </button>
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              openSelectorModal();
            }}
            className="w-full text-left py-2 font-bold text-slate-900 flex items-center gap-1.5"
          >
            <Car className="w-4 h-4 text-[#215ada]" />
            <span>Select Vehicle Fitment</span>
          </button>
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              navigate?.('my-orders');
            }}
            className="w-full text-left py-2 font-bold text-slate-900"
          >
            My Orders
          </button>
        </div>
      )}
    </header>
  );
};

export default Navbar;
