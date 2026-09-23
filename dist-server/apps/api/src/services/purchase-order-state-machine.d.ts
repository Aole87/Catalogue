import { PurchaseOrderStatus } from '@car-parts/database';
export declare class PurchaseOrderStateMachine {
    private static readonly LEGAL_TRANSITIONS;
    /**
     * Checks if a transition from currentStatus to nextStatus is legally permitted.
     */
    static canTransition(currentStatus: PurchaseOrderStatus, nextStatus: PurchaseOrderStatus): boolean;
    /**
     * Asserts that a transition from currentStatus to nextStatus is legal, throwing BadRequestException if invalid.
     */
    static assertValidTransition(currentStatus: PurchaseOrderStatus, nextStatus: PurchaseOrderStatus, poNumber?: string): void;
    /**
     * Determines if PO details and items can be edited.
     */
    static isEditable(status: PurchaseOrderStatus): boolean;
    /**
     * Determines if PO can accept receiving of goods.
     */
    static isReceivable(status: PurchaseOrderStatus): boolean;
}
