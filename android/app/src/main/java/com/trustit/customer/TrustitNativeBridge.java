package com.trustit.customer;

import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.location.Address;
import android.location.Geocoder;
import android.location.Location;
import android.location.LocationManager;
import android.net.Uri;
import android.os.Build;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.os.VibratorManager;

import androidx.core.content.ContextCompat;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Locale;

@CapacitorPlugin(name = "TrustitNativeBridge")
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
     * 2. getPreciseLocation: High-accuracy hardware GPS coordinates & reverse geocoded street/mohalla.
     */
    @PluginMethod
    public void getPreciseLocation(PluginCall call) {
        Context context = getContext();
        if (ContextCompat.checkSelfPermission(context, android.Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED &&
            ContextCompat.checkSelfPermission(context, android.Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            call.reject("Location permission not granted. Please allow location access.");
            return;
        }

        try {
            LocationManager locationManager = (LocationManager) context.getSystemService(Context.LOCATION_SERVICE);
            if (locationManager == null) {
                call.reject("LocationManager service unavailable");
                return;
            }

            Location bestLocation = null;
            if (locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER)) {
                bestLocation = locationManager.getLastKnownLocation(LocationManager.GPS_PROVIDER);
            }
            if (bestLocation == null && locationManager.isProviderEnabled(LocationManager.NETWORK_PROVIDER)) {
                bestLocation = locationManager.getLastKnownLocation(LocationManager.NETWORK_PROVIDER);
            }

            double lat = bestLocation != null ? bestLocation.getLatitude() : 27.5744; // Default to Bahraich
            double lng = bestLocation != null ? bestLocation.getLongitude() : 81.5977;
            float accuracy = bestLocation != null ? bestLocation.getAccuracy() : 15.0f;

            final double finalLat = lat;
            final double finalLng = lng;
            final float finalAcc = accuracy;
            final boolean finalIsSimulated = (bestLocation == null);

            new Thread(() -> {
                String streetAddress = "Civil Lines, Bahraich";
                String mohalla = "Civil Lines";
                String city = "Bahraich";
                String pincode = "271801";

                try {
                    Geocoder geocoder = new Geocoder(context, Locale.getDefault());
                    List<Address> addresses = geocoder.getFromLocation(finalLat, finalLng, 1);
                    if (addresses != null && !addresses.isEmpty()) {
                        Address addr = addresses.get(0);
                        if (addr.getSubLocality() != null) mohalla = addr.getSubLocality();
                        else if (addr.getThoroughfare() != null) mohalla = addr.getThoroughfare();

                        if (addr.getLocality() != null) city = addr.getLocality();
                        if (addr.getPostalCode() != null) pincode = addr.getPostalCode();
                        if (addr.getAddressLine(0) != null) streetAddress = addr.getAddressLine(0);
                    }
                } catch (Exception ignored) {}

                JSObject res = new JSObject();
                res.put("latitude", finalLat);
                res.put("longitude", finalLng);
                res.put("accuracy", finalAcc);
                res.put("address", streetAddress);
                res.put("mohalla", mohalla);
                res.put("city", city);
                res.put("pincode", pincode);
                res.put("isSimulated", finalIsSimulated);
                call.resolve(res);
            }).start();

        } catch (SecurityException se) {
            call.reject("Security exception accessing GPS location: " + se.getMessage());
        } catch (Exception e) {
            call.reject("Error obtaining precise location: " + e.getMessage());
        }
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
