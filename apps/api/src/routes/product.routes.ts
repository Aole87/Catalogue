import { FastifyInstance } from 'fastify';
import { ProductController } from '../controllers/product.controller';
import { authenticate, authenticateOptional, requirePermission } from '../middleware/auth';

export async function productRoutes(app: FastifyInstance) {
  // Public Storefront Routes
  app.get('/products', {
    preHandler: [authenticateOptional],
    schema: {
      description: 'List published catalog products with pagination, filtering, sorting, and search',
      tags: ['Products'],
    },
    handler: ProductController.listPublic,
  });

  app.get('/products/slug/:slug', {
    preHandler: [authenticateOptional],
    schema: {
      description: 'Get product detail by URL-safe slug with authoritative price and relations',
      tags: ['Products'],
    },
    handler: ProductController.getPublicBySlug,
  });

  app.get('/products/:id', {
    preHandler: [authenticateOptional],
    schema: {
      description: 'Get product detail by UUID with authoritative price and relations',
      tags: ['Products'],
    },
    handler: ProductController.getPublicById,
  });

  // Protected Admin Routes
  app.get('/admin/products', {
    preHandler: [authenticate, requirePermission('product.read')],
    schema: {
      description: 'List all products including inactive and unpublished items (Admin)',
      tags: ['Admin Products'],
      security: [{ cookieAuth: [] }, { bearerAuth: [] }] as any,
    },
    handler: ProductController.listAdmin,
  });

  app.get('/admin/products/:id', {
    preHandler: [authenticate, requirePermission('product.read')],
    schema: {
      description: 'Get full product details including all pricing tiers and metadata (Admin)',
      tags: ['Admin Products'],
      security: [{ cookieAuth: [] }, { bearerAuth: [] }] as any,
    },
    handler: ProductController.getAdminById,
  });

  const adminCreateOpts = {
    preHandler: [authenticate, requirePermission('product.create')],
    schema: {
      description: 'Create a new product with prices, images, attributes, and cross references (Admin)',
      tags: ['Admin Products'],
      security: [{ cookieAuth: [] }, { bearerAuth: [] }] as any,
    },
    handler: ProductController.create,
  };
  app.post('/admin/products', adminCreateOpts);
  app.post('/products', adminCreateOpts);

  const adminUpdateOpts = {
    preHandler: [authenticate, requirePermission('product.update')],
    schema: {
      description: 'Update an existing product (Admin)',
      tags: ['Admin Products'],
      security: [{ cookieAuth: [] }, { bearerAuth: [] }] as any,
    },
    handler: ProductController.update,
  };
  app.patch('/admin/products/:id', adminUpdateOpts);
  app.put('/admin/products/:id', adminUpdateOpts);
  app.patch('/products/:id', adminUpdateOpts);
  app.put('/products/:id', adminUpdateOpts);

  const adminDeleteOpts = {
    preHandler: [authenticate, requirePermission('product.delete')],
    schema: {
      description: 'Soft-delete a product from the active catalog (Admin)',
      tags: ['Admin Products'],
      security: [{ cookieAuth: [] }, { bearerAuth: [] }] as any,
    },
    handler: ProductController.delete,
  };
  app.delete('/admin/products/:id', adminDeleteOpts);
  app.delete('/products/:id', adminDeleteOpts);

  app.put('/admin/products/:id/prices', {
    preHandler: [authenticate, requirePermission('pricing.manage', 'product.update')],
    schema: {
      description: 'Update or set pricing tiers for a product with Decimal precision (Admin)',
      tags: ['Admin Products'],
      security: [{ cookieAuth: [] }, { bearerAuth: [] }] as any,
    },
    handler: ProductController.updatePrices,
  });
}
