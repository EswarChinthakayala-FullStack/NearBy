# ProGuard / R8 optimization rules for Enterprise 2026 Android App

# Keep Kotlinx Serialization models & descriptors
-keepattributes *Annotation*,Signature,InnerClasses,EnclosingMethod
-keepclassmembers class * {
    @kotlinx.serialization.Serializable <fields>;
    @kotlinx.serialization.SerialName <fields>;
}
-keepclassmembers class * {
    *** Companion;
}
-keepclassmembers class **$serializer {
    *** INSTANCE;
}

# Keep Retrofit Service interfaces and annotations
-keepclassmembers,allowobfuscation interface * {
    @retrofit2.http.* <methods>;
}
-dontwarn retrofit2.**

# Keep OkHttp
-dontwarn okhttp3.**
-dontwarn okio.**
-keepnames class okhttp3.internal.publicsuffix.PublicSuffixDatabase

# Keep Room generated code
-keep class * extends androidx.room.RoomDatabase
-dontwarn androidx.room.paging.**

# Keep Hilt / Dagger generated components
-keep class * extends dagger.hilt.internal.UnsafeCasts
-keepclassmembers,allowobfuscation class * {
    @javax.inject.Inject <init>(...);
}

# Keep MapLibre Native symbols
-keep class org.maplibre.android.** { *; }
-dontwarn org.maplibre.android.**

# Keep Coil 3 Image Loader
-keep class io.coilkt.coil3.** { *; }

# Keep Timber
-dontwarn com.jakewharton.timber.**