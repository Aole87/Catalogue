import { PaymentProvider, CreatePaymentProviderParams, CreatePaymentProviderResult, VerifyPaymentProviderParams, VerifyPaymentProviderResult, WebhookProcessParams, WebhookProcessResult, RefundPaymentProviderParams, RefundPaymentProviderResult } from './provider.interface';
export declare class PromptPayProvider implements PaymentProvider {
    readonly name = "PROMPTPAY";
    private readonly billerTaxId;
    private readonly webhookSecret;
    /**
     * Generates authoritative PromptPay EMVCo QR Payload with CRC-16 checksum.
     */
    generatePromptPayPayload(amount: string, reference: string): string;
    createPayment(params: CreatePaymentProviderParams): Promise<CreatePaymentProviderResult>;
    verifyPayment(params: VerifyPaymentProviderParams): Promise<VerifyPaymentProviderResult>;
    /**
     * Processes PromptPay webhook with HMAC-SHA256 signature verification and timestamp replay protection.
     */
    handleWebhook(params: WebhookProcessParams): Promise<WebhookProcessResult>;
    refundPayment(params: RefundPaymentProviderParams): Promise<RefundPaymentProviderResult>;
}
