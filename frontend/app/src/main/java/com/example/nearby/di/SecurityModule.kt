package com.example.nearby.di

import com.example.nearby.security.EmulatorDetector
import com.example.nearby.security.EmulatorDetectorImpl
import com.example.nearby.security.EncryptedDataStoreImpl
import com.example.nearby.security.RootDetector
import com.example.nearby.security.RootDetectorImpl
import com.example.nearby.security.SecureStorage
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
abstract class SecurityModule {

    @Binds
    @Singleton
    abstract fun bindSecureStorage(
        encryptedDataStoreImpl: EncryptedDataStoreImpl
    ): SecureStorage

    @Binds
    @Singleton
    abstract fun bindRootDetector(
        rootDetectorImpl: RootDetectorImpl
    ): RootDetector

    @Binds
    @Singleton
    abstract fun bindEmulatorDetector(
        emulatorDetectorImpl: EmulatorDetectorImpl
    ): EmulatorDetector
}
