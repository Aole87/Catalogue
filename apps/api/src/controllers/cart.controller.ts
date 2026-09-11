import { FastifyRequest, FastifyReply } from 'fastify';
import { CartService } from '../services/cart.service';
import {
  addCartItemSchema,
  updateCartItemSchema,
  mergeCartSchema,
} from '../schemas/cart.schema';
import { randomUUID } from 'crypto';

export class CartController {
  private static extractCartIdentity(request: FastifyRequest) {
    const userId = request.user?.id;
    let sessionToken =
      (request.headers['x-session-token'] as string) ||
      request.cookies?.cart_session_token ||
      undefined;

    let isNewSession = false;
    if (!userId && !sessionToken) {
      sessionToken = randomUUID();
      isNewSession = true;
    }

    return { userId, sessionToken, isNewSession };
  }

  private static attachSessionTokenCookie(reply: FastifyReply, sessionToken?: string) {
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
  static async getCart(request: FastifyRequest, reply: FastifyReply) {
    const { userId, sessionToken, isNewSession } = CartController.extractCartIdentity(request);
    const cart = await CartService.getCart(userId, sessionToken);

    if (isNewSession || sessionToken) {
      CartController.attachSessionTokenCookie(reply, sessionToken);
    }

    return reply.status(200).send({ data: cart });
  }

  // POST /api/v1/cart/items
  static async addItem(request: FastifyRequest, reply: FastifyReply) {
    const body = addCartItemSchema.parse(request.body);
    const { userId, sessionToken, isNewSession } = CartController.extractCartIdentity(request);

    const cart = await CartService.addItem({
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
  static async updateItem(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const body = updateCartItemSchema.parse(request.body);
    const { userId, sessionToken } = CartController.extractCartIdentity(request);

    const cart = await CartService.updateQuantity({
      userId,
      sessionToken,
      itemId: request.params.id,
      quantity: body.quantity,
    });

    return reply.status(200).send({ data: cart, message: 'Cart item updated' });
  }

  // DELETE /api/v1/cart/items/:id
  static async removeItem(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { userId, sessionToken } = CartController.extractCartIdentity(request);

    const cart = await CartService.removeItem({
      userId,
      sessionToken,
      itemId: request.params.id,
    });

    return reply.status(200).send({ data: cart, message: 'Item removed from cart' });
  }

  // DELETE /api/v1/cart
  static async clearCart(request: FastifyRequest, reply: FastifyReply) {
    const { userId, sessionToken } = CartController.extractCartIdentity(request);
    const cart = await CartService.clearCart(userId, sessionToken);
    return reply.status(200).send({ data: cart, message: 'Cart cleared' });
  }

  // POST /api/v1/cart/merge
  static async mergeCart(request: FastifyRequest, reply: FastifyReply) {
    const body = mergeCartSchema.parse(request.body);
    const userId = request.user?.id;

    if (!userId) {
      return reply.status(401).send({ error: 'Unauthorized', message: 'User must be authenticated to merge cart' });
    }

    const cart = await CartService.mergeCart(body.sessionToken, userId);
    return reply.status(200).send({ data: cart, message: 'Cart merged successfully' });
  }
}
