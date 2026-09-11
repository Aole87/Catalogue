import { ShippingProvider } from './provider.interface';
import { FlashExpressProvider } from './flash-express.provider';
import { KerryExpressProvider } from './kerry-express.provider';
import { TestShippingProvider } from './test.provider';
import { BadRequestException } from '../../../errors/app-error';

export class ShippingProviderFactory {
  private static providers: Map<string, ShippingProvider> = new Map<string, ShippingProvider>([
    ['FLASH', new FlashExpressProvider()],
    ['KERRY', new KerryExpressProvider()],
    ['STANDARD', new FlashExpressProvider()],
    ['TEST', new TestShippingProvider()],
    ['SCG_COOL', new FlashExpressProvider()],
    ['LALAMOVE', new FlashExpressProvider()],
  ]);

  static getProvider(carrierName: string): ShippingProvider {
    const normalized = (carrierName || 'STANDARD').toUpperCase().trim();
    const provider = this.providers.get(normalized);
    if (!provider) {
      throw new BadRequestException(`Unsupported shipping provider: '${carrierName}'. Supported: FLASH, KERRY, STANDARD, TEST`);
    }
    return provider;
  }
}
