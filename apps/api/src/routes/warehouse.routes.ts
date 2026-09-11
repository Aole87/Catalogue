import { FastifyInstance } from 'fastify';
import { WarehouseController } from '../controllers/warehouse.controller';
import { authenticate, authenticateOptional, requireRole } from '../middleware/auth';

export async function warehouseRoutes(app: FastifyInstance) {
  // 1. Warehouse List & Details
  app.get('/warehouses', {
    preHandler: [authenticateOptional],
    schema: {
      description: 'List all active warehouses with location counts',
      tags: ['Inventory & Warehouse Operations'],
    },
    handler: WarehouseController.getWarehouses,
  });

  app.get('/warehouses/:id', {
    preHandler: [authenticateOptional],
    schema: {
      description: 'Get warehouse details and physical locations',
      tags: ['Inventory & Warehouse Operations'],
    },
    handler: WarehouseController.getWarehouseById,
  });

  // 2. Warehouse Management (Staff)
  app.post('/warehouses', {
    preHandler: [requireRole(['SUPER_ADMIN', 'STORE_MANAGER'])],
    schema: {
      description: 'Create a new warehouse hub',
      tags: ['Inventory & Warehouse Operations'],
      security: [{ cookieAuth: [] }, { bearerAuth: [] }],
    },
    handler: WarehouseController.createWarehouse,
  });

  app.patch('/warehouses/:id', {
    preHandler: [requireRole(['SUPER_ADMIN', 'STORE_MANAGER'])],
    schema: {
      description: 'Update warehouse information',
      tags: ['Inventory & Warehouse Operations'],
      security: [{ cookieAuth: [] }, { bearerAuth: [] }],
    },
    handler: WarehouseController.updateWarehouse,
  });

  app.delete('/warehouses/:id', {
    preHandler: [requireRole(['SUPER_ADMIN', 'STORE_MANAGER'])],
    schema: {
      description: 'Soft-delete a warehouse (only allowed when stock is empty)',
      tags: ['Inventory & Warehouse Operations'],
      security: [{ cookieAuth: [] }, { bearerAuth: [] }],
    },
    handler: WarehouseController.deleteWarehouse,
  });

  // 3. Location / Bin Management
  app.get('/warehouses/:id/locations', {
    preHandler: [authenticateOptional],
    schema: {
      description: 'List physical locations and bins within a warehouse',
      tags: ['Inventory & Warehouse Operations'],
    },
    handler: WarehouseController.getLocations,
  });

  app.get('/locations/:id', {
    preHandler: [authenticateOptional],
    schema: {
      description: 'Get location details',
      tags: ['Inventory & Warehouse Operations'],
    },
    handler: WarehouseController.getLocationById,
  });

  app.post('/warehouses/:id/locations', {
    preHandler: [requireRole(['SUPER_ADMIN', 'STORE_MANAGER', 'INVENTORY_CLERK'])],
    schema: {
      description: 'Create a new physical location/bin in a warehouse',
      tags: ['Inventory & Warehouse Operations'],
      security: [{ cookieAuth: [] }, { bearerAuth: [] }],
    },
    handler: WarehouseController.createLocation,
  });

  app.patch('/locations/:id', {
    preHandler: [requireRole(['SUPER_ADMIN', 'STORE_MANAGER', 'INVENTORY_CLERK'])],
    schema: {
      description: 'Update physical location/bin',
      tags: ['Inventory & Warehouse Operations'],
      security: [{ cookieAuth: [] }, { bearerAuth: [] }],
    },
    handler: WarehouseController.updateLocation,
  });

  app.delete('/locations/:id', {
    preHandler: [requireRole(['SUPER_ADMIN', 'STORE_MANAGER', 'INVENTORY_CLERK'])],
    schema: {
      description: 'Soft-delete a physical location/bin',
      tags: ['Inventory & Warehouse Operations'],
      security: [{ cookieAuth: [] }, { bearerAuth: [] }],
    },
    handler: WarehouseController.deleteLocation,
  });
}
