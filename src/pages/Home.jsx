import React, { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import ProductCard from '../components/product/ProductCard';
import ArticleDetailModal from '../components/common/ArticleDetailModal';
import ApiClient from '../utils/apiClient';
import { useLanguage } from '../context/LanguageContext';
import { useSettings } from '../context/SettingsContext';
import { ChevronRight, ChevronLeft, Search, ShieldCheck, Truck, CheckCircle2, ArrowRight, UserPlus } from 'lucide-react';

export const Home = ({ navigate, user, setUser }) => {
  const { lang, t } = useLanguage();
  const { settings } = useSettings();
  const [activeTab, setActiveTab] = useState('best-seller');
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [searchBrand, setSearchBrand] = useState('');
  const [searchModel, setSearchModel] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [articles, setArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);

  useEffect(() => {
    ApiClient.get('/articles')
      .then((res) => {
        if (res?.articles || res?.data?.articles) {
          setArticles(res.articles || res.data?.articles);
        }
      })
      .catch((err) => {
        console.error('Failed to load articles for homepage:', err);
      });
  }, []);

  const storeSettings = settings || {};
  const activeBanners = (storeSettings.banners || []).filter(b => b.active !== false);

  const nextBanner = () => {
    if (activeBanners.length <= 1) return;
    setCurrentBannerIndex((prev) => (prev + 1) % activeBanners.length);
  };

  const prevBanner = () => {
    if (activeBanners.length <= 1) return;
    setCurrentBannerIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
  };

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    const filters = {};
    if (searchBrand && searchBrand !== 'all') filters.brand = searchBrand;
    if (searchKeyword.trim()) filters.search = searchKeyword.trim();
    navigate?.('product-list', { filters });
  };

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchCatalogProducts = async () => {
      try {
        setLoadingProducts(true);
        const res = await ApiClient.getProducts({ limit: 10, sortBy: 'createdAt', sortOrder: 'desc' });
        if (isMounted && res?.data && res.data.length > 0) {
          setProducts(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch home catalog products:', err);
      } finally {
        if (isMounted) setLoadingProducts(false);
      }
    };
    fetchCatalogProducts();
    return () => { isMounted = false; };
  }, []);

  const currentBanner = activeBanners[currentBannerIndex] || activeBanners[0];

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-slate-900 flex flex-col font-sans">
      <Navbar navigate={navigate} user={user} setUser={setUser} />

      <main className="flex-1 w-full max-w-[1300px] mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4 space-y-5 sm:space-y-6">
        
        {/* 1. Clean Full-Bleed Hero Banner (Responsive Height) */}
        <section className="relative w-full rounded-2xl sm:rounded-[24px] overflow-hidden h-[180px] sm:h-[260px] md:h-[340px] mt-1 shadow-sm bg-slate-900 group">
           <img
             src={currentBanner?.imageUrl || "https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?w=1600&q=80"}
             alt="Hero Banner"
             onClick={() => navigate?.(currentBanner?.targetUrl || 'product-list')}
             className="w-full h-full object-cover cursor-pointer transition-transform duration-700 group-hover:scale-105"
           />

           {activeBanners.length > 1 && (
             <>
               <button
                 onClick={prevBanner}
                 className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-all opacity-80 sm:opacity-0 sm:group-hover:opacity-100 shadow-md"
                 aria-label="Previous Banner"
               >
                 <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
               </button>
               <button
                 onClick={nextBanner}
                 className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-all opacity-80 sm:opacity-0 sm:group-hover:opacity-100 shadow-md"
                 aria-label="Next Banner"
               >
                 <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
               </button>
               <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2 z-20">
                 {activeBanners.map((_, i) => (
                   <button
                     key={i}
                     onClick={() => setCurrentBannerIndex(i)}
                     className={`h-2 sm:h-2.5 rounded-full transition-all ${
                       currentBannerIndex === i ? 'bg-[#f97316] w-5 sm:w-6' : 'bg-white/60 hover:bg-white w-2 sm:w-2.5'
                     }`}
                     aria-label={`Go to slide ${i + 1}`}
                   />
                 ))}
               </div>
             </>
           )}
        </section>

        {/* 2. Brands Section */}
        <section>
           <div className="flex justify-between items-end mb-3 sm:mb-4 px-1">
              <h3 className="text-lg sm:text-[22px] font-black text-[#0c1a38] flex items-center gap-2.5 sm:gap-3">
                 <div className="w-1 sm:w-[6px] h-5 sm:h-6 bg-[#ea580c] rounded-sm"></div>
                 <span>{lang === 'en' ? (storeSettings.typography?.brandsTitleEn || 'Top Brands') : (storeSettings.typography?.brandsTitleTh || 'แบรนด์ชั้นนำ')}</span>
              </h3>
              <button onClick={() => navigate?.('product-list')} className="text-xs sm:text-[14px] font-bold text-[#1d4ed8] flex items-center gap-1 hover:underline">
                 <span>{lang === 'en' ? 'View All' : 'ดูทั้งหมด'}</span> <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
           </div>
           <div className="flex items-center gap-6 sm:gap-8 bg-white px-4 sm:px-8 py-3 sm:py-5 rounded-2xl border border-slate-200/80 shadow-xs w-full h-[64px] sm:h-[80px] overflow-x-auto no-scrollbar scroll-smooth">
              {['BOSCH', 'DENSO', 'NGK', 'MANN FILTER', 'ACDelco', 'KYB', 'MONROE', 'YOKOHAMA', 'TOYOTA', 'HONDA'].map((brand) => (
                 <div
                   key={brand}
                   onClick={() => navigate?.('product-list', { filters: { search: brand } })}
                   className="text-base sm:text-xl font-black text-slate-300 hover:text-[#0d3c90] transition-colors cursor-pointer shrink-0 px-2"
                 >
                   {brand}
                 </div>
              ))}
           </div>
        </section>

        {/* 3. Categories Section */}
        <section>
           <div className="flex justify-between items-end mb-3 sm:mb-4 px-1">
              <h3 className="text-lg sm:text-[22px] font-black text-[#0c1a38] flex items-center gap-2.5 sm:gap-3">
                 <div className="w-1 sm:w-[6px] h-5 sm:h-6 bg-[#ea580c] rounded-sm"></div>
                 <span>{lang === 'en' ? (storeSettings.typography?.categoriesTitleEn || 'Shop by Category') : (storeSettings.typography?.categoriesTitleTh || 'หมวดหมู่สินค้า')}</span>
              </h3>
              <button onClick={() => navigate?.('product-list')} className="text-xs sm:text-[14px] font-bold text-[#1d4ed8] flex items-center gap-1 hover:underline">
                 <span>{lang === 'en' ? 'View All' : 'ดูทั้งหมด'}</span> <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
           </div>
           <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5 sm:gap-4 w-full">
              {[
                { th: 'เครื่องยนต์', en: 'Engine' },
                { th: 'ช่วงล่าง', en: 'Suspension' },
                { th: 'ระบบเบรก', en: 'Brakes' },
                { th: 'ระบบไฟฟ้า', en: 'Electrical' },
                { th: 'น้ำมันและของเหลว', en: 'Oils & Fluids' },
                { th: 'กรองอากาศ/น้ำมัน', en: 'Filters' },
                { th: 'เครื่องมือช่าง', en: 'Tools' },
                { th: 'ล้อและยาง', en: 'Tires & Wheels' }
              ].map((cat, i) => (
                 <div
                   key={i}
                   onClick={() => navigate?.('product-list', { filters: { search: cat.th } })}
                   className="bg-white rounded-2xl border border-slate-200/80 pt-4 sm:pt-6 pb-3 sm:pb-4 px-2 flex flex-col items-center justify-between hover:border-[#1d4ed8] cursor-pointer transition-all shadow-xs hover:shadow-md h-[115px] sm:h-[130px] group"
                 >
                    <div className="w-11 h-11 sm:w-14 sm:h-14 relative mb-1.5 sm:mb-2 flex items-center justify-center">
                       <div className="absolute inset-0 bg-blue-50/70 rounded-full group-hover:scale-110 transition-transform"></div>
                       <span className="relative text-[11px] sm:text-xs font-black text-[#0c3175]">0{i + 1}</span>
                    </div>
                    <span className="text-[11px] sm:text-[12px] font-bold text-[#0c1a38] text-center w-full leading-tight px-1 truncate">
                      {lang === 'en' ? cat.en : cat.th}
                    </span>
                 </div>
              ))}
           </div>
        </section>

        {/* 4. Mini Promo Banners: Full Image Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
           {/* Banner 1: Full Image Card (Double Width on tablet/desktop) */}
           <div
             onClick={() => navigate?.(activeBanners[1]?.targetUrl || 'product-list')}
             className="sm:col-span-2 rounded-2xl overflow-hidden relative h-[160px] sm:h-[180px] shadow-sm hover:shadow-md transition-all cursor-pointer group border border-slate-200"
           >
              <img
                src={activeBanners[1]?.imageUrl || "https://images.unsplash.com/photo-1558002038-1055907df827?w=900&q=80"}
                alt="Promo Banner 1"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
              <div className="absolute bottom-3 sm:bottom-4 left-4 right-4 flex justify-between items-end">
                 <div>
                   <span className="bg-[#ea580c] text-white text-[9px] sm:text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full mb-1 inline-block">Special Offer</span>
                   <h4 className="text-white font-black text-base sm:text-lg drop-shadow-md leading-tight">
                     {lang === 'en' ? 'Premium Air & Oil Filters' : 'กรองอากาศและกรองน้ำมันเครื่องเกรดพรีเมียม'}
                   </h4>
                 </div>
                 <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white text-slate-900 flex items-center justify-center group-hover:translate-x-1 transition-transform shrink-0">
                    <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                 </div>
              </div>
           </div>
           
           {/* Banner 2: Full Image Card */}
           <div
             onClick={() => navigate?.(activeBanners[2]?.targetUrl || 'product-list')}
             className="col-span-1 rounded-2xl overflow-hidden relative h-[150px] sm:h-[180px] shadow-sm hover:shadow-md transition-all cursor-pointer group border border-slate-200"
           >
              <img
                src={activeBanners[2]?.imageUrl || "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&q=80"}
                alt="Promo Banner 2"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
              <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4">
                 <span className="bg-blue-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full mb-1 inline-block">Batteries</span>
                 <h4 className="text-white font-black text-xs sm:text-sm drop-shadow-md leading-tight">
                   {lang === 'en' ? 'Heavy Duty Batteries' : 'แบตเตอรี่พร้อมใช้งาน'}
                 </h4>
              </div>
           </div>
           
           {/* Banner 3: Full Image Card */}
           <div
             onClick={() => navigate?.(activeBanners[3]?.targetUrl || activeBanners[0]?.targetUrl || 'product-list')}
             className="col-span-1 rounded-2xl overflow-hidden relative h-[150px] sm:h-[180px] shadow-sm hover:shadow-md transition-all cursor-pointer group border border-slate-200"
           >
              <img
                src={activeBanners[3]?.imageUrl || "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=600&q=80"}
                alt="Promo Banner 3"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
              <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4">
                 <span className="bg-amber-500 text-slate-900 text-[9px] font-black uppercase px-2 py-0.5 rounded-full mb-1 inline-block">Ignition</span>
                 <h4 className="text-white font-black text-xs sm:text-sm drop-shadow-md leading-tight">
                   {lang === 'en' ? 'Iridium Spark Plugs' : 'หัวเทียนตรงรุ่น'}
                 </h4>
              </div>
           </div>
        </section>

        {/* 5. Best Sellers Tabs & Grid (Responsive 2 to 5 Cols) */}
        <section>
           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                 <h3 className="text-lg sm:text-[18px] font-black text-[#0c1a38] flex items-center gap-2">
                    <div className="w-1 h-5 bg-[#ea580c] rounded-full"></div>
                    <span>{lang === 'en' ? (storeSettings.typography?.bestSellersTitleEn || 'Best Sellers') : (storeSettings.typography?.bestSellersTitleTh || 'สินค้าขายดี')}</span>
                 </h3>
                 <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                    <button className="text-[11px] font-bold text-[#ea580c] border border-[#ea580c] rounded-full px-3 py-1 shrink-0">
                      {lang === 'en' ? 'Best Sellers' : 'สินค้าขายดี'}
                    </button>
                    <button onClick={() => navigate?.('product-list')} className="text-[11px] font-bold text-slate-500 hover:text-slate-800 transition-colors px-2 py-1 shrink-0">
                      {lang === 'en' ? 'New Arrivals' : 'สินค้าใหม่'}
                    </button>
                    <button onClick={() => navigate?.('product-list')} className="text-[11px] font-bold text-slate-500 hover:text-slate-800 transition-colors px-2 py-1 shrink-0">
                      {lang === 'en' ? 'Discount Deals' : 'ลดราคา'}
                    </button>
                 </div>
              </div>
              <button onClick={() => navigate?.('product-list')} className="text-xs sm:text-[12px] font-bold text-[#2563eb] flex items-center gap-1 hover:underline self-end sm:self-auto">
                 <span>{lang === 'en' ? 'View All' : 'ดูทั้งหมด'}</span> <ChevronRight className="w-3.5 h-3.5" />
              </button>
           </div>
           
           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-4">
              {loadingProducts ? (
                [1, 2, 3, 4, 5].map((idx) => (
                  <div key={idx} className="h-64 bg-slate-100 rounded-2xl animate-pulse border border-slate-200" />
                ))
              ) : products.length > 0 ? (
                products.slice(0, 5).map((p, i) => (
                  <ProductCard key={p.id || i} product={p} user={user} onRequireLogin={() => navigate?.('login')} onClick={() => navigate?.('product-detail', { product: p })} />
                ))
              ) : (
                <div className="col-span-full py-8 text-center text-slate-400 font-semibold text-sm">
                  {lang === 'en' ? 'No featured products found' : 'ไม่พบรายการสินค้าแนะนำ'}
                </div>
              )}
           </div>
        </section>

        {/* 6. Middle Search Banner: Responsive Mobile to Desktop */}
        <section className="bg-[#0c3175] rounded-2xl sm:rounded-[20px] shadow-xl border border-blue-400/20 relative overflow-hidden min-h-[190px] h-auto py-6 sm:py-8 px-4 sm:px-8 w-full flex flex-col md:flex-row items-center justify-between gap-6">
           
           {/* Mechanic Background Image */}
           <div className="absolute left-0 top-0 bottom-0 w-full md:w-[45%] opacity-20 md:opacity-85 pointer-events-none">
              <img src="https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&q=80" alt="Mechanic" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#0c3175]/80 to-[#0c3175]"></div>
           </div>
           
           <div className="relative z-10 w-full md:max-w-[620px] md:ml-auto">
              <h3 className="text-xl sm:text-2xl lg:text-[26px] font-black text-white mb-1 tracking-tight drop-shadow-sm">
                {lang === 'en' ? 'Find Parts Easily' : 'ค้นหาอะไหล่ได้ง่ายขึ้น'}
              </h3>
              <p className="text-xs sm:text-[14px] text-white/95 font-semibold mb-4 tracking-wide drop-shadow-sm">
                {lang === 'en' ? 'Select your vehicle brand or enter SKU code directly' : 'เพียงเลือกรุ่นรถ หรือ กรอกรหัสสินค้า'}
              </p>
              
              <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-stretch gap-2 w-full">
                 <select
                   value={searchBrand}
                   onChange={(e) => setSearchBrand(e.target.value)}
                   className="bg-white text-slate-900 font-bold rounded-xl px-3.5 py-2.5 text-xs sm:text-[13px] outline-none shadow-sm cursor-pointer border border-slate-200 shrink-0"
                 >
                    <option value="">{lang === 'en' ? '-- Select Brand --' : 'เลือกแบรนด์รถ'}</option>
                    <option value="TOYOTA">Toyota</option>
                    <option value="HONDA">Honda</option>
                    <option value="ISUZU">Isuzu</option>
                    <option value="MAZDA">Mazda</option>
                    <option value="NISSAN">Nissan</option>
                    <option value="FORD">Ford</option>
                 </select>
                 
                 <div className="flex-1 flex items-center gap-2">
                    <input
                      type="text"
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      placeholder={lang === 'en' ? 'Search parts, SKU code...' : 'ค้นหาสินค้า, รหัสสินค้า...'}
                      className="bg-white text-slate-900 rounded-xl px-3.5 sm:px-4 py-2.5 text-xs sm:text-[13px] font-semibold w-full outline-none shadow-sm placeholder-slate-400 border border-slate-200"
                    />
                    <button
                      type="submit"
                      className="bg-[#f97316] hover:bg-[#ea580c] text-white px-4 sm:px-5 py-2.5 rounded-xl shadow-md transition-colors shrink-0 flex items-center justify-center font-black"
                    >
                       <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                 </div>
              </form>
           </div>
        </section>
        
        {/* 7. Complex Grid Rows: 1 col on mobile, 5 cols on lg */}
        {[1, 2].map((row, rowIndex) => (
           <section key={`grid-row-${rowIndex}`} className="grid grid-cols-1 lg:grid-cols-5 gap-3 sm:gap-4 items-stretch">
              {/* Column 1: Promo Banner */}
              <div 
                onClick={() => navigate?.('product-list')}
                className="col-span-1 h-[140px] sm:h-[180px] lg:h-auto bg-slate-900 rounded-2xl sm:rounded-[20px] overflow-hidden relative shadow-sm group cursor-pointer flex flex-col justify-end p-4 sm:p-6"
              >
                 <img 
                   src={rowIndex === 1 ? "https://images.unsplash.com/photo-1600706432502-778e34279b90?w=600&q=80" : "https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?w=600&q=80"} 
                   className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" 
                   alt="Automotive parts" 
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-[#0c1a38]/90 via-transparent to-transparent"></div>
                 
                 <div className="relative z-10">
                    <div className={`${rowIndex === 1 ? 'bg-blue-500' : 'bg-[#f97316]'} text-white text-[9px] sm:text-[10px] font-bold uppercase px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full w-fit mb-1.5 sm:mb-2 tracking-widest shadow-sm`}>
                       {rowIndex === 1 ? (lang === 'en' ? 'Brakes' : 'ระบบเบรก') : (lang === 'en' ? 'Ignition' : 'ระบบจุดระเบิด')}
                    </div>
                    <div className="text-white font-black text-xl sm:text-2xl lg:text-3xl mb-1 leading-tight tracking-tight">
                       {rowIndex === 1 ? <>Ceramic<br className="hidden lg:block"/> Brakes</> : <>Iridium<br className="hidden lg:block"/> Spark Plugs</>}
                    </div>
                 </div>
              </div>
              
              {/* Columns 2-5: 4 Product Cards */}
              <div className="col-span-1 lg:col-span-4 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
                 {loadingProducts ? (
                   [1, 2, 3, 4].map((idx) => (
                     <div key={idx} className="h-64 bg-slate-100 rounded-2xl animate-pulse border border-slate-200" />
                   ))
                 ) : products.length > 0 ? (
                   products.slice(0, 4).map((p, i) => (
                     <ProductCard key={`g${rowIndex}-${p.id || i}`} product={p} user={user} onRequireLogin={() => navigate?.('login')} onClick={() => navigate?.('product-detail', { product: p })} />
                   ))
                 ) : (
                   <div className="col-span-full py-8 text-center text-slate-400 font-semibold text-sm">
                     {lang === 'en' ? 'No products available' : 'ยังไม่มีสินค้าในหมวดหมู่นี้'}
                   </div>
                 )}
              </div>
           </section>
        ))}

      </main>

      {/* 9. Feature Trust Banner (Responsive Grid) */}
      <section className="bg-white border-y border-slate-200/80 w-full shadow-xs relative z-10 py-5 sm:py-6">
         <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-0 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 items-center w-full">
            
            <div className="flex items-center gap-4 justify-center py-2 sm:py-0">
               <Truck className="w-8 h-8 sm:w-10 sm:h-10 text-[#1e3a8a] stroke-[1.5] shrink-0" />
               <div className="flex flex-col">
                  <div className="font-black text-[#0c1a38] text-sm sm:text-[16px] mb-0.5">จัดส่งรวดเร็วทั่วไทย</div>
                  <div className="text-xs sm:text-[13px] text-slate-400 font-bold">ภายใน 1-2 วันทำการ</div>
               </div>
            </div>
            
            <div className="flex items-center gap-4 justify-center py-2 sm:py-0">
               <ShieldCheck className="w-8 h-8 sm:w-10 sm:h-10 text-[#1e3a8a] stroke-[1.5] shrink-0" />
               <div className="flex flex-col">
                  <div className="font-black text-[#0c1a38] text-sm sm:text-[16px] mb-0.5">สินค้าของแท้ 100%</div>
                  <div className="text-xs sm:text-[13px] text-slate-400 font-bold">รับประกันคุณภาพทุกชิ้น</div>
               </div>
            </div>
            
            <div className="flex items-center gap-4 justify-center py-2 sm:py-0">
               <UserPlus className="w-8 h-8 sm:w-10 sm:h-10 text-[#1e3a8a] stroke-[1.5] shrink-0" />
               <div className="flex flex-col">
                  <div className="font-black text-[#0c1a38] text-sm sm:text-[16px] mb-0.5">ทีมงานพร้อมดูแล</div>
                  <div className="text-xs sm:text-[13px] text-slate-400 font-bold">บริการด้วยความจริงใจ</div>
               </div>
            </div>

         </div>
      </section>

      {/* 10. News & Articles */}
      <div className="w-full max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8">
         <section className="w-full mt-8 sm:mt-10 mb-12 sm:mb-16">
            <div className="bg-gradient-to-br from-[#dbeafe] via-[#eff6ff] to-white rounded-[24px] border border-blue-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-5 sm:p-8 flex flex-col lg:flex-row items-stretch lg:items-center gap-6 lg:gap-8 relative overflow-hidden">
               
               {/* Decorative background shapes */}
               <div className="absolute top-0 left-0 w-64 h-64 bg-blue-200/40 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
               <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-50/50 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none"></div>

               {/* Left Column: Title & Description */}
               <div className="w-full lg:w-[28%] flex flex-col items-start relative z-10 lg:pl-4">
                  <h3 className="text-2xl sm:text-[32px] font-black text-[#0c1a38] mb-1.5 sm:mb-2 tracking-tight leading-[1.2]">
                     {lang === 'en' ? (
                       <>News &<br className="hidden sm:block lg:block"/> Articles</>
                     ) : (
                       <>ข่าวสาร &<br className="hidden sm:block lg:block"/> บทความ</>
                     )}
                  </h3>
                  <p className="text-xs sm:text-[13px] text-slate-600 font-bold mb-4 sm:mb-6 leading-relaxed">
                     {lang === 'en' ? 'Latest updates, tech tips, and special promotions' : 'อัปเดตความรู้ เทคนิค และโปรโมชั่นล่าสุด'}
                  </p>
                  <button
                     onClick={() => navigate?.('articles')}
                     className="bg-[#0b1f42] hover:bg-[#07152b] text-white px-5 sm:px-6 py-2.5 rounded-full font-bold text-xs sm:text-[13px] transition-all shadow-sm flex items-center gap-2"
                  >
                     <span>{lang === 'en' ? 'View All' : 'ดูทั้งหมด'}</span>
                     <ChevronRight className="w-3.5 h-3.5" />
                  </button>
               </div>
               
               {/* Right Column: Cards Grid */}
               <div className="w-full lg:w-[72%] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5 relative z-10">
                  {(articles.length > 0 ? articles.slice(0, 3) : [
                     {
                       id: 'art-fallback-1',
                       titleTh: 'วิธีดูแลเบรกให้ปลอดภัย ยืดอายุการใช้งานให้ยาวนานขึ้น',
                       titleEn: 'How to maintain your brakes for safety and long life',
                       contentTh: 'แนะนำวิธีตรวจเช็กความหนาของผ้าเบรกและระดับน้ำมันเบรก เพื่อให้ระบบเบรกทำงานได้อย่างมีประสิทธิภาพสูงสุด',
                       contentEn: 'Tips on checking brake pad thickness and brake fluid levels to ensure optimal braking performance.',
                       coverImage: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=500&q=80',
                       category: 'Safety',
                       createdAt: '2026-06-12',
                     },
                     {
                       id: 'art-fallback-2',
                       titleTh: 'เปลี่ยนน้ำมันเครื่องอย่างไร ให้เหมาะกับรถของคุณ',
                       titleEn: 'Choosing the right engine oil for your car',
                       contentTh: 'เจาะลึกความหนืดและมาตรฐานน้ำมันเครื่องสังเคราะห์แท้ 100% สำหรับรถยนต์เบนซิน ดีเซล และไฮบริด',
                       contentEn: 'Detailed guide on viscosity ratings and synthetic engine oil specifications for modern vehicles.',
                       coverImage: 'https://images.unsplash.com/photo-1618424181497-157f25b6ddd5?w=500&q=80',
                       category: 'Maintenance',
                       createdAt: '2026-06-08',
                     },
                     {
                       id: 'art-fallback-3',
                       titleTh: 'โปรโมชันพิเศษ ประจำเดือนนี้ ลดสูงสุด 20%',
                       titleEn: 'Special monthly promotions up to 20% off',
                       contentTh: 'พบกับอะไหล่แท้ตรงรุ่นราคาพิเศษ ไส้กรอง แบตเตอรี่ และหัวเทียน รับส่วนลดเพิ่มสำหรับสมาชิก',
                       contentEn: 'Discover exclusive genuine auto parts deals, filters, batteries and spark plugs with member discounts.',
                       coverImage: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&q=80',
                       category: 'Deals',
                       createdAt: '2026-06-05',
                     },
                  ]).map((art, idx) => {
                     const title = lang === 'en' ? (art.titleEn || art.titleTh) : (art.titleTh || art.titleEn);
                     const formattedDate = art.createdAt
                       ? new Date(art.createdAt).toLocaleDateString(lang === 'en' ? 'en-US' : 'th-TH', {
                           year: 'numeric',
                           month: 'short',
                           day: 'numeric',
                         })
                       : '';
                     return (
                       <div
                          key={art.id || idx}
                          onClick={() => navigate?.('article-detail', { article: art })}
                          className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 group cursor-pointer hover:shadow-md transition-all flex flex-col p-3"
                       >
                          <div className="w-full aspect-[16/9] sm:aspect-[21/9] rounded-xl overflow-hidden relative mb-3 sm:mb-4 bg-slate-100">
                             <img
                                src={
                                   art.coverImage ||
                                   "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&q=80"
                                }
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                alt={title}
                             />
                             <div className="absolute top-2 left-2 bg-[#2563eb] text-white text-[9px] font-black px-2 py-0.5 rounded shadow-sm">
                                {art.category || (lang === 'en' ? 'Article' : 'บทความ')}
                             </div>
                          </div>
                          <div className="px-1 flex flex-col flex-1 pb-1">
                             <h4 className="font-black text-xs sm:text-[14px] text-[#0c1a38] group-hover:text-[#2563eb] transition-colors mb-2 leading-snug line-clamp-2">
                                {title}
                             </h4>
                             <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-3">
                                {lang === 'en' ? art.contentEn : art.contentTh}
                             </p>
                             <div className="flex justify-between items-center mt-auto pt-2 border-t border-slate-50">
                                <span className="text-[10px] sm:text-[11px] text-slate-400 font-bold">
                                   {formattedDate}
                                </span>
                                <button className="text-[#2563eb] hover:text-[#1e40af] text-[11px] font-bold flex items-center gap-0.5 transition-colors">
                                   <span>{lang === 'en' ? 'Read' : 'อ่านต่อ'}</span>
                                   <ChevronRight className="w-3 h-3" />
                                </button>
                             </div>
                          </div>
                       </div>
                     );
                  })}
               </div>
            </div>
         </section>
      </div>

      <Footer navigate={navigate} />
    </div>
  );
};

export default Home;
