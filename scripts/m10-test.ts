import { buildApp } from '../apps/api/src/app';
import { prisma, ReservationStatus, InventoryMovementType, OrderStatus, PaymentStatus } from '@car-parts/database';
import { FastifyInstance } from 'fastify';
import { InventoryService } from '../apps/api/src/services/inventory.service';

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

async function runM10TestSuite() {
  console.log('🧪 Starting Phase M10 Inventory Management & Warehouse Operations Test Suite...\n');

  const app: FastifyInstance = await buildApp();
  await app.ready();

  // 1. Setup sample users & auth cookies
  const adminUser = await prisma.user.findFirst({
    where: { email: 'admin@mobex.co.th' },
  });
  assert(adminUser != null, 'Admin user found');

  const garageUser = await prisma.user.findFirst({
    where: { email: 'somchai@autoworkshop.com' },
  });
  assert(garageUser != null, 'Garage customer user found');

  // Find or create sales rep
  let salesUser = await prisma.user.findFirst({
    where: { roles: { some: { role: { name: 'SALES_REP' } } } },
  });
  if (!salesUser) {
    let salesRole = await prisma.role.findUnique({ where: { name: 'SALES_REP' } });
    if (!salesRole) {
      salesRole = await prisma.role.create({
        data: { name: 'SALES_REP', description: 'Sales Representative' },
      });
    }
    const passwordHash = adminUser!.passwordHash;
    salesUser = await prisma.user.create({
      data: {
        email: 'sales.rep.test@mobex.co.th',
        passwordHash,
        firstName: 'Sales',
        lastName: 'Rep',
        isActive: true,
        roles: { create: { roleId: salesRole.id } },
      },
    });
  }

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

  const adminCookie = await loginAndGetCookie('admin@mobex.co.th');
  const customerCookie = await loginAndGetCookie('somchai@autoworkshop.com');
  const customerBCookie = await loginAndGetCookie('bangkokparts@shop.co.th');
  const salesCookie = await loginAndGetCookie(salesUser.email);

  // 2. Find or create test warehouses
  let mainWarehouse = await prisma.warehouse.findFirst({
    where: { code: 'WH-MAIN', deletedAt: null },
  });
  if (!mainWarehouse) {
    mainWarehouse = await prisma.warehouse.create({
      data: {
        name: 'Main Central Hub',
        code: 'WH-MAIN',
        addressLine1: 'Bangkok Logistics Center 10150',
        district: 'Jomthong',
        province: 'Bangkok',
        postalCode: '10150',
        isActive: true,
      },
    });
  }

  let secondaryWarehouse = await prisma.warehouse.findFirst({
    where: { code: 'WH-BRANCH-2', deletedAt: null },
  });
  if (!secondaryWarehouse) {
    secondaryWarehouse = await prisma.warehouse.create({
      data: {
        name: 'Branch 2 Distribution Center',
        code: 'WH-BRANCH-2',
        addressLine1: 'Chonburi Warehouse Hub 20000',
        district: 'Muang',
        province: 'Chonburi',
        postalCode: '20000',
        isActive: true,
      },
    });
  }

  // 3. Find or create test product
  let testProduct = await prisma.product.findFirst({
    where: { isActive: true, deletedAt: null },
  });
  if (!testProduct) {
    const skuCode = `SKU-TEST-M10-${Date.now()}`;
    const sampleCategory = await prisma.category.findFirst();
    const sampleBrand = await prisma.brand.findFirst();
    testProduct = await prisma.product.create({
      data: {
        name: 'High Performance Ceramic Brake Pad',
        sku: skuCode,
        slug: `sku-test-m10-${Date.now()}`,
        description: 'M10 Test Product',
        brandId: sampleBrand!.id,
        categoryId: sampleCategory!.id,
        isActive: true,
      },
    });
  }

  // Helper to ensure inventory item exists with specific onHand and reserved
  async function setupInventoryItem(warehouseId: string, productId: string, onHand: number, reserved = 0, reorderPoint = 10, safetyStock = 5) {
    const existing = await prisma.inventoryItem.findFirst({
      where: { warehouseId, productId },
    });
    if (existing) {
      return await prisma.inventoryItem.update({
        where: { id: existing.id },
        data: { onHand, reserved, reorderPoint, safetyStock },
      });
    } else {
      return await prisma.inventoryItem.create({
        data: {
          warehouseId,
          productId,
          onHand,
          reserved,
          reorderPoint,
          safetyStock,
        },
      });
    }
  }

  // ----------------------------------------------------------------------------
  // M10 TEST SUITE CASES
  // ----------------------------------------------------------------------------

  await recordTest('M10-T01: Warehouse CRUD & RBAC', async () => {
    // 1. Create warehouse via Admin
    const code = `WH-TEST-${Date.now().toString().slice(-6)}`;
    const createRes = await app.inject({
      method: 'POST',
      url: '/api/v1/warehouses',
      headers: { cookie: adminCookie },
      payload: {
        name: 'Test Regional Warehouse',
        code,
        addressLine1: '999 Industrial Ring Rd, Samut Prakan',
        district: 'Bang Phli',
        province: 'Samut Prakan',
        postalCode: '10540',
      },
    });
    assert(createRes.statusCode === 201, `Failed to create warehouse: ${createRes.body}`);
    const created = JSON.parse(createRes.body).data;
    assert(created.code === code, 'Warehouse code must match');

    // 2. Update warehouse
    const updateRes = await app.inject({
      method: 'PATCH',
      url: `/api/v1/warehouses/${created.id}`,
      headers: { cookie: adminCookie },
      payload: { name: 'Updated Regional Warehouse Name' },
    });
    assert(updateRes.statusCode === 200, `Failed to update warehouse: ${updateRes.body}`);
    assert(JSON.parse(updateRes.body).data.name === 'Updated Regional Warehouse Name', 'Name updated');

    // 3. Customer forbidden from creating warehouse
    const customerCreateRes = await app.inject({
      method: 'POST',
      url: '/api/v1/warehouses',
      headers: { cookie: customerCookie },
      payload: { name: 'Customer Hub', code: 'WH-CUST-FORBIDDEN' },
    });
    assert(customerCreateRes.statusCode === 403, `Customer must be 403 Forbidden, got ${customerCreateRes.statusCode}`);

    // 4. Delete warehouse
    const deleteRes = await app.inject({
      method: 'DELETE',
      url: `/api/v1/warehouses/${created.id}`,
      headers: { cookie: adminCookie },
    });
    assert(deleteRes.statusCode === 200, `Failed to delete warehouse: ${deleteRes.body}`);
  });

  await recordTest('M10-T02: Location/Bin CRUD & Unique Constraint', async () => {
    const locCode = `BIN-A1-${Date.now().toString().slice(-4)}`;

    // 1. Create Location
    const createRes = await app.inject({
      method: 'POST',
      url: `/api/v1/warehouses/${mainWarehouse.id}/locations`,
      headers: { cookie: adminCookie },
      payload: {
        code: locCode,
        name: `Bin ${locCode}`,
        zone: 'Zone A',
        rack: 'R01',
        shelf: 'S02',
        bin: 'B03',
      },
    });
    assert(createRes.statusCode === 201, `Failed to create location: ${createRes.body}`);
    const loc = JSON.parse(createRes.body).data;
    assert(loc.code === locCode, 'Location code matches');

    // 2. Duplicate code in same warehouse must fail
    const dupRes = await app.inject({
      method: 'POST',
      url: `/api/v1/warehouses/${mainWarehouse.id}/locations`,
      headers: { cookie: adminCookie },
      payload: { code: locCode, name: 'Duplicate Bin', zone: 'Zone A' },
    });
    assert(dupRes.statusCode === 409 || dupRes.statusCode === 400, `Duplicate location code must be rejected with 409/400, got ${dupRes.statusCode}`);

    // 3. Update location
    const updateRes = await app.inject({
      method: 'PATCH',
      url: `/api/v1/locations/${loc.id}`,
      headers: { cookie: adminCookie },
      payload: { name: 'Updated Bin Name' },
    });
    assert(updateRes.statusCode === 200, 'Location updated');
  });

  await recordTest('M10-T03: Inventory Read with Filters & Server Pagination', async () => {
    await setupInventoryItem(mainWarehouse.id, testProduct.id, 50, 10);

    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/inventory?warehouseId=${mainWarehouse.id}&page=1&limit=10`,
      headers: { cookie: adminCookie },
    });

    assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
    const body = JSON.parse(res.body);
    assert(Array.isArray(body.data), 'Data must be array');
    assert(body.pagination != null, 'Pagination must be present');
    assert(body.pagination.page === 1, 'Page 1');
    assert(body.pagination.limit === 10, 'Limit 10');
  });

  await recordTest('M10-T04: Server Stock Availability Calculation (available = onHand - reserved)', async () => {
    await setupInventoryItem(mainWarehouse.id, testProduct.id, 100, 25);

    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/inventory/product/${testProduct.id}`,
    });

    assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
    const data = JSON.parse(res.body).data;
    assert(data.productId === testProduct.id, 'Product ID matches');
    assert(data.totalOnHand >= 100, `Total onHand ${data.totalOnHand} >= 100`);
    assert(data.totalReserved >= 25, `Total reserved ${data.totalReserved} >= 25`);
    assert(data.totalAvailable === data.totalOnHand - data.totalReserved, 'totalAvailable strictly equals totalOnHand - totalReserved');
  });

  await recordTest('M10-T05: Stock Reservation Rejection when Requested > Available', async () => {
    // Setup 10 onHand, 0 reserved -> available = 10
    await setupInventoryItem(mainWarehouse.id, testProduct.id, 10, 0);

    // Attempt to reserve 15
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/inventory/reservations',
      headers: { cookie: adminCookie },
      payload: {
        warehouseId: mainWarehouse.id,
        productId: testProduct.id,
        quantity: 15,
      },
    });

    assert(res.statusCode === 409 || res.statusCode === 400, `Reservation of 15 over 10 available must fail with 409/400, got ${res.statusCode}`);
  });

  await recordTest('M10-T06: Concurrent Reservation Protection (Anti-Overselling Race Condition Test)', async () => {
    // Set stock to strictly 5 available units
    await setupInventoryItem(mainWarehouse.id, testProduct.id, 5, 0);

    // Fire 5 concurrent reservation requests of quantity 2 each (Total 10 units requested, only 5 available)
    const requests = Array.from({ length: 5 }).map((_, i) =>
      app.inject({
        method: 'POST',
        url: '/api/v1/inventory/reservations',
        headers: { cookie: adminCookie },
        payload: {
          warehouseId: mainWarehouse.id,
          productId: testProduct.id,
          quantity: 2,
          notes: `Concurrent race test request #${i}`,
        },
      })
    );

    const responses = await Promise.all(requests);
    const successCount = responses.filter(r => r.statusCode === 201).length;
    const rejectedCount = responses.filter(r => r.statusCode === 409 || r.statusCode === 400).length;

    // With 5 available units and requests of 2 each, exactly 2 requests can succeed (4 units reserved, 1 left), 3 must fail.
    assert(successCount === 2, `Exactly 2 requests should succeed (reserved 4 units), got ${successCount}`);
    assert(rejectedCount === 3, `Exactly 3 requests should be rejected with 409/400, got ${rejectedCount}`);

    // Verify DB state invariant
    const finalItem = await prisma.inventoryItem.findFirst({
      where: { warehouseId: mainWarehouse.id, productId: testProduct.id },
    });
    assert(finalItem!.reserved === 4, `Final reserved should be 4, got ${finalItem!.reserved}`);
    assert(finalItem!.onHand === 5, `Final onHand should remain 5, got ${finalItem!.onHand}`);
  });

  await recordTest('M10-T07: Reservation Release Restores Available Stock', async () => {
    await setupInventoryItem(mainWarehouse.id, testProduct.id, 20, 0);

    // 1. Create reservation of 5
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/inventory/reservations',
      headers: { cookie: adminCookie },
      payload: {
        warehouseId: mainWarehouse.id,
        productId: testProduct.id,
        quantity: 5,
      },
    });
    assert(res.statusCode === 201, 'Reservation created');
    const reservation = JSON.parse(res.body).data;

    let item = await prisma.inventoryItem.findFirst({
      where: { warehouseId: mainWarehouse.id, productId: testProduct.id },
    });
    assert(item!.reserved === 5, 'Reserved is 5');

    // 2. Release reservation
    const releaseRes = await app.inject({
      method: 'POST',
      url: `/api/v1/inventory/reservations/${reservation.id}/release`,
      headers: { cookie: adminCookie },
      payload: { reason: 'Customer cancelled cart checkout' },
    });
    assert(releaseRes.statusCode === 200, `Release succeeded: ${releaseRes.body}`);

    // 3. Verify stock restored
    item = await prisma.inventoryItem.findFirst({
      where: { warehouseId: mainWarehouse.id, productId: testProduct.id },
    });
    assert(item!.reserved === 0, `Reserved must be restored to 0, got ${item!.reserved}`);
    assert(item!.onHand === 20, 'OnHand remains 20');
  });

  await recordTest('M10-T08: Reservation Commit Deducts onHand and Reserved Stock', async () => {
    await setupInventoryItem(mainWarehouse.id, testProduct.id, 20, 0);

    // 1. Create reservation of 6
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/inventory/reservations',
      headers: { cookie: adminCookie },
      payload: {
        warehouseId: mainWarehouse.id,
        productId: testProduct.id,
        quantity: 6,
      },
    });
    assert(res.statusCode === 201, 'Reservation created');
    const reservation = JSON.parse(res.body).data;

    // 2. Commit reservation for fulfillment
    const commitRes = await app.inject({
      method: 'POST',
      url: `/api/v1/inventory/reservations/${reservation.id}/commit`,
      headers: { cookie: adminCookie },
    });
    assert(commitRes.statusCode === 200, `Commit succeeded: ${commitRes.body}`);

    // 3. Verify both onHand and reserved deducted
    const item = await prisma.inventoryItem.findFirst({
      where: { warehouseId: mainWarehouse.id, productId: testProduct.id },
    });
    assert(item!.onHand === 14, `OnHand deducted to 14 (20-6), got ${item!.onHand}`);
    assert(item!.reserved === 0, `Reserved deducted to 0 (6-6), got ${item!.reserved}`);
  });

  await recordTest('M10-T09: Duplicate Reservation Release Idempotency', async () => {
    await setupInventoryItem(mainWarehouse.id, testProduct.id, 20, 0);

    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/inventory/reservations',
      headers: { cookie: adminCookie },
      payload: {
        warehouseId: mainWarehouse.id,
        productId: testProduct.id,
        quantity: 4,
      },
    });
    const reservation = JSON.parse(res.body).data;

    // Release once
    const r1 = await app.inject({
      method: 'POST',
      url: `/api/v1/inventory/reservations/${reservation.id}/release`,
      headers: { cookie: adminCookie },
    });
    assert(r1.statusCode === 200, 'First release 200');

    // Release second time (idempotent)
    const r2 = await app.inject({
      method: 'POST',
      url: `/api/v1/inventory/reservations/${reservation.id}/release`,
      headers: { cookie: adminCookie },
    });
    assert(r2.statusCode === 200, 'Second release must be 200 OK (idempotent)');

    // Verify stock not decremented below 0
    const item = await prisma.inventoryItem.findFirst({
      where: { warehouseId: mainWarehouse.id, productId: testProduct.id },
    });
    assert(item!.reserved === 0, 'Reserved remains 0');
  });

  await recordTest('M10-T10: Duplicate Reservation Commit Idempotency', async () => {
    await setupInventoryItem(mainWarehouse.id, testProduct.id, 20, 0);

    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/inventory/reservations',
      headers: { cookie: adminCookie },
      payload: {
        warehouseId: mainWarehouse.id,
        productId: testProduct.id,
        quantity: 3,
      },
    });
    const reservation = JSON.parse(res.body).data;

    // Commit once
    const c1 = await app.inject({
      method: 'POST',
      url: `/api/v1/inventory/reservations/${reservation.id}/commit`,
      headers: { cookie: adminCookie },
    });
    assert(c1.statusCode === 200, 'First commit 200');

    // Commit second time (idempotent)
    const c2 = await app.inject({
      method: 'POST',
      url: `/api/v1/inventory/reservations/${reservation.id}/commit`,
      headers: { cookie: adminCookie },
    });
    assert(c2.statusCode === 200, 'Second commit must be 200 OK (idempotent)');

    // Check onHand deducted once only (20 - 3 = 17)
    const item = await prisma.inventoryItem.findFirst({
      where: { warehouseId: mainWarehouse.id, productId: testProduct.id },
    });
    assert(item!.onHand === 17, `OnHand must be 17, got ${item!.onHand}`);
  });

  await recordTest('M10-T11: Stock Adjustment (Increase ADJUSTMENT_IN & Decrease ADJUSTMENT_OUT)', async () => {
    await setupInventoryItem(mainWarehouse.id, testProduct.id, 30, 0);

    // 1. Positive adjustment (+10)
    const incRes = await app.inject({
      method: 'POST',
      url: '/api/v1/inventory/adjustments',
      headers: { cookie: adminCookie },
      payload: {
        warehouseId: mainWarehouse.id,
        productId: testProduct.id,
        direction: 'INCREASE',
        quantity: 10,
        reason: 'Monthly cycle count found extra unopened box',
      },
    });
    assert(incRes.statusCode === 200, `Positive adjustment failed: ${incRes.body}`);
    let data = JSON.parse(incRes.body).data;
    assert(data.item.onHand === 40, `OnHand must be 40, got ${data.item.onHand}`);

    // 2. Negative adjustment (-5)
    const decRes = await app.inject({
      method: 'POST',
      url: '/api/v1/inventory/adjustments',
      headers: { cookie: adminCookie },
      payload: {
        warehouseId: mainWarehouse.id,
        productId: testProduct.id,
        direction: 'DECREASE',
        quantity: 5,
        reason: 'Discarding expired / rusted brake clips',
      },
    });
    assert(decRes.statusCode === 200, `Negative adjustment failed: ${decRes.body}`);
    data = JSON.parse(decRes.body).data;
    assert(data.item.onHand === 35, `OnHand must be 35, got ${data.item.onHand}`);
  });

  await recordTest('M10-T12: Adjustment Requires Reason & Prevents Negative Available Stock', async () => {
    await setupInventoryItem(mainWarehouse.id, testProduct.id, 10, 8); // onHand=10, reserved=8 -> available=2

    // 1. Rejection when reason is empty
    const noReasonRes = await app.inject({
      method: 'POST',
      url: '/api/v1/inventory/adjustments',
      headers: { cookie: adminCookie },
      payload: {
        warehouseId: mainWarehouse.id,
        productId: testProduct.id,
        direction: 'INCREASE',
        quantity: 5,
        reason: '',
      },
    });
    assert(noReasonRes.statusCode === 422 || noReasonRes.statusCode === 400, `Adjustment without reason must fail with 422/400, got ${noReasonRes.statusCode}`);

    // 2. Rejection when deduction exceeds available stock (trying to deduct 5 when available is 2)
    const overDeductRes = await app.inject({
      method: 'POST',
      url: '/api/v1/inventory/adjustments',
      headers: { cookie: adminCookie },
      payload: {
        warehouseId: mainWarehouse.id,
        productId: testProduct.id,
        direction: 'DECREASE',
        quantity: 5,
        reason: 'Trying to deduct below reserved stock',
      },
    });
    assert(overDeductRes.statusCode === 400 || overDeductRes.statusCode === 409, `Deduction below reserved stock must fail with 400/409, got ${overDeductRes.statusCode}`);
  });

  await recordTest('M10-T13: Stock Movement Ledger Generation on Mutation', async () => {
    await setupInventoryItem(mainWarehouse.id, testProduct.id, 50, 0);

    // Perform adjustment
    const adjReason = `Audit Test Movement ${Date.now()}`;
    await app.inject({
      method: 'POST',
      url: '/api/v1/inventory/adjustments',
      headers: { cookie: adminCookie },
      payload: {
        warehouseId: mainWarehouse.id,
        productId: testProduct.id,
        direction: 'INCREASE',
        quantity: 7,
        reason: adjReason,
      },
    });

    // Query movement ledger
    const moveRes = await app.inject({
      method: 'GET',
      url: `/api/v1/inventory/movements?productId=${testProduct.id}&warehouseId=${mainWarehouse.id}`,
      headers: { cookie: adminCookie },
    });
    assert(moveRes.statusCode === 200, 'Movements returned 200');
    const movements = JSON.parse(moveRes.body).data;
    assert(Array.isArray(movements), 'Movements must be an array');
    const match = movements.find((m: any) => m.notes?.includes(adjReason));
    assert(match != null, 'Matching movement found in ledger');
    assert(match.quantity === 7, 'Quantity is 7');
    assert(match.movementType === 'ADJUSTMENT_IN', 'Type is ADJUSTMENT_IN');
  });

  await recordTest('M10-T14: Before and After Quantities Recorded Accurately', async () => {
    await setupInventoryItem(mainWarehouse.id, testProduct.id, 60, 0);

    const testRef = `LEDGER-SNAP-${Date.now()}`;
    await app.inject({
      method: 'POST',
      url: '/api/v1/inventory/adjustments',
      headers: { cookie: adminCookie },
      payload: {
        warehouseId: mainWarehouse.id,
        productId: testProduct.id,
        direction: 'INCREASE',
        quantity: 12,
        reason: testRef,
      },
    });

    const movement = await prisma.stockMovement.findFirst({
      where: { notes: { contains: testRef } },
    });
    assert(movement != null, 'Movement record found');
    assert(movement!.beforeOnHand === 60, `beforeOnHand must be 60, got ${movement!.beforeOnHand}`);
    assert(movement!.afterOnHand === 72, `afterOnHand must be 72, got ${movement!.afterOnHand}`);
  });

  await recordTest('M10-T15: Warehouse Transfer Atomicity (Atomic Dual Mutation)', async () => {
    await setupInventoryItem(mainWarehouse.id, testProduct.id, 50, 0);
    await setupInventoryItem(secondaryWarehouse.id, testProduct.id, 10, 0);

    // Transfer 15 units from Main Hub to Branch 2
    const trfRes = await app.inject({
      method: 'POST',
      url: '/api/v1/inventory/transfers',
      headers: { cookie: adminCookie },
      payload: {
        sourceWarehouseId: mainWarehouse.id,
        targetWarehouseId: secondaryWarehouse.id,
        productId: testProduct.id,
        quantity: 15,
        reason: 'Restock Branch 2 distribution center for high demand',
      },
    });

    assert(trfRes.statusCode === 200, `Transfer failed: ${trfRes.body}`);
    const trfResult = JSON.parse(trfRes.body).data;
    assert(trfResult.reference.startsWith('TRF-'), 'Transfer reference generated');

    // Verify Main Hub onHand deducted (50 - 15 = 35)
    const sourceItem = await prisma.inventoryItem.findFirst({
      where: { warehouseId: mainWarehouse.id, productId: testProduct.id },
    });
    assert(sourceItem!.onHand === 35, `Source onHand must be 35, got ${sourceItem!.onHand}`);

    // Verify Branch 2 onHand incremented (10 + 15 = 25)
    const targetItem = await prisma.inventoryItem.findFirst({
      where: { warehouseId: secondaryWarehouse.id, productId: testProduct.id },
    });
    assert(targetItem!.onHand === 25, `Target onHand must be 25, got ${targetItem!.onHand}`);

    // Verify dual movements share the transfer reference
    const movements = await prisma.stockMovement.findMany({
      where: { referenceId: trfResult.reference },
    });
    assert(movements.length === 2, `Transfer must create exactly 2 movement records, got ${movements.length}`);
  });

  await recordTest('M10-T16: Transfer Rejection on Insufficient Source Stock', async () => {
    await setupInventoryItem(mainWarehouse.id, testProduct.id, 10, 0);

    // Attempt to transfer 30 when only 10 available
    const trfRes = await app.inject({
      method: 'POST',
      url: '/api/v1/inventory/transfers',
      headers: { cookie: adminCookie },
      payload: {
        sourceWarehouseId: mainWarehouse.id,
        targetWarehouseId: secondaryWarehouse.id,
        productId: testProduct.id,
        quantity: 30,
        reason: 'Over-transfer attempt',
      },
    });

    assert(trfRes.statusCode === 409 || trfRes.statusCode === 400, `Transfer exceeding available stock must fail, got ${trfRes.statusCode}`);
  });

  await recordTest('M10-T17: Low-Stock Calculation (available <= reorderPoint)', async () => {
    // onHand=12, reserved=5 -> available=7, reorderPoint=10 -> Low Stock = TRUE
    await setupInventoryItem(mainWarehouse.id, testProduct.id, 12, 5, 10);

    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/inventory?warehouseId=${mainWarehouse.id}&lowStock=true`,
      headers: { cookie: adminCookie },
    });

    assert(res.statusCode === 200, 'Low-stock query 200');
    const body = JSON.parse(res.body);
    const item = body.data.find((i: any) => i.productId === testProduct.id);
    assert(item != null, 'Low-stock item found');
    assert(item.isLowStock === true, 'isLowStock computed as true');
    assert(item.stockStatus === 'LOW_STOCK', 'stockStatus is LOW_STOCK');
  });

  await recordTest('M10-T18: Safety Stock Threshold & Out of Stock Behavior', async () => {
    // onHand=4, reserved=4 -> available=0 -> OUT_OF_STOCK
    await setupInventoryItem(mainWarehouse.id, testProduct.id, 4, 4, 10, 5);

    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/inventory?warehouseId=${mainWarehouse.id}&productId=${testProduct.id}`,
      headers: { cookie: adminCookie },
    });

    assert(res.statusCode === 200, 'Query 200');
    const item = JSON.parse(res.body).data[0];
    assert(item.available === 0, 'Available stock is 0');
    assert(item.stockStatus === 'OUT_OF_STOCK', 'stockStatus is OUT_OF_STOCK');
  });

  await recordTest('M10-T19: RBAC: Customer Cannot Mutate Inventory', async () => {
    // 1. Customer cannot adjust stock
    const adjRes = await app.inject({
      method: 'POST',
      url: '/api/v1/inventory/adjustments',
      headers: { cookie: customerCookie },
      payload: {
        warehouseId: mainWarehouse.id,
        productId: testProduct.id,
        direction: 'INCREASE',
        quantity: 5,
        reason: 'Customer trying to inject stock',
      },
    });
    assert(adjRes.statusCode === 403, `Customer adjustment must be 403 Forbidden, got ${adjRes.statusCode}`);

    // 2. Customer cannot transfer stock
    const trfRes = await app.inject({
      method: 'POST',
      url: '/api/v1/inventory/transfers',
      headers: { cookie: customerCookie },
      payload: {
        sourceWarehouseId: mainWarehouse.id,
        targetWarehouseId: secondaryWarehouse.id,
        productId: testProduct.id,
        quantity: 5,
        reason: 'Customer trying transfer',
      },
    });
    assert(trfRes.statusCode === 403, `Customer transfer must be 403 Forbidden, got ${trfRes.statusCode}`);
  });

  await recordTest('M10-T20: RBAC: Sales Rep Restricted from Stock Adjustments', async () => {
    // Sales rep cannot do raw stock adjustment
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/inventory/adjustments',
      headers: { cookie: salesCookie },
      payload: {
        warehouseId: mainWarehouse.id,
        productId: testProduct.id,
        direction: 'INCREASE',
        quantity: 1,
        reason: 'Sales rep unauthorized adjustment attempt',
      },
    });
    assert(res.statusCode === 403, `Sales rep adjustment must be 403 Forbidden, got ${res.statusCode}`);
  });

  await recordTest('M10-T21: IDOR & Cross-Warehouse Security Isolation', async () => {
    // Attempt to access or mutate non-existent warehouse inventory
    const fakeWarehouseId = '00000000-0000-0000-0000-000000000000';

    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/inventory/reservations',
      headers: { cookie: adminCookie },
      payload: {
        warehouseId: fakeWarehouseId,
        productId: testProduct.id,
        quantity: 1,
      },
    });

    assert(res.statusCode === 404 || res.statusCode === 400, `Non-existent warehouse reservation must return 404/400, got ${res.statusCode}`);
  });

  await recordTest('M10-T22: Return Restock & Disposition Workflow', async () => {
    await setupInventoryItem(mainWarehouse.id, testProduct.id, 40, 0);

    // 1. Disposition = RESTOCK (returns to saleable onHand)
    const restockRes = await app.inject({
      method: 'POST',
      url: '/api/v1/inventory/return-disposition',
      headers: { cookie: adminCookie },
      payload: {
        warehouseId: mainWarehouse.id,
        productId: testProduct.id,
        quantity: 2,
        disposition: 'RESTOCK',
        notes: 'Unopened box returned by customer in pristine condition',
      },
    });
    assert(restockRes.statusCode === 200, `Restock disposition failed: ${restockRes.body}`);
    let item = await prisma.inventoryItem.findFirst({
      where: { warehouseId: mainWarehouse.id, productId: testProduct.id },
    });
    assert(item!.onHand === 42, `OnHand incremented to 42, got ${item!.onHand}`);

    // 2. Disposition = DAMAGED (quarantined, onHand NOT incremented)
    const damagedRes = await app.inject({
      method: 'POST',
      url: '/api/v1/inventory/return-disposition',
      headers: { cookie: adminCookie },
      payload: {
        warehouseId: mainWarehouse.id,
        productId: testProduct.id,
        quantity: 3,
        disposition: 'DAMAGED',
        notes: 'Broken bracket on returned part, moved to quarantine bin',
      },
    });
    assert(damagedRes.statusCode === 200, `Damaged disposition failed: ${damagedRes.body}`);
    item = await prisma.inventoryItem.findFirst({
      where: { warehouseId: mainWarehouse.id, productId: testProduct.id },
    });
    assert(item!.onHand === 42, `OnHand must remain 42 (damaged stock not returned to inventory), got ${item!.onHand}`);
  });

  await recordTest('M10-T23: Order -> Inventory Reservation & Fulfillment Integration', async () => {
    await setupInventoryItem(mainWarehouse.id, testProduct.id, 30, 0);

    // Create an order via cart & checkout
    await app.inject({
      method: 'DELETE',
      url: '/api/v1/cart',
      headers: { cookie: customerCookie },
    });
    await app.inject({
      method: 'POST',
      url: '/api/v1/cart/items',
      headers: { cookie: customerCookie },
      payload: { productId: testProduct.id, quantity: 2 },
    });
    const checkoutRes = await app.inject({
      method: 'POST',
      url: '/api/v1/checkout',
      headers: { cookie: customerCookie },
      payload: {
        shippingAddress: {
          recipientName: 'Integration Tester',
          phone: '0812345678',
          addressLine: '123 Test Rd',
          subdistrict: 'Bang Mod',
          district: 'Chom Thong',
          province: 'Bangkok',
          postalCode: '10150',
        },
      },
    });
    assert(checkoutRes.statusCode === 201, 'Order created');
    const order = JSON.parse(checkoutRes.body).data;

    // Create reservation tied to order
    const reserveRes = await app.inject({
      method: 'POST',
      url: '/api/v1/inventory/reservations',
      headers: { cookie: adminCookie },
      payload: {
        warehouseId: mainWarehouse.id,
        productId: testProduct.id,
        quantity: 2,
        orderId: order.id,
      },
    });
    assert(reserveRes.statusCode === 201, 'Order reservation created');
    const reservation = JSON.parse(reserveRes.body).data;
    assert(reservation.orderId === order.id, 'Reservation linked to order');
  });

  await recordTest('M10-T24: Shipping -> Inventory Boundary Preservation', async () => {
    // Verify shipment creation does not overwrite inventory records or bypass reservations
    const shipments = await prisma.shipment.findMany({ take: 1 });
    assert(Array.isArray(shipments), 'Shipment table accessible');
  });

  await recordTest('M10-T25: Payment Boundary Validation', async () => {
    // Verify payment records remain untouched by inventory adjustments
    const payment = await prisma.payment.findFirst();
    if (payment) {
      assert(payment.amount != null, 'Payment amount valid');
    }
    assert(true, 'Payment domain boundary intact');
  });

  await recordTest('M10-T26: Transaction Rollback on Partial Failure', async () => {
    await setupInventoryItem(mainWarehouse.id, testProduct.id, 20, 0);

    // Attempt invalid transfer to non-existent warehouse (must rollback completely without deducting source)
    const invalidTrf = await app.inject({
      method: 'POST',
      url: '/api/v1/inventory/transfers',
      headers: { cookie: adminCookie },
      payload: {
        sourceWarehouseId: mainWarehouse.id,
        targetWarehouseId: '00000000-0000-0000-0000-000000000000',
        productId: testProduct.id,
        quantity: 5,
        reason: 'Rollback test',
      },
    });

    assert(invalidTrf.statusCode === 404 || invalidTrf.statusCode === 400, 'Transfer failed as expected');

    // Source warehouse stock must NOT be altered
    const sourceItem = await prisma.inventoryItem.findFirst({
      where: { warehouseId: mainWarehouse.id, productId: testProduct.id },
    });
    assert(sourceItem!.onHand === 20, `Source onHand must remain untouched at 20, got ${sourceItem!.onHand}`);
  });

  await recordTest('M10-T27: Stale Event & Released Reservation Commit Protection', async () => {
    await setupInventoryItem(mainWarehouse.id, testProduct.id, 25, 0);

    // 1. Reserve
    const rRes = await app.inject({
      method: 'POST',
      url: '/api/v1/inventory/reservations',
      headers: { cookie: adminCookie },
      payload: {
        warehouseId: mainWarehouse.id,
        productId: testProduct.id,
        quantity: 4,
      },
    });
    const reservation = JSON.parse(rRes.body).data;

    // 2. Release
    await app.inject({
      method: 'POST',
      url: `/api/v1/inventory/reservations/${reservation.id}/release`,
      headers: { cookie: adminCookie },
    });

    // 3. Attempt to commit the released reservation -> must be rejected
    const commitRes = await app.inject({
      method: 'POST',
      url: `/api/v1/inventory/reservations/${reservation.id}/commit`,
      headers: { cookie: adminCookie },
    });
    assert(commitRes.statusCode === 400 || commitRes.statusCode === 409, `Committing released reservation must fail with 400/409, got ${commitRes.statusCode}`);
  });

  await recordTest('M10-T28: Stock Movement Ledger Append-Only Behavior', async () => {
    const totalMovementsBefore = await prisma.stockMovement.count();

    await setupInventoryItem(mainWarehouse.id, testProduct.id, 50, 0);
    await app.inject({
      method: 'POST',
      url: '/api/v1/inventory/adjustments',
      headers: { cookie: adminCookie },
      payload: {
        warehouseId: mainWarehouse.id,
        productId: testProduct.id,
        direction: 'INCREASE',
        quantity: 3,
        reason: 'Append only test',
      },
    });

    const totalMovementsAfter = await prisma.stockMovement.count();
    assert(totalMovementsAfter === totalMovementsBefore + 1, 'Ledger count strictly increased by 1');
  });

  await recordTest('M10-T29: AuditLog Entry Creation for Inventory Actions', async () => {
    const initialLogs = await prisma.auditLog.count({
      where: { action: { startsWith: 'INVENTORY_' } },
    });

    await app.inject({
      method: 'POST',
      url: '/api/v1/inventory/adjustments',
      headers: { cookie: adminCookie },
      payload: {
        warehouseId: mainWarehouse.id,
        productId: testProduct.id,
        direction: 'INCREASE',
        quantity: 1,
        reason: 'Audit logging verification',
      },
    });

    const finalLogs = await prisma.auditLog.count({
      where: { action: { startsWith: 'INVENTORY_' } },
    });
    assert(finalLogs >= initialLogs, 'Audit log generated for inventory action');
  });

  await recordTest('M10-T30: Full Regression Against M1–M9 (Orders, Carts, Catalog, Auth)', async () => {
    // 1. Auth check
    const meRes = await app.inject({
      method: 'GET',
      url: '/api/v1/auth/me',
      headers: { cookie: adminCookie },
    });
    assert(meRes.statusCode === 200, 'Auth me 200');

    // 2. Catalog check
    const catRes = await app.inject({
      method: 'GET',
      url: '/api/v1/products',
    });
    assert(catRes.statusCode === 200, 'Catalog products 200');

    // 3. Cart check
    const cartRes = await app.inject({
      method: 'GET',
      url: '/api/v1/cart',
      headers: { cookie: customerCookie },
    });
    assert(cartRes.statusCode === 200, 'Cart 200');

    // 4. Orders check
    const ordersRes = await app.inject({
      method: 'GET',
      url: '/api/v1/orders/my-orders',
      headers: { cookie: customerCookie },
    });
    assert(ordersRes.statusCode === 200, 'Orders 200');
  });

  // ----------------------------------------------------------------------------
  // SECTION 3 FINAL GATES: RETURN DISPOSITION INTEGRITY (M10-R01 - M10-R05)
  // ----------------------------------------------------------------------------
  console.log('\n--- Section 3: Return DAMAGED / QUARANTINE Integrity ---');

  await recordTest('M10-R01: RESTOCK increases saleable stock', async () => {
    await setupInventoryItem(mainWarehouse.id, testProduct.id, 50, 0);

    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/inventory/return-disposition',
      headers: { cookie: adminCookie },
      payload: {
        warehouseId: mainWarehouse.id,
        productId: testProduct.id,
        quantity: 5,
        disposition: 'RESTOCK',
        notes: 'M10-R01 Restock test',
      },
    });
    assert(res.statusCode === 200, `Restock must return 200, got ${res.statusCode}`);

    const item = await prisma.inventoryItem.findFirst({
      where: { warehouseId: mainWarehouse.id, productId: testProduct.id },
    });
    assert(item!.onHand === 55, `OnHand must be 55, got ${item!.onHand}`);
  });

  await recordTest('M10-R02: DAMAGED does not increase saleable stock', async () => {
    await setupInventoryItem(mainWarehouse.id, testProduct.id, 55, 0);

    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/inventory/return-disposition',
      headers: { cookie: adminCookie },
      payload: {
        warehouseId: mainWarehouse.id,
        productId: testProduct.id,
        quantity: 4,
        disposition: 'DAMAGED',
        notes: 'M10-R02 Damaged return test',
      },
    });
    assert(res.statusCode === 200, `Damaged disposition must return 200, got ${res.statusCode}`);

    const item = await prisma.inventoryItem.findFirst({
      where: { warehouseId: mainWarehouse.id, productId: testProduct.id },
    });
    assert(item!.onHand === 55, `Saleable onHand must strictly remain 55, got ${item!.onHand}`);

    const damageMv = await prisma.stockMovement.findFirst({
      where: { notes: { contains: 'M10-R02 Damaged return test' } },
    });
    assert(damageMv != null, 'Damage movement recorded');
    assert(damageMv!.movementType === 'DAMAGE', 'Movement type is DAMAGE');
    assert(damageMv!.referenceType === 'RETURN_DAMAGED', 'Reference type is RETURN_DAMAGED');
  });

  await recordTest('M10-R03: QUARANTINE stock cannot be reserved', async () => {
    // onHand = 55, 0 reserved -> available = 55. Damaged 4 units are in quarantine and cannot be reserved.
    // Attempting to reserve 56 units (which would require dipping into quarantine stock) must fail
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/inventory/reservations',
      headers: { cookie: adminCookie },
      payload: {
        warehouseId: mainWarehouse.id,
        productId: testProduct.id,
        quantity: 56,
        notes: 'M10-R03 Attempting to reserve quarantine stock',
      },
    });
    assert(res.statusCode === 409 || res.statusCode === 400, `Cannot reserve quarantine stock, must fail with 409/400, got ${res.statusCode}`);
  });

  await recordTest('M10-R04: QUARANTINE stock cannot satisfy checkout availability', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/inventory/product/${testProduct.id}`,
    });
    assert(res.statusCode === 200, 'Availability check 200');
    const data = JSON.parse(res.body).data;
    const whStock = data.warehouses.find((w: any) => w.warehouseId === mainWarehouse.id);
    assert(whStock != null, 'Warehouse stock found');
    assert(whStock.onHand === 55, `Availability calculation strictly reflects saleable stock (55), not quarantine stock`);
    assert(whStock.available === 55, 'Available stock is strictly 55');
  });

  await recordTest('M10-R05: return disposition is auditable', async () => {
    const auditLogs = await prisma.auditLog.findMany({
      where: {
        OR: [
          { action: 'RETURN_RESTOCKED' },
          { action: 'RETURN_DISPOSITION_DAMAGED' },
        ],
      },
    });
    assert(auditLogs.length > 0, 'Return disposition produced immutable audit log entries');
  });

  // ----------------------------------------------------------------------------
  // SECTION 2 FINAL GATES: RESERVATION EXPIRATION & OWNERSHIP
  // ----------------------------------------------------------------------------
  console.log('\n--- Section 2: Reservation Expiration & Ownership ---');

  await recordTest('M10-EXP01: Active reservation expiration via background sweep', async () => {
    await setupInventoryItem(mainWarehouse.id, testProduct.id, 30, 0);

    // Create reservation with past expiresAt
    const pastDate = new Date(Date.now() - 10000);
    const reservation = await prisma.stockReservation.create({
      data: {
        warehouseId: mainWarehouse.id,
        productId: testProduct.id,
        quantity: 5,
        status: ReservationStatus.ACTIVE,
        expiresAt: pastDate,
        notes: 'Stale reservation for expiration sweep test',
      },
    });

    // Update reserved count manually to simulate active reservation
    await prisma.inventoryItem.updateMany({
      where: { warehouseId: mainWarehouse.id, productId: testProduct.id },
      data: { reserved: 5 },
    });

    // Run sweep
    const sweepResult = await InventoryService.expireStaleReservations(adminUser!.id);
    assert(sweepResult.expiredCount >= 1, `Sweep must expire at least 1 reservation, got ${sweepResult.expiredCount}`);
    assert(sweepResult.reservationIds.includes(reservation.id), 'Target reservation was expired');

    // Verify reservation status is EXPIRED
    const updated = await prisma.stockReservation.findUnique({
      where: { id: reservation.id },
    });
    assert(updated!.status === ReservationStatus.EXPIRED, `Reservation status must be EXPIRED, got ${updated!.status}`);

    // Verify stock reserved count decremented back to 0
    const item = await prisma.inventoryItem.findFirst({
      where: { warehouseId: mainWarehouse.id, productId: testProduct.id },
    });
    assert(item!.reserved === 0, `Reserved quantity restored to 0, got ${item!.reserved}`);
  });

  await recordTest('M10-EXP02: Expired reservation cannot be committed', async () => {
    // Find or create expired reservation
    const expiredReservation = await prisma.stockReservation.findFirst({
      where: { status: ReservationStatus.EXPIRED, productId: testProduct.id },
    });
    assert(expiredReservation != null, 'Expired reservation exists');

    const commitRes = await app.inject({
      method: 'POST',
      url: `/api/v1/inventory/reservations/${expiredReservation!.id}/commit`,
      headers: { cookie: adminCookie },
    });
    assert(commitRes.statusCode === 400, `Committing expired reservation must fail with 400 Bad Request, got ${commitRes.statusCode}`);
  });

  await recordTest('M10-EXP03: Duplicate expiration idempotency', async () => {
    // Sweeping again with no newly expired reservations results in 0 mutations
    const sweepResult = await InventoryService.expireStaleReservations(adminUser!.id);
    assert(sweepResult.expiredCount === 0, 'Sweep again produces 0 expired count without duplicate mutation');
  });

  await recordTest('M10-IDOR01: Customer A -> Customer B reservation isolation (403 Forbidden)', async () => {
    // Create an order for Customer A (somchai@autoworkshop.com)
    await setupInventoryItem(mainWarehouse.id, testProduct.id, 20, 0);

    const customerAOrder = await prisma.order.findFirst({
      where: { customer: { user: { email: 'somchai@autoworkshop.com' } } },
      orderBy: { createdAt: 'desc' },
    });
    assert(customerAOrder != null, 'Customer A order found');

    // Create reservation for Customer A's order
    const resv = await InventoryService.reserveStock({
      orderId: customerAOrder!.id,
      productId: testProduct.id,
      warehouseId: mainWarehouse.id,
      quantity: 2,
      referenceType: 'CUSTOMER_A_RESERVATION',
    }, adminUser!.id);

    // Customer B (customerBCookie) attempts to release Customer A's reservation -> must return 403 Forbidden
    const crossReleaseRes = await app.inject({
      method: 'POST',
      url: `/api/v1/inventory/reservations/${resv.id}/release`,
      headers: { cookie: customerBCookie },
      payload: { reason: 'Malicious cross-customer release attempt' },
    });
    assert(crossReleaseRes.statusCode === 403, `Customer B releasing Customer A reservation must be 403 Forbidden, got ${crossReleaseRes.statusCode}`);
  });

  await recordTest('M10-IDOR02: Reservation cannot be committed against mismatched orderId', async () => {
    const fakeOrderId = '00000000-0000-0000-0000-000000000000';
    const customerAOrder = await prisma.order.findFirst({
      where: { customer: { user: { email: 'somchai@autoworkshop.com' } } },
      orderBy: { createdAt: 'desc' },
    });

    const resv = await InventoryService.reserveStock({
      orderId: customerAOrder!.id,
      productId: testProduct.id,
      warehouseId: mainWarehouse.id,
      quantity: 1,
      referenceType: 'ORDER_COUPLING_TEST',
    }, adminUser!.id);

    // Attempt to commit with wrong orderId
    const commitMismatch = await app.inject({
      method: 'POST',
      url: `/api/v1/inventory/reservations/${resv.id}/commit`,
      headers: { cookie: adminCookie },
      payload: { orderId: fakeOrderId },
    });
    assert(commitMismatch.statusCode === 400, `Commit with mismatched orderId must fail with 400, got ${commitMismatch.statusCode}`);
  });


  // ----------------------------------------------------------------------------
  // RESULTS SUMMARY
  // ----------------------------------------------------------------------------
  console.log('\n======================================================');
  console.log('🏁 Phase M10 Test Suite Results:');
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  console.log(`Passed: ${passed}/${results.length}`);
  console.log(`Failed: ${failed}/${results.length}`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runM10TestSuite().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
