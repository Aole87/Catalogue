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

  // Mock products with specific data to match the mockup
  const mockProducts = [
    {
      id: 'p1',
      name: 'BOSCH ผ้าเบรกหน้า Ceramic สำหรับ Toyota Altis 1.6/1.8',
      brand: { name: 'BOSCH' },
      price: 2850,
      compareAtPrice: 3450,
      primaryImage: 'https://images.unsplash.com/photo-1622445262464-84b1456045b6?w=400&q=80',
      badge: 'ขายดี',
      badgeColor: 'bg-[#f97316]',
      shortDescription: 'ผ้าเบรกเซรามิกเกรดพรีเมียม ไร้เสียงรบกวน ฝุ่นน้อย ถนอมจานเบรก ระยะเบรกสั้นมั่นใจ สำหรับ Toyota Altis 1.6/1.8',
      description: JSON.stringify({
        general: 'ผ้าเบรกหน้า BOSCH Ceramic ออกแบบมาเป็นพิเศษสำหรับ Toyota Altis ทนความร้อนสูง ลดฝุ่นจับล้อแม็กซ์ ไร้เสียงเอี๊ยดกวนใจ เพิ่มความมั่นใจในทุกจังหวะเบรก',
        specific: 'ความหนา 17.5 มม. | เนื้อเซรามิก NAO ทนความร้อนสูงสุด 650°C | สัมประสิทธิ์แรงเสียดทาน Class FF (0.35-0.45) | ตรงรุ่นสำหรับ Toyota Altis 1.6/1.8 ปี 2008-2019',
        other: 'รับประกันของแท้ 100% โดย BOSCH Thailand 1 ปี หรือ 20,000 กม. | แถมฟรีแผ่นชิมกันเสียงและจาระบีสังเคราะห์ในกล่อง'
      }),
      warrantyText: 'รับประกันของแท้ 100% โดย BOSCH Thailand 1 ปี หรือ 20,000 กม.',
    },
    {
      id: 'p2',
      name: 'NGK หัวเทียน Iridium Spark Plug (แพ็ค 4 ชิ้น)',
      brand: { name: 'NGK' },
      price: 1680,
      compareAtPrice: 2200,
      primaryImage: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&q=80',
      badge: 'ขายดี',
      badgeColor: 'bg-[#f97316]',
      shortDescription: 'หัวเทียนอิริเดียม จุดระเบิดแม่นยำ เผาไหม้หมดจด ประหยัดน้ำมัน อายุการใช้งานยาวนานกว่า 100,000 กม.',
      description: JSON.stringify({
        general: 'หัวเทียน NGK Laser Iridium คุณภาพระดับพรีเมียม แกนอิริเดียมขนาด 0.6 มม. เพิ่มประสิทธิภาพการจุดระเบิดในห้องเผาไหม้',
        specific: 'ขนาดเกลียว 14 มม. | ระยะเกลียว 1.25 มม. | ขนาดแกนกลาง Iridium 0.6 มม. | ค่าความร้อน เบอร์ 6 | รองรับเครื่องยนต์เบนซินหัวฉีดตรงและไฮบริด',
        other: 'รับประกันความทนทาน ใช้งานยาวนาน 100,000 กิโลเมตร | ควรกวดขันตามค่าทอร์กที่กำหนด (25-30 Nm)'
      }),
      warrantyText: 'รับประกันความทนทาน 100,000 กม. ตามมาตรฐาน NGK Japan',
    },
    {
      id: 'p3',
      name: 'MANN FILTER ไส้กรองน้ำมันเครื่อง Engine Oil Filter',
      brand: { name: 'MANN FILTER' },
      price: 320,
      compareAtPrice: 420,
      primaryImage: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400&q=80',
      badge: 'แนะนำ',
      badgeColor: 'bg-blue-500',
      shortDescription: 'ไส้กรองน้ำมันเครื่องมาตรฐานเยอรมัน ดักจับสิ่งสกปรกและอนุภาคโลหะได้อย่างมีประสิทธิภาพ ยืดอายุเครื่องยนต์',
      description: JSON.stringify({
        general: 'ไส้กรองน้ำมันเครื่อง MANN-FILTER ผลิตด้วยวัสดุกรองสังเคราะห์พิเศษ กรองละอองสิ่งเจือปนได้ละเอียดสูงสุด รักษาแรงดันน้ำมันเครื่องได้อย่างคงที่',
        specific: 'เส้นผ่านศูนย์กลางภายนอก 76 มม. | ขนาดเกลียว 3/4-16 UNF | พร้อมวาล์ว Bypass Pressure 1.0 bar และ Anti-drain back valve ป้องกันน้ำมันไหลย้อนกลับ',
        other: 'เปลี่ยนถ่ายทุกๆ 10,000 กม. หรือพร้อมการเปลี่ยนถ่ายน้ำมันเครื่อง | สินค้านำเข้าแท้จากเยอรมนี'
      }),
      warrantyText: 'รับประกัน 6 เดือน หรือ 10,000 กม. ตามรอบเปลี่ยนถ่าย',
    },
    {
      id: 'p4',
      name: 'KYB โช้คอัพหน้า Excel-G (หน้า/ซ้าย-ขวา)',
      brand: { name: 'KYB' },
      price: 2890,
      compareAtPrice: 3600,
      primaryImage: 'https://images.unsplash.com/photo-1618424181497-157f25b6ddd5?w=400&q=80',
      badge: 'ขายดี',
      badgeColor: 'bg-[#f97316]',
      shortDescription: 'โช้คอัพแก๊สประสิทธิภาพสูง ซับแรงกระแทกได้ดีเยี่ยม นุ่มหนึบ ทรงตัวมั่นใจทุกโค้ง',
      description: JSON.stringify({
        general: 'โช้คอัพแก๊สระบบ Twin Tube จาก KYB คืนตัวเร็ว เข้าโค้งนิ่ง ลดการโคลงตัวของรถยนต์ เพิ่มสมรรถนะการทรงตัวบนทุกสภาพถนน',
        specific: 'โครงสร้างแบบ Twin Tube บรรจุก๊าซไนโตรเจนแรงดันต่ำร่วมกับน้ำมันไฮดรอลิกเกรดสูง | แกนชุบฮาร์ดโครเมียมความแข็งแรงสูง ป้องกันสนิมและรอยขีดข่วน',
        other: 'รับประกัน 1 ปี หรือ 20,000 กม. โดย KYB ประเทศไทย | แนะนำให้เปลี่ยนเป็นคู่หน้าเพื่อความสมดุลของการทรงตัว'
      }),
      warrantyText: 'รับประกัน 1 ปี หรือ 20,000 กม. โดย KYB ประเทศไทย',
    },
    {
      id: 'p5',
      name: 'ACDelco แบตเตอรี่รถยนต์ 55B24L (12V 45Ah)',
      brand: { name: 'ACDelco' },
      price: 3990,
      compareAtPrice: 6000,
      primaryImage: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&q=80',
      badge: 'แนะนำ',
      badgeColor: 'bg-blue-500',
      shortDescription: 'แบตเตอรี่กึ่งแห้ง ไม่ต้องดูแลรักษาน้ำกลั่น กำลังสตาร์ทสูง ทนทานต่อสภาพอากาศร้อน',
      description: JSON.stringify({
        general: 'แบตเตอรี่มาตรฐานสากลจาก ACDelco แผ่นธาตุหนาพิเศษ เก็บประจุไฟได้สม่ำเสมอ อายุการใช้งานยาวนาน จ่ายกระแสไฟเสถียรสำหรับรถยนต์ยุคใหม่',
        specific: 'แรงดันไฟฟ้า 12V | ความจุ 45Ah | ค่ากระแสสตาร์ท CCA 430A | ขั้ว L (ซ้าย) | ขนาดมิติ 128 x 238 x 227 มม.',
        other: 'รับประกัน 12 เดือนเต็ม เคลมได้ทุกลูกกรณีความบกพร่องจากการผลิต | มีตาแมวตรวจเช็คสถานะไฟ'
      }),
      warrantyText: 'รับประกัน 12 เดือน เคลมลูกใหม่ตามเงื่อนไข ACDelco',
    },
    {
      id: 'p6',
      name: 'BOSCH กรองอากาศ Cabin Filter (ภายในห้องโดยสาร)',
      brand: { name: 'BOSCH' },
      price: 450,
      compareAtPrice: 590,
      primaryImage: 'https://images.unsplash.com/photo-1618424181497-157f25b6ddd5?w=400&q=80',
      badge: 'ขายดี',
      badgeColor: 'bg-[#f97316]',
      shortDescription: 'ไส้กรองแอร์ห้องโดยสาร ดักจับฝุ่นละออง PM2.5 เกสรดอกไม้ และเชื้อโรคในอากาศ',
      description: 'กรองแอร์ BOSCH คุณภาพสูง ช่วยให้อากาศภายในห้องโดยสารสะอาด สดชื่น ปราศจากกลิ่นอับชื้น'
    }
  ];

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
              {mockProducts.slice(0,5).map((p, i) => (
                <ProductCard key={i} product={p} user={user} onRequireLogin={() => navigate?.('login')} onClick={() => navigate?.('product-detail', { product: p })} />
              ))}
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
              <div className="col-span-1 h-[140px] sm:h-[180px] lg:h-auto bg-slate-900 rounded-2xl sm:rounded-[20px] overflow-hidden relative shadow-sm group cursor-pointer flex flex-col justify-end p-4 sm:p-6">
                 <img src={rowIndex === 1 ? "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80" : "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&q=80"} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" alt="Promo" />
                 <div className="absolute inset-0 bg-gradient-to-t from-[#0c1a38]/90 via-transparent to-transparent"></div>
                 
                 <div className="relative z-10">
                    <div className={`${rowIndex === 1 ? 'bg-blue-500' : 'bg-[#f97316]'} text-white text-[9px] sm:text-[10px] font-bold uppercase px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full w-fit mb-1.5 sm:mb-2 tracking-widest shadow-sm`}>
                       {rowIndex === 1 ? 'แนะนำ' : 'สินค้าใหม่'}
                    </div>
                    <div className="text-white font-black text-xl sm:text-2xl lg:text-3xl mb-1 leading-tight tracking-tight">
                       {rowIndex === 1 ? <>Action<br className="hidden lg:block"/> Camera</> : <>GoPro<br className="hidden lg:block"/> Hero 10</>}
                    </div>
                 </div>
              </div>
              
              {/* Columns 2-5: 4 Product Cards */}
              <div className="col-span-1 lg:col-span-4 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
                 {mockProducts.slice(0,4).map((p, i) => (
                   <ProductCard key={`g${rowIndex}-${i}`} product={p} user={user} onRequireLogin={() => navigate?.('login')} onClick={() => navigate?.('product-detail', { product: p })} />
                 ))}
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
