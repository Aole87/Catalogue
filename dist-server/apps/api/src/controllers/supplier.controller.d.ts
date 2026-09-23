import { FastifyRequest, FastifyReply } from 'fastify';
export declare class SupplierController {
    static getSuppliers(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    static getSupplierById(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    static createSupplier(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    static updateSupplier(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    static deleteSupplier(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    static getSupplierProducts(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    static getSupplierProductsBySupplierId(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    static lookupSupplierProduct(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    static createSupplierProduct(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    static updateSupplierProduct(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    static deleteSupplierProduct(request: FastifyRequest, reply: FastifyReply): Promise<never>;
}
