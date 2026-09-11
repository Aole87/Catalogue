import { FastifyInstance } from 'fastify';
import { InventoryController } from '../controllers/inventory.controller';
import { authenticate, authenticateOptional, requireRole } from '../middleware/auth';

export async function inventoryRoutes(app: FastifyInstance) {
  // 1. Dashboard Metrics & Stock Query
  app.get('/inventory/dashboard', {
    preHandler: [requireRole(['SUPER_ADMIN', 'STORE_MANAGER', 'INVENTORY_CLERK', 'ACCOUNTANT', 'SALES_REP'])],
    schema: {
      description: 'Get inventory KPI summary metrics (total on-hand, reserved, available, low-stock count)',
      tags: ['Inventory & Warehouse Operations'],
      security: [{ cookieAuth: [] }, { bearerAuth: [] }],
    },
    handler: InventoryController.getDashboardMetrics,
  });

  app.get('/inventory', {
    preHandler: [requireRole(['SUPER_ADMIN', 'STORE_MANAGER', 'INVENTORY_CLERK', 'ACCOUNTANT', 'SALES_REP'])],
    schema: {
      description: 'List inventory items with search, warehouse filters, low-stock filter, and server pagination',
      tags: ['Inventory & Warehouse Operations'],
      security: [{ cookieAuth: [] }, { bearerAuth: [] }],
    },
    handler: InventoryController.getInventory,
  });

  app.get('/inventory/:id', {
    preHandler: [requireRole(['SUPER_ADMIN', 'STORE_MANAGER', 'INVENTORY_CLERK', 'ACCOUNTANT', 'SALES_REP'])],
    schema: {
      description: 'Get inventory item details by UUID',
      tags: ['Inventory & Warehouse Operations'],
      security: [{ cookieAuth: [] }, { bearerAuth: [] }],
    },
    handler: InventoryController.getInventoryById,
  });

  app.get('/inventory/product/:productId', {
    preHandler: [authenticateOptional],
    schema: {
      description: 'Get server-calculated stock availability for a product across warehouses',
      tags: ['Inventory & Warehouse Operations'],
    },
    handler: InventoryController.getProductAvailability,
  });

  // 2. Stock Reservations (Staff or System Operations)
  app.post('/inventory/reservations', {
    preHandler: [requireRole(['SUPER_ADMIN', 'STORE_MANAGER', 'INVENTORY_CLERK', 'SALES_REP', 'CUSTOMER'])],
    schema: {
      description: 'Reserve stock with row-level locking (Anti-overselling concurrency protection)',
      tags: ['Inventory & Warehouse Operations'],
      security: [{ cookieAuth: [] }, { bearerAuth: [] }],
    },
    handler: InventoryController.reserveStock,
  });

  app.post('/inventory/reservations/:id/release', {
    preHandler: [requireRole(['SUPER_ADMIN', 'STORE_MANAGER', 'INVENTORY_CLERK', 'SALES_REP', 'CUSTOMER'])],
    schema: {
      description: 'Release active stock reservation back to available pool',
      tags: ['Inventory & Warehouse Operations'],
      security: [{ cookieAuth: [] }, { bearerAuth: [] }],
    },
    handler: InventoryController.releaseReservation,
  });

  app.post('/inventory/reservations/:id/commit', {
    preHandler: [requireRole(['SUPER_ADMIN', 'STORE_MANAGER', 'INVENTORY_CLERK'])],
    schema: {
      description: 'Commit reservation and deduct physical on-hand stock for fulfillment',
      tags: ['Inventory & Warehouse Operations'],
      security: [{ cookieAuth: [] }, { bearerAuth: [] }],
    },
    handler: InventoryController.commitReservation,
  });

  // 3. Stock Adjustments & Warehouse Transfers (Authorized Staff)
  app.post('/inventory/adjustments', {
    preHandler: [requireRole(['SUPER_ADMIN', 'STORE_MANAGER', 'INVENTORY_CLERK'])],
    schema: {
      description: 'Execute controlled stock adjustment with mandatory audit reason',
      tags: ['Inventory & Warehouse Operations'],
      security: [{ cookieAuth: [] }, { bearerAuth: [] }],
    },
    handler: InventoryController.adjustStock,
  });

  app.post('/inventory/transfers', {
    preHandler: [requireRole(['SUPER_ADMIN', 'STORE_MANAGER', 'INVENTORY_CLERK'])],
    schema: {
      description: 'Transfer stock between warehouses or locations atomically',
      tags: ['Inventory & Warehouse Operations'],
      security: [{ cookieAuth: [] }, { bearerAuth: [] }],
    },
    handler: InventoryController.transferStock,
  });

  app.post('/inventory/return-disposition', {
    preHandler: [requireRole(['SUPER_ADMIN', 'STORE_MANAGER', 'INVENTORY_CLERK'])],
    schema: {
      description: 'Process return inspection and physical disposition (Restock vs Damaged/Quarantine)',
      tags: ['Inventory & Warehouse Operations'],
      security: [{ cookieAuth: [] }, { bearerAuth: [] }],
    },
    handler: InventoryController.handleReturnDisposition,
  });

  // 4. Movement Ledger
  app.get('/inventory/movements', {
    preHandler: [requireRole(['SUPER_ADMIN', 'STORE_MANAGER', 'INVENTORY_CLERK', 'ACCOUNTANT', 'SALES_REP'])],
    schema: {
      description: 'Query append-only historical stock movement ledger',
      tags: ['Inventory & Warehouse Operations'],
      security: [{ cookieAuth: [] }, { bearerAuth: [] }],
    },
    handler: InventoryController.getMovements,
  });
}
