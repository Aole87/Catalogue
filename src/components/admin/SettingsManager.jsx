import React, { useState, useEffect } from 'react';
import {
  Settings,
  CreditCard,
  QrCode,
  Building2,
  Truck,
  Globe,
  Save,
  CheckCircle2,
  AlertCircle,
  Key,
  Shield,
  Menu,
  Plus,
  Trash2,
  Sliders
} from 'lucide-react';
import ApiClient from '../../utils/apiClient';

export default function SettingsManager() {
  const [activeSubTab, setActiveSubTab] = useState('payment');
  const [loading, setLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Settings State
  const [paymentSettings, setPaymentSettings] = useState({
    promptpay: { enabled: true, accountNo: '081-234-5678', accountName: 'MOBEX AUTO PARTS CO., LTD.' },
    bankTransfer: { enabled: true, bankName: 'Kasikorn Bank (KBANK)', accountNo: '123-4-56789-0', branch: 'Siam Paragon' },
    stripe: { enabled: true, publicKey: 'pk_test_sample_12345', secretKey: 'sk_test_••••••••', testMode: true },
    slipVerification: { enabled: true, apiKey: 'slip_verify_live_key_998877' },
  });

  const [shippingSettings, setShippingSettings] = useState({
    methods: [
      { id: 'ship-1', code: 'FLASH', name: 'Flash Express', fee: 45, estDays: '1-2 Days', active: true },
      { id: 'ship-2', code: 'KERRY', name: 'Kerry Express', fee: 60, estDays: '1-2 Days', active: true },
      { id: 'ship-3', code: 'SCG', name: 'SCG Express (Cold/Heavy)', fee: 75, estDays: '2-3 Days', active: true },
      { id: 'ship-4', code: 'STANDARD', name: 'Standard Delivery', fee: 35, estDays: '2-4 Days', active: true },
    ],
    freeShippingThreshold: 2000,
  });

  const [generalSettings, setGeneralSettings] = useState({
    membersOnlyPricing: true,
    guestCheckoutEnabled: false,
    tickerTextTh: 'Lifestyle : รับส่วนลดพิเศษ 10% สำหรับสมาชิกตรงรุ่นมากกว่า 100+ แบรนด์ชั้นนำ',
    tickerTextEn: 'Lifestyle : Extra 10% off member exclusive for 100+ top brand deals',
  });

  const [menus, setMenus] = useState([
    { labelTh: 'หน้าหลัก', labelEn: 'Home', target: 'home' },
    { labelTh: 'สินค้าทั้งหมด', labelEn: 'Tech & Shop', target: 'product-list' },
    { labelTh: 'โปรโมชันพิเศษ', labelEn: 'Promos & Deals', target: 'product-list' },
    { labelTh: 'เลือกรุ่นรถยนต์', labelEn: 'Vehicle Fitment', target: 'vehicle-selector' },
    { labelTh: 'บทความ & ข่าวสาร', labelEn: 'Articles & News', target: 'articles' },
  ]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const res = await ApiClient.get('/settings');
        if (res?.data?.settings || res?.settings) {
          const s = res.data?.settings || res.settings;
          if (s.payment) setPaymentSettings((prev) => ({ ...prev, ...s.payment }));
          if (s.shipping) setShippingSettings((prev) => ({ ...prev, ...s.shipping }));
          if (s.general) setGeneralSettings((prev) => ({ ...prev, ...s.general }));
          if (s.menus) setMenus(s.menus);
        }
      } catch (e) {
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      setSavedSuccess(false);
      await ApiClient.put('/settings', {
        payment: paymentSettings,
        shipping: shippingSettings,
        general: generalSettings,
        menus,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e) {
      alert('บันทึกข้อมูลไม่สำเร็จ: ' + (e.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#0d3c90] mb-1">
            <Settings className="w-4 h-4" />
            <span>Backoffice Control Panel</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            การตั้งค่าระบบ & Payment API Settings
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            จัดการเกตเวย์การชำระเงิน API, การตั้งค่าขนส่ง, การซ่อนราคาสมาชิก และเมนูเว็บไซต์
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          disabled={loading}
          className="px-6 py-2.5 rounded-full bg-[#f97316] hover:bg-[#ea580c] text-white text-xs font-extrabold shadow-md transition-all flex items-center gap-2 shrink-0"
        >
          {loading ? (
            <span>กำลังบันทึก...</span>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>บันทึกการตั้งค่า</span>
            </>
          )}
        </button>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>บันทึกการตั้งค่าระบบและ Payment API สำเร็จเรียบร้อยแล้ว!</span>
        </div>
      )}

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200/90 text-xs font-bold overflow-x-auto">
        {[
          { id: 'payment', label: '💳 Payment API & Gateways', icon: CreditCard },
          { id: 'shipping', label: '🚛 ค่าจัดส่ง & Shipping Rules', icon: Truck },
          { id: 'access', label: '🔒 การจำกัดสิทธิ์ & ราคาเฉพาะสมาชิก', icon: Shield },
          { id: 'menu', label: '🌐 จัดการเมนูหน้าเว็บ & ประกาศ', icon: Menu },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
              activeSubTab === tab.id
                ? 'bg-[#0d3c90] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 1. Payment API & Gateways Tab */}
      {activeSubTab === 'payment' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* PromptPay Config */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <QrCode className="w-5 h-5 text-[#0d3c90]" />
                <span>PromptPay QR Code API</span>
              </div>
              <input
                type="checkbox"
                checked={paymentSettings.promptpay.enabled}
                onChange={(e) => setPaymentSettings({
                  ...paymentSettings,
                  promptpay: { ...paymentSettings.promptpay, enabled: e.target.checked }
                })}
                className="w-4 h-4 text-[#0d3c90] rounded focus:ring-0 cursor-pointer"
              />
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">หมายเลขพร้อมเพย์ (ID/Mobile)</label>
                <input
                  type="text"
                  value={paymentSettings.promptpay.accountNo}
                  onChange={(e) => setPaymentSettings({
                    ...paymentSettings,
                    promptpay: { ...paymentSettings.promptpay, accountNo: e.target.value }
                  })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-mono text-slate-900"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">ชื่อบัญชีรับเงิน</label>
                <input
                  type="text"
                  value={paymentSettings.promptpay.accountName}
                  onChange={(e) => setPaymentSettings({
                    ...paymentSettings,
                    promptpay: { ...paymentSettings.promptpay, accountName: e.target.value }
                  })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Bank Transfer Config */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <Building2 className="w-5 h-5 text-[#0d3c90]" />
                <span>Bank Transfer (โอนเงินธนาคาร)</span>
              </div>
              <input
                type="checkbox"
                checked={paymentSettings.bankTransfer.enabled}
                onChange={(e) => setPaymentSettings({
                  ...paymentSettings,
                  bankTransfer: { ...paymentSettings.bankTransfer, enabled: e.target.checked }
                })}
                className="w-4 h-4 text-[#0d3c90] rounded focus:ring-0 cursor-pointer"
              />
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">ชื่อธนาคาร</label>
                <input
                  type="text"
                  value={paymentSettings.bankTransfer.bankName}
                  onChange={(e) => setPaymentSettings({
                    ...paymentSettings,
                    bankTransfer: { ...paymentSettings.bankTransfer, bankName: e.target.value }
                  })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">เลขที่บัญชี</label>
                <input
                  type="text"
                  value={paymentSettings.bankTransfer.accountNo}
                  onChange={(e) => setPaymentSettings({
                    ...paymentSettings,
                    bankTransfer: { ...paymentSettings.bankTransfer, accountNo: e.target.value }
                  })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-mono text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Stripe Credit Card Gateway Config */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <CreditCard className="w-5 h-5 text-[#0d3c90]" />
                <span>Stripe Gateway (บัตรเครดิต)</span>
              </div>
              <input
                type="checkbox"
                checked={paymentSettings.stripe.enabled}
                onChange={(e) => setPaymentSettings({
                  ...paymentSettings,
                  stripe: { ...paymentSettings.stripe, enabled: e.target.checked }
                })}
                className="w-4 h-4 text-[#0d3c90] rounded focus:ring-0 cursor-pointer"
              />
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Stripe Public Key</label>
                <input
                  type="text"
                  value={paymentSettings.stripe.publicKey}
                  onChange={(e) => setPaymentSettings({
                    ...paymentSettings,
                    stripe: { ...paymentSettings.stripe, publicKey: e.target.value }
                  })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-mono text-slate-900"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Stripe Secret Key</label>
                <input
                  type="password"
                  value={paymentSettings.stripe.secretKey}
                  onChange={(e) => setPaymentSettings({
                    ...paymentSettings,
                    stripe: { ...paymentSettings.stripe, secretKey: e.target.value }
                  })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-mono text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Slip Verification API Config */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <Key className="w-5 h-5 text-[#f97316]" />
                <span>Auto Slip Verification API Key</span>
              </div>
              <input
                type="checkbox"
                checked={paymentSettings.slipVerification.enabled}
                onChange={(e) => setPaymentSettings({
                  ...paymentSettings,
                  slipVerification: { ...paymentSettings.slipVerification, enabled: e.target.checked }
                })}
                className="w-4 h-4 text-[#0d3c90] rounded focus:ring-0 cursor-pointer"
              />
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">API Key สำหรับตรวจสอบสลิปอัตโนมัติ</label>
                <input
                  type="text"
                  value={paymentSettings.slipVerification.apiKey}
                  onChange={(e) => setPaymentSettings({
                    ...paymentSettings,
                    slipVerification: { ...paymentSettings.slipVerification, apiKey: e.target.value }
                  })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-mono text-slate-900"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Shipping Calculation Tab */}
      {activeSubTab === 'shipping' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-black text-slate-900 mb-1">
              การจัดการผู้ให้บริการขนส่ง & คำนวณค่าจัดส่งแยกต่างหาก
            </h3>
            <p className="text-xs text-slate-500">
              ค่าขนส่งจะถูกคำนวณแยกตามผู้ให้บริการที่สมาชิกเลือกก่อนรวมยอดชำระสุทธิ
            </p>
          </div>

          <div className="space-y-3">
            {shippingSettings.methods.map((method, idx) => (
              <div key={method.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <Truck className="w-5 h-5 text-[#0d3c90]" />
                  <div>
                    <input
                      type="text"
                      value={method.name}
                      onChange={(e) => {
                        const updated = [...shippingSettings.methods];
                        updated[idx].name = e.target.value;
                        setShippingSettings({ ...shippingSettings, methods: updated });
                      }}
                      className="font-bold text-slate-900 bg-white border border-slate-200 rounded-lg px-2.5 py-1"
                    />
                    <div className="text-[11px] text-slate-500 mt-1">รหัส: {method.code}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div>
                    <label className="text-[10px] text-slate-500 block">ค่าขนส่ง (บาท)</label>
                    <input
                      type="number"
                      value={method.fee}
                      onChange={(e) => {
                        const updated = [...shippingSettings.methods];
                        updated[idx].fee = parseFloat(e.target.value) || 0;
                        setShippingSettings({ ...shippingSettings, methods: updated });
                      }}
                      className="w-24 font-mono font-bold text-slate-900 bg-white border border-slate-200 rounded-lg px-2.5 py-1"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 block">ระยะเวลาจัดส่ง</label>
                    <input
                      type="text"
                      value={method.estDays}
                      onChange={(e) => {
                        const updated = [...shippingSettings.methods];
                        updated[idx].estDays = e.target.value;
                        setShippingSettings({ ...shippingSettings, methods: updated });
                      }}
                      className="w-24 font-bold text-slate-900 bg-white border border-slate-200 rounded-lg px-2.5 py-1"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Access & Member Pricing Restrictions Tab */}
      {activeSubTab === 'access' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-black text-slate-900 mb-1">
              นโยบายการแสดงราคาและระงับการสั่งซื้อ Guest (Requirement 6)
            </h3>
            <p className="text-xs text-slate-500">
              กำหนดให้แสดงราคาสินค้าเฉพาะสมาชิกที่ล็อกอินแล้วเท่านั้น และไม่มีการสั่งซื้อแบบ Guest
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-amber-900">แสดงราคาสินค้าเฉพาะสมาชิกเท่านั้น (Members-Only Pricing)</div>
                <div className="text-[11px] text-amber-700">ซ่อนราคาน่าเว็บสำหรับผู้เข้าชมทั่วไป (Guest) และแสดงป้าย 🔒 เข้าสู่ระบบเพื่อดูราคา</div>
              </div>
              <input
                type="checkbox"
                checked={generalSettings.membersOnlyPricing}
                onChange={(e) => setGeneralSettings({ ...generalSettings, membersOnlyPricing: e.target.checked })}
                className="w-5 h-5 text-[#0d3c90] rounded"
              />
            </div>

            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-rose-900">ปิดการสั่งซื้อแบบ Guest (Disable Guest Checkout)</div>
                <div className="text-[11px] text-rose-700">บังคับให้ผู้ใช้เข้าสู่ระบบหรือสมัครสมาชิกก่อนเข้าหน้า Checkout</div>
              </div>
              <input
                type="checkbox"
                checked={!generalSettings.guestCheckoutEnabled}
                onChange={(e) => setGeneralSettings({ ...generalSettings, guestCheckoutEnabled: !e.target.checked })}
                className="w-5 h-5 text-rose-600 rounded"
              />
            </div>
          </div>
        </div>
      )}

      {/* 4. Navigation Menu & Announcement Ticker Tab */}
      {activeSubTab === 'menu' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-black text-slate-900 mb-1">
              จัดการเมนูหน้าเว็บ & ข้อความประกาศ Ticker (Requirement 1 & 2)
            </h3>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">ข้อความประกาศ Ticker (ภาษาไทย)</label>
              <input
                type="text"
                value={generalSettings.tickerTextTh}
                onChange={(e) => setGeneralSettings({ ...generalSettings, tickerTextTh: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">ข้อความประกาศ Ticker (English)</label>
              <input
                type="text"
                value={generalSettings.tickerTextEn}
                onChange={(e) => setGeneralSettings({ ...generalSettings, tickerTextEn: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
