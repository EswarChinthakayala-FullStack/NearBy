package com.tourismguide.app.di

import com.tourismguide.app.domain.repository.AuthRepository
import com.tourismguide.app.domain.repository.PlacesRepository
import com.tourismguide.app.domain.usecase.GetNearbyPlacesUseCase
import com.tourismguide.app.domain.usecase.LoginUseCase
import com.tourismguide.app.domain.usecase.RegisterUseCase
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object UseCaseModule {

    @Provides
    @Singleton
    fun provideLoginUseCase(authRepository: AuthRepository): LoginUseCase {
        return LoginUseCase(authRepository)
    }

    @Provides
    @Singleton
    fun provideRegisterUseCase(authRepository: AuthRepository): RegisterUseCase {
        return RegisterUseCase(authRepository)
    }

    @Provides
    @Singleton
    fun provideGetNearbyPlacesUseCase(placesRepository: PlacesRepository): GetNearbyPlacesUseCase {
        return GetNearbyPlacesUseCase(placesRepository)
    }
}
