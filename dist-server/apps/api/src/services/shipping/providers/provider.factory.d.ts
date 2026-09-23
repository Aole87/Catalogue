import { ShippingProvider } from './provider.interface';
export declare class ShippingProviderFactory {
    private static providers;
    static getProvider(carrierName: string): ShippingProvider;
}
