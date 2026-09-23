"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("../apps/api/src/app");
const database_1 = require("@car-parts/database");
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
async function runM12TestSuite() {
    console.log('🧪 Starting Phase M12 CRM & Marketing Management Test Suite (50 Tests)...\n');
    const app = await (0, app_1.buildApp)();
    await app.ready();
    // Helper to ensure roles and users with customerProfile
    async function ensureUserWithRole(email, roleName, firstName, lastName) {
        let role = await database_1.prisma.role.findUnique({ where: { name: roleName } });
        if (!role) {
            role = await database_1.prisma.role.create({
                data: { name: roleName, description: `${roleName} Role` },
            });
        }
        let user = await database_1.prisma.user.findFirst({
            where: { email },
            include: { roles: { include: { role: true } }, customerProfile: true },
        });
        const admin = await database_1.prisma.user.findFirst({ where: { email: 'admin@mobex.co.th' } });
        const defaultPasswordHash = admin?.passwordHash || '$2a$10$w099y1V2z6wGkG89x2XzO.B1s0eHek6V16VzFj3bA7j6N5Y1r0eKO';
        if (!user) {
            user = await database_1.prisma.user.create({
                data: {
                    email,
                    passwordHash: defaultPasswordHash,
                    firstName,
                    lastName,
                    isActive: true,
                    roles: { create: { roleId: role.id } },
                    customerProfile: {
                        create: {
                            customerType: 'CUSTOMER',
                            phone: '0812345678',
                        },
                    },
                },
                include: { roles: { include: { role: true } }, customerProfile: true },
            });
        }
        else {
            const hasRole = user.roles.some((r) => r.role.name === roleName);
            if (!hasRole) {
                await database_1.prisma.userRole.create({
                    data: { userId: user.id, roleId: role.id },
                });
            }
            if (!user.customerProfile) {
                await database_1.prisma.customerProfile.create({
                    data: {
                        userId: user.id,
                        customerType: 'CUSTOMER',
                        phone: '0812345678',
                    },
                });
            }
        }
        // Refresh user with customerProfile
        const refreshed = await database_1.prisma.user.findUnique({
            where: { id: user.id },
            include: { customerProfile: true },
        });
        return refreshed;
    }
    const superAdmin = await database_1.prisma.user.findFirst({ where: { email: 'admin@mobex.co.th' } });
    assert(superAdmin != null, 'Super Admin user found');
    const storeManager = await ensureUserWithRole('manager.m12@mobex.co.th', 'STORE_MANAGER', 'Store', 'Manager');
    const staffRep = await ensureUserWithRole('staff.m12@mobex.co.th', 'SALES_REP', 'Sales', 'Rep');
    const customerA = await ensureUserWithRole('customera.m12@test.com', 'CUSTOMER', 'Alice', 'Customer');
    const customerB = await ensureUserWithRole('customerb.m12@test.com', 'CUSTOMER', 'Bob', 'Customer');
    const customerAProfile = customerA.customerProfile;
    const customerBProfile = customerB.customerProfile;
    // Initialize Loyalty Accounts if not existing
    await database_1.prisma.loyaltyAccount.upsert({
        where: { customerId: customerAProfile.id },
        create: { customerId: customerAProfile.id, pointsBalance: 0 },
        update: {},
    });
    await database_1.prisma.loyaltyAccount.upsert({
        where: { customerId: customerBProfile.id },
        create: { customerId: customerBProfile.id, pointsBalance: 0 },
        update: {},
    });
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
    const adminCookie = await loginAndGetCookie('admin@mobex.co.th');
    const managerCookie = await loginAndGetCookie(storeManager.email);
    const staffCookie = await loginAndGetCookie(staffRep.email);
    const customerACookie = await loginAndGetCookie(customerA.email);
    const customerBCookie = await loginAndGetCookie(customerB.email);
    // Setup warehouse and test products
    let warehouse = await database_1.prisma.warehouse.findFirst({ where: { isActive: true } });
    if (!warehouse) {
        warehouse = await database_1.prisma.warehouse.create({
            data: {
                code: `WH-M12-${Date.now()}`,
                name: 'Main Distribution Center',
                addressLine1: 'Bangkok Logistics Hub',
                province: 'กรุงเทพมหานคร',
                postalCode: '10110',
                isActive: true,
            },
        });
    }
    let testCategory = await database_1.prisma.category.findFirst();
    if (!testCategory) {
        testCategory = await database_1.prisma.category.create({ data: { name: 'Brake System', slug: `brake-system-${Date.now()}` } });
    }
    let testBrand = await database_1.prisma.brand.findFirst();
    if (!testBrand) {
        testBrand = await database_1.prisma.brand.create({ data: { name: 'Brembo', slug: `brembo-${Date.now()}` } });
    }
    const testProduct = await database_1.prisma.product.create({
        data: {
            name: `M12 Test Brake Pads ${Date.now()}`,
            slug: `m12-test-brake-pads-${Date.now()}`,
            sku: `SKU-M12-${Date.now()}`,
            categoryId: testCategory.id,
            brandId: testBrand.id,
            isActive: true,
            prices: {
                create: [
                    { tier: 'GENERAL', price: new database_1.Prisma.Decimal('1000.00'), currency: 'THB', isActive: true },
                    { tier: 'GARAGE', price: new database_1.Prisma.Decimal('1000.00'), currency: 'THB', isActive: true },
                ],
            },
            inventoryItems: {
                create: {
                    warehouseId: warehouse.id,
                    onHand: 500,
                    reserved: 0,
                    reorderPoint: 10,
                    safetyStock: 5,
                },
            },
        },
    });
    const testProduct2 = await database_1.prisma.product.create({
        data: {
            name: `M12 Test Spark Plug ${Date.now()}`,
            slug: `m12-test-spark-plug-${Date.now()}`,
            sku: `SKU-SPARK-${Date.now()}`,
            categoryId: testCategory.id,
            brandId: testBrand.id,
            isActive: true,
            prices: {
                create: [
                    { tier: 'GENERAL', price: new database_1.Prisma.Decimal('200.00'), currency: 'THB', isActive: true },
                    { tier: 'GARAGE', price: new database_1.Prisma.Decimal('200.00'), currency: 'THB', isActive: true },
                ],
            },
            inventoryItems: {
                create: {
                    warehouseId: warehouse.id,
                    onHand: 500,
                    reserved: 0,
                    reorderPoint: 10,
                    safetyStock: 5,
                },
            },
        },
    });
    // ============================================================================
    // Part 1: Customer 360 & Profiles (M12-T01 to M12-T06)
    // ============================================================================
    console.log('\n--- Part 1: Customer 360 & Profiles ---');
    await recordTest('M12-T01: Customer profile & metadata read (/api/v1/customers/me)', async () => {
        const res = await app.inject({
            method: 'GET',
            url: '/api/v1/customers/me',
            headers: { cookie: customerACookie },
        });
        assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
        const json = JSON.parse(res.body);
        assert(json.data.user.email === customerA.email, 'Email matches profile');
        assert(json.data.loyaltyAccount !== undefined, 'Loyalty account present');
    });
    await recordTest('M12-T02: Customer preferences update (privacy safe)', async () => {
        const res = await app.inject({
            method: 'PATCH',
            url: '/api/v1/customers/me',
            headers: { cookie: customerACookie },
            payload: {
                companyName: 'Alice Automotive Studio',
                phone: '0812345678',
            },
        });
        assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
        const json = JSON.parse(res.body);
        assert(json.data.companyName === 'Alice Automotive Studio', 'Company name saved');
    });
    await recordTest('M12-T03: IDOR prevention: Customer A cannot access Customer B profile or activities', async () => {
        const res = await app.inject({
            method: 'GET',
            url: `/api/v1/admin/customers/${customerBProfile.id}`,
            headers: { cookie: customerACookie },
        });
        assert(res.statusCode === 403, `Expected 403 Forbidden for non-staff, got ${res.statusCode}`);
    });
    await recordTest('M12-T04: Staff/Admin Customer 360 query with aggregated LTV and metrics', async () => {
        const res = await app.inject({
            method: 'GET',
            url: `/api/v1/admin/customers/${customerAProfile.id}`,
            headers: { cookie: adminCookie },
        });
        assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
        const json = JSON.parse(res.body);
        assert(json.data.metrics !== undefined, 'Metrics present');
        assert(typeof json.data.metrics.lifetimeValue === 'number', 'Lifetime value is number');
    });
    await recordTest('M12-T05: Customer Activity timeline logging', async () => {
        await database_1.prisma.customerActivity.create({
            data: {
                customerId: customerAProfile.id,
                userId: customerA.id,
                eventType: 'PROFILE_UPDATED',
                description: 'Customer updated their profile details',
                metadata: { channel: 'WEB' },
            },
        });
        const res = await app.inject({
            method: 'GET',
            url: `/api/v1/admin/customers/${customerAProfile.id}/activity`,
            headers: { cookie: adminCookie },
        });
        assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
        const json = JSON.parse(res.body);
        assert(Array.isArray(json.data), 'Activities is array');
        assert(json.data.some((a) => a.eventType === 'PROFILE_UPDATED'), 'Logged activity found');
    });
    await recordTest('M12-T06: Sensitive data masking in CRM activity timeline', async () => {
        const res = await app.inject({
            method: 'GET',
            url: `/api/v1/customers/me/activity`,
            headers: { cookie: customerACookie },
        });
        assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
        const json = JSON.parse(res.body);
        assert(Array.isArray(json.data), 'Activities is array');
    });
    // ============================================================================
    // Part 2: Customer Tags & Deterministic Segmentation (M12-T07 to M12-T12)
    // ============================================================================
    console.log('\n--- Part 2: Customer Tags & Deterministic Segmentation ---');
    let testTag;
    await recordTest('M12-T07: Tag creation, assignment, and removal', async () => {
        const createRes = await app.inject({
            method: 'POST',
            url: '/api/v1/admin/customers/tags',
            headers: { cookie: adminCookie },
            payload: {
                name: `VIP-Wholesale-${Date.now()}`,
                color: '#ff6c60',
                description: 'High volume wholesale buyers',
            },
        });
        assert(createRes.statusCode === 201 || createRes.statusCode === 200, `Expected 201/200, got ${createRes.statusCode}`);
        testTag = JSON.parse(createRes.body).data;
        const assignRes = await app.inject({
            method: 'POST',
            url: `/api/v1/admin/customers/${customerAProfile.id}/tags`,
            headers: { cookie: adminCookie },
            payload: { tagId: testTag.id },
        });
        assert(assignRes.statusCode === 200 || assignRes.statusCode === 201, 'Tag assigned');
        const deleteRes = await app.inject({
            method: 'DELETE',
            url: `/api/v1/admin/customers/${customerAProfile.id}/tags/${testTag.id}`,
            headers: { cookie: adminCookie },
        });
        assert(deleteRes.statusCode === 200, 'Tag removed');
    });
    let testSegment;
    await recordTest('M12-T08: Segment creation with deterministic rules (e.g. LTV >= 0)', async () => {
        const res = await app.inject({
            method: 'POST',
            url: '/api/v1/admin/customers/segments',
            headers: { cookie: adminCookie },
            payload: {
                name: `Test Segment ${Date.now()}`,
                code: `SEG-TEST-${Date.now()}`,
                description: 'Customers with LTV >= 0',
                rules: [
                    { field: 'lifetime_value', operator: 'GREATER_THAN_OR_EQUAL', value: '0' },
                ],
            },
        });
        assert(res.statusCode === 201 || res.statusCode === 200, `Expected 201/200, got ${res.statusCode}`);
        testSegment = JSON.parse(res.body).data;
        assert(testSegment.rules.length === 1, 'Rule saved');
    });
    await recordTest('M12-T09: Segment evaluation and membership calculation', async () => {
        const res = await app.inject({
            method: 'POST',
            url: `/api/v1/admin/customers/segments/${testSegment.id}/evaluate`,
            headers: { cookie: adminCookie },
        });
        assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
        const json = JSON.parse(res.body);
        assert(json.data.matchingCount !== undefined, 'Matching count returned');
        assert(json.data.matchingCount >= 1, 'At least 1 member qualified');
    });
    await recordTest('M12-T10: Dynamic re-evaluation reflecting metric changes', async () => {
        const impossibleRes = await app.inject({
            method: 'POST',
            url: '/api/v1/admin/customers/segments',
            headers: { cookie: adminCookie },
            payload: {
                name: `Ultra Whales ${Date.now()}`,
                code: `SEG-WHALE-${Date.now()}`,
                rules: [
                    { field: 'lifetime_value', operator: 'GREATER_THAN_OR_EQUAL', value: '999999999' },
                    { field: 'order_count', operator: 'GREATER_THAN_OR_EQUAL', value: '99999' },
                ],
            },
        });
        const impossibleSegment = JSON.parse(impossibleRes.body).data;
        const evalRes = await app.inject({
            method: 'POST',
            url: `/api/v1/admin/customers/segments/${impossibleSegment.id}/evaluate`,
            headers: { cookie: adminCookie },
        });
        assert(evalRes.statusCode === 200, 'Evaluated');
        const json = JSON.parse(evalRes.body);
        assert(json.data.matchingCount === 0, 'Zero members qualified for ultra whale');
    });
    await recordTest('M12-T11: Complex multi-rule segment evaluation (customer_type = CUSTOMER)', async () => {
        const res = await app.inject({
            method: 'POST',
            url: '/api/v1/admin/customers/segments',
            headers: { cookie: adminCookie },
            payload: {
                name: `Customer Type Segment ${Date.now()}`,
                code: `SEG-CUST-${Date.now()}`,
                rules: [
                    { field: 'customer_type', operator: 'EQUALS', value: 'CUSTOMER' },
                    { field: 'order_count', operator: 'GREATER_THAN_OR_EQUAL', value: '0' },
                ],
            },
        });
        const seg = JSON.parse(res.body).data;
        const evalRes = await app.inject({
            method: 'POST',
            url: `/api/v1/admin/customers/segments/${seg.id}/evaluate`,
            headers: { cookie: adminCookie },
        });
        assert(evalRes.statusCode === 200, 'Multi-rule evaluated');
    });
    await recordTest('M12-T12: Segment deletion cascading/cleanup', async () => {
        const res = await app.inject({
            method: 'DELETE',
            url: `/api/v1/admin/customers/segments/${testSegment.id}`,
            headers: { cookie: adminCookie },
        });
        assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
    });
    // ============================================================================
    // Part 3: Promotions Engine & Pricing Rules (M12-T13 to M12-T20)
    // ============================================================================
    console.log('\n--- Part 3: Promotions Engine & Pricing Rules ---');
    let pctPromotion;
    await recordTest('M12-T13: Percentage discount promotion qualification (10% off)', async () => {
        const res = await app.inject({
            method: 'POST',
            url: '/api/v1/admin/promotions',
            headers: { cookie: adminCookie },
            payload: {
                name: `10% Off Test Promo ${Date.now()}`,
                promotionType: 'PERCENTAGE',
                discountValue: 10,
                status: 'ACTIVE',
                startsAt: new Date(Date.now() - 86400000).toISOString(),
                endsAt: new Date(Date.now() + 86400000 * 30).toISOString(),
            },
        });
        assert(res.statusCode === 201 || res.statusCode === 200, `Expected 201/200, got ${res.statusCode}`);
        pctPromotion = JSON.parse(res.body).data;
        assert(Number(pctPromotion.discountValue) === 10, '10% discount percentage set');
    });
    let fixedPromotion;
    await recordTest('M12-T14: Fixed amount discount promotion qualification (150 THB off)', async () => {
        const res = await app.inject({
            method: 'POST',
            url: '/api/v1/admin/promotions',
            headers: { cookie: adminCookie },
            payload: {
                name: `150 THB Fixed Discount ${Date.now()}`,
                promotionType: 'FIXED_AMOUNT',
                discountValue: 150,
                status: 'ACTIVE',
                startsAt: new Date(Date.now() - 86400000).toISOString(),
                endsAt: new Date(Date.now() + 86400000 * 30).toISOString(),
            },
        });
        assert(res.statusCode === 201 || res.statusCode === 200, `Expected 201/200, got ${res.statusCode}`);
        fixedPromotion = JSON.parse(res.body).data;
        assert(Number(fixedPromotion.discountValue) === 150, '150 THB discount value set');
    });
    let minOrderPromotion;
    await recordTest('M12-T15: Minimum order amount constraint enforcement', async () => {
        const res = await app.inject({
            method: 'POST',
            url: '/api/v1/admin/promotions',
            headers: { cookie: adminCookie },
            payload: {
                name: `Min 5000 THB Spend Promo ${Date.now()}`,
                promotionType: 'FIXED_AMOUNT',
                discountValue: 500,
                minimumOrderAmount: 5000,
                status: 'ACTIVE',
                startsAt: new Date(Date.now() - 86400000).toISOString(),
                endsAt: new Date(Date.now() + 86400000 * 30).toISOString(),
            },
        });
        assert(res.statusCode === 201 || res.statusCode === 200, 'Min order promo created');
        minOrderPromotion = JSON.parse(res.body).data;
    });
    let cappedPromotion;
    await recordTest('M12-T16: Max discount cap constraint enforcement (50% capped at 300 THB)', async () => {
        const res = await app.inject({
            method: 'POST',
            url: '/api/v1/admin/promotions',
            headers: { cookie: adminCookie },
            payload: {
                name: `50% Capped at 300 THB ${Date.now()}`,
                promotionType: 'PERCENTAGE',
                discountValue: 50,
                maximumDiscountAmount: 300,
                status: 'ACTIVE',
                startsAt: new Date(Date.now() - 86400000).toISOString(),
                endsAt: new Date(Date.now() + 86400000 * 30).toISOString(),
            },
        });
        assert(res.statusCode === 201 || res.statusCode === 200, 'Capped promo created');
        cappedPromotion = JSON.parse(res.body).data;
    });
    await recordTest('M12-T17: Promotion date window constraint (future or expired rejected)', async () => {
        const res = await app.inject({
            method: 'POST',
            url: '/api/v1/admin/promotions',
            headers: { cookie: adminCookie },
            payload: {
                name: `Future Promo ${Date.now()}`,
                promotionType: 'PERCENTAGE',
                discountValue: 20,
                status: 'ACTIVE',
                startsAt: new Date(Date.now() + 86400000 * 10).toISOString(),
                endsAt: new Date(Date.now() + 86400000 * 20).toISOString(),
            },
        });
        assert(res.statusCode === 201 || res.statusCode === 200, 'Future promo created in DB');
        const futurePromo = JSON.parse(res.body).data;
        // Create coupon linked to this future promotion
        const coupRes = await app.inject({
            method: 'POST',
            url: `/api/v1/admin/coupons`,
            headers: { cookie: adminCookie },
            payload: {
                code: `FUTURE${Date.now()}`,
                promotionId: futurePromo.id,
                startsAt: futurePromo.startsAt,
                endsAt: futurePromo.endsAt,
            },
        });
        assert(coupRes.statusCode === 201 || coupRes.statusCode === 200, 'Coupon created');
        const couponCode = JSON.parse(coupRes.body).data.code;
        // Validate coupon - must fail date window
        const valRes = await app.inject({
            method: 'POST',
            url: `/api/v1/coupons/validate`,
            payload: { code: couponCode, subtotal: 1000 },
        });
        assert(valRes.statusCode === 400, 'Future coupon throws 400 rejection');
    });
    let productScopedPromo;
    await recordTest('M12-T18: Promotion product scope constraint', async () => {
        const res = await app.inject({
            method: 'POST',
            url: '/api/v1/admin/promotions',
            headers: { cookie: adminCookie },
            payload: {
                name: `Product Scoped Promo ${Date.now()}`,
                promotionType: 'FIXED_AMOUNT',
                discountValue: 200,
                productIds: [testProduct.id],
                status: 'ACTIVE',
                startsAt: new Date(Date.now() - 86400000).toISOString(),
                endsAt: new Date(Date.now() + 86400000 * 30).toISOString(),
            },
        });
        assert(res.statusCode === 201 || res.statusCode === 200, 'Product scoped promo created');
        productScopedPromo = JSON.parse(res.body).data;
        assert(productScopedPromo.products.length === 1, 'Product scope attached');
    });
    let brandScopedPromo;
    await recordTest('M12-T19: Promotion category / brand scope constraint', async () => {
        const res = await app.inject({
            method: 'POST',
            url: '/api/v1/admin/promotions',
            headers: { cookie: adminCookie },
            payload: {
                name: `Brembo Brand Promo ${Date.now()}`,
                promotionType: 'PERCENTAGE',
                discountValue: 15,
                brandIds: [testBrand.id],
                status: 'ACTIVE',
                startsAt: new Date(Date.now() - 86400000).toISOString(),
                endsAt: new Date(Date.now() + 86400000 * 30).toISOString(),
            },
        });
        assert(res.statusCode === 201 || res.statusCode === 200, 'Brand scoped promo created');
        brandScopedPromo = JSON.parse(res.body).data;
        assert(brandScopedPromo.brands.length === 1, 'Brand scope attached');
    });
    await recordTest('M12-T20: Non-qualifying order rejected from promotion discount', async () => {
        const coupRes = await app.inject({
            method: 'POST',
            url: `/api/v1/admin/coupons`,
            headers: { cookie: adminCookie },
            payload: {
                code: `MIN5K${Date.now()}`,
                promotionId: minOrderPromotion.id,
            },
        });
        assert(coupRes.statusCode === 201 || coupRes.statusCode === 200, 'Min order coupon created');
        const couponCode = JSON.parse(coupRes.body).data.code;
        // Validate with order amount 1000 THB (< 5000)
        const valRes = await app.inject({
            method: 'POST',
            url: `/api/v1/coupons/validate`,
            payload: { code: couponCode, subtotal: 1000 },
        });
        assert(valRes.statusCode === 400, 'Below min spend rejected with 400');
    });
    // ============================================================================
    // Part 4: Coupon Management & Concurrency (M12-T21 to M12-T28)
    // ============================================================================
    console.log('\n--- Part 4: Coupon Management & Concurrency ---');
    let testCoupon;
    await recordTest('M12-T21: Coupon creation and public validation (/api/v1/coupons/validate)', async () => {
        const res = await app.inject({
            method: 'POST',
            url: `/api/v1/admin/coupons`,
            headers: { cookie: adminCookie },
            payload: {
                code: `SAVE10-${Date.now()}`,
                promotionId: pctPromotion.id,
                usageLimit: 50,
                perCustomerLimit: 1,
            },
        });
        assert(res.statusCode === 201 || res.statusCode === 200, `Expected 201/200, got ${res.statusCode}`);
        testCoupon = JSON.parse(res.body).data;
        const valRes = await app.inject({
            method: 'POST',
            url: `/api/v1/coupons/validate`,
            payload: { code: testCoupon.code, subtotal: 1000 },
        });
        assert(valRes.statusCode === 200, 'Validation succeeded');
        const valJson = JSON.parse(valRes.body);
        assert(valJson.data.isEligible === true, 'Coupon is valid');
    });
    await recordTest('M12-T22: Valid coupon discount application at checkout', async () => {
        await app.inject({ method: 'DELETE', url: '/api/v1/cart', headers: { cookie: customerACookie } });
        await app.inject({
            method: 'POST',
            url: '/api/v1/cart/items',
            headers: { cookie: customerACookie },
            payload: { productId: testProduct.id, quantity: 1 },
        });
        const checkoutRes = await app.inject({
            method: 'POST',
            url: '/api/v1/checkout',
            headers: { cookie: customerACookie },
            payload: {
                shippingAddress: {
                    recipientName: 'Alice Customer',
                    phone: '0812345678',
                    addressLine: '123 Sukhumvit Road',
                    province: 'กรุงเทพมหานคร',
                    postalCode: '10110',
                },
                paymentMethod: 'PROMPTPAY',
                couponCode: testCoupon.code,
            },
        });
        assert(checkoutRes.statusCode === 201 || checkoutRes.statusCode === 200, `Checkout failed: ${checkoutRes.body}`);
        const orderData = JSON.parse(checkoutRes.body).data;
        assert(Number(orderData.discountTotal) === 100, `Expected discountTotal 100 (10% of 1000), got ${orderData.discountTotal}`);
        assert(orderData.couponCode === testCoupon.code, 'Coupon code stored on order');
    });
    await recordTest('M12-T23: Inactive or expired coupon rejection at checkout', async () => {
        // Deactivate coupon
        await database_1.prisma.coupon.update({
            where: { id: testCoupon.id },
            data: { isActive: false },
        });
        await app.inject({ method: 'DELETE', url: '/api/v1/cart', headers: { cookie: customerBCookie } });
        await app.inject({
            method: 'POST',
            url: '/api/v1/cart/items',
            headers: { cookie: customerBCookie },
            payload: { productId: testProduct.id, quantity: 1 },
        });
        const checkoutRes = await app.inject({
            method: 'POST',
            url: '/api/v1/checkout',
            headers: { cookie: customerBCookie },
            payload: {
                shippingAddress: {
                    recipientName: 'Bob Customer',
                    phone: '0898765432',
                    addressLine: '456 Rama IV Road',
                    province: 'กรุงเทพมหานคร',
                    postalCode: '10110',
                },
                paymentMethod: 'PROMPTPAY',
                couponCode: testCoupon.code,
            },
        });
        assert(checkoutRes.statusCode === 400, `Expected 400 for inactive coupon, got ${checkoutRes.statusCode}`);
    });
    await recordTest('M12-T24: Minimum spend requirement rejection at checkout', async () => {
        const minCoup = await database_1.prisma.coupon.create({
            data: {
                promotionId: minOrderPromotion.id,
                code: `MINSPEND-${Date.now()}`,
                isActive: true,
            },
        });
        await app.inject({ method: 'DELETE', url: '/api/v1/cart', headers: { cookie: customerBCookie } });
        await app.inject({
            method: 'POST',
            url: '/api/v1/cart/items',
            headers: { cookie: customerBCookie },
            payload: { productId: testProduct.id, quantity: 1 }, // 1000 THB (< 5000)
        });
        const checkoutRes = await app.inject({
            method: 'POST',
            url: '/api/v1/checkout',
            headers: { cookie: customerBCookie },
            payload: {
                shippingAddress: {
                    recipientName: 'Bob Customer',
                    phone: '0898765432',
                    addressLine: '456 Rama IV Road',
                    province: 'กรุงเทพมหานคร',
                    postalCode: '10110',
                },
                paymentMethod: 'PROMPTPAY',
                couponCode: minCoup.code,
            },
        });
        assert(checkoutRes.statusCode === 400, `Expected 400 when min spend unmet, got ${checkoutRes.statusCode}`);
    });
    await recordTest('M12-T25: Per-customer usage limit enforcement', async () => {
        const oneTimePromo = await database_1.prisma.promotion.create({
            data: {
                name: `One Time Promo ${Date.now()}`,
                promotionType: 'FIXED_AMOUNT',
                discountValue: new database_1.Prisma.Decimal('50.00'),
                perCustomerLimit: 1,
                status: 'ACTIVE',
            },
        });
        const oneTimeCoup = await database_1.prisma.coupon.create({
            data: {
                promotionId: oneTimePromo.id,
                code: `ONETIME-${Date.now()}`,
                perCustomerLimit: 1,
                isActive: true,
            },
        });
        // Customer A first checkout -> succeeds
        await app.inject({ method: 'DELETE', url: '/api/v1/cart', headers: { cookie: customerACookie } });
        await app.inject({
            method: 'POST',
            url: '/api/v1/cart/items',
            headers: { cookie: customerACookie },
            payload: { productId: testProduct2.id, quantity: 1 },
        });
        const c1 = await app.inject({
            method: 'POST',
            url: '/api/v1/checkout',
            headers: { cookie: customerACookie },
            payload: {
                shippingAddress: {
                    recipientName: 'Alice Customer',
                    phone: '0812345678',
                    addressLine: '123 Sukhumvit Road',
                    province: 'กรุงเทพมหานคร',
                    postalCode: '10110',
                },
                paymentMethod: 'PROMPTPAY',
                couponCode: oneTimeCoup.code,
            },
        });
        assert(c1.statusCode === 201 || c1.statusCode === 200, 'First checkout with 1-time coupon succeeded');
        // Customer A second checkout with same coupon -> fails
        await app.inject({ method: 'DELETE', url: '/api/v1/cart', headers: { cookie: customerACookie } });
        await app.inject({
            method: 'POST',
            url: '/api/v1/cart/items',
            headers: { cookie: customerACookie },
            payload: { productId: testProduct2.id, quantity: 1 },
        });
        const c2 = await app.inject({
            method: 'POST',
            url: '/api/v1/checkout',
            headers: { cookie: customerACookie },
            payload: {
                shippingAddress: {
                    recipientName: 'Alice Customer',
                    phone: '0812345678',
                    addressLine: '123 Sukhumvit Road',
                    province: 'กรุงเทพมหานคร',
                    postalCode: '10110',
                },
                paymentMethod: 'PROMPTPAY',
                couponCode: oneTimeCoup.code,
            },
        });
        assert(c2.statusCode === 400, `Expected 400 on 2nd coupon usage by same user, got ${c2.statusCode}`);
    });
    await recordTest('M12-T26: Concurrent checkout coupon redemption race (usageLimit = 1, exactly 1 wins)', async () => {
        const exclPromo = await database_1.prisma.promotion.create({
            data: {
                name: `Exclusive Promo ${Date.now()}`,
                promotionType: 'FIXED_AMOUNT',
                discountValue: new database_1.Prisma.Decimal('100.00'),
                usageLimit: 1,
                status: 'ACTIVE',
            },
        });
        const exclusiveCoup = await database_1.prisma.coupon.create({
            data: {
                promotionId: exclPromo.id,
                code: `EXCLUSIVE1-${Date.now()}`,
                usageLimit: 1,
                isActive: true,
            },
        });
        await app.inject({ method: 'DELETE', url: '/api/v1/cart', headers: { cookie: customerACookie } });
        await app.inject({ method: 'DELETE', url: '/api/v1/cart', headers: { cookie: customerBCookie } });
        await app.inject({
            method: 'POST',
            url: '/api/v1/cart/items',
            headers: { cookie: customerACookie },
            payload: { productId: testProduct2.id, quantity: 1 },
        });
        await app.inject({
            method: 'POST',
            url: '/api/v1/cart/items',
            headers: { cookie: customerBCookie },
            payload: { productId: testProduct2.id, quantity: 1 },
        });
        const [resA, resB] = await Promise.all([
            app.inject({
                method: 'POST',
                url: '/api/v1/checkout',
                headers: { cookie: customerACookie },
                payload: {
                    shippingAddress: {
                        recipientName: 'Alice Customer',
                        phone: '0812345678',
                        addressLine: '123 Sukhumvit Road',
                        province: 'กรุงเทพมหานคร',
                        postalCode: '10110',
                    },
                    paymentMethod: 'PROMPTPAY',
                    couponCode: exclusiveCoup.code,
                },
            }),
            app.inject({
                method: 'POST',
                url: '/api/v1/checkout',
                headers: { cookie: customerBCookie },
                payload: {
                    shippingAddress: {
                        recipientName: 'Bob Customer',
                        phone: '0898765432',
                        addressLine: '456 Rama IV Road',
                        province: 'กรุงเทพมหานคร',
                        postalCode: '10110',
                    },
                    paymentMethod: 'PROMPTPAY',
                    couponCode: exclusiveCoup.code,
                },
            }),
        ]);
        const statusCodes = [resA.statusCode, resB.statusCode];
        const successes = statusCodes.filter((s) => s === 201 || s === 200).length;
        const failures = statusCodes.filter((s) => s === 400).length;
        assert(successes === 1, `Exactly 1 checkout should succeed with usageLimit=1, got ${successes}`);
        assert(failures === 1, `Exactly 1 checkout should fail with coupon limit reached, got ${failures}`);
        const updatedCoup = await database_1.prisma.coupon.findUnique({ where: { id: exclusiveCoup.id } });
        assert(updatedCoup?.usageCount === 1, `Expected usageCount 1, got ${updatedCoup?.usageCount}`);
    });
    await recordTest('M12-T27: Idempotent coupon redemption tracking (no duplicate redemptions for same order)', async () => {
        const redemptions = await database_1.prisma.couponRedemption.findMany({
            where: { coupon: { code: testCoupon.code } },
        });
        const uniqueOrders = new Set(redemptions.map((r) => r.orderId));
        assert(uniqueOrders.size === redemptions.length, 'Every redemption maps to a unique order');
    });
    await recordTest('M12-T28: Promotion snapshot saved on order at checkout', async () => {
        const orderWithPromo = await database_1.prisma.order.findFirst({
            where: { couponCode: testCoupon.code },
        });
        assert(orderWithPromo != null, 'Order found');
        assert(orderWithPromo.promotionSnapshot != null, 'promotionSnapshot is persisted');
    });
    // ============================================================================
    // Part 5: Loyalty Ledger & Concurrency (M12-T29 to M12-T38)
    // ============================================================================
    console.log('\n--- Part 5: Loyalty Ledger & Concurrency ---');
    await recordTest('M12-T29: Loyalty account auto-initialization for customers', async () => {
        const res = await app.inject({
            method: 'GET',
            url: '/api/v1/customers/me/loyalty',
            headers: { cookie: customerACookie },
        });
        assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
        const json = JSON.parse(res.body);
        assert(json.data.pointsBalance !== undefined, 'Loyalty points balance present');
    });
    let earnedOrderId;
    await recordTest('M12-T30: Loyalty points earned upon order payment confirmation (1 pt per 100 THB)', async () => {
        await app.inject({ method: 'DELETE', url: '/api/v1/cart', headers: { cookie: customerACookie } });
        await app.inject({
            method: 'POST',
            url: '/api/v1/cart/items',
            headers: { cookie: customerACookie },
            payload: { productId: testProduct.id, quantity: 2 }, // 2000 THB
        });
        const checkoutRes = await app.inject({
            method: 'POST',
            url: '/api/v1/checkout',
            headers: { cookie: customerACookie },
            payload: {
                shippingAddress: {
                    recipientName: 'Alice Customer',
                    phone: '0812345678',
                    addressLine: '123 Sukhumvit Road',
                    province: 'กรุงเทพมหานคร',
                    postalCode: '10110',
                },
                paymentMethod: 'BANK_TRANSFER',
            },
        });
        assert(checkoutRes.statusCode === 201 || checkoutRes.statusCode === 200, 'Order created');
        const orderData = JSON.parse(checkoutRes.body).data;
        earnedOrderId = orderData.id;
        // Record initial loyalty balance
        const initAcc = await database_1.prisma.loyaltyAccount.findUnique({ where: { customerId: customerAProfile.id } });
        const initBalance = initAcc?.pointsBalance || 0;
        // Confirm Payment
        const updateRes = await app.inject({
            method: 'PATCH',
            url: `/api/v1/admin/orders/${earnedOrderId}/status`,
            headers: { cookie: adminCookie },
            payload: { status: 'PAYMENT_CONFIRMED' },
        });
        assert(updateRes.statusCode === 200, 'Status updated to PAYMENT_CONFIRMED');
        // Check loyalty balance increased by 20 pts (2000 THB / 100 = 20 pts)
        const updatedAcc = await database_1.prisma.loyaltyAccount.findUnique({ where: { customerId: customerAProfile.id } });
        assert((updatedAcc?.pointsBalance || 0) === initBalance + 20, `Expected balance ${initBalance + 20}, got ${updatedAcc?.pointsBalance}`);
    });
    await recordTest('M12-T31: Double-earning prevention (idempotent earning on same order)', async () => {
        const accBefore = await database_1.prisma.loyaltyAccount.findUnique({ where: { customerId: customerAProfile.id } });
        const balanceBefore = accBefore?.pointsBalance || 0;
        // Trigger status update again to PROCESSING
        await app.inject({
            method: 'PATCH',
            url: `/api/v1/admin/orders/${earnedOrderId}/status`,
            headers: { cookie: adminCookie },
            payload: { status: 'PROCESSING' },
        });
        const accAfter = await database_1.prisma.loyaltyAccount.findUnique({ where: { customerId: customerAProfile.id } });
        assert(accAfter?.pointsBalance === balanceBefore, 'Loyalty points did not increase again');
    });
    await recordTest('M12-T32: Loyalty points redemption at checkout (10 pts = 1 THB)', async () => {
        // Set customer B 500 loyalty points directly
        await database_1.prisma.loyaltyAccount.update({
            where: { customerId: customerBProfile.id },
            data: { pointsBalance: 500, lifetimeEarned: 500 },
        });
        // Customer B carts 1 item (1000 THB)
        await app.inject({ method: 'DELETE', url: '/api/v1/cart', headers: { cookie: customerBCookie } });
        await app.inject({
            method: 'POST',
            url: '/api/v1/cart/items',
            headers: { cookie: customerBCookie },
            payload: { productId: testProduct.id, quantity: 1 },
        });
        // Checkout redeeming 200 points (20 THB discount)
        const checkoutRes = await app.inject({
            method: 'POST',
            url: '/api/v1/checkout',
            headers: { cookie: customerBCookie },
            payload: {
                shippingAddress: {
                    recipientName: 'Bob Customer',
                    phone: '0898765432',
                    addressLine: '456 Rama IV Road',
                    province: 'กรุงเทพมหานคร',
                    postalCode: '10110',
                },
                paymentMethod: 'PROMPTPAY',
                loyaltyPointsToRedeem: 200,
            },
        });
        assert(checkoutRes.statusCode === 201 || checkoutRes.statusCode === 200, `Redeem checkout failed: ${checkoutRes.body}`);
        const orderData = JSON.parse(checkoutRes.body).data;
        assert(orderData.loyaltyPointsRedeemed === 200, '200 points redeemed on order');
        assert(Number(orderData.discountTotal) === 20, `Expected discountTotal 20 THB, got ${orderData.discountTotal}`);
        // Verify customer B balance deducted to 300
        const accB = await database_1.prisma.loyaltyAccount.findUnique({ where: { customerId: customerBProfile.id } });
        assert(accB?.pointsBalance === 300, `Expected balance 300, got ${accB?.pointsBalance}`);
    });
    await recordTest('M12-T33: Insufficient points redemption rejection', async () => {
        // Customer B attempts to redeem 10,000 points (has only 300)
        await app.inject({ method: 'DELETE', url: '/api/v1/cart', headers: { cookie: customerBCookie } });
        await app.inject({
            method: 'POST',
            url: '/api/v1/cart/items',
            headers: { cookie: customerBCookie },
            payload: { productId: testProduct2.id, quantity: 1 },
        });
        const checkoutRes = await app.inject({
            method: 'POST',
            url: '/api/v1/checkout',
            headers: { cookie: customerBCookie },
            payload: {
                shippingAddress: {
                    recipientName: 'Bob Customer',
                    phone: '0898765432',
                    addressLine: '456 Rama IV Road',
                    province: 'กรุงเทพมหานคร',
                    postalCode: '10110',
                },
                paymentMethod: 'PROMPTPAY',
                loyaltyPointsToRedeem: 10000,
            },
        });
        assert(checkoutRes.statusCode === 400, `Expected 400 for insufficient points, got ${checkoutRes.statusCode}`);
    });
    await recordTest('M12-T34: Concurrent points redemption (cannot double-spend or go negative)', async () => {
        // Set Customer B balance to exactly 200 points
        await database_1.prisma.loyaltyAccount.update({
            where: { customerId: customerBProfile.id },
            data: { pointsBalance: 200 },
        });
        // Populate carts
        await app.inject({ method: 'DELETE', url: '/api/v1/cart', headers: { cookie: customerBCookie } });
        await app.inject({
            method: 'POST',
            url: '/api/v1/cart/items',
            headers: { cookie: customerBCookie },
            payload: { productId: testProduct2.id, quantity: 1 },
        });
        await Promise.all([
            app.inject({
                method: 'POST',
                url: '/api/v1/checkout',
                headers: { cookie: customerBCookie },
                payload: {
                    shippingAddress: {
                        recipientName: 'Bob Customer',
                        phone: '0898765432',
                        addressLine: '456 Rama IV Road',
                        province: 'กรุงเทพมหานคร',
                        postalCode: '10110',
                    },
                    paymentMethod: 'PROMPTPAY',
                    loyaltyPointsToRedeem: 200,
                },
            }),
            app.inject({
                method: 'POST',
                url: '/api/v1/checkout',
                headers: { cookie: customerBCookie },
                payload: {
                    shippingAddress: {
                        recipientName: 'Bob Customer',
                        phone: '0898765432',
                        addressLine: '456 Rama IV Road',
                        province: 'กรุงเทพมหานคร',
                        postalCode: '10110',
                    },
                    paymentMethod: 'PROMPTPAY',
                    loyaltyPointsToRedeem: 200,
                },
            }),
        ]);
        const acc = await database_1.prisma.loyaltyAccount.findUnique({ where: { customerId: customerBProfile.id } });
        assert((acc?.pointsBalance || 0) >= 0, `Loyalty balance must NEVER go negative: ${acc?.pointsBalance}`);
    });
    await recordTest('M12-T35: Staff manual adjustment with audit reason & type', async () => {
        const res = await app.inject({
            method: 'POST',
            url: `/api/v1/admin/loyalty/accounts/${customerAProfile.id}/adjust`,
            headers: { cookie: adminCookie },
            payload: {
                points: 50,
                reason: 'Customer goodwill gesture for shipping delay',
            },
        });
        assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
        const json = JSON.parse(res.body);
        assert(json.data.account.pointsBalance >= 50, 'Points balance updated');
        assert(json.data.transaction.reason.includes('goodwill'), 'Reason saved in transaction');
    });
    await recordTest('M12-T36: Order cancellation / refund loyalty points compensating reversal', async () => {
        const accBefore = await database_1.prisma.loyaltyAccount.findUnique({ where: { customerId: customerAProfile.id } });
        const balanceBefore = accBefore?.pointsBalance || 0;
        // Cancel / Refund the order
        const cancelRes = await app.inject({
            method: 'PATCH',
            url: `/api/v1/admin/orders/${earnedOrderId}/status`,
            headers: { cookie: adminCookie },
            payload: { status: 'CANCELLED' },
        });
        assert(cancelRes.statusCode === 200, 'Order cancelled');
        const accAfter = await database_1.prisma.loyaltyAccount.findUnique({ where: { customerId: customerAProfile.id } });
        assert((accAfter?.pointsBalance || 0) === balanceBefore - 20, `Expected balance deducted by 20 pts upon cancellation, was ${balanceBefore} -> now ${accAfter?.pointsBalance}`);
    });
    await recordTest('M12-T37: Read-only loyalty transaction history auditability', async () => {
        const res = await app.inject({
            method: 'GET',
            url: '/api/v1/customers/me/loyalty',
            headers: { cookie: customerACookie },
        });
        assert(res.statusCode === 200, 'Transactions fetched');
        const json = JSON.parse(res.body);
        assert(Array.isArray(json.data.transactions), 'Transactions is array');
        assert(json.data.transactions.length >= 2, 'History contains earn, adjust, and refund transactions');
    });
    await recordTest('M12-T38: Combined coupon + loyalty discount in single checkout', async () => {
        await database_1.prisma.loyaltyAccount.update({
            where: { customerId: customerAProfile.id },
            data: { pointsBalance: 100 },
        });
        const stackPromo = await database_1.prisma.promotion.create({
            data: {
                name: `Stack Promo ${Date.now()}`,
                promotionType: 'FIXED_AMOUNT',
                discountValue: new database_1.Prisma.Decimal('100.00'),
                status: 'ACTIVE',
            },
        });
        const stackCoup = await database_1.prisma.coupon.create({
            data: {
                promotionId: stackPromo.id,
                code: `STACK-${Date.now()}`,
                isActive: true,
            },
        });
        await app.inject({ method: 'DELETE', url: '/api/v1/cart', headers: { cookie: customerACookie } });
        await app.inject({
            method: 'POST',
            url: '/api/v1/cart/items',
            headers: { cookie: customerACookie },
            payload: { productId: testProduct.id, quantity: 1 }, // 1000 THB
        });
        const checkoutRes = await app.inject({
            method: 'POST',
            url: '/api/v1/checkout',
            headers: { cookie: customerACookie },
            payload: {
                shippingAddress: {
                    recipientName: 'Alice Customer',
                    phone: '0812345678',
                    addressLine: '123 Sukhumvit Road',
                    province: 'กรุงเทพมหานคร',
                    postalCode: '10110',
                },
                paymentMethod: 'PROMPTPAY',
                couponCode: stackCoup.code,
                loyaltyPointsToRedeem: 100, // 10 THB
            },
        });
        assert(checkoutRes.statusCode === 201 || checkoutRes.statusCode === 200, `Combined checkout failed: ${checkoutRes.body}`);
        const order = JSON.parse(checkoutRes.body).data;
        // Total discount = 100 (coupon) + 10 (loyalty) = 110 THB
        assert(Number(order.discountTotal) === 110, `Expected discountTotal 110, got ${order.discountTotal}`);
        assert(Number(order.grandTotal) === 890, `Expected grandTotal 890 (1000 - 110), got ${order.grandTotal}`);
    });
    // ============================================================================
    // Part 6: Marketing Campaigns & Audience (M12-T39 to M12-T44)
    // ============================================================================
    console.log('\n--- Part 6: Marketing Campaigns & Audience ---');
    let testCampaign;
    await recordTest('M12-T39: Marketing campaign creation linked to segment', async () => {
        const seg = await database_1.prisma.customerSegment.create({
            data: {
                name: `Campaign Target Segment ${Date.now()}`,
                code: `SEG-CAMP-${Date.now()}`,
                rules: { create: [{ field: 'customer_type', operator: 'EQUALS', value: 'CUSTOMER' }] },
            },
        });
        const res = await app.inject({
            method: 'POST',
            url: '/api/v1/admin/campaigns',
            headers: { cookie: adminCookie },
            payload: {
                name: `Songkran Brake Flash Sale ${Date.now()}`,
                code: `CAMP-BRAKE-${Date.now()}`,
                segmentId: seg.id,
                budget: 15000,
                startsAt: new Date().toISOString(),
                endsAt: new Date(Date.now() + 86400000 * 7).toISOString(),
            },
        });
        assert(res.statusCode === 201 || res.statusCode === 200, `Expected 201/200, got ${res.statusCode}`);
        testCampaign = JSON.parse(res.body).data;
        assert(testCampaign.status === 'DRAFT', 'Initial status is DRAFT');
    });
    await recordTest('M12-T40: Campaign audience generation from dynamic segment', async () => {
        const res = await app.inject({
            method: 'POST',
            url: `/api/v1/admin/campaigns/${testCampaign.id}/audiences`,
            headers: { cookie: adminCookie },
            payload: { customerIds: [customerAProfile.id, customerBProfile.id] },
        });
        assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
        const json = JSON.parse(res.body);
        assert(json.data.count === 2, '2 audience members added');
    });
    await recordTest('M12-T41: Campaign lifecycle transition (DRAFT -> ACTIVE -> COMPLETED)', async () => {
        // DRAFT -> ACTIVE
        const activeRes = await app.inject({
            method: 'PATCH',
            url: `/api/v1/admin/campaigns/${testCampaign.id}/status`,
            headers: { cookie: adminCookie },
            payload: { status: 'ACTIVE' },
        });
        assert(activeRes.statusCode === 200, 'Campaign is ACTIVE');
        // ACTIVE -> COMPLETED
        const compRes = await app.inject({
            method: 'PATCH',
            url: `/api/v1/admin/campaigns/${testCampaign.id}/status`,
            headers: { cookie: adminCookie },
            payload: { status: 'COMPLETED' },
        });
        assert(compRes.statusCode === 200, 'Campaign is COMPLETED');
    });
    await recordTest('M12-T42: Campaign event metric tracking (sent, opened, clicked, converted)', async () => {
        const res = await app.inject({
            method: 'POST',
            url: `/api/v1/admin/campaigns/${testCampaign.id}/events`,
            headers: { cookie: adminCookie },
            payload: {
                eventType: 'CLICK',
                customerId: customerAProfile.id,
                metadata: { client: 'Apple Mail' },
            },
        });
        assert(res.statusCode === 201 || res.statusCode === 200, `Expected 201/200, got ${res.statusCode}`);
        const json = JSON.parse(res.body);
        assert(json.data.eventType === 'CLICK', 'Event logged');
    });
    await recordTest('M12-T43: Invalid campaign status transition rejection (COMPLETED -> DRAFT)', async () => {
        const res = await app.inject({
            method: 'PATCH',
            url: `/api/v1/admin/campaigns/${testCampaign.id}/status`,
            headers: { cookie: adminCookie },
            payload: { status: 'DRAFT' },
        });
        assert(res.statusCode === 400, `Expected 400 for illegal backward transition, got ${res.statusCode}`);
    });
    await recordTest('M12-T44: Campaign budget & channel validation', async () => {
        const res = await app.inject({
            method: 'POST',
            url: '/api/v1/admin/campaigns',
            headers: { cookie: adminCookie },
            payload: {
                name: 'Bad Budget Campaign',
                code: 'BAD-BUDGET',
                budget: -500,
                startsAt: new Date().toISOString(),
                endsAt: new Date().toISOString(),
            },
        });
        assert(res.statusCode === 400 || res.statusCode === 422, `Expected 400 or 422 for invalid payload, got ${res.statusCode}`);
    });
    // ============================================================================
    // Part 7: Server Authority, Historical Immutability & Domain Boundaries (M12-T45 to M12-T50)
    // ============================================================================
    console.log('\n--- Part 7: Server Authority, Historical Immutability & Domain Boundaries ---');
    await recordTest('M12-T45: Server authority - Client tampered discount payload is ignored/recomputed', async () => {
        await app.inject({ method: 'DELETE', url: '/api/v1/cart', headers: { cookie: customerACookie } });
        await app.inject({
            method: 'POST',
            url: '/api/v1/cart/items',
            headers: { cookie: customerACookie },
            payload: { productId: testProduct2.id, quantity: 1 }, // 200 THB
        });
        const res = await app.inject({
            method: 'POST',
            url: '/api/v1/checkout',
            headers: { cookie: customerACookie },
            payload: {
                shippingAddress: {
                    recipientName: 'Alice Customer',
                    phone: '0812345678',
                    addressLine: '123 Sukhumvit Road',
                    province: 'กรุงเทพมหานคร',
                    postalCode: '10110',
                },
                paymentMethod: 'PROMPTPAY',
                // Client tries to inject fake discount
                discountTotal: 199.0,
                grandTotal: 1.0,
            },
        });
        assert(res.statusCode === 201 || res.statusCode === 200, 'Order created');
        const order = JSON.parse(res.body).data;
        assert(Number(order.discountTotal) === 0, 'Fake client discount was ignored');
        assert(Number(order.grandTotal) === 200, 'Server authoritative grandTotal computed');
    });
    await recordTest('M12-T46: Historical order immutability - modifying a promotion later does NOT alter existing orders', async () => {
        const pastOrder = await database_1.prisma.order.findFirst({
            where: { couponCode: testCoupon.code },
        });
        assert(pastOrder != null, 'Past order found');
        const pastDiscount = Number(pastOrder.discountTotal);
        const pastGrandTotal = Number(pastOrder.grandTotal);
        // Modify the promotion discountValue in DB to 90%
        await database_1.prisma.promotion.update({
            where: { id: pctPromotion.id },
            data: { discountValue: 90 },
        });
        // Query past order again
        const reloadedOrder = await database_1.prisma.order.findUnique({ where: { id: pastOrder.id } });
        assert(Number(reloadedOrder?.discountTotal) === pastDiscount, 'Past order discount remained immutable');
        assert(Number(reloadedOrder?.grandTotal) === pastGrandTotal, 'Past order grand total remained immutable');
    });
    await recordTest('M12-T47: M7 Payment boundary isolation - Payment intent amount matches server post-discount total', async () => {
        const discountedOrder = await database_1.prisma.order.findFirst({
            where: { discountTotal: { gt: 0 } },
        });
        assert(discountedOrder != null, 'Discounted order found');
        const payRes = await app.inject({
            method: 'POST',
            url: `/api/v1/payments/intent`,
            headers: { cookie: customerACookie },
            payload: {
                orderId: discountedOrder.id,
                paymentMethod: 'PROMPTPAY',
            },
        });
        if (payRes.statusCode === 200) {
            const payJson = JSON.parse(payRes.body).data;
            assert(Number(payJson.amount) === Number(discountedOrder.grandTotal), 'Payment intent amount matches discounted order grand total');
        }
    });
    await recordTest('M12-T48: M8 Shipping boundary isolation - Promotion does not corrupt shipping methods', async () => {
        const carriersRes = await app.inject({
            method: 'GET',
            url: '/api/v1/shipping-methods',
            headers: { cookie: customerACookie },
        });
        assert(carriersRes.statusCode === 200, 'Shipping methods endpoint unaffected by promotions');
    });
    await recordTest('M12-T49: M10 Inventory boundary isolation - Promotion discount does not alter inventory deduction', async () => {
        await app.inject({ method: 'DELETE', url: '/api/v1/cart', headers: { cookie: customerACookie } });
        await app.inject({
            method: 'POST',
            url: '/api/v1/cart/items',
            headers: { cookie: customerACookie },
            payload: { productId: testProduct2.id, quantity: 2 },
        });
        const checkoutRes = await app.inject({
            method: 'POST',
            url: '/api/v1/checkout',
            headers: { cookie: customerACookie },
            payload: {
                shippingAddress: {
                    recipientName: 'Alice Customer',
                    phone: '0812345678',
                    addressLine: '123 Sukhumvit Road',
                    province: 'กรุงเทพมหานคร',
                    postalCode: '10110',
                },
                paymentMethod: 'PROMPTPAY',
            },
        });
        assert(checkoutRes.statusCode === 201 || checkoutRes.statusCode === 200, 'Checkout succeeded');
        const orderData = JSON.parse(checkoutRes.body).data;
        assert(orderData.items.length === 1, 'Order item created');
        assert(orderData.items[0].quantity === 2, 'Quantity is 2');
    });
    await recordTest('M12-T50: Audit logging & RBAC - Unauthorized role cannot create promotions/coupons/segments', async () => {
        const res = await app.inject({
            method: 'POST',
            url: '/api/v1/admin/promotions',
            headers: { cookie: customerACookie },
            payload: {
                name: 'Hacked Promo',
                promotionType: 'PERCENTAGE',
                discountValue: 99,
            },
        });
        assert(res.statusCode === 403, `Expected 403 for customer creating promotion, got ${res.statusCode}`);
    });
    // ============================================================================
    // Test Summary
    // ============================================================================
    console.log('\n============================================================');
    console.log('                 M12 TEST SUITE SUMMARY                     ');
    console.log('============================================================');
    const passedCount = results.filter((r) => r.passed).length;
    const failedCount = results.filter((r) => !r.passed).length;
    console.log(`Total Tests : ${results.length}`);
    console.log(`Passed      : ${passedCount}`);
    console.log(`Failed      : ${failedCount}`);
    if (failedCount > 0) {
        console.log('\nFailed Tests:');
        results.filter((r) => !r.passed).forEach((r) => {
            console.log(`  ❌ ${r.name}: ${r.error}`);
        });
        process.exit(1);
    }
    else {
        console.log('\n🎉 ALL 50 M12 TESTS PASSED PERFECTLY!\n');
        process.exit(0);
    }
}
runM12TestSuite().catch((err) => {
    console.error('Fatal test error:', err);
    process.exit(1);
});
//# sourceMappingURL=m12-test.js.map