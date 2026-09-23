"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function runTests() {
    console.log('🧪 Starting Relational Integrity and Database Constraint Tests...');
    let totalTests = 0;
    let passedTests = 0;
    const test = async (name, fn) => {
        totalTests++;
        try {
            await fn();
            console.log(`  ✅ [PASS] ${name}`);
            passedTests++;
        }
        catch (err) {
            console.error(`  ❌ [FAIL] ${name}`);
            console.error(`     Error:`, err.message || err);
        }
    };
    // ----------------------------------------------------------------------------
    // TEST GROUP 1: RELATIONAL INTEGRITY
    // ----------------------------------------------------------------------------
    console.log('\n--- Group 1: Relational Navigation & Integrity ---');
    await test('User -> UserRole -> Role navigation', async () => {
        const admin = await prisma.user.findUnique({
            where: { email: 'admin@mobex.co.th' },
            include: { roles: { include: { role: true } } },
        });
        if (!admin || admin.roles.length === 0 || admin.roles[0].role.name !== 'SUPER_ADMIN') {
            throw new Error('User -> Role navigation failed');
        }
    });
    await test('Category -> Product and Brand -> Product relations', async () => {
        const product = await prisma.product.findFirst({
            where: { sku: 'AKE-AN-787WK' },
            include: { category: true, brand: true, prices: true, fitments: true },
        });
        if (!product || product.brand.name !== 'Akebono' || product.prices.length !== 3) {
            throw new Error('Product category/brand/price relations failed');
        }
    });
    await test('Vehicle Make -> Model -> Generation -> Variant hierarchy', async () => {
        const civicVariant = await prisma.vehicleVariant.findFirst({
            where: { name: '1.5 Turbo RS CVT' },
            include: {
                generation: {
                    include: {
                        model: {
                            include: { make: true },
                        },
                    },
                },
                engine: true,
            },
        });
        if (!civicVariant ||
            civicVariant.generation.model.make.name !== 'Honda' ||
            civicVariant.generation.model.name !== 'Civic') {
            throw new Error('Vehicle hierarchy relation navigation failed');
        }
    });
    await test('Product -> ProductFitment -> VehicleVariant compatibility resolution', async () => {
        const fitment = await prisma.productFitment.findFirst({
            where: { product: { sku: 'AKE-AN-787WK' } },
            include: { product: true, vehicleVariant: { include: { generation: { include: { model: true } } } } },
        });
        if (!fitment || fitment.fitmentStatus !== client_1.FitmentStatus.COMPATIBLE) {
            throw new Error('Product fitment resolution failed');
        }
    });
    await test('Warehouse -> InventoryItem -> Product relationship', async () => {
        const inv = await prisma.inventoryItem.findFirst({
            where: { warehouse: { code: 'WH-MAIN' } },
            include: { warehouse: true, product: true },
        });
        if (!inv || inv.onHand <= 0 || !inv.product.sku) {
            throw new Error('Warehouse inventory item relation failed');
        }
    });
    await test('Transactional Order creation -> OrderItem -> Payment -> Shipment flow', async () => {
        const customer = await prisma.customerProfile.findFirst();
        const product = await prisma.product.findFirst();
        const shippingMethod = await prisma.shippingMethod.findFirst();
        if (!customer || !product || !shippingMethod) {
            throw new Error('Prerequisite seed data missing for order test');
        }
        const testOrderNumber = `TEST-ORD-${Date.now()}`;
        const order = await prisma.order.create({
            data: {
                orderNumber: testOrderNumber,
                customerId: customer.id,
                status: client_1.OrderStatus.PENDING_PAYMENT,
                currency: 'THB',
                subtotal: 1850.00,
                discountTotal: 0.00,
                shippingTotal: 60.00,
                taxTotal: 129.50,
                grandTotal: 1910.00,
                items: {
                    create: {
                        productId: product.id,
                        sku: product.sku,
                        productName: product.name,
                        unitPrice: 1850.00,
                        quantity: 1,
                        discountTotal: 0.00,
                        taxTotal: 129.50,
                        lineTotal: 1850.00,
                        productSnapshot: {
                            sku: product.sku,
                            name: product.name,
                            weightGrams: product.weightGrams,
                        },
                    },
                },
                payments: {
                    create: {
                        provider: 'PROMPTPAY',
                        method: 'QR',
                        status: client_1.PaymentStatus.PENDING,
                        amount: 1910.00,
                        currency: 'THB',
                    },
                },
                shipments: {
                    create: {
                        shippingMethodId: shippingMethod.id,
                        status: client_1.ShipmentStatus.PENDING,
                        carrier: 'Kerry Express',
                    },
                },
            },
            include: { items: true, payments: true, shipments: true },
        });
        if (order.items.length !== 1 || order.payments.length !== 1 || order.shipments.length !== 1) {
            throw new Error('Order aggregate creation failed');
        }
        // Verify snapshot immutability requirement: OrderItem has snapshot data
        if (!order.items[0].productSnapshot) {
            throw new Error('OrderItem productSnapshot missing');
        }
        // Clean up test order
        await prisma.order.delete({ where: { id: order.id } });
    });
    await test('User -> AuditLog append relation', async () => {
        const admin = await prisma.user.findFirst();
        const log = await prisma.auditLog.create({
            data: {
                userId: admin?.id,
                action: 'TEST_AUDIT',
                resource: 'DatabaseTest',
                resourceId: 'TEST-001',
                before: { status: 'OLD' },
                after: { status: 'NEW' },
                ipAddress: '127.0.0.1',
            },
        });
        if (!log || log.action !== 'TEST_AUDIT') {
            throw new Error('Audit log creation failed');
        }
        await prisma.auditLog.delete({ where: { id: log.id } });
    });
    // ----------------------------------------------------------------------------
    // TEST GROUP 2: DATABASE CONSTRAINTS & REJECTIONS
    // ----------------------------------------------------------------------------
    console.log('\n--- Group 2: Constraints & Edge Case Rejections ---');
    await test('Reject duplicate Product SKU (Unique Constraint)', async () => {
        const existing = await prisma.product.findFirst();
        if (!existing)
            throw new Error('No product found');
        let errorThrown = false;
        try {
            await prisma.product.create({
                data: {
                    sku: existing.sku, // DUPLICATE
                    slug: `unique-slug-${Date.now()}`,
                    name: 'Duplicate SKU Product',
                    brandId: existing.brandId,
                    categoryId: existing.categoryId,
                },
            });
        }
        catch (err) {
            errorThrown = true;
        }
        if (!errorThrown) {
            throw new Error('Database accepted a duplicate SKU without throwing unique constraint error');
        }
    });
    await test('Reject duplicate Product Slug (Unique Constraint)', async () => {
        const existing = await prisma.product.findFirst();
        if (!existing)
            throw new Error('No product found');
        let errorThrown = false;
        try {
            await prisma.product.create({
                data: {
                    sku: `UNIQUE-SKU-${Date.now()}`,
                    slug: existing.slug, // DUPLICATE
                    name: 'Duplicate Slug Product',
                    brandId: existing.brandId,
                    categoryId: existing.categoryId,
                },
            });
        }
        catch (err) {
            errorThrown = true;
        }
        if (!errorThrown) {
            throw new Error('Database accepted a duplicate slug without throwing unique constraint error');
        }
    });
    await test('Reject duplicate Warehouse Code (Unique Constraint)', async () => {
        let errorThrown = false;
        try {
            await prisma.warehouse.create({
                data: {
                    code: 'WH-MAIN', // DUPLICATE
                    name: 'Duplicate Main Warehouse',
                },
            });
        }
        catch (err) {
            errorThrown = true;
        }
        if (!errorThrown) {
            throw new Error('Database accepted a duplicate warehouse code');
        }
    });
    await test('Reject duplicate Fitment entry (Composite Unique Constraint)', async () => {
        const fitment = await prisma.productFitment.findFirst();
        if (!fitment)
            throw new Error('No fitment found');
        let errorThrown = false;
        try {
            await prisma.productFitment.create({
                data: {
                    productId: fitment.productId,
                    vehicleVariantId: fitment.vehicleVariantId,
                    position: fitment.position,
                },
            });
        }
        catch (err) {
            errorThrown = true;
        }
        if (!errorThrown) {
            throw new Error('Database accepted duplicate composite fitment record');
        }
    });
    await test('Reject invalid Foreign Key reference (Referential Integrity)', async () => {
        let errorThrown = false;
        try {
            await prisma.product.create({
                data: {
                    sku: `FK-TEST-${Date.now()}`,
                    slug: `fk-test-${Date.now()}`,
                    name: 'Invalid FK Product',
                    brandId: '00000000-0000-0000-0000-000000000000', // NON-EXISTENT
                    categoryId: '00000000-0000-0000-0000-000000000000',
                },
            });
        }
        catch (err) {
            errorThrown = true;
        }
        if (!errorThrown) {
            throw new Error('Database accepted non-existent foreign key without constraint violation');
        }
    });
    await test('Verify Decimal precision for monetary amounts (Decimal(12,2))', async () => {
        const brand = await prisma.brand.findFirst();
        const category = await prisma.category.findFirst();
        if (!brand || !category)
            throw new Error('Brand or category missing');
        const tempProduct = await prisma.product.create({
            data: {
                sku: `DECIMAL-TEST-${Date.now()}`,
                slug: `decimal-test-${Date.now()}`,
                name: 'Decimal Precision Test Product',
                brandId: brand.id,
                categoryId: category.id,
            },
        });
        const testPrice = await prisma.productPrice.create({
            data: {
                productId: tempProduct.id,
                tier: client_1.PriceTier.GENERAL,
                price: 1999.99,
                compareAtPrice: 2499.50,
                costPrice: 1200.25,
                currency: 'THB',
            },
        });
        const readBack = await prisma.productPrice.findUnique({ where: { id: testPrice.id } });
        // Clean up temporary test product (cascades to price)
        await prisma.product.delete({ where: { id: tempProduct.id } });
        if (!readBack || readBack.price.toNumber() !== 1999.99 || readBack.compareAtPrice?.toNumber() !== 2499.50) {
            throw new Error(`Decimal precision mismatch: expected 1999.99, got ${readBack?.price}`);
        }
    });
    console.log(`\n======================================================`);
    console.log(`Results: ${passedTests} / ${totalTests} tests PASSED.`);
    console.log(`======================================================\n`);
    if (passedTests === totalTests) {
        console.log('🎉 All Relational Integrity and Constraint Tests PASSED successfully!');
        process.exit(0);
    }
    else {
        console.error('❌ Some tests failed.');
        process.exit(1);
    }
}
runTests()
    .catch((e) => {
    console.error('Unexpected test error:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=db-test.js.map