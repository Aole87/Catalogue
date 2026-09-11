import React, { createContext, useContext, useState, useEffect } from 'react';

const STORAGE_KEY = 'mobex_selected_vehicle';

const VehicleContext = createContext(null);

export const VehicleProvider = ({ children }) => {
  const [selectedVehicle, setSelectedVehicle] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error('Failed to parse saved vehicle from localStorage', e);
      return null;
    }
  });

  const [isSelectorModalOpen, setIsSelectorModalOpen] = useState(false);

  useEffect(() => {
    try {
      if (selectedVehicle) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedVehicle));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.error('Failed to persist vehicle to localStorage', e);
    }
  }, [selectedVehicle]);

  const setVehicle = (vehicleData) => {
    setSelectedVehicle(vehicleData);
  };

  const clearVehicle = () => {
    setSelectedVehicle(null);
  };

  const openSelectorModal = () => setIsSelectorModalOpen(true);
  const closeSelectorModal = () => setIsSelectorModalOpen(false);

  const value = {
    selectedVehicle,
    setVehicle,
    clearVehicle,
    isVehicleSelected: !!selectedVehicle?.variantId,
    isSelectorModalOpen,
    openSelectorModal,
    closeSelectorModal,
  };

  return (
    <VehicleContext.Provider value={value}>
      {children}
    </VehicleContext.Provider>
  );
};

export const useVehicle = () => {
  const context = useContext(VehicleContext);
  if (!context) {
    throw new Error('useVehicle must be used within a VehicleProvider');
  }
  return context;
};

export default VehicleContext;
