import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import ApiClient from '../utils/ApiClient';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  QrCode,
  Building2,
  Banknote,
  ArrowLeft,
  CheckCircle2,
  Package,
  AlertCircle,
  Loader2,
  Ticket,
  Award,
  X,
  Check
} from 'lucide-react';

const THAI_PROVINCES = [
  'กรุงเทพมหานคร', 'นนทบุรี', 'ปทุมธานี', 'สมุทรปราการ', 'สมุทรสาคร', 'นครปฐม',
  'ชลบุรี', 'ระยอง', 'จันทบุรี', 'ตราด', 'ฉะเชิงเทรา', 'ปราจีนบุรี', 'นครนายก', 'สระแก้ว',
  'พระนครศรีอยุธยา', 'สระบุรี', 'ลพบุรี', 'สิงห์บุรี', 'อ่างทอง', 'ชัยนาท', 'อุทัยธานี',
  'เชียงใหม่', 'เชียงราย', 'ลำปาง', 'ลำพูน', 'แพร่', 'น่าน', 'พะเยา', 'แม่ฮ่องสอน',
  'ขอนแก่น', 'นครราชสีมา', 'อุดรธานี', 'อุบลราชธานี', 'บุรีรัมย์', 'สุรินทร์', 'ศรีสะเกษ',
  'สงขลา', 'ภูเก็ต', 'สุราษฎร์ธานี', 'นครศรีธรรมราช', 'กระบี่', 'ตรัง', 'พังงา', 'ระนอง',
];

export default function Checkout({ onNavigate, user }) {
  const { cart, items, totals, clearCart, refreshCart } = useCart();

  const [formData, setFormData] = useState({
    recipientName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '',
    phone: user?.phone || '',
    addressLine: '',
    subdistrict: '',
    district: '',
    province: 'กรุงเทพมหานคร',
    postalCode: '',
    customerNotes: '',
    paymentMethod: 'PROMPTPAY',
  });

  // M12 Coupon State
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponValidating, setCouponValidating] = useState(false);
  const [couponError, setCouponError] = useState(null);

  // M12 Loyalty Points State
  const [loyaltyAccount, setLoyaltyAccount] = useState(null);
  const [loyaltyPointsToRedeem, setLoyaltyPointsToRedeem] = useState(0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Fetch Loyalty Points on mount
  useEffect(() => {
    const fetchLoyalty = async () => {
      try {
        const res = await ApiClient.getMyLoyaltyAccount();
        if (res?.data) {
          setLoyaltyAccount(res.data);
        }
      } catch (err) {
        // User may be guest or not authenticated
      }
    };
    if (user) {
      fetchLoyalty();
    }
  }, [user]);

  // Handle Validate / Apply Coupon
  const handleApplyCoupon = async () => {
    if (!couponCodeInput.trim()) return;
    try {
      setCouponValidating(true);
      setCouponError(null);
      const res = await ApiClient.validateCoupon(couponCodeInput.trim());
      if (res?.data?.isValid) {
        setAppliedCoupon(res.data);
      } else {
        setCouponError(res?.data?.reasons?.join(', ') || 'คูปองนี้ไม่สามารถใช้งานได้');
        setAppliedCoupon(null);
      }
    } catch (err) {
      setCouponError(err.message || 'เกิดข้อผิดพลาดในการตรวจสอบคูปอง');
      setAppliedCoupon(null);
    } finally {
      setCouponValidating(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCodeInput('');
    setCouponError(null);
  };

  // Calculate estimated discounts
  const subtotalNum = Number(totals.subtotal || 0);
  let couponDiscountEst = 0;
  if (appliedCoupon?.coupon) {
    if (appliedCoupon.coupon.discountType === 'PERCENTAGE') {
      couponDiscountEst = (subtotalNum * appliedCoupon.coupon.discountValue) / 100;
      if (appliedCoupon.coupon.maxDiscountAmount && couponDiscountEst > Number(appliedCoupon.coupon.maxDiscountAmount)) {
        couponDiscountEst = Number(appliedCoupon.coupon.maxDiscountAmount);
      }
    } else if (appliedCoupon.coupon.discountType === 'FIXED_AMOUNT') {
      couponDiscountEst = Number(appliedCoupon.coupon.discountValue);
    }
    if (couponDiscountEst > subtotalNum) couponDiscountEst = subtotalNum;
  }

  const loyaltyDiscountEst = (Number(loyaltyPointsToRedeem) || 0) / 10;
  const estimatedGrandTotal = Math.max(
    0,
    subtotalNum - couponDiscountEst - loyaltyDiscountEst + Number(totals.shippingTotal || 0)
  );

  const formatTHB = (val) => {
    return Number(val || 0).toLocaleString('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.recipientName.trim()) {
      setErrorMessage('กรุณาระบุชื่อ-นามสกุลผู้รับ');
      return;
    }
    if (!formData.phone.trim() || formData.phone.length < 9) {
      setErrorMessage('กรุณาระบุเบอร์โทรศัพท์ที่ถูกต้อง (อย่างน้อย 9-10 หลัก)');
      return;
    }
    if (!formData.addressLine.trim()) {
      setErrorMessage('กรุณาระบุที่อยู่จัดส่ง (บ้านเลขที่, ถนน, ซอย)');
      return;
    }
    if (!formData.postalCode.trim() || formData.postalCode.length < 5) {
      setErrorMessage('กรุณาระบุรหัสไปรษณีย์ 5 หลัก');
      return;
    }

    if (items.length === 0) {
      setErrorMessage('ตะกร้าสินค้าว่างเปล่า กรุณาเลือกสินค้าก่อนทำการสั่งซื้อ');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await ApiClient.checkout({
        shippingAddress: {
          recipientName: formData.recipientName,
          phone: formData.phone,
          addressLine: formData.addressLine,
          subdistrict: formData.subdistrict || undefined,
          district: formData.district || undefined,
          province: formData.province,
          postalCode: formData.postalCode,
        },
        customerNotes: formData.customerNotes || undefined,
        paymentMethod: formData.paymentMethod,
        couponCode: appliedCoupon?.coupon?.code || undefined,
        loyaltyPointsToRedeem: Number(loyaltyPointsToRedeem) > 0 ? Number(loyaltyPointsToRedeem) : undefined,
      });

      if (res?.data?.orderNumber) {
        await refreshCart();
        if (onNavigate) {
          onNavigate('order-confirmation', { orderNumber: res.data.orderNumber, order: res.data });
        } else {
          window.location.hash = `#order-confirmation/${res.data.orderNumber}`;
        }
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setErrorMessage(err.message || 'เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100 text-slate-400 mb-4">
          <Package className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">ไม่มีสินค้าในตะกร้า</h2>
        <p className="text-slate-500 max-w-md mb-8 text-sm">
          กรุณาเลือกสินค้าอะไหล่ตรงรุ่นที่คุณต้องการสั่งซื้อก่อนดำเนินการชำระเงิน
        </p>
        <button
          onClick={() => (onNavigate ? onNavigate('products') : (window.location.hash = '#products'))}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-blue-700 transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          กลับไปเลือกซื้ออะไหล่
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => (onNavigate ? onNavigate('products') : (window.location.hash = '#products'))}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            กลับไปหน้าเลือกซื้อสินค้า
          </button>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>ระบบชำระเงินปลอดภัย 256-bit SSL</span>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-8 tracking-tight">
          ดำเนินการสั่งซื้อสินค้า (Checkout)
        </h1>

        {errorMessage && (
          <div className="mb-6 flex items-center gap-3 rounded-xl bg-rose-50 border border-rose-200 p-4 text-sm font-medium text-rose-800">
            <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Forms */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Shipping Address */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600/10 text-blue-600 font-bold text-sm">
                  1
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">ที่อยู่สำหรับจัดส่งสินค้า</h2>
                  <p className="text-xs text-slate-500">ระบุข้อมูลผู้รับพัสดุและสถานที่จัดส่งที่ชัดเจน</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    ชื่อ-นามสกุล ผู้รับ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="recipientName"
                    value={formData.recipientName}
                    onChange={handleChange}
                    placeholder="เช่น สมชาย ใจดี หรือ อู่สมชายการาจ"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    เบอร์โทรศัพท์ติดต่อ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="เช่น 0812345678"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    ที่อยู่ (บ้านเลขที่ / หมู่บ้าน / อาคาร / ซอย / ถนน) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="addressLine"
                    value={formData.addressLine}
                    onChange={handleChange}
                    placeholder="เช่น 123/45 หมู่ 2 ซอยสุขุมวิท 55 ถนนสุขุมวิท"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    แขวง / ตำบล
                  </label>
                  <input
                    type="text"
                    name="subdistrict"
                    value={formData.subdistrict}
                    onChange={handleChange}
                    placeholder="เช่น คลองตันเหนือ"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    เขต / อำเภอ
                  </label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    placeholder="เช่น วัฒนา"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    จังหวัด <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="province"
                    value={formData.province}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 bg-white focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  >
                    {THAI_PROVINCES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    รหัสไปรษณีย์ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    placeholder="เช่น 10110"
                    maxLength={5}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 font-mono focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Payment Method */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600/10 text-blue-600 font-bold text-sm">
                  2
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">วิธีชำระเงิน</h2>
                  <p className="text-xs text-slate-500">เลือกช่องทางการชำระเงินที่สะดวก</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* PromptPay */}
                <label
                  className={`relative flex flex-col justify-between rounded-xl border p-4 cursor-pointer transition-all ${
                    formData.paymentMethod === 'PROMPTPAY'
                      ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="PROMPTPAY"
                    checked={formData.paymentMethod === 'PROMPTPAY'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className="flex items-center justify-between mb-2">
                    <QrCode className="h-6 w-6 text-blue-600" />
                    {formData.paymentMethod === 'PROMPTPAY' && (
                      <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900">พร้อมเพย์ (PromptPay)</div>
                    <div className="text-[11px] text-slate-500">สแกน QR Code ทันที</div>
                  </div>
                </label>

                {/* Bank Transfer */}
                <label
                  className={`relative flex flex-col justify-between rounded-xl border p-4 cursor-pointer transition-all ${
                    formData.paymentMethod === 'BANK_TRANSFER'
                      ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="BANK_TRANSFER"
                    checked={formData.paymentMethod === 'BANK_TRANSFER'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className="flex items-center justify-between mb-2">
                    <Building2 className="h-6 w-6 text-slate-700" />
                    {formData.paymentMethod === 'BANK_TRANSFER' && (
                      <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900">โอนผ่านบัญชีธนาคาร</div>
                    <div className="text-[11px] text-slate-500">แนบสลิปหลังสั่งซื้อ</div>
                  </div>
                </label>

                {/* COD */}
                <label
                  className={`relative flex flex-col justify-between rounded-xl border p-4 cursor-pointer transition-all ${
                    formData.paymentMethod === 'COD'
                      ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={formData.paymentMethod === 'COD'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className="flex items-center justify-between mb-2">
                    <Banknote className="h-6 w-6 text-slate-700" />
                    {formData.paymentMethod === 'COD' && (
                      <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900">เก็บเงินปลายทาง (COD)</div>
                    <div className="text-[11px] text-slate-500">ชำระเมื่อรับพัสดุ</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Step 3: Customer Notes */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <label className="block text-sm font-bold text-slate-900 mb-1">
                หมายเหตุคำสั่งซื้อ / ขอใบเสร็จรับเงิน (Optional)
              </label>
              <p className="text-xs text-slate-500 mb-3">
                หากต้องการใบกำกับภาษี หรือมีคำแนะนำพิเศษสำหรับการจัดส่ง สามารถระบุได้ที่นี่
              </p>
              <textarea
                name="customerNotes"
                rows={3}
                value={formData.customerNotes}
                onChange={handleChange}
                placeholder="เช่น ขอใบกำกับภาษีในนามบริษัท... หรือ โทรแจ้งก่อนส่ง 30 นาที"
                className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-5">
            <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
                <span>สรุปรายการสั่งซื้อ</span>
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  {totals.totalItems} รายการ
                </span>
              </h3>

              {/* Items Mini List */}
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 pr-1 space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="pt-3 first:pt-0 flex gap-3">
                    <div className="h-12 w-12 flex-shrink-0 rounded-lg bg-slate-50 border border-slate-200 p-1 flex items-center justify-center">
                      {item.primaryImage ? (
                        <img
                          src={item.primaryImage}
                          alt={item.productName}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <Package className="h-5 w-5 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs font-semibold text-slate-900 truncate">
                        {item.productName}
                      </h5>
                      <div className="text-[11px] text-slate-500 font-mono flex items-center justify-between mt-0.5">
                        <span>จำนวน: {item.quantity} ชิ้น</span>
                        <span className="font-bold text-slate-800">฿{formatTHB(item.lineTotal)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon Code Section */}
              <div className="border-t border-slate-100 pt-3 space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
                  <Ticket className="w-3.5 h-3.5 text-blue-600" />
                  <span>โค้ดส่วนลด / คูปอง</span>
                </label>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2.5 bg-blue-50 border border-blue-200 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-blue-600" />
                      <div>
                        <span className="font-mono font-bold text-xs text-blue-800">
                          {appliedCoupon.coupon.code}
                        </span>
                        <div className="text-[10px] text-blue-600">
                          ลด {appliedCoupon.coupon.discountType === 'PERCENTAGE' ? `${appliedCoupon.coupon.discountValue}%` : `฿${appliedCoupon.coupon.discountValue}`}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCodeInput}
                        onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                        placeholder="กรอกรหัสคูปอง"
                        className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono uppercase text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={couponValidating || !couponCodeInput.trim()}
                        className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-50 transition-all"
                      >
                        {couponValidating ? 'ตรวจ...' : 'ใช้โค้ด'}
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-[11px] text-rose-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {couponError}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Loyalty Points Section */}
              {loyaltyAccount && loyaltyAccount.balance > 0 && (
                <div className="border-t border-slate-100 pt-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-bold text-slate-700 uppercase flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-amber-500" />
                      <span>คะแนนสะสม (Loyalty Points)</span>
                    </label>
                    <span className="font-bold text-amber-600 font-mono">
                      คงเหลือ {loyaltyAccount.balance} แต้ม
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max={loyaltyAccount.balance}
                      step="10"
                      value={loyaltyPointsToRedeem}
                      onChange={(e) => {
                        const val = Math.min(
                          loyaltyAccount.balance,
                          Math.max(0, Number(e.target.value) || 0)
                        );
                        setLoyaltyPointsToRedeem(val);
                      }}
                      className="w-24 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-mono text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                    <span className="text-[11px] text-slate-500">
                      แต้ม = ส่วนลด ฿{formatTHB(loyaltyDiscountEst)} (10 แต้ม = 1฿)
                    </span>
                  </div>
                </div>
              )}

              {/* Pricing Breakdown */}
              <div className="border-t border-slate-100 pt-4 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>ยอดรวมสินค้า (Subtotal)</span>
                  <span className="font-mono font-medium">฿{formatTHB(totals.subtotal)}</span>
                </div>
                {couponDiscountEst > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>ส่วนลดคูปอง (Coupon Discount)</span>
                    <span className="font-mono">-฿{formatTHB(couponDiscountEst)}</span>
                  </div>
                )}
                {loyaltyDiscountEst > 0 && (
                  <div className="flex justify-between text-amber-600 font-medium">
                    <span>ส่วนลดคะแนนสะสม (Loyalty Points)</span>
                    <span className="font-mono">-฿{formatTHB(loyaltyDiscountEst)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>ค่าจัดส่ง (Shipping)</span>
                  <span className="font-mono font-medium">
                    {Number(totals.shippingTotal) === 0 ? (
                      <span className="text-emerald-600 font-bold">ฟรี</span>
                    ) : (
                      `฿${formatTHB(totals.shippingTotal)}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 pt-3 border-t border-slate-200">
                  <span>ยอดชำระสุทธิ (Grand Total)</span>
                  <span className="font-mono text-xl text-blue-600 font-extrabold">
                    ฿{formatTHB(estimatedGrandTotal)}
                  </span>
                </div>
              </div>

              {/* Submit CTA Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 active:scale-[0.99] disabled:opacity-60 transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>กำลังสร้างคำสั่งซื้อ...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-5 w-5" />
                    <span>ยืนยันและสร้างคำสั่งซื้อ</span>
                  </>
                )}
              </button>

              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100 flex items-start gap-2.5 text-[11px] text-slate-500 leading-relaxed">
                <ShieldCheck className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>
                  ราคาที่แสดงได้รับการคำนวณและยืนยันความถูกต้องจากเซิร์ฟเวอร์โดยตรง
                  พร้อมการรับประกันอะไหล่แท้ตรงรุ่นตามมาตรฐาน
                </span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
