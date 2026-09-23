"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PricingService = void 0;
const client_1 = require("@prisma/client");
const user_repository_1 = require("../repositories/user.repository");
class PricingService {
    /**
     * Resolves the authoritative PriceTier for a user or customer profile.
     * Defaults to PriceTier.GENERAL for guests or unverified customers.
     */
    static async resolveUserTier(userOrId) {
        if (!userOrId) {
            return client_1.PriceTier.GENERAL;
        }
        if (typeof userOrId === 'string') {
            const user = await user_repository_1.UserRepository.findById(userOrId);
            if (!user || !user.customerProfile) {
                return client_1.PriceTier.GENERAL;
            }
            return this.mapCustomerTypeToTier(user.customerProfile.customerType);
        }
        if (userOrId.customerProfile?.customerType) {
            return this.mapCustomerTypeToTier(userOrId.customerProfile.customerType);
        }
        return client_1.PriceTier.GENERAL;
    }
    static mapCustomerTypeToTier(type) {
        switch (type) {
            case client_1.CustomerType.GARAGE:
                return client_1.PriceTier.GARAGE;
            case client_1.CustomerType.SHOP:
                return client_1.PriceTier.SHOP;
            case client_1.CustomerType.CUSTOMER:
            default:
                return client_1.PriceTier.GENERAL;
        }
    }
    /**
     * Extracts and resolves the authoritative active tier price for a product.
     */
    static resolveProductTierPrice(product, tier = client_1.PriceTier.GENERAL) {
        if (!product || !product.prices || product.prices.length === 0) {
            return null;
        }
        const tierPrice = product.prices.find((p) => p.tier === tier && p.isActive !== false) ||
            product.prices.find((p) => p.tier === client_1.PriceTier.GENERAL && p.isActive !== false) ||
            product.prices.find((p) => p.isActive !== false) ||
            product.prices[0];
        return tierPrice;
    }
    /**
     * Computes a single line item's financial values with 2-decimal precision.
     */
    static calculateLineItem(product, tier, quantity, vehicleVariantId) {
        const tierPrice = this.resolveProductTierPrice(product, tier);
        const unitPriceNum = tierPrice ? Number(tierPrice.price) : 0;
        const compareAtPriceNum = tierPrice?.compareAtPrice ? Number(tierPrice.compareAtPrice) : null;
        const lineTotalNum = unitPriceNum * quantity;
        const primaryImage = product.images?.find((img) => img.isPrimary)?.url ||
            product.images?.[0]?.url ||
            null;
        return {
            productId: product.id,
            sku: product.sku,
            name: product.name,
            primaryImage,
            tier: tierPrice ? tierPrice.tier : client_1.PriceTier.GENERAL,
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
    static calculateTotals(lineItems, tier = client_1.PriceTier.GENERAL, shippingFee = 0, discountAmount = 0) {
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
exports.PricingService = PricingService;
//# sourceMappingURL=pricing.service.js.map