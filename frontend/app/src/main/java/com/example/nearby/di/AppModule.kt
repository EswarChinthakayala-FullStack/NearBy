package com.example.nearby.di

import com.example.nearby.common.ConnectivityObserver
import com.example.nearby.common.Logger
import com.example.nearby.common.NetworkConnectivityObserver
import com.example.nearby.common.TimberLoggerImpl
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
abstract class AppModule {

    @Binds
    @Singleton
    abstract fun bindLogger(
        loggerImpl: TimberLoggerImpl
    ): Logger

    @Binds
    @Singleton
    abstract fun bindConnectivityObserver(
        connectivityObserverImpl: NetworkConnectivityObserver
    ): ConnectivityObserver
}
