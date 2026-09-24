import { z } from 'zod';

export const sendOtpSchema = z.object({
  email: z.string().trim().toLowerCase().email('รูปแบบอีเมลไม่ถูกต้อง'),
  purpose: z.enum(['REGISTRATION', 'PASSWORD_RESET', 'VERIFY_EMAIL']).default('REGISTRATION'),
});

export type SendOtpInput = z.infer<typeof sendOtpSchema>;

export const verifyOtpSchema = z.object({
  email: z.string().trim().toLowerCase().email('รูปแบบอีเมลไม่ถูกต้อง'),
  code: z.string().trim().min(4, 'รหัส OTP ต้องมีอย่างน้อย 4 หลัก').max(8, 'รหัส OTP ไม่เกิน 8 หลัก'),
  purpose: z.enum(['REGISTRATION', 'PASSWORD_RESET', 'VERIFY_EMAIL']).default('REGISTRATION'),
});

export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;

export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password cannot exceed 100 characters'),
  firstName: z.string().trim().min(1, 'First name is required').max(50),
  lastName: z.string().trim().min(1, 'Last name is required').max(50),
  phone: z.string().trim().optional(),
  displayName: z.string().trim().optional(),
  verificationToken: z.string().trim().optional(),
  verificationCode: z.string().trim().optional(),
  customerType: z.enum(['CUSTOMER', 'GARAGE', 'SHOP']).default('CUSTOMER'),
  companyName: z.string().trim().max(100).optional(),
  taxId: z.string().trim().max(20).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().trim().min(1, 'Username or Email is required'),
  username: z.string().trim().optional(),
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters')
    .max(100, 'New password cannot exceed 100 characters'),
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export interface AuthUserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string | null;
  phone: string | null;
  isActive: boolean;
  customerProfile: {
    id: string;
    customerType: string;
    companyName: string | null;
    isVerified: boolean;
  } | null;
  roles: string[];
  permissions: string[];
}
