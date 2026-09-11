import React from 'react';
import { Car, RefreshCw, X, CheckCircle2 } from 'lucide-react';
import { useVehicle } from '../../context/VehicleContext';

export const VehicleContextBar = ({ onOpenSelector, className = '' }) => {
  const { selectedVehicle, clearVehicle, isVehicleSelected } = useVehicle();

  if (!isVehicleSelected || !selectedVehicle) {
    return null;
  }

  const vehicleTitle = `${selectedVehicle.makeName} ${selectedVehicle.modelName} ${selectedVehicle.generationCode ? `(${selectedVehicle.generationCode})` : ''}`;
  const specs = [
    selectedVehicle.engineName || selectedVehicle.engineCode,
    selectedVehicle.variantName,
    selectedVehicle.transmission,
    selectedVehicle.yearRange,
  ].filter(Boolean).join(' • ');

  return (
    <div className={`bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-elevated border border-slate-700/60 mb-6 ${className}`}>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left: Vehicle Info & Verified Status */}
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-brand-600/20 border border-brand-500/30 text-brand-400 flex items-center justify-center shrink-0">
            <Car className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                กำลังกรองอะไหล่ตรงรุ่นสำหรับ
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black tracking-tight text-white mt-0.5">
              {vehicleTitle}
            </h3>
            {specs && (
              <p className="text-xs text-slate-300 mt-0.5">
                {specs}
              </p>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 self-end md:self-auto w-full md:w-auto justify-end pt-2 md:pt-0 border-t md:border-t-0 border-slate-700/50">
          <button
            onClick={onOpenSelector}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-100 text-xs font-semibold border border-slate-600 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            เปลี่ยนรุ่นรถ
          </button>
          <button
            onClick={clearVehicle}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 text-xs font-medium border border-slate-700 hover:border-rose-700/50 transition-colors"
            title="ล้างตัวกรองรถยนต์เพื่อดูสินค้าทั้งหมด"
          >
            <X className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ล้างตัวกรองรถ</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VehicleContextBar;
