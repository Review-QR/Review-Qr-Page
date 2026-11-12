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

    private Ringtone currentRingtone = null;
    private PowerManager.WakeLock sirenWakeLock = null;

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
                conn.setUseCaches(false);
                conn.setRequestProperty("Content-Type", "application/json");
                conn.setRequestProperty("Accept", "application/json");
                conn.setRequestProperty("Cache-Control", "no-cache, no-store, must-revalidate");
                conn.setConnectTimeout(20000);
                conn.setReadTimeout(20000);

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

        // 1. Check for immediate cached / last known location (ignore stale fixes > 90s old)
        Location bestLoc = null;
        long nowMs = System.currentTimeMillis();
        try {
            Location gpsLoc = gpsEnabled ? lm.getLastKnownLocation(LocationManager.GPS_PROVIDER) : null;
            Location netLoc = networkEnabled ? lm.getLastKnownLocation(LocationManager.NETWORK_PROVIDER) : null;
            if (gpsLoc != null && (nowMs - gpsLoc.getTime() > 90_000)) gpsLoc = null;
            if (netLoc != null && (nowMs - netLoc.getTime() > 90_000)) netLoc = null;

            if (gpsLoc != null && netLoc != null) {
                long gpsAge = nowMs - gpsLoc.getTime();
                if (gpsAge < 30_000 && (!gpsLoc.hasAccuracy() || gpsLoc.getAccuracy() <= 55f)) {
                    bestLoc = gpsLoc;
                } else if (netLoc.hasAccuracy() && netLoc.getAccuracy() <= 60f && (nowMs - netLoc.getTime() < 20_000)) {
                    bestLoc = netLoc;
                } else {
                    bestLoc = gpsLoc.getTime() >= netLoc.getTime() ? gpsLoc : netLoc;
                }
            } else if (gpsLoc != null) {
                bestLoc = gpsLoc;
            } else {
                bestLoc = netLoc;
            }
        } catch (SecurityException ignored) {}

        // Short-circuit only when last known GPS fix is genuinely fresh (< 8s old & pinpoint <= 25m)
        long bestAge = bestLoc != null ? (nowMs - bestLoc.getTime()) : Long.MAX_VALUE;
        boolean bestIsFreshGps =
            bestLoc != null &&
            LocationManager.GPS_PROVIDER.equals(bestLoc.getProvider()) &&
            bestAge < 8_000 &&
            bestLoc.hasAccuracy() &&
            bestLoc.getAccuracy() <= 25f;

        if (bestIsFreshGps) {
            resolveLocationResult(call, bestLoc);
            return;
        }

        // 2. Request fresh real-time GPS + Network updates (indoor Wi-Fi/Cell friendly)
        final Location fallbackLoc = bestLoc;
        final Location[] bestActive = new Location[]{null};
        final boolean[] responded = new boolean[]{false};
        final Handler handler = new Handler(Looper.getMainLooper());
        final Runnable[] timeoutRef = new Runnable[1];
        final Runnable[] netGraceRef = new Runnable[1];
        final long requestStartMs = System.currentTimeMillis();

        final LocationListener listener = new LocationListener() {
            @Override
            public void onLocationChanged(Location location) {
                if (responded[0]) return;
                boolean isGps = LocationManager.GPS_PROVIDER.equals(location.getProvider());
                boolean isPinpoint = location.hasAccuracy() && location.getAccuracy() <= 50f;
                boolean prevWasGps = bestActive[0] != null && LocationManager.GPS_PROVIDER.equals(bestActive[0].getProvider());

                if (
                    bestActive[0] == null ||
                    (isGps && !prevWasGps) ||
                    (isGps == prevWasGps && location.hasAccuracy() && (!bestActive[0].hasAccuracy() || location.getAccuracy() < bestActive[0].getAccuracy()))
                ) {
                    bestActive[0] = location;
                }

                long elapsed = System.currentTimeMillis() - requestStartMs;
                if (isGps || isPinpoint || elapsed >= 2500) {
                    responded[0] = true;
                    if (timeoutRef[0] != null) handler.removeCallbacks(timeoutRef[0]);
                    if (netGraceRef[0] != null) handler.removeCallbacks(netGraceRef[0]);
                    safeRemoveLocationUpdates(lm, this);
                    resolveLocationResult(call, bestActive[0]);
                }
            }

            @Override public void onStatusChanged(String provider, int status, Bundle extras) {}
            @Override public void onProviderEnabled(String provider) {}
            @Override public void onProviderDisabled(String provider) {}
        };

        // If network fix arrived early (>50m accuracy indoors), promote it after 2.5s if GPS hasn't locked
        netGraceRef[0] = () -> {
            if (!responded[0] && bestActive[0] != null) {
                responded[0] = true;
                if (timeoutRef[0] != null) handler.removeCallbacks(timeoutRef[0]);
                safeRemoveLocationUpdates(lm, listener);
                resolveLocationResult(call, bestActive[0]);
            }
        };
        handler.postDelayed(netGraceRef[0], 2600);

        timeoutRef[0] = () -> {
            if (!responded[0]) {
                responded[0] = true;
                if (netGraceRef[0] != null) handler.removeCallbacks(netGraceRef[0]);
                safeRemoveLocationUpdates(lm, listener);
                Location chosen = bestActive[0] != null ? bestActive[0] : fallbackLoc;
                if (chosen != null) {
                    resolveLocationResult(call, chosen);
                } else {
                    call.reject("Fresh GPS fix unavailable within 8s.");
                }
            }
        };

        handler.postDelayed(timeoutRef[0], 8000);

        try {
            if (gpsEnabled) {
                lm.requestLocationUpdates(LocationManager.GPS_PROVIDER, 500, 0, listener, Looper.getMainLooper());
            }
            if (networkEnabled) {
                lm.requestLocationUpdates(LocationManager.NETWORK_PROVIDER, 500, 0, listener, Looper.getMainLooper());
            }
        } catch (Exception e) {
            if (!responded[0]) {
                responded[0] = true;
                if (timeoutRef[0] != null) handler.removeCallbacks(timeoutRef[0]);
                if (netGraceRef[0] != null) handler.removeCallbacks(netGraceRef[0]);
                if (fallbackLoc != null) {
                    resolveLocationResult(call, fallbackLoc);
                } else {
                    String prefix = (e instanceof SecurityException)
                        ? "Security exception requesting location updates: "
                        : "Failed to request location updates: ";
                    call.reject(prefix + e.getMessage());
                }
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

    private static final java.util.Set<String> ALLOWED_UPI_SCHEMES = new java.util.HashSet<>(
        java.util.Arrays.asList("upi", "tez", "gpay", "phonepe", "paytmmp", "bhim", "credpay", "paytm", "amazonpay", "mobikwik", "freecharge")
    );
    private android.app.Dialog activeCheckoutDialog;

    private static boolean isAllowedCheckoutEntryHost(String host) {
        if (host == null) return false;
        String lower = host.trim().toLowerCase(Locale.ROOT);
        return "trustitreview.com".equals(lower)
            || lower.endsWith(".trustitreview.com")
            || lower.endsWith(".cashfree.com")
            || "cashfree.com".equals(lower);
    }

    private void dismissActiveCheckoutDialog(android.webkit.WebView checkoutWebView) {
        if (checkoutWebView != null) {
            try {
                checkoutWebView.stopLoading();
                checkoutWebView.loadUrl("about:blank");
                checkoutWebView.destroy();
            } catch (Exception ignored) {}
        }
        if (activeCheckoutDialog != null) {
            try {
                if (activeCheckoutDialog.isShowing()) {
                    activeCheckoutDialog.dismiss();
                }
            } catch (Exception ignored) {}
            activeCheckoutDialog = null;
        }
    }

    /**
     * 4a. startNativeDropCheckout: Launches Cashfree PG Android SDK Drop Checkout
     * (UPI-first with PhonePe/GPay/Paytm + Cards/Wallets/Netbanking) natively inside the app.
     */
    @PluginMethod
    public void startNativeDropCheckout(PluginCall call) {
        CashfreeDropCheckoutHelper.startDropCheckout(call, getActivity(), getBridge());
    }

    /**
     * 4b. openInAppCheckout: Renders Cashfree hosted checkout in an embedded in-app WebView Dialog
     * on https://trustitreview.com so Google Chrome never opens externally while supporting 1-tap UPI app intents.
     */
    @PluginMethod
    public void openInAppCheckout(PluginCall call) {
        String rawUrl = call.getString("url");
        if (rawUrl == null || rawUrl.trim().isEmpty()) {
            call.reject("Checkout URL is required.");
            return;
        }

        final String trimmedUrl = rawUrl.trim();
        final Uri uri;
        try {
            uri = Uri.parse(trimmedUrl);
        } catch (Exception e) {
            call.reject("Invalid checkout URL.");
            return;
        }

        if (uri == null || !"https".equalsIgnoreCase(uri.getScheme()) || !isAllowedCheckoutEntryHost(uri.getHost())) {
            call.reject("Only allowlisted https:// checkout URLs are permitted.");
            return;
        }

        final android.app.Activity activity = getActivity();
        if (activity == null || activity.isFinishing()) {
            call.reject("Android activity unavailable.");
            return;
        }

        activity.runOnUiThread(() -> {
            try {
                dismissActiveCheckoutDialog(null);

                final android.app.Dialog dialog = new android.app.Dialog(
                    activity,
                    android.R.style.Theme_DeviceDefault_NoActionBar_Fullscreen
                );
                activeCheckoutDialog = dialog;

                android.widget.LinearLayout root = new android.widget.LinearLayout(activity);
                root.setOrientation(android.widget.LinearLayout.VERTICAL);
                root.setBackgroundColor(android.graphics.Color.parseColor("#0F172A"));

                // Header bar
                android.widget.LinearLayout header = new android.widget.LinearLayout(activity);
                header.setOrientation(android.widget.LinearLayout.HORIZONTAL);
                header.setGravity(android.view.Gravity.CENTER_VERTICAL);
                header.setBackgroundColor(android.graphics.Color.parseColor("#0F172A"));
                int padH = (int) (14 * activity.getResources().getDisplayMetrics().density);
                int padV = (int) (10 * activity.getResources().getDisplayMetrics().density);
                header.setPadding(padH, padV, padH, padV);

                android.widget.TextView titleView = new android.widget.TextView(activity);
                titleView.setText("Trustit Secure Checkout • Cashfree");
                titleView.setTextColor(android.graphics.Color.WHITE);
                titleView.setTextSize(14f);
                titleView.setTypeface(android.graphics.Typeface.DEFAULT_BOLD);
                android.widget.LinearLayout.LayoutParams titleLp = new android.widget.LinearLayout.LayoutParams(
                    0,
                    android.view.ViewGroup.LayoutParams.WRAP_CONTENT,
                    1f
                );
                header.addView(titleView, titleLp);

                android.widget.TextView closeBtn = new android.widget.TextView(activity);
                closeBtn.setText("✕ Close");
                closeBtn.setTextColor(android.graphics.Color.parseColor("#E2E8F0"));
                closeBtn.setTextSize(13f);
                closeBtn.setTypeface(android.graphics.Typeface.DEFAULT_BOLD);
                closeBtn.setPadding(padH, padV / 2, padH / 2, padV / 2);
                header.addView(closeBtn);
                root.addView(header, new android.widget.LinearLayout.LayoutParams(
                    android.view.ViewGroup.LayoutParams.MATCH_PARENT,
                    android.view.ViewGroup.LayoutParams.WRAP_CONTENT
                ));

                // Progress bar
                final android.widget.ProgressBar progressBar = new android.widget.ProgressBar(
                    activity,
                    null,
                    android.R.attr.progressBarStyleHorizontal
                );
                progressBar.setIndeterminate(false);
                progressBar.setMax(100);
                root.addView(progressBar, new android.widget.LinearLayout.LayoutParams(
                    android.view.ViewGroup.LayoutParams.MATCH_PARENT,
                    (int) (3 * activity.getResources().getDisplayMetrics().density)
                ));

                // Dedicated embedded WebView (no @JavascriptInterface, file access disabled)
                final android.webkit.WebView checkoutWebView = new android.webkit.WebView(activity);
                android.webkit.WebSettings settings = checkoutWebView.getSettings();
                settings.setJavaScriptEnabled(true);
                settings.setDomStorageEnabled(true);
                settings.setJavaScriptCanOpenWindowsAutomatically(true);
                settings.setSupportMultipleWindows(false);
                settings.setAllowFileAccess(false);
                settings.setAllowContentAccess(false);
                settings.setMixedContentMode(android.webkit.WebSettings.MIXED_CONTENT_NEVER_ALLOW);
                android.webkit.CookieManager.getInstance().setAcceptThirdPartyCookies(checkoutWebView, true);

                final String orderIdHint = uri.getQueryParameter("orderId");

                checkoutWebView.setWebChromeClient(new android.webkit.WebChromeClient() {
                    @Override
                    public void onProgressChanged(android.webkit.WebView view, int newProgress) {
                        progressBar.setProgress(newProgress);
                        progressBar.setVisibility(newProgress >= 100 ? android.view.View.GONE : android.view.View.VISIBLE);
                    }
                });

                checkoutWebView.setWebViewClient(new android.webkit.WebViewClient() {
                    private boolean handleCustomNavigation(Uri navUri) {
                        if (navUri == null) return false;
                        String scheme = navUri.getScheme() == null ? "" : navUri.getScheme().toLowerCase(Locale.ROOT);

                        if ("https".equals(scheme)) {
                            return false; // Stay inside the in-app WebView
                        }

                        if ("com.trustit.customer".equals(scheme) && "pay".equalsIgnoreCase(navUri.getHost())) {
                            dismissActiveCheckoutDialog(checkoutWebView);
                            MainActivity.dispatchPaymentReturnUri(getBridge(), navUri, false);
                            return true;
                        }

                        if ("intent".equals(scheme)) {
                            try {
                                Intent parsed = Intent.parseUri(navUri.toString(), Intent.URI_INTENT_SCHEME);
                                String parsedScheme = parsed.getScheme() == null ? "" : parsed.getScheme().toLowerCase(Locale.ROOT);
                                if (ALLOWED_UPI_SCHEMES.contains(parsedScheme)) {
                                    parsed.setSelector(null);
                                    parsed.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                                    if (parsed.resolveActivity(activity.getPackageManager()) != null) {
                                        activity.startActivity(parsed);
                                        return true;
                                    }
                                }
                                String fallbackUrl = parsed.getStringExtra("browser_fallback_url");
                                if (fallbackUrl != null && fallbackUrl.toLowerCase(Locale.ROOT).startsWith("https://")) {
                                    checkoutWebView.loadUrl(fallbackUrl);
                                    return true;
                                }
                            } catch (Exception ignored) {}
                            return true;
                        }

                        if (ALLOWED_UPI_SCHEMES.contains(scheme)) {
                            try {
                                Intent upiIntent = new Intent(Intent.ACTION_VIEW, navUri);
                                upiIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                                activity.startActivity(upiIntent);
                            } catch (Exception ex) {
                                android.widget.Toast.makeText(
                                    activity,
                                    "Requested UPI app is not installed on this device.",
                                    android.widget.Toast.LENGTH_SHORT
                                ).show();
                            }
                            return true;
                        }

                        return true;
                    }

                    @Override
                    public boolean shouldOverrideUrlLoading(android.webkit.WebView view, android.webkit.WebResourceRequest request) {
                        return handleCustomNavigation(request.getUrl());
                    }

                    @Override
                    public boolean shouldOverrideUrlLoading(android.webkit.WebView view, String url) {
                        return handleCustomNavigation(Uri.parse(url));
                    }
                });

                root.addView(checkoutWebView, new android.widget.LinearLayout.LayoutParams(
                    android.view.ViewGroup.LayoutParams.MATCH_PARENT,
                    0,
                    1f
                ));

                final Runnable cancelAndDismiss = () -> {
                    dismissActiveCheckoutDialog(checkoutWebView);
                    Uri cancelUri = Uri.parse(
                        "com.trustit.customer://pay/return?orderId="
                            + Uri.encode(orderIdHint != null ? orderIdHint : "")
                            + "&status=cancelled"
                    );
                    MainActivity.dispatchPaymentReturnUri(getBridge(), cancelUri, false);
                };

                closeBtn.setOnClickListener(v -> cancelAndDismiss.run());
                dialog.setOnCancelListener(d -> cancelAndDismiss.run());
                dialog.setOnKeyListener((d, keyCode, event) -> {
                    if (keyCode == android.view.KeyEvent.KEYCODE_BACK && event.getAction() == android.view.KeyEvent.ACTION_UP) {
                        if (checkoutWebView.canGoBack()) {
                            checkoutWebView.goBack();
                        } else {
                            cancelAndDismiss.run();
                        }
                        return true;
                    }
                    return false;
                });

                dialog.setContentView(root);
                if (dialog.getWindow() != null) {
                    dialog.getWindow().setLayout(
                        android.view.ViewGroup.LayoutParams.MATCH_PARENT,
                        android.view.ViewGroup.LayoutParams.MATCH_PARENT
                    );
                }
                dialog.show();
                checkoutWebView.loadUrl(trimmedUrl);

                JSObject res = new JSObject();
                res.put("opened", true);
                res.put("mode", "in_app_webview");
                call.resolve(res);
            } catch (Exception e) {
                call.reject("Failed to open in-app checkout: " + e.getMessage());
            }
        });
    }

    /**
     * 5. LIVE SELF-HOSTED OTA UPDATE ENGINE (SWIGGY/ZOMATO STANDARD)
     * Checks server for newer zipped Next.js bundles, downloads in background, and hot-boots cleanly.
     */
    private static final Object OTA_SYNC_LOCK = new Object();

    public static String getInstalledApkVersion(Context ctx) {
        try {
            android.content.pm.PackageInfo info = ctx.getPackageManager().getPackageInfo(ctx.getPackageName(), 0);
            if (info != null && info.versionName != null && !info.versionName.trim().isEmpty()) {
                return info.versionName.trim();
            }
        } catch (Exception ignored) {}
        return "2.6.0";
    }

    public static int compareSemver(String a, String b) {
        String[] aParts = (a == null ? "" : a.trim()).split("\\.");
        String[] bParts = (b == null ? "" : b.trim()).split("\\.");
        int len = Math.max(aParts.length, bParts.length);
        for (int i = 0; i < len; i++) {
            int av = 0;
            int bv = 0;
            try { if (i < aParts.length) av = Integer.parseInt(aParts[i].replaceAll("[^0-9]", "")); } catch (Exception ignored) {}
            try { if (i < bParts.length) bv = Integer.parseInt(bParts[i].replaceAll("[^0-9]", "")); } catch (Exception ignored) {}
            if (av != bv) return Integer.compare(av, bv);
        }
        return 0;
    }

    public static String maxSemver(String a, String b) {
        return compareSemver(a, b) >= 0 ? a : b;
    }

    /**
     * Clears any stale cached OTA folder if the user installed a newer native APK.
     */
    public static void syncInstalledApkBaseline(Context ctx) {
        try {
            String installedApkVersion = getInstalledApkVersion(ctx);
            android.content.SharedPreferences capPrefs = ctx.getSharedPreferences("CapWebViewSettings", Context.MODE_PRIVATE);
            android.content.SharedPreferences otaPrefs = ctx.getSharedPreferences("TrustitOtaSettings", Context.MODE_PRIVATE);

            String recordedApkVersion = capPrefs.getString("apkVersion", "");
            String storedOtaVersion = otaPrefs.getString("activeVersion", "");

            boolean apkChanged = !installedApkVersion.equals(recordedApkVersion);
            boolean otaNotNewerThanApk = storedOtaVersion.isEmpty() || compareSemver(storedOtaVersion, installedApkVersion) <= 0;

            if (apkChanged || otaNotNewerThanApk) {
                capPrefs.edit()
                    .remove("serverBasePath")
                    .putString("apkVersion", installedApkVersion)
                    .apply();
                if (otaNotNewerThanApk) {
                    otaPrefs.edit().putString("activeVersion", installedApkVersion).apply();
                }
            }
        } catch (Exception ignored) {}
    }

    private static void deleteDirRecursive(java.io.File fileOrDir) {
        if (fileOrDir == null || !fileOrDir.exists()) return;
        java.io.File[] children = fileOrDir.listFiles();
        if (children != null) {
            for (java.io.File child : children) {
                deleteDirRecursive(child);
            }
        }
        fileOrDir.delete();
    }

    private static JSObject syncOtaInternal(Context ctx, com.getcapacitor.Bridge bridge, String manifestUrlOverride, String jsVersionHint) throws Exception {
        synchronized (OTA_SYNC_LOCK) {
            syncInstalledApkBaseline(ctx);

            String pkg = ctx.getPackageName().toLowerCase();
            String appName = "customer";
            if (pkg.contains("rider")) {
                appName = "rider";
            } else if (pkg.contains("partner") || pkg.contains("merchant")) {
                appName = "partner";
            }

            String installedApkVersion = getInstalledApkVersion(ctx);
            android.content.SharedPreferences otaPrefs = ctx.getSharedPreferences("TrustitOtaSettings", Context.MODE_PRIVATE);
            String storedActive = otaPrefs.getString("activeVersion", installedApkVersion);
            String baselineVersion = maxSemver(maxSemver(storedActive, installedApkVersion), jsVersionHint != null ? jsVersionHint : installedApkVersion);

            String baseUrl = (manifestUrlOverride != null && !manifestUrlOverride.isEmpty())
                ? manifestUrlOverride
                : "https://trustitreview.com/api/hyperlocal/ota?app=" + appName;
            String sep = baseUrl.contains("?") ? "&" : "?";

            java.net.URL url = new java.net.URL(baseUrl + sep + "current=" + baselineVersion);
            java.net.HttpURLConnection conn = (java.net.HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setConnectTimeout(12000);
            conn.setReadTimeout(12000);

            int code = conn.getResponseCode();
            if (code != 200) {
                conn.disconnect();
                JSObject res = new JSObject();
                res.put("hasUpdate", false);
                res.put("status", code);
                return res;
            }

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

            if (!hasUpdate || latestVersion.isEmpty() || compareSemver(latestVersion, baselineVersion) <= 0 || bundleUrl.isEmpty()) {
                JSObject res = new JSObject();
                res.put("hasUpdate", false);
                res.put("activeVersion", baselineVersion);
                return res;
            }

            java.io.File otaBaseDir = new java.io.File(ctx.getFilesDir(), "trustit_ota");
            if (!otaBaseDir.exists()) otaBaseDir.mkdirs();

            java.io.File tempDir = new java.io.File(otaBaseDir, "v_" + latestVersion.replace(".", "_") + "_tmp");
            java.io.File targetDir = new java.io.File(otaBaseDir, "v_" + latestVersion.replace(".", "_"));
            deleteDirRecursive(tempDir);
            tempDir.mkdirs();

            java.net.URL zipUrl = new java.net.URL(bundleUrl);
            java.net.HttpURLConnection zipConn = (java.net.HttpURLConnection) zipUrl.openConnection();
            zipConn.setConnectTimeout(30000);
            zipConn.setReadTimeout(60000);
            int zipCode = zipConn.getResponseCode();
            if (zipCode != 200) {
                zipConn.disconnect();
                deleteDirRecursive(tempDir);
                throw new Exception("OTA download failed: HTTP " + zipCode);
            }

            try (java.util.zip.ZipInputStream zis = new java.util.zip.ZipInputStream(zipConn.getInputStream())) {
                java.util.zip.ZipEntry entry;
                byte[] buf = new byte[8192];
                String tempRootCanonical = tempDir.getCanonicalPath();
                String canonicalTemp = tempRootCanonical + java.io.File.separator;
                while ((entry = zis.getNextEntry()) != null) {
                    java.io.File destFile = new java.io.File(tempDir, entry.getName());
                    String destCanonical = destFile.getCanonicalPath();
                    if (!destCanonical.equals(tempRootCanonical) && !destCanonical.startsWith(canonicalTemp)) {
                        throw new SecurityException("Invalid ZIP entry path: " + entry.getName());
                    }
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

            java.io.File tempIndex = new java.io.File(tempDir, "index.html");
            if (!tempIndex.exists()) {
                deleteDirRecursive(tempDir);
                throw new Exception("Corrupt OTA package: index.html not found");
            }

            deleteDirRecursive(targetDir);
            if (!tempDir.renameTo(targetDir)) {
                deleteDirRecursive(tempDir);
                throw new Exception("Failed to activate OTA directory");
            }

            otaPrefs.edit().putString("activeVersion", latestVersion).apply();
            android.content.SharedPreferences capPrefs = ctx.getSharedPreferences("CapWebViewSettings", Context.MODE_PRIVATE);
            capPrefs.edit()
                .putString("serverBasePath", targetDir.getAbsolutePath())
                .putString("apkVersion", installedApkVersion)
                .apply();

            if (bridge != null && bridge.getActivity() != null) {
                bridge.getActivity().runOnUiThread(() -> {
                    try {
                        if (bridge.getWebView() != null) {
                            bridge.getWebView().clearCache(true);
                        }
                    } catch (Exception ignored) {}
                    bridge.setServerBasePath(targetDir.getAbsolutePath());
                });
            }

            JSObject res = new JSObject();
            res.put("hasUpdate", true);
            res.put("appliedVersion", latestVersion);
            res.put("message", "Live OTA update applied successfully without APK reinstall!");
            return res;
        }
    }

    public static void performBackgroundOtaSync(Context ctx, com.getcapacitor.Bridge bridge) {
        new Thread(() -> {
            try {
                syncOtaInternal(ctx, bridge, null, null);
            } catch (Exception ignored) {}
        }).start();
    }

    @PluginMethod
    public void checkAndApplyOta(PluginCall call) {
        final String manifestUrl = call.getString("manifestUrl", "");
        final String currentVersion = call.getString("currentVersion", "");

        new Thread(() -> {
            try {
                JSObject res = syncOtaInternal(
                    getContext(),
                    getBridge(),
                    manifestUrl.isEmpty() ? null : manifestUrl,
                    currentVersion.isEmpty() ? null : currentVersion
                );
                call.resolve(res);
            } catch (Exception e) {
                JSObject err = new JSObject();
                err.put("error", e.getMessage());
                call.reject("OTA error: " + e.getMessage(), err);
            }
        }).start();
    }

    /**
     * Native Alarm-stream emergency siren for Customer & Rider order dispatch alerts.
     */
    @PluginMethod
    public void playEmergencySiren(PluginCall call) {
        try {
            Context context = getContext();

            if (context != null) {
                try {
                    PowerManager pm = (PowerManager) context.getSystemService(Context.POWER_SERVICE);
                    if (pm != null && (sirenWakeLock == null || !sirenWakeLock.isHeld())) {
                        sirenWakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "Trustit::OrderSirenLock");
                        sirenWakeLock.acquire(45000L);
                    }
                } catch (Exception ignored) {}

                Uri alarmUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM);
                if (alarmUri == null) {
                    alarmUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE);
                }
                if (alarmUri != null) {
                    if (currentRingtone != null && currentRingtone.isPlaying()) {
                        currentRingtone.stop();
                    }
                    currentRingtone = RingtoneManager.getRingtone(context, alarmUri);
                    if (currentRingtone != null) {
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                            currentRingtone.setAudioAttributes(
                                new AudioAttributes.Builder()
                                    .setUsage(AudioAttributes.USAGE_ALARM)
                                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                                    .build()
                            );
                        } else {
                            currentRingtone.setStreamType(AudioManager.STREAM_ALARM);
                        }
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                            currentRingtone.setLooping(true);
                        }
                        currentRingtone.play();
                    }
                }

                Vibrator vibrator = (Vibrator) context.getSystemService(Context.VIBRATOR_SERVICE);
                if (vibrator != null && vibrator.hasVibrator()) {
                    long[] pattern = {0, 600, 300, 600, 300, 800};
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                        vibrator.vibrate(VibrationEffect.createWaveform(pattern, -1));
                    } else {
                        vibrator.vibrate(pattern, -1);
                    }
                }
            }

            JSObject res = new JSObject();
            res.put("success", true);
            res.put("channel", "STREAM_ALARM");
            res.put("message", "Order siren sounding on hardware alarm stream");
            call.resolve(res);
        } catch (Exception e) {
            call.reject("Failed to trigger order siren: " + e.getMessage());
        }
    }

    @PluginMethod
    public void stopEmergencySiren(PluginCall call) {
        try {
            if (currentRingtone != null && currentRingtone.isPlaying()) {
                currentRingtone.stop();
                currentRingtone = null;
            }
            if (sirenWakeLock != null && sirenWakeLock.isHeld()) {
                sirenWakeLock.release();
                sirenWakeLock = null;
            }
            Context context = getContext();
            if (context != null) {
                Vibrator vibrator = (Vibrator) context.getSystemService(Context.VIBRATOR_SERVICE);
                if (vibrator != null) {
                    vibrator.cancel();
                }
            }
            JSObject res = new JSObject();
            res.put("success", true);
            res.put("message", "Siren stopped");
            call.resolve(res);
        } catch (Exception e) {
            call.reject("Failed to stop siren: " + e.getMessage());
        }
    }
}
