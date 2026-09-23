"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampaignRepository = void 0;
const database_1 = require("@car-parts/database");
const client_1 = require("@prisma/client");
class CampaignRepository {
    /**
     * Campaigns CRUD
     */
    static async listCampaigns(params) {
        const page = Math.max(1, params.page || 1);
        const limit = Math.min(100, Math.max(1, params.limit || 20));
        const skip = (page - 1) * limit;
        const where = {
            deletedAt: null,
        };
        if (params.status) {
            where.status = params.status;
        }
        if (params.segmentId) {
            where.segmentId = params.segmentId;
        }
        if (params.search) {
            const search = params.search.trim();
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { code: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [total, campaigns] = await Promise.all([
            database_1.prisma.marketingCampaign.count({ where }),
            database_1.prisma.marketingCampaign.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    segment: true,
                    _count: {
                        select: {
                            audiences: true,
                            events: true,
                        },
                    },
                },
            }),
        ]);
        return {
            data: campaigns,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    static async findCampaignById(id) {
        return database_1.prisma.marketingCampaign.findFirst({
            where: { id, deletedAt: null },
            include: {
                segment: {
                    include: {
                        rules: true,
                    },
                },
                audiences: {
                    take: 50,
                    include: {
                        customer: {
                            include: {
                                user: {
                                    select: { id: true, email: true, firstName: true, lastName: true },
                                },
                            },
                        },
                    },
                },
                events: {
                    take: 50,
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
    }
    static async createCampaign(data) {
        return database_1.prisma.marketingCampaign.create({
            data: {
                name: data.name.trim(),
                code: data.code.trim().toUpperCase(),
                description: data.description || null,
                status: data.status || client_1.CampaignStatus.DRAFT,
                segmentId: data.segmentId || null,
                startsAt: data.startsAt || null,
                endsAt: data.endsAt || null,
                budget: data.budget ? new client_1.Prisma.Decimal(data.budget) : null,
                metadata: data.metadata || client_1.Prisma.JsonNull,
            },
            include: { segment: true },
        });
    }
    static async updateCampaign(id, data) {
        return database_1.prisma.marketingCampaign.update({
            where: { id },
            data: {
                name: data.name?.trim(),
                description: data.description,
                status: data.status,
                segmentId: data.segmentId,
                startsAt: data.startsAt,
                endsAt: data.endsAt,
                budget: data.budget !== undefined ? (data.budget ? new client_1.Prisma.Decimal(data.budget) : null) : undefined,
                metadata: data.metadata !== undefined ? data.metadata : undefined,
            },
            include: { segment: true },
        });
    }
    static async deleteCampaign(id) {
        return database_1.prisma.marketingCampaign.update({
            where: { id },
            data: { deletedAt: new Date(), status: client_1.CampaignStatus.CANCELLED },
        });
    }
    /**
     * Audience population & events
     */
    static async populateAudience(campaignId, customerIds) {
        return database_1.prisma.$transaction(async (tx) => {
            for (const customerId of customerIds) {
                await tx.campaignAudience.upsert({
                    where: {
                        campaignId_customerId: { campaignId, customerId },
                    },
                    create: { campaignId, customerId },
                    update: {},
                });
            }
            const count = await tx.campaignAudience.count({ where: { campaignId } });
            await tx.marketingCampaign.update({
                where: { id: campaignId },
                data: { targetAudienceCount: count },
            });
            return { count };
        });
    }
    static async recordEvent(campaignId, customerId, eventType, metadata) {
        return database_1.prisma.$transaction(async (tx) => {
            const event = await tx.campaignEvent.create({
                data: {
                    campaignId,
                    customerId,
                    eventType,
                    metadata: metadata || client_1.Prisma.JsonNull,
                },
            });
            if (customerId) {
                const isConversion = eventType === 'CONVERT' || eventType === 'PURCHASE';
                const isEngagement = eventType === 'ENGAGE' || eventType === 'CLICK' || isConversion;
                const updateData = {};
                if (isEngagement)
                    updateData.isEngaged = true;
                if (isConversion) {
                    updateData.isConverted = true;
                    updateData.convertedAt = new Date();
                    if (metadata?.orderId) {
                        updateData.convertedOrder = { connect: { id: metadata.orderId } };
                    }
                }
                await tx.campaignAudience.updateMany({
                    where: { campaignId, customerId },
                    data: updateData,
                });
                // Recalculate metrics on campaign
                const [engaged, converted] = await Promise.all([
                    tx.campaignAudience.count({ where: { campaignId, isEngaged: true } }),
                    tx.campaignAudience.count({ where: { campaignId, isConverted: true } }),
                ]);
                await tx.marketingCampaign.update({
                    where: { id: campaignId },
                    data: {
                        engagedCount: engaged,
                        convertedCount: converted,
                    },
                });
            }
            return event;
        });
    }
    static async updateCampaignFinancials(campaignId, revenue, discount) {
        return database_1.prisma.marketingCampaign.update({
            where: { id: campaignId },
            data: {
                totalRevenue: { increment: new client_1.Prisma.Decimal(revenue) },
                discountCost: { increment: new client_1.Prisma.Decimal(discount) },
            },
        });
    }
}
exports.CampaignRepository = CampaignRepository;
//# sourceMappingURL=campaign.repository.js.map