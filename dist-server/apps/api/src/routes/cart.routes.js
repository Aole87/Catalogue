"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cartRoutes = cartRoutes;
const cart_controller_1 = require("../controllers/cart.controller");
const auth_1 = require("../middleware/auth");
async function cartRoutes(app) {
    // GET /api/v1/cart - Get current active cart
    app.get('/cart', {
        preHandler: [auth_1.authenticateOptional],
        schema: {
            description: 'Get current shopping cart with server-authoritative tier pricing and fitment indicators',
            tags: ['Cart'],
        },
        handler: cart_controller_1.CartController.getCart,
    });
    // POST /api/v1/cart/items - Add item to cart
    app.post('/cart/items', {
        preHandler: [auth_1.authenticateOptional],
        schema: {
            description: 'Add an item to the shopping cart with quantity and optional vehicle fitment context',
            tags: ['Cart'],
        },
        handler: cart_controller_1.CartController.addItem,
    });
    // PATCH /api/v1/cart/items/:id - Update cart item quantity
    app.patch('/cart/items/:id', {
        preHandler: [auth_1.authenticateOptional],
        schema: {
            description: 'Update the quantity of a cart item (or remove if quantity <= 0)',
            tags: ['Cart'],
        },
        handler: cart_controller_1.CartController.updateItem,
    });
    // DELETE /api/v1/cart/items/:id - Remove single cart item
    app.delete('/cart/items/:id', {
        preHandler: [auth_1.authenticateOptional],
        schema: {
            description: 'Remove a specific item from the shopping cart',
            tags: ['Cart'],
        },
        handler: cart_controller_1.CartController.removeItem,
    });
    // DELETE /api/v1/cart - Clear all cart items
    app.delete('/cart', {
        preHandler: [auth_1.authenticateOptional],
        schema: {
            description: 'Clear all items from the shopping cart',
            tags: ['Cart'],
        },
        handler: cart_controller_1.CartController.clearCart,
    });
    // POST /api/v1/cart/merge - Merge guest cart after login
    app.post('/cart/merge', {
        preHandler: [auth_1.authenticate],
        schema: {
            description: 'Merge guest cart items into authenticated user cart upon login',
            tags: ['Cart'],
            security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        },
        handler: cart_controller_1.CartController.mergeCart,
    });
}
//# sourceMappingURL=cart.routes.js.map