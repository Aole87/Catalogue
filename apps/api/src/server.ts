import { buildApp } from './app';
import config from './config/env';

async function start() {
  const app = await buildApp();

  try {
    const address = await app.listen({ port: config.PORT, host: config.HOST });
    console.log(`\n🚀 API Server running at ${address}`);
    console.log(`📖 Swagger API Docs available at ${address}/docs`);
    console.log(`🩺 Health check at ${address}/health\n`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
