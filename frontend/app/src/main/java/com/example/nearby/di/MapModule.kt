package com.example.nearby.di

import com.example.nearby.data.map.CartoVectorStyleProvider
import com.example.nearby.domain.map.MapStyleProvider
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
abstract class MapModule {

    @Binds
    @Singleton
    abstract fun bindMapStyleProvider(
        cartoVectorStyleProvider: CartoVectorStyleProvider
    ): MapStyleProvider
}
