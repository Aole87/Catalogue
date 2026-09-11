import { FastifyInstance } from 'fastify';
import { CategoryController } from '../controllers/category.controller';
import { authenticate, requirePermission } from '../middleware/auth';

export async function categoryRoutes(app: FastifyInstance) {
  // Public Storefront Routes
  app.get('/categories/tree', {
    schema: {
      description: 'Get nested hierarchical category tree for navigation and storefront browsing',
      tags: ['Categories'],
    },
    handler: CategoryController.getTree,
  });

  app.get('/categories', {
    schema: {
      description: 'List all active root and subcategories in flat format',
      tags: ['Categories'],
    },
    handler: CategoryController.listPublic,
  });

  app.get('/categories/slug/:slug', {
    schema: {
      description: 'Get category details and immediate children by URL-safe slug',
      tags: ['Categories'],
    },
    handler: CategoryController.getBySlug,
  });

  app.get('/categories/:id', {
    schema: {
      description: 'Get category details by UUID',
      tags: ['Categories'],
    },
    handler: CategoryController.getById,
  });

  // Protected Admin Routes
  app.get('/admin/categories', {
    preHandler: [authenticate, requirePermission('category.read', 'product.read')],
    schema: {
      description: 'List all categories including inactive ones (Admin)',
      tags: ['Admin Categories'],
      security: [{ cookieAuth: [] }, { bearerAuth: [] }],
    },
    handler: CategoryController.listAdmin,
  });

  app.post('/admin/categories', {
    preHandler: [authenticate, requirePermission('category.create', 'product.create')],
    schema: {
      description: 'Create a new category (Admin)',
      tags: ['Admin Categories'],
      security: [{ cookieAuth: [] }, { bearerAuth: [] }],
    },
    handler: CategoryController.create,
  });

  app.patch('/admin/categories/:id', {
    preHandler: [authenticate, requirePermission('category.update', 'product.update')],
    schema: {
      description: 'Update category details and hierarchy with cycle prevention (Admin)',
      tags: ['Admin Categories'],
      security: [{ cookieAuth: [] }, { bearerAuth: [] }],
    },
    handler: CategoryController.update,
  });

  app.delete('/admin/categories/:id', {
    preHandler: [authenticate, requirePermission('category.delete', 'product.delete')],
    schema: {
      description: 'Soft-delete category with product/child orphan safety checks (Admin)',
      tags: ['Admin Categories'],
      security: [{ cookieAuth: [] }, { bearerAuth: [] }],
    },
    handler: CategoryController.delete,
  });
}
