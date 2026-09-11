import { FastifyInstance } from 'fastify';
import { PurchaseOrderController } from '../controllers/purchase-order.controller';
import { requireRole } from '../middleware/auth';

export async function purchaseOrderRoutes(app: FastifyInstance) {
  const staffRoles = ['SUPER_ADMIN', 'STORE_MANAGER', 'INVENTORY_CLERK', 'ACCOUNTANT', 'SALES_REP'];
  const managerRoles = ['SUPER_ADMIN', 'STORE_MANAGER'];

  const registerRoutes = (prefix: string) => {
    app.get(`${prefix}`, {
      preHandler: [requireRole(staffRoles)],
      schema: {
        description: 'List purchase orders with status filtering, date range, and pagination',
        tags: ['Supplier & Procurement Management'],
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
      },
      handler: PurchaseOrderController.getPurchaseOrders,
    });

    app.get(`${prefix}/:id`, {
      preHandler: [requireRole(staffRoles)],
      schema: {
        description: 'Get purchase order details and line items by UUID',
        tags: ['Supplier & Procurement Management'],
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
      },
      handler: PurchaseOrderController.getPurchaseOrderById,
    });

    app.post(`${prefix}`, {
      preHandler: [requireRole(managerRoles)],
      schema: {
        description: 'Create a new draft purchase order with server-calculated totals',
        tags: ['Supplier & Procurement Management'],
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
      },
      handler: PurchaseOrderController.createDraftPO,
    });

    app.patch(`${prefix}/:id`, {
      preHandler: [requireRole(managerRoles)],
      schema: {
        description: 'Update draft purchase order metadata',
        tags: ['Supplier & Procurement Management'],
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
      },
      handler: PurchaseOrderController.updateDraftPO,
    });

    app.post(`${prefix}/:id/submit`, {
      preHandler: [requireRole(managerRoles)],
      schema: {
        description: 'Submit a draft purchase order for approval',
        tags: ['Supplier & Procurement Management'],
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
      },
      handler: PurchaseOrderController.submitForApproval,
    });

    app.post(`${prefix}/:id/approve`, {
      preHandler: [requireRole(managerRoles)],
      schema: {
        description: 'Approve a purchase order (enforces separation of duties: creator cannot approve)',
        tags: ['Supplier & Procurement Management'],
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
      },
      handler: PurchaseOrderController.approvePO,
    });

    app.post(`${prefix}/:id/reject`, {
      preHandler: [requireRole(managerRoles)],
      schema: {
        description: 'Reject a purchase order with mandatory reason',
        tags: ['Supplier & Procurement Management'],
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
      },
      handler: PurchaseOrderController.rejectPO,
    });

    app.post(`${prefix}/:id/send`, {
      preHandler: [requireRole(managerRoles)],
      schema: {
        description: 'Mark approved purchase order as sent to supplier',
        tags: ['Supplier & Procurement Management'],
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
      },
      handler: PurchaseOrderController.sendPO,
    });

    app.post(`${prefix}/:id/cancel`, {
      preHandler: [requireRole(managerRoles)],
      schema: {
        description: 'Cancel a purchase order with mandatory reason',
        tags: ['Supplier & Procurement Management'],
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
      },
      handler: PurchaseOrderController.cancelPO,
    });
  };

  registerRoutes('/purchase-orders');
  registerRoutes('/procurement/orders');
}
