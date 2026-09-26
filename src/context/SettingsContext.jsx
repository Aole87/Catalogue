import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import ApiClient from '../utils/apiClient';

const defaultSettings = {
  branding: {
    siteNameTh: 'MOBEX ศูนย์รวมอะไหล่รถยนต์',
    siteNameEn: 'MOBEX Auto Parts Center',
    metaDescriptionTh: 'ศูนย์รวมอะไหล่รถยนต์ตรงรุ่นคุณภาพสูง จัดส่งทั่วประเทศ',
    metaDescriptionEn: 'High quality direct-fit auto parts center with nationwide delivery',
    logoUrl: '/logo.png',
    faviconUrl: '/vite.svg',
    primaryColor: '#ea580c',
    secondaryColor: '#0c3175',
  },
  menus: [
    { id: 1, labelTh: 'หน้าหลัก', labelEn: 'Home', url: 'home', active: true },
    { id: 2, labelTh: 'หมวดหมู่สินค้า', labelEn: 'Categories', url: 'product-list', active: true },
    { id: 3, labelTh: 'สินค้าแนะนำ', labelEn: 'Recommended', url: 'product-list', active: true },
    { id: 4, labelTh: 'โปรโมชันพิเศษ', labelEn: 'Promotions', url: 'promotions', active: false },
    { id: 5, labelTh: 'ติดต่อเรา', labelEn: 'Contact Us', url: 'contact', active: true },
  ],
  navigation: {
    categoryButtonLabelTh: 'หมวดหมู่สินค้า',
    categoryButtonLabelEn: 'All Categories',
  },
  banners: [
    { id: 1, imageUrl: 'https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?w=1600&q=80', targetUrl: 'product-list', active: true },
    { id: 2, imageUrl: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=600&q=80', targetUrl: 'product-list', active: true },
    { id: 3, imageUrl: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=600&q=80', targetUrl: 'product-list', active: true },
  ],
  typography: {
    brandsTitleTh: 'แบรนด์ชั้นนำ',
    brandsTitleEn: 'Top Brands',
    categoriesTitleTh: 'หมวดหมู่สินค้า',
    categoriesTitleEn: 'Shop by Category',
    bestSellersTitleTh: 'สินค้าขายดี',
    bestSellersTitleEn: 'Best Sellers',
  },
  payment: {
    promptpay: { enabled: true, accountNo: '081-234-5678', accountName: 'MOBEX AUTO PARTS CO., LTD.' },
    bankTransfer: { enabled: true, bankName: 'Kasikorn Bank (KBANK)', accountNo: '123-4-56789-0', branch: 'Siam Paragon' },
    stripe: { enabled: true, publicKey: 'pk_test_sample_12345', testMode: true },
    slipVerification: { enabled: true, apiKey: 'slip_verify_live_key_998877' },
  },
  shipping: {
    freeShippingEnabled: false,
    freeShippingThreshold: 2000,
    applyFreeShippingToCustomItems: false,
    methods: [
      { id: 'ship-1', code: 'FLASH', name: 'Flash Express', fee: 45, estimatedDays: '1-2 Days', active: true },
      { id: 'ship-2', code: 'KERRY', name: 'Kerry Express', fee: 60, estimatedDays: '1-2 Days', active: true },
      { id: 'ship-3', code: 'SCG', name: 'SCG Express (Cold/Heavy)', fee: 75, estimatedDays: '2-3 Days', active: true },
      { id: 'ship-4', code: 'STANDARD', name: 'Standard Delivery', fee: 35, estimatedDays: '2-4 Days', active: true },
    ],
  },
  general: {
    siteName: 'Buy@Unimart Auto Parts',
    membersOnlyPricing: true,
    guestCheckoutEnabled: false,
    tickerTextTh: 'Lifestyle : รับส่วนลดพิเศษ 10% สำหรับสมาชิกตรงรุ่นมากกว่า 100+ แบรนด์ชั้นนำ',
    tickerTextEn: 'Lifestyle : Extra 10% off member exclusive for 100+ top brand deals',
  },
  storeInfo: {
    companyNameTh: 'บริษัท โมเบกซ์ ออโต้พาร์ท จำกัด',
    companyNameEn: 'MOBEX Auto Parts Co., Ltd.',
    taxId: '0105565012345',
    branchNameTh: 'สำนักงานใหญ่ (สาขาพระราม 9)',
    branchNameEn: 'Headquarters (Rama 9 Branch)',
    phone: '02-123-4567',
    hotline: '081-234-5678',
    email: 'support@mobex-autoparts.com',
    addressTh: 'เลขที่ 88/9 อาคารโมเบกซ์ ถนนพระราม 9 แขวงห้วยขวาง เขตห้วยขวาง กรุงเทพฯ 10310',
    addressEn: '88/9 MOBEX Building, Rama 9 Rd., Huai Khwang, Bangkok 10310 Thailand',
    businessHoursTh: 'จันทร์ - เสาร์: 08:30 - 18:00 น. (หยุดวันอาทิตย์)',
    businessHoursEn: 'Mon - Sat: 08:30 - 18:00 (Closed on Sunday)',
    googleMapsUrl: 'https://maps.google.com/?q=Huai+Khwang+Bangkok',
    lineId: '@mobexparts',
    facebookUrl: 'https://facebook.com/mobexautoparts',
    tiktokUrl: 'https://tiktok.com/@mobexautoparts',
  },
  policies: {
    returnPolicyTh: `นโยบายการเปลี่ยนและคืนสินค้า (Return & Refund Policy)

1. เงื่อนไขการขอเปลี่ยนหรือคืนสินค้า:
- ลูกค้าสามารถแจ้งขอเปลี่ยนหรือคืนสินค้าได้ภายใน 7 วัน นับจากวันที่ได้รับสินค้าตามระบบขนส่ง
- สินค้าต้องอยู่ในสภาพเดิม 100% ไม่ผ่านการติดตั้ง ดัดแปลง ลองใส่ หรือใช้งาน
- กล่องบรรจุภัณฑ์ ตราประทับ ซีลกันปลอม และคู่มืออุปกรณ์ต้องอยู่ในสภาพสมบูรณ์ครบถ้วน

2. กรณีที่สามารถคืนสินค้าได้:
- ทางร้านจัดส่งสินค้าไม่ตรงรุ่น หรือไม่ตรงกับรายการสั่งซื้อ
- สินค้าชำรุดเสียหายจากการผลิตหรือการขนส่งก่อนถึงมือผู้รับ
- สินค้าไม่สามารถใช้งานได้ตามสเปกมาตรฐานของผู้ผลิต

3. ขั้นตอนการดำเนินการและคืนเงิน:
- ถ่ายภาพและวิดีโอสินค้าพร้อมกล่องพัสดุและใบเสร็จรับเงิน ส่งให้ฝ่ายบริการลูกค้าทาง LINE Official: @mobexparts
- เจ้าหน้าที่จะออกรหัสรับคืน (RMA) และประสานงานเข้ารับสินค้า
- ทางร้านจะดำเนินการโอนเงินคืนเข้าบัญชีเดิมของลูกค้าภายใน 3-5 วันทำการ หลังจากตรวจสอบสินค้าเรียบร้อย`,

    returnPolicyEn: `Return and Refund Policy

1. Return Eligibility:
- Returns must be requested within 7 days of delivery.
- Products must be brand new, uninstalled, unmodified, and in original manufacturer packaging with all seals intact.

2. Valid Return Reasons:
- Incorrect item shipped by ADNEX.
- Damaged in transit or manufacturing defect detected upon receipt.

3. Refund Process:
- Contact customer support via LINE @mobexparts with order number, receipt, and photos.
- Approved refunds will be processed via original payment method within 3-5 business days.`,

    warrantyPolicyTh: `นโยบายการรับประกันสินค้าของแท้ 100% (Genuine Warranty Policy)

1. การรับประกันของแท้:
- สินค้าทุกชิ้นที่จัดจำหน่ายโดย ADNEX Auto Parts เป็นอะไหล่แท้จากผู้ผลิตและตัวแทนจำหน่ายอย่างเป็นทางการ 100%
- มีหมายเลขซีเรียลนัมเบอร์ (Serial Number) และใบเสร็จรับเงิน/ใบกำกับภาษีเต็มรูปแบบกำกับทุกรายการ

2. ระยะเวลารับประกันมาตรฐาน:
- อะไหล่ประเภทของเหลวและสารหล่อลื่น (น้ำมันเครื่อง, น้ำมันเกียร์): รับประกันคุณภาพมาตรฐานโรงงานจนถึงวันหมดอายุ
- อะไหล่ระบบเบรกและช่วงล่าง (Brembo ฯลฯ): รับประกันข้อบกพร่องจากการผลิต 6 เดือน หรือ 10,000 กิโลเมตร
- อะไหล่ระบบไฟฟ้าและจุดระเบิด (Denso, Bosch): รับประกัน 6 เดือน ถึง 1 ปี ตามเงื่อนไขของแบรนด์ผู้ผลิต

3. ข้อยกเว้นการรับประกัน:
- การติดตั้งผิดวิธีโดยช่างที่ไม่มีความชำนาญ หรือการดัดแปลงสภาพชิ้นส่วน
- อุบัติเหตุ ภัยธรรมชาติ หรือการใช้งานผิดประเภทเกินพิกัดมาตรฐานของตัวรถ`,

    warrantyPolicyEn: `100% Genuine Parts Warranty Policy

1. Authentic Certification:
- All parts distributed by ADNEX Auto Parts are 100% certified authentic OEM and tier-1 aftermarket brands.
- Each order includes verifiable batch/serial tracking and official VAT tax invoice.

2. Warranty Period:
- Brake & Suspension components: 6 months or 10,000 km against manufacturing defects.
- Ignition & Electrical components: 6 to 12 months manufacturer limited warranty.
- Fluids & Lubricants: Full manufacturer spec guarantee in sealed original containers.

3. Exclusions:
- Improper installation, modification, racing use, or damage caused by accidents.`,

    shippingPolicyTh: `นโยบายและเงื่อนไขการจัดส่งสินค้า (Shipping & Delivery Policy)

1. พื้นที่การให้บริการและระยะเวลาจัดส่ง:
- กรุงเทพฯ และปริมณฑล: จัดส่งด่วนภายใน 1-2 วันทำการ (มีบริการ Messenger ส่งด่วนภายในวันสำหรับอู่ยนต์)
- ต่างจังหวัดทั่วประเทศ: จัดส่งภายใน 2-3 วันทำการ ผ่านขนส่งเอกชนชั้นนำ (Flash Express, Kerry Express, SCG Express)

2. ค่าจัดส่งสินค้า:
- คิดค่าจัดส่งตามอัตราจริงของแต่ละ SKU และน้ำหนักสินค้า
- บริการจัดส่งฟรี (Free Shipping) สำหรับยอดสั่งซื้อรวมตั้งแต่ 2,000 บาทขึ้นไป ทั่วประเทศ

3. การติดตามสถานะพัสดุ:
- ระบบจะส่งหมายเลข Tracking Number ทาง SMS และอีเมลทันทีที่สินค้าออกจากคลัง
- สามารถตรวจเช็กสถานะการจัดส่งได้ที่หน้า "ประวัติการสั่งซื้อของฉัน" ตลอด 24 ชั่วโมง`,

    shippingPolicyEn: `Shipping and Delivery Policy

1. Delivery Coverage & Speed:
- Bangkok & Metropolitan: 1-2 business days (Same-day courier dispatch available for verified garages).
- Nationwide Provincial: 2-3 business days via premier logistics partners.

2. Shipping Rates:
- Calculated per SKU and package dimensions.
- FREE SHIPPING on qualifying orders exceeding 2,000 THB nationwide.

3. Tracking:
- Real-time parcel tracking number provided upon dispatch via SMS/Email and under My Orders.`,

    privacyPolicyTh: `นโยบายคุ้มครองข้อมูลส่วนบุคคล (PDPA Privacy Policy)

บริษัท โมเบกซ์ ออโต้พาร์ท จำกัด ตระหนักถึงความสำคัญของการคุ้มครองข้อมูลส่วนบุคคลของท่าน ตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA)

1. ข้อมูลที่เราจัดเก็บ:
- ข้อมูลระบุตัวตน: ชื่อ, นามสกุล, เลขประจำตัวผู้เสียภาษี, ข้อมูลรถยนต์ (ยี่ห้อ, รุ่น, ปี)
- ข้อมูลการติดต่อ: หมายเลขโทรศัพท์, ที่อยู่อาศัย, ที่อยู่จัดส่งสินค้า, บัญชี LINE, อีเมล
- ข้อมูลการทำธุรกรรม: ประวัติการสั่งซื้อ, ข้อมูลใบเสร็จ, สลิปโอนเงินเพื่อตรวจสอบยอด

2. วัตถุประสงค์ในการประมวลผลข้อมูล:
- ดำเนินการสั่งซื้อ จัดส่งอะไหล่ตรงรุ่นรถ และออกใบกำกับภาษีถูกต้องตามกฎหมาย
- ให้บริการหลังการขาย การเคลมประกัน และการแจ้งเตือนรอบการบำรุงรักษา
- ปรับปรุงประสบการณ์ใช้งาน และนำเสนอสิทธิประโยชน์เฉพาะสมาชิกระดับอู่ยนต์และลูกค้ารายย่อย

3. สิทธิของเจ้าของข้อมูล:
- ท่านมีสิทธิขอเข้าถึง แก้ไข ลบ หรือระงับการใช้ข้อมูลส่วนบุคคลของท่านได้ทุกเมื่อ โดยติดต่อเจ้าหน้าที่คุ้มครองข้อมูล (DPO) ที่ support@mobex-autoparts.com`,

    privacyPolicyEn: `PDPA Privacy Policy

ADNEX Auto Parts respects your privacy rights in accordance with the Thailand Personal Data Protection Act B.E. 2562 (2019).

1. Information Collected:
- Identity & Contact: Name, tax ID, phone, email, shipping address, vehicle fitment specs.
- Transactional: Purchase history, invoices, payment proof.

2. Purpose of Processing:
- Order fulfillment, direct vehicle fitment validation, legal tax invoicing, and customer support.

3. Your Rights:
- You have the right to access, rectify, delete, or withdraw consent at any time by contacting support@mobex-autoparts.com.`,

    termsOfServiceTh: `ข้อกำหนดและเงื่อนไขการใช้บริการ (Terms of Service)

1. การยอมรับข้อกำหนด:
- การเข้าชม สั่งซื้อสินค้า หรือสมัครสมาชิกบนแพลตฟอร์ม ADNEX ถือว่าผู้ใช้บริการยอมรับข้อตกลงและเงื่อนไขทั้งหมด

2. การแสดงราคาและข้อมูลสินค้า:
- ราคาขายอะไหล่จะแสดงเฉพาะสมาชิกที่เข้าสู่ระบบเท่านั้น เพื่อคุ้มครองโครงสร้างราคาส่งสำหรับอู่ยนต์และตัวแทนจำหน่าย
- ทางร้านขอสงวนสิทธิ์ในการแก้ไขข้อผิดพลาดด้านราคาหรือข้อมูลอะไหล่ที่อาจเกิดขึ้นโดยสุจริต

3. การชำระเงินและกรรมสิทธิ์ในสินค้า:
- กรรมสิทธิ์ในสินค้าจะโอนไปยังผู้ซื้อเมื่อทางร้านได้รับการชำระเงินครบถ้วนสมบูรณ์แล้วเท่านั้น
- คำสั่งซื้อที่ชำระเงินเรียบร้อยจะได้รับใบเสร็จรับเงิน/ใบกำกับภาษีอิเล็กทรอนิกส์มาตรฐานทันที

4. ข้อจำกัดความรับผิด:
- ทางร้านไม่รับผิดชอบต่อความเสียหายที่เกิดจากการนำอะไหล่ไปติดตั้งอย่างไม่ถูกต้อง หรือใช้กับรถยนต์ที่ไม่ได้ระบุไว้ในคู่มือความเข้ากันได้ (Fitment Guide)`,

    termsOfServiceEn: `Terms of Service

1. Agreement to Terms:
- By accessing or purchasing from ADNEX, you agree to be bound by these Terms of Service.

2. Pricing & B2B Tiers:
- Product prices are restricted to logged-in verified members to protect wholesale garage pricing structures.

3. Payments & Title:
- Title transfers upon receipt of full payment. Official tax invoices are issued upon payment confirmation.

4. Limitation of Liability:
- ADNEX is not liable for damages resulting from improper third-party installation or mismatched vehicle fitment outside official specifications.`
  },
  recommendedProductIds: [],
  authPage: {
    brandNameTh: 'AUTOPARTS',
    brandNameHighlight: 'PRO',
    titleTh: 'เข้าสู่ระบบสมาชิก',
    titleEn: 'Member Login',
    subtitleTh: 'เข้าสู่ระบบเพื่อรับสิทธิ์ราคาส่ง ตรวจสอบอะไหล่ตรงรุ่นด้วยเลขตัวถัง และดูประวัติการสั่งซื้อแบบ Real-time',
    subtitleEn: 'Sign in to access wholesale pricing, check exact fitment by VIN, and track orders in real-time',
    benefit1Th: 'ราคาส่งพิเศษสำหรับอู่ซ่อมรถและร้านค้า',
    benefit1En: 'Special wholesale pricing for repair shops & garages',
    benefit2Th: 'เช็ครหัส OEM และความตรงรุ่น 100%',
    benefit2En: '100% exact fitment and OEM part code verification',
    benefit3Th: 'ติดตามสถานะการจัดส่งพัสดุได้ตลอด 24 ชั่วโมง',
    benefit3En: 'Track order & parcel shipping status 24/7',
    copyrightText: '© 2026 AutoParts Pro Platform. All rights reserved.',
  },
};

const SettingsContext = createContext({
  settings: defaultSettings,
  refreshSettings: async () => {},
  updateSettings: async () => {},
});

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('mobex_app_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...defaultSettings,
          ...parsed,
          branding: { ...defaultSettings.branding, ...(parsed.branding || {}) },
          navigation: { ...defaultSettings.navigation, ...(parsed.navigation || {}) },
          typography: { ...defaultSettings.typography, ...(parsed.typography || {}) },
          payment: { ...defaultSettings.payment, ...(parsed.payment || {}) },
          shipping: { ...defaultSettings.shipping, ...(parsed.shipping || {}) },
          general: { ...defaultSettings.general, ...(parsed.general || {}) },
          storeInfo: { ...defaultSettings.storeInfo, ...(parsed.storeInfo || {}) },
          policies: { ...defaultSettings.policies, ...(parsed.policies || {}) },
          menus: Array.isArray(parsed.menus) && parsed.menus.length > 0 ? parsed.menus : defaultSettings.menus,
          banners: Array.isArray(parsed.banners) && parsed.banners.length > 0 ? parsed.banners : defaultSettings.banners,
        };
      }
    } catch (e) {
      console.warn('Failed to parse settings from localStorage', e);
    }
    return defaultSettings;
  });

  const applySettingsData = useCallback((incoming, shouldBroadcast = false) => {
    if (!incoming) return;
    setSettings((prev) => {
      const updated = {
        ...prev,
        ...incoming,
        branding: { ...prev.branding, ...(incoming.branding || {}) },
        navigation: { ...prev.navigation, ...(incoming.navigation || {}) },
        typography: { ...prev.typography, ...(incoming.typography || {}) },
        payment: { ...prev.payment, ...(incoming.payment || {}) },
        shipping: { ...prev.shipping, ...(incoming.shipping || {}) },
        general: { ...prev.general, ...(incoming.general || {}) },
        storeInfo: { ...prev.storeInfo, ...(incoming.storeInfo || {}) },
        policies: { ...prev.policies, ...(incoming.policies || {}) },
        menus: Array.isArray(incoming.menus) && incoming.menus.length > 0 ? incoming.menus : prev.menus,
        banners: Array.isArray(incoming.banners) && incoming.banners.length > 0 ? incoming.banners : prev.banners,
        recommendedProductIds: Array.isArray(incoming.recommendedProductIds)
          ? incoming.recommendedProductIds
          : (incoming.recommendedProductIds !== undefined ? incoming.recommendedProductIds : (prev.recommendedProductIds || [])),
      };
      try {
        localStorage.setItem('mobex_app_settings', JSON.stringify(updated));
        if (shouldBroadcast) {
          localStorage.setItem('mobex_settings_updated', Date.now().toString());
        }
      } catch (err) {}
      return updated;
    });
  }, []);

  const refreshSettings = useCallback(async () => {
    try {
      const res = await ApiClient.getSettings();
      const s = res?.data?.settings || res?.settings;
      if (s) {
        // Do not broadcast on fetch to avoid cross-tab infinite loop
        applySettingsData(s, false);
        return s;
      }
    } catch (e) {
      console.warn('Backend settings offline, relying on cached local settings');
    }
  }, [applySettingsData]);

  const updateSettings = useCallback(async (payload) => {
    // 1. Immediately apply and persist locally with broadcast for other tabs
    applySettingsData(payload, true);

    // 2. Synchronize with backend API
    try {
      const res = await ApiClient.updateSettings(payload);
      const s = res?.data?.settings || res?.settings;
      if (s) {
        applySettingsData(s, false);
      }
      return res || { success: true };
    } catch (e) {
      console.warn('API sync warning (saved locally successfully):', e);
      return { success: true, localOnly: true };
    }
  }, [applySettingsData]);

  useEffect(() => {
    refreshSettings();

    // Sync across browser tabs/windows with throttling to prevent infinite ping-pong
    let lastRefresh = 0;
    const handleStorage = (e) => {
      if (e.key === 'mobex_settings_updated') {
        const now = Date.now();
        if (now - lastRefresh > 3000) {
          lastRefresh = now;
          refreshSettings();
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [refreshSettings]);

  // Update browser document title & favicon dynamically
  useEffect(() => {
    const branding = settings.branding || {};
    const title = branding.siteNameTh || branding.siteNameEn || 'MOBEX Auto Parts';
    if (title && typeof document !== 'undefined') {
      document.title = title;
    }
    if (branding.faviconUrl && typeof document !== 'undefined') {
      let link = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = branding.faviconUrl;
    }
  }, [settings.branding]);

  return (
    <SettingsContext.Provider value={{ settings, refreshSettings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
export default SettingsContext;
