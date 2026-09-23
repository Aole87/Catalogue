"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FitmentController = void 0;
const zod_1 = require("zod");
const fitment_service_1 = require("../services/fitment.service");
const fitment_schema_1 = require("../schemas/fitment.schema");
const client_1 = require("@prisma/client");
const productParamSchema = zod_1.z.object({
    productId: zod_1.z.string().uuid('Product ID must be a valid UUID'),
});
const fitmentParamSchema = zod_1.z.object({
    fitmentId: zod_1.z.string().uuid('Fitment ID must be a valid UUID'),
});
const productFitmentParamSchema = zod_1.z.object({
    productId: zod_1.z.string().uuid('Product ID must be a valid UUID'),
    fitmentId: zod_1.z.string().uuid('Fitment ID must be a valid UUID'),
});
const variantParamSchema = zod_1.z.object({
    variantId: zod_1.z.string().uuid('Variant ID must be a valid UUID'),
});
class FitmentController {
    // ==========================================
    // PUBLIC STOREFRONT FITMENT HANDLERS
    // ==========================================
    static async checkProductFitment(req, reply) {
        const { productId, vehicleVariantId } = fitment_schema_1.checkFitmentParamSchema.parse(req.params);
        const query = fitment_schema_1.checkFitmentQuerySchema.parse(req.query);
        const result = await fitment_service_1.FitmentService.checkProductFitment(productId, vehicleVariantId, query.position);
        return reply.status(200).send(result);
    }
    static async getCompatibleProductsForVariant(req, reply) {
        const { variantId } = variantParamSchema.parse(req.params);
        const query = fitment_schema_1.variantProductsQuerySchema.parse(req.query);
        const userTier = req.user?.customerProfile?.customerType
            ? req.user.customerProfile.customerType
            : client_1.PriceTier.GENERAL;
        const result = await fitment_service_1.FitmentService.getCompatibleProducts(variantId, query, userTier);
        return reply.status(200).send(result);
    }
    static async getProductFitments(req, reply) {
        const { productId } = productParamSchema.parse(req.params);
        const fitments = await fitment_service_1.FitmentService.getProductFitments(productId);
        return reply.status(200).send({ fitments });
    }
    // ==========================================
    // ADMIN FITMENT CRUD HANDLERS
    // ==========================================
    static async createProductFitment(req, reply) {
        const params = req.params;
        const body = fitment_schema_1.createFitmentSchema.parse(req.body);
        const productId = params.productId || body.productId;
        if (!productId) {
            return reply.status(400).send({
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Product ID is required',
                },
            });
        }
        const fitment = await fitment_service_1.FitmentService.createFitment(req.user.id, {
            ...body,
            productId,
        }, req.ip, req.headers['user-agent']);
        return reply.status(201).send({ fitment });
    }
    static async updateFitment(req, reply) {
        const { fitmentId } = fitmentParamSchema.parse(req.params);
        const body = fitment_schema_1.updateFitmentSchema.parse(req.body);
        const fitment = await fitment_service_1.FitmentService.updateFitment(req.user.id, fitmentId, body, req.ip, req.headers['user-agent']);
        return reply.status(200).send({ fitment });
    }
    static async deleteProductFitment(req, reply) {
        const params = req.params;
        const fitmentId = params.fitmentId;
        if (!fitmentId) {
            return reply.status(400).send({
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Fitment ID is required',
                },
            });
        }
        await fitment_service_1.FitmentService.deleteFitment(req.user.id, fitmentId, req.ip, req.headers['user-agent']);
        return reply.status(204).send();
    }
    static async listProductFitmentsAdmin(req, reply) {
        const { productId } = productParamSchema.parse(req.params);
        const fitments = await fitment_service_1.FitmentService.getProductFitments(productId);
        return reply.status(200).send({ fitments });
    }
}
exports.FitmentController = FitmentController;
//# sourceMappingURL=fitment.controller.js.map