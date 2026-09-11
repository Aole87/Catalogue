import { Decimal } from '@prisma/client/runtime/library';

export interface CreatePaymentProviderParams {
  paymentId: string;
  orderId: string;
  orderNumber: string;
  internalReference: string;
  amount: string; // Decimal formatted string e.g. "1999.99"
  currency: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  idempotencyKey?: string;
}

export interface CreatePaymentProviderResult {
  provider: string;
  method: string;
  providerReference: string;
  qrPayload?: string;
  qrImageUrl?: string;
  paymentUrl?: string;
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
    promptpayId?: string;
  };
  expiresAt?: Date;
  metadata?: Record<string, any>;
}

export interface VerifyPaymentProviderParams {
  paymentId: string;
  internalReference: string;
  providerReference?: string;
  expectedAmount: string;
  expectedCurrency: string;
}

export interface VerifyPaymentProviderResult {
  isVerified: boolean;
  status: 'PAID' | 'PENDING' | 'FAILED';
  paidAmount?: string;
  currency?: string;
  providerTransactionId?: string;
  rawResponse?: Record<string, any>;
  failureReason?: string;
}

export interface WebhookProcessParams {
  rawBody: string | Buffer | Record<string, any>;
  headers: Record<string, string | string[] | undefined>;
}

export interface WebhookProcessResult {
  isValid: boolean;
  eventId: string;
  eventType: string;
  internalReference: string;
  providerReference: string;
  amount: string;
  currency: string;
  status: 'PAID' | 'FAILED' | 'REFUNDED';
  paidAt?: Date;
  rawPayload: Record<string, any>;
  failureReason?: string;
}

export interface RefundPaymentProviderParams {
  paymentId: string;
  internalReference: string;
  providerReference?: string;
  refundAmount: string;
  currency: string;
  reason: string;
  idempotencyKey?: string;
}

export interface RefundPaymentProviderResult {
  success: boolean;
  refundReference: string;
  providerRefundId?: string;
  refundedAmount: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  rawResponse?: Record<string, any>;
  failureReason?: string;
}

export interface PaymentProvider {
  readonly name: string;
  createPayment(params: CreatePaymentProviderParams): Promise<CreatePaymentProviderResult>;
  verifyPayment(params: VerifyPaymentProviderParams): Promise<VerifyPaymentProviderResult>;
  handleWebhook(params: WebhookProcessParams): Promise<WebhookProcessResult>;
  refundPayment(params: RefundPaymentProviderParams): Promise<RefundPaymentProviderResult>;
}
