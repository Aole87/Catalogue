"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordCampaignEventSchema = exports.updateCampaignSchema = exports.createCampaignSchema = exports.campaignQuerySchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.campaignQuerySchema = zod_1.z.object({
    search: zod_1.z.string().optional(),
    status: zod_1.z.nativeEnum(client_1.CampaignStatus).optional(),
    segmentId: zod_1.z.string().uuid().optional(),
    page: zod_1.z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: zod_1.z
        .string()
        .optional()
        .transform((val) => (val ? Math.min(100, parseInt(val, 10)) : 20)),
});
exports.createCampaignSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Campaign name is required').max(100),
    code: zod_1.z.string().min(1, 'Campaign code is required').max(50),
    description: zod_1.z.string().max(500).optional().nullable(),
    status: zod_1.z.nativeEnum(client_1.CampaignStatus).default(client_1.CampaignStatus.DRAFT),
    segmentId: zod_1.z.string().uuid().optional().nullable(),
    startsAt: zod_1.z
        .string()
        .datetime()
        .optional()
        .nullable()
        .transform((val) => (val ? new Date(val) : null)),
    endsAt: zod_1.z
        .string()
        .datetime()
        .optional()
        .nullable()
        .transform((val) => (val ? new Date(val) : null)),
    budget: zod_1.z.number().min(0).optional().nullable(),
    metadata: zod_1.z.any().optional(),
});
exports.updateCampaignSchema = exports.createCampaignSchema.partial();
exports.recordCampaignEventSchema = zod_1.z.object({
    customerId: zod_1.z.string().uuid().optional().nullable(),
    eventType: zod_1.z.enum(['VIEW', 'CLICK', 'DISMISS', 'CONVERT', 'ENGAGE', 'PURCHASE']),
    metadata: zod_1.z.any().optional(),
});
//# sourceMappingURL=campaign.schema.js.map