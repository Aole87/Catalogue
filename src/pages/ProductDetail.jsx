import React, { useState, useEffect } from 'react';
import {
  ChevronLeft, ChevronRight, Package, CheckCircle2, XCircle, AlertCircle, HelpCircle,
  Car, ShieldCheck, Tag, Info, Layers, Wrench, Share2, ShoppingBag, Plus, Minus, Star, Heart,
  Truck, RotateCcw, Award, Eye, Flame, Check, MessageSquare, ThumbsUp, Lock, User
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import PriceDisplay from '../components/product/PriceDisplay';
import CompatibilityBadge from '../components/product/CompatibilityBadge';
import ProductCard from '../components/product/ProductCard';
import QuickViewModal from '../components/product/QuickViewModal';
import VehicleSelectorModal from '../components/vehicle/VehicleSelectorModal';
import { useVehicle } from '../context/VehicleContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import ApiClient from '../utils/apiClient';

export const ProductDetail = ({ navigate, user, setUser, product: initialProduct }) => {
  const { selectedVehicle, isVehicleSelected, openSelectorModal } = useVehicle();
  const { addToCart, openCart } = useCart();
  const { t, lang } = useLanguage();

  const [product, setProduct] = useState(initialProduct || null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [activeTab, setActiveTab] = useState('desc');
  const [shareToast, setShareToast] = useState(false);

  // Fitment verification states
  const [fitmentCheck, setFitmentCheck] = useState(null);
  const [loadingFitment, setLoadingFitment] = useState(false);
  const [allFitments, setAllFitments] = useState([]);
  const [loadingAllFitments, setLoadingAllFitments] = useState(false);

  // Related products
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // 1. Fetch full product if not provided
  useEffect(() => {
    let mounted = true;
    const loadProductData = async () => {
      if (!initialProduct?.id && !initialProduct?.slug) return;
      try {
        const idOrSlug = initialProduct.id || initialProduct.slug;
        const res = await ApiClient.getProductById(idOrSlug);
        if (mounted && res.data) {
          setProduct(res.data);
        }
      } catch (err) {
        console.error('Failed to reload product details', err);
      }
    };
    loadProductData();
    return () => { mounted = false; };
  }, [initialProduct]);

  // 2. Perform deterministic fitment check
  useEffect(() => {
    let mounted = true;
    const verifyFitment = async () => {
      if (!product?.id || !selectedVehicle?.variantId) {
        setFitmentCheck(null);
        return;
      }

      try {
        setLoadingFitment(true);
        const res = await ApiClient.checkProductFitment(product.id, selectedVehicle.variantId);
        if (mounted) {
          setFitmentCheck(res);
        }
      } catch (err) {
        console.error('Failed to verify product fitment', err);
        if (mounted) {
          setFitmentCheck({ compatible: false, reason: 'FITMENT_CHECK_FAILED' });
        }
      } finally {
        if (mounted) setLoadingFitment(false);
      }
    };

    verifyFitment();
    return () => { mounted = false; };
  }, [product?.id, selectedVehicle?.variantId]);

  // 3. Load all compatible vehicles
  useEffect(() => {
    let mounted = true;
    const fetchAllFitments = async () => {
      if (!product?.id) return;
      try {
        setLoadingAllFitments(true);
        const res = await ApiClient.getProductFitments(product.id);
        if (mounted) {
          setAllFitments(res.fitments || []);
        }
      } catch (err) {
        console.error('Failed to load all product fitments', err);
      } finally {
        if (mounted) setLoadingAllFitments(false);
      }
    };

    fetchAllFitments();
    return () => { mounted = false; };
  }, [product?.id]);

  // 4. Load Related Products
  useEffect(() => {
    let mounted = true;
    const fetchRelated = async () => {
      try {
        setLoadingRelated(true);
        const params = { pageSize: 4, sortBy: 'createdAt', sortOrder: 'desc' };
        if (product?.categoryId) params.categoryId = product.categoryId;
        const res = await ApiClient.getProducts(params);
        if (mounted) {
          setRelatedProducts((res.data || []).filter((p) => p.id !== product?.id));
        }
      } catch (err) {
        console.error('Failed to load related products', err);
      } finally {
        if (mounted) setLoadingRelated(false);
      }
    };
    if (product?.id) {
      fetchRelated();
    }
    return () => { mounted = false; };
  }, [product?.id, product?.categoryId]);

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex flex-col font-sans">
        <Navbar navigate={navigate} user={user} setUser={setUser} />
        <main className="flex-1 max-w-7xl mx-auto px-4 py-16 text-center">
          <p className="text-slate-500 mb-4">Product not found</p>
          <button
            onClick={() => navigate('product-list')}
            className="px-6 py-2.5 bg-[#0d3c90] text-white text-xs font-bold rounded-full shadow-md"
          >
            Back to Catalog
          </button>
        </main>
        <Footer navigate={navigate} />
      </div>
    );
  }

  // Extract gallery images
  const images = [];
  if (product.images && product.images.length > 0) {
    product.images.forEach((img) => {
      if (typeof img === 'string') images.push(img);
      else if (img.url) images.push(img.url);
    });
  } else if (product.primaryImage) {
    images.push(product.primaryImage);
  }

  const currentImage = images[selectedImageIndex] || null;

  // Extract price
  const price = product.effectivePrice?.amount ?? product.prices?.[0]?.price ?? product.price;
  const compareAtPrice = product.effectivePrice?.compareAtPrice ?? product.prices?.[0]?.compareAtPrice ?? product.compareAtPrice;
  const tier = product.effectivePrice?.tier ?? product.prices?.[0]?.tier;

  const discountPct = compareAtPrice && compareAtPrice > price
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : null;

  const handleAddToCart = () => {
    if (!user) {
      navigate('login');
      return;
    }
    setIsAddingToCart(true);
    addToCart(product.id, quantity, selectedVehicle?.variantId || null, true);
    setTimeout(() => setIsAddingToCart(false), 400);
  };

  const handleBuyNow = () => {
    if (!user) {
      navigate('login');
      return;
    }
    addToCart(product.id, quantity, selectedVehicle?.variantId || null, false);
    navigate('checkout');
  };

  const handleShare = () => {
    navigator.clipboard?.writeText?.(window.location.href);
    setShareToast(true);
    setTimeout(() => setShareToast(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-[#0d3c90] selection:text-white max-w-full overflow-x-hidden">
      {/* Navbar */}
      <Navbar navigate={navigate} user={user} setUser={setUser} />

      {/* 1. Breadcrumbs Banner Header */}
      <div className="bg-[#f4f6fb] py-4 px-4 sm:px-6 lg:px-8 border-b border-slate-100">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-400">
            <button onClick={() => navigate('home')} className="hover:text-[#0d3c90] transition-colors">
              {t('home')}
            </button>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <button onClick={() => navigate('product-list')} className="hover:text-[#0d3c90] transition-colors">
              {t('shop')}
            </button>
            {product.category?.name && (
              <>
                <ChevronRight className="w-3 h-3 text-slate-300" />
                <button
                  onClick={() => navigate('product-list', { filters: { categoryId: product.category.id } })}
                  className="hover:text-[#0d3c90] transition-colors"
                >
                  {product.category.name}
                </button>
              </>
            )}
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <span className="text-[#0e1932] font-bold truncate max-w-[200px] sm:max-w-xs">{product.name}</span>
          </div>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#0d3c90] bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-2xs"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Share Toast */}
      {shareToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0e1932] text-white text-xs px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-scale-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Link copied to clipboard!</span>
        </div>
      )}

      {/* 2. Main Product Details Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-16 items-start">
          {/* Left: Product Image Gallery (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="w-full aspect-square bg-[#f8fafc] rounded-3xl border border-slate-200/90 overflow-hidden flex items-center justify-center relative p-6 group">
              {currentImage && !imageError ? (
                <img
                  src={currentImage}
                  alt={product.name}
                  onError={() => setImageError(true)}
                  className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-300 gap-2">
                  <Package className="w-16 h-16 stroke-[1.2]" />
                  <span className="text-xs font-mono text-slate-400">Standard Product Image</span>
                </div>
              )}

              {/* Badges */}
              {discountPct && user && (
                <span className="absolute top-4 left-4 bg-[#f97316] text-white text-xs font-black px-3 py-1 rounded-full shadow-xs">
                  -{discountPct}% OFF
                </span>
              )}

              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-xs border border-slate-200 px-3 py-1 rounded-full flex items-center gap-1.5 text-xs text-slate-700 font-bold shadow-xs">
                <Eye className="w-3.5 h-3.5 text-[#0d3c90]" />
                <span>12 watching</span>
              </div>
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedImageIndex(idx);
                      setImageError(false);
                    }}
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 overflow-hidden shrink-0 bg-[#f8fafc] p-2 transition-all ${
                      selectedImageIndex === idx ? 'border-[#0d3c90] shadow-md scale-105' : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Info & Actions (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div>
              {/* Availability Badge & Brand */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                  ● In Stock ({product.stockQuantity || 24} units available)
                </span>
                {product.brand && (
                  <span className="text-xs font-black uppercase tracking-wider text-[#0d3c90] bg-blue-50 px-3 py-1 rounded-full">
                    {product.brand.name}
                  </span>
                )}
                {product.sku && (
                  <span className="text-xs font-mono font-medium text-slate-400">
                    SKU: {product.sku}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-black text-[#0e1932] tracking-tight leading-snug mb-3">
                {product.name}
              </h1>

              {/* Rating & Reviews Count */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center text-amber-400 text-xs">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current text-amber-400" />
                  ))}
                </div>
                <span className="text-xs font-bold text-slate-700">4.9</span>
                <span className="text-xs text-slate-400">(18 Customer Reviews)</span>
              </div>

              {/* Price Display: ENFORCE MEMBER-ONLY PRICING RESTRICTION (Requirement 1 & 6) */}
              <div className="p-5 rounded-3xl bg-[#f4f6fb] border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                {user ? (
                  <>
                    <div>
                      <span className="text-xs text-slate-400 uppercase font-bold block mb-0.5">
                        {lang === 'th' ? 'ราคาสมาชิกพิเศษ' : 'Member Price'}
                      </span>
                      <div className="flex items-baseline gap-3">
                        <span className="text-3xl sm:text-4xl font-black text-[#0d3c90] font-mono">
                          ฿{Number(price || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                        </span>
                        {compareAtPrice && compareAtPrice > price && (
                          <span className="text-base font-semibold text-slate-400 line-through">
                            ฿{Number(compareAtPrice).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                          </span>
                        )}
                      </div>
                    </div>

                    {discountPct && (
                      <div className="text-right">
                        <span className="px-3 py-1 rounded-full bg-[#f97316] text-white text-xs font-bold shadow-xs">
                          SAVE ฿{Number(compareAtPrice - price).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-amber-50 border border-amber-200/80 p-4 rounded-2xl text-amber-900">
                    <div className="flex items-center gap-2">
                      <Lock className="w-5 h-5 text-amber-600 shrink-0" />
                      <div>
                        <div className="font-extrabold text-sm text-amber-900">
                          {t('loginToViewPrice')}
                        </div>
                        <div className="text-[11px] text-amber-700 mt-0.5">
                          {t('membersOnlyNotice')}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate('login')}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-[#f97316] hover:bg-[#ea580c] text-white text-xs font-extrabold shadow-md transition-colors shrink-0"
                    >
                      {t('signIn')} / {t('register')}
                    </button>
                  </div>
                )}
              </div>

              {/* Short Description */}
              {product.shortDescription && (
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                  {product.shortDescription}
                </p>
              )}

              {/* Deterministic Fitment Status Box */}
              <div className="mb-6 p-4 rounded-3xl border border-slate-200/80 transition-all bg-white shadow-2xs">
                {isVehicleSelected && selectedVehicle ? (
                  loadingFitment ? (
                    <div className="flex items-center gap-2 text-xs text-slate-500 animate-pulse">
                      <Car className="w-4 h-4 text-[#0d3c90]" />
                      <span>Checking exact compatibility with {selectedVehicle.makeName} {selectedVehicle.modelName}...</span>
                    </div>
                  ) : fitmentCheck?.compatible ? (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-900">
                      <div className="flex items-center gap-2 font-bold text-sm text-emerald-800 mb-1">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        <span>✓ Guaranteed Fitment for your vehicle</span>
                      </div>
                      <p className="text-xs text-emerald-700 mt-1">
                        Selected: <strong>{selectedVehicle.makeName} {selectedVehicle.modelName} {selectedVehicle.generationCode || ''}</strong> ({selectedVehicle.variantName})
                      </p>
                    </div>
                  ) : (
                    <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-rose-900">
                      <div className="flex items-center gap-2 font-bold text-sm text-rose-800 mb-1">
                        <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                        <span>✕ Not Compatible with selected vehicle</span>
                      </div>
                      <button
                        onClick={openSelectorModal}
                        className="mt-1 text-xs font-bold text-rose-800 underline hover:text-rose-900"
                      >
                        Change Vehicle
                      </button>
                    </div>
                  )
                ) : (
                  <div className="bg-[#f4f6fb] border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>Select your vehicle to verify 100% exact fitment.</span>
                    </div>
                    <button
                      onClick={openSelectorModal}
                      className="text-xs font-bold text-[#0d3c90] hover:underline"
                    >
                      Select Vehicle →
                    </button>
                  </div>
                )}
              </div>

              {/* Quantity Stepper & Dual Action Buttons / Member Login Requirement */}
              <div className="pt-4 border-t border-slate-100">
                {user ? (
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Quantity */}
                    <div className="flex items-center border-2 border-slate-200 rounded-full p-1 bg-white">
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-10 text-center font-bold text-sm text-slate-800 font-mono">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity((q) => q + 1)}
                        className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      onClick={handleAddToCart}
                      className={`flex-1 min-w-[150px] py-3.5 px-6 rounded-full bg-[#0d3c90] hover:bg-[#072a63] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                        isAddingToCart ? 'bg-emerald-600 scale-95' : ''
                      }`}
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Cart</span>
                    </button>

                    {/* Buy Now Button */}
                    <button
                      onClick={handleBuyNow}
                      className="flex-1 min-w-[150px] py-3.5 px-6 rounded-full bg-[#f97316] hover:bg-[#ea580c] text-white font-bold text-xs sm:text-sm shadow-md transition-all"
                    >
                      Buy Now
                    </button>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-[#09357a] text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
                    <div className="flex items-center gap-3">
                      <Lock className="w-6 h-6 text-[#f97316] shrink-0" />
                      <div>
                        <div className="font-extrabold text-sm">{t('loginToBuy')}</div>
                        <div className="text-[11px] text-blue-200">{t('pleaseLoginFirst')}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate('login')}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#f97316] hover:bg-[#ea580c] text-white font-extrabold text-xs shadow-md transition-colors shrink-0"
                    >
                      {t('signIn')} / {t('register')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer navigate={navigate} />
    </div>
  );
};

export default ProductDetail;
