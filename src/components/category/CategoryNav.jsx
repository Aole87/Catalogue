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
  selectedCategoryId,
  onSelectCategory,
  className = '',
}) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await ApiClient.getCategoryTree();
        if (mounted) {
          setCategories(res.data || res.categories || []);
        }
      } catch (err) {
        console.error('Failed to load categories', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchCategories();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return <CategoryNavSkeleton />;
  }

  return (
    <div className={`overflow-x-auto no-scrollbar py-2 -mx-4 px-4 sm:mx-0 sm:px-0 ${className}`}>
      <div className="flex items-center gap-2 min-w-max">
        {/* All Categories Pill */}
        <button
          onClick={() => onSelectCategory?.(null)}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
            !selectedCategoryId
              ? 'bg-slate-900 text-white shadow-sm ring-2 ring-slate-900 ring-offset-2'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 shadow-sm'
          }`}
        >
          <Grid className="w-3.5 h-3.5" />
          <span>ทุกหมวดหมู่ (All Parts)</span>
        </button>

        {/* Dynamic Category Tree Pills */}
        {categories.map((cat) => {
          const Icon = getCategoryIcon(cat.name);
          const isSelected = selectedCategoryId === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory?.(cat)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 ${
                isSelected
                  ? 'bg-brand-600 text-white shadow-sm ring-2 ring-brand-600 ring-offset-2'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 shadow-sm'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
              <span>{cat.name}</span>
              {cat.children && cat.children.length > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-brand-700 text-white' : 'bg-slate-100 text-slate-500'}`}>
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
