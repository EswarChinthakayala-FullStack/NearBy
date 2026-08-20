package com.example.nearby.di

import android.content.Context
import com.example.nearby.BuildConfig
import com.example.nearby.network.interceptors.AuthInterceptor
import com.example.nearby.network.interceptors.ConnectivityInterceptor
import com.example.nearby.network.interceptors.RequestIdInterceptor
import com.example.nearby.network.interceptors.TokenAuthenticator
import com.chuckerteam.chucker.api.ChuckerInterceptor
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import kotlinx.serialization.json.Json
import okhttp3.Cache
import okhttp3.ConnectionPool
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.kotlinx.serialization.asConverterFactory
import java.io.File
import java.util.concurrent.TimeUnit
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {

    @Provides
    @Singleton
    fun provideJson(): Json = Json {
        ignoreUnknownKeys = true
        explicitNulls = false
        encodeDefaults = false
        coerceInputValues = true
        isLenient = true
        prettyPrint = false
    }

    @Provides
    @Singleton
    fun provideHttpCache(
        @ApplicationContext context: Context
    ): Cache {
        val cacheDir = File(context.cacheDir, "http_cache")
        return Cache(cacheDir, 20L * 1024L * 1024L) // 20 MB Cache
    }

    @Provides
    @Singleton
    fun provideOkHttpClient(
        @ApplicationContext context: Context,
        cache: Cache,
        authInterceptor: AuthInterceptor,
        tokenAuthenticator: TokenAuthenticator,
        connectivityInterceptor: ConnectivityInterceptor,
        requestIdInterceptor: RequestIdInterceptor
    ): OkHttpClient {
        val builder = OkHttpClient.Builder()
            .cache(cache)
            .connectionPool(ConnectionPool(5, 5, TimeUnit.MINUTES))
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .callTimeout(60, TimeUnit.SECONDS)
            .addInterceptor(requestIdInterceptor)
            .addInterceptor(connectivityInterceptor)
            .addInterceptor(authInterceptor)
            .authenticator(tokenAuthenticator)

        if (BuildConfig.ENABLE_LOGGING) {
            val loggingInterceptor = HttpLoggingInterceptor().apply {
                level = HttpLoggingInterceptor.Level.BODY
            }
            builder.addInterceptor(loggingInterceptor)
            builder.addInterceptor(ChuckerInterceptor.Builder(context).build())
        }

        return builder.build()
    }

    @Provides
    @Singleton
    fun provideRetrofit(
        okHttpClient: OkHttpClient,
        json: Json
    ): Retrofit {
        val contentType = "application/json".toMediaType()
        return Retrofit.Builder()
            .baseUrl(BuildConfig.API_BASE_URL)
            .client(okHttpClient)
            .addConverterFactory(json.asConverterFactory(contentType))
            .build()
    }

    @Provides
    @Singleton
    fun provideAuthApiService(retrofit: Retrofit): com.example.nearby.data.remote.api.AuthApiService {
        return retrofit.create(com.example.nearby.data.remote.api.AuthApiService::class.java)
    }
}
