import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, SlidersHorizontal, ChevronLeft, ChevronRight, RotateCcw, X, Car, Calendar,
  Grid3X3, LayoutGrid, List, Filter, Flame, Check, ArrowRight, ShieldCheck, Truck
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import VehicleContextBar from '../components/vehicle/VehicleContextBar';
import VehicleSelectorModal from '../components/vehicle/VehicleSelectorModal';
import CategoryNav from '../components/category/CategoryNav';
import ProductFilters from '../components/filters/ProductFilters';
import ProductGrid from '../components/product/ProductGrid';
import QuickViewModal from '../components/product/QuickViewModal';
import { useVehicle } from '../context/VehicleContext';
import ApiClient from '../utils/apiClient';

export const ProductList = ({ navigate, user, setUser, initialFilters = {} }) => {
  const { selectedVehicle, isVehicleSelected, openSelectorModal } = useVehicle();

  // Filter States
  const [search, setSearch] = useState(initialFilters.search || '');
  const [debouncedSearch, setDebouncedSearch] = useState(initialFilters.search || '');
  const [selectedCategoryId, setSelectedCategoryId] = useState(initialFilters.categoryId || null);
  const [selectedBrandIds, setSelectedBrandIds] = useState(
    initialFilters.brandIds || (initialFilters.brandId ? [initialFilters.brandId] : [])
  );
  const [selectedCarMake, setSelectedCarMake] = useState(null);
  const [selectedCarModel, setSelectedCarModel] = useState(null);
  const [selectedCarYear, setSelectedCarYear] = useState(null);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [gridColumns, setGridColumns] = useState(3); // 3 | 4

  // Quick View Modal state
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // Data States
  const [products, setProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mobile Filter Drawer State
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Load Categories & Brands
  useEffect(() => {
    let mounted = true;
    const fetchMetadata = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          ApiClient.getCategories(),
          ApiClient.getBrands()
        ]);
        if (mounted) {
          setCategories(catRes.data || catRes.categories || []);
          setBrands(brandRes.data || brandRes.brands || []);
        }
      } catch (err) {
        console.error('Failed to load categories/brands', err);
      }
    };
    fetchMetadata();
    return () => { mounted = false; };
  }, []);

  // Primary Data Fetching Effect
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page,
        pageSize,
        sortBy,
        sortOrder,
      };

      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (selectedCategoryId) params.categoryId = selectedCategoryId;
      if (selectedBrandIds.length > 0) params.brandId = selectedBrandIds.join(',');
      if (selectedVehicle?.variantId) params.vehicleVariantId = selectedVehicle.variantId;

      const res = await ApiClient.getProducts(params);

      let list = res.data || [];

      // Multi-brand filter fail-safe
      if (selectedBrandIds.length > 0) {
        list = list.filter((p) => {
          const bId = p.brandId || (p.brand && p.brand.id);
          return bId && selectedBrandIds.includes(bId);
        });
      }

      // Vehicle Fitment Filtering (Make, Model, Year)
      if (selectedCarMake) {
        const makeStr = (selectedCarMake.name || selectedCarMake.slug || '').toLowerCase();
        list = list.filter(p => {
          const pStr = `${p.name || ''} ${p.description || ''} ${p.fitmentNote || ''} ${JSON.stringify(p.vehicleFitment || '')}`.toLowerCase();
          return pStr.includes(makeStr);
        });
      }

      if (selectedCarModel) {
        const modelStr = (selectedCarModel.name || '').toLowerCase();
        list = list.filter(p => {
          const pStr = `${p.name || ''} ${p.description || ''} ${p.fitmentNote || ''} ${JSON.stringify(p.vehicleFitment || '')}`.toLowerCase();
          return pStr.includes(modelStr);
        });
      }

      if (selectedCarYear) {
        const yearStr = String(selectedCarYear);
        const yearNum = Number(selectedCarYear);
        list = list.filter(p => {
          if (p.yearStart && p.yearEnd) {
            return yearNum >= p.yearStart && yearNum <= p.yearEnd;
          }
          if (p.yearStart) {
            return yearNum >= p.yearStart;
          }
          const pStr = `${p.name || ''} ${p.description || ''} ${p.fitmentNote || ''} ${JSON.stringify(p.vehicleFitment || '')}`;
          return pStr.includes(yearStr);
        });
      }

      setProducts(list);
      setTotalCount(list.length);
      setTotalPages(Math.max(1, Math.ceil(list.length / pageSize)));
    } catch (err) {
      console.error('Failed to fetch products', err);
      setError(err.message || 'Unable to load products');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, sortBy, sortOrder, debouncedSearch, selectedCategoryId, selectedBrandIds, selectedVehicle, selectedCarMake, selectedCarModel, selectedCarYear]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSortChange = (field, order) => {
    setSortBy(field);
    setSortOrder(order);
    setPage(1);
  };

  const handleResetCarFilter = () => {
    setSelectedCarMake(null);
    setSelectedCarModel(null);
    setSelectedCarYear(null);
    setPage(1);
  };

  const handleToggleBrand = (brand) => {
    if (!brand || !brand.id) return;
    setSelectedBrandIds((prev) => {
      if (prev.includes(brand.id)) {
        return prev.filter((id) => id !== brand.id);
      } else {
        return [...prev, brand.id];
      }
    });
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setSelectedCategoryId(null);
    setSelectedBrandIds([]);
    setSelectedCarMake(null);
    setSelectedCarModel(null);
    setSelectedCarYear(null);
    setSortBy('createdAt');
    setSortOrder('desc');
    setPage(1);
  };

  const handleProductClick = (product) => {
    navigate('product-detail', { product });
  };

  const activeCategory = categories.find((c) => c.id === selectedCategoryId);
  const activeBrands = brands.filter((b) => selectedBrandIds.includes(b.id));

  return (
    <div className="min-h-screen bg-[#ffffff] text-slate-900 flex flex-col font-sans selection:bg-[#215ada] selection:text-white">
      {/* Navbar */}
      <Navbar
        navigate={navigate}
        user={user}
        setUser={setUser}
        onSearchSubmit={(val) => {
          setSearch(val);
          setPage(1);
        }}
      />

      {/* Main Layout Container */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Mobile Filter Trigger (hidden on desktop) */}
        <div className="lg:hidden flex items-center justify-between mb-4">
           <h1 className="text-xl font-black text-[#0e1932]">หมวดหมู่สินค้า</h1>
           <button
             onClick={() => setIsMobileFilterOpen(true)}
             className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-slate-700 text-xs font-bold border border-slate-200 shadow-sm"
           >
             <Filter className="w-3.5 h-3.5 text-[#215ada]" />
             <span>ตัวกรอง</span>
           </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6 items-start">
          
          {/* Left Sidebar (Desktop) */}
          <div className="hidden lg:block sticky top-6">
            <ProductFilters
              categories={categories}
              selectedCategoryId={selectedCategoryId}
              onSelectCategory={(cat) => {
                setSelectedCategoryId(cat ? cat.id : null);
                setPage(1);
              }}
              selectedBrandIds={selectedBrandIds}
              onToggleBrand={handleToggleBrand}
              selectedCarMake={selectedCarMake}
              onSelectCarMake={(make) => {
                setSelectedCarMake(make);
                setSelectedCarModel(null);
                setPage(1);
              }}
              selectedCarModel={selectedCarModel}
              onSelectCarModel={(model) => {
                setSelectedCarModel(model);
                setPage(1);
              }}
              selectedCarYear={selectedCarYear}
              onSelectCarYear={(yr) => {
                setSelectedCarYear(yr);
                setPage(1);
              }}
              onResetCarFilter={handleResetCarFilter}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={handleSortChange}
              onResetFilters={handleResetFilters}
            />
          </div>

          {/* Right Main Content */}
          <div className="flex flex-col space-y-5">
            
            {/* Category Banner */}
            <div className="w-full bg-[#0b1220] rounded-[16px] overflow-hidden relative min-h-[120px] sm:h-[140px] flex items-center px-4 sm:px-8 py-4 shadow-sm">
               {/* Background Image */}
               <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1486262715619-6708146bc45e?w=1200&q=80')] bg-cover bg-center opacity-40"></div>
               <div className="absolute inset-0 bg-gradient-to-r from-[#0b1220] via-[#0b1220]/80 to-transparent"></div>
               
               {/* Banner Content */}
               <div className="relative z-10 flex flex-col">
                  <h1 className="text-2xl sm:text-[32px] font-black text-white leading-none mb-1">{activeCategory?.name || 'อะไหล่รถยนต์'}</h1>
                  <p className="text-xs sm:text-[14px] text-white/90 font-medium mb-3 sm:mb-4">หยุดมั่นใจ ปลอดภัยทุกเส้นทาง คุณภาพมาตรฐานระดับโลก</p>
                  
                  <div className="flex flex-wrap items-center gap-3 sm:gap-6">
                     <div className="flex items-center gap-1.5 text-white/90 text-[10px] sm:text-[11px] font-bold">
                        <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span>ของแท้ 100%</span>
                     </div>
                     <div className="flex items-center gap-1.5 text-white/90 text-[10px] sm:text-[11px] font-bold">
                        <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span>รับประกันคุณภาพ</span>
                     </div>
                     <div className="flex items-center gap-1.5 text-white/90 text-[10px] sm:text-[11px] font-bold">
                        <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span>จัดส่งรวดเร็ว</span>
                     </div>
                  </div>
               </div>
            </div>

            {/* Header & Sort Control */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
               <div className="text-xs font-bold text-slate-500">
                  {activeCategory ? (
                    <span className="flex items-center gap-1.5">
                      <span>หมวดหมู่:</span>
                      <span className="text-[#2563eb] font-extrabold">{activeCategory.name}</span>
                      <span className="text-slate-400">({totalCount} รายการ)</span>
                    </span>
                  ) : (
                    <span>แสดงสินค้าทั้งหมด <strong className="text-slate-800">({totalCount} รายการ)</strong></span>
                  )}
               </div>
               
               <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  <span className="text-[13px] text-slate-500 font-bold">เรียงตาม:</span>
                  <select
                    value={`${sortBy}:${sortOrder}`}
                    onChange={(e) => {
                      const [field, order] = e.target.value.split(':');
                      handleSortChange(field, order);
                    }}
                    className="bg-transparent text-[#2563eb] text-[13px] font-bold focus:outline-none cursor-pointer"
                  >
                    <option value="createdAt:desc">ยอดฮิต</option>
                    <option value="price:asc">ราคา: ต่ำไปสูง</option>
                    <option value="price:desc">ราคา: สูงไปต่ำ</option>
                    <option value="name:asc">ชื่อ: A-Z</option>
                  </select>
               </div>
            </div>

            {/* Active Filters */}
            {(selectedCategoryId || selectedBrandIds.length > 0 || debouncedSearch || selectedCarMake || selectedCarModel || selectedCarYear) && (
              <div className="flex flex-wrap items-center gap-2 pb-2">
                {activeCategory && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[11px] font-bold text-[#2563eb] border border-blue-100">
                    <span>หมวดหมู่: {activeCategory.name}</span>
                    <button onClick={() => setSelectedCategoryId(null)} className="hover:text-rose-500 cursor-pointer"><X className="w-3 h-3" /></button>
                  </span>
                )}
                {activeBrands.map((b) => (
                  <span key={b.id} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[11px] font-bold text-[#2563eb] border border-blue-100">
                    <span>แบรนด์: {b.name}</span>
                    <button onClick={() => handleToggleBrand(b)} className="hover:text-rose-500 cursor-pointer"><X className="w-3 h-3" /></button>
                  </span>
                ))}
                {selectedCarMake && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-[11px] font-bold text-slate-800 border border-slate-200">
                    <Car className="w-3 h-3 text-[#0c3175]" />
                    <span>ยี่ห้อ: {selectedCarMake.name}</span>
                    <button onClick={() => { setSelectedCarMake(null); setSelectedCarModel(null); }} className="hover:text-rose-500"><X className="w-3 h-3" /></button>
                  </span>
                )}
                {selectedCarModel && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-[11px] font-bold text-slate-800 border border-slate-200">
                    <span>รุ่น: {selectedCarModel.name}</span>
                    <button onClick={() => setSelectedCarModel(null)} className="hover:text-rose-500"><X className="w-3 h-3" /></button>
                  </span>
                )}
                {selectedCarYear && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-[11px] font-bold text-slate-800 border border-slate-200">
                    <Calendar className="w-3 h-3 text-[#ea580c]" />
                    <span>ปี: {selectedCarYear}</span>
                    <button onClick={() => setSelectedCarYear(null)} className="hover:text-rose-500"><X className="w-3 h-3" /></button>
                  </span>
                )}
                <button onClick={handleResetFilters} className="text-[11px] font-bold text-rose-500 hover:underline">
                  ล้างตัวกรองทั้งหมด
                </button>
              </div>
            )}

            {/* Product Grid Area (Fixed 4 Columns) */}
            <div>
              <ProductGrid
                products={products}
                loading={loading}
                viewMode="grid"
                columns={4}
                user={user}
                onRequireLogin={() => navigate('login')}
                onProductClick={handleProductClick}
                onQuickView={(p) => setQuickViewProduct(p)}
                onResetFilters={handleResetFilters}
              />

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="pt-10 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="w-8 h-8 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 flex items-center justify-center text-slate-700 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pNum = idx + 1;
                    const isActive = pNum === page;
                    return (
                      <button
                        key={pNum}
                        onClick={() => setPage(pNum)}
                        className={`w-8 h-8 rounded text-[13px] font-bold transition-all ${
                          isActive
                            ? 'bg-[#2563eb] text-white border border-[#2563eb]'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {pNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="w-8 h-8 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 flex items-center justify-center text-slate-700 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </main>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={Boolean(quickViewProduct)}
        onClose={() => setQuickViewProduct(null)}
        onNavigate={navigate}
        user={user}
      />

      {/* Mobile Filter Modal */}
      <ProductFilters
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={(cat) => {
          setSelectedCategoryId(cat ? cat.id : null);
          setPage(1);
        }}
        selectedBrandIds={selectedBrandIds}
        onToggleBrand={handleToggleBrand}
        selectedCarMake={selectedCarMake}
        onSelectCarMake={(make) => {
          setSelectedCarMake(make);
          setSelectedCarModel(null);
          setPage(1);
        }}
        selectedCarModel={selectedCarModel}
        onSelectCarModel={(model) => {
          setSelectedCarModel(model);
          setPage(1);
        }}
        selectedCarYear={selectedCarYear}
        onSelectCarYear={(yr) => {
          setSelectedCarYear(yr);
          setPage(1);
        }}
        onResetCarFilter={handleResetCarFilter}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        onResetFilters={handleResetFilters}
        isMobile={true}
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
      />

      {/* Global Vehicle Selector Modal */}
      <VehicleSelectorModal onSelectComplete={(v) => {
        setSelectedBrandIds([]);
        setPage(1);
      }} />

      {/* Footer */}
      <Footer navigate={navigate} />
    </div>
  );
};

export default ProductList;
