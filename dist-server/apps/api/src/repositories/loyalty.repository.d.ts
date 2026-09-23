import { LoyaltyTransactionType, Prisma } from '@prisma/client';
export interface LoyaltyAccountQueryParams {
    search?: string;
    tier?: string;
    page?: number;
    limit?: number;
}
export declare class LoyaltyRepository {
    /**
     * Get or create loyalty account for customer.
     */
    static getOrCreateAccount(customerId: string): Promise<{
        customer: {
            user: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
                displayName: string | null;
            } | null;
        } & {
            id: string;
            phone: string | null;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            userId: string | null;
            notes: string | null;
            customerType: import(".prisma/client").$Enums.CustomerType;
            companyName: string | null;
            taxId: string | null;
            isVerified: boolean;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        customerId: string;
        pointsBalance: number;
        lifetimeEarned: number;
        lifetimeRedeemed: number;
        tier: string;
    }>;
    static findAccountByCustomerId(customerId: string): Promise<({
        customer: {
            user: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
                displayName: string | null;
            } | null;
        } & {
            id: string;
            phone: string | null;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            userId: string | null;
            notes: string | null;
            customerType: import(".prisma/client").$Enums.CustomerType;
            companyName: string | null;
            taxId: string | null;
            isVerified: boolean;
        };
        transactions: ({
            createdByUser: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
                displayName: string | null;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            orderId: string | null;
            reason: string | null;
            referenceId: string | null;
            createdByUserId: string | null;
            accountId: string;
            transactionType: import(".prisma/client").$Enums.LoyaltyTransactionType;
            points: number;
            balanceAfter: number;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        customerId: string;
        pointsBalance: number;
        lifetimeEarned: number;
        lifetimeRedeemed: number;
        tier: string;
    }) | null>;
    static listAccounts(params: LoyaltyAccountQueryParams): Promise<{
        data: ({
            customer: {
                user: {
                    id: string;
                    email: string;
                    firstName: string;
                    lastName: string;
                    displayName: string | null;
                } | null;
            } & {
                id: string;
                phone: string | null;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                userId: string | null;
                notes: string | null;
                customerType: import(".prisma/client").$Enums.CustomerType;
                companyName: string | null;
                taxId: string | null;
                isVerified: boolean;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
            pointsBalance: number;
            lifetimeEarned: number;
            lifetimeRedeemed: number;
            tier: string;
        })[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    /**
     * Atomic point transaction with balance locking.
     */
    static recordTransaction(customerId: string, data: {
        transactionType: LoyaltyTransactionType;
        points: number;
        orderId?: string | null;
        reason?: string | null;
        referenceId?: string | null;
        createdByUserId?: string | null;
    }, clientTx?: Prisma.TransactionClient): Promise<{
        account: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
            pointsBalance: number;
            lifetimeEarned: number;
            lifetimeRedeemed: number;
            tier: string;
        };
        transaction: {
            id: string;
            createdAt: Date;
            orderId: string | null;
            reason: string | null;
            referenceId: string | null;
            createdByUserId: string | null;
            accountId: string;
            transactionType: import(".prisma/client").$Enums.LoyaltyTransactionType;
            points: number;
            balanceAfter: number;
        };
    }>;
    /**
     * Checks if an order has already earned loyalty points.
     */
    static hasOrderEarnedPoints(orderId: string): Promise<boolean>;
}
