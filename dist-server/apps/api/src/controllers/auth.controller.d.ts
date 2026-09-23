import { FastifyRequest, FastifyReply } from 'fastify';
export declare class AuthController {
    private static extractMetadata;
    private static setSessionCookie;
    private static clearSessionCookie;
    static register(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    static login(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    static logout(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    static getMe(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    static changePassword(request: FastifyRequest, reply: FastifyReply): Promise<never>;
}
