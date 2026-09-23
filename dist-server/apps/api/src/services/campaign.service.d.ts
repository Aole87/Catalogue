import { CampaignStatus } from '@prisma/client';
export declare class CampaignService {
    /**
     * Transitions campaign lifecycle state with validation.
     */
    static updateCampaignStatus(campaignId: string, newStatus: CampaignStatus): Promise<{
        segment: {
            description: string | null;
            name: string;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            code: string;
            isAutomatic: boolean;
        } | null;
    } & {
        description: string | null;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        status: import(".prisma/client").$Enums.CampaignStatus;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        segmentId: string | null;
        code: string;
        startsAt: Date | null;
        endsAt: Date | null;
        budget: import("@prisma/client/runtime/library").Decimal | null;
        targetAudienceCount: number;
        engagedCount: number;
        convertedCount: number;
        totalRevenue: import("@prisma/client/runtime/library").Decimal;
        discountCost: import("@prisma/client/runtime/library").Decimal;
    }>;
    /**
     * Populates audience from segment.
     */
    static populateAudienceFromSegment(campaignId: string): Promise<number>;
    /**
     * Tracks customer campaign interaction.
     */
    static trackEvent(campaignId: string, customerId: string | null, eventType: string, metadata?: any): Promise<{
        id: string;
        createdAt: Date;
        eventType: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        customerId: string | null;
        campaignId: string;
    }>;
}
