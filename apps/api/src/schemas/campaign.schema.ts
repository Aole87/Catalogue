import { z } from 'zod';
import { CampaignStatus } from '@prisma/client';

export const campaignQuerySchema = z.object({
  search: z.string().optional(),
  status: z.nativeEnum(CampaignStatus).optional(),
  segmentId: z.string().uuid().optional(),
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Math.min(100, parseInt(val, 10)) : 20)),
});

export const createCampaignSchema = z.object({
  name: z.string().min(1, 'Campaign name is required').max(100),
  code: z.string().min(1, 'Campaign code is required').max(50),
  description: z.string().max(500).optional().nullable(),
  status: z.nativeEnum(CampaignStatus).default(CampaignStatus.DRAFT),
  segmentId: z.string().uuid().optional().nullable(),
  startsAt: z
    .string()
    .datetime()
    .optional()
    .nullable()
    .transform((val) => (val ? new Date(val) : null)),
  endsAt: z
    .string()
    .datetime()
    .optional()
    .nullable()
    .transform((val) => (val ? new Date(val) : null)),
  budget: z.number().min(0).optional().nullable(),
  metadata: z.any().optional(),
});

export const updateCampaignSchema = createCampaignSchema.partial();

export const recordCampaignEventSchema = z.object({
  customerId: z.string().uuid().optional().nullable(),
  eventType: z.enum(['VIEW', 'CLICK', 'DISMISS', 'CONVERT', 'ENGAGE', 'PURCHASE']),
  metadata: z.any().optional(),
});
