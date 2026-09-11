import { FastifyRequest, FastifyReply } from 'fastify';
import { BrandService } from '../services/brand.service';
import { createBrandSchema, updateBrandSchema } from '../schemas/brand.schema';

export class BrandController {
  private static extractMetadata(request: FastifyRequest) {
    return {
      userId: request.user?.id,
      ipAddress: (request.headers['x-forwarded-for'] as string) || request.ip,
      userAgent: request.headers['user-agent'],
      requestId: (request.headers['x-request-id'] as string) || request.id,
    };
  }

  // Public Storefront: Flat Brand List
  static async listPublic(request: FastifyRequest, reply: FastifyReply) {
    const brands = await BrandService.listBrands(true);
    return reply.status(200).send({ data: brands });
  }

  // Public Storefront: Get by Slug or ID
  static async getBySlug(request: FastifyRequest<{ Params: { slug: string } }>, reply: FastifyReply) {
    const brand = await BrandService.getBrandBySlug(request.params.slug);
    return reply.status(200).send({ data: brand });
  }

  static async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const brand = await BrandService.getBrandById(request.params.id);
    return reply.status(200).send({ data: brand });
  }

  // Admin: List all (including inactive)
  static async listAdmin(request: FastifyRequest, reply: FastifyReply) {
    const brands = await BrandService.listBrands(false);
    return reply.status(200).send({ data: brands });
  }

  // Admin: Create
  static async create(request: FastifyRequest, reply: FastifyReply) {
    const input = createBrandSchema.parse(request.body);
    const metadata = BrandController.extractMetadata(request);
    const brand = await BrandService.createBrand(input, metadata);
    return reply.status(201).send({ data: brand });
  }

  // Admin: Update
  static async update(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const input = updateBrandSchema.parse(request.body);
    const metadata = BrandController.extractMetadata(request);
    const brand = await BrandService.updateBrand(request.params.id, input, metadata);
    return reply.status(200).send({ data: brand });
  }

  // Admin: Delete
  static async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const metadata = BrandController.extractMetadata(request);
    await BrandService.deleteBrand(request.params.id, metadata);
    return reply.status(200).send({ data: { success: true, message: 'Brand deleted successfully' } });
  }
}
