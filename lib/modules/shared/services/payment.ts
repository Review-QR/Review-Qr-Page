/**
 * Shared Cashfree Payment Gateway Service
 */

import {
  createCashfreeClient,
  verifyCashfreeWebhookSignature,
} from "@/lib/cashfree";
import {
  createCashfreeHyperlocalPaymentOrder,
  verifyCashfreeHyperlocalPayment,
} from "@/lib/hyperlocal/cashfree-hyperlocal-service";

export const paymentGateway = {
  createClient: createCashfreeClient,
  createHyperlocalOrder: createCashfreeHyperlocalPaymentOrder,
  verifyHyperlocalPayment: verifyCashfreeHyperlocalPayment,
  verifyWebhookSignature: verifyCashfreeWebhookSignature,
};
