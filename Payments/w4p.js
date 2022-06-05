import { WFP, WFP_CONFIG } from 'overshom-wayforpay';

WFP_CONFIG.DEFAULT_PAYMENT_CURRENCY = 'UAH';

export const wfp = new WFP({
    MERCHANT_ACCOUNT: 'test_merch_n1',
    MERCHANT_SECRET_KEY: 'flk3409refn54t54t*FNJRET',
    MERCHANT_DOMAIN_NAME: 'https://product.com',
    // service URL needed to receive webhooks
    SERVICE_URL: 'https://api.product.com/wayforpay-webhook',
});