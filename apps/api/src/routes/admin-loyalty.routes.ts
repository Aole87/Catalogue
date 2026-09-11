import { FastifyInstance } from 'fastify';
import { AdminLoyaltyController } from '../controllers/admin-loyalty.controller';
import { requireRole } from '../middleware/auth';

export async function adminLoyaltyRoutes(app: FastifyInstance) {
  const loyaltyReadRoles = ['SUPER_ADMIN', 'STORE_MANAGER', 'SALES_REP', 'ACCOUNTANT'];
  const loyaltyAdjustRoles = ['SUPER_ADMIN', 'STORE_MANAGER', 'ACCOUNTANT'];

  app.get('/admin/loyalty/accounts', { preHandler: [requireRole(loyaltyReadRoles)] }, AdminLoyaltyController.listAccounts);
  app.get('/admin/loyalty/accounts/:customerId', { preHandler: [requireRole(loyaltyReadRoles)] }, AdminLoyaltyController.getAccountByCustomerId);
  app.post('/admin/loyalty/accounts/:customerId/adjust', { preHandler: [requireRole(loyaltyAdjustRoles)] }, AdminLoyaltyController.adjustPoints);
}
