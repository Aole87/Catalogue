"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const argon2_1 = __importDefault(require("argon2"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting deterministic database seed for Intelligent Automotive Platform...');
    // ----------------------------------------------------------------------------
    // 1. ROLES & PERMISSIONS
    // ----------------------------------------------------------------------------
    console.log('  -> Seeding RBAC Roles and Permissions...');
    const roleNames = [
        'SUPER_ADMIN',
        'ADMIN',
        'CATALOG_MANAGER',
        'INVENTORY_MANAGER',
        'ORDER_MANAGER',
        'MARKETING_MANAGER',
        'CUSTOMER_SERVICE',
        'FINANCE',
        'WAREHOUSE_MANAGER',
    ];
    const rolesMap = {};
    for (const rName of roleNames) {
        const role = await prisma.role.upsert({
            where: { name: rName },
            update: {},
            create: {
                name: rName,
                description: `System role for ${rName.replace(/_/g, ' ').toLowerCase()}`,
            },
        });
        rolesMap[rName] = role.id;
    }
    const permissionsList = [
        { resource: 'product', action: 'read', description: 'View product catalog' },
        { resource: 'product', action: 'create', description: 'Create new catalog products' },
        { resource: 'product', action: 'update', description: 'Update product information' },
        { resource: 'product', action: 'delete', description: 'Delete catalog products' },
        { resource: 'category', action: 'read', description: 'View category catalog' },
        { resource: 'category', action: 'create', description: 'Create new categories' },
        { resource: 'category', action: 'update', description: 'Update category information' },
        { resource: 'category', action: 'delete', description: 'Delete categories' },
        { resource: 'brand', action: 'read', description: 'View brands' },
        { resource: 'brand', action: 'create', description: 'Create new brands' },
        { resource: 'brand', action: 'update', description: 'Update brand information' },
        { resource: 'brand', action: 'delete', description: 'Delete brands' },
        { resource: 'vehicle', action: 'read', description: 'View vehicle master data' },
        { resource: 'vehicle', action: 'create', description: 'Create new vehicle hierarchy entries' },
        { resource: 'vehicle', action: 'update', description: 'Update vehicle master data' },
        { resource: 'vehicle', action: 'delete', description: 'Delete vehicle master data' },
        { resource: 'fitment', action: 'read', description: 'View vehicle fitments' },
        { resource: 'fitment', action: 'create', description: 'Create vehicle fitment records' },
        { resource: 'fitment', action: 'update', description: 'Update vehicle fitment records' },
        { resource: 'fitment', action: 'delete', description: 'Delete vehicle fitment records' },
        { resource: 'inventory', action: 'read', description: 'View stock levels' },
        { resource: 'inventory', action: 'adjust', description: 'Adjust stock quantities' },
        { resource: 'order', action: 'read', description: 'View customer orders' },
        { resource: 'order', action: 'update', description: 'Update order status' },
        { resource: 'order', action: 'cancel', description: 'Cancel orders and issue refunds' },
        { resource: 'customer', action: 'read', description: 'View customer profiles' },
        { resource: 'customer', action: 'verify', description: 'Verify B2B garage and shop accounts' },
        { resource: 'pricing', action: 'manage', description: 'Manage tier pricing and promotional rules' },
        { resource: 'report', action: 'read', description: 'Access financial and sales analytics' },
        { resource: 'audit', action: 'read', description: 'View immutable system audit logs' },
    ];
    for (const p of permissionsList) {
        const perm = await prisma.permission.upsert({
            where: { resource_action: { resource: p.resource, action: p.action } },
            update: {},
            create: {
                resource: p.resource,
                action: p.action,
                description: p.description,
            },
        });
        // Assign all permissions to SUPER_ADMIN & ADMIN
        for (const adminRole of ['SUPER_ADMIN', 'ADMIN']) {
            await prisma.rolePermission.upsert({
                where: {
                    roleId_permissionId: {
                        roleId: rolesMap[adminRole],
                        permissionId: perm.id,
                    },
                },
                update: {},
                create: {
                    roleId: rolesMap[adminRole],
                    permissionId: perm.id,
                },
            });
        }
        // Assign product, category, brand, vehicle, fitment, and pricing permissions to CATALOG_MANAGER
        if (['product', 'category', 'brand', 'vehicle', 'fitment', 'pricing'].includes(p.resource)) {
            await prisma.rolePermission.upsert({
                where: {
                    roleId_permissionId: {
                        roleId: rolesMap['CATALOG_MANAGER'],
                        permissionId: perm.id,
                    },
                },
                update: {},
                create: {
                    roleId: rolesMap['CATALOG_MANAGER'],
                    permissionId: perm.id,
                },
            });
        }
    }
    // ----------------------------------------------------------------------------
    // 2. USERS & CUSTOMER PROFILES (SECURE DEVELOPMENT HASHES)
    // ----------------------------------------------------------------------------
    console.log('  -> Seeding Users and Customer Profiles...');
    // Standard development hash using Argon2id for password "Admin@123456"
    const devPasswordHash = await argon2_1.default.hash('Admin@123456', {
        type: argon2_1.default.argon2id,
        memoryCost: 65536, // 64 MB
        timeCost: 3, // 3 iterations
        parallelism: 4, // 4 threads
    });
    // Super Admin Account
    const superAdmin = await prisma.user.upsert({
        where: { email: 'admin@mobex.co.th' },
        update: { passwordHash: devPasswordHash },
        create: {
            email: 'admin@mobex.co.th',
            phone: '0812345678',
            passwordHash: devPasswordHash,
            firstName: 'System',
            lastName: 'Administrator',
            displayName: 'SuperAdmin',
            isActive: true,
            emailVerifiedAt: new Date(),
        },
    });
    await prisma.userRole.upsert({
        where: {
            userId_roleId: {
                userId: superAdmin.id,
                roleId: rolesMap['SUPER_ADMIN'],
            },
        },
        update: {},
        create: {
            userId: superAdmin.id,
            roleId: rolesMap['SUPER_ADMIN'],
        },
    });
    // Catalog Manager Staff Account
    const catalogManager = await prisma.user.upsert({
        where: { email: 'catalog@mobex.co.th' },
        update: { passwordHash: devPasswordHash },
        create: {
            email: 'catalog@mobex.co.th',
            phone: '0819998877',
            passwordHash: devPasswordHash,
            firstName: 'กิตติ',
            lastName: 'จัดการสินค้า',
            displayName: 'Catalog Manager',
            isActive: true,
            emailVerifiedAt: new Date(),
        },
    });
    await prisma.userRole.upsert({
        where: {
            userId_roleId: {
                userId: catalogManager.id,
                roleId: rolesMap['CATALOG_MANAGER'],
            },
        },
        update: {},
        create: {
            userId: catalogManager.id,
            roleId: rolesMap['CATALOG_MANAGER'],
        },
    });
    // B2B Garage Customer: Somchai Garage
    const garageUser = await prisma.user.upsert({
        where: { email: 'somchai@autoworkshop.com' },
        update: { passwordHash: devPasswordHash },
        create: {
            email: 'somchai@autoworkshop.com',
            phone: '0891112233',
            passwordHash: devPasswordHash,
            firstName: 'สมชาย',
            lastName: 'ช่างยนต์',
            displayName: 'ช่างสมชาย (Garage)',
            isActive: true,
            emailVerifiedAt: new Date(),
        },
    });
    const garageProfile = await prisma.customerProfile.upsert({
        where: { userId: garageUser.id },
        update: {},
        create: {
            userId: garageUser.id,
            customerType: client_1.CustomerType.GARAGE,
            companyName: 'อู่สมชายการาจ ออโต้เซอร์วิส',
            taxId: '0105561012345',
            phone: '0891112233',
            notes: 'อู่ซ่อมรถยนต์มาตรฐาน รับงานช่วงล่างและเครื่องยนต์',
            isVerified: true,
        },
    });
    await prisma.customerAddress.create({
        data: {
            customerId: garageProfile.id,
            label: 'อู่ใหญ่ - ลาดพร้าว',
            recipientName: 'สมชาย ช่างยนต์',
            phone: '0891112233',
            addressLine1: '88/9 ถนนลาดพร้าว ซอย 71',
            subdistrict: 'สะพานสอง',
            district: 'วังทองหลาง',
            province: 'กรุงเทพมหานคร',
            postalCode: '10310',
            country: 'TH',
            isDefault: true,
        },
    });
    // B2B Shop Customer: Bangkok Parts Shop
    const shopUser = await prisma.user.upsert({
        where: { email: 'bangkokparts@shop.co.th' },
        update: { passwordHash: devPasswordHash },
        create: {
            email: 'bangkokparts@shop.co.th',
            phone: '028889999',
            passwordHash: devPasswordHash,
            firstName: 'วิชัย',
            lastName: 'เจริญพาณิชย์',
            displayName: 'ร้านบางกอกอะไหล่',
            isActive: true,
            emailVerifiedAt: new Date(),
        },
    });
    await prisma.customerProfile.upsert({
        where: { userId: shopUser.id },
        update: {},
        create: {
            userId: shopUser.id,
            customerType: client_1.CustomerType.SHOP,
            companyName: 'ห้างหุ้นส่วนจำกัด บางกอกอะไหล่ยนต์ 1998',
            taxId: '0103541098765',
            phone: '028889999',
            notes: 'ร้านขายส่งอะไหล่รถยนต์ฝั่งธนบุรี',
            isVerified: true,
        },
    });
    // B2C Customer
    const consumerUser = await prisma.user.upsert({
        where: { email: 'ananda@consumer.com' },
        update: { passwordHash: devPasswordHash },
        create: {
            email: 'ananda@consumer.com',
            phone: '0865554433',
            passwordHash: devPasswordHash,
            firstName: 'อนันดา',
            lastName: 'รักขับ',
            displayName: 'คุณอนันดา',
            isActive: true,
            emailVerifiedAt: new Date(),
        },
    });
    await prisma.customerProfile.upsert({
        where: { userId: consumerUser.id },
        update: {},
        create: {
            userId: consumerUser.id,
            customerType: client_1.CustomerType.CUSTOMER,
            phone: '0865554433',
            isVerified: false,
        },
    });
    // ----------------------------------------------------------------------------
    // 3. VEHICLE HIERARCHY DOMAIN
    // ----------------------------------------------------------------------------
    console.log('  -> Seeding Vehicle Makes, Models, Generations, Engines, and Variants...');
    const makesData = [
        { name: 'Toyota', slug: 'toyota', country: 'Japan' },
        { name: 'Honda', slug: 'honda', country: 'Japan' },
        { name: 'Mazda', slug: 'mazda', country: 'Japan' },
        { name: 'Isuzu', slug: 'isuzu', country: 'Japan' },
        { name: 'Mitsubishi', slug: 'mitsubishi', country: 'Japan' },
        { name: 'Nissan', slug: 'nissan', country: 'Japan' },
        { name: 'Ford', slug: 'ford', country: 'USA' },
        { name: 'BMW', slug: 'bmw', country: 'Germany' },
        { name: 'Mercedes-Benz', slug: 'mercedes-benz', country: 'Germany' },
    ];
    const makesMap = {};
    for (const m of makesData) {
        const make = await prisma.vehicleMake.upsert({
            where: { slug: m.slug },
            update: {},
            create: {
                name: m.name,
                slug: m.slug,
                countryOfOrigin: m.country,
            },
        });
        makesMap[m.name] = make.id;
    }
    // Models
    const toyotaModels = [
        { name: 'Camry', slug: 'camry' },
        { name: 'Corolla Altis', slug: 'corolla-altis' },
        { name: 'Hilux Revo', slug: 'hilux-revo' },
        { name: 'Fortuner', slug: 'fortuner' },
        { name: 'Yaris ATIV', slug: 'yaris-ativ' },
    ];
    const hondaModels = [
        { name: 'Civic', slug: 'civic' },
        { name: 'City', slug: 'city' },
        { name: 'CR-V', slug: 'cr-v' },
        { name: 'HR-V', slug: 'hr-v' },
        { name: 'Accord', slug: 'accord' },
    ];
    const mazdaModels = [
        { name: '2', slug: '2' },
        { name: '3', slug: '3' },
        { name: 'CX-30', slug: 'cx-30' },
        { name: 'CX-5', slug: 'cx-5' },
    ];
    const isuzuModels = [
        { name: 'D-Max', slug: 'd-max' },
        { name: 'MU-X', slug: 'mu-x' },
    ];
    const modelsMap = {};
    for (const m of toyotaModels) {
        const model = await prisma.vehicleModel.upsert({
            where: { makeId_slug: { makeId: makesMap['Toyota'], slug: m.slug } },
            update: {},
            create: { makeId: makesMap['Toyota'], name: m.name, slug: m.slug },
        });
        modelsMap[`Toyota_${m.name}`] = model.id;
    }
    for (const m of hondaModels) {
        const model = await prisma.vehicleModel.upsert({
            where: { makeId_slug: { makeId: makesMap['Honda'], slug: m.slug } },
            update: {},
            create: { makeId: makesMap['Honda'], name: m.name, slug: m.slug },
        });
        modelsMap[`Honda_${m.name}`] = model.id;
    }
    for (const m of mazdaModels) {
        const model = await prisma.vehicleModel.upsert({
            where: { makeId_slug: { makeId: makesMap['Mazda'], slug: m.slug } },
            update: {},
            create: { makeId: makesMap['Mazda'], name: m.name, slug: m.slug },
        });
        modelsMap[`Mazda_${m.name}`] = model.id;
    }
    for (const m of isuzuModels) {
        const model = await prisma.vehicleModel.upsert({
            where: { makeId_slug: { makeId: makesMap['Isuzu'], slug: m.slug } },
            update: {},
            create: { makeId: makesMap['Isuzu'], name: m.name, slug: m.slug },
        });
        modelsMap[`Isuzu_${m.name}`] = model.id;
    }
    // Generations
    const genCivicFC = await prisma.vehicleGeneration.upsert({
        where: { modelId_name: { modelId: modelsMap['Honda_Civic'], name: 'Civic FC (10th Gen)' } },
        update: {},
        create: { modelId: modelsMap['Honda_Civic'], name: 'Civic FC (10th Gen)', code: 'FC1/FK7', startYear: 2016, endYear: 2021 },
    });
    const genCivicFE = await prisma.vehicleGeneration.upsert({
        where: { modelId_name: { modelId: modelsMap['Honda_Civic'], name: 'Civic FE (11th Gen)' } },
        update: {},
        create: { modelId: modelsMap['Honda_Civic'], name: 'Civic FE (11th Gen)', code: 'FE1', startYear: 2021, endYear: null },
    });
    const genFortuner = await prisma.vehicleGeneration.upsert({
        where: { modelId_name: { modelId: modelsMap['Toyota_Fortuner'], name: 'Fortuner AN160 (2nd Gen)' } },
        update: {},
        create: { modelId: modelsMap['Toyota_Fortuner'], name: 'Fortuner AN160 (2nd Gen)', code: 'GUN156/166', startYear: 2015, endYear: null },
    });
    const genRevo = await prisma.vehicleGeneration.upsert({
        where: { modelId_name: { modelId: modelsMap['Toyota_Hilux Revo'], name: 'Hilux Revo AN120/AN130' } },
        update: {},
        create: { modelId: modelsMap['Toyota_Hilux Revo'], name: 'Hilux Revo AN120/AN130', code: 'GUN125/126', startYear: 2015, endYear: null },
    });
    const genMazda2 = await prisma.vehicleGeneration.upsert({
        where: { modelId_name: { modelId: modelsMap['Mazda_2'], name: 'Mazda 2 DJ' } },
        update: {},
        create: { modelId: modelsMap['Mazda_2'], name: 'Mazda 2 DJ', code: 'DJ', startYear: 2015, endYear: null },
    });
    const genMazda3 = await prisma.vehicleGeneration.upsert({
        where: { modelId_name: { modelId: modelsMap['Mazda_3'], name: 'Mazda 3 BP (4th Gen)' } },
        update: {},
        create: { modelId: modelsMap['Mazda_3'], name: 'Mazda 3 BP (4th Gen)', code: 'BP', startYear: 2019, endYear: null },
    });
    const genDMax = await prisma.vehicleGeneration.upsert({
        where: { modelId_name: { modelId: modelsMap['Isuzu_D-Max'], name: 'D-Max RG01 (3rd Gen)' } },
        update: {},
        create: { modelId: modelsMap['Isuzu_D-Max'], name: 'D-Max RG01 (3rd Gen)', code: 'RG01', startYear: 2019, endYear: null },
    });
    const genCamry = await prisma.vehicleGeneration.upsert({
        where: { modelId_name: { modelId: modelsMap['Toyota_Camry'], name: 'Camry XV70 (8th Gen)' } },
        update: {},
        create: { modelId: modelsMap['Toyota_Camry'], name: 'Camry XV70 (8th Gen)', code: 'XV70', startYear: 2018, endYear: 2024 },
    });
    const genYarisXP150 = await prisma.vehicleGeneration.upsert({
        where: { modelId_name: { modelId: modelsMap['Toyota_Yaris ATIV'], name: 'Yaris ATIV / Hatchback XP150' } },
        update: {},
        create: { modelId: modelsMap['Toyota_Yaris ATIV'], name: 'Yaris ATIV / Hatchback XP150', code: 'XP150', startYear: 2013, endYear: 2022 },
    });
    // Engines (Idempotent Helper)
    const getOrCreateEngine = async (data) => {
        const existing = await prisma.vehicleEngine.findFirst({ where: { engineCode: data.engineCode } });
        if (existing)
            return existing;
        return prisma.vehicleEngine.create({ data });
    };
    const engL15B = await getOrCreateEngine({
        engineCode: 'L15BG', name: '1.5 VTEC Turbo', displacementCc: 1498, cylinders: 4, fuelType: client_1.FuelType.PETROL, aspiration: 'Turbocharged'
    });
    const eng1GD = await getOrCreateEngine({
        engineCode: '1GD-FTV', name: '2.8 D-4D VN Turbo', displacementCc: 2755, cylinders: 4, fuelType: client_1.FuelType.DIESEL, aspiration: 'Turbocharged'
    });
    const eng2GD = await getOrCreateEngine({
        engineCode: '2GD-FTV', name: '2.4 D-4D VN Turbo', displacementCc: 2393, cylinders: 4, fuelType: client_1.FuelType.DIESEL, aspiration: 'Turbocharged'
    });
    const engSky13 = await getOrCreateEngine({
        engineCode: 'SkyActiv-G 1.3', name: '1.3 SkyActiv-G Petrol', displacementCc: 1299, cylinders: 4, fuelType: client_1.FuelType.PETROL, aspiration: 'Naturally Aspirated'
    });
    const eng4JJ3 = await getOrCreateEngine({
        engineCode: '4JJ3-TCX', name: '3.0 Ddi BluePower VGS Turbo', displacementCc: 2999, cylinders: 4, fuelType: client_1.FuelType.DIESEL, aspiration: 'Turbocharged'
    });
    const engA25A = await getOrCreateEngine({
        engineCode: 'A25A-FKS', name: '2.5 Dynamic Force', displacementCc: 2487, cylinders: 4, fuelType: client_1.FuelType.PETROL, aspiration: 'Naturally Aspirated'
    });
    const eng3NR = await getOrCreateEngine({
        engineCode: '3NR-FE', name: '1.2 Dual VVT-i 3NR-FE', displacementCc: 1197, cylinders: 4, fuelType: client_1.FuelType.PETROL, aspiration: 'Naturally Aspirated'
    });
    const eng2NR = await getOrCreateEngine({
        engineCode: '2NR-FE', name: '1.5 Dual VVT-i 2NR-FE', displacementCc: 1496, cylinders: 4, fuelType: client_1.FuelType.PETROL, aspiration: 'Naturally Aspirated'
    });
    // Variants
    const varCivicFC = await prisma.vehicleVariant.upsert({
        where: { generationId_name: { generationId: genCivicFC.id, name: '1.5 Turbo RS CVT' } },
        update: {},
        create: { generationId: genCivicFC.id, engineId: engL15B.id, name: '1.5 Turbo RS CVT', transmission: 'CVT', bodyType: 'Sedan', drivetrain: 'FWD', startYear: 2016, endYear: 2021 },
    });
    const varCivicFE = await prisma.vehicleVariant.upsert({
        where: { generationId_name: { generationId: genCivicFE.id, name: '1.5 VTEC Turbo EL+ / RS' } },
        update: {},
        create: { generationId: genCivicFE.id, engineId: engL15B.id, name: '1.5 VTEC Turbo EL+ / RS', transmission: 'CVT', bodyType: 'Sedan', drivetrain: 'FWD', startYear: 2021, endYear: null },
    });
    const varFortuner = await prisma.vehicleVariant.upsert({
        where: { generationId_name: { generationId: genFortuner.id, name: '2.8 GR Sport 4WD 6AT' } },
        update: {},
        create: { generationId: genFortuner.id, engineId: eng1GD.id, name: '2.8 GR Sport 4WD 6AT', transmission: '6AT', bodyType: 'SUV', drivetrain: '4WD', startYear: 2021, endYear: null },
    });
    const varRevo = await prisma.vehicleVariant.upsert({
        where: { generationId_name: { generationId: genRevo.id, name: 'Double Cab Prerunner 2.4 Mid' } },
        update: {},
        create: { generationId: genRevo.id, engineId: eng2GD.id, name: 'Double Cab Prerunner 2.4 Mid', transmission: '6AT', bodyType: 'Pickup', drivetrain: 'RWD', startYear: 2020, endYear: null },
    });
    const varMazda2 = await prisma.vehicleVariant.upsert({
        where: { generationId_name: { generationId: genMazda2.id, name: '1.3 High Connect 6AT' } },
        update: {},
        create: { generationId: genMazda2.id, engineId: engSky13.id, name: '1.3 High Connect 6AT', transmission: '6AT', bodyType: 'Hatchback', drivetrain: 'FWD', startYear: 2018, endYear: null },
    });
    const varMazda3 = await prisma.vehicleVariant.upsert({
        where: { generationId_name: { generationId: genMazda3.id, name: '2.0 SP Fastback' } },
        update: {},
        create: { generationId: genMazda3.id, name: '2.0 SP Fastback', transmission: '6AT', bodyType: 'Fastback', drivetrain: 'FWD', startYear: 2019, endYear: null },
    });
    const varDMax = await prisma.vehicleVariant.upsert({
        where: { generationId_name: { generationId: genDMax.id, name: 'Hi-Lander 4-Door 3.0 M 6AT' } },
        update: {},
        create: { generationId: genDMax.id, engineId: eng4JJ3.id, name: 'Hi-Lander 4-Door 3.0 M 6AT', transmission: '6AT', bodyType: 'Pickup', drivetrain: 'RWD', startYear: 2020, endYear: null },
    });
    const varCamry = await prisma.vehicleVariant.upsert({
        where: { generationId_name: { generationId: genCamry.id, name: '2.5 Premium 8AT' } },
        update: {},
        create: { generationId: genCamry.id, engineId: engA25A.id, name: '2.5 Premium 8AT', transmission: '8AT', bodyType: 'Sedan', drivetrain: 'FWD', startYear: 2018, endYear: 2024 },
    });
    const varYaris12 = await prisma.vehicleVariant.upsert({
        where: { generationId_name: { generationId: genYarisXP150.id, name: '1.2 E CVT Eco' } },
        update: {},
        create: { generationId: genYarisXP150.id, engineId: eng3NR.id, name: '1.2 E CVT Eco', transmission: 'CVT', bodyType: 'Sedan', drivetrain: 'FWD', startYear: 2017, endYear: 2022 },
    });
    const varYaris15 = await prisma.vehicleVariant.upsert({
        where: { generationId_name: { generationId: genYarisXP150.id, name: '1.5 G CVT' } },
        update: {},
        create: { generationId: genYarisXP150.id, engineId: eng2NR.id, name: '1.5 G CVT', transmission: 'CVT', bodyType: 'Hatchback', drivetrain: 'FWD', startYear: 2014, endYear: 2017 },
    });
    // ----------------------------------------------------------------------------
    // 4. CATEGORIES & BRANDS (HIERARCHICAL)
    // ----------------------------------------------------------------------------
    console.log('  -> Seeding Hierarchical Categories and Brands...');
    // Root Categories
    const catBrakes = await prisma.category.upsert({
        where: { slug: 'brakes' },
        update: {},
        create: { name: 'ระบบเบรก', slug: 'brakes', description: 'จานเบรก ผ้าเบรก สายเบรก และน้ำมันเบรก', sortOrder: 1 },
    });
    const catFilters = await prisma.category.upsert({
        where: { slug: 'filters' },
        update: {},
        create: { name: 'ไส้กรอง', slug: 'filters', description: 'กรองน้ำมันเครื่อง กรองอากาศ กรองแอร์ กรองโซล่า', sortOrder: 2 },
    });
    const catSuspension = await prisma.category.upsert({
        where: { slug: 'suspension' },
        update: {},
        create: { name: 'ระบบช่วงล่าง', slug: 'suspension', description: 'โช้คอัพ ลูกหมาก บูชปีกนก สปริง', sortOrder: 3 },
    });
    const catEngine = await prisma.category.upsert({
        where: { slug: 'engine' },
        update: {},
        create: { name: 'เครื่องยนต์และระบบจุดระเบิด', slug: 'engine', description: 'หัวเทียน คอยล์จุดระเบิด สายพาน ปะเก็น', sortOrder: 4 },
    });
    const catFluids = await prisma.category.upsert({
        where: { slug: 'fluids' },
        update: {},
        create: { name: 'น้ำมันและสารหล่อลื่น', slug: 'fluids', description: 'น้ำมันเครื่อง น้ำมันเกียร์ น้ำมันเบรก น้ำยาหม้อน้ำ', sortOrder: 5 },
    });
    // Subcategories
    const catFrontBrakePads = await prisma.category.upsert({
        where: { slug: 'front-brake-pads' },
        update: {},
        create: { parentId: catBrakes.id, name: 'ผ้าเบรกหน้า (Front Brake Pads)', slug: 'front-brake-pads', sortOrder: 1 },
    });
    const catRearBrakePads = await prisma.category.upsert({
        where: { slug: 'rear-brake-pads' },
        update: {},
        create: { parentId: catBrakes.id, name: 'ผ้าเบรกหลัง (Rear Brake Pads)', slug: 'rear-brake-pads', sortOrder: 2 },
    });
    const catOilFilters = await prisma.category.upsert({
        where: { slug: 'oil-filters' },
        update: {},
        create: { parentId: catFilters.id, name: 'กรองน้ำมันเครื่อง (Oil Filters)', slug: 'oil-filters', sortOrder: 1 },
    });
    const catAirFilters = await prisma.category.upsert({
        where: { slug: 'air-filters' },
        update: {},
        create: { parentId: catFilters.id, name: 'กรองอากาศเครื่องยนต์ (Air Filters)', slug: 'air-filters', sortOrder: 2 },
    });
    const catSparkPlugs = await prisma.category.upsert({
        where: { slug: 'spark-plugs' },
        update: {},
        create: { parentId: catEngine.id, name: 'หัวเทียน (Spark Plugs)', slug: 'spark-plugs', sortOrder: 1 },
    });
    // Brands
    const brandsData = [
        { name: 'Akebono', slug: 'akebono', desc: 'ผู้นำด้านผ้าเบรก OEM จากประเทศญี่ปุ่น' },
        { name: 'TRW', slug: 'trw', desc: 'ระบบเบรกและช่วงล่างมาตรฐานยุโรป' },
        { name: 'Brembo', slug: 'brembo', desc: 'ระบบเบรกสมรรถนะสูงระดับโลก' },
        { name: 'Denso', slug: 'denso', desc: 'อะไหล่แท้และอุปกรณ์ไฟฟ้ารถยนต์ชั้นนำ' },
        { name: 'Bosch', slug: 'bosch', desc: 'เทคโนโลยียานยนต์และอะไหล่มาตรฐานเยอรมัน' },
        { name: 'NGK', slug: 'ngk', desc: 'หัวเทียนและเซนเซอร์ออกซิเจนยอดนิยม' },
        { name: 'Sakura', slug: 'sakura', desc: 'ไส้กรองคุณภาพระดับส่งออก' },
        { name: 'Aisin', slug: 'aisin', desc: 'ผู้ผลิตคลัตช์ ปั๊มน้ำ และระบบส่งกำลังอันดับ 1' },
        { name: 'Mobil 1', slug: 'mobil-1', desc: 'น้ำมันเครื่องสังเคราะห์แท้ 100%' },
    ];
    const brandsMap = {};
    for (const b of brandsData) {
        const brand = await prisma.brand.upsert({
            where: { slug: b.slug },
            update: {},
            create: { name: b.name, slug: b.slug, description: b.desc },
        });
        brandsMap[b.name] = brand.id;
    }
    // ----------------------------------------------------------------------------
    // 5. ATTRIBUTES DOMAIN
    // ----------------------------------------------------------------------------
    console.log('  -> Seeding Product Attributes...');
    const attrMaterial = await prisma.productAttribute.upsert({
        where: { code: 'material' },
        update: {},
        create: { name: 'วัสดุผ้าเบรก (Brake Material)', code: 'material' },
    });
    const attrPosition = await prisma.productAttribute.upsert({
        where: { code: 'position' },
        update: {},
        create: { name: 'ตำแหน่งติดตั้ง (Position)', code: 'position' },
    });
    const attrViscosity = await prisma.productAttribute.upsert({
        where: { code: 'viscosity' },
        update: {},
        create: { name: 'ความหนืดน้ำมัน (Viscosity)', code: 'viscosity' },
    });
    const attrThreadSize = await prisma.productAttribute.upsert({
        where: { code: 'thread_size' },
        update: {},
        create: { name: 'ขนาดเกลียว (Thread Size)', code: 'thread_size', unit: 'mm' },
    });
    // ----------------------------------------------------------------------------
    // 6. MASTER PRODUCTS, TIER PRICES, CROSS-REFS & IMAGES
    // ----------------------------------------------------------------------------
    console.log('  -> Seeding Master Products, Pricing Tiers, and Fitments...');
    const productsData = [
        {
            sku: 'AKE-AN-787WK',
            slug: 'akebono-ultra-premium-ceramic-front-brake-pads-civic-fc-fe',
            name: 'Akebono Ultra-Premium Ceramic ผ้าเบรกหน้า Honda Civic FC / FE',
            shortDesc: 'ผ้าเบรกเซรามิกเกรดพรีเมียม ไร้เสียงรบกวน ฝุ่นน้อย ถนอมจานเบรก',
            desc: 'ผ้าเบรกหน้า Akebono ผลิตในประเทศญี่ปุ่น ออกแบบสำหรับ Honda Civic FC (2016-2021) และ Civic FE (2021-Present) เนื้อเซรามิกแท้ ไม่กินจานเบรก ระยะเบรกสั้นมั่นใจ',
            brand: 'Akebono',
            category: catFrontBrakePads.id,
            weightGrams: 1450,
            prices: { general: 1850.00, shop: 1650.00, garage: 1500.00 },
            crossRefs: [
                { type: client_1.ProductReferenceType.OEM, ref: '45022-TBA-A01' },
                { type: client_1.ProductReferenceType.AFTERMARKET, ref: 'GDB3494' },
            ],
            attributes: [
                { attrId: attrMaterial.id, value: 'Ultra-Premium Ceramic' },
                { attrId: attrPosition.id, value: 'Front Axle (ล้อหน้า)' },
            ],
            fitments: [
                { variantId: varCivicFC.id, position: 'Front Axle', notes: 'ตรงรุ่น ไม่ต้องดัดแปลง' },
                { variantId: varCivicFE.id, position: 'Front Axle', notes: 'ตรงรุ่น ไม่ต้องดัดแปลง' },
            ],
            imageUrl: 'https://images.unsplash.com/photo-1600706432502-778e34279b90?w=600&auto=format&fit=crop&q=80',
        },
        {
            sku: 'TRW-GDB7782',
            slug: 'trw-dtec-ceramic-front-brake-pads-toyota-camry-xv70',
            name: 'TRW DTEC Ceramic ผ้าเบรกหน้า Toyota Camry XV70 / Fortuner AN160',
            shortDesc: 'ผ้าเบรกเซรามิกเคลือบสาร COTEC เบรกสั้นตั้งแต่กิโลเมตรแรก',
            desc: 'ผ้าเบรกหน้า TRW DTEC นวัตกรรมเนื้อเซรามิกผสมผสานสารเคลือบผิวสัมผัส COTEC สำหรับ Toyota Camry 2.5 และ Fortuner 2.8 GR Sport มาตรฐานระดับ OEM สากล',
            brand: 'TRW',
            category: catFrontBrakePads.id,
            weightGrams: 1850,
            prices: { general: 1950.00, shop: 1750.00, garage: 1580.00 },
            crossRefs: [
                { type: client_1.ProductReferenceType.OEM, ref: '04465-33471' },
                { type: client_1.ProductReferenceType.OEM, ref: '04465-0K360' },
                { type: client_1.ProductReferenceType.CROSS_REFERENCE, ref: 'DB1774' },
            ],
            attributes: [
                { attrId: attrMaterial.id, value: 'DTEC Ceramic COTEC' },
                { attrId: attrPosition.id, value: 'Front Axle (ล้อหน้า)' },
            ],
            fitments: [
                { variantId: varCamry.id, position: 'Front Axle', notes: 'ใช้ได้กับจานเบรกขนาด 328mm' },
                { variantId: varFortuner.id, position: 'Front Axle', notes: 'ตรงรุ่น Fortuner GR Sport' },
            ],
            imageUrl: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=600&auto=format&fit=crop&q=80',
        },
        {
            sku: 'DEN-IK20TT',
            slug: 'denso-iridium-tt-spark-plugs-set-of-4',
            name: 'Denso Iridium TT หัวเทียนเข็มคู่ อิริเดียม 0.4mm (ชุด 4 หัว)',
            shortDesc: 'หัวเทียนเข็มคู่ Iridium-Platinum เผาไหม้สมบูรณ์ ประหยัดน้ำมัน',
            desc: 'หัวเทียน Denso Iridium TT เข็มคู่ 0.4mm แกนอิริเดียมและเข็มแพลทินัม 0.7mm ให้อัตราเร่งตอบสนองทันใจ อายุการใช้งานยาวนานกว่า 100,000 กิโลเมตร',
            brand: 'Denso',
            category: catSparkPlugs.id,
            weightGrams: 280,
            prices: { general: 1400.00, shop: 1200.00, garage: 1080.00 },
            crossRefs: [
                { type: client_1.ProductReferenceType.OEM, ref: '90919-01210' },
                { type: client_1.ProductReferenceType.AFTERMARKET, ref: 'BKR6EIX-11' },
            ],
            attributes: [
                { attrId: attrThreadSize.id, value: '14mm x 1.25' },
            ],
            fitments: [
                { variantId: varCamry.id, position: 'Engine Block', notes: '4 หัวต่อ 1 เครื่องยนต์' },
                { variantId: varMazda2.id, position: 'Engine Block', notes: '4 หัวต่อ 1 เครื่องยนต์' },
                { variantId: varMazda3.id, position: 'Engine Block', notes: '4 หัวต่อ 1 เครื่องยนต์' },
            ],
            imageUrl: 'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?w=600&auto=format&fit=crop&q=80',
        },
        {
            sku: 'SAK-C-1109',
            slug: 'sakura-oem-oil-filter-isuzu-dmax-1-9-3-0',
            name: 'Sakura กรองน้ำมันเครื่องแท้ OEM Isuzu D-Max BluePower 1.9 / 3.0',
            shortDesc: 'ไส้กรองน้ำมันเครื่องมาตรฐานส่งออก กระดาษกรองหนาพิเศษ กักเก็บสิ่งสกปรกได้ 99%',
            desc: 'ไส้กรองน้ำมันเครื่อง Sakura C-1109 ตรงรุ่นสำหรับเครื่องยนต์ Isuzu D-Max RZ4E (1.9) และ 4JJ3 (3.0) ช่วยรักษาความสะอาดของระบบหล่อลื่นอย่างมีประสิทธิภาพ',
            brand: 'Sakura',
            category: catOilFilters.id,
            weightGrams: 350,
            prices: { general: 220.00, shop: 175.00, garage: 150.00 },
            crossRefs: [
                { type: client_1.ProductReferenceType.OEM, ref: '8-98165-071-0' },
                { type: client_1.ProductReferenceType.OEM, ref: '8-98000-001-0' },
            ],
            attributes: [
                { attrId: attrPosition.id, value: 'Engine Oil Filter Housing' },
            ],
            fitments: [
                { variantId: varDMax.id, position: 'Engine Housing', notes: 'รวมโอริงยางกันซึมในกล่อง' },
            ],
            imageUrl: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&auto=format&fit=crop&q=80',
        },
        {
            sku: 'MOB-1-0W40-4L',
            slug: 'mobil-1-fs-0w-40-fully-synthetic-engine-oil-4l',
            name: 'Mobil 1 FS 0W-40 น้ำมันเครื่องสังเคราะห์แท้ 100% แกลลอน 4 ลิตร',
            shortDesc: 'สุดยอดน้ำมันเครื่องสังเคราะห์แท้ ปกป้องเครื่องยนต์สูงสุดในทุกสภาวะ',
            desc: 'Mobil 1 FS 0W-40 มาตรฐาน API SP / ACEA A3/B4 ให้การปกป้องการสึกหรออย่างยอดเยี่ยม รักษาความสะอาดของเครื่องยนต์ และคงประสิทธิภาพความหนืดในอุณหภูมิสูง',
            brand: 'Mobil 1',
            category: catFluids.id,
            weightGrams: 3800,
            prices: { general: 2150.00, shop: 1950.00, garage: 1780.00 },
            crossRefs: [
                { type: client_1.ProductReferenceType.SUPPLIER, ref: 'MOBIL-0W40-4L-TH' },
            ],
            attributes: [
                { attrId: attrViscosity.id, value: 'SAE 0W-40' },
            ],
            fitments: [
                { variantId: varCivicFC.id, position: 'Engine Sump', notes: 'ปริมาณที่ใช้ 3.5 ลิตร' },
                { variantId: varCivicFE.id, position: 'Engine Sump', notes: 'ปริมาณที่ใช้ 3.5 ลิตร' },
                { variantId: varCamry.id, position: 'Engine Sump', notes: 'ปริมาณที่ใช้ 4.5 ลิตร' },
                { variantId: varMazda3.id, position: 'Engine Sump', notes: 'ปริมาณที่ใช้ 4.2 ลิตร' },
            ],
            imageUrl: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=600&auto=format&fit=crop&q=80',
        },
    ];
    const seededProductIds = [];
    for (const p of productsData) {
        const product = await prisma.product.upsert({
            where: { sku: p.sku },
            update: {},
            create: {
                sku: p.sku,
                slug: p.slug,
                name: p.name,
                shortDescription: p.shortDesc,
                description: p.desc,
                brandId: brandsMap[p.brand],
                categoryId: p.category,
                weightGrams: p.weightGrams,
                isActive: true,
                isPublished: true,
            },
        });
        seededProductIds.push(product.id);
        // Tiered Prices
        await prisma.productPrice.upsert({
            where: { productId_tier: { productId: product.id, tier: client_1.PriceTier.GENERAL } },
            update: {},
            create: { productId: product.id, tier: client_1.PriceTier.GENERAL, price: p.prices.general, currency: 'THB' },
        });
        await prisma.productPrice.upsert({
            where: { productId_tier: { productId: product.id, tier: client_1.PriceTier.SHOP } },
            update: {},
            create: { productId: product.id, tier: client_1.PriceTier.SHOP, price: p.prices.shop, currency: 'THB' },
        });
        await prisma.productPrice.upsert({
            where: { productId_tier: { productId: product.id, tier: client_1.PriceTier.GARAGE } },
            update: {},
            create: { productId: product.id, tier: client_1.PriceTier.GARAGE, price: p.prices.garage, currency: 'THB' },
        });
        // Cross References
        for (const cr of p.crossRefs) {
            await prisma.productCrossReference.upsert({
                where: {
                    productId_referenceType_referenceNumber: {
                        productId: product.id,
                        referenceType: cr.type,
                        referenceNumber: cr.ref,
                    },
                },
                update: {},
                create: {
                    productId: product.id,
                    referenceType: cr.type,
                    referenceNumber: cr.ref,
                    brandId: brandsMap[p.brand],
                },
            });
        }
        // Attributes
        for (const attr of p.attributes) {
            await prisma.productAttributeValue.upsert({
                where: {
                    productId_attributeId: {
                        productId: product.id,
                        attributeId: attr.attrId,
                    },
                },
                update: {},
                create: {
                    productId: product.id,
                    attributeId: attr.attrId,
                    value: attr.value,
                },
            });
        }
        // Images
        const existingImg = await prisma.productImage.findFirst({
            where: { productId: product.id, url: p.imageUrl },
        });
        if (!existingImg) {
            await prisma.productImage.create({
                data: {
                    productId: product.id,
                    url: p.imageUrl,
                    altText: p.name,
                    sortOrder: 1,
                    isPrimary: true,
                },
            });
        }
        // Fitments
        for (const fit of p.fitments) {
            await prisma.productFitment.upsert({
                where: {
                    productId_vehicleVariantId_position: {
                        productId: product.id,
                        vehicleVariantId: fit.variantId,
                        position: fit.position,
                    },
                },
                update: {},
                create: {
                    productId: product.id,
                    vehicleVariantId: fit.variantId,
                    position: fit.position,
                    notes: fit.notes,
                    fitmentStatus: client_1.FitmentStatus.COMPATIBLE,
                },
            });
        }
    }
    // ----------------------------------------------------------------------------
    // 7. WAREHOUSES & INVENTORY
    // ----------------------------------------------------------------------------
    console.log('  -> Seeding Warehouses, Stock Levels, and Initial Ledger Movements...');
    const whMain = await prisma.warehouse.upsert({
        where: { code: 'WH-MAIN' },
        update: {},
        create: {
            code: 'WH-MAIN',
            name: 'คลังสินค้าหลัก รังสิต (Central DC Rangsit)',
            description: 'ศูนย์กระจายสินค้าหลักกรุงเทพฯ และปริมณฑล',
            addressLine1: '99 หมู่ 1 ถนนพหลโยธิน',
            district: 'คลองหลวง',
            province: 'ปทุมธานี',
            postalCode: '12120',
            isActive: true,
        },
    });
    const whRama9 = await prisma.warehouse.upsert({
        where: { code: 'WH-BKK-01' },
        update: {},
        create: {
            code: 'WH-BKK-01',
            name: 'สาขาพระราม 9 ฮับด่วน (Rama 9 Fast Hub)',
            description: 'ฮับจัดส่งด่วนพื้นที่กรุงเทพฯ ชั้นใน',
            addressLine1: '254 ถนนพระราม 9',
            district: 'ห้วยขวาง',
            province: 'กรุงเทพมหานคร',
            postalCode: '10310',
            isActive: true,
        },
    });
    // Seed inventory items and initial stock movement records
    for (const prodId of seededProductIds) {
        const itemMain = await prisma.inventoryItem.upsert({
            where: { warehouseId_productId: { warehouseId: whMain.id, productId: prodId } },
            update: {},
            create: {
                warehouseId: whMain.id,
                productId: prodId,
                onHand: 150,
                reserved: 5,
                reorderPoint: 20,
                reorderQuantity: 100,
            },
        });
        const itemRama9 = await prisma.inventoryItem.upsert({
            where: { warehouseId_productId: { warehouseId: whRama9.id, productId: prodId } },
            update: {},
            create: {
                warehouseId: whRama9.id,
                productId: prodId,
                onHand: 35,
                reserved: 0,
                reorderPoint: 10,
                reorderQuantity: 30,
            },
        });
        // Record initial ledger receipt
        await prisma.stockMovement.create({
            data: {
                warehouseId: whMain.id,
                productId: prodId,
                movementType: client_1.InventoryMovementType.PURCHASE_RECEIPT,
                quantity: 150,
                referenceType: 'PO_INITIAL_SEED',
                notes: 'Initial opening stock replenishment',
            },
        });
    }
    // ----------------------------------------------------------------------------
    // 8. SHIPPING METHODS
    // ----------------------------------------------------------------------------
    console.log('  -> Seeding Shipping Methods...');
    const shippingMethods = [
        { code: 'KERRY', name: 'Kerry Express (ส่งด่วนทั่วไทย 1-2 วัน)', basePrice: 60.00 },
        { code: 'FLASH', name: 'Flash Express (ส่งพัสดุมาตรฐาน)', basePrice: 45.00 },
        { code: 'SCG_COOL', name: 'SCG Express (ขนส่งพัสดุขนาดใหญ่ / หนัก)', basePrice: 120.00 },
        { code: 'LALAMOVE', name: 'Lalamove Express (ส่งด่วนมอเตอร์ไซค์ 2 ชั่วโมง กทม.)', basePrice: 200.00 },
    ];
    for (const sm of shippingMethods) {
        await prisma.shippingMethod.upsert({
            where: { code: sm.code },
            update: {},
            create: {
                code: sm.code,
                name: sm.name,
                basePrice: sm.basePrice,
                isActive: true,
            },
        });
    }
    console.log('✅ Deterministic seed completed successfully!');
}
main()
    .catch((e) => {
    console.error('❌ Seed failed with error:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map