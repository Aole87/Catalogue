import { FastifyRequest, FastifyReply } from 'fastify';
import { CategoryService } from '../services/category.service';
import { createCategorySchema, updateCategorySchema } from '../schemas/category.schema';

export class CategoryController {
  private static extractMetadata(request: FastifyRequest) {
    return {
      userId: request.user?.id,
      ipAddress: (request.headers['x-forwarded-for'] as string) || request.ip,
      userAgent: request.headers['user-agent'],
      requestId: (request.headers['x-request-id'] as string) || request.id,
    };
  }

  // Public Storefront: Category Tree
  static async getTree(request: FastifyRequest, reply: FastifyReply) {
    const tree = await CategoryService.getCategoryTree(true);
    return reply.status(200).send({ data: tree });
  }

  // Public Storefront: Flat Category List
  static async listPublic(request: FastifyRequest, reply: FastifyReply) {
    const categories = await CategoryService.listCategories(true);
    return reply.status(200).send({ data: categories });
  }

  // Public Storefront: Get by Slug or ID
  static async getBySlug(request: FastifyRequest<{ Params: { slug: string } }>, reply: FastifyReply) {
    const category = await CategoryService.getCategoryBySlug(request.params.slug);
    return reply.status(200).send({ data: category });
  }

  static async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const category = await CategoryService.getCategoryById(request.params.id);
    return reply.status(200).send({ data: category });
  }

  // Admin: List all (including inactive)
  static async listAdmin(request: FastifyRequest, reply: FastifyReply) {
    const categories = await CategoryService.listCategories(false);
    return reply.status(200).send({ data: categories });
  }

  // Admin: Create
  static async create(request: FastifyRequest, reply: FastifyReply) {
    const input = createCategorySchema.parse(request.body);
    const metadata = CategoryController.extractMetadata(request);
    const category = await CategoryService.createCategory(input, metadata);
    return reply.status(201).send({ data: category });
  }

  // Admin: Update
  static async update(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const input = updateCategorySchema.parse(request.body);
    const metadata = CategoryController.extractMetadata(request);
    const category = await CategoryService.updateCategory(request.params.id, input, metadata);
    return reply.status(200).send({ data: category });
  }

  // Admin: Delete
  static async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const metadata = CategoryController.extractMetadata(request);
    await CategoryService.deleteCategory(request.params.id, metadata);
    return reply.status(200).send({ data: { success: true, message: 'Category deleted successfully' } });
  }
}
