import { PriceTier } from '@prisma/client';
export interface CalculatedLineItem {
    productId: string;
    sku: string;
    name: string;
    primaryImage: string | null;
    tier: PriceTier;
    unitPrice: string;
    compareAtPrice: string | null;
    quantity: number;
    lineTotal: string;
    vehicleVariantId?: string | null;
}
export interface CalculatedOrderTotals {
    subtotal: string;
    discountTotal: string;
    shippingTotal: string;
    taxTotal: string;
    grandTotal: string;
    totalItems: number;
    tier: PriceTier;
}
export declare class PricingService {
    /**
     * Resolves the authoritative PriceTier for a user or customer profile.
     * Defaults to PriceTier.GENERAL for guests or unverified customers.
     */
    static resolveUserTier(userOrId?: string | any): Promise<PriceTier>;
    private static mapCustomerTypeToTier;
    /**
     * Extracts and resolves the authoritative active tier price for a product.
     */
    static resolveProductTierPrice(product: any, tier?: PriceTier): any;
    /**
     * Computes a single line item's financial values with 2-decimal precision.
     */
    static calculateLineItem(product: any, tier: PriceTier, quantity: number, vehicleVariantId?: string | null): CalculatedLineItem;
    /**
     * Calculates subtotal, tax, shipping, discounts, and grand totals for a list of line items.
     */
    static calculateTotals(lineItems: {
        lineTotal: string;
        quantity: number;
    }[], tier?: PriceTier, shippingFee?: number, discountAmount?: number): CalculatedOrderTotals;
}
