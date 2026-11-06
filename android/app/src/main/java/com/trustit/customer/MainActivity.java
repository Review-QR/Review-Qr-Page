package com.trustit.customer;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(TrustitNativeBridge.class);
        super.onCreate(savedInstanceState);

        // Check if a verified live OTA bundle exists in internal storage and boot directly from it
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
