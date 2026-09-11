import { FastifyRequest, FastifyReply } from 'fastify';
import { LoyaltyRepository } from '../repositories/loyalty.repository';
import { LoyaltyService } from '../services/loyalty.service';
import { AuditRepository } from '../repositories/audit.repository';
import { loyaltyAccountQuerySchema, adjustLoyaltyPointsSchema } from '../schemas/loyalty.schema';
import { NotFoundException } from '../errors/app-error';

export class AdminLoyaltyController {
  /**
   * GET /api/v1/admin/loyalty/accounts
   */
  static async listAccounts(request: FastifyRequest, reply: FastifyReply) {
    const query = loyaltyAccountQuerySchema.parse(request.query);
    const result = await LoyaltyRepository.listAccounts(query);
    return reply.status(200).send(result);
  }

  /**
   * GET /api/v1/admin/loyalty/accounts/:customerId
   */
  static async getAccountByCustomerId(request: FastifyRequest, reply: FastifyReply) {
    const { customerId } = request.params as { customerId: string };
    const account = await LoyaltyRepository.findAccountByCustomerId(customerId);
    if (!account) {
      throw new NotFoundException('Loyalty account not found for this customer');
    }
    return reply.status(200).send({ data: account });
  }

  /**
   * POST /api/v1/admin/loyalty/accounts/:customerId/adjust
   */
  static async adjustPoints(request: FastifyRequest, reply: FastifyReply) {
    const { customerId } = request.params as { customerId: string };
    const body = adjustLoyaltyPointsSchema.parse(request.body);
    const actorId = request.user?.id || 'SYSTEM';

    const result = await LoyaltyService.adjustPoints(
      customerId,
      body.points,
      body.reason,
      actorId,
      body.referenceId || undefined
    );

    if (request.user) {
      await AuditRepository.record({
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
