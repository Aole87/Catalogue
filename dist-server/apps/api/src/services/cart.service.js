"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartService = void 0;
const cart_repository_1 = require("../repositories/cart.repository");
const product_repository_1 = require("../repositories/product.repository");
const pricing_service_1 = require("./pricing.service");
const fitment_service_1 = require("./fitment.service");
const app_error_1 = require("../errors/app-error");
const client_1 = require("@prisma/client");
class CartService {
    /**
     * Helper to retrieve or lazily create an active cart.
     */
    static async getOrCreateCart(userId, sessionToken) {
        if (!userId && !sessionToken) {
            throw new app_error_1.BadRequestException('Either userId or sessionToken is required to access a cart');
        }
        let cart = await cart_repository_1.CartRepository.findActiveCart({ userId, sessionToken });
        if (!cart) {
            cart = await cart_repository_1.CartRepository.createCart({ userId, sessionToken });
        }
        return cart;
    }
    /**
     * Formats and enriches a cart with server-authoritative calculations.
     */
    static async formatCartResponse(cart, userTier = client_1.PriceTier.GENERAL) {
        if (!cart) {
            return {
                id: null,
                items: [],
                totals: pricing_service_1.PricingService.calculateTotals([], userTier),
            };
        }
        const formattedItems = await Promise.all((cart.items || []).map(async (item) => {
            const lineCalc = pricing_service_1.PricingService.calculateLineItem(item.product, userTier, item.quantity, item.vehicleVariantId);
            // Check fitment compatibility if vehicle context is saved with this item
            let fitmentStatus = null;
            if (item.vehicleVariantId && item.vehicleVariant) {
                const v = item.vehicleVariant;
                const makeName = v.generation?.model?.make?.name || '';
                const modelName = v.generation?.model?.name || '';
                const genName = v.generation?.name || '';
                const engineName = v.engine?.name ? ` ${v.engine.name}` : '';
                const variantName = v.name ? ` ${v.name}` : '';
                const vehicleDisplayName = `${makeName} ${modelName} ${genName}${engineName}${variantName}`.trim();
                try {
                    const fitmentCheck = await fitment_service_1.FitmentService.checkProductFitment(item.productId, item.vehicleVariantId);
                    fitmentStatus = {
                        compatible: fitmentCheck.compatible,
                        reasonCode: fitmentCheck.reason,
                        vehicleName: vehicleDisplayName,
                    };
                }
                catch {
                    fitmentStatus = {
                        compatible: false,
                        reasonCode: 'INVALID_VEHICLE',
                        vehicleName: vehicleDisplayName,
                    };
                }
            }
            return {
                id: item.id,
                cartId: item.cartId,
                productId: item.productId,
                productName: item.product?.name || lineCalc.name,
                sku: item.product?.sku || lineCalc.sku,
                brandName: item.product?.brand?.name || null,
                categoryName: item.product?.category?.name || null,
                primaryImage: lineCalc.primaryImage,
                tier: lineCalc.tier,
                unitPrice: lineCalc.unitPrice,
                compareAtPrice: lineCalc.compareAtPrice,
                quantity: item.quantity,
                lineTotal: lineCalc.lineTotal,
                vehicleVariantId: item.vehicleVariantId || null,
                vehicleVariant: item.vehicleVariant || null,
                fitmentStatus,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
            };
        }));
        const totals = pricing_service_1.PricingService.calculateTotals(formattedItems.map((i) => ({ lineTotal: i.lineTotal, quantity: i.quantity })), userTier);
        return {
            id: cart.id,
            userId: cart.userId,
            sessionToken: cart.sessionToken,
            expiresAt: cart.expiresAt,
            items: formattedItems,
            totals,
        };
    }
    /**
     * Retrieves the current cart for a user or guest.
     */
    static async getCart(userId, sessionToken) {
        const userTier = await pricing_service_1.PricingService.resolveUserTier(userId);
        const cart = await this.getOrCreateCart(userId, sessionToken);
        return this.formatCartResponse(cart, userTier);
    }
    /**
     * Adds an item to the cart.
     */
    static async addItem(params) {
        const { userId, sessionToken, productId, quantity, vehicleVariantId } = params;
        if (!quantity || quantity < 1) {
            throw new app_error_1.BadRequestException('Quantity must be at least 1');
        }
        // Verify product exists and is active
        const product = await product_repository_1.ProductRepository.findById(productId);
        if (!product || !product.isActive || product.deletedAt) {
            throw new app_error_1.NotFoundException('Product not found or inactive');
        }
        const cart = await this.getOrCreateCart(userId, sessionToken);
        await cart_repository_1.CartRepository.addItem({
            cartId: cart.id,
            productId,
            quantity,
            vehicleVariantId: vehicleVariantId || null,
        });
        const userTier = await pricing_service_1.PricingService.resolveUserTier(userId);
        const updatedCart = await cart_repository_1.CartRepository.findById(cart.id);
        return this.formatCartResponse(updatedCart, userTier);
    }
    /**
     * Updates the quantity of an item in the cart.
     */
    static async updateQuantity(params) {
        const { userId, sessionToken, itemId, quantity } = params;
        const item = await cart_repository_1.CartRepository.findItemById(itemId);
        if (!item) {
            throw new app_error_1.NotFoundException('Cart item not found');
        }
        // Verify item belongs to the active cart
        const cart = await cart_repository_1.CartRepository.findById(item.cartId);
        if (!cart) {
            throw new app_error_1.NotFoundException('Cart not found');
        }
        if (userId && cart.userId !== userId) {
            throw new app_error_1.ForbiddenException('You do not have permission to modify this cart item');
        }
        else if (!userId && sessionToken && cart.sessionToken !== sessionToken) {
            throw new app_error_1.ForbiddenException('Invalid session for this cart item');
        }
        await cart_repository_1.CartRepository.updateItemQuantity(itemId, quantity);
        const userTier = await pricing_service_1.PricingService.resolveUserTier(userId);
        const updatedCart = await cart_repository_1.CartRepository.findById(cart.id);
        return this.formatCartResponse(updatedCart, userTier);
    }
    /**
     * Removes an item from the cart.
     */
    static async removeItem(params) {
        const { userId, sessionToken, itemId } = params;
        const item = await cart_repository_1.CartRepository.findItemById(itemId);
        if (!item) {
            throw new app_error_1.NotFoundException('Cart item not found');
        }
        const cart = await cart_repository_1.CartRepository.findById(item.cartId);
        if (!cart) {
            throw new app_error_1.NotFoundException('Cart not found');
        }
        if (userId && cart.userId !== userId) {
            throw new app_error_1.ForbiddenException('You do not have permission to modify this cart item');
        }
        else if (!userId && sessionToken && cart.sessionToken !== sessionToken) {
            throw new app_error_1.ForbiddenException('Invalid session for this cart item');
        }
        await cart_repository_1.CartRepository.removeItem(itemId);
        const userTier = await pricing_service_1.PricingService.resolveUserTier(userId);
        const updatedCart = await cart_repository_1.CartRepository.findById(cart.id);
        return this.formatCartResponse(updatedCart, userTier);
    }
    /**
     * Clears all items from the cart.
     */
    static async clearCart(userId, sessionToken) {
        const cart = await cart_repository_1.CartRepository.findActiveCart({ userId, sessionToken });
        if (cart) {
            await cart_repository_1.CartRepository.clearCart(cart.id);
        }
        const userTier = await pricing_service_1.PricingService.resolveUserTier(userId);
        return {
            id: cart?.id || null,
            items: [],
            totals: pricing_service_1.PricingService.calculateTotals([], userTier),
        };
    }
    /**
     * Merges guest cart items into authenticated user cart upon login.
     */
    static async mergeCart(sessionToken, userId) {
        if (!sessionToken || !userId)
            return null;
        await cart_repository_1.CartRepository.mergeGuestCart(sessionToken, userId);
        return this.getCart(userId);
    }
}
exports.CartService = CartService;
//# sourceMappingURL=cart.service.js.map