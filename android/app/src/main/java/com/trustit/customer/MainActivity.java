package com.trustit.customer;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import androidx.activity.OnBackPressedCallback;
import com.getcapacitor.BridgeActivity;
import org.json.JSONObject;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(TrustitNativeBridge.class);
        super.onCreate(savedInstanceState);

        // Route hardware Back & Android 13+ gesture Back through WebView navigation stack
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                if (getBridge() != null && getBridge().getWebView() != null) {
                    getBridge().getWebView().evaluateJavascript(
                        "(function(){ try { if (typeof window.__handleTrustitBack === 'function') { return Boolean(window.__handleTrustitBack()); } if (window.history.length > 1) { window.history.back(); return true; } return false; } catch (e) { return false; } })()",
                        value -> {
                            if ("false".equals(value) || value == null || "null".equals(value)) {
                                runOnUiThread(() -> {
                                    setEnabled(false);
                                    getOnBackPressedDispatcher().onBackPressed();
                                    setEnabled(true);
                                });
                            }
                        }
                    );
                    return;
                }
                setEnabled(false);
                getOnBackPressedDispatcher().onBackPressed();
                setEnabled(true);
            }
        });

        // Ensure freshly installed/upgraded APK never boots an older cached OTA bundle
        TrustitNativeBridge.syncInstalledApkBaseline(this);

        // Check if a verified live OTA bundle (newer than APK) exists and boot from it
        try {
            android.content.SharedPreferences capPrefs = getSharedPreferences("CapWebViewSettings", android.content.Context.MODE_PRIVATE);
            String customPath = capPrefs.getString("serverBasePath", null);
            if (customPath != null && !customPath.isEmpty()) {
                java.io.File target = new java.io.File(customPath);
                if (target.exists() && new java.io.File(target, "index.html").exists()) {
                    getBridge().setServerBasePath(customPath);
                }
            }
        } catch (Exception ignored) {}

        // Cold-boot silent background OTA synchronization (Swiggy/Zomato architecture)
        try {
            TrustitNativeBridge.performBackgroundOtaSync(this, getBridge());
        } catch (Exception ignored) {}

        // Inspect cold-launch deep link (e.g., com.trustit.customer://pay/return)
        handleDeepLinkIntent(getIntent(), true);
    }

    @Override
    public void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handleDeepLinkIntent(intent, false);
    }

    private void handleDeepLinkIntent(Intent intent, boolean isColdLaunch) {
        if (intent == null || !Intent.ACTION_VIEW.equals(intent.getAction())) {
            return;
        }
        Uri data = intent.getData();
        if (data == null) {
            return;
        }
        if (!"com.trustit.customer".equalsIgnoreCase(data.getScheme()) || !"pay".equalsIgnoreCase(data.getHost())) {
            return;
        }

        dispatchPaymentReturnUri(getBridge(), data, isColdLaunch);
    }

    public static void dispatchPaymentReturnUri(final com.getcapacitor.Bridge bridge, final Uri data, final boolean isColdLaunch) {
        if (bridge == null || data == null) {
            return;
        }
        String orderId = data.getQueryParameter("orderId");
        if (orderId == null || orderId.trim().isEmpty()) {
            orderId = data.getQueryParameter("order_id");
        }
        String status = data.getQueryParameter("status");

        final JSONObject payload = new JSONObject();
        try {
            payload.put("url", data.toString());
            payload.put("orderId", orderId != null ? orderId : JSONObject.NULL);
            payload.put("status", status != null ? status : JSONObject.NULL);
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

        dispatchPaymentReturnToWebView(bridge, js, isColdLaunch ? 0 : 12);
    }

    private static void dispatchPaymentReturnToWebView(final com.getcapacitor.Bridge bridge, final String js, final int attempt) {
        final Handler mainHandler = new Handler(Looper.getMainLooper());
        final Runnable task = new Runnable() {
            @Override
            public void run() {
                if (bridge == null || bridge.getWebView() == null) {
                    if (attempt < 15) {
                        mainHandler.postDelayed(() -> dispatchPaymentReturnToWebView(bridge, js, attempt + 1), 300);
                    }
                    return;
                }
                final android.webkit.WebView webView = bridge.getWebView();
                if (attempt < 12) {
                    webView.evaluateJavascript(
                        "(function(){ try { return typeof window !== 'undefined' && document.readyState === 'complete' && window.location && window.location.href !== 'about:blank'; } catch (e) { return false; } })()",
                        ready -> {
                            if ("true".equals(ready)) {
                                webView.evaluateJavascript(js, null);
                            } else {
                                mainHandler.postDelayed(() -> dispatchPaymentReturnToWebView(bridge, js, attempt + 1), 350);
                            }
                        }
                    );
                } else {
                    webView.evaluateJavascript(js, null);
                }
            }
        };
        if (Looper.myLooper() == Looper.getMainLooper() && attempt >= 12) {
            task.run();
        } else {
            mainHandler.postDelayed(task, attempt == 0 ? 400 : 0);
        }
    }
}
