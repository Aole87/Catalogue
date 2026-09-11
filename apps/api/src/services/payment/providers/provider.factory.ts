import { PaymentProvider } from './provider.interface';
import { PromptPayProvider } from './promptpay.provider';
import { BankTransferProvider } from './bank-transfer.provider';
import { TestPaymentProvider } from './test.provider';
import { BadRequestException } from '../../../errors/app-error';

export class PaymentProviderFactory {
  private static providers: Map<string, PaymentProvider> = new Map<string, PaymentProvider>([
    ['PROMPTPAY', new PromptPayProvider()],
    ['BANK_TRANSFER', new BankTransferProvider()],
    ['TEST', new TestPaymentProvider()],
    // Fallback aliases
    ['QR', new PromptPayProvider()],
    ['SLIP_UPLOAD', new BankTransferProvider()],
  ]);

  /**
   * Resolves the configured provider instance by provider name.
   */
  static getProvider(providerName: string): PaymentProvider {
    const normalizedName = providerName.toUpperCase().trim();
    const provider = this.providers.get(normalizedName);
    if (!provider) {
      throw new BadRequestException(`Unsupported payment provider: '${providerName}'. Supported: PROMPTPAY, BANK_TRANSFER, TEST`);
    }
    return provider;
  }
}
