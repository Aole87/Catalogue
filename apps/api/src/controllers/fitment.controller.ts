import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { FitmentService } from '../services/fitment.service';
import {
  createFitmentSchema,
  updateFitmentSchema,
  checkFitmentParamSchema,
  checkFitmentQuerySchema,
  variantProductsQuerySchema,
} from '../schemas/fitment.schema';
import { PriceTier } from '@prisma/client';

const productParamSchema = z.object({
  productId: z.string().uuid('Product ID must be a valid UUID'),
});

const fitmentParamSchema = z.object({
  fitmentId: z.string().uuid('Fitment ID must be a valid UUID'),
});

const productFitmentParamSchema = z.object({
  productId: z.string().uuid('Product ID must be a valid UUID'),
  fitmentId: z.string().uuid('Fitment ID must be a valid UUID'),
});

const variantParamSchema = z.object({
  variantId: z.string().uuid('Variant ID must be a valid UUID'),
});

export class FitmentController {
  // ==========================================
  // PUBLIC STOREFRONT FITMENT HANDLERS
  // ==========================================
  static async checkProductFitment(req: FastifyRequest, reply: FastifyReply) {
    const { productId, vehicleVariantId } = checkFitmentParamSchema.parse(req.params);
    const query = checkFitmentQuerySchema.parse(req.query);

    const result = await FitmentService.checkProductFitment(
      productId,
      vehicleVariantId,
      query.position
    );

    return reply.status(200).send(result);
  }

  static async getCompatibleProductsForVariant(req: FastifyRequest, reply: FastifyReply) {
    const { variantId } = variantParamSchema.parse(req.params);
    const query = variantProductsQuerySchema.parse(req.query);

    const userTier = req.user?.customerProfile?.customerType
      ? (req.user.customerProfile.customerType as unknown as PriceTier)
      : PriceTier.GENERAL;

    const result = await FitmentService.getCompatibleProducts(
      variantId,
      query,
      userTier
    );

    return reply.status(200).send(result);
  }

  static async getProductFitments(req: FastifyRequest, reply: FastifyReply) {
    const { productId } = productParamSchema.parse(req.params);
    const fitments = await FitmentService.getProductFitments(productId);
    return reply.status(200).send({ fitments });
  }

  // ==========================================
  // ADMIN FITMENT CRUD HANDLERS
  // ==========================================
  static async createProductFitment(req: FastifyRequest, reply: FastifyReply) {
    const params = req.params as { productId?: string };
    const body = createFitmentSchema.parse(req.body);

    const productId = params.productId || body.productId;
    if (!productId) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Product ID is required',
        },
      });
    }

    const fitment = await FitmentService.createFitment(
      req.user!.id,
      {
        ...body,
        productId,
      },
      req.ip,
      req.headers['user-agent']
    );

    return reply.status(201).send({ fitment });
  }

  static async updateFitment(req: FastifyRequest, reply: FastifyReply) {
    const { fitmentId } = fitmentParamSchema.parse(req.params);
    const body = updateFitmentSchema.parse(req.body);

    const fitment = await FitmentService.updateFitment(
      req.user!.id,
      fitmentId,
      body,
      req.ip,
      req.headers['user-agent']
    );

    return reply.status(200).send({ fitment });
  }

  static async deleteProductFitment(req: FastifyRequest, reply: FastifyReply) {
    const params = req.params as { fitmentId?: string; productId?: string };
    const fitmentId = params.fitmentId;

    if (!fitmentId) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Fitment ID is required',
        },
      });
    }

    await FitmentService.deleteFitment(
      req.user!.id,
      fitmentId,
      req.ip,
      req.headers['user-agent']
    );

    return reply.status(204).send();
  }

  static async listProductFitmentsAdmin(req: FastifyRequest, reply: FastifyReply) {
    const { productId } = productParamSchema.parse(req.params);
    const fitments = await FitmentService.getProductFitments(productId);
    return reply.status(200).send({ fitments });
  }
}
