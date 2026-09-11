import React, { useState, useEffect } from 'react';
import { Filter, X, RotateCcw, Check, ChevronDown, Layers, Shield, Star, Sparkles, ArrowRight } from 'lucide-react';
import ApiClient from '../../utils/apiClient';

export const ProductFilters = ({
  categories = [],
  selectedCategoryId,
  onSelectCategory,
  selectedBrandId,
  onSelectBrand,
  sortBy,
  sortOrder,
  onSortChange,
  onResetFilters,
  isOpen = false,
  onClose,
  isMobile = false,
}) => {
  const [brands, setBrands] = useState([]);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [priceRange, setPriceRange] = useState(5000);

  useEffect(() => {
    let mounted = true;
    const fetchBrands = async () => {
      try {
        setLoadingBrands(true);
        const res = await ApiClient.getBrands();
        if (mounted) {
          setBrands(res.data || res.brands || []);
        }
      } catch (err) {
        console.error('Failed to load brands', err);
      } finally {
        if (mounted) setLoadingBrands(false);
      }
    };
    fetchBrands();
    return () => { mounted = false; };
  }, []);

  const content = (
    <div className="space-y-6">
      {/* 1. Header with Reset Filter */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#215ada]" />
          <h3 className="text-sm font-black text-[#0e1932] tracking-tight">
            Filters
          </h3>
        </div>

        {(selectedCategoryId || selectedBrandId || sortBy !== 'createdAt') && (
          <button
            onClick={onResetFilters}
            className="flex items-center gap-1 text-xs text-[#ff4c1a] hover:underline font-bold"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      {/* 2. Categories Widget (Unimart Style) */}
      <div className="space-y-2">
        <label className="text-xs font-black text-[#0e1932] uppercase tracking-wider block mb-2">
          Categories
        </label>
        <div className="space-y-1 max-h-56 overflow-y-auto pr-1 no-scrollbar">
          <button
            onClick={() => onSelectCategory?.(null)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-2xl text-xs text-left transition-all ${
              !selectedCategoryId
                ? 'bg-[#215ada] text-white font-bold shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 font-medium'
            }`}
          >
            <span>All Categories</span>
            {!selectedCategoryId && <Check className="w-3.5 h-3.5 text-white" />}
          </button>

          {categories.map((cat) => {
            const isSelected = selectedCategoryId === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory?.(cat)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-2xl text-xs text-left transition-all ${
                  isSelected
                    ? 'bg-[#215ada] text-white font-bold shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 font-medium'
                }`}
              >
                <span className="truncate">{cat.name}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Price Filter Slider */}
      <div className="space-y-3 pt-3 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black text-[#0e1932] uppercase tracking-wider block">
            Filter by Price
          </label>
          <span className="text-xs font-mono font-bold text-[#215ada]">
            ฿0 – ฿{priceRange.toLocaleString()}
          </span>
        </div>
        <input
          type="range"
          min="500"
          max="15000"
          step="500"
          value={priceRange}
          onChange={(e) => setPriceRange(Number(e.target.value))}
          className="w-full accent-[#215ada] cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-400 font-medium">
          <span>Min: ฿500</span>
          <span>Max: ฿15,000</span>
        </div>
      </div>

      {/* 4. Brands Widget */}
      <div className="space-y-2 pt-3 border-t border-slate-100">
        <label className="text-xs font-black text-[#0e1932] uppercase tracking-wider flex items-center justify-between mb-2">
          <span>Popular Brands</span>
          {selectedBrandId && (
            <button
              onClick={() => onSelectBrand?.(null)}
              className="text-[11px] text-[#215ada] font-bold"
            >
              All
            </button>
          )}
        </label>
        <div className="space-y-1 max-h-56 overflow-y-auto pr-1 no-scrollbar">
          <button
            onClick={() => onSelectBrand?.(null)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-2xl text-xs text-left transition-all ${
              !selectedBrandId
                ? 'bg-[#215ada] text-white font-bold shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 font-medium'
            }`}
          >
            <span>All Brands</span>
            {!selectedBrandId && <Check className="w-3.5 h-3.5 text-white" />}
          </button>

          {brands.map((brand) => {
            const isSelected = selectedBrandId === brand.id;
            return (
              <button
                key={brand.id}
                onClick={() => onSelectBrand?.(brand)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-2xl text-xs text-left transition-all ${
                  isSelected
                    ? 'bg-[#215ada] text-white font-bold shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 font-medium'
                }`}
              >
                <span className="truncate">{brand.name}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Star Rating Filter */}
      <div className="space-y-2 pt-3 border-t border-slate-100">
        <label className="text-xs font-black text-[#0e1932] uppercase tracking-wider block mb-2">
          Customer Ratings
        </label>
        <div className="space-y-1">
          {[5, 4, 3].map((stars) => (
            <button
              key={stars}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-1 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${i < stars ? 'fill-current text-amber-400' : 'text-slate-200'}`}
                  />
                ))}
                <span className="ml-1.5 text-slate-600 font-medium">{stars} Stars & Above</span>
              </div>
              <span className="text-[10px] text-slate-400">({stars * 4 + 2})</span>
            </button>
          ))}
        </div>
      </div>

      {/* 6. Sidebar Promo Card */}
      <div className="rounded-3xl bg-[#f4f6fb] p-6 border border-slate-200 relative overflow-hidden group">
        <span className="px-2 py-0.5 rounded-full bg-[#ff4c1a] text-white text-[9px] font-black uppercase">
          HOT OFFER
        </span>
        <h4 className="text-sm font-black text-[#0e1932] mt-2 mb-1">
          Get 30% Off on OEM Brake Pads
        </h4>
        <p className="text-[11px] text-slate-500 mb-3">
          Special discount for registered garage members.
        </p>
        <button
          onClick={onResetFilters}
          className="text-xs font-bold text-[#215ada] hover:underline flex items-center gap-1"
        >
          <span>Shop Deal</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );

  if (isMobile) {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl animate-scale-in">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-black text-[#0e1932] text-base">Filter Catalog</h3>
            <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          {content}
          <div className="mt-6 pt-4 border-t border-slate-100 flex gap-3">
            <button
              onClick={onClose}
              className="w-full py-3 bg-[#215ada] text-white font-bold rounded-2xl text-xs shadow-md shadow-blue-600/20"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <aside className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
      {content}
    </aside>
  );
};

export default ProductFilters;
