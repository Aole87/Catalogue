import { FastifyRequest, FastifyReply } from 'fastify';
export declare class FitmentController {
    static checkProductFitment(req: FastifyRequest, reply: FastifyReply): Promise<never>;
    static getCompatibleProductsForVariant(req: FastifyRequest, reply: FastifyReply): Promise<never>;
    static getProductFitments(req: FastifyRequest, reply: FastifyReply): Promise<never>;
    static createProductFitment(req: FastifyRequest, reply: FastifyReply): Promise<never>;
    static updateFitment(req: FastifyRequest, reply: FastifyReply): Promise<never>;
    static deleteProductFitment(req: FastifyRequest, reply: FastifyReply): Promise<never>;
    static listProductFitmentsAdmin(req: FastifyRequest, reply: FastifyReply): Promise<never>;
}
