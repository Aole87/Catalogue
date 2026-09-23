"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("../apps/api/src/app");
const database_1 = require("@car-parts/database");
const pricing_service_1 = require("../apps/api/src/services/pricing.service");
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
async function runM6TestSuite() {
    console.log('🧪 Starting Phase M6 Cart + Checkout + Pricing Rules Reconciliation Test Suite...\n');
    const app = await (0, app_1.buildApp)();
    await app.ready();
    // Find sample products, customer user, and vehicle variant for testing
    const sampleProducts = await database_1.prisma.product.findMany({
        where: { isActive: true, deletedAt: null },
        include: { prices: true, brand: true, category: true },
        take: 4,
    });
    assert(sampleProducts.length >= 3, 'Need at least 3 active products in DB to run tests');
    const sampleVehicle = await database_1.prisma.vehicleVariant.findFirst({
        include: { generation: { include: { model: { include: { make: true } } } } },
    });
    const testCustomer = await database_1.prisma.user.findFirst({
        where: { email: 'somchai@autoworkshop.com' },
        include: { customerProfile: true },
    });
    assert(testCustomer != null, 'Somchai test customer found');
    const p1 = sampleProducts[0];
    const p2 = sampleProducts[1];
    const p3 = sampleProducts[2];
    // ----------------------------------------------------------------------------
    // SUITE 1: MULTI-TIER PRICING ENGINE & FREE SHIPPING BOUNDARIES
    // ----------------------------------------------------------------------------
    console.log('--- Suite 1: Multi-Tier Pricing Engine & Free Shipping Boundaries ---');
    await recordTest('Pricing Engine: General Tier Price Calculation', async () => {
        const lineItem = pricing_service_1.PricingService.calculateLineItem(p1, database_1.PriceTier.GENERAL, 2);
        const expectedGeneralPrice = p1.prices.find((p) => p.tier === database_1.PriceTier.GENERAL)?.price || p1.prices[0].price;
        const expectedTotal = (Number(expectedGeneralPrice) * 2).toFixed(2);
        assert(lineItem.unitPrice === Number(expectedGeneralPrice).toFixed(2), `Expected unitPrice ${expectedGeneralPrice}, got ${lineItem.unitPrice}`);
        assert(lineItem.lineTotal === expectedTotal, `Expected lineTotal ${expectedTotal}, got ${lineItem.lineTotal}`);
        assert(lineItem.quantity === 2, 'Quantity should be 2');
    });
    await recordTest('Pricing Engine: Garage / Shop Tier Resolution', async () => {
        const lineItemGarage = pricing_service_1.PricingService.calculateLineItem(p1, database_1.PriceTier.GARAGE, 3);
        const garagePrice = p1.prices.find((p) => p.tier === database_1.PriceTier.GARAGE)?.price || p1.prices[0].price;
        assert(lineItemGarage.unitPrice === Number(garagePrice).toFixed(2), 'Garage price should match tier');
        assert(lineItemGarage.lineTotal === (Number(garagePrice) * 3).toFixed(2), 'Garage line total calculation correct');
    });
    await recordTest('Free Shipping Boundary: 1,999.99 THB -> standard shipping applies (50.00 THB)', async () => {
        const items = [{ lineTotal: '1999.99', quantity: 1 }];
        const totals = pricing_service_1.PricingService.calculateTotals(items, database_1.PriceTier.GENERAL, 50.00);
        assert(totals.subtotal === '1999.99', 'Subtotal should be 1999.99');
        assert(totals.shippingTotal === '50.00', 'Shipping fee should be 50.00 for subtotal < 2000');
        assert(totals.grandTotal === '2049.99', 'Grand total should be 2049.99');
    });
    await recordTest('Free Shipping Boundary: 2,000.00 THB -> free shipping (0.00 THB)', async () => {
        const items = [{ lineTotal: '2000.00', quantity: 1 }];
        const totals = pricing_service_1.PricingService.calculateTotals(items, database_1.PriceTier.GENERAL, 50.00);
        assert(totals.subtotal === '2000.00', 'Subtotal should be 2000.00');
        assert(totals.shippingTotal === '0.00', 'Shipping fee should be 0.00 for subtotal == 2000');
        assert(totals.grandTotal === '2000.00', 'Grand total should equal subtotal');
    });
    await recordTest('Free Shipping Boundary: 2,000.01 THB -> free shipping (0.00 THB)', async () => {
        const items = [{ lineTotal: '2000.01', quantity: 1 }];
        const totals = pricing_service_1.PricingService.calculateTotals(items, database_1.PriceTier.GENERAL, 50.00);
        assert(totals.subtotal === '2000.01', 'Subtotal should be 2000.01');
        assert(totals.shippingTotal === '0.00', 'Shipping fee should be 0.00 for subtotal > 2000');
        assert(totals.grandTotal === '2000.01', 'Grand total should equal subtotal');
    });
    // ----------------------------------------------------------------------------
    // SUITE 2: CART OWNERSHIP & IDOR PROTECTION
    // ----------------------------------------------------------------------------
    console.log('\n--- Suite 2: Cart Ownership & IDOR Protection ---');
    let guestAToken = '';
    let guestBToken = '';
    let guestAItemId = '';
    await recordTest('Guest A: Creates cart and adds item', async () => {
        const initRes = await app.inject({ method: 'GET', url: '/api/v1/cart' });
        guestAToken = initRes.headers['x-session-token'];
        assert(Boolean(guestAToken), 'Guest A session token created');
        const addRes = await app.inject({
            method: 'POST',
            url: '/api/v1/cart/items',
            headers: { 'x-session-token': guestAToken },
            payload: { productId: p1.id, quantity: 2, vehicleVariantId: sampleVehicle?.id || null },
        });
        assert(addRes.statusCode === 200, `Expected 200, got ${addRes.statusCode}`);
        const json = JSON.parse(addRes.body);
        guestAItemId = json.data.items[0].id;
        assert(Boolean(guestAItemId), 'Guest A item ID obtained');
    });
    await recordTest('IDOR Check: Guest B cannot update Guest A cart item', async () => {
        const initB = await app.inject({ method: 'GET', url: '/api/v1/cart' });
        guestBToken = initB.headers['x-session-token'];
        assert(guestBToken !== guestAToken, 'Guest B has distinct token');
        const attackRes = await app.inject({
            method: 'PATCH',
            url: `/api/v1/cart/items/${guestAItemId}`,
            headers: { 'x-session-token': guestBToken },
            payload: { quantity: 10 },
        });
        assert(attackRes.statusCode === 403 || attackRes.statusCode === 404, `Expected 403/404, got ${attackRes.statusCode}`);
    });
    await recordTest('IDOR Check: Guest B cannot delete Guest A cart item', async () => {
        const attackRes = await app.inject({
            method: 'DELETE',
            url: `/api/v1/cart/items/${guestAItemId}`,
            headers: { 'x-session-token': guestBToken },
        });
        assert(attackRes.statusCode === 403 || attackRes.statusCode === 404, `Expected 403/404, got ${attackRes.statusCode}`);
    });
    // ----------------------------------------------------------------------------
    // SUITE 3: CART QUANTITY & INPUT VALIDATION
    // ----------------------------------------------------------------------------
    console.log('\n--- Suite 3: Cart Quantity & Input Validation ---');
    await recordTest('Validation: Rejects negative quantity on add (quantity = -1)', async () => {
        const res = await app.inject({
            method: 'POST',
            url: '/api/v1/cart/items',
            headers: { 'x-session-token': guestAToken },
            payload: { productId: p1.id, quantity: -1 },
        });
        assert(res.statusCode === 400 || res.statusCode === 422, `Expected 400/422, got ${res.statusCode}`);
    });
    await recordTest('Validation: Rejects zero quantity on add (quantity = 0)', async () => {
        const res = await app.inject({
            method: 'POST',
            url: '/api/v1/cart/items',
            headers: { 'x-session-token': guestAToken },
            payload: { productId: p1.id, quantity: 0 },
        });
        assert(res.statusCode === 400 || res.statusCode === 422, `Expected 400/422, got ${res.statusCode}`);
    });
    await recordTest('Validation: Rejects quantity > 999', async () => {
        const res = await app.inject({
            method: 'POST',
            url: '/api/v1/cart/items',
            headers: { 'x-session-token': guestAToken },
            payload: { productId: p1.id, quantity: 1000 },
        });
        assert(res.statusCode === 400 || res.statusCode === 422, `Expected 400/422, got ${res.statusCode}`);
    });
    await recordTest('Validation: Rejects invalid product UUID', async () => {
        const res = await app.inject({
            method: 'POST',
            url: '/api/v1/cart/items',
            headers: { 'x-session-token': guestAToken },
            payload: { productId: '00000000-0000-0000-0000-000000000000', quantity: 1 },
        });
        assert(res.statusCode === 404, `Expected 404, got ${res.statusCode}`);
    });
    // ----------------------------------------------------------------------------
    // SUITE 4: DETERMINISTIC GUEST -> USER CART MERGING
    // ----------------------------------------------------------------------------
    console.log('\n--- Suite 4: Deterministic Guest -> User Cart Merging ---');
    let customerAuthCookie = '';
    await recordTest('Auth Login: Authenticate test garage user', async () => {
        const res = await app.inject({
            method: 'POST',
            url: '/api/v1/auth/login',
            payload: { email: 'somchai@autoworkshop.com', password: 'Admin@123456' },
        });
        assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
        const setCookie = res.headers['set-cookie'];
        customerAuthCookie = Array.isArray(setCookie) ? setCookie[0] : setCookie;
        assert(Boolean(customerAuthCookie), 'Obtained auth session cookie');
    });
    await recordTest('Cart Merge Scenario: Guest (P1 x2, P2 x1) + User (P1 x1, P3 x3)', async () => {
        // 1. Setup fresh guest cart with P1 (qty 2) + P2 (qty 1)
        const gRes = await app.inject({ method: 'GET', url: '/api/v1/cart' });
        const gToken = gRes.headers['x-session-token'];
        await app.inject({
            method: 'POST',
            url: '/api/v1/cart/items',
            headers: { 'x-session-token': gToken },
            payload: { productId: p1.id, quantity: 2 },
        });
        await app.inject({
            method: 'POST',
            url: '/api/v1/cart/items',
            headers: { 'x-session-token': gToken },
            payload: { productId: p2.id, quantity: 1 },
        });
        // 2. Clear user cart and add P1 (qty 1) + P3 (qty 3)
        await app.inject({ method: 'DELETE', url: '/api/v1/cart', headers: { cookie: customerAuthCookie } });
        await app.inject({
            method: 'POST',
            url: '/api/v1/cart/items',
            headers: { cookie: customerAuthCookie },
            payload: { productId: p1.id, quantity: 1 },
        });
        await app.inject({
            method: 'POST',
            url: '/api/v1/cart/items',
            headers: { cookie: customerAuthCookie },
            payload: { productId: p3.id, quantity: 3 },
        });
        // 3. Perform merge
        const mergeRes = await app.inject({
            method: 'POST',
            url: '/api/v1/cart/merge',
            headers: { cookie: customerAuthCookie },
            payload: { sessionToken: gToken },
        });
        assert(mergeRes.statusCode === 200, `Expected 200, got ${mergeRes.statusCode}`);
        const mergedCart = JSON.parse(mergeRes.body).data;
        // 4. Assert deterministic merge results: P1 = 3, P2 = 1, P3 = 3 (Total items = 7)
        const itemP1 = mergedCart.items.find((i) => i.productId === p1.id);
        const itemP2 = mergedCart.items.find((i) => i.productId === p2.id);
        const itemP3 = mergedCart.items.find((i) => i.productId === p3.id);
        assert(itemP1?.quantity === 3, `Expected P1 quantity 3 (2+1), got ${itemP1?.quantity}`);
        assert(itemP2?.quantity === 1, `Expected P2 quantity 1, got ${itemP2?.quantity}`);
        assert(itemP3?.quantity === 3, `Expected P3 quantity 3, got ${itemP3?.quantity}`);
        assert(mergedCart.totals.totalItems === 7, `Expected totalItems 7, got ${mergedCart.totals.totalItems}`);
    });
    // ----------------------------------------------------------------------------
    // SUITE 5: PRICE TAMPERING RESISTANCE & SECURITY
    // ----------------------------------------------------------------------------
    console.log('\n--- Suite 5: Price Tampering Defense ---');
    await recordTest('Security: Malicious client prices injected into checkout payload are discarded', async () => {
        // 1. Create fresh guest cart with 2 of P1
        const gRes = await app.inject({ method: 'GET', url: '/api/v1/cart' });
        const gToken = gRes.headers['x-session-token'];
        await app.inject({
            method: 'POST',
            url: '/api/v1/cart/items',
            headers: { 'x-session-token': gToken },
            payload: { productId: p1.id, quantity: 2 },
        });
        // 2. Submit checkout with injected client prices
        const hackRes = await app.inject({
            method: 'POST',
            url: '/api/v1/checkout',
            headers: { 'x-session-token': gToken },
            payload: {
                shippingAddress: {
                    recipientName: 'Attacker',
                    phone: '0899999999',
                    addressLine: '123 Fake Street',
                    province: 'กรุงเทพมหานคร',
                    postalCode: '10110',
                },
                unitPrice: '0.01',
                subtotal: '0.02',
                grandTotal: '0.02',
                discountTotal: '9999.00',
                customerTier: 'SHOP',
                tier: 'SHOP',
            },
        });
        assert(hackRes.statusCode === 201, `Expected 201, got ${hackRes.statusCode}`);
        const orderData = JSON.parse(hackRes.body).data;
        // Server-calculated price MUST be respected, client input discarded
        const expectedItemPrice = Number(p1.prices.find((p) => p.tier === database_1.PriceTier.GENERAL)?.price || p1.prices[0].price);
        const expectedSubtotal = (expectedItemPrice * 2).toFixed(2);
        assert(orderData.subtotal === expectedSubtotal, `Subtotal was tampered! Expected ${expectedSubtotal}, got ${orderData.subtotal}`);
        assert(orderData.discountTotal === '0.00', 'Discount total was tampered!');
    });
    // ----------------------------------------------------------------------------
    // SUITE 6: CHECKOUT ATOMICITY & PRODUCT STATE VALIDATION
    // ----------------------------------------------------------------------------
    console.log('\n--- Suite 6: Checkout Atomicity & Product State Validation ---');
    let createdOrderNumber = '';
    let createdOrderId = '';
    await recordTest('Validation: Checkout rejects incomplete shipping address', async () => {
        const res = await app.inject({
            method: 'POST',
            url: '/api/v1/checkout',
            headers: { cookie: customerAuthCookie },
            payload: {
                shippingAddress: {
                    recipientName: 'สมชาย รักการช่าง',
                },
            },
        });
        assert(res.statusCode === 400 || res.statusCode === 422, `Expected 400/422, got ${res.statusCode}`);
    });
    await recordTest('Atomic Checkout: Creates Order + OrderItem + OrderStatusHistory + Payment draft', async () => {
        // Ensure customer cart has items
        await app.inject({ method: 'DELETE', url: '/api/v1/cart', headers: { cookie: customerAuthCookie } });
        await app.inject({
            method: 'POST',
            url: '/api/v1/cart/items',
            headers: { cookie: customerAuthCookie },
            payload: { productId: p1.id, quantity: 2, vehicleVariantId: sampleVehicle?.id || null },
        });
        const res = await app.inject({
            method: 'POST',
            url: '/api/v1/checkout',
            headers: { cookie: customerAuthCookie },
            payload: {
                shippingAddress: {
                    recipientName: 'สมชาย ช่างยนต์',
                    phone: '0891112233',
                    addressLine: '88/9 ถนนลาดพร้าว ซอย 71',
                    subdistrict: 'สะพานสอง',
                    district: 'วังทองหลาง',
                    province: 'กรุงเทพมหานคร',
                    postalCode: '10310',
                },
                customerNotes: 'ขอใบเสร็จรับเงินในนามอู่สมชายการาจด้วยครับ',
                paymentMethod: 'PROMPTPAY',
            },
        });
        assert(res.statusCode === 201, `Expected 201, got ${res.statusCode}`);
        const json = JSON.parse(res.body);
        const order = json.data;
        assert(order.orderNumber.startsWith('ORD-'), `Order number format should be ORD-, got ${order.orderNumber}`);
        assert(order.status === 'PENDING_PAYMENT', `Expected PENDING_PAYMENT, got ${order.status}`);
        assert(order.items.length === 1, 'Expected 1 item snapshot');
        assert(order.statusHistory.length === 1, 'Expected initial status transition');
        assert(order.payments.length === 1, 'Expected initial payment draft');
        assert(order.payments[0].status === 'PENDING', 'Payment status must be PENDING');
        assert(order.payments[0].provider === 'PROMPTPAY', 'Payment provider matches selection');
        createdOrderNumber = order.orderNumber;
        createdOrderId = order.id;
    });
    await recordTest('Checkout Post-Condition: Customer cart is cleared after checkout', async () => {
        const res = await app.inject({ method: 'GET', url: '/api/v1/cart', headers: { cookie: customerAuthCookie } });
        assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
        const cart = JSON.parse(res.body).data;
        assert(cart.items.length === 0, 'Cart should be empty after checkout');
        assert(cart.totals.subtotal === '0.00', 'Subtotal should be 0.00');
    });
    // ----------------------------------------------------------------------------
    // SUITE 7: CHECKOUT CONCURRENCY & TRANSACTION ISOLATION
    // ----------------------------------------------------------------------------
    console.log('\n--- Suite 7: Checkout Concurrency & Transaction Isolation ---');
    await recordTest('Concurrency: Simultaneous checkouts execute cleanly without cross-corruption', async () => {
        // 1. Create two separate guest sessions with items
        const g1Res = await app.inject({ method: 'GET', url: '/api/v1/cart' });
        const g1Token = g1Res.headers['x-session-token'];
        await app.inject({
            method: 'POST',
            url: '/api/v1/cart/items',
            headers: { 'x-session-token': g1Token },
            payload: { productId: p1.id, quantity: 1 },
        });
        const g2Res = await app.inject({ method: 'GET', url: '/api/v1/cart' });
        const g2Token = g2Res.headers['x-session-token'];
        await app.inject({
            method: 'POST',
            url: '/api/v1/cart/items',
            headers: { 'x-session-token': g2Token },
            payload: { productId: p2.id, quantity: 2 },
        });
        // 2. Fire simultaneous checkouts with Promise.all
        const [orderRes1, orderRes2] = await Promise.all([
            app.inject({
                method: 'POST',
                url: '/api/v1/checkout',
                headers: { 'x-session-token': g1Token },
                payload: {
                    shippingAddress: {
                        recipientName: 'User A Concurrent',
                        phone: '0811111111',
                        addressLine: '111 Rama 9 Road',
                        province: 'กรุงเทพมหานคร',
                        postalCode: '10310',
                    },
                },
            }),
            app.inject({
                method: 'POST',
                url: '/api/v1/checkout',
                headers: { 'x-session-token': g2Token },
                payload: {
                    shippingAddress: {
                        recipientName: 'User B Concurrent',
                        phone: '0822222222',
                        addressLine: '222 Sukhumvit Road',
                        province: 'กรุงเทพมหานคร',
                        postalCode: '10110',
                    },
                },
            }),
        ]);
        assert(orderRes1.statusCode === 201, `Order 1 expected 201, got ${orderRes1.statusCode}`);
        assert(orderRes2.statusCode === 201, `Order 2 expected 201, got ${orderRes2.statusCode}`);
        const o1 = JSON.parse(orderRes1.body).data;
        const o2 = JSON.parse(orderRes2.body).data;
        assert(o1.orderNumber !== o2.orderNumber, 'Concurrent orders have distinct order numbers');
        assert(o1.id !== o2.id, 'Concurrent orders have distinct UUIDs');
    });
    // ----------------------------------------------------------------------------
    // SUITE 8: ORDERITEM IMMUTABLE SNAPSHOT INTEGRITY
    // ----------------------------------------------------------------------------
    console.log('\n--- Suite 8: OrderItem Immutable Snapshot Integrity ---');
    await recordTest('Snapshot Integrity: OrderItem retains original price/metadata after product master mutation', async () => {
        // 1. Check original unit price in created order
        const orderBefore = await database_1.prisma.order.findUnique({
            where: { id: createdOrderId },
            include: { items: true },
        });
        const snapshotItem = orderBefore?.items[0];
        const originalSnapshotPrice = snapshotItem?.unitPrice;
        const originalSnapshotName = snapshotItem?.productName;
        // 2. Temporarily mutate product master in DB (simulating catalog manager editing price & name)
        await database_1.prisma.product.update({
            where: { id: p1.id },
            data: { name: 'MUTATED_PRODUCT_NAME_FOR_TEST' },
        });
        const p1Price = await database_1.prisma.productPrice.findFirst({ where: { productId: p1.id, tier: database_1.PriceTier.GARAGE } });
        if (p1Price) {
            await database_1.prisma.productPrice.update({
                where: { id: p1Price.id },
                data: { price: 99999.00 },
            });
        }
        // 3. Fetch order via API endpoint
        const orderRes = await app.inject({
            method: 'GET',
            url: `/api/v1/orders/${createdOrderId}`,
        });
        assert(orderRes.statusCode === 200, `Expected 200, got ${orderRes.statusCode}`);
        const fetchedOrder = JSON.parse(orderRes.body).data;
        const fetchedItem = fetchedOrder.items[0];
        // 4. Assert that the historical OrderItem remains intact
        assert(fetchedItem.productName === originalSnapshotName, `Historical name changed! Expected ${originalSnapshotName}, got ${fetchedItem.productName}`);
        assert(fetchedItem.unitPrice === Number(originalSnapshotPrice).toFixed(2), `Historical price changed! Expected ${originalSnapshotPrice}, got ${fetchedItem.unitPrice}`);
        // 5. Restore product master
        await database_1.prisma.product.update({
            where: { id: p1.id },
            data: { name: p1.name },
        });
        if (p1Price) {
            await database_1.prisma.productPrice.update({
                where: { id: p1Price.id },
                data: { price: p1Price.price },
            });
        }
    });
    // ----------------------------------------------------------------------------
    // SUITE 9: ORDER STATUS & PAYMENT BOUNDARIES
    // ----------------------------------------------------------------------------
    console.log('\n--- Suite 9: Order Status & Payment Boundaries ---');
    await recordTest('Boundary Check: Initial order status is strictly PENDING_PAYMENT (never PAID)', async () => {
        const order = await database_1.prisma.order.findUnique({ where: { id: createdOrderId } });
        assert(order?.status === 'PENDING_PAYMENT', `Status must be PENDING_PAYMENT, got ${order?.status}`);
    });
    await recordTest('Boundary Check: Payment record status is PENDING (never PAID in M6)', async () => {
        const payment = await database_1.prisma.payment.findFirst({ where: { orderId: createdOrderId } });
        assert(payment != null, 'Payment draft exists');
        assert(payment.status === 'PENDING', `Payment status must be PENDING, got ${payment?.status}`);
    });
    // ----------------------------------------------------------------------------
    // SUITE 10: ORDER RETRIEVAL & LOOKUP
    // ----------------------------------------------------------------------------
    console.log('\n--- Suite 10: Order Retrieval & Lookup ---');
    await recordTest('GET /api/v1/orders/by-number/:orderNumber: Retrieves public order confirmation', async () => {
        const res = await app.inject({
            method: 'GET',
            url: `/api/v1/orders/by-number/${createdOrderNumber}`,
        });
        assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
        const json = JSON.parse(res.body);
        assert(json.data.orderNumber === createdOrderNumber, 'Order number matches');
        assert(json.data.items.length >= 1, 'Items snapshot exists');
        assert(json.data.items[0].productSnapshot != null, 'Item has product snapshot JSON');
    });
    await recordTest('GET /api/v1/orders/:id: Retrieves order by UUID', async () => {
        const res = await app.inject({
            method: 'GET',
            url: `/api/v1/orders/${createdOrderId}`,
        });
        assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
        const json = JSON.parse(res.body);
        assert(json.data.id === createdOrderId, 'Order UUID matches');
    });
    await recordTest('GET /api/v1/orders/my-orders: Retrieves authenticated customer orders', async () => {
        const res = await app.inject({
            method: 'GET',
            url: '/api/v1/orders/my-orders',
            headers: { cookie: customerAuthCookie },
        });
        assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
        const json = JSON.parse(res.body);
        assert(Array.isArray(json.data), 'Expected array of orders');
        assert(json.data.some((o) => o.orderNumber === createdOrderNumber), 'Created order appears in customer history');
    });
    // ----------------------------------------------------------------------------
    // REPORTING & SUMMARY
    // ----------------------------------------------------------------------------
    console.log('\n======================================================');
    const passed = results.filter((r) => r.passed).length;
    const failed = results.filter((r) => !r.passed).length;
    console.log(`Results: ${passed} / ${results.length} M6 reconciliation tests PASSED.`);
    if (failed > 0) {
        console.error(`❌ ${failed} tests failed.`);
        process.exit(1);
    }
    else {
        console.log('🎉 Phase M6 Cart + Checkout + Pricing Rules Suite PASSED 100%!\n');
    }
    await app.close();
}
runM6TestSuite().catch((err) => {
    console.error('Fatal error running M6 test suite:', err);
    process.exit(1);
});
//# sourceMappingURL=m6-test.js.map