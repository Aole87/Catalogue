import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const defaultSettings = {
  payment: {
    promptpay: { enabled: true, accountNo: '081-234-5678', accountName: 'MOBEX AUTO PARTS CO., LTD.' },
    bankTransfer: { enabled: true, bankName: 'Kasikorn Bank (KBANK)', accountNo: '123-4-56789-0', branch: 'Siam Paragon' },
    stripe: { enabled: true, publicKey: 'pk_test_sample_12345', testMode: true },
    slipVerification: { enabled: true, apiKey: 'slip_verify_live_key_998877' },
  },
  shipping: {
    methods: [
      { id: 'ship-1', code: 'FLASH', name: 'Flash Express', fee: 45, estimatedDays: '1-2 Days', active: true },
      { id: 'ship-2', code: 'KERRY', name: 'Kerry Express', fee: 60, estimatedDays: '1-2 Days', active: true },
      { id: 'ship-3', code: 'SCG', name: 'SCG Express (Cold/Heavy)', fee: 75, estimatedDays: '2-3 Days', active: true },
      { id: 'ship-4', code: 'STANDARD', name: 'Standard Delivery', fee: 35, estimatedDays: '2-4 Days', active: true },
    ],
    freeShippingThreshold: 2000,
  },
  general: {
    siteName: 'Buy@Unimart Auto Parts',
    membersOnlyPricing: true,
    guestCheckoutEnabled: false,
    tickerTextTh: 'Lifestyle : รับส่วนลดพิเศษ 10% สำหรับสมาชิกตรงรุ่นมากกว่า 100+ แบรนด์ชั้นนำ',
    tickerTextEn: 'Lifestyle : Extra 10% off member exclusive for 100+ top brand deals',
  },
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
  menus: [
    { id: 1, labelTh: 'หน้าหลัก', labelEn: 'Home', url: 'home', active: true },
    { id: 2, labelTh: 'หมวดหมู่สินค้า', labelEn: 'Categories', url: 'product-list', active: true },
    { id: 3, labelTh: 'สินค้าแนะนำ', labelEn: 'Recommended', url: 'product-list', active: true },
    { id: 4, labelTh: 'โปรโมชันพิเศษ', labelEn: 'Promotions', url: 'promotions', active: false },
    { id: 5, labelTh: 'บทความ & ข่าวสาร', labelEn: 'Articles & News', url: 'articles', active: true },
    { id: 6, labelTh: 'ติดต่อเรา', labelEn: 'Contact Us', url: 'contact', active: true },
  ],
  navigation: {
    categoryButtonLabelTh: 'หมวดหมู่สินค้า',
    categoryButtonLabelEn: 'All Categories',
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
    returnPolicyTh: `นโยบายการเปลี่ยนและคืนสินค้า:
1. สามารถแจ้งขอเปลี่ยนหรือคืนสินค้าได้ภายใน 7 วัน นับจากวันที่ได้รับสินค้า
2. สินค้าต้องอยู่ในสภาพสมบูรณ์ ยังไม่ผ่านการติดตั้งหรือใช้งาน พร้อมกล่อง บรรจุภัณฑ์ และเอกสารครบถ้วน
3. กรณีสินค้าชำรุด เสียหายจากการขนส่ง หรือจัดส่งผิดรุ่น ทางบริษัทฯ ยินดีรับผิดชอบค่าจัดส่งทั้งไปและกลับทั้งหมด
4. สำหรับอะไหล่ระบบอิเล็กทรอนิกส์หรือกล่อง ECU ที่เปิดซองแล้ว จะไม่สามารถรับคืนได้เว้นแต่เป็นข้อผิดพลาดจากการผลิต`,
    returnPolicyEn: `Return & Refund Policy:
1. Returns and exchanges can be requested within 7 days of delivery.
2. Products must be in pristine condition, uninstalled, unused, in original packaging with all included documentation.
3. If products are defective or incorrect fitment due to our catalog error, MOBEX will bear all round-trip shipping charges.
4. Sealed electrical components and ECUs cannot be returned once unsealed unless manufacturing defects are verified.`,
    warrantyPolicyTh: `นโยบายการรับประกันสินค้าของแท้ 100%:
1. สินค้าทุกชิ้นที่จัดจำหน่ายโดย MOBEX เป็นอะไหล่แท้ 100% เบิกจากศูนย์หรือผู้ผลิต OEM ที่ได้รับการรับรองมาตรฐานสากล
2. อะไหล่ทุกชิ้นมีระยะเวลารับประกันขั้นต่ำ 6 เดือน หรือ 10,000 กิโลเมตร (ขึ้นอยู่กับระยะเวลาใดถึงก่อน)
3. การรับประกันครอบคลุมข้อบกพร่องจากการผลิต ภายใต้การติดตั้งและใช้งานตามคู่มือมาตรฐานของศูนย์บริการ
4. ทางบริษัทฯ มีใบกำกับภาษีเต็มรูปแบบ และใบรับประกันของแท้ส่งมอบพร้อมสินค้าทุกออเดอร์`,
    warrantyPolicyEn: `100% Genuine Guarantee & Warranty:
1. Every part sold by MOBEX is 100% genuine and sourced directly from certified manufacturers and OEM suppliers.
2. All components carry a minimum warranty of 6 months or 10,000 km (whichever occurs first).
3. Warranty covers manufacturing flaws under standard installation conditions.
4. Full official tax invoice and genuine guarantee certificates are provided with every order.`,
    shippingPolicyTh: `นโยบายการจัดส่งสินค้า:
1. ตัดรอบจัดส่งสินค้าเวลา 14:00 น. ของทุกวันทำการ (จันทร์ - เสาร์)
2. สินค้าในเขตกรุงเทพฯ และปริมณฑล จัดส่งถึงมือผู้รับภายใน 1-2 วันทำการ
3. สินค้าในพื้นที่ต่างจังหวัด จัดส่งถึงมือผู้รับภายใน 2-3 วันทำการ
4. ยอดสั่งซื้อครบ 2,000 บาทขึ้นไป จัดส่งฟรีทั่วประเทศ`,
    shippingPolicyEn: `Shipping & Delivery Policy:
1. Same-day dispatch for orders confirmed before 14:00 (Mon - Sat).
2. Greater Bangkok delivery within 1-2 business days.
3. Upcountry provinces delivered within 2-3 business days.
4. Free standard shipping nationwide on all orders of 2,000 THB or more.`,
    privacyPolicyTh: `นโยบายความเป็นส่วนตัว (PDPA):
1. ทางบริษัทฯ เคารพสิทธิความเป็นส่วนตัวและคุ้มครองข้อมูลส่วนบุคคลของลูกค้าตามกฎหมาย PDPA
2. ข้อมูลชื่อ ที่อยู่ เบอร์โทรศัพท์ และข้อมูลยานพาหนะ จะถูกนำไปใช้เพื่อการจัดส่งสินค้าและบริการหลังการขายเท่านั้น
3. ทางบริษัทฯ จะไม่เปิดเผยหรือจำหน่ายข้อมูลส่วนบุคคลของลูกค้าแก่บุคคลภายนอกโดยไม่ได้รับความยินยอม`,
    privacyPolicyEn: `Privacy Policy (PDPA Compliance):
1. We strictly comply with the Personal Data Protection Act (PDPA) to safeguard your privacy.
2. Information such as names, addresses, phone numbers, and vehicle details are exclusively used for order fulfillment and technical support.
3. We never sell, lease, or distribute your private information to third parties without explicit consent.`,
    termsOfServiceTh: `ข้อกำหนดและเงื่อนไขการใช้บริการ:
1. การสั่งซื้อสินค้าผ่านเว็บไซต์ถือว่าลูกค้ายอมรับข้อกำหนดและเงื่อนไขทั้งหมด
2. การสั่งซื้อในราคาสมาชิก (Garage / Shop / Fleet) จะต้องผ่านการยืนยันตัวตนและอนุมัติจากผู้ดูแลระบบ
3. ราคาสินค้าและโปรโมชันอาจมีการเปลี่ยนแปลงตามสภาวะตลาดโดยมิต้องแจ้งให้ทราบล่วงหน้า`,
    termsOfServiceEn: `Terms of Service:
1. Placing an order on this website constitutes acceptance of all terms and service conditions.
2. Access to special member tiered pricing (Garage/Shop/Fleet) requires verified business authentication.
3. Prices, promotions, and product specifications are subject to updates according to manufacturer guidelines.`,
  }
};

let inMemorySettings = { ...defaultSettings };

export async function settingsRoutes(fastify: FastifyInstance) {
  // GET /api/v1/settings - Get system configurations
  fastify.get('/api/v1/settings', async (req, reply) => {
    try {
      const records = await prisma.systemSetting.findMany();
      if (records && records.length > 0) {
        const result: any = { ...defaultSettings };
        records.forEach((r) => {
          result[r.key.toLowerCase()] = r.value;
        });
        return reply.send({ success: true, settings: result });
      }
    } catch (e) {}

    return reply.send({ success: true, settings: inMemorySettings });
  });

  // PUT /api/v1/settings - Admin update system configuration
  fastify.put('/api/v1/settings', { bodyLimit: 50 * 1024 * 1024 }, async (req, reply) => {
    const body = (req.body || {}) as any;
    if (body.payment) inMemorySettings.payment = { ...inMemorySettings.payment, ...body.payment };
    if (body.shipping) inMemorySettings.shipping = { ...inMemorySettings.shipping, ...body.shipping };
    if (body.general) inMemorySettings.general = { ...inMemorySettings.general, ...body.general };
    if (body.branding) inMemorySettings.branding = { ...inMemorySettings.branding, ...body.branding };
    if (body.typography) inMemorySettings.typography = { ...inMemorySettings.typography, ...body.typography };
    if (body.banners) inMemorySettings.banners = body.banners;
    if (body.menus) inMemorySettings.menus = body.menus;
    if (body.navigation) inMemorySettings.navigation = { ...inMemorySettings.navigation, ...body.navigation };
    if (body.storeInfo) inMemorySettings.storeInfo = { ...inMemorySettings.storeInfo, ...body.storeInfo };
    if (body.policies) inMemorySettings.policies = { ...inMemorySettings.policies, ...body.policies };

    try {
      if (body.payment) {
        await prisma.systemSetting.upsert({
          where: { key: 'PAYMENT' },
          update: { value: inMemorySettings.payment },
          create: { key: 'PAYMENT', value: inMemorySettings.payment, category: 'PAYMENT' },
        });
      }
      if (body.shipping) {
        await prisma.systemSetting.upsert({
          where: { key: 'SHIPPING' },
          update: { value: inMemorySettings.shipping },
          create: { key: 'SHIPPING', value: inMemorySettings.shipping, category: 'SHIPPING' },
        });
      }
      if (body.general) {
        await prisma.systemSetting.upsert({
          where: { key: 'GENERAL' },
          update: { value: inMemorySettings.general },
          create: { key: 'GENERAL', value: inMemorySettings.general, category: 'GENERAL' },
        });
      }
      if (body.branding) {
        await prisma.systemSetting.upsert({
          where: { key: 'BRANDING' },
          update: { value: inMemorySettings.branding },
          create: { key: 'BRANDING', value: inMemorySettings.branding, category: 'GENERAL' },
        });
      }
      if (body.typography) {
        await prisma.systemSetting.upsert({
          where: { key: 'TYPOGRAPHY' },
          update: { value: inMemorySettings.typography },
          create: { key: 'TYPOGRAPHY', value: inMemorySettings.typography, category: 'GENERAL' },
        });
      }
      if (body.banners) {
        await prisma.systemSetting.upsert({
          where: { key: 'BANNERS' },
          update: { value: inMemorySettings.banners },
          create: { key: 'BANNERS', value: inMemorySettings.banners, category: 'GENERAL' },
        });
      }
      if (body.menus) {
        await prisma.systemSetting.upsert({
          where: { key: 'MENUS' },
          update: { value: inMemorySettings.menus },
          create: { key: 'MENUS', value: inMemorySettings.menus, category: 'GENERAL' },
        });
      }
      if (body.navigation) {
        await prisma.systemSetting.upsert({
          where: { key: 'NAVIGATION' },
          update: { value: inMemorySettings.navigation },
          create: { key: 'NAVIGATION', value: inMemorySettings.navigation, category: 'GENERAL' },
        });
      }
      if (body.storeInfo) {
        await prisma.systemSetting.upsert({
          where: { key: 'STOREINFO' },
          update: { value: inMemorySettings.storeInfo },
          create: { key: 'STOREINFO', value: inMemorySettings.storeInfo, category: 'GENERAL' },
        });
      }
      if (body.policies) {
        await prisma.systemSetting.upsert({
          where: { key: 'POLICIES' },
          update: { value: inMemorySettings.policies },
          create: { key: 'POLICIES', value: inMemorySettings.policies, category: 'GENERAL' },
        });
      }
    } catch (e) {}

    return reply.send({ success: true, settings: inMemorySettings, message: 'Settings updated successfully' });
  });
}

export default settingsRoutes;
