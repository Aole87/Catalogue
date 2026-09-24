import crypto from 'crypto';
import { MailService } from './mail.service';
import { BadRequestError } from '../errors/app-error';
import config from '../config/env';

interface OtpRecord {
  email: string;
  codeHash: string;
  purpose: string;
  attempts: number;
  expiresAt: Date;
  resendAllowedAt: Date;
  verifiedAt?: Date;
}

export class OtpService {
  // Thread-safe in-memory store for OTPs (or Redis in clustered setups)
  private static store = new Map<string, OtpRecord>();

  private static getStoreKey(email: string, purpose: string): string {
    return `${purpose}:${email.toLowerCase().trim()}`;
  }

  private static hashCode(code: string): string {
    return crypto
      .createHash('sha256')
      .update(`${code}:${config.SESSION_COOKIE_SECRET}`)
      .digest('hex');
  }

  /**
   * Generates a 6-digit cryptographic OTP, stores its hash, and dispatches it via email.
   */
  static async sendOtp(
    email: string,
    purpose: 'REGISTRATION' | 'PASSWORD_RESET' | 'VERIFY_EMAIL' = 'REGISTRATION'
  ): Promise<{ success: boolean; message: string; expiresInSeconds: number; resendCooldownSeconds: number }> {
    const normalizedEmail = email.toLowerCase().trim();
    const key = this.getStoreKey(normalizedEmail, purpose);
    const now = new Date();

    const existing = this.store.get(key);
    if (existing && existing.resendAllowedAt > now) {
      const waitSeconds = Math.ceil((existing.resendAllowedAt.getTime() - now.getTime()) / 1000);
      throw new BadRequestError(`กรุณารออีก ${waitSeconds} วินาที ก่อนขอรหัส OTP ใหม่อีกครั้ง`, {
        retryAfter: waitSeconds,
      });
    }

    // Generate secure 6-digit random code (100000 - 999999)
    const code = crypto.randomInt(100000, 999999).toString();
    const codeHash = this.hashCode(code);

    const ttlMinutes = config.OTP_TTL_MINUTES || 5;
    const expiresAt = new Date(now.getTime() + ttlMinutes * 60 * 1000);
    const resendAllowedAt = new Date(now.getTime() + 60 * 1000); // 60s cooldown

    this.store.set(key, {
      email: normalizedEmail,
      codeHash,
      purpose,
      attempts: 0,
      expiresAt,
      resendAllowedAt,
    });

    // Clean up expired items periodically
    this.cleanExpired();

    // Send email asynchronously
    await MailService.sendOtpEmail(normalizedEmail, code, purpose);

    return {
      success: true,
      message: `ส่งรหัส OTP ไปยังอีเมล ${normalizedEmail} เรียบร้อยแล้ว (รหัสมีอายุ ${ttlMinutes} นาที)`,
      expiresInSeconds: ttlMinutes * 60,
      resendCooldownSeconds: 60,
    };
  }

  /**
   * Verifies the submitted OTP code.
   */
  static async verifyOtp(
    email: string,
    code: string,
    purpose: 'REGISTRATION' | 'PASSWORD_RESET' | 'VERIFY_EMAIL' = 'REGISTRATION'
  ): Promise<{ success: boolean; message: string; verificationToken: string }> {
    const normalizedEmail = email.toLowerCase().trim();
    const key = this.getStoreKey(normalizedEmail, purpose);
    const record = this.store.get(key);
    const now = new Date();

    if (!record) {
      throw new BadRequestError('ไม่พบข้อมูลรหัส OTP หรือรหัสหมดอายุแล้ว กรุณากดขอรหัสใหม่อีกครั้ง');
    }

    if (now > record.expiresAt) {
      this.store.delete(key);
      throw new BadRequestError('รหัส OTP หมดอายุแล้ว กรุณากดขอรหัสใหม่อีกครั้ง');
    }

    if (record.attempts >= 5) {
      this.store.delete(key);
      throw new BadRequestError('คุณกรอกรหัสผิดเกิน 5 ครั้ง รหัสถูกยกเลิก กรุณากดขอรหัสใหม่อีกครั้ง');
    }

    const inputHash = this.hashCode(code.trim());
    const isMatch = crypto.timingSafeEqual(
      Buffer.from(inputHash, 'utf8'),
      Buffer.from(record.codeHash, 'utf8')
    );

    if (!isMatch) {
      record.attempts += 1;
      const remaining = 5 - record.attempts;
      throw new BadRequestError(`รหัส OTP ไม่ถูกต้อง (เหลือโอกาสกรอกอีก ${remaining} ครั้ง)`);
    }

    // Mark as verified
    record.verifiedAt = now;

    // Issue cryptographic verification token valid for 15 minutes
    const tokenPayload = `${normalizedEmail}:${purpose}:${now.getTime()}`;
    const signature = crypto
      .createHmac('sha256', config.SESSION_COOKIE_SECRET)
      .update(tokenPayload)
      .digest('hex');
    const verificationToken = Buffer.from(`${tokenPayload}:${signature}`).toString('base64url');

    return {
      success: true,
      message: 'ยืนยันรหัส OTP ทางอีเมลสำเร็จ',
      verificationToken,
    };
  }

  /**
   * Checks whether a verification token is authentic and not expired (valid for 15 minutes).
   */
  static validateVerificationToken(
    email: string,
    token: string,
    purpose: 'REGISTRATION' | 'PASSWORD_RESET' | 'VERIFY_EMAIL' = 'REGISTRATION'
  ): boolean {
    try {
      const decoded = Buffer.from(token, 'base64url').toString('utf8');
      const parts = decoded.split(':');
      if (parts.length !== 4) return false;

      const [tokenEmail, tokenPurpose, timestampStr, signature] = parts;
      if (tokenEmail !== email.toLowerCase().trim()) return false;
      if (tokenPurpose !== purpose) return false;

      const timestamp = parseInt(timestampStr, 10);
      if (isNaN(timestamp) || Date.now() - timestamp > 15 * 60 * 1000) {
        return false; // Expired after 15 minutes
      }

      const expectedSignature = crypto
        .createHmac('sha256', config.SESSION_COOKIE_SECRET)
        .update(`${tokenEmail}:${tokenPurpose}:${timestampStr}`)
        .digest('hex');

      return crypto.timingSafeEqual(
        Buffer.from(signature, 'utf8'),
        Buffer.from(expectedSignature, 'utf8')
      );
    } catch {
      return false;
    }
  }

  private static cleanExpired() {
    const now = new Date();
    for (const [key, record] of this.store.entries()) {
      if (now > record.expiresAt) {
        this.store.delete(key);
      }
    }
  }
}
