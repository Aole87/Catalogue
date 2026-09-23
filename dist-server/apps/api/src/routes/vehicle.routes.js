"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vehicleRoutes = vehicleRoutes;
const vehicle_controller_1 = require("../controllers/vehicle.controller");
const fitment_controller_1 = require("../controllers/fitment.controller");
const auth_1 = require("../middleware/auth");
async function vehicleRoutes(fastify) {
    // ==========================================
    // PUBLIC STOREFRONT VEHICLE ENDPOINTS
    // ==========================================
    fastify.get('/vehicles/makes', vehicle_controller_1.VehicleController.listMakes);
    fastify.get('/vehicles/makes/:id', vehicle_controller_1.VehicleController.getMake);
    fastify.get('/vehicles/models', vehicle_controller_1.VehicleController.listModels);
    fastify.get('/vehicles/models/:id', vehicle_controller_1.VehicleController.getModel);
    fastify.get('/vehicles/generations', vehicle_controller_1.VehicleController.listGenerations);
    fastify.get('/vehicles/generations/:id', vehicle_controller_1.VehicleController.getGeneration);
    fastify.get('/vehicles/engines', vehicle_controller_1.VehicleController.listEngines);
    fastify.get('/vehicles/engines/:id', vehicle_controller_1.VehicleController.getEngine);
    fastify.get('/vehicles/variants', vehicle_controller_1.VehicleController.listVariants);
    fastify.get('/vehicles/variants/:id', vehicle_controller_1.VehicleController.getVariant);
    fastify.get('/vehicles/variants/:variantId/products', { preHandler: [auth_1.authenticateOptional] }, fitment_controller_1.FitmentController.getCompatibleProductsForVariant);
    // ==========================================
    // PROTECTED ADMIN VEHICLE MASTER DATA ROUTES
    // ==========================================
    // Makes
    fastify.post('/admin/vehicles/makes', {
        preHandler: [auth_1.authenticate, (0, auth_1.requirePermission)('vehicle.create')],
        handler: vehicle_controller_1.VehicleController.createMake,
    });
    fastify.get('/admin/vehicles/makes', {
        preHandler: [auth_1.authenticate, (0, auth_1.requirePermission)('vehicle.read')],
        handler: vehicle_controller_1.VehicleController.listMakes,
    });
    fastify.get('/admin/vehicles/makes/:id', {
        preHandler: [auth_1.authenticate, (0, auth_1.requirePermission)('vehicle.read')],
        handler: vehicle_controller_1.VehicleController.getMake,
    });
    fastify.patch('/admin/vehicles/makes/:id', {
        preHandler: [auth_1.authenticate, (0, auth_1.requirePermission)('vehicle.update')],
        handler: vehicle_controller_1.VehicleController.updateMake,
    });
    fastify.delete('/admin/vehicles/makes/:id', {
        preHandler: [auth_1.authenticate, (0, auth_1.requirePermission)('vehicle.delete')],
        handler: vehicle_controller_1.VehicleController.deleteMake,
    });
    // Models
    fastify.post('/admin/vehicles/models', {
        preHandler: [auth_1.authenticate, (0, auth_1.requirePermission)('vehicle.create')],
        handler: vehicle_controller_1.VehicleController.createModel,
    });
    fastify.get('/admin/vehicles/models', {
        preHandler: [auth_1.authenticate, (0, auth_1.requirePermission)('vehicle.read')],
        handler: vehicle_controller_1.VehicleController.listModels,
    });
    fastify.get('/admin/vehicles/models/:id', {
        preHandler: [auth_1.authenticate, (0, auth_1.requirePermission)('vehicle.read')],
        handler: vehicle_controller_1.VehicleController.getModel,
    });
    fastify.patch('/admin/vehicles/models/:id', {
        preHandler: [auth_1.authenticate, (0, auth_1.requirePermission)('vehicle.update')],
        handler: vehicle_controller_1.VehicleController.updateModel,
    });
    fastify.delete('/admin/vehicles/models/:id', {
        preHandler: [auth_1.authenticate, (0, auth_1.requirePermission)('vehicle.delete')],
        handler: vehicle_controller_1.VehicleController.deleteModel,
    });
    // Generations
    fastify.post('/admin/vehicles/generations', {
        preHandler: [auth_1.authenticate, (0, auth_1.requirePermission)('vehicle.create')],
        handler: vehicle_controller_1.VehicleController.createGeneration,
    });
    fastify.get('/admin/vehicles/generations', {
        preHandler: [auth_1.authenticate, (0, auth_1.requirePermission)('vehicle.read')],
        handler: vehicle_controller_1.VehicleController.listGenerations,
    });
    fastify.get('/admin/vehicles/generations/:id', {
        preHandler: [auth_1.authenticate, (0, auth_1.requirePermission)('vehicle.read')],
        handler: vehicle_controller_1.VehicleController.getGeneration,
    });
    fastify.patch('/admin/vehicles/generations/:id', {
        preHandler: [auth_1.authenticate, (0, auth_1.requirePermission)('vehicle.update')],
        handler: vehicle_controller_1.VehicleController.updateGeneration,
    });
    fastify.delete('/admin/vehicles/generations/:id', {
        preHandler: [auth_1.authenticate, (0, auth_1.requirePermission)('vehicle.delete')],
        handler: vehicle_controller_1.VehicleController.deleteGeneration,
    });
    // Engines
    fastify.post('/admin/vehicles/engines', {
        preHandler: [auth_1.authenticate, (0, auth_1.requirePermission)('vehicle.create')],
        handler: vehicle_controller_1.VehicleController.createEngine,
    });
    fastify.get('/admin/vehicles/engines', {
        preHandler: [auth_1.authenticate, (0, auth_1.requirePermission)('vehicle.read')],
        handler: vehicle_controller_1.VehicleController.listEngines,
    });
    fastify.get('/admin/vehicles/engines/:id', {
        preHandler: [auth_1.authenticate, (0, auth_1.requirePermission)('vehicle.read')],
        handler: vehicle_controller_1.VehicleController.getEngine,
    });
    fastify.patch('/admin/vehicles/engines/:id', {
        preHandler: [auth_1.authenticate, (0, auth_1.requirePermission)('vehicle.update')],
        handler: vehicle_controller_1.VehicleController.updateEngine,
    });
    fastify.delete('/admin/vehicles/engines/:id', {
        preHandler: [auth_1.authenticate, (0, auth_1.requirePermission)('vehicle.delete')],
        handler: vehicle_controller_1.VehicleController.deleteEngine,
    });
    // Variants
    fastify.post('/admin/vehicles/variants', {
        preHandler: [auth_1.authenticate, (0, auth_1.requirePermission)('vehicle.create')],
        handler: vehicle_controller_1.VehicleController.createVariant,
    });
    fastify.get('/admin/vehicles/variants', {
        preHandler: [auth_1.authenticate, (0, auth_1.requirePermission)('vehicle.read')],
        handler: vehicle_controller_1.VehicleController.listVariants,
    });
    fastify.get('/admin/vehicles/variants/:id', {
        preHandler: [auth_1.authenticate, (0, auth_1.requirePermission)('vehicle.read')],
        handler: vehicle_controller_1.VehicleController.getVariant,
    });
    fastify.patch('/admin/vehicles/variants/:id', {
        preHandler: [auth_1.authenticate, (0, auth_1.requirePermission)('vehicle.update')],
        handler: vehicle_controller_1.VehicleController.updateVariant,
    });
    fastify.delete('/admin/vehicles/variants/:id', {
        preHandler: [auth_1.authenticate, (0, auth_1.requirePermission)('vehicle.delete')],
        handler: vehicle_controller_1.VehicleController.deleteVariant,
    });
}
//# sourceMappingURL=vehicle.routes.js.map