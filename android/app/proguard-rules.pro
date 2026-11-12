# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Preserve annotations and WebView @JavascriptInterface bridges
-keepattributes *Annotation*,JavascriptInterface,Signature,InnerClasses,EnclosingMethod
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Preserve Trustit native Capacitor plugin bridge and Activities across all flavors
-keep class com.trustit.**.TrustitNativeBridge { *; }
-keepclassmembers class com.trustit.**.TrustitNativeBridge { *; }
-keep class com.trustit.**.MainActivity { *; }

# Preserve Capacitor core, BridgeActivity, and all @CapacitorPlugin / @PluginMethod entries
-keep @com.getcapacitor.annotation.CapacitorPlugin public class * {
    @com.getcapacitor.annotation.PermissionCallback <methods>;
    @com.getcapacitor.annotation.ActivityCallback <methods>;
    @com.getcapacitor.annotation.Permission <methods>;
    @com.getcapacitor.PluginMethod public <methods>;
}
-keep public class * extends com.getcapacitor.Plugin { *; }
-keep public class * extends com.getcapacitor.BridgeActivity { *; }
-keep class com.getcapacitor.** { *; }
-dontwarn com.getcapacitor.**

# Preserve Apache Cordova compatibility classes used by Capacitor
-keep class org.apache.cordova.** { *; }
-dontwarn org.apache.cordova.**

# Preserve Cashfree Android PG SDK classes & callbacks under R8 minification
-keep class com.cashfree.** { *; }
-dontwarn com.cashfree.**

# Preserve line numbers and obfuscated source file name for crash stack traces
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile
