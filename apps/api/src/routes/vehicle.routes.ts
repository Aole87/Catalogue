import { FastifyInstance } from 'fastify';
import { VehicleController } from '../controllers/vehicle.controller';
import { FitmentController } from '../controllers/fitment.controller';
import { authenticate, authenticateOptional, requirePermission } from '../middleware/auth';

export async function vehicleRoutes(fastify: FastifyInstance) {
  // ==========================================
  // PUBLIC STOREFRONT VEHICLE ENDPOINTS
  // ==========================================
  fastify.get('/vehicles/makes', VehicleController.listMakes);
  fastify.get('/vehicles/makes/:id', VehicleController.getMake);

  fastify.get('/vehicles/models', VehicleController.listModels);
  fastify.get('/vehicles/models/:id', VehicleController.getModel);

  fastify.get('/vehicles/generations', VehicleController.listGenerations);
  fastify.get('/vehicles/generations/:id', VehicleController.getGeneration);

  fastify.get('/vehicles/engines', VehicleController.listEngines);
  fastify.get('/vehicles/engines/:id', VehicleController.getEngine);

  fastify.get('/vehicles/variants', VehicleController.listVariants);
  fastify.get('/vehicles/variants/:id', VehicleController.getVariant);

  fastify.get(
    '/vehicles/variants/:variantId/products',
    { preHandler: [authenticateOptional] },
    FitmentController.getCompatibleProductsForVariant
  );

  // ==========================================
  // PROTECTED ADMIN VEHICLE MASTER DATA ROUTES
  // ==========================================
  // Makes
  const makeCreateOpts = {
    preHandler: [authenticate, requirePermission('vehicle.create')],
    handler: VehicleController.createMake,
  };
  fastify.post('/admin/vehicles/makes', makeCreateOpts);
  fastify.post('/vehicles/makes', makeCreateOpts);

  fastify.get('/admin/vehicles/makes', {
    preHandler: [authenticate, requirePermission('vehicle.read')],
    handler: VehicleController.listMakes,
  });
  fastify.get('/admin/vehicles/makes/:id', {
    preHandler: [authenticate, requirePermission('vehicle.read')],
    handler: VehicleController.getMake,
  });

  const makeUpdateOpts = {
    preHandler: [authenticate, requirePermission('vehicle.update')],
    handler: VehicleController.updateMake,
  };
  fastify.patch('/admin/vehicles/makes/:id', makeUpdateOpts);
  fastify.put('/admin/vehicles/makes/:id', makeUpdateOpts);
  fastify.patch('/vehicles/makes/:id', makeUpdateOpts);
  fastify.put('/vehicles/makes/:id', makeUpdateOpts);

  const makeDeleteOpts = {
    preHandler: [authenticate, requirePermission('vehicle.delete')],
    handler: VehicleController.deleteMake,
  };
  fastify.delete('/admin/vehicles/makes/:id', makeDeleteOpts);
  fastify.delete('/vehicles/makes/:id', makeDeleteOpts);

  // Models
  const modelCreateOpts = {
    preHandler: [authenticate, requirePermission('vehicle.create')],
    handler: VehicleController.createModel,
  };
  fastify.post('/admin/vehicles/models', modelCreateOpts);
  fastify.post('/vehicles/models', modelCreateOpts);

  fastify.get('/admin/vehicles/models', {
    preHandler: [authenticate, requirePermission('vehicle.read')],
    handler: VehicleController.listModels,
  });
  fastify.get('/admin/vehicles/models/:id', {
    preHandler: [authenticate, requirePermission('vehicle.read')],
    handler: VehicleController.getModel,
  });

  const modelUpdateOpts = {
    preHandler: [authenticate, requirePermission('vehicle.update')],
    handler: VehicleController.updateModel,
  };
  fastify.patch('/admin/vehicles/models/:id', modelUpdateOpts);
  fastify.put('/admin/vehicles/models/:id', modelUpdateOpts);
  fastify.patch('/vehicles/models/:id', modelUpdateOpts);
  fastify.put('/vehicles/models/:id', modelUpdateOpts);

  const modelDeleteOpts = {
    preHandler: [authenticate, requirePermission('vehicle.delete')],
    handler: VehicleController.deleteModel,
  };
  fastify.delete('/admin/vehicles/models/:id', modelDeleteOpts);
  fastify.delete('/vehicles/models/:id', modelDeleteOpts);

  // Generations
  const genCreateOpts = {
    preHandler: [authenticate, requirePermission('vehicle.create')],
    handler: VehicleController.createGeneration,
  };
  fastify.post('/admin/vehicles/generations', genCreateOpts);
  fastify.post('/vehicles/generations', genCreateOpts);

  fastify.get('/admin/vehicles/generations', {
    preHandler: [authenticate, requirePermission('vehicle.read')],
    handler: VehicleController.listGenerations,
  });
  fastify.get('/admin/vehicles/generations/:id', {
    preHandler: [authenticate, requirePermission('vehicle.read')],
    handler: VehicleController.getGeneration,
  });

  const genUpdateOpts = {
    preHandler: [authenticate, requirePermission('vehicle.update')],
    handler: VehicleController.updateGeneration,
  };
  fastify.patch('/admin/vehicles/generations/:id', genUpdateOpts);
  fastify.put('/admin/vehicles/generations/:id', genUpdateOpts);
  fastify.patch('/vehicles/generations/:id', genUpdateOpts);
  fastify.put('/vehicles/generations/:id', genUpdateOpts);

  const genDeleteOpts = {
    preHandler: [authenticate, requirePermission('vehicle.delete')],
    handler: VehicleController.deleteGeneration,
  };
  fastify.delete('/admin/vehicles/generations/:id', genDeleteOpts);
  fastify.delete('/vehicles/generations/:id', genDeleteOpts);

  // Engines
  fastify.post('/admin/vehicles/engines', {
    preHandler: [authenticate, requirePermission('vehicle.create')],
    handler: VehicleController.createEngine,
  });
  fastify.get('/admin/vehicles/engines', {
    preHandler: [authenticate, requirePermission('vehicle.read')],
    handler: VehicleController.listEngines,
  });
  fastify.get('/admin/vehicles/engines/:id', {
    preHandler: [authenticate, requirePermission('vehicle.read')],
    handler: VehicleController.getEngine,
  });
  fastify.patch('/admin/vehicles/engines/:id', {
    preHandler: [authenticate, requirePermission('vehicle.update')],
    handler: VehicleController.updateEngine,
  });
  fastify.delete('/admin/vehicles/engines/:id', {
    preHandler: [authenticate, requirePermission('vehicle.delete')],
    handler: VehicleController.deleteEngine,
  });

  // Variants
  fastify.post('/admin/vehicles/variants', {
    preHandler: [authenticate, requirePermission('vehicle.create')],
    handler: VehicleController.createVariant,
  });
  fastify.get('/admin/vehicles/variants', {
    preHandler: [authenticate, requirePermission('vehicle.read')],
    handler: VehicleController.listVariants,
  });
  fastify.get('/admin/vehicles/variants/:id', {
    preHandler: [authenticate, requirePermission('vehicle.read')],
    handler: VehicleController.getVariant,
  });
  fastify.patch('/admin/vehicles/variants/:id', {
    preHandler: [authenticate, requirePermission('vehicle.update')],
    handler: VehicleController.updateVariant,
  });
  fastify.delete('/admin/vehicles/variants/:id', {
    preHandler: [authenticate, requirePermission('vehicle.delete')],
    handler: VehicleController.deleteVariant,
  });
}
