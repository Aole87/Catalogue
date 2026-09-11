import { FastifyRequest, FastifyReply } from 'fastify';
import { ProductService } from '../services/product.service';
import {
  createProductSchema,
  updateProductSchema,
  updateProductPricesSchema,
  productQuerySchema,
} from '../schemas/product.schema';
import { PriceTier, CustomerType } from '@prisma/client';

export class ProductController {
  private static extractMetadata(request: FastifyRequest) {
    return {
      userId: request.user?.id,
      ipAddress: (request.headers['x-forwarded-for'] as string) || request.ip,
      userAgent: request.headers['user-agent'],
      requestId: (request.headers['x-request-id'] as string) || request.id,
    };
  }

  private static resolveUserPriceTier(request: FastifyRequest): PriceTier {
    const customerType = request.user?.customerProfile?.customerType;
    if (customerType === CustomerType.GARAGE) return PriceTier.GARAGE;
    if (customerType === CustomerType.SHOP) return PriceTier.SHOP;
    return PriceTier.GENERAL;
  }

  // Public Storefront: List products with pagination, filters, sort, search
  static async listPublic(request: FastifyRequest, reply: FastifyReply) {
    const query = productQuerySchema.parse(request.query);
    const userTier = ProductController.resolveUserPriceTier(request);
    const result = await ProductService.listStorefrontProducts(query, userTier);
    return reply.status(200).send({ data: result.items, pagination: result.pagination });
  }

  // Public Storefront: Get by ID
  static async getPublicById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const userTier = ProductController.resolveUserPriceTier(request);
    const product = await ProductService.getProductById(request.params.id, userTier, true);
    return reply.status(200).send({ data: product });
  }

  // Public Storefront: Get by Slug
  static async getPublicBySlug(request: FastifyRequest<{ Params: { slug: string } }>, reply: FastifyReply) {
    const userTier = ProductController.resolveUserPriceTier(request);
    const product = await ProductService.getProductBySlug(request.params.slug, userTier, true);
    return reply.status(200).send({ data: product });
  }

  // Admin: List all products (including unpublished/inactive)
  static async listAdmin(request: FastifyRequest, reply: FastifyReply) {
    const query = productQuerySchema.parse(request.query);
    const result = await ProductService.listAdminProducts(query);
    return reply.status(200).send({ data: result.items, pagination: result.pagination });
  }

  // Admin: Get by ID (full details)
  static async getAdminById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const product = await ProductService.getProductById(request.params.id, PriceTier.GENERAL, false);
    return reply.status(200).send({ data: product });
  }

  // Admin: Create product
  static async create(request: FastifyRequest, reply: FastifyReply) {
    const input = createProductSchema.parse(request.body);
    const metadata = ProductController.extractMetadata(request);
    const product = await ProductService.createProduct(input, metadata);
    return reply.status(201).send({ data: product });
  }

  // Admin: Update product
  static async update(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const input = updateProductSchema.parse(request.body);
    const metadata = ProductController.extractMetadata(request);
    const product = await ProductService.updateProduct(request.params.id, input, metadata);
    return reply.status(200).send({ data: product });
  }

  // Admin: Soft delete product
  static async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const metadata = ProductController.extractMetadata(request);
    await ProductService.deleteProduct(request.params.id, metadata);
    return reply.status(200).send({ data: { success: true, message: 'Product deleted successfully' } });
  }

  // Admin: Update pricing tiers
  static async updatePrices(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const input = updateProductPricesSchema.parse(request.body);
    const metadata = ProductController.extractMetadata(request);
    const product = await ProductService.updateProductPrices(request.params.id, input, metadata);
    return reply.status(200).send({ data: product });
  }
}
