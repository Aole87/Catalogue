"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupplierController = void 0;
const supplier_service_1 = require("../services/supplier.service");
const supplier_product_service_1 = require("../services/supplier-product.service");
const supplier_schema_1 = require("../schemas/supplier.schema");
const app_error_1 = require("../errors/app-error");
class SupplierController {
    // --- Suppliers ---
    static async getSuppliers(request, reply) {
        const query = supplier_schema_1.supplierQuerySchema.parse(request.query);
        const result = await supplier_service_1.SupplierService.getSuppliers(query);
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
    static async getSupplierById(request, reply) {
        const { id } = request.params;
        const supplier = await supplier_service_1.SupplierService.getSupplierById(id);
        return reply.status(200).send({ data: supplier });
    }
    static async createSupplier(request, reply) {
        const body = supplier_schema_1.createSupplierSchema.parse(request.body);
        const actorId = request.user?.id;
        const supplier = await supplier_service_1.SupplierService.createSupplier(body, actorId);
        return reply.status(201).send({ data: supplier, message: 'Supplier created successfully' });
    }
    static async updateSupplier(request, reply) {
        const { id } = request.params;
        const body = supplier_schema_1.updateSupplierSchema.parse(request.body);
        const actorId = request.user?.id;
        const supplier = await supplier_service_1.SupplierService.updateSupplier(id, body, actorId);
        return reply.status(200).send({ data: supplier, message: 'Supplier updated successfully' });
    }
    static async deleteSupplier(request, reply) {
        const { id } = request.params;
        const actorId = request.user?.id;
        const result = await supplier_service_1.SupplierService.deleteSupplier(id, actorId);
        return reply.status(200).send({ data: result.supplier, message: result.message });
    }
    // --- Supplier Products ---
    static async getSupplierProducts(request, reply) {
        const query = supplier_schema_1.supplierProductQuerySchema.parse(request.query);
        const result = await supplier_product_service_1.SupplierProductService.getSupplierProducts(query);
        return reply.status(200).send({ data: result.items, pagination: result.pagination });
    }
    static async getSupplierProductsBySupplierId(request, reply) {
        const { id } = request.params;
        const result = await supplier_product_service_1.SupplierProductService.getSupplierProducts({ supplierId: id, limit: 100 });
        return reply.status(200).send({ data: result.items, pagination: result.pagination });
    }
    static async lookupSupplierProduct(request, reply) {
        const { supplierId, productId } = request.query;
        if (!supplierId || !productId) {
            throw new app_error_1.BadRequestException('supplierId and productId query parameters are required for lookup');
        }
        const item = await supplier_product_service_1.SupplierProductService.getMapping(supplierId, productId);
        return reply.status(200).send({ data: item });
    }
    static async createSupplierProduct(request, reply) {
        const paramId = request.params?.id;
        const body = supplier_schema_1.createSupplierProductSchema.parse({
            ...request.body,
            supplierId: paramId || request.body?.supplierId,
        });
        if (!body.supplierId) {
            throw new app_error_1.BadRequestException('Supplier ID is required');
        }
        const actorId = request.user?.id;
        const item = await supplier_product_service_1.SupplierProductService.addSupplierProduct(body, actorId);
        return reply.status(201).send({ data: item, message: 'Product mapped to supplier successfully' });
    }
    static async updateSupplierProduct(request, reply) {
        const { id } = request.params;
        const body = supplier_schema_1.updateSupplierProductSchema.parse(request.body);
        const actorId = request.user?.id;
        const item = await supplier_product_service_1.SupplierProductService.updateSupplierProduct(id, body, actorId);
        return reply.status(200).send({ data: item, message: 'Supplier product mapping updated successfully' });
    }
    static async deleteSupplierProduct(request, reply) {
        const { id } = request.params;
        const actorId = request.user?.id;
        const result = await supplier_product_service_1.SupplierProductService.removeSupplierProduct(id, actorId);
        return reply.status(200).send({ data: result.item, message: result.message });
    }
}
exports.SupplierController = SupplierController;
//# sourceMappingURL=supplier.controller.js.map