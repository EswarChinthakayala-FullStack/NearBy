package com.tourismguide.app.di

import android.content.Context
import com.tourismguide.app.data.remote.ConnectivityObserver
import com.tourismguide.app.data.remote.api.AiApiService
import com.tourismguide.app.data.remote.api.AuthApiService
import com.tourismguide.app.data.remote.api.CategoriesApiService
import com.tourismguide.app.data.remote.api.DirectionsApiService
import com.tourismguide.app.data.remote.api.FavoritesApiService
import com.tourismguide.app.data.remote.api.NotificationsApiService
import com.tourismguide.app.data.remote.api.PlacesApiService
import com.tourismguide.app.data.remote.api.ReviewsApiService
import com.tourismguide.app.data.remote.api.ItineraryApiService
import com.tourismguide.app.data.remote.ws.AiWebSocketClient
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import okhttp3.OkHttpClient
import retrofit2.Retrofit
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object AppNetworkServicesModule {

    @Provides
    @Singleton
    fun provideConnectivityObserver(@ApplicationContext context: Context): ConnectivityObserver {
        return ConnectivityObserver(context)
    }

    @Provides
    @Singleton
    fun provideAppAuthApiService(retrofit: Retrofit): AuthApiService {
        return retrofit.create(AuthApiService::class.java)
    }

    @Provides
    @Singleton
    fun providePlacesApiService(retrofit: Retrofit): PlacesApiService {
        return retrofit.create(PlacesApiService::class.java)
    }

    @Provides
    @Singleton
    fun provideCategoriesApiService(retrofit: Retrofit): CategoriesApiService {
        return retrofit.create(CategoriesApiService::class.java)
    }

    @Provides
    @Singleton
    fun provideReviewsApiService(retrofit: Retrofit): ReviewsApiService {
        return retrofit.create(ReviewsApiService::class.java)
    }

    @Provides
    @Singleton
    fun provideFavoritesApiService(retrofit: Retrofit): FavoritesApiService {
        return retrofit.create(FavoritesApiService::class.java)
    }

    @Provides
    @Singleton
    fun provideDirectionsApiService(retrofit: Retrofit): DirectionsApiService {
        return retrofit.create(DirectionsApiService::class.java)
    }

    @Provides
    @Singleton
    fun provideNotificationsApiService(retrofit: Retrofit): NotificationsApiService {
        return retrofit.create(NotificationsApiService::class.java)
    }

    @Provides
    @Singleton
    fun provideAiApiService(retrofit: Retrofit): AiApiService {
        return retrofit.create(AiApiService::class.java)
    }

    @Provides
    @Singleton
    fun provideItineraryApiService(retrofit: Retrofit): ItineraryApiService {
        return retrofit.create(ItineraryApiService::class.java)
    }

    @Provides
    @Singleton
    fun provideHomeApiService(retrofit: Retrofit): com.tourismguide.app.data.remote.api.HomeApiService {
        return retrofit.create(com.tourismguide.app.data.remote.api.HomeApiService::class.java)
    }

    @Provides
    @Singleton
    fun provideSystemApiService(retrofit: Retrofit): com.tourismguide.app.data.remote.api.SystemApiService {
        return retrofit.create(com.tourismguide.app.data.remote.api.SystemApiService::class.java)
    }

    @Provides
    @Singleton
    fun provideLocationApiService(retrofit: Retrofit): com.tourismguide.app.data.remote.api.LocationApiService {
        return retrofit.create(com.tourismguide.app.data.remote.api.LocationApiService::class.java)
    }

    @Provides
    @Singleton
    fun provideUploadsApiService(retrofit: Retrofit): com.tourismguide.app.data.remote.api.UploadsApiService {
        return retrofit.create(com.tourismguide.app.data.remote.api.UploadsApiService::class.java)
    }

    @Provides
    @Singleton
    fun provideAiWebSocketClient(okHttpClient: OkHttpClient): AiWebSocketClient {
        return AiWebSocketClient(okHttpClient)
    }
}

