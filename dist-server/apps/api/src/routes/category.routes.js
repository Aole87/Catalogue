"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryRoutes = categoryRoutes;
const category_controller_1 = require("../controllers/category.controller");
const auth_1 = require("../middleware/auth");
async function categoryRoutes(app) {
    // Public Storefront Routes
    app.get('/categories/tree', {
        schema: {
            description: 'Get nested hierarchical category tree for navigation and storefront browsing',
            tags: ['Categories'],
        },
        handler: category_controller_1.CategoryController.getTree,
    });
    app.get('/categories', {
        schema: {
            description: 'List all active root and subcategories in flat format',
            tags: ['Categories'],
        },
        handler: category_controller_1.CategoryController.listPublic,
    });
    app.get('/categories/slug/:slug', {
        schema: {
            description: 'Get category details and immediate children by URL-safe slug',
            tags: ['Categories'],
        },
        handler: category_controller_1.CategoryController.getBySlug,
    });
    app.get('/categories/:id', {
        schema: {
            description: 'Get category details by UUID',
            tags: ['Categories'],
        },
        handler: category_controller_1.CategoryController.getById,
    });
    // Protected Admin Routes
    app.get('/admin/categories', {
        preHandler: [auth_1.authenticate, (0, auth_1.requirePermission)('category.read', 'product.read')],
        schema: {
            description: 'List all categories including inactive ones (Admin)',
            tags: ['Admin Categories'],
            security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        },
        handler: category_controller_1.CategoryController.listAdmin,
    });
    app.post('/admin/categories', {
        preHandler: [auth_1.authenticate, (0, auth_1.requirePermission)('category.create', 'product.create')],
        schema: {
            description: 'Create a new category (Admin)',
            tags: ['Admin Categories'],
            security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        },
        handler: category_controller_1.CategoryController.create,
    });
    app.patch('/admin/categories/:id', {
        preHandler: [auth_1.authenticate, (0, auth_1.requirePermission)('category.update', 'product.update')],
        schema: {
            description: 'Update category details and hierarchy with cycle prevention (Admin)',
            tags: ['Admin Categories'],
            security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        },
        handler: category_controller_1.CategoryController.update,
    });
    app.delete('/admin/categories/:id', {
        preHandler: [auth_1.authenticate, (0, auth_1.requirePermission)('category.delete', 'product.delete')],
        schema: {
            description: 'Soft-delete category with product/child orphan safety checks (Admin)',
            tags: ['Admin Categories'],
            security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        },
        handler: category_controller_1.CategoryController.delete,
    });
}
//# sourceMappingURL=category.routes.js.map