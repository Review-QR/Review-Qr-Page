package com.trustit.partner;

import android.Manifest;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothSocket;
import android.content.Context;
import android.content.pm.PackageManager;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.media.AudioAttributes;
import android.media.AudioManager;
import android.media.Ringtone;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.PowerManager;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.view.WindowManager;
import androidx.core.content.ContextCompat;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;
import com.getcapacitor.PermissionState;

import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.Set;
import java.util.UUID;

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

    private static final UUID SPP_UUID = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB");
    private Ringtone currentRingtone = null;
    private PowerManager.WakeLock wakeLock = null;

    @PluginMethod
    public void startNativeDropCheckout(PluginCall call) {
        com.trustit.customer.CashfreeDropCheckoutHelper.startDropCheckout(call, getActivity(), getBridge());
    }

    @PluginMethod
    public void playEmergencySiren(PluginCall call) {
        try {
            Context context = getContext();

            // 1. Wake screen if off or locked
            PowerManager pm = (PowerManager) context.getSystemService(Context.POWER_SERVICE);
            if (pm != null) {
                if (wakeLock != null && wakeLock.isHeld()) {
                    wakeLock.release();
                }
                wakeLock = pm.newWakeLock(
                        PowerManager.SCREEN_BRIGHT_WAKE_LOCK | PowerManager.ACQUIRE_CAUSES_WAKEUP,
                        "trustit:emergency_order_siren"
                );
                wakeLock.acquire(30000); // 30 sec max timeout
            }

            // 2. Play on Alarm Channel (Bypasses DND / Silent Switch)
            Uri alertUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM);
            if (alertUri == null) {
                alertUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE);
            }

            if (currentRingtone != null && currentRingtone.isPlaying()) {
                currentRingtone.stop();
            }

            currentRingtone = RingtoneManager.getRingtone(context, alertUri);
            if (currentRingtone != null) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                    AudioAttributes attributes = new AudioAttributes.Builder()
                            .setUsage(AudioAttributes.USAGE_ALARM)
                            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                            .build();
                    currentRingtone.setAudioAttributes(attributes);
                } else {
                    currentRingtone.setStreamType(AudioManager.STREAM_ALARM);
                }
                currentRingtone.play();
            }

            // 3. Hardware Vibration Pulse
            Vibrator vibrator = (Vibrator) context.getSystemService(Context.VIBRATOR_SERVICE);
            if (vibrator != null && vibrator.hasVibrator()) {
                long[] pattern = {0, 600, 300, 600, 300, 800};
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    vibrator.vibrate(VibrationEffect.createWaveform(pattern, -1));
                } else {
                    vibrator.vibrate(pattern, -1);
                }
            }

            JSObject res = new JSObject();
            res.put("success", true);
            res.put("channel", "STREAM_ALARM");
            res.put("message", "Loud emergency order siren sounding on hardware alarm stream");
            call.resolve(res);
        } catch (Exception e) {
            call.reject("Failed to trigger hardware siren: " + e.getMessage());
        }
    }

    @PluginMethod
    public void stopEmergencySiren(PluginCall call) {
        try {
            if (currentRingtone != null && currentRingtone.isPlaying()) {
                currentRingtone.stop();
                currentRingtone = null;
            }
            if (wakeLock != null && wakeLock.isHeld()) {
                wakeLock.release();
                wakeLock = null;
            }
            Vibrator vibrator = (Vibrator) getContext().getSystemService(Context.VIBRATOR_SERVICE);
            if (vibrator != null) {
                vibrator.cancel();
            }

            JSObject res = new JSObject();
            res.put("success", true);
            res.put("message", "Siren stopped");
            call.resolve(res);
        } catch (Exception e) {
            call.reject("Failed to stop siren: " + e.getMessage());
        }
    }

    @PluginMethod
    public void setKeepScreenOn(PluginCall call) {
        final boolean enabled = call.getBoolean("enabled", true);
        getActivity().runOnUiThread(() -> {
            if (enabled) {
                getActivity().getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
            } else {
                getActivity().getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
            }
            JSObject res = new JSObject();
            res.put("success", true);
            res.put("isScreenOn", enabled);
            call.resolve(res);
        });
    }

    @PluginMethod
    public void getPairedPrinters(PluginCall call) {
        try {
            Context context = getContext();
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S &&
                ContextCompat.checkSelfPermission(context, Manifest.permission.BLUETOOTH_CONNECT) != PackageManager.PERMISSION_GRANTED) {
                call.reject("Bluetooth permission not granted. Please allow Nearby Devices / Bluetooth in app settings.");
                return;
            }

            BluetoothAdapter adapter = BluetoothAdapter.getDefaultAdapter();
            if (adapter == null) {
                call.reject("Device does not support Bluetooth");
                return;
            }

            Set<BluetoothDevice> bondedDevices = adapter.getBondedDevices();
            JSArray list = new JSArray();

            if (bondedDevices != null) {
                for (BluetoothDevice device : bondedDevices) {
                    JSObject item = new JSObject();
                    item.put("name", device.getName());
                    item.put("address", device.getAddress());
                    list.put(item);
                }
            }

            JSObject res = new JSObject();
            res.put("success", true);
            res.put("printers", list);
            call.resolve(res);
        } catch (SecurityException se) {
            call.reject("Bluetooth permission not granted: " + se.getMessage());
        } catch (Exception e) {
            call.reject("Error fetching paired devices: " + e.getMessage());
        }
    }

    @PluginMethod
    public void printThermalReceipt(PluginCall call) {
        final String address = call.getString("address");
        final String receiptText = call.getString("text", "--- TRUSTIT PARTNER RECEIPT ---\n");
        final Context context = getContext();

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S &&
            ContextCompat.checkSelfPermission(context, Manifest.permission.BLUETOOTH_CONNECT) != PackageManager.PERMISSION_GRANTED) {
            call.reject("Bluetooth permission not granted. Please allow Nearby Devices / Bluetooth in app settings.");
            return;
        }

        new Thread(() -> {
            BluetoothSocket socket = null;
            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S &&
                    ContextCompat.checkSelfPermission(context, Manifest.permission.BLUETOOTH_CONNECT) != PackageManager.PERMISSION_GRANTED) {
                    call.reject("Bluetooth permission not granted.");
                    return;
                }

                BluetoothAdapter adapter = BluetoothAdapter.getDefaultAdapter();
                if (adapter == null || !adapter.isEnabled()) {
                    call.reject("Bluetooth is turned off");
                    return;
                }

                BluetoothDevice targetDevice = null;
                Set<BluetoothDevice> bonded = adapter.getBondedDevices();

                if (bonded != null) {
                    for (BluetoothDevice device : bonded) {
                        if (address != null && address.equalsIgnoreCase(device.getAddress())) {
                            targetDevice = device;
                            break;
                        } else if (address == null) {
                            String name = device.getName() != null ? device.getName().toLowerCase() : "";
                            if (name.contains("pos") || name.contains("print") || name.contains("mpt") || name.contains("rp")) {
                                targetDevice = device;
                                break;
                            }
                        }
                    }
                }

                if (targetDevice == null) {
                    call.reject("No paired thermal printer found. Please pair printer in Android Bluetooth settings.");
                    return;
                }

                socket = targetDevice.createRfcommSocketToServiceRecord(SPP_UUID);
                socket.connect();
                OutputStream out = socket.getOutputStream();

                // ESC/POS Commands
                byte[] initCmd = new byte[]{0x1B, 0x40}; // ESC @ (Initialize printer)
                byte[] alignCenter = new byte[]{0x1B, 0x61, 0x01}; // ESC a 1 (Align Center)
                byte[] alignLeft = new byte[]{0x1B, 0x61, 0x00}; // ESC a 0 (Align Left)
                byte[] feedCut = new byte[]{0x1D, 0x56, 0x41, 0x03}; // GS V A 3 (Feed 3 lines & Cut)

                out.write(initCmd);
                out.write(alignCenter);
                out.write("\n*** TRUSTIT PARTNER ***\n\n".getBytes(StandardCharsets.UTF_8));
                out.write(alignLeft);
                out.write(receiptText.getBytes(StandardCharsets.UTF_8));
                out.write("\n\n\n".getBytes(StandardCharsets.UTF_8));
                out.write(feedCut);
                out.flush();

                JSObject res = new JSObject();
                res.put("success", true);
                res.put("printerName", targetDevice.getName());
                res.put("printerAddress", targetDevice.getAddress());
                res.put("message", "Receipt printed successfully via ESC/POS Bluetooth socket");
                call.resolve(res);
            } catch (Exception e) {
                call.reject("Thermal Print Error: " + e.getMessage());
            } finally {
                if (socket != null) {
                    try { socket.close(); } catch (Exception ignored) {}
                }
            }
        }).start();
    }

    @PluginMethod
    public void nativeFetch(PluginCall call) {
        final String urlStr = call.getString("url");
        final String method = call.getString("method", "POST");
        final String body = call.getString("body", "");
        final JSObject customHeaders = call.getObject("headers");

        new Thread(() -> {
            java.net.HttpURLConnection conn = null;
            try {
                java.net.URL url = new java.net.URL(urlStr);
                conn = (java.net.HttpURLConnection) url.openConnection();
                conn.setRequestMethod(method != null ? method.toUpperCase() : "POST");
                conn.setRequestProperty("Content-Type", "application/json");
                conn.setRequestProperty("Accept", "application/json");
                conn.setConnectTimeout(25000);
                conn.setReadTimeout(25000);

                boolean hasExplicitCookie = false;
                if (customHeaders != null) {
                    java.util.Iterator<String> keys = customHeaders.keys();
                    while (keys.hasNext()) {
                        String key = keys.next();
                        try {
                            String val = customHeaders.getString(key);
                            if (val != null) {
                                if ("cookie".equalsIgnoreCase(key)) {
                                    hasExplicitCookie = true;
                                }
                                conn.setRequestProperty(key, val);
                            }
                        } catch (Exception ignored) {}
                    }
                }

                if (!hasExplicitCookie) {
                    try {
                        String cookies = android.webkit.CookieManager.getInstance().getCookie(urlStr);
                        if (cookies != null && !cookies.isEmpty()) {
                            conn.setRequestProperty("Cookie", cookies);
                        }
                    } catch (Exception ignored) {}
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
                try {
                    android.webkit.CookieManager cm = android.webkit.CookieManager.getInstance();
                    java.util.Map<String, java.util.List<String>> headerFields = conn.getHeaderFields();
                    if (headerFields != null) {
                        for (java.util.Map.Entry<String, java.util.List<String>> entry : headerFields.entrySet()) {
                            if (entry.getKey() != null && "Set-Cookie".equalsIgnoreCase(entry.getKey()) && entry.getValue() != null) {
                                for (String cookieHeader : entry.getValue()) {
                                    if (cookieHeader != null && !cookieHeader.isEmpty()) {
                                        cm.setCookie(urlStr, cookieHeader);
                                    }
                                }
                            }
                        }
                        cm.flush();
                    }
                } catch (Exception ignored) {}
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

    // ── LIVE SELF-HOSTED OTA UPDATE ENGINE (SWIGGY/ZOMATO STANDARD) ──
    public static void performBackgroundOtaSync(Context ctx, com.getcapacitor.Bridge bridge) {
        new Thread(() -> {
            try {
                android.content.SharedPreferences otaPrefs = ctx.getSharedPreferences("TrustitOtaSettings", Context.MODE_PRIVATE);
                final String defaultApp = ctx.getPackageName().contains("rider") ? "rider" : "partner";
                final String appName = otaPrefs.getString("appMode", defaultApp);
                final String manifestUrl = "https://trustitreview.com/api/hyperlocal/ota?app=" + appName;
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
                        try {
                            if (bridge.getWebView() != null) {
                                bridge.getWebView().post(() -> bridge.getWebView().reload());
                            }
                        } catch (Exception ignored) {}
                    });
                }
            } catch (Exception ignored) {}
        }).start();
    }

    @PluginMethod
    public void checkAndApplyOta(PluginCall call) {
        final Context ctx = getContext();
        final android.content.SharedPreferences otaPrefs = ctx.getSharedPreferences("TrustitOtaSettings", Context.MODE_PRIVATE);
        final String defaultApp = ctx.getPackageName().contains("rider") ? "rider" : "partner";
        final String savedApp = otaPrefs.getString("appMode", defaultApp);
        final String manifestUrl = call.getString("manifestUrl", "https://trustitreview.com/api/hyperlocal/ota?app=" + savedApp);
        final String currentVersion = call.getString("currentVersion", "2.2.0");

        if (manifestUrl.contains("app=rider")) {
            otaPrefs.edit().putString("appMode", "rider").apply();
        } else if (manifestUrl.contains("app=partner")) {
            otaPrefs.edit().putString("appMode", "partner").apply();
        }

        new Thread(() -> {
            java.net.HttpURLConnection conn = null;
            try {
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

                // Download ZIP into target folder
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

                // Unpack ZIP
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

                java.io.File indexFile = new java.io.File(targetDir, "index.html");
                if (!indexFile.exists()) {
                    call.reject("Corrupt OTA package: index.html not found");
                    return;
                }

                // Persist new version and serverBasePath
                otaPrefs.edit().putString("activeVersion", latestVersion).apply();

                android.content.SharedPreferences capPrefs = ctx.getSharedPreferences("CapWebViewSettings", Context.MODE_PRIVATE);
                capPrefs.edit().putString("serverBasePath", targetDir.getAbsolutePath()).apply();

                // Live switch to new bundle in WebView
                getBridge().getActivity().runOnUiThread(() -> {
                    getBridge().setServerBasePath(targetDir.getAbsolutePath());
                    try {
                        if (getBridge().getWebView() != null) {
                            getBridge().getWebView().reload();
                        }
                    } catch (Exception ignored) {}
                });

                JSObject res = new JSObject();
                res.put("hasUpdate", true);
                res.put("appliedVersion", latestVersion);
                res.put("message", "Live OTA update applied successfully without APK reinstall!");
                call.resolve(res);

            } catch (Exception e) {
                JSObject err = new JSObject();
                err.put("hasUpdate", false);
                err.put("error", e.getMessage());
                call.reject("OTA error: " + e.getMessage(), err);
            } finally {
                if (conn != null) conn.disconnect();
            }
        }).start();
    }

    // ── HIGH-PRECISION NATIVE HARDWARE GPS ENGINE (SWIGGY/ZOMATO STANDARD) ──
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
                    safeRemoveLocationUpdates(lm, this);
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
                safeRemoveLocationUpdates(lm, listener);
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

    // Permission is explicitly verified below and SecurityException is caught; SuppressLint avoids AGP 8.2 1..22 removeUpdates false positive.
    @android.annotation.SuppressLint("MissingPermission")
    private void safeRemoveLocationUpdates(LocationManager lm, LocationListener listener) {
        Context context = getContext();
        if (lm == null || listener == null || context == null) return;
        if (ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED &&
            ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            return;
        }
        try {
            lm.removeUpdates(listener);
        } catch (SecurityException ignored) {
        } catch (Exception ignored) {}
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
}
