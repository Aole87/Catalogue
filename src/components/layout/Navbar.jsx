import React, { useState, useEffect } from 'react';
import {
  Search,
  User,
  LogOut,
  Menu,
  X,
  Shield,
  ChevronDown,
  ShoppingBag,
  Heart,
  Car,
  ClipboardList,
  Globe,
  Clock,
  Tag
} from 'lucide-react';
import { useVehicle } from '../../context/VehicleContext';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
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
  const { lang, toggleLanguage, t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);

  // Countdown timer state for ticker bar
  const [timeLeft, setTimeLeft] = useState({ days: 4, hours: 12, mins: 15, secs: 30 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.secs > 0) return { ...prev, secs: prev.secs - 1 };
        if (prev.mins > 0) return { ...prev, mins: 59, secs: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, mins: 59, secs: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, mins: 59, secs: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
    <header className={`w-full z-40 font-sans ${className}`}>
      {/* 1. Top Header Bar: Dark Blue Background (#09357a) */}
      <div className="bg-[#09357a] text-white py-3 px-4 sm:px-6 lg:px-8 border-b border-blue-900/40">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 lg:gap-8">
          {/* Brand Logo: Buy@Unimart style */}
          <button
            onClick={() => navigate?.('home')}
            className="flex items-center gap-1 group text-left focus:outline-none shrink-0"
          >
            <div className="text-2xl sm:text-3xl font-black tracking-tight flex items-center">
              <span className="text-white">Buy</span>
              <span className="text-[#f97316] font-extrabold mx-0.5">@</span>
              <span className="text-white">Unimart</span>
            </div>
            <span className="hidden xl:inline-block text-[10px] uppercase font-bold tracking-widest bg-blue-800/80 text-blue-200 px-2 py-0.5 rounded ml-2">
              Auto Parts
            </span>
          </button>

          {/* Center Search Input Bar */}
          <div className="flex-1 max-w-2xl hidden md:block">
            <form
              onSubmit={handleSearch}
              className="flex items-center rounded-full bg-white p-1 shadow-md focus-within:ring-2 focus-within:ring-[#f97316] transition-all"
            >
              {/* Category Selector */}
              <div className="relative shrink-0">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-transparent text-slate-700 text-xs font-semibold px-4 py-2 pr-8 border-r border-slate-200 focus:outline-none cursor-pointer appearance-none"
                >
                  <option>{t('allCategories')}</option>
                  <option>Brakes & Rotors</option>
                  <option>Engine & Ignition</option>
                  <option>Oils & Fluids</option>
                  <option>Filters & Intake</option>
                  <option>Suspension & Steering</option>
                  <option>Tech & Sensors</option>
                  <option>Accessories</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
              </div>

              {/* Text Input */}
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-transparent px-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
              />

              {/* Solid Blue Search Button */}
              <button
                type="submit"
                className="bg-[#1d4ed8] hover:bg-[#1e40af] text-white px-6 py-2 rounded-full flex items-center justify-center transition-all shrink-0 font-bold text-xs gap-1.5 shadow-sm"
              >
                <Search className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Search</span>
              </button>
            </form>
          </div>

          {/* Right User Actions (Language Switcher, Wishlist, Cart, User Login) */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* Language Switcher TH | EN Button */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/20 shadow-xs"
              title="Switch Language / สลับภาษา"
            >
              <Globe className="w-3.5 h-3.5 text-[#f97316]" />
              <span>{lang.toUpperCase()}</span>
              <span className="text-[10px] text-blue-200 font-normal">({lang === 'th' ? 'TH' : 'EN'})</span>
            </button>

            {/* Vehicle Selector Badge */}
            <div className="hidden lg:block">
              <VehicleBadge vehicle={selectedVehicle} onClick={openSelectorModal} />
            </div>

            {/* Wishlist Button */}
            <button
              onClick={() => navigate?.('product-list')}
              className="relative p-2 rounded-full text-blue-100 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5"
              title={t('wishlist')}
            >
              <div className="relative">
                <Heart className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#f97316] text-[9px] font-black text-white shadow-xs">
                  0
                </span>
              </div>
              <span className="hidden xl:inline text-xs font-semibold">{t('wishlist')}</span>
            </button>

            {/* Cart Button */}
            <button
              onClick={openCart}
              className="flex items-center gap-2.5 p-2 px-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all group"
              title={t('cart')}
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#f97316] text-[9px] font-black text-white shadow-sm">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-[10px] text-blue-200 leading-none">{t('cart')}</div>
                <div className="text-xs font-extrabold font-mono text-white leading-tight">
                  {user ? `฿${Number(cartTotal || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}` : '🔒'}
                </div>
              </div>
            </button>

            {/* User Account / Auth */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-full hover:bg-white/10 text-xs font-semibold text-white transition-colors border border-white/20"
                >
                  <div className="w-7 h-7 rounded-full bg-[#f97316] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    {user.first_name?.[0] || user.firstName?.[0] || 'U'}
                  </div>
                  <ChevronDown className="w-3 h-3 text-blue-200" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 text-xs text-slate-700 animate-scale-in">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <div className="font-bold text-slate-900">{user.first_name} {user.last_name}</div>
                      <div className="text-[11px] text-slate-400 truncate">{user.email}</div>
                      <div className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#1d4ed8]">
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
                      <span>{t('myOrders')}</span>
                    </button>

                    {user.roles?.some((r) => ['SUPER_ADMIN', 'ADMIN', 'CATALOG_MANAGER'].includes(r.name)) && (
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          navigate?.('admin');
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-[#1d4ed8] font-semibold"
                      >
                        <Shield className="w-4 h-4 text-[#1d4ed8]" />
                        <span>{t('adminDashboard')}</span>
                      </button>
                    )}

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 hover:bg-rose-50 flex items-center gap-2 text-rose-600 font-semibold"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t('signOut')}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => navigate?.('login')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white bg-[#f97316] hover:bg-[#ea580c] transition-colors shadow-xs"
              >
                <User className="w-4 h-4" />
                <span>{t('signIn')}</span>
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-white hover:bg-white/10 md:hidden"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="mt-3 md:hidden">
          <form onSubmit={handleSearch} className="relative w-full">
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white text-slate-900 placeholder-slate-400 text-xs rounded-full pl-9 pr-4 py-2.5 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#f97316]"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </form>
        </div>
      </div>

      {/* 2. Royal Blue Navigation Ribbon (#0d45a2) */}
      <nav className="bg-[#0d45a2] text-white px-4 sm:px-6 lg:px-8 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Categories Dropdown Button */}
            <div className="relative">
              <button
                onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
                className="bg-[#09357a] hover:bg-[#072a63] text-white px-5 py-3 font-extrabold text-xs flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Menu className="w-4 h-4" />
                <span>{t('categories')}</span>
                <ChevronDown className="w-3.5 h-3.5 ml-1 opacity-80" />
              </button>

              {/* Categories Mega Dropdown Menu */}
              {isCategoryMenuOpen && (
                <div className="absolute top-full left-0 w-64 bg-white shadow-xl rounded-b-2xl border border-slate-100 py-2 z-50 text-xs text-slate-700 animate-scale-in">
                  {[
                    { label: 'Brakes & Rotors', cat: 'brakes' },
                    { label: 'Engine & Ignition', cat: 'engine' },
                    { label: 'Synthetic Oils & Fluids', cat: 'fluids' },
                    { label: 'Filters & Intake Systems', cat: 'filters' },
                    { label: 'Suspension & Steering', cat: 'suspension' },
                    { label: 'Electrical & Sensors', cat: 'electrical' },
                    { label: 'Lighting & Body Parts', cat: 'body' },
                    { label: 'Transmission & Drivetrain', cat: 'transmission' },
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setIsCategoryMenuOpen(false);
                        navigate?.('product-list', { filters: { category: item.cat } });
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-blue-50 hover:text-[#1d4ed8] font-medium transition-colors flex items-center justify-between"
                    >
                      <span>{item.label}</span>
                      <ChevronDown className="w-3 h-3 text-slate-400 -rotate-90" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Horizontal Navigation Links */}
            <div className="flex items-center gap-6 text-xs font-bold py-3">
              <button
                onClick={() => navigate?.('home')}
                className="hover:text-blue-200 transition-colors"
              >
                {t('home')}
              </button>
              <button
                onClick={() => navigate?.('product-list')}
                className="hover:text-blue-200 transition-colors"
              >
                {t('tech')}
              </button>
              <button
                onClick={() => navigate?.('product-list')}
                className="hover:text-blue-200 transition-colors"
              >
                {t('accessories')}
              </button>
              <button
                onClick={() => navigate?.('product-list')}
                className="hover:text-blue-200 transition-colors"
              >
                {t('lifestyle')}
              </button>
              <button
                onClick={() => navigate?.('product-list')}
                className="hover:text-blue-200 transition-colors"
              >
                {t('products')}
              </button>
              <button
                onClick={() => navigate?.('product-list', { filters: { featured: true } })}
                className="hover:text-blue-200 transition-colors text-[#f97316] font-extrabold flex items-center gap-1"
              >
                <Tag className="w-3 h-3" />
                <span>{t('promos')}</span>
              </button>
              <button
                onClick={() => navigate?.('product-list')}
                className="hover:text-blue-200 transition-colors"
              >
                {t('blog')}
              </button>
              <button
                onClick={() => navigate?.('product-list')}
                className="hover:text-blue-200 transition-colors"
              >
                {t('tourVideo')}
              </button>
            </div>
          </div>

          {/* Member Login Status Badge */}
          <div className="flex items-center gap-3 text-[11px] font-semibold py-3">
            {user ? (
              <span className="bg-emerald-500/20 text-emerald-200 px-3 py-1 rounded-full border border-emerald-400/30 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Member Verified ({user.business_type || 'GARAGE'})</span>
              </span>
            ) : (
              <span className="bg-amber-500/20 text-amber-200 px-3 py-1 rounded-full border border-amber-400/30 flex items-center gap-1">
                <span>{t('loginToViewPrice')}</span>
              </span>
            )}
          </div>
        </div>
      </nav>

      {/* 3. Ticker Strip Below Navigation Bar (#eaf2ff) */}
      <div className="bg-[#eaf2ff] border-b border-blue-100/80 py-2 px-4 sm:px-6 lg:px-8 text-xs font-semibold text-[#09357a]">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto gap-6 whitespace-nowrap">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5 text-blue-900 font-bold">
              <span className="w-2 h-2 rounded-full bg-[#f97316] animate-pulse"></span>
              <span>{lang === 'th' ? 'Lifestyle : รับส่วนลด 10% สำหรับสมาชิกตรงรุ่น 100+ แบรนด์' : 'Lifestyle : extra 10% off for 100+ brand deals'}</span>
            </div>
            <span className="text-blue-300">|</span>
            {/* Live Countdown Timer Badge */}
            <div className="flex items-center gap-1.5 bg-[#09357a] text-white px-3 py-0.5 rounded-full text-[11px] font-mono font-bold shadow-xs">
              <Clock className="w-3 h-3 text-[#f97316]" />
              <span>
                {String(timeLeft.days).padStart(2, '0')}d : {String(timeLeft.hours).padStart(2, '0')}h : {String(timeLeft.mins).padStart(2, '0')}m : {String(timeLeft.secs).padStart(2, '0')}s
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-[#09357a] font-bold">
            <span>UNIMART : Intro (all 100+ brand deals scale)</span>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 p-4 space-y-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl mb-2 flex items-center justify-between">
            <VehicleBadge vehicle={selectedVehicle} onClick={openSelectorModal} />
            <button
              onClick={toggleLanguage}
              className="px-3 py-1 rounded-full bg-[#09357a] text-white font-bold text-xs"
            >
              {lang.toUpperCase()}
            </button>
          </div>
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              navigate?.('home');
            }}
            className="w-full text-left py-2 font-bold text-slate-900 hover:text-[#1d4ed8]"
          >
            {t('home')}
          </button>
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              navigate?.('product-list');
            }}
            className="w-full text-left py-2 font-bold text-slate-900 hover:text-[#1d4ed8]"
          >
            {t('shop')}
          </button>
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              navigate?.('product-list', { filters: { featured: true } });
            }}
            className="w-full text-left py-2 font-bold text-[#f97316]"
          >
            {t('promos')}
          </button>
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              openSelectorModal();
            }}
            className="w-full text-left py-2 font-bold text-slate-900 flex items-center gap-1.5"
          >
            <Car className="w-4 h-4 text-[#1d4ed8]" />
            <span>{t('vehicleFitment')}</span>
          </button>
        </div>
      )}
    </header>
  );
};

export default Navbar;
