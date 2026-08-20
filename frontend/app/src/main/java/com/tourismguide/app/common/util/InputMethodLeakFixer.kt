package com.tourismguide.app.common.util

import android.content.Context

object InputMethodLeakFixer {
    fun fixInputMethodManagerLeak(context: Context) {
        SystemLeakFixer.fixSystemLeaks(context)
    }
}
