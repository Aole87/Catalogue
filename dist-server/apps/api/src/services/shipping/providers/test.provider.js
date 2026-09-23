"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestShippingProvider = void 0;
const crypto_1 = __importDefault(require("crypto"));
class TestShippingProvider {
    name = 'TEST';
    static TEST_WEBHOOK_SECRET = 'test-shipping-hmac-secret-key-12345';
    /**
     * Helper utility for tests to generate valid HMAC-SHA256 signatures.
     */
    static signPayload(payload, timestamp) {
        const ts = timestamp ? String(timestamp) : String(Math.floor(Date.now() / 1000));
        const raw = typeof payload === 'string' ? payload : JSON.stringify(payload);
        const signature = crypto_1.default
            .createHmac('sha256', TestShippingProvider.TEST_WEBHOOK_SECRET)
            .update(`${ts}.${raw}`)
            .digest('hex');
        return {
            'x-shipping-signature': signature,
            'x-signature': signature,
            'x-timestamp': ts,
        };
    }
    signPayload(payload, timestamp) {
        return TestShippingProvider.signPayload(payload, timestamp);
    }
    verifyWebhookSignature(headers, rawBody) {
        const signature = (headers['x-signature'] || headers['x-shipping-signature'] || '');
        const timestampHeader = (headers['x-timestamp'] || '');
        const rawString = typeof rawBody === 'string' ? rawBody : JSON.stringify(rawBody);
        const expectedSignature = crypto_1.default
            .createHmac('sha256', TestShippingProvider.TEST_WEBHOOK_SECRET)
            .update(timestampHeader ? `${timestampHeader}.${rawString}` : rawString)
            .digest('hex');
        return (signature.length === expectedSignature.length &&
            crypto_1.default.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature)));
    }
    generateTrackingNumber() {
        return `TEST-TRK-${Date.now().toString().slice(-6)}`;
    }
    async createShipment(params) {
        const trackingNumber = this.generateTrackingNumber();
        return {
            carrier: 'Test Courier Service',
            trackingNumber,
            serviceLevel: params.serviceLevel || 'STANDARD',
            estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            providerShipmentId: `TEST-SHP-${Date.now()}`,
            labelUrl: `https://test-courier.local/labels/${trackingNumber}`,
            metadata: {
                isTest: true,
                orderNumber: params.orderNumber,
            },
        };
    }
    async getTracking(params) {
        return {
            carrier: 'Test Courier Service',
            trackingNumber: params.trackingNumber,
            status: 'IN_TRANSIT',
            checkpoints: [
                {
                    status: 'SHIPPED',
                    description: 'พัสดุรับเข้าระบบทดสอบเรียบร้อยแล้ว',
                    location: 'Test Hub BKK',
                    occurredAt: new Date(Date.now() - 3600000),
                },
            ],
        };
    }
    async cancelShipment(params) {
        return {
            cancelled: true,
            message: `Shipment ${params.trackingNumber} cancelled in test provider`,
        };
    }
    async handleWebhook(params) {
        const headers = params.headers;
        const signature = (headers['x-signature'] || headers['x-shipping-signature'] || '');
        const timestampHeader = (headers['x-timestamp'] || '');
        const rawString = typeof params.rawBody === 'string' ? params.rawBody : JSON.stringify(params.rawBody);
        const parsedPayload = typeof params.rawBody === 'object' ? params.rawBody : JSON.parse(rawString);
        if (timestampHeader) {
            const requestTime = parseInt(timestampHeader, 10);
            const currentTime = Math.floor(Date.now() / 1000);
            if (isNaN(requestTime) || Math.abs(currentTime - requestTime) > 300) {
                return {
                    isValid: false,
                    eventId: parsedPayload?.eventId || 'unknown',
                    eventType: parsedPayload?.eventType || 'unknown',
                    trackingNumber: parsedPayload?.trackingNumber || '',
                    status: 'IN_TRANSIT',
                    description: '',
                    occurredAt: new Date(),
                    rawPayload: parsedPayload,
                    failureReason: 'Webhook timestamp expired or out of tolerance window (Replay Attack Protection)',
                };
            }
        }
        const expectedSignature = crypto_1.default
            .createHmac('sha256', TestShippingProvider.TEST_WEBHOOK_SECRET)
            .update(timestampHeader ? `${timestampHeader}.${rawString}` : rawString)
            .digest('hex');
        const signatureValid = signature.length === expectedSignature.length &&
            crypto_1.default.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
        if (!signatureValid) {
            return {
                isValid: false,
                eventId: parsedPayload?.eventId || 'unknown',
                eventType: parsedPayload?.eventType || 'unknown',
                trackingNumber: parsedPayload?.trackingNumber || '',
                status: 'IN_TRANSIT',
                description: '',
                occurredAt: new Date(),
                rawPayload: parsedPayload,
                failureReason: 'Invalid webhook HMAC signature',
            };
        }
        let status = 'IN_TRANSIT';
        const rawStatus = (parsedPayload.status || '').toUpperCase();
        if (rawStatus === 'DELIVERED' || rawStatus === 'SUCCESS') {
            status = 'DELIVERED';
        }
        else if (rawStatus === 'OUT_FOR_DELIVERY') {
            status = 'OUT_FOR_DELIVERY';
        }
        else if (rawStatus === 'FAILED') {
            status = 'FAILED';
        }
        else if (rawStatus === 'RETURNED') {
            status = 'RETURNED';
        }
        return {
            isValid: true,
            eventId: parsedPayload.eventId || `test_evt_${Date.now()}`,
            eventType: parsedPayload.eventType || 'STATUS_UPDATE',
            trackingNumber: parsedPayload.trackingNumber,
            status,
            description: parsedPayload.description || `Test courier status update: ${status}`,
            location: parsedPayload.location || 'Test DC Bangkok',
            occurredAt: parsedPayload.occurredAt ? new Date(parsedPayload.occurredAt) : new Date(),
            rawPayload: parsedPayload,
        };
    }
}
exports.TestShippingProvider = TestShippingProvider;
//# sourceMappingURL=test.provider.js.map