export interface CreateShipmentProviderParams {
    shipmentId: string;
    shipmentNumber: string;
    orderNumber: string;
    recipientName: string;
    phone: string;
    addressLine: string;
    subdistrict?: string;
    district?: string;
    province: string;
    postalCode: string;
    country: string;
    serviceLevel?: string;
    metadata?: Record<string, any>;
}
export interface CreateShipmentProviderResult {
    carrier: string;
    trackingNumber: string;
    serviceLevel: string;
    estimatedDelivery?: Date;
    providerShipmentId?: string;
    labelUrl?: string;
    metadata?: Record<string, any>;
}
export interface TrackingCheckpoint {
    status: string;
    description: string;
    location?: string;
    occurredAt: Date;
}
export interface GetTrackingProviderParams {
    trackingNumber: string;
    carrier?: string;
}
export interface GetTrackingProviderResult {
    carrier: string;
    trackingNumber: string;
    status: 'PENDING' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'FAILED' | 'RETURNED';
    checkpoints: TrackingCheckpoint[];
}
export interface CancelShipmentProviderParams {
    trackingNumber: string;
    carrier?: string;
    reason: string;
}
export interface CancelShipmentProviderResult {
    cancelled: boolean;
    message?: string;
    rawResponse?: Record<string, any>;
}
export interface ShippingWebhookProcessParams {
    rawBody: string | Buffer | Record<string, any>;
    headers: Record<string, string | string[] | undefined>;
}
export interface ShippingWebhookProcessResult {
    isValid: boolean;
    eventId: string;
    eventType: string;
    trackingNumber: string;
    status: 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'FAILED' | 'RETURNED';
    description: string;
    location?: string;
    occurredAt: Date;
    rawPayload: Record<string, any>;
    failureReason?: string;
}
export interface ShippingProvider {
    readonly name: string;
    createShipment(params: CreateShipmentProviderParams): Promise<CreateShipmentProviderResult>;
    getTracking(params: GetTrackingProviderParams): Promise<GetTrackingProviderResult>;
    cancelShipment(params: CancelShipmentProviderParams): Promise<CancelShipmentProviderResult>;
    handleWebhook(params: ShippingWebhookProcessParams): Promise<ShippingWebhookProcessResult>;
}
