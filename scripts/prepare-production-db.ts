/**
 * Prepare Production Database Script
 * 
 * Cleans out all test transactional data, test accounts, test warehouses,
 * test procurement records, and mock/test products while preserving:
 * - RBAC Roles and Permissions
 * - Vehicle Hierarchy (Makes, Models, Generations, Engines, Variants)
 * - Categories & Brands
 * - Genuine Automotive Products with tiered pricing & fitments
 * - Official Warehouses (WH-MAIN, WH-BKK-01) with clean opening inventory
 * - Official User Accounts (Super Admin, Catalog Manager, B2B Workshop/Shop, Consumer)
 * - Clean Automotive Maintenance Articles
 */

import { PrismaClient, PriceTier, FitmentStatus, ProductReferenceType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting Production Database Preparation & Cleanup...\n');

  // --------------------------------------------------------------------------
  // 1. PURGE MARKETING, CRM, LOYALTY & PROMOTIONS TEST DATA
  // --------------------------------------------------------------------------
  console.log('📦 Step 1: Cleaning Marketing, Promotions & CRM test records...');
  
  await prisma.campaignEvent.deleteMany({});
  await prisma.campaignAudience.deleteMany({});
  await prisma.marketingCampaign.deleteMany({});
  console.log('  ✓ Cleaned marketing campaigns and audience events');

  await prisma.customerSegmentRule.deleteMany({});
  await prisma.customerSegmentMembership.deleteMany({});
  await prisma.customerSegment.deleteMany({});
  console.log('  ✓ Cleaned customer segments');

  await prisma.customerTagAssignment.deleteMany({});
  await prisma.customerTag.deleteMany({});
  console.log('  ✓ Cleaned customer tags');

  await prisma.couponRedemption.deleteMany({});
  await prisma.coupon.deleteMany({});
  await prisma.promotionRule.deleteMany({});
  await prisma.promotionProduct.deleteMany({});
  await prisma.promotionCategory.deleteMany({});
  await prisma.promotionBrand.deleteMany({});
  await prisma.promotion.deleteMany({});
  console.log('  ✓ Cleaned promotions and coupons');

  await prisma.loyaltyTransaction.deleteMany({});
  await prisma.loyaltyAccount.updateMany({
    data: {
      pointsBalance: 0,
      lifetimeEarned: 0,
      lifetimeRedeemed: 0,
    },
  });
  console.log('  ✓ Cleaned loyalty transactions and reset account balances');

  await prisma.customerActivity.deleteMany({});
  console.log('  ✓ Cleaned customer activity logs');

  // --------------------------------------------------------------------------
  // 2. PURGE PROCUREMENT TEST DATA (PO, Goods Receipts, Test Suppliers)
  // --------------------------------------------------------------------------
  console.log('\n📦 Step 2: Cleaning Procurement test records...');

  await prisma.goodsReceiptItem.deleteMany({});
  await prisma.goodsReceipt.deleteMany({});
  await prisma.purchaseOrderItem.deleteMany({});
  await prisma.purchaseOrder.deleteMany({});
  await prisma.supplierProduct.deleteMany({});
  await prisma.supplier.deleteMany({});
  console.log('  ✓ Cleaned goods receipts, purchase orders, and test suppliers');

  // Seed 4 official automotive OEM/Aftermarket suppliers
  const officialSuppliers = [
    {
      code: 'SUP-DENSO-TH',
      name: 'Denso International (Thailand) Co., Ltd.',
      contactName: 'แผนกขายและจัดส่งอะไหล่แท้ OEM',
      email: 'sales.oem@denso.co.th',
      phone: '02-315-9500',
      addressLine1: 'นิคมอุตสาหกรรมบางพลี ต.บางเสาธง อ.บางเสาธง สมุทรปราการ',
      isActive: true,
    },
    {
      code: 'SUP-TRW-ASIA',
      name: 'ZF Aftermarket (TRW Automotive Thailand)',
      contactName: 'ฝ่ายการค้าอะไหล่ทดแทนระบบเบรกและช่วงล่าง',
      email: 'contact.th@zf.com',
      phone: '02-714-4800',
      addressLine1: 'อาคารเอ็มโพเรียมทาวเวอร์ ถนนสุขุมวิท คลองเตย กรุงเทพมหานคร',
      isActive: true,
    },
    {
      code: 'SUP-AKEBONO-TH',
      name: 'Akebono Brake (Thailand) Co., Ltd.',
      contactName: 'ฝ่ายจัดจำหน่ายผ้าเบรกพรีเมียม',
      email: 'distribution@akebono-brake.co.th',
      phone: '038-522-300',
      addressLine1: 'นิคมอุตสาหกรรมเวลโกรว์ ต.บางสมัคร อ.บางปะกง ฉะเชิงเทรา',
      isActive: true,
    },
    {
      code: 'SUP-SAKURA-TH',
      name: 'Sakura Filter Industry (Thailand)',
      contactName: 'ฝ่ายขายส่งไส้กรองยานยนต์',
      email: 'order@sakurafilter.co.th',
      phone: '02-420-1122',
      addressLine1: 'ถนนเพชรเกษม แขวงหนองค้างพลู เขตหนองแขม กรุงเทพมหานคร',
      isActive: true,
    },
  ];

  for (const s of officialSuppliers) {
    await prisma.supplier.create({ data: s });
  }
  console.log('  ✓ Seeded 4 official automotive suppliers');

  // --------------------------------------------------------------------------
  // 3. PURGE TRANSACTIONAL ORDERS, PAYMENTS, SHIPMENTS, CARTS, SESSIONS
  // --------------------------------------------------------------------------
  console.log('\n📦 Step 3: Cleaning Orders, Payments, Shipments, Carts and Sessions...');

  await prisma.orderStatusHistory.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.paymentSlip.deleteMany({});
  await prisma.paymentRefund.deleteMany({});
  await prisma.paymentTransaction.deleteMany({});
  await prisma.paymentEvent.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.shippingWebhookEvent.deleteMany({});
  await prisma.shippingEvent.deleteMany({});
  await prisma.shipment.deleteMany({});
  await prisma.order.deleteMany({});
  console.log('  ✓ Cleaned all orders, payment records, and shipments');

  await prisma.cartItem.deleteMany({});
  await prisma.cart.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.webhookEvent.deleteMany({});
  console.log('  ✓ Cleaned carts, sessions, audit logs, and webhooks');

  await prisma.stockReservation.deleteMany({});
  await prisma.stockMovement.deleteMany({});
  console.log('  ✓ Cleaned stock reservations and ledger movements');

  // --------------------------------------------------------------------------
  // 4. CLEAN TEST PRODUCTS & RESTORE GENUINE AUTOMOTIVE CATALOG
  // --------------------------------------------------------------------------
  console.log('\n📦 Step 4: Cleaning test products and verifying genuine catalog...');

  const allProducts = await prisma.product.findMany({
    select: { id: true, sku: true, name: true },
  });

  const genuineSkus = ['AKE-AN-787WK', 'TRW-GDB7782', 'DEN-IK20TT', 'SAK-C-1109', 'MOB-1-0W40-4L'];

  let deletedTestProductsCount = 0;
  for (const prod of allProducts) {
    if (!genuineSkus.includes(prod.sku)) {
      // Delete relations for test product
      await prisma.productPrice.deleteMany({ where: { productId: prod.id } });
      await prisma.productCrossReference.deleteMany({ where: { productId: prod.id } });
      await prisma.productFitment.deleteMany({ where: { productId: prod.id } });
      await prisma.productImage.deleteMany({ where: { productId: prod.id } });
      await prisma.productAttributeValue.deleteMany({ where: { productId: prod.id } });
      await prisma.inventoryItem.deleteMany({ where: { productId: prod.id } });
      await prisma.supplierProduct.deleteMany({ where: { productId: prod.id } });
      await prisma.promotionProduct.deleteMany({ where: { productId: prod.id } });
      await prisma.product.delete({ where: { id: prod.id } });
      deletedTestProductsCount++;
    }
  }
  console.log(`  ✓ Removed ${deletedTestProductsCount} test products and related data`);

  // Restore mutated TRW product
  await prisma.product.update({
    where: { sku: 'TRW-GDB7782' },
    data: {
      name: 'TRW DTEC Ceramic ผ้าเบรกหน้า Toyota Camry XV70 / Fortuner AN160',
      shortDescription: 'ผ้าเบรกเซรามิกเคลือบสาร COTEC เบรกสั้นตั้งแต่กิโลเมตรแรก',
      description: 'ผ้าเบรกหน้า TRW DTEC นวัตกรรมเนื้อเซรามิกผสมผสานสารเคลือบผิวสัมผัส COTEC สำหรับ Toyota Camry 2.5 และ Fortuner 2.8 GR Sport มาตรฐานระดับ OEM สากล',
      isActive: true,
      isPublished: true,
    },
  });
  console.log('  ✓ Restored TRW-GDB7782 product title and descriptions');

  // Link genuine products to suppliers
  const supplierDenso = await prisma.supplier.findUnique({ where: { code: 'SUP-DENSO-TH' } });
  const supplierTRW = await prisma.supplier.findUnique({ where: { code: 'SUP-TRW-ASIA' } });
  const supplierAkebono = await prisma.supplier.findUnique({ where: { code: 'SUP-AKEBONO-TH' } });
  const supplierSakura = await prisma.supplier.findUnique({ where: { code: 'SUP-SAKURA-TH' } });

  const genuineProducts = await prisma.product.findMany({});
  for (const gp of genuineProducts) {
    let supId = supplierDenso?.id;
    let cost = 1000;
    if (gp.sku.startsWith('AKE')) { supId = supplierAkebono?.id; cost = 1200; }
    else if (gp.sku.startsWith('TRW')) { supId = supplierTRW?.id; cost = 1300; }
    else if (gp.sku.startsWith('SAK')) { supId = supplierSakura?.id; cost = 120; }
    else if (gp.sku.startsWith('DEN')) { supId = supplierDenso?.id; cost = 850; }

    if (supId) {
      await prisma.supplierProduct.upsert({
        where: {
          supplierId_productId: {
            supplierId: supId,
            productId: gp.id,
          },
        },
        update: { supplierSku: `SUP-${gp.sku}`, purchaseCost: cost },
        create: {
          supplierId: supId,
          productId: gp.id,
          supplierSku: `SUP-${gp.sku}`,
          purchaseCost: cost,
          leadTimeDays: 2,
          moq: 5,
          isPreferred: true,
        },
      });
    }
  }
  console.log('  ✓ Linked genuine products to official suppliers');

  // --------------------------------------------------------------------------
  // 5. PURGE TEST WAREHOUSES & RESET OPENING INVENTORY
  // --------------------------------------------------------------------------
  console.log('\n📦 Step 5: Cleaning test warehouses and initializing clean stock...');

  const allWarehouses = await prisma.warehouse.findMany({});
  for (const wh of allWarehouses) {
    if (wh.code !== 'WH-MAIN' && wh.code !== 'WH-BKK-01') {
      await prisma.inventoryItem.deleteMany({ where: { warehouseId: wh.id } });
      await prisma.warehouseLocation.deleteMany({ where: { warehouseId: wh.id } });
      await prisma.warehouse.delete({ where: { id: wh.id } });
    }
  }
  console.log('  ✓ Removed test warehouses (only WH-MAIN and WH-BKK-01 preserved)');

  const whMain = await prisma.warehouse.findUnique({ where: { code: 'WH-MAIN' } });
  const whBkk = await prisma.warehouse.findUnique({ where: { code: 'WH-BKK-01' } });

  if (whMain && whBkk) {
    for (const gp of genuineProducts) {
      // Opening inventory at Main DC
      await prisma.inventoryItem.upsert({
        where: {
          warehouseId_productId: {
            warehouseId: whMain.id,
            productId: gp.id,
          },
        },
        update: {
          onHand: 120,
          reserved: 0,
          safetyStock: 15,
        },
        create: {
          productId: gp.id,
          warehouseId: whMain.id,
          onHand: 120,
          reserved: 0,
          safetyStock: 15,
        },
      });

      // Opening inventory at Rama 9 Hub
      await prisma.inventoryItem.upsert({
        where: {
          warehouseId_productId: {
            warehouseId: whBkk.id,
            productId: gp.id,
          },
        },
        update: {
          onHand: 35,
          reserved: 0,
          safetyStock: 8,
        },
        create: {
          productId: gp.id,
          warehouseId: whBkk.id,
          onHand: 35,
          reserved: 0,
          safetyStock: 8,
        },
      });
    }
    console.log('  ✓ Set clean opening stock (WH-MAIN: 120 units, WH-BKK-01: 35 units, reserved: 0)');
  }

  // --------------------------------------------------------------------------
  // 6. PURGE TEST USERS WHILE PRESERVING SYSTEM & OFFICIAL DEMO ACCOUNTS
  // --------------------------------------------------------------------------
  console.log('\n📦 Step 6: Cleaning test user accounts...');

  const preservedEmails = [
    'admin@mobex.co.th',
    'catalog@mobex.co.th',
    'manager.m11@mobex.co.th',
    'clerk.m11@mobex.co.th',
    'accountant.m11@mobex.co.th',
    'sales.m11@mobex.co.th',
    'manager.m12@mobex.co.th',
    'staff.m12@mobex.co.th',
    'somchai@autoworkshop.com',
    'bangkokparts@shop.co.th',
    'ananda@consumer.com',
  ];

  const testUsers = await prisma.user.findMany({
    where: {
      email: { notIn: preservedEmails },
    },
    include: {
      customerProfile: {
        include: {
          addresses: true,
        },
      },
    },
  });

  for (const tu of testUsers) {
    if (tu.customerProfile) {
      await prisma.customerAddress.deleteMany({ where: { customerId: tu.customerProfile.id } });
      await prisma.customerProfile.delete({ where: { id: tu.customerProfile.id } });
    }
    await prisma.userRole.deleteMany({ where: { userId: tu.id } });
    await prisma.session.deleteMany({ where: { userId: tu.id } });
    await prisma.user.delete({ where: { id: tu.id } });
  }
  console.log(`  ✓ Removed ${testUsers.length} test user accounts`);

  // --------------------------------------------------------------------------
  // 7. SEED OFFICIAL AUTOMOTIVE ARTICLES INTO DB
  // --------------------------------------------------------------------------
  console.log('\n📦 Step 7: Seeding clean automotive knowledge articles...');

  await prisma.article.deleteMany({});

  const automotiveArticles = [
    {
      titleTh: 'คู่มือเลือกซื้อผ้าเบรกเซรามิกตรงรุ่นและวิธีตรวจสอบความหนาจานเบรก',
      titleEn: 'Ceramic Brake Pads Selection & Brake Rotor Thickness Inspection Guide',
      slug: 'ceramic-brake-pads-and-rotor-thickness-guide',
      contentTh: 'การเลือกผ้าเบรกให้ตรงกับลักษณะการใช้งานและรุ่นรถเป็นสิ่งสำคัญอย่างยิ่ง สำหรับรถยนต์ใช้งานทั่วไปในเมือง ผ้าเบรกเซรามิก (Ceramic Brake Pads) ให้ประสิทธิภาพการเบรกที่นุ่มนวล เงียบ ไร้เสียงรบกวน และมีปริมาณฝุ่นผงเบรกเกาะล้อน้อยกว่าผ้าเบรกประเภทกึ่งโลหะ (Semi-Metallic) อย่างเห็นได้ชัด นอกจากนี้ควรตรวจเช็กความหนาขั้นต่ำ (Minimum Thickness) ของจานดิสก์เบรกทุกครั้งที่เปลี่ยนผ้าเบรก เพื่อความปลอดภัยสูงสุดในการหยุดรถ',
      contentEn: 'Choosing the correct brake pad formulation for your vehicle and driving conditions is critical for safety. Ceramic brake pads offer smooth deceleration, minimal noise, and low brake dust compared to semi-metallic alternatives. Always inspect rotor minimum thickness when replacing pads to ensure safe braking distances.',
      coverImage: 'https://images.unsplash.com/photo-1600706432502-778e34279b90?w=600&auto=format&fit=crop&q=80',
      category: 'Brake System',
      published: true,
      author: 'MOBEX Technical Specialist',
      views: 1250,
    },
    {
      titleTh: '5 สัญญาณเตือนเมื่อถึงเวลาต้องเปลี่ยนหัวเทียนรถยนต์',
      titleEn: '5 Critical Warning Signs Your Engine Spark Plugs Need Replacement',
      slug: '5-warning-signs-spark-plugs-need-replacement',
      contentTh: 'หัวเทียนเป็นชิ้นส่วนสำคัญในห้องเผาไหม้ของเครื่องยนต์เบนซิน สัญญาณเตือนที่บ่งบอกว่าหัวเทียนเสื่อมสภาพ ได้แก่: 1. เครื่องยนต์สตาร์ทติดยาก โดยเฉพาะช่วงเช้า 2. รอบเดินเบาสั่น กระตุก หรือสะดุด 3. อัตราเร่งอืด ตอบสนองช้าลงเมื่อเหยียบคันเร่ง 4. สิ้นเปลืองน้ำมันเชื้อเพลิงมากกว่าปกติ และ 5. มีไฟรูปเครื่องยนต์ (Check Engine Light) โชว์ที่หน้าปัด แนะนำให้ตรวจเช็กตามรอบทุก 20,000 - 100,000 กม. ขึ้นอยู่กับชนิดหัวเทียน (Standard / Platinum / Iridium)',
      contentEn: 'Spark plugs are vital for combustion efficiency. Key symptoms of worn plugs include rough idling, hard starting, sluggish acceleration, decreased fuel economy, and check engine lights (misfire codes). Iridium plugs typically last up to 100,000 km.',
      coverImage: 'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?w=600&auto=format&fit=crop&q=80',
      category: 'Engine & Ignition',
      published: true,
      author: 'MOBEX Technical Specialist',
      views: 2480,
    },
    {
      titleTh: 'เลือกน้ำมันเครื่องสังเคราะห์แท้ 100% เบอร์ความหนืดใดที่เหมาะกับเครื่องยนต์ของคุณ',
      titleEn: 'Fully Synthetic Engine Oil Viscosity Guide: 0W-20 vs 5W-30 vs 0W-40',
      slug: 'fully-synthetic-engine-oil-viscosity-guide',
      contentTh: 'ตัวเลขความหนืด SAE เช่น 0W-20, 5W-30 หรือ 0W-40 มีความหมายต่อการปกป้องเครื่องยนต์อย่างยิ่ง ตัวเลขหน้าตัว W แสดงความสามารถในการไหลเวียนของน้ำมันที่อุณหภูมิต่ำ ขณะที่ตัวเลขด้านหลังแสดงความหนืดของฟิล์มน้ำมันที่อุณหภูมิการทำงานของเครื่องยนต์ (100°C) สำหรับรถยนต์ Eco Car และ Hybrid รุ่นใหม่นิยมใช้ 0W-20 เพื่อลดแรงเสียดทานและประหยัดน้ำมัน ส่วนรถยนต์สมรรถนะสูงหรือเครื่องยนต์ที่มีเลขไมล์สูงแนะนำใช้เบอร์ความหนืดสูงขึ้นเพื่อรักษาแรงดันน้ำมันเครื่อง',
      contentEn: 'Selecting the proper motor oil viscosity is crucial for longevity and performance. Modern eco and hybrid engines thrive on low-viscosity 0W-20 for maximum fuel economy, while high-mileage or turbo engines benefit from higher film strength like 5W-30 or 0W-40.',
      coverImage: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=600&auto=format&fit=crop&q=80',
      category: 'Lubricants & Fluids',
      published: true,
      author: 'Engineering Team',
      views: 3120,
    },
    {
      titleTh: 'การตรวจเช็กและบำรุงรักษาระบบช่วงล่าง ยางบูช และลูกหมาก เพื่อการควบคุมที่มั่นใจ',
      titleEn: 'Suspension, Bushing & Ball Joint Health Inspection Best Practices',
      slug: 'suspension-bushing-and-ball-joint-maintenance',
      contentTh: 'ระบบช่วงล่างรถยนต์ต้องรับแรงกระแทกจากพื้นผิวถนนตลอดเวลา หากรู้สึกว่าพวงมาลัยสั่น ยางสึกไม่สม่ำเสมอ หรือมีเสียงดังกุกกักเวลาข้ามลูกระนาด อาจเป็นสัญญาณของลูกหมากปีกนก ยางกันโคลง หรือบูชยางเสื่อมสภาพ การตรวจเช็กและเปลี่ยนอะไหล่ช่วงล่างที่ได้มาตรฐานจะช่วยฟื้นฟูเสถียรภาพการควบคุมและการเกาะถนนให้กลับมาสมบูรณ์แบบเหมือนรถใหม่อีกครั้ง',
      contentEn: 'Suspension components absorb relentless road shock. Clunking over bumps, steering wander, and uneven tire wear indicate worn ball joints, control arm bushings, or stabilizer links. Regular inspection maintains driving comfort and handling precision.',
      coverImage: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=600&auto=format&fit=crop&q=80',
      category: 'Suspension & Steering',
      published: true,
      author: 'Service Operations',
      views: 1890,
    },
  ];

  for (const art of automotiveArticles) {
    await prisma.article.create({ data: art });
  }
  console.log(`  ✓ Seeded ${automotiveArticles.length} professional automotive articles`);

  // --------------------------------------------------------------------------
  // 8. SUMMARY AUDIT
  // --------------------------------------------------------------------------
  console.log('\n=============================================================');
  console.log('🎉 PRODUCTION DATABASE RESET & AUDIT COMPLETE');
  console.log('=============================================================');
  console.log(`- Official Users:        ${await prisma.user.count()}`);
  console.log(`- RBAC Roles:            ${await prisma.role.count()}`);
  console.log(`- Categories:            ${await prisma.category.count()}`);
  console.log(`- Brands:                ${await prisma.brand.count()}`);
  console.log(`- Genuine Products:      ${await prisma.product.count()}`);
  console.log(`- Product Tier Prices:   ${await prisma.productPrice.count()}`);
  console.log(`- Fitments Mapped:       ${await prisma.productFitment.count()}`);
  console.log(`- Official Suppliers:    ${await prisma.supplier.count()}`);
  console.log(`- Active Warehouses:     ${await prisma.warehouse.count()}`);
  console.log(`- Inventory Items:       ${await prisma.inventoryItem.count()}`);
  console.log(`- Orders in DB:          ${await prisma.order.count()} (Clean / Ready)`);
  console.log(`- Carts in DB:           ${await prisma.cart.count()} (Clean / Ready)`);
  console.log(`- Sessions in DB:        ${await prisma.session.count()} (Clean / Ready)`);
  console.log(`- Audit Logs in DB:      ${await prisma.auditLog.count()} (Clean / Ready)`);
  console.log(`- Automotive Articles:   ${await prisma.article.count()}`);
  console.log('=============================================================\n');
}

main()
  .catch((e) => {
    console.error('❌ Failed to prepare production database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
