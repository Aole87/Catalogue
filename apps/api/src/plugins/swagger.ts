import { FastifyInstance } from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import config from '../config/env';

export async function registerSwagger(app: FastifyInstance) {
  // In production, skip Swagger unless explicitly requested to save CPU & RAM (~40MB heap)
  if (config.NODE_ENV === 'production' && !config.ENABLE_SWAGGER) {
    return;
  }

  await app.register(swagger, {
    openapi: {
      info: {
        title: 'Intelligent Automotive E-Commerce API',
        description: 'Production backend API for single-merchant automotive parts platform in Thailand',
        version: '1.0.0',
      },
      servers: [
        {
          url: 'http://localhost:3000',
          description: 'Local Development Server',
        },
      ],
      components: {
        securitySchemes: {
          cookieAuth: {
            type: 'apiKey',
            in: 'cookie',
            name: 'autoparts_session',
          },
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
  });

  await app.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
    },
  });
}
