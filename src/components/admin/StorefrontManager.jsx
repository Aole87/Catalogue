import React, { useState, useRef } from 'react';
import ApiClient from '../../utils/apiClient';
import { useSettings } from '../../context/SettingsContext';
import {
  Palette,
  Image as ImageIcon,
  Type,
  Layout,
  Save,
  CheckCircle2,
  Upload,
  Link,
  Plus,
  Trash2,
  Eye,
  Globe,
  Menu,
  EyeOff,
  Building2,
  Phone,
  Mail,
  Clock,
  MapPin,
  FileText,
  ShieldCheck
} from 'lucide-react';

export default function StorefrontManager() {
  const [activeSubTab, setActiveSubTab] = useState('branding');
  const [loading, setLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const { settings, refreshSettings, updateSettings } = useSettings();

  // CMS State (Bilingual)
  const [branding, setBranding] = useState({
    siteNameTh: 'MOBEX ศูนย์รวมอะไหล่รถยนต์',
    siteNameEn: 'MOBEX Auto Parts Center',
    metaDescriptionTh: 'ศูนย์รวมอะไหล่รถยนต์ตรงรุ่นคุณภาพสูง จัดส่งทั่วประเทศ',
    metaDescriptionEn: 'High quality direct-fit auto parts center with nationwide delivery',
    logoUrl: '/logo.png',
    faviconUrl: '/vite.svg',
    primaryColor: '#ea580c',
    secondaryColor: '#0c3175',
  });

  const [navigationConfig, setNavigationConfig] = useState({
    categoryButtonLabelTh: 'หมวดหมู่สินค้า',
    categoryButtonLabelEn: 'All Categories',
  });

  const [menus, setMenus] = useState([
    { id: 1, labelTh: 'หน้าหลัก', labelEn: 'Home', url: 'home', active: true },
    { id: 2, labelTh: 'หมวดหมู่สินค้า', labelEn: 'Categories', url: 'product-list', active: true },
    { id: 3, labelTh: 'สินค้าแนะนำ', labelEn: 'Recommended', url: 'product-list', active: true },
    { id: 4, labelTh: 'โปรโมชันพิเศษ', labelEn: 'Promotions', url: 'promotions', active: false },
    { id: 5, labelTh: 'ติดต่อเรา', labelEn: 'Contact Us', url: 'contact', active: true },
  ]);

  const [banners, setBanners] = useState([
    { id: 1, imageUrl: 'https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?w=1600&q=80', targetUrl: 'product-list', active: true },
    { id: 2, imageUrl: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=600&q=80', targetUrl: 'product-list', active: true },
    { id: 3, imageUrl: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=600&q=80', targetUrl: 'product-list', active: true },
  ]);

  const [headings, setHeadings] = useState({
    brandsTitleTh: 'แบรนด์ชั้นนำ',
    brandsTitleEn: 'Top Brands',
    categoriesTitleTh: 'หมวดหมู่สินค้า',
    categoriesTitleEn: 'Shop by Category',
    bestSellersTitleTh: 'สินค้าขายดี',
    bestSellersTitleEn: 'Best Sellers',
  });

  const [storeInfo, setStoreInfo] = useState({
    companyNameTh: 'บริษัท โมเบกซ์ ออโต้พาร์ท จำกัด',
    companyNameEn: 'MOBEX Auto Parts Co., Ltd.',
    taxId: '0105565012345',
    branchNameTh: 'สำนักงานใหญ่ (สาขาพระราม 9)',
    branchNameEn: 'Headquarters (Rama 9 Branch)',
    phone: '02-123-4567',
    hotline: '081-234-5678',
    email: 'support@mobex-autoparts.com',
    addressTh: 'เลขที่ 88/9 อาคารโมเบกซ์ ถนนพระราม 9 แขวงห้วยขวาง เขตห้วยขวาง กรุงเทพฯ 10310',
    addressEn: '88/9 MOBEX Building, Rama 9 Rd., Huai Khwang, Bangkok 10310 Thailand',
    businessHoursTh: 'จันทร์ - เสาร์: 08:30 - 18:00 น. (หยุดวันอาทิตย์)',
    businessHoursEn: 'Mon - Sat: 08:30 - 18:00 (Closed on Sunday)',
    googleMapsUrl: 'https://maps.google.com/?q=Huai+Khwang+Bangkok',
    lineId: '@mobexparts',
    facebookUrl: 'https://facebook.com/mobexautoparts',
    tiktokUrl: 'https://tiktok.com/@mobexautoparts',
    instagramUrl: '',
    youtubeUrl: '',
  });

  const [policies, setPolicies] = useState({
    returnPolicyTh: '',
    returnPolicyEn: '',
    warrantyPolicyTh: '',
    warrantyPolicyEn: '',
    shippingPolicyTh: '',
    shippingPolicyEn: '',
    privacyPolicyTh: '',
    privacyPolicyEn: '',
    termsOfServiceTh: '',
    termsOfServiceEn: '',
  });

  // Sync state from settings context or API
  React.useEffect(() => {
    if (settings) {
      if (settings.branding) setBranding(prev => ({ ...prev, ...settings.branding }));
      if (settings.banners && Array.isArray(settings.banners) && settings.banners.length > 0) setBanners(settings.banners);
      if (settings.typography) setHeadings(prev => ({ ...prev, ...settings.typography }));
      if (settings.menus && Array.isArray(settings.menus) && settings.menus.length > 0) setMenus(settings.menus);
      if (settings.navigation) setNavigationConfig(prev => ({ ...prev, ...settings.navigation }));
      if (settings.storeInfo) setStoreInfo(prev => ({ ...prev, ...settings.storeInfo }));
      if (settings.policies) setPolicies(prev => ({ ...prev, ...settings.policies }));
    }
  }, [settings]);

  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const res = await ApiClient.getSettings();
        const s = res?.data?.settings || res?.settings;
        if (s) {
          if (s.branding) setBranding(prev => ({ ...prev, ...s.branding }));
          if (s.banners && Array.isArray(s.banners) && s.banners.length > 0) setBanners(s.banners);
          if (s.typography) setHeadings(prev => ({ ...prev, ...s.typography }));
          if (s.menus && Array.isArray(s.menus) && s.menus.length > 0) setMenus(s.menus);
          if (s.navigation) setNavigationConfig(prev => ({ ...prev, ...s.navigation }));
          if (s.storeInfo) setStoreInfo(prev => ({ ...prev, ...s.storeInfo }));
          if (s.policies) setPolicies(prev => ({ ...prev, ...s.policies }));
        }
      } catch (e) {
        console.error('Failed to load settings in StorefrontManager', e);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    try {
      setLoading(true);
      setSavedSuccess(false);
      const payload = {
        branding,
        banners,
        typography: headings,
        menus,
        navigation: navigationConfig,
        storeInfo,
        policies,
      };
      if (updateSettings) {
        await updateSettings(payload);
      } else {
        await ApiClient.updateSettings(payload);
        if (refreshSettings) await refreshSettings();
      }
      try {
        localStorage.setItem('mobex_settings_updated', Date.now().toString());
      } catch (err) {}
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e) {
      alert('บันทึกไม่สำเร็จ: ' + (e.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddMenu = () => {
    setMenus([...menus, { id: Date.now(), labelTh: '', labelEn: '', url: '', active: true }]);
  };

  const handleDeleteMenu = (id) => {
    if(confirm('Are you sure you want to delete this menu?')) {
      setMenus(menus.filter(m => m.id !== id));
    }
  };

  const handleAddBanner = () => {
    setBanners([...banners, { id: Date.now(), imageUrl: 'https://via.placeholder.com/800x300.png?text=New+Banner', targetUrl: '', active: true }]);
  };

  const handleDeleteBanner = (id) => {
    if(confirm('Are you sure you want to delete this banner?')) {
      setBanners(banners.filter(b => b.id !== id));
    }
  };

  const handleImageUploadChange = (e, idx, type) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result;
        if (!url) return;
        if (type === 'banner') {
          const newBanners = [...banners];
          newBanners[idx].imageUrl = url;
          setBanners(newBanners);
        } else if (type === 'logo') {
          setBranding(prev => ({ ...prev, logoUrl: url }));
        } else if (type === 'favicon') {
          setBranding(prev => ({ ...prev, faviconUrl: url }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#0c3175] mb-1">
            <Globe className="w-4 h-4" />
            <span>Storefront CMS (Bilingual)</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            จัดการเว็บไซต์และเนื้อหา
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            อัปโหลดรูปภาพ, เพิ่มลบแก้ไขเมนู และข้อความรองรับภาษาไทย-อังกฤษ
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="px-6 py-2.5 rounded-full bg-[#ea580c] hover:bg-[#c2410c] text-white text-xs font-extrabold shadow-md transition-all flex items-center gap-2 shrink-0"
        >
          {loading ? (
            <span>กำลังบันทึก...</span>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>บันทึกการเปลี่ยนแปลงทั้งหมด</span>
            </>
          )}
        </button>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>บันทึกข้อมูลและเผยแพร่ขึ้นหน้าเว็บสำเร็จ!</span>
        </div>
      )}

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200/90 text-xs font-bold overflow-x-auto">
        {[
          { id: 'branding', label: '🎨 ภาพลักษณ์ & อัตลักษณ์', icon: Palette },
          { id: 'navigation', label: '🌐 จัดการเมนู & แถบนำทาง', icon: Menu },
          { id: 'banners', label: '🖼️ แบนเนอร์ภาพเต็ม', icon: ImageIcon },
          { id: 'storeInfo', label: '🏢 ข้อมูลร้านค้า & ติดต่อ', icon: Building2 },
          { id: 'policies', label: '📜 นโยบายร้านค้า & PDPA', icon: FileText },
          { id: 'typography', label: '📝 หัวข้อหมวดสินค้า', icon: Type },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
              activeSubTab === tab.id
                ? 'bg-[#0c3175] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 1. Identity & Branding */}
      {activeSubTab === 'branding' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#0c3175]"/> ชื่อเว็บไซต์และ SEO
            </h3>
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Site Name (TH)</label>
                  <input type="text" value={branding.siteNameTh} onChange={(e) => setBranding({...branding, siteNameTh: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Site Name (EN)</label>
                  <input type="text" value={branding.siteNameEn} onChange={(e) => setBranding({...branding, siteNameEn: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Meta Description (TH)</label>
                  <textarea value={branding.metaDescriptionTh} onChange={(e) => setBranding({...branding, metaDescriptionTh: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 min-h-[80px]" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Meta Description (EN)</label>
                  <textarea value={branding.metaDescriptionEn} onChange={(e) => setBranding({...branding, metaDescriptionEn: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 min-h-[80px]" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">โลโก้และไอคอน</h3>
            <div className="flex gap-6">
              <div className="flex-1 space-y-2">
                <label className="block font-bold text-slate-700 text-xs">โลโก้หลัก (Logo)</label>
                <label htmlFor="logo-file-input" className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:bg-slate-800 transition-colors cursor-pointer bg-slate-900 relative group overflow-hidden h-28">
                  {branding.logoUrl && branding.logoUrl !== '/logo.png' ? (
                    <img src={branding.logoUrl} alt="Logo Preview" className="max-h-16 max-w-full object-contain z-10" />
                  ) : (
                    <div className="text-3xl font-black text-white flex items-center z-10">
                      Buy<span className="text-[#ea580c]">@</span>Unimart
                    </div>
                  )}
                  <input
                    id="logo-file-input"
                    type="file"
                    style={{ display: 'none' }}
                    accept="image/*"
                    onChange={(e) => handleImageUploadChange(e, 0, 'logo')}
                  />
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-15">
                    <Upload className="w-5 h-5 text-white mb-1" />
                    <span className="text-white text-[10px] font-bold">คลิกเพื่อเปลี่ยนรูปภาพโลโก้</span>
                  </div>
                </label>
              </div>
              
              <div className="w-1/3 space-y-2">
                <label className="block font-bold text-slate-700 text-xs">Favicon</label>
                <label htmlFor="favicon-file-input" className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:bg-slate-50 transition-colors cursor-pointer relative group h-28 bg-slate-50/50">
                  <img
                    src={branding.faviconUrl || '/vite.svg'}
                    alt="Favicon"
                    className="w-10 h-10 object-contain rounded-md shadow-xs"
                    onError={(e) => { e.target.src = '/vite.svg'; }}
                  />
                  <input
                    id="favicon-file-input"
                    type="file"
                    style={{ display: 'none' }}
                    accept="image/*"
                    onChange={(e) => handleImageUploadChange(e, 0, 'favicon')}
                  />
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-15 rounded-xl">
                    <Upload className="w-4 h-4 text-white mb-1" />
                    <span className="text-white text-[9px] font-bold">เปลี่ยน Favicon</span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Menus */}
      {activeSubTab === 'navigation' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">จัดการแถบเมนูนำทาง (Main Navigation)</h3>
              <p className="text-xs text-slate-500 mt-1">เพิ่มลบเมนู ซ่อนการแสดงผล และกำหนดชื่อสองภาษา</p>
            </div>
            <button onClick={handleAddMenu} className="flex items-center gap-1 text-xs font-bold text-white bg-[#0c3175] hover:bg-[#051124] px-4 py-2 rounded-xl transition-colors shadow-sm">
              <Plus className="w-4 h-4" /> เพิ่มเมนูใหม่
            </button>
          </div>

          {/* Category Button Label on Navigation */}
          <div className="bg-blue-50/70 p-5 rounded-2xl border border-blue-200/80 space-y-3">
            <div>
              <h4 className="text-xs font-black text-[#0c3175] uppercase tracking-wider flex items-center gap-2">
                <Menu className="w-4 h-4 text-[#0c3175]" />
                <span>ข้อความปุ่มหมวดหมู่สินค้าที่แถบนำทาง (Navigation Category Button Label)</span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                กำหนดข้อความที่แสดงบนปุ่มเปิดแค็ตตาล็อกสินค้าที่แถบนำทาง (Navbar) ด้านบนของหน้าเว็บ (ทั้งหน้าจอคอมพิวเตอร์และมือถือ)
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">ข้อความภาษาไทย (TH) *</label>
                <input
                  type="text"
                  value={navigationConfig.categoryButtonLabelTh}
                  onChange={(e) => setNavigationConfig({ ...navigationConfig, categoryButtonLabelTh: e.target.value })}
                  placeholder="เช่น หมวดหมู่สินค้า, เลือกดูอะไหล่, แค็ตตาล็อกสินค้า"
                  className="w-full bg-white border border-blue-200 rounded-xl px-3.5 py-2 text-slate-900 font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">ข้อความภาษาอังกฤษ (EN) *</label>
                <input
                  type="text"
                  value={navigationConfig.categoryButtonLabelEn}
                  onChange={(e) => setNavigationConfig({ ...navigationConfig, categoryButtonLabelEn: e.target.value })}
                  placeholder="e.g. All Categories, Browse Parts, Product Catalog"
                  className="w-full bg-white border border-blue-200 rounded-xl px-3.5 py-2 text-slate-900 font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {menus.map((menu, idx) => (
              <div key={menu.id} className={`p-4 rounded-2xl border ${menu.active ? 'border-slate-200 bg-white' : 'border-slate-100 bg-slate-50 opacity-60'} flex flex-col md:flex-row gap-4 items-start md:items-center transition-all`}>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs w-full">
                  <div>
                    <label className="block font-bold text-slate-500 mb-1 text-[10px] uppercase">Menu Name (TH)</label>
                    <input type="text" value={menu.labelTh} onChange={(e) => { const m = [...menus]; m[idx].labelTh = e.target.value; setMenus(m); }} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-bold text-slate-900" placeholder="ชื่อเมนูภาษาไทย" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 mb-1 text-[10px] uppercase">Menu Name (EN)</label>
                    <input type="text" value={menu.labelEn} onChange={(e) => { const m = [...menus]; m[idx].labelEn = e.target.value; setMenus(m); }} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-bold text-slate-900" placeholder="Menu name in English" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 mb-1 text-[10px] uppercase">Target URL/Route</label>
                    <input type="text" value={menu.url} onChange={(e) => { const m = [...menus]; m[idx].url = e.target.value; setMenus(m); }} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-mono text-slate-600" placeholder="e.g. product-list" />
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 pt-4 md:pt-0">
                  <button 
                    onClick={() => { const m = [...menus]; m[idx].active = !m[idx].active; setMenus(m); }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${menu.active ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-slate-200 text-slate-500 hover:bg-slate-300'}`}
                  >
                    {menu.active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{menu.active ? 'แสดงผล' : 'ซ่อน'}</span>
                  </button>
                  <button onClick={() => handleDeleteMenu(menu.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Banners & Heroes (Full Image) */}
      {activeSubTab === 'banners' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">จัดการแบนเนอร์ภาพเต็ม (Full Image Banners)</h3>
              <p className="text-xs text-slate-500 mt-1">อัปโหลดรูปภาพแบนเนอร์แบบชิ้นเดียว (ไม่ต้องใส่ข้อความทับรูป)</p>
            </div>
            <button onClick={handleAddBanner} className="flex items-center gap-1 text-xs font-bold text-white bg-[#0c3175] hover:bg-[#051124] px-4 py-2 rounded-xl transition-colors shadow-sm">
              <Plus className="w-4 h-4" /> เพิ่มแบนเนอร์
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {banners.map((banner, idx) => (
              <div key={banner.id} className={`rounded-2xl border ${banner.active ? 'border-slate-200 shadow-sm' : 'border-slate-200 opacity-60'} overflow-hidden flex flex-col bg-white transition-all`}>
                <div className="h-40 w-full relative bg-slate-100 group">
                  <img src={banner.imageUrl} alt="Banner Preview" className="w-full h-full object-cover" />
                  <label htmlFor={`banner-file-${banner.id}`} className="absolute inset-0 cursor-pointer">
                    <input
                      id={`banner-file-${banner.id}`}
                      type="file"
                      style={{ display: 'none' }}
                      accept="image/*"
                      onChange={(e) => handleImageUploadChange(e, idx, 'banner')}
                    />
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-15">
                      <Upload className="w-6 h-6 text-white mb-1" />
                      <span className="text-white text-[10px] font-bold">เปลี่ยนรูปภาพ</span>
                    </div>
                  </label>
                </div>
                
                <div className="p-4 space-y-3 bg-white flex-1 border-t border-slate-100 flex flex-col justify-between">
                  <div>
                    <label className="block font-bold text-slate-500 mb-1 text-[10px] uppercase">ลิงก์ปลายทางเมื่อคลิก</label>
                    <div className="flex items-center gap-2">
                      <Link className="w-4 h-4 text-slate-400 shrink-0" />
                      <input
                        type="text"
                        value={banner.targetUrl}
                        onChange={(e) => { const b = [...banners]; b[idx].targetUrl = e.target.value; setBanners(b); }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-600"
                        placeholder="/product-list"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <button 
                      onClick={() => { const b = [...banners]; b[idx].active = !b[idx].active; setBanners(b); }}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold transition-colors ${banner.active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}
                    >
                      {banner.active ? <CheckCircle2 className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      <span>{banner.active ? 'กำลังแสดง' : 'ซ่อนไว้'}</span>
                    </button>
                    <button onClick={() => handleDeleteBanner(banner.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-md transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Store Information & Contact Details Tab */}
      {activeSubTab === 'storeInfo' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-black text-slate-900 mb-1 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#0c3175]" />
              <span>ข้อมูลนิติบุคคล ร้านค้า และการติดต่อ (Store Profile & Contact)</span>
            </h3>
            <p className="text-xs text-slate-500">
              ข้อมูลนี้จะแสดงผลในใบเสร็จรับเงิน ใบกำกับภาษี ส่วนท้ายเว็บไซต์ (Footer) และหน้าติดต่อเรา
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">ชื่อบริษัท / ร้านค้า (ภาษาไทย) *</label>
              <input
                type="text"
                value={storeInfo.companyNameTh}
                onChange={(e) => setStoreInfo({ ...storeInfo, companyNameTh: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-semibold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Company Name (English) *</label>
              <input
                type="text"
                value={storeInfo.companyNameEn}
                onChange={(e) => setStoreInfo({ ...storeInfo, companyNameEn: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">เลขประจำตัวผู้เสียภาษี (Tax ID)</label>
              <input
                type="text"
                value={storeInfo.taxId}
                onChange={(e) => setStoreInfo({ ...storeInfo, taxId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">สาขา (Branch Name)</label>
              <input
                type="text"
                value={storeInfo.branchNameTh}
                onChange={(e) => setStoreInfo({ ...storeInfo, branchNameTh: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-blue-600" />
                <span>เบอร์โทรศัพท์สำนักงาน</span>
              </label>
              <input
                type="text"
                value={storeInfo.phone}
                onChange={(e) => setStoreInfo({ ...storeInfo, phone: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-[#ea580c]" />
                <span>สายด่วน Hotline (Call Center)</span>
              </label>
              <input
                type="text"
                value={storeInfo.hotline}
                onChange={(e) => setStoreInfo({ ...storeInfo, hotline: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-blue-600" />
                <span>อีเมลบริการลูกค้า (Support Email)</span>
              </label>
              <input
                type="email"
                value={storeInfo.email}
                onChange={(e) => setStoreInfo({ ...storeInfo, email: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>วันและเวลาทำการ (Business Hours)</span>
              </label>
              <input
                type="text"
                value={storeInfo.businessHoursTh}
                onChange={(e) => setStoreInfo({ ...storeInfo, businessHoursTh: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-red-500" />
                <span>ที่อยู่สำนักงาน / คลังสินค้า (ภาษาไทย)</span>
              </label>
              <textarea
                rows={2}
                value={storeInfo.addressTh}
                onChange={(e) => setStoreInfo({ ...storeInfo, addressTh: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-red-500" />
                <span>Office / Warehouse Address (English)</span>
              </label>
              <textarea
                rows={2}
                value={storeInfo.addressEn}
                onChange={(e) => setStoreInfo({ ...storeInfo, addressEn: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900"
              />
            </div>

            <div className="col-span-1 md:col-span-2 pt-2 border-t border-slate-100">
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                ลิงก์โซเชียลมีเดีย (Social Media Channels)
              </div>
              <p className="text-[11px] text-slate-500 mb-3">
                💡 ช่องทางใดที่กรอกข้อมูลไว้จะแสดงไอคอนที่ท้ายเว็บไซต์ (Footer) อัตโนมัติ หากเว้นว่างไว้ไอคอนจะไม่แสดง
              </p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">LINE Official Account ID</label>
              <input
                type="text"
                value={storeInfo.lineId || ''}
                onChange={(e) => setStoreInfo({ ...storeInfo, lineId: e.target.value })}
                placeholder="เช่น @mobexparts"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Facebook Fanpage URL</label>
              <input
                type="text"
                value={storeInfo.facebookUrl || ''}
                onChange={(e) => setStoreInfo({ ...storeInfo, facebookUrl: e.target.value })}
                placeholder="https://facebook.com/yourpage"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">TikTok Profile URL</label>
              <input
                type="text"
                value={storeInfo.tiktokUrl || ''}
                onChange={(e) => setStoreInfo({ ...storeInfo, tiktokUrl: e.target.value })}
                placeholder="https://tiktok.com/@yourbrand"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Instagram Profile URL</label>
              <input
                type="text"
                value={storeInfo.instagramUrl || ''}
                onChange={(e) => setStoreInfo({ ...storeInfo, instagramUrl: e.target.value })}
                placeholder="https://instagram.com/yourbrand"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900"
              />
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">YouTube Channel URL</label>
              <input
                type="text"
                value={storeInfo.youtubeUrl || ''}
                onChange={(e) => setStoreInfo({ ...storeInfo, youtubeUrl: e.target.value })}
                placeholder="https://youtube.com/@yourbrand"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900"
              />
            </div>
          </div>
        </div>
      )}

      {/* 5. Policies & Legal Agreements Tab */}
      {activeSubTab === 'policies' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-black text-slate-900 mb-1 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#0c3175]" />
              <span>นโยบายร้านค้า กฎหมาย PDPA และเงื่อนไขการให้บริการ (Policies & Terms)</span>
            </h3>
            <p className="text-xs text-slate-500">
              ข้อความเหล่านี้จะถูกนำไปแสดงเมื่อลูกค้าคลิกลิงก์นโยบายที่ส่วนท้ายเว็บไซต์ (Footer) หรือก่อนยืนยันสั่งซื้อ
            </p>
          </div>

          <div className="space-y-6 text-xs">
            {/* Return Policy */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <span>1. นโยบายการคืนและเปลี่ยนสินค้า (Return & Refund Policy)</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">เนื้อหาภาษาไทย</label>
                  <textarea
                    rows={4}
                    value={policies.returnPolicyTh}
                    onChange={(e) => setPolicies({ ...policies, returnPolicyTh: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-900 leading-relaxed"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">English Content</label>
                  <textarea
                    rows={4}
                    value={policies.returnPolicyEn}
                    onChange={(e) => setPolicies({ ...policies, returnPolicyEn: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-900 leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* Warranty Policy */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <span>2. การรับประกันอะไหล่แท้ 100% (Genuine Warranty Policy)</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">เนื้อหาภาษาไทย</label>
                  <textarea
                    rows={4}
                    value={policies.warrantyPolicyTh}
                    onChange={(e) => setPolicies({ ...policies, warrantyPolicyTh: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-900 leading-relaxed"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">English Content</label>
                  <textarea
                    rows={4}
                    value={policies.warrantyPolicyEn}
                    onChange={(e) => setPolicies({ ...policies, warrantyPolicyEn: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-900 leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Policy */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <span>3. นโยบายการจัดส่งสินค้า (Shipping & Logistics Policy)</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">เนื้อหาภาษาไทย</label>
                  <textarea
                    rows={4}
                    value={policies.shippingPolicyTh}
                    onChange={(e) => setPolicies({ ...policies, shippingPolicyTh: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-900 leading-relaxed"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">English Content</label>
                  <textarea
                    rows={4}
                    value={policies.shippingPolicyEn}
                    onChange={(e) => setPolicies({ ...policies, shippingPolicyEn: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-900 leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* Privacy Policy */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <span>4. นโยบายคุ้มครองข้อมูลส่วนบุคคล (PDPA Privacy Policy)</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">เนื้อหาภาษาไทย</label>
                  <textarea
                    rows={4}
                    value={policies.privacyPolicyTh}
                    onChange={(e) => setPolicies({ ...policies, privacyPolicyTh: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-900 leading-relaxed"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">English Content</label>
                  <textarea
                    rows={4}
                    value={policies.privacyPolicyEn}
                    onChange={(e) => setPolicies({ ...policies, privacyPolicyEn: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-900 leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* Terms of Service */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <span>5. ข้อกำหนดและเงื่อนไขการใช้บริการ (Terms of Service)</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">เนื้อหาภาษาไทย</label>
                  <textarea
                    rows={4}
                    value={policies.termsOfServiceTh}
                    onChange={(e) => setPolicies({ ...policies, termsOfServiceTh: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-900 leading-relaxed"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">English Content</label>
                  <textarea
                    rows={4}
                    value={policies.termsOfServiceEn}
                    onChange={(e) => setPolicies({ ...policies, termsOfServiceEn: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-900 leading-relaxed"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Typography & Headings */}
      {activeSubTab === 'typography' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Type className="w-4 h-4 text-[#0c3175]" /> จัดการหัวข้อแต่ละ Section (Bilingual)
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <h4 className="font-bold text-slate-800 text-sm">หัวข้อแบรนด์ (Brands)</h4>
              <div>
                <label className="block font-bold text-slate-500 mb-1">ภาษาไทย (TH)</label>
                <input type="text" value={headings.brandsTitleTh} onChange={(e) => setHeadings({ ...headings, brandsTitleTh: e.target.value })} className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-bold" />
              </div>
              <div>
                <label className="block font-bold text-slate-500 mb-1">ภาษาอังกฤษ (EN)</label>
                <input type="text" value={headings.brandsTitleEn} onChange={(e) => setHeadings({ ...headings, brandsTitleEn: e.target.value })} className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-bold" />
              </div>
            </div>

            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <h4 className="font-bold text-slate-800 text-sm">หัวข้อหมวดหมู่ (Categories)</h4>
              <div>
                <label className="block font-bold text-slate-500 mb-1">ภาษาไทย (TH)</label>
                <input type="text" value={headings.categoriesTitleTh} onChange={(e) => setHeadings({ ...headings, categoriesTitleTh: e.target.value })} className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-bold" />
              </div>
              <div>
                <label className="block font-bold text-slate-500 mb-1">ภาษาอังกฤษ (EN)</label>
                <input type="text" value={headings.categoriesTitleEn} onChange={(e) => setHeadings({ ...headings, categoriesTitleEn: e.target.value })} className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-bold" />
              </div>
            </div>
            
            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <h4 className="font-bold text-slate-800 text-sm">หัวข้อสินค้าขายดี (Best Sellers)</h4>
              <div>
                <label className="block font-bold text-slate-500 mb-1">ภาษาไทย (TH)</label>
                <input type="text" value={headings.bestSellersTitleTh} onChange={(e) => setHeadings({ ...headings, bestSellersTitleTh: e.target.value })} className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-bold" />
              </div>
              <div>
                <label className="block font-bold text-slate-500 mb-1">ภาษาอังกฤษ (EN)</label>
                <input type="text" value={headings.bestSellersTitleEn} onChange={(e) => setHeadings({ ...headings, bestSellersTitleEn: e.target.value })} className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-bold" />
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
