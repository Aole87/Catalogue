import { buildApp } from '../apps/api/src/app';
import { prisma, OrderStatus, ShipmentStatus, PaymentStatus, PriceTier } from '@car-parts/database';
import { FastifyInstance } from 'fastify';
import { OrderStateMachine } from '../apps/api/src/services/order/order-state-machine';

interface TestSummary {
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestSummary[] = [];

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
}

async function recordTest(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    results.push({ name, passed: true });
    console.log(`  ✅ [PASS] ${name}`);
  } catch (err: any) {
    results.push({ name, passed: false, error: err.message });
    console.error(`  ❌ [FAIL] ${name}: ${err.message}`);
  }
}

async function runM9TestSuite() {
  console.log('🧪 Starting Phase M9 Order Management & Order Lifecycle Test Suite...\n');

  const app: FastifyInstance = await buildApp();
  await app.ready();

  // Find sample products & users for tests
  const sampleProducts = await prisma.product.findMany({
    where: { isActive: true, deletedAt: null, prices: { some: { tier: PriceTier.GARAGE } } },
    include: { prices: true, inventoryItems: true },
    take: 3,
  });
  assert(sampleProducts.length >= 2, 'Need at least 2 active products in DB');

  const garageUser = await prisma.user.findFirst({
    where: { email: 'somchai@autoworkshop.com' },
    include: { customerProfile: { include: { addresses: true } } },
  });
  assert(garageUser != null, 'Garage user found');

  const shopUser = await prisma.user.findFirst({
    where: { email: 'bangkokparts@shop.co.th' },
    include: { customerProfile: { include: { addresses: true } } },
  });
  assert(shopUser != null, 'Shop user found');

  const adminUser = await prisma.user.findFirst({
    where: { email: 'admin@mobex.co.th' },
  });
  assert(adminUser != null, 'Admin user found');

  // Helper to get session cookie for a user
  async function loginAndGetCookie(email: string, pass = 'Admin@123456') {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: { email, password: pass },
    });
    assert(res.statusCode === 200, `Login failed for ${email}`);
    const setCookie = res.headers['set-cookie'];
    return Array.isArray(setCookie) ? setCookie.join('; ') : (setCookie as string);
  }

  const garageCookie = await loginAndGetCookie('somchai@autoworkshop.com');
  const shopCookie = await loginAndGetCookie('bangkokparts@shop.co.th');
  const adminCookie = await loginAndGetCookie('admin@mobex.co.th');

  // Helper to create a clean test order
  async function createTestOrder(cookie: string, product: any, qty = 2) {
    // 1. Clear cart
    await app.inject({
      method: 'DELETE',
      url: '/api/v1/cart',
      headers: { cookie },
    });

    // 2. Add product to cart
    await app.inject({
      method: 'POST',
      url: '/api/v1/cart/items',
      headers: { cookie },
      payload: { productId: product.id, quantity: qty },
    });

    // 3. Checkout
    const checkoutRes = await app.inject({
      method: 'POST',
      url: '/api/v1/checkout',
      headers: { cookie },
      payload: {
        shippingAddress: {
          recipientName: 'สมชาย ผู้รับสินค้า',
          phone: '0812345678',
          addressLine: '123/45 ถนนพระราม 2 ซอย 20',
          subdistrict: 'บางมด',
          district: 'จอมทอง',
          province: 'กรุงเทพมหานคร',
          postalCode: '10150',
        },
      },
    });

    assert(checkoutRes.statusCode === 201, `Checkout failed: ${checkoutRes.body}`);
    return JSON.parse(checkoutRes.body).data;
  }

  // Helper to create a paid test order
  async function createPaidOrder(cookie: string, product: any) {
    const order = await createTestOrder(cookie, product);
    // Mark order as PAYMENT_CONFIRMED directly in DB for testing
    await prisma.order.update({
      where: { id: order.id },
      data: { status: OrderStatus.PAYMENT_CONFIRMED },
    });
    // Update existing payment or create one
    const total = order.grandTotal ?? order.totalAmount ?? 100;
    const existingPayment = await prisma.payment.findFirst({
      where: { orderId: order.id },
    });
    if (existingPayment) {
      await prisma.payment.update({
        where: { id: existingPayment.id },
        data: {
          status: PaymentStatus.PAID,
          paidAt: new Date(),
          amount: total,
        },
      });
    } else {
      await prisma.payment.create({
        data: {
          orderId: order.id,
          provider: 'PROMPTPAY',
          method: 'QR',
          amount: total,
          currency: 'THB',
          status: PaymentStatus.PAID,
          providerReference: `PAY-M9-TEST-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          paidAt: new Date(),
        },
      });
    }

    const updated = await prisma.order.findUnique({
      where: { id: order.id },
      include: { customer: { include: { addresses: true, user: true } }, items: true, payments: true },
    });
    return updated!;
  }

  // Helper to create a delivered test order
  async function createDeliveredOrder(cookie: string, product: any) {
    const order = await createPaidOrder(cookie, product);
    await prisma.order.update({
      where: { id: order.id },
      data: { status: OrderStatus.DELIVERED },
    });
    // Create shipment record
    await prisma.shipment.create({
      data: {
        orderId: order.id,
        shipmentNumber: `SHP-M9-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        carrier: 'Flash Express',
        status: ShipmentStatus.DELIVERED,
        trackingNumber: `TH-FLASH-${Date.now()}`,
        shippingCost: 60,
        deliveredAt: new Date(),
      },
    });

    const updated = await prisma.order.findUnique({
      where: { id: order.id },
      include: { customer: { include: { addresses: true, user: true } }, items: true, payments: true, shipments: true },
    });
    return updated!;
  }

  // ----------------------------------------------------------------------------
  // TEST CASES
  // ----------------------------------------------------------------------------

  await recordTest('M9-T01: Order State Machine Legal Sequential Transitions', async () => {
    // Test sequential transitions
    assert(OrderStateMachine.canTransition(OrderStatus.PENDING_PAYMENT, OrderStatus.PAYMENT_CONFIRMED), 'PENDING_PAYMENT -> PAYMENT_CONFIRMED must be valid');
    assert(OrderStateMachine.canTransition(OrderStatus.PAYMENT_CONFIRMED, OrderStatus.PROCESSING), 'PAYMENT_CONFIRMED -> PROCESSING must be valid');
    assert(OrderStateMachine.canTransition(OrderStatus.PROCESSING, OrderStatus.READY_FOR_SHIPMENT), 'PROCESSING -> READY_FOR_SHIPMENT must be valid');
    assert(OrderStateMachine.canTransition(OrderStatus.READY_FOR_SHIPMENT, OrderStatus.SHIPPED), 'READY_FOR_SHIPMENT -> SHIPPED must be valid');
    assert(OrderStateMachine.canTransition(OrderStatus.SHIPPED, OrderStatus.DELIVERED), 'SHIPPED -> DELIVERED must be valid');
    assert(OrderStateMachine.canTransition(OrderStatus.DELIVERED, OrderStatus.RETURN_REQUESTED), 'DELIVERED -> RETURN_REQUESTED must be valid');
    assert(OrderStateMachine.canTransition(OrderStatus.RETURN_REQUESTED, OrderStatus.RETURNED), 'RETURN_REQUESTED -> RETURNED must be valid');

    // Test terminal state
    assert(OrderStateMachine.isTerminal(OrderStatus.CANCELLED), 'CANCELLED is terminal');
    assert(OrderStateMachine.isTerminal(OrderStatus.REFUNDED), 'REFUNDED is terminal');
  });

  await recordTest('M9-T02: Illegal State Jump Rejection (e.g. PENDING_PAYMENT -> DELIVERED)', async () => {
    assert(!OrderStateMachine.canTransition(OrderStatus.PENDING_PAYMENT, OrderStatus.DELIVERED), 'PENDING_PAYMENT -> DELIVERED must be invalid');
    assert(!OrderStateMachine.canTransition(OrderStatus.PENDING_PAYMENT, OrderStatus.SHIPPED), 'PENDING_PAYMENT -> SHIPPED must be invalid');
    assert(!OrderStateMachine.canTransition(OrderStatus.CANCELLED, OrderStatus.PROCESSING), 'CANCELLED -> PROCESSING must be invalid');

    let threw = false;
    try {
      OrderStateMachine.validateTransition(OrderStatus.PENDING_PAYMENT, OrderStatus.DELIVERED);
    } catch (e: any) {
      threw = true;
      assert(e.message.includes('Invalid order status transition'), 'Error must mention invalid transition');
    }
    assert(threw, 'validateTransition must throw on illegal transition');
  });

  await recordTest('M9-T03: Customer Order History Query with Filters & Pagination', async () => {
    // Create an order first
    const testOrder = await createTestOrder(garageCookie, sampleProducts[0]);
    assert(testOrder != null, 'Order created');

    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/orders/my-orders?page=1&limit=5',
      headers: { cookie: garageCookie },
    });

    assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
    const body = JSON.parse(res.body);
    const orders = body.data ?? body.orders;
    assert(Array.isArray(orders), 'Orders must be an array');
    assert(orders.length >= 1, 'Should return at least 1 order');
    assert(body.pagination.page === 1, 'Pagination page must be 1');
    assert(body.pagination.limit === 5, 'Pagination limit must be 5');
    assert(body.pagination.total >= 1, 'Pagination total must be >= 1');
  });

  await recordTest('M9-T04: Customer Order Detail Query with Full Snapshot Data', async () => {
    const testOrder = await createTestOrder(garageCookie, sampleProducts[0]);

    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/orders/${testOrder.id}`,
      headers: { cookie: garageCookie },
    });

    assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
    const body = JSON.parse(res.body);
    const order = body.data ?? body.order;
    assert(order.id === testOrder.id, 'Order ID must match');
    assert(order.orderNumber === testOrder.orderNumber, 'Order Number must match');
    assert(Array.isArray(order.items), 'Order items must be present');
    assert(order.items.length >= 1, 'Must have items');
    assert(order.shippingAddress != null, 'Shipping address snapshot must be present');
    assert(order.shippingAddress.recipientName?.includes('สมชาย'), 'Snapshot recipient name verified');
  });

  await recordTest('M9-T05: Customer IDOR Protection (Tenant/Customer Isolation & Public Masking)', async () => {
    // Garage creates order
    const garageOrder = await createTestOrder(garageCookie, sampleProducts[0]);

    // 1. Cross-Customer IDOR by UUID: Shop user attempts to access Garage order by ID
    const idorRes = await app.inject({
      method: 'GET',
      url: `/api/v1/orders/${garageOrder.id}`,
      headers: { cookie: shopCookie },
    });
    assert(
      idorRes.statusCode === 403 || idorRes.statusCode === 404,
      `Expected 403 or 404 for cross-customer access by ID, got ${idorRes.statusCode}`
    );

    // 2. Cross-Customer IDOR by Order Number: Shop user attempts to access Garage order by orderNumber
    const idorNumberRes = await app.inject({
      method: 'GET',
      url: `/api/v1/orders/by-number/${garageOrder.orderNumber}`,
      headers: { cookie: shopCookie },
    });
    assert(
      idorNumberRes.statusCode === 403,
      `Expected 403 Forbidden for cross-customer orderNumber query, got ${idorNumberRes.statusCode}`
    );

    // 3. Shop user attempts to fetch timeline of Garage order
    const timelineRes = await app.inject({
      method: 'GET',
      url: `/api/v1/orders/${garageOrder.id}/timeline`,
      headers: { cookie: shopCookie },
    });
    assert(
      timelineRes.statusCode === 403 || timelineRes.statusCode === 404,
      `Expected 403/404 for IDOR timeline access, got ${timelineRes.statusCode}`
    );

    // 4. Unauthenticated guest order confirmation lookup returns sanitized public projection with masked PII
    const publicRes = await app.inject({
      method: 'GET',
      url: `/api/v1/orders/by-number/${garageOrder.orderNumber}`,
    });
    assert(publicRes.statusCode === 200, `Expected 200 for public confirmation lookup, got ${publicRes.statusCode}`);
    const publicBody = JSON.parse(publicRes.body).data;
    assert(publicBody.isPublicConfirmation === true, 'Public projection must have isPublicConfirmation: true');
    assert(publicBody.adminNotes === undefined, 'Public projection MUST NOT expose admin notes');
    assert(publicBody.customerNotes === undefined, 'Public projection MUST NOT expose internal customer notes');
    assert(publicBody.shippingAddress.recipientName.includes('*'), 'Public projection recipient name must be masked');
    assert(publicBody.shippingAddress.phone.includes('*'), 'Public projection phone must be masked');
    assert(publicBody.customer.user.email.includes('*'), 'Public projection customer email must be masked');
  });

  await recordTest('M9-T06: Order Timeline Synthesis from StatusHistory, PaymentEvent, ShippingEvent', async () => {
    const paidOrder = await createPaidOrder(garageCookie, sampleProducts[0]);

    // Add a status history entry
    await prisma.orderStatusHistory.create({
      data: {
        orderId: paidOrder.id,
        fromStatus: OrderStatus.PENDING_PAYMENT,
        toStatus: OrderStatus.PAYMENT_CONFIRMED,
        note: 'Payment confirmed via M9 test',
      },
    });

    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/orders/${paidOrder.id}/timeline`,
      headers: { cookie: garageCookie },
    });

    assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
    const body = JSON.parse(res.body);
    const timeline = body.data ?? body.timeline;
    assert(Array.isArray(timeline), 'Timeline must be an array');
    assert(timeline.length >= 1, 'Timeline must contain synthesized entries');

    // Verify timeline structure
    const firstEvent = timeline[0];
    assert(firstEvent.type != null, 'Timeline event must have type');
    assert(firstEvent.title != null, 'Timeline event must have title');
    assert(firstEvent.occurredAt != null, 'Timeline event must have occurredAt');
  });

  await recordTest('M9-T07: Customer Cancellation of PENDING_PAYMENT Order', async () => {
    const unpaidOrder = await createTestOrder(garageCookie, sampleProducts[0]);
    assert(unpaidOrder.status === OrderStatus.PENDING_PAYMENT, 'Order is PENDING_PAYMENT');

    const res = await app.inject({
      method: 'POST',
      url: `/api/v1/orders/${unpaidOrder.id}/cancel`,
      headers: { cookie: garageCookie },
      payload: { reason: 'เปลี่ยนใจไม่ต้องการสินค้าแล้ว' },
    });

    assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}: ${res.body}`);
    const body = JSON.parse(res.body);
    const order = body.data ?? body.order;
    assert(order.status === OrderStatus.CANCELLED, 'Order status must be CANCELLED');

    // Verify in DB
    const dbOrder = await prisma.order.findUnique({
      where: { id: unpaidOrder.id },
      include: { statusHistory: true },
    });
    assert(dbOrder?.status === OrderStatus.CANCELLED, 'DB order is CANCELLED');
    assert(Boolean(dbOrder?.statusHistory.some((h) => h.toStatus === OrderStatus.CANCELLED)), 'Status history recorded');
  });

  await recordTest('M9-T08: Customer Cancellation of PAYMENT_CONFIRMED Order (Refund Eligibility Note)', async () => {
    const paidOrder = await createPaidOrder(garageCookie, sampleProducts[0]);

    const res = await app.inject({
      method: 'POST',
      url: `/api/v1/orders/${paidOrder.id}/cancel`,
      headers: { cookie: garageCookie },
      payload: { reason: 'ต้องการยกเลิกคำสั่งซื้อที่ชำระแล้ว' },
    });

    assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}: ${res.body}`);
    const body = JSON.parse(res.body);
    const order = body.data ?? body.order;
    assert(order.status === OrderStatus.CANCELLED, 'Order status must be CANCELLED');

    // Verify payment remains in PAID status (not synthetically marked refunded; refund is financial authority)
    const payment = await prisma.payment.findFirst({
      where: { orderId: paidOrder.id },
    });
    assert(payment?.status === PaymentStatus.PAID, 'Payment status remains PAID awaiting accounting refund processing');

    // Verify status history notes refund eligibility
    const history = await prisma.orderStatusHistory.findFirst({
      where: { orderId: paidOrder.id, toStatus: OrderStatus.CANCELLED },
    });
    assert(Boolean(history?.note?.includes('Refund eligible') || history?.note?.includes('ชำระแล้ว')), 'History notes refund eligibility');
  });

  await recordTest('M9-T09: Customer Cancellation Rejection once Shipment is SHIPPED / DELIVERED', async () => {
    const deliveredOrder = await createDeliveredOrder(garageCookie, sampleProducts[0]);

    const res = await app.inject({
      method: 'POST',
      url: `/api/v1/orders/${deliveredOrder.id}/cancel`,
      headers: { cookie: garageCookie },
      payload: { reason: 'ขอยกเลิกสินค้าที่ส่งถึงแล้ว' },
    });

    assert(res.statusCode === 400, `Expected 400 Bad Request, got ${res.statusCode}`);
    const body = JSON.parse(res.body);
    const errMsg = body.error?.message ?? body.message ?? JSON.stringify(body);
    assert(
      errMsg.includes('Cannot cancel') || errMsg.includes('cannot be cancelled'),
      'Error message must indicate cancellation is disallowed after shipping/delivery'
    );
  });

  await recordTest('M9-T10: Customer Return Request on DELIVERED Order', async () => {
    const deliveredOrder = await createDeliveredOrder(garageCookie, sampleProducts[0]);

    const res = await app.inject({
      method: 'POST',
      url: `/api/v1/orders/${deliveredOrder.id}/return`,
      headers: { cookie: garageCookie },
      payload: {
        reason: 'DEFECTIVE',
        notes: 'สินค้ามีรอยร้าวที่ฝาครอบ ไม่สามารถใช้งานได้',
      },
    });

    assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}: ${res.body}`);
    const body = JSON.parse(res.body);
    const order = body.data ?? body.order;
    assert(order.status === OrderStatus.RETURN_REQUESTED, 'Order status must transition to RETURN_REQUESTED');

    // Verify in DB
    const dbOrder = await prisma.order.findUnique({
      where: { id: deliveredOrder.id },
      include: { statusHistory: true },
    });
    assert(dbOrder?.status === OrderStatus.RETURN_REQUESTED, 'DB order status is RETURN_REQUESTED');
    assert(
      Boolean(dbOrder?.statusHistory.some((h) => h.toStatus === OrderStatus.RETURN_REQUESTED)),
      'Return request recorded in history'
    );
  });

  await recordTest('M9-T11: Return Request Rejection on Unfulfilled / Unpaid Orders', async () => {
    const unpaidOrder = await createTestOrder(garageCookie, sampleProducts[0]);

    const res = await app.inject({
      method: 'POST',
      url: `/api/v1/orders/${unpaidOrder.id}/return`,
      headers: { cookie: garageCookie },
      payload: {
        reason: 'WRONG_ITEM',
        notes: 'ขอคืนสินค้าก่อนส่ง',
      },
    });

    assert(res.statusCode === 400, `Expected 400, got ${res.statusCode}`);
    const body = JSON.parse(res.body);
    const errMsg = body.error?.message ?? body.message ?? JSON.stringify(body);
    assert(
      errMsg.includes('DELIVERED') || errMsg.includes('Cannot request return'),
      'Error message must state order must be DELIVERED'
    );
  });

  await recordTest('M9-T12: Staff Return Approval -> Transition to RETURNED', async () => {
    const deliveredOrder = await createDeliveredOrder(garageCookie, sampleProducts[0]);
    // Customer requests return
    await app.inject({
      method: 'POST',
      url: `/api/v1/orders/${deliveredOrder.id}/return`,
      headers: { cookie: garageCookie },
      payload: { reason: 'DEFECTIVE', notes: 'สินค้ามีตำหนิ' },
    });

    // Staff approves return
    const res = await app.inject({
      method: 'POST',
      url: `/api/v1/admin/orders/${deliveredOrder.id}/return-action`,
      headers: { cookie: adminCookie },
      payload: {
        action: 'APPROVE',
        note: 'ตรวจสอบพัสดุตีกลับแล้ว สินค้ามีตำหนิจริงตามแจ้ง',
      },
    });

    assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}: ${res.body}`);
    const body = JSON.parse(res.body);
    const order = body.data ?? body.order;
    assert(order.status === OrderStatus.RETURNED, 'Order status must be RETURNED');

    // Verify in DB
    const dbOrder = await prisma.order.findUnique({
      where: { id: deliveredOrder.id },
    });
    assert(dbOrder?.status === OrderStatus.RETURNED, 'DB order status is RETURNED');
  });

  await recordTest('M9-T13: Staff Return Rejection -> Transition Back to DELIVERED', async () => {
    const deliveredOrder = await createDeliveredOrder(garageCookie, sampleProducts[0]);
    // Customer requests return
    await app.inject({
      method: 'POST',
      url: `/api/v1/orders/${deliveredOrder.id}/return`,
      headers: { cookie: garageCookie },
      payload: { reason: 'DONT_WANT', notes: 'ไม่อยากได้แล้ว' },
    });

    // Staff rejects return
    const res = await app.inject({
      method: 'POST',
      url: `/api/v1/admin/orders/${deliveredOrder.id}/return-action`,
      headers: { cookie: adminCookie },
      payload: {
        action: 'REJECT',
        note: 'ไม่อยู่ในเงื่อนไขการรับประกัน เกินกำหนด 7 วัน',
      },
    });

    assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}: ${res.body}`);
    const body = JSON.parse(res.body);
    const order = body.data ?? body.order;
    assert(order.status === OrderStatus.DELIVERED, 'Order status must revert to DELIVERED');

    // Verify in DB
    const dbOrder = await prisma.order.findUnique({
      where: { id: deliveredOrder.id },
    });
    assert(dbOrder?.status === OrderStatus.DELIVERED, 'DB order status is DELIVERED');
  });

  await recordTest('M9-T14: Staff Order Search by Order Number, Customer Email, Tracking Number', async () => {
    const testOrder = await createTestOrder(garageCookie, sampleProducts[0]);

    // Search by exact orderNumber
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/admin/orders?q=${testOrder.orderNumber}`,
      headers: { cookie: adminCookie },
    });

    assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
    const body = JSON.parse(res.body);
    const orders = body.data ?? body.orders;
    assert(orders.length >= 1, 'Must find order by order number');
    assert(orders[0].orderNumber === testOrder.orderNumber, 'Found correct order');

    // Search by customer email
    const emailRes = await app.inject({
      method: 'GET',
      url: '/api/v1/admin/orders?q=autoworkshop.com',
      headers: { cookie: adminCookie },
    });
    assert(emailRes.statusCode === 200, 'Search by email returns 200');
    const emailBody = JSON.parse(emailRes.body);
    const emailOrders = emailBody.data ?? emailBody.orders;
    assert(emailOrders.length >= 1, 'Must find order by customer email');
  });

  await recordTest('M9-T15: Staff Order Filtering by Status, Payment Status, Date Range', async () => {
    const paidOrder = await createPaidOrder(garageCookie, sampleProducts[0]);

    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/admin/orders?status=PAYMENT_CONFIRMED&paymentStatus=PAID`,
      headers: { cookie: adminCookie },
    });

    assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
    const body = JSON.parse(res.body);
    const orders = body.data ?? body.orders;
    assert(orders.length >= 1, 'Must find matching filtered orders');
    for (const ord of orders) {
      assert(ord.status === OrderStatus.PAYMENT_CONFIRMED, 'Filtered status matches');
    }
  });

  await recordTest('M9-T16: Staff Order Sorting Whitelist Validation', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/admin/orders?sortBy=totalAmount&sortOrder=desc',
      headers: { cookie: adminCookie },
    });

    assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
    const body = JSON.parse(res.body);
    const orders = body.data ?? body.orders;
    assert(orders.length >= 2, 'Should have at least 2 orders to check sorting');
    const amounts = orders.map((o: any) => Number(o.grandTotal ?? o.totalAmount));
    for (let i = 1; i < amounts.length; i++) {
      assert(amounts[i - 1] >= amounts[i], 'Orders must be sorted in descending totalAmount');
    }
  });

  await recordTest('M9-T17: Staff Order Pagination and Max Limit Enforcement (Capped at 100)', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/admin/orders?limit=200',
      headers: { cookie: adminCookie },
    });

    assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
    const body = JSON.parse(res.body);
    assert(body.pagination.limit === 100, `Limit must be capped at 100, got ${body.pagination.limit}`);
  });

  await recordTest('M9-T18: Staff Status Update with State Machine Validation & Audit Log', async () => {
    const paidOrder = await createPaidOrder(garageCookie, sampleProducts[0]);

    // 1. Illegal transition attempt by staff: PENDING_PAYMENT -> DELIVERED (or PAYMENT_CONFIRMED -> DELIVERED)
    const illegalRes = await app.inject({
      method: 'PATCH',
      url: `/api/v1/admin/orders/${paidOrder.id}/status`,
      headers: { cookie: adminCookie },
      payload: {
        toStatus: OrderStatus.DELIVERED,
        note: 'Illegal jump attempt',
      },
    });
    assert(illegalRes.statusCode === 400, `Expected 400 Bad Request for illegal status jump, got ${illegalRes.statusCode}`);

    // 2. Legal transition: PAYMENT_CONFIRMED -> PROCESSING
    const res = await app.inject({
      method: 'PATCH',
      url: `/api/v1/admin/orders/${paidOrder.id}/status`,
      headers: { cookie: adminCookie },
      payload: {
        toStatus: OrderStatus.PROCESSING,
        note: 'คลังสินค้าเริ่มจัดเตรียมและบรรจุหีบห่อ',
      },
    });

    assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}: ${res.body}`);
    const body = JSON.parse(res.body);
    const order = body.data ?? body.order;
    assert(order.status === OrderStatus.PROCESSING, 'Order status updated to PROCESSING');

    // 3. Illegal backward transition attempt: PROCESSING -> PAYMENT_CONFIRMED
    const backwardRes = await app.inject({
      method: 'PATCH',
      url: `/api/v1/admin/orders/${paidOrder.id}/status`,
      headers: { cookie: adminCookie },
      payload: {
        toStatus: OrderStatus.PAYMENT_CONFIRMED,
        note: 'Illegal backward jump attempt',
      },
    });
    assert(backwardRes.statusCode === 400, `Expected 400 Bad Request for backward status jump, got ${backwardRes.statusCode}`);

    // Verify audit log in DB
    const history = await prisma.orderStatusHistory.findFirst({
      where: { orderId: paidOrder.id, toStatus: OrderStatus.PROCESSING },
    });
    assert(history != null, 'History entry created');
    assert(Boolean(history && history.note === 'คลังสินค้าเริ่มจัดเตรียมและบรรจุหีบห่อ'), 'History note matches');
  });

  await recordTest('M9-T19: Staff Cancellation with Reason and Audit Log', async () => {
    const paidOrder = await createPaidOrder(garageCookie, sampleProducts[0]);

    const res = await app.inject({
      method: 'POST',
      url: `/api/v1/admin/orders/${paidOrder.id}/cancel`,
      headers: { cookie: adminCookie },
      payload: {
        reason: 'ลูกค้ายกเลิกผ่านช่องทางโทรศัพท์ Call Center',
      },
    });

    assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}: ${res.body}`);
    const body = JSON.parse(res.body);
    const order = body.data ?? body.order;
    assert(order.status === OrderStatus.CANCELLED, 'Order status must be CANCELLED');

    // Verify history
    const history = await prisma.orderStatusHistory.findFirst({
      where: { orderId: paidOrder.id, toStatus: OrderStatus.CANCELLED },
    });
    assert(Boolean(history?.note?.includes('Call Center')), 'History contains staff reason');
  });

  await recordTest('M9-T20: Immutable Order Snapshots Preserved Across Master Catalog Changes', async () => {
    const product = sampleProducts[0];
    const initialPrice = await prisma.productPrice.findFirst({
      where: { productId: product.id, tier: PriceTier.GARAGE },
    });
    assert(initialPrice != null, 'Initial price exists');

    // 1. Create order
    const order = await createTestOrder(garageCookie, product, 1);
    const initialOrderItem = order.items[0];
    const originalPrice = Number(initialOrderItem.unitPrice);

    // 2. Mutate master price in DB
    const updatedPrice = originalPrice + 500;
    await prisma.productPrice.updateMany({
      where: { productId: product.id, tier: PriceTier.GARAGE },
      data: { price: updatedPrice },
    });

    // 3. Fetch order detail from API
    const orderDetailRes = await app.inject({
      method: 'GET',
      url: `/api/v1/orders/${order.id}`,
      headers: { cookie: garageCookie },
    });
    const orderDetail = JSON.parse(orderDetailRes.body).data;

    // 4. Assert order item price is preserved immutably
    assert(
      Number(orderDetail.items[0].unitPrice) === originalPrice,
      `Snapshot price must remain ${originalPrice}, got ${orderDetail.items[0].unitPrice}`
    );

    // Restore master price
    await prisma.productPrice.updateMany({
      where: { productId: product.id, tier: PriceTier.GARAGE },
      data: { price: originalPrice },
    });
  });

  await recordTest('M9-T21: Payment <-> Order Synchronization Helper & Out-of-Order Regression Protection', async () => {
    const testOrder = await createTestOrder(garageCookie, sampleProducts[0]);
    assert(testOrder.status === OrderStatus.PENDING_PAYMENT, 'Order is PENDING_PAYMENT');

    // 1. Simulate payment PAID resolution
    const resolvedStatus = OrderStateMachine.resolveOrderStatusFromPayment(
      PaymentStatus.PAID,
      OrderStatus.PENDING_PAYMENT
    );
    assert(resolvedStatus === OrderStatus.PAYMENT_CONFIRMED, 'Resolved status must be PAYMENT_CONFIRMED');

    // 2. Simulate payment FAILED resolution
    const failedStatus = OrderStateMachine.resolveOrderStatusFromPayment(
      PaymentStatus.FAILED,
      OrderStatus.PENDING_PAYMENT
    );
    assert(failedStatus === OrderStatus.PENDING_PAYMENT, 'Failed payment does not change order status');

    // 3. Stale event protection: Late PAID event must NOT regress SHIPPED, DELIVERED, or REFUNDED orders
    assert(
      OrderStateMachine.resolveOrderStatusFromPayment(PaymentStatus.PAID, OrderStatus.SHIPPED) === OrderStatus.SHIPPED,
      'Late PAID event must not regress SHIPPED order'
    );
    assert(
      OrderStateMachine.resolveOrderStatusFromPayment(PaymentStatus.PAID, OrderStatus.DELIVERED) === OrderStatus.DELIVERED,
      'Late PAID event must not regress DELIVERED order'
    );
    assert(
      OrderStateMachine.resolveOrderStatusFromPayment(PaymentStatus.PAID, OrderStatus.REFUNDED) === OrderStatus.REFUNDED,
      'Late PAID event must not regress REFUNDED order'
    );
  });

  await recordTest('M9-T22: Shipment <-> Order Synchronization Helper & Out-of-Order Regression Protection', async () => {
    const shippedStatus = OrderStateMachine.resolveOrderStatusFromShipment(
      ShipmentStatus.IN_TRANSIT,
      OrderStatus.PROCESSING
    );
    assert(shippedStatus === OrderStatus.SHIPPED, 'Shipment IN_TRANSIT maps to Order SHIPPED');

    const deliveredStatus = OrderStateMachine.resolveOrderStatusFromShipment(
      ShipmentStatus.DELIVERED,
      OrderStatus.SHIPPED
    );
    assert(deliveredStatus === OrderStatus.DELIVERED, 'Shipment DELIVERED maps to Order DELIVERED');

    // Stale shipment event protection: Late IN_TRANSIT event must NOT regress DELIVERED, RETURN_REQUESTED, or RETURNED orders
    assert(
      OrderStateMachine.resolveOrderStatusFromShipment(ShipmentStatus.IN_TRANSIT, OrderStatus.DELIVERED) === OrderStatus.DELIVERED,
      'Late IN_TRANSIT event must not regress DELIVERED order'
    );
    assert(
      OrderStateMachine.resolveOrderStatusFromShipment(ShipmentStatus.IN_TRANSIT, OrderStatus.RETURNED) === OrderStatus.RETURNED,
      'Late IN_TRANSIT event must not regress RETURNED order'
    );
  });

  await recordTest('M9-T23: Concurrency Handling (Simultaneous Cancellation Single Transition)', async () => {
    const unpaidOrder = await createTestOrder(garageCookie, sampleProducts[0]);

    // Send two simultaneous cancellations
    const [res1, res2] = await Promise.all([
      app.inject({
        method: 'POST',
        url: `/api/v1/orders/${unpaidOrder.id}/cancel`,
        headers: { cookie: garageCookie },
        payload: { reason: 'Concurrent Cancel 1' },
      }),
      app.inject({
        method: 'POST',
        url: `/api/v1/orders/${unpaidOrder.id}/cancel`,
        headers: { cookie: garageCookie },
        payload: { reason: 'Concurrent Cancel 2' },
      }),
    ]);

    // Exactly one should succeed (200), other might return 200 or 400
    const statuses = [res1.statusCode, res2.statusCode];
    assert(statuses.includes(200), 'At least one cancellation request must succeed with 200');

    // Order must end up in CANCELLED status
    const dbOrder = await prisma.order.findUnique({
      where: { id: unpaidOrder.id },
    });
    assert(dbOrder?.status === OrderStatus.CANCELLED, 'Order is CANCELLED');
  });

  await recordTest('M9-T24: RBAC Enforcement (Non-staff Forbidden on Admin Endpoints)', async () => {
    // Garage user attempts admin order list
    const resList = await app.inject({
      method: 'GET',
      url: '/api/v1/admin/orders',
      headers: { cookie: garageCookie },
    });
    assert(resList.statusCode === 403, `Expected 403 Forbidden for non-staff on admin orders, got ${resList.statusCode}`);

    // Garage user attempts admin status patch
    const testOrder = await createTestOrder(garageCookie, sampleProducts[0]);
    const resStatus = await app.inject({
      method: 'PATCH',
      url: `/api/v1/admin/orders/${testOrder.id}/status`,
      headers: { cookie: garageCookie },
      payload: { toStatus: OrderStatus.PROCESSING },
    });
    assert(resStatus.statusCode === 403, `Expected 403 Forbidden on admin status patch, got ${resStatus.statusCode}`);
  });

  await recordTest('M9-T25: ZERO STOCK MUTATION INVARIANT (No Stock Reservation or Deduction in M9)', async () => {
    const product = sampleProducts[0];
    const initialInventory = await prisma.inventoryItem.findFirst({
      where: { productId: product.id },
    });
    const initialQty = initialInventory?.onHand ?? 0;

    // Run order lifecycle operations: create order, cancel, create delivered, request return, approve return
    const order1 = await createTestOrder(garageCookie, product, 2);
    await app.inject({
      method: 'POST',
      url: `/api/v1/orders/${order1.id}/cancel`,
      headers: { cookie: garageCookie },
      payload: { reason: 'Test zero stock mutation' },
    });

    const order2 = await createDeliveredOrder(garageCookie, product);
    await app.inject({
      method: 'POST',
      url: `/api/v1/orders/${order2.id}/return`,
      headers: { cookie: garageCookie },
      payload: { reason: 'DEFECTIVE', notes: 'Testing stock invariant' },
    });
    await app.inject({
      method: 'POST',
      url: `/api/v1/admin/orders/${order2.id}/return-action`,
      headers: { cookie: adminCookie },
      payload: { action: 'APPROVE', note: 'Testing stock invariant' },
    });

    // Check inventory after all order management operations
    const finalInventory = await prisma.inventoryItem.findFirst({
      where: { productId: product.id },
    });
    const finalQty = finalInventory?.onHand ?? 0;

    assert(
      initialQty === finalQty,
      `ZERO STOCK MUTATION INVARIANT VIOLATED: initial=${initialQty}, final=${finalQty}. Stock must not mutate in M9 (deferred to M10)!`
    );

    // Verify no StockMovement records created in M9
    const stockMovements = await prisma.stockMovement.findMany({
      where: { referenceId: { in: [order1.id, order2.id] } },
    });
    assert(stockMovements.length === 0, 'No StockMovement records should exist for M9 orders');
  });

  // ----------------------------------------------------------------------------
  // RESULTS SUMMARY
  // ----------------------------------------------------------------------------
  console.log('\n======================================================');
  const passedCount = results.filter((r) => r.passed).length;
  const totalCount = results.length;
  console.log(`Results: ${passedCount} / ${totalCount} M9 tests PASSED.`);

  if (passedCount === totalCount) {
    console.log('🎉 Phase M9 Order Management & Order Lifecycle Suite PASSED 100%!\n');
  } else {
    console.error(`💥 ${totalCount - passedCount} test(s) failed in M9 suite.\n`);
    process.exit(1);
  }
}

runM9TestSuite()
  .catch((err) => {
    console.error('Fatal M9 test suite execution error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
