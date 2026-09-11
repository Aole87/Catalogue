import React, { useState, useEffect } from 'react';
import {
  Car,
  Search,
  ArrowRight,
  ShieldCheck,
  Database,
  Wrench,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Layers,
  Tag,
  Flame,
  Truck,
  RotateCcw,
  Headphones,
  Sparkles,
  ShoppingBag,
  Star,
  Clock,
  Award,
  Zap,
  Heart,
  Eye,
  ArrowUpRight
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import VehicleSelectorModal from '../components/vehicle/VehicleSelectorModal';
import QuickViewModal from '../components/product/QuickViewModal';
import { useVehicle } from '../context/VehicleContext';
import { useCart } from '../context/CartContext';
import ApiClient from '../utils/apiClient';

export const Home = ({ navigate, user, setUser }) => {
  const { selectedVehicle, isVehicleSelected, openSelectorModal } = useVehicle();
  const { addToCart } = useCart();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [makes, setMakes] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [activeProductTab, setActiveProductTab] = useState('all');
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // Load initial catalog data
  useEffect(() => {
    let mounted = true;
    const loadHomepageData = async () => {
      try {
        setLoadingProducts(true);
        const [prodRes, catRes, brandRes, makeRes] = await Promise.all([
          ApiClient.getProducts({ pageSize: 12, sortBy: 'createdAt', sortOrder: 'desc' }),
          ApiClient.getCategoryTree(),
          ApiClient.getBrands(),
          ApiClient.getMakes(true),
        ]);

        if (mounted) {
          setFeaturedProducts(prodRes.data || []);
          setCategories(catRes.data || catRes.categories || []);
          setBrands(brandRes.data || brandRes.brands || []);
          setMakes(makeRes.makes || makeRes.data || []);
        }
      } catch (err) {
        console.error('Failed to load homepage showcase data', err);
      } finally {
        if (mounted) setLoadingProducts(false);
      }
    };

    loadHomepageData();
    return () => { mounted = false; };
  }, []);

  const handleProductClick = (product) => {
    navigate('product-detail', { product });
  };

  const getFilteredProducts = () => {
    if (activeProductTab === 'bestseller') return featuredProducts.slice(0, 6);
    if (activeProductTab === 'new') return [...featuredProducts].reverse().slice(0, 6);
    if (activeProductTab === 'sale') return featuredProducts.filter((_, idx) => idx % 2 === 0);
    return featuredProducts.slice(0, 6);
  };

  return (
    <div className="min-h-screen bg-[#ffffff] text-slate-900 flex flex-col font-sans selection:bg-[#215ada] selection:text-white">
      {/* Global Navbar */}
      <Navbar navigate={navigate} user={user} setUser={setUser} />

      {/* 1. Hero Showcase (Two Side-by-Side Rounded Cards with Arrow Buttons) */}
      <section className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
          {/* Left Hero Card: GoPro Hero 10 Style */}
          <div className="rounded-[32px] bg-[#f4f6fb] p-8 sm:p-10 relative overflow-hidden flex flex-col justify-between min-h-[420px] border border-slate-100 group transition-all duration-300 hover:shadow-xl">
            {/* Ambient Background Circles */}
            <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-blue-100/50 rounded-full blur-2xl pointer-events-none"></div>

            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Weekend Special Offer
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-[#0e1932] tracking-tight mb-3">
                GoPro Hero 10
              </h2>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-xs font-semibold text-slate-400 line-through">$599.00</span>
                <span className="text-2xl font-black text-[#215ada] font-mono">$249.00</span>
                <span className="px-2 py-0.5 rounded-full bg-[#ff4c1a] text-white text-[10px] font-bold">
                  -50%
                </span>
              </div>
            </div>

            {/* Product Image Floating on Right */}
            <div className="absolute right-4 bottom-4 w-1/2 max-w-[280px] pointer-events-none transition-transform duration-500 group-hover:scale-105 group-hover:-translate-y-2">
              <img
                src="https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&q=80"
                alt="GoPro Hero 10"
                className="w-full object-contain drop-shadow-2xl"
              />
            </div>

            {/* Action Round Blue Button */}
            <div className="relative z-10">
              <button
                onClick={() => navigate('product-list')}
                className="w-12 h-12 rounded-full bg-[#215ada] hover:bg-[#163d94] text-white flex items-center justify-center transition-all shadow-lg shadow-blue-600/30 group-hover:scale-110"
                title="Shop Now"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Right Hero Card: Osmo Mini Pro Style */}
          <div className="rounded-[32px] bg-[#f4f6fb] p-8 sm:p-10 relative overflow-hidden flex flex-col justify-between min-h-[420px] border border-slate-100 group transition-all duration-300 hover:shadow-xl">
            {/* Ambient Background Circles */}
            <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-orange-100/40 rounded-full blur-2xl pointer-events-none"></div>

            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Exclusive Offer 2024
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-[#0e1932] tracking-tight mb-3">
                Osmo Mini Pro
              </h2>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-xs font-semibold text-slate-400 line-through">$799.00</span>
                <span className="text-2xl font-black text-[#215ada] font-mono">$349.00</span>
                <span className="px-2 py-0.5 rounded-full bg-[#ff4c1a] text-white text-[10px] font-bold">
                  -40%
                </span>
              </div>
            </div>

            {/* Product Image Floating on Right */}
            <div className="absolute right-4 bottom-4 w-1/2 max-w-[280px] pointer-events-none transition-transform duration-500 group-hover:scale-105 group-hover:-translate-y-2">
              <img
                src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80"
                alt="Osmo Mini Pro"
                className="w-full object-contain drop-shadow-2xl"
              />
            </div>

            {/* Action Round Blue Button */}
            <div className="relative z-10">
              <button
                onClick={() => navigate('product-list')}
                className="w-12 h-12 rounded-full bg-[#215ada] hover:bg-[#163d94] text-white flex items-center justify-center transition-all shadow-lg shadow-blue-600/30 group-hover:scale-110"
                title="Shop Now"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Marquee Infinite Scroll Banner */}
      <section className="py-4 bg-[#f8fafc] border-y border-slate-100 overflow-hidden my-4">
        <div className="animate-marquee whitespace-nowrap flex items-center text-xs font-extrabold uppercase tracking-widest text-slate-600 gap-8">
          <span>FREE SHIPPING ON ALL ORDER OVER $100</span>
          <span className="text-[#215ada]">✦</span>
          <span>30 DAYS MONEY BACK GUARANTEE</span>
          <span className="text-[#ff4c1a]">✦</span>
          <span>24/7 DEDICATED SUPPORT</span>
          <span className="text-[#215ada]">✦</span>
          <span>100% SECURE PAYMENT</span>
          <span className="text-[#ff4c1a]">✦</span>
          <span>EXCLUSIVE DEALS EVERY WEEK</span>
          <span className="text-[#215ada]">✦</span>
          <span>FREE SHIPPING ON ALL ORDER OVER $100</span>
          <span className="text-[#215ada]">✦</span>
          <span>30 DAYS MONEY BACK GUARANTEE</span>
          <span className="text-[#ff4c1a]">✦</span>
          <span>24/7 DEDICATED SUPPORT</span>
          <span className="text-[#215ada]">✦</span>
          <span>100% SECURE PAYMENT</span>
          <span className="text-[#ff4c1a]">✦</span>
        </div>
      </section>

      {/* 3. Popular By Categories Section (6 Rounded Cards) */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black text-[#0e1932] tracking-tight">
            Popular By Categories
          </h2>
          <button
            onClick={() => navigate('product-list')}
            className="px-4 py-2 rounded-full bg-[#eaf0fc] hover:bg-[#215ada] text-[#215ada] hover:text-white text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <span>View All Categories</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            {
              id: 'wireless-hub',
              title: 'Wireless Hub',
              count: '12 Products',
              img: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300&q=80',
            },
            {
              id: 'chargers',
              title: 'Chargers',
              count: '8 Products',
              img: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=300&q=80',
            },
            {
              id: 'smart-watch',
              title: 'Smart Watch',
              count: '15 Products',
              img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&q=80',
            },
            {
              id: 'stands',
              title: 'Stands',
              count: '6 Products',
              img: 'https://images.unsplash.com/photo-1586105251261-72a756497a11?w=300&q=80',
            },
            {
              id: 'adapters',
              title: 'Adapters',
              count: '19 Products',
              img: 'https://images.unsplash.com/photo-1618424181497-157f25b6ddd5?w=300&q=80',
            },
            {
              id: 'headsets',
              title: 'Headsets',
              count: '22 Products',
              img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&q=80',
            },
          ].map((cat) => (
            <div
              key={cat.id}
              onClick={() => navigate('product-list')}
              className="bg-[#f4f6fb] hover:bg-white rounded-3xl p-5 flex flex-col justify-between items-center text-center group cursor-pointer border border-transparent hover:border-slate-200 hover:shadow-lg transition-all duration-300 min-h-[220px]"
            >
              <div className="w-full text-left">
                <h3 className="font-bold text-sm text-[#0e1932] group-hover:text-[#215ada] transition-colors">
                  {cat.title}
                </h3>
                <span className="text-[11px] text-slate-400 font-medium">
                  {cat.count}
                </span>
              </div>
              <div className="w-24 h-24 my-2 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                <img
                  src={cat.img}
                  alt={cat.title}
                  className="max-h-full max-w-full object-contain drop-shadow-md rounded-xl"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Two Mid-Page Promo Banners (BOOM SALE & Dual Wireless Charger Pad) */}
      <section className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Promo Banner */}
          <div className="rounded-3xl bg-[#f4f6fb] p-8 relative overflow-hidden flex flex-col justify-between min-h-[260px] border border-slate-100 group">
            <div className="relative z-10 max-w-xs">
              {/* Green BOOM SALE Badge */}
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#53dc54] text-[#0e1932] font-black text-[10px] uppercase shadow-md mb-3 text-center leading-tight">
                BOOM<br />SALE
              </div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Weekend Deals
              </div>
              <h3 className="text-2xl font-black text-[#0e1932] tracking-tight mb-4">
                Smart Security Cam
              </h3>
              <button
                onClick={() => navigate('product-list')}
                className="px-6 py-2.5 rounded-full bg-[#215ada] hover:bg-[#163d94] text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all"
              >
                Shop Now
              </button>
            </div>
            <div className="absolute right-4 bottom-2 w-1/2 max-w-[200px] pointer-events-none transition-transform duration-300 group-hover:scale-105">
              <img
                src="https://images.unsplash.com/photo-1558002038-1055907df827?w=400&q=80"
                alt="Security Camera"
                className="w-full object-contain drop-shadow-xl"
              />
            </div>
          </div>

          {/* Right Promo Banner */}
          <div className="rounded-3xl bg-[#f4f6fb] p-8 relative overflow-hidden flex flex-col justify-between min-h-[260px] border border-slate-100 group">
            <div className="relative z-10 max-w-xs">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Limited Time Offer
              </div>
              <h3 className="text-2xl font-black text-[#0e1932] tracking-tight mb-4">
                Dual Wireless Charger Pad
              </h3>
              <button
                onClick={() => navigate('product-list')}
                className="px-6 py-2.5 rounded-full bg-[#215ada] hover:bg-[#163d94] text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all"
              >
                Shop Now
              </button>
            </div>
            <div className="absolute right-4 bottom-2 w-1/2 max-w-[200px] pointer-events-none transition-transform duration-300 group-hover:scale-105">
              <img
                src="https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&q=80"
                alt="Wireless Charger"
                className="w-full object-contain drop-shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 5. "Today's Best Deals" Carousel Section */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black text-[#0e1932] tracking-tight">
            Today's Best Deals
          </h2>
          <div className="flex items-center gap-2">
            <button className="w-9 h-9 rounded-full bg-slate-100 hover:bg-[#215ada] hover:text-white text-slate-600 flex items-center justify-center transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="w-9 h-9 rounded-full bg-slate-100 hover:bg-[#215ada] hover:text-white text-slate-600 flex items-center justify-center transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4 Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              id: 'p1',
              brand: 'Apple',
              name: 'Fast MagSafe Magnetic Wireless Charger',
              price: '$29.99',
              origPrice: '$39.99',
              discount: '-20%',
              rating: '4.8',
              img: 'https://images.unsplash.com/photo-1622445262464-84b1456045b6?w=400&q=80',
            },
            {
              id: 'p2',
              brand: 'Xiaomi',
              name: 'Ultrasonic Smart Air Humidifier Diffuser',
              price: '$49.00',
              origPrice: '$65.00',
              discount: '-40%',
              rating: '4.9',
              img: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&q=80',
            },
            {
              id: 'p3',
              brand: 'JBL',
              name: 'Flip 6 Waterproof Portable Bluetooth Speaker',
              price: '$119.00',
              origPrice: '$149.00',
              discount: '-15%',
              rating: '4.9',
              img: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400&q=80',
            },
            {
              id: 'p4',
              brand: 'Anker',
              name: '7-in-1 USB-C Hub PowerExpand Multiport',
              price: '$35.00',
              origPrice: '$55.00',
              discount: '-35%',
              rating: '4.7',
              img: 'https://images.unsplash.com/photo-1618424181497-157f25b6ddd5?w=400&q=80',
            },
          ].map((deal) => (
            <div
              key={deal.id}
              onClick={() => navigate('product-list')}
              className="bg-white rounded-3xl p-5 border border-slate-200/90 hover:border-[#215ada] flex flex-col justify-between group cursor-pointer transition-all duration-300 hover:shadow-xl relative"
            >
              {/* Discount Tag, Watchers & Heart */}
              <div className="flex items-center justify-between mb-2">
                <span className="px-2.5 py-1 rounded-full bg-[#215ada] text-white text-[10px] font-black">
                  {deal.discount}
                </span>
                <div className="flex items-center gap-1.5">
                  <div className="bg-slate-50 border border-slate-200/80 px-1.5 py-0.5 rounded-full flex items-center gap-1 text-[9px] text-slate-500 font-bold">
                    <Eye className="w-2.5 h-2.5 text-[#215ada]" />
                    <span>3</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => e.stopPropagation()}
                    className="p-1.5 rounded-full text-slate-400 hover:text-rose-500 hover:bg-slate-100 transition-colors"
                  >
                    <Heart className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Product Photo with Quick View on hover */}
              <div className="w-full aspect-square bg-[#f8fafc] rounded-2xl p-4 flex items-center justify-center mb-4 relative group-hover:bg-blue-50/20 transition-colors">
                <img
                  src={deal.img}
                  alt={deal.name}
                  className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                />

                <div className="absolute inset-x-0 bottom-2 flex justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setQuickViewProduct({
                        id: deal.id,
                        name: deal.name,
                        brand: { name: deal.brand },
                        price: parseFloat(deal.price.replace(/[^0-9.]/g, '')),
                        compareAtPrice: parseFloat(deal.origPrice.replace(/[^0-9.]/g, '')),
                        primaryImage: deal.img,
                        shortDescription: `${deal.name} - high performance edition with guaranteed quality and fast warranty support.`,
                      });
                    }}
                    className="px-3 py-1 rounded-full bg-white text-slate-800 text-[11px] font-bold shadow-md flex items-center gap-1.5 hover:bg-[#215ada] hover:text-white transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Quick View</span>
                  </button>
                </div>
              </div>

              {/* Brand, Title, Rating, Price */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  {deal.brand}
                </span>
                <h4 className="font-bold text-xs sm:text-sm text-[#0e1932] line-clamp-2 group-hover:text-[#215ada] transition-colors mb-2">
                  {deal.name}
                </h4>

                <div className="flex items-center text-amber-400 text-[11px] mb-3">
                  <Star className="w-3 h-3 fill-current" />
                  <span className="ml-1 text-slate-500 font-bold">{deal.rating}</span>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="text-base font-black text-[#0e1932] font-mono">{deal.price}</span>
                    <span className="text-xs text-slate-400 line-through">{deal.origPrice}</span>
                  </div>
                  <span className="text-[11px] font-bold text-[#215ada] group-hover:underline">
                    View
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Featured Brands (2 Rows of Clean Brand Pills) */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black text-[#0e1932] tracking-tight">
            Featured Brands
          </h2>
          <button
            onClick={() => navigate('product-list')}
            className="px-4 py-2 rounded-full bg-[#eaf0fc] hover:bg-[#215ada] text-[#215ada] hover:text-white text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <span>View All Brands</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            'SONY', 'SAMSUNG', 'PANASONIC', 'LOGITECH', 'LENOVO', 'INTEL',
            'HUAWEI', 'NVIDIA', 'BOSE', 'ASUS', 'ANKER', 'AMD'
          ].map((brand, idx) => (
            <div
              key={idx}
              onClick={() => navigate('product-list')}
              className="bg-[#ffffff] hover:bg-[#f4f6fb] border border-slate-200 rounded-2xl py-4 px-6 flex items-center justify-center text-center cursor-pointer transition-all duration-200 hover:border-[#215ada] hover:shadow-sm"
            >
              <span className="font-black text-xs tracking-wider text-slate-800 hover:text-[#215ada]">
                {brand}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 7. "Popular Products" Tabbed Section with Left Promo Feature Card */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <h2 className="text-2xl font-black text-[#0e1932] tracking-tight">
            Popular products
          </h2>

          <div className="flex items-center gap-2 bg-[#f4f6fb] p-1 rounded-full text-xs font-bold">
            {['all', 'bestseller', 'new', 'sale'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveProductTab(tab)}
                className={`px-4 py-1.5 rounded-full transition-all capitalize ${
                  activeProductTab === tab
                    ? 'bg-white text-[#215ada] shadow-sm font-extrabold'
                    : 'text-slate-600 hover:text-[#215ada]'
                }`}
              >
                {tab === 'all' ? 'All Items' : tab === 'bestseller' ? 'Best Seller' : tab === 'new' ? 'New Arrival' : 'On Sale'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Promo Card: Special Combo Pack (4 Cols) */}
          <div className="lg:col-span-4 rounded-3xl bg-[#f4f6fb] p-8 flex flex-col justify-between min-h-[380px] border border-slate-100 relative overflow-hidden group">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Save Up to 40%
              </span>
              <h3 className="text-2xl font-black text-[#0e1932] tracking-tight mb-4">
                SPECIAL COMBO PACK
              </h3>
              <button
                onClick={() => navigate('product-list')}
                className="px-6 py-2.5 rounded-full bg-[#215ada] hover:bg-[#163d94] text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all"
              >
                Shop Now
              </button>
            </div>

            <div className="w-full mt-4 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
              <img
                src="https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&q=80"
                alt="Smartphones"
                className="max-h-48 object-contain drop-shadow-xl"
              />
            </div>
          </div>

          {/* Right Product Grid (8 Cols, 3 Columns) */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                id: 'pop1',
                brand: 'Sony',
                name: 'WH-1000XM5 Wireless Noise Canceling Headphones',
                price: '$348.00',
                origPrice: '$399.00',
                discount: '-15%',
                rating: '4.9',
                img: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&q=80',
              },
              {
                id: 'pop2',
                brand: 'Lenovo',
                name: 'Slim 7 Pro X Laptop 14.5" 3K IPS 120Hz',
                price: '$899.00',
                origPrice: '$999.00',
                discount: '-10%',
                rating: '4.8',
                img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80',
              },
              {
                id: 'pop3',
                brand: 'Apple',
                name: 'Apple Watch Ultra 2 GPS + Cellular 49mm Titanium',
                price: '$749.00',
                origPrice: '$799.00',
                discount: '-10%',
                rating: '5.0',
                img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80',
              },
            ].map((p) => (
              <div
                key={p.id}
                onClick={() => navigate('product-list')}
                className="bg-white rounded-3xl p-5 border border-slate-200/90 hover:border-[#215ada] flex flex-col justify-between group cursor-pointer transition-all duration-300 hover:shadow-xl relative"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-1 rounded-full bg-[#215ada] text-white text-[10px] font-black">
                    {p.discount}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <div className="bg-slate-50 border border-slate-200/80 px-1.5 py-0.5 rounded-full flex items-center gap-1 text-[9px] text-slate-500 font-bold">
                      <Eye className="w-2.5 h-2.5 text-[#215ada]" />
                      <span>4</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 rounded-full text-slate-400 hover:text-rose-500 hover:bg-slate-100 transition-colors"
                    >
                      <Heart className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="w-full aspect-square bg-[#f8fafc] rounded-2xl p-4 flex items-center justify-center mb-4 relative group-hover:bg-blue-50/20 transition-colors">
                  <img
                    src={p.img}
                    alt={p.name}
                    className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                  />

                  <div className="absolute inset-x-0 bottom-2 flex justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setQuickViewProduct({
                          id: p.id,
                          name: p.name,
                          brand: { name: p.brand },
                          price: parseFloat(p.price.replace(/[^0-9.]/g, '')),
                          compareAtPrice: parseFloat(p.origPrice.replace(/[^0-9.]/g, '')),
                          primaryImage: p.img,
                          shortDescription: `${p.name} - official verified authentic part with top durability rating.`,
                        });
                      }}
                      className="px-3 py-1 rounded-full bg-white text-slate-800 text-[11px] font-bold shadow-md flex items-center gap-1.5 hover:bg-[#215ada] hover:text-white transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Quick View</span>
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    {p.brand}
                  </span>
                  <h4 className="font-bold text-xs sm:text-sm text-[#0e1932] line-clamp-2 group-hover:text-[#215ada] transition-colors mb-2">
                    {p.name}
                  </h4>

                  <div className="flex items-center text-amber-400 text-[11px] mb-3">
                    <Star className="w-3 h-3 fill-current" />
                    <span className="ml-1 text-slate-500 font-bold">{p.rating}</span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                      <span className="text-base font-black text-[#0e1932] font-mono">{p.price}</span>
                      <span className="text-xs text-slate-400 line-through">{p.origPrice}</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart('p-quick', 1, null, true);
                      }}
                      className="w-8 h-8 rounded-full bg-[#215ada] hover:bg-[#163d94] text-white flex items-center justify-center transition-colors shadow-sm"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Wide Horizontal Promo Banner (Epic Tech Bonanza Home Sale) */}
      <section className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="rounded-[32px] bg-[#f4f6fb] p-8 sm:p-12 relative overflow-hidden flex flex-col justify-between min-h-[280px] border border-slate-100 group">
          <div className="relative z-10 max-w-md">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              FLASH SALE 2024
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-[#0e1932] tracking-tight mb-4 leading-snug">
              Epic Tech Bonanza Home Sale
            </h3>
            <button
              onClick={() => navigate('product-list')}
              className="px-6 py-2.5 rounded-full bg-[#215ada] hover:bg-[#163d94] text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all"
            >
              Shop Now
            </button>
          </div>

          <div className="absolute right-4 bottom-0 w-1/2 max-w-[420px] pointer-events-none transition-transform duration-500 group-hover:scale-105">
            <img
              src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80"
              alt="Epic Tech Banner"
              className="w-full object-contain drop-shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* 9. "From The Blog" Section (4 Editorial Cards) */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Top News</span>
            <h2 className="text-2xl font-black text-[#0e1932] tracking-tight">
              From The Blog
            </h2>
          </div>
          <button
            onClick={() => navigate('product-list')}
            className="px-4 py-2 rounded-full bg-[#eaf0fc] hover:bg-[#215ada] text-[#215ada] hover:text-white text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <span>View All Blog</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              id: 'b1',
              date: 'May 12, 2024',
              category: 'Technology',
              title: 'Top 10 Must-Have Desk Accessories for Remote Work in 2024',
              img: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&q=80',
            },
            {
              id: 'b2',
              date: 'May 10, 2024',
              category: 'Gadgets',
              title: 'Why You Need Fast Qi2 Wireless Charging at Your Bedside',
              img: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400&q=80',
            },
            {
              id: 'b3',
              date: 'May 08, 2024',
              category: 'Reviews',
              title: 'Ultimate Guide to Multi-Port USB-C Hubs and Thunderbolt Docks',
              img: 'https://images.unsplash.com/photo-1618424181497-157f25b6ddd5?w=400&q=80',
            },
            {
              id: 'b4',
              date: 'May 04, 2024',
              category: 'Audio',
              title: 'Noise Cancelling Headphones Compared: Which One Fits Your Budget?',
              img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80',
            },
          ].map((post) => (
            <div
              key={post.id}
              className="group flex flex-col justify-between cursor-pointer"
            >
              <div>
                <div className="w-full aspect-[16/10] rounded-2xl overflow-hidden mb-3 bg-slate-100">
                  <img
                    src={post.img}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-1.5">
                  <span>{post.date}</span>
                  <span>•</span>
                  <span className="text-[#215ada] font-semibold">{post.category}</span>
                </div>
                <h4 className="font-bold text-sm text-[#0e1932] group-hover:text-[#215ada] transition-colors line-clamp-2 leading-snug mb-2">
                  {post.title}
                </h4>
              </div>

              <div className="pt-2">
                <span className="text-xs font-bold text-[#215ada] group-hover:underline inline-flex items-center gap-1">
                  <span>Read More</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 10. Bottom Ticker */}
      <section className="py-4 bg-[#f8fafc] border-y border-slate-100 overflow-hidden my-6">
        <div className="animate-marquee whitespace-nowrap flex items-center text-xs font-extrabold uppercase tracking-widest text-slate-600 gap-8">
          <span>FREE SHIPPING ON ALL ORDER OVER $100</span>
          <span className="text-[#215ada]">✦</span>
          <span>30 DAYS MONEY BACK GUARANTEE</span>
          <span className="text-[#ff4c1a]">✦</span>
          <span>24/7 DEDICATED SUPPORT</span>
          <span className="text-[#215ada]">✦</span>
          <span>100% SECURE PAYMENT</span>
          <span className="text-[#ff4c1a]">✦</span>
          <span>EXCLUSIVE DEALS EVERY WEEK</span>
          <span className="text-[#215ada]">✦</span>
          <span>FREE SHIPPING ON ALL ORDER OVER $100</span>
          <span className="text-[#215ada]">✦</span>
          <span>30 DAYS MONEY BACK GUARANTEE</span>
          <span className="text-[#ff4c1a]">✦</span>
        </div>
      </section>

      {/* 11. SEO Feature Columns */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-slate-600 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h4 className="font-bold text-[#0e1932] text-sm mb-2">
              Guaranteed Quality Shopping
            </h4>
            <p className="leading-relaxed text-slate-500">
              Every item sold in our store is carefully tested and certified by manufacturer standards to ensure peak performance and longevity.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-[#0e1932] text-sm mb-2">
              Fast & Reliable Delivery
            </h4>
            <p className="leading-relaxed text-slate-500">
              We partner with top-tier express courier services to provide prompt, insured delivery with real-time tracking from warehouse to door.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-[#0e1932] text-sm mb-2">
              Top Customer Care Support
            </h4>
            <p className="leading-relaxed text-slate-500">
              Our support team is available 24/7 to help you resolve inquiries, process warranty requests, or guide product recommendations.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-[#0e1932] text-sm mb-2">
              Warranty & Security
            </h4>
            <p className="leading-relaxed text-slate-500">
              Shop with 100% peace of mind. All payments are encrypted with military-grade SSL and backed by full 30-day return protection.
            </p>
          </div>
        </div>
      </section>

      {/* 12. Giant Royal Blue Signature Footer (Buy@Unimart) */}
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
