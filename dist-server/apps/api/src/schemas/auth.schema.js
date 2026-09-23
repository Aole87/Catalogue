"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    email: zod_1.z.string().trim().toLowerCase().email('Invalid email address'),
    password: zod_1.z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .max(100, 'Password cannot exceed 100 characters'),
    firstName: zod_1.z.string().trim().min(1, 'First name is required').max(50),
    lastName: zod_1.z.string().trim().min(1, 'Last name is required').max(50),
    phone: zod_1.z.string().trim().optional(),
    displayName: zod_1.z.string().trim().optional(),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().trim().toLowerCase().email('Invalid email address'),
    password: zod_1.z.string().min(1, 'Password is required'),
});
exports.changePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string().min(1, 'Current password is required'),
    newPassword: zod_1.z
        .string()
        .min(8, 'New password must be at least 8 characters')
        .max(100, 'New password cannot exceed 100 characters'),
});
//# sourceMappingURL=auth.schema.js.map