import { FastifyRequest, FastifyReply } from 'fastify';
export declare class CartController {
    private static extractCartIdentity;
    private static attachSessionTokenCookie;
    static getCart(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    static addItem(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    static updateItem(request: FastifyRequest<{
        Params: {
            id: string;
        };
    }>, reply: FastifyReply): Promise<never>;
    static removeItem(request: FastifyRequest<{
        Params: {
            id: string;
        };
    }>, reply: FastifyReply): Promise<never>;
    static clearCart(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    static mergeCart(request: FastifyRequest, reply: FastifyReply): Promise<never>;
}
