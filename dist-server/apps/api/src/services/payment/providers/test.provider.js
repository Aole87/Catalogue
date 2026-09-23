"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestPaymentProvider = void 0;
const crypto_1 = __importDefault(require("crypto"));
class TestPaymentProvider {
    name = 'TEST';
    static TEST_WEBHOOK_SECRET = 'test-provider-hmac-secret-key-12345';
    /**
     * Helper utility for tests to generate valid HMAC-SHA256 signatures.
     */
    static signPayload(payload, timestamp) {
        const ts = timestamp ? String(timestamp) : String(Math.floor(Date.now() / 1000));
        const raw = typeof payload === 'string' ? payload : JSON.stringify(payload);
        const signature = crypto_1.default
            .createHmac('sha256', TestPaymentProvider.TEST_WEBHOOK_SECRET)
            .update(`${ts}.${raw}`)
            .digest('hex');
        return { signature, timestamp: ts };
    }
    async createPayment(params) {
        const providerReference = `TEST-TX-${Date.now()}-${crypto_1.default.randomBytes(3).toString('hex').toUpperCase()}`;
        return {
            provider: this.name,
            method: 'TEST_ADAPTER',
            providerReference,
            paymentUrl: `https://test-gateway.mobex.local/pay/${providerReference}`,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000),
            metadata: {
                isTest: true,
                orderNumber: params.orderNumber,
            },
        };
    }
    async verifyPayment(params) {
        return {
            isVerified: true,
            status: 'PAID',
            paidAmount: params.expectedAmount,
            currency: params.expectedCurrency,
            providerTransactionId: `TEST-TX-VERIFIED-${Date.now()}`,
        };
    }
    async handleWebhook(params) {
        const headers = params.headers;
        const signature = (headers['x-signature'] || '');
        const timestampHeader = (headers['x-timestamp'] || '');
        const rawString = typeof params.rawBody === 'string' ? params.rawBody : JSON.stringify(params.rawBody);
        const parsedPayload = typeof params.rawBody === 'object' ? params.rawBody : JSON.parse(rawString);
        // 1. Timestamp tolerance (300 seconds)
        if (timestampHeader) {
            const requestTime = parseInt(timestampHeader, 10);
            const currentTime = Math.floor(Date.now() / 1000);
            if (isNaN(requestTime) || Math.abs(currentTime - requestTime) > 300) {
                return {
                    isValid: false,
                    eventId: parsedPayload?.eventId || 'unknown',
                    eventType: parsedPayload?.eventType || 'unknown',
                    internalReference: parsedPayload?.internalReference || '',
                    providerReference: parsedPayload?.providerReference || '',
                    amount: '0.00',
                    currency: 'THB',
                    status: 'FAILED',
                    rawPayload: parsedPayload,
                    failureReason: 'Webhook timestamp expired or out of tolerance window (Replay Attack Protection)',
                };
            }
        }
        // 2. Signature verification
        const expectedSignature = crypto_1.default
            .createHmac('sha256', TestPaymentProvider.TEST_WEBHOOK_SECRET)
            .update(timestampHeader ? `${timestampHeader}.${rawString}` : rawString)
            .digest('hex');
        const signatureValid = signature.length === expectedSignature.length &&
            crypto_1.default.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
        if (!signatureValid) {
            return {
                isValid: false,
                eventId: parsedPayload?.eventId || 'unknown',
                eventType: parsedPayload?.eventType || 'unknown',
                internalReference: parsedPayload?.internalReference || '',
                providerReference: parsedPayload?.providerReference || '',
                amount: '0.00',
                currency: 'THB',
                status: 'FAILED',
                rawPayload: parsedPayload,
                failureReason: 'Invalid webhook HMAC signature',
            };
        }
        return {
            isValid: true,
            eventId: parsedPayload.eventId || `evt_${Date.now()}`,
            eventType: parsedPayload.eventType || 'PAYMENT_SETTLED',
            internalReference: parsedPayload.internalReference,
            providerReference: parsedPayload.providerReference || `TEST-TX-${Date.now()}`,
            amount: Number(parsedPayload.amount).toFixed(2),
            currency: parsedPayload.currency || 'THB',
            status: parsedPayload.status === 'SUCCESS' || parsedPayload.status === 'PAID' ? 'PAID' : 'FAILED',
            paidAt: parsedPayload.paidAt ? new Date(parsedPayload.paidAt) : new Date(),
            rawPayload: parsedPayload,
        };
    }
    async refundPayment(params) {
        const refundReference = `REF-TEST-${Date.now()}-${crypto_1.default.randomBytes(3).toString('hex').toUpperCase()}`;
        return {
            success: true,
            refundReference,
            providerRefundId: `TEST-REF-${Date.now()}`,
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
exports.TestPaymentProvider = TestPaymentProvider;
//# sourceMappingURL=test.provider.js.map