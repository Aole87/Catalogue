import { FastifyRequest, FastifyReply } from 'fastify';
import { registerSchema, loginSchema, changePasswordSchema, sendOtpSchema, verifyOtpSchema } from '../schemas/auth.schema';
import { AuthService } from '../services/auth.service';
import config from '../config/env';

export class AuthController {
  private static extractMetadata(request: FastifyRequest) {
    return {
      ipAddress: (request.headers['x-forwarded-for'] as string) || request.ip,
      userAgent: request.headers['user-agent'],
      requestId: (request.headers['x-request-id'] as string) || request.id,
    };
  }

  private static setSessionCookie(reply: FastifyReply, token: string, expiresAt: Date) {
    reply.setCookie(config.SESSION_COOKIE_NAME, token, {
      path: '/',
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: config.NODE_ENV === 'production' ? 'strict' : 'lax',
      expires: expiresAt,
    });
  }

  private static clearSessionCookie(reply: FastifyReply) {
    reply.clearCookie(config.SESSION_COOKIE_NAME, {
      path: '/',
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: config.NODE_ENV === 'production' ? 'strict' : 'lax',
    });
  }

  static async sendOtp(request: FastifyRequest, reply: FastifyReply) {
    const input = sendOtpSchema.parse(request.body);
    const result = await AuthService.sendOtp(input);
    return reply.status(200).send({ data: result });
  }

  static async verifyOtp(request: FastifyRequest, reply: FastifyReply) {
    const input = verifyOtpSchema.parse(request.body);
    const result = await AuthService.verifyOtp(input);
    return reply.status(200).send({ data: result });
  }

  static async register(request: FastifyRequest, reply: FastifyReply) {
    const input = registerSchema.parse(request.body);
    const metadata = AuthController.extractMetadata(request);

    const result = await AuthService.register(input, metadata);
    AuthController.setSessionCookie(reply, result.sessionToken, result.expiresAt);

    return reply.status(201).send({
      data: {
        user: result.user,
        sessionToken: result.sessionToken,
      },
    });
  }

  static async login(request: FastifyRequest, reply: FastifyReply) {
    const input = loginSchema.parse(request.body);
    const metadata = AuthController.extractMetadata(request);

    const result = await AuthService.login(input, metadata);
    AuthController.setSessionCookie(reply, result.sessionToken, result.expiresAt);

    return reply.status(200).send({
      data: {
        user: result.user,
        sessionToken: result.sessionToken,
      },
    });
  }

  static async logout(request: FastifyRequest, reply: FastifyReply) {
    const rawToken = request.cookies[config.SESSION_COOKIE_NAME] || request.session?.token || '';
    const metadata = AuthController.extractMetadata(request);

    if (rawToken) {
      await AuthService.logout(rawToken, metadata);
    }
    AuthController.clearSessionCookie(reply);

    return reply.status(200).send({
      data: {
        success: true,
        message: 'Successfully logged out',
      },
    });
  }

  static async getMe(request: FastifyRequest, reply: FastifyReply) {
    return reply.status(200).send({
      data: {
        user: request.user,
      },
    });
  }

  static async changePassword(request: FastifyRequest, reply: FastifyReply) {
    const input = changePasswordSchema.parse(request.body);
    const metadata = AuthController.extractMetadata(request);
    const userId = request.user!.id;
    const currentToken = request.session!.token;

    await AuthService.changePassword(userId, currentToken, input, metadata);

    return reply.status(200).send({
      data: {
        success: true,
        message: 'Password has been updated successfully',
      },
    });
  }
}
