export type TrustitCheckoutDiagnosticStage =
  | "return_url_validation_start"
  | "return_url_validation_success"
  | "return_url_validation_failed"
  | "order_reservation_start"
  | "order_reservation_success"
  | "order_reservation_failed"
  | "cashfree_webhook_configuration_start"
  | "cashfree_webhook_configuration_success"
  | "cashfree_webhook_configuration_failed"
  | "cashfree_client_configuration_start"
  | "cashfree_client_configuration_success"
  | "cashfree_client_configuration_failed"
  | "cashfree_lookup_http_2xx"
  | "cashfree_lookup_http_3xx"
  | "cashfree_lookup_http_4xx"
  | "cashfree_lookup_http_5xx"
  | "cashfree_lookup_http_other"
  | "cashfree_lookup_network_error"
  | "cashfree_lookup_response_validation_start"
  | "cashfree_lookup_response_validation_success"
  | "cashfree_lookup_response_validation_failed"
  | "cashfree_create_http_2xx"
  | "cashfree_create_http_3xx"
  | "cashfree_create_http_4xx"
  | "cashfree_create_http_5xx"
  | "cashfree_create_http_other"
  | "cashfree_create_network_error"
  | "order_response_validation_start"
  | "order_response_validation_success"
  | "order_response_validation_failed"
  | "payment_session_recording_start"
  | "payment_session_recording_success"
  | "payment_session_recording_failed";

/** Emits only a fixed Trustit checkout stage label. Never pass request data here. */
export function logTrustitCheckoutStage(stage: TrustitCheckoutDiagnosticStage): void {
  console.info(`TRUSTIT_CHECKOUT_STAGE=${stage}`);
}
