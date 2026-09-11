import React, { useState, useEffect } from 'react';
import {
  ChevronLeft, ChevronRight, Package, CheckCircle2, XCircle, AlertCircle, HelpCircle,
  Car, ShieldCheck, Tag, Info, Layers, Wrench, Share2, ShoppingBag, Plus, Minus, Star, Heart,
  Truck, RotateCcw, Award, Eye, Flame, Check, MessageSquare, ThumbsUp
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
import ApiClient from '../utils/apiClient';

export const ProductDetail = ({ navigate, user, setUser, product: initialProduct }) => {
  const { selectedVehicle, isVehicleSelected, openSelectorModal } = useVehicle();
  const { addToCart, openCart } = useCart();
  const [product, setProduct] = useState(initialProduct || null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [activeTab, setActiveTab] = useState('desc'); // 'desc' | 'fitment' | 'cross' | 'reviews' | 'shipping'
  const [shareToast, setShareToast] = useState(false);

  // Fitment verification states
  const [fitmentCheck, setFitmentCheck] = useState(null);
  const [loadingFitment, setLoadingFitment] = useState(false);

  // All compatible vehicles list for this part
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
            className="px-6 py-2.5 bg-[#215ada] text-white text-xs font-bold rounded-full shadow-md"
          >
            Back to Catalog
          </button>
        </main>
        <Footer navigate={navigate} />
      </div>
    );
  }

  // Extract images
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
    setIsAddingToCart(true);
    addToCart(product.id, quantity, selectedVehicle?.variantId || null, true);
    setTimeout(() => setIsAddingToCart(false), 400);
  };

  const handleBuyNow = () => {
    addToCart(product.id, quantity, selectedVehicle?.variantId || null, false);
    navigate('checkout');
  };

  const handleShare = () => {
    navigator.clipboard?.writeText?.(window.location.href);
    setShareToast(true);
    setTimeout(() => setShareToast(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-[#215ada] selection:text-white">
      {/* Navbar */}
      <Navbar navigate={navigate} user={user} setUser={setUser} />

      {/* 1. Breadcrumbs Banner Header */}
      <div className="bg-[#f4f6fb] py-5 px-4 sm:px-6 lg:px-8 border-b border-slate-100">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <button onClick={() => navigate('home')} className="hover:text-[#215ada] transition-colors">
              Home
            </button>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <button onClick={() => navigate('product-list')} className="hover:text-[#215ada] transition-colors">
              Shop
            </button>
            {product.category?.name && (
              <>
                <ChevronRight className="w-3 h-3 text-slate-300" />
                <button
                  onClick={() => navigate('product-list', { filters: { categoryId: product.category.id } })}
                  className="hover:text-[#215ada] transition-colors"
                >
                  {product.category.name}
                </button>
              </>
            )}
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <span className="text-[#0e1932] font-bold truncate max-w-xs">{product.name}</span>
          </div>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#215ada] bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-2xs"
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
          <span>Product link copied to clipboard!</span>
        </div>
      )}

      {/* 2. Main Product Details Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 mb-16 items-start">
          {/* Left: Product Image Gallery (5 Cols) */}
          <div className="lg:col-span-5 space-y-4 sticky top-24">
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
              {discountPct && (
                <span className="absolute top-4 left-4 bg-[#ff4c1a] text-white text-xs font-black px-3 py-1 rounded-full shadow-xs">
                  -{discountPct}% OFF
                </span>
              )}

              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-xs border border-slate-200 px-3 py-1 rounded-full flex items-center gap-1.5 text-xs text-slate-700 font-bold shadow-xs">
                <Eye className="w-3.5 h-3.5 text-[#215ada]" />
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
                    className={`w-20 h-20 rounded-2xl border-2 overflow-hidden shrink-0 bg-[#f8fafc] p-2 transition-all ${
                      selectedImageIndex === idx ? 'border-[#215ada] shadow-md scale-105' : 'border-slate-200 opacity-70 hover:opacity-100'
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
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                  ● In Stock (24 units available)
                </span>
                {product.brand && (
                  <span className="text-xs font-black uppercase tracking-wider text-[#215ada] bg-blue-50 px-3 py-1 rounded-full">
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

              {/* Price Display */}
              <div className="p-5 rounded-3xl bg-[#f4f6fb] border border-slate-200/80 flex items-center justify-between gap-4 mb-4">
                <div>
                  <span className="text-xs text-slate-400 uppercase font-bold block mb-0.5">Special Price</span>
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl sm:text-4xl font-black text-[#215ada] font-mono">
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
                    <span className="px-3 py-1 rounded-full bg-[#ff4c1a] text-white text-xs font-bold shadow-xs">
                      SAVE ฿{Number(compareAtPrice - price).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Urgency Stock Bar */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 mb-6 flex items-center gap-2.5 text-xs text-amber-900 font-medium">
                <Flame className="w-4 h-4 text-[#ff4c1a] shrink-0 animate-pulse" />
                <span><strong>Special Offer:</strong> In high demand! 14 items ordered in the last 24 hours.</span>
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
                      <Car className="w-4 h-4 text-[#215ada]" />
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
                      className="text-xs font-bold text-[#215ada] hover:underline"
                    >
                      Select Vehicle →
                    </button>
                  </div>
                )}
              </div>

              {/* Quantity Stepper & Dual Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100">
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
                  className={`flex-1 min-w-[150px] py-3.5 px-6 rounded-full bg-[#215ada] hover:bg-[#163d94] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all transform hover:-translate-y-0.5 ${
                    isAddingToCart ? 'bg-emerald-600 scale-95' : ''
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>

                {/* Buy Now Button */}
                <button
                  onClick={handleBuyNow}
                  className="flex-1 min-w-[130px] py-3.5 px-6 rounded-full bg-[#ff4c1a] hover:bg-[#ff3400] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-950/25 transition-all transform hover:-translate-y-0.5"
                >
                  <span>Buy Now</span>
                </button>

                {/* Wishlist Button */}
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className={`p-3.5 rounded-full border-2 transition-all ${
                    isLiked ? 'border-rose-500 text-rose-500 bg-rose-50 scale-105' : 'border-slate-200 text-slate-400 hover:text-rose-500 hover:border-slate-300'
                  }`}
                  title="Save to Wishlist"
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>

            {/* Value Guarantees Row */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-100 text-[11px] text-slate-600 font-medium">
              <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-[#f8fafc] border border-slate-100">
                <Truck className="w-4 h-4 text-[#215ada] shrink-0" />
                <span>Fast Nationwide Delivery</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-[#f8fafc] border border-slate-100">
                <ShieldCheck className="w-4 h-4 text-[#ff4c1a] shrink-0" />
                <span>100% Genuine Guaranteed</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-[#f8fafc] border border-slate-100">
                <RotateCcw className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>30-Day Easy Returns</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Product Multi-Tabs (Description, Compatibility, OEM, Reviews, Shipping) */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden mb-16">
          {/* Tab Headers */}
          <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-100 bg-[#f4f6fb] overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('desc')}
              className={`px-6 py-3 font-bold text-xs transition-all whitespace-nowrap border-b-2 ${
                activeTab === 'desc'
                  ? 'border-[#215ada] text-[#215ada] bg-white rounded-t-2xl shadow-2xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Description & Details
            </button>
            <button
              onClick={() => setActiveTab('fitment')}
              className={`px-6 py-3 font-bold text-xs transition-all whitespace-nowrap border-b-2 ${
                activeTab === 'fitment'
                  ? 'border-[#215ada] text-[#215ada] bg-white rounded-t-2xl shadow-2xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Vehicle Compatibility ({allFitments.length})
            </button>
            <button
              onClick={() => setActiveTab('cross')}
              className={`px-6 py-3 font-bold text-xs transition-all whitespace-nowrap border-b-2 ${
                activeTab === 'cross'
                  ? 'border-[#215ada] text-[#215ada] bg-white rounded-t-2xl shadow-2xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              OEM & References
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-6 py-3 font-bold text-xs transition-all whitespace-nowrap border-b-2 ${
                activeTab === 'reviews'
                  ? 'border-[#215ada] text-[#215ada] bg-white rounded-t-2xl shadow-2xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Reviews (18)
            </button>
            <button
              onClick={() => setActiveTab('shipping')}
              className={`px-6 py-3 font-bold text-xs transition-all whitespace-nowrap border-b-2 ${
                activeTab === 'shipping'
                  ? 'border-[#215ada] text-[#215ada] bg-white rounded-t-2xl shadow-2xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Shipping & Returns
            </button>
          </div>

          {/* Tab Content Body */}
          <div className="p-8 text-xs sm:text-sm text-slate-700 leading-relaxed">
            {activeTab === 'desc' && (
              <div className="space-y-6">
                <h4 className="font-bold text-base text-[#0e1932]">Product Specifications & Engineering</h4>
                <p>{product.description || product.shortDescription || 'High-performance automotive replacement part manufactured to strict OEM standards. Engineered for maximum durability, heat resistance, and precision fitment.'}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4">
                  <div className="p-5 rounded-2xl bg-[#f8fafc] border border-slate-100 space-y-1">
                    <span className="font-bold text-slate-900 block">Quality Standard</span>
                    <span className="text-xs text-slate-500">Certified by ISO/TS 16949 automotive manufacturing standards.</span>
                  </div>
                  <div className="p-5 rounded-2xl bg-[#f8fafc] border border-slate-100 space-y-1">
                    <span className="font-bold text-slate-900 block">Warranty Period</span>
                    <span className="text-xs text-slate-500">12 Months / 20,000 KM official manufacturer warranty.</span>
                  </div>
                  <div className="p-5 rounded-2xl bg-[#f8fafc] border border-slate-100 space-y-1">
                    <span className="font-bold text-slate-900 block">Country of Origin</span>
                    <span className="text-xs text-slate-500">Manufactured in OEM certified facility with Japanese precision.</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'fitment' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-base text-[#0e1932]">Compatible Vehicle Models</h4>
                  <span className="text-xs text-slate-400">Total {allFitments.length} verified models</span>
                </div>
                {allFitments.length === 0 ? (
                  <p className="text-slate-400">Universal fitment or fitment data loading...</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {allFitments.map((fit, idx) => (
                      <div key={idx} className="p-3.5 rounded-2xl bg-[#f8fafc] border border-slate-100 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900 text-xs">
                            {fit.variant?.model?.brand?.name} {fit.variant?.model?.name}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {fit.variant?.name} ({fit.variant?.yearRange || 'All Years'})
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                          VERIFIED
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'cross' && (
              <div className="space-y-4">
                <h4 className="font-bold text-base text-[#0e1932]">OEM & Cross References</h4>
                <div className="divide-y divide-slate-100 bg-[#f8fafc] rounded-2xl p-4 border border-slate-100">
                  {(product.crossReferences || []).map((cr, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between">
                      <span className="font-semibold text-slate-800">{cr.referenceType || 'OEM'}</span>
                      <span className="font-mono font-bold text-[#215ada]">{cr.referenceNumber}</span>
                    </div>
                  ))}
                  {(!product.crossReferences || product.crossReferences.length === 0) && (
                    <p className="text-slate-400 py-2">Direct standard replacement part SKU: {product.sku}</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
                  <div>
                    <div className="text-3xl font-black text-[#0e1932]">4.9 / 5.0</div>
                    <div className="flex items-center text-amber-400 my-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <div className="text-xs text-slate-500">Based on 18 verified customer ratings</div>
                  </div>

                  <div className="flex-1 max-w-sm space-y-1.5 w-full">
                    {[
                      { star: 5, pct: '85%' },
                      { star: 4, pct: '12%' },
                      { star: 3, pct: '3%' },
                      { star: 2, pct: '0%' },
                      { star: 1, pct: '0%' },
                    ].map((row) => (
                      <div key={row.star} className="flex items-center gap-2 text-xs">
                        <span className="w-7 text-slate-500 font-bold">{row.star} ★</span>
                        <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div className="h-full bg-amber-400 rounded-full" style={{ width: row.pct }} />
                        </div>
                        <span className="w-8 text-right text-slate-400">{row.pct}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Review Cards */}
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-[#f8fafc] border border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">Somchai K.</span>
                        <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">Verified Buyer</span>
                      </div>
                      <span className="text-[11px] text-slate-400">2 days ago</span>
                    </div>
                    <div className="flex items-center text-amber-400 mb-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-current" />
                      ))}
                    </div>
                    <p className="text-slate-600 text-xs">Installed on my 2021 model and fits 100% perfectly. Excellent stopping power and very quiet operation. Highly recommend!</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="space-y-4">
                <h4 className="font-bold text-base text-[#0e1932]">Shipping & Delivery Policy</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-[#f8fafc] border border-slate-100">
                    <h5 className="font-bold text-slate-900 mb-2">Delivery Times</h5>
                    <ul className="list-disc list-inside space-y-1 text-xs text-slate-600">
                      <li>Bangkok & Metropolitan: 1 - 2 business days</li>
                      <li>Upcountry & Regional: 2 - 3 business days</li>
                      <li>Express same-day dispatch for orders before 14:00</li>
                    </ul>
                  </div>
                  <div className="p-5 rounded-2xl bg-[#f8fafc] border border-slate-100">
                    <h5 className="font-bold text-slate-900 mb-2">Return & Refund Policy</h5>
                    <ul className="list-disc list-inside space-y-1 text-xs text-slate-600">
                      <li>30 days free returns for unopened & uninstalled parts</li>
                      <li>100% money back guarantee if fitment check fails</li>
                      <li>Free return pickup service nationwide</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 4. Related / Recommended Products Carousel */}
        {relatedProducts.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-[#215ada]">Related Items</span>
                <h3 className="text-2xl font-black text-[#0e1932] tracking-tight">You May Also Like</h3>
              </div>
              <button
                onClick={() => navigate('product-list')}
                className="text-xs font-bold text-[#215ada] hover:underline"
              >
                View Catalog →
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onClick={() => {
                    setProduct(p);
                    setSelectedImageIndex(0);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  onQuickView={(pItem) => setQuickViewProduct(pItem)}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={Boolean(quickViewProduct)}
        onClose={() => setQuickViewProduct(null)}
        onNavigate={navigate}
      />

      {/* Global Vehicle Selector Modal */}
      <VehicleSelectorModal onSelectComplete={(v) => {}} />

      {/* Footer */}
      <Footer navigate={navigate} />
    </div>
  );
};

export default ProductDetail;
