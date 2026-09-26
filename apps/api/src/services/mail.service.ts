import nodemailer from 'nodemailer';
import config from '../config/env';

export class MailService {
  private static transporter: nodemailer.Transporter | null = null;

  private static getTransporter(): nodemailer.Transporter | null {
    if (this.transporter) return this.transporter;

    if (config.SMTP_HOST && config.SMTP_USER && config.SMTP_PASS) {
      this.transporter = nodemailer.createTransport({
        host: config.SMTP_HOST,
        port: config.SMTP_PORT,
        secure: config.SMTP_PORT === 465,
        auth: {
          user: config.SMTP_USER,
          pass: config.SMTP_PASS,
        },
      });
      return this.transporter;
    }

    return null;
  }

  /**
   * Sends a styled OTP verification email for registration or password reset.
   */
  static async sendOtpEmail(
    to: string,
    code: string,
    purpose: 'REGISTRATION' | 'PASSWORD_RESET' | 'VERIFY_EMAIL' = 'REGISTRATION',
    resetUrl?: string
  ): Promise<boolean> {
    const purposeTitle =
      purpose === 'REGISTRATION'
        ? 'ยืนยันการสมัครสมาชิก'
        : purpose === 'PASSWORD_RESET'
        ? 'รีเซ็ตรหัสผ่าน'
        : 'ยืนยันอีเมลของคุณ';

    const subject = `[MOBEX Auto Parts] ${purposeTitle}: ${code}`;

    const resetLinkHtml = resetUrl
      ? `
              <!-- Direct Reset Button -->
              <div style="text-align: center; margin: 0 0 28px;">
                <a href="${resetUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%); color: #ffffff; padding: 14px 28px; border-radius: 12px; font-weight: 700; text-decoration: none; font-size: 15px; box-shadow: 0 4px 12px rgba(234, 88, 12, 0.35);">
                  🔑 คลิกที่นี่เพื่อตั้งรหัสผ่านใหม่ทันที
                </a>
                <p style="margin: 8px 0 0; color: #64748b; font-size: 11px;">
                  (ไม่ต้องกรอกรหัส OTP สะดวกและปลอดภัย ลิงก์มีอายุ 15 นาที)
                </p>
              </div>

              <div style="text-align: center; margin: 20px 0 16px;">
                <span style="color: #94a3b8; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                  — หรือกรอกรหัส OTP ในหน้าต่างเว็บไซต์ —
                </span>
              </div>
      `
      : '';

    const html = `
<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${purposeTitle}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td align="center" style="padding: 40px 10px;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: 0.5px;">
                🚗 MOBEX <span style="color: #41cac0; font-weight: 400;">Auto Parts</span>
              </h1>
              <p style="margin: 6px 0 0; color: #94a3b8; font-size: 13px;">ศูนย์รวมอะไหล่รถยนต์ตรงรุ่นคุณภาพสูง</p>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 40px 40px 30px;">
              <h2 style="margin: 0 0 16px; color: #0f172a; font-size: 20px; font-weight: 700; text-align: center;">
                ${purposeTitle}
              </h2>
              <p style="margin: 0 0 24px; color: #475569; font-size: 14px; line-height: 1.6; text-align: center;">
                คุณได้ทำรายการสำหรับบัญชี <strong>${to}</strong><br>กรุณาเลือกวิธียืนยันตัวตนด้านล่างเพื่อดำเนินการต่อ:
              </p>

              ${resetLinkHtml}

              <!-- OTP Box -->
              <div style="background-color: #f1f5f9; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 20px; text-align: center; margin: 0 0 24px;">
                <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #0284c7;">
                  ${code}
                </span>
                <p style="margin: 10px 0 0; color: #64748b; font-size: 12px;">
                  ⏱️ รหัสนี้มีอายุการใช้งาน <strong>${config.OTP_TTL_MINUTES} นาที</strong>
                </p>
              </div>

              <!-- Security Advice -->
              <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 14px; margin-bottom: 24px;">
                <p style="margin: 0; color: #b45309; font-size: 12px; line-height: 1.5;">
                  🔒 <strong>คำเตือนความปลอดภัย:</strong> โปรดอย่าเปิดเผยรหัส OTP หรือส่งต่อลิงก์นี้แก่ผู้อื่น เจ้าหน้าที่ของ MOBEX จะไม่มีวันขอรหัสจากท่าน
                </p>
              </div>

              <p style="margin: 0; color: #94a3b8; font-size: 12px; line-height: 1.5; text-align: center;">
                หากท่านไม่ได้เป็นผู้ทำรายการนี้ สามารถละเว้นอีเมลฉบับนี้ได้อย่างปลอดภัย
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 40px; text-align: center;">
              <p style="margin: 0 0 4px; color: #64748b; font-size: 12px; font-weight: 600;">
                MOBEX Auto Parts Platform &bull; market.autocentric.net
              </p>
              <p style="margin: 0; color: #94a3b8; font-size: 11px;">
                ระบบบริหารจัดการแค็ตตาล็อกอะไหล่ยานยนต์และการค้าครบวงจร
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const transporter = this.getTransporter();

    if (transporter) {
      try {
        await transporter.sendMail({
          from: config.SMTP_FROM,
          to,
          subject,
          html,
        });
        console.log(`[MailService] ✅ OTP email delivered via SMTP to ${to} (${purpose})`);
        return true;
      } catch (err: any) {
        console.error(`[MailService] ⚠️ SMTP delivery failed to ${to}:`, err.message);
        // Fall back to console logging
      }
    }

    // Fallback: In development/test, log to server stdout for easy local testing
    if (config.NODE_ENV !== 'production') {
      console.log(`\n=================================================`);
      console.log(` 📧 [EMAIL NOTIFICATION SIMULATOR] To: ${to}`);
      console.log(` 🔑 OTP CODE: ${code}`);
      if (resetUrl) {
        console.log(` 🔗 RESET LINK: ${resetUrl}`);
      }
      console.log(` 🎯 PURPOSE: ${purpose} (Valid for ${config.OTP_TTL_MINUTES} mins)`);
      console.log(`=================================================\n`);
    } else {
      console.warn(`[MailService] Warning: SMTP not configured or failed for ${to} (${purpose})`);
    }
    return true;
  }
}
