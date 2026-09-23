"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const env_1 = __importDefault(require("./config/env"));
async function start() {
    const app = await (0, app_1.buildApp)();
    try {
        const address = await app.listen({ port: env_1.default.PORT, host: env_1.default.HOST });
        console.log(`\n🚀 API Server running at ${address}`);
        console.log(`📖 Swagger API Docs available at ${address}/docs`);
        console.log(`🩺 Health check at ${address}/health\n`);
    }
    catch (err) {
        app.log.error(err);
        process.exit(1);
    }
}
start();
//# sourceMappingURL=server.js.map