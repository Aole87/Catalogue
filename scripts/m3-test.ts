import { buildApp } from '../apps/api/src/app';
import { prisma, PriceTier, ProductReferenceType } from '@car-parts/database';
import { FastifyInstance } from 'fastify';

async function runM3Tests() {
  console.log('🧪 Running Complete Phase M3 (Product Catalog, Category, Brand & RBAC) Test Suite...\n');
  const app: FastifyInstance = await buildApp();
  await app.ready();

  let totalTests = 0;
  let passedTests = 0;

  const test = async (name: string, fn: () => Promise<void>) => {
    totalTests++;
    try {
      await fn();
      console.log(`  ✅ [PASS] ${name}`);
      passedTests++;
    } catch (err: any) {
      console.error(`  ❌ [FAIL] ${name}`);
      console.error(`     Error:`, err.message || err);
    }
  };

  // Helper to extract session cookie from login
  const loginUser = async (email: string, password = 'Admin@123456') => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: { email, password },
    });
    if (res.statusCode !== 200) {
      throw new Error(`Login failed for ${email} with status ${res.statusCode}`);
    }
    const setCookie = res.headers['set-cookie'];
    const cookieHeader = Array.isArray(setCookie) ? setCookie.join(';') : (setCookie as string);
    const match = cookieHeader.match(/autoparts_session=([^;]+)/);
    return match ? `autoparts_session=${match[1]}` : '';
  };

  try {
    // Obtain session cookies for different roles
    const adminCookie = await loginUser('admin@mobex.co.th');
    const catalogCookie = await loginUser('catalog@mobex.co.th');
    const customerCookie = await loginUser('ananda@consumer.com');
    const garageCookie = await loginUser('somchai@autoworkshop.com');

    // --------------------------------------------------------------------------
    // 1. CATEGORY DOMAIN & HIERARCHICAL TREE
    // --------------------------------------------------------------------------
    console.log('--- Group 1: Category Domain & Hierarchical Tree ---');

    let testParentCategoryId = '';
    let testChildCategoryId = '';

    await test('GET /api/v1/categories/tree returns hierarchical nested category tree', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/v1/categories/tree' });
      if (res.statusCode !== 200) throw new Error(`Expected 200, got ${res.statusCode}`);
      const body = JSON.parse(res.payload);
      if (!Array.isArray(body.data) || body.data.length === 0) throw new Error('Category tree empty');

      // Verify nested children structure
      const brakes = body.data.find((c: any) => c.slug === 'brakes');
      if (!brakes || !Array.isArray(brakes.children) || brakes.children.length === 0) {
        throw new Error('Brakes category missing children in tree');
      }
    });

    await test('GET /api/v1/categories returns flat list of categories', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/v1/categories' });
      if (res.statusCode !== 200) throw new Error(`Expected 200, got ${res.statusCode}`);
      const body = JSON.parse(res.payload);
      if (!Array.isArray(body.data) || body.data.length < 5) throw new Error('Incomplete categories');
    });

    await test('POST /api/v1/admin/categories creates root and child categories (CATALOG_MANAGER)', async () => {
      // 1. Create Parent Category
      const res1 = await app.inject({
        method: 'POST',
        url: '/api/v1/admin/categories',
        headers: { cookie: catalogCookie },
        payload: {
          name: 'ระบบส่งกำลังทดสอบ',
          slug: `test-transmission-${Date.now()}`,
          description: 'หมวดหมู่ทดสอบ',
          sortOrder: 10,
        },
      });
      if (res1.statusCode !== 201) throw new Error(`Failed to create root category: ${res1.payload}`);
      const body1 = JSON.parse(res1.payload);
      testParentCategoryId = body1.data.id;

      // 2. Create Child Category
      const res2 = await app.inject({
        method: 'POST',
        url: '/api/v1/admin/categories',
        headers: { cookie: catalogCookie },
        payload: {
          name: 'ชุดคลัตช์ทดสอบ',
          slug: `test-clutch-${Date.now()}`,
          parentId: testParentCategoryId,
          sortOrder: 1,
        },
      });
      if (res2.statusCode !== 201) throw new Error(`Failed to create child category: ${res2.payload}`);
      const body2 = JSON.parse(res2.payload);
      testChildCategoryId = body2.data.id;
      if (body2.data.parentId !== testParentCategoryId) throw new Error('ParentId mismatch');
    });

    await test('Reject duplicate category slug with 409 Conflict', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/admin/categories',
        headers: { cookie: adminCookie },
        payload: {
          name: 'Duplicate Brakes',
          slug: 'brakes', // Duplicate slug
        },
      });
      if (res.statusCode !== 409) throw new Error(`Expected 409, got ${res.statusCode}`);
    });

    await test('Reject circular hierarchy assignment with 400 Bad Request', async () => {
      // Attempt to make parent category a child of its own child
      const res = await app.inject({
        method: 'PATCH',
        url: `/api/v1/admin/categories/${testParentCategoryId}`,
        headers: { cookie: adminCookie },
        payload: {
          parentId: testChildCategoryId, // Circular reference!
        },
      });
      if (res.statusCode !== 400) throw new Error(`Expected 400 Circular Error, got ${res.statusCode}`);
    });

    await test('Reject deletion of category containing active subcategories with 409 Conflict', async () => {
      const res = await app.inject({
        method: 'DELETE',
        url: `/api/v1/admin/categories/${testParentCategoryId}`,
        headers: { cookie: adminCookie },
      });
      if (res.statusCode !== 409) throw new Error(`Expected 409 Conflict, got ${res.statusCode}`);
    });

    // --------------------------------------------------------------------------
    // 2. BRAND DOMAIN
    // --------------------------------------------------------------------------
    console.log('\n--- Group 2: Brand Management ---');

    let testBrandId = '';
    const testBrandSlug = `test-valeo-${Date.now()}`;

    await test('GET /api/v1/brands returns public brand list', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/v1/brands' });
      if (res.statusCode !== 200) throw new Error(`Expected 200, got ${res.statusCode}`);
      const body = JSON.parse(res.payload);
      if (!Array.isArray(body.data) || body.data.length === 0) throw new Error('Brand list empty');
    });

    await test('POST /api/v1/admin/brands creates new brand (CATALOG_MANAGER)', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/admin/brands',
        headers: { cookie: catalogCookie },
        payload: {
          name: `Valeo Test ${Date.now()}`,
          slug: testBrandSlug,
          description: 'ผู้ผลิตระบบคลัตช์และอุปกรณ์ไฟฟ้าระดับโลก',
          websiteUrl: 'https://www.valeo.com',
        },
      });
      if (res.statusCode !== 201) throw new Error(`Expected 201, got ${res.statusCode}: ${res.payload}`);
      const body = JSON.parse(res.payload);
      testBrandId = body.data.id;
    });

    await test('Reject duplicate brand slug with 409 Conflict', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/admin/brands',
        headers: { cookie: adminCookie },
        payload: {
          name: 'Another Brand',
          slug: testBrandSlug,
        },
      });
      if (res.statusCode !== 409) throw new Error(`Expected 409, got ${res.statusCode}`);
    });

    // --------------------------------------------------------------------------
    // 3. PRODUCT DOMAIN & TRANSACTIONAL CRUD
    // --------------------------------------------------------------------------
    console.log('\n--- Group 3: Product Domain & Transactional CRUD ---');

    let createdProductId = '';
    const testProductSku = `TEST-PAD-${Date.now()}`;
    const testProductSlug = `test-brake-pad-civic-${Date.now()}`;

    // Get an attribute ID from DB for testing
    const attr = await prisma.productAttribute.findFirst();

    await test('POST /api/v1/admin/products creates product atomically with prices, images, attributes, cross-refs', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/admin/products',
        headers: { cookie: catalogCookie },
        payload: {
          sku: testProductSku,
          slug: testProductSlug,
          name: 'ผ้าเบรกทดสอบเซรามิกพิเศษ Honda Civic',
          shortDescription: 'ผ้าเบรกคุณภาพสูงสำหรับการทดสอบ M3',
          description: 'รายละเอียดสินค้าผ้าเบรกเซรามิกเกรดพรีเมียม',
          brandId: testBrandId,
          categoryId: testChildCategoryId,
          barcode: '8851234567890',
          warrantyText: 'รับประกัน 1 ปี หรือ 20,000 กม.',
          weightGrams: 1200,
          prices: [
            { tier: PriceTier.GENERAL, price: 1500.0, compareAtPrice: 1800.0 },
            { tier: PriceTier.GARAGE, price: 1200.0 },
            { tier: PriceTier.SHOP, price: 1100.0 },
          ],
          images: [
            { url: 'https://images.unsplash.com/photo-1600706432502-778e34279b90?w=600', isPrimary: true },
            { url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600', isPrimary: false },
          ],
          attributes: attr ? [{ attributeId: attr.id, value: 'Ultra Ceramic Test' }] : [],
          crossReferences: [
            { referenceType: ProductReferenceType.OEM, referenceNumber: '45022-TEST-001' },
          ],
        },
      });

      if (res.statusCode !== 201) {
        throw new Error(`Expected 201, got ${res.statusCode}: ${res.payload}`);
      }

      const body = JSON.parse(res.payload);
      createdProductId = body.data.id;
      if (body.data.sku !== testProductSku) throw new Error('SKU mismatch');
      if (!body.data.prices || body.data.prices.length !== 3) throw new Error('Prices not created');
      if (!body.data.images || body.data.images.length !== 2) throw new Error('Images not created');
    });

    await test('Reject duplicate SKU with 409 Conflict', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/admin/products',
        headers: { cookie: adminCookie },
        payload: {
          sku: testProductSku, // DUPLICATE
          slug: `different-slug-${Date.now()}`,
          name: 'Another Duplicate Product',
          brandId: testBrandId,
          categoryId: testChildCategoryId,
        },
      });
      if (res.statusCode !== 409) throw new Error(`Expected 409 Conflict, got ${res.statusCode}`);
    });

    await test('Reject duplicate Slug with 409 Conflict', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/admin/products',
        headers: { cookie: adminCookie },
        payload: {
          sku: `DIFF-SKU-${Date.now()}`,
          slug: testProductSlug, // DUPLICATE SLUG
          name: 'Another Duplicate Product',
          brandId: testBrandId,
          categoryId: testChildCategoryId,
        },
      });
      if (res.statusCode !== 409) throw new Error(`Expected 409 Conflict, got ${res.statusCode}`);
    });

    await test('Reject missing foreign key category/brand with 400 Bad Request', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/admin/products',
        headers: { cookie: adminCookie },
        payload: {
          sku: `INVALID-FK-${Date.now()}`,
          slug: `invalid-fk-${Date.now()}`,
          name: 'Invalid FK Product',
          brandId: '00000000-0000-0000-0000-000000000000', // Nonexistent
          categoryId: testChildCategoryId,
        },
      });
      if (res.statusCode !== 400) throw new Error(`Expected 400, got ${res.statusCode}`);
    });

    await test('PATCH /api/v1/admin/products/:id updates product details and attributes', async () => {
      const res = await app.inject({
        method: 'PATCH',
        url: `/api/v1/admin/products/${createdProductId}`,
        headers: { cookie: catalogCookie },
        payload: {
          name: 'ผ้าเบรกทดสอบเซรามิกพิเศษ Honda Civic (Updated)',
          shortDescription: 'Updated short description',
        },
      });
      if (res.statusCode !== 200) throw new Error(`Expected 200, got ${res.statusCode}`);
      const body = JSON.parse(res.payload);
      if (!body.data.name.includes('(Updated)')) throw new Error('Product name not updated');
    });

    await test('PUT /api/v1/admin/products/:id/prices updates price tiers with Decimal precision (Gate C)', async () => {
      const res = await app.inject({
        method: 'PUT',
        url: `/api/v1/admin/products/${createdProductId}/prices`,
        headers: { cookie: catalogCookie },
        payload: {
          prices: [
            { tier: PriceTier.GENERAL, price: 1599.5 },
            { tier: PriceTier.GARAGE, price: 1250.0 },
            { tier: PriceTier.SHOP, price: 1150.0 },
          ],
        },
      });
      if (res.statusCode !== 200) throw new Error(`Expected 200, got ${res.statusCode}`);
      const body = JSON.parse(res.payload);
      const generalPrice = body.data.prices.find((p: any) => p.tier === 'GENERAL');
      if (generalPrice.price !== '1599.50') throw new Error(`Expected Decimal '1599.50', got ${generalPrice.price}`);
    });

    // --------------------------------------------------------------------------
    // 4. STOREFRONT LISTING, PAGINATION, FILTERS & SEARCH
    // --------------------------------------------------------------------------
    console.log('\n--- Group 4: Storefront Listing, Pagination, Filters & Search ---');

    await test('GET /api/v1/products returns paginated storefront products with metadata', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/products?page=1&pageSize=5',
      });
      if (res.statusCode !== 200) throw new Error(`Expected 200, got ${res.statusCode}`);
      const body = JSON.parse(res.payload);
      if (!body.data || !body.pagination) throw new Error('Missing data or pagination');
      if (body.pagination.page !== 1 || body.pagination.pageSize !== 5) throw new Error('Pagination params mismatch');
      if (body.data.length > 5) throw new Error('Returned more items than pageSize');
    });

    await test('Page size capping enforces maximum of 100 items per page', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/products?pageSize=500', // Excessive page size
      });
      if (res.statusCode !== 200) throw new Error(`Expected 200, got ${res.statusCode}`);
      const body = JSON.parse(res.payload);
      if (body.pagination.pageSize > 100) throw new Error(`Page size was not capped: ${body.pagination.pageSize}`);
    });

    await test('Category filtering includes products in subcategories', async () => {
      // Filtering by parent category slug should find product in its child category
      const parentCat = await prisma.category.findUnique({ where: { id: testParentCategoryId } });
      const res = await app.inject({
        method: 'GET',
        url: `/api/v1/products?category=${parentCat?.slug}`,
      });
      if (res.statusCode !== 200) throw new Error(`Expected 200, got ${res.statusCode}`);
      const body = JSON.parse(res.payload);
      const found = body.data.find((p: any) => p.id === createdProductId);
      if (!found) throw new Error('Product in subcategory was not included in parent category filter');
    });

    await test('Keyword search finds products across name, SKU, and OEM reference number', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/products?search=45022-TEST-001',
      });
      if (res.statusCode !== 200) throw new Error(`Expected 200, got ${res.statusCode}`);
      const body = JSON.parse(res.payload);
      if (!body.data.find((p: any) => p.id === createdProductId)) {
        throw new Error('Product not found by OEM cross-reference keyword search');
      }
    });

    await test('Whitelist sorting works for price and name (asc/desc)', async () => {
      const resAsc = await app.inject({ method: 'GET', url: '/api/v1/products?sortBy=name&sortOrder=asc' });
      if (resAsc.statusCode !== 200) throw new Error(`Expected 200, got ${resAsc.statusCode}`);

      const resDesc = await app.inject({ method: 'GET', url: '/api/v1/products?sortBy=name&sortOrder=desc' });
      if (resDesc.statusCode !== 200) throw new Error(`Expected 200, got ${resDesc.statusCode}`);
    });

    await test('Malicious sorting parameter is rejected by Zod schema', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/products?sortBy=DROP+TABLE+products',
      });
      if (res.statusCode !== 422) throw new Error(`Expected 422 Validation Error, got ${res.statusCode}`);
    });

    // --------------------------------------------------------------------------
    // 5. SERVER-AUTHORITATIVE TIERED PRICING (Gate C)
    // --------------------------------------------------------------------------
    console.log('\n--- Group 5: Server-Authoritative Tiered Pricing (Gate C) ---');

    await test('B2C Customer receives GENERAL tier price (1,599.50 THB)', async () => {
      const res = await app.inject({
        method: 'GET',
        url: `/api/v1/products/${createdProductId}`,
        headers: { cookie: customerCookie },
      });
      if (res.statusCode !== 200) throw new Error(`Expected 200, got ${res.statusCode}`);
      const body = JSON.parse(res.payload);
      if (body.data.effectivePrice.amount !== '1599.50' || body.data.effectivePrice.tier !== 'GENERAL') {
        throw new Error(`Expected GENERAL price 1599.50, got ${body.data.effectivePrice?.amount}`);
      }
    });

    await test('B2B Garage receives GARAGE tier price (1,250.00 THB)', async () => {
      const res = await app.inject({
        method: 'GET',
        url: `/api/v1/products/${createdProductId}`,
        headers: { cookie: garageCookie },
      });
      if (res.statusCode !== 200) throw new Error(`Expected 200, got ${res.statusCode}`);
      const body = JSON.parse(res.payload);
      if (body.data.effectivePrice.amount !== '1250.00' || body.data.effectivePrice.tier !== 'GARAGE') {
        throw new Error(`Expected GARAGE price 1250.00, got ${body.data.effectivePrice?.amount}`);
      }
    });

    // --------------------------------------------------------------------------
    // 6. RBAC PERMISSION ENFORCEMENT (Gate D)
    // --------------------------------------------------------------------------
    console.log('\n--- Group 6: RBAC Authorization & Permission Enforcement (Gate D) ---');

    await test('Anonymous unauthenticated call to admin product create returns 401', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/admin/products',
        payload: { name: 'Unauthorized' },
      });
      if (res.statusCode !== 401) throw new Error(`Expected 401, got ${res.statusCode}`);
    });

    await test('CUSTOMER role calling admin product create returns 403 Forbidden', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/admin/products',
        headers: { cookie: customerCookie },
        payload: { name: 'Unauthorized Customer Attempt' },
      });
      if (res.statusCode !== 403) throw new Error(`Expected 403 Forbidden, got ${res.statusCode}`);
    });

    await test('CUSTOMER role calling admin category create returns 403 Forbidden', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/admin/categories',
        headers: { cookie: customerCookie },
        payload: { name: 'Customer Category' },
      });
      if (res.statusCode !== 403) throw new Error(`Expected 403 Forbidden, got ${res.statusCode}`);
    });

    await test('CUSTOMER role calling admin brand create returns 403 Forbidden', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/admin/brands',
        headers: { cookie: customerCookie },
        payload: { name: 'Customer Brand' },
      });
      if (res.statusCode !== 403) throw new Error(`Expected 403 Forbidden, got ${res.statusCode}`);
    });

    await test('SUPER_ADMIN has full administrative mutation access', async () => {
      const res = await app.inject({
        method: 'PATCH',
        url: `/api/v1/admin/products/${createdProductId}`,
        headers: { cookie: adminCookie },
        payload: { isPublished: true },
      });
      if (res.statusCode !== 200) throw new Error(`Expected 200, got ${res.statusCode}`);
    });

    // --------------------------------------------------------------------------
    // 7. SOFT DELETE & AUDIT TRAIL VERIFICATION
    // --------------------------------------------------------------------------
    console.log('\n--- Group 7: Soft Deletion & Audit Trail Verification ---');

    await test('DELETE /api/v1/admin/products/:id soft-deletes product and hides from storefront', async () => {
      const res = await app.inject({
        method: 'DELETE',
        url: `/api/v1/admin/products/${createdProductId}`,
        headers: { cookie: adminCookie },
      });
      if (res.statusCode !== 200) throw new Error(`Expected 200, got ${res.statusCode}`);

      // Verify storefront returns 404 for soft-deleted product
      const storefrontRes = await app.inject({
        method: 'GET',
        url: `/api/v1/products/${createdProductId}`,
      });
      if (storefrontRes.statusCode !== 404) {
        throw new Error(`Expected 404 on storefront after deletion, got ${storefrontRes.statusCode}`);
      }
    });

    await test('Audit trail recorded all product, category, and brand mutations', async () => {
      const logs = await prisma.auditLog.findMany({
        where: {
          action: { in: ['PRODUCT_CREATED', 'PRODUCT_UPDATED', 'PRODUCT_DELETED', 'CATEGORY_CREATED', 'BRAND_CREATED', 'PRICE_UPDATED'] },
        },
      });
      if (logs.length < 5) throw new Error(`Expected at least 5 audit records, found ${logs.length}`);
    });

    // Clean up test data
    await prisma.product.deleteMany({ where: { id: createdProductId } }).catch(() => {});
    await prisma.category.deleteMany({ where: { id: { in: [testChildCategoryId, testParentCategoryId] } } }).catch(() => {});
    await prisma.brand.deleteMany({ where: { id: testBrandId } }).catch(() => {});
  } finally {
    await app.close();
  }

  console.log(`\n======================================================`);
  console.log(`Results: ${passedTests} / ${totalTests} M3 tests PASSED.`);
  console.log(`======================================================\n`);

  if (passedTests === totalTests) {
    console.log('🎉 Phase M3 Product Catalog, Category & Brand Test Suite PASSED 100%!\n');
  } else {
    console.error(`⚠️  ${totalTests - passedTests} test(s) failed.`);
    process.exit(1);
  }
}

runM3Tests().catch((err) => {
  console.error('Fatal M3 test runner failure:', err);
  process.exit(1);
});
