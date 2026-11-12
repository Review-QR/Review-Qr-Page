package com.trustit.customer;

import android.os.Bundle;
import androidx.activity.OnBackPressedCallback;
import com.getcapacitor.BridgeActivity;

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
    }
}
