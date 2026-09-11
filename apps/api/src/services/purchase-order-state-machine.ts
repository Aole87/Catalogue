import { PurchaseOrderStatus } from '@car-parts/database';
import { BadRequestException } from '../errors/app-error';

export class PurchaseOrderStateMachine {
  private static readonly LEGAL_TRANSITIONS: Record<PurchaseOrderStatus, PurchaseOrderStatus[]> = {
    [PurchaseOrderStatus.DRAFT]: [
      PurchaseOrderStatus.PENDING_APPROVAL,
      PurchaseOrderStatus.CANCELLED,
    ],
    [PurchaseOrderStatus.PENDING_APPROVAL]: [
      PurchaseOrderStatus.APPROVED,
      PurchaseOrderStatus.REJECTED,
      PurchaseOrderStatus.CANCELLED,
    ],
    [PurchaseOrderStatus.APPROVED]: [
      PurchaseOrderStatus.SENT,
      PurchaseOrderStatus.CANCELLED,
    ],
    [PurchaseOrderStatus.REJECTED]: [
      PurchaseOrderStatus.DRAFT, // Can revise back to DRAFT for resubmission
      PurchaseOrderStatus.CANCELLED,
    ],
    [PurchaseOrderStatus.SENT]: [
      PurchaseOrderStatus.PARTIALLY_RECEIVED,
      PurchaseOrderStatus.RECEIVED,
      PurchaseOrderStatus.CANCELLED,
    ],
    [PurchaseOrderStatus.PARTIALLY_RECEIVED]: [
      PurchaseOrderStatus.PARTIALLY_RECEIVED,
      PurchaseOrderStatus.RECEIVED,
      PurchaseOrderStatus.CLOSED,
      PurchaseOrderStatus.CANCELLED,
    ],
    [PurchaseOrderStatus.RECEIVED]: [
      PurchaseOrderStatus.CLOSED,
    ],
    [PurchaseOrderStatus.CANCELLED]: [],
    [PurchaseOrderStatus.CLOSED]: [],
  };

  /**
   * Checks if a transition from currentStatus to nextStatus is legally permitted.
   */
  static canTransition(currentStatus: PurchaseOrderStatus, nextStatus: PurchaseOrderStatus): boolean {
    const allowed = this.LEGAL_TRANSITIONS[currentStatus] || [];
    return allowed.includes(nextStatus);
  }

  /**
   * Asserts that a transition from currentStatus to nextStatus is legal, throwing BadRequestException if invalid.
   */
  static assertValidTransition(currentStatus: PurchaseOrderStatus, nextStatus: PurchaseOrderStatus, poNumber?: string) {
    if (!this.canTransition(currentStatus, nextStatus)) {
      throw new BadRequestException(
        `Invalid Purchase Order status transition: Cannot transition PO '${poNumber || 'N/A'}' from '${currentStatus}' to '${nextStatus}'. Legal target statuses are: [${(this.LEGAL_TRANSITIONS[currentStatus] || []).join(', ')}]`
      );
    }
  }

  /**
   * Determines if PO details and items can be edited.
   */
  static isEditable(status: PurchaseOrderStatus): boolean {
    return status === PurchaseOrderStatus.DRAFT;
  }

  /**
   * Determines if PO can accept receiving of goods.
   */
  static isReceivable(status: PurchaseOrderStatus): boolean {
    return status === PurchaseOrderStatus.SENT || status === PurchaseOrderStatus.PARTIALLY_RECEIVED;
  }
}
