"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_schema_1 = require("../schemas/auth.schema");
const auth_service_1 = require("../services/auth.service");
const env_1 = __importDefault(require("../config/env"));
class AuthController {
    static extractMetadata(request) {
        return {
            ipAddress: request.headers['x-forwarded-for'] || request.ip,
            userAgent: request.headers['user-agent'],
            requestId: request.headers['x-request-id'] || request.id,
        };
    }
    static setSessionCookie(reply, token, expiresAt) {
        reply.setCookie(env_1.default.SESSION_COOKIE_NAME, token, {
            path: '/',
            httpOnly: true,
            secure: env_1.default.NODE_ENV === 'production',
            sameSite: env_1.default.NODE_ENV === 'production' ? 'strict' : 'lax',
            expires: expiresAt,
        });
    }
    static clearSessionCookie(reply) {
        reply.clearCookie(env_1.default.SESSION_COOKIE_NAME, {
            path: '/',
            httpOnly: true,
            secure: env_1.default.NODE_ENV === 'production',
            sameSite: env_1.default.NODE_ENV === 'production' ? 'strict' : 'lax',
        });
    }
    static async register(request, reply) {
        const input = auth_schema_1.registerSchema.parse(request.body);
        const metadata = AuthController.extractMetadata(request);
        const result = await auth_service_1.AuthService.register(input, metadata);
        AuthController.setSessionCookie(reply, result.sessionToken, result.expiresAt);
        return reply.status(201).send({
            data: {
                user: result.user,
            },
        });
    }
    static async login(request, reply) {
        const input = auth_schema_1.loginSchema.parse(request.body);
        const metadata = AuthController.extractMetadata(request);
        const result = await auth_service_1.AuthService.login(input, metadata);
        AuthController.setSessionCookie(reply, result.sessionToken, result.expiresAt);
        return reply.status(200).send({
            data: {
                user: result.user,
            },
        });
    }
    static async logout(request, reply) {
        const rawToken = request.cookies[env_1.default.SESSION_COOKIE_NAME] || request.session?.token || '';
        const metadata = AuthController.extractMetadata(request);
        if (rawToken) {
            await auth_service_1.AuthService.logout(rawToken, metadata);
        }
        AuthController.clearSessionCookie(reply);
        return reply.status(200).send({
            data: {
                success: true,
                message: 'Successfully logged out',
            },
        });
    }
    static async getMe(request, reply) {
        return reply.status(200).send({
            data: {
                user: request.user,
            },
        });
    }
    static async changePassword(request, reply) {
        const input = auth_schema_1.changePasswordSchema.parse(request.body);
        const metadata = AuthController.extractMetadata(request);
        const userId = request.user.id;
        const currentToken = request.session.token;
        await auth_service_1.AuthService.changePassword(userId, currentToken, input, metadata);
        return reply.status(200).send({
            data: {
                success: true,
                message: 'Password has been updated successfully',
            },
        });
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map