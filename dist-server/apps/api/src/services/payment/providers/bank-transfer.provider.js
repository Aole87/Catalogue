"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BankTransferProvider = void 0;
const crypto_1 = __importDefault(require("crypto"));
class BankTransferProvider {
    name = 'BANK_TRANSFER';
    bankAccounts = [
        {
            bankName: 'ธนาคารกสิกรไทย (KBANK)',
            accountNumber: '098-2-12345-6',
            accountName: 'บจก. โมเบ็กซ์ ออโต้พาร์ท (MOBEX AUTO PARTS CO., LTD.)',
            branch: 'สาขาสยามพารากอน',
        },
        {
            bankName: 'ธนาคารไทยพาณิชย์ (SCB)',
            accountNumber: '111-3-98765-4',
            accountName: 'บจก. โมเบ็กซ์ ออโต้พาร์ท (MOBEX AUTO PARTS CO., LTD.)',
            branch: 'สาขาเซ็นทรัลเวิลด์',
        },
        {
            bankName: 'ธนาคารกรุงเทพ (BBL)',
            accountNumber: '205-0-54321-0',
            accountName: 'บจก. โมเบ็กซ์ ออโต้พาร์ท (MOBEX AUTO PARTS CO., LTD.)',
            branch: 'สาขาสีลม',
        },
    ];
    async createPayment(params) {
        const providerReference = `BT-${Date.now()}-${crypto_1.default.randomBytes(4).toString('hex').toUpperCase()}`;
        return {
            provider: this.name,
            method: 'SLIP_UPLOAD',
            providerReference,
            bankDetails: this.bankAccounts[0],
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
            metadata: {
                allBankAccounts: this.bankAccounts,
                orderNumber: params.orderNumber,
                instructions: 'กรุณาโอนเงินตามยอดที่ระบุและแนบหลักฐานสลิปการโอนเงินเพื่อการตรวจสอบ',
            },
        };
    }
    async verifyPayment(params) {
        // Bank transfer requires slip verification workflow by staff
        return {
            isVerified: false,
            status: 'PENDING',
            paidAmount: params.expectedAmount,
            currency: params.expectedCurrency,
        };
    }
    async handleWebhook(params) {
        // Direct bank transfer does not have automatic incoming webhook; uses slip workflow
        return {
            isValid: false,
            eventId: 'unsupported',
            eventType: 'UNSUPPORTED',
            internalReference: '',
            providerReference: '',
            amount: '0.00',
            currency: 'THB',
            status: 'FAILED',
            rawPayload: typeof params.rawBody === 'object' ? params.rawBody : {},
            failureReason: 'Bank Transfer does not accept automated webhooks. Use slip verification workflow.',
        };
    }
    async refundPayment(params) {
        const refundReference = `REF-BT-${Date.now()}-${crypto_1.default.randomBytes(3).toString('hex').toUpperCase()}`;
        return {
            success: true,
            refundReference,
            providerRefundId: `BT-REF-${Date.now()}`,
            refundedAmount: params.refundAmount,
            status: 'COMPLETED',
            rawResponse: {
                refundReference,
                provider: this.name,
                amount: params.refundAmount,
                currency: params.currency,
                reason: params.reason,
            },
        };
    }
}
exports.BankTransferProvider = BankTransferProvider;
//# sourceMappingURL=bank-transfer.provider.js.map