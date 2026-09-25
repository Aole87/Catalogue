import React, { useState, useEffect } from 'react';
import { Filter, X, ChevronRight, ChevronDown, CheckSquare, Square, Settings, Wrench, Battery, Truck, Droplets, Car, Calendar, Sliders, RotateCcw, Package } from 'lucide-react';
import ApiClient from '../../utils/apiClient';

const DEFAULT_MAKES = [
  { id: 'make-toyota', name: 'Toyota', slug: 'toyota' },
  { id: 'make-honda', name: 'Honda', slug: 'honda' },
  { id: 'make-isuzu', name: 'Isuzu', slug: 'isuzu' },
  { id: 'make-mazda', name: 'Mazda', slug: 'mazda' },
  { id: 'make-nissan', name: 'Nissan', slug: 'nissan' },
  { id: 'make-mitsubishi', name: 'Mitsubishi', slug: 'mitsubishi' },
  { id: 'make-ford', name: 'Ford', slug: 'ford' },
  { id: 'make-bmw', name: 'BMW', slug: 'bmw' },
  { id: 'make-benz', name: 'Mercedes-Benz', slug: 'mercedes-benz' },
];

const DEFAULT_MODELS = {
  toyota: [
    { id: 'mod-hilux', name: 'Hilux Revo / Vigo' },
    { id: 'mod-fortuner', name: 'Fortuner' },
    { id: 'mod-altis', name: 'Corolla Altis' },
    { id: 'mod-vios', name: 'Vios / Yaris Ativ' },
    { id: 'mod-camry', name: 'Camry' },
    { id: 'mod-cross', name: 'Corolla Cross' },
  ],
  honda: [
    { id: 'mod-civic', name: 'Civic (FC/FK/FE)' },
    { id: 'mod-city', name: 'City (Turbo / Hatchback)' },
    { id: 'mod-crv', name: 'CR-V' },
    { id: 'mod-hrv', name: 'HR-V' },
    { id: 'mod-accord', name: 'Accord' },
    { id: 'mod-jazz', name: 'Jazz (GE/GK)' },
  ],
  isuzu: [
    { id: 'mod-dmax', name: 'D-Max (Blue Power / V-Cross)' },
    { id: 'mod-mux', name: 'MU-X' },
  ],
  mazda: [
    { id: 'mod-m2', name: 'Mazda 2 (Skyactiv)' },
    { id: 'mod-m3', name: 'Mazda 3' },
    { id: 'mod-cx30', name: 'CX-30' },
    { id: 'mod-cx5', name: 'CX-5' },
    { id: 'mod-bt50', name: 'BT-50' },
  ],
  nissan: [
    { id: 'mod-almera', name: 'Almera (1.0 Turbo / 1.2)' },
    { id: 'mod-navara', name: 'Navara (NP300 / Pro-4X)' },
    { id: 'mod-kicks', name: 'Kicks e-Power' },
    { id: 'mod-terra', name: 'Terra' },
  ],
  mitsubishi: [
    { id: 'mod-triton', name: 'Triton' },
    { id: 'mod-pajero', name: 'Pajero Sport' },
    { id: 'mod-xpander', name: 'Xpander' },
    { id: 'mod-attrage', name: 'Attrage / Mirage' },
  ],
  ford: [
    { id: 'mod-ranger', name: 'Ranger (Raptor / Wildtrak)' },
    { id: 'mod-everest', name: 'Everest' },
  ],
  bmw: [
    { id: 'mod-3ser', name: '3 Series (G20 / F30)' },
    { id: 'mod-5ser', name: '5 Series (G30)' },
    { id: 'mod-x3', name: 'X3 / X5' },
  ],
  'mercedes-benz': [
    { id: 'mod-cclass', name: 'C-Class (W205 / W206)' },
    { id: 'mod-eclass', name: 'E-Class (W213)' },
    { id: 'mod-glc', name: 'GLC' },
  ],
};

const YEARS = Array.from({ length: 21 }, (_, i) => 2025 - i);

export const ProductFilters = ({
  categories = [],
  selectedCategoryId,
  onSelectCategory,
  selectedBrandId,
  selectedBrandIds = [],
  onSelectBrand,
  onToggleBrand,
  selectedCarMake,
  onSelectCarMake,
  selectedCarModel,
  onSelectCarModel,
  selectedCarYear,
  onSelectCarYear,
  onResetCarFilter,
  sortBy,
  sortOrder,
  onSortChange,
  onResetFilters,
  isOpen = false,
  onClose,
  isMobile = false,
}) => {
  const [brands, setBrands] = useState([]);
  const [makes, setMakes] = useState(DEFAULT_MAKES);
  const [models, setModels] = useState([]);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingMakes, setLoadingMakes] = useState(false);

  const activeBrandIds = Array.isArray(selectedBrandIds) && selectedBrandIds.length > 0
    ? selectedBrandIds
    : selectedBrandId ? [selectedBrandId] : [];

  // 1. Fetch Parts Brands
  useEffect(() => {
    let mounted = true;
    const fetchBrands = async () => {
      try {
        setLoadingBrands(true);
        const res = await ApiClient.getBrands();
        if (mounted && res) {
          const list = res.data || res.brands || [];
          if (Array.isArray(list) && list.length > 0) {
            setBrands(list);
          }
        }
      } catch (err) {
        console.warn('Failed to load brands from API', err);
      } finally {
        if (mounted) setLoadingBrands(false);
      }
    };
    fetchBrands();
    return () => { mounted = false; };
  }, []);

  // 2. Fetch Vehicle Makes
  useEffect(() => {
    let mounted = true;
    const fetchMakes = async () => {
      try {
        setLoadingMakes(true);
        const res = await ApiClient.getMakes();
        if (mounted && res) {
          const list = res.makes || res.data || [];
          if (Array.isArray(list) && list.length > 0) {
            setMakes(list);
          }
        }
      } catch (err) {
        console.warn('Failed to load vehicle makes from API, using default', err);
      } finally {
        if (mounted) setLoadingMakes(false);
      }
    };
    fetchMakes();
    return () => { mounted = false; };
  }, []);

  // 3. Update Available Models when Car Make changes
  useEffect(() => {
    let mounted = true;
    if (!selectedCarMake) {
      setModels([]);
      return;
    }

    const makeKey = (selectedCarMake.slug || selectedCarMake.name || '').toLowerCase();
    const fallbackList = DEFAULT_MODELS[makeKey] || [
      { id: `${makeKey}-1`, name: `${selectedCarMake.name} รุ่นมาตรฐาน 1` },
      { id: `${makeKey}-2`, name: `${selectedCarMake.name} รุ่นมาตรฐาน 2` },
    ];

    const fetchModels = async () => {
      try {
        if (selectedCarMake.id) {
          const res = await ApiClient.getModels(selectedCarMake.id);
          if (mounted && res?.models && Array.isArray(res.models) && res.models.length > 0) {
            setModels(res.models);
            return;
          }
        }
      } catch (e) {
        console.warn('API getModels error, fallback:', e);
      }
      if (mounted) {
        setModels(fallbackList);
      }
    };

    fetchModels();
    return () => { mounted = false; };
  }, [selectedCarMake]);

  const getCategoryIcon = (index) => {
    const icons = [<Settings size={18} />, <Wrench size={18} />, <Battery size={18} />, <Truck size={18} />, <Droplets size={18} />];
    return icons[index % icons.length];
  };

  const hasVehicleFilter = selectedCarMake || selectedCarModel || selectedCarYear;

  const content = (
    <div className="flex flex-col h-full w-full">
      {/* 1. Vehicle Fitment Filter Section (NEW Requirement: Make, Model, Year) */}
      <div className="mb-6 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-center justify-between mb-3 px-0.5">
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-[#0c3175]" />
            <h3 className="text-[13px] font-black text-slate-900">
              เลือกรุ่นรถยนต์ตรงรุ่น
            </h3>
          </div>
          {hasVehicleFilter && (
            <button
              onClick={onResetCarFilter}
              className="flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-700"
              title="ล้างข้อมูลรถที่เลือก"
            >
              <RotateCcw className="w-3 h-3" />
              <span>ล้าง</span>
            </button>
          )}
        </div>

        <div className="space-y-2.5 text-xs">
          {/* 1.1 Car Make */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
              1. ยี่ห้อรถ (Car Make)
            </label>
            <select
              value={selectedCarMake?.id || selectedCarMake?.name || ''}
              onChange={(e) => {
                const val = e.target.value;
                if (!val) {
                  onSelectCarMake?.(null);
                  onSelectCarModel?.(null);
                  return;
                }
                const found = makes.find(m => m.id === val || m.name === val) || { id: val, name: val, slug: val.toLowerCase() };
                onSelectCarMake?.(found);
                onSelectCarModel?.(null); // Reset model when make changes
              }}
              className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-slate-800 font-bold outline-none focus:border-[#0c3175] text-xs shadow-2xs"
            >
              <option value="">-- เลือกยี่ห้อรถยนต์ --</option>
              {makes.map((m) => (
                <option key={m.id || m.name} value={m.id || m.name}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* 1.2 Car Model */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
              2. รุ่นรถ (Car Model)
            </label>
            <select
              disabled={!selectedCarMake}
              value={selectedCarModel?.id || selectedCarModel?.name || ''}
              onChange={(e) => {
                const val = e.target.value;
                if (!val) {
                  onSelectCarModel?.(null);
                  return;
                }
                const found = models.find(mod => mod.id === val || mod.name === val) || { id: val, name: val };
                onSelectCarModel?.(found);
              }}
              className={`w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-slate-800 font-bold outline-none text-xs shadow-2xs ${
                !selectedCarMake ? 'opacity-50 cursor-not-allowed bg-slate-100' : 'focus:border-[#0c3175]'
              }`}
            >
              <option value="">{selectedCarMake ? '-- เลือกรุ่นรถ --' : '-- กรุณาเลือกยี่ห้อก่อน --'}</option>
              {models.map((mod) => (
                <option key={mod.id || mod.name} value={mod.id || mod.name}>
                  {mod.name}
                </option>
              ))}
            </select>
          </div>

          {/* 1.3 Car Year */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
              3. ปีรถ (Car Year)
            </label>
            <select
              value={selectedCarYear || ''}
              onChange={(e) => {
                const val = e.target.value;
                onSelectCarYear?.(val || null);
              }}
              className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-slate-800 font-bold outline-none focus:border-[#0c3175] text-xs shadow-2xs"
            >
              <option value="">-- ทุกปีการผลิต (All Years) --</option>
              {YEARS.map((yr) => (
                <option key={yr} value={yr}>
                  ปี {yr} (ค.ศ. {yr} / พ.ศ. {yr + 543})
                </option>
              ))}
            </select>
          </div>

          {hasVehicleFilter && (
            <div className="pt-1">
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>
                  กำลังกรอง: {[selectedCarMake?.name, selectedCarModel?.name, selectedCarYear ? `ปี ${selectedCarYear}` : ''].filter(Boolean).join(' ')}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Categories Section */}
      <div className="mb-6">
        <h3 className="text-[14px] font-black text-[#0e1932] mb-3 px-2">
          หมวดหมู่สินค้า
        </h3>
        <div className="space-y-1">
          {/* All Categories Option */}
          <button
            onClick={() => onSelectCategory?.(null)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[13px] font-bold transition-all cursor-pointer ${
              !selectedCategoryId
                ? 'bg-[#e0e7ff] text-[#2563eb]'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <Package size={18} className={!selectedCategoryId ? 'text-[#2563eb]' : 'text-slate-400'} />
              <span>สินค้าทั้งหมด (All Products)</span>
            </div>
            <ChevronRight className={`w-4 h-4 ${!selectedCategoryId ? 'text-[#2563eb]' : 'text-slate-300'}`} />
          </button>

          {categories.map((cat, index) => {
            const isSelected = selectedCategoryId === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory?.(cat)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[13px] font-bold transition-all ${
                  isSelected
                    ? 'bg-[#e0e7ff] text-[#2563eb]'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                   {getCategoryIcon(index)}
                   <span>{cat.name}</span>
                </div>
                <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-[#2563eb]' : 'text-slate-300'}`} />
              </button>
            );
          })}
        </div>
      </div>

      <div className="w-full h-[1px] bg-slate-100 mb-6"></div>

      {/* 3. Brands Section (Parts Manufacturers) */}
      <div>
        <h3 className="text-[14px] font-black text-[#0e1932] mb-4 px-2">
          แบรนด์ผู้ผลิตอะไหล่
        </h3>

        <div className="mb-5 px-2">
          <div className="space-y-2">
            {brands.map((brand) => {
              const isSelected = activeBrandIds.includes(brand.id);
              return (
                <div
                  key={brand.id}
                  onClick={() => {
                    if (onToggleBrand) {
                      onToggleBrand(brand);
                    } else if (onSelectBrand) {
                      onSelectBrand(isSelected ? null : brand);
                    }
                  }}
                  className="flex items-center gap-3 cursor-pointer group select-none py-1 transition-colors"
                >
                  {isSelected ? (
                    <CheckSquare className="w-4 h-4 text-[#2563eb] shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-300 group-hover:text-slate-400 shrink-0 transition-colors" />
                  )}
                  <span className={`text-[13px] font-medium transition-colors ${isSelected ? 'text-[#2563eb] font-bold' : 'text-slate-600 group-hover:text-slate-900'}`}>
                    {brand.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-end justify-center">
        <div className="bg-white rounded-t-3xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
            <h3 className="font-black text-[#0e1932] text-base">ตัวกรองสินค้า & เลือกรถยนต์</h3>
            <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          {content}
          <div className="mt-8 pt-4">
            <button
              onClick={onClose}
              className="w-full py-3.5 bg-[#0c3175] text-white font-bold rounded-xl text-[13px] shadow-sm"
            >
              ดูสินค้าผลลัพธ์
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <aside className="bg-white w-full pr-4">
      {content}
    </aside>
  );
};

export default ProductFilters;
