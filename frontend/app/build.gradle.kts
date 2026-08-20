plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.serialization)
    alias(libs.plugins.ksp)
    alias(libs.plugins.hilt)
}

android {
    namespace = "com.example.nearby"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.example.nearby"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "com.example.nearby.testing.CustomTestRunner"

        vectorDrawables {
            useSupportLibrary = true
        }

        // Default BuildConfig fields
        buildConfigField("String", "API_BASE_URL", "\"http://10.0.2.2:8000/api/v1/\"")
        buildConfigField("String", "MAP_STYLE_URL", "\"https://demotiles.maplibre.org/style.json\"")
        buildConfigField("String", "MAP_STYLE_LIGHT", "\"https://demotiles.maplibre.org/style.json\"")
        buildConfigField("String", "MAP_STYLE_DARK", "\"https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json\"")
        buildConfigField("Boolean", "ENABLE_LOGGING", "true")
        buildConfigField("Boolean", "IS_CRASHLYTICS_ENABLED", "false")
    }

    buildTypes {
        debug {
            isMinifyEnabled = false
            applicationIdSuffix = ".debug"
            versionNameSuffix = "-debug"
            buildConfigField("String", "API_BASE_URL", "\"http://127.0.0.1:8000/api/v1/\"")
            buildConfigField("String", "MAP_STYLE_URL", "\"https://demotiles.maplibre.org/style.json\"")
            buildConfigField("Boolean", "ENABLE_LOGGING", "true")
            buildConfigField("Boolean", "IS_CRASHLYTICS_ENABLED", "false")
        }

        create("qa") {
            initWith(getByName("debug"))
            applicationIdSuffix = ".qa"
            versionNameSuffix = "-qa"
            buildConfigField("String", "API_BASE_URL", "\"https://qa-api.nearby.app/api/v1/\"")
            buildConfigField("String", "MAP_STYLE_URL", "\"https://qa-tiles.nearby.app/style.json\"")
            buildConfigField("Boolean", "ENABLE_LOGGING", "true")
            buildConfigField("Boolean", "IS_CRASHLYTICS_ENABLED", "true")
            matchingFallbacks.add("debug")
        }

        create("staging") {
            initWith(getByName("release"))
            applicationIdSuffix = ".staging"
            versionNameSuffix = "-staging"
            isMinifyEnabled = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            buildConfigField("String", "API_BASE_URL", "\"https://staging-api.nearby.app/api/v1/\"")
            buildConfigField("String", "MAP_STYLE_URL", "\"https://staging-tiles.nearby.app/style.json\"")
            buildConfigField("Boolean", "ENABLE_LOGGING", "true")
            buildConfigField("Boolean", "IS_CRASHLYTICS_ENABLED", "true")
            matchingFallbacks.add("release")
        }

        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            buildConfigField("String", "API_BASE_URL", "\"https://api.nearby.app/api/v1/\"")
            buildConfigField("String", "MAP_STYLE_URL", "\"https://tiles.nearby.app/style.json\"")
            buildConfigField("Boolean", "ENABLE_LOGGING", "false")
            buildConfigField("Boolean", "IS_CRASHLYTICS_ENABLED", "true")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
        freeCompilerArgs += listOf(
            "-opt-in=kotlinx.coroutines.ExperimentalCoroutinesApi",
            "-opt-in=kotlinx.coroutines.FlowPreview",
            "-opt-in=kotlinx.serialization.ExperimentalSerializationApi"
        )
    }

    buildFeatures {
        viewBinding = true
        buildConfig = true
    }

    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
            excludes += "META-INF/LICENSE.md"
            excludes += "META-INF/LICENSE-notice.md"
        }
    }
}

dependencies {
    // AndroidX Core & UI
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.appcompat)
    implementation(libs.material)
    implementation(libs.androidx.constraintlayout)
    implementation(libs.androidx.activity.ktx)
    implementation(libs.androidx.fragment.ktx)
    implementation(libs.androidx.recyclerview)
    implementation(libs.androidx.recyclerview.selection)
    implementation(libs.androidx.swiperefreshlayout)
    implementation(libs.androidx.transition)

    // Lifecycle
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.lifecycle.viewmodel.ktx)
    implementation(libs.androidx.lifecycle.livedata.ktx)

    // Navigation
    implementation(libs.androidx.navigation.fragment.ktx)
    implementation(libs.androidx.navigation.ui.ktx)

    // Dependency Injection (Hilt)
    implementation(libs.hilt.android)
    ksp(libs.hilt.compiler)
    implementation(libs.androidx.hilt.work)
    ksp(libs.androidx.hilt.compiler)

    // Networking & Serialization Bundles
    implementation(libs.bundles.networking)
    implementation(libs.okhttp.dnsoverhttps)
    debugImplementation(libs.chucker.debug)
    releaseImplementation(libs.chucker.release)

    // Coroutines
    implementation(libs.kotlinx.coroutines.core)
    implementation(libs.kotlinx.coroutines.android)

    // Room Database
    implementation(libs.bundles.room)
    ksp(libs.androidx.room.compiler)

    // Local Storage & Security
    implementation(libs.androidx.datastore.preferences)
    implementation(libs.androidx.security.crypto)

    // Coil 3 Image Loading Bundle
    implementation(libs.bundles.coil)

    // Maps & Location
    implementation(libs.maplibre.sdk)
    implementation(libs.play.services.location)

    // Pagination & WorkManager
    implementation(libs.androidx.paging.runtime)
    implementation(libs.androidx.work.runtime.ktx)

    // Performance & Utilities
    implementation(libs.androidx.startup)
    implementation(libs.androidx.profileinstaller)
    implementation(libs.androidx.tracing)
    implementation(libs.androidx.jankstats)
    implementation(libs.timber)
    implementation(libs.lottie)
    implementation(libs.shimmer)

    debugImplementation(libs.leakcanary)

    // Testing
    testImplementation(libs.bundles.testing.unit)
    testImplementation(libs.junit.jupiter.api)
    testRuntimeOnly(libs.junit.jupiter.engine)
    testImplementation(libs.okhttp.mockwebserver)
    testImplementation(libs.androidx.room.testing)

    androidTestImplementation(libs.bundles.testing.android)
    androidTestImplementation(libs.hilt.android.testing)
    kspAndroidTest(libs.hilt.compiler)
    androidTestImplementation(libs.androidx.uiautomator)
}