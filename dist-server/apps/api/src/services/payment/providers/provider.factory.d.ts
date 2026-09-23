import { PaymentProvider } from './provider.interface';
export declare class PaymentProviderFactory {
    private static providers;
    /**
     * Resolves the configured provider instance by provider name.
     */
    static getProvider(providerName: string): PaymentProvider;
}
