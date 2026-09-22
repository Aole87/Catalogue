import React, { useState, useEffect, useRef } from 'react';
import { Search, User, ShoppingCart, Globe, Menu, ChevronDown, ShieldCheck, Settings, X, PhoneCall, ChevronRight, LogOut, Package } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import { useSettings } from '../../context/SettingsContext';
import ApiClient from '../../utils/apiClient';

export const Navbar = ({ navigate, user, setUser, onSearchSubmit }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const { openCart, items } = useCart();
  const { lang, toggleLanguage, t } = useLanguage();
  const { settings } = useSettings();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navMenus = settings?.menus && Array.isArray(settings.menus) && settings.menus.length > 0
    ? settings.menus
    : [
        { id: 1, labelTh: 'หน้าหลัก', labelEn: 'Home', url: 'home', active: true },
        { id: 2, labelTh: 'หมวดหมู่สินค้า', labelEn: 'Categories', url: 'product-list', active: true },
        { id: 3, labelTh: 'สินค้าแนะนำ', labelEn: 'Recommended', url: 'product-list', active: true },
        { id: 4, labelTh: 'บทความ & ข่าวสาร', labelEn: 'Articles & News', url: 'articles', active: true },
        { id: 5, labelTh: 'ติดต่อเรา', labelEn: 'Contact Us', url: 'contact', active: true },
      ];

  const branding = settings?.branding || {
    siteNameTh: 'MOBEX ศูนย์รวมอะไหล่รถยนต์',
    siteNameEn: 'MOBEX Auto Parts Center',
    metaDescriptionTh: 'ศูนย์รวมอะไหล่รถยนต์ตรงรุ่นคุณภาพสูง จัดส่งทั่วประเทศ',
    metaDescriptionEn: 'High quality direct-fit auto parts center with nationwide delivery',
    logoUrl: '/logo.png',
  };

  const categoryButtonLabel = lang === 'th'
    ? (settings?.navigation?.categoryButtonLabelTh || 'หมวดหมู่สินค้า')
    : (settings?.navigation?.categoryButtonLabelEn || 'All Categories');

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchTerm.trim();
    if (!query) return;
    setMobileMenuOpen(false);
    setMobileSearchOpen(false);
    if (onSearchSubmit) {
      onSearchSubmit(query);
    } else if (navigate) {
      navigate('product-list', { filters: { search: query } });
    }
  };

  const handleLogout = async () => {
    try {
      await ApiClient.logout();
    } catch (e) {}
    if (setUser) {
      setUser(null);
    } else {
      localStorage.removeItem('mobex_auth_user');
      localStorage.removeItem('mobex_auth_token');
    }
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    navigate?.('home');
  };

  const handleMenuClick = (url) => {
    setMobileMenuOpen(false);
    if (!url) {
      navigate?.('product-list');
      return;
    }
    const cleanUrl = url.replace(/^#/, '').replace(/^\//, '');
    navigate?.(cleanUrl || 'home');
  };

  const isAdminUser = user?.roles?.some((r) =>
    ['SUPER_ADMIN', 'ADMIN', 'CATALOG_MANAGER'].includes(r.name || r)
  );

  return (
    <header className="w-full font-sans shadow-md z-50 relative">
      {/* Top Header - Dark Blue */}
      <div className="bg-[#051124] px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 border-b border-[#0a2353]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-6 lg:gap-8">
          
          {/* Mobile Menu Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors focus:outline-none"
            aria-label="Open mobile menu"
          >
            <Menu className="w-6 h-6 text-slate-100" />
          </button>

          {/* Logo */}
          <button
            onClick={() => navigate?.('home')}
            className="flex flex-col items-start focus:outline-none shrink-0"
          >
            {branding.logoUrl && branding.logoUrl !== '/logo.png' ? (
              <img
                src={branding.logoUrl}
                alt={lang === 'en' ? (branding.siteNameEn || branding.siteNameTh || "Logo") : (branding.siteNameTh || branding.siteNameEn || "Logo")}
                className="max-h-8 sm:max-h-12 max-w-[140px] sm:max-w-[220px] object-contain"
              />
            ) : (
              <div className="flex flex-col items-start">
                <div className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight flex items-center">
                  <span className="text-white">{lang === 'en' ? (branding.siteNameEn || 'MOBEX') : (branding.siteNameTh || 'MOBEX')}</span>
                </div>
                <span className="hidden sm:block text-[7.5px] uppercase font-bold text-slate-400 mt-0.5 leading-tight text-left max-w-[260px] truncate">
                  {lang === 'en' ? (branding.metaDescriptionEn || 'PREMIUM AUTO PARTS & HARDWARE') : (branding.metaDescriptionTh || 'ศูนย์รวมอะไหล่รถยนต์ตรงรุ่นคุณภาพสูง')}
                </span>
              </div>
            )}
          </button>

          {/* Desktop Search Bar */}
          <div className="flex-1 max-w-[600px] hidden md:block">
            <form onSubmit={handleSearch} className="flex items-center rounded-full bg-white p-1 focus-within:ring-2 focus-within:ring-[#1d4ed8]/50 transition-all shadow-inner">
              <input
                type="text"
                placeholder={lang === 'th' ? "ค้นหาสินค้า, แบรนด์, รุ่นรถ, หรือรหัสสินค้า..." : "Search parts, brands, vehicle models, or SKU..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-transparent px-4 py-2 text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none"
              />
              <button
                type="submit"
                className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-8 py-2 rounded-full flex items-center justify-center transition-all shrink-0"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-2.5 sm:gap-5 lg:gap-7 shrink-0 text-white">
             {/* Mobile Search Toggle Button */}
             <button
               type="button"
               onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
               className="md:hidden p-2 text-slate-200 hover:text-white rounded-full hover:bg-white/10 transition-colors"
               aria-label="Toggle search"
             >
               <Search className="w-5 h-5" />
             </button>

             {/* Language Switcher */}
             <button
                onClick={toggleLanguage}
                title={lang === 'th' ? 'Switch to English' : 'เปลี่ยนเป็นภาษาไทย'}
                className="flex items-center gap-1 bg-[#0a2353]/60 hover:bg-[#0c3175] border border-blue-400/30 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full font-bold text-[11px] sm:text-xs transition-all shadow-sm group"
             >
                <Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-300 group-hover:rotate-12 transition-transform" />
                <span className={lang === 'th' ? 'text-[#f97316] font-black' : 'text-slate-300'}>TH</span>
                <span className="text-slate-500">|</span>
                <span className={lang === 'en' ? 'text-[#f97316] font-black' : 'text-slate-300'}>EN</span>
             </button>
             
             {/* Admin Quick Switch (if admin) */}
             {isAdminUser && (
               <button
                 onClick={() => navigate?.('admin')}
                 className="flex items-center gap-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold transition-colors"
                 title="Open Backoffice"
               >
                 <Settings className="w-3.5 h-3.5" />
                 <span className="hidden sm:inline">Admin</span>
               </button>
             )}
             
             <div className="h-6 sm:h-8 w-[1px] bg-[#1a3668] hidden sm:block"></div>

              {/* User Auth Profile (Desktop) */}
              {user ? (
                <div className="relative hidden md:block" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 hover:text-[#f97316] font-bold text-sm transition-colors text-left focus:outline-none cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-600/40 border border-blue-400 flex items-center justify-center text-white font-black text-xs shrink-0">
                      {user.firstName?.charAt(0) || user.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="hidden lg:flex flex-col text-left">
                      <span className="text-[10px] leading-none text-emerald-400 font-bold">
                        {lang === 'th' ? 'เข้าสู่ระบบแล้ว' : 'Logged In'}
                      </span>
                      <span className="text-[12px] leading-tight text-white font-black truncate max-w-[110px]">
                        {user.firstName || user.email?.split('@')[0] || 'User'}
                      </span>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Desktop Dropdown */}
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-fade-in">
                      <div className="px-4 py-2.5 border-b border-slate-100">
                        <p className="text-xs font-black text-slate-900 truncate">
                          {user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.email}
                        </p>
                        <p className="text-[10px] text-slate-500 font-medium truncate">{user.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                          {user.customerType === 'GARAGE' ? (lang === 'th' ? 'อู่ซ่อมรถ' : 'Garage') : user.customerType === 'SHOP' ? (lang === 'th' ? 'ร้านค้าอะไหล่' : 'Parts Shop') : (lang === 'th' ? 'สมาชิกทั่วไป' : 'Member')}
                        </span>
                      </div>

                      <button
                        onClick={() => { setUserMenuOpen(false); navigate?.('my-orders'); }}
                        className="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <Package className="w-4 h-4 text-blue-600" />
                        <span>{lang === 'th' ? 'รายการคำสั่งซื้อของฉัน' : 'My Orders'}</span>
                      </button>

                      {isAdminUser && (
                        <button
                          onClick={() => { setUserMenuOpen(false); navigate?.('admin'); }}
                          className="w-full px-4 py-2.5 text-left text-xs font-bold text-amber-700 hover:bg-amber-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <Settings className="w-4 h-4 text-amber-600" />
                          <span>{lang === 'th' ? 'ระบบจัดการหลังบ้าน (Admin)' : 'Admin Backoffice'}</span>
                        </button>
                      )}

                      <div className="my-1 border-t border-slate-100"></div>

                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2.5 text-left text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        <span>{lang === 'th' ? 'ออกจากระบบ' : 'Sign Out'}</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button 
                  onClick={() => navigate?.('login')} 
                  className="hidden md:flex items-center gap-2 hover:text-[#f97316] font-bold text-sm transition-colors text-left cursor-pointer"
                >
                  <User className="w-5 h-5 text-slate-200" />
                  <div className="hidden lg:flex flex-col text-left">
                    <span className="text-[10px] leading-none text-slate-300 font-normal">
                      {lang === 'th' ? 'เข้าสู่ระบบ' : 'Login'}
                    </span>
                    <span className="text-[12px] leading-tight text-white">
                      {lang === 'th' ? 'สมัครสมาชิก' : 'Register'}
                    </span>
                  </div>
                </button>
              )}
             
             <div className="h-6 sm:h-8 w-[1px] bg-[#1a3668] hidden sm:block"></div>
             
             {/* Cart Button */}
             <button onClick={() => openCart()} className="flex items-center gap-2 sm:gap-3 hover:text-[#f97316] font-bold text-sm relative transition-colors group">
                <div className="relative">
                   <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
                   <span className="absolute -top-2 -right-2.5 flex h-[18px] min-w-[18px] px-1 items-center justify-center rounded-full bg-[#f97316] text-[10px] font-black text-white shadow-sm border-[1.5px] border-[#051124]">
                      {items.length}
                   </span>
                </div>
                <span className="hidden lg:inline ml-1 text-[13px]">
                   {lang === 'th' ? 'ตะกร้าสินค้า' : 'Cart'}
                </span>
             </button>
          </div>
        </div>

        {/* Mobile Search Bar Collapsible Form */}
        {mobileSearchOpen && (
          <div className="md:hidden mt-2 pt-2 border-t border-blue-900/40 animate-fade-in">
            <form onSubmit={handleSearch} className="flex items-center rounded-full bg-white p-1 shadow-inner">
              <input
                type="text"
                placeholder={lang === 'th' ? "ค้นหาอะไหล่, รุ่นรถ, รหัสสินค้า..." : "Search parts, vehicle, SKU..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-transparent px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
                autoFocus
              />
              <button
                type="submit"
                className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-4 py-1.5 rounded-full flex items-center justify-center transition-all shrink-0 text-xs font-bold"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Bottom Navigation - Medium Blue (Desktop) */}
      <nav className="bg-[#051124] text-white hidden md:block border-b border-blue-900/30">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 h-[52px]">
          
          <div className="flex items-center h-full">
             {/* Slanted Categories Button */}
             <div onClick={() => navigate?.("product-list")} className="relative group cursor-pointer -ml-4 sm:-ml-6 lg:-ml-8 h-full flex items-center shrink-0 w-[240px]">
                {/* Full bleed left background */}
                <div className="absolute top-0 bottom-0 right-full w-[50vw] bg-[#0c3175]"></div>
                {/* Custom Polygon Background to match exactly `/` shape */}
                <div 
                   className="absolute inset-0 bg-[#0c3175]"
                   style={{ clipPath: 'polygon(0 0, calc(100% - 30px) 0, 100% 100%, 0 100%)' }}
                ></div>
                <div className="relative z-10 px-10 flex items-center gap-3 w-full justify-start">
                   <Menu className="w-5 h-5" />
                   <span className="font-bold text-[14px]">
                     {categoryButtonLabel}
                   </span>
                   <ChevronDown className="w-4 h-4 ml-1" />
                </div>
             </div>
             
              {/* Dynamic Nav Links from Settings */}
              <div className="flex items-center gap-1.5 text-[13px] font-bold ml-2">
                 {navMenus.filter(m => {
                   if (m.active === false) return false;
                   const label = lang === 'en' ? (m.labelEn || m.labelTh) : (m.labelTh || m.labelEn);
                   return Boolean(label && label.trim().length > 0 && m.url && m.url.trim().length > 0);
                 }).map((menu, idx) => {
                  const label = lang === 'en' ? (menu.labelEn || menu.labelTh) : (menu.labelTh || menu.labelEn);
                  const isHome = menu.url === 'home' || menu.url === '/' || idx === 0;
                  return (
                    <button
                      key={menu.id || idx}
                      onClick={() => handleMenuClick(menu.url)}
                      className={`px-4 py-1.5 rounded-full transition-colors tracking-wide ${
                        isHome
                          ? 'border-[1.5px] border-[#3b82f6] bg-[#081e4b] text-white shadow-[0_0_12px_rgba(59,130,246,0.6)]'
                          : 'hover:text-blue-200 text-slate-200'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
             </div>
          </div>

          <div className="flex items-center py-2">
             <button onClick={() => navigate?.('product-list')} className="bg-[#f97316] hover:bg-[#ea580c] px-5 py-1.5 rounded-full font-bold text-[12px] flex items-center gap-2 transition-colors shadow-sm text-white">
                <ShieldCheck className="w-4 h-4" />
                <span>{lang === 'th' ? 'สินค้าพรีเมียม / รับประกันแท้' : 'Premium / 100% Genuine'}</span>
             </button>
          </div>

        </div>
      </nav>

      {/* Mobile Drawer Navigation (Sidebar on Phone/Tablet) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] md:hidden flex">
          {/* Backdrop */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer Content */}
          <div className="relative z-10 w-[82%] max-w-[320px] bg-[#051124] text-white h-full flex flex-col justify-between shadow-2xl border-r border-blue-900/50">
            {/* Drawer Top */}
            <div className="p-5 border-b border-blue-900/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {branding.logoUrl && branding.logoUrl !== '/logo.png' ? (
                  <img src={branding.logoUrl} alt="Logo" className="max-h-8 max-w-[160px] object-contain" />
                ) : (
                  <span className="font-black text-xl text-white">
                    {lang === 'en' ? (branding.siteNameEn || 'MOBEX') : (branding.siteNameTh || 'MOBEX')}
                  </span>
                )}
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Profile Card inside Drawer */}
            <div className="px-5 py-4 bg-[#0a1f46] border-b border-blue-900/40">
              {user ? (
                <div className="space-y-3">
                  <div
                    onClick={() => { setMobileMenuOpen(false); navigate?.('my-orders'); }}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-600/40 border border-blue-400 flex items-center justify-center text-white font-black text-sm shrink-0">
                      {user.firstName?.charAt(0) || user.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-white truncate max-w-[180px]">
                        {user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.email}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-bold">
                        {lang === 'th' ? 'เข้าสู่ระบบแล้ว' : 'Logged In'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => { setMobileMenuOpen(false); navigate?.('my-orders'); }}
                      className="flex-1 py-1.5 px-2.5 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/40 text-[11px] font-bold text-blue-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Package className="w-3.5 h-3.5" />
                      <span>{lang === 'th' ? 'คำสั่งซื้อ' : 'Orders'}</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="py-1.5 px-3 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-[11px] font-bold text-rose-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{lang === 'th' ? 'ออก' : 'Logout'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setMobileMenuOpen(false); navigate?.('login'); }}
                    className="flex-1 py-2 rounded-xl bg-[#f97316] text-white text-xs font-bold text-center shadow-sm hover:bg-[#ea580c]"
                  >
                    {lang === 'th' ? 'เข้าสู่ระบบ' : 'Login'}
                  </button>
                  <button
                    onClick={() => { setMobileMenuOpen(false); navigate?.('register'); }}
                    className="flex-1 py-2 rounded-xl bg-white/10 text-white text-xs font-bold text-center border border-white/20 hover:bg-white/20"
                  >
                    {lang === 'th' ? 'สมัครสมาชิก' : 'Register'}
                  </button>
                </div>
              )}
            </div>

            {/* Menu Links */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
              <div className="text-[11px] font-extrabold uppercase text-slate-400 px-3 py-1 tracking-wider">
                {lang === 'th' ? 'เมนูนำทาง' : 'Navigation'}
              </div>

              {/* All Categories Button in Drawer */}
              <button
                onClick={() => { setMobileMenuOpen(false); navigate?.('product-list'); }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#0c3175] text-white font-bold text-xs mb-2 shadow-xs"
              >
                <div className="flex items-center gap-2.5">
                  <Menu className="w-4 h-4 text-blue-300" />
                  <span>{categoryButtonLabel}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-blue-300" />
              </button>

              {/* Dynamic Menus */}
              {navMenus.filter(m => {
                if (m.active === false) return false;
                const label = lang === 'en' ? (m.labelEn || m.labelTh) : (m.labelTh || m.labelEn);
                return Boolean(label && label.trim().length > 0 && m.url && m.url.trim().length > 0);
              }).map((menu, idx) => {
                const label = lang === 'en' ? (menu.labelEn || menu.labelTh) : (menu.labelTh || menu.labelEn);
                return (
                  <button
                    key={menu.id || idx}
                    onClick={() => handleMenuClick(menu.url)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-white/10 text-slate-200 text-xs font-semibold transition-colors text-left"
                  >
                    <span>{label}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                );
              })}

              {isAdminUser && (
                <button
                  onClick={() => { setMobileMenuOpen(false); navigate?.('admin'); }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-amber-500/20 text-amber-300 font-bold text-xs mt-2 border border-amber-500/30 text-left"
                >
                  <Settings className="w-4 h-4" />
                  <span>{lang === 'th' ? 'ระบบจัดการหลังบ้าน (Admin)' : 'Admin Backoffice'}</span>
                </button>
              )}
            </div>

            {/* Drawer Bottom */}
            <div className="p-4 border-t border-blue-900/50 bg-[#040e1f] text-center space-y-2">
              <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-[#f97316]" />
                <span>{lang === 'th' ? 'รับประกันอะไหล่แท้ 100%' : '100% Genuine Guaranteed'}</span>
              </div>
              <div className="text-[9px] text-slate-500">
                © {new Date().getFullYear()} {branding.siteNameEn || branding.siteNameTh || 'MOBEX'}
              </div>
            </div>

          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
