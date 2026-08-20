package com.tourismguide.app.di

import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Named
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object BuildConfigModule {

    @Provides
    @Singleton
    @Named("API_BASE_URL")
    fun provideApiBaseUrl(): String = "https://api.nearby.example.com/"

    @Provides
    @Singleton
    @Named("IS_DEBUG")
    fun provideIsDebug(): Boolean = true

    @Provides
    @Singleton
    @Named("API_VERSION")
    fun provideApiVersion(): String = "v1"
}
