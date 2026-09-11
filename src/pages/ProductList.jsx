import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, SlidersHorizontal, ChevronLeft, ChevronRight, RotateCcw, X, Car,
  Grid3X3, LayoutGrid, List, Filter, Flame, Check, ArrowRight
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
  const [selectedBrandId, setSelectedBrandId] = useState(initialFilters.brandId || null);
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
      if (selectedBrandId) params.brandId = selectedBrandId;
      if (selectedVehicle?.variantId) params.vehicleVariantId = selectedVehicle.variantId;

      const res = await ApiClient.getProducts(params);

      setProducts(res.data || []);
      setTotalCount(res.meta?.total || (res.data ? res.data.length : 0));
      setTotalPages(res.meta?.totalPages || 1);
    } catch (err) {
      console.error('Failed to fetch products', err);
      setError(err.message || 'Unable to load products');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, sortBy, sortOrder, debouncedSearch, selectedCategoryId, selectedBrandId, selectedVehicle]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSortChange = (field, order) => {
    setSortBy(field);
    setSortOrder(order);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setSelectedCategoryId(null);
    setSelectedBrandId(null);
    setSortBy('createdAt');
    setSortOrder('desc');
    setPage(1);
  };

  const handleProductClick = (product) => {
    navigate('product-detail', { product });
  };

  const activeCategory = categories.find((c) => c.id === selectedCategoryId);
  const activeBrand = brands.find((b) => b.id === selectedBrandId);

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

      {/* 1. Shop Page Header Hero Banner (Unimart Tech Accessories Two Style) */}
      <div className="bg-[#f4f6fb] py-10 px-4 sm:px-6 lg:px-8 border-b border-slate-100 relative overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-2">
              <button onClick={() => navigate('home')} className="hover:text-[#215ada] transition-colors">
                Home
              </button>
              <ChevronRight className="w-3 h-3 text-slate-300" />
              <button onClick={handleResetFilters} className="hover:text-[#215ada] transition-colors text-slate-600 font-bold">
                Shop
              </button>
              {activeCategory && (
                <>
                  <ChevronRight className="w-3 h-3 text-slate-300" />
                  <span className="text-[#215ada] font-bold">{activeCategory.name}</span>
                </>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#0e1932] tracking-tight">
              {activeCategory ? activeCategory.name : 'Catalogue & Shop'}
            </h1>
          </div>

          <div className="text-xs text-slate-500 font-medium bg-white/80 backdrop-blur-xs px-4 py-2 rounded-full border border-slate-200/80 shadow-xs">
            Showing <strong className="text-[#0e1932] font-mono">{products.length}</strong> of <strong className="text-[#0e1932] font-mono">{totalCount}</strong> products
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Vehicle Fitment Context Alert */}
        <div className="mb-6">
          <VehicleContextBar onOpenSelector={openSelectorModal} />
        </div>

        {/* 2. Top Controls Bar: Search, View Mode Switcher, Sort, Show Count */}
        <div className="bg-[#f4f6fb] rounded-3xl p-4 mb-6 flex flex-col lg:flex-row items-center justify-between gap-4 border border-slate-200/80 shadow-xs">
          {/* Search Input Box */}
          <div className="relative w-full lg:w-80">
            <input
              type="text"
              placeholder="Search in shop..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white text-slate-900 placeholder-slate-400 text-xs rounded-full pl-9 pr-8 py-2.5 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#215ada] shadow-2xs"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Right Controls: View Switcher, Sort Dropdown & Items Show */}
          <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 w-full lg:w-auto">
            {/* Mobile Filter Trigger */}
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-slate-700 text-xs font-bold border border-slate-200 shadow-xs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#215ada]" />
              <span>Filters</span>
            </button>

            {/* View Mode Switcher: 3-Col, 4-Col, List */}
            <div className="hidden sm:flex items-center bg-white p-1 rounded-full border border-slate-200 shadow-2xs">
              <button
                onClick={() => {
                  setViewMode('grid');
                  setGridColumns(3);
                }}
                className={`p-1.5 rounded-full transition-all ${
                  viewMode === 'grid' && gridColumns === 3
                    ? 'bg-[#215ada] text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="3-Column Grid"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setViewMode('grid');
                  setGridColumns(4);
                }}
                className={`p-1.5 rounded-full transition-all ${
                  viewMode === 'grid' && gridColumns === 4
                    ? 'bg-[#215ada] text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="4-Column Grid"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>

              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-full transition-all ${
                  viewMode === 'list'
                    ? 'bg-[#215ada] text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 font-semibold hidden md:inline">Sort:</span>
              <select
                value={`${sortBy}:${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split(':');
                  handleSortChange(field, order);
                }}
                className="bg-white text-slate-800 text-xs font-semibold rounded-full border border-slate-200 px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-[#215ada] cursor-pointer shadow-2xs"
              >
                <option value="createdAt:desc">Default (Latest)</option>
                <option value="price:asc">Price: Low to High</option>
                <option value="price:desc">Price: High to Low</option>
                <option value="name:asc">Name: A to Z</option>
              </select>
            </div>

            {/* Show Count Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 font-semibold hidden md:inline">Show:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="bg-white text-slate-800 text-xs font-semibold rounded-full border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#215ada] cursor-pointer shadow-2xs"
              >
                <option value="12">12 Items</option>
                <option value="24">24 Items</option>
                <option value="36">36 Items</option>
              </select>
            </div>
          </div>
        </div>

        {/* 3. Active Filter Chips Row */}
        {(selectedCategoryId || selectedBrandId || debouncedSearch) && (
          <div className="flex flex-wrap items-center gap-2 mb-6 p-3 rounded-2xl bg-[#f4f6fb] border border-slate-100 animate-fade-in">
            <span className="text-xs font-bold text-slate-500 mr-1">Active Filters:</span>

            {activeCategory && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-xs font-bold text-[#215ada] border border-blue-200 shadow-2xs">
                <span>Category: {activeCategory.name}</span>
                <button
                  onClick={() => setSelectedCategoryId(null)}
                  className="hover:text-rose-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {activeBrand && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-xs font-bold text-[#215ada] border border-blue-200 shadow-2xs">
                <span>Brand: {activeBrand.name}</span>
                <button
                  onClick={() => setSelectedBrandId(null)}
                  className="hover:text-rose-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {debouncedSearch && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-xs font-bold text-slate-700 border border-slate-200 shadow-2xs">
                <span>Search: "{debouncedSearch}"</span>
                <button
                  onClick={() => setSearch('')}
                  className="hover:text-rose-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            <button
              onClick={handleResetFilters}
              className="text-xs font-bold text-[#ff4c1a] hover:underline ml-auto flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear All</span>
            </button>
          </div>
        )}

        {/* 4. Main Grid: Left Filters Sidebar + Right Products */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block lg:col-span-1 sticky top-24">
            <ProductFilters
              categories={categories}
              selectedCategoryId={selectedCategoryId}
              onSelectCategory={(cat) => {
                setSelectedCategoryId(cat ? cat.id : null);
                setPage(1);
              }}
              selectedBrandId={selectedBrandId}
              onSelectBrand={(brand) => {
                setSelectedBrandId(brand ? brand.id : null);
                setPage(1);
              }}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={handleSortChange}
              onResetFilters={handleResetFilters}
            />
          </div>

          {/* Product Grid Area */}
          <div className="lg:col-span-3 space-y-8">
            <ProductGrid
              products={products}
              loading={loading}
              viewMode={viewMode}
              columns={gridColumns}
              onProductClick={handleProductClick}
              onQuickView={(p) => setQuickViewProduct(p)}
              onResetFilters={handleResetFilters}
            />

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pt-8 border-t border-slate-100 flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-10 h-10 rounded-full border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 flex items-center justify-center text-slate-700 transition-colors"
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
                      className={`w-10 h-10 rounded-full text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-[#215ada] text-white shadow-md shadow-blue-600/20'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {pNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-10 h-10 rounded-full border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 flex items-center justify-center text-slate-700 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={Boolean(quickViewProduct)}
        onClose={() => setQuickViewProduct(null)}
        onNavigate={navigate}
      />

      {/* Mobile Filter Modal */}
      <ProductFilters
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={(cat) => {
          setSelectedCategoryId(cat ? cat.id : null);
          setPage(1);
        }}
        selectedBrandId={selectedBrandId}
        onSelectBrand={(brand) => {
          setSelectedBrandId(brand ? brand.id : null);
          setPage(1);
        }}
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
        setSelectedBrandId(null);
        setPage(1);
      }} />

      {/* Footer */}
      <Footer navigate={navigate} />
    </div>
  );
};

export default ProductList;
