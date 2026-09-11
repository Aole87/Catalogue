import React, { useEffect, useState } from 'react';
import ApiClient from '../utils/ApiClient';
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  ArrowRight,
  ChevronRight,
  RotateCcw,
  RefreshCw,
  ExternalLink,
  MapPin,
  CreditCard,
  Copy,
  Check,
  Eye,
} from 'lucide-react';

export default function MyOrders({ onNavigate }) {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedTimeline, setSelectedTimeline] = useState([]);
  const [loadingTimeline, setLoadingTimeline] = useState(false);

  // Modals state
  const [cancelModalOrder, setCancelModalOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  const [returnModalOrder, setReturnModalOrder] = useState(null);
  const [returnReason, setReturnReason] = useState('');
  const [isReturning, setIsReturning] = useState(false);

  const [copiedTracking, setCopiedTracking] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const fetchOrders = async (page = 1) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const params = { page, limit: 10 };
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (searchQuery.trim()) params.q = searchQuery.trim();

      const res = await ApiClient.getMyOrders(params);
      if (res?.data) {
        setOrders(res.data);
        setPagination(res.pagination || { page: 1, limit: 10, total: res.data.length, totalPages: 1 });
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setErrorMessage(err.message || 'ไม่สามารถโหลดประวัติคำสั่งซื้อได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(1);
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOrders(1);
  };

  const openOrderDetail = async (order) => {
    setSelectedOrder(order);
    setLoadingTimeline(true);
    try {
      const timelineRes = await ApiClient.getOrderTimeline(order.id);
      setSelectedTimeline(timelineRes?.data || []);
    } catch (err) {
      console.error('Failed to fetch timeline:', err);
      setSelectedTimeline([]);
    } finally {
      setLoadingTimeline(false);
    }
  };

  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    if (!cancelModalOrder || !cancelReason.trim()) return;

    setIsCancelling(true);
    setErrorMessage(null);
    try {
      await ApiClient.cancelOrder(cancelModalOrder.id, cancelReason);
      setSuccessMessage(`ยกเลิกคำสั่งซื้อ ${cancelModalOrder.orderNumber} เรียบร้อยแล้ว`);
      setCancelModalOrder(null);
      setCancelReason('');
      if (selectedOrder?.id === cancelModalOrder.id) {
        const refreshed = await ApiClient.getOrderById(cancelModalOrder.id);
        setSelectedOrder(refreshed.data);
      }
      fetchOrders(pagination.page);
    } catch (err) {
      console.error('Cancellation failed:', err);
      setErrorMessage(err.message || 'ไม่สามารถยกเลิกคำสั่งซื้อได้');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    if (!returnModalOrder || !returnReason.trim()) return;

    setIsReturning(true);
    setErrorMessage(null);
    try {
      await ApiClient.requestOrderReturn(returnModalOrder.id, returnReason);
      setSuccessMessage(`ส่งคำขอคืนสินค้าสำหรับคำสั่งซื้อ ${returnModalOrder.orderNumber} เรียบร้อยแล้ว`);
      setReturnModalOrder(null);
      setReturnReason('');
      if (selectedOrder?.id === returnModalOrder.id) {
        const refreshed = await ApiClient.getOrderById(returnModalOrder.id);
        setSelectedOrder(refreshed.data);
      }
      fetchOrders(pagination.page);
    } catch (err) {
      console.error('Return request failed:', err);
      setErrorMessage(err.message || 'ไม่สามารถส่งคำขอคืนสินค้าได้');
    } finally {
      setIsReturning(false);
    }
  };

  const formatTHB = (val) => {
    return Number(val || 0).toLocaleString('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING_PAYMENT':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 border border-amber-200">
            <Clock className="h-3 w-3 animate-pulse" />
            รอชำระเงิน
          </span>
        );
      case 'PAYMENT_CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-3 w-3" />
            ชำระเงินแล้ว
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 border border-blue-200">
            <Package className="h-3 w-3" />
            กำลังเตรียมสินค้า
          </span>
        );
      case 'READY_FOR_SHIPMENT':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700 border border-indigo-200">
            <Truck className="h-3 w-3" />
            พร้อมจัดส่ง
          </span>
        );
      case 'SHIPPED':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-2.5 py-1 text-xs font-bold text-sky-700 border border-sky-200">
            <Truck className="h-3 w-3" />
            กำลังจัดส่ง
          </span>
        );
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-3 w-3" />
            จัดส่งสำเร็จ
          </span>
        );
      case 'RETURN_REQUESTED':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-2.5 py-1 text-xs font-bold text-purple-700 border border-purple-200">
            <RotateCcw className="h-3 w-3" />
            ขอคืนสินค้า
          </span>
        );
      case 'RETURNED':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-2.5 py-1 text-xs font-bold text-purple-700 border border-purple-200">
            <RotateCcw className="h-3 w-3" />
            คืนสินค้าแล้ว
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 border border-rose-200">
            <XCircle className="h-3 w-3" />
            ยกเลิกแล้ว
          </span>
        );
      case 'REFUNDED':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-2.5 py-1 text-xs font-bold text-purple-700 border border-purple-200">
            <RefreshCw className="h-3 w-3" />
            คืนเงินแล้ว
          </span>
        );
      default:
        return (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
            {status}
          </span>
        );
    }
  };

  const isCancellable = (order) => {
    const cancellableStatuses = ['PENDING_PAYMENT', 'PAYMENT_CONFIRMED', 'PROCESSING'];
    if (!cancellableStatuses.includes(order.status)) return false;
    const shipments = order.shipments || [];
    const hasDispatched = shipments.some((s) =>
      ['SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(s.status)
    );
    return !hasDispatched;
  };

  const isReturnable = (order) => {
    return order.status === 'DELIVERED';
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <Package className="h-8 w-8 text-blue-600" />
              ประวัติคำสั่งซื้อของฉัน (My Orders)
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              ตรวจสอบสถานะคำสั่งซื้อ ติดตามพัสดุ และจัดการคำสั่งซื้อทั้งหมดของคุณ
            </p>
          </div>

          <button
            onClick={() => (onNavigate ? onNavigate('products') : (window.location.hash = '#products'))}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition-colors self-start sm:self-auto cursor-pointer"
          >
            <span>เลือกซื้อสินค้าต่อ</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Alerts */}
        {successMessage && (
          <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-semibold text-emerald-800 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
            <button onClick={() => setSuccessMessage(null)} className="text-emerald-500 hover:text-emerald-700">
              ✕
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs font-semibold text-rose-800 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
            <button onClick={() => setErrorMessage(null)} className="text-rose-500 hover:text-rose-700">
              ✕
            </button>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Status Pills */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {[
                { id: 'ALL', label: 'ทั้งหมด' },
                { id: 'PENDING_PAYMENT', label: 'รอชำระ' },
                { id: 'PAYMENT_CONFIRMED', label: 'ชำระแล้ว' },
                { id: 'PROCESSING', label: 'เตรียมสินค้า' },
                { id: 'SHIPPED', label: 'จัดส่งแล้ว' },
                { id: 'DELIVERED', label: 'สำเร็จ' },
                { id: 'CANCELLED', label: 'ยกเลิก' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                    statusFilter === tab.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="ค้นหาเลขที่คำสั่งซื้อ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
              <button
                type="submit"
                className="rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                ค้นหา
              </button>
            </form>
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="min-h-[40vh] flex flex-col items-center justify-center text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mb-4" />
            <p className="text-xs font-medium text-slate-600">กำลังโหลดรายการคำสั่งซื้อ...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <Package className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 mb-1">ไม่พบคำสั่งซื้อ</h3>
            <p className="text-xs text-slate-500 mb-6">คุณยังไม่มีรายการคำสั่งซื้อในสถานะที่เลือก</p>
            <button
              onClick={() => (onNavigate ? onNavigate('products') : (window.location.hash = '#products'))}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition-colors cursor-pointer"
            >
              เลือกซื้ออะไหล่รถยนต์
            </button>
          </div>
        ) : (
          <div className="space-y-4 mb-8">
            {orders.map((order) => {
              const items = order.items || [];
              const shipments = order.shipments || [];
              const firstShipment = shipments[0];

              return (
                <div
                  key={order.id}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:border-slate-300 transition-all space-y-4"
                >
                  {/* Order Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 font-mono font-bold text-xs">
                        ORD
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-extrabold text-slate-900">
                            {order.orderNumber}
                          </span>
                          {getStatusBadge(order.status)}
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">
                          วันที่สั่งซื้อ: {new Date(order.createdAt).toLocaleString('th-TH')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 sm:self-center">
                      <div className="text-right">
                        <span className="text-[11px] text-slate-400 block">ยอดสุทธิ</span>
                        <span className="font-mono text-base font-extrabold text-blue-600">
                          ฿{formatTHB(order.grandTotal)}
                        </span>
                      </div>

                      <button
                        onClick={() => openOrderDetail(order)}
                        className="inline-flex items-center gap-1 rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>รายละเอียด</span>
                      </button>
                    </div>
                  </div>

                  {/* Items Preview */}
                  <div className="divide-y divide-slate-100">
                    {items.slice(0, 2).map((item) => (
                      <div key={item.id} className="py-2.5 flex items-center justify-between gap-4 text-xs">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-slate-50 border border-slate-200 p-1 flex items-center justify-center">
                            {item.productSnapshot?.primaryImage ? (
                              <img
                                src={item.productSnapshot.primaryImage}
                                alt={item.productName}
                                className="h-full w-full object-contain"
                              />
                            ) : (
                              <Package className="h-5 w-5 text-slate-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="font-semibold text-slate-800 truncate block">
                              {item.productName}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              SKU: {item.sku} × {item.quantity} ชิ้น
                            </span>
                          </div>
                        </div>

                        <span className="font-mono font-bold text-slate-900 flex-shrink-0">
                          ฿{formatTHB(item.lineTotal)}
                        </span>
                      </div>
                    ))}

                    {items.length > 2 && (
                      <div className="pt-2 text-[11px] text-slate-400 text-center">
                        และอีก {items.length - 2} รายการ...
                      </div>
                    )}
                  </div>

                  {/* Shipment Tracking Info (if available) */}
                  {firstShipment && (
                    <div className="rounded-2xl bg-slate-50 p-3 border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-blue-600" />
                        <span className="font-semibold text-slate-800">
                          {firstShipment.carrier || 'การจัดส่ง'}:
                        </span>
                        {firstShipment.trackingNumber ? (
                          <span className="font-mono font-bold text-blue-600">
                            {firstShipment.trackingNumber}
                          </span>
                        ) : (
                          <span className="text-slate-400">(กำลังเตรียมพัสดุ)</span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 font-bold">
                        สถานะพัสดุ: {firstShipment.status}
                      </span>
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      {order.status === 'PENDING_PAYMENT' && (
                        <button
                          onClick={() => {
                            if (onNavigate) {
                              onNavigate('order-confirmation', { orderNumber: order.orderNumber, initialOrder: order });
                            }
                          }}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition-colors cursor-pointer"
                        >
                          <CreditCard className="h-3.5 w-3.5" />
                          <span>ชำระเงินทันที</span>
                        </button>
                      )}

                      {isCancellable(order) && (
                        <button
                          onClick={() => {
                            setCancelModalOrder(order);
                            setCancelReason('');
                          }}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          <span>ยกเลิกคำสั่งซื้อ</span>
                        </button>
                      )}

                      {isReturnable(order) && (
                        <button
                          onClick={() => {
                            setReturnModalOrder(order);
                            setReturnReason('');
                          }}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-bold text-purple-700 hover:bg-purple-100 transition-colors cursor-pointer"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          <span>ขอคืนสินค้า</span>
                        </button>
                      )}
                    </div>

                    <span className="text-[11px] text-slate-400 font-mono">
                      {items.length} รายการสินค้า
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mb-12">
            <button
              disabled={pagination.page <= 1}
              onClick={() => fetchOrders(pagination.page - 1)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors cursor-pointer"
            >
              ย้อนกลับ
            </button>
            <span className="text-xs font-mono text-slate-500">
              หน้า {pagination.page} / {pagination.totalPages}
            </span>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchOrders(pagination.page + 1)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors cursor-pointer"
            >
              ถัดไป
            </button>
          </div>
        )}

        {/* Order Detail Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm overflow-y-auto">
            <div className="relative w-full max-w-3xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span>คำสั่งซื้อ: {selectedOrder.orderNumber}</span>
                    {getStatusBadge(selectedOrder.status)}
                  </h2>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    สั่งซื้อเมื่อ: {new Date(selectedOrder.createdAt).toLocaleString('th-TH')}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  รายการอะไหล่ในคำสั่งซื้อ ({selectedOrder.items?.length || 0})
                </h3>
                <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 p-4 bg-slate-50">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="py-2.5 flex items-center justify-between gap-4 text-xs">
                      <div>
                        <span className="font-semibold text-slate-900 block">{item.productName}</span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          SKU: {item.sku} | ฿{formatTHB(item.unitPrice)} × {item.quantity}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-slate-900">
                        ฿{formatTHB(item.lineTotal)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing Totals */}
              <div className="border-t border-slate-200 pt-4 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>ยอดรวมสินค้า (Subtotal)</span>
                  <span className="font-mono">฿{formatTHB(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>ค่าจัดส่ง (Shipping)</span>
                  <span className="font-mono">฿{formatTHB(selectedOrder.shippingTotal)}</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                  <span>ยอดสุทธิ (Grand Total)</span>
                  <span className="font-mono text-xl text-blue-600">
                    ฿{formatTHB(selectedOrder.grandTotal)}
                  </span>
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-blue-600" />
                  ไทม์ไลน์สถานะคำสั่งซื้อ (Order Timeline)
                </h3>
                {loadingTimeline ? (
                  <div className="py-4 text-center text-xs text-slate-400">กำลังโหลดไทม์ไลน์...</div>
                ) : selectedTimeline.length === 0 ? (
                  <div className="py-2 text-xs text-slate-400">ยังไม่มีบันทึกไทม์ไลน์</div>
                ) : (
                  <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 p-4 bg-slate-50 space-y-2">
                    {selectedTimeline.map((item, idx) => (
                      <div key={idx} className="pt-2 flex items-start justify-between gap-4 text-xs">
                        <div>
                          <span className="font-semibold text-slate-900 block">{item.title}</span>
                          {item.description && (
                            <span className="text-[11px] text-slate-500 block mt-0.5">{item.description}</span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono flex-shrink-0">
                          {new Date(item.occurredAt).toLocaleString('th-TH')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Close Button */}
              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cancel Modal */}
        {cancelModalOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <XCircle className="h-5 w-5 text-rose-600" />
                ยืนยันการยกเลิกคำสั่งซื้อ
              </h3>
              <p className="text-xs text-slate-500">
                คุณต้องการยกเลิกคำสั่งซื้อ <span className="font-mono font-bold text-slate-900">{cancelModalOrder.orderNumber}</span> หรือไม่?
              </p>

              <form onSubmit={handleCancelSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    เหตุผลในการยกเลิก <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="เช่น สั่งซื้อผิดรุ่น, ต้องการเปลี่ยนที่อยู่จัดส่ง..."
                    required
                    className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setCancelModalOrder(null)}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={isCancelling || !cancelReason.trim()}
                    className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-50 cursor-pointer transition-colors"
                  >
                    {isCancelling ? 'กำลังยกเลิก...' : 'ยืนยันการยกเลิกคำสั่งซื้อ'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Return Modal */}
        {returnModalOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <RotateCcw className="h-5 w-5 text-purple-600" />
                ส่งคำขอคืนสินค้า (Return Request)
              </h3>
              <p className="text-xs text-slate-500">
                สำหรับคำสั่งซื้อ <span className="font-mono font-bold text-slate-900">{returnModalOrder.orderNumber}</span>
              </p>

              <form onSubmit={handleReturnSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    เหตุผลและรายละเอียดการขอคืนสินค้า <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    placeholder="เช่น อะไหล่ไม่ตรงรุ่น, สินค้ามีตำหนิจากการขนส่ง..."
                    required
                    className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setReturnModalOrder(null)}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={isReturning || !returnReason.trim()}
                    className="rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-700 disabled:opacity-50 cursor-pointer transition-colors"
                  >
                    {isReturning ? 'กำลังส่งคำขอ...' : 'ส่งคำขอคืนสินค้า'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
