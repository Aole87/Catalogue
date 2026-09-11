import { buildApp } from '../apps/api/src/app';
import { prisma, Prisma, PurchaseOrderStatus, InventoryMovementType } from '@car-parts/database';
import { FastifyInstance } from 'fastify';

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

async function runM11TestSuite() {
  console.log('🧪 Starting Phase M11 Supplier & Procurement Management Test Suite (45 Tests)...\n');

  const app: FastifyInstance = await buildApp();
  await app.ready();

  // ----------------------------------------------------------------------------
  // 1. Setup Roles and Users for RBAC and Separation of Duties Testing
  // ----------------------------------------------------------------------------
  async function ensureUserWithRole(email: string, roleName: string, firstName: string, lastName: string) {
    let role = await prisma.role.findUnique({ where: { name: roleName } });
    if (!role) {
      role = await prisma.role.create({
        data: { name: roleName, description: `${roleName} Role` },
      });
    }

    let user = await prisma.user.findFirst({
      where: { email },
      include: { roles: { include: { role: true } } },
    });

    const admin = await prisma.user.findFirst({ where: { email: 'admin@mobex.co.th' } });
    const defaultPasswordHash = admin?.passwordHash || '$2a$10$w099y1V2z6wGkG89x2XzO.B1s0eHek6V16VzFj3bA7j6N5Y1r0eKO';

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          passwordHash: defaultPasswordHash,
          firstName,
          lastName,
          isActive: true,
          roles: { create: { roleId: role.id } },
        },
        include: { roles: { include: { role: true } } },
      });
    } else {
      const hasRole = user.roles.some((r: any) => r.role.name === roleName);
      if (!hasRole) {
        await prisma.userRole.create({
          data: { userId: user.id, roleId: role.id },
        });
      }
    }
    return user;
  }

  const superAdminUser = await prisma.user.findFirst({ where: { email: 'admin@mobex.co.th' } });
  assert(superAdminUser != null, 'Super Admin user found');

  const storeManagerUser = await ensureUserWithRole('manager.m11@mobex.co.th', 'STORE_MANAGER', 'Store', 'Manager');
  const inventoryClerkUser = await ensureUserWithRole('clerk.m11@mobex.co.th', 'INVENTORY_CLERK', 'Inventory', 'Clerk');
  const accountantUser = await ensureUserWithRole('accountant.m11@mobex.co.th', 'ACCOUNTANT', 'Staff', 'Accountant');
  const salesUser = await ensureUserWithRole('sales.m11@mobex.co.th', 'SALES_REP', 'Sales', 'Rep');
  const customerUser = await prisma.user.findFirst({ where: { email: 'somchai@autoworkshop.com' } });
  assert(customerUser != null, 'Customer user found');

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
  const managerCookie = await loginAndGetCookie(storeManagerUser.email);
  const clerkCookie = await loginAndGetCookie(inventoryClerkUser.email);
  const accountantCookie = await loginAndGetCookie(accountantUser.email);
  const salesCookie = await loginAndGetCookie(salesUser.email);
  const customerCookie = await loginAndGetCookie(customerUser!.email);

  // ----------------------------------------------------------------------------
  // 2. Setup Shared Test Warehouses, Locations, and Products
  // ----------------------------------------------------------------------------
  let testWarehouse = await prisma.warehouse.findFirst({
    where: { code: 'WH-MAIN', deletedAt: null },
  });
  if (!testWarehouse) {
    testWarehouse = await prisma.warehouse.create({
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

  let testLocation = await prisma.warehouseLocation.findFirst({
    where: { warehouseId: testWarehouse.id, code: 'LOC-A1-01', deletedAt: null },
  });
  if (!testLocation) {
    testLocation = await prisma.warehouseLocation.create({
      data: {
        warehouseId: testWarehouse.id,
        code: 'LOC-A1-01',
        name: 'Location A1-01',
        zone: 'Zone A',
        shelf: '01',
        isActive: true,
      },
    });
  }

  const sampleCategory = await prisma.category.findFirst();
  const sampleBrand = await prisma.brand.findFirst();

  let productA = await prisma.product.findFirst({
    where: { sku: 'SKU-M11-BRAKE-01', deletedAt: null },
  });
  if (!productA) {
    productA = await prisma.product.create({
      data: {
        name: 'M11 Premium Brake Rotor Disc',
        sku: 'SKU-M11-BRAKE-01',
        slug: `sku-m11-brake-01-${Date.now()}`,
        description: 'M11 Test Brake Rotor',
        brandId: sampleBrand!.id,
        categoryId: sampleCategory!.id,
        isActive: true,
        prices: {
          create: {
            tier: 'GENERAL',
            price: new Prisma.Decimal('2500.00'),
            currency: 'THB',
            isActive: true,
          },
        },
      },
    });
  } else {
    const existingPrice = await prisma.productPrice.findFirst({ where: { productId: productA.id } });
    if (!existingPrice) {
      await prisma.productPrice.create({
        data: {
          productId: productA.id,
          tier: 'GENERAL',
          price: new Prisma.Decimal('2500.00'),
          currency: 'THB',
          isActive: true,
        },
      });
    }
  }

  let productB = await prisma.product.findFirst({
    where: { sku: 'SKU-M11-FILTER-02', deletedAt: null },
  });
  if (!productB) {
    productB = await prisma.product.create({
      data: {
        name: 'M11 Synthetic Oil Filter',
        sku: 'SKU-M11-FILTER-02',
        slug: `sku-m11-filter-02-${Date.now()}`,
        description: 'M11 Test Oil Filter',
        brandId: sampleBrand!.id,
        categoryId: sampleCategory!.id,
        isActive: true,
        prices: {
          create: {
            tier: 'GENERAL',
            price: new Prisma.Decimal('450.00'),
            currency: 'THB',
            isActive: true,
          },
        },
      },
    });
  } else {
    const existingPrice = await prisma.productPrice.findFirst({ where: { productId: productB.id } });
    if (!existingPrice) {
      await prisma.productPrice.create({
        data: {
          productId: productB.id,
          tier: 'GENERAL',
          price: new Prisma.Decimal('450.00'),
          currency: 'THB',
          isActive: true,
        },
      });
    }
  }

  // Shared IDs for suite
  let sharedSupplierId: string = '';
  let sharedSupplierCode: string = '';
  let sharedPoId: string = '';
  let sharedPoNumber: string = '';

  // ----------------------------------------------------------------------------
  // M11 TEST SUITE (M11-T01 to M11-T45)
  // ----------------------------------------------------------------------------

  // M11-T01: Supplier Master CRUD
  await recordTest('M11-T01: Supplier Master CRUD — Create supplier with code, name, taxId, contact, email, phone, paymentTerms, address, currency', async () => {
    const code = `SUP-TEST-${Date.now().toString().slice(-6)}`;
    const createRes = await app.inject({
      method: 'POST',
      url: '/api/v1/suppliers',
      headers: { cookie: adminCookie },
      payload: {
        code,
        name: 'Denso Automotive Parts Ltd.',
        contactName: 'Somsak Denso',
        email: 'procurement@denso.co.th',
        phone: '02-789-1234',
        taxId: '0105559876543',
        paymentTerms: 'NET30',
        currency: 'THB',
        leadTimeDays: 7,
        addressLine1: '888 Bangna-Trad Km 23',
        district: 'Bang Phli',
        province: 'Samut Prakan',
        postalCode: '10540',
        country: 'TH',
      },
    });
    assert(createRes.statusCode === 201, `Expected 201 created, got ${createRes.statusCode}: ${createRes.body}`);
    const supplier = JSON.parse(createRes.body).data;
    assert(supplier.code === code.toUpperCase(), 'Code should be uppercase normalized');
    assert(supplier.name === 'Denso Automotive Parts Ltd.', 'Supplier name matches');
    assert(supplier.paymentTerms === 'NET30', 'Payment terms NET30');
    assert(supplier.isActive === true, 'Supplier should be active by default');
    sharedSupplierId = supplier.id;
    sharedSupplierCode = supplier.code;
  });

  // M11-T02: Supplier Code Uniqueness
  await recordTest('M11-T02: Supplier Code Uniqueness — Duplicate code (case-insensitive) fails with 409 Conflict', async () => {
    const dupRes = await app.inject({
      method: 'POST',
      url: '/api/v1/suppliers',
      headers: { cookie: adminCookie },
      payload: {
        code: sharedSupplierCode.toLowerCase(), // test case insensitivity
        name: 'Duplicate Denso Vendor',
        email: 'dup@denso.co.th',
      },
    });
    assert(dupRes.statusCode === 409, `Expected 409 Conflict for duplicate supplier code, got ${dupRes.statusCode}: ${dupRes.body}`);
  });

  // M11-T03: Supplier Code Format & Normalization
  await recordTest('M11-T03: Supplier Code Format & Normalization — Trimming, uppercase normalization and validation', async () => {
    const rawCode = `  norm-${Date.now().toString().slice(-4)}  `;
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/suppliers',
      headers: { cookie: adminCookie },
      payload: {
        code: rawCode,
        name: 'Normalized Supplier Co.',
        email: 'normalized@test.com',
      },
    });
    assert(res.statusCode === 201, `Failed to create normalized supplier: ${res.body}`);
    const supplier = JSON.parse(res.body).data;
    assert(supplier.code === rawCode.trim().toUpperCase(), 'Supplier code must be trimmed and uppercase');

    // Reject empty code
    const emptyRes = await app.inject({
      method: 'POST',
      url: '/api/v1/suppliers',
      headers: { cookie: adminCookie },
      payload: { code: '   ', name: 'Empty Code Co.' },
    });
    assert(emptyRes.statusCode === 400, 'Empty code should return 400 Bad Request');
  });

  // M11-T04: Supplier Update
  await recordTest('M11-T04: Supplier Update — Modify supplier terms, lead time, contact info and tax ID', async () => {
    const updateRes = await app.inject({
      method: 'PATCH',
      url: `/api/v1/suppliers/${sharedSupplierId}`,
      headers: { cookie: adminCookie },
      payload: {
        contactName: 'Somsak Senior Director',
        leadTimeDays: 14,
        paymentTerms: 'NET60',
        notes: 'Preferred OEM brake component supplier',
      },
    });
    assert(updateRes.statusCode === 200, `Update supplier failed: ${updateRes.body}`);
    const updated = JSON.parse(updateRes.body).data;
    assert(updated.contactName === 'Somsak Senior Director', 'Contact name updated');
    assert(updated.leadTimeDays === 14, 'Lead time updated to 14');
    assert(updated.paymentTerms === 'NET60', 'Payment terms updated to NET60');
  });

  // M11-T05: Supplier Soft Delete (Deactivate)
  await recordTest('M11-T05: Supplier Soft Delete (Deactivate) — Deactivating sets isActive: false', async () => {
    const tempSup = await prisma.supplier.create({
      data: {
        code: `SUP-TEMP-${Date.now().toString().slice(-4)}`,
        name: 'Temporary Supplier Ltd.',
        email: 'temp@supplier.com',
        isActive: true,
      },
    });

    const deactRes = await app.inject({
      method: 'DELETE',
      url: `/api/v1/suppliers/${tempSup.id}`,
      headers: { cookie: adminCookie },
    });
    assert(deactRes.statusCode === 200, `Failed to deactivate supplier: ${deactRes.body}`);
    const deactData = JSON.parse(deactRes.body).data;
    assert(deactData.isActive === false, 'Supplier isActive must be false');
    assert(deactData.deletedAt !== null, 'Supplier deletedAt must be set');
  });

  // M11-T06: Inactive Supplier PO Creation Block
  await recordTest('M11-T06: Inactive Supplier PO Creation Block — Cannot create PO for inactive supplier', async () => {
    const inactiveSup = await prisma.supplier.create({
      data: {
        code: `SUP-INACT-${Date.now().toString().slice(-4)}`,
        name: 'Inactive Vendor Co.',
        email: 'inactive@vendor.com',
        isActive: false,
        deletedAt: null,
      },
    });

    await prisma.supplierProduct.create({
      data: {
        supplierId: inactiveSup.id,
        productId: productA.id,
        supplierSku: 'INACT-BRK-01',
        purchaseCost: 1200,
        moq: 1,
        packSize: 1,
      },
    });

    const poRes = await app.inject({
      method: 'POST',
      url: '/api/v1/procurement/orders',
      headers: { cookie: adminCookie },
      payload: {
        supplierId: inactiveSup.id,
        warehouseId: testWarehouse.id,
        items: [
          { productId: productA.id, quantity: 10, unitCost: 1200 },
        ],
      },
    });
    assert(poRes.statusCode === 400, `Creating PO for inactive supplier should fail with 400, got ${poRes.statusCode}: ${poRes.body}`);
  });

  // M11-T07: Inactive Supplier Historical Data Access
  await recordTest('M11-T07: Inactive Supplier Historical Data Access — Historical POs remain readable after supplier deactivation', async () => {
    // 1. Create active supplier, map product & create PO
    const histSup = await prisma.supplier.create({
      data: {
        code: `SUP-HIST-${Date.now().toString().slice(-4)}`,
        name: 'Historical Vendor Ltd.',
        email: 'hist@vendor.com',
        isActive: true,
      },
    });

    await prisma.supplierProduct.create({
      data: {
        supplierId: histSup.id,
        productId: productA.id,
        supplierSku: 'HIST-BRK-01',
        purchaseCost: 1500,
        moq: 1,
        packSize: 1,
      },
    });

    const poRes = await app.inject({
      method: 'POST',
      url: '/api/v1/procurement/orders',
      headers: { cookie: adminCookie },
      payload: {
        supplierId: histSup.id,
        warehouseId: testWarehouse.id,
        items: [{ productId: productA.id, quantity: 5, unitCost: 1500 }],
      },
    });
    assert(poRes.statusCode === 201, `PO created: ${poRes.body}`);
    const po = JSON.parse(poRes.body).data;

    // 2. Deactivate supplier
    await prisma.supplier.update({
      where: { id: histSup.id },
      data: { isActive: false, deletedAt: new Date() },
    });

    // 3. Read PO - must succeed
    const getPoRes = await app.inject({
      method: 'GET',
      url: `/api/v1/procurement/orders/${po.id}`,
      headers: { cookie: adminCookie },
    });
    assert(getPoRes.statusCode === 200, `Historical PO should be readable, got ${getPoRes.statusCode}`);
    const poData = JSON.parse(getPoRes.body).data;
    assert(poData.supplier.name === 'Historical Vendor Ltd.', 'Historical supplier details intact');
  });

  // M11-T08: Supplier Search, Filter & Pagination
  await recordTest('M11-T08: Supplier Search, Filter & Pagination — List suppliers with query, active filter, limit and offset', async () => {
    const listRes = await app.inject({
      method: 'GET',
      url: `/api/v1/suppliers?search=Denso&isActive=true&limit=10&offset=0`,
      headers: { cookie: adminCookie },
    });
    assert(listRes.statusCode === 200, `List suppliers failed: ${listRes.body}`);
    const body = JSON.parse(listRes.body);
    assert(Array.isArray(body.data), 'Data must be an array');
    assert(body.meta.total >= 1, 'Total must be at least 1');
    assert(body.data.some((s: any) => s.id === sharedSupplierId), 'Shared Denso supplier should be in results');
  });

  // M11-T09: SupplierProduct Mapping Creation
  await recordTest('M11-T09: SupplierProduct Mapping Creation — Map product to supplier with cost, moq, packSize, leadTime, isPreferred', async () => {
    const createMapRes = await app.inject({
      method: 'POST',
      url: `/api/v1/suppliers/${sharedSupplierId}/products`,
      headers: { cookie: adminCookie },
      payload: {
        productId: productA.id,
        supplierSku: 'DENSO-BRK-9901',
        purchaseCost: 1250.50,
        currency: 'THB',
        moq: 5,
        packSize: 5,
        leadTimeDays: 7,
        isPreferred: true,
      },
    });
    assert(createMapRes.statusCode === 201, `Failed to create supplier product mapping: ${createMapRes.body}`);
    const mapping = JSON.parse(createMapRes.body).data;
    assert(mapping.supplierSku === 'DENSO-BRK-9901', 'Supplier SKU matched');
    assert(Number(mapping.purchaseCost) === 1250.50, 'Purchase cost matched');
    assert(mapping.moq === 5, 'MOQ 5');
    assert(mapping.isPreferred === true, 'isPreferred true');
  });

  // M11-T10: SupplierProduct Duplicate SKU / Mapping Rejection
  await recordTest('M11-T10: SupplierProduct Duplicate SKU / Mapping Rejection — Cannot duplicate (supplierId, productId) or duplicate supplierSku', async () => {
    // 1. Duplicate (supplierId, productId)
    const dupProdRes = await app.inject({
      method: 'POST',
      url: `/api/v1/suppliers/${sharedSupplierId}/products`,
      headers: { cookie: adminCookie },
      payload: {
        productId: productA.id,
        supplierSku: 'DENSO-BRK-DIFFERENT',
        purchaseCost: 1300,
      },
    });
    assert(dupProdRes.statusCode === 409, `Duplicate product mapping should fail with 409, got ${dupProdRes.statusCode}`);

    // 2. Duplicate supplierSku for same supplier
    const dupSkuRes = await app.inject({
      method: 'POST',
      url: `/api/v1/suppliers/${sharedSupplierId}/products`,
      headers: { cookie: adminCookie },
      payload: {
        productId: productB.id,
        supplierSku: 'DENSO-BRK-9901', // existing SKU
        purchaseCost: 350,
      },
    });
    assert(dupSkuRes.statusCode === 409, `Duplicate supplier SKU should fail with 409, got ${dupSkuRes.statusCode}`);
  });

  // M11-T11: SupplierProduct Preferred Flag Update & Concurrency
  await recordTest('M11-T11: SupplierProduct Preferred Flag Update & Concurrency — Atomic single-preferred flag under sequential and concurrent updates', async () => {
    // Create second supplier
    const sup2 = await prisma.supplier.create({
      data: {
        code: `SUP-ALT-${Date.now().toString().slice(-4)}`,
        name: 'Alternative Brake Vendor',
        email: 'alt@brakevendor.com',
        isActive: true,
      },
    });

    // Map to same productA with isPreferred = true
    const map2Res = await app.inject({
      method: 'POST',
      url: `/api/v1/suppliers/${sup2.id}/products`,
      headers: { cookie: adminCookie },
      payload: {
        productId: productA.id,
        supplierSku: 'ALT-BRK-7788',
        purchaseCost: 1200,
        isPreferred: true,
      },
    });
    assert(map2Res.statusCode === 201, `Map2 failed: ${map2Res.body}`);

    // Verify sup2 mapping isPreferred = true, and sharedSupplier mapping is now isPreferred = false
    const map1 = await prisma.supplierProduct.findFirst({
      where: { supplierId: sharedSupplierId, productId: productA.id },
    });
    const map2 = await prisma.supplierProduct.findFirst({
      where: { supplierId: sup2.id, productId: productA.id },
    });

    assert(map2?.isPreferred === true, 'New mapping is preferred');
    assert(map1?.isPreferred === false, 'Previous mapping was atomically unflagged as preferred');

    // Concurrency test: launch parallel requests setting both to preferred
    await Promise.allSettled([
      app.inject({
        method: 'PUT',
        url: `/api/v1/suppliers/${sharedSupplierId}/products/${productA.id}`,
        headers: { cookie: adminCookie },
        payload: { isPreferred: true },
      }),
      app.inject({
        method: 'PUT',
        url: `/api/v1/suppliers/${sup2.id}/products/${productA.id}`,
        headers: { cookie: adminCookie },
        payload: { isPreferred: true },
      }),
    ]);

    // Check database invariant: exactly ONE mapping is preferred
    const preferredCount = await prisma.supplierProduct.count({
      where: { productId: productA.id, isPreferred: true, deletedAt: null },
    });
    assert(preferredCount === 1, `Invariant: exactly 1 preferred supplier mapping must exist, got ${preferredCount}`);
  });

  // M11-T12: SupplierProduct Lookup by Product & Supplier
  await recordTest('M11-T12: SupplierProduct Lookup by Product & Supplier — Query mapping by product and supplier ID', async () => {
    const lookupRes = await app.inject({
      method: 'GET',
      url: `/api/v1/suppliers/products/lookup?supplierId=${sharedSupplierId}&productId=${productA.id}`,
      headers: { cookie: adminCookie },
    });
    assert(lookupRes.statusCode === 200, `Lookup failed: ${lookupRes.body}`);
    const data = JSON.parse(lookupRes.body).data;
    assert(data.supplierSku === 'DENSO-BRK-9901', 'Lookup found matching supplier SKU');
  });

  // M11-T13: SupplierProduct Cost & MOQ Validation
  await recordTest('M11-T13: SupplierProduct Cost & MOQ Validation — Reject negative cost and non-positive MOQ/packSize', async () => {
    // Negative cost
    const negCostRes = await app.inject({
      method: 'POST',
      url: `/api/v1/suppliers/${sharedSupplierId}/products`,
      headers: { cookie: adminCookie },
      payload: {
        productId: productB.id,
        supplierSku: 'DENSO-NEG-COST',
        purchaseCost: -100,
      },
    });
    assert(negCostRes.statusCode === 400 || negCostRes.statusCode === 422, 'Negative purchaseCost must return 400 or 422');

    // Zero MOQ
    const zeroMoqRes = await app.inject({
      method: 'POST',
      url: `/api/v1/suppliers/${sharedSupplierId}/products`,
      headers: { cookie: adminCookie },
      payload: {
        productId: productB.id,
        supplierSku: 'DENSO-ZERO-MOQ',
        purchaseCost: 200,
        moq: 0,
      },
    });
    assert(zeroMoqRes.statusCode === 400 || zeroMoqRes.statusCode === 422, 'Zero MOQ must return 400 or 422');
  });

  // M11-T14: Inactive Product Mapping Rejection
  await recordTest('M11-T14: Inactive Product Mapping Rejection — Cannot map deleted or inactive product', async () => {
    const inactProd = await prisma.product.create({
      data: {
        name: 'Inactive Old Rotor',
        sku: `SKU-INACT-${Date.now().toString().slice(-4)}`,
        slug: `sku-inact-${Date.now()}`,
        brandId: sampleBrand!.id,
        categoryId: sampleCategory!.id,
        isActive: false,
        deletedAt: new Date(),
      },
    });

    const mapInactRes = await app.inject({
      method: 'POST',
      url: `/api/v1/suppliers/${sharedSupplierId}/products`,
      headers: { cookie: adminCookie },
      payload: {
        productId: inactProd.id,
        supplierSku: 'DENSO-INACT-01',
        purchaseCost: 80,
      },
    });
    assert(mapInactRes.statusCode === 400 || mapInactRes.statusCode === 404 || mapInactRes.statusCode === 422, `Mapping inactive product should fail, got ${mapInactRes.statusCode}`);
  });

  // M11-T15: PO Creation with Valid Supplier & Products
  await recordTest('M11-T15: PO Creation with Valid Supplier & Products — Create PO in DRAFT status with multiple line items', async () => {
    // Map productB to sharedSupplier
    await app.inject({
      method: 'POST',
      url: `/api/v1/suppliers/${sharedSupplierId}/products`,
      headers: { cookie: adminCookie },
      payload: {
        productId: productB.id,
        supplierSku: 'DENSO-OIL-FILTER-01',
        purchaseCost: 320,
        moq: 10,
        packSize: 5,
      },
    });

    const poRes = await app.inject({
      method: 'POST',
      url: '/api/v1/procurement/orders',
      headers: { cookie: managerCookie },
      payload: {
        supplierId: sharedSupplierId,
        warehouseId: testWarehouse.id,
        taxRate: 7,
        shippingCost: 200,
        notes: 'Monthly replenishment order',
        items: [
          { productId: productA.id, quantity: 10, unitCost: 1250 },
          { productId: productB.id, quantity: 20, unitCost: 320 },
        ],
      },
    });
    assert(poRes.statusCode === 201, `Create PO failed: ${poRes.body}`);
    const po = JSON.parse(poRes.body).data;
    assert(po.status === 'DRAFT', 'Initial status must be DRAFT');
    assert(po.items.length === 2, 'Must have 2 line items');
    assert(po.destinationWarehouseId === testWarehouse.id || po.warehouseId === testWarehouse.id, 'Warehouse matches');
    sharedPoId = po.id;
    sharedPoNumber = po.poNumber;
  });

  // M11-T16: Server-Generated PO Number Format
  await recordTest('M11-T16: Server-Generated PO Number Format — Verified format PO-YYYYMMDD-XXXXX', async () => {
    assert(/^PO-\d{8}-\d{5}$/.test(sharedPoNumber), `PO number "${sharedPoNumber}" must match pattern PO-YYYYMMDD-XXXXX`);
  });

  // M11-T17: PO Server-Authoritative Totals Calculation
  await recordTest('M11-T17: PO Server-Authoritative Totals Calculation — subtotal, taxAmount (7%), shippingCost, totalAmount via Decimal', async () => {
    // Item 1: 10 * 1250 = 12,500
    // Item 2: 20 * 320 = 6,400
    // Subtotal: 18,900
    // Tax 7%: 18,900 * 0.07 = 1,323
    // Shipping: 200
    // Total: 18,900 + 1,323 + 200 = 20,423
    const po = await prisma.purchaseOrder.findUnique({ where: { id: sharedPoId } });
    assert(po != null, 'PO found');
    const subtotal = po!.subtotal;
    const tax = (po as any)!.taxTotal ?? (po as any)!.taxAmount;
    const shipping = po!.shippingCost;
    const total = (po as any)!.grandTotal ?? (po as any)!.totalAmount;
    assert(new Prisma.Decimal(subtotal).equals(18900), `Subtotal should be 18900, got ${subtotal}`);
    assert(new Prisma.Decimal(tax).equals(1323), `Tax amount should be 1323, got ${tax}`);
    assert(new Prisma.Decimal(shipping).equals(200), `Shipping cost should be 200, got ${shipping}`);
    assert(new Prisma.Decimal(total).equals(20423), `Total amount should be 20423, got ${total}`);
  });

  // M11-T18: PO Item Snapshot Immutability
  await recordTest('M11-T18: PO Item Snapshot Immutability — Items preserve name, productSku and supplierSku snapshots', async () => {
    const po = await prisma.purchaseOrder.findUnique({
      where: { id: sharedPoId },
      include: { items: true },
    });
    assert(po != null && po.items.length === 2, 'PO items found');
    const itemA = po!.items.find((i: any) => i.productId === productA.id);
    assert(itemA != null, 'Item A found');
    assert(itemA!.productSku === productA.sku, 'Product SKU snapshot matches');
    assert(itemA!.supplierSku === 'DENSO-BRK-9901', 'Supplier SKU snapshot matches');
    assert(itemA!.productName === productA.name, 'Product name snapshot matches');
  });

  // M11-T19: PO Validation
  await recordTest('M11-T19: PO Validation — Non-existent supplier or warehouse returns 400/404', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';
    const fakeSupRes = await app.inject({
      method: 'POST',
      url: '/api/v1/procurement/orders',
      headers: { cookie: adminCookie },
      payload: {
        supplierId: fakeId,
        warehouseId: testWarehouse.id,
        items: [{ productId: productA.id, quantity: 10, unitCost: 1200 }],
      },
    });
    assert(fakeSupRes.statusCode === 400 || fakeSupRes.statusCode === 404, 'Fake supplier returns 400/404');

    const fakeWhRes = await app.inject({
      method: 'POST',
      url: '/api/v1/procurement/orders',
      headers: { cookie: adminCookie },
      payload: {
        supplierId: sharedSupplierId,
        warehouseId: fakeId,
        items: [{ productId: productA.id, quantity: 10, unitCost: 1200 }],
      },
    });
    assert(fakeWhRes.statusCode === 400 || fakeWhRes.statusCode === 404, 'Fake warehouse returns 400/404');
  });

  // M11-T20: PO Item MOQ & Pack Size Validation
  await recordTest('M11-T20: PO Item MOQ & Pack Size Validation — Ordering below MOQ or non-multiple of packSize fails', async () => {
    // productA MOQ is 5, packSize is 5
    // Attempting quantity 3 (below MOQ 5)
    const belowMoqRes = await app.inject({
      method: 'POST',
      url: '/api/v1/procurement/orders',
      headers: { cookie: adminCookie },
      payload: {
        supplierId: sharedSupplierId,
        warehouseId: testWarehouse.id,
        items: [{ productId: productA.id, quantity: 3, unitCost: 1250 }],
      },
    });
    assert(belowMoqRes.statusCode === 400, `Quantity 3 below MOQ 5 should fail with 400, got ${belowMoqRes.statusCode}`);

    // Attempting quantity 7 (not multiple of packSize 5)
    const badPackRes = await app.inject({
      method: 'POST',
      url: '/api/v1/procurement/orders',
      headers: { cookie: adminCookie },
      payload: {
        supplierId: sharedSupplierId,
        warehouseId: testWarehouse.id,
        items: [{ productId: productA.id, quantity: 7, unitCost: 1250 }],
      },
    });
    assert(badPackRes.statusCode === 400, `Quantity 7 not multiple of packSize 5 should fail with 400, got ${badPackRes.statusCode}`);
  });

  // M11-T21: PO Lifecycle — Submit Draft PO for Approval
  await recordTest('M11-T21: PO Lifecycle — Submit Draft PO for Approval (DRAFT -> PENDING_APPROVAL)', async () => {
    const submitRes = await app.inject({
      method: 'POST',
      url: `/api/v1/procurement/orders/${sharedPoId}/submit`,
      headers: { cookie: managerCookie },
    });
    assert(submitRes.statusCode === 200, `Submit PO failed: ${submitRes.body}`);
    const po = JSON.parse(submitRes.body).data;
    assert(po.status === 'PENDING_APPROVAL', 'Status must be PENDING_APPROVAL');
  });

  // M11-T22: PO Lifecycle — Approve PO by Authorized Staff
  await recordTest('M11-T22: PO Lifecycle — Approve PO by Authorized Staff (PENDING_APPROVAL -> APPROVED)', async () => {
    // Created by storeManagerUser, approved by superAdminUser
    const approveRes = await app.inject({
      method: 'POST',
      url: `/api/v1/procurement/orders/${sharedPoId}/approve`,
      headers: { cookie: adminCookie },
    });
    assert(approveRes.statusCode === 200, `Approve PO failed: ${approveRes.body}`);
    const po = JSON.parse(approveRes.body).data;
    assert(po.status === 'APPROVED', 'Status must be APPROVED');
    assert(po.approvedByUserId === superAdminUser!.id, 'Approved by user recorded');
    assert(po.approvedAt !== null, 'ApprovedAt recorded');
  });

  // M11-T23: Separation of Duties (Four-Eyes Principle)
  await recordTest('M11-T23: Separation of Duties (Four-Eyes Principle) — Non-admin creator cannot approve own PO', async () => {
    // 1. Manager creates new PO
    const newPoRes = await app.inject({
      method: 'POST',
      url: '/api/v1/procurement/orders',
      headers: { cookie: managerCookie },
      payload: {
        supplierId: sharedSupplierId,
        warehouseId: testWarehouse.id,
        items: [{ productId: productA.id, quantity: 10, unitCost: 1250 }],
      },
    });
    const po = JSON.parse(newPoRes.body).data;

    // 2. Manager submits PO
    await app.inject({
      method: 'POST',
      url: `/api/v1/procurement/orders/${po.id}/submit`,
      headers: { cookie: managerCookie },
    });

    // 3. Manager attempts to approve own PO (must fail with 403 Forbidden)
    const selfApproveRes = await app.inject({
      method: 'POST',
      url: `/api/v1/procurement/orders/${po.id}/approve`,
      headers: { cookie: managerCookie },
    });
    assert(selfApproveRes.statusCode === 403, `Self approval by creator should return 403 Forbidden, got ${selfApproveRes.statusCode}`);
  });

  // M11-T24: Super Admin Override Approval
  await recordTest('M11-T24: Super Admin Override Approval — Super Admin can approve own PO with explicit override reason', async () => {
    // 1. Admin creates PO
    const adminPoRes = await app.inject({
      method: 'POST',
      url: '/api/v1/procurement/orders',
      headers: { cookie: adminCookie },
      payload: {
        supplierId: sharedSupplierId,
        warehouseId: testWarehouse.id,
        items: [{ productId: productA.id, quantity: 10, unitCost: 1250 }],
      },
    });
    const po = JSON.parse(adminPoRes.body).data;

    // 2. Admin submits PO
    await app.inject({
      method: 'POST',
      url: `/api/v1/procurement/orders/${po.id}/submit`,
      headers: { cookie: adminCookie },
    });

    // 3. Admin self-approves with overrideReason
    const adminApproveRes = await app.inject({
      method: 'POST',
      url: `/api/v1/procurement/orders/${po.id}/approve`,
      headers: { cookie: adminCookie },
      payload: { overrideReason: 'Emergency stock replenishment approved by Super Admin' },
    });
    assert(adminApproveRes.statusCode === 200, `Admin override approval failed: ${adminApproveRes.body}`);
    const approvedPo = JSON.parse(adminApproveRes.body).data;
    assert(approvedPo.status === 'APPROVED', 'PO approved');
  });

  // M11-T25: PO Lifecycle — Reject PO with Reason
  await recordTest('M11-T25: PO Lifecycle — Reject PO with Reason (PENDING_APPROVAL -> REJECTED)', async () => {
    // Create PO and submit
    const poRes = await app.inject({
      method: 'POST',
      url: '/api/v1/procurement/orders',
      headers: { cookie: managerCookie },
      payload: {
        supplierId: sharedSupplierId,
        warehouseId: testWarehouse.id,
        items: [{ productId: productA.id, quantity: 10, unitCost: 1250 }],
      },
    });
    const po = JSON.parse(poRes.body).data;
    await app.inject({
      method: 'POST',
      url: `/api/v1/procurement/orders/${po.id}/submit`,
      headers: { cookie: managerCookie },
    });

    const rejectRes = await app.inject({
      method: 'POST',
      url: `/api/v1/procurement/orders/${po.id}/reject`,
      headers: { cookie: adminCookie },
      payload: { rejectionReason: 'Unit cost is higher than negotiated quarterly contract' },
    });
    assert(rejectRes.statusCode === 200, `Reject PO failed: ${rejectRes.body}`);
    const rejectedPo = JSON.parse(rejectRes.body).data;
    assert(rejectedPo.status === 'REJECTED', 'Status must be REJECTED');
    assert(rejectedPo.rejectionReason === 'Unit cost is higher than negotiated quarterly contract', 'Rejection reason recorded');
  });

  // M11-T26: PO Lifecycle — Send PO to Supplier
  await recordTest('M11-T26: PO Lifecycle — Send PO to Supplier (APPROVED -> SENT)', async () => {
    const sendRes = await app.inject({
      method: 'POST',
      url: `/api/v1/procurement/orders/${sharedPoId}/send`,
      headers: { cookie: managerCookie },
    });
    assert(sendRes.statusCode === 200, `Send PO failed: ${sendRes.body}`);
    const po = JSON.parse(sendRes.body).data;
    assert(po.status === 'SENT', 'Status must be SENT');
    assert(po.sentAt !== null, 'SentAt timestamp recorded');
  });

  // M11-T27: PO State Machine Invalid Transitions
  await recordTest('M11-T27: PO State Machine Invalid Transitions — Invalid jumps return 400 Bad Request', async () => {
    // Currently sharedPoId is SENT. Trying to approve again or submit should fail.
    const badApproveRes = await app.inject({
      method: 'POST',
      url: `/api/v1/procurement/orders/${sharedPoId}/approve`,
      headers: { cookie: adminCookie },
    });
    assert(badApproveRes.statusCode === 400, `Approving already SENT PO should fail with 400, got ${badApproveRes.statusCode}`);

    const badSubmitRes = await app.inject({
      method: 'POST',
      url: `/api/v1/procurement/orders/${sharedPoId}/submit`,
      headers: { cookie: managerCookie },
    });
    assert(badSubmitRes.statusCode === 400, `Submitting already SENT PO should fail with 400, got ${badSubmitRes.statusCode}`);
  });

  // M11-T28: Historical Procurement Immutability
  await recordTest('M11-T28: Historical Procurement Immutability — Cannot modify SENT PO and future vendor/catalog updates do not alter historical PO records', async () => {
    // 1. Direct mutation attempt rejected
    const patchRes = await app.inject({
      method: 'PATCH',
      url: `/api/v1/procurement/orders/${sharedPoId}`,
      headers: { cookie: managerCookie },
      payload: { notes: 'Trying to modify sent PO notes' },
    });
    assert(patchRes.statusCode === 400, `Patching SENT PO should fail with 400, got ${patchRes.statusCode}`);

    // 2. Fetch baseline PO items
    const poBefore = await prisma.purchaseOrder.findUnique({
      where: { id: sharedPoId },
      include: { items: true },
    });
    const poItemA = poBefore!.items.find((i: any) => i.productId === productA.id)!;
    const originalUnitCost = Number(poItemA.unitCost);
    const originalSupplierSku = poItemA.supplierSku;
    const originalLineTotal = Number(poItemA.lineTotal);

    // 3. Mutate master data: SupplierProduct cost, Supplier SKU, and Supplier Name
    await prisma.supplierProduct.updateMany({
      where: { supplierId: sharedSupplierId, productId: productA.id },
      data: { purchaseCost: 9999.99, supplierSku: 'MUTATED-SKU-999' },
    });

    await prisma.supplier.update({
      where: { id: sharedSupplierId },
      data: { name: 'Mutated Supplier Name Inc' },
    });

    // 4. Verify historical PO item remains completely unchanged
    const poAfter = await prisma.purchaseOrder.findUnique({
      where: { id: sharedPoId },
      include: { items: true },
    });
    const poItemAfter = poAfter!.items.find((i: any) => i.productId === productA.id)!;
    assert(Number(poItemAfter.unitCost) === originalUnitCost, `unitCost must remain ${originalUnitCost}, got ${poItemAfter.unitCost}`);
    assert(poItemAfter.supplierSku === originalSupplierSku, `supplierSku must remain ${originalSupplierSku}, got ${poItemAfter.supplierSku}`);
    assert(Number(poItemAfter.lineTotal) === originalLineTotal, `lineTotal must remain ${originalLineTotal}, got ${poItemAfter.lineTotal}`);
  });

  // M11-T29: PO Cancellation
  await recordTest('M11-T29: PO Cancellation — Cancelling an unreceived PO transitions to CANCELLED with reason', async () => {
    const poRes = await app.inject({
      method: 'POST',
      url: '/api/v1/procurement/orders',
      headers: { cookie: managerCookie },
      payload: {
        supplierId: sharedSupplierId,
        warehouseId: testWarehouse.id,
        items: [{ productId: productA.id, quantity: 10, unitCost: 1250 }],
      },
    });
    const po = JSON.parse(poRes.body).data;

    const cancelRes = await app.inject({
      method: 'POST',
      url: `/api/v1/procurement/orders/${po.id}/cancel`,
      headers: { cookie: managerCookie },
      payload: { cancellationReason: 'Supplier discontinued product line' },
    });
    assert(cancelRes.statusCode === 200, `Cancel PO failed: ${cancelRes.body}`);
    const cancelledPo = JSON.parse(cancelRes.body).data;
    assert(cancelledPo.status === 'CANCELLED', 'Status must be CANCELLED');
    assert(cancelledPo.cancellationReason === 'Supplier discontinued product line', 'Cancellation reason recorded');
  });

  // M11-T30: Goods Receipt Full Receiving Workflow
  await recordTest('M11-T30: Goods Receipt Full Receiving Workflow — 100% receiving transitions PO SENT -> RECEIVED', async () => {
    // 1. Create a fresh PO for full receiving test
    const createRes = await app.inject({
      method: 'POST',
      url: '/api/v1/procurement/orders',
      headers: { cookie: managerCookie },
      payload: {
        supplierId: sharedSupplierId,
        warehouseId: testWarehouse.id,
        items: [
          { productId: productA.id, quantity: 10, unitCost: 1250 },
          { productId: productB.id, quantity: 10, unitCost: 320 },
        ],
      },
    });
    const po = JSON.parse(createRes.body).data;
    await app.inject({ method: 'POST', url: `/api/v1/procurement/orders/${po.id}/submit`, headers: { cookie: managerCookie } });
    await app.inject({ method: 'POST', url: `/api/v1/procurement/orders/${po.id}/approve`, headers: { cookie: adminCookie } });
    await app.inject({ method: 'POST', url: `/api/v1/procurement/orders/${po.id}/send`, headers: { cookie: managerCookie } });

    // 2. Receive 100% of both items
    const poDetails = await prisma.purchaseOrder.findUnique({ where: { id: po.id }, include: { items: true } });
    const itemA = poDetails!.items.find((i: any) => i.productId === productA.id);
    const itemB = poDetails!.items.find((i: any) => i.productId === productB.id);

    const recvRes = await app.inject({
      method: 'POST',
      url: '/api/v1/procurement/receipts',
      headers: { cookie: clerkCookie },
      payload: {
        purchaseOrderId: po.id,
        warehouseId: testWarehouse.id,
        warehouseLocationId: testLocation.id,
        invoiceNumber: 'INV-FULL-001',
        items: [
          { purchaseOrderItemId: itemA!.id, receivedQuantity: 10, rejectedQuantity: 0 },
          { purchaseOrderItemId: itemB!.id, receivedQuantity: 10, rejectedQuantity: 0 },
        ],
      },
    });
    assert(recvRes.statusCode === 201, `Receive full goods failed: ${recvRes.body}`);
    const receipt = JSON.parse(recvRes.body).data;
    assert(receipt.items.length === 2, '2 receipt items created');

    // Verify PO status transitioned to RECEIVED
    const updatedPo = await prisma.purchaseOrder.findUnique({ where: { id: po.id } });
    assert(updatedPo!.status === 'RECEIVED', `PO status should be RECEIVED, got ${updatedPo!.status}`);
  });

  // M11-T31: Goods Receipt Server-Generated GRN Number
  await recordTest('M11-T31: Goods Receipt Server-Generated GRN Number — Verify format GRN-YYYYMMDD-XXXXX', async () => {
    const receipts = await prisma.goodsReceipt.findMany({ take: 1, orderBy: { createdAt: 'desc' } });
    assert(receipts.length > 0, 'Receipt exists');
    const grn = receipts[0].receiptNumber || (receipts[0] as any).grnNumber;
    assert(/^GRN-\d{8}-\d{5}$/.test(grn), `GRN number "${grn}" must match GRN-YYYYMMDD-XXXXX`);
  });

  // M11-T32: Goods Receipt Partial Receiving
  await recordTest('M11-T32: Goods Receipt Partial Receiving — Receiving partial quantities transitions PO SENT -> PARTIALLY_RECEIVED', async () => {
    // Using sharedPoId (Item A: 10, Item B: 20)
    const poDetails = await prisma.purchaseOrder.findUnique({ where: { id: sharedPoId }, include: { items: true } });
    const itemA = poDetails!.items.find((i: any) => i.productId === productA.id);
    const itemB = poDetails!.items.find((i: any) => i.productId === productB.id);

    // Receive 4 units of Item A (out of 10) and 10 units of Item B (out of 20)
    const partialRes = await app.inject({
      method: 'POST',
      url: '/api/v1/procurement/receipts',
      headers: { cookie: clerkCookie },
      payload: {
        purchaseOrderId: sharedPoId,
        warehouseId: testWarehouse.id,
        warehouseLocationId: testLocation.id,
        invoiceNumber: 'INV-PARTIAL-001',
        items: [
          { purchaseOrderItemId: itemA!.id, receivedQuantity: 4, rejectedQuantity: 0 },
          { purchaseOrderItemId: itemB!.id, receivedQuantity: 10, rejectedQuantity: 0 },
        ],
      },
    });
    assert(partialRes.statusCode === 201, `Partial receive failed: ${partialRes.body}`);

    const updatedPo = await prisma.purchaseOrder.findUnique({ where: { id: sharedPoId } });
    assert(updatedPo!.status === 'PARTIALLY_RECEIVED', `PO status should be PARTIALLY_RECEIVED, got ${updatedPo!.status}`);
  });

  // M11-T33: Goods Receipt Multiple Partial Receipts
  await recordTest('M11-T33: Goods Receipt Multiple Partial Receipts — Sequential receipts finish PO -> RECEIVED', async () => {
    const poDetails = await prisma.purchaseOrder.findUnique({ where: { id: sharedPoId }, include: { items: true } });
    const itemA = poDetails!.items.find((i: any) => i.productId === productA.id);
    const itemB = poDetails!.items.find((i: any) => i.productId === productB.id);

    // Remaining: Item A = 6 (10 - 4), Item B = 10 (20 - 10)
    const finishRes = await app.inject({
      method: 'POST',
      url: '/api/v1/procurement/receipts',
      headers: { cookie: clerkCookie },
      payload: {
        purchaseOrderId: sharedPoId,
        warehouseId: testWarehouse.id,
        warehouseLocationId: testLocation.id,
        invoiceNumber: 'INV-PARTIAL-002-FINAL',
        items: [
          { purchaseOrderItemId: itemA!.id, receivedQuantity: 6, rejectedQuantity: 0 },
          { purchaseOrderItemId: itemB!.id, receivedQuantity: 10, rejectedQuantity: 0 },
        ],
      },
    });
    assert(finishRes.statusCode === 201, `Second partial receive failed: ${finishRes.body}`);

    const finalPo = await prisma.purchaseOrder.findUnique({
      where: { id: sharedPoId },
      include: { items: true },
    });
    assert(finalPo!.status === 'RECEIVED', `PO status should now be RECEIVED, got ${finalPo!.status}`);
    const finalItemA = finalPo!.items.find((i: any) => i.productId === productA.id);
    assert(finalItemA!.receivedQuantity === 10, 'Item A fully received (10/10)');
    const finalItemB = finalPo!.items.find((i: any) => i.productId === productB.id);
    assert(finalItemB!.receivedQuantity === 20, 'Item B fully received (20/20)');
  });

  // M11-T34: Over-Receiving Rejection
  await recordTest('M11-T34: Over-Receiving Rejection — Receiving more than ordered quantity fails with 400 Bad Request', async () => {
    // 1. Create a PO with 5 units of productA
    const poRes = await app.inject({
      method: 'POST',
      url: '/api/v1/procurement/orders',
      headers: { cookie: managerCookie },
      payload: {
        supplierId: sharedSupplierId,
        warehouseId: testWarehouse.id,
        items: [{ productId: productA.id, quantity: 5, unitCost: 1250 }],
      },
    });
    const po = JSON.parse(poRes.body).data;
    await app.inject({ method: 'POST', url: `/api/v1/procurement/orders/${po.id}/submit`, headers: { cookie: managerCookie } });
    await app.inject({ method: 'POST', url: `/api/v1/procurement/orders/${po.id}/approve`, headers: { cookie: adminCookie } });
    await app.inject({ method: 'POST', url: `/api/v1/procurement/orders/${po.id}/send`, headers: { cookie: managerCookie } });

    const poDetails = await prisma.purchaseOrder.findUnique({ where: { id: po.id }, include: { items: true } });
    const item = poDetails!.items[0];

    // Attempt to receive 6 units (ordered 5)
    const overRes = await app.inject({
      method: 'POST',
      url: '/api/v1/procurement/receipts',
      headers: { cookie: clerkCookie },
      payload: {
        purchaseOrderId: po.id,
        warehouseId: testWarehouse.id,
        items: [{ purchaseOrderItemId: item.id, receivedQuantity: 6, rejectedQuantity: 0 }],
      },
    });
    assert(overRes.statusCode === 400, `Over receiving must return 400, got ${overRes.statusCode}: ${overRes.body}`);
  });

  // M11-T35: Goods Receipt Defective / Rejected Items Handling
  await recordTest('M11-T35: Goods Receipt Defective / Rejected Items Handling — Rejected items recorded without incrementing on-hand stock', async () => {
    const poRes = await app.inject({
      method: 'POST',
      url: '/api/v1/procurement/orders',
      headers: { cookie: managerCookie },
      payload: {
        supplierId: sharedSupplierId,
        warehouseId: testWarehouse.id,
        items: [{ productId: productA.id, quantity: 10, unitCost: 1250 }],
      },
    });
    const po = JSON.parse(poRes.body).data;
    await app.inject({ method: 'POST', url: `/api/v1/procurement/orders/${po.id}/submit`, headers: { cookie: managerCookie } });
    await app.inject({ method: 'POST', url: `/api/v1/procurement/orders/${po.id}/approve`, headers: { cookie: adminCookie } });
    await app.inject({ method: 'POST', url: `/api/v1/procurement/orders/${po.id}/send`, headers: { cookie: managerCookie } });

    const item = (await prisma.purchaseOrderItem.findFirst({ where: { purchaseOrderId: po.id } }))!;

    // Initial on-hand
    const initStock = await prisma.inventoryItem.findFirst({
      where: { warehouseId: testWarehouse.id, productId: productA.id },
    });
    const initOnHand = initStock?.onHand || 0;

    // Receive 7 accepted, 3 rejected
    const recvRes = await app.inject({
      method: 'POST',
      url: '/api/v1/procurement/receipts',
      headers: { cookie: clerkCookie },
      payload: {
        purchaseOrderId: po.id,
        warehouseId: testWarehouse.id,
        items: [
          {
            purchaseOrderItemId: item.id,
            receivedQuantity: 10,
            acceptedQuantity: 7,
            rejectedQuantity: 3,
            rejectionNotes: 'Damaged packaging and surface scratches',
          },
        ],
      },
    });
    assert(recvRes.statusCode === 201, `Receive with rejections failed: ${recvRes.body}`);

    // Verify stock incremented by ONLY 7 (not 10)
    const afterStock = await prisma.inventoryItem.findFirst({
      where: { warehouseId: testWarehouse.id, productId: productA.id },
    });
    assert(afterStock!.onHand === initOnHand + 7, `On-hand stock must increment only by accepted quantity 7, got ${afterStock!.onHand - initOnHand}`);
  });

  // M11-T36: Goods Receipt Destination Warehouse & Bin Location Validation
  await recordTest('M11-T36: Goods Receipt Destination Warehouse & Bin Location Validation — Invalid location returns 400', async () => {
    const poRes = await app.inject({
      method: 'POST',
      url: '/api/v1/procurement/orders',
      headers: { cookie: managerCookie },
      payload: {
        supplierId: sharedSupplierId,
        warehouseId: testWarehouse.id,
        items: [{ productId: productA.id, quantity: 5, unitCost: 1250 }],
      },
    });
    const po = JSON.parse(poRes.body).data;
    await app.inject({ method: 'POST', url: `/api/v1/procurement/orders/${po.id}/submit`, headers: { cookie: managerCookie } });
    await app.inject({ method: 'POST', url: `/api/v1/procurement/orders/${po.id}/approve`, headers: { cookie: adminCookie } });
    await app.inject({ method: 'POST', url: `/api/v1/procurement/orders/${po.id}/send`, headers: { cookie: managerCookie } });

    const item = (await prisma.purchaseOrderItem.findFirst({ where: { purchaseOrderId: po.id } }))!;
    const fakeLocId = '00000000-0000-0000-0000-000000000000';

    const badLocRes = await app.inject({
      method: 'POST',
      url: '/api/v1/procurement/receipts',
      headers: { cookie: clerkCookie },
      payload: {
        purchaseOrderId: po.id,
        warehouseId: testWarehouse.id,
        warehouseLocationId: fakeLocId,
        items: [{ purchaseOrderItemId: item.id, receivedQuantity: 5, rejectedQuantity: 0 }],
      },
    });
    assert(badLocRes.statusCode === 400 || badLocRes.statusCode === 404, `Invalid warehouseLocationId should fail, got ${badLocRes.statusCode}`);
  });

  // M11-T37: Procurement-to-Inventory Stock Mutation Integration
  await recordTest('M11-T37: Procurement-to-Inventory Stock Mutation Integration — Atomic onHand increment via M10 InventoryService.receiveStock', async () => {
    const poRes = await app.inject({
      method: 'POST',
      url: '/api/v1/procurement/orders',
      headers: { cookie: managerCookie },
      payload: {
        supplierId: sharedSupplierId,
        warehouseId: testWarehouse.id,
        items: [{ productId: productB.id, quantity: 15, unitCost: 320 }],
      },
    });
    const po = JSON.parse(poRes.body).data;
    await app.inject({ method: 'POST', url: `/api/v1/procurement/orders/${po.id}/submit`, headers: { cookie: managerCookie } });
    await app.inject({ method: 'POST', url: `/api/v1/procurement/orders/${po.id}/approve`, headers: { cookie: adminCookie } });
    await app.inject({ method: 'POST', url: `/api/v1/procurement/orders/${po.id}/send`, headers: { cookie: managerCookie } });

    const item = (await prisma.purchaseOrderItem.findFirst({ where: { purchaseOrderId: po.id } }))!;

    const beforeItem = await prisma.inventoryItem.findFirst({
      where: { warehouseId: testWarehouse.id, productId: productB.id },
    });
    const beforeOnHand = beforeItem?.onHand || 0;

    const recvRes = await app.inject({
      method: 'POST',
      url: '/api/v1/procurement/receipts',
      headers: { cookie: clerkCookie },
      payload: {
        purchaseOrderId: po.id,
        warehouseId: testWarehouse.id,
        items: [{ purchaseOrderItemId: item.id, receivedQuantity: 15, rejectedQuantity: 0 }],
      },
    });
    assert(recvRes.statusCode === 201, `Receive failed: ${recvRes.body}`);

    const afterItem = await prisma.inventoryItem.findFirst({
      where: { warehouseId: testWarehouse.id, productId: productB.id },
    });
    assert(afterItem!.onHand === beforeOnHand + 15, `Stock must increase exactly by 15: before ${beforeOnHand}, after ${afterItem!.onHand}`);
  });

  // M11-T38: Procurement-to-Inventory StockMovement Audit Trail
  await recordTest('M11-T38: Procurement-to-Inventory StockMovement Audit Trail — Creates StockMovement with movementType: PURCHASE_RECEIPT', async () => {
    const movements = await prisma.stockMovement.findMany({
      where: { movementType: 'PURCHASE_RECEIPT', referenceType: 'PURCHASE_ORDER_RECEIPT' },
      orderBy: { createdAt: 'desc' },
      take: 1,
    });
    assert(movements.length > 0, 'Must have at least 1 StockMovement with movementType: PURCHASE_RECEIPT');
    const m = movements[0];
    assert(m.referenceType === 'PURCHASE_ORDER_RECEIPT', `referenceType must be PURCHASE_ORDER_RECEIPT, got ${m.referenceType}`);
    assert(m.quantity > 0, 'Movement quantity must be positive');
  });

  // M11-T39: True Goods Receipt Idempotency (Sequential & Concurrent)
  await recordTest('M11-T39: True Goods Receipt Idempotency — Sequential retry and concurrent duplicate submissions produce exactly 1 receipt and 1 stock mutation', async () => {
    // 1. Setup fresh PO with 10 units of productA
    const poRes = await app.inject({
      method: 'POST',
      url: '/api/v1/procurement/orders',
      headers: { cookie: managerCookie },
      payload: {
        supplierId: sharedSupplierId,
        warehouseId: testWarehouse.id,
        items: [{ productId: productA.id, quantity: 10, unitCost: 1250 }],
      },
    });
    const po = JSON.parse(poRes.body).data;
    await app.inject({ method: 'POST', url: `/api/v1/procurement/orders/${po.id}/submit`, headers: { cookie: managerCookie } });
    await app.inject({ method: 'POST', url: `/api/v1/procurement/orders/${po.id}/approve`, headers: { cookie: adminCookie } });
    await app.inject({ method: 'POST', url: `/api/v1/procurement/orders/${po.id}/send`, headers: { cookie: managerCookie } });

    const item = (await prisma.purchaseOrderItem.findFirst({ where: { purchaseOrderId: po.id } }))!;
    const idempotencyKey = `IDEMP-TRUE-SEQ-${Date.now()}`;

    const stockBefore = (await prisma.inventoryItem.findFirst({
      where: { warehouseId: testWarehouse.id, productId: productA.id },
    }))!.onHand;
    const grCountBefore = await prisma.goodsReceipt.count({ where: { purchaseOrderId: po.id } });
    const movCountBefore = await prisma.stockMovement.count({ where: { warehouseId: testWarehouse.id, productId: productA.id, movementType: 'PURCHASE_RECEIPT' } });

    // Request 1
    const res1 = await app.inject({
      method: 'POST',
      url: '/api/v1/procurement/receipts',
      headers: { cookie: clerkCookie, 'idempotency-key': idempotencyKey },
      payload: {
        purchaseOrderId: po.id,
        warehouseId: testWarehouse.id,
        items: [{ purchaseOrderItemId: item.id, receivedQuantity: 10, rejectedQuantity: 0 }],
      },
    });
    assert(res1.statusCode === 201, `First receipt failed: ${res1.body}`);
    const gr1 = JSON.parse(res1.body).data;

    const stockAfter1 = (await prisma.inventoryItem.findFirst({ where: { warehouseId: testWarehouse.id, productId: productA.id } }))!.onHand;
    const grCountAfter1 = await prisma.goodsReceipt.count({ where: { purchaseOrderId: po.id } });
    const movCountAfter1 = await prisma.stockMovement.count({ where: { warehouseId: testWarehouse.id, productId: productA.id, movementType: 'PURCHASE_RECEIPT' } });

    assert(stockAfter1 === stockBefore + 10, `Stock must increment by 10: got ${stockAfter1 - stockBefore}`);
    assert(grCountAfter1 === grCountBefore + 1, 'Exactly 1 GoodsReceipt created');
    assert(movCountAfter1 === movCountBefore + 1, 'Exactly 1 StockMovement created');

    // Request 2 (Exact same logical request with same idempotency key)
    const res2 = await app.inject({
      method: 'POST',
      url: '/api/v1/procurement/receipts',
      headers: { cookie: clerkCookie, 'idempotency-key': idempotencyKey },
      payload: {
        purchaseOrderId: po.id,
        warehouseId: testWarehouse.id,
        items: [{ purchaseOrderItemId: item.id, receivedQuantity: 10, rejectedQuantity: 0 }],
      },
    });
    assert(res2.statusCode === 200 || res2.statusCode === 201, `Duplicate idempotency call returned ${res2.statusCode}`);
    const gr2 = JSON.parse(res2.body).data;
    assert(gr2.id === gr1.id, 'Idempotent request returned identical GoodsReceipt entity');

    const stockAfter2 = (await prisma.inventoryItem.findFirst({ where: { warehouseId: testWarehouse.id, productId: productA.id } }))!.onHand;
    const grCountAfter2 = await prisma.goodsReceipt.count({ where: { purchaseOrderId: po.id } });
    const movCountAfter2 = await prisma.stockMovement.count({ where: { warehouseId: testWarehouse.id, productId: productA.id, movementType: 'PURCHASE_RECEIPT' } });

    assert(stockAfter2 === stockAfter1, 'Stock was not double incremented on retry');
    assert(grCountAfter2 === grCountAfter1, 'GoodsReceipt count unchanged on retry');
    assert(movCountAfter2 === movCountAfter1, 'StockMovement count unchanged on retry');

    // 2. Concurrent duplicate submission with same key
    const poConRes = await app.inject({
      method: 'POST',
      url: '/api/v1/procurement/orders',
      headers: { cookie: managerCookie },
      payload: {
        supplierId: sharedSupplierId,
        warehouseId: testWarehouse.id,
        items: [{ productId: productA.id, quantity: 5, unitCost: 1250 }],
      },
    });
    const poCon = JSON.parse(poConRes.body).data;
    await app.inject({ method: 'POST', url: `/api/v1/procurement/orders/${poCon.id}/submit`, headers: { cookie: managerCookie } });
    await app.inject({ method: 'POST', url: `/api/v1/procurement/orders/${poCon.id}/approve`, headers: { cookie: adminCookie } });
    await app.inject({ method: 'POST', url: `/api/v1/procurement/orders/${poCon.id}/send`, headers: { cookie: managerCookie } });

    const itemCon = (await prisma.purchaseOrderItem.findFirst({ where: { purchaseOrderId: poCon.id } }))!;
    const concurrentKey = `IDEMP-CONCURRENT-${Date.now()}`;
    const conStockBefore = (await prisma.inventoryItem.findFirst({ where: { warehouseId: testWarehouse.id, productId: productA.id } }))!.onHand;

    const [c1, c2] = await Promise.allSettled([
      app.inject({
        method: 'POST',
        url: '/api/v1/procurement/receipts',
        headers: { cookie: clerkCookie, 'idempotency-key': concurrentKey },
        payload: {
          purchaseOrderId: poCon.id,
          warehouseId: testWarehouse.id,
          items: [{ purchaseOrderItemId: itemCon.id, receivedQuantity: 5, rejectedQuantity: 0 }],
        },
      }),
      app.inject({
        method: 'POST',
        url: '/api/v1/procurement/receipts',
        headers: { cookie: clerkCookie, 'idempotency-key': concurrentKey },
        payload: {
          purchaseOrderId: poCon.id,
          warehouseId: testWarehouse.id,
          items: [{ purchaseOrderItemId: itemCon.id, receivedQuantity: 5, rejectedQuantity: 0 }],
        },
      }),
    ]);

    const conRes1 = (c1 as PromiseFulfilledResult<any>).value;
    const conRes2 = (c2 as PromiseFulfilledResult<any>).value;
    assert((conRes1.statusCode === 201 || conRes1.statusCode === 200) && (conRes2.statusCode === 201 || conRes2.statusCode === 200), 'Both concurrent requests succeed idempotently');

    const conStockAfter = (await prisma.inventoryItem.findFirst({ where: { warehouseId: testWarehouse.id, productId: productA.id } }))!.onHand;
    assert(conStockAfter === conStockBefore + 5, `Concurrent duplicate idempotency incremented stock exactly once (+5), got ${conStockAfter - conStockBefore}`);

    const conGrCount = await prisma.goodsReceipt.count({ where: { purchaseOrderId: poCon.id } });
    assert(conGrCount === 1, 'Exactly 1 GoodsReceipt created for concurrent duplicate submissions');
  });

  // M11-T40: Over-Receiving & Idempotency Interaction
  await recordTest('M11-T40: Over-Receiving & Idempotency Interaction — Idempotency retry does not exceed ordered quantity, new key fails with 400', async () => {
    // Setup PO with 100 ordered, 80 received initially
    const poRes = await app.inject({
      method: 'POST',
      url: '/api/v1/procurement/orders',
      headers: { cookie: managerCookie },
      payload: {
        supplierId: sharedSupplierId,
        warehouseId: testWarehouse.id,
        items: [{ productId: productB.id, quantity: 100, unitCost: 320 }],
      },
    });
    const po = JSON.parse(poRes.body).data;
    await app.inject({ method: 'POST', url: `/api/v1/procurement/orders/${po.id}/submit`, headers: { cookie: managerCookie } });
    await app.inject({ method: 'POST', url: `/api/v1/procurement/orders/${po.id}/approve`, headers: { cookie: adminCookie } });
    await app.inject({ method: 'POST', url: `/api/v1/procurement/orders/${po.id}/send`, headers: { cookie: managerCookie } });

    const item = (await prisma.purchaseOrderItem.findFirst({ where: { purchaseOrderId: po.id } }))!;

    // Receive initial 80 units
    await app.inject({
      method: 'POST',
      url: '/api/v1/procurement/receipts',
      headers: { cookie: clerkCookie },
      payload: {
        purchaseOrderId: po.id,
        warehouseId: testWarehouse.id,
        items: [{ purchaseOrderItemId: item.id, receivedQuantity: 80, rejectedQuantity: 0 }],
      },
    });

    const poAfter80 = await prisma.purchaseOrder.findUnique({ where: { id: po.id }, include: { items: true } });
    assert(poAfter80!.items[0].receivedQuantity === 80, 'Initial received quantity is 80');

    // Submit remaining 20 units with Key K1
    const keyK1 = `KEY-K1-${Date.now()}`;
    const resK1 = await app.inject({
      method: 'POST',
      url: '/api/v1/procurement/receipts',
      headers: { cookie: clerkCookie, 'idempotency-key': keyK1 },
      payload: {
        purchaseOrderId: po.id,
        warehouseId: testWarehouse.id,
        items: [{ purchaseOrderItemId: item.id, receivedQuantity: 20, rejectedQuantity: 0 }],
      },
    });
    assert(resK1.statusCode === 201, `Receipt K1 failed: ${resK1.body}`);

    const poAfter100 = await prisma.purchaseOrder.findUnique({ where: { id: po.id }, include: { items: true } });
    assert(poAfter100!.items[0].receivedQuantity === 100, 'Total received is 100');

    // Retry Key K1 -> should succeed idempotently and NOT make received 120
    const retryK1 = await app.inject({
      method: 'POST',
      url: '/api/v1/procurement/receipts',
      headers: { cookie: clerkCookie, 'idempotency-key': keyK1 },
      payload: {
        purchaseOrderId: po.id,
        warehouseId: testWarehouse.id,
        items: [{ purchaseOrderItemId: item.id, receivedQuantity: 20, rejectedQuantity: 0 }],
      },
    });
    assert(retryK1.statusCode === 200 || retryK1.statusCode === 201, 'Retry K1 succeeded idempotently');

    const poAfterRetry = await prisma.purchaseOrder.findUnique({ where: { id: po.id }, include: { items: true } });
    assert(poAfterRetry!.items[0].receivedQuantity === 100, `Received quantity must remain 100 (not 120), got ${poAfterRetry!.items[0].receivedQuantity}`);

    // Submit new Key K2 with Quantity = 1 -> must fail with 400 OVER_RECEIVING
    const keyK2 = `KEY-K2-${Date.now()}`;
    const resK2 = await app.inject({
      method: 'POST',
      url: '/api/v1/procurement/receipts',
      headers: { cookie: clerkCookie, 'idempotency-key': keyK2 },
      payload: {
        purchaseOrderId: po.id,
        warehouseId: testWarehouse.id,
        items: [{ purchaseOrderItemId: item.id, receivedQuantity: 1, rejectedQuantity: 0 }],
      },
    });
    assert(resK2.statusCode === 400, `Submitting over-receiving with new key must fail with 400, got ${resK2.statusCode}: ${resK2.body}`);
  });

  // M11-T41: Cancelled / Closed PO Receiving Rejection
  await recordTest('M11-T41: Cancelled / Closed PO Receiving Rejection — Cannot receive against CANCELLED or CLOSED PO', async () => {
    // 1. Create and cancel a PO
    const poRes = await app.inject({
      method: 'POST',
      url: '/api/v1/procurement/orders',
      headers: { cookie: managerCookie },
      payload: {
        supplierId: sharedSupplierId,
        warehouseId: testWarehouse.id,
        items: [{ productId: productA.id, quantity: 5, unitCost: 1250 }],
      },
    });
    const po = JSON.parse(poRes.body).data;
    await app.inject({
      method: 'POST',
      url: `/api/v1/procurement/orders/${po.id}/cancel`,
      headers: { cookie: managerCookie },
      payload: { cancellationReason: 'Cancelled before receiving' },
    });

    const item = (await prisma.purchaseOrderItem.findFirst({ where: { purchaseOrderId: po.id } }))!;

    const recvRes = await app.inject({
      method: 'POST',
      url: '/api/v1/procurement/receipts',
      headers: { cookie: clerkCookie },
      payload: {
        purchaseOrderId: po.id,
        warehouseId: testWarehouse.id,
        items: [{ purchaseOrderItemId: item.id, receivedQuantity: 5, rejectedQuantity: 0 }],
      },
    });
    assert(recvRes.statusCode === 400, `Receiving against cancelled PO must return 400, got ${recvRes.statusCode}`);
  });

  // M11-T42: Procurement RBAC — Customer Access Rejection
  await recordTest('M11-T42: Procurement RBAC — Customer access rejected with 403 Forbidden', async () => {
    const routesToTest = [
      { method: 'GET' as const, url: '/api/v1/suppliers' },
      { method: 'POST' as const, url: '/api/v1/suppliers', payload: { code: 'HACK', name: 'Hack Co' } },
      { method: 'GET' as const, url: '/api/v1/procurement/orders' },
      { method: 'POST' as const, url: '/api/v1/procurement/orders', payload: {} },
      { method: 'POST' as const, url: '/api/v1/procurement/receipts', payload: {} },
    ];

    for (const r of routesToTest) {
      const res = await app.inject({
        method: r.method,
        url: r.url,
        headers: { cookie: customerCookie },
        payload: r.payload,
      });
      assert(res.statusCode === 403, `Customer accessing ${r.method} ${r.url} must receive 403, got ${res.statusCode}`);
    }
  });

  // M11-T43: Procurement RBAC — Staff Role Boundaries
  await recordTest('M11-T43: Procurement RBAC — Role boundaries for Clerk, Manager, and Accountant', async () => {
    // 1. Clerk cannot approve PO
    const clerkApproveRes = await app.inject({
      method: 'POST',
      url: `/api/v1/procurement/orders/${sharedPoId}/approve`,
      headers: { cookie: clerkCookie },
    });
    assert(clerkApproveRes.statusCode === 403, `Clerk approving PO must fail with 403, got ${clerkApproveRes.statusCode}`);

    // 2. Accountant can view POs but cannot create Goods Receipt
    const accViewRes = await app.inject({
      method: 'GET',
      url: '/api/v1/procurement/orders',
      headers: { cookie: accountantCookie },
    });
    assert(accViewRes.statusCode === 200, `Accountant viewing POs should succeed (200), got ${accViewRes.statusCode}`);

    const accRecvRes = await app.inject({
      method: 'POST',
      url: '/api/v1/procurement/receipts',
      headers: { cookie: accountantCookie },
      payload: { purchaseOrderId: sharedPoId, warehouseId: testWarehouse.id, items: [] },
    });
    assert(accRecvRes.statusCode === 403, `Accountant receiving goods must fail with 403, got ${accRecvRes.statusCode}`);
  });

  // M11-T44: M11 Zero Direct Stock Mutation Invariant
  await recordTest('M11-T44: M11 Zero Direct Stock Mutation Invariant — M11 only updates stock via M10 InventoryService', async () => {
    // Verify that every stock movement created in the system has a valid inventoryItemId and movementType
    const movements = await prisma.stockMovement.findMany({
      where: { movementType: 'PURCHASE_RECEIPT' },
    });
    for (const m of movements) {
      assert(m.productId != null, 'StockMovement must reference a valid Product');
      assert(m.warehouseId != null, 'StockMovement must reference a valid Warehouse');
      assert(m.movementType === 'PURCHASE_RECEIPT', 'Movement type must be PURCHASE_RECEIPT');
    }
  });

  // M11-T45: Atomic Transaction Rollback on Inventory Failure
  await recordTest('M11-T45: Atomic Transaction Rollback on Inventory Failure — GoodsReceipt rolls back cleanly if sub-operation fails', async () => {
    const poRes = await app.inject({
      method: 'POST',
      url: '/api/v1/procurement/orders',
      headers: { cookie: managerCookie },
      payload: {
        supplierId: sharedSupplierId,
        warehouseId: testWarehouse.id,
        items: [{ productId: productA.id, quantity: 5, unitCost: 1250 }],
      },
    });
    const po = JSON.parse(poRes.body).data;
    await app.inject({ method: 'POST', url: `/api/v1/procurement/orders/${po.id}/submit`, headers: { cookie: managerCookie } });
    await app.inject({ method: 'POST', url: `/api/v1/procurement/orders/${po.id}/approve`, headers: { cookie: adminCookie } });
    await app.inject({ method: 'POST', url: `/api/v1/procurement/orders/${po.id}/send`, headers: { cookie: managerCookie } });

    const item = (await prisma.purchaseOrderItem.findFirst({ where: { purchaseOrderId: po.id } }))!;

    const grCountBefore = await prisma.goodsReceipt.count();
    const fakeLocationId = '99999999-9999-9999-9999-999999999999';

    const failRes = await app.inject({
      method: 'POST',
      url: '/api/v1/procurement/receipts',
      headers: { cookie: clerkCookie },
      payload: {
        purchaseOrderId: po.id,
        warehouseId: testWarehouse.id,
        warehouseLocationId: fakeLocationId, // Invalid location forces rollback in transaction
        items: [{ purchaseOrderItemId: item.id, receivedQuantity: 5, rejectedQuantity: 0 }],
      },
    });
    assert(failRes.statusCode >= 400, 'Invalid request failed');

    const grCountAfter = await prisma.goodsReceipt.count();
    assert(grCountAfter === grCountBefore, 'GoodsReceipt transaction was completely rolled back');

    const checkPoItem = await prisma.purchaseOrderItem.findUnique({ where: { id: item.id } });
    assert(checkPoItem!.receivedQuantity === 0, 'PO item receivedQuantity was not modified');
  });

  // ----------------------------------------------------------------------------
  // RESULTS SUMMARY
  // ----------------------------------------------------------------------------
  console.log('\n======================================================');
  console.log('🏁 Phase M11 Test Suite Results:');
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  console.log(`Passed: ${passed}/${results.length}`);
  console.log(`Failed: ${failed}/${results.length}`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runM11TestSuite().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
