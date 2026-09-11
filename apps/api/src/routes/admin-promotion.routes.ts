import { FastifyInstance } from 'fastify';
import { AdminPromotionController } from '../controllers/admin-promotion.controller';
import { requireRole } from '../middleware/auth';

export async function adminPromotionRoutes(app: FastifyInstance) {
  const promoRoles = ['SUPER_ADMIN', 'STORE_MANAGER'];

  // Promotions CRUD
  app.get('/admin/promotions', { preHandler: [requireRole(promoRoles)] }, AdminPromotionController.listPromotions);
  app.post('/admin/promotions', { preHandler: [requireRole(promoRoles)] }, AdminPromotionController.createPromotion);
  app.get('/admin/promotions/:id', { preHandler: [requireRole(promoRoles)] }, AdminPromotionController.getPromotionById);
  app.patch('/admin/promotions/:id', { preHandler: [requireRole(promoRoles)] }, AdminPromotionController.updatePromotion);
  app.delete('/admin/promotions/:id', { preHandler: [requireRole(promoRoles)] }, AdminPromotionController.deletePromotion);

  // Coupons CRUD
  app.get('/admin/coupons', { preHandler: [requireRole(promoRoles)] }, AdminPromotionController.listCoupons);
  app.post('/admin/coupons', { preHandler: [requireRole(promoRoles)] }, AdminPromotionController.createCoupon);
  app.get('/admin/coupons/:id', { preHandler: [requireRole(promoRoles)] }, AdminPromotionController.getCouponById);
  app.patch('/admin/coupons/:id', { preHandler: [requireRole(promoRoles)] }, AdminPromotionController.updateCoupon);
  app.delete('/admin/coupons/:id', { preHandler: [requireRole(promoRoles)] }, AdminPromotionController.deleteCoupon);

  // Redemptions Report
  app.get('/admin/promotions/:id/redemptions', { preHandler: [requireRole(promoRoles)] }, AdminPromotionController.listRedemptions);
}
