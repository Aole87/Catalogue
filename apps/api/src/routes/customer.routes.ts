import { FastifyInstance } from 'fastify';
import { CustomerController } from '../controllers/customer.controller';
import { authenticate, authenticateOptional } from '../middleware/auth';

export async function customerRoutes(app: FastifyInstance) {
  // Customer Profile & Activity
  app.get('/customers/me', { preHandler: [authenticate] }, CustomerController.getMe);
  app.patch('/customers/me', { preHandler: [authenticate] }, CustomerController.updateMe);
  app.get('/customers/me/activity', { preHandler: [authenticate] }, CustomerController.getMyActivity);
  app.get('/customers/me/loyalty', { preHandler: [authenticate] }, CustomerController.getMyLoyalty);

  // Coupon & Loyalty Validation
  app.post('/coupons/validate', { preHandler: [authenticateOptional] }, CustomerController.validateCoupon);
  app.post('/loyalty/redeem', { preHandler: [authenticate] }, CustomerController.redeemPointsPreview);
}
