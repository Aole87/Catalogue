import { FastifyRequest, FastifyReply } from 'fastify';
export declare class ProductController {
    private static extractMetadata;
    private static resolveUserPriceTier;
    private static maskProductPrices;
    static listPublic(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    static getPublicById(request: FastifyRequest<{
        Params: {
            id: string;
        };
    }>, reply: FastifyReply): Promise<never>;
    static getPublicBySlug(request: FastifyRequest<{
        Params: {
            slug: string;
        };
    }>, reply: FastifyReply): Promise<never>;
    static listAdmin(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    static getAdminById(request: FastifyRequest<{
        Params: {
            id: string;
        };
    }>, reply: FastifyReply): Promise<never>;
    static create(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    static update(request: FastifyRequest<{
        Params: {
            id: string;
        };
    }>, reply: FastifyReply): Promise<never>;
    static delete(request: FastifyRequest<{
        Params: {
            id: string;
        };
    }>, reply: FastifyReply): Promise<never>;
    static updatePrices(request: FastifyRequest<{
        Params: {
            id: string;
        };
    }>, reply: FastifyReply): Promise<never>;
}
