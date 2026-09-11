import { FastifyInstance } from 'fastify';
import { AdminCampaignController } from '../controllers/admin-campaign.controller';
import { requireRole } from '../middleware/auth';

export async function adminCampaignRoutes(app: FastifyInstance) {
  const campaignRoles = ['SUPER_ADMIN', 'STORE_MANAGER', 'SALES_REP'];

  app.get('/admin/campaigns', { preHandler: [requireRole(campaignRoles)] }, AdminCampaignController.listCampaigns);
  app.post('/admin/campaigns', { preHandler: [requireRole(campaignRoles)] }, AdminCampaignController.createCampaign);
  app.get('/admin/campaigns/:id', { preHandler: [requireRole(campaignRoles)] }, AdminCampaignController.getCampaignById);
  app.patch('/admin/campaigns/:id', { preHandler: [requireRole(campaignRoles)] }, AdminCampaignController.updateCampaign);
  app.patch('/admin/campaigns/:id/status', { preHandler: [requireRole(campaignRoles)] }, AdminCampaignController.updateStatus);
  app.delete('/admin/campaigns/:id', { preHandler: [requireRole(campaignRoles)] }, AdminCampaignController.deleteCampaign);
  app.post('/admin/campaigns/:id/audiences', { preHandler: [requireRole(campaignRoles)] }, AdminCampaignController.populateAudience);
  app.post('/admin/campaigns/:id/events', { preHandler: [requireRole(campaignRoles)] }, AdminCampaignController.recordEvent);
}
