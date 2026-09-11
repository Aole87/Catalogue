import { CampaignRepository } from '../repositories/campaign.repository';
import { CrmRepository } from '../repositories/crm.repository';
import { CampaignStatus } from '@prisma/client';
import { BadRequestException, NotFoundException } from '../errors/app-error';

export class CampaignService {
  /**
   * Transitions campaign lifecycle state with validation.
   */
  static async updateCampaignStatus(campaignId: string, newStatus: CampaignStatus) {
    const campaign = await CampaignRepository.findCampaignById(campaignId);
    if (!campaign) {
      throw new NotFoundException(`Campaign ${campaignId} not found`);
    }

    const allowedTransitions: Record<CampaignStatus, CampaignStatus[]> = {
      [CampaignStatus.DRAFT]: [CampaignStatus.SCHEDULED, CampaignStatus.ACTIVE, CampaignStatus.CANCELLED],
      [CampaignStatus.SCHEDULED]: [CampaignStatus.ACTIVE, CampaignStatus.CANCELLED],
      [CampaignStatus.ACTIVE]: [CampaignStatus.PAUSED, CampaignStatus.COMPLETED, CampaignStatus.CANCELLED],
      [CampaignStatus.PAUSED]: [CampaignStatus.ACTIVE, CampaignStatus.CANCELLED, CampaignStatus.COMPLETED],
      [CampaignStatus.COMPLETED]: [],
      [CampaignStatus.CANCELLED]: [],
    };

    if (!allowedTransitions[campaign.status].includes(newStatus)) {
      throw new BadRequestException(`Cannot transition campaign from ${campaign.status} to ${newStatus}`);
    }

    // Populate audience if activating with a segment
    if (newStatus === CampaignStatus.ACTIVE && campaign.segmentId) {
      const segment = await CrmRepository.findSegmentById(campaign.segmentId);
      if (segment && segment.memberships) {
        const customerIds = segment.memberships.map((m) => m.customerId);
        await CampaignRepository.populateAudience(campaignId, customerIds);
      }
    }

    return CampaignRepository.updateCampaign(campaignId, { status: newStatus });
  }

  /**
   * Populates audience from segment.
   */
  static async populateAudienceFromSegment(campaignId: string) {
    const campaign = await CampaignRepository.findCampaignById(campaignId);
    if (!campaign || !campaign.segmentId) return 0;
    const segment = await CrmRepository.findSegmentById(campaign.segmentId);
    if (!segment || !segment.memberships) return 0;
    const customerIds = segment.memberships.map((m) => m.customerId);
    const res = await CampaignRepository.populateAudience(campaignId, customerIds);
    return res.count;
  }

  /**
   * Tracks customer campaign interaction.
   */
  static async trackEvent(
    campaignId: string,
    customerId: string | null,
    eventType: string,
    metadata?: any
  ) {
    const campaign = await CampaignRepository.findCampaignById(campaignId);
    if (!campaign) {
      throw new NotFoundException(`Campaign ${campaignId} not found`);
    }

    return CampaignRepository.recordEvent(campaignId, customerId, eventType, metadata);
  }
}
