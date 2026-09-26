import { buildApp } from './app';
import config from './config/env';
import prisma from '@car-parts/database';

async function start() {
  const app = await buildApp();

  // Graceful shutdown handling for clean resource cleanup
  const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
  for (const signal of signals) {
    process.on(signal, async () => {
      app.log.info({ signal }, `Received ${signal}, closing server gracefully...`);
      try {
        await app.close();
        await prisma.$disconnect();
        process.exit(0);
      } catch (err) {
        app.log.error(err, 'Error during graceful shutdown');
        process.exit(1);
      }
    });
  }

  try {
    const address = await app.listen({ port: config.PORT, host: config.HOST });
    if (config.NODE_ENV !== 'production') {
      console.log(`\n🚀 API Server running at ${address}`);
      console.log(`📖 Swagger API Docs available at ${address}/docs`);
      console.log(`🩺 Health check at ${address}/health\n`);
    } else {
      app.log.info(`API Server running at ${address}`);
    }
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();

