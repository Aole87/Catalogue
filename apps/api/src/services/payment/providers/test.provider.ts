import crypto from 'crypto';
import {
  PaymentProvider,
  CreatePaymentProviderParams,
  CreatePaymentProviderResult,
  VerifyPaymentProviderParams,
  VerifyPaymentProviderResult,
  WebhookProcessParams,
  WebhookProcessResult,
  RefundPaymentProviderParams,
  RefundPaymentProviderResult,
} from './provider.interface';

export class TestPaymentProvider implements PaymentProvider {
  readonly name = 'TEST';
  static readonly TEST_WEBHOOK_SECRET = 'test-provider-hmac-secret-key-12345';

  /**
   * Helper utility for tests to generate valid HMAC-SHA256 signatures.
   */
  static signPayload(payload: any, timestamp?: number): { signature: string; timestamp: string } {
    const ts = timestamp ? String(timestamp) : String(Math.floor(Date.now() / 1000));
    const raw = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const signature = crypto
      .createHmac('sha256', TestPaymentProvider.TEST_WEBHOOK_SECRET)
      .update(`${ts}.${raw}`)
      .digest('hex');

    return { signature, timestamp: ts };
  }

  async createPayment(params: CreatePaymentProviderParams): Promise<CreatePaymentProviderResult> {
    const providerReference = `TEST-TX-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

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

  async verifyPayment(params: VerifyPaymentProviderParams): Promise<VerifyPaymentProviderResult> {
    return {
      isVerified: true,
      status: 'PAID',
      paidAmount: params.expectedAmount,
      currency: params.expectedCurrency,
      providerTransactionId: `TEST-TX-VERIFIED-${Date.now()}`,
    };
  }

  async handleWebhook(params: WebhookProcessParams): Promise<WebhookProcessResult> {
    const headers = params.headers;
    const signature = (headers['x-signature'] || '') as string;
    const timestampHeader = (headers['x-timestamp'] || '') as string;

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
    const expectedSignature = crypto
      .createHmac('sha256', TestPaymentProvider.TEST_WEBHOOK_SECRET)
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

  async refundPayment(params: RefundPaymentProviderParams): Promise<RefundPaymentProviderResult> {
    const refundReference = `REF-TEST-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
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
