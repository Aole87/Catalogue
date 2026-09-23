"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildApp = buildApp;
const fastify_1 = __importDefault(require("fastify"));
const cookie_1 = __importDefault(require("@fastify/cookie"));
const cors_1 = __importDefault(require("@fastify/cors"));
const helmet_1 = __importDefault(require("@fastify/helmet"));
const rate_limit_1 = __importDefault(require("@fastify/rate-limit"));
const crypto_1 = __importDefault(require("crypto"));
const env_1 = __importDefault(require("./config/env"));
const logger_1 = require("./logging/logger");
const error_handler_1 = require("./errors/error-handler");
const swagger_1 = require("./plugins/swagger");
const health_routes_1 = require("./routes/health.routes");
const auth_routes_1 = require("./routes/auth.routes");
const product_routes_1 = require("./routes/product.routes");
const category_routes_1 = require("./routes/category.routes");
const brand_routes_1 = require("./routes/brand.routes");
const vehicle_routes_1 = require("./routes/vehicle.routes");
const fitment_routes_1 = require("./routes/fitment.routes");
const cart_routes_1 = require("./routes/cart.routes");
const order_routes_1 = require("./routes/order.routes");
const payment_routes_1 = require("./routes/payment.routes");
const shipping_routes_1 = require("./routes/shipping.routes");
const warehouse_routes_1 = require("./routes/warehouse.routes");
const inventory_routes_1 = require("./routes/inventory.routes");
const supplier_routes_1 = require("./routes/supplier.routes");
const purchase_order_routes_1 = require("./routes/purchase-order.routes");
const goods_receipt_routes_1 = require("./routes/goods-receipt.routes");
const customer_routes_1 = require("./routes/customer.routes");
const admin_crm_routes_1 = require("./routes/admin-crm.routes");
const admin_promotion_routes_1 = require("./routes/admin-promotion.routes");
const admin_loyalty_routes_1 = require("./routes/admin-loyalty.routes");
const admin_campaign_routes_1 = require("./routes/admin-campaign.routes");
const article_routes_1 = require("./routes/article.routes");
const settings_routes_1 = require("./routes/settings.routes");
async function buildApp() {
    const app = (0, fastify_1.default)({
        logger: logger_1.loggerConfig,
        genReqId: (req) => req.headers['x-request-id'] || crypto_1.default.randomUUID(),
        trustProxy: true,
        bodyLimit: 50 * 1024 * 1024, // 50MB to support base64 images and large settings payloads
    });
    // 1. Centralized Error Handling
    app.setErrorHandler(error_handler_1.errorHandler);
    // 2. Request ID Response Header Hook
    app.addHook('onSend', async (request, reply) => {
        const reqId = request.headers['x-request-id'] || request.id;
        reply.header('x-request-id', reqId);
    });
    // 3. Security Headers (Helmet)
    await app.register(helmet_1.default, {
        contentSecurityPolicy: env_1.default.NODE_ENV === 'production' ? undefined : false,
        crossOriginEmbedderPolicy: false,
    });
    // 4. Strict CORS Configuration
    const allowedOrigins = env_1.default.CORS_ALLOWED_ORIGINS.split(',').map((o) => o.trim());
    await app.register(cors_1.default, {
        origin: (origin, callback) => {
            // Allow requests with no origin (like mobile apps, curl, server-to-server)
            if (!origin)
                return callback(null, true);
            if (allowedOrigins.includes(origin) || env_1.default.NODE_ENV === 'development') {
                return callback(null, true);
            }
            callback(new Error('Not allowed by CORS'), false);
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', 'X-Session-Token', 'Accept'],
        exposedHeaders: ['X-Request-ID', 'X-Session-Token'],
    });
    // 5. Cookies
    await app.register(cookie_1.default, {
        secret: env_1.default.SESSION_COOKIE_SECRET,
        hook: 'onRequest',
    });
    // 6. Global Rate Limiter
    await app.register(rate_limit_1.default, {
        max: env_1.default.NODE_ENV === 'test' ? 10000 : env_1.default.RATE_LIMIT_MAX,
        timeWindow: env_1.default.RATE_LIMIT_TIME_WINDOW,
        errorResponseBuilder: (_req, context) => ({
            error: {
                code: 'RATE_LIMIT_EXCEEDED',
                message: `Too many requests. Rate limit exceeded. Try again in ${context.after}`,
                requestId: _req.id,
            },
        }),
    });
    // 7. OpenAPI Documentation
    await (0, swagger_1.registerSwagger)(app);
    // 8. Health Routes
    await app.register(health_routes_1.healthRoutes);
    await app.register(health_routes_1.healthRoutes, { prefix: '/api/v1' });
    // 9. API v1 Routes
    await app.register(auth_routes_1.authRoutes, { prefix: '/api/v1/auth' });
    await app.register(product_routes_1.productRoutes, { prefix: '/api/v1' });
    await app.register(category_routes_1.categoryRoutes, { prefix: '/api/v1' });
    await app.register(brand_routes_1.brandRoutes, { prefix: '/api/v1' });
    await app.register(vehicle_routes_1.vehicleRoutes, { prefix: '/api/v1' });
    await app.register(fitment_routes_1.fitmentRoutes, { prefix: '/api/v1' });
    await app.register(cart_routes_1.cartRoutes, { prefix: '/api/v1' });
    await app.register(order_routes_1.orderRoutes, { prefix: '/api/v1' });
    await app.register(payment_routes_1.paymentRoutes, { prefix: '/api/v1' });
    await app.register(shipping_routes_1.shippingRoutes, { prefix: '/api/v1' });
    await app.register(warehouse_routes_1.warehouseRoutes, { prefix: '/api/v1' });
    await app.register(inventory_routes_1.inventoryRoutes, { prefix: '/api/v1' });
    await app.register(supplier_routes_1.supplierRoutes, { prefix: '/api/v1' });
    await app.register(purchase_order_routes_1.purchaseOrderRoutes, { prefix: '/api/v1' });
    await app.register(goods_receipt_routes_1.goodsReceiptRoutes, { prefix: '/api/v1' });
    await app.register(customer_routes_1.customerRoutes, { prefix: '/api/v1' });
    await app.register(admin_crm_routes_1.adminCrmRoutes, { prefix: '/api/v1' });
    await app.register(admin_promotion_routes_1.adminPromotionRoutes, { prefix: '/api/v1' });
    await app.register(admin_loyalty_routes_1.adminLoyaltyRoutes, { prefix: '/api/v1' });
    await app.register(admin_campaign_routes_1.adminCampaignRoutes, { prefix: '/api/v1' });
    await app.register(article_routes_1.articleRoutes);
    await app.register(settings_routes_1.settingsRoutes);
    return app;
}
exports.default = buildApp;
//# sourceMappingURL=app.js.map