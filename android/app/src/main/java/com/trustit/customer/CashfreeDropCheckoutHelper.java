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
import com.cashfree.pg.core.api.utils.CFUPIApp;
import com.cashfree.pg.core.api.utils.CFUPIUtil;
import com.cashfree.pg.ui.api.CFDropCheckoutPayment;
import com.cashfree.pg.ui.api.upi.intent.CFIntentTheme;
import com.cashfree.pg.ui.api.upi.intent.CFUPIIntentCheckout;
import com.cashfree.pg.ui.api.upi.intent.CFUPIIntentCheckoutPayment;
import com.getcapacitor.Bridge;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.PluginCall;

import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Locale;

/**
 * Dedicated native Cashfree PG Android UPI Intent & Drop Checkout launcher
 * used by Trustit Customer APK so PhonePe, Google Pay, Paytm, and WhatsApp UPI
 * open natively via Android app-to-app intent (exactly like Blinkit/Swiggy/Zomato),
 * with ZERO external browser/web redirects.
 */
public final class CashfreeDropCheckoutHelper {

    private CashfreeDropCheckoutHelper() {}

    /**
     * Queries all installed UPI apps on the device (PhonePe, GPay, Paytm, etc.)
     * and returns their package IDs, display names, and base64 icons to the frontend.
     */
    public static void getInstalledUpiApps(final PluginCall call, final Activity activity) {
        if (activity == null || activity.isFinishing()) {
            JSObject res = new JSObject();
            res.put("apps", new JSArray());
            call.resolve(res);
            return;
        }

        try {
            CFUPIUtil.getInstalledUPIApps(activity, new CFUPIUtil.UPIAppsCallback() {
                @Override
                public void onUPIAppsFetched(ArrayList<CFUPIApp> list) {
                    JSArray arr = new JSArray();
                    if (list != null) {
                        for (CFUPIApp app : list) {
                            if (app != null) {
                                JSObject item = new JSObject();
                                item.put("appId", app.getAppId());
                                item.put("displayName", app.getDisplayName());
                                item.put("icon", app.getBase64Icon());
                                arr.put(item);
                            }
                        }
                    }
                    JSObject res = new JSObject();
                    res.put("apps", arr);
                    call.resolve(res);
                }
            });
        } catch (Throwable t) {
            android.util.Log.w("TrustitNativeCashfree", "Failed to fetch installed UPI apps: " + t.getMessage());
            JSObject res = new JSObject();
            res.put("apps", new JSArray());
            call.resolve(res);
        }
    }

    /**
     * Launches native Cashfree UPI Intent Checkout (opens native chooser sheet with PhonePe,
     * GPay, Paytm, WhatsApp or prioritizes the user's selected app directly), with
     * fallback to full Drop Checkout if UPI is unavailable.
     */
    public static void startDropCheckout(final PluginCall call, final Activity activity, final Bridge bridge) {
        final String paymentSessionId = call.getString("paymentSessionId", "");
        final String orderId = call.getString("orderId", "");
        final String environmentRaw = call.getString("environment", "PRODUCTION");
        final String selectedAppId = call.getString("selectedAppId", "");
        final boolean preferUpiIntent = call.getBoolean("preferUpiIntent", true);

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

                // 1. Primary Strategy: Native UPI Intent Checkout (Blinkit / Swiggy / Zomato style)
                if (preferUpiIntent) {
                    try {
                        CFUPIIntentCheckout.CFUPIIntentBuilder upiBuilder = new CFUPIIntentCheckout.CFUPIIntentBuilder();
                        if (selectedAppId != null && !selectedAppId.trim().isEmpty()) {
                            upiBuilder.setOrderUsingPackageName(Collections.singletonList(selectedAppId.trim()));
                        } else {
                            upiBuilder.setOrderUsingPackageName(Arrays.asList(
                                "com.phonepe.app",
                                "com.google.android.apps.nbu.paisa.user",
                                "net.one97.paytm",
                                "com.whatsapp",
                                "in.org.npci.upiapp",
                                "com.dreamplug.androidapp"
                            ));
                        }
                        CFUPIIntentCheckout upiCheckout = upiBuilder.build();

                        CFIntentTheme intentTheme = new CFIntentTheme.CFIntentThemeBuilder()
                            .setPrimaryTextColor("#0F172A")
                            .setBackgroundColor("#FFFFFF")
                            .build();

                        CFUPIIntentCheckoutPayment upiPayment = new CFUPIIntentCheckoutPayment.CFUPIIntentPaymentBuilder()
                            .setSession(cfSession)
                            .setCfUPIIntentCheckout(upiCheckout)
                            .setCfIntentTheme(intentTheme)
                            .build();

                        android.util.Log.d("TrustitNativeCashfree", "Initiating native Cashfree UPI intent checkout for order: " + trimmedOrderId + ", env: " + cfEnv);
                        gatewayService.doPayment(activity, upiPayment);

                        JSObject res = new JSObject();
                        res.put("launched", true);
                        res.put("mode", "cashfree_native_upi_intent");
                        call.resolve(res);
                        return;
                    } catch (Throwable upiErr) {
                        android.util.Log.w("TrustitNativeCashfree", "UPI Intent failed, trying native drop fallback: " + upiErr.getMessage());
                    }
                }

                // 2. Secondary Fallback: Native Cashfree Drop Checkout with ALL payment modes
                CFTheme theme = new CFTheme.CFThemeBuilder()
                    .setNavigationBarBackgroundColor("#0F172A")
                    .setNavigationBarTextColor("#FFFFFF")
                    .setButtonBackgroundColor("#0F172A")
                    .setButtonTextColor("#FFFFFF")
                    .setPrimaryTextColor("#0F172A")
                    .setSecondaryTextColor("#475569")
                    .build();

                CFDropCheckoutPayment dropCheckoutPayment = new CFDropCheckoutPayment.CFDropCheckoutPaymentBuilder()
                    .setSession(cfSession)
                    .setCFNativeCheckoutUITheme(theme)
                    .build();

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
