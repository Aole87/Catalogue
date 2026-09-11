import { FastifyInstance } from 'fastify';
import { AdminCrmController } from '../controllers/admin-crm.controller';
import { requireRole } from '../middleware/auth';

export async function adminCrmRoutes(app: FastifyInstance) {
  const crmRoles = ['SUPER_ADMIN', 'STORE_MANAGER', 'SALES_REP'];

  // Customers Query & Detail
  app.get('/admin/customers', { preHandler: [requireRole(crmRoles)] }, AdminCrmController.listCustomers);
  app.get('/admin/customers/:id', { preHandler: [requireRole(crmRoles)] }, AdminCrmController.getCustomerById);
  app.patch('/admin/customers/:id', { preHandler: [requireRole(crmRoles)] }, AdminCrmController.updateCustomer);
  app.get('/admin/customers/:id/activity', { preHandler: [requireRole(crmRoles)] }, AdminCrmController.getCustomerActivity);
  app.get('/admin/customers/:id/orders', { preHandler: [requireRole(crmRoles)] }, AdminCrmController.getCustomerOrders);

  // Tags
  app.get('/admin/customers/tags', { preHandler: [requireRole(crmRoles)] }, AdminCrmController.listTags);
  app.post('/admin/customers/tags', { preHandler: [requireRole(crmRoles)] }, AdminCrmController.createTag);
  app.post('/admin/customers/:id/tags', { preHandler: [requireRole(crmRoles)] }, AdminCrmController.assignTag);
  app.delete('/admin/customers/:id/tags/:tagId', { preHandler: [requireRole(crmRoles)] }, AdminCrmController.removeTag);

  // Segments
  app.get('/admin/customers/segments', { preHandler: [requireRole(crmRoles)] }, AdminCrmController.listSegments);
  app.post('/admin/customers/segments', { preHandler: [requireRole(crmRoles)] }, AdminCrmController.createSegment);
  app.get('/admin/customers/segments/:id', { preHandler: [requireRole(crmRoles)] }, AdminCrmController.getSegmentById);
  app.patch('/admin/customers/segments/:id', { preHandler: [requireRole(crmRoles)] }, AdminCrmController.updateSegment);
  app.delete('/admin/customers/segments/:id', { preHandler: [requireRole(crmRoles)] }, AdminCrmController.deleteSegment);
  app.post('/admin/customers/segments/:id/evaluate', { preHandler: [requireRole(crmRoles)] }, AdminCrmController.evaluateSegment);
}
