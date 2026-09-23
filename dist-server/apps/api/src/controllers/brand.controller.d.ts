import { FastifyRequest, FastifyReply } from 'fastify';
export declare class BrandController {
    private static extractMetadata;
    static listPublic(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    static getBySlug(request: FastifyRequest<{
        Params: {
            slug: string;
        };
    }>, reply: FastifyReply): Promise<never>;
    static getById(request: FastifyRequest<{
        Params: {
            id: string;
        };
    }>, reply: FastifyReply): Promise<never>;
    static listAdmin(request: FastifyRequest, reply: FastifyReply): Promise<never>;
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
}
