import { FastifyInstance } from 'fastify';
import { CartController } from '../controllers/cart.controller';
import { authenticateOptional, authenticate } from '../middleware/auth';

export async function cartRoutes(app: FastifyInstance) {
  // GET /api/v1/cart - Get current active cart
  app.get('/cart', {
    preHandler: [authenticateOptional],
    schema: {
      description: 'Get current shopping cart with server-authoritative tier pricing and fitment indicators',
      tags: ['Cart'],
    },
    handler: CartController.getCart,
  });

  // POST /api/v1/cart/items - Add item to cart
  app.post('/cart/items', {
    preHandler: [authenticateOptional],
    schema: {
      description: 'Add an item to the shopping cart with quantity and optional vehicle fitment context',
      tags: ['Cart'],
    },
    handler: CartController.addItem,
  });

  // PATCH /api/v1/cart/items/:id - Update cart item quantity
  app.patch('/cart/items/:id', {
    preHandler: [authenticateOptional],
    schema: {
      description: 'Update the quantity of a cart item (or remove if quantity <= 0)',
      tags: ['Cart'],
    },
    handler: CartController.updateItem,
  });

  // DELETE /api/v1/cart/items/:id - Remove single cart item
  app.delete('/cart/items/:id', {
    preHandler: [authenticateOptional],
    schema: {
      description: 'Remove a specific item from the shopping cart',
      tags: ['Cart'],
    },
    handler: CartController.removeItem,
  });

  // DELETE /api/v1/cart - Clear all cart items
  app.delete('/cart', {
    preHandler: [authenticateOptional],
    schema: {
      description: 'Clear all items from the shopping cart',
      tags: ['Cart'],
    },
    handler: CartController.clearCart,
  });

  // POST /api/v1/cart/merge - Merge guest cart after login
  app.post('/cart/merge', {
    preHandler: [authenticate],
    schema: {
      description: 'Merge guest cart items into authenticated user cart upon login',
      tags: ['Cart'],
      security: [{ cookieAuth: [] }, { bearerAuth: [] }],
    },
    handler: CartController.mergeCart,
  });
}
