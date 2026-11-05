package com.trustit.partner;

import android.os.Build;
import android.os.Bundle;
import android.view.WindowManager;

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

        // Turn on screen and show when locked for counter tablet alerts
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true);
            setTurnScreenOn(true);
        } else {
            getWindow().addFlags(
                WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD |
                WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED |
                WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
            );
        }
    }
}
