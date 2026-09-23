"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supplierRoutes = supplierRoutes;
const supplier_controller_1 = require("../controllers/supplier.controller");
const auth_1 = require("../middleware/auth");
async function supplierRoutes(app) {
    const staffRoles = ['SUPER_ADMIN', 'STORE_MANAGER', 'INVENTORY_CLERK', 'ACCOUNTANT', 'SALES_REP'];
    const managerRoles = ['SUPER_ADMIN', 'STORE_MANAGER'];
    // 1. Supplier Master Data
    app.get('/suppliers', {
        preHandler: [(0, auth_1.requireRole)(staffRoles)],
        schema: {
            description: 'List suppliers with filtering, search, and pagination',
            tags: ['Supplier & Procurement Management'],
            security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        },
        handler: supplier_controller_1.SupplierController.getSuppliers,
    });
    app.get('/suppliers/products/lookup', {
        preHandler: [(0, auth_1.requireRole)(staffRoles)],
        schema: {
            description: 'Lookup supplier product mapping by supplierId and productId',
            tags: ['Supplier & Procurement Management'],
            security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        },
        handler: supplier_controller_1.SupplierController.lookupSupplierProduct,
    });
    app.get('/suppliers/:id', {
        preHandler: [(0, auth_1.requireRole)(staffRoles)],
        schema: {
            description: 'Get supplier details by UUID',
            tags: ['Supplier & Procurement Management'],
            security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        },
        handler: supplier_controller_1.SupplierController.getSupplierById,
    });
    app.post('/suppliers', {
        preHandler: [(0, auth_1.requireRole)(managerRoles)],
        schema: {
            description: 'Create a new supplier master record',
            tags: ['Supplier & Procurement Management'],
            security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        },
        handler: supplier_controller_1.SupplierController.createSupplier,
    });
    app.patch('/suppliers/:id', {
        preHandler: [(0, auth_1.requireRole)(managerRoles)],
        schema: {
            description: 'Update an existing supplier record',
            tags: ['Supplier & Procurement Management'],
            security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        },
        handler: supplier_controller_1.SupplierController.updateSupplier,
    });
    app.delete('/suppliers/:id', {
        preHandler: [(0, auth_1.requireRole)(managerRoles)],
        schema: {
            description: 'Soft-delete / deactivate a supplier record',
            tags: ['Supplier & Procurement Management'],
            security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        },
        handler: supplier_controller_1.SupplierController.deleteSupplier,
    });
    // 2. Supplier Product Mappings
    app.get('/supplier-products', {
        preHandler: [(0, auth_1.requireRole)(staffRoles)],
        schema: {
            description: 'List supplier-product catalog mappings with filters',
            tags: ['Supplier & Procurement Management'],
            security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        },
        handler: supplier_controller_1.SupplierController.getSupplierProducts,
    });
    app.get('/suppliers/:id/products', {
        preHandler: [(0, auth_1.requireRole)(staffRoles)],
        schema: {
            description: 'Get all products supplied by a specific supplier',
            tags: ['Supplier & Procurement Management'],
            security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        },
        handler: supplier_controller_1.SupplierController.getSupplierProductsBySupplierId,
    });
    app.post('/supplier-products', {
        preHandler: [(0, auth_1.requireRole)(managerRoles)],
        schema: {
            description: 'Map a product to a supplier with cost, MOQ, and pack size',
            tags: ['Supplier & Procurement Management'],
            security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        },
        handler: supplier_controller_1.SupplierController.createSupplierProduct,
    });
    app.post('/suppliers/:id/products', {
        preHandler: [(0, auth_1.requireRole)(managerRoles)],
        schema: {
            description: 'Map a product to a specific supplier',
            tags: ['Supplier & Procurement Management'],
            security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        },
        handler: supplier_controller_1.SupplierController.createSupplierProduct,
    });
    app.patch('/supplier-products/:id', {
        preHandler: [(0, auth_1.requireRole)(managerRoles)],
        schema: {
            description: 'Update supplier product mapping pricing or configuration',
            tags: ['Supplier & Procurement Management'],
            security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        },
        handler: supplier_controller_1.SupplierController.updateSupplierProduct,
    });
    app.delete('/supplier-products/:id', {
        preHandler: [(0, auth_1.requireRole)(managerRoles)],
        schema: {
            description: 'Remove a supplier-product catalog mapping',
            tags: ['Supplier & Procurement Management'],
            security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        },
        handler: supplier_controller_1.SupplierController.deleteSupplierProduct,
    });
}
//# sourceMappingURL=supplier.routes.js.map