import React, { useState, useEffect } from 'react';
import {
  ChevronLeft, ChevronRight, Package, CheckCircle2, XCircle, AlertCircle, HelpCircle,
  Car, ShieldCheck, Tag, Info, Layers, Wrench, Share2, ShoppingBag, Plus, Minus, Star, Heart,
  Truck, RotateCcw, Award, Eye, Flame, Check, MessageSquare, ThumbsUp, Lock, User,
  FileText, Sliders
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
import { parseProductDescription } from '../utils/productUtils';

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
  const [activeTab, setActiveTab] = useState('general');
  const [shareToast, setShareToast] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);

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
      if (!initialProduct?.id && !initialProduct?.slug) {
        try {
          const res = await ApiClient.getProducts({ pageSize: 1 });
          const items = res?.data?.items || res?.items || [];
          if (mounted && items.length > 0) {
            setProduct(items[0]);
          }
        } catch (e) {}
        return;
      }
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
          <p className="text-slate-500 mb-4 font-bold">{lang === 'th' ? 'ไม่พบข้อมูลสินค้าที่ต้องการ' : 'Product not found'}</p>
          <button
            onClick={() => navigate('product-list')}
            className="px-6 py-2.5 bg-[#0c3175] hover:bg-blue-900 text-white text-xs font-bold rounded-full shadow-md transition-colors cursor-pointer"
          >
            {lang === 'th' ? 'กลับไปเลือกดูสินค้าทั้งหมด' : 'Back to Catalog'}
          </button>
        </main>
        <Footer navigate={navigate} />
      </div>
    );
  }

  // Extract product variants (Multi-SKU)
  const productVariants = (Array.isArray(product.variants) && product.variants.length > 0)
    ? product.variants
    : (Array.isArray(product.attributes?.variants) && product.attributes.variants.length > 0)
    ? product.attributes.variants
    : (product.name && (product.name.toLowerCase().includes('น้ำมัน') || product.name.toLowerCase().includes('oil') || product.sku?.includes('OIL')))
    ? [
        { id: `${product.id}-1L`, name: 'ขนาด 1 ลิตร', sku: `${product.sku || 'OIL'}-1L`, imageUrl: 'https://images.unsplash.com/photo-1618424181497-157f25b6ddd5?w=500&q=80', price: Math.round((product.price || 850) * 0.35), stockQuantity: 24, shippingFee: 45 },
        { id: `${product.id}-4L`, name: 'ขนาด 4 ลิตร (มาตรฐาน)', sku: `${product.sku || 'OIL'}-4L`, imageUrl: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500&q=80', price: product.price || 850, stockQuantity: 18, shippingFee: 65 },
        { id: `${product.id}-5L`, name: 'ขนาด 5 ลิตร (แถม 1L)', sku: `${product.sku || 'OIL'}-5L`, imageUrl: 'https://images.unsplash.com/photo-1600790142055-619df03207e6?w=500&q=80', price: Math.round((product.price || 850) * 1.2), stockQuantity: 12, shippingFee: 80 },
      ]
    : [];

  useEffect(() => {
    if (productVariants.length > 0 && !selectedVariant) {
      setSelectedVariant(productVariants[0]);
    }
  }, [product?.id, productVariants.length]);

  // Extract gallery images, placing selected variant image first if available
  const images = [];
  if (selectedVariant?.imageUrl) {
    images.push(selectedVariant.imageUrl);
  }
  if (product.images && product.images.length > 0) {
    product.images.forEach((img) => {
      const url = typeof img === 'string' ? img : img.url;
      if (url && !images.includes(url)) images.push(url);
    });
  } else if (product.primaryImage && !images.includes(product.primaryImage)) {
    images.push(product.primaryImage);
  }

  const currentImage = images[selectedImageIndex] || images[0] || null;

  // Extract active price, compareAtPrice, SKU, stock, and shipping fee
  const price = selectedVariant?.price ?? (product.effectivePrice?.amount ?? product.prices?.[0]?.price ?? product.price);
  const compareAtPrice = selectedVariant?.compareAtPrice ?? (product.effectivePrice?.compareAtPrice ?? product.prices?.[0]?.compareAtPrice ?? product.compareAtPrice);
  const tier = product.effectivePrice?.tier ?? product.prices?.[0]?.tier;
  const activeSku = selectedVariant?.sku || product.sku;
  const activeStock = selectedVariant?.stockQuantity ?? selectedVariant?.stock ?? product.stockQuantity ?? 24;
  const activeShippingFee = selectedVariant?.shippingFee ?? product.shippingFee ?? 0;

  const discountPct = compareAtPrice && compareAtPrice > price
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : null;

  const desc = parseProductDescription(product?.description, lang);

  const shortDescriptionText = product?.shortDescription || desc.shortDescription || desc.general || (
    product?.name?.includes('BOSCH')
      ? (lang === 'en'
          ? 'Premium ceramic brake pads with low dust, quiet stopping power and OEM disc protection for Toyota Altis 1.6/1.8'
          : 'ผ้าเบรกเซรามิกเกรดพรีเมียม ไร้เสียงรบกวน ฝุ่นน้อย ถนอมจานเบรก ระยะเบรกสั้นมั่นใจ สำหรับ Toyota Altis 1.6/1.8')
      : product?.name?.includes('NGK')
      ? (lang === 'en'
          ? 'High-performance Iridium spark plug for precise ignition, optimal fuel efficiency, and 100,000+ km longevity'
          : 'หัวเทียนอิริเดียม จุดระเบิดแม่นยำ เผาไหม้หมดจด ประหยัดน้ำมัน อายุการใช้งานยาวนานกว่า 100,000 กม.')
      : product?.name?.includes('MANN')
      ? (lang === 'en'
          ? 'German OEM standard engine oil filter capturing micro-particles effectively to extend engine service life'
          : 'ไส้กรองน้ำมันเครื่องมาตรฐานเยอรมัน ดักจับสิ่งสกปรกและอนุภาคโลหะได้อย่างมีประสิทธิภาพ ยืดอายุเครื่องยนต์')
      : product?.name?.includes('KYB')
      ? (lang === 'en'
          ? 'Excel-G twin tube gas shock absorber delivering exceptional damping, stability and cornering confidence'
          : 'โช้คอัพแก๊สประสิทธิภาพสูง ซับแรงกระแทกได้ดีเยี่ยม นุ่มหนึบ ทรงตัวมั่นใจทุกโค้ง')
      : (lang === 'en'
          ? 'Genuine OEM standard auto spare part, certified durability and direct fit for your vehicle'
          : 'ชิ้นส่วนอะไหล่แท้มาตรฐาน OEM ผ่านการทดสอบคุณภาพระดับสากล ทนทาน ตรงรุ่น พร้อมติดตั้ง')
  );

  const hasGeneral = Boolean(
    (desc.general && desc.general.trim().length > 0) ||
    (desc.shortDescription && desc.shortDescription.trim().length > 0) ||
    (product?.shortDescription && product.shortDescription.trim().length > 0)
  );

  const hasSpecific = Boolean(
    (desc.specific && desc.specific.trim().length > 0) ||
    (product?.compatibleVehicles && product.compatibleVehicles.length > 0) ||
    (product?.attributes && Object.keys(product.attributes).length > 0) ||
    product?.carBrand || product?.carModel
  );

  const hasOther = Boolean(
    (desc.other && desc.other.trim().length > 0) ||
    (product?.warrantyText && product.warrantyText.trim().length > 0) ||
    (product?.shippingFee !== undefined && product?.shippingFee !== null)
  );

  const availableTabs = [
    {
      id: 'general',
      label: lang === 'en' ? 'General Details' : 'รายละเอียดทั่วไป',
      icon: FileText
    },
    {
      id: 'specific',
      label: lang === 'en' ? 'Specific Specs' : 'หัวข้อเฉพาะ',
      icon: Sliders
    },
    {
      id: 'other',
      label: lang === 'en' ? 'Others & Warranty' : 'อื่นๆ',
      icon: Info
    },
  ];

  const currentActiveTab = ['general', 'specific', 'other'].includes(activeTab)
    ? activeTab
    : 'general';


  const handleAddToCart = () => {
    if (!user) {
      navigate('login');
      return;
    }
    setIsAddingToCart(true);
    addToCart(
      product.id,
      quantity,
      selectedVehicle?.variantId || null,
      true,
      selectedVariant ? {
        variantId: selectedVariant.id,
        variantName: selectedVariant.name || selectedVariant.size,
        sku: activeSku,
        price: price,
        imageUrl: selectedVariant.imageUrl,
        shippingFee: activeShippingFee,
      } : (activeShippingFee ? { shippingFee: activeShippingFee } : null)
    );
    setTimeout(() => setIsAddingToCart(false), 400);
  };

  const handleBuyNow = () => {
    if (!user) {
      navigate('login');
      return;
    }
    addToCart(
      product.id,
      quantity,
      selectedVehicle?.variantId || null,
      false,
      selectedVariant ? {
        variantId: selectedVariant.id,
        variantName: selectedVariant.name || selectedVariant.size,
        sku: activeSku,
        price: price,
        shippingFee: activeShippingFee,
      } : (activeShippingFee ? { shippingFee: activeShippingFee } : null)
    );
    navigate('checkout');
  };

  const handleShare = () => {
    navigator.clipboard?.writeText?.(window.location.href);
    setShareToast(true);
    setTimeout(() => setShareToast(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-[#0c3175] selection:text-white max-w-full overflow-x-hidden">
      {/* Navbar */}
      <Navbar navigate={navigate} user={user} setUser={setUser} />

      {/* 1. Breadcrumbs Banner Header */}
      <div className="bg-[#f4f6fb] py-4 px-4 sm:px-6 lg:px-8 border-b border-slate-100">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-400">
            <button onClick={() => navigate('home')} className="hover:text-[#0c3175] transition-colors">
              {t('home')}
            </button>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <button onClick={() => navigate('product-list')} className="hover:text-[#0c3175] transition-colors">
              {t('shop')}
            </button>
            {product.category?.name && (
              <>
                <ChevronRight className="w-3 h-3 text-slate-300" />
                <button
                  onClick={() => navigate('product-list', { filters: { categoryId: product.category.id } })}
                  className="hover:text-[#0c3175] transition-colors"
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
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#0c3175] bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-2xs"
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-8 items-start">
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
                <span className="absolute top-4 left-4 bg-[#ea580c] text-white text-xs font-black px-3 py-1 rounded-full shadow-xs">
                  -{discountPct}% OFF
                </span>
              )}

              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-xs border border-slate-200 px-3 py-1 rounded-full flex items-center gap-1.5 text-xs text-slate-700 font-bold shadow-xs">
                <Eye className="w-3.5 h-3.5 text-[#0c3175]" />
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
                      selectedImageIndex === idx ? 'border-[#0c3175] shadow-md scale-105' : 'border-slate-200 opacity-70 hover:opacity-100'
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
                  ● In Stock ({activeStock} units available)
                </span>
                {product.brand && (
                  <span className="text-xs font-black uppercase tracking-wider text-[#0c3175] bg-blue-50 px-3 py-1 rounded-full">
                    {product.brand.name}
                  </span>
                )}
                {activeSku && (
                  <span className="text-xs font-mono font-medium text-slate-400">
                    SKU: {activeSku}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-black text-[#0e1932] tracking-tight leading-snug mb-3">
                {product.name}
              </h1>

              {/* Rating & Reviews Count */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center text-amber-400 text-xs">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current text-amber-400" />
                  ))}
                </div>
                <span className="text-xs font-bold text-slate-700">4.9</span>
                <span className="text-xs text-slate-400">(18 Customer Reviews)</span>
              </div>

              {/* Short Description */}
              {shortDescriptionText && (
                <div className="mb-4">
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {shortDescriptionText}
                  </p>
                </div>
              )}

              {/* Price Display: Only for logged-in members */}
              {user && price !== null && price !== undefined && (
                <div className="p-5 rounded-3xl bg-[#f4f6fb] border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-bold block mb-0.5">
                      {lang === 'th' ? 'ราคาสมาชิก' : 'Member Price'}
                    </span>
                    <div className="flex items-baseline gap-3">
                      <span className="text-3xl sm:text-4xl font-black text-[#0c3175] font-mono">
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
                      <span className="px-3 py-1 rounded-full bg-[#ea580c] text-white text-xs font-bold shadow-xs">
                        SAVE ฿{Number(compareAtPrice - price).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Multi-SKU Variant / Size Selector (Requirement 3) */}
              {productVariants.length > 0 && (
                <div className="mb-6 p-4 rounded-3xl bg-white border border-slate-200/90 shadow-2xs">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-black text-[#0e1932] uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-[#0c3175]" />
                      <span>{lang === 'th' ? 'เลือกขนาด / รูปแบบสินค้า (SKU):' : 'Select Size / Variant (SKU):'}</span>
                    </label>
                    {selectedVariant && (
                      <span className="text-[11px] font-mono text-slate-500 font-bold">
                        SKU: {selectedVariant.sku}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {productVariants.map((v) => {
                      const isSelected = selectedVariant?.id === v.id || selectedVariant?.sku === v.sku;
                      return (
                        <button
                          key={v.id || v.sku}
                          type="button"
                          onClick={() => {
                            setSelectedVariant(v);
                            setSelectedImageIndex(0);
                          }}
                          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex flex-col items-start border-2 ${
                            isSelected
                              ? 'border-[#0c3175] bg-[#0c3175]/5 text-[#0c3175] shadow-xs scale-[1.02]'
                              : 'border-slate-200 bg-slate-50/70 text-slate-700 hover:border-slate-300 hover:bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {v.imageUrl && (
                              <img src={v.imageUrl} alt="" className="w-5 h-5 rounded-md object-cover border border-slate-200 shrink-0" />
                            )}
                            <span className="font-extrabold">{v.name || v.size}</span>
                          </div>
                          {user && v.price && (
                            <span className={`text-[11px] font-mono font-black mt-0.5 ${isSelected ? 'text-[#0c3175]' : 'text-slate-500'}`}>
                              ฿{Number(v.price).toLocaleString()}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {activeShippingFee > 0 && (
                    <div className="mt-3 flex items-center gap-1.5 text-[11px] text-amber-800 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200/70">
                      <Truck className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                      <span>
                        {lang === 'th'
                          ? `ค่าจัดส่งสำหรับสินค้านี้: ฿${activeShippingFee} (ส่งฟรีเมื่อยอดครบ ฿2,000)`
                          : `Shipping fee for this item: ฿${activeShippingFee} (Free shipping over ฿2,000)`}
                      </span>
                    </div>
                  )}
                </div>
              )}


              {/* Deterministic Fitment Status Box */}
              <div className="mb-6 p-4 rounded-3xl border border-slate-200/80 transition-all bg-white shadow-2xs">
                {isVehicleSelected && selectedVehicle ? (
                  loadingFitment ? (
                    <div className="flex items-center gap-2 text-xs text-slate-500 animate-pulse">
                      <Car className="w-4 h-4 text-[#0c3175]" />
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
                  <div className="bg-[#f4f6fb] border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
                    <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="text-xs text-slate-600">
                      {lang === 'th' ? 'ตรวจสอบรุ่นรถที่รองรับได้จากตารางด้านล่าง' : 'Check compatible vehicle models in the specifications below.'}
                    </span>
                  </div>
                )}

                {product.compatibleVehicles && product.compatibleVehicles.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100 text-xs">
                    <div className="font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                      <Car className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{lang === 'th' ? 'รองรับหลายรุ่นรถ (Compatible Vehicles):' : 'Compatible Vehicles:'}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {product.compatibleVehicles.map((cv, i) => (
                        <span key={i} className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-xl text-[11px] font-semibold border border-slate-200/60">
                          <span className="font-black text-[#0c3175]">{cv.make}</span> {cv.model} ({cv.startYear} - {cv.endYear || (lang === 'th' ? 'ปัจจุบัน' : 'Present')})
                          {cv.note && <span className="text-slate-500 text-[10px] font-normal">[{cv.note}]</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Quantity Stepper & Dual Action Buttons / Member Login Requirement */}
              <div className="pt-4 border-t border-slate-100">
                {user ? (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    {/* Quantity */}
                    <div className="flex items-center justify-between sm:justify-start border-2 border-slate-200 rounded-full p-1 bg-white">
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
                      className={`flex-1 py-3 sm:py-3.5 px-6 rounded-full bg-[#0c3175] hover:bg-[#051124] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all ${
                        isAddingToCart ? 'bg-emerald-600 scale-95' : ''
                      }`}
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>{t('addToCart') || 'Add to Cart'}</span>
                    </button>

                    {/* Buy Now Button */}
                    <button
                      onClick={handleBuyNow}
                      className="flex-1 py-3 sm:py-3.5 px-6 rounded-full bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold text-xs sm:text-sm shadow-md transition-all"
                    >
                      {t('buyNow') || 'Buy Now'}
                    </button>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-[#09357a] text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
                    <div className="flex items-center gap-3">
                      <Lock className="w-6 h-6 text-[#ea580c] shrink-0" />
                      <div>
                        <div className="font-extrabold text-sm">{t('loginToBuy')}</div>
                        <div className="text-[11px] text-blue-200">{t('pleaseLoginFirst')}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate('login')}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#ea580c] hover:bg-[#c2410c] text-white font-extrabold text-xs shadow-md transition-colors shrink-0"
                    >
                      {t('signIn')} / {t('register')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Structured Detail Sections: 1. รายละเอียดทั่วไป 2. หัวข้อเฉพาะ 3. อื่นๆ (Always Present) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 mb-10">
          {/* Tab Navigation */}
          <div className="flex items-center gap-2 sm:gap-3 border-b border-slate-200/80 pb-4 overflow-x-auto no-scrollbar">
            {availableTabs.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = currentActiveTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-[#0c3175] text-white shadow-md shadow-blue-950/20 scale-[1.02]'
                      : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                  }`}
                >
                  <TabIcon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* 1. รายละเอียดทั่วไป */}
          {currentActiveTab === 'general' && (
            <div className="pt-6 space-y-6">
              <div className="flex items-center gap-2 text-sm font-black text-[#0c3175]">
                <FileText className="w-5 h-5 text-[#0c3175]" />
                <h3 className="text-base font-black">
                  {lang === 'en' ? 'General Details' : 'รายละเอียดทั่วไป (General Details)'}
                </h3>
              </div>

              {desc.general || desc.shortDescription || product.shortDescription || shortDescriptionText ? (
                <div className="text-slate-700 text-xs sm:text-sm leading-relaxed whitespace-pre-line bg-[#f8fafc] p-5 rounded-2xl border border-slate-200/70">
                  {desc.general || desc.shortDescription || product.shortDescription || shortDescriptionText}
                </div>
              ) : (
                <div className="text-slate-400 text-xs sm:text-sm leading-relaxed whitespace-pre-line bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80 italic">
                  {lang === 'en' ? 'No additional information specified.' : 'ยังไม่มีข้อมูลระบุเพิ่มเติม'}
                </div>
              )}

              {/* Key Overview Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
                  <span className="text-[11px] font-bold text-slate-400 uppercase block mb-1">
                    {lang === 'en' ? 'Manufacturer' : 'แบรนด์ผู้ผลิต'}
                  </span>
                  <span className="text-sm font-extrabold text-[#0c3175]">{product.brand?.name || '-'}</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
                  <span className="text-[11px] font-bold text-slate-400 uppercase block mb-1">
                    {lang === 'en' ? 'Category' : 'หมวดหมู่สินค้า'}
                  </span>
                  <span className="text-sm font-extrabold text-[#0c3175]">{product.category?.name || '-'}</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
                  <span className="text-[11px] font-bold text-slate-400 uppercase block mb-1">
                    {lang === 'en' ? 'SKU Code' : 'รหัสสินค้า (SKU)'}
                  </span>
                  <span className="text-sm font-extrabold font-mono text-slate-800">{activeSku || product.code || '-'}</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
                  <span className="text-[11px] font-bold text-slate-400 uppercase block mb-1">
                    {lang === 'en' ? 'Stock Status' : 'สถานะสต็อก'}
                  </span>
                  <span className="text-sm font-extrabold text-emerald-600 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    {lang === 'en' ? 'In Stock & Ready' : 'พร้อมจัดส่งทั่วประเทศ'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 2. หัวข้อเฉพาะ */}
          {currentActiveTab === 'specific' && (
            <div className="space-y-6 pt-6">
              <div className="flex items-center gap-2 text-sm font-black text-slate-800">
                <Sliders className="w-5 h-5 text-slate-600" />
                <h3 className="text-base font-black">
                  {lang === 'en' ? 'Specific Topics & Specifications' : 'หัวข้อเฉพาะ (Specific Topics / Specs)'}
                </h3>
              </div>

              {desc.specific ? (
                <div className="text-slate-700 text-xs sm:text-sm leading-relaxed whitespace-pre-line bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
                  {desc.specific}
                </div>
              ) : (
                <div className="text-slate-400 text-xs sm:text-sm leading-relaxed whitespace-pre-line bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80 italic">
                  {lang === 'en' ? 'No additional information specified.' : 'ยังไม่มีข้อมูลระบุเพิ่มเติม'}
                </div>
              )}

              {/* Compatible Vehicles */}
              {product.compatibleVehicles && product.compatibleVehicles.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
                    <Car className="w-4 h-4 text-slate-600" />
                    <span>{lang === 'en' ? '100% Guaranteed Compatible Vehicles' : 'รายการรุ่นรถยนต์ที่รองรับ 100% (Compatible Vehicles)'}</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {product.compatibleVehicles.map((cv, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-xs">
                        <div className="font-extrabold text-[#0c3175]">{cv.make} {cv.model}</div>
                        <div className="text-slate-500 text-[11px] mt-0.5">
                          {lang === 'en' ? 'Supported Years:' : 'ปีที่รองรับ:'} {cv.startYear} - {cv.endYear || (lang === 'en' ? 'Present' : 'ปัจจุบัน')}
                        </div>
                        {cv.note && <div className="text-slate-400 text-[10px] mt-1 italic">{cv.note}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* 3. อื่นๆ */}
          {currentActiveTab === 'other' && (
            <div className="space-y-6 pt-6">
              <div className="flex items-center gap-2 text-sm font-black text-amber-800">
                <Info className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-black">
                  {lang === 'en' ? 'Other Information, Warranty & Policies' : 'อื่นๆ (Other Information / Warranty & Policies)'}
                </h3>
              </div>

              {desc.other || product.warrantyText ? (
                <div className="text-slate-700 text-xs sm:text-sm leading-relaxed whitespace-pre-line bg-amber-50/40 p-5 rounded-2xl border border-amber-100/80">
                  {desc.other || product.warrantyText}
                </div>
              ) : (
                <div className="text-slate-400 text-xs sm:text-sm leading-relaxed whitespace-pre-line bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80 italic">
                  {lang === 'en' ? 'No additional information specified.' : 'ยังไม่มีข้อมูลระบุเพิ่มเติม'}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Warranty Card */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center gap-2 text-blue-900 font-bold text-xs uppercase">
                    <ShieldCheck className="w-4 h-4 text-[#0c3175]" />
                    <span>{lang === 'en' ? 'Warranty Policy' : 'นโยบายการรับประกัน'}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {product.warrantyText || (lang === 'en' ? '6-month or 20,000 km manufacturer quality guarantee' : 'รับประกันคุณภาพ 6 เดือน หรือ 20,000 กิโลเมตร ตามมาตรฐานผู้ผลิต')}
                  </p>
                </div>

                {/* Shipping Info Card */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase">
                    <Truck className="w-4 h-4 text-[#ea580c]" />
                    <span>{lang === 'en' ? 'Shipping & Logistics' : 'การจัดส่งสินค้า'}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {product.shippingFee > 0
                      ? (lang === 'en' ? `Standard shipping fee: ฿${product.shippingFee} (Fast 1-2 business days nationwide)` : `อัตราค่าจัดส่ง ฿${product.shippingFee} (จัดส่งด่วนทั่วประเทศ 1-2 วันทำการ)`)
                      : (lang === 'en' ? 'Express delivery nationwide with real-time tracking' : 'จัดส่งด่วนมาตรฐานทั่วประเทศ พร้อมระบบติดตามสถานะพัสดุแบบ Realtime')}
                  </p>
                </div>

                {/* Return Policy Card */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs uppercase">
                    <RotateCcw className="w-4 h-4 text-emerald-600" />
                    <span>{lang === 'en' ? 'Return & Exchange' : 'การเปลี่ยน / คืนสินค้า'}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {lang === 'en'
                      ? 'Immediate replacement for items damaged during delivery or incompatible with verified vehicles'
                      : 'ยินดีเปลี่ยนสินค้าทันทีหากเกิดความเสียหายจากการขนส่ง หรือสินค้าไม่ตรงรุ่นที่ระบุ'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Sticky Mobile Bottom CTA Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-2.5 px-4 flex items-center justify-between gap-3 shadow-lg">
        {user ? (
          <>
            <div>
              <span className="text-[10px] text-slate-400 font-bold block leading-tight">{lang === 'th' ? 'ราคา' : 'Price'}</span>
              <span className="text-base font-black text-[#0c3175] font-mono">
                ฿{Number(price || 0).toLocaleString('th-TH', { minimumFractionDigits: 0 })}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-1 justify-end">
              <button
                onClick={handleAddToCart}
                className="flex-1 max-w-[130px] py-2 px-3 rounded-full bg-[#0c3175] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{lang === 'th' ? 'ใส่ตะกร้า' : 'Cart'}</span>
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 max-w-[130px] py-2 px-3 rounded-full bg-[#ea580c] text-white font-bold text-xs flex items-center justify-center shadow-sm"
              >
                <span>{lang === 'th' ? 'ซื้อเลย' : 'Buy Now'}</span>
              </button>
            </div>
          </>
        ) : (
          <button
            onClick={() => navigate('login')}
            className="w-full py-3 px-6 rounded-full bg-[#0c3175] hover:bg-[#051124] text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4 text-white" />
            <span>{lang === 'th' ? 'เข้าสู่ระบบเพื่อสั่งซื้อ' : 'Log in to Order'}</span>
          </button>
        )}
      </div>

      <Footer navigate={navigate} />
    </div>
  );
};

export default ProductDetail;
