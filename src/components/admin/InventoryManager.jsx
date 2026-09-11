import React, { useState, useEffect, useCallback } from 'react';
import {
  Package, Warehouse, ArrowRightLeft, Sliders, History, Search, Filter,
  RefreshCw, AlertTriangle, CheckCircle, Plus, Edit, Trash2, Eye, ShieldAlert,
  ArrowUpRight, ArrowDownRight, Layers, MapPin, Check, X, AlertCircle, Info
} from 'lucide-react';
import ApiClient from '../../utils/apiClient';

export const InventoryManager = () => {
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory', 'adjustments', 'warehouses', 'movements'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Dashboard KPIs
  const [metrics, setMetrics] = useState({
    totalSkus: 0,
    totalOnHand: 0,
    totalReserved: 0,
    totalAvailable: 0,
    lowStockItems: 0,
    activeWarehouses: 0,
  });

  // Inventory Table State
  const [inventoryItems, setInventoryItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [searchTerm, setSearchTerm] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('');
  const [stockStatusFilter, setStockStatusFilter] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  // Warehouses State
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [locations, setLocations] = useState([]);

  // Movements State
  const [movements, setMovements] = useState([]);
  const [movementsPagination, setMovementsPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [movementTypeFilter, setMovementTypeFilter] = useState('');

  // Modals
  const [selectedItem, setSelectedItem] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Adjustment Modal
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [adjustForm, setAdjustForm] = useState({
    warehouseId: '',
    productId: '',
    productName: '',
    sku: '',
    currentOnHand: 0,
    currentReserved: 0,
    direction: 'INCREASE',
    quantity: 1,
    reason: 'INVENTORY_COUNT',
    notes: '',
  });

  // Transfer Modal
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [transferForm, setTransferForm] = useState({
    sourceWarehouseId: '',
    targetWarehouseId: '',
    productId: '',
    productName: '',
    sku: '',
    availableQty: 0,
    quantity: 1,
    reason: 'STORE_REPLENISHMENT',
    notes: '',
  });

  // Warehouse Modal
  const [warehouseModalOpen, setWarehouseModalOpen] = useState(false);
  const [warehouseForm, setWarehouseForm] = useState({
    code: '',
    name: '',
    description: '',
    addressLine1: '',
    district: '',
    province: '',
    postalCode: '',
    isActive: true,
  });

  // Location Modal
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [locationForm, setLocationForm] = useState({
    warehouseId: '',
    code: '',
    name: '',
    zone: '',
    rack: '',
    shelf: '',
    bin: '',
    isActive: true,
  });

  // Confirmation Dialog
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    onConfirm: null,
  });

  // --------------------------------------------------------------------------
  // DATA FETCHING
  // --------------------------------------------------------------------------

  const fetchMetrics = useCallback(async () => {
    try {
      const res = await ApiClient.getInventoryDashboard();
      if (res?.data) {
        setMetrics(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch metrics:', err);
    }
  }, []);

  const fetchWarehouses = useCallback(async () => {
    try {
      const res = await ApiClient.getWarehouses(true);
      if (res?.data) {
        setWarehouses(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch warehouses:', err);
    }
  }, []);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        q: searchTerm || undefined,
        warehouseId: warehouseFilter || undefined,
        stockStatus: stockStatusFilter || undefined,
        lowStock: lowStockOnly ? 'true' : undefined,
      };
      const res = await ApiClient.getInventory(params);
      if (res?.data) {
        setInventoryItems(res.data);
        if (res.pagination) {
          setPagination((prev) => ({
            ...prev,
            total: res.pagination.total,
            totalPages: res.pagination.totalPages,
          }));
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchTerm, warehouseFilter, stockStatusFilter, lowStockOnly]);

  const fetchMovements = useCallback(async () => {
    try {
      const params = {
        page: movementsPagination.page,
        limit: movementsPagination.limit,
        movementType: movementTypeFilter || undefined,
      };
      const res = await ApiClient.getInventoryMovements(params);
      if (res?.data) {
        setMovements(res.data);
        if (res.pagination) {
          setMovementsPagination((prev) => ({
            ...prev,
            total: res.pagination.total,
            totalPages: res.pagination.totalPages,
          }));
        }
      }
    } catch (err) {
      console.error('Failed to fetch movements:', err);
    }
  }, [movementsPagination.page, movementsPagination.limit, movementTypeFilter]);

  const fetchWarehouseLocations = useCallback(async (whId) => {
    try {
      const res = await ApiClient.getWarehouseLocations(whId, true);
      if (res?.data) {
        setLocations(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch locations:', err);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
    fetchWarehouses();
  }, [fetchMetrics, fetchWarehouses]);

  useEffect(() => {
    if (activeTab === 'inventory') {
      fetchInventory();
    } else if (activeTab === 'movements') {
      fetchMovements();
    }
  }, [activeTab, fetchInventory, fetchMovements]);

  // Flash message helper
  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  // --------------------------------------------------------------------------
  // ACTIONS
  // --------------------------------------------------------------------------

  const openAdjustModal = (item) => {
    setAdjustForm({
      warehouseId: item.warehouseId,
      productId: item.productId,
      productName: item.product.name,
      sku: item.product.sku,
      currentOnHand: item.onHand,
      currentReserved: item.reserved,
      direction: 'INCREASE',
      quantity: 1,
      reason: 'INVENTORY_COUNT',
      notes: '',
    });
    setAdjustModalOpen(true);
  };

  const submitAdjustment = async () => {
    try {
      await ApiClient.adjustStock({
        warehouseId: adjustForm.warehouseId,
        productId: adjustForm.productId,
        direction: adjustForm.direction,
        quantity: parseInt(adjustForm.quantity, 10),
        reason: adjustForm.reason,
        notes: adjustForm.notes,
      });
      setAdjustModalOpen(false);
      showSuccess(`ปรับปรุงสต็อกสำเร็จสำหรับสินค้า ${adjustForm.sku}`);
      fetchInventory();
      fetchMetrics();
    } catch (err) {
      alert(err.message || 'เกิดข้อผิดพลาดในการปรับปรุงสต็อก');
    }
  };

  const openTransferModal = (item) => {
    const otherWarehouses = warehouses.filter((w) => w.id !== item.warehouseId && w.isActive);
    setTransferForm({
      sourceWarehouseId: item.warehouseId,
      targetWarehouseId: otherWarehouses[0]?.id || '',
      productId: item.productId,
      productName: item.product.name,
      sku: item.product.sku,
      availableQty: item.available,
      quantity: 1,
      reason: 'STORE_REPLENISHMENT',
      notes: '',
    });
    setTransferModalOpen(true);
  };

  const submitTransfer = async () => {
    try {
      await ApiClient.transferStock({
        sourceWarehouseId: transferForm.sourceWarehouseId,
        targetWarehouseId: transferForm.targetWarehouseId,
        productId: transferForm.productId,
        quantity: parseInt(transferForm.quantity, 10),
        reason: transferForm.reason,
        notes: transferForm.notes,
      });
      setTransferModalOpen(false);
      showSuccess(`โอนย้ายสต็อกสำเร็จสำหรับ ${transferForm.sku}`);
      fetchInventory();
      fetchMetrics();
    } catch (err) {
      alert(err.message || 'เกิดข้อผิดพลาดในการโอนย้ายสต็อก');
    }
  };

  const submitCreateWarehouse = async () => {
    try {
      await ApiClient.createWarehouse(warehouseForm);
      setWarehouseModalOpen(false);
      showSuccess(`สร้างคลังสินค้า ${warehouseForm.code} สำเร็จ`);
      fetchWarehouses();
      fetchMetrics();
    } catch (err) {
      alert(err.message || 'เกิดข้อผิดพลาดในการสร้างคลังสินค้า');
    }
  };

  const submitCreateLocation = async () => {
    try {
      await ApiClient.createWarehouseLocation(locationForm);
      setLocationModalOpen(false);
      showSuccess(`สร้างช่องจัดเก็บ ${locationForm.code} สำเร็จ`);
      if (selectedWarehouse) {
        fetchWarehouseLocations(selectedWarehouse.id);
      }
    } catch (err) {
      alert(err.message || 'เกิดข้อผิดพลาดในการสร้างช่องจัดเก็บ');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header & Success Alert */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Package className="w-7 h-7 text-indigo-600" />
            Inventory & Warehouse Operations
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            ระบบจัดการคลังสินค้า สต็อกคงเหลือ จุดสั่งซื้อซ้ำ และบันทึกประวัติการเคลื่อนไหวสต็อก (M10 Domain)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              fetchMetrics();
              if (activeTab === 'inventory') fetchInventory();
              if (activeTab === 'movements') fetchMovements();
            }}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-lg shadow-sm transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            รีเฟรชข้อมูล
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage('')} className="text-emerald-600 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total SKUs</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{metrics.totalSkus.toLocaleString()}</div>
          <div className="text-[10px] text-slate-500 mt-1">รายการสินค้าทั้งหมด</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total On-Hand</div>
          <div className="text-2xl font-black text-indigo-600 mt-1">{metrics.totalOnHand.toLocaleString()}</div>
          <div className="text-[10px] text-slate-500 mt-1">ชิ้นในคลังทั้งหมด</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Reserved Stock</div>
          <div className="text-2xl font-black text-amber-600 mt-1">{metrics.totalReserved.toLocaleString()}</div>
          <div className="text-[10px] text-slate-500 mt-1">จองรอตัดส่ง</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Available Stock</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">{metrics.totalAvailable.toLocaleString()}</div>
          <div className="text-[10px] text-slate-500 mt-1">พร้อมจำหน่ายจริง</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Low Stock Alerts</div>
          <div className="text-2xl font-black text-rose-600 mt-1">{metrics.lowStockItems.toLocaleString()}</div>
          <div className="text-[10px] text-slate-500 mt-1">ถึงจุดสั่งซื้อซ้ำ</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Hubs</div>
          <div className="text-2xl font-black text-slate-800 mt-1">{metrics.activeWarehouses}</div>
          <div className="text-[10px] text-slate-500 mt-1">คลังกระจายสินค้า</div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 bg-white px-4 rounded-t-xl">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'inventory'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Package className="w-4 h-4" />
          รายการสต็อกคงเหลือ (Stock Inventory)
        </button>

        <button
          onClick={() => setActiveTab('warehouses')}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'warehouses'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Warehouse className="w-4 h-4" />
          คลังสินค้า & ช่องจัดเก็บ (Warehouses & Bins)
        </button>

        <button
          onClick={() => setActiveTab('movements')}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'movements'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          ประวัติการเคลื่อนไหวสต็อก (Movement Ledger)
        </button>
      </div>

      {/* TAB 1: STOCK INVENTORY */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="flex flex-1 items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="ค้นหาชื่อสินค้า, SKU, บาร์โค้ด, แบรนด์..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <select
                value={warehouseFilter}
                onChange={(e) => setWarehouseFilter(e.target.value)}
                className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
              >
                <option value="">ทุกคลังสินค้า (All Warehouses)</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.code} - {w.name}
                  </option>
                ))}
              </select>

              <select
                value={stockStatusFilter}
                onChange={(e) => setStockStatusFilter(e.target.value)}
                className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
              >
                <option value="">ทุกสถานะสต็อก</option>
                <option value="IN_STOCK">พร้อมจำหน่าย (In Stock)</option>
                <option value="LOW_STOCK">สินค้าใกล้หมด (Low Stock)</option>
                <option value="OUT_OF_STOCK">สินค้าหมด (Out of Stock)</option>
              </select>
            </div>

            <div className="flex items-center gap-2 self-end md:self-auto">
              <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={lowStockOnly}
                  onChange={(e) => setLowStockOnly(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>เฉพาะใกล้หมด (Low Stock Only)</span>
              </label>
            </div>
          </div>

          {/* Inventory Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold tracking-wider">
                    <th className="py-3 px-4">สินค้า (Product / SKU)</th>
                    <th className="py-3 px-4">คลังสินค้า (Warehouse)</th>
                    <th className="py-3 px-4">ช่องจัดเก็บ (Bin)</th>
                    <th className="py-3 px-4 text-center">On-Hand</th>
                    <th className="py-3 px-4 text-center">Reserved</th>
                    <th className="py-3 px-4 text-center">Available</th>
                    <th className="py-3 px-4 text-center">สถานะสต็อก</th>
                    <th className="py-3 px-4 text-right">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
                        กำลังโหลดข้อมูลสต็อกคงเหลือ...
                      </td>
                    </tr>
                  ) : inventoryItems.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        ไม่พบรายการสต็อกตามเงื่อนไขที่ค้นหา
                      </td>
                    </tr>
                  ) : (
                    inventoryItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{item.product.name}</div>
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                            SKU: <span className="text-indigo-600 font-semibold">{item.product.sku}</span>
                            {item.product.brand && ` | ${item.product.brand}`}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-800">{item.warehouse.code}</span>
                          <div className="text-[10px] text-slate-500">{item.warehouse.name}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          {item.location ? (
                            <span className="inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {item.location.code}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">ไม่ระบุ</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                          {item.onHand.toLocaleString()}
                        </td>

                        <td className="py-3.5 px-4 text-center font-semibold text-amber-600">
                          {item.reserved > 0 ? item.reserved.toLocaleString() : '-'}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-md font-bold text-xs ${
                              item.available > (item.reorderPoint || 10)
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : item.available > 0
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {item.available.toLocaleString()}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          {item.stockStatus === 'IN_STOCK' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-full">
                              <CheckCircle className="w-3 h-3" /> ปกติ
                            </span>
                          )}
                          {item.stockStatus === 'LOW_STOCK' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded-full">
                              <AlertTriangle className="w-3 h-3" /> ใกล้หมด
                            </span>
                          )}
                          {item.stockStatus === 'OUT_OF_STOCK' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-100/60 px-2 py-0.5 rounded-full">
                              <AlertCircle className="w-3 h-3" /> หมดสต็อก
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => {
                              setSelectedItem(item);
                              setDetailModalOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                            title="ดูรายละเอียด"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => openAdjustModal(item)}
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                            title="ปรับปรุงสต็อก (Adjust)"
                          >
                            <Sliders className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => openTransferModal(item)}
                            className="p-1.5 text-slate-500 hover:text-[#0c2b2f] hover:bg-[#0c2b2f]/10 rounded-lg transition-all"
                            title="โอนย้ายคลัง (Transfer)"
                          >
                            <ArrowRightLeft className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <div>
                แสดง {inventoryItems.length} จากทั้งหมด {pagination.total} รายการ (หน้า {pagination.page} / {pagination.totalPages})
              </div>
              <div className="flex gap-2">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50"
                >
                  ก่อนหน้า
                </button>
                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50"
                >
                  ถัดไป
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: WAREHOUSES & LOCATIONS */}
      {activeTab === 'warehouses' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-slate-800">ศูนย์กระจายสินค้า & คลังสินค้า (Warehouses)</h2>
            <button
              onClick={() => {
                setWarehouseForm({
                  code: '',
                  name: '',
                  description: '',
                  addressLine1: '',
                  district: '',
                  province: '',
                  postalCode: '',
                  isActive: true,
                });
                setWarehouseModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              เพิ่มคลังสินค้าใหม่
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {warehouses.map((wh) => (
              <div
                key={wh.id}
                onClick={() => {
                  setSelectedWarehouse(wh);
                  fetchWarehouseLocations(wh.id);
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  selectedWarehouse?.id === wh.id
                    ? 'border-indigo-600 ring-2 ring-indigo-100 bg-white'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono text-xs font-black px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded border border-indigo-200">
                      {wh.code}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm mt-2">{wh.name}</h3>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      wh.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {wh.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                  </span>
                </div>

                <p className="text-xs text-slate-500 mt-2 line-clamp-2">{wh.description || 'ไม่มีคำอธิบาย'}</p>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{wh._count?.locations || 0} ช่องจัดเก็บ (Bins)</span>
                  <span>{wh._count?.inventoryItems || 0} รายการ SKU</span>
                </div>
              </div>
            ))}
          </div>

          {/* Selected Warehouse Locations */}
          {selectedWarehouse && (
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-indigo-600" />
                    ช่องจัดเก็บในคลัง: {selectedWarehouse.name} ({selectedWarehouse.code})
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">จัดการตำแหน่งชั้นวาง Zone, Rack, Shelf, Bin</p>
                </div>

                <button
                  onClick={() => {
                    setLocationForm({
                      warehouseId: selectedWarehouse.id,
                      code: '',
                      name: '',
                      zone: '',
                      rack: '',
                      shelf: '',
                      bin: '',
                      isActive: true,
                    });
                    setLocationModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  เพิ่มช่องจัดเก็บ (Add Bin)
                </button>
              </div>

              {locations.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  ยังไม่มีช่องจัดเก็บในคลังสินค้านี้ คลิก "เพิ่มช่องจัดเก็บ" เพื่อเริ่มต้นสร้าง
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {locations.map((loc) => (
                    <div key={loc.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                      <div className="font-mono font-bold text-indigo-700">{loc.code}</div>
                      <div className="text-slate-700 font-medium truncate mt-0.5">{loc.name}</div>
                      <div className="text-[10px] text-slate-400 mt-2 font-mono">
                        Z:{loc.zone || '-'} R:{loc.rack || '-'} S:{loc.shelf || '-'} B:{loc.bin || '-'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MOVEMENT LEDGER */}
      {activeTab === 'movements' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <select
                value={movementTypeFilter}
                onChange={(e) => setMovementTypeFilter(e.target.value)}
                className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
              >
                <option value="">ทุกประเภทการเคลื่อนไหว (All Movement Types)</option>
                <option value="PURCHASE_RECEIPT">PURCHASE_RECEIPT (รับสินค้าเข้า)</option>
                <option value="SALE">SALE (ตัดขาย)</option>
                <option value="DEDUCTION">DEDUCTION (ตัดจ่ายส่งมอบ)</option>
                <option value="RESERVATION">RESERVATION (จองสต็อก)</option>
                <option value="RELEASE">RELEASE (คืนการจอง)</option>
                <option value="ADJUSTMENT_IN">ADJUSTMENT_IN (ปรับเพิ่ม)</option>
                <option value="ADJUSTMENT_OUT">ADJUSTMENT_OUT (ปรับลด)</option>
                <option value="TRANSFER_IN">TRANSFER_IN (รับโอนย้าย)</option>
                <option value="TRANSFER_OUT">TRANSFER_OUT (ส่งโอนย้าย)</option>
                <option value="RETURN">RETURN (รับคืนจากลูกค้า)</option>
                <option value="DAMAGE">DAMAGE (ของเสียหาย/ชำรุด)</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold tracking-wider">
                    <th className="py-3 px-4">วันที่ / เวลา</th>
                    <th className="py-3 px-4">สินค้า (Product / SKU)</th>
                    <th className="py-3 px-4">คลังสินค้า (Hub / Bin)</th>
                    <th className="py-3 px-4 text-center">ประเภท</th>
                    <th className="py-3 px-4 text-center">จำนวน</th>
                    <th className="py-3 px-4 text-center">Before $\to$ After</th>
                    <th className="py-3 px-4">อ้างอิง / เหตุผล</th>
                    <th className="py-3 px-4">ผู้ดำเนินการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {movements.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        ไม่พบบันทึกการเคลื่อนไหวสต็อก
                      </td>
                    </tr>
                  ) : (
                    movements.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                          {new Date(m.createdAt).toLocaleString('th-TH')}
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-800">{m.product?.name}</div>
                          <div className="text-[11px] font-mono text-indigo-600">{m.product?.sku}</div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-800">{m.warehouse?.code}</span>
                          {m.location && <span className="text-slate-400 font-mono ml-1">({m.location.code})</span>}
                        </td>

                        <td className="py-3 px-4 text-center">
                          <span className="inline-block px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                            {m.movementType}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-center font-bold">
                          {['ADJUSTMENT_OUT', 'TRANSFER_OUT', 'DEDUCTION', 'SALE'].includes(m.movementType) ? (
                            <span className="text-rose-600">-{m.quantity}</span>
                          ) : (
                            <span className="text-emerald-600">+{m.quantity}</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-center font-mono text-[11px] text-slate-600">
                          {m.beforeOnHand !== null && m.afterOnHand !== null ? (
                            <span>
                              {m.beforeOnHand} $\to$ <strong className="text-slate-900">{m.afterOnHand}</strong>
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>

                        <td className="py-3 px-4 text-slate-600 max-w-xs truncate" title={m.notes || m.referenceType}>
                          {m.notes || m.referenceType || '-'}
                        </td>

                        <td className="py-3 px-4 text-slate-500 text-[11px]">
                          {m.performedByUser ? m.performedByUser.displayName || m.performedByUser.email : 'System'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <div>
                แสดง {movements.length} จากทั้งหมด {movementsPagination.total} รายการ
              </div>
              <div className="flex gap-2">
                <button
                  disabled={movementsPagination.page <= 1}
                  onClick={() => setMovementsPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50"
                >
                  ก่อนหน้า
                </button>
                <button
                  disabled={movementsPagination.page >= movementsPagination.totalPages}
                  onClick={() => setMovementsPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50"
                >
                  ถัดไป
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------------- */}
      {/* MODAL: STOCK ADJUSTMENT */}
      {/* -------------------------------------------------------------------------- */}
      {adjustModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-scale-in">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-600" />
                ปรับปรุงสต็อกสินค้า (Controlled Stock Adjustment)
              </h3>
              <button onClick={() => setAdjustModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900">{adjustForm.productName}</div>
                <div className="text-slate-500 font-mono">SKU: {adjustForm.sku}</div>
                <div className="flex gap-4 mt-2 pt-2 border-t border-slate-200 text-[11px]">
                  <span>On-Hand ปัจจุบัน: <strong>{adjustForm.currentOnHand}</strong></span>
                  <span>จองรอส่ง (Reserved): <strong>{adjustForm.currentReserved}</strong></span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ทิศทางการปรับปรุง (Direction)</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustForm({ ...adjustForm, direction: 'INCREASE' })}
                    className={`py-2 px-3 text-center rounded-lg border font-bold text-xs transition-all ${
                      adjustForm.direction === 'INCREASE'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    + เพิ่มสต็อก (IN)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustForm({ ...adjustForm, direction: 'DECREASE' })}
                    className={`py-2 px-3 text-center rounded-lg border font-bold text-xs transition-all ${
                      adjustForm.direction === 'DECREASE'
                        ? 'bg-rose-50 border-rose-500 text-rose-700'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    - ลดสต็อก (OUT)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustForm({ ...adjustForm, direction: 'SET' })}
                    className={`py-2 px-3 text-center rounded-lg border font-bold text-xs transition-all ${
                      adjustForm.direction === 'SET'
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    = กำหนดค่าใหม่ (SET)
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">จำนวนชิ้น (Quantity)</label>
                <input
                  type="number"
                  min="0"
                  value={adjustForm.quantity}
                  onChange={(e) => setAdjustForm({ ...adjustForm, quantity: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">เหตุผลในการปรับปรุง (Mandatory Reason)</label>
                <select
                  value={adjustForm.reason}
                  onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                >
                  <option value="INVENTORY_COUNT">ตรวจนับสต็อกกายภาพ (Physical Inventory Count)</option>
                  <option value="DAMAGE">สินค้าชำรุด / เสียหาย (Damaged Stock)</option>
                  <option value="LOSS">สินค้าสูญหาย (Lost / Missing Stock)</option>
                  <option value="RECEIVED">รับเข้าสินค้าพิเศษ (Special Receipt / Found Stock)</option>
                  <option value="CORRECTION">แก้ไขข้อมูลผิดพลาด (Data Correction)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">หมายเหตุเพิ่มเติม</label>
                <input
                  type="text"
                  placeholder="เช่น อ้างอิงเอกสารตรวจนับรอบเดือน..."
                  value={adjustForm.notes}
                  onChange={(e) => setAdjustForm({ ...adjustForm, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              {/* Preview Box */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Info className="w-4 h-4" /> สรุปผลการปรับปรุงสต็อก:
                </div>
                <div className="text-[11px]">
                  On-Hand ใหม่จะเป็น: <strong>
                    {adjustForm.direction === 'INCREASE'
                      ? adjustForm.currentOnHand + parseInt(adjustForm.quantity || 0, 10)
                      : adjustForm.direction === 'DECREASE'
                      ? adjustForm.currentOnHand - parseInt(adjustForm.quantity || 0, 10)
                      : parseInt(adjustForm.quantity || 0, 10)}
                  </strong> ชิ้น
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAdjustModalOpen(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold rounded-lg"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={submitAdjustment}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-sm"
              >
                ยืนยันการปรับปรุงสต็อก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------------- */}
      {/* MODAL: STOCK TRANSFER */}
      {/* -------------------------------------------------------------------------- */}
      {transferModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-scale-in">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-[#0c2b2f]" />
                โอนย้ายสินค้าระหว่างคลัง (Warehouse Transfer)
              </h3>
              <button onClick={() => setTransferModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900">{transferForm.productName}</div>
                <div className="text-slate-500 font-mono">SKU: {transferForm.sku}</div>
                <div className="text-[11px] text-emerald-700 font-bold mt-1">
                  พร้อมโอนได้สูงสุด (Available): {transferForm.availableQty} ชิ้น
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">คลังสินค้าต้นทาง (Source)</label>
                  <select
                    disabled
                    value={transferForm.sourceWarehouseId}
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs"
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.code} - {w.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">คลังสินค้าปลายทาง (Target)</label>
                  <select
                    value={transferForm.targetWarehouseId}
                    onChange={(e) => setTransferForm({ ...transferForm, targetWarehouseId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                  >
                    {warehouses
                      .filter((w) => w.id !== transferForm.sourceWarehouseId && w.isActive)
                      .map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.code} - {w.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">จำนวนที่ต้องการโอนย้าย (Quantity)</label>
                <input
                  type="number"
                  min="1"
                  max={transferForm.availableQty}
                  value={transferForm.quantity}
                  onChange={(e) => setTransferForm({ ...transferForm, quantity: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">เหตุผลในการโอนย้าย (Reason)</label>
                <input
                  type="text"
                  placeholder="เช่น เติมสต็อกสาขาหน้าร้าน, จัดส่งด่วน..."
                  value={transferForm.reason}
                  onChange={(e) => setTransferForm({ ...transferForm, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setTransferModalOpen(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold rounded-lg"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={submitTransfer}
                className="px-4 py-2 bg-[#ff6b2b] hover:bg-[#e04b00] text-white text-xs font-bold rounded-xl shadow-md shadow-orange-950/20"
              >
                ยืนยันการโอนย้าย
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------------- */}
      {/* MODAL: CREATE WAREHOUSE */}
      {/* -------------------------------------------------------------------------- */}
      {warehouseModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scale-in">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Warehouse className="w-5 h-5 text-indigo-600" />
                เพิ่มคลังสินค้าใหม่ (Create Warehouse Hub)
              </h3>
              <button onClick={() => setWarehouseModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">รหัสคลัง (Code e.g. WH-BKK-02)</label>
                  <input
                    type="text"
                    required
                    value={warehouseForm.code}
                    onChange={(e) => setWarehouseForm({ ...warehouseForm, code: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs uppercase"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ชื่อคลังสินค้า (Name)</label>
                  <input
                    type="text"
                    required
                    value={warehouseForm.name}
                    onChange={(e) => setWarehouseForm({ ...warehouseForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">คำอธิบาย</label>
                <input
                  type="text"
                  value={warehouseForm.description}
                  onChange={(e) => setWarehouseForm({ ...warehouseForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ที่อยู่คลังสินค้า</label>
                <input
                  type="text"
                  value={warehouseForm.addressLine1}
                  onChange={(e) => setWarehouseForm({ ...warehouseForm, addressLine1: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">เขต/อำเภอ</label>
                  <input
                    type="text"
                    value={warehouseForm.district}
                    onChange={(e) => setWarehouseForm({ ...warehouseForm, district: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">จังหวัด</label>
                  <input
                    type="text"
                    value={warehouseForm.province}
                    onChange={(e) => setWarehouseForm({ ...warehouseForm, province: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">รหัสไปรษณีย์</label>
                  <input
                    type="text"
                    value={warehouseForm.postalCode}
                    onChange={(e) => setWarehouseForm({ ...warehouseForm, postalCode: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setWarehouseModalOpen(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold rounded-lg"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={submitCreateWarehouse}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm"
              >
                บันทึกคลังสินค้า
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------------- */}
      {/* MODAL: CREATE LOCATION */}
      {/* -------------------------------------------------------------------------- */}
      {locationModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scale-in">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <MapPin className="w-5 h-5 text-indigo-600" />
                เพิ่มช่องจัดเก็บ (Create Bin Location)
              </h3>
              <button onClick={() => setLocationModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">รหัสช่องจัดเก็บ (Code e.g. LOC-A01-01)</label>
                <input
                  type="text"
                  required
                  value={locationForm.code}
                  onChange={(e) => setLocationForm({ ...locationForm, code: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs uppercase"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ชื่อตำแหน่ง (Location Name)</label>
                <input
                  type="text"
                  required
                  value={locationForm.name}
                  onChange={(e) => setLocationForm({ ...locationForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">โซน (Zone)</label>
                  <input
                    type="text"
                    value={locationForm.zone}
                    onChange={(e) => setLocationForm({ ...locationForm, zone: e.target.value })}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">แถว (Rack)</label>
                  <input
                    type="text"
                    value={locationForm.rack}
                    onChange={(e) => setLocationForm({ ...locationForm, rack: e.target.value })}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ชั้น (Shelf)</label>
                  <input
                    type="text"
                    value={locationForm.shelf}
                    onChange={(e) => setLocationForm({ ...locationForm, shelf: e.target.value })}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">กล่อง (Bin)</label>
                  <input
                    type="text"
                    value={locationForm.bin}
                    onChange={(e) => setLocationForm({ ...locationForm, bin: e.target.value })}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setLocationModalOpen(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold rounded-lg"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={submitCreateLocation}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm"
              >
                บันทึกช่องจัดเก็บ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManager;
