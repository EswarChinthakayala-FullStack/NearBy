package com.example.nearby.domain.usecase

import com.example.nearby.domain.result.Result
import com.example.nearby.domain.result.RootError
import kotlinx.coroutines.flow.Flow

/**
 * Functional contract for UseCases accepting input parameters.
 */
interface BaseUseCase<in Params, out Type> {
    suspend operator fun invoke(params: Params): Type
}

/**
 * Functional contract for parameterless UseCases.
 */
interface NoParamUseCase<out Type> {
    suspend operator fun invoke(): Type
}

/**
 * Functional contract for UseCases returning a reactive Flow of Domain Results.
 */
interface FlowUseCase<in Params, out Type, out Error : RootError> {
    operator fun invoke(params: Params): Flow<Result<Type, Error>>
}
