import { FastifyRequest, FastifyReply } from 'fastify';
import { SupplierService } from '../services/supplier.service';
import { SupplierProductService } from '../services/supplier-product.service';
import {
  supplierQuerySchema,
  createSupplierSchema,
  updateSupplierSchema,
  supplierProductQuerySchema,
  createSupplierProductSchema,
  updateSupplierProductSchema,
} from '../schemas/supplier.schema';
import { BadRequestException } from '../errors/app-error';

export class SupplierController {
  // --- Suppliers ---
  static async getSuppliers(request: FastifyRequest, reply: FastifyReply) {
    const query = supplierQuerySchema.parse(request.query);
    const result = await SupplierService.getSuppliers(query);
    return reply.status(200).send({
      data: result.suppliers,
      pagination: result.pagination,
      meta: {
        total: result.pagination.total,
        totalCount: result.pagination.total,
        page: result.pagination.page,
        limit: result.pagination.limit,
        totalPages: result.pagination.totalPages,
      },
    });
  }

  static async getSupplierById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const supplier = await SupplierService.getSupplierById(id);
    return reply.status(200).send({ data: supplier });
  }

  static async createSupplier(request: FastifyRequest, reply: FastifyReply) {
    const body = createSupplierSchema.parse(request.body);
    const actorId = request.user?.id;
    const supplier = await SupplierService.createSupplier(body, actorId);
    return reply.status(201).send({ data: supplier, message: 'Supplier created successfully' });
  }

  static async updateSupplier(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const body = updateSupplierSchema.parse(request.body);
    const actorId = request.user?.id;
    const supplier = await SupplierService.updateSupplier(id, body, actorId);
    return reply.status(200).send({ data: supplier, message: 'Supplier updated successfully' });
  }

  static async deleteSupplier(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const actorId = request.user?.id;
    const result = await SupplierService.deleteSupplier(id, actorId);
    return reply.status(200).send({ data: result.supplier, message: result.message });
  }

  // --- Supplier Products ---
  static async getSupplierProducts(request: FastifyRequest, reply: FastifyReply) {
    const query = supplierProductQuerySchema.parse(request.query);
    const result = await SupplierProductService.getSupplierProducts(query);
    return reply.status(200).send({ data: result.items, pagination: result.pagination });
  }

  static async getSupplierProductsBySupplierId(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const result = await SupplierProductService.getSupplierProducts({ supplierId: id, limit: 100 });
    return reply.status(200).send({ data: result.items, pagination: result.pagination });
  }

  static async lookupSupplierProduct(request: FastifyRequest, reply: FastifyReply) {
    const { supplierId, productId } = request.query as { supplierId?: string; productId?: string };
    if (!supplierId || !productId) {
      throw new BadRequestException('supplierId and productId query parameters are required for lookup');
    }
    const item = await SupplierProductService.getMapping(supplierId, productId);
    return reply.status(200).send({ data: item });
  }

  static async createSupplierProduct(request: FastifyRequest, reply: FastifyReply) {
    const paramId = (request.params as any)?.id;
    const body = createSupplierProductSchema.parse({
      ...(request.body as object),
      supplierId: paramId || (request.body as any)?.supplierId,
    });
    if (!body.supplierId) {
      throw new BadRequestException('Supplier ID is required');
    }
    const actorId = request.user?.id;
    const item = await SupplierProductService.addSupplierProduct(body as any, actorId);
    return reply.status(201).send({ data: item, message: 'Product mapped to supplier successfully' });
  }

  static async updateSupplierProduct(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const body = updateSupplierProductSchema.parse(request.body);
    const actorId = request.user?.id;
    const item = await SupplierProductService.updateSupplierProduct(id, body, actorId);
    return reply.status(200).send({ data: item, message: 'Supplier product mapping updated successfully' });
  }

  static async deleteSupplierProduct(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const actorId = request.user?.id;
    const result = await SupplierProductService.removeSupplierProduct(id, actorId);
    return reply.status(200).send({ data: result.item, message: result.message });
  }
}
