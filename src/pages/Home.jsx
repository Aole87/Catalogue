import React, { useState, useEffect } from 'react';
import {
  Car,
  Search,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  ShoppingBag,
  Star,
  Clock,
  Heart,
  Eye,
  Lock,
  FileText
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import VehicleSelectorModal from '../components/vehicle/VehicleSelectorModal';
import QuickViewModal from '../components/product/QuickViewModal';
import ProductCard from '../components/product/ProductCard';
import { useVehicle } from '../context/VehicleContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import ApiClient from '../utils/apiClient';

export const Home = ({ navigate, user, setUser }) => {
  const { selectedVehicle, isVehicleSelected, openSelectorModal } = useVehicle();
  const { addToCart } = useCart();
  const { t, lang } = useLanguage();

  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [activePopularTab, setActivePopularTab] = useState('item1');
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // Load catalog data & articles from API
  useEffect(() => {
    let mounted = true;
    const loadHomepageData = async () => {
      try {
        setLoadingProducts(true);
        const [prodRes, artRes] = await Promise.all([
          ApiClient.getProducts({ pageSize: 12, sortBy: 'createdAt', sortOrder: 'desc' }),
          ApiClient.get('/articles').catch(() => ({ articles: [] })),
        ]);

        if (mounted) {
          setFeaturedProducts(prodRes.data || []);
          if (artRes?.data?.articles || artRes?.articles) {
            setArticles(artRes.data?.articles || artRes.articles);
          }
        }
      } catch (err) {
        console.error('Failed to load homepage data', err);
      } finally {
        if (mounted) setLoadingProducts(false);
      }
    };

    loadHomepageData();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="min-h-screen bg-[#ffffff] text-slate-900 flex flex-col font-sans selection:bg-[#0d3c90] selection:text-white">
      {/* 1. Global Buy@Unimart Navbar */}
      <Navbar navigate={navigate} user={user} setUser={setUser} />

      {/* 2. Hero Section: Dual Side-by-Side Rounded Banners matching exact image layout */}
      <section className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
          {/* Circular Navigation Buttons on Hero Edges */}
          <button
            className="absolute left-[-16px] top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[#0d3c90] text-white hidden xl:flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
            title="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            className="absolute right-[-16px] top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[#0d3c90] text-white hidden xl:flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
            title="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Left Hero Card: GoPro Hero 10 Style */}
          <div className="rounded-[32px] bg-gradient-to-r from-[#e0f2fe] via-[#ebf8ff] to-[#f0f9ff] p-8 sm:p-10 relative overflow-hidden flex flex-col justify-between min-h-[380px] border border-blue-100/60 shadow-xs group">
            <div className="absolute right-[-40px] top-[-40px] w-72 h-72 bg-[#0d3c90]/10 rounded-full blur-xl pointer-events-none"></div>

            <div className="relative z-10 max-w-xs">
              <span className="text-xs font-extrabold text-[#0d3c90] uppercase tracking-wider block mb-2">
                Quality For Wise Pkg
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-[#0c1a38] tracking-tight mb-3 leading-tight">
                GoPro Hero 10
              </h2>
              <div className="text-2xl font-black text-[#0d3c90] font-mono mb-6">
                {user ? '$249.50' : t('loginToViewPrice')}
              </div>
              <button
                onClick={() => user ? navigate('product-list') : navigate('login')}
                className="px-8 py-3 rounded-full bg-[#f97316] hover:bg-[#ea580c] text-white font-extrabold text-xs tracking-wide shadow-md shadow-orange-500/20 transition-all transform group-hover:scale-105"
              >
                {user ? t('buyNow') : t('signIn')}
              </button>
            </div>

            <div className="absolute right-4 bottom-4 w-1/2 max-w-[280px] pointer-events-none transition-transform duration-500 group-hover:scale-105">
              <img
                src="https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&q=80"
                alt="GoPro Hero 10"
                className="w-full object-contain drop-shadow-2xl"
              />
            </div>
          </div>

          {/* Right Hero Card: One Mini Pro Style */}
          <div className="rounded-[32px] bg-gradient-to-r from-[#ffedd5] via-[#fff7ed] to-[#fed7aa] p-8 sm:p-10 relative overflow-hidden flex flex-col justify-between min-h-[380px] border border-orange-200/60 shadow-xs group">
            <div className="absolute right-[-40px] top-[-40px] w-72 h-72 bg-[#f97316]/10 rounded-full blur-xl pointer-events-none"></div>

            <div className="relative z-10 max-w-xs">
              <span className="text-xs font-extrabold text-[#f97316] uppercase tracking-wider block mb-2">
                Quality For Smart Pro
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-[#0c1a38] tracking-tight mb-3 leading-tight">
                One Mini Pro
              </h2>
              <div className="text-2xl font-black text-[#f97316] font-mono mb-6">
                {user ? '$5-3.90' : t('loginToViewPrice')}
              </div>
              <button
                onClick={() => navigate('product-list')}
                className="px-8 py-3 rounded-full bg-white hover:bg-slate-900 text-slate-900 hover:text-white font-extrabold text-xs tracking-wide shadow-md transition-all transform group-hover:scale-105 border border-slate-200"
              >
                {t('getDetails')}
              </button>
            </div>

            <div className="absolute right-4 bottom-4 w-1/2 max-w-[280px] pointer-events-none transition-transform duration-500 group-hover:scale-105">
              <img
                src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80"
                alt="One Mini Pro"
                className="w-full object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Popular By Category Section */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-[#0c1a38] tracking-tight">
            {t('popularCategories')}
          </h2>
          <button
            onClick={() => navigate('product-list')}
            className="px-5 py-2 rounded-full bg-[#e0edff] hover:bg-[#0d3c90] text-[#1d4ed8] hover:text-white text-xs font-extrabold transition-all flex items-center gap-1 shadow-xs"
          >
            <span>{t('getCategory')}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 6 Category Rounded Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[
            { id: 'cat1', title: 'Apple', count: '(16)', img: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=200&q=80' },
            { id: 'cat2', title: 'Win-9', count: '(5)', img: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=200&q=80' },
            { id: 'cat3', title: 'Apps', count: '(39)', img: 'https://images.unsplash.com/photo-1586105251261-72a756497a11?w=200&q=80' },
            { id: 'cat4', title: 'Air 11', count: '', img: 'https://images.unsplash.com/photo-1618424181497-157f25b6ddd5?w=200&q=80' },
            { id: 'cat5', title: 'Air 15 S', count: '', img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80' },
            { id: 'cat6', title: 'Intel', count: '(30)', img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&q=80' },
          ].map((item) => (
            <div
              key={item.id}
              onClick={() => navigate('product-list')}
              className="bg-[#f8fafc] hover:bg-white rounded-3xl p-4 flex flex-col justify-between items-center text-center group cursor-pointer border border-slate-200/70 hover:border-[#0d3c90] hover:shadow-lg transition-all duration-300 min-h-[190px]"
            >
              <div className="w-full text-center">
                <h3 className="font-extrabold text-xs text-[#0c1a38] group-hover:text-[#0d3c90] transition-colors">
                  {item.title} <span className="text-slate-400 font-normal">{item.count}</span>
                </h3>
              </div>
              <div className="w-24 h-24 my-2 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                <img
                  src={item.img}
                  alt={item.title}
                  className="max-h-full max-w-full object-contain drop-shadow-sm rounded-xl"
                />
              </div>
            </div>
          ))}
        </div>

        {/* 2 Highlight Feature Split Banners Below Category Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-[32px] bg-[#fff7ed] p-8 relative overflow-hidden flex flex-col justify-between min-h-[240px] border border-orange-100 group">
            <div className="relative z-10 max-w-xs">
              <span className="px-3 py-1 rounded-full bg-[#f97316] text-white font-black text-[10px] uppercase shadow-xs mb-3 inline-block">
                200M Units
              </span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Verified Material
              </span>
              <h3 className="text-2xl font-black text-[#0c1a38] tracking-tight mb-4">
                Plane Lakoro Tech
              </h3>
              <button
                onClick={() => user ? navigate('product-list') : navigate('login')}
                className="px-6 py-2.5 rounded-full bg-[#f97316] hover:bg-[#ea580c] text-white font-extrabold text-xs shadow-md transition-all"
              >
                {t('buyNow')}
              </button>
            </div>
            <div className="absolute right-4 bottom-2 w-1/2 max-w-[200px] pointer-events-none transition-transform duration-300 group-hover:scale-105">
              <img
                src="https://images.unsplash.com/photo-1558002038-1055907df827?w=400&q=80"
                alt="Plane Lakoro Tech"
                className="w-full object-contain drop-shadow-xl"
              />
            </div>
          </div>

          <div className="rounded-[32px] bg-[#1e293b] p-8 relative overflow-hidden flex flex-col justify-between min-h-[240px] border border-slate-700 text-white group">
            <div className="relative z-10 max-w-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Featured Series
              </span>
              <h3 className="text-2xl font-black text-white tracking-tight mb-4">
                Sell 1 To Pre-max
              </h3>
              <button
                onClick={() => navigate('product-list')}
                className="px-6 py-2.5 rounded-full bg-[#f97316] hover:bg-[#ea580c] text-white font-extrabold text-xs shadow-md transition-all"
              >
                {t('getDetails')}
              </button>
            </div>
            <div className="absolute right-4 bottom-2 w-1/2 max-w-[200px] pointer-events-none transition-transform duration-300 group-hover:scale-105">
              <img
                src="https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&q=80"
                alt="Sell 1 To Pre-max"
                className="w-full object-contain drop-shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 4. Weekly Best Deals Section */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full relative">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-black text-[#0c1a38] tracking-tight">
            {t('weeklyBestDeals')}
          </h2>
        </div>

        {/* Product Cards Row with Member-Only Pricing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-2 sm:px-6">
          {[
            { id: 'w1', brand: 'Brembo', name: 'High Performance Ceramic Brake Pad Set', price: 89.00, compareAtPrice: 120.00, primaryImage: 'https://images.unsplash.com/photo-1622445262464-84b1456045b6?w=400&q=80' },
            { id: 'w2', brand: 'Bosch', name: 'Iridium Spark Plug Platinum Edition (Pack of 4)', price: 45.00, compareAtPrice: 60.00, primaryImage: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&q=80' },
            { id: 'w3', brand: 'Mobil 1', name: 'Full Synthetic Engine Oil 5W-30 (5 Liters)', price: 39.50, compareAtPrice: 55.00, primaryImage: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400&q=80' },
            { id: 'w4', brand: 'Anker', name: 'Multi-Port USB-C Hub Car Adapter Dock', price: 29.90, compareAtPrice: 42.00, primaryImage: 'https://images.unsplash.com/photo-1618424181497-157f25b6ddd5?w=400&q=80' },
          ].map((deal) => (
            <ProductCard
              key={deal.id}
              product={deal}
              user={user}
              onClick={() => navigate('product-list')}
              onRequireLogin={() => navigate('login')}
            />
          ))}
        </div>
      </section>

      {/* 5. Brand Logos Bar Section */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-[#0c1a38] tracking-tight">
            {t('brandLogos')}
          </h2>
          <button
            onClick={() => navigate('product-list')}
            className="px-5 py-2 rounded-full bg-[#e0edff] hover:bg-[#0d3c90] text-[#1d4ed8] hover:text-white text-xs font-extrabold transition-all flex items-center gap-1 shadow-xs"
          >
            <span>{t('moreBrands')}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { name: 'Apple' }, { name: 'SAMSUNG' }, { name: 'logitech' },
            { name: 'Lenovo' }, { name: 'intel' }, { name: 'FUJITSU' },
            { name: 'Mio' }, { name: 'ASUS' }, { name: 'Panasonic' },
            { name: 'intel inside' }, { name: 'BOSCH' }, { name: 'DENSO' }
          ].map((b, idx) => (
            <div
              key={idx}
              onClick={() => navigate('product-list')}
              className="bg-[#f8fafc] hover:bg-white border border-slate-200/80 rounded-2xl py-4 px-6 flex items-center justify-center text-center cursor-pointer transition-all duration-200 hover:border-[#0d3c90] hover:shadow-sm"
            >
              <span className="font-black text-xs tracking-wider text-slate-800">
                {b.name}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Articles Section (Live from Articles API) */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">Top News</span>
            <h2 className="text-2xl font-black text-[#0c1a38] tracking-tight">
              {t('articlesNews')}
            </h2>
          </div>
          <button
            onClick={() => navigate('product-list')}
            className="px-5 py-2 rounded-full bg-[#e0edff] hover:bg-[#0d3c90] text-[#1d4ed8] hover:text-white text-xs font-extrabold transition-all flex items-center gap-1 shadow-xs"
          >
            <span>{t('showAllArticles')}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {articles.slice(0, 4).map((art) => (
            <div
              key={art.id}
              className="bg-[#f8fafc] hover:bg-white rounded-3xl p-4 border border-slate-200/80 hover:border-[#0d3c90] flex flex-col justify-between group cursor-pointer transition-all duration-300 hover:shadow-lg"
            >
              <div>
                <div className="w-full aspect-[16/10] rounded-2xl overflow-hidden mb-3 bg-slate-100">
                  <img
                    src={art.coverImage}
                    alt={lang === 'th' ? art.titleTh : art.titleEn}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="text-[10px] font-bold text-[#0d3c90] mb-1 uppercase tracking-wider">
                  {art.category}
                </div>
                <h4 className="font-bold text-xs text-[#0c1a38] group-hover:text-[#0d3c90] transition-colors line-clamp-2 leading-snug mb-2">
                  {lang === 'th' ? art.titleTh : art.titleEn}
                </h4>
                <p className="text-[11px] text-slate-500 line-clamp-2 mb-3">
                  {lang === 'th' ? art.contentTh : art.contentEn}
                </p>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => navigate('product-list')}
                  className="px-4 py-1.5 rounded-full bg-[#e0edff] text-[#1d4ed8] hover:bg-[#0d3c90] hover:text-white text-xs font-extrabold transition-colors shadow-xs"
                >
                  {t('readMore')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Giant Signature Footer */}
      <Footer navigate={navigate} />

      {/* Global Vehicle Selector Modal */}
      <VehicleSelectorModal onSelectComplete={(v) => navigate('product-list', { filters: { vehicleVariantId: v.variantId } })} />

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={Boolean(quickViewProduct)}
        onClose={() => setQuickViewProduct(null)}
        onNavigate={navigate}
      />
    </div>
  );
};

export default Home;
