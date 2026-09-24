import Fastify, { FastifyInstance } from 'fastify';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import crypto from 'crypto';
import config from './config/env';
import { loggerConfig } from './logging/logger';
import { errorHandler } from './errors/error-handler';
import { registerSwagger } from './plugins/swagger';
import { healthRoutes } from './routes/health.routes';
import { authRoutes } from './routes/auth.routes';
import { productRoutes } from './routes/product.routes';
import { categoryRoutes } from './routes/category.routes';
import { brandRoutes } from './routes/brand.routes';
import { vehicleRoutes } from './routes/vehicle.routes';
import { fitmentRoutes } from './routes/fitment.routes';
import { cartRoutes } from './routes/cart.routes';
import { orderRoutes } from './routes/order.routes';
import { paymentRoutes } from './routes/payment.routes';
import { shippingRoutes } from './routes/shipping.routes';
import { warehouseRoutes } from './routes/warehouse.routes';
import { inventoryRoutes } from './routes/inventory.routes';
import { supplierRoutes } from './routes/supplier.routes';
import { purchaseOrderRoutes } from './routes/purchase-order.routes';
import { goodsReceiptRoutes } from './routes/goods-receipt.routes';
import { customerRoutes } from './routes/customer.routes';
import { adminCrmRoutes } from './routes/admin-crm.routes';
import { adminPromotionRoutes } from './routes/admin-promotion.routes';
import { adminLoyaltyRoutes } from './routes/admin-loyalty.routes';
import { adminCampaignRoutes } from './routes/admin-campaign.routes';
import { articleRoutes } from './routes/article.routes';
import { settingsRoutes } from './routes/settings.routes';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: loggerConfig,
    genReqId: (req) => (req.headers['x-request-id'] as string) || crypto.randomUUID(),
    trustProxy: true,
    connectionTimeout: 20000,
    keepAliveTimeout: 30000,
    bodyLimit: 15 * 1024 * 1024, // 15MB max payload (reduces memory consumption)
  });

  // 1. Centralized Error Handling
  app.setErrorHandler(errorHandler);

  // 2. Request ID Response Header Hook
  app.addHook('onSend', async (request, reply) => {
    const reqId = (request.headers['x-request-id'] as string) || request.id;
    reply.header('x-request-id', reqId);
  });

  // 3. Security Headers (Helmet)
  await app.register(helmet, {
    contentSecurityPolicy: config.NODE_ENV === 'production' ? undefined : false,
    crossOriginEmbedderPolicy: false,
  });

  // 4. Strict CORS Configuration
  const allowedOrigins = config.CORS_ALLOWED_ORIGINS.split(',').map((o) => o.trim());
  await app.register(cors, {
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        config.NODE_ENV === 'development' ||
        origin.endsWith('autocentric.net') ||
        origin.includes('localhost') ||
        origin.includes('127.0.0.1')
      ) {
        return callback(null, true);
      }
      callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Admin-Key', 'X-Request-ID', 'X-Session-Token', 'Accept'],
    exposedHeaders: ['X-Request-ID', 'X-Session-Token'],
  });

  // 5. Cookies
  await app.register(cookie, {
    secret: config.SESSION_COOKIE_SECRET,
    hook: 'onRequest',
  });

  // 6. Global Rate Limiter
  await app.register(rateLimit, {
    max: config.NODE_ENV === 'test' ? 10000 : config.RATE_LIMIT_MAX,
    timeWindow: config.RATE_LIMIT_TIME_WINDOW,
    errorResponseBuilder: (_req, context) => ({
      statusCode: 429,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: `Too many requests. Rate limit exceeded. Try again in ${context.after}`,
        requestId: _req.id,
      },
    }),
  });

  // 7. OpenAPI Documentation
  await registerSwagger(app);

  // 8. Health Routes
  await app.register(healthRoutes);
  await app.register(healthRoutes, { prefix: '/api/v1' });

  // 9. API v1 Routes
  await app.register(authRoutes, { prefix: '/api/v1/auth' });
  await app.register(productRoutes, { prefix: '/api/v1' });
  await app.register(categoryRoutes, { prefix: '/api/v1' });
  await app.register(brandRoutes, { prefix: '/api/v1' });
  await app.register(vehicleRoutes, { prefix: '/api/v1' });
  await app.register(fitmentRoutes, { prefix: '/api/v1' });
  await app.register(cartRoutes, { prefix: '/api/v1' });
  await app.register(orderRoutes, { prefix: '/api/v1' });
  await app.register(paymentRoutes, { prefix: '/api/v1' });
  await app.register(shippingRoutes, { prefix: '/api/v1' });
  await app.register(warehouseRoutes, { prefix: '/api/v1' });
  await app.register(inventoryRoutes, { prefix: '/api/v1' });
  await app.register(supplierRoutes, { prefix: '/api/v1' });
  await app.register(purchaseOrderRoutes, { prefix: '/api/v1' });
  await app.register(goodsReceiptRoutes, { prefix: '/api/v1' });
  await app.register(customerRoutes, { prefix: '/api/v1' });
  await app.register(adminCrmRoutes, { prefix: '/api/v1' });
  await app.register(adminPromotionRoutes, { prefix: '/api/v1' });
  await app.register(adminLoyaltyRoutes, { prefix: '/api/v1' });
  await app.register(adminCampaignRoutes, { prefix: '/api/v1' });
  await app.register(articleRoutes);
  await app.register(settingsRoutes);

  return app;
}

export default buildApp;
