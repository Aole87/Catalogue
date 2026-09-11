import { buildApp } from '../apps/api/src/app';
import { FitmentService } from '../apps/api/src/services/fitment.service';
import { prisma, PriceTier, FitmentStatus } from '@car-parts/database';
import { FastifyInstance } from 'fastify';
import argon2 from 'argon2';

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

async function runM4TestSuite() {
  console.log('🧪 Starting Comprehensive Phase M4 Vehicle Hierarchy & Deterministic Fitment Test Suite...\n');

  const app: FastifyInstance = await buildApp();
  await app.ready();

  // ----------------------------------------------------------------------------
  // TEST SETUP: AUTH SESSIONS & TEST IDENTITIES
  // ----------------------------------------------------------------------------
  console.log('--- Step 0: Test Setup & Authentication Sessions ---');

  const passwordHash = await argon2.hash('Test@123456', {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });

  // 1. Super Admin User
  const superAdmin = await prisma.user.upsert({
    where: { email: 'm4-admin@mobex.co.th' },
    update: { passwordHash, isActive: true },
    create: {
      email: 'm4-admin@mobex.co.th',
      passwordHash,
      firstName: 'M4',
      lastName: 'Admin',
      isActive: true,
    },
  });

  const superAdminRole = await prisma.role.findUniqueOrThrow({ where: { name: 'SUPER_ADMIN' } });
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: superAdmin.id, roleId: superAdminRole.id } },
    update: {},
    create: { userId: superAdmin.id, roleId: superAdminRole.id },
  });

  // 2. Customer User (No Admin Permissions)
  const customerUser = await prisma.user.upsert({
    where: { email: 'm4-customer@test.com' },
    update: { passwordHash, isActive: true },
    create: {
      email: 'm4-customer@test.com',
      passwordHash,
      firstName: 'M4',
      lastName: 'Customer',
      isActive: true,
    },
  });

  // Login SuperAdmin to get session cookie
  const adminLoginRes = await app.inject({
    method: 'POST',
    url: '/api/v1/auth/login',
    payload: { email: 'm4-admin@mobex.co.th', password: 'Test@123456' },
  });
  assert(adminLoginRes.statusCode === 200, 'Admin login failed');
  const adminCookie = adminLoginRes.headers['set-cookie'] as string;

  // Login Customer to get customer session cookie
  const customerLoginRes = await app.inject({
    method: 'POST',
    url: '/api/v1/auth/login',
    payload: { email: 'm4-customer@test.com', password: 'Test@123456' },
  });
  assert(customerLoginRes.statusCode === 200, 'Customer login failed');
  const customerCookie = customerLoginRes.headers['set-cookie'] as string;

  console.log('  -> Sessions initialized successfully.\n');

  // Pre-cleanup in case of previous interrupted run
  await prisma.productFitment.deleteMany({
    where: { product: { sku: { in: ['TEST-PAD-M4-A', 'TEST-PAD-M4-B', 'MISLEADING-PAD-YARIS', 'OEM-SIMILARITY-PART'] } } },
  });
  await prisma.productPrice.deleteMany({
    where: { product: { sku: { in: ['TEST-PAD-M4-A', 'TEST-PAD-M4-B', 'MISLEADING-PAD-YARIS', 'OEM-SIMILARITY-PART'] } } },
  });
  await prisma.productCrossReference.deleteMany({
    where: { product: { sku: { in: ['TEST-PAD-M4-A', 'TEST-PAD-M4-B', 'MISLEADING-PAD-YARIS', 'OEM-SIMILARITY-PART'] } } },
  });
  await prisma.product.deleteMany({
    where: { sku: { in: ['TEST-PAD-M4-A', 'TEST-PAD-M4-B', 'MISLEADING-PAD-YARIS', 'OEM-SIMILARITY-PART'] } },
  });
  const staleMake = await prisma.vehicleMake.findUnique({ where: { slug: 'mitsubishi-test' } });
  if (staleMake) {
    const models = await prisma.vehicleModel.findMany({ where: { makeId: staleMake.id } });
    const modelIds = models.map((m) => m.id);
    const gens = await prisma.vehicleGeneration.findMany({ where: { modelId: { in: modelIds } } });
    const genIds = gens.map((g) => g.id);
    const variants = await prisma.vehicleVariant.findMany({ where: { generationId: { in: genIds } } });
    const variantIds = variants.map((v) => v.id);
    await prisma.productFitment.deleteMany({ where: { vehicleVariantId: { in: variantIds } } });
    await prisma.vehicleVariant.deleteMany({ where: { id: { in: variantIds } } });
    await prisma.vehicleEngine.deleteMany({ where: { engineCode: '4N15-MIVEC' } });
    await prisma.vehicleGeneration.deleteMany({ where: { id: { in: genIds } } });
    await prisma.vehicleModel.deleteMany({ where: { id: { in: modelIds } } });
    await prisma.vehicleMake.delete({ where: { id: staleMake.id } });
  }
  await prisma.vehicleEngine.deleteMany({ where: { engineCode: '4N15-MIVEC' } });

  // Track created entities for teardown
  let testMakeId = '';
  let testModelId = '';
  let testGenId = '';
  let testEngineId = '';
  let testVariantIdA = '';
  let testVariantIdB = '';
  let testProductIdA = '';
  let testProductIdB = '';
  let testFitmentId = '';

  // ----------------------------------------------------------------------------
  // SUITE 1: VEHICLE MASTER DATA HIERARCHY CRUD
  // ----------------------------------------------------------------------------
  console.log('--- Suite 1: Vehicle Hierarchy Master Data CRUD ---');

  await recordTest('POST /api/v1/admin/vehicles/makes creates new vehicle make', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/admin/vehicles/makes',
      headers: { cookie: adminCookie },
      payload: {
        name: 'Mitsubishi-Test',
        slug: 'mitsubishi-test',
        countryOfOrigin: 'Japan',
      },
    });
    assert(res.statusCode === 201, `Expected 201, got ${res.statusCode}: ${res.body}`);
    const json = JSON.parse(res.body);
    assert(json.make.slug === 'mitsubishi-test', 'Make slug mismatch');
    testMakeId = json.make.id;
  });

  await recordTest('POST /api/v1/admin/vehicles/models creates model under make', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/admin/vehicles/models',
      headers: { cookie: adminCookie },
      payload: {
        makeId: testMakeId,
        name: 'Pajero Sport Test',
        slug: 'pajero-sport-test',
      },
    });
    assert(res.statusCode === 201, `Expected 201, got ${res.statusCode}: ${res.body}`);
    const json = JSON.parse(res.body);
    assert(json.model.name === 'Pajero Sport Test', 'Model name mismatch');
    testModelId = json.model.id;
  });

  await recordTest('POST /api/v1/admin/vehicles/generations creates generation under model', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/admin/vehicles/generations',
      headers: { cookie: adminCookie },
      payload: {
        modelId: testModelId,
        name: 'Pajero Sport QF (3rd Gen)',
        code: 'QF',
        startYear: 2015,
        endYear: 2024,
      },
    });
    assert(res.statusCode === 201, `Expected 201, got ${res.statusCode}: ${res.body}`);
    const json = JSON.parse(res.body);
    assert(json.generation.code === 'QF', 'Generation code mismatch');
    testGenId = json.generation.id;
  });

  await recordTest('POST /api/v1/admin/vehicles/engines creates standalone engine entity', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/admin/vehicles/engines',
      headers: { cookie: adminCookie },
      payload: {
        engineCode: '4N15-MIVEC',
        name: '2.4 MIVEC Clean Diesel Turbo',
        displacementCc: 2442,
        cylinders: 4,
        fuelType: 'DIESEL',
        aspiration: 'Turbocharged',
      },
    });
    assert(res.statusCode === 201, `Expected 201, got ${res.statusCode}: ${res.body}`);
    const json = JSON.parse(res.body);
    assert(json.engine.engineCode === '4N15-MIVEC', 'Engine code mismatch');
    testEngineId = json.engine.id;
  });

  await recordTest('POST /api/v1/admin/vehicles/variants creates specific vehicle variant', async () => {
    // Variant A: 2.4 GT-Premium 2WD
    const resA = await app.inject({
      method: 'POST',
      url: '/api/v1/admin/vehicles/variants',
      headers: { cookie: adminCookie },
      payload: {
        generationId: testGenId,
        engineId: testEngineId,
        name: '2.4 GT-Premium 2WD 8AT',
        transmission: '8AT',
        bodyType: 'SUV',
        drivetrain: 'RWD',
        startYear: 2019,
        endYear: 2023,
      },
    });
    assert(resA.statusCode === 201, `Expected 201, got ${resA.statusCode}: ${resA.body}`);
    testVariantIdA = JSON.parse(resA.body).variant.id;

    // Variant B: 2.4 Elite 4WD
    const resB = await app.inject({
      method: 'POST',
      url: '/api/v1/admin/vehicles/variants',
      headers: { cookie: adminCookie },
      payload: {
        generationId: testGenId,
        engineId: testEngineId,
        name: '2.4 Elite Edition 4WD 8AT',
        transmission: '8AT',
        bodyType: 'SUV',
        drivetrain: '4WD',
        startYear: 2020,
        endYear: 2024,
      },
    });
    assert(resB.statusCode === 201, `Expected 201, got ${resB.statusCode}: ${resB.body}`);
    testVariantIdB = JSON.parse(resB.body).variant.id;
  });

  // ----------------------------------------------------------------------------
  // SUITE 2: PUBLIC STOREFRONT VEHICLE APIS & HIERARCHY FILTERING
  // ----------------------------------------------------------------------------
  console.log('\n--- Suite 2: Public Storefront Vehicle APIs & Cascading Navigation ---');

  await recordTest('GET /api/v1/vehicles/makes returns active makes publicly without authentication', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/vehicles/makes' });
    assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
    const json = JSON.parse(res.body);
    assert(Array.isArray(json.makes), 'Expected makes array');
    assert(json.makes.some((m: any) => m.id === testMakeId), 'Created make not found in list');
  });

  await recordTest('GET /api/v1/vehicles/models?makeId=... returns only models belonging to that make', async () => {
    const res = await app.inject({ method: 'GET', url: `/api/v1/vehicles/models?makeId=${testMakeId}` });
    assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
    const json = JSON.parse(res.body);
    assert(json.models.length === 1, 'Expected exactly 1 model for test make');
    assert(json.models[0].id === testModelId, 'Model ID mismatch');
  });

  await recordTest('GET /api/v1/vehicles/generations?modelId=... returns generations for model', async () => {
    const res = await app.inject({ method: 'GET', url: `/api/v1/vehicles/generations?modelId=${testModelId}` });
    assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
    const json = JSON.parse(res.body);
    assert(json.generations.some((g: any) => g.id === testGenId), 'Generation not found');
  });

  await recordTest('GET /api/v1/vehicles/variants?generationId=... returns variants with full hierarchy', async () => {
    const res = await app.inject({ method: 'GET', url: `/api/v1/vehicles/variants?generationId=${testGenId}` });
    assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
    const json = JSON.parse(res.body);
    assert(json.variants.length === 2, `Expected 2 variants, got ${json.variants.length}`);
    const vA = json.variants.find((v: any) => v.id === testVariantIdA);
    assert(vA.generation.model.make.name === 'Mitsubishi-Test', 'Hierarchy tree make mismatch');
  });

  await recordTest('GET /api/v1/vehicles/variants/:id returns single variant detail', async () => {
    const res = await app.inject({ method: 'GET', url: `/api/v1/vehicles/variants/${testVariantIdA}` });
    assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
    const json = JSON.parse(res.body);
    assert(json.variant.name === '2.4 GT-Premium 2WD 8AT', 'Variant name mismatch');
  });

  // ----------------------------------------------------------------------------
  // SUITE 3: VEHICLE DATA INTEGRITY & VALIDATION
  // ----------------------------------------------------------------------------
  console.log('\n--- Suite 3: Vehicle Data Integrity & Validation ---');

  await recordTest('Cross-Hierarchy: Reject model creation with non-existent makeId', async () => {
    const fakeUuid = '00000000-0000-0000-0000-000000000000';
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/admin/vehicles/models',
      headers: { cookie: adminCookie },
      payload: { makeId: fakeUuid, name: 'Invalid', slug: 'invalid' },
    });
    assert(res.statusCode === 404, `Expected 404, got ${res.statusCode}`);
  });

  await recordTest('Uniqueness: Duplicate make name or slug is rejected with 409 Conflict', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/admin/vehicles/makes',
      headers: { cookie: adminCookie },
      payload: { name: 'Mitsubishi-Test', slug: 'mitsubishi-test-diff' },
    });
    assert(res.statusCode === 409, `Expected 409, got ${res.statusCode}`);
  });

  await recordTest('Uniqueness: Duplicate model slug within same make is rejected with 409 Conflict', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/admin/vehicles/models',
      headers: { cookie: adminCookie },
      payload: { makeId: testMakeId, name: 'Pajero Sport Duplicate', slug: 'pajero-sport-test' },
    });
    assert(res.statusCode === 409, `Expected 409, got ${res.statusCode}`);
  });

  await recordTest('Deletion Safety: Cannot delete vehicle make that has active child models', async () => {
    const res = await app.inject({
      method: 'DELETE',
      url: `/api/v1/admin/vehicles/makes/${testMakeId}`,
      headers: { cookie: adminCookie },
    });
    assert(res.statusCode === 400, `Expected 400 Bad Request, got ${res.statusCode}`);
  });

  // ----------------------------------------------------------------------------
  // SUITE 4: PRODUCT FITMENT CRUD & UNIQUENESS
  // ----------------------------------------------------------------------------
  console.log('\n--- Suite 4: ProductFitment CRUD & Constraints ---');

  // Create test products
  const category = await prisma.category.findFirstOrThrow({ where: { slug: 'brakes' } });
  const brand = await prisma.brand.findFirstOrThrow({ where: { slug: 'akebono' } });

  const prodResA = await app.inject({
    method: 'POST',
    url: '/api/v1/admin/products',
    headers: { cookie: adminCookie },
    payload: {
      sku: 'TEST-PAD-M4-A',
      slug: 'test-brake-pad-m4-a',
      name: 'Akebono Ceramic Brake Pad (Front)',
      brandId: brand.id,
      categoryId: category.id,
      prices: [{ tier: 'GENERAL', price: 1450.00 }],
    },
  });
  assert(prodResA.statusCode === 201, 'Failed to create test product A');
  testProductIdA = JSON.parse(prodResA.body).data.id;

  const prodResB = await app.inject({
    method: 'POST',
    url: '/api/v1/admin/products',
    headers: { cookie: adminCookie },
    payload: {
      sku: 'TEST-PAD-M4-B',
      slug: 'test-brake-pad-m4-b',
      name: 'Akebono Ceramic Brake Pad (Rear)',
      brandId: brand.id,
      categoryId: category.id,
      prices: [{ tier: 'GENERAL', price: 1250.00 }],
    },
  });
  assert(prodResB.statusCode === 201, 'Failed to create test product B');
  testProductIdB = JSON.parse(prodResB.body).data.id;

  await recordTest('POST /api/v1/admin/products/:productId/fitments creates structured fitment record', async () => {
    const res = await app.inject({
      method: 'POST',
      url: `/api/v1/admin/products/${testProductIdA}/fitments`,
      headers: { cookie: adminCookie },
      payload: {
        vehicleVariantId: testVariantIdA,
        position: 'FRONT',
        notes: 'Fits front axle disc brakes',
        fitmentStatus: 'COMPATIBLE',
      },
    });
    assert(res.statusCode === 201, `Expected 201, got ${res.statusCode}: ${res.body}`);
    const json = JSON.parse(res.body);
    assert(json.fitment.position === 'FRONT', 'Position mismatch');
    assert(json.fitment.fitmentStatus === 'COMPATIBLE', 'Status mismatch');
    testFitmentId = json.fitment.id;
  });

  await recordTest('Uniqueness: Duplicate ProductFitment for same product, variant, and position returns 409', async () => {
    const res = await app.inject({
      method: 'POST',
      url: `/api/v1/admin/products/${testProductIdA}/fitments`,
      headers: { cookie: adminCookie },
      payload: {
        vehicleVariantId: testVariantIdA,
        position: 'FRONT',
      },
    });
    assert(res.statusCode === 409, `Expected 409 Conflict for duplicate fitment, got ${res.statusCode}`);
  });

  await recordTest('GET /api/v1/admin/products/:productId/fitments lists product fitments', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/admin/products/${testProductIdA}/fitments`,
      headers: { cookie: adminCookie },
    });
    assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
    const json = JSON.parse(res.body);
    assert(json.fitments.length >= 1, 'Expected at least 1 fitment');
  });

  // ----------------------------------------------------------------------------
  // SUITE 5: DETERMINISTIC FITMENT ENGINE — MACHINE-READABLE REASON CODES
  // ----------------------------------------------------------------------------
  console.log('\n--- Suite 5: Deterministic Fitment Engine & Reason Codes ---');

  await recordTest('Check Fitment -> EXPLICIT_FITMENT when valid record exists in PostgreSQL', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/products/${testProductIdA}/fitment/${testVariantIdA}`,
    });
    assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
    const json = JSON.parse(res.body);
    assert(json.compatible === true, 'Expected compatible = true');
    assert(json.reason === 'EXPLICIT_FITMENT', `Expected reason EXPLICIT_FITMENT, got ${json.reason}`);
    assert(json.fitment != null, 'Expected structured fitment object');
  });

  await recordTest('Check Fitment -> NO_FITMENT_RECORD when valid vehicle has no compatibility entry', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/products/${testProductIdA}/fitment/${testVariantIdB}`, // Variant B has no fitment record
    });
    assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
    const json = JSON.parse(res.body);
    assert(json.compatible === false, 'Expected compatible = false');
    assert(json.reason === 'NO_FITMENT_RECORD', `Expected reason NO_FITMENT_RECORD, got ${json.reason}`);
    assert(json.fitment === null, 'Expected null fitment');
  });

  await recordTest('Check Fitment -> INVALID_PRODUCT when product UUID does not exist', async () => {
    const fakeProdUuid = '00000000-0000-0000-0000-000000000000';
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/products/${fakeProdUuid}/fitment/${testVariantIdA}`,
    });
    assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
    const json = JSON.parse(res.body);
    assert(json.compatible === false, 'Expected compatible = false');
    assert(json.reason === 'INVALID_PRODUCT', `Expected reason INVALID_PRODUCT, got ${json.reason}`);
  });

  await recordTest('Check Fitment -> INVALID_VEHICLE when vehicle variant UUID does not exist', async () => {
    const fakeVarUuid = '00000000-0000-0000-0000-000000000000';
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/products/${testProductIdA}/fitment/${fakeVarUuid}`,
    });
    assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
    const json = JSON.parse(res.body);
    assert(json.compatible === false, 'Expected compatible = false');
    assert(json.reason === 'INVALID_VEHICLE', `Expected reason INVALID_VEHICLE, got ${json.reason}`);
  });

  // ----------------------------------------------------------------------------
  // SUITE 6: MANDATORY NEGATIVE TESTS (QUALITY GATE G)
  // ----------------------------------------------------------------------------
  console.log('\n--- Suite 6: Critical Quality Gate G Negative Tests ---');

  // Test 1: Product name contains car name ("Toyota Yaris XP150") but NO ProductFitment
  await recordTest('NEGATIVE TEST 1: Product name contains car model but lacks ProductFitment -> NOT COMPATIBLE', async () => {
    const misleadingProduct = await prisma.product.create({
      data: {
        sku: 'MISLEADING-YARIS-ROTOR',
        slug: 'misleading-toyota-yaris-xp150-brake-rotor',
        name: 'Mitsubishi Pajero Sport Brake Rotor OEM Genuine',
        brandId: brand.id,
        categoryId: category.id,
        isActive: true,
        isPublished: true,
      },
    });

    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/products/${misleadingProduct.id}/fitment/${testVariantIdA}`,
    });
    assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
    const json = JSON.parse(res.body);
    assert(json.compatible === false, 'System MUST NOT infer compatibility from product name!');
    assert(json.reason === 'NO_FITMENT_RECORD', 'Expected NO_FITMENT_RECORD');

    await prisma.product.delete({ where: { id: misleadingProduct.id } });
  });

  // Test 2: Similar OEM reference number without explicit ProductFitment
  await recordTest('NEGATIVE TEST 2: OEM cross-reference match without explicit ProductFitment -> NOT COMPATIBLE', async () => {
    const oemMatchProduct = await prisma.product.create({
      data: {
        sku: 'OEM-SIMILARITY-PART',
        slug: 'oem-similarity-part-m4',
        name: 'Aftermarket Brake Pad Set',
        brandId: brand.id,
        categoryId: category.id,
        crossReferences: {
          create: {
            referenceType: 'OEM',
            referenceNumber: '4605A486-SIMILAR',
          },
        },
      },
    });

    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/products/${oemMatchProduct.id}/fitment/${testVariantIdA}`,
    });
    assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
    const json = JSON.parse(res.body);
    assert(json.compatible === false, 'System MUST NOT infer compatibility from OEM reference similarity!');
    assert(json.reason === 'NO_FITMENT_RECORD', 'Expected NO_FITMENT_RECORD');

    await prisma.product.delete({ where: { id: oemMatchProduct.id } });
  });

  // Test 3: Simulated AI / Semantic Recommendation without explicit ProductFitment
  await recordTest('NEGATIVE TEST 3: Simulated AI/semantic candidate without ProductFitment -> NOT COMPATIBLE', async () => {
    // Product with zero fitment records
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/products/${testProductIdB}/fitment/${testVariantIdA}`,
    });
    const json = JSON.parse(res.body);
    assert(json.compatible === false, 'Deterministic Fitment Engine strictly rejects candidate without ProductFitment');
    assert(json.reason === 'NO_FITMENT_RECORD', 'Expected NO_FITMENT_RECORD');
  });

  // Test 4: Incomplete vehicle specification
  await recordTest('NEGATIVE TEST 4: Missing vehicle specification returns INSUFFICIENT_VEHICLE_SPECIFICATION', async () => {
    const result = await FitmentService.checkProductFitment(
      testProductIdA,
      null
    );
    assert(result.compatible === false, 'Expected compatible = false');
    assert(result.reason === 'INSUFFICIENT_VEHICLE_SPECIFICATION', 'Expected INSUFFICIENT_VEHICLE_SPECIFICATION');
  });

  // Test 5: Customer role attempting to mutate fitment records
  await recordTest('NEGATIVE TEST 5: Customer attempting fitment mutation is rejected with 403 Forbidden', async () => {
    const res = await app.inject({
      method: 'POST',
      url: `/api/v1/admin/products/${testProductIdA}/fitments`,
      headers: { cookie: customerCookie },
      payload: { vehicleVariantId: testVariantIdB },
    });
    assert(res.statusCode === 403, `Expected 403 Forbidden, got ${res.statusCode}`);
  });

  // Test 6: Inconsistent vehicle hierarchy rejected
  await recordTest('NEGATIVE TEST 6: Invalid vehicle hierarchy foreign keys rejected with 404', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/admin/vehicles/variants',
      headers: { cookie: adminCookie },
      payload: {
        generationId: '00000000-0000-0000-0000-000000000000',
        name: 'Invalid Gen Variant',
      },
    });
    assert(res.statusCode === 404, `Expected 404, got ${res.statusCode}`);
  });

  // ----------------------------------------------------------------------------
  // SUITE 7: SERVER-SIDE PRODUCT DISCOVERY WITH VEHICLE FILTERING
  // ----------------------------------------------------------------------------
  console.log('\n--- Suite 7: Server-Side Product Discovery & Vehicle Filtering ---');

  await recordTest('GET /api/v1/products?vehicleVariantId=... returns only compatible products', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/products?vehicleVariantId=${testVariantIdA}`,
    });
    assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
    const json = JSON.parse(res.body);
    assert(Array.isArray(json.data), 'Expected products array');
    assert(json.data.some((p: any) => p.id === testProductIdA), 'Product A should be included (has fitment)');
    assert(!json.data.some((p: any) => p.id === testProductIdB), 'Product B MUST NOT be included (no fitment for variant A)');
  });

  await recordTest('GET /api/v1/products with vehicleVariantId + category + brand works server-side', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/products?vehicleVariantId=${testVariantIdA}&categoryId=${category.id}&brandId=${brand.id}`,
    });
    assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
    const json = JSON.parse(res.body);
    assert(json.data.length >= 1, 'Expected compatible products under category & brand');
  });

  await recordTest('GET /api/v1/vehicles/variants/:variantId/products returns compatible products list', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/vehicles/variants/${testVariantIdA}/products`,
    });
    assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
    const json = JSON.parse(res.body);
    assert(json.vehicle.variant === '2.4 GT-Premium 2WD 8AT', 'Vehicle summary mismatch');
    assert(json.items.some((p: any) => p.id === testProductIdA), 'Product A missing from variant compatible products');
  });

  // ----------------------------------------------------------------------------
  // SUITE 8: AUDIT LOGGING & TEARDOWN
  // ----------------------------------------------------------------------------
  console.log('\n--- Suite 8: Security, Audit Logging & Clean Teardown ---');

  await recordTest('Audit Trail: Privileged vehicle and fitment mutations recorded in audit_logs', async () => {
    const auditLogs = await prisma.auditLog.findMany({
      where: {
        action: {
          in: [
            'VEHICLE_MAKE_CREATED',
            'VEHICLE_MODEL_CREATED',
            'VEHICLE_GENERATION_CREATED',
            'VEHICLE_ENGINE_CREATED',
            'VEHICLE_VARIANT_CREATED',
            'FITMENT_CREATED',
          ],
        },
      },
    });
    assert(auditLogs.length >= 6, `Expected at least 6 audit log entries, found ${auditLogs.length}`);
  });

  // Teardown created test entities
  await recordTest('Teardown: Safely cleanup test fitments, products, and vehicle hierarchy', async () => {
    if (testFitmentId) {
      await prisma.productFitment.deleteMany({ where: { productId: { in: [testProductIdA, testProductIdB] } } });
    }
    if (testProductIdA || testProductIdB) {
      await prisma.productPrice.deleteMany({ where: { productId: { in: [testProductIdA, testProductIdB] } } });
      await prisma.product.deleteMany({ where: { id: { in: [testProductIdA, testProductIdB] } } });
    }
    if (testVariantIdA || testVariantIdB) {
      await prisma.vehicleVariant.deleteMany({ where: { id: { in: [testVariantIdA, testVariantIdB] } } });
    }
    if (testEngineId) {
      await prisma.vehicleEngine.deleteMany({ where: { id: testEngineId } });
    }
    if (testGenId) {
      await prisma.vehicleGeneration.deleteMany({ where: { id: testGenId } });
    }
    if (testModelId) {
      await prisma.vehicleModel.deleteMany({ where: { id: testModelId } });
    }
    if (testMakeId) {
      await prisma.vehicleMake.deleteMany({ where: { id: testMakeId } });
    }
    await prisma.user.deleteMany({ where: { email: { in: ['m4-admin@mobex.co.th', 'm4-customer@test.com'] } } });
  });

  // ----------------------------------------------------------------------------
  // RESULTS SUMMARY
  // ----------------------------------------------------------------------------
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log('\n======================================================');
  console.log(`Results: ${passed} / ${total} M4 tests PASSED.`);
  if (failed > 0) {
    console.error(`❌ ${failed} tests FAILED.`);
    process.exit(1);
  } else {
    console.log('======================================================\n');
    console.log('🎉 Phase M4 Vehicle Hierarchy + Deterministic Fitment Test Suite PASSED 100%!\n');
  }

  await app.close();
}

runM4TestSuite().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
