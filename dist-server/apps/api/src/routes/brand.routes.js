"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.brandRoutes = brandRoutes;
const brand_controller_1 = require("../controllers/brand.controller");
const auth_1 = require("../middleware/auth");
async function brandRoutes(app) {
    // Public Storefront Routes
    app.get('/brands', {
        schema: {
            description: 'List all active automotive parts brands',
            tags: ['Brands'],
        },
        handler: brand_controller_1.BrandController.listPublic,
    });
    app.get('/brands/slug/:slug', {
        schema: {
            description: 'Get brand details by slug',
            tags: ['Brands'],
        },
        handler: brand_controller_1.BrandController.getBySlug,
    });
    app.get('/brands/:id', {
        schema: {
            description: 'Get brand details by UUID',
            tags: ['Brands'],
        },
        handler: brand_controller_1.BrandController.getById,
    });
    // Protected Admin Routes
    app.get('/admin/brands', {
        preHandler: [auth_1.authenticate, (0, auth_1.requirePermission)('brand.read', 'product.read')],
        schema: {
            description: 'List all brands including inactive ones (Admin)',
            tags: ['Admin Brands'],
            security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        },
        handler: brand_controller_1.BrandController.listAdmin,
    });
    app.post('/admin/brands', {
        preHandler: [auth_1.authenticate, (0, auth_1.requirePermission)('brand.create', 'product.create')],
        schema: {
            description: 'Create a new manufacturer/brand (Admin)',
            tags: ['Admin Brands'],
            security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        },
        handler: brand_controller_1.BrandController.create,
    });
    app.patch('/admin/brands/:id', {
        preHandler: [auth_1.authenticate, (0, auth_1.requirePermission)('brand.update', 'product.update')],
        schema: {
            description: 'Update brand information (Admin)',
            tags: ['Admin Brands'],
            security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        },
        handler: brand_controller_1.BrandController.update,
    });
    app.delete('/admin/brands/:id', {
        preHandler: [auth_1.authenticate, (0, auth_1.requirePermission)('brand.delete', 'product.delete')],
        schema: {
            description: 'Soft-delete brand with active product association safety checks (Admin)',
            tags: ['Admin Brands'],
            security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        },
        handler: brand_controller_1.BrandController.delete,
    });
}
//# sourceMappingURL=brand.routes.js.map