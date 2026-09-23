import { PaymentProvider, CreatePaymentProviderParams, CreatePaymentProviderResult, VerifyPaymentProviderParams, VerifyPaymentProviderResult, WebhookProcessParams, WebhookProcessResult, RefundPaymentProviderParams, RefundPaymentProviderResult } from './provider.interface';
export declare class BankTransferProvider implements PaymentProvider {
    readonly name = "BANK_TRANSFER";
    private readonly bankAccounts;
    createPayment(params: CreatePaymentProviderParams): Promise<CreatePaymentProviderResult>;
    verifyPayment(params: VerifyPaymentProviderParams): Promise<VerifyPaymentProviderResult>;
    handleWebhook(params: WebhookProcessParams): Promise<WebhookProcessResult>;
    refundPayment(params: RefundPaymentProviderParams): Promise<RefundPaymentProviderResult>;
}
