"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerRoutes = customerRoutes;
const customer_controller_1 = require("../controllers/customer.controller");
const auth_1 = require("../middleware/auth");
async function customerRoutes(app) {
    // Customer Profile & Activity
    app.get('/customers/me', { preHandler: [auth_1.authenticate] }, customer_controller_1.CustomerController.getMe);
    app.patch('/customers/me', { preHandler: [auth_1.authenticate] }, customer_controller_1.CustomerController.updateMe);
    app.get('/customers/me/activity', { preHandler: [auth_1.authenticate] }, customer_controller_1.CustomerController.getMyActivity);
    app.get('/customers/me/loyalty', { preHandler: [auth_1.authenticate] }, customer_controller_1.CustomerController.getMyLoyalty);
    // Coupon & Loyalty Validation
    app.post('/coupons/validate', { preHandler: [auth_1.authenticateOptional] }, customer_controller_1.CustomerController.validateCoupon);
    app.post('/loyalty/redeem', { preHandler: [auth_1.authenticate] }, customer_controller_1.CustomerController.redeemPointsPreview);
}
//# sourceMappingURL=customer.routes.js.map