import React, { useState, useEffect } from 'react';
import {
  CircleDot, Sliders, Settings, Zap, Layout, Droplet, Tag, Grid, Layers, ChevronRight
} from 'lucide-react';
import ApiClient from '../../utils/apiClient';
import { CategoryNavSkeleton } from '../ui/Skeleton';

const getCategoryIcon = (name = '') => {
  const n = name.toLowerCase();
  if (n.includes('เบรก') || n.includes('brake')) return CircleDot;
  if (n.includes('ช่วงล่าง') || n.includes('suspension') || n.includes('damping')) return Sliders;
  if (n.includes('เครื่องยนต์') || n.includes('engine')) return Settings;
  if (n.includes('ไฟฟ้า') || n.includes('electric')) return Zap;
  if (n.includes('ตัวถัง') || n.includes('body')) return Layout;
  if (n.includes('น้ำมันเครื่อง') || n.includes('ของเหลว') || n.includes('fluid')) return Droplet;
  if (n.includes('กรอง') || n.includes('filter')) return Tag;
  return Layers;
};

export const CategoryNav = ({
  categories: propCategories,
  selectedCategoryId,
  onSelectCategory,
  className = '',
}) => {
  const [categories, setCategories] = useState(() => (Array.isArray(propCategories) && propCategories.length > 0 ? propCategories : []));
  const [loading, setLoading] = useState(() => !propCategories || propCategories.length === 0);

  useEffect(() => {
    if (Array.isArray(propCategories) && propCategories.length > 0) {
      setCategories(propCategories);
      setLoading(false);
      return;
    }

    let mounted = true;
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await ApiClient.getCategories();
        if (mounted) {
          const list = res.data || res.categories || [];
          setCategories(list);
        }
      } catch (err) {
        console.error('Failed to load categories', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchCategories();
    return () => { mounted = false; };
  }, [propCategories]);

  if (loading && categories.length === 0) {
    return <CategoryNavSkeleton />;
  }

  // Display top-level / parent categories
  const displayCategories = categories.filter(c => !c.parentId);

  return (
    <div className={`overflow-x-auto no-scrollbar scroll-smooth py-1 -mx-2 px-2 sm:mx-0 sm:px-0 ${className}`}>
      <div className="flex items-center gap-2 min-w-max">
        {/* All Categories Pill */}
        <button
          onClick={() => onSelectCategory?.(null)}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer select-none ${
            !selectedCategoryId
              ? 'bg-[#0c3175] text-white shadow-md shadow-blue-950/20 scale-[1.02]'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/90 shadow-2xs'
          }`}
        >
          <Grid className={`w-3.5 h-3.5 ${!selectedCategoryId ? 'text-white' : 'text-slate-400'}`} />
          <span>ทุกหมวดหมู่ (All Parts)</span>
        </button>

        {/* Dynamic Category Tree Pills */}
        {displayCategories.map((cat) => {
          const Icon = getCategoryIcon(cat.name);
          const isSelected = selectedCategoryId === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory?.(cat)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer select-none ${
                isSelected
                  ? 'bg-[#0c3175] text-white shadow-md shadow-blue-950/20 scale-[1.02]'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/90 shadow-2xs'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-blue-600'}`} />
              <span>{cat.name}</span>
              {cat.children && cat.children.length > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {cat.children.length}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryNav;
