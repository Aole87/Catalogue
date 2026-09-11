import React from 'react';
import { Search, Car, AlertCircle, RefreshCw, PackageX } from 'lucide-react';

export const EmptyState = ({
  type = 'general',
  title,
  description,
  actionLabel,
  onAction,
}) => {
  let Icon = PackageX;
  let defaultTitle = 'ไม่พบข้อมูล';
  let defaultDesc = 'ไม่มีรายการที่ตรงกับเงื่อนไขที่เลือก';

  if (type === 'no-compatible-products') {
    Icon = Car;
    defaultTitle = 'ไม่พบอะไหล่ที่รองรับรถของคุณ';
    defaultDesc = 'ขณะนี้ยังไม่มีอะไหล่ตรงรุ่นในหมวดหมู่นี้ในระบบ คุณสามารถลองเปลี่ยนหมวดหมู่ ค้นหาด้วยรหัส OEM หรือเปลี่ยนรุ่นรถ';
  } else if (type === 'no-search-results') {
    Icon = Search;
    defaultTitle = 'ไม่พบสินค้าที่ตรงกับคำค้น';
    defaultDesc = 'ลองตรวจสอบตัวสะกด หรือค้นหาด้วย SKU, รหัส OEM, หรือชื่อยี่ห้ออะไหล่';
  } else if (type === 'no-vehicle-selected') {
    Icon = Car;
    defaultTitle = 'ยังไม่ได้เลือกรุ่นรถยนต์';
    defaultDesc = 'กรุณาเลือกรุ่นรถของคุณด้านบนเพื่อค้นหาอะไหล่ที่ตรงรุ่นตามสเปกยานยนต์';
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center max-w-lg mx-auto shadow-sm my-8">
      <div className="w-16 h-16 bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-200">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-2">
        {title || defaultTitle}
      </h3>
      <p className="text-sm text-slate-500 leading-relaxed mb-6">
        {description || defaultDesc}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
