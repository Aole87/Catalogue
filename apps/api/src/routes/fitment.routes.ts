import { FastifyInstance } from 'fastify';
import { FitmentController } from '../controllers/fitment.controller';
import { authenticate, requirePermission } from '../middleware/auth';

export async function fitmentRoutes(fastify: FastifyInstance) {
  // ==========================================
  // PUBLIC STOREFRONT FITMENT ENDPOINTS
  // ==========================================
  // Authoritative Compatibility Check Endpoint
  fastify.get(
    '/products/:productId/fitment/:vehicleVariantId',
    FitmentController.checkProductFitment
  );

  // List all vehicle variants compatible with a product
  fastify.get(
    '/products/:productId/fitments',
    FitmentController.getProductFitments
  );

  // ==========================================
  // PROTECTED ADMIN FITMENT CRUD ROUTES
  // ==========================================
  fastify.post('/admin/products/:productId/fitments', {
    preHandler: [authenticate, requirePermission('fitment.create')],
    handler: FitmentController.createProductFitment,
  });

  fastify.post('/admin/fitments', {
    preHandler: [authenticate, requirePermission('fitment.create')],
    handler: FitmentController.createProductFitment,
  });

  fastify.get('/admin/products/:productId/fitments', {
    preHandler: [authenticate, requirePermission('fitment.read')],
    handler: FitmentController.listProductFitmentsAdmin,
  });

  fastify.patch('/admin/fitments/:fitmentId', {
    preHandler: [authenticate, requirePermission('fitment.update')],
    handler: FitmentController.updateFitment,
  });

  fastify.delete('/admin/products/:productId/fitments/:fitmentId', {
    preHandler: [authenticate, requirePermission('fitment.delete')],
    handler: FitmentController.deleteProductFitment,
  });

  fastify.delete('/admin/fitments/:fitmentId', {
    preHandler: [authenticate, requirePermission('fitment.delete')],
    handler: FitmentController.deleteProductFitment,
  });
}
