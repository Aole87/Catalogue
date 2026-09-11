import { FastifyRequest, FastifyReply } from 'fastify';
import { CampaignRepository } from '../repositories/campaign.repository';
import { CampaignService } from '../services/campaign.service';
import { AuditRepository } from '../repositories/audit.repository';
import {
  campaignQuerySchema,
  createCampaignSchema,
  updateCampaignSchema,
  recordCampaignEventSchema,
} from '../schemas/campaign.schema';
import { NotFoundException } from '../errors/app-error';
import { CampaignStatus } from '@prisma/client';

export class AdminCampaignController {
  /**
   * Campaigns CRUD
   */
  static async listCampaigns(request: FastifyRequest, reply: FastifyReply) {
    const query = campaignQuerySchema.parse(request.query);
    const result = await CampaignRepository.listCampaigns(query);
    return reply.status(200).send(result);
  }

  static async getCampaignById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const campaign = await CampaignRepository.findCampaignById(id);
    if (!campaign) {
      throw new NotFoundException('Marketing campaign not found');
    }
    return reply.status(200).send({ data: campaign });
  }

  static async createCampaign(request: FastifyRequest, reply: FastifyReply) {
    const body = createCampaignSchema.parse(request.body);
    const campaign = await CampaignRepository.createCampaign(body);

    if (request.user) {
      await AuditRepository.record({
        userId: request.user.id,
        action: 'CAMPAIGN_CREATED',
        resource: 'MarketingCampaign',
        resourceId: campaign.id,
        after: body,
      });
    }

    return reply.status(201).send({ data: campaign, message: 'Campaign created successfully' });
  }

  static async updateCampaign(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const body = updateCampaignSchema.parse(request.body);
    const campaign = await CampaignRepository.findCampaignById(id);
    if (!campaign) {
      throw new NotFoundException('Marketing campaign not found');
    }

    const updated = await CampaignRepository.updateCampaign(id, body);

    if (request.user) {
      await AuditRepository.record({
        userId: request.user.id,
        action: 'CAMPAIGN_UPDATED',
        resource: 'MarketingCampaign',
        resourceId: campaign.id,
        after: body,
      });
    }

    return reply.status(200).send({ data: updated, message: 'Campaign updated successfully' });
  }

  static async updateStatus(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const { status } = request.body as { status: CampaignStatus };
    const updated = await CampaignService.updateCampaignStatus(id, status);

    if (request.user) {
      await AuditRepository.record({
        userId: request.user.id,
        action: 'CAMPAIGN_STATUS_CHANGED',
        resource: 'MarketingCampaign',
        resourceId: id,
        after: { status },
      });
    }

    return reply.status(200).send({ data: updated, message: `Campaign status changed to ${status}` });
  }

  static async deleteCampaign(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    await CampaignRepository.deleteCampaign(id);
    return reply.status(200).send({ message: 'Campaign deleted successfully' });
  }

  static async populateAudience(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const { customerIds } = (request.body || {}) as { customerIds?: string[] };
    let count = 0;
    if (customerIds && customerIds.length > 0) {
      const result = await CampaignRepository.populateAudience(id, customerIds);
      count = typeof result === 'number' ? result : result.count;
    } else {
      count = await CampaignService.populateAudienceFromSegment(id);
    }
    return reply.status(200).send({ data: { count }, message: `Audience populated with ${count} members` });
  }

  static async recordEvent(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const body = recordCampaignEventSchema.parse(request.body);
    const event = await CampaignService.trackEvent(
      id,
      body.customerId || null,
      body.eventType,
      body.metadata
    );

    return reply.status(201).send({ data: event, message: 'Campaign event recorded' });
  }
}
