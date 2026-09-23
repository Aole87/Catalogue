"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminLoyaltyController = void 0;
const loyalty_repository_1 = require("../repositories/loyalty.repository");
const loyalty_service_1 = require("../services/loyalty.service");
const audit_repository_1 = require("../repositories/audit.repository");
const loyalty_schema_1 = require("../schemas/loyalty.schema");
const app_error_1 = require("../errors/app-error");
class AdminLoyaltyController {
    /**
     * GET /api/v1/admin/loyalty/accounts
     */
    static async listAccounts(request, reply) {
        const query = loyalty_schema_1.loyaltyAccountQuerySchema.parse(request.query);
        const result = await loyalty_repository_1.LoyaltyRepository.listAccounts(query);
        return reply.status(200).send(result);
    }
    /**
     * GET /api/v1/admin/loyalty/accounts/:customerId
     */
    static async getAccountByCustomerId(request, reply) {
        const { customerId } = request.params;
        const account = await loyalty_repository_1.LoyaltyRepository.findAccountByCustomerId(customerId);
        if (!account) {
            throw new app_error_1.NotFoundException('Loyalty account not found for this customer');
        }
        return reply.status(200).send({ data: account });
    }
    /**
     * POST /api/v1/admin/loyalty/accounts/:customerId/adjust
     */
    static async adjustPoints(request, reply) {
        const { customerId } = request.params;
        const body = loyalty_schema_1.adjustLoyaltyPointsSchema.parse(request.body);
        const actorId = request.user?.id || 'SYSTEM';
        const result = await loyalty_service_1.LoyaltyService.adjustPoints(customerId, body.points, body.reason, actorId, body.referenceId || undefined);
        if (request.user) {
            await audit_repository_1.AuditRepository.record({
                userId: request.user.id,
                action: 'LOYALTY_POINTS_ADJUSTED',
                resource: 'LoyaltyAccount',
                resourceId: result.account.id,
                after: {
                    pointsDelta: body.points,
                    reason: body.reason,
                    balanceAfter: result.account.pointsBalance,
                    transactionId: result.transaction.id,
                },
            });
        }
        return reply.status(200).send({
            data: result,
            message: `Loyalty balance adjusted by ${body.points > 0 ? '+' : ''}${body.points} points. New balance: ${result.account.pointsBalance}`,
        });
    }
}
exports.AdminLoyaltyController = AdminLoyaltyController;
//# sourceMappingURL=admin-loyalty.controller.js.map