import React from 'react';
import { X, Car } from 'lucide-react';
import VehicleSelector from './VehicleSelector';
import { useVehicle } from '../../context/VehicleContext';

export const VehicleSelectorModal = ({ onSelectComplete }) => {
  const { isSelectorModalOpen, closeSelectorModal } = useVehicle();

  if (!isSelectorModalOpen) return null;

  const handleComplete = (vehicleData) => {
    closeSelectorModal();
    onSelectComplete?.(vehicleData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl bg-slate-900 rounded-3xl shadow-2xl border border-slate-700/80 overflow-hidden">
        {/* Modal Close Button */}
        <button
          onClick={closeSelectorModal}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Embedded Selector */}
        <div className="p-2 sm:p-4">
          <VehicleSelector onSelectComplete={handleComplete} />
        </div>
      </div>
    </div>
  );
};

export default VehicleSelectorModal;
