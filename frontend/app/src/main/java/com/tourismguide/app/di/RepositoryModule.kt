package com.tourismguide.app.di

import com.tourismguide.app.data.repository.AuthRepositoryImpl
import com.tourismguide.app.data.repository.PlacesRepositoryImpl
import com.tourismguide.app.domain.repository.AuthRepository
import com.tourismguide.app.domain.repository.PlacesRepository
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
abstract class RepositoryModule {

    @Binds
    @Singleton
    abstract fun bindAuthRepository(
        authRepositoryImpl: AuthRepositoryImpl
    ): AuthRepository

    @Binds
    @Singleton
    abstract fun bindPlacesRepository(
        placesRepositoryImpl: PlacesRepositoryImpl
    ): PlacesRepository

    @Binds
    @Singleton
    abstract fun bindItineraryRepository(
        itineraryRepositoryImpl: com.tourismguide.app.data.repository.ItineraryRepositoryImpl
    ): com.tourismguide.app.domain.repository.ItineraryRepository

    @Binds
    @Singleton
    abstract fun bindAiRepository(
        aiRepositoryImpl: com.tourismguide.app.data.repository.AiRepositoryImpl
    ): com.tourismguide.app.domain.repository.AiRepository
}
