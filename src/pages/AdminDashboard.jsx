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
} from 'lucide-react';
import OrderManager from '../components/admin/OrderManager';
import InventoryManager from '../components/admin/InventoryManager';
import ProcurementManager from '../components/admin/ProcurementManager';
import CrmManager from '../components/admin/CrmManager';
import MarketingManager from '../components/admin/MarketingManager';
import SettingsManager from '../components/admin/SettingsManager';
import ArticleManager from '../components/admin/ArticleManager';
import { FileText } from 'lucide-react';

const AdminDashboard = ({ navigate, setIsAdmin }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({ users: 0, products: 0, categories: 0, brands: 0 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedDateRange, setSelectedDateRange] = useState('May 12 – May 18, 2024');

  useEffect(() => {
    setIsAdmin(true);
    const fetchStats = async () => {
      try {
        if (window.electronAPI && typeof window.electronAPI.query === 'function') {
          const u = await window.electronAPI.query('SELECT COUNT(*) as count FROM users');
          const p = await window.electronAPI.query('SELECT COUNT(*) as count FROM products');
          const c = await window.electronAPI.query('SELECT COUNT(*) as count FROM categories');
          const b = await window.electronAPI.query('SELECT COUNT(*) as count FROM brands');
          setStats({ users: u?.[0]?.count || 32, products: p?.[0]?.count || 120, categories: c?.[0]?.count || 18, brands: b?.[0]?.count || 8 });
        } else {
          setStats({ users: 32, products: 120, categories: 18, brands: 8 });
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  const handleLogout = () => {
    setIsAdmin(false);
    navigate('home');
  };

  const SidebarItem = ({ id, icon: Icon, label, badge }) => {
    const isActive = activeTab === id;
    return (
      <button
        onClick={() => setActiveTab(id)}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all text-xs font-medium ${
          isActive
            ? 'bg-[#144349] text-white shadow-sm'
            : 'text-[#8daab0] hover:text-white hover:bg-[#10373d]'
        }`}
      >
        <div className="flex items-center gap-3">
          <Icon className={`w-4 h-4 ${isActive ? 'text-[#ff6b2b]' : 'text-[#729299]'}`} />
          <span>{label}</span>
        </div>
        {badge && (
          <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-[#ff6b2b] text-white">
            {badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="flex h-screen bg-[#f3f6f8] text-gray-800 font-sans antialiased selection:bg-[#ff6b2b] selection:text-white">
      {/* ADNEX Dark Teal Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? 'w-64' : 'w-0 overflow-hidden'
        } bg-[#0c2b2f] flex flex-col transition-all duration-300 z-30 shrink-0 border-r border-[#133d42]`}
      >
        {/* Brand Logo Header */}
        <div className="h-20 flex items-center px-6 gap-3 border-b border-[#133d42]/60">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#ff5500] to-[#ff8c42] flex items-center justify-center shadow-lg shadow-orange-950/40">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-white fill-current">
              <path d="M12 2L2 19.5h20L12 2zm0 4.5l6.5 11h-13L12 6.5z" />
            </svg>
          </div>
          <div>
            <div className="text-white text-lg font-black tracking-wider flex items-center gap-1">
              ADNEX <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#ff6b2b]/20 text-[#ff8c42] font-semibold tracking-normal border border-[#ff6b2b]/30">PRO</span>
            </div>
            <div className="text-[10px] text-[#6d8e94] font-medium tracking-wide">Automotive Commerce</div>
          </div>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 px-4 py-5 overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-[#16474e]">
          <div className="px-3 pb-2 text-[10px] uppercase text-[#61858c] font-bold tracking-wider">Main Analytics</div>
          <SidebarItem id="dashboard" icon={LayoutDashboard} label="Overview" />
          <SidebarItem id="marketing" icon={Megaphone} label="Campaigns & Ads" />
          <SidebarItem id="crm" icon={UserCheck} label="Audience & CRM" />
          <SidebarItem id="orders" icon={ShoppingBag} label="Reports & Orders" />

          <div className="px-3 pt-5 pb-2 text-[10px] uppercase text-[#61858c] font-bold tracking-wider">Commerce & Supply</div>
          <SidebarItem id="inventory" icon={Warehouse} label="Inventory & Stock" />
          <SidebarItem id="procurement" icon={Truck} label="Procurement & POs" />
          <SidebarItem id="products" icon={Package} label="Catalog Products" />
          <SidebarItem id="import" icon={FileSpreadsheet} label="Import Data" />

          <div className="px-3 pt-5 pb-2 text-[10px] uppercase text-[#61858c] font-bold tracking-wider">Vehicle & Setup</div>
          <SidebarItem id="categories" icon={Layers} label="Categories" />
          <SidebarItem id="brands" icon={Tag} label="Brands" />
          <SidebarItem id="car-brands" icon={Car} label="Car Brands" />
          <SidebarItem id="car-models" icon={Sliders} label="Car Models" />
          <SidebarItem id="car-years" icon={Calendar} label="Car Years" />

          <div className="px-3 pt-5 pb-2 text-[10px] uppercase text-[#61858c] font-bold tracking-wider">Access & Admin</div>
          <SidebarItem id="settings" icon={Settings} label="System & Payment API" badge="NEW" />
          <SidebarItem id="articles" icon={FileText} label="Article CMS" />
          <SidebarItem id="members" icon={Users} label="Members" />
          <SidebarItem id="admins" icon={Shield} label="Administrators" />
        </nav>

        {/* Pro Plan Card */}
        <div className="p-4 border-t border-[#133d42]/60">
          <div className="bg-[#081e21] rounded-2xl p-4 border border-[#174e54]/50 relative overflow-hidden shadow-inner">
            <div className="w-8 h-8 rounded-xl bg-[#ff6b2b]/15 text-[#ff8c42] flex items-center justify-center mb-2.5 border border-[#ff6b2b]/30">
              <Rocket className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-white mb-1">Unlock more with Pro Plan</h4>
            <p className="text-[11px] text-[#71969d] mb-3 leading-relaxed">
              Get advanced insights, export reports and automated marketing.
            </p>
            <button
              onClick={() => setActiveTab('marketing')}
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#ff5500] to-[#ff7324] hover:from-[#e04b00] hover:to-[#ff5500] text-white text-xs font-bold transition-all shadow-md shadow-orange-950/40 flex items-center justify-center gap-1.5"
            >
              <span>Upgrade Now</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* User Profile Bar */}
        <div className="p-4 border-t border-[#133d42]/60 flex items-center justify-between bg-[#081e21]/60">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-[#164e54] text-white flex items-center justify-center font-bold text-xs border border-[#2dd4bf]/40">
                JD
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#2dd4bf] border-2 border-[#0c2b2f]"></span>
            </div>
            <div className="truncate">
              <div className="text-xs font-bold text-white truncate">John Doe</div>
              <div className="text-[10px] text-[#72979e] truncate">john.doe@adnex.com</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="p-1.5 rounded-lg text-[#72979e] hover:text-[#ff6b2b] hover:bg-[#10373d] transition-all"
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
              className="p-2 rounded-xl text-gray-500 hover:text-[#0c2b2f] hover:bg-gray-100 transition-all"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                Welcome back, John! 👋
              </h1>
              <p className="text-xs text-gray-500">Here's what's happening with your ad campaigns and commerce platform.</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            {/* Date Range Selector Pill */}
            <div className="flex items-center gap-2 bg-white border border-gray-200/90 rounded-xl px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-sm hover:border-gray-300 transition-all cursor-pointer">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span>{selectedDateRange}</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 ml-1" />
            </div>

            {/* Export Report Action */}
            <button
              onClick={() => alert('Exporting ad campaigns & performance report (CSV/PDF)...')}
              className="flex items-center gap-2 bg-[#0c2b2f] hover:bg-[#071f22] text-white rounded-xl px-4 py-2 text-xs font-semibold shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5 text-[#2dd4bf]" />
              <span>Export Report</span>
            </button>

            {/* View Storefront */}
            <button
              onClick={() => {
                setIsAdmin(false);
                navigate('home');
              }}
              className="flex items-center gap-2 bg-white border border-gray-200 hover:border-[#ff6b2b] hover:text-[#ff6b2b] text-gray-700 rounded-xl px-4 py-2 text-xs font-semibold shadow-sm transition-all"
            >
              <Eye className="w-3.5 h-3.5 text-[#ff6b2b]" />
              <span>Storefront</span>
            </button>
          </div>
        </header>

        {/* Page Content Scrollable Area */}
        <main className="flex-1 overflow-y-auto p-8 bg-[#f3f6f8] space-y-8">
          {activeTab === 'dashboard' && <AdnexDashboardOverview stats={stats} setActiveTab={setActiveTab} />}
          {activeTab === 'orders' && <OrderManager />}
          {activeTab === 'crm' && <CrmManager />}
          {activeTab === 'marketing' && <MarketingManager />}
          {activeTab === 'inventory' && <InventoryManager />}
          {activeTab === 'procurement' && <ProcurementManager />}
          {activeTab === 'categories' && <EntityManager table="categories" title="Category" fields={['name', 'image_url']} />}
          {activeTab === 'brands' && <EntityManager table="brands" title="Brand" fields={['name', 'image_url']} />}
          {activeTab === 'car-brands' && <EntityManager table="car_brands" title="Car Brand" fields={['name', 'image_url']} />}
          {activeTab === 'car-models' && <CarModelManager />}
          {activeTab === 'car-years' && <EntityManager table="car_years" title="Car Year" fields={['year']} />}
          {activeTab === 'products' && <ProductManager />}
          {activeTab === 'import' && <ExcelImporter />}
          {activeTab === 'settings' && <SettingsManager />}
          {activeTab === 'articles' && <ArticleManager />}
          {activeTab === 'members' && <EntityManager table="users" title="Member" fields={['first_name', 'last_name', 'email', 'business_type']} />}
          {activeTab === 'admins' && <EntityManager table="admins" title="Admin" fields={['username', 'role']} />}
        </main>
      </div>
    </div>
  );
};

/**
 * ADNEX-style Dashboard Overview Component matching the user reference design
 */
const AdnexDashboardOverview = ({ stats, setActiveTab }) => {
  return (
    <div className="space-y-6">
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
          <div className="w-11 h-11 rounded-2xl bg-[#0c2b2f] text-[#2dd4bf] flex items-center justify-center shrink-0 shadow-sm">
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
          <div className="w-11 h-11 rounded-2xl bg-[#ff6b2b] text-white flex items-center justify-center shrink-0 shadow-md shadow-orange-500/20">
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
          <div className="w-11 h-11 rounded-2xl bg-[#082226] text-[#34d399] flex items-center justify-center shrink-0 shadow-sm">
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
          <div className="w-11 h-11 rounded-2xl bg-[#ff5500] text-white flex items-center justify-center shrink-0 shadow-md shadow-orange-500/20">
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
                <div className="w-9 h-9 rounded-xl bg-[#0c2b2f] text-[#2dd4bf] flex items-center justify-center">
                  <Monitor className="w-4 h-4" />
                </div>
                <span className="font-bold text-sm text-gray-900">Banner Ads</span>
              </div>
              <button
                onClick={() => setActiveTab('marketing')}
                className="text-xs font-semibold text-[#0c2b2f] hover:text-[#ff6b2b] flex items-center gap-1 transition-colors"
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
                    <stop offset="0%" stopColor="#0c2b2f" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#0c2b2f" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M 0,65 Q 40,75 75,55 T 150,60 T 225,45 T 300,30 L 300,100 L 0,100 Z"
                  fill="url(#tealGradient)"
                />
                <path
                  d="M 0,65 Q 40,75 75,55 T 150,60 T 225,45 T 300,30"
                  fill="none"
                  stroke="#0c2b2f"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle cx="75" cy="55" r="3" fill="#0c2b2f" />
                <circle cx="150" cy="60" r="3" fill="#0c2b2f" />
                <circle cx="225" cy="45" r="3" fill="#0c2b2f" />
                <circle cx="300" cy="30" r="3.5" fill="#2dd4bf" stroke="#0c2b2f" strokeWidth="2" />
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
              <span className="font-semibold text-[#0c2b2f] hover:underline cursor-pointer">Summer Sale Banner</span>
            </div>
          </div>
        </div>

        {/* Channel 2: Login Ads (Orange) */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#ff6b2b] text-white flex items-center justify-center">
                  <LogIn className="w-4 h-4" />
                </div>
                <span className="font-bold text-sm text-gray-900">Login Ads</span>
              </div>
              <button
                onClick={() => setActiveTab('marketing')}
                className="text-xs font-semibold text-[#ff6b2b] hover:text-[#e04b00] flex items-center gap-1 transition-colors"
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
                    <stop offset="0%" stopColor="#ff6b2b" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#ff6b2b" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M 0,70 Q 50,85 100,65 T 200,55 T 300,40 L 300,100 L 0,100 Z"
                  fill="url(#orangeGradient)"
                />
                <path
                  d="M 0,70 Q 50,85 100,65 T 200,55 T 300,40"
                  fill="none"
                  stroke="#ff6b2b"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle cx="100" cy="65" r="3" fill="#ff6b2b" />
                <circle cx="200" cy="55" r="3" fill="#ff6b2b" />
                <circle cx="300" cy="40" r="3.5" fill="#ff8c42" stroke="#ff5500" strokeWidth="2" />
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
              <span className="font-semibold text-[#ff6b2b] hover:underline cursor-pointer">Login Fest May</span>
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
                className="text-xs font-semibold text-[#097969] hover:text-[#0c2b2f] flex items-center gap-1 transition-colors"
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
                    <span className="w-2.5 h-2.5 rounded-full bg-[#0c2b2f]"></span>
                    <span className="text-gray-600 font-medium">Banner Ads</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ff6b2b]"></span>
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
                  stroke="#0c2b2f"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <circle cx="60" cy="135" r="4" fill="#0c2b2f" />
                <circle cx="140" cy="142" r="4" fill="#0c2b2f" />
                <circle cx="220" cy="120" r="4" fill="#0c2b2f" />
                <circle cx="300" cy="115" r="4" fill="#0c2b2f" />
                <circle cx="380" cy="100" r="4" fill="#0c2b2f" />
                <circle cx="480" cy="95" r="4" fill="#0c2b2f" />
                <circle cx="570" cy="60" r="5" fill="#2dd4bf" stroke="#0c2b2f" strokeWidth="2.5" />

                {/* Line 2: Login Ads (Orange) */}
                <path
                  d="M 60,150 Q 140,165 220,148 T 380,130 T 480,138 T 570,110"
                  fill="none"
                  stroke="#ff6b2b"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle cx="60" cy="150" r="3.5" fill="#ff6b2b" />
                <circle cx="140" cy="160" r="3.5" fill="#ff6b2b" />
                <circle cx="220" cy="148" r="3.5" fill="#ff6b2b" />
                <circle cx="300" cy="152" r="3.5" fill="#ff6b2b" />
                <circle cx="380" cy="130" r="3.5" fill="#ff6b2b" />
                <circle cx="480" cy="138" r="3.5" fill="#ff6b2b" />
                <circle cx="570" cy="110" r="4" fill="#ff8c42" stroke="#ff5500" strokeWidth="2" />

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
                    stroke="#0c2b2f"
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
                    stroke="#ff6b2b"
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
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0c2b2f]"></span>
                  <span>Banner Ads</span>
                </div>
                <span className="font-bold text-gray-900">12.45M (50.5%)</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-medium text-gray-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ff6b2b]"></span>
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
              className="text-xs font-bold text-[#0c2b2f] hover:text-[#ff6b2b] flex items-center justify-center gap-1.5 w-full py-2 bg-gray-50 hover:bg-orange-50/50 rounded-xl transition-all"
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

const EntityManager = ({ table, title, fields = ['name'] }) => {
   const [items, setItems] = useState([]);
   const [editId, setEditId] = useState(null);
   const [formData, setFormData] = useState({});

   const fetchItems = async () => {
      try {
         const res = await window.electronAPI.query(`SELECT * FROM ${table}`);
         setItems(res);
      } catch (err) { console.error(err); }
   };

   useEffect(() => { fetchItems(); }, []);

   const handleSave = async () => {
      try {
         if (editId) {
            const setClause = fields.map(f => `${f} = ?`).join(', ');
            const params = fields.map(f => formData[f]);
            await window.electronAPI.query(`UPDATE ${table} SET ${setClause} WHERE id = ?`, [...params, editId]);
         } else {
            const cols = fields.join(', ');
            const placeholders = fields.map(() => '?').join(', ');
            const params = fields.map(f => formData[f]);
            await window.electronAPI.query(`INSERT INTO ${table} (${cols}) VALUES (${placeholders})`, params);
         }
         setEditId(null);
         setFormData({});
         fetchItems();
      } catch (err) { console.error(err); }
   };

   const handleDelete = async (id) => {
      if (confirm('Are you sure you want to delete this?')) {
         await window.electronAPI.query(`DELETE FROM ${table} WHERE id = ?`, [id]);
         fetchItems();
      }
   };

   return (
      <div className="space-y-6">
         <div className="bg-white rounded shadow-sm">
            <div className="p-4 border-b border-gray-100 font-semibold text-gray-600">{editId ? 'Edit' : 'Add New'} {title}</div>
            <div className="p-6 flex flex-wrap gap-4 items-end">
               {fields.map(f => {
                  if (f === 'image_url') {
                     return (
                        <div key={f} className="flex-1 min-w-[200px]">
                           <label className="block text-xs text-gray-400 mb-1 uppercase font-bold">{f.replace('_', ' ')}</label>
                           <div className="flex items-center gap-3 mt-1">
                              {formData[f] ? (
                                 <div className="relative w-12 h-12 rounded border border-gray-200 overflow-hidden group">
                                    <img src={formData[f]} alt="Uploaded" className="w-full h-full object-cover" />
                                    <button
                                       type="button"
                                       onClick={() => setFormData({ ...formData, [f]: '' })}
                                       className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[8px] opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                       <X className="w-2.5 h-2.5" />
                                    </button>
                                 </div>
                              ) : (
                                 <label className="w-12 h-12 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center text-gray-400 hover:text-[#41cac0] hover:border-[#41cac0] transition-colors cursor-pointer">
                                    <Upload className="w-4 h-4" />
                                    <input
                                       type="file"
                                       accept="image/*"
                                       className="hidden"
                                       onChange={e => {
                                          const file = e.target.files[0];
                                          if (file) {
                                             const reader = new FileReader();
                                             reader.onload = (ev) => {
                                                setFormData({ ...formData, [f]: ev.target.result });
                                             };
                                             reader.readAsDataURL(file);
                                          }
                                       }}
                                    />
                                 </label>
                              )}
                              <span className="text-xs text-gray-400">
                                 {formData[f] ? 'Click X to remove image' : 'Upload PNG/JPG'}
                              </span>
                           </div>
                        </div>
                     );
                  }
                  return (
                     <div key={f} className="flex-1 min-w-[200px]">
                        <label className="block text-xs text-gray-400 mb-1 uppercase font-bold">{f.replace('_', ' ')}</label>
                        <input
                           type="text"
                           className="w-full border border-gray-200 p-2 rounded text-sm focus:border-[#41cac0] outline-none"
                           value={formData[f] || ''}
                           onChange={e => setFormData({ ...formData, [f]: e.target.value })}
                        />
                     </div>
                  );
               })}
               <div className="flex items-end gap-2 pb-1">
                  <button onClick={handleSave} className="bg-[#a9d86e] text-white px-6 py-2 rounded text-sm font-semibold hover:bg-[#8ebc5a] transition-colors">
                     {editId ? 'Update' : 'Save'}
                  </button>
                  {editId && <button onClick={() => { setEditId(null); setFormData({}); }} className="bg-gray-100 text-gray-500 px-4 py-2 rounded text-sm">Cancel</button>}
               </div>
            </div>
         </div>

         <div className="bg-white rounded shadow-sm overflow-hidden">
            <table className="w-full text-left">
               <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                     <th className="p-4 text-xs font-bold text-gray-500 uppercase">ID</th>
                     {fields.map(f => <th key={f} className="p-4 text-xs font-bold text-gray-500 uppercase">{f.replace('_', ' ')}</th>)}
                     <th className="p-4 text-xs font-bold text-gray-500 uppercase text-right">Action</th>
                  </tr>
               </thead>
               <tbody>
                  {items.map(item => (
                     <tr key={item.id} className="border-b border-gray-50 last:border-none hover:bg-gray-50 transition-colors">
                        <td className="p-4 text-sm text-gray-400">#{item.id}</td>
                        {fields.map(f => (
                           <td key={f} className="p-4 text-sm text-gray-600">
                              {f === 'image_url' ? (
                                 item[f] ? (
                                    <img src={item[f]} alt="logo" className="w-10 h-10 object-contain rounded border bg-white" />
                                 ) : (
                                    <span className="text-gray-300 text-xs font-normal italic">No image</span>
                                 )
                              ) : (
                                 item[f]
                              )}
                           </td>
                        ))}
                        <td className="p-4 text-right">
                           <button onClick={() => { setEditId(item.id); setFormData(item); }} className="text-blue-400 hover:text-blue-600 p-1 mr-2"><Edit className="w-4 h-4" /></button>
                           <button onClick={() => handleDelete(item.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 className="w-4 h-4" /></button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
   );
};

const ProductManager = () => {
   const [products, setProducts] = useState([]);
   const [categories, setCategories] = useState([]);
   const [brands, setBrands] = useState([]);
   const [carBrands, setCarBrands] = useState([]);
   const [availableModels, setAvailableModels] = useState([]);
   const [carYears, setCarYears] = useState([]);

   const [editId, setEditId] = useState(null);
   const [formData, setFormData] = useState({
      name: '', code: '', description: '', car_brand: '', car_model: '', car_year: '',
      category_id: '', brand_id: '', price_general: 0, price_garage: 0, price_shop: 0,
      specifications: '', cross_references: '', images: ''
   });
   const [imageFiles, setImageFiles] = useState([]);
   const imageInputRef = useRef(null);

   // Search & Pagination states
   const [searchQuery, setSearchQuery] = useState('');
   const [filterCategory, setFilterCategory] = useState('');
   const [filterBrand, setFilterBrand] = useState('');
   const [filterCarBrand, setFilterCarBrand] = useState('');
   const [page, setPage] = useState(1);
   const [limit, setLimit] = useState(25);
   const [totalProducts, setTotalProducts] = useState(0);

   const fetchLookups = async () => {
      try {
         const cats = await window.electronAPI.query('SELECT * FROM categories ORDER BY name ASC');
         const brs = await window.electronAPI.query('SELECT * FROM brands ORDER BY name ASC');
         const cbrs = await window.electronAPI.query('SELECT * FROM car_brands ORDER BY name ASC');
         const yrs = await window.electronAPI.query('SELECT * FROM car_years ORDER BY year DESC');
         setCategories(cats);
         setBrands(brs);
         setCarBrands(cbrs);
         setCarYears(yrs);
      } catch (err) { console.error(err); }
   };

   const fetchModelsForBrand = async (brandName) => {
      if (!brandName) {
         setAvailableModels([]);
         return;
      }
      try {
         const brand = await window.electronAPI.query('SELECT id FROM car_brands WHERE name = ?', [brandName]);
         if (brand && brand.length > 0) {
            const models = await window.electronAPI.query('SELECT * FROM car_models WHERE car_brand_id = ? ORDER BY name ASC', [brand[0].id]);
            setAvailableModels(models);
         } else {
            setAvailableModels([]);
         }
      } catch (err) { console.error(err); }
   };

   const fetchProducts = async () => {
      try {
         let whereClause = 'WHERE 1=1';
         const params = [];

         if (searchQuery.trim()) {
            whereClause += ' AND (p.name LIKE ? OR p.code LIKE ?)';
            params.push(`%${searchQuery.trim()}%`, `%${searchQuery.trim()}%`);
         }
         if (filterCategory) {
            whereClause += ' AND p.category_id = ?';
            params.push(filterCategory);
         }
         if (filterBrand) {
            whereClause += ' AND p.brand_id = ?';
            params.push(filterBrand);
         }
         if (filterCarBrand) {
            whereClause += ' AND p.car_brand = ?';
            params.push(filterCarBrand);
         }

         const countRes = await window.electronAPI.query(`SELECT COUNT(*) as count FROM products p ${whereClause}`, params);
         const total = countRes[0]?.count || 0;
         setTotalProducts(total);

         const offset = (page - 1) * limit;
         const p = await window.electronAPI.query(`
            SELECT p.*, c.name as cat_name, b.name as brand_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id 
            LEFT JOIN brands b ON p.brand_id = b.id 
            ${whereClause} 
            ORDER BY p.id DESC 
            LIMIT ? OFFSET ?
         `, [...params, limit, offset]);
         setProducts(p);
      } catch (err) { console.error(err); }
   };

   useEffect(() => {
      fetchLookups();
   }, []);

   useEffect(() => {
      fetchProducts();
   }, [searchQuery, filterCategory, filterBrand, filterCarBrand, page, limit]);

   const handleImageUpload = (e) => {
      const files = Array.from(e.target.files);
      const readers = files.map(file => {
         return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (ev) => resolve(ev.target.result);
            reader.readAsDataURL(file);
         });
      });
      Promise.all(readers).then(results => {
         setImageFiles(prev => [...prev, ...results]);
         const allImages = [...imageFiles, ...results];
         setFormData(prev => ({ ...prev, images: JSON.stringify(allImages) }));
      });
   };

   const removeImage = (index) => {
      const updated = imageFiles.filter((_, i) => i !== index);
      setImageFiles(updated);
      setFormData(prev => ({ ...prev, images: JSON.stringify(updated) }));
   };

   const handleSave = async () => {
      try {
         if (editId) {
            await window.electronAPI.query(
               'UPDATE products SET name=?, code=?, description=?, car_brand=?, car_model=?, car_year=?, category_id=?, brand_id=?, price_general=?, price_garage=?, price_shop=?, specifications=?, cross_references=?, images=? WHERE id=?',
               [formData.name, formData.code, formData.description || '', formData.car_brand, formData.car_model || '', formData.car_year || '',
                formData.category_id, formData.brand_id, formData.price_general, formData.price_garage, formData.price_shop,
                formData.specifications || '', formData.cross_references || '', formData.images || '', editId]
            );
         } else {
            await window.electronAPI.query(
               'INSERT INTO products (name, code, description, car_brand, car_model, car_year, category_id, brand_id, price_general, price_garage, price_shop, specifications, cross_references, images) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
               [formData.name, formData.code, formData.description || '', formData.car_brand, formData.car_model || '', formData.car_year || '',
                formData.category_id, formData.brand_id, formData.price_general, formData.price_garage, formData.price_shop,
                formData.specifications || '', formData.cross_references || '', formData.images || '']
            );
         }
         setEditId(null);
         setFormData({
            name: '', code: '', description: '', car_brand: '', car_model: '', car_year: '',
            category_id: '', brand_id: '', price_general: 0, price_garage: 0, price_shop: 0,
            specifications: '', cross_references: '', images: ''
         });
         setImageFiles([]);
         setAvailableModels([]);
         fetchProducts();
      } catch (err) { console.error(err); }
   };

   const handleEdit = (p) => {
      setEditId(p.id);
      setFormData(p);
      if (p.car_brand) {
         fetchModelsForBrand(p.car_brand);
      } else {
         setAvailableModels([]);
      }
      try {
         const imgs = JSON.parse(p.images || '[]');
         setImageFiles(imgs);
      } catch {
         setImageFiles([]);
      }
   };

   const handleDelete = async (id) => {
      if (confirm('Are you sure you want to delete this product?')) {
         await window.electronAPI.query('DELETE FROM products WHERE id = ?', [id]);
         fetchProducts();
      }
   };

   const totalPages = Math.ceil(totalProducts / limit) || 1;

   return (
      <div className="space-y-6">
         <div className="bg-white rounded shadow-sm">
            <div className="p-4 border-b border-gray-100 font-semibold text-gray-600">{editId ? 'Edit Product' : 'Add New Product'}</div>
            <div className="p-6 space-y-4">
               {/* Row 1: Name, Code, Description */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                     <label className="block text-xs text-gray-400 mb-1 uppercase font-bold">Product Name</label>
                     <input type="text" className="w-full border border-gray-200 p-2 rounded text-sm focus:border-[#41cac0] outline-none" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                  </div>
                  <div>
                     <label className="block text-xs text-gray-400 mb-1 uppercase font-bold">SKU Code</label>
                     <input type="text" className="w-full border border-gray-200 p-2 rounded text-sm focus:border-[#41cac0] outline-none" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} />
                  </div>
                  <div>
                     <label className="block text-xs text-gray-400 mb-1 uppercase font-bold">Description</label>
                     <input type="text" className="w-full border border-gray-200 p-2 rounded text-sm focus:border-[#41cac0] outline-none" value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                  </div>
               </div>

               {/* Row 2: Car Brand, Model, Year */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                     <label className="block text-xs text-gray-400 mb-1 uppercase font-bold">Car Brand</label>
                     <select
                        className="w-full border border-gray-200 p-2 rounded text-sm focus:border-[#41cac0] outline-none"
                        value={formData.car_brand || ''}
                        onChange={e => {
                           const brandVal = e.target.value;
                           setFormData({ ...formData, car_brand: brandVal, car_model: '' });
                           fetchModelsForBrand(brandVal);
                        }}
                     >
                        <option value="">Select Car Brand</option>
                        {carBrands.map(b => (
                           <option key={b.id} value={b.name}>{b.name}</option>
                        ))}
                     </select>
                  </div>
                  <div>
                     <label className="block text-xs text-gray-400 mb-1 uppercase font-bold">Car Model</label>
                     <select
                        className="w-full border border-gray-200 p-2 rounded text-sm focus:border-[#41cac0] outline-none"
                        value={formData.car_model || ''}
                        disabled={!formData.car_brand}
                        onChange={e => setFormData({ ...formData, car_model: e.target.value })}
                     >
                        <option value="">Select Car Model</option>
                        {availableModels.map(m => (
                           <option key={m.id} value={m.name}>{m.name}</option>
                        ))}
                     </select>
                  </div>
                  <div>
                     <label className="block text-xs text-gray-400 mb-1 uppercase font-bold">Car Year</label>
                     <select
                        className="w-full border border-gray-200 p-2 rounded text-sm focus:border-[#41cac0] outline-none"
                        value={formData.car_year || ''}
                        onChange={e => setFormData({ ...formData, car_year: e.target.value })}
                     >
                        <option value="">Select Car Year</option>
                        {carYears.map(y => (
                           <option key={y.id} value={y.year}>{y.year}</option>
                        ))}
                     </select>
                  </div>
               </div>

               {/* Row 3: Category, Brand, Prices */}
               <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                     <label className="block text-xs text-gray-400 mb-1 uppercase font-bold">Category</label>
                     <select className="w-full border border-gray-200 p-2 rounded text-sm focus:border-[#41cac0] outline-none" value={formData.category_id} onChange={e => setFormData({ ...formData, category_id: e.target.value })}>
                        <option value="">Select Category</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                  </div>
                  <div>
                     <label className="block text-xs text-gray-400 mb-1 uppercase font-bold">Brand</label>
                     <select className="w-full border border-gray-200 p-2 rounded text-sm focus:border-[#41cac0] outline-none" value={formData.brand_id} onChange={e => setFormData({ ...formData, brand_id: e.target.value })}>
                        <option value="">Select Brand</option>
                        {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                     </select>
                  </div>
                  <div>
                     <label className="block text-xs text-gray-400 mb-1 uppercase font-bold">General Price</label>
                     <input type="number" className="w-full border border-gray-200 p-2 rounded text-sm focus:border-[#41cac0] outline-none" value={formData.price_general} onChange={e => setFormData({ ...formData, price_general: Number(e.target.value) })} />
                  </div>
                  <div>
                     <label className="block text-xs text-gray-400 mb-1 uppercase font-bold">Garage Price</label>
                     <input type="number" className="w-full border border-gray-200 p-2 rounded text-sm focus:border-[#41cac0] outline-none" value={formData.price_garage} onChange={e => setFormData({ ...formData, price_garage: Number(e.target.value) })} />
                  </div>
                  <div>
                     <label className="block text-xs text-gray-400 mb-1 uppercase font-bold">Shop Price</label>
                     <input type="number" className="w-full border border-gray-200 p-2 rounded text-sm focus:border-[#41cac0] outline-none" value={formData.price_shop} onChange={e => setFormData({ ...formData, price_shop: Number(e.target.value) })} />
                  </div>
               </div>

               {/* Row 4: Specs, Cross-refs */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                     <label className="block text-xs text-gray-400 mb-1 uppercase font-bold">Specifications (JSON)</label>
                     <textarea rows="2" className="w-full border border-gray-200 p-2 rounded text-sm focus:border-[#41cac0] outline-none font-mono text-[11px]" placeholder='{"weight":"500g","material":"Steel"}' value={formData.specifications || ''} onChange={e => setFormData({ ...formData, specifications: e.target.value })} />
                  </div>
                  <div>
                     <label className="block text-xs text-gray-400 mb-1 uppercase font-bold">Cross References (JSON array)</label>
                     <textarea rows="2" className="w-full border border-gray-200 p-2 rounded text-sm focus:border-[#41cac0] outline-none font-mono text-[11px]" placeholder='["OEM-123","ALT-456"]' value={formData.cross_references || ''} onChange={e => setFormData({ ...formData, cross_references: e.target.value })} />
                  </div>
               </div>

               {/* Row 5: Image upload */}
               <div>
                  <label className="block text-xs text-gray-400 mb-1 uppercase font-bold">Product Images</label>
                  <div className="flex flex-wrap gap-3 items-center">
                     {imageFiles.map((img, i) => (
                        <div key={i} className="relative w-20 h-20 rounded border border-gray-200 overflow-hidden group">
                           <img src={img} alt={`Product ${i + 1}`} className="w-full h-full object-cover" />
                           <button onClick={() => removeImage(i)} className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">
                              <X className="w-3 h-3" />
                           </button>
                        </div>
                     ))}
                     <button onClick={() => imageInputRef.current?.click()} className="w-20 h-20 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center text-gray-400 hover:text-[#41cac0] hover:border-[#41cac0] transition-colors cursor-pointer">
                        <Image className="w-5 h-5" />
                        <span className="text-[8px] font-bold mt-1">ADD</span>
                     </button>
                     <input ref={imageInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                  </div>
               </div>

               {/* Save/Cancel */}
               <div className="flex items-end gap-2 pt-2">
                  <button onClick={handleSave} className="bg-[#a9d86e] text-white px-8 py-2 rounded text-sm font-semibold hover:bg-[#8ebc5a] transition-colors">
                     {editId ? 'Update' : 'Save Product'}
                  </button>
                  {editId && <button onClick={() => { setEditId(null); setFormData({ name: '', code: '', description: '', car_brand: '', car_model: '', car_year: '', category_id: '', brand_id: '', price_general: 0, price_garage: 0, price_shop: 0, specifications: '', cross_references: '', images: '' }); setImageFiles([]); setAvailableModels([]); }} className="bg-gray-100 text-gray-500 px-4 py-2 rounded text-sm">Cancel</button>}
               </div>
            </div>
         </div>

         {/* Advanced Filters & Search Bar */}
         <div className="bg-white rounded shadow-sm p-4 flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px] relative">
               <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
               <input
                  type="text"
                  placeholder="Search by name or SKU code..."
                  className="w-full border border-gray-200 pl-9 pr-3 py-2 rounded text-sm focus:border-[#41cac0] outline-none"
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
               />
            </div>
            <div className="w-[180px]">
               <select
                  className="w-full border border-gray-200 p-2 rounded text-sm focus:border-[#41cac0] outline-none"
                  value={filterCategory}
                  onChange={e => { setFilterCategory(e.target.value); setPage(1); }}
               >
                  <option value="">All Categories</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
               </select>
            </div>
            <div className="w-[180px]">
               <select
                  className="w-full border border-gray-200 p-2 rounded text-sm focus:border-[#41cac0] outline-none"
                  value={filterBrand}
                  onChange={e => { setFilterBrand(e.target.value); setPage(1); }}
               >
                  <option value="">All Brands</option>
                  {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
               </select>
            </div>
            <div className="w-[180px]">
               <select
                  className="w-full border border-gray-200 p-2 rounded text-sm focus:border-[#41cac0] outline-none"
                  value={filterCarBrand}
                  onChange={e => { setFilterCarBrand(e.target.value); setPage(1); }}
               >
                  <option value="">All Car Brands</option>
                  {carBrands.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
               </select>
            </div>
            {(searchQuery || filterCategory || filterBrand || filterCarBrand) && (
               <button
                  onClick={() => { setSearchQuery(''); setFilterCategory(''); setFilterBrand(''); setFilterCarBrand(''); setPage(1); }}
                  className="text-xs text-red-500 hover:underline"
               >
                  Clear Filters
               </button>
            )}
         </div>

         <div className="bg-white rounded shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
               <span className="text-xs text-gray-500 font-bold uppercase">Showing {products.length} of {totalProducts} Products</span>
               <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">Rows per page:</span>
                  <select
                     className="border border-gray-200 rounded p-1 text-xs outline-none"
                     value={limit}
                     onChange={e => { setLimit(Number(e.target.value)); setPage(1); }}
                  >
                     <option value={10}>10</option>
                     <option value={25}>25</option>
                     <option value={50}>50</option>
                     <option value={100}>100</option>
                  </select>
               </div>
            </div>

            <table className="w-full text-left">
               <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                     <th className="p-4 text-xs font-bold text-gray-500 uppercase">Product</th>
                     <th className="p-4 text-xs font-bold text-gray-500 uppercase">Details</th>
                     <th className="p-4 text-xs font-bold text-gray-500 uppercase">Prices</th>
                     <th className="p-4 text-xs font-bold text-gray-500 uppercase text-right">Action</th>
                  </tr>
               </thead>
               <tbody>
                  {products.map(p => (
                     <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="p-4">
                           <div className="font-bold text-gray-700">{p.name}</div>
                           <div className="text-xs text-gray-400">SKU: {p.code}</div>
                        </td>
                        <td className="p-4">
                           <div className="text-xs text-gray-600"><span className="font-bold">Car:</span> {p.car_brand} {p.car_model || ''} {p.car_year ? `(${p.car_year})` : ''}</div>
                           <div className="text-xs text-gray-600"><span className="font-bold">Cat:</span> {p.cat_name}</div>
                           <div className="text-xs text-gray-600"><span className="font-bold">Brand:</span> {p.brand_name}</div>
                        </td>
                        <td className="p-4">
                           <div className="text-xs text-gray-600"><span className="font-bold">G:</span> ฿{p.price_general}</div>
                           <div className="text-xs text-[#ff6c60]"><span className="font-bold">A:</span> ฿{p.price_garage}</div>
                           <div className="text-xs text-[#41cac0]"><span className="font-bold">S:</span> ฿{p.price_shop}</div>
                        </td>
                        <td className="p-4 text-right">
                           <button onClick={() => handleEdit(p)} className="text-blue-400 hover:text-blue-600 p-1 mr-2"><Edit className="w-4 h-4" /></button>
                           <button onClick={() => handleDelete(p.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 className="w-4 h-4" /></button>
                        </td>
                     </tr>
                  ))}
                  {products.length === 0 && (
                     <tr>
                        <td colSpan="4" className="p-8 text-center text-sm text-gray-400">No products found matching the criteria.</td>
                     </tr>
                  )}
               </tbody>
            </table>

            {/* Pagination Controls */}
            {totalPages > 1 && (
               <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50">
                  <button
                     disabled={page === 1}
                     onClick={() => setPage(p => Math.max(1, p - 1))}
                     className="px-4 py-2 border border-gray-200 rounded text-xs font-semibold bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                     Previous
                  </button>
                  <span className="text-xs text-gray-600 font-bold">Page {page} of {totalPages}</span>
                  <button
                     disabled={page === totalPages}
                     onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                     className="px-4 py-2 border border-gray-200 rounded text-xs font-semibold bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                     Next
                  </button>
               </div>
            )}
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
            const cats = await window.electronAPI.query('SELECT * FROM categories');
            const brs = await window.electronAPI.query('SELECT * FROM brands');
            setCategories(cats);
            setBrands(brs);
         } catch (err) { console.error(err); }
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

   // Find or create category/brand by name
   const findOrCreateCategory = async (name) => {
      if (!name) return null;
      const existing = categories.find(c => c.name.toLowerCase() === name.toLowerCase());
      if (existing) return existing.id;
      // Create new category
      const result = await window.electronAPI.query('INSERT INTO categories (name) VALUES (?)', [name]);
      const newCat = { id: result.lastID, name };
      setCategories(prev => [...prev, newCat]);
      return result.lastID;
   };

   const findOrCreateBrand = async (name) => {
      if (!name) return null;
      const existing = brands.find(b => b.name.toLowerCase() === name.toLowerCase());
      if (existing) return existing.id;
      // Create new brand
      const result = await window.electronAPI.query('INSERT INTO brands (name) VALUES (?)', [name]);
      const newBrand = { id: result.lastID, name };
      setBrands(prev => [...prev, newBrand]);
      return result.lastID;
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

            // Check for duplicate code
            const existingProduct = await window.electronAPI.query('SELECT id FROM products WHERE code = ?', [code]);
            if (existingProduct && existingProduct.length > 0) {
               // Update existing product
               const categoryName = getValue('category_name');
               const brandName = getValue('brand_name');
               const categoryId = await findOrCreateCategory(categoryName);
               const brandId = await findOrCreateBrand(brandName);

               const imagesRaw = getValue('images');
               const imagesJson = imagesRaw ? JSON.stringify(imagesRaw.split(',').map(s => s.trim()).filter(Boolean)) : '';

               await window.electronAPI.query(
                  'UPDATE products SET name=?, description=?, car_brand=?, car_model=?, car_year=?, category_id=?, brand_id=?, price_general=?, price_garage=?, price_shop=?, specifications=?, cross_references=?, images=? WHERE code=?',
                  [
                     name,
                     getValue('description'),
                     getValue('car_brand'),
                     getValue('car_model'),
                     getValue('car_year'),
                     categoryId, brandId,
                     parseFloat(getValue('price_general')) || 0,
                     parseFloat(getValue('price_garage')) || 0,
                     parseFloat(getValue('price_shop')) || 0,
                     getValue('specifications'),
                     getValue('cross_references'),
                     imagesJson,
                     code
                  ]
               );
               successCount++;
               continue;
            }

            // Resolve category and brand by name -> ID
            const categoryName = getValue('category_name');
            const brandName = getValue('brand_name');
            const categoryId = await findOrCreateCategory(categoryName);
            const brandId = await findOrCreateBrand(brandName);

            // Parse images (comma-separated URLs) into JSON array
            const imagesRaw = getValue('images');
            const imagesJson = imagesRaw ? JSON.stringify(imagesRaw.split(',').map(s => s.trim()).filter(Boolean)) : '';

            await window.electronAPI.query(
               'INSERT INTO products (name, code, description, car_brand, car_model, car_year, category_id, brand_id, price_general, price_garage, price_shop, specifications, cross_references, images) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
               [
                  name, code,
                  getValue('description'),
                  getValue('car_brand'),
                  getValue('car_model'),
                  getValue('car_year'),
                  categoryId, brandId,
                  parseFloat(getValue('price_general')) || 0,
                  parseFloat(getValue('price_garage')) || 0,
                  parseFloat(getValue('price_shop')) || 0,
                  getValue('specifications'),
                  getValue('cross_references'),
                  imagesJson
               ]
            );
            successCount++;
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

// ========================
// Car Model Manager Component
// ========================
const CarModelManager = () => {
   const [items, setItems] = useState([]);
   const [brands, setBrands] = useState([]);
   const [editId, setEditId] = useState(null);
   const [formData, setFormData] = useState({ name: '', car_brand_id: '' });

   const fetchData = async () => {
      try {
         const m = await window.electronAPI.query('SELECT m.*, b.name as brand_name FROM car_models m JOIN car_brands b ON m.car_brand_id = b.id ORDER BY b.name ASC, m.name ASC');
         const b = await window.electronAPI.query('SELECT * FROM car_brands ORDER BY name ASC');
         setItems(m);
         setBrands(b);
      } catch (err) { console.error(err); }
   };

   useEffect(() => { fetchData(); }, []);

   const handleSave = async () => {
      if (!formData.name.trim() || !formData.car_brand_id) {
         alert('Please select a Car Brand and enter a Model Name');
         return;
      }
      try {
         if (editId) {
            await window.electronAPI.query('UPDATE car_models SET name = ?, car_brand_id = ? WHERE id = ?', [formData.name.trim(), formData.car_brand_id, editId]);
         } else {
            await window.electronAPI.query('INSERT OR IGNORE INTO car_models (name, car_brand_id) VALUES (?, ?)', [formData.name.trim(), formData.car_brand_id]);
         }
         setEditId(null);
         setFormData({ name: '', car_brand_id: '' });
         fetchData();
      } catch (err) { console.error(err); }
   };

   const handleDelete = async (id) => {
      if (confirm('Are you sure you want to delete this model?')) {
         await window.electronAPI.query('DELETE FROM car_models WHERE id = ?', [id]);
         fetchData();
      }
   };

   return (
      <div className="space-y-6">
         <div className="bg-white rounded shadow-sm">
            <div className="p-4 border-b border-gray-100 font-semibold text-gray-600">{editId ? 'Edit' : 'Add New'} Car Model</div>
            <div className="p-6 flex flex-wrap gap-4 items-end">
               <div className="flex-1 min-w-[200px]">
                  <label className="block text-xs text-gray-400 mb-1 uppercase font-bold">Car Brand</label>
                  <select
                     className="w-full border border-gray-200 p-2 rounded text-sm focus:border-[#41cac0] outline-none"
                     value={formData.car_brand_id}
                     onChange={e => setFormData({ ...formData, car_brand_id: e.target.value })}
                  >
                     <option value="">Select Brand</option>
                     {brands.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                     ))}
                  </select>
               </div>
               <div className="flex-1 min-w-[200px]">
                  <label className="block text-xs text-gray-400 mb-1 uppercase font-bold">Model Name</label>
                  <input
                     type="text"
                     className="w-full border border-gray-200 p-2 rounded text-sm focus:border-[#41cac0] outline-none"
                     value={formData.name}
                     onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
               </div>
               <div className="flex gap-2">
                  <button onClick={handleSave} className="bg-[#a9d86e] text-white px-6 py-2 rounded text-sm font-semibold hover:bg-[#8ebc5a] transition-colors">
                     {editId ? 'Update' : 'Save'}
                  </button>
                  {editId && <button onClick={() => { setEditId(null); setFormData({ name: '', car_brand_id: '' }); }} className="bg-gray-100 text-gray-500 px-4 py-2 rounded text-sm">Cancel</button>}
               </div>
            </div>
         </div>

         <div className="bg-white rounded shadow-sm overflow-hidden">
            <table className="w-full text-left">
               <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                     <th className="p-4 text-xs font-bold text-gray-500 uppercase">ID</th>
                     <th className="p-4 text-xs font-bold text-gray-500 uppercase">Car Brand</th>
                     <th className="p-4 text-xs font-bold text-gray-500 uppercase">Model Name</th>
                     <th className="p-4 text-xs font-bold text-gray-500 uppercase text-right">Action</th>
                  </tr>
               </thead>
               <tbody>
                  {items.map(item => (
                     <tr key={item.id} className="border-b border-gray-50 last:border-none hover:bg-gray-50 transition-colors">
                        <td className="p-4 text-sm text-gray-400">#{item.id}</td>
                        <td className="p-4 text-sm text-gray-600">{item.brand_name}</td>
                        <td className="p-4 text-sm text-gray-600">{item.name}</td>
                        <td className="p-4 text-right">
                           <button onClick={() => { setEditId(item.id); setFormData({ name: item.name, car_brand_id: item.car_brand_id }); }} className="text-blue-400 hover:text-blue-600 p-1 mr-2"><Edit className="w-4 h-4" /></button>
                           <button onClick={() => handleDelete(item.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 className="w-4 h-4" /></button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
   );
};

export default AdminDashboard;
