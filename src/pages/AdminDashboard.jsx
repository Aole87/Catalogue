import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  Package,
  Tag,
  Layers,
  Users,
  Shield,
  LogOut,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  Search,
  Menu,
  Bell,
  Mail,
  ChevronDown,
  Upload,
  FileSpreadsheet,
  Image,
  CheckCircle,
  AlertCircle,
  Download,
  Eye,
  RefreshCw,
  Car,
  Sliders,
  Calendar,
  ShoppingBag,
  Warehouse,
  Truck,
  Megaphone,
  UserCheck,
  Percent,
  TrendingUp,
  TrendingDown,
  MousePointer,
  DollarSign,
  Monitor,
  LogIn,
  Touchpad,
  Rocket,
  ArrowUpRight,
  ChevronRight,
  BarChart3,
  CreditCard,
  Settings,
  HelpCircle,
  Palette,
  Globe,
} from 'lucide-react';
import OrderManager from '../components/admin/OrderManager';
import InventoryManager from '../components/admin/InventoryManager';
import CrmManager from '../components/admin/CrmManager';
import MarketingManager from '../components/admin/MarketingManager';
import SettingsManager from '../components/admin/SettingsManager';
import StorefrontManager from '../components/admin/StorefrontManager';
import ArticleManager from '../components/admin/ArticleManager';
import SeoManager from '../components/admin/SeoManager';
import SalesAnalyticsManager from '../components/admin/SalesAnalyticsManager';
import AdminRoleManager from '../components/admin/AdminRoleManager';
import { FileText } from 'lucide-react';
import ApiClient from '../utils/apiClient';
import { CategoryManager, BrandManager, CarBrandManager, CarModelManager as CarModelAdminManager, CarYearManager as CarYearAdminManager } from '../components/admin/MasterDataManager';
import ProductCatalogManager from '../components/admin/ProductCatalogManager';
import MemberManager from '../components/admin/MemberManager';

const SidebarItem = React.memo(({ id, icon: Icon, label, badge, activeTab, onSelect, hasPermission }) => {
  if (!hasPermission(id)) return null;
  const isActive = activeTab === id;
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        onSelect(id);
      }}
      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all text-xs font-medium cursor-pointer ${
        isActive
          ? 'bg-white/15 text-white shadow-sm'
          : 'text-blue-200 hover:text-white hover:bg-white/10'
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon className={`w-4 h-4 ${isActive ? 'text-[#ea580c]' : 'text-blue-300'}`} />
        <span>{label}</span>
      </div>
      {badge && (
        <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-[#ea580c] text-white">
          {badge}
        </span>
      )}
    </button>
  );
});

const AdminDashboard = ({ navigate, setIsAdmin }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({ users: 0, products: 0, categories: 0, brands: 0 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedDateRange, setSelectedDateRange] = useState('May 12 – May 18, 2024');
  const sidebarNavRef = useRef(null);

  const [currentAdmin, setCurrentAdmin] = useState(() => {
    const savedList = localStorage.getItem('adnex_admins_list');
    if (savedList) {
      try {
        const parsed = JSON.parse(savedList);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
      } catch (e) {}
    }
    return {
      id: 'adm-1',
      name: 'John Doe',
      email: 'john.doe@adnex.com',
      role: 'SUPER_ADMIN',
      department: 'ผู้บริหารระดับสูง & เจ้าของระบบ',
      permissions: ['products', 'inventory', 'masterData', 'orders', 'analytics', 'marketing', 'crm', 'storefront', 'articles', 'seo', 'members', 'settings', 'admins'],
      avatar: 'JD',
    };
  });

  useEffect(() => {
    setIsAdmin(true);
    const fetchStats = async () => {
      try {
        const res = await ApiClient.getDashboardStats().catch(() => null);
        if (res?.success && res.stats) {
          setStats(res.stats);
        } else {
          const [prodsRes, catsRes, brandsRes] = await Promise.all([
            ApiClient.getProducts({ pageSize: 1 }).catch(() => null),
            ApiClient.getCategories().catch(() => null),
            ApiClient.getBrands().catch(() => null),
          ]);
          setStats({
            users: 11,
            products: prodsRes?.pagination?.totalItems || prodsRes?.meta?.total || 5,
            categories: Array.isArray(catsRes?.data) ? catsRes.data.length : 10,
            brands: Array.isArray(brandsRes?.data) ? brandsRes.data.length : 9,
          });
        }
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      }
    };
    fetchStats();
  }, []);

  const handleLogout = () => {
    setIsAdmin(false);
    navigate('home');
  };

  const hasPermission = (id) => {
    if (!currentAdmin || currentAdmin.role === 'SUPER_ADMIN') return true;
    if (id === 'dashboard') return true;
    const permMap = {
      'products': 'products',
      'inventory': 'inventory',
      'import': 'products',
      'categories': 'masterData',
      'brands': 'masterData',
      'car-brands': 'masterData',
      'car-models': 'masterData',
      'car-years': 'masterData',
      'orders': 'orders',
      'analytics': 'analytics',
      'marketing': 'marketing',
      'crm': 'crm',
      'storefront': 'storefront',
      'articles': 'articles',
      'seo': 'seo',
      'members': 'members',
      'settings': 'settings',
      'admins': 'admins',
    };
    const req = permMap[id] || id;
    return currentAdmin.permissions?.includes(req);
  };

  const handleSelectTab = (id) => {
    const currentScrollTop = sidebarNavRef.current ? sidebarNavRef.current.scrollTop : 0;
    setActiveTab(id);
    if (sidebarNavRef.current) {
      requestAnimationFrame(() => {
        if (sidebarNavRef.current) {
          sidebarNavRef.current.scrollTop = currentScrollTop;
        }
      });
    }
  };

  const renderSidebarItem = (id, icon, label, badge) => (
    <SidebarItem
      key={id}
      id={id}
      icon={icon}
      label={label}
      badge={badge}
      activeTab={activeTab}
      onSelect={handleSelectTab}
      hasPermission={hasPermission}
    />
  );

  return (
    <div className="flex h-screen bg-[#f4f6fb] text-gray-800 font-sans antialiased selection:bg-[#ea580c] selection:text-white">
      {/* ADNEX Dark Teal Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? 'w-64' : 'w-0 overflow-hidden'
        } bg-[#0c3175] flex flex-col transition-all duration-300 z-30 shrink-0 border-r border-[#0c3175]`}
      >
        {/* Brand Logo Header */}
        <div className="h-20 flex items-center px-6 gap-3 border-b border-[#0c3175]/60">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#ea580c] to-[#ff8c42] flex items-center justify-center shadow-lg shadow-orange-950/40">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-white fill-current">
              <path d="M12 2L2 19.5h20L12 2zm0 4.5l6.5 11h-13L12 6.5z" />
            </svg>
          </div>
          <div>
            <div className="text-white text-lg font-black tracking-wider flex items-center gap-1">
              ADNEX <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#ea580c]/20 text-[#ff8c42] font-semibold tracking-normal border border-[#ea580c]/30">PRO</span>
            </div>
            <div className="text-[10px] text-blue-300/70 font-medium tracking-wide">Automotive Commerce</div>
          </div>
        </div>

        {/* Sidebar Nav: Reorganized into 5 Logical Groups */}
        <nav ref={sidebarNavRef} className="flex-1 px-4 py-5 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-[#16474e]">
          
          {/* กลุ่ม 1: ภาพรวม & ยอดขาย */}
          <div className="px-3 pb-1.5 text-[10px] uppercase text-blue-300 font-bold tracking-wider">
            ภาพรวม & ยอดขาย
          </div>
          {renderSidebarItem("dashboard", LayoutDashboard, "ภาพรวมระบบ (Overview)")}
          {renderSidebarItem("orders", ShoppingBag, "คำสั่งซื้อ & ออกใบเสร็จ")}

          {/* กลุ่ม 2: การจัดการสินค้า (Product Management) */}
          <div className="px-3 pt-4 pb-1.5 text-[10px] uppercase text-blue-300 font-bold tracking-wider">
            การจัดการสินค้า
          </div>
          {renderSidebarItem("products", Package, "แค็ตตาล็อกสินค้า & SKU")}
          {renderSidebarItem("inventory", Warehouse, "คลังสินค้า & สต็อก")}
          {renderSidebarItem("categories", Layers, "หมวดหมู่สินค้า")}
          {renderSidebarItem("brands", Tag, "แบรนด์ผู้ผลิตอะไหล่")}
          {renderSidebarItem("car-brands", Car, "ยี่ห้อรถยนต์ (Car Makes)")}
          {renderSidebarItem("car-models", Sliders, "รุ่นรถยนต์ (Car Models)")}
          {renderSidebarItem("car-years", Calendar, "ปีรถยนต์ (Car Years)")}
          {renderSidebarItem("import", FileSpreadsheet, "นำเข้าข้อมูลสินค้า (Excel)")}

          {/* กลุ่ม 3: การตลาด CRM & วิเคราะห์การขาย */}
          <div className="px-3 pt-4 pb-1.5 text-[10px] uppercase text-blue-300 font-bold tracking-wider">
            การตลาด & CRM
          </div>
          {renderSidebarItem("analytics", BarChart3, "วิเคราะห์ยอดขายเชิงลึก")}
          {renderSidebarItem("marketing", Megaphone, "แคมเปญ & คูปองส่วนลด")}
          {renderSidebarItem("members", Users, "ข้อมูลสมาชิก & สิทธิ์ราคา", "CRM")}
          {renderSidebarItem("crm", UserCheck, "ข้อมูลลูกค้า & CRM 360")}

          {/* กลุ่ม 4: การจัดการเว็บไซต์ & SEO */}
          <div className="px-3 pt-4 pb-1.5 text-[10px] uppercase text-blue-300 font-bold tracking-wider">
            การจัดการเว็บไซต์ & SEO
          </div>
          {renderSidebarItem("storefront", Palette, "การจัดการเว็บไซต์ & ข้อมูลร้านค้า")}
          {renderSidebarItem("articles", FileText, "ข่าวสาร & บทความ CMS")}
          {renderSidebarItem("seo", Globe, "การจัดการ SEO", "NEW")}

          {/* กลุ่ม 5: ผู้ใช้งาน & ผู้ดูแลระบบ */}
          <div className="px-3 pt-4 pb-1.5 text-[10px] uppercase text-blue-300 font-bold tracking-wider">
            ผู้ดูแลระบบ & ตั้งค่าระบบ
          </div>
          {renderSidebarItem("admins", Shield, "ผู้ดูแลระบบ & สิทธิ์")}
          {renderSidebarItem("settings", Settings, "ตั้งค่าระบบ & ชำระเงิน")}

        </nav>

        {/* User Profile Bar */}
        <div className="p-4 border-t border-[#0c3175]/60 flex items-center justify-between bg-[#051124]/60">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-[#0c3175] text-white flex items-center justify-center font-bold text-xs border border-[#2dd4bf]/40">
                {currentAdmin?.avatar || 'JD'}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#2dd4bf] border-2 border-[#0c3175]"></span>
            </div>
            <div className="truncate">
              <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                <span>{currentAdmin?.name || 'John Doe'}</span>
              </div>
              <div className="text-[10px] text-[#72979e] truncate flex items-center gap-1">
                <span className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase ${
                  currentAdmin?.role === 'SUPER_ADMIN' ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' : 'bg-blue-400/20 text-blue-300 border border-blue-400/30'
                }`}>
                  {currentAdmin?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="p-1.5 rounded-lg text-[#72979e] hover:text-[#ea580c] hover:bg-[#0c3175] transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Modern Top Header */}
        <header className="h-20 bg-white border-b border-gray-200/80 flex items-center justify-between px-8 shrink-0 z-20">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-xl text-gray-500 hover:text-[#0c3175] hover:bg-gray-100 transition-all cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                <span>ยินดีต้อนรับ, {currentAdmin?.name || 'John'}! 👋</span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider ${
                  currentAdmin?.role === 'SUPER_ADMIN' ? 'bg-violet-100 text-violet-800 border border-violet-200' : 'bg-blue-100 text-blue-800 border border-blue-200'
                }`}>
                  {currentAdmin?.role === 'SUPER_ADMIN' ? '👑 Super Admin' : '🛡️ Admin'}
                </span>
              </h1>
              <p className="text-xs text-gray-500">ระบบบริหารจัดการแค็ตตาล็อกอะไหล่ยานยนต์และการค้าครบวงจร</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            {/* View Storefront */}
            <button
              onClick={() => {
                setIsAdmin(false);
                navigate('home');
              }}
              className="flex items-center gap-2 bg-white border border-gray-200 hover:border-[#ea580c] hover:text-[#ea580c] text-gray-700 rounded-xl px-4 py-2 text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-[#ea580c]" />
              <span>เปิดดูหน้าร้าน</span>
            </button>
          </div>
        </header>

        {/* Page Content Scrollable Area */}
        <main className="flex-1 overflow-y-auto p-8 bg-[#f4f6fb] space-y-8">
          {activeTab === 'dashboard' && <AdnexDashboardOverview stats={stats} setActiveTab={setActiveTab} selectedDateRange={selectedDateRange} />}
          {activeTab === 'orders' && <OrderManager />}
          {activeTab === 'analytics' && <SalesAnalyticsManager />}
          {activeTab === 'crm' && <CrmManager />}
          {activeTab === 'marketing' && <MarketingManager />}
          {activeTab === 'inventory' && <InventoryManager />}
          {activeTab === 'categories' && <CategoryManager />}
          {activeTab === 'brands' && <BrandManager />}
          {activeTab === 'car-brands' && <CarBrandManager />}
          {activeTab === 'car-models' && <CarModelAdminManager />}
          {activeTab === 'car-years' && <CarYearAdminManager />}
          {activeTab === 'products' && <ProductCatalogManager />}
          {activeTab === 'import' && <ExcelImporter />}
          {activeTab === 'storefront' && <StorefrontManager />}
          {activeTab === 'articles' && <ArticleManager />}
          {activeTab === 'seo' && <SeoManager />}
          {activeTab === 'members' && <MemberManager />}
          {activeTab === 'admins' && <AdminRoleManager currentAdmin={currentAdmin} setCurrentAdmin={setCurrentAdmin} />}
          {activeTab === 'settings' && <SettingsManager setActiveTab={setActiveTab} />}
        </main>
      </div>
    </div>
  );
};

/**
 * ADNEX-style Dashboard Overview Component matching the user reference design
 */
const AdnexDashboardOverview = ({ stats, setActiveTab, selectedDateRange = 'May 12 – May 18, 2024' }) => {
  const [dateRange, setDateRange] = useState(selectedDateRange);
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);

  const dateOptions = [
    'วันนี้ (Today)',
    'May 12 – May 18, 2024',
    '7 วันย้อนหลัง (Last 7 Days)',
    '30 วันย้อนหลัง (Last 30 Days)',
    'เดือนนี้ (This Month)',
    'ไตรมาสนี้ (Q2 2024)',
  ];

  const handleExportDashboard = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Metric,Value,Period\n" +
      `Total Impressions,24.68M,${dateRange}\n` +
      `Total Clicks,312.47K,${dateRange}\n` +
      `Avg CTR,1.27%,${dateRange}\n` +
      `Total Spend,$18732.48,${dateRange}\n` +
      `Total Users,${stats?.users || 32},Current\n` +
      `Total Products,${stats?.products || 120},Current\n` +
      `Total Categories,${stats?.categories || 18},Current\n` +
      `Total Brands,${stats?.brands || 8},Current\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ADNEX_Dashboard_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    alert(`ส่งออกรายงาน Dashboard ประจำรอบ (${dateRange}) เรียบร้อยแล้ว (ไฟล์ CSV)`);
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Top Action Bar with Date Filter and Export Report */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-[#ea580c]" />
            <span>ภาพรวมและประสิทธิภาพระบบ (Dashboard Overview)</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            สรุปข้อมูลสถิติยอดขาย จำนวนการเข้าชม การค้นหาอะไหล่ และประสิทธิภาพระบบประจำรอบ ({dateRange})
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Date Filter Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDateDropdownOpen(!isDateDropdownOpen)}
              className="flex items-center gap-2 bg-white border border-gray-200/90 hover:border-gray-300 rounded-xl px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-sm transition-all cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span>{dateRange}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 ml-1 transition-transform ${isDateDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDateDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-56 bg-white border border-gray-100 rounded-xl shadow-xl z-30 py-1.5 animate-in fade-in slide-in-from-top-1">
                <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 mb-1">
                  เลือกรอบวันที่ (Date Range)
                </div>
                {dateOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setDateRange(opt);
                      setIsDateDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs font-medium transition-colors cursor-pointer flex items-center justify-between ${
                      dateRange === opt ? 'bg-orange-50 text-[#ea580c] font-bold' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span>{opt}</span>
                    {dateRange === opt && <CheckCircle className="w-3.5 h-3.5 text-[#ea580c]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Export Report Action directly on Dashboard */}
          <button
            type="button"
            onClick={handleExportDashboard}
            className="flex items-center gap-2 bg-[#0c3175] hover:bg-[#051124] text-white rounded-xl px-4 py-2 text-xs font-semibold shadow-sm transition-all cursor-pointer shrink-0"
            title="ส่งออกรายงาน Dashboard ประจำสัปดาห์ / เดือน"
          >
            <Download className="w-3.5 h-3.5 text-[#2dd4bf]" />
            <span>Export Report</span>
          </button>
        </div>
      </div>
      {/* Row 1: 4 Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: Total Impressions */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-start justify-between">
          <div>
            <div className="text-[11px] font-medium text-gray-500 mb-1">Total Impressions</div>
            <div className="text-2xl font-black text-gray-900 tracking-tight mb-2">24.68M</div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>↑ 18.6%</span>
              <span className="text-gray-400 font-normal text-[11px]">vs May 5 – May 11</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#0c3175] text-[#2dd4bf] flex items-center justify-center shrink-0 shadow-sm">
            <Eye className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2: Total Clicks */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-start justify-between">
          <div>
            <div className="text-[11px] font-medium text-gray-500 mb-1">Total Clicks</div>
            <div className="text-2xl font-black text-gray-900 tracking-tight mb-2">312.47K</div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>↑ 22.4%</span>
              <span className="text-gray-400 font-normal text-[11px]">vs May 5 – May 11</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#ea580c] text-white flex items-center justify-center shrink-0 shadow-md shadow-orange-500/20">
            <MousePointer className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3: Avg. CTR */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-start justify-between">
          <div>
            <div className="text-[11px] font-medium text-gray-500 mb-1">Avg. CTR</div>
            <div className="text-2xl font-black text-gray-900 tracking-tight mb-2">1.27%</div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>↑ 6.3%</span>
              <span className="text-gray-400 font-normal text-[11px]">vs May 5 – May 11</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#051124] text-[#34d399] flex items-center justify-center shrink-0 shadow-sm">
            <BarChart3 className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 4: Total Spend */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-start justify-between">
          <div>
            <div className="text-[11px] font-medium text-gray-500 mb-1">Total Spend</div>
            <div className="text-2xl font-black text-gray-900 tracking-tight mb-2">$18,732.48</div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-500">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>↓ 4.8%</span>
              <span className="text-gray-400 font-normal text-[11px]">vs May 5 – May 11</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#ea580c] text-white flex items-center justify-center shrink-0 shadow-md shadow-orange-500/20">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Row 2: 3 Category/Ad Channel Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Channel 1: Banner Ads (Teal) */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#0c3175] text-[#2dd4bf] flex items-center justify-center">
                  <Monitor className="w-4 h-4" />
                </div>
                <span className="font-bold text-sm text-gray-900">Banner Ads</span>
              </div>
              <button
                onClick={() => setActiveTab('marketing')}
                className="text-xs font-semibold text-[#0c3175] hover:text-[#ea580c] flex items-center gap-1 transition-colors"
              >
                <span>View Details</span>
                <span>→</span>
              </button>
            </div>

            <div className="mb-4">
              <div className="text-[11px] text-gray-400 mb-0.5">Impressions</div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-gray-900">12.45M</span>
                <span className="text-xs font-bold text-emerald-600">↑ 19.3%</span>
              </div>
            </div>

            {/* Sparkline Graphic (Teal Area) */}
            <div className="h-28 w-full mb-4">
              <svg viewBox="0 0 300 100" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="tealGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0c3175" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#0c3175" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M 0,65 Q 40,75 75,55 T 150,60 T 225,45 T 300,30 L 300,100 L 0,100 Z"
                  fill="url(#tealGradient)"
                />
                <path
                  d="M 0,65 Q 40,75 75,55 T 150,60 T 225,45 T 300,30"
                  fill="none"
                  stroke="#0c3175"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle cx="75" cy="55" r="3" fill="#0c3175" />
                <circle cx="150" cy="60" r="3" fill="#0c3175" />
                <circle cx="225" cy="45" r="3" fill="#0c3175" />
                <circle cx="300" cy="30" r="3.5" fill="#2dd4bf" stroke="#0c3175" strokeWidth="2" />
              </svg>
              <div className="flex justify-between text-[10px] text-gray-400 pt-1">
                <span>May 12</span>
                <span>May 14</span>
                <span>May 16</span>
                <span>May 18</span>
              </div>
            </div>
          </div>

          {/* Breakdown Rows */}
          <div className="pt-4 border-t border-gray-100 space-y-2.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Clicks</span>
              <div className="flex items-center gap-1.5 font-bold text-gray-900">
                <span>162.45K</span>
                <span className="text-[11px] font-semibold text-emerald-600">↑ 21.1%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">CTR</span>
              <div className="flex items-center gap-1.5 font-bold text-gray-900">
                <span>1.31%</span>
                <span className="text-[11px] font-semibold text-emerald-600">↑ 6.4%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Spend</span>
              <div className="flex items-center gap-1.5 font-bold text-gray-900">
                <span>$9,652.21</span>
                <span className="text-[11px] font-semibold text-rose-500">↓ 3.7%</span>
              </div>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="text-gray-500">Top Campaign</span>
              <span className="font-semibold text-[#0c3175] hover:underline cursor-pointer">Summer Sale Banner</span>
            </div>
          </div>
        </div>

        {/* Channel 2: Login Ads (Orange) */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#ea580c] text-white flex items-center justify-center">
                  <LogIn className="w-4 h-4" />
                </div>
                <span className="font-bold text-sm text-gray-900">Login Ads</span>
              </div>
              <button
                onClick={() => setActiveTab('marketing')}
                className="text-xs font-semibold text-[#ea580c] hover:text-[#c2410c] flex items-center gap-1 transition-colors"
              >
                <span>View Details</span>
                <span>→</span>
              </button>
            </div>

            <div className="mb-4">
              <div className="text-[11px] text-gray-400 mb-0.5">Impressions</div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-gray-900">7.83M</span>
                <span className="text-xs font-bold text-emerald-600">↑ 16.8%</span>
              </div>
            </div>

            {/* Sparkline Graphic (Orange Area) */}
            <div className="h-28 w-full mb-4">
              <svg viewBox="0 0 300 100" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="orangeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ea580c" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#ea580c" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M 0,70 Q 50,85 100,65 T 200,55 T 300,40 L 300,100 L 0,100 Z"
                  fill="url(#orangeGradient)"
                />
                <path
                  d="M 0,70 Q 50,85 100,65 T 200,55 T 300,40"
                  fill="none"
                  stroke="#ea580c"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle cx="100" cy="65" r="3" fill="#ea580c" />
                <circle cx="200" cy="55" r="3" fill="#ea580c" />
                <circle cx="300" cy="40" r="3.5" fill="#ff8c42" stroke="#ea580c" strokeWidth="2" />
              </svg>
              <div className="flex justify-between text-[10px] text-gray-400 pt-1">
                <span>May 12</span>
                <span>May 14</span>
                <span>May 16</span>
                <span>May 18</span>
              </div>
            </div>
          </div>

          {/* Breakdown Rows */}
          <div className="pt-4 border-t border-gray-100 space-y-2.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Clicks</span>
              <div className="flex items-center gap-1.5 font-bold text-gray-900">
                <span>98.21K</span>
                <span className="text-[11px] font-semibold text-emerald-600">↑ 20.7%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">CTR</span>
              <div className="flex items-center gap-1.5 font-bold text-gray-900">
                <span>1.25%</span>
                <span className="text-[11px] font-semibold text-emerald-600">↑ 5.8%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Spend</span>
              <div className="flex items-center gap-1.5 font-bold text-gray-900">
                <span>$6,342.18</span>
                <span className="text-[11px] font-semibold text-rose-500">↓ 5.2%</span>
              </div>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="text-gray-500">Top Campaign</span>
              <span className="font-semibold text-[#ea580c] hover:underline cursor-pointer">Login Fest May</span>
            </div>
          </div>
        </div>

        {/* Channel 3: Swipe Ads (Green/Cyan) */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#097969] text-white flex items-center justify-center">
                  <Touchpad className="w-4 h-4" />
                </div>
                <span className="font-bold text-sm text-gray-900">Swipe Ads</span>
              </div>
              <button
                onClick={() => setActiveTab('marketing')}
                className="text-xs font-semibold text-[#097969] hover:text-[#0c3175] flex items-center gap-1 transition-colors"
              >
                <span>View Details</span>
                <span>→</span>
              </button>
            </div>

            <div className="mb-4">
              <div className="text-[11px] text-gray-400 mb-0.5">Impressions</div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-gray-900">4.40M</span>
                <span className="text-xs font-bold text-emerald-600">↑ 17.2%</span>
              </div>
            </div>

            {/* Sparkline Graphic (Cyan Area) */}
            <div className="h-28 w-full mb-4">
              <svg viewBox="0 0 300 100" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0d9488" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#0d9488" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M 0,75 Q 40,80 80,60 T 160,65 T 240,45 T 300,35 L 300,100 L 0,100 Z"
                  fill="url(#cyanGradient)"
                />
                <path
                  d="M 0,75 Q 40,80 80,60 T 160,65 T 240,45 T 300,35"
                  fill="none"
                  stroke="#0d9488"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle cx="80" cy="60" r="3" fill="#0d9488" />
                <circle cx="160" cy="65" r="3" fill="#0d9488" />
                <circle cx="240" cy="45" r="3" fill="#0d9488" />
                <circle cx="300" cy="35" r="3.5" fill="#5eead4" stroke="#0f766e" strokeWidth="2" />
              </svg>
              <div className="flex justify-between text-[10px] text-gray-400 pt-1">
                <span>May 12</span>
                <span>May 14</span>
                <span>May 16</span>
                <span>May 18</span>
              </div>
            </div>
          </div>

          {/* Breakdown Rows */}
          <div className="pt-4 border-t border-gray-100 space-y-2.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Clicks</span>
              <div className="flex items-center gap-1.5 font-bold text-gray-900">
                <span>51.81K</span>
                <span className="text-[11px] font-semibold text-emerald-600">↑ 17.3%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">CTR</span>
              <div className="flex items-center gap-1.5 font-bold text-gray-900">
                <span>1.18%</span>
                <span className="text-[11px] font-semibold text-emerald-600">↑ 4.9%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Spend</span>
              <div className="flex items-center gap-1.5 font-bold text-gray-900">
                <span>$2,738.09</span>
                <span className="text-[11px] font-semibold text-rose-500">↓ 6.1%</span>
              </div>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="text-gray-500">Top Campaign</span>
              <span className="font-semibold text-[#097969] hover:underline cursor-pointer">Swipe & Win</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Main Line Chart & Donut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Impressions Over Time (2 Columns) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="font-bold text-base text-gray-900">Impressions Over Time (All Channels)</h3>
                <div className="flex items-center gap-4 mt-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#0c3175]"></span>
                    <span className="text-gray-600 font-medium">Banner Ads</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ea580c]"></span>
                    <span className="text-gray-600 font-medium">Login Ads</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#2dd4bf]"></span>
                    <span className="text-gray-600 font-medium">Swipe Ads</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-700 cursor-pointer">
                <span>Daily</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </div>
            </div>

            {/* SVG Multi-Line Chart */}
            <div className="h-64 w-full relative">
              <svg viewBox="0 0 600 200" className="w-full h-full overflow-visible">
                {/* Horizontal Grid lines */}
                <line x1="40" y1="20" x2="590" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="40" y1="65" x2="590" y2="65" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="40" y1="110" x2="590" y2="110" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="40" y1="155" x2="590" y2="155" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="40" y1="195" x2="590" y2="195" stroke="#f1f5f9" strokeWidth="1" />

                {/* Y Axis Labels */}
                <text x="10" y="24" className="text-[10px] fill-gray-400 font-medium">8M</text>
                <text x="10" y="69" className="text-[10px] fill-gray-400 font-medium">6M</text>
                <text x="10" y="114" className="text-[10px] fill-gray-400 font-medium">4M</text>
                <text x="10" y="159" className="text-[10px] fill-gray-400 font-medium">2M</text>
                <text x="25" y="198" className="text-[10px] fill-gray-400 font-medium">0</text>

                {/* Line 1: Banner Ads (Teal) */}
                <path
                  d="M 60,135 Q 140,150 220,120 T 380,100 T 480,95 T 570,60"
                  fill="none"
                  stroke="#0c3175"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <circle cx="60" cy="135" r="4" fill="#0c3175" />
                <circle cx="140" cy="142" r="4" fill="#0c3175" />
                <circle cx="220" cy="120" r="4" fill="#0c3175" />
                <circle cx="300" cy="115" r="4" fill="#0c3175" />
                <circle cx="380" cy="100" r="4" fill="#0c3175" />
                <circle cx="480" cy="95" r="4" fill="#0c3175" />
                <circle cx="570" cy="60" r="5" fill="#2dd4bf" stroke="#0c3175" strokeWidth="2.5" />

                {/* Line 2: Login Ads (Orange) */}
                <path
                  d="M 60,150 Q 140,165 220,148 T 380,130 T 480,138 T 570,110"
                  fill="none"
                  stroke="#ea580c"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle cx="60" cy="150" r="3.5" fill="#ea580c" />
                <circle cx="140" cy="160" r="3.5" fill="#ea580c" />
                <circle cx="220" cy="148" r="3.5" fill="#ea580c" />
                <circle cx="300" cy="152" r="3.5" fill="#ea580c" />
                <circle cx="380" cy="130" r="3.5" fill="#ea580c" />
                <circle cx="480" cy="138" r="3.5" fill="#ea580c" />
                <circle cx="570" cy="110" r="4" fill="#ff8c42" stroke="#ea580c" strokeWidth="2" />

                {/* Line 3: Swipe Ads (Cyan) */}
                <path
                  d="M 60,175 Q 140,185 220,172 T 380,165 T 480,160 T 570,145"
                  fill="none"
                  stroke="#2dd4bf"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle cx="60" cy="175" r="3" fill="#2dd4bf" />
                <circle cx="140" cy="180" r="3" fill="#2dd4bf" />
                <circle cx="220" cy="172" r="3" fill="#2dd4bf" />
                <circle cx="300" cy="170" r="3" fill="#2dd4bf" />
                <circle cx="380" cy="165" r="3" fill="#2dd4bf" />
                <circle cx="480" cy="160" r="3" fill="#2dd4bf" />
                <circle cx="570" cy="145" r="3.5" fill="#5eead4" stroke="#0f766e" strokeWidth="1.5" />
              </svg>
            </div>

            <div className="flex justify-between text-xs text-gray-400 pl-10 pr-4 pt-2">
              <span>May 12</span>
              <span>May 13</span>
              <span>May 14</span>
              <span>May 15</span>
              <span>May 16</span>
              <span>May 17</span>
              <span>May 18</span>
            </div>
          </div>
        </div>

        {/* Impressions by Channel (Donut Chart) */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-gray-900 mb-6">Impressions by Channel</h3>

            <div className="flex flex-col items-center justify-center my-2">
              {/* Donut Chart SVG */}
              <div className="relative w-48 h-48 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  {/* Total circumference = 2 * PI * 35 = ~220 */}
                  {/* Segment 1: Banner Ads 50.5% (111) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="35"
                    fill="transparent"
                    stroke="#0c3175"
                    strokeWidth="16"
                    strokeDasharray="111 220"
                    strokeDashoffset="0"
                  />
                  {/* Segment 2: Login Ads 31.7% (70) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="35"
                    fill="transparent"
                    stroke="#ea580c"
                    strokeWidth="16"
                    strokeDasharray="70 220"
                    strokeDashoffset="-111"
                  />
                  {/* Segment 3: Swipe Ads 17.8% (39) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="35"
                    fill="transparent"
                    stroke="#2dd4bf"
                    strokeWidth="16"
                    strokeDasharray="39 220"
                    strokeDashoffset="-181"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-xl font-black text-gray-900 tracking-tight">24.68M</span>
                  <span className="text-[11px] font-medium text-gray-400">Total</span>
                </div>
              </div>
            </div>

            {/* Legend List */}
            <div className="space-y-3 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-medium text-gray-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0c3175]"></span>
                  <span>Banner Ads</span>
                </div>
                <span className="font-bold text-gray-900">12.45M (50.5%)</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-medium text-gray-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ea580c]"></span>
                  <span>Login Ads</span>
                </div>
                <span className="font-bold text-gray-900">7.83M (31.7%)</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-medium text-gray-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2dd4bf]"></span>
                  <span>Swipe Ads</span>
                </div>
                <span className="font-bold text-gray-900">4.40M (17.8%)</span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-2">
            <button
              onClick={() => setActiveTab('marketing')}
              className="text-xs font-bold text-[#0c3175] hover:text-[#ea580c] flex items-center justify-center gap-1.5 w-full py-2 bg-gray-50 hover:bg-orange-50/50 rounded-xl transition-all"
            >
              <span>View Full Breakdown</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ========================
// Excel Importer Component
// ========================
const ExcelImporter = () => {
   const [step, setStep] = useState('upload'); // upload | preview | importing | done
   const [fileName, setFileName] = useState('');
   const [sheetData, setSheetData] = useState([]);
   const [headers, setHeaders] = useState([]);
   const [columnMapping, setColumnMapping] = useState({});
   const [importProgress, setImportProgress] = useState({ current: 0, total: 0, errors: [] });
   const [importResults, setImportResults] = useState({ success: 0, failed: 0, errors: [] });
   const [categories, setCategories] = useState([]);
   const [brands, setBrands] = useState([]);
   const fileInputRef = useRef(null);

   // DB fields that can be mapped from Excel
   const dbFields = [
      { key: 'name', label: 'Product Name', required: true },
      { key: 'code', label: 'SKU Code', required: true },
      { key: 'description', label: 'Description', required: false },
      { key: 'category_name', label: 'Category Name', required: false },
      { key: 'brand_name', label: 'Brand Name', required: false },
      { key: 'car_brand', label: 'Car Brand', required: false },
      { key: 'car_model', label: 'Car Model', required: false },
      { key: 'car_year', label: 'Car Year', required: false },
      { key: 'price_general', label: 'General Price (฿)', required: false },
      { key: 'price_garage', label: 'Garage Price (฿)', required: false },
      { key: 'price_shop', label: 'Shop Price (฿)', required: false },
      { key: 'specifications', label: 'Specifications (JSON)', required: false },
      { key: 'cross_references', label: 'Cross References', required: false },
      { key: 'images', label: 'Image URLs (comma-separated)', required: false },
   ];

   useEffect(() => {
      const fetchLookups = async () => {
         try {
            const [catsRes, brsRes] = await Promise.all([
               ApiClient.getCategories().catch(() => ({ data: [] })),
               ApiClient.getBrands().catch(() => ({ data: [] }))
            ]);
            setCategories(catsRes?.data || catsRes?.categories || (Array.isArray(catsRes) ? catsRes : []));
            setBrands(brsRes?.data || brsRes?.brands || (Array.isArray(brsRes) ? brsRes : []));
         } catch (err) { console.error('Lookup load error:', err); }
      };
      fetchLookups();
   }, []);

   // Parse Excel using a lightweight CSV/TSV parser or SheetJS CDN
   const handleFileSelect = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      setFileName(file.name);

      // Handle CSV files
      if (file.name.endsWith('.csv') || file.name.endsWith('.tsv')) {
         const text = await file.text();
         const delimiter = file.name.endsWith('.tsv') ? '\t' : ',';
         const lines = text.split('\n').filter(l => l.trim());
         if (lines.length < 2) {
            alert('File must have at least a header row and one data row');
            return;
         }
         const hdrs = parseCSVLine(lines[0], delimiter);
         const rows = lines.slice(1).map(line => {
            const vals = parseCSVLine(line, delimiter);
            const row = {};
            hdrs.forEach((h, i) => { row[h] = vals[i] || ''; });
            return row;
         });
         setHeaders(hdrs);
         setSheetData(rows);
         autoMapColumns(hdrs);
         setStep('preview');
         return;
      }

      // Handle Excel files using SheetJS (loaded from CDN)
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
         try {
            // Dynamically load SheetJS if not already loaded
            if (!window.XLSX) {
               await loadScript('https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js');
            }
            const data = await file.arrayBuffer();
            const workbook = window.XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = window.XLSX.utils.sheet_to_json(firstSheet, { defval: '' });
            if (jsonData.length === 0) {
               alert('No data found in the Excel file');
               return;
            }
            const hdrs = Object.keys(jsonData[0]);
            setHeaders(hdrs);
            setSheetData(jsonData);
            autoMapColumns(hdrs);
            setStep('preview');
         } catch (err) {
            console.error('Error parsing Excel:', err);
            alert('Error parsing Excel file. Please ensure it is a valid .xlsx or .xls file.');
         }
         return;
      }

      alert('Unsupported file format. Please use .xlsx, .xls, .csv, or .tsv');
   };

   const loadScript = (src) => {
      return new Promise((resolve, reject) => {
         const script = document.createElement('script');
         script.src = src;
         script.onload = resolve;
         script.onerror = reject;
         document.head.appendChild(script);
      });
   };

   const parseCSVLine = (line, delimiter = ',') => {
      const result = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
         const char = line[i];
         if (char === '"') {
            inQuotes = !inQuotes;
         } else if (char === delimiter && !inQuotes) {
            result.push(current.trim());
            current = '';
         } else {
            current += char;
         }
      }
      result.push(current.trim());
      return result;
   };

   // Auto-map columns based on similar names
   const autoMapColumns = (hdrs) => {
      const mapping = {};
      const normalize = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

      const synonyms = {
         name: ['name', 'productname', 'product', 'title', 'ชื่อสินค้า', 'ชื่อ'],
         code: ['code', 'sku', 'skucode', 'partno', 'partnumber', 'รหัสสินค้า', 'รหัส'],
         description: ['description', 'desc', 'detail', 'details', 'คำอธิบาย', 'รายละเอียด'],
         category_name: ['category', 'categoryname', 'cat', 'หมวดหมู่', 'กลุ่มสินค้า', 'ประเภท'],
         brand_name: ['brand', 'brandname', 'manufacturer', 'ยี่ห้อ', 'แบรนด์'],
         car_brand: ['carbrand', 'carmanufacturer', 'vehicle', 'vehiclebrand', 'ยี่ห้อรถ', 'รถยนต์'],
         car_model: ['carmodel', 'model', 'vehiclemodel', 'รุ่นรถ', 'รุ่น'],
         car_year: ['caryear', 'year', 'vehicleyear', 'ปีรถ', 'ปี'],
         price_general: ['pricegeneral', 'generalprice', 'price', 'retailprice', 'ราคาทั่วไป', 'ราคา'],
         price_garage: ['pricegarage', 'garageprice', 'ราคาอู่', 'ราคาช่าง'],
         price_shop: ['priceshop', 'shopprice', 'wholesaleprice', 'ราคาร้าน'],
         specifications: ['specifications', 'specs', 'spec', 'สเปค'],
         cross_references: ['crossreferences', 'crossref', 'oem', 'oemno', 'อ้างอิง'],
         images: ['images', 'image', 'imageurl', 'imageurls', 'photo', 'photos', 'รูปภาพ'],
      };

      hdrs.forEach(h => {
         const normalized = normalize(h);
         for (const [field, syns] of Object.entries(synonyms)) {
            if (syns.includes(normalized)) {
               mapping[field] = h;
               break;
            }
         }
      });

      setColumnMapping(mapping);
   };

   const handleMappingChange = (dbField, excelColumn) => {
      setColumnMapping(prev => ({
         ...prev,
         [dbField]: excelColumn || undefined
      }));
   };

   // Find or create category/brand by name via PostgreSQL ApiClient
   const findOrCreateCategory = async (name) => {
      if (!name) return null;
      const existing = categories.find(c => c.name.toLowerCase() === name.toLowerCase());
      if (existing) return existing.id;
      try {
         const slug = name.toLowerCase().replace(/[^a-z0-9\u0E00-\u0E7F]+/g, '-').replace(/^-+|-+$/g, '') || `cat-${Date.now()}`;
         const res = await ApiClient.createCategory({ name, slug });
         const newCat = res?.data || res || { id: `cat-${Date.now()}`, name };
         setCategories(prev => [...prev, newCat]);
         return newCat.id;
      } catch (err) {
         console.warn('Failed to create category:', err);
         return null;
      }
   };

   const findOrCreateBrand = async (name) => {
      if (!name) return null;
      const existing = brands.find(b => b.name.toLowerCase() === name.toLowerCase());
      if (existing) return existing.id;
      try {
         const slug = name.toLowerCase().replace(/[^a-z0-9\u0E00-\u0E7F]+/g, '-').replace(/^-+|-+$/g, '') || `brand-${Date.now()}`;
         const res = await ApiClient.createBrand({ name, slug });
         const newBrand = res?.data || res || { id: `brand-${Date.now()}`, name };
         setBrands(prev => [...prev, newBrand]);
         return newBrand.id;
      } catch (err) {
         console.warn('Failed to create brand:', err);
         return null;
      }
   };

   const startImport = async () => {
      // Validate required fields are mapped
      const requiredFields = dbFields.filter(f => f.required);
      const missingRequired = requiredFields.filter(f => !columnMapping[f.key]);
      if (missingRequired.length > 0) {
         alert(`Please map the required fields: ${missingRequired.map(f => f.label).join(', ')}`);
         return;
      }

      setStep('importing');
      const errors = [];
      let successCount = 0;

      for (let i = 0; i < sheetData.length; i++) {
         const row = sheetData[i];
         setImportProgress({ current: i + 1, total: sheetData.length, errors });

         try {
            // Extract mapped values
            const getValue = (field) => {
               const excelCol = columnMapping[field];
               if (!excelCol) return '';
               return (row[excelCol] || '').toString().trim();
            };

            const name = getValue('name');
            const code = getValue('code');
            if (!name || !code) {
               errors.push({ row: i + 2, message: 'Missing required field: name or code' });
               continue;
            }

            const categoryName = getValue('category_name');
            const brandName = getValue('brand_name');
            const categoryId = await findOrCreateCategory(categoryName);
            const brandId = await findOrCreateBrand(brandName);

            const imagesRaw = getValue('images');
            const imagesList = imagesRaw ? imagesRaw.split(',').map(s => s.trim()).filter(Boolean) : [];

            const productPayload = {
               name,
               sku: code,
               description: getValue('description') || '',
               categoryId: categoryId || undefined,
               brandId: brandId || undefined,
               price: parseFloat(getValue('price_general')) || 0,
               stockQuantity: 25,
               images: imagesList,
            };

            try {
               await ApiClient.createProduct(productPayload);
               successCount++;
            } catch (createErr) {
               // If already exists or error, try update
               try {
                  const existingRes = await ApiClient.getProducts({ q: code, pageSize: 1 });
                  const found = (existingRes?.items || existingRes?.data || []).find(p => p.sku === code || p.code === code);
                  if (found?.id) {
                     await ApiClient.updateProduct(found.id, productPayload);
                     successCount++;
                  } else {
                     errors.push({ row: i + 2, message: createErr.message || 'Error creating product' });
                  }
               } catch (updErr) {
                  errors.push({ row: i + 2, message: updErr.message || 'Error saving product' });
               }
            }
         } catch (err) {
            errors.push({ row: i + 2, message: err.message || 'Unknown error' });
         }
      }

      setImportResults({ success: successCount, failed: errors.length, errors });
      setStep('done');
   };

   const downloadTemplate = () => {
      const headers = ['Product Name', 'SKU Code', 'Description', 'Category', 'Brand', 'Car Brand', 'Car Model', 'Car Year', 'General Price', 'Garage Price', 'Shop Price', 'Specifications', 'Cross References', 'Images'];
      const sampleRow = ['Brake Pad Set', 'BP-TOY-001', 'Front brake pads for Toyota Camry', 'เบรก', 'Bosch', 'Toyota', 'Camry', '2018-Present', '1200', '950', '1100', '{"position":"front","type":"ceramic"}', 'OEM-04465-33471', 'https://example.com/img1.jpg,https://example.com/img2.jpg'];
      const csvContent = [headers.join(','), sampleRow.join(',')].join('\n');
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'product_import_template.csv';
      a.click();
      URL.revokeObjectURL(url);
   };

   const resetImporter = () => {
      setStep('upload');
      setFileName('');
      setSheetData([]);
      setHeaders([]);
      setColumnMapping({});
      setImportProgress({ current: 0, total: 0, errors: [] });
      setImportResults({ success: 0, failed: 0, errors: [] });
   };

   return (
      <div className="space-y-6">
         {/* Step 1: Upload */}
         {step === 'upload' && (
            <>
               {/* Instructions Card */}
               <div className="bg-white rounded shadow-sm">
                  <div className="p-4 border-b border-gray-100 flex items-center gap-2">
                     <FileSpreadsheet className="w-5 h-5 text-[#41cac0]" />
                     <span className="font-semibold text-gray-600">Import Products from Excel / CSV</span>
                  </div>
                  <div className="p-6 space-y-4">
                     <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="text-sm font-bold text-blue-800 mb-2">📋 Instructions</h4>
                        <ul className="text-xs text-blue-700 space-y-1">
                           <li>• Supported formats: <strong>.xlsx, .xls, .csv, .tsv</strong></li>
                           <li>• The first row must contain column headers</li>
                           <li>• Required columns: <strong>Product Name</strong> and <strong>SKU Code</strong></li>
                           <li>• Category and Brand names will be auto-created if they don't exist</li>
                           <li>• If a product with the same SKU code already exists, it will be <strong>updated</strong></li>
                           <li>• Images can be provided as comma-separated URLs</li>
                           <li>• Specifications should be in JSON format: <code className="bg-blue-100 px-1 rounded">{'{"weight":"500g"}'}</code></li>
                        </ul>
                     </div>

                     <div className="flex gap-4">
                        <button onClick={downloadTemplate} className="flex items-center gap-2 bg-[#41cac0] text-white px-5 py-2.5 rounded text-sm font-semibold hover:bg-[#3ab5ac] transition-colors">
                           <Download className="w-4 h-4" /> Download Template
                        </button>
                     </div>

                     {/* Drop Zone */}
                     <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:border-[#41cac0] hover:bg-[#f8fffe] transition-all group"
                     >
                        <Upload className="w-12 h-12 text-gray-300 group-hover:text-[#41cac0] mx-auto mb-4 transition-colors" />
                        <p className="text-sm font-semibold text-gray-500 group-hover:text-gray-700">Click to select a file or drag and drop</p>
                        <p className="text-xs text-gray-400 mt-1">.xlsx, .xls, .csv, .tsv files accepted</p>
                     </div>
                     <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv,.tsv" className="hidden" onChange={handleFileSelect} />
                  </div>
               </div>

               {/* Supported Columns Reference */}
               <div className="bg-white rounded shadow-sm">
                  <div className="p-4 border-b border-gray-100 font-semibold text-gray-600">Supported Columns</div>
                  <div className="p-4">
                     <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {dbFields.map(f => (
                           <div key={f.key} className={`p-3 rounded-lg border text-xs ${f.required ? 'border-red-200 bg-red-50' : 'border-gray-100 bg-gray-50'}`}>
                              <span className="font-bold text-gray-700">{f.label}</span>
                              {f.required && <span className="text-red-500 ml-1 text-[10px]">*required</span>}
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </>
         )}

         {/* Step 2: Preview & Map Columns */}
         {step === 'preview' && (
            <>
               <div className="bg-white rounded shadow-sm">
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <FileSpreadsheet className="w-5 h-5 text-[#41cac0]" />
                        <span className="font-semibold text-gray-600">File: {fileName}</span>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{sheetData.length} rows</span>
                     </div>
                     <button onClick={resetImporter} className="text-gray-400 hover:text-gray-600 text-sm">
                        <RefreshCw className="w-4 h-4" />
                     </button>
                  </div>
                  <div className="p-6 space-y-6">
                     {/* Column Mapping */}
                     <div>
                        <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                           <span className="w-6 h-6 bg-[#ff6c60] text-white rounded-full flex items-center justify-center text-[10px] font-black">1</span>
                           Map Excel Columns to Product Fields
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                           {dbFields.map(field => (
                              <div key={field.key} className={`p-3 rounded-lg border ${field.required ? 'border-amber-200 bg-amber-50' : 'border-gray-100 bg-gray-50'}`}>
                                 <label className="block text-[10px] text-gray-500 mb-1 uppercase font-bold">
                                    {field.label} {field.required && <span className="text-red-500">*</span>}
                                 </label>
                                 <select
                                    value={columnMapping[field.key] || ''}
                                    onChange={e => handleMappingChange(field.key, e.target.value)}
                                    className="w-full border border-gray-200 p-1.5 rounded text-xs focus:border-[#41cac0] outline-none"
                                 >
                                    <option value="">-- Skip --</option>
                                    {headers.map(h => (
                                       <option key={h} value={h}>{h}</option>
                                    ))}
                                 </select>
                              </div>
                           ))}
                        </div>
                     </div>

                     {/* Data Preview */}
                     <div>
                        <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                           <span className="w-6 h-6 bg-[#41cac0] text-white rounded-full flex items-center justify-center text-[10px] font-black">2</span>
                           Data Preview (first 5 rows)
                        </h3>
                        <div className="overflow-x-auto rounded-lg border border-gray-200">
                           <table className="w-full text-left text-xs">
                              <thead>
                                 <tr className="bg-gray-100">
                                    <th className="p-2 text-gray-500 font-bold border-b">#</th>
                                    {headers.map(h => (
                                       <th key={h} className="p-2 text-gray-500 font-bold border-b whitespace-nowrap">{h}</th>
                                    ))}
                                 </tr>
                              </thead>
                              <tbody>
                                 {sheetData.slice(0, 5).map((row, i) => (
                                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                                       <td className="p-2 text-gray-400">{i + 1}</td>
                                       {headers.map(h => (
                                          <td key={h} className="p-2 text-gray-600 max-w-[200px] truncate">{row[h]}</td>
                                       ))}
                                    </tr>
                                 ))}
                              </tbody>
                           </table>
                        </div>
                     </div>

                     {/* Action Buttons */}
                     <div className="flex gap-3 pt-2">
                        <button onClick={startImport} className="bg-[#a9d86e] text-white px-8 py-2.5 rounded text-sm font-semibold hover:bg-[#8ebc5a] transition-colors flex items-center gap-2">
                           <Upload className="w-4 h-4" /> Start Import ({sheetData.length} rows)
                        </button>
                        <button onClick={resetImporter} className="bg-gray-100 text-gray-500 px-6 py-2.5 rounded text-sm hover:bg-gray-200 transition-colors">
                           Cancel
                        </button>
                     </div>
                  </div>
               </div>
            </>
         )}

         {/* Step 3: Importing Progress */}
         {step === 'importing' && (
            <div className="bg-white rounded shadow-sm">
               <div className="p-4 border-b border-gray-100 font-semibold text-gray-600 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-[#41cac0]" />
                  Importing Products...
               </div>
               <div className="p-8 space-y-6">
                  <div className="text-center">
                     <div className="text-4xl font-bold text-[#41cac0] mb-2">
                        {importProgress.current} / {importProgress.total}
                     </div>
                     <p className="text-sm text-gray-500">Products processed</p>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                     <div
                        className="h-full bg-gradient-to-r from-[#41cac0] to-[#a9d86e] rounded-full transition-all duration-300"
                        style={{ width: `${importProgress.total > 0 ? (importProgress.current / importProgress.total) * 100 : 0}%` }}
                     />
                  </div>

                  {importProgress.errors.length > 0 && (
                     <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="text-xs font-bold text-red-700 mb-1">Errors ({importProgress.errors.length})</div>
                        <div className="max-h-32 overflow-y-auto space-y-1">
                           {importProgress.errors.map((err, i) => (
                              <div key={i} className="text-[10px] text-red-600">Row {err.row}: {err.message}</div>
                           ))}
                        </div>
                     </div>
                  )}
               </div>
            </div>
         )}

         {/* Step 4: Done */}
         {step === 'done' && (
            <div className="bg-white rounded shadow-sm">
               <div className="p-4 border-b border-gray-100 font-semibold text-gray-600 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-[#a9d86e]" />
                  Import Complete
               </div>
               <div className="p-8 space-y-6">
                  <div className="grid grid-cols-2 gap-6 max-w-md mx-auto">
                     <div className="text-center p-6 bg-green-50 rounded-xl border border-green-200">
                        <div className="text-3xl font-bold text-green-600 mb-1">{importResults.success}</div>
                        <p className="text-xs font-bold text-green-700 uppercase tracking-wide">Successful</p>
                     </div>
                     <div className="text-center p-6 bg-red-50 rounded-xl border border-red-200">
                        <div className="text-3xl font-bold text-red-600 mb-1">{importResults.failed}</div>
                        <p className="text-xs font-bold text-red-700 uppercase tracking-wide">Failed</p>
                     </div>
                  </div>

                  {importResults.errors.length > 0 && (
                     <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h4 className="text-sm font-bold text-red-800 mb-2 flex items-center gap-1">
                           <AlertCircle className="w-4 h-4" /> Error Details
                        </h4>
                        <div className="max-h-48 overflow-y-auto space-y-1">
                           {importResults.errors.map((err, i) => (
                              <div key={i} className="text-xs text-red-600 flex gap-2">
                                 <span className="font-bold whitespace-nowrap">Row {err.row}:</span>
                                 <span>{err.message}</span>
                              </div>
                           ))}
                        </div>
                     </div>
                  )}

                  <div className="flex justify-center gap-3 pt-4">
                     <button onClick={resetImporter} className="bg-[#41cac0] text-white px-8 py-2.5 rounded text-sm font-semibold hover:bg-[#3ab5ac] transition-colors flex items-center gap-2">
                        <Upload className="w-4 h-4" /> Import Another File
                     </button>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

export default AdminDashboard;
