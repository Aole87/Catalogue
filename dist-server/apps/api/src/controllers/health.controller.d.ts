import { FastifyRequest, FastifyReply } from 'fastify';
export declare class HealthController {
    static getHealth(_request: FastifyRequest, reply: FastifyReply): Promise<never>;
    static getReady(_request: FastifyRequest, reply: FastifyReply): Promise<never>;
}
