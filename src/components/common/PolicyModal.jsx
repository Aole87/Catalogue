import React from 'react';
import { X, ShieldCheck, FileText, Truck, ArrowLeftRight, Lock } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { useLanguage } from '../../context/LanguageContext';

export default function PolicyModal({ policyType, isOpen, onClose }) {
  const { settings } = useSettings();
  const { lang } = useLanguage();

  if (!isOpen || !policyType) return null;

  const policies = settings?.policies || {};

  const getPolicyDetails = () => {
    switch (policyType) {
      case 'return':
        return {
          titleTh: 'นโยบายการเปลี่ยนและคืนสินค้า',
          titleEn: 'Return & Refund Policy',
          icon: ArrowLeftRight,
          content: lang === 'en' ? policies.returnPolicyEn : policies.returnPolicyTh,
        };
      case 'warranty':
        return {
          titleTh: 'นโยบายการรับประกันสินค้าของแท้ 100%',
          titleEn: '100% Genuine Guarantee & Warranty',
          icon: ShieldCheck,
          content: lang === 'en' ? policies.warrantyPolicyEn : policies.warrantyPolicyTh,
        };
      case 'shipping':
        return {
          titleTh: 'นโยบายและเงื่อนไขการจัดส่งสินค้า',
          titleEn: 'Shipping & Delivery Policy',
          icon: Truck,
          content: lang === 'en' ? policies.shippingPolicyEn : policies.shippingPolicyTh,
        };
      case 'privacy':
        return {
          titleTh: 'นโยบายคุ้มครองข้อมูลส่วนบุคคล (PDPA)',
          titleEn: 'Privacy Policy (PDPA Compliance)',
          icon: Lock,
          content: lang === 'en' ? policies.privacyPolicyEn : policies.privacyPolicyTh,
        };
      case 'terms':
      default:
        return {
          titleTh: 'ข้อกำหนดและเงื่อนไขการใช้บริการ',
          titleEn: 'Terms of Service',
          icon: FileText,
          content: lang === 'en' ? policies.termsOfServiceEn : policies.termsOfServiceTh,
        };
    }
  };

  const details = getPolicyDetails();
  if (!details.content || typeof details.content !== 'string' || !details.content.trim()) return null;
  const Icon = details.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-[#0c3175] to-[#040e1f] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-[#f97316]">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg">
                {lang === 'en' ? details.titleEn : details.titleTh}
              </h3>
              <p className="text-[11px] text-blue-200">
                {settings?.branding?.siteNameTh || settings?.branding?.siteNameEn || 'MOBEX Auto Parts'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed font-sans whitespace-pre-line">
          {details.content || (
            <p className="text-slate-400 italic">
              {lang === 'en' ? 'Policy content not configured yet.' : 'ยังไม่มีการกำหนดข้อความนโยบาย'}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-400 font-semibold">
            {settings?.storeInfo?.companyNameTh || 'MOBEX Auto Parts Co., Ltd.'}
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#0c3175] hover:bg-blue-900 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
          >
            {lang === 'en' ? 'Close' : 'ปิดหน้าต่าง'}
          </button>
        </div>
      </div>
    </div>
  );
}
