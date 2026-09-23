"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminLoyaltyRoutes = adminLoyaltyRoutes;
const admin_loyalty_controller_1 = require("../controllers/admin-loyalty.controller");
const auth_1 = require("../middleware/auth");
async function adminLoyaltyRoutes(app) {
    const loyaltyReadRoles = ['SUPER_ADMIN', 'STORE_MANAGER', 'SALES_REP', 'ACCOUNTANT'];
    const loyaltyAdjustRoles = ['SUPER_ADMIN', 'STORE_MANAGER', 'ACCOUNTANT'];
    app.get('/admin/loyalty/accounts', { preHandler: [(0, auth_1.requireRole)(loyaltyReadRoles)] }, admin_loyalty_controller_1.AdminLoyaltyController.listAccounts);
    app.get('/admin/loyalty/accounts/:customerId', { preHandler: [(0, auth_1.requireRole)(loyaltyReadRoles)] }, admin_loyalty_controller_1.AdminLoyaltyController.getAccountByCustomerId);
    app.post('/admin/loyalty/accounts/:customerId/adjust', { preHandler: [(0, auth_1.requireRole)(loyaltyAdjustRoles)] }, admin_loyalty_controller_1.AdminLoyaltyController.adjustPoints);
}
//# sourceMappingURL=admin-loyalty.routes.js.map