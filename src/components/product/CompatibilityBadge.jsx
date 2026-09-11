import React from 'react';
import { CheckCircle2, XCircle, AlertCircle, HelpCircle } from 'lucide-react';

export const CompatibilityBadge = ({
  status,
  reason,
  vehicleName,
  position,
  size = 'md',
  showDetails = false,
  className = '',
}) => {
  // If compatible
  if (status === true || reason === 'EXPLICIT_FITMENT' || status === 'COMPATIBLE') {
    return (
      <div
        className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${
          size === 'sm'
            ? 'px-2 py-0.5 text-[11px]'
            : size === 'lg'
            ? 'px-3.5 py-1.5 text-sm'
            : 'px-2.5 py-1 text-xs'
        } ${className}`}
      >
        <CheckCircle2 className={`${size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} text-emerald-600 shrink-0`} />
        <span className="font-semibold">
          {vehicleName ? `ตรงรุ่นกับ ${vehicleName}` : 'ตรงรุ่นกับรถที่เลือก'}
        </span>
        {showDetails && position && (
          <span className="text-emerald-800 text-[10px] opacity-80 border-l border-emerald-200 pl-1.5 ml-0.5">
            {position}
          </span>
        )}
      </div>
    );
  }

  // If incompatible
  if (status === false && (reason === 'NO_FITMENT_RECORD' || status === 'INCOMPATIBLE')) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-rose-50 text-rose-700 border border-rose-200 ${
          size === 'sm'
            ? 'px-2 py-0.5 text-[11px]'
            : size === 'lg'
            ? 'px-3.5 py-1.5 text-sm'
            : 'px-2.5 py-1 text-xs'
        } ${className}`}
      >
        <XCircle className={`${size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} text-rose-600 shrink-0`} />
        <span>ไม่รองรับรถรุ่นที่เลือก</span>
      </div>
    );
  }

  // If requires modification
  if (status === 'REQUIRES_MODIFICATION') {
    return (
      <div
        className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200 ${
          size === 'sm'
            ? 'px-2 py-0.5 text-[11px]'
            : size === 'lg'
            ? 'px-3.5 py-1.5 text-sm'
            : 'px-2.5 py-1 text-xs'
        } ${className}`}
      >
        <AlertCircle className={`${size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} text-amber-600 shrink-0`} />
        <span>ต้องดัดแปลง/มีเงื่อนไข</span>
      </div>
    );
  }

  // No vehicle selected or insufficient specification
  return (
    <div
      className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-slate-100 text-slate-600 border border-slate-200 ${
        size === 'sm'
          ? 'px-2 py-0.5 text-[11px]'
          : size === 'lg'
          ? 'px-3.5 py-1.5 text-sm'
          : 'px-2.5 py-1 text-xs'
      } ${className}`}
    >
      <HelpCircle className={`${size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} text-slate-400 shrink-0`} />
      <span>ระบุข้อมูลรถเพื่อเช็ค</span>
    </div>
  );
};

export default CompatibilityBadge;
