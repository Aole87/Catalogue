import { FastifyRequest, FastifyReply } from 'fastify';
export declare class InventoryController {
    static getInventory(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    static getInventoryById(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    static getProductAvailability(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    static getDashboardMetrics(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    static reserveStock(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    static releaseReservation(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    static commitReservation(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    static adjustStock(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    static transferStock(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    static handleReturnDisposition(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    static getMovements(request: FastifyRequest, reply: FastifyReply): Promise<never>;
}
