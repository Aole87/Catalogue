"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShippingProviderFactory = void 0;
const flash_express_provider_1 = require("./flash-express.provider");
const kerry_express_provider_1 = require("./kerry-express.provider");
const test_provider_1 = require("./test.provider");
const app_error_1 = require("../../../errors/app-error");
class ShippingProviderFactory {
    static providers = new Map([
        ['FLASH', new flash_express_provider_1.FlashExpressProvider()],
        ['KERRY', new kerry_express_provider_1.KerryExpressProvider()],
        ['STANDARD', new flash_express_provider_1.FlashExpressProvider()],
        ['TEST', new test_provider_1.TestShippingProvider()],
        ['SCG_COOL', new flash_express_provider_1.FlashExpressProvider()],
        ['LALAMOVE', new flash_express_provider_1.FlashExpressProvider()],
    ]);
    static getProvider(carrierName) {
        const normalized = (carrierName || 'STANDARD').toUpperCase().trim();
        const provider = this.providers.get(normalized);
        if (!provider) {
            throw new app_error_1.BadRequestException(`Unsupported shipping provider: '${carrierName}'. Supported: FLASH, KERRY, STANDARD, TEST`);
        }
        return provider;
    }
}
exports.ShippingProviderFactory = ShippingProviderFactory;
//# sourceMappingURL=provider.factory.js.map