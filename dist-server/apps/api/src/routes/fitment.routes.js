"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fitmentRoutes = fitmentRoutes;
const fitment_controller_1 = require("../controllers/fitment.controller");
const auth_1 = require("../middleware/auth");
async function fitmentRoutes(fastify) {
    // ==========================================
    // PUBLIC STOREFRONT FITMENT ENDPOINTS
    // ==========================================
    // Authoritative Compatibility Check Endpoint
    fastify.get('/products/:productId/fitment/:vehicleVariantId', fitment_controller_1.FitmentController.checkProductFitment);
    // List all vehicle variants compatible with a product
    fastify.get('/products/:productId/fitments', fitment_controller_1.FitmentController.getProductFitments);
    // ==========================================
    // PROTECTED ADMIN FITMENT CRUD ROUTES
    // ==========================================
    fastify.post('/admin/products/:productId/fitments', {
        preHandler: [auth_1.authenticate, (0, auth_1.requirePermission)('fitment.create')],
        handler: fitment_controller_1.FitmentController.createProductFitment,
    });
    fastify.post('/admin/fitments', {
        preHandler: [auth_1.authenticate, (0, auth_1.requirePermission)('fitment.create')],
        handler: fitment_controller_1.FitmentController.createProductFitment,
    });
    fastify.get('/admin/products/:productId/fitments', {
        preHandler: [auth_1.authenticate, (0, auth_1.requirePermission)('fitment.read')],
        handler: fitment_controller_1.FitmentController.listProductFitmentsAdmin,
    });
    fastify.patch('/admin/fitments/:fitmentId', {
        preHandler: [auth_1.authenticate, (0, auth_1.requirePermission)('fitment.update')],
        handler: fitment_controller_1.FitmentController.updateFitment,
    });
    fastify.delete('/admin/products/:productId/fitments/:fitmentId', {
        preHandler: [auth_1.authenticate, (0, auth_1.requirePermission)('fitment.delete')],
        handler: fitment_controller_1.FitmentController.deleteProductFitment,
    });
    fastify.delete('/admin/fitments/:fitmentId', {
        preHandler: [auth_1.authenticate, (0, auth_1.requirePermission)('fitment.delete')],
        handler: fitment_controller_1.FitmentController.deleteProductFitment,
    });
}
//# sourceMappingURL=fitment.routes.js.map