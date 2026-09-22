import React, { useState, useEffect } from 'react';

export default function ProcurementManager() {
  const [subTab, setSubTab] = useState('pos'); // 'pos', 'suppliers', 'receipts'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Suppliers state
  const [suppliers, setSuppliers] = useState([]);
  const [supplierSearch, setSupplierSearch] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [supplierForm, setSupplierForm] = useState({
    code: '',
    name: '',
    displayName: '',
    contactName: '',
    email: '',
    phone: '',
    paymentTerms: 'NET30',
    currency: 'THB',
    leadTimeDays: 7,
    notes: '',
  });

  // Purchase Orders state
  const [pos, setPos] = useState([]);
  const [poStatusFilter, setPoStatusFilter] = useState('');
  const [poSearch, setPoSearch] = useState('');
  const [selectedPo, setSelectedPo] = useState(null);
  const [showCreatePoModal, setShowCreatePoModal] = useState(false);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [poForm, setPoForm] = useState({
    supplierId: '',
    destinationWarehouseId: '',
    notes: '',
    items: [{ productId: '', orderedQuantity: 10, unitCost: 100 }],
  });

  // Goods Receiving state
  const [receipts, setReceipts] = useState([]);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [receivingPo, setReceivingPo] = useState(null);
  const [receiveItems, setReceiveItems] = useState([]);
  const [receiveNotes, setReceiveNotes] = useState('');

  // Fetch Suppliers
  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/suppliers?q=${encodeURIComponent(supplierSearch)}&limit=50`);
      const json = await res.json();
      if (res.ok) {
        setSuppliers(json.data || []);
      } else {
        setError(json.error?.message || 'Failed to fetch suppliers');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Purchase Orders
  const fetchPOs = async () => {
    try {
      setLoading(true);
      let url = `/api/v1/purchase-orders?limit=50`;
      if (poStatusFilter) url += `&status=${poStatusFilter}`;
      if (poSearch) url += `&poNumber=${encodeURIComponent(poSearch)}`;
      const res = await fetch(url);
      const json = await res.json();
      if (res.ok) {
        setPos(json.data || []);
      } else {
        setError(json.error?.message || 'Failed to fetch purchase orders');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Goods Receipts
  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/goods-receipts?limit=50');
      const json = await res.json();
      if (res.ok) {
        setReceipts(json.data || []);
      } else {
        setError(json.error?.message || 'Failed to fetch goods receipts');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Warehouses & Products for dropdowns
  const fetchMasterData = async () => {
    try {
      const [whRes, prodRes] = await Promise.all([
        fetch('/api/v1/warehouses'),
        fetch('/api/v1/products?limit=100'),
      ]);
      const whJson = await whRes.json();
      const prodJson = await prodRes.json();
      if (whRes.ok) setWarehouses(whJson.data || []);
      if (prodRes.ok) setProducts(prodJson.data || []);
    } catch (err) {
      console.error('Failed to load master dropdown data:', err);
    }
  };

  useEffect(() => {
    fetchMasterData();
  }, []);

  useEffect(() => {
    if (subTab === 'suppliers') fetchSuppliers();
    if (subTab === 'pos') fetchPOs();
    if (subTab === 'receipts') fetchReceipts();
  }, [subTab, poStatusFilter]);

  // Create Supplier Handler
  const handleSaveSupplier = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const method = selectedSupplier ? 'PATCH' : 'POST';
      const url = selectedSupplier ? `/api/v1/suppliers/${selectedSupplier.id}` : '/api/v1/suppliers';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(supplierForm),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Failed to save supplier');
      setSuccessMsg(`Supplier ${selectedSupplier ? 'updated' : 'created'} successfully!`);
      setShowSupplierModal(false);
      setSelectedSupplier(null);
      fetchSuppliers();
    } catch (err) {
      setError(err.message);
    }
  };

  // Create Draft PO Handler
  const handleCreatePO = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch('/api/v1/purchase-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(poForm),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Failed to create purchase order');
      setSuccessMsg(`Draft PO created: ${json.data.poNumber}`);
      setShowCreatePoModal(false);
      fetchPOs();
    } catch (err) {
      setError(err.message);
    }
  };

  // PO State Transition Actions
  const handlePoAction = async (poId, action, body = {}) => {
    setError(null);
    try {
      const res = await fetch(`/api/v1/purchase-orders/${poId}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || `Failed to ${action} purchase order`);
      setSuccessMsg(`PO updated: ${action.toUpperCase()} successful`);
      if (selectedPo && selectedPo.id === poId) {
        const detailRes = await fetch(`/api/v1/purchase-orders/${poId}`);
        const detailJson = await detailRes.json();
        if (detailRes.ok) setSelectedPo(detailJson.data);
      }
      fetchPOs();
    } catch (err) {
      setError(err.message);
    }
  };

  // Open Receiving Modal
  const handleOpenReceive = (po) => {
    setReceivingPo(po);
    const items = (po.items || []).map((item) => ({
      purchaseOrderItemId: item.id,
      productSku: item.productSku,
      productName: item.productName,
      orderedQuantity: item.orderedQuantity,
      alreadyReceived: item.receivedQuantity || 0,
      remaining: item.orderedQuantity - (item.receivedQuantity || 0),
      receivedQuantity: Math.max(0, item.orderedQuantity - (item.receivedQuantity || 0)),
    }));
    setReceiveItems(items);
    setReceiveNotes('');
    setShowReceiveModal(true);
  };

  // Submit Goods Receiving
  const handleSubmitReceiving = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const payload = {
        warehouseId: receivingPo.destinationWarehouseId,
        notes: receiveNotes,
        items: receiveItems
          .filter((i) => i.receivedQuantity > 0)
          .map((i) => ({
            purchaseOrderItemId: i.purchaseOrderItemId,
            receivedQuantity: parseInt(i.receivedQuantity, 10),
            acceptedQuantity: parseInt(i.receivedQuantity, 10),
            rejectedQuantity: 0,
          })),
      };

      if (payload.items.length === 0) {
        throw new Error('Please specify at least 1 unit to receive');
      }

      const res = await fetch(`/api/v1/purchase-orders/${receivingPo.id}/receive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Receiving failed');

      setSuccessMsg(`Goods received! GRN: ${json.data.receiptNumber}`);
      setShowReceiveModal(false);
      setReceivingPo(null);
      fetchPOs();
      if (subTab === 'receipts') fetchReceipts();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="p-6 bg-[#051124] text-white min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Supplier & Procurement Management</h1>
          <p className="text-sm text-gray-400">Manage vendor catalogs, purchase orders, approval gates, and atomic goods receiving.</p>
        </div>
        <div className="flex gap-2">
          {subTab === 'suppliers' && (
            <button
              onClick={() => {
                setSelectedSupplier(null);
                setSupplierForm({
                  code: '',
                  name: '',
                  displayName: '',
                  contactName: '',
                  email: '',
                  phone: '',
                  paymentTerms: 'NET30',
                  currency: 'THB',
                  leadTimeDays: 7,
                  notes: '',
                });
                setShowSupplierModal(true);
              }}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded text-sm font-semibold transition"
            >
              + New Supplier
            </button>
          )}
          {subTab === 'pos' && (
            <button
              onClick={() => {
                setPoForm({
                  supplierId: suppliers[0]?.id || '',
                  destinationWarehouseId: warehouses[0]?.id || '',
                  notes: '',
                  items: [{ productId: products[0]?.id || '', orderedQuantity: 10, unitCost: 100 }],
                });
                setShowCreatePoModal(true);
              }}
              className="bg-[#ea580c] hover:bg-[#c2410c] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-orange-950/20 transition"
            >
              + Create Draft PO
            </button>
          )}
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded mb-4 text-sm flex justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="font-bold">✕</button>
        </div>
      )}
      {successMsg && (
        <div className="bg-emerald-900/50 border border-emerald-500 text-emerald-200 p-4 rounded mb-4 text-sm flex justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg('')} className="font-bold">✕</button>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-[#0c3175] mb-6">
        <button
          onClick={() => setSubTab('pos')}
          className={`px-6 py-3 font-semibold text-sm transition border-b-2 ${
            subTab === 'pos' ? 'border-blue-500 text-blue-400 bg-[#0c3175]/50' : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          📦 Purchase Orders (ใบสั่งซื้อ)
        </button>
        <button
          onClick={() => setSubTab('suppliers')}
          className={`px-6 py-3 font-semibold text-sm transition border-b-2 ${
            subTab === 'suppliers' ? 'border-blue-500 text-blue-400 bg-[#0c3175]/50' : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          🏭 Suppliers & Vendors (ผู้จัดจำหน่าย)
        </button>
        <button
          onClick={() => setSubTab('receipts')}
          className={`px-6 py-3 font-semibold text-sm transition border-b-2 ${
            subTab === 'receipts' ? 'border-blue-500 text-blue-400 bg-[#0c3175]/50' : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          📥 Goods Receipts (ประวัติการรับสินค้า)
        </button>
      </div>

      {/* ----------------- TAB 1: PURCHASE ORDERS ----------------- */}
      {subTab === 'pos' && (
        <div>
          {/* Filter Bar */}
          <div className="flex flex-wrap gap-4 mb-6 bg-[#0c3175] p-4 rounded-lg items-center">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Search PO number (e.g. PO-20260910-00001)..."
                value={poSearch}
                onChange={(e) => setPoSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchPOs()}
                className="w-full bg-[#051124]/50 border border-[#051124] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <select
                value={poStatusFilter}
                onChange={(e) => setPoStatusFilter(e.target.value)}
                className="bg-[#051124]/50 border border-[#051124] rounded px-3 py-2 text-sm text-white focus:outline-none"
              >
                <option value="">All Statuses (ทั้งหมด)</option>
                <option value="DRAFT">DRAFT (แบบร่าง)</option>
                <option value="PENDING_APPROVAL">PENDING_APPROVAL (รออนุมัติ)</option>
                <option value="APPROVED">APPROVED (อนุมัติแล้ว)</option>
                <option value="SENT">SENT (ส่งให้ผู้ขายแล้ว)</option>
                <option value="PARTIALLY_RECEIVED">PARTIALLY_RECEIVED (รับบางส่วน)</option>
                <option value="RECEIVED">RECEIVED (รับครบแล้ว)</option>
                <option value="CANCELLED">CANCELLED (ยกเลิก)</option>
              </select>
            </div>
            <button onClick={fetchPOs} className="bg-[#051124]/50 hover:bg-[#0c3175] px-4 py-2 rounded text-sm font-semibold">
              Filter
            </button>
          </div>

          {/* PO Table */}
          <div className="bg-[#0c3175] rounded-lg overflow-hidden border border-[#0c3175]">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#051124]/60 text-gray-300 font-semibold border-b border-[#0c3175]">
                <tr>
                  <th className="p-4">PO Number</th>
                  <th className="p-4">Supplier</th>
                  <th className="p-4">Destination</th>
                  <th className="p-4">Total (THB)</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Created Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {pos.map((po) => (
                  <tr key={po.id} className="hover:bg-[#051124]/50/50 transition">
                    <td className="p-4 font-mono font-bold text-blue-400">{po.poNumber}</td>
                    <td className="p-4">{po.supplier?.name}</td>
                    <td className="p-4">{po.destinationWarehouse?.name}</td>
                    <td className="p-4 font-semibold text-emerald-400">฿{parseFloat(po.grandTotal).toLocaleString()}</td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded text-xs font-bold ${
                          po.status === 'RECEIVED'
                            ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-500'
                            : po.status === 'PARTIALLY_RECEIVED'
                            ? 'bg-amber-900/80 text-amber-300 border border-amber-500'
                            : po.status === 'SENT'
                            ? 'bg-blue-900/80 text-blue-300 border border-blue-500'
                            : po.status === 'APPROVED'
                            ? 'bg-indigo-900/80 text-indigo-300 border border-indigo-500'
                            : po.status === 'PENDING_APPROVAL'
                            ? 'bg-purple-900/80 text-purple-300 border border-purple-500'
                            : po.status === 'CANCELLED'
                            ? 'bg-red-900/80 text-red-300 border border-red-500'
                            : 'bg-[#051124]/50 text-gray-300'
                        }`}
                      >
                        {po.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-400">{new Date(po.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={async () => {
                          const res = await fetch(`/api/v1/purchase-orders/${po.id}`);
                          const json = await res.json();
                          if (res.ok) setSelectedPo(json.data);
                        }}
                        className="bg-[#051124]/50 hover:bg-[#0c3175] px-3 py-1 rounded text-xs"
                      >
                        View
                      </button>

                      {po.status === 'DRAFT' && (
                        <button
                          onClick={() => handlePoAction(po.id, 'submit')}
                          className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1 rounded text-xs font-semibold"
                        >
                          Submit
                        </button>
                      )}

                      {po.status === 'PENDING_APPROVAL' && (
                        <>
                          <button
                            onClick={() => handlePoAction(po.id, 'approve')}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded text-xs font-semibold"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              const reason = prompt('Enter rejection reason:');
                              if (reason) handlePoAction(po.id, 'reject', { reason });
                            }}
                            className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-xs font-semibold"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {po.status === 'APPROVED' && (
                        <button
                          onClick={() => handlePoAction(po.id, 'send')}
                          className="bg-[#0c3175] hover:bg-[#0c3175] text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                        >
                          Send to Supplier
                        </button>
                      )}

                      {(po.status === 'SENT' || po.status === 'PARTIALLY_RECEIVED') && (
                        <button
                          onClick={async () => {
                            const res = await fetch(`/api/v1/purchase-orders/${po.id}`);
                            const json = await res.json();
                            if (res.ok) handleOpenReceive(json.data);
                          }}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded text-xs font-bold animate-pulse"
                        >
                          📥 Receive Goods
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {pos.length === 0 && (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-gray-500">
                      No purchase orders found. Click "+ Create Draft PO" to draft a new procurement order.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ----------------- TAB 2: SUPPLIERS ----------------- */}
      {subTab === 'suppliers' && (
        <div>
          <div className="bg-[#0c3175] rounded-lg overflow-hidden border border-[#0c3175]">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#051124]/60 text-gray-300 font-semibold border-b border-[#0c3175]">
                <tr>
                  <th className="p-4">Code</th>
                  <th className="p-4">Supplier Name</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Payment Terms</th>
                  <th className="p-4">Lead Time</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {suppliers.map((sup) => (
                  <tr key={sup.id} className="hover:bg-[#051124]/50/50 transition">
                    <td className="p-4 font-mono font-bold text-blue-400">{sup.code}</td>
                    <td className="p-4 font-semibold">{sup.name}</td>
                    <td className="p-4 text-gray-300">
                      {sup.contactName && <div>{sup.contactName}</div>}
                      {sup.email && <div className="text-xs text-gray-400">{sup.email}</div>}
                    </td>
                    <td className="p-4">{sup.paymentTerms}</td>
                    <td className="p-4">{sup.leadTimeDays} days</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-xs ${sup.isActive ? 'bg-emerald-900 text-emerald-300' : 'bg-red-900 text-red-300'}`}>
                        {sup.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setSelectedSupplier(sup);
                          setSupplierForm({
                            code: sup.code,
                            name: sup.name,
                            displayName: sup.displayName || '',
                            contactName: sup.contactName || '',
                            email: sup.email || '',
                            phone: sup.phone || '',
                            paymentTerms: sup.paymentTerms || 'NET30',
                            currency: sup.currency || 'THB',
                            leadTimeDays: sup.leadTimeDays || 7,
                            notes: sup.notes || '',
                          });
                          setShowSupplierModal(true);
                        }}
                        className="bg-[#051124]/50 hover:bg-[#0c3175] px-3 py-1 rounded text-xs"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ----------------- TAB 3: GOODS RECEIPTS ----------------- */}
      {subTab === 'receipts' && (
        <div className="bg-[#0c3175] rounded-lg overflow-hidden border border-[#0c3175]">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#051124]/60 text-gray-300 font-semibold border-b border-[#0c3175]">
              <tr>
                <th className="p-4">GRN Number</th>
                <th className="p-4">PO Reference</th>
                <th className="p-4">Warehouse</th>
                <th className="p-4">Received By</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {receipts.map((grn) => (
                <tr key={grn.id} className="hover:bg-[#051124]/50/50 transition">
                  <td className="p-4 font-mono font-bold text-emerald-400">{grn.receiptNumber}</td>
                  <td className="p-4 font-mono text-blue-400">{grn.purchaseOrder?.poNumber}</td>
                  <td className="p-4">{grn.warehouse?.name}</td>
                  <td className="p-4">{grn.receivedByUser?.displayName || grn.receivedByUser?.email || 'Staff'}</td>
                  <td className="p-4 text-gray-400">{new Date(grn.receivedAt).toLocaleString()}</td>
                  <td className="p-4">
                    <span className="bg-emerald-900/80 text-emerald-300 px-2 py-0.5 rounded text-xs font-bold border border-emerald-500">
                      {grn.status}
                    </span>
                  </td>
                </tr>
              ))}
              {receipts.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">
                    No goods receipt notes recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ----------------- MODAL: CREATE DRAFT PO ----------------- */}
      {showCreatePoModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0c3175] border border-[#0c3175] rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Create Draft Purchase Order</h2>
              <button onClick={() => setShowCreatePoModal(false)} className="text-gray-400 hover:text-white font-bold">✕</button>
            </div>
            <form onSubmit={handleCreatePO} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Supplier *</label>
                  <select
                    value={poForm.supplierId}
                    onChange={(e) => setPoForm({ ...poForm, supplierId: e.target.value })}
                    className="w-full bg-[#051124]/50 border border-[#051124] rounded p-2 text-sm text-white"
                    required
                  >
                    <option value="">-- Select Supplier --</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Destination Warehouse *</label>
                  <select
                    value={poForm.destinationWarehouseId}
                    onChange={(e) => setPoForm({ ...poForm, destinationWarehouseId: e.target.value })}
                    className="w-full bg-[#051124]/50 border border-[#051124] rounded p-2 text-sm text-white"
                    required
                  >
                    <option value="">-- Select Warehouse --</option>
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>{w.name} ({w.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2">Line Items (รายการสินค้า)</label>
                {poForm.items.map((item, idx) => (
                  <div key={idx} className="flex gap-2 mb-2 items-center bg-[#051124]/40 p-2 rounded">
                    <select
                      value={item.productId}
                      onChange={(e) => {
                        const newItems = [...poForm.items];
                        newItems[idx].productId = e.target.value;
                        setPoForm({ ...poForm, items: newItems });
                      }}
                      className="flex-1 bg-[#051124]/50 border border-[#051124] rounded p-1.5 text-xs text-white"
                      required
                    >
                      <option value="">-- Select Product --</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={item.orderedQuantity}
                      onChange={(e) => {
                        const newItems = [...poForm.items];
                        newItems[idx].orderedQuantity = parseInt(e.target.value, 10) || 1;
                        setPoForm({ ...poForm, items: newItems });
                      }}
                      className="w-20 bg-[#051124]/50 border border-[#051124] rounded p-1.5 text-xs text-white"
                      required
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Unit Cost"
                      value={item.unitCost}
                      onChange={(e) => {
                        const newItems = [...poForm.items];
                        newItems[idx].unitCost = parseFloat(e.target.value) || 0;
                        setPoForm({ ...poForm, items: newItems });
                      }}
                      className="w-24 bg-[#051124]/50 border border-[#051124] rounded p-1.5 text-xs text-white"
                      required
                    />
                    {poForm.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setPoForm({ ...poForm, items: poForm.items.filter((_, i) => i !== idx) })}
                        className="text-red-400 hover:text-red-300 font-bold px-2"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setPoForm({ ...poForm, items: [...poForm.items, { productId: products[0]?.id || '', orderedQuantity: 5, unitCost: 100 }] })}
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
                >
                  + Add Line Item
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Notes / Instructions</label>
                <textarea
                  value={poForm.notes}
                  onChange={(e) => setPoForm({ ...poForm, notes: e.target.value })}
                  className="w-full bg-[#051124]/50 border border-[#051124] rounded p-2 text-sm text-white"
                  rows="2"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#0c3175]">
                <button
                  type="button"
                  onClick={() => setShowCreatePoModal(false)}
                  className="px-4 py-2 bg-[#051124]/50 hover:bg-[#0c3175] rounded text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#ea580c] hover:bg-[#c2410c] text-white rounded-xl text-xs font-bold shadow-md shadow-orange-950/20"
                >
                  Save Draft PO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------- MODAL: RECEIVE GOODS ----------------- */}
      {showReceiveModal && receivingPo && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0c3175] border border-[#0c3175] rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-bold text-emerald-400">Receive Goods: {receivingPo.poNumber}</h2>
                <p className="text-xs text-gray-400">Supplier: {receivingPo.supplier?.name} | Destination: {receivingPo.destinationWarehouse?.name}</p>
              </div>
              <button onClick={() => setShowReceiveModal(false)} className="text-gray-400 hover:text-white font-bold">✕</button>
            </div>
            <form onSubmit={handleSubmitReceiving} className="space-y-4">
              <div className="bg-[#051124]/40 p-3 rounded">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="text-gray-400 border-b border-[#0c3175] pb-1">
                      <th className="pb-2">SKU / Item</th>
                      <th className="pb-2 text-center">Ordered</th>
                      <th className="pb-2 text-center">Received</th>
                      <th className="pb-2 text-center">Remaining</th>
                      <th className="pb-2 text-right">Receive Now</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/50">
                    {receiveItems.map((item, idx) => (
                      <tr key={item.purchaseOrderItemId}>
                        <td className="py-2">
                          <div className="font-semibold text-white">{item.productName}</div>
                          <div className="text-gray-400 font-mono">{item.productSku}</div>
                        </td>
                        <td className="py-2 text-center">{item.orderedQuantity}</td>
                        <td className="py-2 text-center text-gray-400">{item.alreadyReceived}</td>
                        <td className="py-2 text-center font-bold text-amber-400">{item.remaining}</td>
                        <td className="py-2 text-right">
                          <input
                            type="number"
                            min="0"
                            max={item.remaining}
                            value={item.receivedQuantity}
                            onChange={(e) => {
                              const newItems = [...receiveItems];
                              newItems[idx].receivedQuantity = parseInt(e.target.value, 10) || 0;
                              setReceiveItems(newItems);
                            }}
                            className="w-20 bg-[#051124]/50 border border-[#051124] rounded p-1 text-right text-xs text-white"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Receipt Notes / Packing Slip No.</label>
                <input
                  type="text"
                  placeholder="e.g. Inbound shipment inspection verified by warehouse staff"
                  value={receiveNotes}
                  onChange={(e) => setReceiveNotes(e.target.value)}
                  className="w-full bg-[#051124]/50 border border-[#051124] rounded p-2 text-sm text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#0c3175]">
                <button
                  type="button"
                  onClick={() => setShowReceiveModal(false)}
                  className="px-4 py-2 bg-[#051124]/50 hover:bg-[#0c3175] rounded text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded text-sm font-bold"
                >
                  Confirm Goods Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------- MODAL: CREATE / EDIT SUPPLIER ----------------- */}
      {showSupplierModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0c3175] border border-[#0c3175] rounded-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{selectedSupplier ? 'Edit Supplier' : 'Add New Supplier'}</h2>
              <button onClick={() => setShowSupplierModal(false)} className="text-gray-400 hover:text-white font-bold">✕</button>
            </div>
            <form onSubmit={handleSaveSupplier} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Supplier Code *</label>
                  <input
                    type="text"
                    value={supplierForm.code}
                    onChange={(e) => setSupplierForm({ ...supplierForm, code: e.target.value })}
                    className="w-full bg-[#051124]/50 border border-[#051124] rounded p-2 text-sm text-white font-mono"
                    placeholder="SUP-BOSCH-01"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Supplier Legal Name *</label>
                  <input
                    type="text"
                    value={supplierForm.name}
                    onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                    className="w-full bg-[#051124]/50 border border-[#051124] rounded p-2 text-sm text-white"
                    placeholder="Bosch Automotive Thailand"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={supplierForm.contactName}
                    onChange={(e) => setSupplierForm({ ...supplierForm, contactName: e.target.value })}
                    className="w-full bg-[#051124]/50 border border-[#051124] rounded p-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Email</label>
                  <input
                    type="email"
                    value={supplierForm.email}
                    onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
                    className="w-full bg-[#051124]/50 border border-[#051124] rounded p-2 text-sm text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Payment Terms</label>
                  <select
                    value={supplierForm.paymentTerms}
                    onChange={(e) => setSupplierForm({ ...supplierForm, paymentTerms: e.target.value })}
                    className="w-full bg-[#051124]/50 border border-[#051124] rounded p-2 text-sm text-white"
                  >
                    <option value="NET30">NET 30</option>
                    <option value="NET60">NET 60</option>
                    <option value="COD">Cash on Delivery (COD)</option>
                    <option value="ADVANCE">Advance Payment</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Lead Time (Days)</label>
                  <input
                    type="number"
                    min="1"
                    value={supplierForm.leadTimeDays}
                    onChange={(e) => setSupplierForm({ ...supplierForm, leadTimeDays: parseInt(e.target.value, 10) || 7 })}
                    className="w-full bg-[#051124]/50 border border-[#051124] rounded p-2 text-sm text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#0c3175]">
                <button
                  type="button"
                  onClick={() => setShowSupplierModal(false)}
                  className="px-4 py-2 bg-[#051124]/50 hover:bg-[#0c3175] rounded text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded text-sm font-semibold"
                >
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
