import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import ApiClient from '../utils/apiClient';
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
  Lock,
  UserCheck,
  Check
} from 'lucide-react';

const SHIPPING_PROVIDERS = [
  { id: 'ship-1', code: 'FLASH', name: 'Flash Express', fee: 45, estDays: '1-2 Days', logo: '⚡' },
  { id: 'ship-2', code: 'KERRY', name: 'Kerry Express', fee: 60, estDays: '1-2 Days', logo: '📦' },
  { id: 'ship-3', code: 'SCG', name: 'SCG Express (Cold/Heavy)', fee: 75, estDays: '2-3 Days', logo: '🚛' },
  { id: 'ship-4', code: 'STANDARD', name: 'Standard Delivery', fee: 35, estDays: '2-4 Days', logo: '🚚' },
];

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
  const { t, lang } = useLanguage();

  const [selectedShipping, setSelectedShipping] = useState(SHIPPING_PROVIDERS[0]);
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

  // Coupon State
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponValidating, setCouponValidating] = useState(false);
  const [couponError, setCouponError] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // If Guest visits checkout, block access
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center">
          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">
            {lang === 'th' ? 'เฉพาะสมาชิกเท่านั้น' : 'Members Only Access'}
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed mb-6">
            {t('membersOnlyNotice')} {t('guestCheckoutNotAllowed')}
          </p>

          <div className="space-y-3">
            <button
              onClick={() => onNavigate?.('login')}
              className="w-full py-3 rounded-full bg-[#0d3c90] hover:bg-[#072a63] text-white font-extrabold text-xs shadow-md transition-colors"
            >
              {t('signIn')}
            </button>
            <button
              onClick={() => onNavigate?.('register')}
              className="w-full py-3 rounded-full bg-[#f97316] hover:bg-[#ea580c] text-white font-extrabold text-xs shadow-md transition-colors"
            >
              {t('register')}
            </button>
            <button
              onClick={() => onNavigate?.('home')}
              className="w-full py-2 text-xs text-slate-500 hover:text-slate-900 font-bold"
            >
              ← {lang === 'th' ? 'กลับหน้าหลัก' : 'Back to Home'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate pricing breakdown
  const subtotalNum = Number(totals?.subtotal || 0);
  const shippingFeeNum = Number(selectedShipping?.fee || 0);
  
  let couponDiscountEst = 0;
  if (appliedCoupon?.coupon) {
    if (appliedCoupon.coupon.discountType === 'PERCENTAGE') {
      couponDiscountEst = (subtotalNum * appliedCoupon.coupon.discountValue) / 100;
    } else if (appliedCoupon.coupon.discountType === 'FIXED_AMOUNT') {
      couponDiscountEst = Number(appliedCoupon.coupon.discountValue);
    }
  }

  const grandTotal = Math.max(0, subtotalNum + shippingFeeNum - couponDiscountEst);

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

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      setErrorMessage('ตะกร้าสินค้าว่างเปล่า กรุณาเลือกสินค้าก่อนทำการสั่งซื้อ');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const orderPayload = {
        recipientName: formData.recipientName,
        phone: formData.phone,
        addressLine1: formData.addressLine,
        subdistrict: formData.subdistrict,
        district: formData.district,
        province: formData.province,
        postalCode: formData.postalCode,
        country: 'TH',
        customerNotes: formData.customerNotes,
        paymentMethod: formData.paymentMethod,
        shippingMethodId: selectedShipping.id,
        shippingFee: shippingFeeNum,
        couponCode: appliedCoupon?.coupon?.code,
      };

      const response = await ApiClient.createOrder(orderPayload);
      if (response?.data?.order || response?.order) {
        const orderData = response.data?.order || response.order;
        await clearCart();
        onNavigate('order-confirmation', {
          orderNumber: orderData.orderNumber,
          order: orderData,
        });
      } else {
        throw new Error(response.message || 'ไม่สามารถสร้างคำสั่งซื้อได้');
      }
    } catch (err) {
      setErrorMessage(err.message || 'เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-16">
      {/* Header Bar */}
      <header className="bg-[#09357a] text-white py-4 px-4 sm:px-6 lg:px-8 border-b border-blue-900/40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 text-xs font-bold text-blue-100 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{lang === 'th' ? 'กลับหน้าหลัก' : 'Back to Home'}</span>
          </button>
          <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#f97316]" />
            <span>Member Checkout</span>
          </h1>
          <div className="text-xs font-semibold text-blue-200">
            {user.firstName} {user.lastName} ({user.business_type || 'MEMBER'})
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {errorMessage && (
          <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Delivery Address & Shipping Carrier Selector */}
          <div className="lg:col-span-7 space-y-6">
            {/* Delivery Address Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
              <h2 className="text-base font-black text-[#0e1932] mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#0d3c90]" />
                <span>1. {lang === 'th' ? 'ที่อยู่สำหรับการจัดส่ง' : 'Delivery Address'}</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {lang === 'th' ? 'ชื่อ-นามสกุล ผู้รับ' : 'Recipient Full Name'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.recipientName}
                    onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#0d3c90]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {lang === 'th' ? 'เบอร์โทรศัพท์ติดต่อ' : 'Phone Number'} *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#0d3c90]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    {lang === 'th' ? 'ที่อยู่ (บ้านเลขที่, ถนน, ซอย)' : 'Address Line'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.addressLine}
                    onChange={(e) => setFormData({ ...formData, addressLine: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#0d3c90]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {lang === 'th' ? 'ตำบล / แขวง' : 'Subdistrict'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subdistrict}
                    onChange={(e) => setFormData({ ...formData, subdistrict: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#0d3c90]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {lang === 'th' ? 'อำเภอ / เขต' : 'District'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#0d3c90]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {lang === 'th' ? 'จังหวัด' : 'Province'} *
                  </label>
                  <select
                    value={formData.province}
                    onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#0d3c90]"
                  >
                    {THAI_PROVINCES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {lang === 'th' ? 'รหัสไปรษณีย์' : 'Postal Code'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#0d3c90]"
                  />
                </div>
              </div>
            </div>

            {/* Standalone Shipping Provider Selector (Requirement 7) */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
              <h2 className="text-base font-black text-[#0e1932] mb-1 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#f97316]" />
                  <span>2. {t('selectCarrier')}</span>
                </span>
                <span className="text-xs text-[#0d3c90] font-bold">
                  {lang === 'th' ? 'คำนวณแยกต่างหาก' : 'Calculated Separately'}
                </span>
              </h2>
              <p className="text-[11px] text-slate-500 mb-4">
                {lang === 'th' ? 'เลือกผู้ให้บริการขนส่ง ค่าจัดส่งจะถูกคำนวณแยกและรวมกับราคาสินค้าสุทธิ' : 'Select carrier. Shipping fee is calculated separately and added to total.'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {SHIPPING_PROVIDERS.map((provider) => (
                  <div
                    key={provider.id}
                    onClick={() => setSelectedShipping(provider)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      selectedShipping.id === provider.id
                        ? 'border-[#0d3c90] bg-blue-50/50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{provider.logo}</span>
                      <div>
                        <div className="font-bold text-slate-900">{provider.name}</div>
                        <div className="text-[11px] text-slate-500">
                          {t('estimatedDelivery')}: {provider.estDays}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-sm text-[#0d3c90] font-mono">
                        ฿{provider.fee.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
              <h2 className="text-base font-black text-[#0e1932] mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#0d3c90]" />
                <span>3. {lang === 'th' ? 'วิธีการชำระเงิน' : 'Payment Method'}</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {[
                  { id: 'PROMPTPAY', label: 'PromptPay QR', sub: 'สแกน QR Code', icon: QrCode },
                  { id: 'BANK_TRANSFER', label: 'โอนผ่านธนาคาร', sub: 'แนบสลิปโอนเงิน', icon: Building2 },
                  { id: 'CREDIT_CARD', label: 'บัตรเครดิต/เดบิต', sub: 'Stripe Gateway', icon: CreditCard },
                ].map((pm) => {
                  const IconComp = pm.icon;
                  return (
                    <div
                      key={pm.id}
                      onClick={() => setFormData({ ...formData, paymentMethod: pm.id })}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        formData.paymentMethod === pm.id
                          ? 'border-[#0d3c90] bg-blue-50/50 font-bold'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <IconComp className="w-6 h-6 text-[#0d3c90] mb-2" />
                      <div className="text-slate-900">{pm.label}</div>
                      <div className="text-[10px] text-slate-500 font-normal">{pm.sub}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Transparent Cost Breakdown (Subtotal + Shipping Fee = Grand Total) */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-md sticky top-24">
              <h2 className="text-base font-black text-[#0e1932] mb-4 pb-3 border-b border-slate-100 flex items-center justify-between">
                <span>{lang === 'th' ? 'สรุปรายการสั่งซื้อ' : 'Order Summary'}</span>
                <span className="text-xs font-bold text-[#0d3c90]">
                  {items.length} {lang === 'th' ? 'รายการ' : 'items'}
                </span>
              </h2>

              {/* Items List */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1 mb-4">
                {items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-50">
                    <div className="flex-1 pr-2 truncate">
                      <div className="font-bold text-slate-800 truncate">{item.name || item.product?.name}</div>
                      <div className="text-[11px] text-slate-400">
                        {lang === 'th' ? 'จำนวน' : 'Qty'}: {item.quantity}
                      </div>
                    </div>
                    <div className="font-black text-slate-900 font-mono shrink-0">
                      ฿{Number(item.price || item.product?.price || 0 * item.quantity).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon Section */}
              <div className="mb-4 pt-3 border-t border-slate-100">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={lang === 'th' ? 'ใส่โค้ดส่วนลด' : 'Coupon Code'}
                    value={couponCodeInput}
                    onChange={(e) => setCouponCodeInput(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={couponValidating}
                    className="px-4 py-1.5 bg-[#0d3c90] hover:bg-[#072a63] text-white text-xs font-bold rounded-xl shrink-0"
                  >
                    {couponValidating ? '...' : (lang === 'th' ? 'ใช้โค้ด' : 'Apply')}
                  </button>
                </div>
                {couponError && <p className="text-[11px] text-rose-500 mt-1">{couponError}</p>}
                {appliedCoupon && (
                  <p className="text-[11px] text-emerald-600 font-bold mt-1">
                    ✓ {lang === 'th' ? 'ใช้คูปองสำเร็จ' : 'Coupon Applied'}: {appliedCoupon.coupon?.code}
                  </p>
                )}
              </div>

              {/* Standalone Cost Breakdown Calculation (Requirement 7) */}
              <div className="space-y-2 text-xs pt-3 border-t border-slate-100">
                {/* 1. Subtotal */}
                <div className="flex justify-between text-slate-600">
                  <span>{t('subtotal')} ({lang === 'th' ? 'ราคาสินค้าสมาชิก' : 'Member Price'})</span>
                  <span className="font-mono font-bold text-slate-900">
                    ฿{subtotalNum.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {/* 2. Standalone Shipping Fee */}
                <div className="flex justify-between text-slate-600">
                  <span className="flex items-center gap-1">
                    <span>{t('shippingFee')}</span>
                    <span className="text-[10px] bg-blue-100 text-[#0d3c90] px-1.5 py-0.2 rounded font-bold">
                      {selectedShipping.name}
                    </span>
                  </span>
                  <span className="font-mono font-bold text-[#0d3c90]">
                    +฿{shippingFeeNum.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {/* 3. Discount */}
                {couponDiscountEst > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>{t('discount')}</span>
                    <span className="font-mono">-฿{couponDiscountEst.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}

                {/* 4. Grand Total */}
                <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                  <span className="font-black text-sm text-slate-900">{t('grandTotal')}</span>
                  <div className="text-right">
                    <span className="text-xl font-black text-[#f97316] font-mono">
                      ฿{grandTotal.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                    </span>
                    <div className="text-[10px] text-slate-400 font-normal">
                      {lang === 'th' ? 'รวมภาษีมูลค่าเพิ่มแล้ว' : 'VAT Included'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Order Button */}
              <button
                type="submit"
                disabled={isSubmitting || items.length === 0}
                className="w-full mt-6 py-3.5 rounded-full bg-[#f97316] hover:bg-[#ea580c] text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{lang === 'th' ? 'กำลังดำเนินการ...' : 'Processing...'}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>{lang === 'th' ? 'ยืนยันสั่งซื้อและชำระเงิน' : 'Confirm Order & Pay'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
