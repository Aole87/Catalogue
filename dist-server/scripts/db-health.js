"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function checkHealth() {
    console.log('🩺 Running Database Health Check for PostgreSQL 16 & Prisma...');
    const startTime = Date.now();
    try {
        // 1. Check raw connection & PostgreSQL version
        console.log('  1. Testing PostgreSQL raw connection...');
        const result = await prisma.$queryRaw `SELECT version();`;
        if (!result || result.length === 0) {
            throw new Error('PostgreSQL raw query returned empty result.');
        }
        console.log(`     ✓ Connected to: ${result[0].version.split(',')[0]}`);
        // 2. Check required tables existence
        console.log('  2. Verifying database tables...');
        const requiredTables = [
            'users',
            'roles',
            'permissions',
            'user_roles',
            'role_permissions',
            'customer_profiles',
            'customer_addresses',
            'vehicle_makes',
            'vehicle_models',
            'vehicle_generations',
            'vehicle_engines',
            'vehicle_variants',
            'product_fitments',
            'categories',
            'brands',
            'products',
            'product_prices',
            'product_cross_references',
            'product_images',
            'product_attributes',
            'product_attribute_values',
            'warehouses',
            'inventory_items',
            'stock_movements',
            'orders',
            'order_items',
            'order_status_histories',
            'payments',
            'shipping_methods',
            'shipments',
            'audit_logs',
        ];
        const tables = await prisma.$queryRaw `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
    `;
        const existingTables = new Set(tables.map((t) => t.table_name));
        const missingTables = requiredTables.filter((t) => !existingTables.has(t));
        if (missingTables.length > 0) {
            throw new Error(`Missing required tables: ${missingTables.join(', ')}`);
        }
        console.log(`     ✓ All ${requiredTables.length} core domain tables exist in public schema.`);
        // 3. Verify Prisma Client model queries and basic relational count
        console.log('  3. Verifying Prisma ORM model queries and relational counts...');
        const [userCount, roleCount, makeCount, modelCount, genCount, varCount, catCount, brandCount, prodCount, priceCount, fitCount, whCount, invCount, shipMethodCount,] = await Promise.all([
            prisma.user.count(),
            prisma.role.count(),
            prisma.vehicleMake.count(),
            prisma.vehicleModel.count(),
            prisma.vehicleGeneration.count(),
            prisma.vehicleVariant.count(),
            prisma.category.count(),
            prisma.brand.count(),
            prisma.product.count(),
            prisma.productPrice.count(),
            prisma.productFitment.count(),
            prisma.warehouse.count(),
            prisma.inventoryItem.count(),
            prisma.shippingMethod.count(),
        ]);
        console.log(`     ✓ Users: ${userCount}, Roles: ${roleCount}`);
        console.log(`     ✓ Vehicle Makes: ${makeCount}, Models: ${modelCount}, Generations: ${genCount}, Variants: ${varCount}`);
        console.log(`     ✓ Categories: ${catCount}, Brands: ${brandCount}, Products: ${prodCount}`);
        console.log(`     ✓ Prices: ${priceCount}, Fitments: ${fitCount}`);
        console.log(`     ✓ Warehouses: ${whCount}, Inventory Items: ${invCount}, Shipping Methods: ${shipMethodCount}`);
        // 4. Verify PostgreSQL Extensions
        console.log('  4. Checking enabled PostgreSQL extensions...');
        const extensions = await prisma.$queryRaw `
      SELECT extname FROM pg_extension WHERE extname IN ('pgcrypto', 'pg_trgm', 'unaccent');
    `;
        const installedExts = extensions.map((e) => e.extname);
        console.log(`     ✓ Active extensions: ${installedExts.join(', ')}`);
        const duration = Date.now() - startTime;
        console.log(`\n🎉 Database Health Check PASSED in ${duration}ms! Database is fully operational.`);
        process.exit(0);
    }
    catch (error) {
        console.error('\n❌ Database Health Check FAILED:', error);
        process.exit(1);
    }
    finally {
        await prisma.$disconnect();
    }
}
checkHealth();
//# sourceMappingURL=db-health.js.map