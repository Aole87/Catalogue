import React from 'react';
import {
  Phone, Mail, MapPin, Clock, MessageSquare, CheckCircle2,
  ChevronRight, Building2, Globe, ShieldCheck, HelpCircle, Share2,
  Truck, Award, FileText, ExternalLink, Wrench
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useSettings } from '../context/SettingsContext';
import { useLanguage } from '../context/LanguageContext';

export default function ContactPage({ navigate, user, setUser }) {
  const { settings } = useSettings();
  const { t, lang } = useLanguage();

  // Dynamic store information loaded directly from settings / database
  const storeInfo = settings?.storeInfo || {};
  const companyName = storeInfo.companyNameTh || storeInfo.companyNameEn || storeInfo.companyName || 'บริษัท โมเบกซ์ ออโต้พาร์ท จำกัด';
  const branchName = storeInfo.branchNameTh || storeInfo.branch || 'สำนักงานใหญ่';
  const address = storeInfo.addressTh || storeInfo.addressEn || storeInfo.address || 'เลขที่ 88/9 อาคารโมเบกซ์ ถนนพระราม 9 แขวงห้วยขวาง เขตห้วยขวาง กรุงเทพฯ 10310';
  const phone = storeInfo.phone || '02-123-4567';
  const hotline = storeInfo.hotline || '081-234-5678';
  const email = storeInfo.email || 'support@mobex-autoparts.com';
  const hours = storeInfo.businessHoursTh || storeInfo.businessHoursEn || storeInfo.businessHours || 'จันทร์ - เสาร์: 08:30 - 18:00 น. (หยุดวันอาทิตย์)';
  const taxId = storeInfo.taxId || '0105565012345';
  const lineId = storeInfo.lineId || storeInfo.line || '@mobexparts';

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans selection:bg-[#0c3175] selection:text-white">
      <Navbar navigate={navigate} user={user} setUser={setUser} currentPage="contact" />

      {/* Breadcrumb Header */}
      <div className="bg-white border-b border-slate-200/80 py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs font-semibold text-slate-400">
          <button onClick={() => navigate('home')} className="hover:text-[#0c3175] transition-colors cursor-pointer">
            {t('home') || 'หน้าแรก'}
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-[#0c3175] font-bold">
            {lang === 'th' ? 'ติดต่อเรา' : 'Contact Us'}
          </span>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="bg-[#0c3175] text-white py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-radial-gradient from-blue-600/20 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="max-w-2xl">
            <span className="inline-block px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 text-[11px] font-bold uppercase tracking-wider mb-3">
              {lang === 'th' ? 'ศูนย์บริการข้อมูล & สายด่วนฝ่ายขาย' : 'Customer Care & Sales Hotline'}
            </span>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight mb-2">
              {lang === 'th' ? `ติดต่อทีมงาน ${companyName}` : `Contact ${companyName}`}
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/80 leading-relaxed">
              {lang === 'th'
                ? 'สอบถามข้อมูลอะไหล่รถยนต์ตรงรุ่น เช็กราคา สั่งซื้อ หรือปรึกษาทีมช่างเทคนิคผู้เชี่ยวชาญ พร้อมให้บริการทุกวันทำการ'
                : 'Get in touch for genuine auto parts inquiries, fitment checks, wholesale pricing, or technical assistance.'}
            </p>
          </div>
          <div className="shrink-0 flex flex-wrap gap-3 justify-center">
            <a
              href={`tel:${phone.split(',')[0].trim()}`}
              className="px-5 py-2.5 rounded-xl bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold text-xs shadow-lg transition-all flex items-center gap-2"
            >
              <Phone className="w-4 h-4" />
              <span>{lang === 'th' ? 'โทรฝ่ายขายทันที' : 'Call Sales'}</span>
            </a>
            {lineId && (
              <a
                href={`https://line.me/R/ti/p/${encodeURIComponent(lineId)}`}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg transition-all flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{lang === 'th' ? 'แชทผ่าน LINE' : 'Chat on LINE'}</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 flex-1">
        
        {/* 4 Quick Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Card 1: Phone */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#0c3175] flex items-center justify-center shrink-0 border border-blue-100">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                {lang === 'th' ? 'เบอร์โทรศัพท์ฝ่ายขาย' : 'Sales Phone'}
              </div>
              <div className="text-xs font-bold text-slate-800 leading-snug font-mono">
                {phone}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                {lang === 'th' ? 'บริการให้คำปรึกษาอะไหล่ทุกรุ่น' : 'Customer support available'}
              </div>
            </div>
          </div>

          {/* Card 2: Hotline / Technician */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-orange-50 text-[#ea580c] flex items-center justify-center shrink-0 border border-orange-100">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                {lang === 'th' ? 'สายด่วนช่าง & อู่ยนต์' : 'Garage Hotline'}
              </div>
              <div className="text-xs font-bold text-slate-800 leading-snug font-mono">
                {hotline}
              </div>
              <div className="text-[10px] text-orange-600 font-semibold mt-1">
                {lang === 'th' ? 'เช็กเบอร์อะไหล่แท้ตรงรุ่น' : 'OEM Fitment Assistance'}
              </div>
            </div>
          </div>

          {/* Card 3: Business Hours */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                {lang === 'th' ? 'เวลาทำการ' : 'Business Hours'}
              </div>
              <div className="text-xs font-bold text-slate-800 leading-relaxed">
                {hours}
              </div>
              <div className="text-[10px] text-emerald-600 font-medium mt-1">
                เปิดรับออเดอร์ออนไลน์ 24 ชม.
              </div>
            </div>
          </div>

          {/* Card 4: LINE Official */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 font-black text-sm">
              LINE
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                LINE Official
              </div>
              <div className="text-xs font-bold text-emerald-600 font-mono">
                {lineId}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                {lang === 'th' ? 'แชทสอบถาม & ส่งภาพอะไหล่' : 'Chat & send parts photos'}
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column: Company Details & Interactive Map Location */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left: Store Information Card (6 Cols) - REAL DATA FROM DATABASE */}
          <div className="lg:col-span-6 flex flex-col">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6 flex-1">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                  Headquarters & Information
                </span>
                <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2 mt-2">
                  <Building2 className="w-6 h-6 text-[#0c3175]" />
                  <span>{companyName}</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  สาขา: {branchName}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3 text-xs">
                <div className="flex items-start gap-3 text-slate-700">
                  <MapPin className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-bold text-slate-900">ที่ตั้งสำนักงานใหญ่และคลังสินค้า:</span>
                    <p className="leading-relaxed text-slate-600">{address}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-slate-700 pt-2 border-t border-slate-200">
                  <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                  <div>
                    <span className="text-slate-500">อีเมลติดต่อ: </span>
                    <a href={`mailto:${email}`} className="font-bold text-blue-700 hover:underline">
                      {email}
                    </a>
                  </div>
                </div>

                {taxId && (
                  <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-200 flex justify-between items-center">
                    <span>เลขประจำตัวผู้เสียภาษี (Tax ID):</span>
                    <span className="font-mono font-bold text-slate-800 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                      {taxId}
                    </span>
                  </div>
                )}
              </div>

              {/* Trust Badges */}
              <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-3 text-[11px] text-slate-500">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>อะไหล่แท้ 100% มีประกัน</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>ออกใบกำกับภาษีเต็มรูปแบบได้</span>
                </div>
              </div>

            </div>
          </div>

          {/* Right: Map & Directions Card (6 Cols) */}
          <div className="lg:col-span-6 flex flex-col">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                  Map & Navigation
                </span>
                <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2 mt-2">
                  <MapPin className="w-6 h-6 text-rose-500" />
                  <span>{lang === 'th' ? 'แผนที่และการเดินทาง' : 'Location & Navigation'}</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  เดินทางสะดวก พร้อมบริการตรวจสอบและจัดส่งอะไหล่ตรงรุ่น
                </p>
              </div>

              {/* Visual Map Mockup & Direction */}
              <div className="rounded-2xl overflow-hidden border border-slate-200 bg-gradient-to-br from-slate-100 via-blue-50/40 to-slate-200 relative min-h-[260px] flex items-center justify-center text-center p-6 my-2 shadow-inner">
                <div className="space-y-3 max-w-md">
                  <div className="w-14 h-14 rounded-2xl bg-white text-[#0c3175] flex items-center justify-center mx-auto shadow-md border border-slate-100">
                    <MapPin className="w-8 h-8 text-rose-500 animate-bounce" />
                  </div>
                  <div className="font-black text-sm text-slate-900">{companyName}</div>
                  <div className="text-xs text-slate-600 leading-relaxed">
                    {address}
                  </div>
                  <div className="pt-2 flex flex-wrap gap-2 justify-center">
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(address)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-5 py-2.5 bg-[#0c3175] hover:bg-[#081e4b] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
                    >
                      <MapPin className="w-4 h-4" />
                      <span>เปิดนำทางด้วย Google Maps ↗</span>
                    </a>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* 3 Value Pillars for Customer Support */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">รับประกันอะไหล่แท้ 100%</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              สินค้าทุกรายการผ่านการตรวจสอบมาตรฐานจากผู้ผลิตชั้นนำ มีวารันตีและเคลมได้ตามเงื่อนไขอย่างเป็นธรรม
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Truck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">จัดส่งด่วนทั่วประเทศ</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              ส่งด่วนพิเศษ Messenger ทันใจในเขตกรุงเทพฯ และปริมณฑล หรือขนส่งเอกชนชั้นนำส่งตรงถึงอู่ช่างทั่วประเทศ
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#ea580c] flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">ใบเสร็จ & ใบกำกับภาษีถูกต้อง</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              ออกใบเสร็จรับเงินและใบกำกับภาษีเต็มรูปแบบ สามารถดาวน์โหลดหรือสั่งพิมพ์ได้ทันทีหลังสั่งซื้อ
            </p>
          </div>
        </div>

      </main>

      <Footer navigate={navigate} />
    </div>
  );
}
