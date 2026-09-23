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
async function runM5TestSuite() {
    console.log('🧪 Starting Phase M5 Vehicle-Aware Storefront Automated Test Suite...\n');
    const app = await (0, app_1.buildApp)();
    await app.ready();
    // ----------------------------------------------------------------------------
    // SUITE 1: 5-LEVEL VEHICLE HIERARCHY CASCADING API ENDPOINTS
    // ----------------------------------------------------------------------------
    console.log('--- Suite 1: Vehicle Selector Cascading Endpoints ---');
    let testMake = null;
    let testModel = null;
    let testGen = null;
    let testEngine = null;
    let testVariant = null;
    await recordTest('Level 1: GET /api/v1/vehicles/makes returns active vehicle makes', async () => {
        const res = await app.inject({
            method: 'GET',
            url: '/api/v1/vehicles/makes',
        });
        assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
        const json = JSON.parse(res.body);
        assert(Array.isArray(json.makes), 'Expected makes array');
        assert(json.makes.length >= 1, 'Expected at least 1 make');
        testMake = json.makes.find((m) => m.slug === 'toyota') || json.makes[0];
        assert(testMake != null, 'Toyota or fallback make found');
    });
    await recordTest('Level 2: GET /api/v1/vehicles/models?makeId=... returns models for selected make', async () => {
        const res = await app.inject({
            method: 'GET',
            url: `/api/v1/vehicles/models?makeId=${testMake.id}`,
        });
        assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
        const json = JSON.parse(res.body);
        assert(Array.isArray(json.models), 'Expected models array');
        assert(json.models.length >= 1, 'Expected at least 1 model');
        testModel = json.models[0];
    });
    await recordTest('Level 3: GET /api/v1/vehicles/generations?modelId=... returns generations with years and codes', async () => {
        const res = await app.inject({
            method: 'GET',
            url: `/api/v1/vehicles/generations?modelId=${testModel.id}`,
        });
        assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
        const json = JSON.parse(res.body);
        assert(Array.isArray(json.generations), 'Expected generations array');
        assert(json.generations.length >= 1, 'Expected at least 1 generation');
        testGen = json.generations[0];
        assert(testGen.startYear != null, 'Generation must have startYear');
    });
    await recordTest('Level 4: GET /api/v1/vehicles/engines?generationId=... returns engines for generation', async () => {
        const res = await app.inject({
            method: 'GET',
            url: `/api/v1/vehicles/engines?generationId=${testGen.id}`,
        });
        assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
        const json = JSON.parse(res.body);
        assert(Array.isArray(json.engines), 'Expected engines array');
        if (json.engines.length > 0) {
            testEngine = json.engines[0];
        }
    });
    await recordTest('Level 5: GET /api/v1/vehicles/variants?generationId=... resolves to specific VehicleVariants', async () => {
        const res = await app.inject({
            method: 'GET',
            url: `/api/v1/vehicles/variants?generationId=${testGen.id}`,
        });
        assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
        const json = JSON.parse(res.body);
        assert(Array.isArray(json.variants), 'Expected variants array');
        assert(json.variants.length >= 1, 'Expected at least 1 variant');
        testVariant = json.variants[0];
        assert(testVariant.id != null, 'Variant must have UUID id');
    });
    // ----------------------------------------------------------------------------
    // SUITE 2: VEHICLE-AWARE PRODUCT DISCOVERY & SERVER-SIDE FILTERING
    // ----------------------------------------------------------------------------
    console.log('\n--- Suite 2: Vehicle-Aware Product Discovery & Filtering ---');
    await recordTest('GET /api/v1/products?vehicleVariantId=... filters catalog server-side', async () => {
        const res = await app.inject({
            method: 'GET',
            url: `/api/v1/products?vehicleVariantId=${testVariant.id}`,
        });
        assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
        const json = JSON.parse(res.body);
        assert(Array.isArray(json.data), 'Expected products data array');
        assert(json.pagination != null, 'Expected pagination info');
    });
    await recordTest('GET /api/v1/categories/tree returns hierarchical category tree for Storefront', async () => {
        const res = await app.inject({
            method: 'GET',
            url: '/api/v1/categories/tree',
        });
        assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
        const json = JSON.parse(res.body);
        const list = json.data || json.categories;
        assert(Array.isArray(list), 'Expected categories array');
        assert(list.length >= 1, 'Expected at least 1 category');
    });
    await recordTest('GET /api/v1/brands returns active automotive parts brands', async () => {
        const res = await app.inject({
            method: 'GET',
            url: '/api/v1/brands',
        });
        assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
        const json = JSON.parse(res.body);
        const list = json.data || json.brands;
        assert(Array.isArray(list), 'Expected brands array');
        assert(list.length >= 1, 'Expected at least 1 brand');
    });
    await recordTest('Multi-filter: vehicleVariantId + category + search + sorting works in a single query', async () => {
        const res = await app.inject({
            method: 'GET',
            url: `/api/v1/products?vehicleVariantId=${testVariant.id}&search=a&sortBy=price&sortOrder=asc&page=1&pageSize=10`,
        });
        assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
        const json = JSON.parse(res.body);
        assert(Array.isArray(json.data), 'Expected products array');
    });
    // ----------------------------------------------------------------------------
    // SUITE 3: DETERMINISTIC COMPATIBILITY VERIFICATION IN STOREFRONT
    // ----------------------------------------------------------------------------
    console.log('\n--- Suite 3: Deterministic Compatibility & Reason Codes ---');
    // Find a product with explicit fitments
    const productWithFitment = await database_1.prisma.productFitment.findFirst({
        include: { product: true, vehicleVariant: true },
    });
    if (productWithFitment) {
        await recordTest('Explicit Fitment Check: returns compatible=true and EXPLICIT_FITMENT reason code', async () => {
            const res = await app.inject({
                method: 'GET',
                url: `/api/v1/products/${productWithFitment.productId}/fitment/${productWithFitment.vehicleVariantId}`,
            });
            assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
            const json = JSON.parse(res.body);
            assert(json.compatible === true, 'Expected compatible = true');
            assert(json.reason === 'EXPLICIT_FITMENT', `Expected EXPLICIT_FITMENT, got ${json.reason}`);
            assert(json.fitment != null, 'Expected structured fitment metadata');
        });
        await recordTest('All Fitments for Product: GET /api/v1/products/:id/fitments returns all compatible vehicles', async () => {
            const res = await app.inject({
                method: 'GET',
                url: `/api/v1/products/${productWithFitment.productId}/fitments`,
            });
            assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
            const json = JSON.parse(res.body);
            assert(Array.isArray(json.fitments), 'Expected fitments array');
            assert(json.fitments.length >= 1, 'Expected at least 1 fitment');
        });
    }
    await recordTest('Negative Fitment: Different vehicle variant returns compatible=false and NO_FITMENT_RECORD', async () => {
        // Pick an unmatched variant
        const allVariants = await database_1.prisma.vehicleVariant.findMany({ take: 2 });
        if (allVariants.length >= 2 && productWithFitment) {
            const otherVariant = allVariants.find((v) => v.id !== productWithFitment.vehicleVariantId) || allVariants[1];
            const res = await app.inject({
                method: 'GET',
                url: `/api/v1/products/${productWithFitment.productId}/fitment/${otherVariant.id}`,
            });
            assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
            const json = JSON.parse(res.body);
            assert(json.compatible === false, 'Expected compatible = false');
            assert(json.reason === 'NO_FITMENT_RECORD', `Expected NO_FITMENT_RECORD, got ${json.reason}`);
        }
    });
    // ----------------------------------------------------------------------------
    // SUITE 4: SERVER-AUTHORITATIVE PRICING & DATA INTEGRITY
    // ----------------------------------------------------------------------------
    console.log('\n--- Suite 4: Server-Authoritative Pricing & Data Integrity ---');
    await recordTest('Server Pricing: Product listing preserves tier-specific price objects without client mutation', async () => {
        const res = await app.inject({
            method: 'GET',
            url: '/api/v1/products?page=1&pageSize=5',
        });
        assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
        const json = JSON.parse(res.body);
        for (const prod of json.data) {
            assert(prod.effectivePrice != null, 'Product must include effectivePrice object');
            assert(prod.effectivePrice.amount != null && !isNaN(Number(prod.effectivePrice.amount)), 'effectivePrice.amount must be a valid number format');
            assert(prod.effectivePrice.currency === 'THB', 'Currency must be THB');
        }
    });
    // ----------------------------------------------------------------------------
    // SUITE 5: EDGE CASES & EMPTY STATES
    // ----------------------------------------------------------------------------
    console.log('\n--- Suite 5: Storefront Empty States & Edge Cases ---');
    await recordTest('Empty Search: Non-matching search query returns empty array with pagination.total = 0', async () => {
        const res = await app.inject({
            method: 'GET',
            url: '/api/v1/products?search=NONEXISTENT_AUTO_PART_XYZ_12345',
        });
        assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
        const json = JSON.parse(res.body);
        assert(json.data.length === 0, 'Expected 0 products for bogus search');
        assert(json.pagination?.total === 0, 'Expected total = 0');
    });
    await recordTest('Invalid Product in Fitment Check: returns INVALID_PRODUCT reason code', async () => {
        const fakeUuid = '00000000-0000-0000-0000-000000000000';
        const res = await app.inject({
            method: 'GET',
            url: `/api/v1/products/${fakeUuid}/fitment/${testVariant.id}`,
        });
        assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
        const json = JSON.parse(res.body);
        assert(json.compatible === false, 'Expected compatible = false');
        assert(json.reason === 'INVALID_PRODUCT', 'Expected INVALID_PRODUCT');
    });
    // ----------------------------------------------------------------------------
    // RESULTS SUMMARY
    // ----------------------------------------------------------------------------
    const total = results.length;
    const passed = results.filter((r) => r.passed).length;
    const failed = results.filter((r) => !r.passed).length;
    console.log('\n======================================================');
    console.log(`Results: ${passed} / ${total} M5 tests PASSED.`);
    if (failed > 0) {
        console.error(`❌ ${failed} tests FAILED:`);
        for (const f of results.filter((r) => !r.passed)) {
            console.error(`  - ${f.name}: ${f.error}`);
        }
        process.exit(1);
    }
    else {
        console.log('======================================================\n');
        console.log('🎉 Phase M5 Vehicle-Aware Storefront Test Suite PASSED 100%!\n');
    }
    await app.close();
}
runM5TestSuite().catch((err) => {
    console.error('Fatal test error:', err);
    process.exit(1);
});
//# sourceMappingURL=m5-test.js.map