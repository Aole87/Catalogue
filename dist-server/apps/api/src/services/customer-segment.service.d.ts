import { CustomerSegmentRule, CustomerProfile } from '@prisma/client';
export interface EvaluatedCustomer {
    customerId: string;
    matches: boolean;
    reasons: string[];
}
export declare class CustomerSegmentService {
    /**
     * Evaluates if a single customer satisfies all rules of a segment.
     */
    static evaluateCustomerAgainstRules(customer: CustomerProfile & {
        metrics: any;
    }, rules: CustomerSegmentRule[]): {
        matches: boolean;
        reasons: string[];
    };
    private static compareValues;
    /**
     * Deterministically evaluates and synchronizes memberships for a segment across all customers.
     */
    static evaluateSegment(segmentId: string): Promise<{
        segmentId: string;
        segmentName: string;
        totalCustomersEvaluated: number;
        matchingCount: number;
        matchingCustomerIds: string[];
        evaluationResults: EvaluatedCustomer[];
    }>;
    /**
     * Automatically re-evaluates all automatic segments for a specific customer upon order/lifecycle changes.
     */
    static reevaluateCustomerSegments(customerId: string): Promise<void>;
}
