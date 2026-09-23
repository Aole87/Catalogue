"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentProviderFactory = void 0;
const promptpay_provider_1 = require("./promptpay.provider");
const bank_transfer_provider_1 = require("./bank-transfer.provider");
const test_provider_1 = require("./test.provider");
const app_error_1 = require("../../../errors/app-error");
class PaymentProviderFactory {
    static providers = new Map([
        ['PROMPTPAY', new promptpay_provider_1.PromptPayProvider()],
        ['BANK_TRANSFER', new bank_transfer_provider_1.BankTransferProvider()],
        ['TEST', new test_provider_1.TestPaymentProvider()],
        // Fallback aliases
        ['QR', new promptpay_provider_1.PromptPayProvider()],
        ['SLIP_UPLOAD', new bank_transfer_provider_1.BankTransferProvider()],
    ]);
    /**
     * Resolves the configured provider instance by provider name.
     */
    static getProvider(providerName) {
        const normalizedName = providerName.toUpperCase().trim();
        const provider = this.providers.get(normalizedName);
        if (!provider) {
            throw new app_error_1.BadRequestException(`Unsupported payment provider: '${providerName}'. Supported: PROMPTPAY, BANK_TRANSFER, TEST`);
        }
        return provider;
    }
}
exports.PaymentProviderFactory = PaymentProviderFactory;
//# sourceMappingURL=provider.factory.js.map