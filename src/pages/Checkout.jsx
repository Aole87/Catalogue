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
  Check,
  Minus,
  Plus,
  Trash2
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
  const { cart, items, totals, clearCart, refreshCart, updateQuantity, removeItem } = useCart();
  const { t, lang } = useLanguage();
  const { settings } = useSettings();

  const isPromptPayActive = settings?.payment?.promptpay?.enabled === true;
  const isBankTransferActive = settings?.payment?.bankTransfer?.enabled !== false;
  const isStripeActive = Boolean(settings?.payment?.stripe?.enabled);

  const availablePaymentMethods = [
    isPromptPayActive && {
      id: 'PROMPTPAY',
      label: 'PromptPay QR',
      sub: 'สแกน QR Code รับเงินทันที',
      icon: QrCode,
    },
    isBankTransferActive && {
      id: 'BANK_TRANSFER',
      label: 'โอนผ่านธนาคาร',
      sub: 'แนบสลิปโอนเงิน',
      icon: Building2,
    },
    isStripeActive && {
      id: 'CREDIT_CARD',
      label: 'บัตรเครดิต/เดบิต',
      sub: 'ชำระออนไลน์ปลอดภัย',
      icon: CreditCard,
    },
  ].filter(Boolean);

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
    paymentMethod: availablePaymentMethods[0]?.id || (isBankTransferActive ? 'BANK_TRANSFER' : isPromptPayActive ? 'PROMPTPAY' : ''),
    needInvoice: false,
    invoiceRecipientName: user?.companyName || (user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : ''),
    invoiceTaxId: user?.taxId || '',
    invoiceAddress: '',
  });

  // Ensure formData.paymentMethod synchronizes with currently enabled payment methods
  useEffect(() => {
    if (availablePaymentMethods.length > 0) {
      if (!availablePaymentMethods.some(pm => pm.id === formData.paymentMethod)) {
        setFormData(prev => ({ ...prev, paymentMethod: availablePaymentMethods[0].id }));
      }
    } else {
      setFormData(prev => ({ ...prev, paymentMethod: '' }));
    }
  }, [availablePaymentMethods.length, isPromptPayActive, isBankTransferActive, isStripeActive]);

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

  // Free shipping configuration from Settings
  const freeShippingEnabled = Boolean(settings?.shipping?.freeShippingEnabled);
  const freeThreshold = Number(settings?.shipping?.freeShippingThreshold || 0);
  const applyFreeShippingToCustomItems = Boolean(settings?.shipping?.applyFreeShippingToCustomItems);

  // Product-specific / SKU variant-specific shipping calculation
  const productSpecificShipping = (items || []).reduce((acc, item) => {
    const fee = Number(item.shippingFee || item.product?.shippingFee || item.variant?.shippingFee || 0);
    return acc + (fee * (item.quantity || 1));
  }, 0);

  const hasCustomShipping = productSpecificShipping > 0;
  const isFreeShipping = freeShippingEnabled && freeThreshold > 0 && subtotalNum >= freeThreshold && (!hasCustomShipping || applyFreeShippingToCustomItems);
  const baseShippingFee = hasCustomShipping ? 0 : Number(selectedShipping?.fee || 0);
  const totalCalculatedShipping = hasCustomShipping ? productSpecificShipping : baseShippingFee;
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
    if (!formData.paymentMethod) {
      setErrorMessage(lang === 'th' ? 'กรุณาเลือกวิธีการชำระเงิน หรือติดต่อผู้ดูแลระบบหากยังไม่มีช่องทางชำระเงินเปิดใช้งาน' : 'Please select a payment method or contact admin.');
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

            {/* Standalone Shipping Provider Selector or Product-Specific Rate (Requirement) */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
              <h2 className="text-base font-black text-[#0e1932] mb-1 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#ea580c]" />
                  <span>2. {hasCustomShipping ? (lang === 'th' ? 'ค่าจัดส่งสินค้าตามรายการ' : 'Product-Specific Shipping') : t('selectCarrier')}</span>
                </span>
                <span className="text-xs text-[#0c3175] font-bold">
                  {hasCustomShipping ? (lang === 'th' ? 'คิดตามอัตราของสินค้า' : 'Item Rate') : (lang === 'th' ? 'คำนวณแยกต่างหาก' : 'Calculated Separately')}
                </span>
              </h2>

              {hasCustomShipping ? (
                <div className="mt-3 p-4 sm:p-5 bg-blue-50/70 border border-blue-200/80 rounded-2xl flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#0c3175] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <h4 className="text-xs sm:text-sm font-bold text-[#0c3175]">
                        {lang === 'th' ? 'คิดค่าจัดส่งตามอัตราที่ระบุในรายการสินค้า (Fixed Product/SKU Shipping)' : 'Calculated by Item/SKU Shipping Rate'}
                      </h4>
                      <span className="text-sm font-black text-slate-900 font-mono">
                        {isFreeShipping ? (
                          <span className="text-emerald-600 font-black">฿0.00 (ส่งฟรี)</span>
                        ) : (
                          `฿${productSpecificShipping.toLocaleString('th-TH', { minimumFractionDigits: 2 })}`
                        )}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {lang === 'th'
                        ? 'สินค้านี้กำหนดอัตราค่าจัดส่งตามขนาดและน้ำหนักของแต่ละรายการ/รหัส SKU โดยตรง ไม่จำเป็นต้องเลือกบริษัทขนส่งเพิ่มเติม'
                        : 'This order uses predefined shipping rates based on item sizes and weights. Carrier selection is not required.'}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-[11px] text-slate-500 mb-4">
                    {lang === 'th' ? 'เลือกผู้ให้บริการขนส่ง ค่าจัดส่งจะถูกคำนวณแยกและรวมกับราคาสินค้าสุทธิ' : 'Select carrier. Shipping fee is calculated separately and added to total.'}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {availableShipping.map((provider) => {
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
                </>
              )}
            </div>

            {/* Payment Method Selector */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
              <h2 className="text-base font-black text-[#0e1932] flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#0c3175]" />
                <span>3. {lang === 'th' ? 'วิธีการชำระเงิน' : 'Payment Method'}</span>
              </h2>

              {availablePaymentMethods.length === 0 ? (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{lang === 'th' ? 'ไม่มีช่องทางการชำระเงินที่เปิดใช้งานในขณะนี้ กรุณาติดต่อผู้ดูแลระบบ' : 'No active payment methods currently available. Please contact admin.'}</span>
                </div>
              ) : (
                <div className={`grid grid-cols-1 sm:grid-cols-${Math.min(availablePaymentMethods.length, 3)} gap-3 text-xs`}>
                  {availablePaymentMethods.map((pm) => {
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
              )}

              {/* Dynamic Payment Details Hint */}
              {formData.paymentMethod === 'PROMPTPAY' && isPromptPayActive && settings?.payment?.promptpay && (
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

              {formData.paymentMethod === 'BANK_TRANSFER' && isBankTransferActive && settings?.payment?.bankTransfer && (
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

              {formData.paymentMethod === 'CREDIT_CARD' && isStripeActive && (
                <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-8 h-8 text-indigo-700" />
                    <div>
                      <div className="font-bold text-indigo-900">
                        {lang === 'th' ? 'ชำระผ่านบัตรเครดิต / เดบิต (Stripe Gateway)' : 'Pay via Credit / Debit Card (Stripe)'}
                      </div>
                      <div className="text-[11px] text-indigo-700">
                        {lang === 'th' ? 'ระบบความปลอดภัยมาตรฐานสากล PCI-DSS 3D Secure' : 'Protected by PCI-DSS 3D Secure standard'}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-1 rounded-full">
                    ปลอดภัย 100%
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
              {items.length === 0 ? (
                <div className="py-8 text-center text-slate-400 space-y-3">
                  <Package className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="text-xs font-bold text-slate-600">
                    {lang === 'th' ? 'ไม่มีสินค้าในคำสั่งซื้อ' : 'No items in order'}
                  </p>
                  <button
                    type="button"
                    onClick={() => onNavigate('product-list')}
                    className="px-4 py-2 bg-[#0c3175] text-white text-xs font-bold rounded-xl hover:bg-blue-900 transition-colors shadow-sm cursor-pointer"
                  >
                    {lang === 'th' ? '← กลับไปเลือกซื้อสินค้า' : '← Browse Products'}
                  </button>
                </div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1 mb-4 divide-y divide-slate-100">
                  {items.map((item, idx) => {
                    const title = item.productName || item.name || item.product?.name || (lang === 'th' ? 'สินค้าอะไหล่รถยนต์' : 'Auto Part Item');
                    const itemImg = item.primaryImage || item.imageUrl || item.image || item.product?.primaryImage || (Array.isArray(item.product?.images) ? item.product.images[0]?.url || item.product.images[0] : null);
                    const itemFee = Number(item.shippingFee || item.product?.shippingFee || item.variant?.shippingFee || 0);
                    const unitPriceNum = Number(item.unitPrice || item.price || item.product?.price || 0);
                    const lineTotalNum = Number(item.lineTotal || (unitPriceNum * (item.quantity || 1)));
                    const sku = item.sku || item.variantSku || item.product?.sku;
                    const brand = item.brandName || item.brand?.name || item.product?.brand?.name;

                    return (
                      <div key={item.id || idx} className="pt-3 first:pt-0 flex gap-3 group items-start sm:items-center">
                        {/* Product Thumbnail */}
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border border-slate-200/90 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0 p-1.5 shadow-2xs">
                          {itemImg ? (
                            <img
                              src={itemImg}
                              alt={title}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <Package className="w-6 h-6 text-slate-300" />
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2" title={title}>
                            {title}
                          </h4>

                          <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px] text-slate-500">
                            {brand && (
                              <span className="text-[10px] font-bold text-[#0c3175] bg-blue-50 px-1.5 py-0.2 rounded border border-blue-100">
                                {brand}
                              </span>
                            )}
                            {sku && (
                              <span className="text-[10px] font-mono text-slate-400">
                                SKU: {sku}
                              </span>
                            )}
                            {item.variantName && (
                              <span className="bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded text-[10px] font-bold">
                                {item.variantName}
                              </span>
                            )}
                            {itemFee > 0 && (
                              <span className="text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded text-[10px] font-medium">
                                {lang === 'th' ? `ค่าส่ง ฿${itemFee}/ชิ้น` : `Ship ฿${itemFee}/ea`}
                              </span>
                            )}
                          </div>

                          {/* Quantity Stepper & Remove Button */}
                          <div className="flex items-center gap-3 mt-2">
                            <div className="inline-flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50 shadow-2xs">
                              <button
                                type="button"
                                onClick={() => {
                                  if ((item.quantity || 1) <= 1) {
                                    removeItem(item.id);
                                  } else {
                                    updateQuantity(item.id, (item.quantity || 1) - 1);
                                  }
                                }}
                                className="w-5 h-5 rounded-md hover:bg-white flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                                title={lang === 'th' ? 'ลดจำนวน' : 'Decrease'}
                              >
                                <Minus className="h-2.5 w-2.5" />
                              </button>
                              <span className="w-7 text-center text-xs font-bold text-slate-800 font-mono">
                                {item.quantity || 1}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                                className="w-5 h-5 rounded-md hover:bg-white flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                                title={lang === 'th' ? 'เพิ่มจำนวน' : 'Increase'}
                              >
                                <Plus className="h-2.5 w-2.5" />
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-600 hover:bg-rose-50 px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
                              title={lang === 'th' ? 'ยกเลิกรายการสินค้านี้' : 'Remove item'}
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                              <span className="text-[10px] text-rose-600 font-bold">{lang === 'th' ? 'ลบรายการ' : 'Remove'}</span>
                            </button>
                          </div>
                        </div>

                        {/* Item Price */}
                        <div className="text-right shrink-0 pt-0.5">
                          <div className="text-xs font-black text-slate-900 font-mono">
                            ฿{lineTotalNum.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                          {(item.quantity || 1) > 1 && (
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                              ฿{unitPriceNum.toLocaleString('th-TH', { minimumFractionDigits: 2 })}/{lang === 'th' ? 'ชิ้น' : 'ea'}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

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
                        {hasCustomShipping ? (lang === 'th' ? 'ตามรายการสินค้า' : 'Item Rate') : selectedShipping.name}
                      </span>
                    </span>
                    <span className="font-mono font-bold text-[#0c3175]">
                      +฿{shippingFeeNum.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  {hasCustomShipping && !isFreeShipping && (
                    <div className="text-[10px] text-blue-700 mt-0.5 text-right font-medium">
                      {lang === 'th' ? '✓ คิดตามอัตราที่ระบุในรายการสินค้า' : '✓ Predefined product shipping rate'}
                    </div>
                  )}
                  {isFreeShipping && (
                    <div className="text-[10px] text-emerald-600 mt-0.5 text-right font-semibold">
                      {lang === 'th'
                        ? `✓ จัดส่งฟรี (ยอดเกิน ฿${freeThreshold.toLocaleString('th-TH')})`
                        : `✓ Free shipping (over ฿${freeThreshold.toLocaleString()})`}
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
                disabled={isSubmitting || items.length === 0 || availablePaymentMethods.length === 0}
                className="w-full mt-6 py-3.5 rounded-full bg-[#ea580c] hover:bg-[#ea580c] text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:bg-slate-300 disabled:cursor-not-allowed"
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
