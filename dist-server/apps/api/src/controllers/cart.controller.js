"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartController = void 0;
const cart_service_1 = require("../services/cart.service");
const cart_schema_1 = require("../schemas/cart.schema");
const crypto_1 = require("crypto");
class CartController {
    static extractCartIdentity(request) {
        const userId = request.user?.id;
        let sessionToken = request.headers['x-session-token'] ||
            request.cookies?.cart_session_token ||
            undefined;
        let isNewSession = false;
        if (!userId && !sessionToken) {
            sessionToken = (0, crypto_1.randomUUID)();
            isNewSession = true;
        }
        return { userId, sessionToken, isNewSession };
    }
    static attachSessionTokenCookie(reply, sessionToken) {
        if (sessionToken) {
            reply.header('x-session-token', sessionToken);
            reply.setCookie('cart_session_token', sessionToken, {
                path: '/',
                httpOnly: true,
                sameSite: 'lax',
                maxAge: 30 * 24 * 60 * 60, // 30 days
            });
        }
    }
    // GET /api/v1/cart
    static async getCart(request, reply) {
        const { userId, sessionToken, isNewSession } = CartController.extractCartIdentity(request);
        const cart = await cart_service_1.CartService.getCart(userId, sessionToken);
        if (isNewSession || sessionToken) {
            CartController.attachSessionTokenCookie(reply, sessionToken);
        }
        return reply.status(200).send({ data: cart });
    }
    // POST /api/v1/cart/items
    static async addItem(request, reply) {
        const body = cart_schema_1.addCartItemSchema.parse(request.body);
        const { userId, sessionToken, isNewSession } = CartController.extractCartIdentity(request);
        const cart = await cart_service_1.CartService.addItem({
            userId,
            sessionToken,
            productId: body.productId,
            quantity: body.quantity,
            vehicleVariantId: body.vehicleVariantId,
        });
        if (isNewSession || sessionToken) {
            CartController.attachSessionTokenCookie(reply, sessionToken);
        }
        return reply.status(200).send({ data: cart, message: 'Item added to cart' });
    }
    // PATCH /api/v1/cart/items/:id
    static async updateItem(request, reply) {
        const body = cart_schema_1.updateCartItemSchema.parse(request.body);
        const { userId, sessionToken } = CartController.extractCartIdentity(request);
        const cart = await cart_service_1.CartService.updateQuantity({
            userId,
            sessionToken,
            itemId: request.params.id,
            quantity: body.quantity,
        });
        return reply.status(200).send({ data: cart, message: 'Cart item updated' });
    }
    // DELETE /api/v1/cart/items/:id
    static async removeItem(request, reply) {
        const { userId, sessionToken } = CartController.extractCartIdentity(request);
        const cart = await cart_service_1.CartService.removeItem({
            userId,
            sessionToken,
            itemId: request.params.id,
        });
        return reply.status(200).send({ data: cart, message: 'Item removed from cart' });
    }
    // DELETE /api/v1/cart
    static async clearCart(request, reply) {
        const { userId, sessionToken } = CartController.extractCartIdentity(request);
        const cart = await cart_service_1.CartService.clearCart(userId, sessionToken);
        return reply.status(200).send({ data: cart, message: 'Cart cleared' });
    }
    // POST /api/v1/cart/merge
    static async mergeCart(request, reply) {
        const body = cart_schema_1.mergeCartSchema.parse(request.body);
        const userId = request.user?.id;
        if (!userId) {
            return reply.status(401).send({ error: 'Unauthorized', message: 'User must be authenticated to merge cart' });
        }
        const cart = await cart_service_1.CartService.mergeCart(body.sessionToken, userId);
        return reply.status(200).send({ data: cart, message: 'Cart merged successfully' });
    }
}
exports.CartController = CartController;
//# sourceMappingURL=cart.controller.js.map