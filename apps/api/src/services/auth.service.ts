import { UserRepository } from '../repositories/user.repository';
import { SessionRepository } from '../repositories/session.repository';
import { RoleRepository } from '../repositories/role.repository';
import { AuditRepository } from '../repositories/audit.repository';
import { PasswordService } from '../security/password';
import { TokenService } from '../security/tokens';
import { RegisterInput, LoginInput, ChangePasswordInput, AuthUserResponse, SendOtpInput, VerifyOtpInput } from '../schemas/auth.schema';
import { ConflictError, UnauthorizedError, NotFoundError, BadRequestError } from '../errors/app-error';
import { OtpService } from './otp.service';
import config from '../config/env';

export interface RequestMetadata {
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
}

export class AuthService {
  /**
   * Request an OTP sent to email for registration or verification
   */
  static async sendOtp(input: SendOtpInput) {
    const normalizedEmail = input.email.toLowerCase().trim();

    if (input.purpose === 'REGISTRATION') {
      const existing = await UserRepository.findByEmail(normalizedEmail);
      if (existing) {
        throw new ConflictError('อีเมลนี้ลงทะเบียนไว้ในระบบแล้ว กรุณาเข้าสู่ระบบหรือใช้อีเมลอื่น');
      }
    }

    return OtpService.sendOtp(normalizedEmail, input.purpose);
  }

  /**
   * Verify an OTP code submitted by the user
   */
  static async verifyOtp(input: VerifyOtpInput) {
    return OtpService.verifyOtp(input.email, input.code, input.purpose);
  }

  /**
   * Transforms raw User entity into secure AuthUserResponse (zero password or token leaks).
   */
  static formatUserResponse(user: any): AuthUserResponse {
    const roles: string[] = [];
    const permissionsSet = new Set<string>();

    if (user.roles) {
      for (const ur of user.roles) {
        if (ur.role) {
          roles.push(ur.role.name);
          if (ur.role.permissions) {
            for (const rp of ur.role.permissions) {
              if (rp.permission) {
                permissionsSet.add(`${rp.permission.resource}.${rp.permission.action}`);
              }
            }
          }
        }
      }
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      displayName: user.displayName,
      phone: user.phone,
      isActive: user.isActive,
      customerProfile: user.customerProfile
        ? {
            id: user.customerProfile.id,
            customerType: user.customerProfile.customerType,
            companyName: user.customerProfile.companyName,
            isVerified: user.customerProfile.isVerified,
          }
        : null,
      roles,
      permissions: Array.from(permissionsSet),
    };
  }

  /**
   * Register a new consumer user and start a secure session.
   */
  static async register(input: RegisterInput, metadata: RequestMetadata) {
    const normalizedEmail = input.email.toLowerCase().trim();

    // 1. Check for duplicate email
    const existing = await UserRepository.findByEmail(normalizedEmail);
    if (existing) {
      throw new ConflictError('An account with this email already exists', { field: 'email' });
    }

    // 1.5 Verify OTP if provided (or require token if email verification is enforced)
    let isEmailVerified = false;
    if (input.verificationCode) {
      await OtpService.verifyOtp(normalizedEmail, input.verificationCode, 'REGISTRATION');
      isEmailVerified = true;
    } else if (input.verificationToken) {
      const isValid = OtpService.validateVerificationToken(normalizedEmail, input.verificationToken, 'REGISTRATION');
      if (!isValid) {
        throw new BadRequestError('รหัสยืนยันอีเมลหมดอายุหรือไม่ถูกต้อง กรุณายืนยันใหม่อีกครั้ง');
      }
      isEmailVerified = true;
    }

    // 2. Fetch standard non-privileged CUSTOMER role (Prevents self-assigned privilege escalation)
    const customerRole = await RoleRepository.getOrCreateDefaultCustomerRole();

    // 3. Hash password using Argon2id
    const passwordHash = await PasswordService.hash(input.password);

    // 4. Create User & CustomerProfile transactionally
    const user = await UserRepository.createWithCustomer(
      {
        email: normalizedEmail,
        passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
        displayName: input.displayName,
        customerType: (input.customerType as any) || 'CUSTOMER',
        companyName: input.companyName,
        taxId: input.taxId,
        emailVerifiedAt: isEmailVerified ? new Date() : null,
      },
      customerRole.id
    );

    // 5. Generate secure random session token and hash it
    const rawToken = TokenService.generateSessionToken();
    const tokenHash = TokenService.hashToken(rawToken);
    const expiresAt = new Date(Date.now() + config.SESSION_TTL_HOURS * 60 * 60 * 1000);

    await SessionRepository.create({
      userId: user.id,
      tokenHash,
      expiresAt,
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
    });

    // 6. Record audit log
    await AuditRepository.record({
      userId: user.id,
      action: 'REGISTERED',
      resource: 'User',
      resourceId: user.id,
      after: {
        email: user.email,
        customerType: input.customerType || 'CUSTOMER',
        isEmailVerified,
      },
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
    });

    return {
      user: this.formatUserResponse(user),
      sessionToken: rawToken,
      expiresAt,
    };
  }

  /**
   * Authenticate a user via email and Argon2id password hash check.
   */
  static async login(input: LoginInput, metadata: RequestMetadata) {
    const rawIdentifier = (input.username || input.email).toLowerCase().trim();
    const normalizedEmail = rawIdentifier.includes('@') ? rawIdentifier : `${rawIdentifier}@mobex.co.th`;

    // 1. Find user by email or username-based email
    let user = await UserRepository.findByEmail(normalizedEmail);
    if (!user && !rawIdentifier.includes('@')) {
      user = await UserRepository.findByEmail(rawIdentifier);
    }
    if (!user) {
      // Record failed login audit with no user ID (prevents email enumeration via timing or response)
      await AuditRepository.record({
        action: 'LOGIN_FAILED',
        resource: 'User',
        before: { attemptedEmail: rawIdentifier },
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
      });

      throw new UnauthorizedError('Invalid username or password', 'AUTH_INVALID_CREDENTIALS');
    }

    // 2. Verify password with Argon2id
    const isValidPassword = await PasswordService.verify(user.passwordHash, input.password);
    if (!isValidPassword) {
      await AuditRepository.record({
        userId: user.id,
        action: 'LOGIN_FAILED',
        resource: 'User',
        resourceId: user.id,
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
      });

      throw new UnauthorizedError('Invalid email or password', 'AUTH_INVALID_CREDENTIALS');
    }

    // 3. Verify user is active
    if (!user.isActive || user.deletedAt) {
      await AuditRepository.record({
        userId: user.id,
        action: 'LOGIN_DEACTIVATED',
        resource: 'User',
        resourceId: user.id,
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
      });

      throw new UnauthorizedError('This account has been deactivated. Please contact support.', 'ACCOUNT_DEACTIVATED');
    }

    // 4. Update last login timestamp
    await UserRepository.updateLastLogin(user.id);

    // 5. Generate secure session token and hash
    const rawToken = TokenService.generateSessionToken();
    const tokenHash = TokenService.hashToken(rawToken);
    const expiresAt = new Date(Date.now() + config.SESSION_TTL_HOURS * 60 * 60 * 1000);

    await SessionRepository.create({
      userId: user.id,
      tokenHash,
      expiresAt,
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
    });

    // 6. Record audit log
    await AuditRepository.record({
      userId: user.id,
      action: 'LOGIN_SUCCESS',
      resource: 'User',
      resourceId: user.id,
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
    });

    return {
      user: this.formatUserResponse(user),
      sessionToken: rawToken,
      expiresAt,
    };
  }

  /**
   * Log out and revoke session token.
   */
  static async logout(sessionToken: string, metadata: RequestMetadata) {
    if (!sessionToken) return;

    const tokenHash = TokenService.hashToken(sessionToken);
    const session = await SessionRepository.findValidByTokenHash(tokenHash);

    if (session) {
      await SessionRepository.revokeByTokenHash(tokenHash);

      await AuditRepository.record({
        userId: session.userId,
        action: 'LOGOUT',
        resource: 'Session',
        resourceId: session.id,
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
      });
    }
  }

  /**
   * Retrieve currently authenticated user profile with roles and permissions.
   */
  static async getMe(userId: string): Promise<AuthUserResponse> {
    const user = await UserRepository.findById(userId);
    if (!user || !user.isActive || user.deletedAt) {
      throw new NotFoundError('User profile not found or inactive');
    }

    return this.formatUserResponse(user);
  }

  /**
   * Change password with Argon2id validation and revoke other active sessions.
   */
  static async changePassword(userId: string, currentSessionToken: string, input: ChangePasswordInput, metadata: RequestMetadata) {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // 1. Verify current password
    const isCurrentValid = await PasswordService.verify(user.passwordHash, input.currentPassword);
    if (!isCurrentValid) {
      throw new UnauthorizedError('Current password is incorrect', 'INVALID_CURRENT_PASSWORD');
    }

    // 2. Hash new password with Argon2id
    const newPasswordHash = await PasswordService.hash(input.newPassword);
    await UserRepository.updatePassword(userId, newPasswordHash);

    // 3. Revoke all other sessions except current
    const currentTokenHash = TokenService.hashToken(currentSessionToken);
    await SessionRepository.revokeAllForUser(userId, currentTokenHash);

    // 4. Record audit log
    await AuditRepository.record({
      userId,
      action: 'PASSWORD_CHANGED',
      resource: 'User',
      resourceId: userId,
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
    });
  }
}
