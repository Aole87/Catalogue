import React, { useState, useEffect } from 'react';
import { Car, Check, ChevronRight, Loader2, RotateCcw, Search } from 'lucide-react';
import ApiClient from '../../utils/apiClient';
import { useVehicle } from '../../context/VehicleContext';

export const VehicleSelector = ({
  onSelectComplete,
  variant = 'hero', // 'hero' | 'card' | 'compact'
  className = '',
}) => {
  const { setVehicle, selectedVehicle } = useVehicle();

  // Master Data States
  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  const [generations, setGenerations] = useState([]);
  const [engines, setEngines] = useState([]);
  const [variants, setVariants] = useState([]);

  // Selection States
  const [selectedMakeId, setSelectedMakeId] = useState('');
  const [selectedModelId, setSelectedModelId] = useState('');
  const [selectedGenerationId, setSelectedGenerationId] = useState('');
  const [selectedEngineId, setSelectedEngineId] = useState('');
  const [selectedVariantId, setSelectedVariantId] = useState('');

  // Loading States
  const [loadingMakes, setLoadingMakes] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingGens, setLoadingGens] = useState(false);
  const [loadingEngines, setLoadingEngines] = useState(false);
  const [loadingVariants, setLoadingVariants] = useState(false);

  // 1. Load Makes on initial mount
  useEffect(() => {
    let mounted = true;
    const fetchMakes = async () => {
      try {
        setLoadingMakes(true);
        const res = await ApiClient.getMakes();
        if (mounted) {
          setMakes(res.makes || []);
        }
      } catch (err) {
        console.error('Failed to load vehicle makes', err);
      } finally {
        if (mounted) setLoadingMakes(false);
      }
    };
    fetchMakes();
    return () => { mounted = false; };
  }, []);

  // 2. Cascade Make -> Models
  const handleMakeChange = async (makeId) => {
    setSelectedMakeId(makeId);
    setSelectedModelId('');
    setSelectedGenerationId('');
    setSelectedEngineId('');
    setSelectedVariantId('');
    setModels([]);
    setGenerations([]);
    setEngines([]);
    setVariants([]);

    if (!makeId) return;

    try {
      setLoadingModels(true);
      const res = await ApiClient.getModels(makeId);
      setModels(res.models || []);
    } catch (err) {
      console.error('Failed to load vehicle models', err);
    } finally {
      setLoadingModels(false);
    }
  };

  // 3. Cascade Model -> Generations
  const handleModelChange = async (modelId) => {
    setSelectedModelId(modelId);
    setSelectedGenerationId('');
    setSelectedEngineId('');
    setSelectedVariantId('');
    setGenerations([]);
    setEngines([]);
    setVariants([]);

    if (!modelId) return;

    try {
      setLoadingGens(true);
      const res = await ApiClient.getGenerations(modelId);
      setGenerations(res.generations || []);
    } catch (err) {
      console.error('Failed to load vehicle generations', err);
    } finally {
      setLoadingGens(false);
    }
  };

  // 4. Cascade Generation -> Engines & Variants
  const handleGenerationChange = async (genId) => {
    setSelectedGenerationId(genId);
    setSelectedEngineId('');
    setSelectedVariantId('');
    setEngines([]);
    setVariants([]);

    if (!genId) return;

    try {
      setLoadingEngines(true);
      setLoadingVariants(true);

      // Fetch engines for this generation
      const [engRes, varRes] = await Promise.all([
        ApiClient.request(`/vehicles/engines?generationId=${genId}`).catch(() => ({ engines: [] })),
        ApiClient.getVariants({ generationId: genId }),
      ]);

      setEngines(engRes.engines || []);
      setVariants(varRes.variants || []);
    } catch (err) {
      console.error('Failed to load generation engines and variants', err);
    } finally {
      setLoadingEngines(false);
      setLoadingVariants(false);
    }
  };

  // 5. Filter Variants by Engine
  const handleEngineChange = async (engineId) => {
    setSelectedEngineId(engineId);
    setSelectedVariantId('');

    if (!selectedGenerationId) return;

    try {
      setLoadingVariants(true);
      const res = await ApiClient.getVariants({
        generationId: selectedGenerationId,
        engineId: engineId || undefined,
      });
      setVariants(res.variants || []);
    } catch (err) {
      console.error('Failed to filter variants by engine', err);
    } finally {
      setLoadingVariants(false);
    }
  };

  // 6. Handle Reset
  const handleReset = () => {
    setSelectedMakeId('');
    setSelectedModelId('');
    setSelectedGenerationId('');
    setSelectedEngineId('');
    setSelectedVariantId('');
    setModels([]);
    setGenerations([]);
    setEngines([]);
    setVariants([]);
  };

  // 7. Apply Vehicle Context
  const handleApply = () => {
    if (!selectedVariantId) return;

    const currentVariant = variants.find((v) => v.id === selectedVariantId);
    const currentMake = makes.find((m) => m.id === selectedMakeId);
    const currentModel = models.find((m) => m.id === selectedModelId);
    const currentGen = generations.find((g) => g.id === selectedGenerationId);
    const currentEngine = engines.find((e) => e.id === selectedEngineId) || currentVariant?.engine;

    const vehicleContextData = {
      variantId: selectedVariantId,
      makeId: selectedMakeId,
      makeName: currentMake?.name || '',
      modelId: selectedModelId,
      modelName: currentModel?.name || '',
      generationId: selectedGenerationId,
      generationName: currentGen?.name || '',
      generationCode: currentGen?.code || '',
      engineId: selectedEngineId || currentVariant?.engineId,
      engineName: currentEngine?.name || '',
      engineCode: currentEngine?.engineCode || '',
      variantName: currentVariant?.name || '',
      transmission: currentVariant?.transmission || '',
      bodyType: currentVariant?.bodyType || '',
      yearRange: currentGen?.startYear ? `${currentGen.startYear}-${currentGen.endYear || 'ปัจจุบัน'}` : '',
    };

    setVehicle(vehicleContextData);
    onSelectComplete?.(vehicleContextData);
  };

  const isFormComplete = !!selectedVariantId;

  return (
    <div
      className={`bg-slate-900 text-white rounded-3xl p-5 sm:p-7 shadow-2xl border border-slate-800 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-600/20 border border-brand-500/30 text-brand-400 flex items-center justify-center">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
              ค้นหาอะไหล่ตรงรุ่น (5-Level Vehicle Fitment)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              ระบุข้อมูลรถยนต์เพื่อแสดงเฉพาะรายการที่ตรงรุ่นตามโครงสร้างแคตตาล็อก
            </p>
          </div>
        </div>

        {(selectedMakeId || selectedModelId) && (
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-slate-800"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            ล้างค่า
          </button>
        )}
      </div>

      {/* 5-Level Cascading Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Step 1: Make */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>1. ยี่ห้อรถ (Make)</span>
            {loadingMakes && <Loader2 className="w-3 h-3 animate-spin text-brand-400" />}
          </label>
          <select
            value={selectedMakeId}
            onChange={(e) => handleMakeChange(e.target.value)}
            disabled={loadingMakes}
            className="w-full bg-slate-800/90 text-slate-100 text-sm font-medium rounded-xl border border-slate-700/80 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 disabled:opacity-50 transition-all cursor-pointer"
          >
            <option value="">-- เลือกยี่ห้อ --</option>
            {makes.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        {/* Step 2: Model */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>2. รุ่นรถ (Model)</span>
            {loadingModels && <Loader2 className="w-3 h-3 animate-spin text-brand-400" />}
          </label>
          <select
            value={selectedModelId}
            onChange={(e) => handleModelChange(e.target.value)}
            disabled={!selectedMakeId || loadingModels}
            className="w-full bg-slate-800/90 text-slate-100 text-sm font-medium rounded-xl border border-slate-700/80 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <option value="">{selectedMakeId ? '-- เลือกรุ่น --' : 'เลือกรุ่น (ก่อนหน้า)'}</option>
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        {/* Step 3: Generation */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>3. โฉม / ปี (Generation)</span>
            {loadingGens && <Loader2 className="w-3 h-3 animate-spin text-brand-400" />}
          </label>
          <select
            value={selectedGenerationId}
            onChange={(e) => handleGenerationChange(e.target.value)}
            disabled={!selectedModelId || loadingGens}
            className="w-full bg-slate-800/90 text-slate-100 text-sm font-medium rounded-xl border border-slate-700/80 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <option value="">{selectedModelId ? '-- เลือกโฉม/ปี --' : 'เลือกโฉม (ก่อนหน้า)'}</option>
            {generations.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name} {g.code ? `[${g.code}]` : ''} ({g.startYear} - {g.endYear || 'ปัจจุบัน'})
              </option>
            ))}
          </select>
        </div>

        {/* Step 4: Engine */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>4. เครื่องยนต์ (Engine)</span>
            {loadingEngines && <Loader2 className="w-3 h-3 animate-spin text-brand-400" />}
          </label>
          <select
            value={selectedEngineId}
            onChange={(e) => handleEngineChange(e.target.value)}
            disabled={!selectedGenerationId || loadingEngines}
            className="w-full bg-slate-800/90 text-slate-100 text-sm font-medium rounded-xl border border-slate-700/80 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <option value="">{selectedGenerationId ? '-- เลือกเครื่องยนต์ --' : 'เครื่องยนต์'}</option>
            {engines.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name} {e.engineCode ? `(${e.engineCode})` : ''} {e.displacementCc ? `${e.displacementCc}cc` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Step 5: Variant & Action */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>5. รุ่นย่อย / เกียร์ (Variant)</span>
            {loadingVariants && <Loader2 className="w-3 h-3 animate-spin text-brand-400" />}
          </label>
          <select
            value={selectedVariantId}
            onChange={(e) => setSelectedVariantId(e.target.value)}
            disabled={!selectedGenerationId || loadingVariants}
            className="w-full bg-slate-800/90 text-slate-100 text-sm font-medium rounded-xl border border-slate-700/80 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <option value="">{selectedGenerationId ? '-- เลือกรุ่นย่อย --' : 'รุ่นย่อย (Variant)'}</option>
            {variants.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} {v.transmission ? `[${v.transmission}]` : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-5 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-slate-400 flex items-center gap-1.5">
          <Check className={`w-4 h-4 ${isFormComplete ? 'text-emerald-400' : 'text-slate-600'}`} />
          <span>
            {isFormComplete
              ? 'ข้อมูลรถครบถ้วน พร้อมค้นหาอะไหล่ตรงรุ่น'
              : 'กรุณาเลือกลำดับขั้นตอน 1 ถึง 5 ให้ครบถ้วน'}
          </span>
        </div>

        <button
          type="button"
          onClick={handleApply}
          disabled={!isFormComplete}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-bold shadow-lg shadow-brand-600/30 transition-all disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 focus:ring-offset-slate-900"
        >
          <Search className="w-4 h-4" />
          <span>ค้นหาอะไหล่ตรงรุ่น</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default VehicleSelector;
