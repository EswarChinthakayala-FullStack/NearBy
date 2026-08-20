package com.tourismguide.app.common.util

import android.content.Context
import android.content.ContextWrapper
import android.view.View
import android.view.inputmethod.InputMethodManager

object SystemLeakFixer {

    private val IMM_LEAK_FIELDS = arrayOf(
        "mServedView",
        "mNextServedView",
        "mCurRootView",
        "mLastSrvView",
        "mFocusedView",
        "mActiveView"
    )

    fun fixSystemLeaks(context: Context) {
        fixInputMethodManagerLeak(context)
        fixWindowManagerGlobalLeak(context)
    }

    fun fixInputMethodManagerLeak(context: Context) {
        val imm = context.getSystemService(Context.INPUT_METHOD_SERVICE) as? InputMethodManager ?: return

        for (fieldName in IMM_LEAK_FIELDS) {
            try {
                val field = imm.javaClass.getDeclaredField(fieldName)
                if (!field.isAccessible) {
                    field.isAccessible = true
                }
                val obj = field.get(imm) ?: continue

                if (obj is View) {
                    val viewContext = obj.context
                    val rootContext = obj.rootView?.context
                    if (isContextMatching(viewContext, context) || isContextMatching(rootContext, context)) {
                        field.set(imm, null)
                    }
                } else {
                    try {
                        field.set(imm, null)
                    } catch (_: Throwable) {}
                }
            } catch (_: Throwable) {}
        }
    }

    private fun fixWindowManagerGlobalLeak(context: Context) {
        try {
            val wmgClass = Class.forName("android.view.WindowManagerGlobal")
            val getInstanceMethod = wmgClass.getMethod("getInstance")
            val wmgInstance = getInstanceMethod.invoke(null) ?: return

            val mViewsField = wmgClass.getDeclaredField("mViews").apply { isAccessible = true }
            val mRootsField = wmgClass.getDeclaredField("mRoots").apply { isAccessible = true }
            val mParamsField = wmgClass.getDeclaredField("mParams").apply { isAccessible = true }

            val views = mViewsField.get(wmgInstance) as? ArrayList<View>
            val roots = mRootsField.get(wmgInstance) as? ArrayList<*>
            val params = mParamsField.get(wmgInstance) as? ArrayList<*>

            if (views != null) {
                val iterator = views.iterator()
                var index = 0
                while (iterator.hasNext()) {
                    val view = iterator.next()
                    if (isContextMatching(view.context, context) || isContextMatching(view.rootView?.context, context)) {
                        iterator.remove()
                        if (roots != null && index < roots.size) {
                            try { roots.removeAt(index) } catch (_: Throwable) {}
                        }
                        if (params != null && index < params.size) {
                            try { params.removeAt(index) } catch (_: Throwable) {}
                        }
                        index--
                    }
                    index++
                }
            }
        } catch (_: Throwable) {
            // System reflection safeguard
        }
    }

    private fun isContextMatching(viewContext: Context?, targetContext: Context): Boolean {
        if (viewContext == null) return false
        if (viewContext === targetContext) return true
        if (viewContext is ContextWrapper && viewContext.baseContext === targetContext) return true
        return false
    }
}
