import { FastifyRequest, FastifyReply } from 'fastify';
export declare class AdminCrmController {
    /**
     * GET /api/v1/admin/customers
     */
    static listCustomers(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    /**
     * GET /api/v1/admin/customers/:id
     */
    static getCustomerById(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    /**
     * PATCH /api/v1/admin/customers/:id
     */
    static updateCustomer(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    /**
     * DELETE /api/v1/admin/customers/:id
     */
    static deleteCustomer(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    /**
     * GET /api/v1/admin/customers/:id/activity
     */
    static getCustomerActivity(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    /**
     * GET /api/v1/admin/customers/:id/orders
     */
    static getCustomerOrders(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    /**
     * Tags
     */
    static listTags(_request: FastifyRequest, reply: FastifyReply): Promise<never>;
    static createTag(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    static assignTag(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    static removeTag(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    /**
     * Segments
     */
    static listSegments(_request: FastifyRequest, reply: FastifyReply): Promise<never>;
    static getSegmentById(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    static createSegment(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    static updateSegment(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    static deleteSegment(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    static evaluateSegment(request: FastifyRequest, reply: FastifyReply): Promise<never>;
}
