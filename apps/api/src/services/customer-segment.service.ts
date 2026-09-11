import { prisma } from '@car-parts/database';
import { CrmRepository } from '../repositories/crm.repository';
import { CustomerSegmentRule, CustomerProfile } from '@prisma/client';

export interface EvaluatedCustomer {
  customerId: string;
  matches: boolean;
  reasons: string[];
}

export class CustomerSegmentService {
  /**
   * Evaluates if a single customer satisfies all rules of a segment.
   */
  static evaluateCustomerAgainstRules(
    customer: CustomerProfile & { metrics: any },
    rules: CustomerSegmentRule[]
  ): { matches: boolean; reasons: string[] } {
    if (!rules || rules.length === 0) {
      return { matches: true, reasons: ['No rules defined; default match'] };
    }

    const reasons: string[] = [];
    let allPassed = true;

    for (const rule of rules) {
      const field = rule.field.toLowerCase();
      const operator = rule.operator.toUpperCase();
      const expectedValue = rule.value;

      let actualValue: any;

      if (field === 'order_count' || field === 'orders' || field === 'total_orders') {
        actualValue = customer.metrics.orderCount;
      } else if (field === 'lifetime_value' || field === 'ltv') {
        actualValue = customer.metrics.lifetimeValue;
      } else if (field === 'days_since_last_order') {
        actualValue = customer.metrics.daysSinceLastOrder ?? 99999;
      } else if (field === 'customer_type') {
        actualValue = customer.customerType;
      } else {
        // Unknown field: default false
        actualValue = null;
      }

      const passed = this.compareValues(actualValue, operator, expectedValue);

      if (!passed) {
        allPassed = false;
        reasons.push(
          `Rule failed: ${rule.field} (${actualValue}) ${operator} ${expectedValue}`
        );
      } else {
        reasons.push(
          `Rule passed: ${rule.field} (${actualValue}) ${operator} ${expectedValue}`
        );
      }
    }

    return { matches: allPassed, reasons };
  }

  private static compareValues(actual: any, operator: string, expectedStr: string): boolean {
    if (actual === null || actual === undefined) return false;

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
  static async evaluateSegment(segmentId: string) {
    const segment = await CrmRepository.findSegmentById(segmentId);
    if (!segment) {
      throw new Error(`Segment ${segmentId} not found`);
    }

    // Fetch all active customer profiles
    const customers = await prisma.customerProfile.findMany({
      where: { deletedAt: null },
    });

    const matchingCustomerIds: string[] = [];
    const evaluationResults: EvaluatedCustomer[] = [];

    for (const c of customers) {
      const metrics = await CrmRepository.calculateCustomerMetrics(c.id);
      const customerWithMetrics = { ...c, metrics };

      const { matches, reasons } = this.evaluateCustomerAgainstRules(
        customerWithMetrics,
        segment.rules
      );

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
    await CrmRepository.syncSegmentMembers(segmentId, matchingCustomerIds);

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
  static async reevaluateCustomerSegments(customerId: string) {
    const autoSegments = await prisma.customerSegment.findMany({
      where: { deletedAt: null, isActive: true, isAutomatic: true },
      include: { rules: true },
    });

    const customer = await prisma.customerProfile.findUnique({
      where: { id: customerId },
    });
    if (!customer) return;

    const metrics = await CrmRepository.calculateCustomerMetrics(customerId);
    const customerWithMetrics = { ...customer, metrics };

    for (const segment of autoSegments) {
      const { matches } = this.evaluateCustomerAgainstRules(
        customerWithMetrics,
        segment.rules
      );

      if (matches) {
        await prisma.customerSegmentMembership.upsert({
          where: { customerId_segmentId: { customerId, segmentId: segment.id } },
          create: { customerId, segmentId: segment.id },
          update: {},
        });
      } else {
        await prisma.customerSegmentMembership.deleteMany({
          where: { customerId, segmentId: segment.id },
        });
      }
    }
  }
}
