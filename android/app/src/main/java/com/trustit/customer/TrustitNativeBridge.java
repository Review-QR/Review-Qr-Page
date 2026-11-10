package com.trustit.customer;

import android.Manifest;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.location.Address;
import android.location.Geocoder;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.os.VibratorManager;

import androidx.core.content.ContextCompat;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Locale;

@CapacitorPlugin(
    name = "TrustitNativeBridge",
    permissions = {
        @Permission(
            alias = "location",
            strings = {
                Manifest.permission.ACCESS_FINE_LOCATION,
                Manifest.permission.ACCESS_COARSE_LOCATION
            }
        )
    }
)
public class TrustitNativeBridge extends Plugin {

    /**
     * 1. nativeFetch: Native Android HttpURLConnection executor running on a background thread.
     * Bypasses browser WebView CORS restrictions and port-80 isolation.
     */
    @PluginMethod
    public void nativeFetch(PluginCall call) {
        final String urlStr = call.getString("url");
        final String method = call.getString("method", "POST");
        final String body = call.getString("body", "");
        final JSObject customHeaders = call.getObject("headers");

        if (urlStr == null || urlStr.isEmpty()) {
            call.reject("URL is required for nativeFetch");
            return;
        }

        new Thread(() -> {
            java.net.HttpURLConnection conn = null;
            try {
                java.net.URL url = new java.net.URL(urlStr);
                conn = (java.net.HttpURLConnection) url.openConnection();
                conn.setRequestMethod(method != null ? method.toUpperCase(Locale.ROOT) : "POST");
                conn.setRequestProperty("Content-Type", "application/json");
                conn.setRequestProperty("Accept", "application/json");
                conn.setConnectTimeout(20000);
                conn.setReadTimeout(20000);

                if (customHeaders != null) {
                    java.util.Iterator<String> keys = customHeaders.keys();
                    while (keys.hasNext()) {
                        String key = keys.next();
                        try {
                            String val = customHeaders.getString(key);
                            if (val != null) {
                                conn.setRequestProperty(key, val);
                            }
                        } catch (Exception ignored) {}
                    }
                }

                if ("POST".equalsIgnoreCase(method) || "PUT".equalsIgnoreCase(method) || "PATCH".equalsIgnoreCase(method)) {
                    conn.setDoOutput(true);
                    if (body != null && !body.isEmpty()) {
                        try (OutputStream os = conn.getOutputStream()) {
                            os.write(body.getBytes(StandardCharsets.UTF_8));
                        }
                    }
                }

                int status = conn.getResponseCode();
                java.io.InputStream is = (status >= 200 && status < 400) ? conn.getInputStream() : conn.getErrorStream();
                StringBuilder response = new StringBuilder();
                if (is != null) {
                    try (java.io.BufferedReader reader = new java.io.BufferedReader(new java.io.InputStreamReader(is, StandardCharsets.UTF_8))) {
                        String line;
                        while ((line = reader.readLine()) != null) {
                            response.append(line);
                        }
                    }
                }

                JSObject res = new JSObject();
                res.put("status", status);
                res.put("data", response.toString());
                res.put("body", response.toString());
                call.resolve(res);
            } catch (Exception e) {
                JSObject err = new JSObject();
                err.put("status", 500);
                err.put("error", e.getMessage());
                call.reject("Native network error: " + e.getMessage(), err);
            } finally {
                if (conn != null) {
                    conn.disconnect();
                }
            }
        }).start();
    }

    /**
     * 2. getPreciseLocation: High-accuracy hardware GPS coordinates & real-time telemetry fix.
     */
    @PluginMethod
    public void getPreciseLocation(PluginCall call) {
        Context context = getContext();
        if (ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED &&
            ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            requestPermissionForAlias("location", call, "locationPermsCallback");
            return;
        }

        LocationManager lm = (LocationManager) context.getSystemService(Context.LOCATION_SERVICE);
        if (lm == null) {
            call.reject("LocationManager service is unavailable on device");
            return;
        }

        boolean gpsEnabled = false;
        boolean networkEnabled = false;
        try {
            gpsEnabled = lm.isProviderEnabled(LocationManager.GPS_PROVIDER);
        } catch (Exception ignored) {}
        try {
            networkEnabled = lm.isProviderEnabled(LocationManager.NETWORK_PROVIDER);
        } catch (Exception ignored) {}

        if (!gpsEnabled && !networkEnabled) {
            JSObject err = new JSObject();
            err.put("gpsDisabled", true);
            call.reject("GPS and Location Services are disabled. Please turn on Location in device settings.", err);
            return;
        }

        // 1. Check for immediate cached / last known location
        Location bestLoc = null;
        try {
            Location gpsLoc = gpsEnabled ? lm.getLastKnownLocation(LocationManager.GPS_PROVIDER) : null;
            Location netLoc = networkEnabled ? lm.getLastKnownLocation(LocationManager.NETWORK_PROVIDER) : null;
            if (gpsLoc != null && netLoc != null) {
                long gpsAge = System.currentTimeMillis() - gpsLoc.getTime();
                if (gpsAge < 30000 && gpsLoc.getAccuracy() <= netLoc.getAccuracy() + 10) {
                    bestLoc = gpsLoc;
                } else if (gpsLoc.getTime() >= netLoc.getTime()) {
                    bestLoc = gpsLoc;
                } else {
                    bestLoc = netLoc;
                }
            } else if (gpsLoc != null) {
                bestLoc = gpsLoc;
            } else {
                bestLoc = netLoc;
            }
        } catch (SecurityException ignored) {}

        // If last known location is fresh (< 8 seconds old), return immediately
        if (bestLoc != null && (System.currentTimeMillis() - bestLoc.getTime() < 8000)) {
            resolveLocationResult(call, bestLoc);
            return;
        }

        // 2. Request fresh real-time satellite / cell-tower fix
        final Location fallbackLoc = bestLoc;
        final boolean[] responded = new boolean[]{false};
        final Handler handler = new Handler(Looper.getMainLooper());

        final LocationListener listener = new LocationListener() {
            @Override
            public void onLocationChanged(Location location) {
                if (!responded[0]) {
                    responded[0] = true;
                    try {
                        lm.removeUpdates(this);
                    } catch (Exception ignored) {}
                    resolveLocationResult(call, location);
                }
            }

            @Override public void onStatusChanged(String provider, int status, Bundle extras) {}
            @Override public void onProviderEnabled(String provider) {}
            @Override public void onProviderDisabled(String provider) {}
        };

        final Runnable timeoutRunnable = () -> {
            if (!responded[0]) {
                responded[0] = true;
                try {
                    lm.removeUpdates(listener);
                } catch (Exception ignored) {}
                if (fallbackLoc != null) {
                    resolveLocationResult(call, fallbackLoc);
                } else {
                    call.reject("GPS satellite timeout: No satellite fix acquired within 4.5s.");
                }
            }
        };

        handler.postDelayed(timeoutRunnable, 4500);

        try {
            if (gpsEnabled) {
                lm.requestLocationUpdates(LocationManager.GPS_PROVIDER, 1000, 0, listener, Looper.getMainLooper());
            }
            if (networkEnabled) {
                lm.requestLocationUpdates(LocationManager.NETWORK_PROVIDER, 1000, 0, listener, Looper.getMainLooper());
            }
        } catch (SecurityException se) {
            handler.removeCallbacks(timeoutRunnable);
            if (fallbackLoc != null) {
                resolveLocationResult(call, fallbackLoc);
            } else {
                call.reject("Security exception requesting location updates: " + se.getMessage());
            }
        } catch (Exception e) {
            handler.removeCallbacks(timeoutRunnable);
            if (fallbackLoc != null) {
                resolveLocationResult(call, fallbackLoc);
            } else {
                call.reject("Failed to request location updates: " + e.getMessage());
            }
        }
    }

    @PermissionCallback
    private void locationPermsCallback(PluginCall call) {
        if (getPermissionState("location") == PermissionState.GRANTED) {
            getPreciseLocation(call);
        } else {
            call.reject("Location permission is required for live GPS tracking.");
        }
    }

    private void resolveLocationResult(PluginCall call, Location loc) {
        JSObject res = new JSObject();
        res.put("latitude", loc.getLatitude());
        res.put("longitude", loc.getLongitude());
        res.put("accuracy", Math.round(loc.getAccuracy() * 10.0) / 10.0);
        res.put("speed", loc.getSpeed());
        res.put("bearing", loc.getBearing());
        res.put("altitude", loc.getAltitude());
        res.put("provider", loc.getProvider());
        res.put("timestamp", loc.getTime());
        call.resolve(res);
    }

    /**
     * 3. playHapticFeedback: Native vibrator effects for Swiggy/Zomato tactile button clicks.
     */
    @PluginMethod
    public void playHapticFeedback(PluginCall call) {
        String type = call.getString("type", "click");
        Context context = getContext();

        try {
            Vibrator vibrator = null;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                VibratorManager vibratorManager = (VibratorManager) context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE);
                if (vibratorManager != null) vibrator = vibratorManager.getDefaultVibrator();
            }
            if (vibrator == null) {
                vibrator = (Vibrator) context.getSystemService(Context.VIBRATOR_SERVICE);
            }

            if (vibrator != null && vibrator.hasVibrator()) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    if ("heavy".equalsIgnoreCase(type)) {
                        vibrator.vibrate(VibrationEffect.createPredefined(VibrationEffect.EFFECT_HEAVY_CLICK));
                    } else if ("double".equalsIgnoreCase(type) || "success".equalsIgnoreCase(type)) {
                        vibrator.vibrate(VibrationEffect.createPredefined(VibrationEffect.EFFECT_DOUBLE_CLICK));
                    } else {
                        vibrator.vibrate(VibrationEffect.createPredefined(VibrationEffect.EFFECT_CLICK));
                    }
                } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    long duration = "heavy".equalsIgnoreCase(type) ? 60 : 30;
                    vibrator.vibrate(VibrationEffect.createOneShot(duration, VibrationEffect.DEFAULT_AMPLITUDE));
                } else {
                    vibrator.vibrate(35);
                }
            }

            JSObject res = new JSObject();
            res.put("success", true);
            res.put("type", type);
            call.resolve(res);
        } catch (Exception e) {
            call.resolve(new JSObject().put("success", false));
        }
    }

    /**
     * 4. nativeCheckoutHandoff: Intent dispatcher for UPI apps (GPay, PhonePe, Paytm, BHIM).
     */
    @PluginMethod
    public void nativeCheckoutHandoff(PluginCall call) {
        String upiUri = call.getString("upiUri");
        Context context = getContext();

        try {
            // Check installed UPI applications
            Intent checkIntent = new Intent(Intent.ACTION_VIEW);
            checkIntent.setData(Uri.parse("upi://pay"));
            PackageManager pm = context.getPackageManager();
            List<ResolveInfo> resolved = pm.queryIntentActivities(checkIntent, PackageManager.MATCH_DEFAULT_ONLY);

            JSArray installedApps = new JSArray();
            for (ResolveInfo ri : resolved) {
                JSObject app = new JSObject();
                app.put("name", ri.loadLabel(pm).toString());
                app.put("packageName", ri.activityInfo.packageName);
                installedApps.put(app);
            }

            if (upiUri != null && !upiUri.isEmpty()) {
                Intent payIntent = new Intent(Intent.ACTION_VIEW);
                payIntent.setData(Uri.parse(upiUri));
                Intent chooser = Intent.createChooser(payIntent, "Complete Order Payment via UPI (GPay, PhonePe, Paytm)");
                chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                context.startActivity(chooser);

                JSObject res = new JSObject();
                res.put("success", true);
                res.put("dispatched", true);
                res.put("installedCount", resolved.size());
                res.put("apps", installedApps);
                call.resolve(res);
            } else {
                JSObject res = new JSObject();
                res.put("success", true);
                res.put("dispatched", false);
                res.put("installedCount", resolved.size());
                res.put("apps", installedApps);
                call.resolve(res);
            }
        } catch (Exception e) {
            call.reject("UPI Checkout Handoff Error: " + e.getMessage());
        }
    }

    /**
     * 5. LIVE SELF-HOSTED OTA UPDATE ENGINE (SWIGGY/ZOMATO STANDARD)
     * Checks server for new zipped Next.js bundles, downloads in background, and hot-boots without APK reinstall.
     */
    public static void performBackgroundOtaSync(Context ctx, com.getcapacitor.Bridge bridge) {
        new Thread(() -> {
            try {
                String pkg = ctx.getPackageName().toLowerCase();
                String appName = "customer";
                if (pkg.contains("rider")) {
                    appName = "rider";
                } else if (pkg.contains("partner") || pkg.contains("merchant")) {
                    appName = "partner";
                }

                final String manifestUrl = "https://trustitreview.com/api/hyperlocal/ota?app=" + appName;
                android.content.SharedPreferences otaPrefs = ctx.getSharedPreferences("TrustitOtaSettings", Context.MODE_PRIVATE);
                String activeOtaVersion = otaPrefs.getString("activeVersion", "2.2.0");

                java.net.URL url = new java.net.URL(manifestUrl + "&current=" + activeOtaVersion);
                java.net.HttpURLConnection conn = (java.net.HttpURLConnection) url.openConnection();
                conn.setRequestMethod("GET");
                conn.setConnectTimeout(10000);
                conn.setReadTimeout(10000);

                if (conn.getResponseCode() != 200) return;

                java.io.BufferedReader reader = new java.io.BufferedReader(new java.io.InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8));
                StringBuilder sb = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) sb.append(line);
                reader.close();
                conn.disconnect();

                org.json.JSONObject manifest = new org.json.JSONObject(sb.toString());
                boolean hasUpdate = manifest.optBoolean("hasUpdate", false);
                String latestVersion = manifest.optString("version", "");
                String bundleUrl = manifest.optString("bundleUrl", "");

                if (!hasUpdate || latestVersion.isEmpty() || latestVersion.equals(activeOtaVersion) || bundleUrl.isEmpty()) {
                    return;
                }

                java.io.File otaBaseDir = new java.io.File(ctx.getFilesDir(), "trustit_ota");
                if (!otaBaseDir.exists()) otaBaseDir.mkdirs();

                java.io.File targetDir = new java.io.File(otaBaseDir, "v_" + latestVersion.replace(".", "_"));
                if (!targetDir.exists()) targetDir.mkdirs();

                java.net.URL zipUrl = new java.net.URL(bundleUrl);
                java.net.HttpURLConnection zipConn = (java.net.HttpURLConnection) zipUrl.openConnection();
                zipConn.setConnectTimeout(30000);
                zipConn.setReadTimeout(60000);
                if (zipConn.getResponseCode() != 200) return;

                try (java.util.zip.ZipInputStream zis = new java.util.zip.ZipInputStream(zipConn.getInputStream())) {
                    java.util.zip.ZipEntry entry;
                    byte[] buf = new byte[8192];
                    while ((entry = zis.getNextEntry()) != null) {
                        java.io.File destFile = new java.io.File(targetDir, entry.getName());
                        if (entry.isDirectory()) {
                            destFile.mkdirs();
                        } else {
                            java.io.File parent = destFile.getParentFile();
                            if (parent != null && !parent.exists()) parent.mkdirs();
                            try (java.io.FileOutputStream fos = new java.io.FileOutputStream(destFile)) {
                                int count;
                                while ((count = zis.read(buf)) != -1) {
                                    fos.write(buf, 0, count);
                                }
                            }
                        }
                        zis.closeEntry();
                    }
                }
                zipConn.disconnect();

                java.io.File indexFile = new java.io.File(targetDir, "index.html");
                if (!indexFile.exists()) return;

                otaPrefs.edit().putString("activeVersion", latestVersion).apply();

                android.content.SharedPreferences capPrefs = ctx.getSharedPreferences("CapWebViewSettings", Context.MODE_PRIVATE);
                capPrefs.edit().putString("serverBasePath", targetDir.getAbsolutePath()).apply();

                if (bridge != null && bridge.getActivity() != null) {
                    bridge.getActivity().runOnUiThread(() -> {
                        try {
                            if (bridge.getWebView() != null) {
                                bridge.getWebView().clearCache(true);
                            }
                        } catch (Exception ignored) {}
                        bridge.setServerBasePath(targetDir.getAbsolutePath());
                        // Silent OTA update without intrusive UI Toast
                        // android.widget.Toast.makeText(ctx, "⚡ Trustit OTA: Updated to v" + latestVersion, android.widget.Toast.LENGTH_LONG).show();
                    });
                }
            } catch (Exception ignored) {}
        }).start();
    }

    @PluginMethod
    public void checkAndApplyOta(PluginCall call) {
        String pkg = getContext().getPackageName().toLowerCase();
        String appName = "customer";
        if (pkg.contains("rider")) {
            appName = "rider";
        } else if (pkg.contains("partner") || pkg.contains("merchant")) {
            appName = "partner";
        }

        final String manifestUrl = call.getString("manifestUrl", "https://trustitreview.com/api/hyperlocal/ota?app=" + appName);
        final String currentVersion = call.getString("currentVersion", "2.2.0");

        new Thread(() -> {
            java.net.HttpURLConnection conn = null;
            try {
                Context ctx = getContext();
                android.content.SharedPreferences otaPrefs = ctx.getSharedPreferences("TrustitOtaSettings", Context.MODE_PRIVATE);
                String activeOtaVersion = otaPrefs.getString("activeVersion", currentVersion);

                String sep = manifestUrl.contains("?") ? "&" : "?";
                java.net.URL url = new java.net.URL(manifestUrl + sep + "current=" + activeOtaVersion);
                conn = (java.net.HttpURLConnection) url.openConnection();
                conn.setRequestMethod("GET");
                conn.setConnectTimeout(15000);
                conn.setReadTimeout(15000);

                if (conn.getResponseCode() != 200) {
                    JSObject res = new JSObject();
                    res.put("hasUpdate", false);
                    res.put("status", conn.getResponseCode());
                    call.resolve(res);
                    return;
                }

                java.io.BufferedReader reader = new java.io.BufferedReader(new java.io.InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8));
                StringBuilder sb = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) sb.append(line);
                reader.close();

                org.json.JSONObject manifest = new org.json.JSONObject(sb.toString());
                boolean hasUpdate = manifest.optBoolean("hasUpdate", false);
                String latestVersion = manifest.optString("version", "");
                String bundleUrl = manifest.optString("bundleUrl", "");

                if (!hasUpdate || latestVersion.isEmpty() || latestVersion.equals(activeOtaVersion) || bundleUrl.isEmpty()) {
                    JSObject res = new JSObject();
                    res.put("hasUpdate", false);
                    res.put("activeVersion", activeOtaVersion);
                    call.resolve(res);
                    return;
                }

                java.io.File otaBaseDir = new java.io.File(ctx.getFilesDir(), "trustit_ota");
                if (!otaBaseDir.exists()) otaBaseDir.mkdirs();

                java.io.File targetDir = new java.io.File(otaBaseDir, "v_" + latestVersion.replace(".", "_"));
                if (!targetDir.exists()) targetDir.mkdirs();

                java.net.URL zipUrl = new java.net.URL(bundleUrl);
                java.net.HttpURLConnection zipConn = (java.net.HttpURLConnection) zipUrl.openConnection();
                zipConn.setConnectTimeout(30000);
                zipConn.setReadTimeout(60000);
                if (zipConn.getResponseCode() != 200) {
                    call.reject("OTA download failed: HTTP " + zipConn.getResponseCode());
                    return;
                }

                try (java.util.zip.ZipInputStream zis = new java.util.zip.ZipInputStream(zipConn.getInputStream())) {
                    java.util.zip.ZipEntry entry;
                    byte[] buf = new byte[8192];
                    while ((entry = zis.getNextEntry()) != null) {
                        java.io.File destFile = new java.io.File(targetDir, entry.getName());
                        if (entry.isDirectory()) {
                            destFile.mkdirs();
                        } else {
                            java.io.File parent = destFile.getParentFile();
                            if (parent != null && !parent.exists()) parent.mkdirs();
                            try (java.io.FileOutputStream fos = new java.io.FileOutputStream(destFile)) {
                                int count;
                                while ((count = zis.read(buf)) != -1) {
                                    fos.write(buf, 0, count);
                                }
                            }
                        }
                        zis.closeEntry();
                    }
                }
                zipConn.disconnect();

                java.io.File indexFile = new java.io.File(targetDir, "index.html");
                if (!indexFile.exists()) {
                    call.reject("Corrupt OTA package: index.html not found");
                    return;
                }

                otaPrefs.edit().putString("activeVersion", latestVersion).apply();

                android.content.SharedPreferences capPrefs = ctx.getSharedPreferences("CapWebViewSettings", Context.MODE_PRIVATE);
                capPrefs.edit().putString("serverBasePath", targetDir.getAbsolutePath()).apply();

                getActivity().runOnUiThread(() -> {
                    getBridge().setServerBasePath(targetDir.getAbsolutePath());
                    try {
                        if (getBridge().getWebView() != null) getBridge().getWebView().reload();
                    } catch (Exception ignored) {}
                });

                JSObject res = new JSObject();
                res.put("hasUpdate", true);
                res.put("appliedVersion", latestVersion);
                res.put("message", "Live OTA update applied successfully without APK reinstall!");
                call.resolve(res);

            } catch (Exception e) {
                JSObject err = new JSObject();
                err.put("error", e.getMessage());
                call.reject("OTA error: " + e.getMessage(), err);
            } finally {
                if (conn != null) conn.disconnect();
            }
        }).start();
    }
}
