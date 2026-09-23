"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminPromotionRoutes = adminPromotionRoutes;
const admin_promotion_controller_1 = require("../controllers/admin-promotion.controller");
const auth_1 = require("../middleware/auth");
async function adminPromotionRoutes(app) {
    const promoRoles = ['SUPER_ADMIN', 'STORE_MANAGER'];
    // Promotions CRUD
    app.get('/admin/promotions', { preHandler: [(0, auth_1.requireRole)(promoRoles)] }, admin_promotion_controller_1.AdminPromotionController.listPromotions);
    app.post('/admin/promotions', { preHandler: [(0, auth_1.requireRole)(promoRoles)] }, admin_promotion_controller_1.AdminPromotionController.createPromotion);
    app.get('/admin/promotions/:id', { preHandler: [(0, auth_1.requireRole)(promoRoles)] }, admin_promotion_controller_1.AdminPromotionController.getPromotionById);
    app.patch('/admin/promotions/:id', { preHandler: [(0, auth_1.requireRole)(promoRoles)] }, admin_promotion_controller_1.AdminPromotionController.updatePromotion);
    app.delete('/admin/promotions/:id', { preHandler: [(0, auth_1.requireRole)(promoRoles)] }, admin_promotion_controller_1.AdminPromotionController.deletePromotion);
    // Coupons CRUD
    app.get('/admin/coupons', { preHandler: [(0, auth_1.requireRole)(promoRoles)] }, admin_promotion_controller_1.AdminPromotionController.listCoupons);
    app.post('/admin/coupons', { preHandler: [(0, auth_1.requireRole)(promoRoles)] }, admin_promotion_controller_1.AdminPromotionController.createCoupon);
    app.get('/admin/coupons/:id', { preHandler: [(0, auth_1.requireRole)(promoRoles)] }, admin_promotion_controller_1.AdminPromotionController.getCouponById);
    app.patch('/admin/coupons/:id', { preHandler: [(0, auth_1.requireRole)(promoRoles)] }, admin_promotion_controller_1.AdminPromotionController.updateCoupon);
    app.delete('/admin/coupons/:id', { preHandler: [(0, auth_1.requireRole)(promoRoles)] }, admin_promotion_controller_1.AdminPromotionController.deleteCoupon);
    // Redemptions Report
    app.get('/admin/promotions/:id/redemptions', { preHandler: [(0, auth_1.requireRole)(promoRoles)] }, admin_promotion_controller_1.AdminPromotionController.listRedemptions);
}
//# sourceMappingURL=admin-promotion.routes.js.map