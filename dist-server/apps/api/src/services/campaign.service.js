"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampaignService = void 0;
const campaign_repository_1 = require("../repositories/campaign.repository");
const crm_repository_1 = require("../repositories/crm.repository");
const client_1 = require("@prisma/client");
const app_error_1 = require("../errors/app-error");
class CampaignService {
    /**
     * Transitions campaign lifecycle state with validation.
     */
    static async updateCampaignStatus(campaignId, newStatus) {
        const campaign = await campaign_repository_1.CampaignRepository.findCampaignById(campaignId);
        if (!campaign) {
            throw new app_error_1.NotFoundException(`Campaign ${campaignId} not found`);
        }
        const allowedTransitions = {
            [client_1.CampaignStatus.DRAFT]: [client_1.CampaignStatus.SCHEDULED, client_1.CampaignStatus.ACTIVE, client_1.CampaignStatus.CANCELLED],
            [client_1.CampaignStatus.SCHEDULED]: [client_1.CampaignStatus.ACTIVE, client_1.CampaignStatus.CANCELLED],
            [client_1.CampaignStatus.ACTIVE]: [client_1.CampaignStatus.PAUSED, client_1.CampaignStatus.COMPLETED, client_1.CampaignStatus.CANCELLED],
            [client_1.CampaignStatus.PAUSED]: [client_1.CampaignStatus.ACTIVE, client_1.CampaignStatus.CANCELLED, client_1.CampaignStatus.COMPLETED],
            [client_1.CampaignStatus.COMPLETED]: [],
            [client_1.CampaignStatus.CANCELLED]: [],
        };
        if (!allowedTransitions[campaign.status].includes(newStatus)) {
            throw new app_error_1.BadRequestException(`Cannot transition campaign from ${campaign.status} to ${newStatus}`);
        }
        // Populate audience if activating with a segment
        if (newStatus === client_1.CampaignStatus.ACTIVE && campaign.segmentId) {
            const segment = await crm_repository_1.CrmRepository.findSegmentById(campaign.segmentId);
            if (segment && segment.memberships) {
                const customerIds = segment.memberships.map((m) => m.customerId);
                await campaign_repository_1.CampaignRepository.populateAudience(campaignId, customerIds);
            }
        }
        return campaign_repository_1.CampaignRepository.updateCampaign(campaignId, { status: newStatus });
    }
    /**
     * Populates audience from segment.
     */
    static async populateAudienceFromSegment(campaignId) {
        const campaign = await campaign_repository_1.CampaignRepository.findCampaignById(campaignId);
        if (!campaign || !campaign.segmentId)
            return 0;
        const segment = await crm_repository_1.CrmRepository.findSegmentById(campaign.segmentId);
        if (!segment || !segment.memberships)
            return 0;
        const customerIds = segment.memberships.map((m) => m.customerId);
        const res = await campaign_repository_1.CampaignRepository.populateAudience(campaignId, customerIds);
        return res.count;
    }
    /**
     * Tracks customer campaign interaction.
     */
    static async trackEvent(campaignId, customerId, eventType, metadata) {
        const campaign = await campaign_repository_1.CampaignRepository.findCampaignById(campaignId);
        if (!campaign) {
            throw new app_error_1.NotFoundException(`Campaign ${campaignId} not found`);
        }
        return campaign_repository_1.CampaignRepository.recordEvent(campaignId, customerId, eventType, metadata);
    }
}
exports.CampaignService = CampaignService;
//# sourceMappingURL=campaign.service.js.map