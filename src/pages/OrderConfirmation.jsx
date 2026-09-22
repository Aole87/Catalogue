import React, { useEffect, useState, useRef } from 'react';
import ApiClient from '../utils/apiClient';
import {
  CheckCircle2,
  Package,
  Calendar,
  CreditCard,
  QrCode,
  Building2,
  MapPin,
  Truck,
  ArrowRight,
  Printer,
  Copy,
  Check,
  Clock,
  ShieldCheck,
  Upload,
  AlertCircle,
  RefreshCw,
  FileCheck2,
  HelpCircle,
  XCircle,
} from 'lucide-react';
import ReceiptModal from '../components/common/ReceiptModal';

export default function OrderConfirmation({ orderNumber, initialOrder, onNavigate }) {
  const [order, setOrder] = useState(initialOrder || null);
  const [payment, setPayment] = useState(initialOrder?.payments?.[0] || null);
  const [loading, setLoading] = useState(!initialOrder);
  const [copied, setCopied] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);
  const [copiedTracking, setCopiedTracking] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // Slip upload form state
  const [slipForm, setSlipForm] = useState({
    slipUrl: '',
    bankName: 'ธนาคารกสิกรไทย (KBANK)',
    transferAmount: '',
    transferredAt: new Date().toISOString().substring(0, 16),
    notes: '',
  });
  const [isSubmittingSlip, setIsSubmittingSlip] = useState(false);
  const [slipSuccessMessage, setSlipSuccessMessage] = useState(null);
  const [slipErrorMessage, setSlipErrorMessage] = useState(null);

  const pollIntervalRef = useRef(null);

  // Load Order and Payment
  const fetchOrderDetails = async () => {
    if (!orderNumber) return;
    try {
      const res = await ApiClient.getOrderByNumber(orderNumber);
      if (res?.data) {
        setOrder(res.data);
        if (res.data.payments && res.data.payments.length > 0) {
          setPayment(res.data.payments[0]);
          if (!slipForm.transferAmount) {
            setSlipForm((prev) => ({
              ...prev,
              transferAmount: res.data.payments[0].amount || res.data.grandTotal,
            }));
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch order details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [orderNumber]);

  // Live polling for payment settlement when PENDING
  useEffect(() => {
    const isPending =
      order?.status === 'PENDING_PAYMENT' &&
      (!payment || payment.status === 'PENDING');

    if (isPending) {
      pollIntervalRef.current = setInterval(() => {
        fetchOrderDetails();
      }, 5000);
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [order?.status, payment?.status]);

  const formatTHB = (val) => {
    return Number(val || 0).toLocaleString('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handleCopyOrderNumber = () => {
    if (order?.orderNumber) {
      navigator.clipboard.writeText(order.orderNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyPaymentRef = (refText) => {
    if (refText) {
      navigator.clipboard.writeText(refText);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    }
  };

  const handleCopyTracking = (trackingNo) => {
    if (trackingNo) {
      navigator.clipboard.writeText(trackingNo);
      setCopiedTracking(true);
      setTimeout(() => setCopiedTracking(false), 2000);
    }
  };

  const handleSlipSubmit = async (e) => {
    e.preventDefault();
    setSlipErrorMessage(null);
    setSlipSuccessMessage(null);

    if (!payment?.id) {
      setSlipErrorMessage('ไม่พบข้อมูลรายการชำระเงิน กรุณารีเฟรชหน้าจอ');
      return;
    }

    if (!slipForm.slipUrl.trim()) {
      setSlipErrorMessage('กรุณาระบุ URL หรือชื่อไฟล์หลักฐานสลิปการโอนเงิน');
      return;
    }

    try {
      setIsSubmittingSlip(true);
      await ApiClient.submitPaymentSlip(payment.id, {
        slipUrl: slipForm.slipUrl,
        bankName: slipForm.bankName,
        transferAmount: slipForm.transferAmount ? String(slipForm.transferAmount) : undefined,
        transferredAt: slipForm.transferredAt ? new Date(slipForm.transferredAt).toISOString() : undefined,
        notes: slipForm.notes || undefined,
      });

      setSlipSuccessMessage('ส่งหลักฐานสลิปเรียบร้อยแล้ว เจ้าหน้าที่จะตรวจสอบยอดเงินและยืนยันคำสั่งซื้อโดยเร็ว');
      await fetchOrderDetails();
    } catch (err) {
      console.error('Slip submission failed:', err);
      setSlipErrorMessage(err.message || 'ส่งหลักฐานสลิปไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmittingSlip(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mb-4" />
        <p className="text-sm font-medium text-slate-600">กำลังโหลดข้อมูลคำสั่งซื้อและสถานะการชำระเงิน...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-xl font-bold text-slate-800 mb-2">ไม่พบข้อมูลคำสั่งซื้อ</h2>
        <p className="text-sm text-slate-500 mb-6">รหัสคำสั่งซื้ออาจไม่ถูกต้องหรือถูกลบออกจากระบบ</p>
        <button
          onClick={() => (onNavigate ? onNavigate('home') : (window.location.hash = '#home'))}
          className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          กลับสู่หน้าหลัก
        </button>
      </div>
    );
  }

  const isPaid = order.status === 'PAYMENT_CONFIRMED' || payment?.status === 'PAID';
  const isRefunded = order.status === 'REFUNDED' || payment?.status === 'REFUNDED';
  const hasPendingSlip = payment?.slips?.some((s) => s.status === 'PENDING_REVIEW');
  const internalRef = payment?.internalReference || `PAY-${order.orderNumber}`;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Status Header Banner */}
        <div
          className={`rounded-3xl border bg-white p-6 sm:p-8 shadow-sm text-center mb-8 relative overflow-hidden ${
            isPaid
              ? 'border-emerald-200'
              : isRefunded
              ? 'border-purple-200'
              : 'border-blue-200'
          }`}
        >
          <div
            className={`absolute top-0 left-0 right-0 h-2 ${
              isPaid
                ? 'bg-emerald-500'
                : isRefunded
                ? 'bg-purple-500'
                : 'bg-blue-600'
            }`}
          />

          <div
            className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl mb-4 border shadow-inner ${
              isPaid
                ? 'bg-emerald-50 text-emerald-600 border-emerald-200/60'
                : isRefunded
                ? 'bg-purple-50 text-purple-600 border-purple-200/60'
                : 'bg-blue-50 text-blue-600 border-blue-200/60'
            }`}
          >
            {isPaid ? (
              <CheckCircle2 className="h-10 w-10" />
            ) : isRefunded ? (
              <RefreshCw className="h-10 w-10" />
            ) : (
              <Clock className="h-10 w-10 animate-pulse" />
            )}
          </div>

          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-bold border mb-2 ${
              isPaid
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : isRefunded
                ? 'bg-purple-50 text-purple-700 border-purple-200'
                : hasPendingSlip
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-blue-50 text-blue-700 border-blue-200'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            {isPaid
              ? 'ชำระเงินเรียบร้อยแล้ว (PAYMENT_CONFIRMED)'
              : isRefunded
              ? 'คืนเงินเรียบร้อยแล้ว (REFUNDED)'
              : hasPendingSlip
              ? 'รอเจ้าหน้าที่ตรวจสอบสลิป (UNDER REVIEW)'
              : 'รอการชำระเงิน (PENDING PAYMENT)'}
          </span>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {isPaid
              ? 'การชำระเงินได้รับการยืนยันเรียบร้อยแล้ว!'
              : isRefunded
              ? 'คำสั่งซื้อนี้ได้รับการคืนเงินแล้ว'
              : 'บันทึกคำสั่งซื้อเรียบร้อยแล้ว'}
          </h1>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-2">
            {isPaid
              ? 'ทางร้านได้รับยอดชำระเรียบร้อยแล้ว กำลังเตรียมจัดส่งสินค้าอะไหล่ตามขั้นตอน'
              : isRefunded
              ? 'ยอดเงินถูกส่งคืนตามนโยบายการคืนเงินเรียบร้อยแล้ว'
              : 'กรุณาชำระเงินตามช่องทางและยอดที่ระบุด้านล่าง เพื่อให้เจ้าหน้าที่ดำเนินการจัดส่ง'}
          </p>

          <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-4 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5">
            <div className="text-left">
              <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
                หมายเลขคำสั่งซื้อ (Order Number)
              </span>
              <span className="font-mono text-base font-extrabold text-slate-900">
                {order.orderNumber}
              </span>
            </div>
            <button
              onClick={handleCopyOrderNumber}
              className="inline-flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 border border-slate-300 shadow-sm hover:bg-slate-50 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-600">คัดลอกแล้ว</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-slate-500" />
                  <span>คัดลอก</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Dynamic Payment Lifecycle Card */}
        {!isPaid && !isRefunded && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm mb-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <QrCode className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">ข้อมูลการชำระเงิน (Payment Gateway)</h2>
                  <p className="text-xs text-slate-500">
                    ยอดชำระสุทธิที่ถูกต้อง: <span className="font-bold text-blue-600 font-mono">฿{formatTHB(order.grandTotal)}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 border border-amber-200">
                  <Clock className="h-3.5 w-3.5 animate-spin" />
                  <span>กำลังรอการชำระเงิน</span>
                </span>
                <button
                  onClick={fetchOrderDetails}
                  title="ตรวจสอบสถานะล่าสุด"
                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* PromptPay Thai QR */}
              <div className="flex flex-col items-center justify-center rounded-2xl bg-slate-900 p-6 text-white text-center shadow-md">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold tracking-widest text-blue-400">THAI QR PAYMENT (PROMPTPAY)</span>
                </div>
                <div className="h-48 w-48 rounded-xl bg-white p-3 flex items-center justify-center shadow-lg">
                  <div className="h-full w-full border-2 border-slate-900 rounded-lg flex flex-col items-center justify-center bg-slate-50 p-2 text-slate-900">
                    <QrCode className="h-32 w-32 text-slate-900 mb-1" />
                    <span className="text-[10px] font-mono font-bold tracking-tighter truncate max-w-full px-1">
                      {internalRef}
                    </span>
                  </div>
                </div>

                <div className="mt-3 font-mono text-xl font-extrabold text-white">
                  ฿{formatTHB(order.grandTotal)}
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                  <span>เลขอ้างอิง:</span>
                  <span className="font-mono text-slate-200 font-semibold">{internalRef}</span>
                  <button
                    onClick={() => handleCopyPaymentRef(internalRef)}
                    className="p-1 hover:text-white"
                  >
                    {copiedRef ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  สแกนผ่านแอปธนาคารทุกแห่ง ระบบจะยืนยันการชำระเงินอัตโนมัติ
                </p>
              </div>

              {/* Bank Transfer Details & Slip Upload Form */}
              <div className="space-y-5">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    บัญชีธนาคารสำหรับโอนเงิน
                  </h4>
                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">ธนาคาร:</span>
                      <span className="font-semibold text-slate-900">กสิกรไทย (KBANK)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">ชื่อบัญชี:</span>
                      <span className="font-semibold text-slate-900">บจก. โมเบ็กซ์ ออโต้พาร์ท</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">เลขที่บัญชี:</span>
                      <span className="font-mono font-bold text-blue-600 text-sm">098-2-12345-6</span>
                    </div>
                  </div>
                </div>

                {/* Slip Submission Form */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Upload className="h-4 w-4 text-blue-600" />
                    <h5 className="text-xs font-bold text-slate-900">แนบหลักฐานสลิปการโอนเงิน</h5>
                  </div>

                  {slipSuccessMessage && (
                    <div className="flex items-start gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 font-medium">
                      <FileCheck2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{slipSuccessMessage}</span>
                    </div>
                  )}

                  {slipErrorMessage && (
                    <div className="flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800 font-medium">
                      <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0 mt-0.5" />
                      <span>{slipErrorMessage}</span>
                    </div>
                  )}

                  {hasPendingSlip ? (
                    <div className="rounded-xl bg-blue-50/70 border border-blue-200 p-3.5 text-xs text-blue-900 space-y-1">
                      <div className="font-bold flex items-center gap-1.5">
                        <FileCheck2 className="h-4 w-4 text-blue-600" />
                        <span>หลักฐานสลิปอยู่ระหว่างการตรวจสอบ</span>
                      </div>
                      <p className="text-[11px] text-blue-700">
                        เจ้าหน้าที่กำลังตรวจสอบรายการโอนเงิน เมื่อยืนยันเรียบร้อยแล้วสถานะจะปรับเป็น PAYMENT_CONFIRMED โดยอัตโนมัติ
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSlipSubmit} className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          URL รูปภาพสลิป หรือ รหัสหลักฐาน <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={slipForm.slipUrl}
                          onChange={(e) => setSlipForm({ ...slipForm, slipUrl: e.target.value })}
                          placeholder="เช่น https://uploads.mobex.co.th/slips/slip-123.jpg"
                          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            ยอดเงินที่โอน (บาท)
                          </label>
                          <input
                            type="text"
                            value={slipForm.transferAmount}
                            onChange={(e) => setSlipForm({ ...slipForm, transferAmount: e.target.value })}
                            placeholder="฿..."
                            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 font-mono focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            วัน-เวลาที่โอน
                          </label>
                          <input
                            type="datetime-local"
                            value={slipForm.transferredAt}
                            onChange={(e) => setSlipForm({ ...slipForm, transferredAt: e.target.value })}
                            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmittingSlip}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 active:scale-[0.99] disabled:opacity-60 transition-all cursor-pointer"
                      >
                        {isSubmittingSlip ? (
                          <>
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            <span>กำลังส่งหลักฐาน...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="h-3.5 w-3.5" />
                            <span>ส่งหลักฐานสลิปการโอน</span>
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Phase M8: Shipment & Fulfillment Tracking Card */}
        {order.shipments && order.shipments.length > 0 ? (
          <div className="space-y-6 mb-8">
            {order.shipments.map((shipment, idx) => {
              const statusSteps = [
                { key: 'CONFIRMED', label: 'รับออเดอร์', desc: 'ยืนยันการชำระเงิน' },
                { key: 'PACKING', label: 'แพ็คสินค้า', desc: 'กำลังจัดเตรียมพัสดุ' },
                { key: 'SHIPPED', label: 'ส่งมอบขนส่ง', desc: 'บริษัทขนส่งรับพัสดุ' },
                { key: 'DELIVERED', label: 'จัดส่งสำเร็จ', desc: 'ลูกค้าได้รับพัสดุแล้ว' },
              ];

              const getStepIndex = (st) => {
                switch (st) {
                  case 'PENDING':
                  case 'READY_TO_FULFILL':
                    return 0;
                  case 'PACKING':
                  case 'READY_TO_SHIP':
                    return 1;
                  case 'SHIPPED':
                  case 'IN_TRANSIT':
                  case 'OUT_FOR_DELIVERY':
                    return 2;
                  case 'DELIVERED':
                    return 3;
                  default:
                    return 0;
                }
              };

              const currentStep = getStepIndex(shipment.status);
              const isDelivered = shipment.status === 'DELIVERED';
              const isCancelled = shipment.status === 'CANCELLED' || shipment.status === 'FAILED';

              return (
                <div
                  key={shipment.id || idx}
                  className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6"
                >
                  {/* Shipment Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100">
                        <Truck className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-lg font-bold text-slate-900">
                            {shipment.carrier || 'การจัดส่งพัสดุ'}
                          </h2>
                          {shipment.serviceLevel && (
                            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200">
                              {shipment.serviceLevel}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">
                          Shipment: {shipment.shipmentNumber}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:self-center">
                      {shipment.trackingNumber ? (
                        <div className="inline-flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-200 px-3 py-1.5">
                          <span className="text-[11px] font-bold text-slate-500">เลขพัสดุ:</span>
                          <span className="font-mono text-xs font-extrabold text-blue-600">
                            {shipment.trackingNumber}
                          </span>
                          <button
                            onClick={() => handleCopyTracking(shipment.trackingNumber)}
                            className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                            title="คัดลอกเลขพัสดุ"
                          >
                            {copiedTracking ? (
                              <Check className="h-3.5 w-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">
                          (กำลังรอออกเลข Tracking)
                        </span>
                      )}

                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border ${
                          isDelivered
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : isCancelled
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}
                      >
                        <ShieldCheck className="h-3.5 w-3.5" />
                        {shipment.status}
                      </span>
                    </div>
                  </div>

                  {/* Fulfillment Stepper */}
                  {!isCancelled && (
                    <div className="py-2">
                      <div className="grid grid-cols-4 gap-2 relative">
                        {/* Connecting Line */}
                        <div className="absolute top-4 left-[12.5%] right-[12.5%] h-1 bg-slate-100 -z-0">
                          <div
                            className="h-full bg-blue-600 transition-all duration-500"
                            style={{ width: `${(Math.min(currentStep, 3) / 3) * 100}%` }}
                          />
                        </div>

                        {statusSteps.map((step, sIdx) => {
                          const isDone = currentStep >= sIdx;
                          const isCurrent = currentStep === sIdx;

                          return (
                            <div key={step.key} className="flex flex-col items-center text-center z-10">
                              <div
                                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-all shadow-sm ${
                                  isDone
                                    ? 'bg-blue-600 border-blue-600 text-white'
                                    : 'bg-white border-slate-300 text-slate-400'
                                } ${isCurrent ? 'ring-4 ring-blue-100' : ''}`}
                              >
                                {isDone ? <Check className="h-4 w-4" /> : sIdx + 1}
                              </div>
                              <span
                                className={`mt-2 text-xs font-bold ${
                                  isDone ? 'text-slate-900' : 'text-slate-400'
                                }`}
                              >
                                {step.label}
                              </span>
                              <span className="hidden sm:block text-[10px] text-slate-400 mt-0.5">
                                {step.desc}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Events Timeline */}
                  {shipment.events && shipment.events.length > 0 && (
                    <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 space-y-3">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-blue-600" />
                        ประวัติการอัปเดตสถานะพัสดุ (Tracking Timeline)
                      </h4>
                      <div className="divide-y divide-slate-200/60 text-xs">
                        {shipment.events.map((ev, eIdx) => (
                          <div key={ev.id || eIdx} className="py-2 flex items-start justify-between gap-4">
                            <div>
                              <span className="font-semibold text-slate-800">
                                {ev.description || ev.status}
                              </span>
                              {ev.location && (
                                <span className="ml-2 text-slate-500 text-[11px]">
                                  📍 {ev.location}
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400 font-mono flex-shrink-0">
                              {new Date(ev.occurredAt || ev.createdAt).toLocaleString('th-TH')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Address Snapshot Preview */}
                  <div className="rounded-2xl bg-white p-4 border border-slate-100 shadow-sm text-xs text-slate-600 flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-bold text-slate-800">ที่อยู่จัดส่งที่บันทึกไว้:</span>{' '}
                      {shipment.recipientName} ({shipment.phone}) - {shipment.addressLine1}{' '}
                      {shipment.subdistrict ? `ต.${shipment.subdistrict}` : ''}{' '}
                      {shipment.district ? `อ.${shipment.district}` : ''} จ.{shipment.province}{' '}
                      {shipment.postalCode}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : isPaid ? (
          <div className="rounded-3xl border border-blue-100 bg-blue-50/50 p-6 shadow-sm mb-8 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 flex-shrink-0">
              <Truck className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-blue-900">
                คำสั่งซื้ออยู่ในขั้นตอนจัดเตรียมพัสดุ (Fulfillment in Progress)
              </h3>
              <p className="text-xs text-blue-700 mt-0.5">
                เจ้าหน้าที่คลังสินค้ากำลังจัดเตรียมอะไหล่และพิมพ์ใบปะหน้าพัสดุ ระบบจะอัปเดตเลข Tracking ที่นี่ทันทีที่ส่งมอบให้ขนส่ง
              </p>
            </div>
          </div>
        ) : null}

        {/* Order Details & Line Items */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6 mb-8">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
            <span>รายการอะไหล่ในคำสั่งซื้อ</span>
            <span className="text-xs font-mono text-slate-500">
              {order.items?.length || 0} รายการ
            </span>
          </h2>

          {/* Items Table */}
          <div className="divide-y divide-slate-100">
            {order.items?.map((item) => (
              <div key={item.id} className="py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-14 w-14 flex-shrink-0 rounded-xl bg-slate-50 border border-slate-200 p-1 flex items-center justify-center">
                    {item.productSnapshot?.primaryImage ? (
                      <img
                        src={item.productSnapshot.primaryImage}
                        alt={item.productName}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <Package className="h-6 w-6 text-slate-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-slate-900 truncate">
                      {item.productName}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span className="font-mono">SKU: {item.sku}</span>
                      {item.productSnapshot?.brand && (
                        <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] font-semibold text-slate-600">
                          {item.productSnapshot.brand}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className="font-mono text-sm font-bold text-slate-900">
                    ฿{formatTHB(item.lineTotal)}
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    ฿{formatTHB(item.unitPrice)} × {item.quantity} ชิ้น
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Totals */}
          <div className="border-t border-slate-200 pt-4 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>ยอดรวมสินค้า (Subtotal)</span>
              <span className="font-mono font-medium">฿{formatTHB(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>ค่าจัดส่ง (Shipping)</span>
              <span className="font-mono font-medium">
                {Number(order.shippingTotal) === 0 ? (
                  <span className="text-emerald-600 font-bold">ฟรี</span>
                ) : (
                  `฿${formatTHB(order.shippingTotal)}`
                )}
              </span>
            </div>
            <div className="flex justify-between text-base font-bold text-slate-900 pt-3 border-t border-slate-200">
              <span>ยอดชำระสุทธิ (Grand Total)</span>
              <span className="font-mono text-xl text-blue-600 font-extrabold">
                ฿{formatTHB(order.grandTotal)}
              </span>
            </div>
          </div>

          {/* Shipping Address Note */}
          {order.customerNotes && (
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 text-xs text-slate-700 whitespace-pre-line leading-relaxed">
              <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-blue-600" />
                ข้อมูลการจัดส่งและผู้รับ:
              </div>
              {order.customerNotes}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => (onNavigate ? onNavigate('products') : (window.location.hash = '#products'))}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-md hover:bg-blue-700 transition-colors"
          >
            <span>เลือกซื้อสินค้าต่อ</span>
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowReceiptModal(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
          >
            <Printer className="h-4 w-4 text-blue-600" />
            <span>ดูและพิมพ์ใบเสร็จรับเงิน (Receipt)</span>
          </button>
        </div>

        {/* Official Receipt & Tax Invoice Modal */}
        <ReceiptModal
          order={order}
          isOpen={showReceiptModal}
          onClose={() => setShowReceiptModal(false)}
        />
      </div>
    </div>
  );
}
