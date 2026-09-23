import { ShippingProvider, CreateShipmentProviderParams, CreateShipmentProviderResult, GetTrackingProviderParams, GetTrackingProviderResult, CancelShipmentProviderParams, CancelShipmentProviderResult, ShippingWebhookProcessParams, ShippingWebhookProcessResult } from './provider.interface';
export declare class FlashExpressProvider implements ShippingProvider {
    readonly name = "FLASH";
    private readonly webhookSecret;
    generateTrackingNumber(): string;
    createShipment(params: CreateShipmentProviderParams): Promise<CreateShipmentProviderResult>;
    getTracking(params: GetTrackingProviderParams): Promise<GetTrackingProviderResult>;
    cancelShipment(params: CancelShipmentProviderParams): Promise<CancelShipmentProviderResult>;
    handleWebhook(params: ShippingWebhookProcessParams): Promise<ShippingWebhookProcessResult>;
}
