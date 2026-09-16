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
  menus: [
    { labelTh: 'หน้าหลัก', labelEn: 'Home', target: 'home' },
    { labelTh: 'สินค้าทั้งหมด', labelEn: 'Tech & Shop', target: 'product-list' },
    { labelTh: 'โปรโมชันพิเศษ', labelEn: 'Promos & Deals', target: 'product-list' },
    { labelTh: 'เลือกรุ่นรถยนต์', labelEn: 'Vehicle Fitment', target: 'vehicle-selector' },
    { labelTh: 'บทความ & ข่าวสาร', labelEn: 'Articles & News', target: 'articles' },
  ]
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
  fastify.put('/api/v1/settings', async (req, reply) => {
    const body = req.body as any;
    if (body.payment) inMemorySettings.payment = { ...inMemorySettings.payment, ...body.payment };
    if (body.shipping) inMemorySettings.shipping = { ...inMemorySettings.shipping, ...body.shipping };
    if (body.general) inMemorySettings.general = { ...inMemorySettings.general, ...body.general };
    if (body.menus) inMemorySettings.menus = body.menus;

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
    } catch (e) {}

    return reply.send({ success: true, settings: inMemorySettings, message: 'Settings updated successfully' });
  });
}

export default settingsRoutes;
