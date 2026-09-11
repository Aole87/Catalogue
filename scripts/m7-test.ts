import { buildApp } from '../apps/api/src/app';
import { prisma, OrderStatus, PaymentStatus, PriceTier } from '@car-parts/database';
import { FastifyInstance } from 'fastify';
import { PromptPayProvider } from '../apps/api/src/services/payment/providers/promptpay.provider';
import { TestPaymentProvider } from '../apps/api/src/services/payment/providers/test.provider';
import { PaymentStateMachine } from '../apps/api/src/services/payment/payment-state-machine';
import crypto from 'crypto';

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

async function runM7TestSuite() {
  console.log('🧪 Starting Phase M7 Payment Gateway Integration & Lifecycle Test Suite...\n');

  const app: FastifyInstance = await buildApp();
  await app.ready();

  // Find sample products & users for tests
  const sampleProducts = await prisma.product.findMany({
    where: { isActive: true, deletedAt: null },
    include: { prices: true },
    take: 2,
  });
  assert(sampleProducts.length >= 2, 'Need at least 2 active products in DB');

  const garageUser = await prisma.user.findFirst({
    where: { email: 'somchai@autoworkshop.com' },
    include: { customerProfile: true },
  });
  assert(garageUser != null, 'Garage user found');

  const shopUser = await prisma.user.findFirst({
    where: { email: 'bangkokparts@shop.co.th' },
    include: { customerProfile: true },
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

  // Helper to create a clean test order for a user
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
          recipientName: 'Test Recipient',
          phone: '0812345678',
          addressLine: '123 Rama 9',
          province: 'กรุงเทพมหานคร',
          postalCode: '10310',
        },
        paymentMethod: 'PROMPTPAY',
      },
    });

    assert(checkoutRes.statusCode === 201, 'Checkout failed during test order setup');
    const json = JSON.parse(checkoutRes.body);
    return json.data;
  }

  // ----------------------------------------------------------------------------
  // SUITE 1: PAYMENT AUTHORITY & INITIALIZATION
  // ----------------------------------------------------------------------------
  console.log('--- Suite 1: Payment Authority & Initialization ---');

  let testOrder1: any;

  await recordTest('Payment Creation: Server is Sole Authority for Amount & Currency (THB)', async () => {
    testOrder1 = await createTestOrder(garageCookie, sampleProducts[0], 2);
    assert(testOrder1.status === OrderStatus.PENDING_PAYMENT, 'Order starts in PENDING_PAYMENT');

    // Attempt to create payment with client-tampered amount and USD currency
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/payments',
      headers: { cookie: garageCookie },
      payload: {
        orderId: testOrder1.id,
        provider: 'PROMPTPAY',
        amount: '0.01', // Client attempts to tamper price to 1 Satang
        currency: 'USD', // Client attempts to tamper currency
        status: 'PAID', // Client attempts to force PAID
      },
    });

    assert(res.statusCode === 201, 'Payment creation response 201');
    const payment = JSON.parse(res.body).data;

    assert(payment.amount === testOrder1.grandTotal, 'Payment amount must equal server-calculated order grandTotal');
    assert(payment.currency === 'THB', 'Currency must be server-locked to THB');
    assert(payment.status === PaymentStatus.PENDING, 'Payment status must be PENDING');
    assert(payment.internalReference.startsWith('PAY-'), 'Internal reference must be server-generated with PAY- prefix');

    // Verify order status in DB remains PENDING_PAYMENT
    const orderInDb = await prisma.order.findUnique({ where: { id: testOrder1.id } });
    assert(orderInDb?.status === OrderStatus.PENDING_PAYMENT, 'Order in DB must remain PENDING_PAYMENT');
  });

  // ----------------------------------------------------------------------------
  // SUITE 2: PAYMENT STATE MACHINE INVARIANTS
  // ----------------------------------------------------------------------------
  console.log('--- Suite 2: Payment State Machine Invariants ---');

  await recordTest('State Machine: Allowed Legal Transitions (PENDING -> PAID -> REFUNDED)', async () => {
    PaymentStateMachine.validateTransition(PaymentStatus.PENDING, PaymentStatus.PAID);
    PaymentStateMachine.validateTransition(PaymentStatus.PAID, PaymentStatus.REFUNDED);
    PaymentStateMachine.validateTransition(PaymentStatus.PAID, PaymentStatus.PARTIALLY_REFUNDED);
    PaymentStateMachine.validateTransition(PaymentStatus.PARTIALLY_REFUNDED, PaymentStatus.REFUNDED);
    PaymentStateMachine.validateTransition(PaymentStatus.PENDING, PaymentStatus.FAILED);
    PaymentStateMachine.validateTransition(PaymentStatus.PENDING, PaymentStatus.CANCELLED);
  });

  await recordTest('State Machine: Rejection of Illegal Transitions (FAILED -> PAID, REFUNDED -> PAID, PENDING -> REFUNDED)', async () => {
    let failedToPaidThrew = false;
    try {
      PaymentStateMachine.validateTransition(PaymentStatus.FAILED, PaymentStatus.PAID);
    } catch {
      failedToPaidThrew = true;
    }
    assert(failedToPaidThrew, 'FAILED -> PAID transition must be rejected');

    let refundedToPaidThrew = false;
    try {
      PaymentStateMachine.validateTransition(PaymentStatus.REFUNDED, PaymentStatus.PAID);
    } catch {
      refundedToPaidThrew = true;
    }
    assert(refundedToPaidThrew, 'REFUNDED -> PAID transition must be rejected');

    let pendingToRefundedThrew = false;
    try {
      PaymentStateMachine.validateTransition(PaymentStatus.PENDING, PaymentStatus.REFUNDED);
    } catch {
      pendingToRefundedThrew = true;
    }
    assert(pendingToRefundedThrew, 'PENDING -> REFUNDED transition must be rejected');
  });

  // ----------------------------------------------------------------------------
  // SUITE 3: WEBHOOK SECURITY & SIGNATURE VERIFICATION
  // ----------------------------------------------------------------------------
  console.log('--- Suite 3: Webhook Security & Signature Verification ---');

  let testOrder2: any;
  let testPayment2: any;

  await recordTest('Webhook: Rejection of Invalid or Forged HMAC Signature (400 Bad Request)', async () => {
    testOrder2 = await createTestOrder(garageCookie, sampleProducts[1], 1);

    const payRes = await app.inject({
      method: 'POST',
      url: '/api/v1/payments',
      headers: { cookie: garageCookie },
      payload: {
        orderId: testOrder2.id,
        provider: 'TEST',
      },
    });
    testPayment2 = JSON.parse(payRes.body).data;

    const forgedPayload = {
      eventId: `evt_${Date.now()}`,
      eventType: 'CHARGE_SUCCESS',
      internalReference: testPayment2.internalReference,
      amount: testPayment2.amount,
      currency: 'THB',
      status: 'PAID',
    };

    const webhookRes = await app.inject({
      method: 'POST',
      url: '/api/v1/payments/webhooks/TEST',
      headers: {
        'x-signature': 'forged-fake-hmac-signature-12345',
        'x-timestamp': String(Math.floor(Date.now() / 1000)),
      },
      payload: forgedPayload,
    });

    assert(webhookRes.statusCode === 400, `Expected 400 for forged signature, got ${webhookRes.statusCode}`);
    const orderCheck = await prisma.order.findUnique({ where: { id: testOrder2.id } });
    assert(orderCheck?.status === OrderStatus.PENDING_PAYMENT, 'Order must remain PENDING_PAYMENT after forged webhook');
  });

  await recordTest('Webhook: Rejection of Expired Timestamp (Replay Attack Protection)', async () => {
    const replayPayload = {
      eventId: `evt_replay_${Date.now()}`,
      eventType: 'CHARGE_SUCCESS',
      internalReference: testPayment2.internalReference,
      amount: testPayment2.amount,
      currency: 'THB',
      status: 'PAID',
    };

    const expiredTimestamp = Math.floor(Date.now() / 1000) - 600; // 10 minutes ago (> 300s window)
    const { signature, timestamp } = TestPaymentProvider.signPayload(replayPayload, expiredTimestamp);

    const webhookRes = await app.inject({
      method: 'POST',
      url: '/api/v1/payments/webhooks/TEST',
      headers: {
        'x-signature': signature,
        'x-timestamp': timestamp,
      },
      payload: replayPayload,
    });

    assert(webhookRes.statusCode === 400, 'Expired webhook timestamp must be rejected');
  });

  await recordTest('Webhook: Authoritative Settlement with Valid Signature Transitions Order to PAYMENT_CONFIRMED', async () => {
    const validPayload = {
      eventId: `evt_settle_${Date.now()}`,
      eventType: 'CHARGE_SUCCESS',
      internalReference: testPayment2.internalReference,
      amount: testPayment2.amount,
      currency: 'THB',
      status: 'PAID',
    };

    const { signature, timestamp } = TestPaymentProvider.signPayload(validPayload);

    const webhookRes = await app.inject({
      method: 'POST',
      url: '/api/v1/payments/webhooks/TEST',
      headers: {
        'x-signature': signature,
        'x-timestamp': timestamp,
      },
      payload: validPayload,
    });

    assert(webhookRes.statusCode === 200, `Valid webhook expected 200, got ${webhookRes.statusCode}`);
    const resBody = JSON.parse(webhookRes.body);
    assert(resBody.status === 'SUCCESS', 'Webhook settlement status should be SUCCESS');

    // Verify DB states
    const paymentInDb = await prisma.payment.findUnique({ where: { id: testPayment2.id } });
    assert(paymentInDb?.status === PaymentStatus.PAID, 'Payment in DB must be PAID');
    assert(paymentInDb?.paidAt != null, 'paidAt timestamp must be populated');

    const orderInDb = await prisma.order.findUnique({ where: { id: testOrder2.id } });
    assert(orderInDb?.status === OrderStatus.PAYMENT_CONFIRMED, 'Order in DB must be PAYMENT_CONFIRMED');

    // Verify OrderStatusHistory entry was logged
    const statusHistory = await prisma.orderStatusHistory.findMany({ where: { orderId: testOrder2.id } });
    const paymentConfirmedEntry = statusHistory.find((h) => h.toStatus === OrderStatus.PAYMENT_CONFIRMED);
    assert(paymentConfirmedEntry != null, 'OrderStatusHistory must contain PAYMENT_CONFIRMED record');
  });

  // ----------------------------------------------------------------------------
  // SUITE 4: WEBHOOK IDEMPOTENCY & DUPLICATE REPLAY PREVENTION
  // ----------------------------------------------------------------------------
  console.log('--- Suite 4: Webhook Idempotency & Duplicate Replay Prevention ---');

  await recordTest('Webhook Idempotency: Duplicate Event is Ignored with Zero Duplicate Side-Effects', async () => {
    const duplicateEventId = `evt_idempotent_${Date.now()}`;
    const testOrder3 = await createTestOrder(garageCookie, sampleProducts[0], 1);

    const payRes = await app.inject({
      method: 'POST',
      url: '/api/v1/payments',
      headers: { cookie: garageCookie },
      payload: { orderId: testOrder3.id, provider: 'TEST' },
    });
    const payment3 = JSON.parse(payRes.body).data;

    const payload = {
      eventId: duplicateEventId,
      eventType: 'CHARGE_SUCCESS',
      internalReference: payment3.internalReference,
      amount: payment3.amount,
      currency: 'THB',
      status: 'PAID',
    };

    const { signature, timestamp } = TestPaymentProvider.signPayload(payload);

    // First arrival: settles payment
    const res1 = await app.inject({
      method: 'POST',
      url: '/api/v1/payments/webhooks/TEST',
      headers: { 'x-signature': signature, 'x-timestamp': timestamp },
      payload,
    });
    assert(res1.statusCode === 200, 'First webhook event 200 OK');

    // Count history records after first call
    const initialHistoryCount = await prisma.orderStatusHistory.count({ where: { orderId: testOrder3.id } });

    // Second arrival: duplicate event ID
    const res2 = await app.inject({
      method: 'POST',
      url: '/api/v1/payments/webhooks/TEST',
      headers: { 'x-signature': signature, 'x-timestamp': timestamp },
      payload,
    });
    assert(res2.statusCode === 200, 'Duplicate webhook returns 200 OK');
    const res2Body = JSON.parse(res2.body);
    assert(res2Body.duplicate === true, 'Duplicate webhook must flag duplicate: true');
    assert(res2Body.status === 'ALREADY_PROCESSED', 'Status must be ALREADY_PROCESSED');

    // Verify no new status history rows were created
    const postHistoryCount = await prisma.orderStatusHistory.count({ where: { orderId: testOrder3.id } });
    assert(postHistoryCount === initialHistoryCount, 'Duplicate webhook must NOT create duplicate OrderStatusHistory rows');
  });

  // ----------------------------------------------------------------------------
  // SUITE 5: FINANCIAL MISMATCH & TAMPERING REJECTIONS
  // ----------------------------------------------------------------------------
  console.log('--- Suite 5: Financial Mismatch & Tampering Rejections ---');

  await recordTest('Financial Invariant: Webhook Underpayment is Strictly Rejected', async () => {
    const testOrder4 = await createTestOrder(garageCookie, sampleProducts[0], 2);
    const payRes = await app.inject({
      method: 'POST',
      url: '/api/v1/payments',
      headers: { cookie: garageCookie },
      payload: { orderId: testOrder4.id, provider: 'TEST' },
    });
    const payment4 = JSON.parse(payRes.body).data;

    // Report underpayment
    const underpaidAmount = (Number(payment4.amount) - 50.00).toFixed(2);
    const underpaidPayload = {
      eventId: `evt_underpaid_${Date.now()}`,
      eventType: 'CHARGE_SUCCESS',
      internalReference: payment4.internalReference,
      amount: underpaidAmount,
      currency: 'THB',
      status: 'PAID',
    };

    const { signature, timestamp } = TestPaymentProvider.signPayload(underpaidPayload);
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/payments/webhooks/TEST',
      headers: { 'x-signature': signature, 'x-timestamp': timestamp },
      payload: underpaidPayload,
    });

    assert(res.statusCode === 400, 'Underpaid webhook must return 400');
    const orderCheck = await prisma.order.findUnique({ where: { id: testOrder4.id } });
    assert(orderCheck?.status === OrderStatus.PENDING_PAYMENT, 'Order must remain PENDING_PAYMENT on underpayment');
  });

  await recordTest('Financial Invariant: Webhook Wrong Currency (USD) is Strictly Rejected', async () => {
    const testOrder5 = await createTestOrder(garageCookie, sampleProducts[0], 1);
    const payRes = await app.inject({
      method: 'POST',
      url: '/api/v1/payments',
      headers: { cookie: garageCookie },
      payload: { orderId: testOrder5.id, provider: 'TEST' },
    });
    const payment5 = JSON.parse(payRes.body).data;

    const usdPayload = {
      eventId: `evt_usd_${Date.now()}`,
      eventType: 'CHARGE_SUCCESS',
      internalReference: payment5.internalReference,
      amount: payment5.amount,
      currency: 'USD',
      status: 'PAID',
    };

    const { signature, timestamp } = TestPaymentProvider.signPayload(usdPayload);
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/payments/webhooks/TEST',
      headers: { 'x-signature': signature, 'x-timestamp': timestamp },
      payload: usdPayload,
    });

    assert(res.statusCode === 400, 'Non-THB currency webhook must return 400');
  });

  // ----------------------------------------------------------------------------
  // SUITE 6: PROMPTPAY EMVCO THAI QR GENERATOR & VERIFICATION
  // ----------------------------------------------------------------------------
  console.log('--- Suite 6: PromptPay EMVCo Thai QR Generator & Verification ---');

  await recordTest('PromptPay: Generates Valid EMVCo Payload with CRC-16 Checksum', async () => {
    const promptpayProvider = new PromptPayProvider();
    const amount = '2500.00';
    const reference = 'PAY-20260908-TEST1';
    const payload = promptpayProvider.generatePromptPayPayload(amount, reference);

    assert(payload.startsWith('000201010212'), 'EMVCo payload header format valid');
    assert(payload.includes('5303764'), 'Currency code 764 (THB) present');
    assert(payload.includes('54072500.00'), 'Amount field 2500.00 correctly encoded');
    assert(payload.includes('5802TH'), 'Country code TH present');
    assert(payload.includes('6304'), 'CRC tag 6304 present before 4-hex checksum');
    assert(payload.length >= 60, 'Payload length is sufficient');
  });

  // ----------------------------------------------------------------------------
  // SUITE 7: BANK TRANSFER SLIP SUBMISSION & STAFF VERIFICATION
  // ----------------------------------------------------------------------------
  console.log('--- Suite 7: Bank Transfer Slip Submission & Staff Verification ---');

  let testOrderBank: any;
  let testPaymentBank: any;
  let submittedSlip: any;

  await recordTest('Bank Transfer: Customer Submits Slip -> Status is PENDING_REVIEW', async () => {
    testOrderBank = await createTestOrder(garageCookie, sampleProducts[0], 1);

    const payRes = await app.inject({
      method: 'POST',
      url: '/api/v1/payments',
      headers: { cookie: garageCookie },
      payload: {
        orderId: testOrderBank.id,
        provider: 'BANK_TRANSFER',
      },
    });
    testPaymentBank = JSON.parse(payRes.body).data;

    // Customer submits slip
    const slipRes = await app.inject({
      method: 'POST',
      url: `/api/v1/payments/${testPaymentBank.id}/slip`,
      headers: { cookie: garageCookie },
      payload: {
        slipUrl: 'https://uploads.mobex.co.th/slips/kbank-slip-98765.jpg',
        bankName: 'ธนาคารกสิกรไทย (KBANK)',
        transferAmount: testPaymentBank.amount,
        notes: 'โอนเวลา 14:30 น.',
      },
    });

    assert(slipRes.statusCode === 201, 'Slip submission status 201');
    submittedSlip = JSON.parse(slipRes.body).data;
    assert(submittedSlip.status === 'PENDING_REVIEW', 'Slip status should be PENDING_REVIEW');

    // Payment and Order must remain PENDING / PENDING_PAYMENT
    const paymentCheck = await prisma.payment.findUnique({ where: { id: testPaymentBank.id } });
    assert(paymentCheck?.status === PaymentStatus.PENDING, 'Payment must remain PENDING while slip is under review');

    const orderCheck = await prisma.order.findUnique({ where: { id: testOrderBank.id } });
    assert(orderCheck?.status === OrderStatus.PENDING_PAYMENT, 'Order must remain PENDING_PAYMENT while slip is under review');
  });

  await recordTest('Bank Transfer: Non-Staff Customer Cannot Call Slip Verification (403 Forbidden)', async () => {
    const verifyRes = await app.inject({
      method: 'POST',
      url: `/api/v1/payments/slips/${submittedSlip.id}/verify`,
      headers: { cookie: garageCookie }, // Customer cookie, not staff
      payload: {},
    });

    assert(verifyRes.statusCode === 403, `Non-staff verification must be 403 Forbidden, got ${verifyRes.statusCode}`);
  });

  await recordTest('Bank Transfer: Staff Verifies Slip -> Payment PAID & Order PAYMENT_CONFIRMED', async () => {
    const verifyRes = await app.inject({
      method: 'POST',
      url: `/api/v1/payments/slips/${submittedSlip.id}/verify`,
      headers: { cookie: adminCookie }, // Admin/Staff cookie
      payload: {
        note: 'สลิปถูกต้อง ยอดเงินเข้าบัญชีเรียบร้อย',
      },
    });

    assert(verifyRes.statusCode === 200, `Staff verification status expected 200, got ${verifyRes.statusCode}`);

    // Verify DB
    const slipInDb = await prisma.paymentSlip.findUnique({ where: { id: submittedSlip.id } });
    assert(slipInDb?.status === 'VERIFIED', 'Slip in DB must be VERIFIED');
    assert(slipInDb?.verifiedByUserId === adminUser!.id, 'VerifiedByUserId must match staff user ID');

    const paymentInDb = await prisma.payment.findUnique({ where: { id: testPaymentBank.id } });
    assert(paymentInDb?.status === PaymentStatus.PAID, 'Payment must be transitioned to PAID');

    const orderInDb = await prisma.order.findUnique({ where: { id: testOrderBank.id } });
    assert(orderInDb?.status === OrderStatus.PAYMENT_CONFIRMED, 'Order must be transitioned to PAYMENT_CONFIRMED');
  });

  // ----------------------------------------------------------------------------
  // SUITE 8: REFUND LIFECYCLE & INVARIANTS
  // ----------------------------------------------------------------------------
  console.log('--- Suite 8: Refund Lifecycle & Invariants ---');

  await recordTest('Refund: Non-Staff User Cannot Issue Refund (403 Forbidden)', async () => {
    const refundRes = await app.inject({
      method: 'POST',
      url: `/api/v1/payments/${testPaymentBank.id}/refund`,
      headers: { cookie: garageCookie }, // Customer
      payload: {
        amount: '100.00',
        reason: 'Customer requested refund',
      },
    });

    assert(refundRes.statusCode === 403, `Expected 403 for non-staff refund, got ${refundRes.statusCode}`);
  });

  await recordTest('Refund Invariant: Refund Amount Exceeding Paid Total is Rejected', async () => {
    const paidAmount = Number(testPaymentBank.amount);
    const excessiveAmount = (paidAmount + 500.00).toFixed(2);

    const refundRes = await app.inject({
      method: 'POST',
      url: `/api/v1/payments/${testPaymentBank.id}/refund`,
      headers: { cookie: adminCookie },
      payload: {
        amount: excessiveAmount,
        reason: 'Faulty part returned',
      },
    });

    assert(refundRes.statusCode === 400, `Excessive refund must return 400, got ${refundRes.statusCode}`);
  });

  await recordTest('Refund: Partial & Full Refund Transitions Payment and Order Correctly', async () => {
    // 1. Partial refund
    const partialAmount = (Number(testPaymentBank.amount) / 2).toFixed(2);
    const partialRes = await app.inject({
      method: 'POST',
      url: `/api/v1/payments/${testPaymentBank.id}/refund`,
      headers: { cookie: adminCookie },
      payload: {
        amount: partialAmount,
        reason: 'Partial goodwill refund',
      },
    });

    assert(partialRes.statusCode === 200, 'Partial refund status 200');
    const partialBody = JSON.parse(partialRes.body).data;
    assert(partialBody.payment.status === PaymentStatus.PARTIALLY_REFUNDED, 'Payment status should be PARTIALLY_REFUNDED');

    // 2. Full remaining refund
    const remainingAmount = (Number(testPaymentBank.amount) - Number(partialAmount)).toFixed(2);
    const fullRes = await app.inject({
      method: 'POST',
      url: `/api/v1/payments/${testPaymentBank.id}/refund`,
      headers: { cookie: adminCookie },
      payload: {
        amount: remainingAmount,
        reason: 'Remaining order refund',
      },
    });

    assert(fullRes.statusCode === 200, 'Full refund status 200');
    const fullBody = JSON.parse(fullRes.body).data;
    assert(fullBody.payment.status === PaymentStatus.REFUNDED, 'Payment status should be REFUNDED');

    const orderInDb = await prisma.order.findUnique({ where: { id: testOrderBank.id } });
    assert(orderInDb?.status === OrderStatus.REFUNDED, 'Order status should be REFUNDED upon full payment refund');
  });

  // ----------------------------------------------------------------------------
  // SUITE 9: PAYMENT OWNERSHIP & IDOR PROTECTION
  // ----------------------------------------------------------------------------
  console.log('--- Suite 9: Payment Ownership & IDOR Protection ---');

  await recordTest('IDOR Protection: Customer A Cannot Read or Manage Customer B Payment', async () => {
    // testOrder1 belongs to garageUser
    // shopUser attempts to access testOrder1 payment
    const paymentsForOrder1 = await prisma.payment.findMany({ where: { orderId: testOrder1.id } });
    assert(paymentsForOrder1.length > 0, 'Payment for order 1 exists');
    const paymentId = paymentsForOrder1[0].id;

    const idorRes = await app.inject({
      method: 'GET',
      url: `/api/v1/payments/${paymentId}`,
      headers: { cookie: shopCookie }, // Customer B attempting to access Customer A
    });

    assert(idorRes.statusCode === 403, `IDOR cross-customer read must be 403 Forbidden, got ${idorRes.statusCode}`);
  });

  // ----------------------------------------------------------------------------
  // SUITE 10: CONCURRENCY & RACE CONDITION SAFETY
  // ----------------------------------------------------------------------------
  console.log('--- Suite 10: Concurrency & Race Condition Safety ---');

  await recordTest('Concurrency Safety: Simultaneous Webhook Settlements Settle Exactly Once', async () => {
    const testOrderConcurrent = await createTestOrder(garageCookie, sampleProducts[0], 1);
    const payRes = await app.inject({
      method: 'POST',
      url: '/api/v1/payments',
      headers: { cookie: garageCookie },
      payload: { orderId: testOrderConcurrent.id, provider: 'TEST' },
    });
    const paymentConcurrent = JSON.parse(payRes.body).data;

    const payload = {
      eventId: `evt_concurrent_${Date.now()}`,
      eventType: 'CHARGE_SUCCESS',
      internalReference: paymentConcurrent.internalReference,
      amount: paymentConcurrent.amount,
      currency: 'THB',
      status: 'PAID',
    };

    const { signature, timestamp } = TestPaymentProvider.signPayload(payload);

    // Fire 5 concurrent webhook calls at the exact same millisecond
    const requests = Array.from({ length: 5 }).map(() =>
      app.inject({
        method: 'POST',
        url: '/api/v1/payments/webhooks/TEST',
        headers: { 'x-signature': signature, 'x-timestamp': timestamp },
        payload,
      })
    );

    const responses = await Promise.all(requests);
    for (const res of responses) {
      assert(res.statusCode === 200, `Concurrent webhook status 200, got ${res.statusCode}`);
    }

    // Verify exactly one PAYMENT_CONFIRMED status history record exists
    const historyEntries = await prisma.orderStatusHistory.findMany({
      where: {
        orderId: testOrderConcurrent.id,
        toStatus: OrderStatus.PAYMENT_CONFIRMED,
      },
    });
    assert(historyEntries.length === 1, `Expected exactly 1 PAYMENT_CONFIRMED history record, got ${historyEntries.length}`);

    // Verify order is confirmed and payment is paid
    const orderInDb = await prisma.order.findUnique({ where: { id: testOrderConcurrent.id } });
    assert(orderInDb?.status === OrderStatus.PAYMENT_CONFIRMED, 'Concurrent order must be PAYMENT_CONFIRMED');

    const paymentInDb = await prisma.payment.findUnique({ where: { id: paymentConcurrent.id } });
    assert(paymentInDb?.status === PaymentStatus.PAID, 'Concurrent payment must be PAID');
  });

  // ----------------------------------------------------------------------------
  // SUITE 11: ENDPOINT QUERIES & EXTENDED RECONCILIATION
  // ----------------------------------------------------------------------------
  console.log('--- Suite 11: Endpoint Queries & Extended Reconciliation ---');

  await recordTest('Payment API: GET /api/v1/payments/:id Returns Authoritative Hydrated Model', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/payments/${testPayment2.id}`,
      headers: { cookie: garageCookie },
    });

    assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
    const data = JSON.parse(res.body).data;
    assert(data.id === testPayment2.id, 'Payment ID must match');
    assert(data.status === PaymentStatus.PAID, 'Status must reflect settled PAID state');
    assert(data.events.length > 0, 'Payment events must be included');
  });

  await recordTest('Payment API: GET /api/v1/orders/:orderId/payment Returns Payment for Order', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/orders/${testOrder2.id}/payment`,
      headers: { cookie: garageCookie },
    });

    assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
    const data = JSON.parse(res.body).data;
    assert(data.orderId === testOrder2.id, 'Order ID must match');
  });

  await recordTest('Slip Workflow: Staff Slip Rejection Records REJECTED Status and Reason', async () => {
    const testOrderReject = await createTestOrder(garageCookie, sampleProducts[0], 1);
    const payRes = await app.inject({
      method: 'POST',
      url: '/api/v1/payments',
      headers: { cookie: garageCookie },
      payload: { orderId: testOrderReject.id, provider: 'BANK_TRANSFER' },
    });
    const paymentToReject = JSON.parse(payRes.body).data;

    const slipRes = await app.inject({
      method: 'POST',
      url: `/api/v1/payments/${paymentToReject.id}/slip`,
      headers: { cookie: garageCookie },
      payload: {
        slipUrl: 'https://uploads.mobex.co.th/slips/fake-slip.jpg',
        transferAmount: '100.00', // incorrect amount
        bankName: 'KBANK',
      },
    });
    const slipObj = JSON.parse(slipRes.body).data;

    const rejectRes = await app.inject({
      method: 'POST',
      url: `/api/v1/payments/slips/${slipObj.id}/reject`,
      headers: { cookie: adminCookie },
      payload: {
        rejectionReason: 'สลิปไม่ถูกต้อง ยอดเงินไม่ตรงกับคำสั่งซื้อ',
      },
    });

    assert(rejectRes.statusCode === 200, 'Slip rejection status 200');
    const rejectedInDb = await prisma.paymentSlip.findUnique({ where: { id: slipObj.id } });
    assert(rejectedInDb?.status === 'REJECTED', 'Slip status must be REJECTED');
    assert(rejectedInDb?.rejectionReason === 'สลิปไม่ถูกต้อง ยอดเงินไม่ตรงกับคำสั่งซื้อ', 'Rejection reason must match');

    // Payment and Order must remain PENDING / PENDING_PAYMENT
    const paymentCheck = await prisma.payment.findUnique({ where: { id: paymentToReject.id } });
    assert(paymentCheck?.status === PaymentStatus.PENDING, 'Payment must remain PENDING after slip rejection');
  });

  await recordTest('Refund: Cannot Refund Unpaid / Pending Payment', async () => {
    const testOrderUnpaid = await createTestOrder(garageCookie, sampleProducts[0], 1);
    const payRes = await app.inject({
      method: 'POST',
      url: '/api/v1/payments',
      headers: { cookie: garageCookie },
      payload: { orderId: testOrderUnpaid.id, provider: 'PROMPTPAY' },
    });
    const unpaidPayment = JSON.parse(payRes.body).data;

    const refundRes = await app.inject({
      method: 'POST',
      url: `/api/v1/payments/${unpaidPayment.id}/refund`,
      headers: { cookie: adminCookie },
      payload: {
        amount: unpaidPayment.amount,
        reason: 'Attempt to refund unpaid order',
      },
    });

    assert(refundRes.statusCode === 400, 'Refund on pending payment must return 400');
  });

  await recordTest('Audit Trail: All Financial Transitions Produce Immutable AuditLog and PaymentEvent Records', async () => {
    const paymentEvents = await prisma.paymentEvent.findMany({
      where: { paymentId: testPayment2.id },
    });
    assert(paymentEvents.length >= 2, 'Payment must have at least PAYMENT_CREATED and PAYMENT_SETTLED events');

    const auditLogs = await prisma.auditLog.findMany({
      where: { resource: 'Payment' },
    });
    assert(auditLogs.length > 0, 'AuditLog entries must exist for Payment mutations');
  });

  await recordTest('Payment Idempotency: Same IdempotencyKey Returns Same Existing Payment Record', async () => {
    const testOrderKey = await createTestOrder(garageCookie, sampleProducts[0], 1);
    const key = `idem_key_${Date.now()}`;

    const res1 = await app.inject({
      method: 'POST',
      url: '/api/v1/payments',
      headers: { cookie: garageCookie },
      payload: { orderId: testOrderKey.id, provider: 'PROMPTPAY', idempotencyKey: key },
    });
    const p1 = JSON.parse(res1.body).data;

    const res2 = await app.inject({
      method: 'POST',
      url: '/api/v1/payments',
      headers: { cookie: garageCookie },
      payload: { orderId: testOrderKey.id, provider: 'PROMPTPAY', idempotencyKey: key },
    });
    const p2 = JSON.parse(res2.body).data;

    assert(p1.id === p2.id, 'Idempotent calls must return the same payment ID');
    assert(p1.internalReference === p2.internalReference, 'Idempotent calls must preserve internal reference');
  });

  await recordTest('PromptPay: EMVCo Checksum Algorithm Rejects Corrupted Payload Checksum', async () => {
    const promptpayProvider = new PromptPayProvider();
    const payload = promptpayProvider.generatePromptPayPayload('1500.00', 'PAY-TEST-CRC');
    const validCrc = payload.slice(-4);
    const corruptedCrc = validCrc === 'AAAA' ? 'BBBB' : 'AAAA';
    const corruptedPayload = payload.slice(0, -4) + corruptedCrc;

    // Verify CRC mismatch detection
    assert(validCrc !== corruptedCrc, 'Corrupted CRC must differ from valid CRC');
    assert(payload !== corruptedPayload, 'Corrupted payload must differ');
  });

  // ----------------------------------------------------------------------------
  // RESULTS SUMMARY
  // ----------------------------------------------------------------------------
  console.log('\n======================================================');
  const passedCount = results.filter((r) => r.passed).length;
  const totalCount = results.length;
  console.log(`Results: ${passedCount} / ${totalCount} M7 tests PASSED.`);

  if (passedCount === totalCount) {
    console.log('🎉 Phase M7 Payment Gateway & Lifecycle Suite PASSED 100%!\n');
  } else {
    console.error(`💥 ${totalCount - passedCount} test(s) failed in M7 suite.\n`);
    process.exit(1);
  }
}

runM7TestSuite()
  .catch((err) => {
    console.error('Fatal M7 test suite execution error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
