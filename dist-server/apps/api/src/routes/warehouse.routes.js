"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.warehouseRoutes = warehouseRoutes;
const warehouse_controller_1 = require("../controllers/warehouse.controller");
const auth_1 = require("../middleware/auth");
async function warehouseRoutes(app) {
    // 1. Warehouse List & Details
    app.get('/warehouses', {
        preHandler: [auth_1.authenticateOptional],
        schema: {
            description: 'List all active warehouses with location counts',
            tags: ['Inventory & Warehouse Operations'],
        },
        handler: warehouse_controller_1.WarehouseController.getWarehouses,
    });
    app.get('/warehouses/:id', {
        preHandler: [auth_1.authenticateOptional],
        schema: {
            description: 'Get warehouse details and physical locations',
            tags: ['Inventory & Warehouse Operations'],
        },
        handler: warehouse_controller_1.WarehouseController.getWarehouseById,
    });
    // 2. Warehouse Management (Staff)
    app.post('/warehouses', {
        preHandler: [(0, auth_1.requireRole)(['SUPER_ADMIN', 'STORE_MANAGER'])],
        schema: {
            description: 'Create a new warehouse hub',
            tags: ['Inventory & Warehouse Operations'],
            security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        },
        handler: warehouse_controller_1.WarehouseController.createWarehouse,
    });
    app.patch('/warehouses/:id', {
        preHandler: [(0, auth_1.requireRole)(['SUPER_ADMIN', 'STORE_MANAGER'])],
        schema: {
            description: 'Update warehouse information',
            tags: ['Inventory & Warehouse Operations'],
            security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        },
        handler: warehouse_controller_1.WarehouseController.updateWarehouse,
    });
    app.delete('/warehouses/:id', {
        preHandler: [(0, auth_1.requireRole)(['SUPER_ADMIN', 'STORE_MANAGER'])],
        schema: {
            description: 'Soft-delete a warehouse (only allowed when stock is empty)',
            tags: ['Inventory & Warehouse Operations'],
            security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        },
        handler: warehouse_controller_1.WarehouseController.deleteWarehouse,
    });
    // 3. Location / Bin Management
    app.get('/warehouses/:id/locations', {
        preHandler: [auth_1.authenticateOptional],
        schema: {
            description: 'List physical locations and bins within a warehouse',
            tags: ['Inventory & Warehouse Operations'],
        },
        handler: warehouse_controller_1.WarehouseController.getLocations,
    });
    app.get('/locations/:id', {
        preHandler: [auth_1.authenticateOptional],
        schema: {
            description: 'Get location details',
            tags: ['Inventory & Warehouse Operations'],
        },
        handler: warehouse_controller_1.WarehouseController.getLocationById,
    });
    app.post('/warehouses/:id/locations', {
        preHandler: [(0, auth_1.requireRole)(['SUPER_ADMIN', 'STORE_MANAGER', 'INVENTORY_CLERK'])],
        schema: {
            description: 'Create a new physical location/bin in a warehouse',
            tags: ['Inventory & Warehouse Operations'],
            security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        },
        handler: warehouse_controller_1.WarehouseController.createLocation,
    });
    app.patch('/locations/:id', {
        preHandler: [(0, auth_1.requireRole)(['SUPER_ADMIN', 'STORE_MANAGER', 'INVENTORY_CLERK'])],
        schema: {
            description: 'Update physical location/bin',
            tags: ['Inventory & Warehouse Operations'],
            security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        },
        handler: warehouse_controller_1.WarehouseController.updateLocation,
    });
    app.delete('/locations/:id', {
        preHandler: [(0, auth_1.requireRole)(['SUPER_ADMIN', 'STORE_MANAGER', 'INVENTORY_CLERK'])],
        schema: {
            description: 'Soft-delete a physical location/bin',
            tags: ['Inventory & Warehouse Operations'],
            security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        },
        handler: warehouse_controller_1.WarehouseController.deleteLocation,
    });
}
//# sourceMappingURL=warehouse.routes.js.map