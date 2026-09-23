import { PaymentProvider, CreatePaymentProviderParams, CreatePaymentProviderResult, VerifyPaymentProviderParams, VerifyPaymentProviderResult, WebhookProcessParams, WebhookProcessResult, RefundPaymentProviderParams, RefundPaymentProviderResult } from './provider.interface';
export declare class TestPaymentProvider implements PaymentProvider {
    readonly name = "TEST";
    static readonly TEST_WEBHOOK_SECRET = "test-provider-hmac-secret-key-12345";
    /**
     * Helper utility for tests to generate valid HMAC-SHA256 signatures.
     */
    static signPayload(payload: any, timestamp?: number): {
        signature: string;
        timestamp: string;
    };
    createPayment(params: CreatePaymentProviderParams): Promise<CreatePaymentProviderResult>;
    verifyPayment(params: VerifyPaymentProviderParams): Promise<VerifyPaymentProviderResult>;
    handleWebhook(params: WebhookProcessParams): Promise<WebhookProcessResult>;
    refundPayment(params: RefundPaymentProviderParams): Promise<RefundPaymentProviderResult>;
}
