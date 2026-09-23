"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loggerConfig = void 0;
const env_1 = __importDefault(require("../config/env"));
exports.loggerConfig = {
    level: env_1.default.NODE_ENV === 'test' ? 'silent' : env_1.default.NODE_ENV === 'production' ? 'info' : 'debug',
    redact: {
        paths: [
            'req.headers.cookie',
            'req.headers.authorization',
            'req.headers["set-cookie"]',
            'body.password',
            'body.currentPassword',
            'body.newPassword',
            'password',
            'passwordHash',
            'token',
            'tokenHash',
            'secret',
            'cookie',
        ],
        censor: '[REDACTED]',
    },
    serializers: {
        req(req) {
            return {
                method: req.method,
                url: req.url,
                path: req.routeOptions?.url || req.url,
                parameters: req.params,
                headers: {
                    host: req.headers.host,
                    'user-agent': req.headers['user-agent'],
                    'x-request-id': req.headers['x-request-id'],
                },
            };
        },
        res(res) {
            return {
                statusCode: res.statusCode,
            };
        },
    },
};
//# sourceMappingURL=logger.js.map