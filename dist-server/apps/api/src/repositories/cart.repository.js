"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartRepository = void 0;
const database_1 = require("@car-parts/database");
class CartRepository {
    static cartItemIncludes = {
        product: {
            include: {
                prices: {
                    where: { isActive: true },
                },
                images: {
                    orderBy: [
                        { isPrimary: 'desc' },
                        { sortOrder: 'asc' },
                    ],
                },
                brand: true,
                category: true,
            },
        },
        vehicleVariant: {
            include: {
                generation: {
                    include: {
                        model: {
                            include: {
                                make: true,
                            },
                        },
                    },
                },
                engine: true,
            },
        },
    };
    /**
     * Finds an active cart by userId or sessionToken.
     */
    static async findActiveCart(params) {
        if (!params.userId && !params.sessionToken) {
            return null;
        }
        const whereClause = {
            expiresAt: { gt: new Date() },
        };
        if (params.userId) {
            whereClause.userId = params.userId;
        }
        else if (params.sessionToken) {
            whereClause.sessionToken = params.sessionToken;
        }
        return database_1.prisma.cart.findFirst({
            where: whereClause,
            include: {
                items: {
                    include: this.cartItemIncludes,
                    orderBy: { createdAt: 'asc' },
                },
            },
        });
    }
    /**
     * Finds a cart by its primary ID.
     */
    static async findById(id) {
        return database_1.prisma.cart.findUnique({
            where: { id },
            include: {
                items: {
                    include: this.cartItemIncludes,
                    orderBy: { createdAt: 'asc' },
                },
            },
        });
    }
    /**
     * Creates a new cart for a user or guest session token.
     */
    static async createCart(params) {
        const days = params.daysToExpire || 30;
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + days);
        return database_1.prisma.cart.create({
            data: {
                userId: params.userId || null,
                sessionToken: params.sessionToken || null,
                expiresAt,
            },
            include: {
                items: {
                    include: this.cartItemIncludes,
                },
            },
        });
    }
    /**
     * Finds an existing cart item by ID.
     */
    static async findItemById(itemId) {
        return database_1.prisma.cartItem.findUnique({
            where: { id: itemId },
            include: this.cartItemIncludes,
        });
    }
    /**
     * Adds or increments an item in a cart.
     */
    static async addItem(params) {
        const { cartId, productId, quantity, vehicleVariantId = null } = params;
        const existingItem = await database_1.prisma.cartItem.findFirst({
            where: {
                cartId,
                productId,
                vehicleVariantId: vehicleVariantId || null,
            },
        });
        if (existingItem) {
            return database_1.prisma.cartItem.update({
                where: { id: existingItem.id },
                data: {
                    quantity: existingItem.quantity + quantity,
                },
                include: this.cartItemIncludes,
            });
        }
        return database_1.prisma.cartItem.create({
            data: {
                cartId,
                productId,
                quantity: Math.max(1, quantity),
                vehicleVariantId: vehicleVariantId || null,
            },
            include: this.cartItemIncludes,
        });
    }
    /**
     * Updates the quantity of an item. Removes it if quantity <= 0.
     */
    static async updateItemQuantity(itemId, quantity) {
        if (quantity <= 0) {
            await database_1.prisma.cartItem.delete({
                where: { id: itemId },
            });
            return null;
        }
        return database_1.prisma.cartItem.update({
            where: { id: itemId },
            data: { quantity },
            include: this.cartItemIncludes,
        });
    }
    /**
     * Removes a single item from the cart.
     */
    static async removeItem(itemId) {
        return database_1.prisma.cartItem.delete({
            where: { id: itemId },
        });
    }
    /**
     * Clears all items from the cart.
     */
    static async clearCart(cartId) {
        return database_1.prisma.cartItem.deleteMany({
            where: { cartId },
        });
    }
    /**
     * Merges guest cart items into an authenticated user's cart.
     */
    static async mergeGuestCart(sessionToken, userId) {
        return database_1.prisma.$transaction(async (tx) => {
            const guestCart = await tx.cart.findFirst({
                where: { sessionToken, expiresAt: { gt: new Date() } },
                include: { items: true },
            });
            if (!guestCart || guestCart.items.length === 0) {
                return;
            }
            let userCart = await tx.cart.findFirst({
                where: { userId, expiresAt: { gt: new Date() } },
            });
            if (!userCart) {
                const expiresAt = new Date();
                expiresAt.setDate(expiresAt.getDate() + 30);
                userCart = await tx.cart.create({
                    data: { userId, expiresAt },
                });
            }
            for (const item of guestCart.items) {
                const existingUserItem = await tx.cartItem.findFirst({
                    where: {
                        cartId: userCart.id,
                        productId: item.productId,
                        vehicleVariantId: item.vehicleVariantId,
                    },
                });
                if (existingUserItem) {
                    await tx.cartItem.update({
                        where: { id: existingUserItem.id },
                        data: { quantity: existingUserItem.quantity + item.quantity },
                    });
                }
                else {
                    await tx.cartItem.create({
                        data: {
                            cartId: userCart.id,
                            productId: item.productId,
                            quantity: item.quantity,
                            vehicleVariantId: item.vehicleVariantId,
                        },
                    });
                }
            }
            // Delete the guest cart
            await tx.cart.delete({
                where: { id: guestCart.id },
            });
        });
    }
}
exports.CartRepository = CartRepository;
//# sourceMappingURL=cart.repository.js.map