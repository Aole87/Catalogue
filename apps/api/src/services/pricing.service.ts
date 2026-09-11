import { PriceTier, CustomerType } from '@prisma/client';
import { UserRepository } from '../repositories/user.repository';

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

export class PricingService {
  /**
   * Resolves the authoritative PriceTier for a user or customer profile.
   * Defaults to PriceTier.GENERAL for guests or unverified customers.
   */
  static async resolveUserTier(userOrId?: string | any): Promise<PriceTier> {
    if (!userOrId) {
      return PriceTier.GENERAL;
    }

    if (typeof userOrId === 'string') {
      const user = await UserRepository.findById(userOrId);
      if (!user || !user.customerProfile) {
        return PriceTier.GENERAL;
      }
      return this.mapCustomerTypeToTier(user.customerProfile.customerType);
    }

    if (userOrId.customerProfile?.customerType) {
      return this.mapCustomerTypeToTier(userOrId.customerProfile.customerType);
    }

    return PriceTier.GENERAL;
  }

  private static mapCustomerTypeToTier(type: CustomerType): PriceTier {
    switch (type) {
      case CustomerType.GARAGE:
        return PriceTier.GARAGE;
      case CustomerType.SHOP:
        return PriceTier.SHOP;
      case CustomerType.CUSTOMER:
      default:
        return PriceTier.GENERAL;
    }
  }

  /**
   * Extracts and resolves the authoritative active tier price for a product.
   */
  static resolveProductTierPrice(product: any, tier: PriceTier = PriceTier.GENERAL) {
    if (!product || !product.prices || product.prices.length === 0) {
      return null;
    }

    const tierPrice =
      product.prices.find((p: any) => p.tier === tier && p.isActive !== false) ||
      product.prices.find((p: any) => p.tier === PriceTier.GENERAL && p.isActive !== false) ||
      product.prices.find((p: any) => p.isActive !== false) ||
      product.prices[0];

    return tierPrice;
  }

  /**
   * Computes a single line item's financial values with 2-decimal precision.
   */
  static calculateLineItem(
    product: any,
    tier: PriceTier,
    quantity: number,
    vehicleVariantId?: string | null
  ): CalculatedLineItem {
    const tierPrice = this.resolveProductTierPrice(product, tier);
    const unitPriceNum = tierPrice ? Number(tierPrice.price) : 0;
    const compareAtPriceNum = tierPrice?.compareAtPrice ? Number(tierPrice.compareAtPrice) : null;
    const lineTotalNum = unitPriceNum * quantity;

    const primaryImage =
      product.images?.find((img: any) => img.isPrimary)?.url ||
      product.images?.[0]?.url ||
      null;

    return {
      productId: product.id,
      sku: product.sku,
      name: product.name,
      primaryImage,
      tier: tierPrice ? tierPrice.tier : PriceTier.GENERAL,
      unitPrice: unitPriceNum.toFixed(2),
      compareAtPrice: compareAtPriceNum !== null ? compareAtPriceNum.toFixed(2) : null,
      quantity,
      lineTotal: lineTotalNum.toFixed(2),
      vehicleVariantId: vehicleVariantId || null,
    };
  }

  /**
   * Calculates subtotal, tax, shipping, discounts, and grand totals for a list of line items.
   */
  static calculateTotals(
    lineItems: { lineTotal: string; quantity: number }[],
    tier: PriceTier = PriceTier.GENERAL,
    shippingFee: number = 0,
    discountAmount: number = 0
  ): CalculatedOrderTotals {
    const subtotalNum = lineItems.reduce((sum, item) => sum + Number(item.lineTotal), 0);
    const totalItems = lineItems.reduce((sum, item) => sum + item.quantity, 0);

    // Free shipping threshold for orders above 2,000 THB, otherwise default shipping fee
    const effectiveShippingNum = subtotalNum >= 2000 || subtotalNum === 0 ? 0 : shippingFee;
    const discountNum = Math.min(discountAmount, subtotalNum);
    const taxNum = 0.00; // Prices are gross/inclusive in standard storefront catalog
    const grandTotalNum = Math.max(0, subtotalNum - discountNum + effectiveShippingNum);

    return {
      subtotal: subtotalNum.toFixed(2),
      discountTotal: discountNum.toFixed(2),
      shippingTotal: effectiveShippingNum.toFixed(2),
      taxTotal: taxNum.toFixed(2),
      grandTotal: grandTotalNum.toFixed(2),
      totalItems,
      tier,
    };
  }
}
