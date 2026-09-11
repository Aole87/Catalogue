import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, Filter, RefreshCw, Eye, AlertCircle, CheckCircle, Clock, Truck,
  DollarSign, Package, X, ChevronLeft, ChevronRight, FileText, Check, ShieldAlert,
  ArrowRight, CornerDownLeft, RotateCcw, Building2, User, Phone, Mail, Calendar
} from 'lucide-react';
import ApiClient from '../../utils/apiClient';

const STATUS_CONFIG = {
  PENDING_PAYMENT: { label: 'รอชำระเงิน', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  PAYMENT_CONFIRMED: { label: 'ชำระเงินแล้ว', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  PROCESSING: { label: 'กำลังเตรียมจัดส่ง', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  READY_FOR_SHIPMENT: { label: 'พร้อมจัดส่ง', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  SHIPPED: { label: 'จัดส่งแล้ว', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  DELIVERED: { label: 'ส่งมอบสำเร็จ', bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
  CANCELLED: { label: 'ยกเลิกแล้ว', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  RETURN_REQUESTED: { label: 'ขอคืนสินค้า', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  RETURNED: { label: 'คืนสินค้าสำเร็จ', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' },
  REFUNDED: { label: 'คืนเงินสำเร็จ', bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' }
};

const PAYMENT_STATUS_CONFIG = {
  PENDING: { label: 'รอชำระ', bg: 'bg-amber-100 text-amber-800' },
  PAID: { label: 'ชำระแล้ว', bg: 'bg-emerald-100 text-emerald-800' },
  FAILED: { label: 'ไม่สำเร็จ', bg: 'bg-rose-100 text-rose-800' },
  EXPIRED: { label: 'หมดอายุ', bg: 'bg-slate-100 text-slate-700' },
  REFUNDED: { label: 'คืนเงินแล้ว', bg: 'bg-pink-100 text-pink-800' }
};

const SHIPMENT_STATUS_CONFIG = {
  PENDING: { label: 'รอดำเนินการ', bg: 'bg-amber-100 text-amber-800' },
  PROCESSING: { label: 'กำลังแพ็ค', bg: 'bg-blue-100 text-blue-800' },
  READY_FOR_PICKUP: { label: 'รอขนส่งเข้ารับ', bg: 'bg-indigo-100 text-indigo-800' },
  PICKED_UP: { label: 'ขนส่งรับพัสดุแล้ว', bg: 'bg-purple-100 text-purple-800' },
  IN_TRANSIT: { label: 'อยู่ระหว่างจัดส่ง', bg: 'bg-cyan-100 text-cyan-800' },
  OUT_FOR_DELIVERY: { label: 'กำลังนำจ่าย', bg: 'bg-sky-100 text-sky-800' },
  DELIVERED: { label: 'ส่งสำเร็จ', bg: 'bg-emerald-100 text-emerald-800' },
  FAILED: { label: 'นำส่งไม่สำเร็จ', bg: 'bg-rose-100 text-rose-800' },
  RETURNED: { label: 'ส่งคืนต้นทาง', bg: 'bg-slate-100 text-slate-800' }
};

export const OrderManager = () => {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
  const [shipmentStatusFilter, setShipmentStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Modals & Selected Order
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [returnModalOpen, setReturnModalOpen] = useState(false);

  // Form states for modals
  const [targetStatus, setTargetStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [returnAction, setReturnAction] = useState('APPROVE');
  const [returnAdminNote, setReturnAdminNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchOrders = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit: pagination.limit,
        sortBy,
        sortOrder
      };
      if (searchTerm.trim()) params.q = searchTerm.trim();
      if (statusFilter) params.status = statusFilter;
      if (paymentStatusFilter) params.paymentStatus = paymentStatusFilter;
      if (shipmentStatusFilter) params.shipmentStatus = shipmentStatusFilter;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await ApiClient.getAdminOrders(params);
      if (res && res.orders) {
        setOrders(res.orders);
        setPagination(res.pagination || { page, limit: 10, total: res.orders.length, totalPages: 1 });
      }
    } catch (err) {
      console.error('Failed to fetch admin orders:', err);
      setError(err.message || 'ไม่สามารถโหลดข้อมูลคำสั่งซื้อได้');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, paymentStatusFilter, shipmentStatusFilter, startDate, endDate, sortBy, sortOrder, pagination.limit]);

  useEffect(() => {
    fetchOrders(1);
  }, [fetchOrders]);

  const handleOpenDetail = async (orderId) => {
    try {
      const res = await ApiClient.getAdminOrderById(orderId);
      if (res && res.order) {
        setSelectedOrder(res.order);
        setDetailModalOpen(true);
      }
    } catch (err) {
      alert('ไม่สามารถโหลดรายละเอียดคำสั่งซื้อได้: ' + (err.message || 'Unknown error'));
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedOrder || !targetStatus) return;
    setActionLoading(true);
    try {
      await ApiClient.updateAdminOrderStatus(selectedOrder.id, {
        status: targetStatus,
        note: statusNote || undefined
      });
      setStatusModalOpen(false);
      setStatusNote('');
      setTargetStatus('');
      fetchOrders(pagination.page);
      if (detailModalOpen) handleOpenDetail(selectedOrder.id);
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการปรับสถานะ: ' + (err.message || 'Unknown error'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelOrder = async (e) => {
    e.preventDefault();
    if (!selectedOrder || !cancelReason.trim()) return;
    setActionLoading(true);
    try {
      await ApiClient.cancelAdminOrder(selectedOrder.id, {
        reason: cancelReason.trim()
      });
      setCancelModalOpen(false);
      setCancelReason('');
      fetchOrders(pagination.page);
      if (detailModalOpen) handleOpenDetail(selectedOrder.id);
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการยกเลิกคำสั่งซื้อ: ' + (err.message || 'Unknown error'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleReturnReview = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setActionLoading(true);
    try {
      await ApiClient.handleAdminReturnAction(selectedOrder.id, {
        action: returnAction,
        note: returnAdminNote.trim() || undefined
      });
      setReturnModalOpen(false);
      setReturnAdminNote('');
      fetchOrders(pagination.page);
      if (detailModalOpen) handleOpenDetail(selectedOrder.id);
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการประมวลผลคำขอคืนสินค้า: ' + (err.message || 'Unknown error'));
    } finally {
      setActionLoading(false);
    }
  };

  const formatPrice = (val) => {
    return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(Number(val) || 0);
  };

  const formatDate = (isoString) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Filter & Action Bar */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Search Box */}
          <div className="relative">
            <label className="block text-xs font-semibold text-slate-600 mb-1">ค้นหา</label>
            <div className="relative">
              <input
                type="text"
                placeholder="เลขคำสั่งซื้อ, อีเมล, โทร, รหัสชำระเงิน..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchOrders(1)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 pl-9 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          {/* Order Status Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">สถานะคำสั่งซื้อ</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
            >
              <option value="">ทุกสถานะ (All Statuses)</option>
              <option value="PENDING_PAYMENT">รอชำระเงิน (Pending Payment)</option>
              <option value="PAYMENT_CONFIRMED">ชำระเงินแล้ว (Payment Confirmed)</option>
              <option value="PROCESSING">กำลังเตรียมจัดส่ง (Processing)</option>
              <option value="READY_FOR_SHIPMENT">พร้อมจัดส่ง (Ready For Shipment)</option>
              <option value="SHIPPED">จัดส่งแล้ว (Shipped)</option>
              <option value="DELIVERED">ส่งมอบสำเร็จ (Delivered)</option>
              <option value="RETURN_REQUESTED">ขอคืนสินค้า (Return Requested)</option>
              <option value="RETURNED">คืนสินค้าสำเร็จ (Returned)</option>
              <option value="CANCELLED">ยกเลิกแล้ว (Cancelled)</option>
              <option value="REFUNDED">คืนเงินสำเร็จ (Refunded)</option>
            </select>
          </div>

          {/* Payment Status Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">สถานะการชำระเงิน</label>
            <select
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
            >
              <option value="">ทุกสถานะชำระเงิน (All)</option>
              <option value="PENDING">รอชำระเงิน (PENDING)</option>
              <option value="PAID">ชำระแล้ว (PAID)</option>
              <option value="FAILED">ไม่สำเร็จ (FAILED)</option>
              <option value="EXPIRED">หมดอายุ (EXPIRED)</option>
              <option value="REFUNDED">คืนเงินแล้ว (REFUNDED)</option>
            </select>
          </div>

          {/* Shipment Status Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">สถานะการจัดส่ง</label>
            <select
              value={shipmentStatusFilter}
              onChange={(e) => setShipmentStatusFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
            >
              <option value="">ทุกสถานะจัดส่ง (All)</option>
              <option value="PENDING">รอดำเนินการ (PENDING)</option>
              <option value="PROCESSING">กำลังแพ็คสินค้า (PROCESSING)</option>
              <option value="READY_FOR_PICKUP">รอขนส่งเข้ารับ (READY_FOR_PICKUP)</option>
              <option value="IN_TRANSIT">อยู่ระหว่างขนส่ง (IN_TRANSIT)</option>
              <option value="DELIVERED">ส่งสำเร็จ (DELIVERED)</option>
              <option value="FAILED">ไม่สำเร็จ (FAILED)</option>
              <option value="RETURNED">ส่งคืน (RETURNED)</option>
            </select>
          </div>
        </div>

        {/* Second row: Dates & Sorting & Submit */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">จากวันที่:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">ถึงวันที่:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">เรียงตาม:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 text-xs"
              >
                <option value="createdAt">วันที่สร้าง</option>
                <option value="totalAmount">ยอดเงินรวม</option>
                <option value="orderNumber">เลขคำสั่งซื้อ</option>
                <option value="status">สถานะ</option>
              </select>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 text-xs"
              >
                <option value="desc">ใหม่ไปเก่า (Desc)</option>
                <option value="asc">เก่าไปใหม่ (Asc)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
                setPaymentStatusFilter('');
                setShipmentStatusFilter('');
                setStartDate('');
                setEndDate('');
                setSortBy('createdAt');
                setSortOrder('desc');
              }}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium transition-colors"
            >
              รีเซ็ตตัวกรอง
            </button>
            <button
              onClick={() => fetchOrders(1)}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#0c2b2f] hover:bg-[#144349] text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>ค้นหา / รีเฟรช</span>
            </button>
          </div>
        </div>
      </div>

      {/* Orders Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-[#0c2b2f]" />
            <h3 className="font-bold text-slate-800 text-sm">รายการคำสั่งซื้อทั้งหมด ({pagination.total})</h3>
          </div>
          <div className="text-xs text-slate-500">
            แสดงหน้า {pagination.page} จาก {pagination.totalPages || 1}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border-b border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider">
                <th className="py-3.5 px-4">เลขคำสั่งซื้อ</th>
                <th className="py-3.5 px-4">วันที่</th>
                <th className="py-3.5 px-4">ลูกค้า</th>
                <th className="py-3.5 px-4">สินค้า</th>
                <th className="py-3.5 px-4 text-right">ยอดรวม</th>
                <th className="py-3.5 px-4 text-center">การชำระเงิน</th>
                <th className="py-3.5 px-4 text-center">การจัดส่ง</th>
                <th className="py-3.5 px-4 text-center">สถานะคำสั่งซื้อ</th>
                <th className="py-3.5 px-4 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                    กำลังโหลดข้อมูลคำสั่งซื้อ...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Package className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    ไม่พบข้อมูลคำสั่งซื้อตรงตามเงื่อนไข
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const statusInfo = STATUS_CONFIG[order.status] || { label: order.status, bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' };
                  const paymentStatus = order.payments?.[0]?.status || 'PENDING';
                  const pBadge = PAYMENT_STATUS_CONFIG[paymentStatus] || { label: paymentStatus, bg: 'bg-slate-100 text-slate-700' };
                  const shipmentStatus = order.shipments?.[0]?.status || 'PENDING';
                  const sBadge = SHIPMENT_STATUS_CONFIG[shipmentStatus] || { label: shipmentStatus, bg: 'bg-slate-100 text-slate-700' };

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[#0c2b2f]">
                        {order.orderNumber}
                      </td>
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">
                          {order.user?.first_name || order.user?.firstName || 'ลูกค้า'} {order.user?.last_name || order.user?.lastName || ''}
                        </div>
                        <div className="text-[11px] text-slate-400">{order.user?.email}</div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-semibold">{order.items?.length || 0} รายการ</span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900 whitespace-nowrap">
                        {formatPrice(order.totalAmount)}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${pBadge.bg}`}>
                          {pBadge.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${sBadge.bg}`}>
                          {sBadge.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenDetail(order.id)}
                            className="p-1.5 bg-[#0c2b2f]/10 text-[#0c2b2f] hover:bg-[#0c2b2f] hover:text-white rounded-lg transition-colors"
                            title="ดูรายละเอียดคำสั่งซื้อ"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {order.status !== 'CANCELLED' && order.status !== 'RETURNED' && order.status !== 'REFUNDED' && (
                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                setTargetStatus(order.status);
                                setStatusModalOpen(true);
                              }}
                              className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
                              title="เปลี่ยนสถานะคำสั่งซื้อ"
                            >
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          )}
                          {order.status === 'RETURN_REQUESTED' && (
                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                setReturnAction('APPROVE');
                                setReturnModalOpen(true);
                              }}
                              className="p-1.5 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-lg transition-colors font-bold"
                              title="พิจารณาการคืนสินค้า"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="text-xs text-slate-500">
            แสดงทั้งหมด {pagination.total} รายการ
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchOrders(pagination.page - 1)}
              disabled={pagination.page <= 1 || loading}
              className="p-1.5 border border-slate-300 rounded-lg bg-white hover:bg-slate-100 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold px-2">
              หน้า {pagination.page} / {pagination.totalPages || 1}
            </span>
            <button
              onClick={() => fetchOrders(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages || loading}
              className="p-1.5 border border-slate-300 rounded-lg bg-white hover:bg-slate-100 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {detailModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-slate-900">คำสั่งซื้อ #{selectedOrder.orderNumber}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${(STATUS_CONFIG[selectedOrder.status] || {}).bg} ${(STATUS_CONFIG[selectedOrder.status] || {}).text} ${(STATUS_CONFIG[selectedOrder.status] || {}).border}`}>
                    {(STATUS_CONFIG[selectedOrder.status] || {}).label || selectedOrder.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">สร้างเมื่อ: {formatDate(selectedOrder.createdAt)}</p>
              </div>
              <button
                onClick={() => setDetailModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 text-xs">
              {/* Customer & Shipping snapshot */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="font-bold text-slate-800 flex items-center gap-2">
                    <User className="w-4 h-4 text-[#0c2b2f]" />
                    <span>ข้อมูลลูกค้า</span>
                  </div>
                  <p className="text-slate-700 font-semibold">{selectedOrder.user?.first_name || selectedOrder.user?.firstName} {selectedOrder.user?.last_name || selectedOrder.user?.lastName}</p>
                  <p className="text-slate-500">{selectedOrder.user?.email}</p>
                  <p className="text-slate-500">{selectedOrder.user?.phone || 'ไม่ระบุเบอร์โทร'}</p>
                  <p className="text-slate-500">ประเภทธุรกิจ: <span className="font-semibold text-slate-700">{selectedOrder.user?.business_type || 'GARAGE'}</span></p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="font-bold text-slate-800 flex items-center gap-2">
                    <Truck className="w-4 h-4 text-indigo-600" />
                    <span>ที่อยู่จัดส่ง (Snapshot)</span>
                  </div>
                  <p className="text-slate-700 font-semibold">{selectedOrder.shippingAddress?.recipientName || '-'}</p>
                  <p className="text-slate-500">{selectedOrder.shippingAddress?.streetAddress || '-'}</p>
                  <p className="text-slate-500">{selectedOrder.shippingAddress?.subdistrict} {selectedOrder.shippingAddress?.district} {selectedOrder.shippingAddress?.province} {selectedOrder.shippingAddress?.postalCode}</p>
                  <p className="text-slate-500">เบอร์โทรติดต่อ: {selectedOrder.shippingAddress?.phone || '-'}</p>
                </div>
              </div>

              {/* Order Items Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <div className="bg-slate-50 px-4 py-3 font-bold text-slate-800 border-b border-slate-200 flex justify-between">
                  <span>รายการสินค้า ({selectedOrder.items?.length || 0})</span>
                  <span>ราคารวมรายการ</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-bold text-slate-400">
                          <Package className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{item.productName || item.product?.name || 'อะไหล่ยนต์'}</p>
                          <p className="text-[11px] text-slate-400">SKU: {item.sku || item.product?.sku} • {formatPrice(item.unitPrice)} x {item.quantity}</p>
                        </div>
                      </div>
                      <div className="font-bold text-slate-900 text-sm">
                        {formatPrice(item.totalPrice)}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-slate-50 p-4 border-t border-slate-200 space-y-1 text-right">
                  <div className="flex justify-between text-slate-500">
                    <span>ยอดรวมสินค้า (Subtotal):</span>
                    <span>{formatPrice(selectedOrder.subtotalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>ค่าจัดส่ง (Shipping Fee):</span>
                    <span>{formatPrice(selectedOrder.shippingAmount)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>ภาษีมูลค่าเพิ่ม 7% (VAT):</span>
                    <span>{formatPrice(selectedOrder.taxAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                    <span>ยอดชำระสุทธิ (Total Amount):</span>
                    <span className="text-[#0c2b2f]">{formatPrice(selectedOrder.totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Payment & Shipment Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="font-bold text-slate-800 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <span>ข้อมูลการชำระเงิน</span>
                  </div>
                  {selectedOrder.payments?.length > 0 ? (
                    selectedOrder.payments.map((p) => (
                      <div key={p.id} className="text-[11px] space-y-1">
                        <p>วิธีชำระ: <span className="font-semibold">{p.paymentMethod}</span></p>
                        <p>สถานะ: <span className="font-bold text-emerald-600">{p.status}</span></p>
                        <p>Payment Ref: <span className="font-mono">{p.paymentReference}</span></p>
                        <p>ชำระเมื่อ: {formatDate(p.paidAt)}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400">ยังไม่มีข้อมูลการชำระเงิน</p>
                  )}
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="font-bold text-slate-800 flex items-center gap-2">
                    <Truck className="w-4 h-4 text-purple-600" />
                    <span>ข้อมูลการจัดส่ง & พัสดุ</span>
                  </div>
                  {selectedOrder.shipments?.length > 0 ? (
                    selectedOrder.shipments.map((s) => (
                      <div key={s.id} className="text-[11px] space-y-1">
                        <p>ผู้ให้บริการ: <span className="font-semibold">{s.shippingProvider} ({s.shippingMethod})</span></p>
                        <p>เลขพัสดุ: <span className="font-mono font-bold text-indigo-600">{s.trackingNumber || 'ยังไม่ออกเลขพัสดุ'}</span></p>
                        <p>สถานะพัสดุ: <span className="font-bold">{s.status}</span></p>
                        <p>ส่งมอบเมื่อ: {formatDate(s.deliveredAt)}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400">ยังไม่มีข้อมูลพัสดุ</p>
                  )}
                </div>
              </div>

              {/* Status History / Timeline */}
              {selectedOrder.statusHistory?.length > 0 && (
                <div className="border border-slate-200 rounded-2xl p-4 space-y-3">
                  <h4 className="font-bold text-slate-800 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-600" />
                    <span>ประวัติการเปลี่ยนสถานะ (Audit History)</span>
                  </h4>
                  <div className="space-y-2">
                    {selectedOrder.statusHistory.map((hist) => (
                      <div key={hist.id} className="flex items-start justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800">{hist.fromStatus || 'INIT'}</span>
                            <ArrowRight className="w-3 h-3 text-slate-400" />
                            <span className="font-bold text-[#0c2b2f]">{hist.toStatus}</span>
                          </div>
                          {hist.reason && <p className="text-[11px] text-slate-600 mt-0.5">เหตุผล: {hist.reason}</p>}
                        </div>
                        <span className="text-[10px] text-slate-400">{formatDate(hist.createdAt)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between rounded-b-3xl">
              <button
                onClick={() => setDetailModalOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold"
              >
                ปิดหน้าต่าง
              </button>

              <div className="flex items-center gap-2">
                {selectedOrder.status !== 'CANCELLED' && selectedOrder.status !== 'RETURNED' && (
                  <button
                    onClick={() => {
                      setCancelModalOpen(true);
                    }}
                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold"
                  >
                    ยกเลิกคำสั่งซื้อ
                  </button>
                )}
                {selectedOrder.status !== 'CANCELLED' && selectedOrder.status !== 'RETURNED' && selectedOrder.status !== 'REFUNDED' && (
                  <button
                    onClick={() => {
                      setTargetStatus(selectedOrder.status);
                      setStatusModalOpen(true);
                    }}
                    className="px-4 py-2 bg-[#0c2b2f] hover:bg-[#144349] text-white rounded-xl text-xs font-bold shadow-sm"
                  >
                    อัปเดตสถานะ
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* UPDATE STATUS MODAL */}
      {statusModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleUpdateStatus} className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">เปลี่ยนสถานะคำสั่งซื้อ #{selectedOrder.orderNumber}</h3>
              <button type="button" onClick={() => setStatusModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">สถานะปัจจุบัน</label>
              <div className="px-3 py-2 bg-slate-100 rounded-xl text-xs font-bold text-slate-800">
                {selectedOrder.status}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">สถานะใหม่</label>
              <select
                value={targetStatus}
                onChange={(e) => setTargetStatus(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">-- เลือกสถานะใหม่ --</option>
                <option value="PROCESSING">PROCESSING (กำลังจัดเตรียม)</option>
                <option value="READY_FOR_SHIPMENT">READY_FOR_SHIPMENT (พร้อมส่ง)</option>
                <option value="SHIPPED">SHIPPED (จัดส่งแล้ว)</option>
                <option value="DELIVERED">DELIVERED (ส่งสำเร็จ)</option>
                <option value="CANCELLED">CANCELLED (ยกเลิก)</option>
                <option value="REFUNDED">REFUNDED (คืนเงินแล้ว)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">บันทึกช่วยจำ (Staff Note)</label>
              <textarea
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                rows={3}
                placeholder="ระบุเหตุผลหรือข้อความเพิ่มเติมสำหรับการเปลี่ยนสถานะ..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStatusModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={actionLoading || !targetStatus}
                className="px-4 py-2 bg-[#ff6b2b] hover:bg-[#e04b00] text-white rounded-xl text-xs font-bold shadow-md shadow-orange-950/20 disabled:opacity-50"
              >
                {actionLoading ? 'กำลังบันทึก...' : 'ยืนยันเปลี่ยนสถานะ'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CANCEL MODAL */}
      {cancelModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCancelOrder} className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-rose-600 text-sm flex items-center gap-2">
                <ShieldAlert className="w-5 h-5" />
                <span>ยกเลิกคำสั่งซื้อ #{selectedOrder.orderNumber}</span>
              </h3>
              <button type="button" onClick={() => setCancelModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              การยกเลิกโดยเจ้าหน้าที่จะบันทึก Audit History และหากชำระเงินแล้วจะระบุสิทธิ์ขอคืนเงินในระบบ
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">เหตุผลการยกเลิก (จำเป็น)</label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
                required
                placeholder="ระบุเหตุผล เช่น ลูกค้ายกเลิกผ่าน Call Center, สินค้าชำรุดก่อนส่ง..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                ปิด
              </button>
              <button
                type="submit"
                disabled={actionLoading || !cancelReason.trim()}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm disabled:opacity-50"
              >
                {actionLoading ? 'กำลังยกเลิก...' : 'ยืนยันการยกเลิก'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* RETURN REVIEW MODAL */}
      {returnModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleReturnReview} className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-orange-600 text-sm flex items-center gap-2">
                <RotateCcw className="w-5 h-5" />
                <span>พิจารณาคำขอคืนสินค้า #{selectedOrder.orderNumber}</span>
              </h3>
              <button type="button" onClick={() => setReturnModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">การดำเนินการ</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setReturnAction('APPROVE')}
                  className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 ${returnAction === 'APPROVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-500 ring-2 ring-emerald-500/20' : 'bg-slate-50 text-slate-600 border-slate-200'}`}
                >
                  <Check className="w-4 h-4" />
                  อนุมัติการคืน (RETURNED)
                </button>
                <button
                  type="button"
                  onClick={() => setReturnAction('REJECT')}
                  className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 ${returnAction === 'REJECT' ? 'bg-rose-50 text-rose-700 border-rose-500 ring-2 ring-rose-500/20' : 'bg-slate-50 text-slate-600 border-slate-200'}`}
                >
                  <X className="w-4 h-4" />
                  ปฏิเสธการคืน (DELIVERED)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">บันทึกของเจ้าหน้าที่ (Staff Note)</label>
              <textarea
                value={returnAdminNote}
                onChange={(e) => setReturnAdminNote(e.target.value)}
                rows={3}
                placeholder="ระบุรายละเอียดผลการตรวจสอบสินค้าหรือเหตุผลการปฏิเสธ..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReturnModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                ปิด
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-sm disabled:opacity-50"
              >
                {actionLoading ? 'กำลังประมวลผล...' : 'บันทึกผลการพิจารณา'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default OrderManager;
