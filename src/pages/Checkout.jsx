import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useSettings } from '../context/SettingsContext';
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

const DEFAULT_SHIPPING_PROVIDERS = [
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
  const { settings } = useSettings();

  const availableShipping = (settings?.shipping?.methods || []).filter(m => m.active !== false).length > 0
    ? (settings?.shipping?.methods || []).filter(m => m.active !== false).map(m => ({
        ...m,
        logo: m.code === 'FLASH' ? '⚡' : m.code === 'KERRY' ? '📦' : m.code === 'SCG' ? '🚛' : '🚚',
        estDays: m.estimatedDays || m.estDays || '1-3 Days',
      }))
    : DEFAULT_SHIPPING_PROVIDERS;

  const [selectedShipping, setSelectedShipping] = useState(() => availableShipping[0]);

  useEffect(() => {
    if (availableShipping.length > 0 && !availableShipping.some(m => m.id === selectedShipping?.id)) {
      setSelectedShipping(availableShipping[0]);
    }
  }, [availableShipping]);

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
    needInvoice: false,
    invoiceRecipientName: user?.companyName || (user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : ''),
    invoiceTaxId: user?.taxId || '',
    invoiceAddress: '',
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
              className="w-full py-3 rounded-full bg-[#0c3175] hover:bg-[#051124] text-white font-extrabold text-xs shadow-md transition-colors"
            >
              {t('signIn')}
            </button>
            <button
              onClick={() => onNavigate?.('register')}
              className="w-full py-3 rounded-full bg-[#ea580c] hover:bg-[#ea580c] text-white font-extrabold text-xs shadow-md transition-colors"
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
  const freeThreshold = Number(settings?.shipping?.freeShippingThreshold ?? 2000);
  const isFreeShipping = subtotalNum >= freeThreshold;

  // Product-specific / SKU variant-specific shipping calculation
  const productSpecificShipping = (items || []).reduce((acc, item) => {
    const fee = Number(item.shippingFee || item.product?.shippingFee || item.variant?.shippingFee || 0);
    return acc + (fee * (item.quantity || 1));
  }, 0);

  const baseShippingFee = Number(selectedShipping?.fee || 0);
  const totalCalculatedShipping = baseShippingFee + productSpecificShipping;
  const shippingFeeNum = isFreeShipping ? 0 : totalCalculatedShipping;
  
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

      const invoiceNote = formData.needInvoice
        ? `\n[ขอใบกำกับภาษีเต็มรูปแบบ]: ออกในนาม "${formData.invoiceRecipientName}" (Tax ID: ${formData.invoiceTaxId || '-'}) ที่อยู่: ${formData.invoiceAddress || 'ใช้ที่อยู่จัดส่ง'}`
        : '';

      const orderPayload = {
        recipientName: formData.recipientName,
        phone: formData.phone,
        addressLine1: formData.addressLine,
        subdistrict: formData.subdistrict,
        district: formData.district,
        province: formData.province,
        postalCode: formData.postalCode,
        country: 'TH',
        customerNotes: `${formData.customerNotes || ''}${invoiceNote}`.trim(),
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
      <header className="bg-[#0c3175] text-white py-3.5 px-4 sm:px-6 lg:px-8 border-b border-blue-900/40">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-1.5 text-xs font-bold text-blue-100 hover:text-white transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden xs:inline sm:inline">{lang === 'th' ? 'กลับหน้าหลัก' : 'Back to Home'}</span>
          </button>
          <h1 className="text-sm sm:text-base font-black tracking-tight text-white flex items-center gap-1.5 truncate">
            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-[#ea580c] shrink-0" />
            <span>Member Checkout</span>
          </h1>
          <div className="text-[11px] sm:text-xs font-semibold text-blue-200 truncate max-w-[120px] sm:max-w-none">
            {user?.firstName || user?.email?.split('@')[0] || (lang === 'th' ? 'ลูกค้า' : 'Customer')} ({user?.customerType || user?.business_type || 'MEMBER'})
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
                <Truck className="w-5 h-5 text-[#0c3175]" />
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#0c3175]"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#0c3175]"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#0c3175]"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#0c3175]"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#0c3175]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {lang === 'th' ? 'จังหวัด' : 'Province'} *
                  </label>
                  <select
                    value={formData.province}
                    onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#0c3175]"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#0c3175]"
                  />
                </div>
              </div>
            </div>

            {/* Standalone Shipping Provider Selector (Requirement 7) */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
              <h2 className="text-base font-black text-[#0e1932] mb-1 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#ea580c]" />
                  <span>2. {t('selectCarrier')}</span>
                </span>
                <span className="text-xs text-[#0c3175] font-bold">
                  {lang === 'th' ? 'คำนวณแยกต่างหาก' : 'Calculated Separately'}
                </span>
              </h2>
              <p className="text-[11px] text-slate-500 mb-4">
                {lang === 'th' ? 'เลือกผู้ให้บริการขนส่ง ค่าจัดส่งจะถูกคำนวณแยกและรวมกับราคาสินค้าสุทธิ' : 'Select carrier. Shipping fee is calculated separately and added to total.'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {availableShipping.map((provider) => {
                  const effectiveFee = isFreeShipping ? 0 : provider.fee;
                  return (
                    <div
                      key={provider.id}
                      onClick={() => setSelectedShipping(provider)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                        selectedShipping.id === provider.id
                          ? 'border-[#0c3175] bg-blue-50/50 shadow-xs'
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
                        {isFreeShipping ? (
                          <div className="flex flex-col items-end">
                            <span className="font-black text-sm text-emerald-600 font-mono">฿0.00</span>
                            <span className="text-[9px] bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.2 rounded">ส่งฟรี</span>
                          </div>
                        ) : (
                          <div className="font-black text-sm text-[#0c3175] font-mono">
                            ฿{Number(provider.fee).toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
              <h2 className="text-base font-black text-[#0e1932] flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#0c3175]" />
                <span>3. {lang === 'th' ? 'วิธีการชำระเงิน' : 'Payment Method'}</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {[
                  { id: 'PROMPTPAY', label: 'PromptPay QR', sub: 'สแกน QR Code รับเงินทันที', icon: QrCode },
                  { id: 'BANK_TRANSFER', label: 'โอนผ่านธนาคาร', sub: 'แนบสลิปโอนเงิน', icon: Building2 },
                  { id: 'CREDIT_CARD', label: 'บัตรเครดิต/เดบิต', sub: 'ชำระออนไลน์ปลอดภัย', icon: CreditCard },
                ].map((pm) => {
                  const IconComp = pm.icon;
                  return (
                    <div
                      key={pm.id}
                      onClick={() => setFormData({ ...formData, paymentMethod: pm.id })}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        formData.paymentMethod === pm.id
                          ? 'border-[#0c3175] bg-blue-50/50 font-bold shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <IconComp className="w-6 h-6 text-[#0c3175] mb-2" />
                      <div className="text-slate-900">{pm.label}</div>
                      <div className="text-[10px] text-slate-500 font-normal">{pm.sub}</div>
                    </div>
                  );
                })}
              </div>

              {/* Dynamic Payment Details Hint */}
              {formData.paymentMethod === 'PROMPTPAY' && settings?.payment?.promptpay && (
                <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <QrCode className="w-8 h-8 text-[#0c3175]" />
                    <div>
                      <div className="font-bold text-[#0c3175]">
                        พร้อมเพย์: {settings.payment.promptpay.accountNo}
                      </div>
                      <div className="text-[11px] text-slate-600">
                        ชื่อบัญชี: {settings.payment.promptpay.accountName}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-1 rounded-full">
                    QR พร้อมเพย์อัตโนมัติ
                  </span>
                </div>
              )}

              {formData.paymentMethod === 'BANK_TRANSFER' && settings?.payment?.bankTransfer && (
                <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-8 h-8 text-emerald-700" />
                    <div>
                      <div className="font-bold text-emerald-900">
                        {settings.payment.bankTransfer.bankName}
                      </div>
                      <div className="text-[11px] font-mono text-emerald-800 font-bold">
                        เลขที่บัญชี: {settings.payment.bankTransfer.accountNo} ({settings.payment.bankTransfer.branch || 'สาขาหลัก'})
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-1 rounded-full">
                    แนบสลิปหลังสั่งซื้อ
                  </span>
                </div>
              )}
            </div>

            {/* Tax Invoice & Receipt Details Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-black text-[#0e1932] flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-teal-600" />
                  <span>4. ออกใบกำกับภาษี / ใบเสร็จรับเงิน (Tax Invoice / Receipt)</span>
                </h2>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-200">
                  <input
                    type="checkbox"
                    checked={formData.needInvoice}
                    onChange={(e) => setFormData({ ...formData, needInvoice: e.target.checked })}
                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span>ต้องการใบกำกับภาษีเต็มรูปแบบ</span>
                </label>
              </div>

              {formData.needInvoice ? (
                <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                  <div className="font-bold text-slate-700">กำหนดรายละเอียดในใบกำกับภาษี / ใบเสร็จ:</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">ชื่อผู้เสียภาษี / ออกในนามบริษัท หรือบุคคล *</label>
                      <input
                        type="text"
                        required={formData.needInvoice}
                        value={formData.invoiceRecipientName}
                        onChange={(e) => setFormData({ ...formData, invoiceRecipientName: e.target.value })}
                        placeholder="เช่น บริษัท อู่ยนต์การช่าง จำกัด / นายสมชาย ใจดี"
                        className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 font-semibold outline-none focus:border-teal-600"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">เลขประจำตัวผู้เสียภาษี (Tax ID) *</label>
                      <input
                        type="text"
                        required={formData.needInvoice}
                        value={formData.invoiceTaxId}
                        onChange={(e) => setFormData({ ...formData, invoiceTaxId: e.target.value })}
                        placeholder="เลข 13 หลัก"
                        className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 font-semibold outline-none focus:border-teal-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">ที่อยู่ออกใบกำกับภาษี (หากต่างจากที่อยู่จัดส่ง)</label>
                    <input
                      type="text"
                      value={formData.invoiceAddress}
                      onChange={(e) => setFormData({ ...formData, invoiceAddress: e.target.value })}
                      placeholder="ถ้าเว้นว่างจะใช้ที่อยู่จัดส่งเดียวกัน"
                      className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 font-semibold outline-none focus:border-teal-600"
                    />
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  ระบบจะออกใบเสร็จรับเงินอย่างย่อตามชื่อบัญชีสมาชิก หากต้องการใบกำกับภาษีเต็มรูปแบบ สามารถติ๊กเลือกที่ช่องด้านบนได้ครับ
                </p>
              )}
            </div>
          </div>

          {/* Right Column: Transparent Cost Breakdown (Subtotal + Shipping Fee = Grand Total) */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-md sticky top-24">
              <h2 className="text-base font-black text-[#0e1932] mb-4 pb-3 border-b border-slate-100 flex items-center justify-between">
                <span>{lang === 'th' ? 'สรุปรายการสั่งซื้อ' : 'Order Summary'}</span>
                <span className="text-xs font-bold text-[#0c3175]">
                  {items.length} {lang === 'th' ? 'รายการ' : 'items'}
                </span>
              </h2>

              {/* Items List */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1 mb-4">
                {items.map((item, idx) => {
                  const itemFee = Number(item.shippingFee || item.product?.shippingFee || item.variant?.shippingFee || 0);
                  return (
                    <div key={idx} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-50">
                      <div className="flex-1 pr-2 truncate">
                        <div className="font-bold text-slate-800 truncate">{item.name || item.product?.name}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2">
                          <span>{lang === 'th' ? 'จำนวน' : 'Qty'}: {item.quantity}</span>
                          {item.variantName && (
                            <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-bold">
                              {item.variantName}
                            </span>
                          )}
                          {itemFee > 0 && (
                            <span className="text-amber-700 bg-amber-50 border border-amber-200 px-1 py-0.2 rounded text-[10px]">
                              {lang === 'th' ? `ค่าส่ง ฿${itemFee}/ชิ้น` : `Ship ฿${itemFee}/ea`}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="font-black text-slate-900 font-mono shrink-0">
                        ฿{Number(item.price || item.product?.price || 0 * item.quantity).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  );
                })}
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
                    className="px-4 py-1.5 bg-[#0c3175] hover:bg-[#051124] text-white text-xs font-bold rounded-xl shrink-0"
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
                <div>
                  <div className="flex justify-between text-slate-600">
                    <span className="flex items-center gap-1">
                      <span>{t('shippingFee')}</span>
                      <span className="text-[10px] bg-blue-100 text-[#0c3175] px-1.5 py-0.2 rounded font-bold">
                        {selectedShipping.name}
                      </span>
                    </span>
                    <span className="font-mono font-bold text-[#0c3175]">
                      +฿{shippingFeeNum.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  {productSpecificShipping > 0 && !isFreeShipping && (
                    <div className="text-[10px] text-amber-700 mt-0.5 text-right">
                      {lang === 'th' ? `(รวมค่าส่งสินค้าตามขนาด/น้ำหนัก ฿${productSpecificShipping.toLocaleString('th-TH', { minimumFractionDigits: 2 })})` : `(Includes item weight/size shipping ฿${productSpecificShipping.toLocaleString('th-TH', { minimumFractionDigits: 2 })})`}
                    </div>
                  )}
                  {isFreeShipping && (
                    <div className="text-[10px] text-emerald-600 mt-0.5 text-right font-semibold">
                      {lang === 'th' ? '✓ จัดส่งฟรี (ยอดเกิน ฿2,000)' : '✓ Free shipping (over ฿2,000)'}
                    </div>
                  )}
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
                    <span className="text-xl font-black text-[#ea580c] font-mono">
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
                className="w-full mt-6 py-3.5 rounded-full bg-[#ea580c] hover:bg-[#ea580c] text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2"
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
