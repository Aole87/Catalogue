import { FastifyRequest, FastifyReply } from 'fastify';
export declare class AdminCampaignController {
    /**
     * Campaigns CRUD
     */
    static listCampaigns(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    static getCampaignById(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    static createCampaign(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    static updateCampaign(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    static updateStatus(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    static deleteCampaign(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    static populateAudience(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    static recordEvent(request: FastifyRequest, reply: FastifyReply): Promise<never>;
}
