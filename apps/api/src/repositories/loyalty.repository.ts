import { prisma } from '@car-parts/database';
import { LoyaltyTransactionType, Prisma } from '@prisma/client';
import { BadRequestException } from '../errors/app-error';

export interface LoyaltyAccountQueryParams {
  search?: string;
  tier?: string;
  page?: number;
  limit?: number;
}

export class LoyaltyRepository {
  /**
   * Get or create loyalty account for customer.
   */
  static async getOrCreateAccount(customerId: string) {
    return prisma.loyaltyAccount.upsert({
      where: { customerId },
      create: {
        customerId,
        pointsBalance: 0,
        lifetimeEarned: 0,
        lifetimeRedeemed: 0,
        tier: 'BRONZE',
      },
      update: {},
      include: {
        customer: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                displayName: true,
              },
            },
          },
        },
      },
    });
  }

  static async findAccountByCustomerId(customerId: string) {
    return prisma.loyaltyAccount.findUnique({
      where: { customerId },
      include: {
        customer: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                displayName: true,
              },
            },
          },
        },
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 50,
          include: {
            createdByUser: {
              select: { id: true, email: true, displayName: true, firstName: true, lastName: true },
            },
          },
        },
      },
    });
  }

  static async listAccounts(params: LoyaltyAccountQueryParams) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.LoyaltyAccountWhereInput = {};
    if (params.tier) {
      where.tier = params.tier;
    }
    if (params.search) {
      const search = params.search.trim();
      where.customer = {
        OR: [
          { companyName: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
          {
            user: {
              OR: [
                { email: { contains: search, mode: 'insensitive' } },
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
              ],
            },
          },
        ],
      };
    }

    const [total, accounts] = await Promise.all([
      prisma.loyaltyAccount.count({ where }),
      prisma.loyaltyAccount.findMany({
        where,
        skip,
        take: limit,
        orderBy: { pointsBalance: 'desc' },
        include: {
          customer: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                  displayName: true,
                },
              },
            },
          },
        },
      }),
    ]);

    return {
      data: accounts,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Atomic point transaction with balance locking.
   */
  static async recordTransaction(
    customerId: string,
    data: {
      transactionType: LoyaltyTransactionType;
      points: number; // positive or negative
      orderId?: string | null;
      reason?: string | null;
      referenceId?: string | null;
      createdByUserId?: string | null;
    },
    clientTx?: Prisma.TransactionClient
  ) {
    const runner = async (tx: Prisma.TransactionClient) => {
      // Ensure account exists with lock
      let account = await tx.loyaltyAccount.findUnique({
        where: { customerId },
      });

      if (!account) {
        account = await tx.loyaltyAccount.create({
          data: {
            customerId,
            pointsBalance: 0,
            lifetimeEarned: 0,
            lifetimeRedeemed: 0,
            tier: 'BRONZE',
          },
        });
      }

      // Pessimistic row-level lock on loyalty account for concurrency safety
      const lockedAccounts: any[] = await tx.$queryRaw`
        SELECT id, "points_balance" AS "pointsBalance", "tier", "lifetime_earned" AS "lifetimeEarned", "lifetime_redeemed" AS "lifetimeRedeemed"
        FROM "loyalty_accounts"
        WHERE "customer_id" = ${customerId}::uuid
        FOR UPDATE
      `;

      if (lockedAccounts && lockedAccounts.length > 0) {
        account = lockedAccounts[0];
      }

      if (!account) {
        throw new BadRequestException('Loyalty account could not be found or locked');
      }

      // Check balance sufficiency for debit (points < 0)
      const currentBalance = account.pointsBalance;
      const newBalance = currentBalance + data.points;

      if (newBalance < 0) {
        throw new BadRequestException(
          `Insufficient loyalty points. Current balance: ${currentBalance}, requested deduction: ${Math.abs(
            data.points
          )}`
        );
      }

      // Calculate lifetime earned/redeemed & tier update
      let lifetimeEarned = account.lifetimeEarned;
      let lifetimeRedeemed = account.lifetimeRedeemed;

      if (data.points > 0 && data.transactionType === LoyaltyTransactionType.EARN) {
        lifetimeEarned += data.points;
      } else if (data.points < 0 && data.transactionType === LoyaltyTransactionType.REDEEM) {
        lifetimeRedeemed += Math.abs(data.points);
      }

      // Auto tier progression
      let tier = account.tier;
      if (lifetimeEarned >= 10000) tier = 'PLATINUM';
      else if (lifetimeEarned >= 5000) tier = 'GOLD';
      else if (lifetimeEarned >= 1000) tier = 'SILVER';

      // Update account
      const updatedAccount = await tx.loyaltyAccount.update({
        where: { id: account.id },
        data: {
          pointsBalance: newBalance,
          lifetimeEarned,
          lifetimeRedeemed,
          tier,
        },
      });

      // Record immutable ledger entry
      const transaction = await tx.loyaltyTransaction.create({
        data: {
          accountId: account.id,
          orderId: data.orderId || null,
          transactionType: data.transactionType,
          points: data.points,
          balanceAfter: newBalance,
          reason: data.reason || null,
          referenceId: data.referenceId || null,
          createdByUserId: data.createdByUserId || null,
        },
      });

      return {
        account: updatedAccount,
        transaction,
      };
    };

    if (clientTx) {
      return runner(clientTx);
    } else {
      return prisma.$transaction(runner, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      });
    }
  }

  /**
   * Checks if an order has already earned loyalty points.
   */
  static async hasOrderEarnedPoints(orderId: string) {
    const existing = await prisma.loyaltyTransaction.findFirst({
      where: {
        orderId,
        transactionType: LoyaltyTransactionType.EARN,
      },
    });
    return existing != null;
  }
}
