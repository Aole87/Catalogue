import crypto from 'crypto';
import {
  ShippingProvider,
  CreateShipmentProviderParams,
  CreateShipmentProviderResult,
  GetTrackingProviderParams,
  GetTrackingProviderResult,
  CancelShipmentProviderParams,
  CancelShipmentProviderResult,
  ShippingWebhookProcessParams,
  ShippingWebhookProcessResult,
} from './provider.interface';

export class KerryExpressProvider implements ShippingProvider {
  readonly name = 'KERRY';
  private readonly webhookSecret = process.env.KERRY_EXPRESS_WEBHOOK_SECRET || 'kerry-express-hmac-sha256-secret-key';

  generateTrackingNumber(): string {
    const randomHex = crypto.randomBytes(2).toString('hex').toUpperCase();
    return `KEX${Date.now().toString().slice(-6)}${randomHex}`;
  }

  async createShipment(params: CreateShipmentProviderParams): Promise<CreateShipmentProviderResult> {
    const trackingNumber = this.generateTrackingNumber();

    return {
      carrier: 'Kerry Express',
      trackingNumber,
      serviceLevel: params.serviceLevel || 'EXPRESS',
      estimatedDelivery: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Next day
      providerShipmentId: `KEX-${Date.now()}`,
      labelUrl: `https://th.kerryexpress.com/track/${trackingNumber}`,
      metadata: {
        orderNumber: params.orderNumber,
        recipient: params.recipientName,
        destinationProvince: params.province,
      },
    };
  }

  async getTracking(params: GetTrackingProviderParams): Promise<GetTrackingProviderResult> {
    return {
      carrier: 'Kerry Express',
      trackingNumber: params.trackingNumber,
      status: 'IN_TRANSIT',
      checkpoints: [
        {
          status: 'SHIPPED',
          description: 'เคอรี่ เอ็กซ์เพรส รับพัสดุเรียบร้อยแล้ว',
          location: 'Kerry Hub บางนา',
          occurredAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        },
      ],
    };
  }

  async cancelShipment(params: CancelShipmentProviderParams): Promise<CancelShipmentProviderResult> {
    return {
      cancelled: true,
      message: `Shipment ${params.trackingNumber} cancelled successfully at Kerry Express`,
    };
  }

  async handleWebhook(params: ShippingWebhookProcessParams): Promise<ShippingWebhookProcessResult> {
    const headers = params.headers;
    const signature = (headers['x-signature'] || headers['x-kerry-signature'] || '') as string;
    const timestampHeader = (headers['x-timestamp'] || headers['x-request-timestamp'] || '') as string;

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

    const expectedSignature = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(timestampHeader ? `${timestampHeader}.${rawString}` : rawString)
      .digest('hex');

    const signatureValid =
      signature.length === expectedSignature.length &&
      crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));

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
        failureReason: 'Invalid Kerry Express webhook HMAC signature',
      };
    }

    let status: 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'FAILED' | 'RETURNED' = 'IN_TRANSIT';
    const rawStatus = (parsedPayload.status || '').toUpperCase();
    if (rawStatus === 'DELIVERED' || rawStatus === 'SUCCESS') {
      status = 'DELIVERED';
    } else if (rawStatus === 'OUT_FOR_DELIVERY' || rawStatus === 'DELIVERING') {
      status = 'OUT_FOR_DELIVERY';
    } else if (rawStatus === 'FAILED') {
      status = 'FAILED';
    } else if (rawStatus === 'RETURNED') {
      status = 'RETURNED';
    }

    return {
      isValid: true,
      eventId: parsedPayload.eventId || `kex_evt_${Date.now()}`,
      eventType: parsedPayload.eventType || 'STATUS_UPDATE',
      trackingNumber: parsedPayload.trackingNumber,
      status,
      description: parsedPayload.description || `Kerry Express status update: ${status}`,
      location: parsedPayload.location || 'Kerry Express DC',
      occurredAt: parsedPayload.occurredAt ? new Date(parsedPayload.occurredAt) : new Date(),
      rawPayload: parsedPayload,
    };
  }
}
