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
  const adminReadOpts = {
    preHandler: [authenticate, requirePermission('category.read', 'product.read')],
    schema: {
      description: 'List all categories including inactive ones (Admin)',
      tags: ['Admin Categories'],
      security: [{ cookieAuth: [] }, { bearerAuth: [] }] as any,
    },
    handler: CategoryController.listAdmin,
  };
  app.get('/admin/categories', adminReadOpts);

  const adminCreateOpts = {
    preHandler: [authenticate, requirePermission('category.create', 'product.create')],
    schema: {
      description: 'Create a new category (Admin)',
      tags: ['Admin Categories'],
      security: [{ cookieAuth: [] }, { bearerAuth: [] }] as any,
    },
    handler: CategoryController.create,
  };
  app.post('/admin/categories', adminCreateOpts);
  app.post('/categories', adminCreateOpts);

  const adminUpdateOpts = {
    preHandler: [authenticate, requirePermission('category.update', 'product.update')],
    schema: {
      description: 'Update category details and hierarchy with cycle prevention (Admin)',
      tags: ['Admin Categories'],
      security: [{ cookieAuth: [] }, { bearerAuth: [] }] as any,
    },
    handler: CategoryController.update,
  };
  app.patch('/admin/categories/:id', adminUpdateOpts);
  app.put('/admin/categories/:id', adminUpdateOpts);
  app.patch('/categories/:id', adminUpdateOpts);
  app.put('/categories/:id', adminUpdateOpts);

  const adminDeleteOpts = {
    preHandler: [authenticate, requirePermission('category.delete', 'product.delete')],
    schema: {
      description: 'Soft-delete category with product/child orphan safety checks (Admin)',
      tags: ['Admin Categories'],
      security: [{ cookieAuth: [] }, { bearerAuth: [] }] as any,
    },
    handler: CategoryController.delete,
  };
  app.delete('/admin/categories/:id', adminDeleteOpts);
  app.delete('/categories/:id', adminDeleteOpts);
}
