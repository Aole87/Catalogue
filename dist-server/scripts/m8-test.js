"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("../apps/api/src/app");
const database_1 = require("@car-parts/database");
const flash_express_provider_1 = require("../apps/api/src/services/shipping/providers/flash-express.provider");
const kerry_express_provider_1 = require("../apps/api/src/services/shipping/providers/kerry-express.provider");
const test_provider_1 = require("../apps/api/src/services/shipping/providers/test.provider");
const results = [];
function assert(condition, message) {
    if (!condition) {
        throw new Error(`Assertion Failed: ${message}`);
    }
}
async function recordTest(name, fn) {
    try {
        await fn();
        results.push({ name, passed: true });
        console.log(`  ✅ [PASS] ${name}`);
    }
    catch (err) {
        results.push({ name, passed: false, error: err.message });
        console.error(`  ❌ [FAIL] ${name}: ${err.message}`);
    }
}
async function runM8TestSuite() {
    console.log('🧪 Starting Phase M8 Shipping Integration & Fulfillment Workflow Test Suite...\n');
    const app = await (0, app_1.buildApp)();
    await app.ready();
    // Find sample products & users for tests
    const sampleProducts = await database_1.prisma.product.findMany({
        where: { isActive: true, deletedAt: null },
        include: { prices: true, inventoryItems: true },
        take: 2,
    });
    assert(sampleProducts.length >= 2, 'Need at least 2 active products in DB');
    const garageUser = await database_1.prisma.user.findFirst({
        where: { email: 'somchai@autoworkshop.com' },
        include: { customerProfile: { include: { addresses: true } } },
    });
    assert(garageUser != null, 'Garage user found');
    const shopUser = await database_1.prisma.user.findFirst({
        where: { email: 'bangkokparts@shop.co.th' },
        include: { customerProfile: { include: { addresses: true } } },
    });
    assert(shopUser != null, 'Shop user found');
    const adminUser = await database_1.prisma.user.findFirst({
        where: { email: 'admin@mobex.co.th' },
    });
    assert(adminUser != null, 'Admin user found');
    // Helper to get session cookie for a user
    async function loginAndGetCookie(email, pass = 'Admin@123456') {
        const res = await app.inject({
            method: 'POST',
            url: '/api/v1/auth/login',
            payload: { email, password: pass },
        });
        assert(res.statusCode === 200, `Login failed for ${email}`);
        const setCookie = res.headers['set-cookie'];
        return Array.isArray(setCookie) ? setCookie.join('; ') : setCookie;
    }
    const garageCookie = await loginAndGetCookie('somchai@autoworkshop.com');
    const shopCookie = await loginAndGetCookie('bangkokparts@shop.co.th');
    const adminCookie = await loginAndGetCookie('admin@mobex.co.th');
    // Helper to create a clean test order
    async function createTestOrder(cookie, product, qty = 2) {
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
                    recipientName: 'สมชาย รักการช่าง',
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
    async function createPaidOrder(cookie, product) {
        const order = await createTestOrder(cookie, product);
        // Mark order as PAYMENT_CONFIRMED directly in DB for fulfillment testing
        await database_1.prisma.order.update({
            where: { id: order.id },
            data: { status: database_1.OrderStatus.PAYMENT_CONFIRMED },
        });
        const updated = await database_1.prisma.order.findUnique({
            where: { id: order.id },
            include: { customer: { include: { addresses: true, user: true } }, items: true },
        });
        return updated;
    }
    // ----------------------------------------------------------------------------
    // TEST CASES
    // ----------------------------------------------------------------------------
    await recordTest('M8-T01: Shipping Method Selection & Active Carrier Rates', async () => {
        const res = await app.inject({
            method: 'GET',
            url: '/api/v1/shipping-methods',
        });
        assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
        const data = JSON.parse(res.body).data;
        assert(Array.isArray(data), 'Shipping methods should be an array');
        assert(data.length >= 2, 'Should have at least 2 active shipping methods seeded');
        const standardMethod = data.find((m) => m.code === 'STANDARD' || m.carrier === 'Standard Delivery' || m.code === 'FLASH' || m.code === 'KERRY');
        assert(standardMethod != null, 'Shipping method must exist');
        assert(Number(standardMethod.basePrice) >= 0, 'Base price must be a non-negative number');
    });
    await recordTest('M8-T02: Payment Boundary Enforcement - Reject Fulfillment of Unpaid Order', async () => {
        const unpaidOrder = await createTestOrder(garageCookie, sampleProducts[0]);
        assert(unpaidOrder.status === database_1.OrderStatus.PENDING_PAYMENT, 'Order must be in PENDING_PAYMENT status');
        const res = await app.inject({
            method: 'POST',
            url: '/api/v1/shipments',
            headers: { cookie: adminCookie },
            payload: {
                orderId: unpaidOrder.id,
            },
        });
        assert(res.statusCode === 400, `Expected 400 Bad Request for unpaid order, got ${res.statusCode}`);
        const body = JSON.parse(res.body);
        assert(body.error?.message?.includes('Cannot fulfill unpaid order') || body.message?.includes('Cannot fulfill unpaid order'), 'Error message must indicate payment is required');
    });
    await recordTest('M8-T03: Shipment Creation for PAYMENT_CONFIRMED Order with Unique SHP Number', async () => {
        const paidOrder = await createPaidOrder(garageCookie, sampleProducts[0]);
        const res = await app.inject({
            method: 'POST',
            url: '/api/v1/shipments',
            headers: { cookie: adminCookie },
            payload: {
                orderId: paidOrder.id,
                carrier: 'Flash Express',
                serviceLevel: 'NEXT_DAY',
                recipientName: 'นายสมชาย ผู้รับสินค้า',
                phone: '0899998888',
                addressLine1: '99/1 อาคารโมเบ็กซ์ ถนนสีลม',
                subdistrict: 'สีลม',
                district: 'บางรัก',
                province: 'กรุงเทพมหานคร',
                postalCode: '10500',
            },
        });
        assert(res.statusCode === 201, `Expected 201, got ${res.statusCode}: ${res.body}`);
        const shipment = JSON.parse(res.body).data;
        assert(shipment.id != null, 'Shipment ID must exist');
        assert(shipment.shipmentNumber.startsWith('SHP-'), 'Shipment number must start with SHP-');
        assert(shipment.status === database_1.ShipmentStatus.PENDING, 'Initial status must be PENDING');
        assert(shipment.carrier === 'Flash Express', 'Carrier must be Flash Express');
        assert(shipment.serviceLevel === 'NEXT_DAY', 'Service level must be NEXT_DAY');
        assert(shipment.events.length === 1, 'Should have 1 initial event');
        assert(shipment.events[0].status === database_1.ShipmentStatus.PENDING, 'Initial event must be PENDING');
    });
    await recordTest('M8-T04: Immutable Delivery Address Snapshotting', async () => {
        const paidOrder = await createPaidOrder(garageCookie, sampleProducts[0]);
        const res = await app.inject({
            method: 'POST',
            url: '/api/v1/shipments',
            headers: { cookie: adminCookie },
            payload: {
                orderId: paidOrder.id,
                recipientName: 'ที่อยู่เดิม สมชาย',
                phone: '0811112222',
                addressLine1: '111 หมู่ 1 ที่อยู่เดิม',
                province: 'เชียงใหม่',
                postalCode: '50000',
            },
        });
        assert(res.statusCode === 201, 'Shipment created');
        const shipment = JSON.parse(res.body).data;
        // Mutate customer address record in DB if exists
        if (garageUser?.customerProfile?.addresses?.[0]) {
            await database_1.prisma.customerAddress.update({
                where: { id: garageUser.customerProfile.addresses[0].id },
                data: { addressLine1: '999 ถนนใหม่ล่าสุด มีการย้ายบ้าน' },
            });
        }
        // Verify shipment address snapshot in DB was NOT mutated
        const checkShipment = await database_1.prisma.shipment.findUnique({ where: { id: shipment.id } });
        assert(checkShipment?.addressLine1 === '111 หมู่ 1 ที่อยู่เดิม', 'Historical addressLine1 must remain unchanged');
        assert(checkShipment?.addressSnapshot?.addressLine1 === '111 หมู่ 1 ที่อยู่เดิม', 'Address snapshot JSON must remain immutable');
    });
    await recordTest('M8-T05: Server-Authoritative Shipping Cost Calculation', async () => {
        const methods = await database_1.prisma.shippingMethod.findMany({ where: { isActive: true } });
        const method = methods[0];
        const paidOrder = await createPaidOrder(garageCookie, sampleProducts[0]);
        const res = await app.inject({
            method: 'POST',
            url: '/api/v1/shipments',
            headers: { cookie: adminCookie },
            payload: {
                orderId: paidOrder.id,
                shippingMethodId: method.id,
            },
        });
        assert(res.statusCode === 201, 'Shipment created');
        const shipment = JSON.parse(res.body).data;
        assert(Number(shipment.shippingCost) === Number(method.basePrice), 'Shipping cost must equal shipping method base price');
    });
    await recordTest('M8-T06: Initial ShippingEvent Append-Only Log Created', async () => {
        const paidOrder = await createPaidOrder(garageCookie, sampleProducts[0]);
        const res = await app.inject({
            method: 'POST',
            url: '/api/v1/shipments',
            headers: { cookie: adminCookie },
            payload: { orderId: paidOrder.id },
        });
        const shipment = JSON.parse(res.body).data;
        const events = await database_1.prisma.shippingEvent.findMany({ where: { shipmentId: shipment.id } });
        assert(events.length >= 1, 'Must have at least 1 event');
        assert(events[0].status === database_1.ShipmentStatus.PENDING, 'Event status must be PENDING');
        assert(events[0].description != null, 'Event must have description');
    });
    await recordTest('M8-T07: Staff State Transition - PENDING -> READY_TO_FULFILL -> PACKING', async () => {
        const paidOrder = await createPaidOrder(garageCookie, sampleProducts[0]);
        const createRes = await app.inject({
            method: 'POST',
            url: '/api/v1/shipments',
            headers: { cookie: adminCookie },
            payload: { orderId: paidOrder.id },
        });
        const shipment = JSON.parse(createRes.body).data;
        // 1. PENDING -> READY_TO_FULFILL
        const step1 = await app.inject({
            method: 'PATCH',
            url: `/api/v1/admin/shipments/${shipment.id}/status`,
            headers: { cookie: adminCookie },
            payload: {
                toStatus: 'READY_TO_FULFILL',
                description: 'Order confirmed and ready for warehouse fulfillment',
            },
        });
        assert(step1.statusCode === 200, `Step 1 failed: ${step1.body}`);
        assert(JSON.parse(step1.body).data.status === 'READY_TO_FULFILL', 'Status must be READY_TO_FULFILL');
        // 2. READY_TO_FULFILL -> PACKING
        const step2 = await app.inject({
            method: 'PATCH',
            url: `/api/v1/admin/shipments/${shipment.id}/status`,
            headers: { cookie: adminCookie },
            payload: {
                toStatus: 'PACKING',
                description: 'Warehouse staff is packing parts into parcel box',
            },
        });
        assert(step2.statusCode === 200, `Step 2 failed: ${step2.body}`);
        assert(JSON.parse(step2.body).data.status === 'PACKING', 'Status must be PACKING');
    });
    await recordTest('M8-T08: Staff State Transition - PACKING -> READY_TO_SHIP with Tracking Assignment', async () => {
        const paidOrder = await createPaidOrder(garageCookie, sampleProducts[0]);
        const createRes = await app.inject({
            method: 'POST',
            url: '/api/v1/shipments',
            headers: { cookie: adminCookie },
            payload: { orderId: paidOrder.id },
        });
        const shipment = JSON.parse(createRes.body).data;
        // Move to PACKING
        await app.inject({
            method: 'PATCH',
            url: `/api/v1/admin/shipments/${shipment.id}/status`,
            headers: { cookie: adminCookie },
            payload: { toStatus: 'READY_TO_FULFILL' },
        });
        await app.inject({
            method: 'PATCH',
            url: `/api/v1/admin/shipments/${shipment.id}/status`,
            headers: { cookie: adminCookie },
            payload: { toStatus: 'PACKING' },
        });
        // Assign Tracking Number
        const trackingRes = await app.inject({
            method: 'POST',
            url: `/api/v1/admin/shipments/${shipment.id}/tracking`,
            headers: { cookie: adminCookie },
            payload: {
                trackingNumber: 'TH0123456789F',
                carrier: 'Flash Express',
            },
        });
        assert(trackingRes.statusCode === 200, `Tracking assignment failed: ${trackingRes.body}`);
        const updated = JSON.parse(trackingRes.body).data;
        assert(updated.trackingNumber === 'TH0123456789F', 'Tracking number assigned');
        assert(updated.status === 'READY_TO_SHIP', 'Status automatically moves to READY_TO_SHIP');
    });
    await recordTest('M8-T09: Flash Express Provider - Tracking Generation & Format', async () => {
        const flashProvider = new flash_express_provider_1.FlashExpressProvider();
        const trackingNo = flashProvider.generateTrackingNumber();
        assert(trackingNo.startsWith('TH'), 'Flash tracking number must start with TH');
        assert(trackingNo.endsWith('F'), 'Flash tracking number must end with F');
        assert(trackingNo.length === 14, 'Flash tracking number length must be 14');
    });
    await recordTest('M8-T10: Kerry Express Provider - Tracking Generation & Format', async () => {
        const kerryProvider = new kerry_express_provider_1.KerryExpressProvider();
        const trackingNo = kerryProvider.generateTrackingNumber();
        assert(trackingNo.startsWith('KEX'), 'Kerry tracking number must start with KEX');
        assert(trackingNo.length === 13, 'Kerry tracking number length must be 13');
    });
    await recordTest('M8-T11: Test Shipping Provider - Deterministic Flow & Signature Generation', async () => {
        const testProvider = new test_provider_1.TestShippingProvider();
        const trackingNo = testProvider.generateTrackingNumber();
        assert(trackingNo.startsWith('TEST-TRK-'), 'Test tracking number format check');
        const headers = testProvider.signPayload({ trackingNumber: trackingNo, status: 'DELIVERED' });
        assert(headers['x-shipping-signature'] != null, 'Test provider generates x-shipping-signature header');
        const isValid = testProvider.verifyWebhookSignature(headers, { trackingNumber: trackingNo, status: 'DELIVERED' });
        assert(isValid === true, 'Signature verification succeeds with matching signature');
    });
    await recordTest('M8-T12: Legal State Transition - READY_TO_SHIP -> SHIPPED Synchronizes Order Status', async () => {
        const paidOrder = await createPaidOrder(garageCookie, sampleProducts[0]);
        const createRes = await app.inject({
            method: 'POST',
            url: '/api/v1/shipments',
            headers: { cookie: adminCookie },
            payload: { orderId: paidOrder.id },
        });
        const shipment = JSON.parse(createRes.body).data;
        // Progress to READY_TO_SHIP
        await database_1.prisma.shipment.update({
            where: { id: shipment.id },
            data: { status: database_1.ShipmentStatus.READY_TO_SHIP, trackingNumber: 'TH9998887776F' },
        });
        // Staff marks SHIPPED
        const res = await app.inject({
            method: 'PATCH',
            url: `/api/v1/admin/shipments/${shipment.id}/status`,
            headers: { cookie: adminCookie },
            payload: {
                toStatus: 'SHIPPED',
                description: 'Courier has picked up package from warehouse',
            },
        });
        assert(res.statusCode === 200, `Mark SHIPPED failed: ${res.body}`);
        const updatedShipment = JSON.parse(res.body).data;
        assert(updatedShipment.status === 'SHIPPED', 'Shipment status is SHIPPED');
        assert(updatedShipment.shippedAt != null, 'shippedAt timestamp must be recorded');
        // Check parent order status
        const orderCheck = await database_1.prisma.order.findUnique({ where: { id: paidOrder.id } });
        assert(orderCheck?.status === database_1.OrderStatus.SHIPPED, 'Parent order status must synchronize to SHIPPED');
    });
    await recordTest('M8-T13: State Machine Transition Validation - Invalid State Jump Strictly Rejected', async () => {
        const paidOrder = await createPaidOrder(garageCookie, sampleProducts[0]);
        const createRes = await app.inject({
            method: 'POST',
            url: '/api/v1/shipments',
            headers: { cookie: adminCookie },
            payload: { orderId: paidOrder.id },
        });
        const shipment = JSON.parse(createRes.body).data;
        assert(shipment.status === 'PENDING', 'Shipment is PENDING');
        // Attempt illegal jump: PENDING -> DELIVERED directly
        const res = await app.inject({
            method: 'PATCH',
            url: `/api/v1/admin/shipments/${shipment.id}/status`,
            headers: { cookie: adminCookie },
            payload: {
                toStatus: 'DELIVERED',
            },
        });
        assert(res.statusCode === 400, `Expected 400 for illegal state transition, got ${res.statusCode}`);
    });
    await recordTest('M8-T14: Inbound Courier Webhook - Valid HMAC Signature Ingestion', async () => {
        const paidOrder = await createPaidOrder(garageCookie, sampleProducts[0]);
        const testTrk = `TEST-TRK-${Date.now().toString().slice(-6)}`;
        // Create shipment with test tracking number in SHIPPED status
        const shipment = await database_1.prisma.shipment.create({
            data: {
                shipmentNumber: `SHP-TEST-${Date.now().toString().slice(-6)}`,
                orderId: paidOrder.id,
                carrier: 'Test Provider',
                trackingNumber: testTrk,
                status: database_1.ShipmentStatus.SHIPPED,
                recipientName: 'ทดสอบ ผู้รับ',
                phone: '0812345678',
                addressLine1: 'Test Address',
                province: 'กรุงเทพฯ',
                postalCode: '10110',
            },
        });
        const testProvider = new test_provider_1.TestShippingProvider();
        const webhookPayload = {
            eventId: `EVT-TRK-${Date.now()}`,
            trackingNumber: testTrk,
            status: 'IN_TRANSIT',
            description: 'Parcel departed sorting hub Bangkok Hub 02',
            location: 'Bangkok Sorting Hub',
            occurredAt: new Date().toISOString(),
        };
        const headers = testProvider.signPayload(webhookPayload);
        const res = await app.inject({
            method: 'POST',
            url: '/api/v1/shipments/webhooks/test',
            headers,
            payload: webhookPayload,
        });
        assert(res.statusCode === 200, `Webhook ingestion failed: ${res.body}`);
        const body = JSON.parse(res.body);
        assert(body.processed === true, 'Webhook processed');
        // Verify shipment updated to IN_TRANSIT
        const updatedShipment = await database_1.prisma.shipment.findUnique({
            where: { id: shipment.id },
            include: { events: true },
        });
        assert(updatedShipment?.status === database_1.ShipmentStatus.IN_TRANSIT, 'Shipment status updated to IN_TRANSIT');
        const latestEvent = updatedShipment?.events[updatedShipment.events.length - 1];
        assert(latestEvent?.location === 'Bangkok Sorting Hub', 'Event location recorded');
    });
    await recordTest('M8-T15: Inbound Courier Webhook - Invalid Cryptographic Signature Rejection', async () => {
        const webhookPayload = {
            eventId: `EVT-FAKE-${Date.now()}`,
            trackingNumber: 'FAKE-TRK-123',
            status: 'DELIVERED',
        };
        const res = await app.inject({
            method: 'POST',
            url: '/api/v1/shipments/webhooks/test',
            headers: { 'x-shipping-signature': 'invalid_forged_hmac_signature' },
            payload: webhookPayload,
        });
        assert(res.statusCode === 400, `Expected 400 Bad Request for invalid signature, got ${res.statusCode}`);
    });
    await recordTest('M8-T16: Inbound Courier Webhook - Idempotent Replay Protection', async () => {
        const paidOrder = await createPaidOrder(garageCookie, sampleProducts[0]);
        const testTrk = `TEST-TRK-REPLAY-${Date.now().toString().slice(-4)}`;
        await database_1.prisma.shipment.create({
            data: {
                shipmentNumber: `SHP-REPLAY-${Date.now().toString().slice(-4)}`,
                orderId: paidOrder.id,
                carrier: 'Test Provider',
                trackingNumber: testTrk,
                status: database_1.ShipmentStatus.SHIPPED,
                recipientName: 'ทดสอบ รีเพลย์',
                phone: '0812345678',
                addressLine1: 'Test Address',
                province: 'กรุงเทพฯ',
                postalCode: '10110',
            },
        });
        const testProvider = new test_provider_1.TestShippingProvider();
        const eventId = `EVT-REPLAY-${Date.now()}`;
        const webhookPayload = {
            eventId,
            trackingNumber: testTrk,
            status: 'IN_TRANSIT',
            description: 'Hub arrival',
        };
        const headers = testProvider.signPayload(webhookPayload);
        // First delivery
        const res1 = await app.inject({
            method: 'POST',
            url: '/api/v1/shipments/webhooks/test',
            headers,
            payload: webhookPayload,
        });
        assert(res1.statusCode === 200, 'First call succeeds');
        assert(JSON.parse(res1.body).processed === true, 'First call processed');
        // Duplicate replay
        const res2 = await app.inject({
            method: 'POST',
            url: '/api/v1/shipments/webhooks/test',
            headers,
            payload: webhookPayload,
        });
        assert(res2.statusCode === 200, 'Replay call succeeds gracefully');
        assert(JSON.parse(res2.body).duplicate === true, 'Replay call identified as duplicate');
    });
    await recordTest('M8-T17: Out-of-Order Tracking Webhook Protection - Stale Event Cannot Downgrade DELIVERED', async () => {
        const paidOrder = await createPaidOrder(garageCookie, sampleProducts[0]);
        const testTrk = `TEST-TRK-STALE-${Date.now().toString().slice(-4)}`;
        // Create shipment already in DELIVERED status
        const shipment = await database_1.prisma.shipment.create({
            data: {
                shipmentNumber: `SHP-STALE-${Date.now().toString().slice(-4)}`,
                orderId: paidOrder.id,
                carrier: 'Test Provider',
                trackingNumber: testTrk,
                status: database_1.ShipmentStatus.DELIVERED,
                recipientName: 'ผู้รับ สำเร็จแล้ว',
                phone: '0812345678',
                addressLine1: 'Test Address',
                province: 'กรุงเทพฯ',
                postalCode: '10110',
            },
        });
        const testProvider = new test_provider_1.TestShippingProvider();
        // Stale webhook arriving late: IN_TRANSIT
        const stalePayload = {
            eventId: `EVT-STALE-${Date.now()}`,
            trackingNumber: testTrk,
            status: 'IN_TRANSIT',
            description: 'Old in-transit update arrived late',
        };
        const headers = testProvider.signPayload(stalePayload);
        const res = await app.inject({
            method: 'POST',
            url: '/api/v1/shipments/webhooks/test',
            headers,
            payload: stalePayload,
        });
        assert(res.statusCode === 200, 'Stale webhook handled without error');
        // Shipment must remain DELIVERED
        const checkShipment = await database_1.prisma.shipment.findUnique({ where: { id: shipment.id } });
        assert(checkShipment?.status === database_1.ShipmentStatus.DELIVERED, 'Status must NOT be downgraded from DELIVERED');
    });
    await recordTest('M8-T18: Final Delivery Transition - OUT_FOR_DELIVERY -> DELIVERED Synchronizes Order', async () => {
        const paidOrder = await createPaidOrder(garageCookie, sampleProducts[0]);
        const shipment = await database_1.prisma.shipment.create({
            data: {
                shipmentNumber: `SHP-DELIV-${Date.now().toString().slice(-4)}`,
                orderId: paidOrder.id,
                carrier: 'Standard Delivery',
                trackingNumber: `STD-TRK-${Date.now().toString().slice(-4)}`,
                status: database_1.ShipmentStatus.OUT_FOR_DELIVERY,
                recipientName: 'ผู้รับ พัสดุพร้อมส่ง',
                phone: '0812345678',
                addressLine1: 'Test Address',
                province: 'กรุงเทพฯ',
                postalCode: '10110',
            },
        });
        const res = await app.inject({
            method: 'PATCH',
            url: `/api/v1/admin/shipments/${shipment.id}/status`,
            headers: { cookie: adminCookie },
            payload: {
                toStatus: 'DELIVERED',
                description: 'Customer received parcel and signed POD',
            },
        });
        assert(res.statusCode === 200, `Delivered transition failed: ${res.body}`);
        const updated = JSON.parse(res.body).data;
        assert(updated.status === 'DELIVERED', 'Status is DELIVERED');
        assert(updated.deliveredAt != null, 'deliveredAt timestamp recorded');
        // Parent order must be DELIVERED upon shipment delivery
        const parentOrder = await database_1.prisma.order.findUnique({ where: { id: paidOrder.id } });
        assert(parentOrder?.status === database_1.OrderStatus.DELIVERED, 'Parent order must be DELIVERED upon delivery');
    });
    await recordTest('M8-T19: Terminal State Immutability - Cannot Assign Tracking to DELIVERED Shipment', async () => {
        const paidOrder = await createPaidOrder(garageCookie, sampleProducts[0]);
        const shipment = await database_1.prisma.shipment.create({
            data: {
                shipmentNumber: `SHP-TERM-${Date.now().toString().slice(-4)}`,
                orderId: paidOrder.id,
                carrier: 'Standard Delivery',
                trackingNumber: `STD-TERM-${Date.now().toString().slice(-4)}`,
                status: database_1.ShipmentStatus.DELIVERED,
                recipientName: 'ผู้รับ ปลายทาง',
                phone: '0812345678',
                addressLine1: 'Test Address',
                province: 'กรุงเทพฯ',
                postalCode: '10110',
            },
        });
        const res = await app.inject({
            method: 'POST',
            url: `/api/v1/admin/shipments/${shipment.id}/tracking`,
            headers: { cookie: adminCookie },
            payload: { trackingNumber: 'NEW-TRACKING-999' },
        });
        assert(res.statusCode === 400, `Expected 400 for assigning tracking to DELIVERED, got ${res.statusCode}`);
    });
    await recordTest('M8-T20: Shipment Cancellation Workflow Before Dispatch', async () => {
        const paidOrder = await createPaidOrder(garageCookie, sampleProducts[0]);
        const createRes = await app.inject({
            method: 'POST',
            url: '/api/v1/shipments',
            headers: { cookie: adminCookie },
            payload: { orderId: paidOrder.id },
        });
        const shipment = JSON.parse(createRes.body).data;
        assert(shipment.status === 'PENDING', 'Shipment is PENDING');
        const cancelRes = await app.inject({
            method: 'POST',
            url: `/api/v1/admin/shipments/${shipment.id}/cancel`,
            headers: { cookie: adminCookie },
            payload: { reason: 'Customer requested modification before warehouse dispatch' },
        });
        assert(cancelRes.statusCode === 200, `Cancel failed: ${cancelRes.body}`);
        const cancelled = JSON.parse(cancelRes.body).data;
        assert(cancelled.status === 'CANCELLED', 'Shipment status is CANCELLED');
    });
    await recordTest('M8-T21: Shipment Cancellation Boundary - Cannot Cancel Already Shipped/Delivered Shipment', async () => {
        const paidOrder = await createPaidOrder(garageCookie, sampleProducts[0]);
        const shipment = await database_1.prisma.shipment.create({
            data: {
                shipmentNumber: `SHP-SHIPPED-${Date.now().toString().slice(-4)}`,
                orderId: paidOrder.id,
                carrier: 'Flash Express',
                trackingNumber: 'TH1234567890F',
                status: database_1.ShipmentStatus.SHIPPED,
                recipientName: 'ผู้รับ พัสดุเดินทางแล้ว',
                phone: '0812345678',
                addressLine1: 'Test Address',
                province: 'กรุงเทพฯ',
                postalCode: '10110',
            },
        });
        const res = await app.inject({
            method: 'POST',
            url: `/api/v1/admin/shipments/${shipment.id}/cancel`,
            headers: { cookie: adminCookie },
            payload: { reason: 'Try to cancel dispatched parcel' },
        });
        assert(res.statusCode === 400, `Expected 400 Bad Request for cancelling SHIPPED parcel, got ${res.statusCode}`);
    });
    await recordTest('M8-T22: Customer IDOR Protection - Customer Cannot Access Foreign Shipment', async () => {
        // Garage creates an order & shipment
        const garageOrder = await createPaidOrder(garageCookie, sampleProducts[0]);
        const createRes = await app.inject({
            method: 'POST',
            url: '/api/v1/shipments',
            headers: { cookie: adminCookie },
            payload: { orderId: garageOrder.id },
        });
        const garageShipment = JSON.parse(createRes.body).data;
        // Shop customer attempts to access Garage customer's shipment
        const idorRes = await app.inject({
            method: 'GET',
            url: `/api/v1/shipments/${garageShipment.id}`,
            headers: { cookie: shopCookie },
        });
        assert(idorRes.statusCode === 403, `Expected 403 Forbidden for IDOR access, got ${idorRes.statusCode}`);
    });
    await recordTest('M8-T23: Public Tracking Lookup & Privacy Masking', async () => {
        const paidOrder = await createPaidOrder(garageCookie, sampleProducts[0]);
        const testTrk = `PUB-TRK-${Date.now().toString().slice(-4)}`;
        await database_1.prisma.shipment.create({
            data: {
                shipmentNumber: `SHP-PUB-${Date.now().toString().slice(-4)}`,
                orderId: paidOrder.id,
                carrier: 'Flash Express',
                trackingNumber: testTrk,
                status: database_1.ShipmentStatus.IN_TRANSIT,
                recipientName: 'สมชาย รักการช่าง',
                phone: '0812345678',
                addressLine1: '123/45 ถนนพระราม 2',
                province: 'กรุงเทพมหานคร',
                postalCode: '10150',
                events: {
                    create: [
                        { status: database_1.ShipmentStatus.PENDING, description: 'Created' },
                        { status: database_1.ShipmentStatus.IN_TRANSIT, description: 'In Transit Hub 01', location: 'Rama 2 Hub' },
                    ],
                },
            },
        });
        // Public call with no auth cookie
        const res = await app.inject({
            method: 'GET',
            url: `/api/v1/tracking/${testTrk}`,
        });
        assert(res.statusCode === 200, `Tracking lookup failed: ${res.body}`);
        const tracking = JSON.parse(res.body).data;
        assert(tracking.trackingNumber === testTrk, 'Tracking number matches');
        assert(tracking.recipientSummary != null, 'Recipient summary provided');
        assert(tracking.recipientSummary.name.includes('ร.'), 'Recipient surname must be masked');
        assert(tracking.recipientSummary.phone.includes('-XXX-'), 'Recipient phone must be masked');
        assert(tracking.events.length === 2, 'Events timeline returned');
    });
    await recordTest('M8-T24: Admin Fulfillment Dashboard & Carrier Filtering', async () => {
        const res = await app.inject({
            method: 'GET',
            url: '/api/v1/admin/shipments?limit=10',
            headers: { cookie: adminCookie },
        });
        assert(res.statusCode === 200, `Admin query failed: ${res.body}`);
        const body = JSON.parse(res.body);
        assert(Array.isArray(body.data), 'Shipments data must be an array');
        assert(body.pagination != null, 'Pagination object must exist');
        assert(body.pagination.page === 1, 'Page should be 1');
    });
    await recordTest('M8-T25: Zero Stock Mutation Invariant - Verifies Inventory Levels Unaltered in M8', async () => {
        const product = sampleProducts[0];
        const initialInventory = await database_1.prisma.inventoryItem.findFirst({
            where: { productId: product.id },
        });
        const initialQty = initialInventory?.onHand ?? 0;
        // Run full shipment lifecycle on an order with this product
        const paidOrder = await createPaidOrder(garageCookie, product);
        const shipmentRes = await app.inject({
            method: 'POST',
            url: '/api/v1/shipments',
            headers: { cookie: adminCookie },
            payload: { orderId: paidOrder.id, carrier: 'Flash Express' },
        });
        const shipment = JSON.parse(shipmentRes.body).data;
        // Update through all stages to DELIVERED
        await app.inject({
            method: 'PATCH',
            url: `/api/v1/admin/shipments/${shipment.id}/status`,
            headers: { cookie: adminCookie },
            payload: { toStatus: 'READY_TO_FULFILL' },
        });
        await app.inject({
            method: 'PATCH',
            url: `/api/v1/admin/shipments/${shipment.id}/status`,
            headers: { cookie: adminCookie },
            payload: { toStatus: 'PACKING' },
        });
        await app.inject({
            method: 'POST',
            url: `/api/v1/admin/shipments/${shipment.id}/tracking`,
            headers: { cookie: adminCookie },
            payload: { trackingNumber: `INV-CHECK-${Date.now()}` },
        });
        await app.inject({
            method: 'PATCH',
            url: `/api/v1/admin/shipments/${shipment.id}/status`,
            headers: { cookie: adminCookie },
            payload: { toStatus: 'SHIPPED' },
        });
        await app.inject({
            method: 'PATCH',
            url: `/api/v1/admin/shipments/${shipment.id}/status`,
            headers: { cookie: adminCookie },
            payload: { toStatus: 'DELIVERED' },
        });
        // Check inventory after all shipping operations
        const finalInventory = await database_1.prisma.inventoryItem.findFirst({
            where: { productId: product.id },
        });
        const finalQty = finalInventory?.onHand ?? 0;
        assert(initialQty === finalQty, `ZERO STOCK MUTATION INVARIANT VIOLATED: initial=${initialQty}, final=${finalQty}. Stock must not mutate in M8!`);
    });
    // ----------------------------------------------------------------------------
    // RESULTS SUMMARY
    // ----------------------------------------------------------------------------
    console.log('\n======================================================');
    const passedCount = results.filter((r) => r.passed).length;
    const totalCount = results.length;
    console.log(`Results: ${passedCount} / ${totalCount} M8 tests PASSED.`);
    if (passedCount === totalCount) {
        console.log('🎉 Phase M8 Shipping Integration & Fulfillment Suite PASSED 100%!\n');
    }
    else {
        console.error(`💥 ${totalCount - passedCount} test(s) failed in M8 suite.\n`);
        process.exit(1);
    }
}
runM8TestSuite()
    .catch((err) => {
    console.error('Fatal M8 test suite execution error:', err);
    process.exit(1);
})
    .finally(async () => {
    await database_1.prisma.$disconnect();
});
//# sourceMappingURL=m8-test.js.map