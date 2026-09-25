import React, { useState, useEffect, useRef } from 'react';
import {
  Package, Search, Filter, Plus, Edit2, Trash2, ArrowLeft, Save,
  CheckCircle2, AlertCircle, Image, Upload, X, Tag, Layers, Car,
  DollarSign, Truck, Sliders, ChevronLeft, ChevronRight, Eye, RefreshCw,
  FileText, Info, Globe
} from 'lucide-react';
import ApiClient from '../../utils/apiClient';
import {
  parseProductDescription,
  parseBilingualProductDescription,
  serializeBilingualProductDescription
} from '../../utils/productUtils';

const generateSlug = (name, sku) => {
  let cleanName = (name || '')
    .toLowerCase()
    .replace(/[^a-z0-9\u0E00-\u0E7F\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-');
  let cleanSku = (sku || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-');
  let combined = cleanName ? `${cleanName}-${cleanSku}` : cleanSku;
  combined = combined.replace(/^-+|-+$/g, '');
  return combined || `prod-${Date.now()}`;
};

export default function ProductCatalogManager() {
  const [view, setView] = useState('list'); // 'list' | 'form'
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [carBrands, setCarBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [filterStock, setFilterStock] = useState('ALL');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);

  // Form Edit state
  const [editId, setEditId] = useState(null);
  const [hasVariants, setHasVariants] = useState(false);
  const [descLang, setDescLang] = useState('th'); // 'th' | 'en'
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    slug: '',
    categoryId: '',
    brandId: '',
    barcode: '',
    shortDescription: '',
    descTh: { shortDescription: '', general: '', specific: '', other: '' },
    descEn: { shortDescription: '', general: '', specific: '', other: '' },
    generalDescription: '',
    specificDescription: '',
    otherDescription: '',
    description: '',
    warrantyText: 'รับประกัน 6 เดือน หรือ 20,000 กม. ตามมาตรฐานผู้ผลิต',
    shippingFee: 0, // Product-specific shipping fee
    price: 0,
    compareAtPrice: 0,
    garagePrice: 0,
    shopPrice: 0,
    stockQuantity: 24,
    carBrand: '',
    carModel: '',
    carYear: '',
    images: [],
    variants: [],
    isActive: true,
  });

  const [imageFiles, setImageFiles] = useState([]);
  const fileInputRef = useRef(null);

  // 1. Fetch Lookups (Categories, Brands, Car Brands)
  const fetchLookups = async () => {
    try {
      const [catsRes, brsRes, makesRes] = await Promise.all([
        ApiClient.getCategories().catch(() => ({ data: [] })),
        ApiClient.getBrands().catch(() => ({ data: [] })),
        ApiClient.getMakes(false).catch(() => ({ data: [] })),
      ]);
      const cats = catsRes?.data || catsRes?.categories || (Array.isArray(catsRes) ? catsRes : []);
      const brs = brsRes?.data || brsRes?.brands || (Array.isArray(brsRes) ? brsRes : []);
      const makes = makesRes?.data || makesRes?.makes || (Array.isArray(makesRes) ? makesRes : []);
      if (Array.isArray(cats)) setCategories(cats);
      if (Array.isArray(brs)) setBrands(brs);
      if (Array.isArray(makes)) setCarBrands(makes);
    } catch (e) {
      console.error('Failed to load lookups:', e);
    }
  };

  // 2. Fetch Products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await ApiClient.getProducts({
        q: searchQuery.trim() || undefined,
        categoryId: filterCategory || undefined,
        brandId: filterBrand || undefined,
        pageSize: 100,
      }).catch(() => null);

      const items = res?.data || res?.items || (Array.isArray(res) ? res : []);
      setProducts(items.map(r => ({
        id: r.id,
        name: r.name,
        sku: r.sku || r.code || '',
        category: r.category ? { id: r.category.id || r.categoryId, name: r.category.name } : { id: r.categoryId, name: '-' },
        brand: r.brand ? { id: r.brand.id || r.brandId, name: r.brand.name } : { id: r.brandId, name: '-' },
        price: r.price ?? (r.tierPricing?.general ?? r.price_general ?? 0),
        stockQuantity: r.stockQuantity ?? (r.stock_quantity ?? 0),
        shippingFee: r.shippingFee ?? (r.shipping_fee ?? 0),
        images: Array.isArray(r.images) ? r.images : (() => { try { return JSON.parse(r.images || '[]'); } catch { return []; } })(),
        variants: Array.isArray(r.variants) ? r.variants : (() => { try { return JSON.parse(r.variants || '[]'); } catch { return []; } })(),
        isActive: r.isActive !== false,
      })));
    } catch (e) {
      console.error('Failed to fetch products:', e);
      setError('ไม่สามารถโหลดข้อมูลสินค้าได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLookups();
    fetchProducts();
  }, []);

  // Handle Switch to Create Mode
  const handleAddNew = () => {
    setEditId(null);
    setHasVariants(false);
    setDescLang('th');
    setFormData({
      name: '',
      sku: '', // รหัสสินค้า (Product Code)
      slug: '',
      slugManual: false,
      categoryId: categories[0]?.id || '',
      brandId: brands[0]?.id || '',
      barcode: '',
      shortDescription: '',
      descTh: { shortDescription: '', general: '', specific: '', other: '' },
      descEn: { shortDescription: '', general: '', specific: '', other: '' },
      generalDescription: '',
      specificDescription: '',
      otherDescription: '',
      description: '',
      warrantyText: 'รับประกัน 6 เดือน หรือ 20,000 กม. ตามมาตรฐานผู้ผลิต',
      shippingFee: 0,
      price: 0,
      compareAtPrice: 0,
      garagePrice: 0,
      shopPrice: 0,
      stockQuantity: 20,
      compatibleVehicles: [
        { id: `cv-${Date.now()}`, make: '', model: '', startYear: '', endYear: '', note: '' }
      ],
      carBrand: '',
      carModel: '',
      carYear: '',
      images: [],
      variants: [],
      isActive: true,
    });
    setImageFiles([]);
    setView('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle Switch to Edit Mode
  const handleEdit = (p) => {
    setEditId(p.id);
    const varList = p.variants && p.variants.length > 0 ? p.variants : [];
    setHasVariants(varList.length > 0);
    setDescLang('th');

    const compVehicles = p.compatibleVehicles && p.compatibleVehicles.length > 0
      ? p.compatibleVehicles
      : (p.carBrand || p.carModel)
      ? [{ id: `cv-${Date.now()}`, make: p.carBrand || '', model: p.carModel || '', startYear: p.carYear?.split('-')?.[0]?.trim() || '', endYear: p.carYear?.split('-')?.[1]?.trim() || '', note: '' }]
      : [{ id: `cv-${Date.now()}`, make: '', model: '', startYear: '', endYear: '', note: '' }];

    const bilingual = parseBilingualProductDescription(p.description, p.shortDescription);

    setFormData({
      name: p.name || '',
      sku: p.sku || p.code || '',
      slug: p.slug || '',
      slugManual: true,
      categoryId: p.category?.id || p.categoryId || '',
      brandId: p.brand?.id || p.brandId || '',
      barcode: p.barcode || '',
      shortDescription: bilingual.th.shortDescription || p.shortDescription || '',
      descTh: bilingual.th,
      descEn: bilingual.en,
      generalDescription: bilingual.th.general,
      specificDescription: bilingual.th.specific,
      otherDescription: bilingual.th.other || p.warrantyText || '',
      description: p.description || '',
      warrantyText: p.warrantyText || bilingual.th.other || bilingual.en.other || 'รับประกัน 6 เดือน หรือ 20,000 กม.',
      shippingFee: p.shippingFee || 0,
      price: p.price || 0,
      compareAtPrice: p.compareAtPrice || 0,
      garagePrice: p.garagePrice || 0,
      shopPrice: p.shopPrice || 0,
      stockQuantity: p.stockQuantity || 20,
      compatibleVehicles: compVehicles,
      carBrand: p.carBrand || '',
      carModel: p.carModel || '',
      carYear: p.carYear || '',
      images: p.images || [],
      variants: varList,
      isActive: p.isActive !== false,
    });
    setImageFiles(p.images || []);
    setView('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Add Variant Row (Each variant has its own unique SKU and its own image)
  const handleAddVariant = () => {
    const nextIdx = (formData.variants?.length || 0) + 1;
    const baseCode = formData.sku || 'SKU';
    const newVariant = {
      id: `v-${Date.now()}-${nextIdx}`,
      name: `ขนาด/ตัวเลือกที่ ${nextIdx}`,
      sku: `${baseCode}-V${nextIdx}`,
      imageUrl: '',
      price: formData.price || 0,
      compareAtPrice: formData.compareAtPrice || 0,
      garagePrice: formData.garagePrice || 0,
      stockQuantity: 10,
      shippingFee: formData.shippingFee || 0,
      barcode: '',
    };
    setFormData(prev => ({
      ...prev,
      variants: [...(prev.variants || []), newVariant],
    }));
  };

  const handleUpdateVariant = (index, field, value) => {
    setFormData(prev => {
      const updated = [...(prev.variants || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, variants: updated };
    });
  };

  const handleVariantImageUpload = (index, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      handleUpdateVariant(index, 'imageUrl', e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveVariant = (index) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  // Compatible Vehicles (Vehicle Fitment - Supports Multiple Models & Start/End Years)
  const handleAddCompatibleVehicle = () => {
    const nextIdx = (formData.compatibleVehicles?.length || 0) + 1;
    const newVehicle = {
      id: `cv-${Date.now()}-${nextIdx}`,
      make: '',
      model: '',
      startYear: '',
      endYear: '',
      note: '',
    };
    setFormData(prev => ({
      ...prev,
      compatibleVehicles: [...(prev.compatibleVehicles || []), newVehicle],
    }));
  };

  const handleUpdateCompatibleVehicle = (index, field, value) => {
    setFormData(prev => {
      const list = [...(prev.compatibleVehicles || [])];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, compatibleVehicles: list };
    });
  };

  const handleRemoveCompatibleVehicle = (index) => {
    setFormData(prev => ({
      ...prev,
      compatibleVehicles: (prev.compatibleVehicles || []).filter((_, i) => i !== index),
    }));
  };

  // Handle Image Upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const readers = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (ev) => resolve(ev.target.result);
        reader.readAsDataURL(file);
      });
    });
    Promise.all(readers).then(results => {
      setImageFiles(prev => [...prev, ...results]);
      setFormData(prev => ({ ...prev, images: [...prev.images, ...results] }));
    });
  };

  const removeImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  // Save Product
  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.sku.trim()) {
      setError('กรุณากรอกชื่อสินค้าและรหัส SKU ให้ครบถ้วน');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const structuredDescription = serializeBilingualProductDescription({
        th: formData.descTh || {},
        en: formData.descEn || {},
      });

      // Prepare clean slug
      const calculatedSlug = (formData.slug?.trim() || generateSlug(formData.name, formData.sku)).toLowerCase();

      // Format price tiers for backend database
      const prices = [
        {
          tier: 'GENERAL',
          price: Number(formData.price || 0),
          compareAtPrice: formData.compareAtPrice ? Number(formData.compareAtPrice) : null,
          currency: 'THB',
        },
      ];
      if (formData.garagePrice && Number(formData.garagePrice) > 0) {
        prices.push({
          tier: 'GARAGE',
          price: Number(formData.garagePrice),
          currency: 'THB',
        });
      }
      if (formData.shopPrice && Number(formData.shopPrice) > 0) {
        prices.push({
          tier: 'SHOP',
          price: Number(formData.shopPrice),
          currency: 'THB',
        });
      }

      // Format images
      const formattedImages = (imageFiles || [])
        .map((img, idx) => {
          if (typeof img === 'string') {
            return { url: img, isPrimary: idx === 0, sortOrder: idx };
          }
          return { url: img.url || '', isPrimary: img.isPrimary ?? idx === 0, sortOrder: img.sortOrder ?? idx };
        })
        .filter((img) => Boolean(img.url));

      const payload = {
        ...formData,
        slug: calculatedSlug,
        description: structuredDescription,
        shortDescription: formData.descTh?.shortDescription || formData.descEn?.shortDescription || formData.shortDescription || '',
        warrantyText: formData.descTh?.other || formData.descEn?.other || formData.warrantyText,
        price: Number(formData.price || 0),
        compareAtPrice: Number(formData.compareAtPrice || 0),
        shippingFee: Number(formData.shippingFee || 0),
        stockQuantity: Number(formData.stockQuantity || 0),
        prices,
        images: formattedImages,
        variants: hasVariants ? formData.variants : [],
      };

      let savedProductData = null;
      if (editId) {
        const updateRes = await ApiClient.updateProduct(editId, payload);
        savedProductData = updateRes?.data || updateRes;
      } else {
        const createRes = await ApiClient.createProduct(payload);
        savedProductData = createRes?.data || createRes;
        if (savedProductData?.id) {
          payload.id = savedProductData.id;
        }
      }

      // Update State List
      const selectedCat = categories.find(c => c.id === payload.categoryId);
      const selectedBr = brands.find(b => b.id === payload.brandId);

      const savedProductItem = {
        id: editId || savedProductData?.id || `prod-${Date.now()}`,
        ...payload,
        ...(savedProductData || {}),
        category: selectedCat ? { id: selectedCat.id, name: selectedCat.name } : { name: 'อะไหล่' },
        brand: selectedBr ? { id: selectedBr.id, name: selectedBr.name } : { name: 'แบรนด์' },
      };

      setProducts(prev => {
        if (editId) {
          return prev.map(p => p.id === editId ? savedProductItem : p);
        }
        return [savedProductItem, ...prev];
      });

      setSuccess(editId ? 'บันทึกการแก้ไขสินค้าสำเร็จ!' : 'เพิ่มสินค้าใหม่ลงในแค็ตตาล็อกสำเร็จ!');
      setTimeout(() => setSuccess(''), 3000);
      setView('list');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูลสินค้า');
    } finally {
      setLoading(false);
    }
  };

  // Delete Product
  const handleDelete = async (id) => {
    if (window.confirm('คุณต้องการลบสินค้านี้ออกจากแค็ตตาล็อกใช่หรือไม่?')) {
      try {
        await ApiClient.deleteProduct(id);
        setProducts(prev => prev.filter(p => p.id !== id));
        setSuccess('ลบสินค้าเรียบร้อยแล้ว');
        setTimeout(() => setSuccess(''), 2500);
      } catch (err) {
        setError(err.message || 'ไม่สามารถลบสินค้าได้');
        alert(err.message || 'ไม่สามารถลบสินค้าได้');
      }
    }
  };

  // Filtered Products
  const filteredProducts = products.filter(p => {
    const matchQ = !searchQuery.trim() ||
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = !filterCategory || p.category?.id === filterCategory || p.categoryId === filterCategory;
    const matchBr = !filterBrand || p.brand?.id === filterBrand || p.brandId === filterBrand;
    const matchStock = filterStock === 'ALL' ? true :
      filterStock === 'IN_STOCK' ? (p.stockQuantity > 5) :
      filterStock === 'LOW_STOCK' ? (p.stockQuantity > 0 && p.stockQuantity <= 5) :
      (p.stockQuantity === 0);
    return matchQ && matchCat && matchBr && matchStock;
  });

  const totalPages = Math.ceil(filteredProducts.length / limit) || 1;
  const paginatedProducts = filteredProducts.slice((page - 1) * limit, page * limit);

  // ==========================================
  // VIEW 1: PRODUCT LIST (Default)
  // ==========================================
  if (view === 'list') {
    return (
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Package className="w-6 h-6 text-[#0c3175]" />
              <span>การจัดการสินค้าแค็ตตาล็อก (Catalog Products)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              แสดงรายการสินค้าอะไหล่ยนต์ ค้นหา กรองสถานะ และเพิ่มสินค้าใหม่พร้อมระบบหลาย SKU และค่าจัดส่งเฉพาะ
            </p>
          </div>
          <button
            onClick={handleAddNew}
            className="px-5 py-2.5 bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ เพิ่มสินค้าใหม่ (Add Product)</span>
          </button>
        </div>

        {error && <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold">{error}</div>}
        {success && <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-semibold">{success}</div>}

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ค้นหาชื่อสินค้า, รหัส SKU..."
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#0c3175] focus:bg-white transition-all"
              />
            </div>

            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={e => { setFilterCategory(e.target.value); setPage(1); }}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none font-semibold text-slate-700"
            >
              <option value="">-- ทุกหมวดหมู่ --</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            {/* Brand Filter */}
            <select
              value={filterBrand}
              onChange={e => { setFilterBrand(e.target.value); setPage(1); }}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none font-semibold text-slate-700"
            >
              <option value="">-- ทุกแบรนด์ --</option>
              {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>

            {/* Stock Filter */}
            <select
              value={filterStock}
              onChange={e => { setFilterStock(e.target.value); setPage(1); }}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none font-semibold text-slate-700"
            >
              <option value="ALL">สต็อกทั้งหมด</option>
              <option value="IN_STOCK">มีสินค้าพร้อมส่ง</option>
              <option value="LOW_STOCK">สินค้าใกล้หมด (≤ 5)</option>
              <option value="OUT_OF_STOCK">สินค้าหมด</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">พบ {filteredProducts.length} รายการ</span>
            <button
              onClick={() => { setSearchQuery(''); setFilterCategory(''); setFilterBrand(''); setFilterStock('ALL'); setPage(1); }}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              title="รีเซ็ตตัวกรอง"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Product Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="p-3.5 w-16">รูปภาพ</th>
                  <th className="p-3.5">ชื่อสินค้า & รหัส SKU</th>
                  <th className="p-3.5">หมวดหมู่</th>
                  <th className="p-3.5">แบรนด์</th>
                  <th className="p-3.5">ระบบหลาย SKU / ขนาด</th>
                  <th className="p-3.5 text-right">ราคาจำหน่าย</th>
                  <th className="p-3.5 text-center">ค่าจัดส่งเฉพาะ</th>
                  <th className="p-3.5 text-center">คงเหลือ</th>
                  <th className="p-3.5 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      กำลังโหลดข้อมูลสินค้า...
                    </td>
                  </tr>
                ) : paginatedProducts.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      <Package className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                      ไม่พบสินค้าตรงตามเงื่อนไข
                    </td>
                  </tr>
                ) : (
                  paginatedProducts.map(p => {
                    const primaryImg = p.images?.[0] || p.primaryImage;
                    const variantCount = p.variants?.length || 0;
                    const shippingFee = Number(p.shippingFee || 0);

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-3.5">
                          {primaryImg ? (
                            <img src={primaryImg} alt={p.name} className="w-11 h-11 object-cover rounded-xl border border-slate-200 bg-white" />
                          ) : (
                            <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 text-[10px]">
                              No Pic
                            </div>
                          )}
                        </td>
                        <td className="p-3.5">
                          <div className="font-bold text-slate-900 line-clamp-1 max-w-xs">{p.name}</div>
                          <div className="font-mono text-[11px] text-slate-400 mt-0.5">SKU: {p.sku || '-'}</div>
                        </td>
                        <td className="p-3.5 text-slate-600 font-medium">
                          {p.category?.name || '-'}
                        </td>
                        <td className="p-3.5 font-bold text-slate-700">
                          {p.brand?.name || '-'}
                        </td>
                        <td className="p-3.5">
                          {variantCount > 0 ? (
                            <div className="flex flex-col gap-1">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-bold text-[10px]">
                                {variantCount} ขนาด/SKU
                              </span>
                              <span className="text-[10px] text-slate-400 truncate max-w-[140px]">
                                {p.variants.map(v => v.name).join(', ')}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[11px]">SKU เดี่ยว</span>
                          )}
                        </td>
                        <td className="p-3.5 text-right font-mono font-bold text-slate-900">
                          {variantCount > 0 ? (
                            <div>
                              <span>฿{Math.min(...p.variants.map(v => Number(v.price || 0))).toLocaleString()}</span>
                              <span className="text-slate-400 font-normal text-[10px]"> - </span>
                              <span>฿{Math.max(...p.variants.map(v => Number(v.price || 0))).toLocaleString()}</span>
                            </div>
                          ) : (
                            <span>฿{Number(p.price || 0).toLocaleString()}</span>
                          )}
                        </td>
                        <td className="p-3.5 text-center">
                          {variantCount > 0 ? (
                            (() => {
                              const variantShippingFees = p.variants.map(v => Number(v.shippingFee ?? p.shippingFee ?? 0));
                              const minShip = Math.min(...variantShippingFees);
                              const maxShip = Math.max(...variantShippingFees);
                              return (
                                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-bold text-[10px]">
                                  {minShip === maxShip ? `฿${minShip} (ตาม SKU)` : `฿${minShip}-฿${maxShip} (ตาม SKU)`}
                                </span>
                              );
                            })()
                          ) : shippingFee > 0 ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-bold text-[10px]">
                              ฿{shippingFee} / ชิ้น
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px]">
                              มาตรฐาน (฿0)
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-center">
                          <span className={`font-mono font-bold ${p.stockQuantity <= 5 ? 'text-rose-600' : 'text-slate-700'}`}>
                            {p.stockQuantity || 0}
                          </span>
                        </td>
                        <td className="p-3.5 text-right whitespace-nowrap">
                          <button
                            onClick={() => handleEdit(p)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg mr-1.5 transition-colors"
                            title="แก้ไขสินค้า"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="ลบสินค้า"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div>แสดงหน้า {page} จาก {totalPages}</div>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: DEDICATED ADD / EDIT FORM
  // ==========================================
  return (
    <div className="space-y-6">
      {/* Top Bar with Back & Save */}
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <button
          type="button"
          onClick={() => setView('list')}
          className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#0c3175] px-3.5 py-2 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ย้อนกลับไปยังรายการสินค้า (Back to List)</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setView('list')}
            className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-colors"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2 bg-[#0c3175] hover:bg-[#081e4b] text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'กำลังบันทึก...' : (editId ? 'บันทึกการแก้ไข' : 'บันทึกสินค้าใหม่')}</span>
          </button>
        </div>
      </div>

      {error && <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold">{error}</div>}

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Section 1: General Product Info */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
            <Package className="w-4 h-4 text-[#0c3175]" />
            <span>1. ข้อมูลพื้นฐานสินค้า (General Information)</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">ชื่อสินค้า *</label>
              <input
                type="text"
                required
                className="w-full border border-slate-200 p-2.5 rounded-xl text-xs font-semibold outline-none focus:border-[#0c3175]"
                value={formData.name}
                onChange={e => {
                  const newName = e.target.value;
                  setFormData(prev => ({
                    ...prev,
                    name: newName,
                    slug: prev.slugManual ? prev.slug : generateSlug(newName, prev.sku)
                  }));
                }}
                placeholder="เช่น น้ำมันเครื่องสังเคราะห์แท้ MOTUL 8100 X-cess 5W-30"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">รหัสสินค้า (Product Code) *</label>
              <input
                type="text"
                required
                className="w-full border border-slate-200 p-2.5 rounded-xl text-xs font-mono font-bold outline-none focus:border-[#0c3175]"
                value={formData.sku}
                onChange={e => {
                  const newSku = e.target.value;
                  setFormData(prev => ({
                    ...prev,
                    sku: newSku,
                    slug: prev.slugManual ? prev.slug : generateSlug(prev.name, newSku)
                  }));
                }}
                placeholder="เช่น PROD-MOT-8100 หรือ MOT-8100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">หมวดหมู่สินค้า *</label>
              <select
                required
                value={formData.categoryId}
                onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full border border-slate-200 p-2.5 rounded-xl text-xs font-semibold outline-none bg-white focus:border-[#0c3175]"
              >
                <option value="">-- เลือกหมวดหมู่ --</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">แบรนด์ผู้ผลิต *</label>
              <select
                required
                value={formData.brandId}
                onChange={e => setFormData({ ...formData, brandId: e.target.value })}
                className="w-full border border-slate-200 p-2.5 rounded-xl text-xs font-semibold outline-none bg-white focus:border-[#0c3175]"
              >
                <option value="">-- เลือกแบรนด์ --</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">บาร์โค้ด (Barcode / EAN)</label>
              <input
                type="text"
                className="w-full border border-slate-200 p-2.5 rounded-xl text-xs font-mono outline-none focus:border-[#0c3175]"
                value={formData.barcode}
                onChange={e => setFormData({ ...formData, barcode: e.target.value })}
                placeholder="8851234567890"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-600 uppercase">Slug (URL สินค้า)</label>
                <span className="text-[10px] text-slate-400">สร้างอัตโนมัติ</span>
              </div>
              <input
                type="text"
                className="w-full border border-slate-200 p-2.5 rounded-xl text-xs font-mono outline-none focus:border-[#0c3175]"
                value={formData.slug || ''}
                onChange={e => setFormData({ ...formData, slug: e.target.value, slugManual: true })}
                placeholder="สร้างอัตโนมัติจากชื่อและรหัส"
              />
            </div>
          </div>

          {/* Structured Content Sections: รายละเอียดทั่วไป, หัวข้อเฉพาะ, อื่นๆ (Bilingual: TH & EN) */}
          <div className="pt-2 border-t border-slate-200/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs">
              <div>
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#0c3175]" />
                  <span>เนื้อหาและรายละเอียดสินค้า 2 ภาษา (Bilingual Product Content)</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  กำหนดข้อมูล 3 หัวข้อหลักได้ทั้งภาษาไทยและอังกฤษ เพื่อให้หน้าบ้านแสดงผลได้สมบูรณ์ทั้ง 2 ภาษา
                </div>
              </div>

              {/* Language Switcher Tabs: TH & EN */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 self-start shrink-0">
                <button
                  type="button"
                  onClick={() => setDescLang('th')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    descLang === 'th'
                      ? 'bg-[#0c3175] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <span>🇹🇭</span>
                  <span>ภาษาไทย (TH)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDescLang('en')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    descLang === 'en'
                      ? 'bg-[#0c3175] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <span>🇬🇧</span>
                  <span>English (EN)</span>
                  {Boolean(formData.descEn?.general || formData.descEn?.specific || formData.descEn?.other) && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  )}
                </button>
              </div>
            </div>

            {/* 1. รายละเอียดทั่วไป */}
            <div className="bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#0c3175]" />
                  <span className="text-sm font-bold text-[#0c3175]">
                    {descLang === 'th' ? '1. รายละเอียดทั่วไป' : '1. General Details'}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {descLang === 'th' ? '(General Details)' : '(รายละเอียดทั่วไป)'}
                  </span>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  descLang === 'th' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {descLang === 'th' ? '🇹🇭 ภาษาไทย (TH)' : '🇬🇧 English (EN)'}
                </span>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {descLang === 'th' ? 'คำอธิบายย่อ (Short Description)' : 'Short Description (English)'}
                </label>
                <input
                  type="text"
                  className="w-full border border-slate-200 p-2.5 rounded-xl text-xs outline-none focus:border-[#0c3175] bg-white font-medium"
                  value={descLang === 'th' ? (formData.descTh?.shortDescription || '') : (formData.descEn?.shortDescription || '')}
                  onChange={e => {
                    const val = e.target.value;
                    setFormData(prev => ({
                      ...prev,
                      shortDescription: descLang === 'th' ? val : prev.shortDescription,
                      [descLang === 'th' ? 'descTh' : 'descEn']: {
                        ...(prev[descLang === 'th' ? 'descTh' : 'descEn'] || {}),
                        shortDescription: val,
                      }
                    }));
                  }}
                  placeholder={descLang === 'th' ? "ข้อความสั้นสรุปจุดเด่นของสินค้า (แสดงใต้ชื่อสินค้าในหน้าแค็ตตาล็อกและหน้ารายละเอียด)" : "Short summary of product highlights (displayed below product title)"}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {descLang === 'th' ? 'รายละเอียดทั่วไป / ภาพรวมสินค้า (General Overview)' : 'General Overview / Description (English)'}
                </label>
                <textarea
                  rows={3}
                  className="w-full border border-slate-200 p-2.5 rounded-xl text-xs outline-none focus:border-[#0c3175] leading-relaxed bg-white"
                  value={descLang === 'th' ? (formData.descTh?.general || '') : (formData.descEn?.general || '')}
                  onChange={e => {
                    const val = e.target.value;
                    setFormData(prev => ({
                      ...prev,
                      [descLang === 'th' ? 'descTh' : 'descEn']: {
                        ...(prev[descLang === 'th' ? 'descTh' : 'descEn'] || {}),
                        general: val,
                      }
                    }));
                  }}
                  placeholder={descLang === 'th' ? "ข้อมูลภาพรวม จุดเด่นของสินค้า การผลิต และคุณสมบัติพื้นฐานทั่วไป..." : "Comprehensive overview, product manufacturing highlights, and basic features..."}
                />
              </div>
            </div>

            {/* 2. หัวข้อเฉพาะ */}
            <div className="bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-slate-600" />
                  <span className="text-sm font-bold text-slate-800">
                    {descLang === 'th' ? '2. หัวข้อเฉพาะ' : '2. Specific Topics & Specs'}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {descLang === 'th' ? '(Specific Topics / Specs)' : '(หัวข้อเฉพาะ)'}
                  </span>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  descLang === 'th' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {descLang === 'th' ? '🇹🇭 ภาษาไทย (TH)' : '🇬🇧 English (EN)'}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {descLang === 'th' ? 'ข้อมูลจำเพาะและคุณลักษณะเฉพาะทางเทคนิค (Technical Specs / Specific Attributes)' : 'Technical Specs & Specific Attributes (English)'}
                </label>
                <textarea
                  rows={3}
                  className="w-full border border-slate-200 p-2.5 rounded-xl text-xs outline-none focus:border-[#0c3175] leading-relaxed bg-white"
                  value={descLang === 'th' ? (formData.descTh?.specific || '') : (formData.descEn?.specific || '')}
                  onChange={e => {
                    const val = e.target.value;
                    setFormData(prev => ({
                      ...prev,
                      [descLang === 'th' ? 'descTh' : 'descEn']: {
                        ...(prev[descLang === 'th' ? 'descTh' : 'descEn'] || {}),
                        specific: val,
                      }
                    }));
                  }}
                  placeholder={descLang === 'th' ? "สเปกเฉพาะ เช่น ขนาดมิติ, เกรดวัสดุ, ค่าแรงดัน, ตำแหน่งติดตั้ง, มาตรฐานทดสอบ OEM..." : "Specific parameters e.g., dimensions, material grade, pressure rating, mounting position, OEM certifications..."}
                />
              </div>
            </div>

            {/* 3. อื่นๆ */}
            <div className="bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-bold text-amber-800">
                    {descLang === 'th' ? '3. อื่นๆ' : '3. Other Information & Warranty'}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {descLang === 'th' ? '(Other Information / Warranty & Notes)' : '(อื่นๆ)'}
                  </span>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  descLang === 'th' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {descLang === 'th' ? '🇹🇭 ภาษาไทย (TH)' : '🇬🇧 English (EN)'}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {descLang === 'th' ? 'ข้อมูลอื่นๆ / เงื่อนไขการรับประกันและการดูแลรักษา (Other Notes & Warranty)' : 'Other Notes, Warranty Terms & Maintenance Instructions (English)'}
                </label>
                <textarea
                  rows={3}
                  className="w-full border border-slate-200 p-2.5 rounded-xl text-xs outline-none focus:border-[#0c3175] leading-relaxed bg-white"
                  value={descLang === 'th' ? (formData.descTh?.other || '') : (formData.descEn?.other || '')}
                  onChange={e => {
                    const val = e.target.value;
                    setFormData(prev => ({
                      ...prev,
                      warrantyText: descLang === 'th' ? val : prev.warrantyText,
                      [descLang === 'th' ? 'descTh' : 'descEn']: {
                        ...(prev[descLang === 'th' ? 'descTh' : 'descEn'] || {}),
                        other: val,
                      }
                    }));
                  }}
                  placeholder={descLang === 'th' ? "เงื่อนไขการรับประกัน, ข้อควรระวัง, คำแนะนำการติดตั้ง หรือหมายเหตุการจัดส่งเพิ่มเติม..." : "Warranty guidelines, cautions, installation tips, or logistics notes..."}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Product-Specific Shipping Rate (Requirement 2 & Per-SKU Shipping) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800 border-b pb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#ea580c]" />
              <span>2. ค่าจัดส่งสินค้า (Shipping Rate / Fee)</span>
            </div>
            <span className="text-[11px] text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full font-bold border border-amber-200">
              {hasVariants ? 'กำหนดตามราย SKU' : 'กำหนดสำหรับ SKU นี้'}
            </span>
          </h3>

          {hasVariants ? (
            <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-3">
              <Sliders className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold text-blue-950">สินค้านี้คิดค่าจัดส่งตามราย SKU (Per-SKU Shipping)</div>
                <div className="text-blue-800 text-[11px] leading-relaxed">
                  เนื่องจากเปิดใช้งานระบบหลาย SKU / หลายขนาด อัตราค่าจัดส่งจะถูกระบุแยกอิสระในแต่ละแถวของตาราง <b>"3. ระบบหลายขนาด / หลาย SKU (Multi-SKU & Variants)"</b> ด้านล่าง (เช่น ขนาด 1L ฿45, ขนาด 4L ฿65, ขนาด 5L ฿80) เพื่อให้ค่าจัดส่งถูกต้องตามขนาดและน้ำหนักจริงของแต่ละ SKU
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  ค่าจัดส่งสำหรับ SKU นี้ (บาท / ชิ้น)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">฿</span>
                  <input
                    type="number"
                    min="0"
                    className="w-full border border-slate-200 pl-8 pr-3 py-2.5 rounded-xl text-xs font-mono font-bold outline-none focus:border-[#0c3175]"
                    value={formData.shippingFee}
                    onChange={e => setFormData({ ...formData, shippingFee: Number(e.target.value) })}
                    placeholder="0 (หากเป็น 0 จะคิดตามค่าจัดส่งมาตรฐานของร้าน)"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1">
                <div className="font-bold text-slate-800">💡 การคำนวณในขั้นตอนชำระเงิน:</div>
                <div>• คิดค่าจัดส่งตาม SKU นี้ในขั้นตอนตะกร้าและ Checkout</div>
                <div>• หากยอดคำสั่งซื้อถึงเกณฑ์ส่งฟรีของร้านค้า ระบบจะปรับเป็นส่งฟรีให้อัตโนมัติ</div>
              </div>
            </div>
          )}
        </div>

        {/* Section 3: Multi-SKU / Size Variants (Requirement 3) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-600" />
              <span>3. ระบบหลายขนาด / หลาย SKU (Multi-SKU & Variants)</span>
            </h3>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200">
              <input
                type="checkbox"
                checked={hasVariants}
                onChange={e => {
                  setHasVariants(e.target.checked);
                  if (e.target.checked && (!formData.variants || formData.variants.length === 0)) {
                    handleAddVariant();
                  }
                }}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span>สินค้านี้มีหลายขนาด/หลายสเปก (เช่น 1L, 4L, 5L)</span>
            </label>
          </div>

          {hasVariants ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  กำหนดขนาดและราคาของแต่ละ SKU ย่อย ลูกค้าสามารถคลิกเลือกซื้อขนาดที่ต้องการบนหน้าร้านได้ทันที
                </p>
                <button
                  type="button"
                  onClick={handleAddVariant}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ เพิ่ม SKU ขนาดย่อย</span>
                </button>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px]">
                      <th className="p-3">รูปภาพประจำ SKU</th>
                      <th className="p-3">ชื่อขนาด/ตัวเลือก (Variant Name)</th>
                      <th className="p-3">รหัส SKU เฉพาะตัว *</th>
                      <th className="p-3">ราคาขาย (฿) *</th>
                      <th className="p-3">ราคาเดิม (฿)</th>
                      <th className="p-3">ราคาอู่ (฿)</th>
                      <th className="p-3">สต็อก (ชิ้น)</th>
                      <th className="p-3">ค่าจัดส่ง SKU (฿)</th>
                      <th className="p-3 text-center">ลบ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {formData.variants?.map((v, idx) => (
                      <tr key={v.id || idx} className="hover:bg-slate-50/50">
                        <td className="p-2.5">
                          <div className="flex items-center gap-2">
                            {v.imageUrl ? (
                              <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shrink-0 group">
                                <img src={v.imageUrl} alt="" className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => handleUpdateVariant(idx, 'imageUrl', '')}
                                  className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                  title="ลบรูป"
                                >
                                  <X className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            ) : (
                              <label className="w-12 h-12 rounded-xl border border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/50 flex flex-col items-center justify-center text-slate-400 hover:text-blue-600 cursor-pointer shrink-0 transition-colors">
                                <Upload className="w-3.5 h-3.5" />
                                <span className="text-[8px] font-bold mt-0.5">เพิ่มรูป</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={e => handleVariantImageUpload(idx, e.target.files?.[0])}
                                />
                              </label>
                            )}
                            <input
                              type="text"
                              placeholder="หรือใส่ URL รูป"
                              className="w-24 border border-slate-200 p-1.5 rounded-lg text-[10px] text-slate-500 outline-none focus:border-blue-500"
                              value={v.imageUrl || ''}
                              onChange={e => handleUpdateVariant(idx, 'imageUrl', e.target.value)}
                            />
                          </div>
                        </td>
                        <td className="p-2.5">
                          <input
                            type="text"
                            required
                            placeholder="เช่น ขนาด 1 ลิตร"
                            className="w-32 border border-slate-200 p-2 rounded-lg font-bold text-xs"
                            value={v.name}
                            onChange={e => handleUpdateVariant(idx, 'name', e.target.value)}
                          />
                        </td>
                        <td className="p-2.5">
                          <input
                            type="text"
                            required
                            placeholder="SKU-1L"
                            className="w-32 border border-slate-200 p-2 rounded-lg font-mono font-bold text-xs text-blue-900 bg-blue-50/40"
                            value={v.sku}
                            onChange={e => handleUpdateVariant(idx, 'sku', e.target.value)}
                          />
                        </td>
                        <td className="p-2.5">
                          <input
                            type="number"
                            required
                            min="0"
                            className="w-20 border border-slate-200 p-2 rounded-lg font-mono font-bold text-xs"
                            value={v.price}
                            onChange={e => handleUpdateVariant(idx, 'price', Number(e.target.value))}
                          />
                        </td>
                        <td className="p-2.5">
                          <input
                            type="number"
                            min="0"
                            className="w-20 border border-slate-200 p-2 rounded-lg font-mono text-xs text-slate-400"
                            value={v.compareAtPrice || ''}
                            onChange={e => handleUpdateVariant(idx, 'compareAtPrice', Number(e.target.value))}
                          />
                        </td>
                        <td className="p-2.5">
                          <input
                            type="number"
                            min="0"
                            placeholder="ราคาส่ง"
                            className="w-20 border border-slate-200 p-2 rounded-lg font-mono text-xs text-slate-600"
                            value={v.garagePrice || ''}
                            onChange={e => handleUpdateVariant(idx, 'garagePrice', Number(e.target.value))}
                          />
                        </td>
                        <td className="p-2.5">
                          <input
                            type="number"
                            min="0"
                            className="w-16 border border-slate-200 p-2 rounded-lg font-mono text-xs"
                            value={v.stockQuantity}
                            onChange={e => handleUpdateVariant(idx, 'stockQuantity', Number(e.target.value))}
                          />
                        </td>
                        <td className="p-2.5">
                          <input
                            type="number"
                            min="0"
                            placeholder="0"
                            className="w-16 border border-slate-200 p-2 rounded-lg font-mono text-xs text-amber-700 font-bold"
                            value={v.shippingFee ?? formData.shippingFee}
                            onChange={e => handleUpdateVariant(idx, 'shippingFee', Number(e.target.value))}
                          />
                        </td>
                        <td className="p-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveVariant(idx)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                            title="ลบ SKU นี้"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Single Price & Stock */
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">ราคาขายทั่วไป (฿) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  className="w-full border border-slate-200 p-2.5 rounded-xl text-xs font-mono font-bold outline-none focus:border-[#0c3175]"
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">ราคาเต็มขีดฆ่า (฿)</label>
                <input
                  type="number"
                  min="0"
                  className="w-full border border-slate-200 p-2.5 rounded-xl text-xs font-mono text-slate-400 outline-none focus:border-[#0c3175]"
                  value={formData.compareAtPrice}
                  onChange={e => setFormData({ ...formData, compareAtPrice: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">ราคาอู่ยนต์ (Garage ฿)</label>
                <input
                  type="number"
                  min="0"
                  className="w-full border border-slate-200 p-2.5 rounded-xl text-xs font-mono outline-none focus:border-[#0c3175]"
                  value={formData.garagePrice}
                  onChange={e => setFormData({ ...formData, garagePrice: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">จำนวนสต็อกพร้อมส่ง</label>
                <input
                  type="number"
                  min="0"
                  className="w-full border border-slate-200 p-2.5 rounded-xl text-xs font-mono font-bold outline-none focus:border-[#0c3175]"
                  value={formData.stockQuantity}
                  onChange={e => setFormData({ ...formData, stockQuantity: Number(e.target.value) })}
                />
              </div>
            </div>
          )}
        </div>

        {/* Section 4: Product Images */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800 border-b pb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image className="w-4 h-4 text-purple-600" />
              <span>4. แกลเลอรี่รูปภาพสินค้า (Product Images)</span>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>อัปโหลดรูปภาพ</span>
            </button>
          </h3>

          <input
            type="file"
            multiple
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageUpload}
            style={{ display: 'none' }}
          />

          <div className="flex flex-wrap gap-4 items-center">
            {imageFiles.map((img, idx) => (
              <div key={idx} className="relative w-24 h-24 rounded-2xl overflow-hidden border border-slate-200 group bg-slate-50">
                <img src={img} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                {idx === 0 && (
                  <span className="absolute bottom-0 inset-x-0 bg-[#0c3175] text-white text-[9px] text-center font-bold py-0.5">
                    รูปหลัก
                  </span>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-300 hover:border-[#0c3175] flex flex-col items-center justify-center text-slate-400 hover:text-[#0c3175] transition-colors cursor-pointer"
            >
              <Plus className="w-6 h-6 mb-1" />
              <span className="text-[10px] font-bold">เพิ่มรูป</span>
            </button>
          </div>
        </div>

        {/* Section 5: Vehicle Compatibility (Fitment) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Car className="w-4 h-4 text-emerald-600" />
                <span>5. รุ่นรถยนต์ที่รองรับ (Vehicle Fitment - รองรับได้หลายรุ่นรถ)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                กำหนดรุ่นรถยนต์และช่วงปีผลิตที่สามารถใช้อะไหล่นี้ได้ (สามารถกดเพิ่มได้หลายรุ่นรถ โดยระบุปีเริ่มต้นและปีสิ้นสุดแยก 2 ช่อง)
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddCompatibleVehicle}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ เพิ่มรุ่นรถที่รองรับ</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px]">
                  <th className="p-3 w-1/4">ยี่ห้อรถยนต์ (Car Brand)</th>
                  <th className="p-3 w-1/4">รุ่นรถยนต์ (Car Model)</th>
                  <th className="p-3 w-28">ปีเริ่มต้น</th>
                  <th className="p-3 w-28">ปีสิ้นสุด</th>
                  <th className="p-3">หมายเหตุ / เครื่องยนต์ (Notes)</th>
                  <th className="p-3 w-12 text-center">ลบ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {formData.compatibleVehicles?.map((v, idx) => (
                  <tr key={v.id || idx} className="hover:bg-slate-50/50">
                    <td className="p-2.5">
                      <input
                        type="text"
                        placeholder="เช่น TOYOTA, HONDA"
                        className="w-full border border-slate-200 p-2 rounded-lg text-xs font-bold uppercase outline-none focus:border-emerald-600"
                        value={v.make}
                        onChange={e => handleUpdateCompatibleVehicle(idx, 'make', e.target.value)}
                      />
                    </td>
                    <td className="p-2.5">
                      <input
                        type="text"
                        placeholder="เช่น Hilux Revo, Fortuner"
                        className="w-full border border-slate-200 p-2 rounded-lg text-xs font-bold outline-none focus:border-emerald-600"
                        value={v.model}
                        onChange={e => handleUpdateCompatibleVehicle(idx, 'model', e.target.value)}
                      />
                    </td>
                    <td className="p-2.5">
                      <input
                        type="number"
                        placeholder="เช่น 2015"
                        className="w-full border border-slate-200 p-2 rounded-lg text-xs font-mono font-bold outline-none focus:border-emerald-600"
                        value={v.startYear}
                        onChange={e => handleUpdateCompatibleVehicle(idx, 'startYear', e.target.value)}
                      />
                    </td>
                    <td className="p-2.5">
                      <input
                        type="text"
                        placeholder="เช่น 2023 หรือ ปัจจุบัน"
                        className="w-full border border-slate-200 p-2 rounded-lg text-xs font-mono font-bold outline-none focus:border-emerald-600"
                        value={v.endYear}
                        onChange={e => handleUpdateCompatibleVehicle(idx, 'endYear', e.target.value)}
                      />
                    </td>
                    <td className="p-2.5">
                      <input
                        type="text"
                        placeholder="เช่น เครื่อง 2.4 / 2.8 D-4D ทุกรุ่นย่อย"
                        className="w-full border border-slate-200 p-2 rounded-lg text-xs outline-none focus:border-emerald-600"
                        value={v.note}
                        onChange={e => handleUpdateCompatibleVehicle(idx, 'note', e.target.value)}
                      />
                    </td>
                    <td className="p-2.5 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveCompatibleVehicle(idx)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="ลบรุ่นนี้"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <button
            type="button"
            onClick={() => setView('list')}
            className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-colors"
          >
            ยกเลิกและย้อนกลับ
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-[#ea580c] hover:bg-[#c2410c] text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'กำลังบันทึก...' : (editId ? 'บันทึกการแก้ไขสินค้า' : 'บันทึกและเปิดใช้งานสินค้า')}</span>
          </button>
        </div>

      </form>
    </div>
  );
}
