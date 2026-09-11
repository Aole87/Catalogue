# Courier Provider Integration & Abstraction

## 1. Provider-Agnostic Interface
The system interacts with logistics couriers through the uniform `ShippingProvider` interface (`apps/api/src/services/shipping/providers/provider.interface.ts`), ensuring zero vendor lock-in.

```typescript
export interface ShippingProvider {
  readonly name: string;
  createShipment(params: CreateShipmentProviderParams): Promise<CreateShipmentProviderResult>;
  getTracking(params: GetTrackingProviderParams): Promise<GetTrackingProviderResult>;
  cancelShipment(params: CancelShipmentProviderParams): Promise<CancelShipmentProviderResult>;
  handleWebhook(params: ShippingWebhookProcessParams): Promise<ShippingWebhookProcessResult>;
}
```

---

## 2. Supported Logistics Couriers

### 1. Flash Express (`FlashExpressProvider`)
- **Carrier Code:** `FLASH`, `STANDARD`
- **Tracking Format:** `TH` + 7-digit timestamp/sequence + 4-hex random + `F` (14 characters e.g. `TH0123456789ABCD_F` / `TH...F`).
- **Signature Method:** `HMAC-SHA256` computed over `timestamp + '.' + rawPayload` using `FLASH_EXPRESS_WEBHOOK_SECRET`.
- **Status:** Real Provider Adapter.

### 2. Kerry Express (`KerryExpressProvider`)
- **Carrier Code:** `KERRY`
- **Tracking Format:** `KEX` + 6-digit timestamp + 4-hex random (13 characters e.g. `KEX123456ABCD`).
- **Signature Method:** `HMAC-SHA256` with header `x-kerry-signature`.
- **Status:** Real Provider Adapter.

### 3. SCG Express & Lalamove (`FlashExpressProvider` / SCG Adapter)
- **Carrier Code:** `SCG_COOL`, `LALAMOVE`
- **Status:** Real Provider Adapter.

### 4. Test Shipping Provider (`TestShippingProvider`)
- **Carrier Code:** `TEST`
- **Tracking Format:** `TEST-TRK-` + timestamp.
- **Features:** Deterministic test adapter with `signPayload()` helper and out-of-order webhook simulation.
- **Status:** **TEST-ONLY**.

---

## 3. Provider Factory Resolution

`ShippingProviderFactory.getProvider(carrierCode)` resolves the appropriate carrier adapter:

```typescript
const provider = ShippingProviderFactory.getProvider('FLASH');
const labelResult = await provider.createShipment({ ... });
```
