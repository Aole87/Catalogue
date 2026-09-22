import React, { useState, useEffect } from 'react';
import {
  Globe, Search, Share2, CheckCircle2, AlertCircle, Save,
  RefreshCw, Eye, Smartphone, Monitor, Code, ExternalLink,
  Sliders, Shield, Sparkles, Copy, Check
} from 'lucide-react';

export default function SeoManager() {
  const [activeSubTab, setActiveSubTab] = useState('general'); // 'general', 'social', 'analytics', 'technical', 'pages'
  const [previewDevice, setPreviewDevice] = useState('desktop'); // 'desktop', 'mobile'
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // SEO Configurations State
  const [seoConfig, setSeoConfig] = useState(() => {
    const saved = localStorage.getItem('adnex_seo_config');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return {
      siteTitle: 'ADNEX Auto Parts | ศูนย์รวมอะไหล่รถยนต์แท้ และอุปกรณ์ดูแลรักษารถยนต์ครบวงจร',
      titleSeparator: '|',
      metaDescription: 'ผู้นำเข้าและจำหน่ายอะไหล่รถยนต์แท้ 100% ครบทุกรุ่น ทุกลักษณะการใช้งาน ทั้งเก๋ง กระบะ SUV แบรนด์ชั้นนำ Motul, Brembo, Denso, Bosch พร้อมระบบค้นหาอะไหล่ตรงรุ่นรถ และจัดส่งด่วนทั่วไทย',
      metaKeywords: 'อะไหล่รถยนต์, อะไหล่แท้, น้ำมันเครื่อง Motul, ผ้าเบรก Brembo, หัวเทียน Denso, กรองน้ำมันเครื่อง, อะไหล่ Toyota Honda Isuzu, ช่างซ่อมรถยนต์',
      canonicalUrl: 'https://adnex-parts.com',
      robotsIndex: true,
      robotsFollow: true,
      ogTitle: 'ADNEX Auto Parts - อะไหล่รถยนต์แท้ 100% ส่งด่วนทั่วไทย',
      ogDescription: 'เช็กเบอร์อะไหล่ตรงรุ่น พร้อมราคาโปรโมชันพิเศษสำหรับลูกค้าทั่วไปและอู่ยนต์ บริการจัดส่งทั่วประเทศ ออกใบกำกับภาษีได้',
      ogImage: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=1200&q=80',
      twitterCard: 'summary_large_image',
      googleSearchConsoleTag: '<meta name="google-site-verification" content="adnex_gsc_token_verification_2026_xyz" />',
      googleAnalyticsId: 'G-ADNEX88990',
      facebookPixelId: '109823485728392',
      robotsTxt: `# Robots.txt for ADNEX Auto Parts Platform\nUser-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /checkout\nDisallow: /my-orders\nDisallow: /api/\n\nSitemap: https://adnex-parts.com/sitemap.xml`,
      pageMeta: {
        home: {
          title: 'หน้าแรก - อะไหล่รถยนต์ของแท้ และบริการซ่อมบำรุง',
          description: 'เลือกซื้ออะไหล่แท้ราคาโรงงาน ค้นหาตามรุ่นรถยนต์ ทั้ง Toyota, Honda, Isuzu รับประกันของแท้ 100%'
        },
        catalog: {
          title: 'แค็ตตาล็อกสินค้า - ค้นหาอะไหล่ตามยี่ห้อและรุ่นรถยนต์',
          description: 'รวมอะไหล่ยานยนต์คุณภาพสูง น้ำมันเครื่อง ระบบเบรก ช่วงล่าง และระบบไฟ จากผู้ผลิต OEM ชั้นนำ'
        },
        contact: {
          title: 'ติดต่อเรา - ศูนย์บริการข้อมูลและสายด่วนอู่ยนต์',
          description: 'ที่อยู่สำนักงานใหญ่ เบอร์โทรศัพท์ฝ่ายขาย แผนที่เดินทาง และ LINE Official สอบถามอะไหล่ตรงรุ่น'
        },
        articles: {
          title: 'ข่าวสารและสาระน่ารู้ยานยนต์ - เทคนิคการดูแลรถยนต์',
          description: 'บทความแนะนำการเลือกใช้น้ำมันเครื่อง การเปลี่ยนผ้าเบรก และข้อควรรู้ในการดูแลรักษารถยนต์'
        }
      }
    };
  });

  const handleSave = () => {
    localStorage.setItem('adnex_seo_config', JSON.stringify(seoConfig));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // SEO Score Calculation
  const calculateSeoScore = () => {
    let score = 0;
    if (seoConfig.siteTitle.length >= 30 && seoConfig.siteTitle.length <= 65) score += 25;
    else if (seoConfig.siteTitle.length > 0) score += 15;

    if (seoConfig.metaDescription.length >= 120 && seoConfig.metaDescription.length <= 160) score += 25;
    else if (seoConfig.metaDescription.length > 50) score += 15;

    if (seoConfig.metaKeywords.split(',').length >= 4) score += 15;
    if (seoConfig.ogImage) score += 15;
    if (seoConfig.googleAnalyticsId) score += 10;
    if (seoConfig.googleSearchConsoleTag) score += 10;
    return Math.min(100, score);
  };

  const seoScore = calculateSeoScore();

  return (
    <div className="space-y-6">
      {/* Header & Save Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Globe className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              การจัดการ SEO & เครื่องมือค้นหา (Search Engine Optimization)
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            ปรับแต่งเมตาแท็ก, ระบบ Social Share OpenGraph, Google Search Console, และโครงสร้าง SEO สำหรับติดอันดับบน Google
          </p>
        </div>

        <div className="flex items-center gap-3">
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 animate-fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>บันทึกการตั้งค่าแล้ว</span>
            </span>
          )}
          <button
            onClick={handleSave}
            className="px-5 py-2.5 bg-[#0c3175] hover:bg-[#081e4b] text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-2 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>บันทึกการตั้งค่า SEO</span>
          </button>
        </div>
      </div>

      {/* SEO Health Score Banner & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">คะแนนความพร้อม SEO</div>
            <div className="text-2xl font-black text-slate-900 flex items-baseline gap-1">
              <span>{seoScore}</span>
              <span className="text-xs text-slate-400 font-normal">/ 100</span>
            </div>
            <div className="text-[10px] text-emerald-600 font-semibold mt-1">
              {seoScore >= 80 ? 'อยู่ในเกณฑ์ดีเยี่ยม (Optimal)' : 'สามารถปรับปรุงเพิ่มได้'}
            </div>
          </div>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm ${
            seoScore >= 80 ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-amber-50 text-amber-600 border border-amber-200'
          }`}>
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">ความยาว Meta Title</div>
            <div className="text-2xl font-black text-slate-900">
              {seoConfig.siteTitle.length}
              <span className="text-xs text-slate-400 font-normal ml-1">ตัวอักษร</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              แนะนำ: 30 - 65 ตัวอักษร
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <Search className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">ความยาว Meta Description</div>
            <div className="text-2xl font-black text-slate-900">
              {seoConfig.metaDescription.length}
              <span className="text-xs text-slate-400 font-normal ml-1">ตัวอักษร</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              แนะนำ: 120 - 160 ตัวอักษร
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
            <Code className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">สถานะ Robots Index</div>
            <div className="text-sm font-bold text-emerald-600 flex items-center gap-1.5 mt-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>index, follow</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              อนุญาตให้ Google เข้าเก็บข้อมูล
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
            <Globe className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-2xl px-6 pt-3 gap-6 overflow-x-auto text-xs font-bold">
        {[
          { id: 'general', label: '1. ข้อมูลพื้นฐาน & Meta Tags' },
          { id: 'social', label: '2. ภาพตัวอย่างโซเชียล (OpenGraph)' },
          { id: 'analytics', label: '3. เชื่อมต่อ Google & เครื่องมือวัดผล' },
          { id: 'technical', label: '4. Sitemap & Robots.txt' },
          { id: 'pages', label: '5. ปรับแต่ง SEO รายหน้า' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`pb-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === tab.id
                ? 'border-[#0c3175] text-[#0c3175]'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Input Form (7 Cols) */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
          
          {activeSubTab === 'general' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  ชื่อเว็บไซต์หลัก (Meta Title) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={seoConfig.siteTitle}
                  onChange={e => setSeoConfig({ ...seoConfig, siteTitle: e.target.value })}
                  className="w-full border border-slate-200 p-2.5 rounded-xl text-xs text-slate-900 outline-none focus:border-[#0c3175]"
                  placeholder="เช่น ADNEX Auto Parts | ศูนย์รวมอะไหล่รถยนต์แท้"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>แสดงผลเป็นหัวข้อหลักในแท็บบราวเซอร์ และผลลัพธ์บน Google</span>
                  <span className={seoConfig.siteTitle.length > 65 ? 'text-amber-600 font-bold' : ''}>
                    {seoConfig.siteTitle.length}/65
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  คำอธิบายเว็บไซต์ (Meta Description) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={seoConfig.metaDescription}
                  onChange={e => setSeoConfig({ ...seoConfig, metaDescription: e.target.value })}
                  className="w-full border border-slate-200 p-2.5 rounded-xl text-xs text-slate-900 outline-none focus:border-[#0c3175] leading-relaxed"
                  placeholder="คำอธิบายสั้นๆ เกี่ยวกับร้านค้าและสินค้าของคุณ..."
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>ข้อความสรุปเนื้อหาที่แสดงใต้หัวข้อลิงก์ในการค้นหา</span>
                  <span className={seoConfig.metaDescription.length > 160 ? 'text-amber-600 font-bold' : ''}>
                    {seoConfig.metaDescription.length}/160
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  คีย์เวิร์ดเป้าหมาย (Meta Keywords)
                </label>
                <input
                  type="text"
                  value={seoConfig.metaKeywords}
                  onChange={e => setSeoConfig({ ...seoConfig, metaKeywords: e.target.value })}
                  className="w-full border border-slate-200 p-2.5 rounded-xl text-xs text-slate-900 outline-none focus:border-[#0c3175]"
                  placeholder="คั่นด้วยเครื่องหมายจุลภาค (,) เช่น อะไหล่แท้, น้ำมันเครื่อง, ผ้าเบรก"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Canonical Domain URL
                  </label>
                  <input
                    type="url"
                    value={seoConfig.canonicalUrl}
                    onChange={e => setSeoConfig({ ...seoConfig, canonicalUrl: e.target.value })}
                    className="w-full border border-slate-200 p-2.5 rounded-xl text-xs text-slate-900 outline-none focus:border-[#0c3175]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    สัญลักษณ์คั่นหัวข้อ (Title Separator)
                  </label>
                  <select
                    value={seoConfig.titleSeparator}
                    onChange={e => setSeoConfig({ ...seoConfig, titleSeparator: e.target.value })}
                    className="w-full border border-slate-200 p-2.5 rounded-xl text-xs text-slate-900 outline-none focus:border-[#0c3175] bg-white"
                  >
                    <option value="|">| (ท่อตรง)</option>
                    <option value="-">- (ขีดกลาง)</option>
                    <option value="•">• (จุดกลม)</option>
                    <option value="/">/ (ทับ)</option>
                  </select>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-800">อนุญาตให้ Search Engine ทำการ Index เว็บไซต์</div>
                  <div className="text-[11px] text-slate-500">เปิดเพื่อให้ Google, Bing บันทึกหน้าเว็บลงในฐานข้อมูลการค้นหา</div>
                </div>
                <input
                  type="checkbox"
                  checked={seoConfig.robotsIndex}
                  onChange={e => setSeoConfig({ ...seoConfig, robotsIndex: e.target.checked })}
                  className="w-4 h-4 accent-[#0c3175]"
                />
              </div>
            </div>
          )}

          {activeSubTab === 'social' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  หัวข้อสำหรับแชร์โซเชียล (OG Title)
                </label>
                <input
                  type="text"
                  value={seoConfig.ogTitle}
                  onChange={e => setSeoConfig({ ...seoConfig, ogTitle: e.target.value })}
                  className="w-full border border-slate-200 p-2.5 rounded-xl text-xs text-slate-900 outline-none focus:border-[#0c3175]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  คำบรรยายสำหรับการแชร์ (OG Description)
                </label>
                <textarea
                  rows={3}
                  value={seoConfig.ogDescription}
                  onChange={e => setSeoConfig({ ...seoConfig, ogDescription: e.target.value })}
                  className="w-full border border-slate-200 p-2.5 rounded-xl text-xs text-slate-900 outline-none focus:border-[#0c3175]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  ลิงก์รูปภาพตัวอย่างแชร์ (OG Image URL - แนะนำขนาด 1200 x 630 px)
                </label>
                <input
                  type="url"
                  value={seoConfig.ogImage}
                  onChange={e => setSeoConfig({ ...seoConfig, ogImage: e.target.value })}
                  className="w-full border border-slate-200 p-2.5 rounded-xl text-xs text-slate-900 outline-none focus:border-[#0c3175]"
                />
              </div>

              {seoConfig.ogImage && (
                <div className="pt-2">
                  <div className="text-[11px] font-bold text-slate-400 mb-2">ภาพตัวอย่าง OG Image ปัจจุบัน:</div>
                  <img
                    src={seoConfig.ogImage}
                    alt="OG Preview"
                    className="w-full h-44 object-cover rounded-xl border border-slate-200"
                  />
                </div>
              )}
            </div>
          )}

          {activeSubTab === 'analytics' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Google Search Console Verification Tag
                </label>
                <input
                  type="text"
                  value={seoConfig.googleSearchConsoleTag}
                  onChange={e => setSeoConfig({ ...seoConfig, googleSearchConsoleTag: e.target.value })}
                  className="w-full border border-slate-200 p-2.5 rounded-xl text-xs font-mono text-slate-800 outline-none focus:border-[#0c3175]"
                  placeholder='<meta name="google-site-verification" content="..." />'
                />
                <div className="text-[10px] text-slate-400 mt-1">ใช้ยืนยันความเป็นเจ้าของโดเมนบน Google Search Console</div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Google Analytics 4 (Measurement ID)
                  </label>
                  <input
                    type="text"
                    value={seoConfig.googleAnalyticsId}
                    onChange={e => setSeoConfig({ ...seoConfig, googleAnalyticsId: e.target.value })}
                    className="w-full border border-slate-200 p-2.5 rounded-xl text-xs font-mono text-slate-800 outline-none focus:border-[#0c3175]"
                    placeholder="G-XXXXXXXXXX"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Facebook Pixel ID
                  </label>
                  <input
                    type="text"
                    value={seoConfig.facebookPixelId}
                    onChange={e => setSeoConfig({ ...seoConfig, facebookPixelId: e.target.value })}
                    className="w-full border border-slate-200 p-2.5 rounded-xl text-xs font-mono text-slate-800 outline-none focus:border-[#0c3175]"
                    placeholder="123456789012345"
                  />
                </div>
              </div>

              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>ระบบเชื่อมต่อแท็กอัตโนมัติ (Auto Head Injection)</span>
                </div>
                <div className="text-[11px] text-emerald-800">
                  ระบบจะนำรหัสติดตามนี้ไปใส่ในส่วน &lt;head&gt; ของทุกหน้าเว็บให้อัตโนมัติ พร้อมตรวจจับเหตุการณ์การสั่งซื้อ (E-Commerce Purchase Events)
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'technical' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <div className="font-bold text-xs text-slate-900">XML Sitemap อัตโนมัติ</div>
                  <div className="text-[11px] text-slate-500">สร้างโครงสร้าง URL ของสินค้า หมวดหมู่ และบทความส่งให้บอทค้นหา</div>
                </div>
                <a
                  href="/sitemap.xml"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-white text-blue-700 font-bold text-xs rounded-lg border border-slate-200 shadow-xs flex items-center gap-1 hover:bg-blue-50 transition-colors"
                >
                  <span>เปิด Sitemap</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  ไฟล์ Robots.txt (คำสั่งสั่งการ Web Crawlers)
                </label>
                <textarea
                  rows={8}
                  value={seoConfig.robotsTxt}
                  onChange={e => setSeoConfig({ ...seoConfig, robotsTxt: e.target.value })}
                  className="w-full border border-slate-200 p-3 rounded-xl text-xs font-mono text-slate-800 outline-none focus:border-[#0c3175] bg-slate-50"
                />
              </div>
            </div>
          )}

          {activeSubTab === 'pages' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-500 mb-2">
                กำหนด Meta Title และ Description เฉพาะสำหรับหน้าเว็บสำคัญของร้าน:
              </div>

              {Object.entries(seoConfig.pageMeta).map(([pageKey, meta]) => (
                <div key={pageKey} className="p-4 border border-slate-200 rounded-xl space-y-2 bg-slate-50/50">
                  <div className="font-bold text-xs text-[#0c3175] uppercase flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#ea580c]"></span>
                    <span>หน้า: {pageKey === 'home' ? 'หน้าแรก (Home)' : pageKey === 'catalog' ? 'แค็ตตาล็อกสินค้า (Catalog)' : pageKey === 'contact' ? 'ติดต่อเรา (Contact)' : 'บทความ (Articles)'}</span>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Title Tag</label>
                    <input
                      type="text"
                      value={meta.title}
                      onChange={e => setSeoConfig({
                        ...seoConfig,
                        pageMeta: {
                          ...seoConfig.pageMeta,
                          [pageKey]: { ...meta, title: e.target.value }
                        }
                      })}
                      className="w-full border border-slate-200 p-2 rounded-lg text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Meta Description</label>
                    <input
                      type="text"
                      value={meta.description}
                      onChange={e => setSeoConfig({
                        ...seoConfig,
                        pageMeta: {
                          ...seoConfig.pageMeta,
                          [pageKey]: { ...meta, description: e.target.value }
                        }
                      })}
                      className="w-full border border-slate-200 p-2 rounded-lg text-xs bg-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Right: Live SERP & Social Preview Simulator (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Google Search Result Preview */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-xs text-slate-900">Google SERP Preview (จำลองผลการค้นหา)</h3>
              </div>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                <button
                  onClick={() => setPreviewDevice('desktop')}
                  className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                    previewDevice === 'desktop' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-400'
                  }`}
                  title="Desktop View"
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setPreviewDevice('mobile')}
                  className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                    previewDevice === 'mobile' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-400'
                  }`}
                  title="Mobile View"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Google Result Card */}
            <div className={`p-4 bg-white border border-slate-100 rounded-xl shadow-2xs font-sans ${
              previewDevice === 'mobile' ? 'max-w-xs mx-auto border-dashed' : ''
            }`}>
              <div className="flex items-center gap-2 mb-1 text-xs text-[#202124]">
                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-blue-700">
                  A
                </div>
                <div className="truncate">
                  <div className="text-[12px] font-medium leading-none">ADNEX Auto Parts</div>
                  <div className="text-[11px] text-[#5f6368] leading-none mt-0.5 truncate">{seoConfig.canonicalUrl}</div>
                </div>
              </div>

              <div className="text-[16px] text-[#1a0dab] font-medium leading-snug hover:underline cursor-pointer line-clamp-2 mt-1">
                {seoConfig.siteTitle || 'ADNEX Auto Parts'}
              </div>

              <div className="text-[13px] text-[#4d5156] leading-relaxed line-clamp-2 mt-1">
                {seoConfig.metaDescription || 'คำอธิบายเว็บไซต์...'}
              </div>
            </div>
          </div>

          {/* Social Share Preview (Facebook / LINE Card) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b pb-3">
              <Share2 className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-xs text-slate-900">Facebook / LINE Share Preview</h3>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs bg-white">
              {seoConfig.ogImage ? (
                <img
                  src={seoConfig.ogImage}
                  alt="OG Preview"
                  className="w-full h-36 object-cover bg-slate-100"
                />
              ) : (
                <div className="w-full h-36 bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                  ไม่มีรูปภาพ OG Image
                </div>
              )}
              <div className="p-3.5 space-y-1 bg-slate-50 border-t border-slate-100">
                <div className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">ADNEX-PARTS.COM</div>
                <div className="font-bold text-xs text-slate-900 line-clamp-1">
                  {seoConfig.ogTitle || seoConfig.siteTitle}
                </div>
                <div className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                  {seoConfig.ogDescription || seoConfig.metaDescription}
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
