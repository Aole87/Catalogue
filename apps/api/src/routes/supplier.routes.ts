import { FastifyInstance } from 'fastify';
import { SupplierController } from '../controllers/supplier.controller';
import { requireRole } from '../middleware/auth';

export async function supplierRoutes(app: FastifyInstance) {
  const staffRoles = ['SUPER_ADMIN', 'STORE_MANAGER', 'INVENTORY_CLERK', 'ACCOUNTANT', 'SALES_REP'];
  const managerRoles = ['SUPER_ADMIN', 'STORE_MANAGER'];

  // 1. Supplier Master Data
  app.get('/suppliers', {
    preHandler: [requireRole(staffRoles)],
    schema: {
      description: 'List suppliers with filtering, search, and pagination',
      tags: ['Supplier & Procurement Management'],
      security: [{ cookieAuth: [] }, { bearerAuth: [] }],
    },
    handler: SupplierController.getSuppliers,
  });

  app.get('/suppliers/products/lookup', {
    preHandler: [requireRole(staffRoles)],
    schema: {
      description: 'Lookup supplier product mapping by supplierId and productId',
      tags: ['Supplier & Procurement Management'],
      security: [{ cookieAuth: [] }, { bearerAuth: [] }],
    },
    handler: SupplierController.lookupSupplierProduct,
  });

  app.get('/suppliers/:id', {
    preHandler: [requireRole(staffRoles)],
    schema: {
      description: 'Get supplier details by UUID',
      tags: ['Supplier & Procurement Management'],
      security: [{ cookieAuth: [] }, { bearerAuth: [] }],
    },
    handler: SupplierController.getSupplierById,
  });

  app.post('/suppliers', {
    preHandler: [requireRole(managerRoles)],
    schema: {
      description: 'Create a new supplier master record',
      tags: ['Supplier & Procurement Management'],
      security: [{ cookieAuth: [] }, { bearerAuth: [] }],
    },
    handler: SupplierController.createSupplier,
  });

  app.patch('/suppliers/:id', {
    preHandler: [requireRole(managerRoles)],
    schema: {
      description: 'Update an existing supplier record',
      tags: ['Supplier & Procurement Management'],
      security: [{ cookieAuth: [] }, { bearerAuth: [] }],
    },
    handler: SupplierController.updateSupplier,
  });

  app.delete('/suppliers/:id', {
    preHandler: [requireRole(managerRoles)],
    schema: {
      description: 'Soft-delete / deactivate a supplier record',
      tags: ['Supplier & Procurement Management'],
      security: [{ cookieAuth: [] }, { bearerAuth: [] }],
    },
    handler: SupplierController.deleteSupplier,
  });

  // 2. Supplier Product Mappings
  app.get('/supplier-products', {
    preHandler: [requireRole(staffRoles)],
    schema: {
      description: 'List supplier-product catalog mappings with filters',
      tags: ['Supplier & Procurement Management'],
      security: [{ cookieAuth: [] }, { bearerAuth: [] }],
    },
    handler: SupplierController.getSupplierProducts,
  });

  app.get('/suppliers/:id/products', {
    preHandler: [requireRole(staffRoles)],
    schema: {
      description: 'Get all products supplied by a specific supplier',
      tags: ['Supplier & Procurement Management'],
      security: [{ cookieAuth: [] }, { bearerAuth: [] }],
    },
    handler: SupplierController.getSupplierProductsBySupplierId,
  });

  app.post('/supplier-products', {
    preHandler: [requireRole(managerRoles)],
    schema: {
      description: 'Map a product to a supplier with cost, MOQ, and pack size',
      tags: ['Supplier & Procurement Management'],
      security: [{ cookieAuth: [] }, { bearerAuth: [] }],
    },
    handler: SupplierController.createSupplierProduct,
  });

  app.post('/suppliers/:id/products', {
    preHandler: [requireRole(managerRoles)],
    schema: {
      description: 'Map a product to a specific supplier',
      tags: ['Supplier & Procurement Management'],
      security: [{ cookieAuth: [] }, { bearerAuth: [] }],
    },
    handler: SupplierController.createSupplierProduct,
  });

  app.patch('/supplier-products/:id', {
    preHandler: [requireRole(managerRoles)],
    schema: {
      description: 'Update supplier product mapping pricing or configuration',
      tags: ['Supplier & Procurement Management'],
      security: [{ cookieAuth: [] }, { bearerAuth: [] }],
    },
    handler: SupplierController.updateSupplierProduct,
  });

  app.delete('/supplier-products/:id', {
    preHandler: [requireRole(managerRoles)],
    schema: {
      description: 'Remove a supplier-product catalog mapping',
      tags: ['Supplier & Procurement Management'],
      security: [{ cookieAuth: [] }, { bearerAuth: [] }],
    },
    handler: SupplierController.deleteSupplierProduct,
  });
}
