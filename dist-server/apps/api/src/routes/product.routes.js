"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productRoutes = productRoutes;
const product_controller_1 = require("../controllers/product.controller");
const auth_1 = require("../middleware/auth");
async function productRoutes(app) {
    // Public Storefront Routes
    app.get('/products', {
        preHandler: [auth_1.authenticateOptional],
        schema: {
            description: 'List published catalog products with pagination, filtering, sorting, and search',
            tags: ['Products'],
        },
        handler: product_controller_1.ProductController.listPublic,
    });
    app.get('/products/slug/:slug', {
        preHandler: [auth_1.authenticateOptional],
        schema: {
            description: 'Get product detail by URL-safe slug with authoritative price and relations',
            tags: ['Products'],
        },
        handler: product_controller_1.ProductController.getPublicBySlug,
    });
    app.get('/products/:id', {
        preHandler: [auth_1.authenticateOptional],
        schema: {
            description: 'Get product detail by UUID with authoritative price and relations',
            tags: ['Products'],
        },
        handler: product_controller_1.ProductController.getPublicById,
    });
    // Protected Admin Routes
    app.get('/admin/products', {
        preHandler: [auth_1.authenticate, (0, auth_1.requirePermission)('product.read')],
        schema: {
            description: 'List all products including inactive and unpublished items (Admin)',
            tags: ['Admin Products'],
            security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        },
        handler: product_controller_1.ProductController.listAdmin,
    });
    app.get('/admin/products/:id', {
        preHandler: [auth_1.authenticate, (0, auth_1.requirePermission)('product.read')],
        schema: {
            description: 'Get full product details including all pricing tiers and metadata (Admin)',
            tags: ['Admin Products'],
            security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        },
        handler: product_controller_1.ProductController.getAdminById,
    });
    app.post('/admin/products', {
        preHandler: [auth_1.authenticate, (0, auth_1.requirePermission)('product.create')],
        schema: {
            description: 'Create a new product with prices, images, attributes, and cross references (Admin)',
            tags: ['Admin Products'],
            security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        },
        handler: product_controller_1.ProductController.create,
    });
    app.patch('/admin/products/:id', {
        preHandler: [auth_1.authenticate, (0, auth_1.requirePermission)('product.update')],
        schema: {
            description: 'Update an existing product (Admin)',
            tags: ['Admin Products'],
            security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        },
        handler: product_controller_1.ProductController.update,
    });
    app.delete('/admin/products/:id', {
        preHandler: [auth_1.authenticate, (0, auth_1.requirePermission)('product.delete')],
        schema: {
            description: 'Soft-delete a product from the active catalog (Admin)',
            tags: ['Admin Products'],
            security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        },
        handler: product_controller_1.ProductController.delete,
    });
    app.put('/admin/products/:id/prices', {
        preHandler: [auth_1.authenticate, (0, auth_1.requirePermission)('pricing.manage', 'product.update')],
        schema: {
            description: 'Update or set pricing tiers for a product with Decimal precision (Admin)',
            tags: ['Admin Products'],
            security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        },
        handler: product_controller_1.ProductController.updatePrices,
    });
}
//# sourceMappingURL=product.routes.js.map