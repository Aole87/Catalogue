import { ShippingProvider, CreateShipmentProviderParams, CreateShipmentProviderResult, GetTrackingProviderParams, GetTrackingProviderResult, CancelShipmentProviderParams, CancelShipmentProviderResult, ShippingWebhookProcessParams, ShippingWebhookProcessResult } from './provider.interface';
export declare class TestShippingProvider implements ShippingProvider {
    readonly name = "TEST";
    static readonly TEST_WEBHOOK_SECRET = "test-shipping-hmac-secret-key-12345";
    /**
     * Helper utility for tests to generate valid HMAC-SHA256 signatures.
     */
    static signPayload(payload: any, timestamp?: number): {
        'x-shipping-signature': string;
        'x-signature': string;
        'x-timestamp': string;
    };
    signPayload(payload: any, timestamp?: number): Record<string, string>;
    verifyWebhookSignature(headers: Record<string, any>, rawBody: any): boolean;
    generateTrackingNumber(): string;
    createShipment(params: CreateShipmentProviderParams): Promise<CreateShipmentProviderResult>;
    getTracking(params: GetTrackingProviderParams): Promise<GetTrackingProviderResult>;
    cancelShipment(params: CancelShipmentProviderParams): Promise<CancelShipmentProviderResult>;
    handleWebhook(params: ShippingWebhookProcessParams): Promise<ShippingWebhookProcessResult>;
}
