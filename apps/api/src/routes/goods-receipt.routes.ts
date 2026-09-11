import { FastifyInstance } from 'fastify';
import { GoodsReceiptController } from '../controllers/goods-receipt.controller';
import { requireRole } from '../middleware/auth';

export async function goodsReceiptRoutes(app: FastifyInstance) {
  const staffRoles = ['SUPER_ADMIN', 'STORE_MANAGER', 'INVENTORY_CLERK', 'ACCOUNTANT', 'SALES_REP'];
  const receivingRoles = ['SUPER_ADMIN', 'STORE_MANAGER', 'INVENTORY_CLERK'];

  const registerRoutes = (prefix: string) => {
    app.get(`${prefix}`, {
      preHandler: [requireRole(staffRoles)],
      schema: {
        description: 'List goods receipt notes (GRNs) with filters and pagination',
        tags: ['Supplier & Procurement Management'],
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
      },
      handler: GoodsReceiptController.getReceipts,
    });

    app.get(`${prefix}/:id`, {
      preHandler: [requireRole(staffRoles)],
      schema: {
        description: 'Get goods receipt note details and line items by UUID',
        tags: ['Supplier & Procurement Management'],
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
      },
      handler: GoodsReceiptController.getReceiptById,
    });

    app.post(`${prefix}`, {
      preHandler: [requireRole(receivingRoles)],
      schema: {
        description: 'Receive goods against purchase order (atomic stock increment in M10 inventory and GRN creation)',
        tags: ['Supplier & Procurement Management'],
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
      },
      handler: GoodsReceiptController.receiveGoods,
    });
  };

  registerRoutes('/goods-receipts');
  registerRoutes('/procurement/receipts');

  app.post('/purchase-orders/:id/receive', {
    preHandler: [requireRole(receivingRoles)],
    schema: {
      description: 'Receive goods against purchase order by PO ID',
      tags: ['Supplier & Procurement Management'],
      security: [{ cookieAuth: [] }, { bearerAuth: [] }],
    },
    handler: GoodsReceiptController.receiveGoods,
  });

  app.post('/procurement/orders/:id/receive', {
    preHandler: [requireRole(receivingRoles)],
    schema: {
      description: 'Receive goods against procurement order by PO ID',
      tags: ['Supplier & Procurement Management'],
      security: [{ cookieAuth: [] }, { bearerAuth: [] }],
    },
    handler: GoodsReceiptController.receiveGoods,
  });
}
