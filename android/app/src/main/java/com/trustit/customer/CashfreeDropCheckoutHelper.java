package com.trustit.customer;

import android.app.Activity;
import android.os.Handler;
import android.os.Looper;
import android.webkit.WebView;

import com.cashfree.pg.api.CFPaymentGatewayService;
import com.cashfree.pg.core.api.CFSession;
import com.cashfree.pg.core.api.CFTheme;
import com.cashfree.pg.core.api.callback.CFCheckoutResponseCallback;
import com.cashfree.pg.core.api.utils.CFErrorResponse;
import com.cashfree.pg.ui.api.CFDropCheckoutPayment;
import com.cashfree.pg.ui.api.CFPaymentComponent;
import com.getcapacitor.Bridge;
import com.getcapacitor.JSObject;
import com.getcapacitor.PluginCall;

import org.json.JSONObject;

import java.util.Locale;

/**
 * Shared native Cashfree PG Android Drop Checkout launcher (UPI-first with Cards/Wallets/Netbanking)
 * used by Trustit Customer, Rider, and Partner APKs so PhonePe/GPay/Paytm open natively without Chrome.
 */
public final class CashfreeDropCheckoutHelper {

    private CashfreeDropCheckoutHelper() {}

    public static void startDropCheckout(final PluginCall call, final Activity activity, final Bridge bridge) {
        final String paymentSessionId = call.getString("paymentSessionId", "");
        final String orderId = call.getString("orderId", "");
        final String environmentRaw = call.getString("environment", "PRODUCTION");

        if (paymentSessionId == null || paymentSessionId.trim().isEmpty() || orderId == null || orderId.trim().isEmpty()) {
            JSObject invalid = new JSObject();
            invalid.put("launched", false);
            invalid.put("mode", "invalid_params");
            invalid.put("message", "paymentSessionId and orderId are required.");
            call.resolve(invalid);
            return;
        }

        if (activity == null || activity.isFinishing()) {
            JSObject err = new JSObject();
            err.put("launched", false);
            err.put("mode", "activity_unavailable");
            err.put("message", "Android activity unavailable.");
            call.resolve(err);
            return;
        }

        final String trimmedSessionId = paymentSessionId.trim();
        final String trimmedOrderId = orderId.trim();
        final CFSession.Environment cfEnv =
            "SANDBOX".equalsIgnoreCase(environmentRaw)
                ? CFSession.Environment.SANDBOX
                : CFSession.Environment.PRODUCTION;

        activity.runOnUiThread(() -> {
            try {
                CFPaymentGatewayService gatewayService = CFPaymentGatewayService.getInstance();
                gatewayService.setCheckoutCallback(new CFCheckoutResponseCallback() {
                    @Override
                    public void onPaymentVerify(String verifiedOrderId) {
                        dispatchPaymentEventToWebView(
                            bridge,
                            trimmedOrderId,
                            verifiedOrderId,
                            "success",
                            null
                        );
                    }

                    @Override
                    public void onPaymentFailure(CFErrorResponse cfErrorResponse, String failedOrderId) {
                        String msg = cfErrorResponse != null ? cfErrorResponse.getMessage() : "Payment failed";
                        String statusStr = cfErrorResponse != null ? cfErrorResponse.getStatus() : "";
                        String codeStr = cfErrorResponse != null ? cfErrorResponse.getCode() : "";
                        String combined = (String.valueOf(msg) + " " + String.valueOf(statusStr) + " " + String.valueOf(codeStr)).toLowerCase(Locale.ROOT);
                        String normalizedStatus =
                            (combined.contains("cancel") || combined.contains("user_dropped") || combined.contains("aborted"))
                                ? "cancelled"
                                : "failed";

                        dispatchPaymentEventToWebView(
                            bridge,
                            trimmedOrderId,
                            failedOrderId,
                            normalizedStatus,
                            msg
                        );
                    }
                });

                CFSession cfSession = new CFSession.CFSessionBuilder()
                    .setEnvironment(cfEnv)
                    .setPaymentSessionID(trimmedSessionId)
                    .setOrderId(trimmedOrderId)
                    .build();

                CFTheme theme = new CFTheme.CFThemeBuilder()
                    .setNavigationBarBackgroundColor("#0F172A")
                    .setNavigationBarTextColor("#FFFFFF")
                    .setButtonBackgroundColor("#0F172A")
                    .setButtonTextColor("#FFFFFF")
                    .setPrimaryTextColor("#0F172A")
                    .setSecondaryTextColor("#475569")
                    .build();

                CFDropCheckoutPayment.CFDropCheckoutPaymentBuilder dropBuilder =
                    new CFDropCheckoutPayment.CFDropCheckoutPaymentBuilder()
                        .setSession(cfSession)
                        .setCFNativeCheckoutUITheme(theme);

                try {
                    // UPI first (opens PhonePe/GPay/Paytm natively), followed by active merchant payment modes
                    CFPaymentComponent paymentComponent = new CFPaymentComponent.CFPaymentComponentBuilder()
                        .add(CFPaymentComponent.CFPaymentModes.UPI)
                        .build();
                    dropBuilder.setCFUIPaymentModes(paymentComponent);
                } catch (Throwable ignored) {
                    // Fall back to all active merchant payment modes configured in Cashfree dashboard
                }

                CFDropCheckoutPayment dropCheckoutPayment = dropBuilder.build();

                android.util.Log.d("TrustitNativeCashfree", "Initiating native Cashfree drop checkout for order: " + trimmedOrderId + ", env: " + cfEnv);
                gatewayService.doPayment(activity, dropCheckoutPayment);

                JSObject res = new JSObject();
                res.put("launched", true);
                res.put("mode", "cashfree_native_drop");
                call.resolve(res);
            } catch (Throwable err) {
                android.util.Log.e("TrustitNativeCashfree", "Cashfree SDK launch failed: " + err.getMessage(), err);
                JSObject fail = new JSObject();
                fail.put("launched", false);
                fail.put("mode", "native_sdk_error");
                fail.put("message", err.getMessage() != null ? err.getMessage() : "Cashfree SDK launch failed");
                call.resolve(fail);
            }
        });
    }

    private static void dispatchPaymentEventToWebView(
        final Bridge bridge,
        final String requestedOrderId,
        final String callbackOrderId,
        final String status,
        final String message
    ) {
        if (bridge == null) {
            return;
        }
        String resolvedOrderId =
            (requestedOrderId != null && !requestedOrderId.isEmpty())
                ? requestedOrderId
                : (callbackOrderId != null ? callbackOrderId : "");

        final JSONObject payload = new JSONObject();
        try {
            payload.put("orderId", resolvedOrderId);
            if (callbackOrderId != null && !callbackOrderId.isEmpty()) {
                payload.put("cfOrderId", callbackOrderId);
            }
            payload.put("status", status);
            if (message != null && !message.isEmpty()) {
                payload.put("message", message);
            }
            payload.put("source", "cashfree_native_sdk");
            payload.put("ts", System.currentTimeMillis());
        } catch (Exception ignored) {
            return;
        }

        final String jsPayload = payload.toString()
            .replace("\u2028", "\\u2028")
            .replace("\u2029", "\\u2029");
        final String js = "(function(){ try { var detail = " + jsPayload
            + "; window.__trustitLastPaymentReturn = detail;"
            + " window.dispatchEvent(new CustomEvent('trustit:payment-return', { detail: detail }));"
            + " return true; } catch (e) { return false; } })()";

        Runnable emit = () -> {
            WebView webView = bridge.getWebView();
            if (webView != null) {
                webView.evaluateJavascript(js, null);
            }
        };

        if (Looper.myLooper() == Looper.getMainLooper()) {
            emit.run();
        } else {
            new Handler(Looper.getMainLooper()).post(emit);
        }
    }
}
