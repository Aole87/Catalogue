"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlashExpressProvider = void 0;
const crypto_1 = __importDefault(require("crypto"));
class FlashExpressProvider {
    name = 'FLASH';
    webhookSecret = process.env.FLASH_EXPRESS_WEBHOOK_SECRET || 'flash-express-hmac-sha256-secret-key';
    generateTrackingNumber() {
        const randomHex = crypto_1.default.randomBytes(2).toString('hex').slice(0, 4).toUpperCase();
        return `TH${Date.now().toString().slice(-7)}${randomHex}F`;
    }
    async createShipment(params) {
        const trackingNumber = this.generateTrackingNumber();
        return {
            carrier: 'Flash Express',
            trackingNumber,
            serviceLevel: params.serviceLevel || 'STANDARD',
            estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
            providerShipmentId: `FLS-${Date.now()}`,
            labelUrl: `https://labels.flashexpress.co.th/print/${trackingNumber}`,
            metadata: {
                orderNumber: params.orderNumber,
                recipient: params.recipientName,
                destinationProvince: params.province,
            },
        };
    }
    async getTracking(params) {
        return {
            carrier: 'Flash Express',
            trackingNumber: params.trackingNumber,
            status: 'IN_TRANSIT',
            checkpoints: [
                {
                    status: 'SHIPPED',
                    description: 'พัสดุถูกรับเข้าระบบ Flash Express เรียบร้อยแล้ว',
                    location: 'ศูนย์กระจายสินค้า กทม. (BKK-HUB)',
                    occurredAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
                },
                {
                    status: 'IN_TRANSIT',
                    description: 'พัสดุอยู่ระหว่างการส่งต่อไปยังศูนย์คัดแยกปลายทาง',
                    location: 'ศูนย์คัดแยกพัสดุ วังทองหลาง',
                    occurredAt: new Date(),
                },
            ],
        };
    }
    async cancelShipment(params) {
        return {
            cancelled: true,
            message: `Shipment ${params.trackingNumber} cancelled successfully at Flash Express`,
        };
    }
    async handleWebhook(params) {
        const headers = params.headers;
        const signature = (headers['x-signature'] || headers['x-flash-signature'] || '');
        const timestampHeader = (headers['x-timestamp'] || headers['x-request-timestamp'] || '');
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
                    trackingNumber: parsedPayload?.trackingNumber || '',
                    status: 'IN_TRANSIT',
                    description: '',
                    occurredAt: new Date(),
                    rawPayload: parsedPayload,
                    failureReason: 'Webhook timestamp expired or out of tolerance window (Replay Attack Protection)',
                };
            }
        }
        // 2. HMAC-SHA256 signature verification
        const expectedSignature = crypto_1.default
            .createHmac('sha256', this.webhookSecret)
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
                failureReason: 'Invalid Flash Express webhook HMAC signature',
            };
        }
        // Map status code
        let status = 'IN_TRANSIT';
        const rawStatus = (parsedPayload.status || '').toUpperCase();
        if (rawStatus === 'DELIVERED' || rawStatus === 'SUCCESS') {
            status = 'DELIVERED';
        }
        else if (rawStatus === 'OUT_FOR_DELIVERY' || rawStatus === 'DELIVERING') {
            status = 'OUT_FOR_DELIVERY';
        }
        else if (rawStatus === 'FAILED' || rawStatus === 'REJECTED') {
            status = 'FAILED';
        }
        else if (rawStatus === 'RETURNED') {
            status = 'RETURNED';
        }
        return {
            isValid: true,
            eventId: parsedPayload.eventId || `flash_evt_${Date.now()}`,
            eventType: parsedPayload.eventType || 'STATUS_UPDATE',
            trackingNumber: parsedPayload.trackingNumber,
            status,
            description: parsedPayload.description || `Flash Express status update: ${status}`,
            location: parsedPayload.location || 'ศูนย์บริการ Flash Express',
            occurredAt: parsedPayload.occurredAt ? new Date(parsedPayload.occurredAt) : new Date(),
            rawPayload: parsedPayload,
        };
    }
}
exports.FlashExpressProvider = FlashExpressProvider;
//# sourceMappingURL=flash-express.provider.js.map