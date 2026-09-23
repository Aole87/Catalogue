import { CustomerType, Prisma } from '@prisma/client';
export interface CustomerQueryParams {
    search?: string;
    customerType?: CustomerType;
    segmentId?: string;
    tagId?: string;
    page?: number;
    limit?: number;
    sortBy?: 'createdAt' | 'lifetimeValue' | 'orderCount' | 'lastOrderDate';
    sortOrder?: 'asc' | 'desc';
}
export declare class CrmRepository {
    /**
     * Finds customer profile with user details, tags, segments, loyalty, and calculated metrics.
     */
    static findCustomerById(id: string): Promise<{
        metrics: {
            orderCount: number;
            lifetimeValue: number;
            lastOrderDate: Date;
            daysSinceLastOrder: number | null;
        };
        user: {
            id: string;
            email: string;
            phone: string | null;
            firstName: string;
            lastName: string;
            displayName: string | null;
            isActive: boolean;
            lastLoginAt: Date | null;
            createdAt: Date;
        } | null;
        loyaltyAccount: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
            pointsBalance: number;
            lifetimeEarned: number;
            lifetimeRedeemed: number;
            tier: string;
        } | null;
        addresses: {
            id: string;
            phone: string;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
            label: string;
            recipientName: string;
            addressLine1: string;
            addressLine2: string | null;
            subdistrict: string;
            district: string;
            province: string;
            postalCode: string;
            country: string;
            isDefault: boolean;
        }[];
        orders: {
            id: string;
            createdAt: Date;
            status: import(".prisma/client").$Enums.OrderStatus;
            grandTotal: Prisma.Decimal;
            orderNumber: string;
        }[];
        tagAssignments: ({
            tag: {
                description: string | null;
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                color: string;
            };
        } & {
            id: string;
            createdAt: Date;
            customerId: string;
            tagId: string;
        })[];
        segmentMemberships: ({
            segment: {
                description: string | null;
                name: string;
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                code: string;
                isAutomatic: boolean;
            };
        } & {
            id: string;
            customerId: string;
            segmentId: string;
            assignedAt: Date;
        })[];
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
    } | null>;
    /**
     * Finds customer profile by user ID.
     */
    static findCustomerByUserId(userId: string): Promise<({
        user: {
            id: string;
            email: string;
            phone: string | null;
            firstName: string;
            lastName: string;
            displayName: string | null;
        } | null;
        loyaltyAccount: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
            pointsBalance: number;
            lifetimeEarned: number;
            lifetimeRedeemed: number;
            tier: string;
        } | null;
        addresses: {
            id: string;
            phone: string;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
            label: string;
            recipientName: string;
            addressLine1: string;
            addressLine2: string | null;
            subdistrict: string;
            district: string;
            province: string;
            postalCode: string;
            country: string;
            isDefault: boolean;
        }[];
        tagAssignments: ({
            tag: {
                description: string | null;
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                color: string;
            };
        } & {
            id: string;
            createdAt: Date;
            customerId: string;
            tagId: string;
        })[];
        segmentMemberships: ({
            segment: {
                description: string | null;
                name: string;
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                code: string;
                isAutomatic: boolean;
            };
        } & {
            id: string;
            customerId: string;
            segmentId: string;
            assignedAt: Date;
        })[];
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
    }) | null>;
    /**
     * Calculates lifetime value, total orders, last order date, and days since last order.
     */
    static calculateCustomerMetrics(customerId: string): Promise<{
        orderCount: number;
        lifetimeValue: number;
        lastOrderDate: Date;
        daysSinceLastOrder: number | null;
    }>;
    /**
     * Query customers with pagination, search, segment, and tag filters.
     */
    static queryCustomers(params: CustomerQueryParams): Promise<{
        data: {
            metrics: {
                orderCount: number;
                lifetimeValue: number;
                lastOrderDate: Date;
                daysSinceLastOrder: number | null;
            };
            user: {
                id: string;
                email: string;
                phone: string | null;
                firstName: string;
                lastName: string;
                displayName: string | null;
                isActive: boolean;
            } | null;
            loyaltyAccount: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                customerId: string;
                pointsBalance: number;
                lifetimeEarned: number;
                lifetimeRedeemed: number;
                tier: string;
            } | null;
            tagAssignments: ({
                tag: {
                    description: string | null;
                    name: string;
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    color: string;
                };
            } & {
                id: string;
                createdAt: Date;
                customerId: string;
                tagId: string;
            })[];
            segmentMemberships: ({
                segment: {
                    description: string | null;
                    name: string;
                    id: string;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    deletedAt: Date | null;
                    code: string;
                    isAutomatic: boolean;
                };
            } & {
                id: string;
                customerId: string;
                segmentId: string;
                assignedAt: Date;
            })[];
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
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    /**
     * Update customer profile and linked user.
     */
    static updateCustomerProfile(id: string, data: {
        customerType?: CustomerType;
        companyName?: string | null;
        taxId?: string | null;
        phone?: string | null;
        notes?: string | null;
        isActive?: boolean;
        firstName?: string;
        lastName?: string;
        email?: string;
    }): Promise<({
        user: {
            id: string;
            email: string;
            phone: string | null;
            firstName: string;
            lastName: string;
            displayName: string | null;
            isActive: boolean;
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
    }) | null>;
    /**
     * Soft-delete customer profile and linked user.
     */
    static deleteCustomer(id: string): Promise<{
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
    } | null>;
    /**
     * Tags CRUD & Assignments
     */
    static listTags(): Promise<({
        _count: {
            assignments: number;
        };
    } & {
        description: string | null;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        color: string;
    })[]>;
    static createTag(name: string, color?: string, description?: string): Promise<{
        description: string | null;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        color: string;
    }>;
    static assignTag(customerId: string, tagId: string): Promise<{
        id: string;
        createdAt: Date;
        customerId: string;
        tagId: string;
    }>;
    static removeTag(customerId: string, tagId: string): Promise<Prisma.BatchPayload>;
    /**
     * Segments & Rules CRUD
     */
    static listSegments(): Promise<({
        _count: {
            memberships: number;
        };
        rules: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            segmentId: string;
            value: string;
            field: string;
            operator: string;
        }[];
    } & {
        description: string | null;
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        code: string;
        isAutomatic: boolean;
    })[]>;
    static findSegmentById(id: string): Promise<({
        rules: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            segmentId: string;
            value: string;
            field: string;
            operator: string;
        }[];
        memberships: ({
            customer: {
                user: {
                    id: string;
                    email: string;
                    firstName: string;
                    lastName: string;
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
            customerId: string;
            segmentId: string;
            assignedAt: Date;
        })[];
    } & {
        description: string | null;
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        code: string;
        isAutomatic: boolean;
    }) | null>;
    static createSegment(data: {
        name: string;
        code: string;
        description?: string | null;
        isActive?: boolean;
        isAutomatic?: boolean;
        rules?: {
            field: string;
            operator: string;
            value: string;
        }[];
    }): Promise<{
        rules: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            segmentId: string;
            value: string;
            field: string;
            operator: string;
        }[];
    } & {
        description: string | null;
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        code: string;
        isAutomatic: boolean;
    }>;
    static updateSegment(id: string, data: {
        name?: string;
        description?: string | null;
        isActive?: boolean;
        isAutomatic?: boolean;
        rules?: {
            field: string;
            operator: string;
            value: string;
        }[];
    }): Promise<{
        rules: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            segmentId: string;
            value: string;
            field: string;
            operator: string;
        }[];
    } & {
        description: string | null;
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        code: string;
        isAutomatic: boolean;
    }>;
    static deleteSegment(id: string): Promise<{
        description: string | null;
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        code: string;
        isAutomatic: boolean;
    }>;
    static syncSegmentMembers(segmentId: string, customerIds: string[]): Promise<void>;
}
