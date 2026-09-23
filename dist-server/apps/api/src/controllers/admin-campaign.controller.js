"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminCampaignController = void 0;
const campaign_repository_1 = require("../repositories/campaign.repository");
const campaign_service_1 = require("../services/campaign.service");
const audit_repository_1 = require("../repositories/audit.repository");
const campaign_schema_1 = require("../schemas/campaign.schema");
const app_error_1 = require("../errors/app-error");
class AdminCampaignController {
    /**
     * Campaigns CRUD
     */
    static async listCampaigns(request, reply) {
        const query = campaign_schema_1.campaignQuerySchema.parse(request.query);
        const result = await campaign_repository_1.CampaignRepository.listCampaigns(query);
        return reply.status(200).send(result);
    }
    static async getCampaignById(request, reply) {
        const { id } = request.params;
        const campaign = await campaign_repository_1.CampaignRepository.findCampaignById(id);
        if (!campaign) {
            throw new app_error_1.NotFoundException('Marketing campaign not found');
        }
        return reply.status(200).send({ data: campaign });
    }
    static async createCampaign(request, reply) {
        const body = campaign_schema_1.createCampaignSchema.parse(request.body);
        const campaign = await campaign_repository_1.CampaignRepository.createCampaign(body);
        if (request.user) {
            await audit_repository_1.AuditRepository.record({
                userId: request.user.id,
                action: 'CAMPAIGN_CREATED',
                resource: 'MarketingCampaign',
                resourceId: campaign.id,
                after: body,
            });
        }
        return reply.status(201).send({ data: campaign, message: 'Campaign created successfully' });
    }
    static async updateCampaign(request, reply) {
        const { id } = request.params;
        const body = campaign_schema_1.updateCampaignSchema.parse(request.body);
        const campaign = await campaign_repository_1.CampaignRepository.findCampaignById(id);
        if (!campaign) {
            throw new app_error_1.NotFoundException('Marketing campaign not found');
        }
        const updated = await campaign_repository_1.CampaignRepository.updateCampaign(id, body);
        if (request.user) {
            await audit_repository_1.AuditRepository.record({
                userId: request.user.id,
                action: 'CAMPAIGN_UPDATED',
                resource: 'MarketingCampaign',
                resourceId: campaign.id,
                after: body,
            });
        }
        return reply.status(200).send({ data: updated, message: 'Campaign updated successfully' });
    }
    static async updateStatus(request, reply) {
        const { id } = request.params;
        const { status } = request.body;
        const updated = await campaign_service_1.CampaignService.updateCampaignStatus(id, status);
        if (request.user) {
            await audit_repository_1.AuditRepository.record({
                userId: request.user.id,
                action: 'CAMPAIGN_STATUS_CHANGED',
                resource: 'MarketingCampaign',
                resourceId: id,
                after: { status },
            });
        }
        return reply.status(200).send({ data: updated, message: `Campaign status changed to ${status}` });
    }
    static async deleteCampaign(request, reply) {
        const { id } = request.params;
        await campaign_repository_1.CampaignRepository.deleteCampaign(id);
        return reply.status(200).send({ message: 'Campaign deleted successfully' });
    }
    static async populateAudience(request, reply) {
        const { id } = request.params;
        const { customerIds } = (request.body || {});
        let count = 0;
        if (customerIds && customerIds.length > 0) {
            const result = await campaign_repository_1.CampaignRepository.populateAudience(id, customerIds);
            count = typeof result === 'number' ? result : result.count;
        }
        else {
            count = await campaign_service_1.CampaignService.populateAudienceFromSegment(id);
        }
        return reply.status(200).send({ data: { count }, message: `Audience populated with ${count} members` });
    }
    static async recordEvent(request, reply) {
        const { id } = request.params;
        const body = campaign_schema_1.recordCampaignEventSchema.parse(request.body);
        const event = await campaign_service_1.CampaignService.trackEvent(id, body.customerId || null, body.eventType, body.metadata);
        return reply.status(201).send({ data: event, message: 'Campaign event recorded' });
    }
}
exports.AdminCampaignController = AdminCampaignController;
//# sourceMappingURL=admin-campaign.controller.js.map