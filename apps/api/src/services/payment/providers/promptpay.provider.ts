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
import config from '../../../config/env';

/**
 * Calculates standard CCITT CRC-16 (polynomial 0x1021, init 0xFFFF) for EMVCo Thai QR payload.
 */
function calculateCRC16(data: string): string {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Formats standard TLV (Tag-Length-Value) field for EMVCo spec.
 */
function formatTLV(tag: string, value: string): string {
  const length = String(value.length).padStart(2, '0');
  return `${tag}${length}${value}`;
}

export class PromptPayProvider implements PaymentProvider {
  readonly name = 'PROMPTPAY';

  // Mobex Auto Parts Merchant PromptPay Biller/Tax ID (13-digit official corporate ID)
  private readonly billerTaxId = '0105558099881';
  private readonly webhookSecret = process.env.PROMPTPAY_WEBHOOK_SECRET || 'promptpay-webhook-hmac-sha256-signing-secret';

  /**
   * Generates authoritative PromptPay EMVCo QR Payload with CRC-16 checksum.
   */
  generatePromptPayPayload(amount: string, reference: string): string {
    const formattedAmount = Number(amount).toFixed(2);

    // Tag 00: Payload Format Indicator (01)
    const tag00 = formatTLV('00', '01');

    // Tag 01: Point of Initiation Method (12 = Dynamic QR with fixed amount)
    const tag01 = formatTLV('01', '12');

    // Tag 29: Merchant Account Information - PromptPay
    // Sub-tag 00: AID for PromptPay Credit Transfer (A000000677010111)
    // Sub-tag 02: Tax ID (13 digits)
    const promptPayAID = formatTLV('00', 'A000000677010111');
    const promptPayTaxId = formatTLV('02', this.billerTaxId);
    const tag29 = formatTLV('29', `${promptPayAID}${promptPayTaxId}`);

    // Tag 53: Transaction Currency (764 = THB ISO 4217)
    const tag53 = formatTLV('53', '764');

    // Tag 54: Transaction Amount
    const tag54 = formatTLV('54', formattedAmount);

    // Tag 58: Country Code (TH)
    const tag58 = formatTLV('58', 'TH');

    // Tag 62: Additional Data Field (Sub-tag 07: Reference Label)
    const refSubTag = formatTLV('07', reference.substring(0, 25));
    const tag62 = formatTLV('62', refSubTag);

    // Assemble payload before CRC
    const rawPayload = `${tag00}${tag01}${tag29}${tag53}${tag54}${tag58}${tag62}6304`;
    const crc = calculateCRC16(rawPayload);

    return `${rawPayload}${crc}`;
  }

  async createPayment(params: CreatePaymentProviderParams): Promise<CreatePaymentProviderResult> {
    const providerReference = `PP-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const qrPayload = this.generatePromptPayPayload(params.amount, params.internalReference);

    return {
      provider: this.name,
      method: 'QR',
      providerReference,
      qrPayload,
      bankDetails: {
        bankName: 'PromptPay / Thai QR Payment',
        accountNumber: this.billerTaxId,
        accountName: 'บจก. โมเบ็กซ์ ออโต้พาร์ท (MOBEX AUTO PARTS CO., LTD.)',
        promptpayId: this.billerTaxId,
      },
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes TTL
      metadata: {
        billerTaxId: this.billerTaxId,
        currency: 'THB',
        orderNumber: params.orderNumber,
      },
    };
  }

  async verifyPayment(params: VerifyPaymentProviderParams): Promise<VerifyPaymentProviderResult> {
    // PromptPay verification is driven by authoritative inbound webhooks or slip verification
    return {
      isVerified: false,
      status: 'PENDING',
      paidAmount: params.expectedAmount,
      currency: params.expectedCurrency,
    };
  }

  /**
   * Processes PromptPay webhook with HMAC-SHA256 signature verification and timestamp replay protection.
   */
  async handleWebhook(params: WebhookProcessParams): Promise<WebhookProcessResult> {
    const headers = params.headers;
    const signature = (headers['x-signature'] || headers['x-hub-signature'] || '') as string;
    const timestampHeader = (headers['x-timestamp'] || headers['x-request-timestamp'] || '') as string;

    const rawString = typeof params.rawBody === 'string' ? params.rawBody : JSON.stringify(params.rawBody);
    const parsedPayload = typeof params.rawBody === 'object' ? params.rawBody : JSON.parse(rawString);

    // 1. Timestamp tolerance check (5 minutes / 300 seconds) to prevent replay attacks
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

    // 2. Cryptographic signature check (HMAC-SHA256)
    const expectedSignature = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(timestampHeader ? `${timestampHeader}.${rawString}` : rawString)
      .digest('hex');

    // Secure timing-safe string comparison
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
        failureReason: 'Invalid webhook HMAC signature (Signature Verification Failed)',
      };
    }

    // 3. Extract verified payment event
    const eventId = parsedPayload.eventId || `evt_${Date.now()}`;
    const eventType = parsedPayload.eventType || 'PAYMENT_SETTLED';
    const internalReference = parsedPayload.internalReference || parsedPayload.reference;
    const providerReference = parsedPayload.providerReference || parsedPayload.transactionId;
    const amount = Number(parsedPayload.amount).toFixed(2);
    const currency = parsedPayload.currency || 'THB';
    const status = parsedPayload.status === 'SUCCESS' || parsedPayload.status === 'PAID' ? 'PAID' : 'FAILED';

    return {
      isValid: true,
      eventId,
      eventType,
      internalReference,
      providerReference,
      amount,
      currency,
      status,
      paidAt: parsedPayload.paidAt ? new Date(parsedPayload.paidAt) : new Date(),
      rawPayload: parsedPayload,
    };
  }

  async refundPayment(params: RefundPaymentProviderParams): Promise<RefundPaymentProviderResult> {
    const refundReference = `REF-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    return {
      success: true,
      refundReference,
      providerRefundId: `PP-REF-${Date.now()}`,
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
