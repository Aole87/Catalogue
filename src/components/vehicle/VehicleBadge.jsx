import React from 'react';
import { Car, ChevronRight } from 'lucide-react';

export const VehicleBadge = ({ vehicle, onClick, className = '' }) => {
  if (!vehicle) {
    return (
      <button
        onClick={onClick}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors ${className}`}
      >
        <Car className="w-3.5 h-3.5 text-brand-400 shrink-0" />
        <span>เลือกรุ่นรถของคุณ</span>
        <ChevronRight className="w-3 h-3 text-slate-400" />
      </button>
    );
  }

  const title = `${vehicle.makeName} ${vehicle.modelName}`;
  const subtitle = [
    vehicle.generationCode || vehicle.generationName,
    vehicle.engineName || vehicle.engineCode,
    vehicle.variantName,
  ].filter(Boolean).join(' · ');

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-900 text-white text-xs font-medium border border-slate-700 hover:border-brand-500 transition-colors shadow-sm group ${className}`}
    >
      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
      <div className="flex flex-col text-left">
        <span className="font-bold text-slate-100 group-hover:text-brand-300 transition-colors leading-tight">
          {title}
        </span>
        {subtitle && (
          <span className="text-[10px] text-slate-400 truncate max-w-[200px] leading-tight">
            {subtitle}
          </span>
        )}
      </div>
      <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700 group-hover:bg-brand-600 group-hover:text-white transition-colors ml-1 shrink-0">
        เปลี่ยน
      </span>
    </button>
  );
};

export default VehicleBadge;
