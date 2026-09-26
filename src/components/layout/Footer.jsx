import React, { useState } from 'react';
import { Mail, MessageCircle, Phone, MapPin, Clock, ShieldCheck, FileText, ArrowLeftRight, Truck, Lock } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { useLanguage } from '../../context/LanguageContext';
import PolicyModal from '../common/PolicyModal';

export const Footer = ({ navigate }) => {
  const [activePolicy, setActivePolicy] = useState(null);
  const { settings } = useSettings();
  const { lang } = useLanguage();
  const branding = settings?.branding || {};
  const storeInfo = settings?.storeInfo || {};
  const policies = settings?.policies || {};

  const hasPolicy = (type) => {
    let content = '';
    if (type === 'return') {
      content = lang === 'en' ? policies.returnPolicyEn : policies.returnPolicyTh;
    } else if (type === 'warranty') {
      content = lang === 'en' ? policies.warrantyPolicyEn : policies.warrantyPolicyTh;
    } else if (type === 'shipping') {
      content = lang === 'en' ? policies.shippingPolicyEn : policies.shippingPolicyTh;
    } else if (type === 'privacy') {
      content = lang === 'en' ? policies.privacyPolicyEn : policies.privacyPolicyTh;
    } else if (type === 'terms') {
      content = lang === 'en' ? policies.termsOfServiceEn : policies.termsOfServiceTh;
    }
    return Boolean(content && typeof content === 'string' && content.trim().length > 0);
  };

  const address = storeInfo.addressTh || storeInfo.addressEn || storeInfo.address || 'เลขที่ 88/9 อาคารโมเบกซ์ ถนนพระราม 9 แขวงห้วยขวาง เขตห้วยขวาง กรุงเทพฯ 10310';
  const companyName = storeInfo.companyNameTh || storeInfo.companyNameEn || storeInfo.companyName || 'บริษัท โมเบกซ์ ออโต้พาร์ท จำกัด';
  const phone = storeInfo.phone || storeInfo.hotline || '02-123-4567';
  const email = storeInfo.email || 'support@mobex-autoparts.com';
  const hours = storeInfo.businessHoursTh || storeInfo.businessHoursEn || storeInfo.businessHours || 'จันทร์ - เสาร์: 08:30 - 18:00 น. (หยุดวันอาทิตย์)';
  const taxId = storeInfo.taxId || '0105565012345';

  return (
    <footer className="bg-[#051124] text-white font-sans mt-0 border-t border-[#0e2756]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Compact Responsive Grid: 2-3 cols on mobile/tablet, balanced on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* Section 1: Store Branding & Quick Contact (5 cols on desktop) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <button
                onClick={() => navigate?.('home')}
                className="flex items-center focus:outline-none cursor-pointer"
              >
                {branding.logoUrl && branding.logoUrl !== '/logo.png' ? (
                  <img
                    src={branding.logoUrl}
                    alt={companyName}
                    className="max-h-9 sm:max-h-10 max-w-[180px] object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-start">
                    <div className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-1.5">
                      <span className="text-[#ea580c]">ADNEX</span>
                      <span>{branding.siteNameTh ? branding.siteNameTh.replace('ADNEX', '').trim() : 'AUTO PARTS'}</span>
                    </div>
                  </div>
                )}
              </button>

              {/* Social Icons Inline */}
              <div className="flex items-center gap-1.5">
                {storeInfo.facebookUrl && storeInfo.facebookUrl.trim() !== '' && (
                  <a
                    href={storeInfo.facebookUrl}
                    target="_blank"
                    rel="noreferrer"
                    title="Facebook"
                    className="w-7 h-7 rounded-full bg-[#3b5998] flex items-center justify-center hover:opacity-85 transition-opacity"
                  >
                    <svg className="w-3.5 h-3.5 text-white fill-current" viewBox="0 0 24 24">
                      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                    </svg>
                  </a>
                )}
                {storeInfo.lineId && storeInfo.lineId.trim() !== '' && (
                  <a
                    href={`https://line.me/R/ti/p/${encodeURIComponent(storeInfo.lineId)}`}
                    target="_blank"
                    rel="noreferrer"
                    title={`LINE: ${storeInfo.lineId}`}
                    className="w-7 h-7 rounded-full bg-[#00c300] flex items-center justify-center hover:opacity-85 transition-opacity"
                  >
                    <svg className="w-3.5 h-3.5 text-white fill-current" viewBox="0 0 24 24">
                      <path d="M22 10.4c0-4.32-4.48-7.8-10-7.8S2 6.08 2 10.4c0 3.86 3.51 7.14 8.24 7.73.34.07.8.23.92.53.11.27.04.69.02.86-.02.16-.14.88-.17 1.04-.04.19-.18.88.75.49.92-.39 5-2.95 7.02-5.18 2.05-2.28 3.22-4.04 3.22-5.47z" />
                    </svg>
                  </a>
                )}
                {storeInfo.tiktokUrl && storeInfo.tiktokUrl.trim() !== '' && (
                  <a
                    href={storeInfo.tiktokUrl}
                    target="_blank"
                    rel="noreferrer"
                    title="TikTok"
                    className="w-7 h-7 rounded-full bg-black border border-slate-700 flex items-center justify-center hover:opacity-85 transition-opacity"
                  >
                    <svg className="w-3.5 h-3.5 text-white fill-current" viewBox="0 0 24 24">
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 2.63-1.19 5.14-3.15 6.84-2.06 1.81-4.93 2.58-7.58 2.06-2.61-.51-4.88-2.28-5.99-4.66-1.12-2.39-1-5.26.27-7.57 1.19-2.19 3.32-3.79 5.75-4.26V13.3c-1.19.22-2.3.88-3.07 1.83-.8.96-1.18 2.25-1.04 3.49.12 1.25.75 2.42 1.74 3.16 1.05.81 2.46 1.09 3.75.76 1.23-.32 2.27-1.18 2.82-2.31.55-1.16.63-2.52.61-3.79-.06-4.52-.02-9.05-.03-13.57.01-1.01.01-1.01 1.01-1.01z" />
                    </svg>
                  </a>
                )}
                {storeInfo.instagramUrl && storeInfo.instagramUrl.trim() !== '' && (
                  <a
                    href={storeInfo.instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    title="Instagram"
                    className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center hover:opacity-85 transition-opacity"
                  >
                    <svg className="w-3.5 h-3.5 text-white fill-current" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>
                )}
                {storeInfo.youtubeUrl && storeInfo.youtubeUrl.trim() !== '' && (
                  <a
                    href={storeInfo.youtubeUrl}
                    target="_blank"
                    rel="noreferrer"
                    title="YouTube"
                    className="w-7 h-7 rounded-full bg-[#ff0000] flex items-center justify-center hover:opacity-85 transition-opacity"
                  >
                    <svg className="w-3.5 h-3.5 text-white fill-current" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  </a>
                )}
              </div>
            </div>

            {/* Compact Store Contact Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1.5 text-[11px] text-slate-300 pt-1">
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#ea580c] shrink-0" />
                <span className="font-bold text-white font-mono">{phone}</span>
                <span className="text-slate-400 text-[10px]">(ฝ่ายขาย)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="text-slate-300 truncate">{email}</span>
              </div>
              <div className="flex items-center gap-1.5 sm:col-span-2 text-[10px] text-slate-400">
                <Clock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>{hours}</span>
              </div>
              <div className="flex items-start gap-1.5 sm:col-span-2 text-[10px] text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                <span className="leading-snug line-clamp-1">{address}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Organized Multi-Column Links (7 cols on desktop, 2-3 cols on mobile) */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 pt-2 lg:pt-0">
            
            {/* Col A: Navigation */}
            <div>
              <h4 className="font-bold text-xs text-white mb-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ea580c]"></span>
                <span>{lang === 'en' ? 'Quick Menu' : 'เมนูหลัก'}</span>
              </h4>
              <ul className="space-y-1.5 text-[11px] text-slate-400">
                <li>
                  <button onClick={() => navigate?.('home')} className="hover:text-white transition-colors text-left cursor-pointer">
                    {lang === 'en' ? 'Home' : 'หน้าหลัก'}
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate?.('product-list')} className="hover:text-white transition-colors text-left cursor-pointer">
                    {lang === 'en' ? 'All Products' : 'สินค้าทั้งหมด'}
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate?.('articles')} className="hover:text-white transition-colors text-left cursor-pointer">
                    {lang === 'en' ? 'News & Articles' : 'ข่าวสารและบทความ'}
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate?.('contact')} className="hover:text-white transition-colors text-left text-blue-300 font-semibold cursor-pointer">
                    {lang === 'en' ? 'Contact Us' : 'ติดต่อเรา'}
                  </button>
                </li>
              </ul>
            </div>

            {/* Col B: Delivery & Warranty */}
            <div>
              <h4 className="font-bold text-xs text-white mb-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                <span>{lang === 'en' ? 'Delivery & Warranty' : 'การจัดส่ง & ประกัน'}</span>
              </h4>
              <ul className="space-y-1.5 text-[11px] text-slate-400">
                {hasPolicy('shipping') && (
                  <li>
                    <button onClick={() => setActivePolicy('shipping')} className="hover:text-white transition-colors text-left flex items-center gap-1 cursor-pointer">
                      <Truck className="w-3 h-3 text-blue-400 shrink-0" />
                      <span>{lang === 'en' ? 'Nationwide Delivery' : 'จัดส่งทั่วประเทศ'}</span>
                    </button>
                  </li>
                )}
                {hasPolicy('warranty') && (
                  <li>
                    <button onClick={() => setActivePolicy('warranty')} className="hover:text-white transition-colors text-left flex items-center gap-1 cursor-pointer">
                      <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span>{lang === 'en' ? '100% Genuine' : 'รับประกันอะไหล่แท้'}</span>
                    </button>
                  </li>
                )}
                {hasPolicy('return') && (
                  <li>
                    <button onClick={() => setActivePolicy('return')} className="hover:text-white transition-colors text-left flex items-center gap-1 cursor-pointer">
                      <ArrowLeftRight className="w-3 h-3 text-[#f97316] shrink-0" />
                      <span>{lang === 'en' ? 'Returns Policy' : 'เงื่อนไขการคืนสินค้า'}</span>
                    </button>
                  </li>
                )}
                {taxId && taxId.trim() !== '' && (
                  <li className="text-[10px] text-slate-400 flex items-center gap-1 pt-0.5">
                    <FileText className="w-3 h-3 text-slate-500 shrink-0" />
                    <span>ออกใบกำกับภาษีได้</span>
                  </li>
                )}
              </ul>
            </div>

            {/* Col C: Support & Legal */}
            <div className="col-span-2 sm:col-span-1">
              <h4 className="font-bold text-xs text-white mb-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>{lang === 'en' ? 'Policies & Legal' : 'นโยบาย & กฎหมาย'}</span>
              </h4>
              <ul className="space-y-1.5 text-[11px] text-slate-400">
                {hasPolicy('privacy') && (
                  <li>
                    <button onClick={() => setActivePolicy('privacy')} className="hover:text-white transition-colors text-left flex items-center gap-1 cursor-pointer">
                      <Lock className="w-3 h-3 text-blue-400 shrink-0" />
                      <span>{lang === 'en' ? 'PDPA Privacy' : 'นโยบายข้อมูลส่วนบุคคล (PDPA)'}</span>
                    </button>
                  </li>
                )}
                {hasPolicy('terms') && (
                  <li>
                    <button onClick={() => setActivePolicy('terms')} className="hover:text-white transition-colors text-left flex items-center gap-1 cursor-pointer">
                      <FileText className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{lang === 'en' ? 'Terms of Service' : 'ข้อกำหนดการให้บริการ'}</span>
                    </button>
                  </li>
                )}
                {taxId && taxId.trim() !== '' && (
                  <li className="pt-1 text-[10px] text-slate-400">
                    <div>Tax ID: <span className="font-mono text-slate-200 font-semibold">{taxId}</span></div>
                  </li>
                )}
              </ul>
            </div>

          </div>

        </div>

        {/* Slim Bottom Copyright & Payment Badges */}
        <div className="mt-5 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-slate-400">
          <div>
            © {new Date().getFullYear()} {companyName}. All rights reserved.
          </div>
          
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] text-slate-500">{lang === 'en' ? 'Secured by:' : 'ระบบความปลอดภัย:'}</span>
            <span className="bg-white/95 text-[#0b1f42] font-black text-[9px] px-1.5 py-0.5 rounded-xs">VISA</span>
            <span className="bg-white/95 text-red-600 font-black text-[9px] px-1.5 py-0.5 rounded-xs">Mastercard</span>
            <span className="bg-[#0c244d] border border-blue-400/40 text-blue-300 font-bold text-[8px] px-1.5 py-0.5 rounded-xs">PromptPay</span>
          </div>
        </div>
      </div>

      {/* Policy Modal with Database Content */}
      <PolicyModal
        policyType={activePolicy}
        isOpen={Boolean(activePolicy)}
        onClose={() => setActivePolicy(null)}
      />
    </footer>
  );
};

export default Footer;
