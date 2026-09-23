"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminCampaignRoutes = adminCampaignRoutes;
const admin_campaign_controller_1 = require("../controllers/admin-campaign.controller");
const auth_1 = require("../middleware/auth");
async function adminCampaignRoutes(app) {
    const campaignRoles = ['SUPER_ADMIN', 'STORE_MANAGER', 'SALES_REP'];
    app.get('/admin/campaigns', { preHandler: [(0, auth_1.requireRole)(campaignRoles)] }, admin_campaign_controller_1.AdminCampaignController.listCampaigns);
    app.post('/admin/campaigns', { preHandler: [(0, auth_1.requireRole)(campaignRoles)] }, admin_campaign_controller_1.AdminCampaignController.createCampaign);
    app.get('/admin/campaigns/:id', { preHandler: [(0, auth_1.requireRole)(campaignRoles)] }, admin_campaign_controller_1.AdminCampaignController.getCampaignById);
    app.patch('/admin/campaigns/:id', { preHandler: [(0, auth_1.requireRole)(campaignRoles)] }, admin_campaign_controller_1.AdminCampaignController.updateCampaign);
    app.patch('/admin/campaigns/:id/status', { preHandler: [(0, auth_1.requireRole)(campaignRoles)] }, admin_campaign_controller_1.AdminCampaignController.updateStatus);
    app.delete('/admin/campaigns/:id', { preHandler: [(0, auth_1.requireRole)(campaignRoles)] }, admin_campaign_controller_1.AdminCampaignController.deleteCampaign);
    app.post('/admin/campaigns/:id/audiences', { preHandler: [(0, auth_1.requireRole)(campaignRoles)] }, admin_campaign_controller_1.AdminCampaignController.populateAudience);
    app.post('/admin/campaigns/:id/events', { preHandler: [(0, auth_1.requireRole)(campaignRoles)] }, admin_campaign_controller_1.AdminCampaignController.recordEvent);
}
//# sourceMappingURL=admin-campaign.routes.js.map