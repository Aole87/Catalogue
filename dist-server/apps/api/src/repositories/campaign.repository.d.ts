import { CampaignStatus, Prisma } from '@prisma/client';
export interface CampaignQueryParams {
    search?: string;
    status?: CampaignStatus;
    segmentId?: string;
    page?: number;
    limit?: number;
}
export declare class CampaignRepository {
    /**
     * Campaigns CRUD
     */
    static listCampaigns(params: CampaignQueryParams): Promise<{
        data: ({
            _count: {
                events: number;
                audiences: number;
            };
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
            metadata: Prisma.JsonValue | null;
            segmentId: string | null;
            code: string;
            startsAt: Date | null;
            endsAt: Date | null;
            budget: Prisma.Decimal | null;
            targetAudienceCount: number;
            engagedCount: number;
            convertedCount: number;
            totalRevenue: Prisma.Decimal;
            discountCost: Prisma.Decimal;
        })[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    static findCampaignById(id: string): Promise<({
        events: {
            id: string;
            createdAt: Date;
            eventType: string;
            metadata: Prisma.JsonValue | null;
            customerId: string | null;
            campaignId: string;
        }[];
        segment: ({
            rules: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                segmentId: string;
                value: string;
                field: string;
                operator: string;
            }[];
        } & {
            description: string | null;
            name: string;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            code: string;
            isAutomatic: boolean;
        }) | null;
        audiences: ({
            customer: {
                user: {
                    id: string;
                    email: string;
                    firstName: string;
                    lastName: string;
                } | null;
            } & {
                id: string;
                phone: string | null;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                userId: string | null;
                notes: string | null;
                customerType: import(".prisma/client").$Enums.CustomerType;
                companyName: string | null;
                taxId: string | null;
                isVerified: boolean;
            };
        } & {
            id: string;
            createdAt: Date;
            customerId: string;
            campaignId: string;
            isEngaged: boolean;
            isConverted: boolean;
            convertedOrderId: string | null;
            convertedAt: Date | null;
        })[];
    } & {
        description: string | null;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        status: import(".prisma/client").$Enums.CampaignStatus;
        metadata: Prisma.JsonValue | null;
        segmentId: string | null;
        code: string;
        startsAt: Date | null;
        endsAt: Date | null;
        budget: Prisma.Decimal | null;
        targetAudienceCount: number;
        engagedCount: number;
        convertedCount: number;
        totalRevenue: Prisma.Decimal;
        discountCost: Prisma.Decimal;
    }) | null>;
    static createCampaign(data: {
        name: string;
        code: string;
        description?: string | null;
        status?: CampaignStatus;
        segmentId?: string | null;
        startsAt?: Date | null;
        endsAt?: Date | null;
        budget?: number | string | null;
        metadata?: any;
    }): Promise<{
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
        metadata: Prisma.JsonValue | null;
        segmentId: string | null;
        code: string;
        startsAt: Date | null;
        endsAt: Date | null;
        budget: Prisma.Decimal | null;
        targetAudienceCount: number;
        engagedCount: number;
        convertedCount: number;
        totalRevenue: Prisma.Decimal;
        discountCost: Prisma.Decimal;
    }>;
    static updateCampaign(id: string, data: {
        name?: string;
        description?: string | null;
        status?: CampaignStatus;
        segmentId?: string | null;
        startsAt?: Date | null;
        endsAt?: Date | null;
        budget?: number | string | null;
        metadata?: any;
    }): Promise<{
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
        metadata: Prisma.JsonValue | null;
        segmentId: string | null;
        code: string;
        startsAt: Date | null;
        endsAt: Date | null;
        budget: Prisma.Decimal | null;
        targetAudienceCount: number;
        engagedCount: number;
        convertedCount: number;
        totalRevenue: Prisma.Decimal;
        discountCost: Prisma.Decimal;
    }>;
    static deleteCampaign(id: string): Promise<{
        description: string | null;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        status: import(".prisma/client").$Enums.CampaignStatus;
        metadata: Prisma.JsonValue | null;
        segmentId: string | null;
        code: string;
        startsAt: Date | null;
        endsAt: Date | null;
        budget: Prisma.Decimal | null;
        targetAudienceCount: number;
        engagedCount: number;
        convertedCount: number;
        totalRevenue: Prisma.Decimal;
        discountCost: Prisma.Decimal;
    }>;
    /**
     * Audience population & events
     */
    static populateAudience(campaignId: string, customerIds: string[]): Promise<{
        count: number;
    }>;
    static recordEvent(campaignId: string, customerId: string | null, eventType: string, metadata?: any): Promise<{
        id: string;
        createdAt: Date;
        eventType: string;
        metadata: Prisma.JsonValue | null;
        customerId: string | null;
        campaignId: string;
    }>;
    static updateCampaignFinancials(campaignId: string, revenue: number, discount: number): Promise<{
        description: string | null;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        status: import(".prisma/client").$Enums.CampaignStatus;
        metadata: Prisma.JsonValue | null;
        segmentId: string | null;
        code: string;
        startsAt: Date | null;
        endsAt: Date | null;
        budget: Prisma.Decimal | null;
        targetAudienceCount: number;
        engagedCount: number;
        convertedCount: number;
        totalRevenue: Prisma.Decimal;
        discountCost: Prisma.Decimal;
    }>;
}
