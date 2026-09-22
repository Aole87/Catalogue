import { FastifyInstance } from 'fastify';
import { BrandController } from '../controllers/brand.controller';
import { authenticate, requirePermission } from '../middleware/auth';

export async function brandRoutes(app: FastifyInstance) {
  // Public Storefront Routes
  app.get('/brands', {
    schema: {
      description: 'List all active automotive parts brands',
      tags: ['Brands'],
    },
    handler: BrandController.listPublic,
  });

  app.get('/brands/slug/:slug', {
    schema: {
      description: 'Get brand details by slug',
      tags: ['Brands'],
    },
    handler: BrandController.getBySlug,
  });

  app.get('/brands/:id', {
    schema: {
      description: 'Get brand details by UUID',
      tags: ['Brands'],
    },
    handler: BrandController.getById,
  });

  // Protected Admin Routes
  const adminReadOpts = {
    preHandler: [authenticate, requirePermission('brand.read', 'product.read')],
    schema: {
      description: 'List all brands including inactive ones (Admin)',
      tags: ['Admin Brands'],
      security: [{ cookieAuth: [] }, { bearerAuth: [] }],
    },
    handler: BrandController.listAdmin,
  };
  app.get('/admin/brands', adminReadOpts);

  const adminCreateOpts = {
    preHandler: [authenticate, requirePermission('brand.create', 'product.create')],
    schema: {
      description: 'Create a new manufacturer/brand (Admin)',
      tags: ['Admin Brands'],
      security: [{ cookieAuth: [] }, { bearerAuth: [] }],
    },
    handler: BrandController.create,
  };
  app.post('/admin/brands', adminCreateOpts);
  app.post('/brands', adminCreateOpts);

  const adminUpdateOpts = {
    preHandler: [authenticate, requirePermission('brand.update', 'product.update')],
    schema: {
      description: 'Update brand information (Admin)',
      tags: ['Admin Brands'],
      security: [{ cookieAuth: [] }, { bearerAuth: [] }],
    },
    handler: BrandController.update,
  };
  app.patch('/admin/brands/:id', adminUpdateOpts);
  app.put('/admin/brands/:id', adminUpdateOpts);
  app.patch('/brands/:id', adminUpdateOpts);
  app.put('/brands/:id', adminUpdateOpts);

  const adminDeleteOpts = {
    preHandler: [authenticate, requirePermission('brand.delete', 'product.delete')],
    schema: {
      description: 'Soft-delete brand with active product association safety checks (Admin)',
      tags: ['Admin Brands'],
      security: [{ cookieAuth: [] }, { bearerAuth: [] }],
    },
    handler: BrandController.delete,
  };
  app.delete('/admin/brands/:id', adminDeleteOpts);
  app.delete('/brands/:id', adminDeleteOpts);
}
