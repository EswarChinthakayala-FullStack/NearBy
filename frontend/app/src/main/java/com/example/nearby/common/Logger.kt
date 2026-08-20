package com.example.nearby.common

interface Logger {
    fun d(message: String, vararg args: Any?)
    fun i(message: String, vararg args: Any?)
    fun w(message: String, vararg args: Any?)
    fun e(throwable: Throwable?, message: String, vararg args: Any?)
    fun c(message: String, throwable: Throwable? = null) // Critical
}
