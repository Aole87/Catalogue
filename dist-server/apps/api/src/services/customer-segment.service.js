"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerSegmentService = void 0;
const database_1 = require("@car-parts/database");
const crm_repository_1 = require("../repositories/crm.repository");
class CustomerSegmentService {
    /**
     * Evaluates if a single customer satisfies all rules of a segment.
     */
    static evaluateCustomerAgainstRules(customer, rules) {
        if (!rules || rules.length === 0) {
            return { matches: true, reasons: ['No rules defined; default match'] };
        }
        const reasons = [];
        let allPassed = true;
        for (const rule of rules) {
            const field = rule.field.toLowerCase();
            const operator = rule.operator.toUpperCase();
            const expectedValue = rule.value;
            let actualValue;
            if (field === 'order_count' || field === 'orders' || field === 'total_orders') {
                actualValue = customer.metrics.orderCount;
            }
            else if (field === 'lifetime_value' || field === 'ltv') {
                actualValue = customer.metrics.lifetimeValue;
            }
            else if (field === 'days_since_last_order') {
                actualValue = customer.metrics.daysSinceLastOrder ?? 99999;
            }
            else if (field === 'customer_type') {
                actualValue = customer.customerType;
            }
            else {
                // Unknown field: default false
                actualValue = null;
            }
            const passed = this.compareValues(actualValue, operator, expectedValue);
            if (!passed) {
                allPassed = false;
                reasons.push(`Rule failed: ${rule.field} (${actualValue}) ${operator} ${expectedValue}`);
            }
            else {
                reasons.push(`Rule passed: ${rule.field} (${actualValue}) ${operator} ${expectedValue}`);
            }
        }
        return { matches: allPassed, reasons };
    }
    static compareValues(actual, operator, expectedStr) {
        if (actual === null || actual === undefined)
            return false;
        // Numeric comparison if actual is number or expectedStr is numeric
        if (typeof actual === 'number' || !isNaN(Number(expectedStr))) {
            const actualNum = Number(actual);
            const expectedNum = Number(expectedStr);
            switch (operator) {
                case 'EQUALS':
                    return actualNum === expectedNum;
                case 'NOT_EQUALS':
                    return actualNum !== expectedNum;
                case 'GREATER_THAN':
                    return actualNum > expectedNum;
                case 'GREATER_THAN_OR_EQUAL':
                    return actualNum >= expectedNum;
                case 'LESS_THAN':
                    return actualNum < expectedNum;
                case 'LESS_THAN_OR_EQUAL':
                    return actualNum <= expectedNum;
                default:
                    return false;
            }
        }
        // String comparison
        const actualStr = String(actual).toLowerCase();
        const expStr = expectedStr.toLowerCase();
        switch (operator) {
            case 'EQUALS':
                return actualStr === expStr;
            case 'NOT_EQUALS':
                return actualStr !== expStr;
            case 'CONTAINS':
                return actualStr.includes(expStr);
            default:
                return false;
        }
    }
    /**
     * Deterministically evaluates and synchronizes memberships for a segment across all customers.
     */
    static async evaluateSegment(segmentId) {
        const segment = await crm_repository_1.CrmRepository.findSegmentById(segmentId);
        if (!segment) {
            throw new Error(`Segment ${segmentId} not found`);
        }
        // Fetch all active customer profiles
        const customers = await database_1.prisma.customerProfile.findMany({
            where: { deletedAt: null },
        });
        const matchingCustomerIds = [];
        const evaluationResults = [];
        for (const c of customers) {
            const metrics = await crm_repository_1.CrmRepository.calculateCustomerMetrics(c.id);
            const customerWithMetrics = { ...c, metrics };
            const { matches, reasons } = this.evaluateCustomerAgainstRules(customerWithMetrics, segment.rules);
            evaluationResults.push({
                customerId: c.id,
                matches,
                reasons,
            });
            if (matches) {
                matchingCustomerIds.push(c.id);
            }
        }
        // Atomically synchronize memberships
        await crm_repository_1.CrmRepository.syncSegmentMembers(segmentId, matchingCustomerIds);
        return {
            segmentId,
            segmentName: segment.name,
            totalCustomersEvaluated: customers.length,
            matchingCount: matchingCustomerIds.length,
            matchingCustomerIds,
            evaluationResults,
        };
    }
    /**
     * Automatically re-evaluates all automatic segments for a specific customer upon order/lifecycle changes.
     */
    static async reevaluateCustomerSegments(customerId) {
        const autoSegments = await database_1.prisma.customerSegment.findMany({
            where: { deletedAt: null, isActive: true, isAutomatic: true },
            include: { rules: true },
        });
        const customer = await database_1.prisma.customerProfile.findUnique({
            where: { id: customerId },
        });
        if (!customer)
            return;
        const metrics = await crm_repository_1.CrmRepository.calculateCustomerMetrics(customerId);
        const customerWithMetrics = { ...customer, metrics };
        for (const segment of autoSegments) {
            const { matches } = this.evaluateCustomerAgainstRules(customerWithMetrics, segment.rules);
            if (matches) {
                await database_1.prisma.customerSegmentMembership.upsert({
                    where: { customerId_segmentId: { customerId, segmentId: segment.id } },
                    create: { customerId, segmentId: segment.id },
                    update: {},
                });
            }
            else {
                await database_1.prisma.customerSegmentMembership.deleteMany({
                    where: { customerId, segmentId: segment.id },
                });
            }
        }
    }
}
exports.CustomerSegmentService = CustomerSegmentService;
//# sourceMappingURL=customer-segment.service.js.map