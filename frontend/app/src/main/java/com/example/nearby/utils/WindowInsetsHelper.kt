package com.example.nearby.utils

import android.app.Activity
import android.content.res.Configuration
import android.graphics.Color
import android.os.Build
import android.view.View
import android.view.ViewGroup.MarginLayoutParams
import android.view.WindowManager
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.updateLayoutParams
import androidx.core.view.updatePadding

object WindowInsetsHelper {

    fun setupEdgeToEdge(activity: Activity) {
        val window = activity.window

        // Enable edge-to-edge layout drawing behind status & navigation bars
        WindowCompat.setDecorFitsSystemWindows(window, false)

        // Support display cutouts (notch, hole punch, foldable screens)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            window.attributes.layoutInDisplayCutoutMode =
                WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES
        }

        window.statusBarColor = Color.TRANSPARENT
        window.navigationBarColor = Color.TRANSPARENT

        val insetsController = WindowCompat.getInsetsController(window, window.decorView)
        val isNightMode = (activity.resources.configuration.uiMode and Configuration.UI_MODE_NIGHT_MASK) == Configuration.UI_MODE_NIGHT_YES

        insetsController.isAppearanceLightStatusBars = false
        insetsController.isAppearanceLightNavigationBars = !isNightMode
    }

    fun applyStatusBarTopPadding(targetView: View) {
        ViewCompat.setOnApplyWindowInsetsListener(targetView) { v, insets ->
            val statusBarInset = insets.getInsets(WindowInsetsCompat.Type.statusBars()).top
            v.updatePadding(top = statusBarInset)
            insets
        }
        ViewCompat.requestApplyInsets(targetView)
    }

    fun applyBottomNavMargin(targetView: View, extraBottomDp: Int = 16) {
        ViewCompat.setOnApplyWindowInsetsListener(targetView) { v, insets ->
            val navBarInset = insets.getInsets(WindowInsetsCompat.Type.navigationBars()).bottom
            val extraPx = (extraBottomDp * v.resources.displayMetrics.density).toInt()
            v.updateLayoutParams<MarginLayoutParams> {
                bottomMargin = navBarInset + extraPx
            }
            insets
        }
        ViewCompat.requestApplyInsets(targetView)
    }

    fun applySystemBarPadding(
        targetView: View,
        applyTop: Boolean = true,
        applyBottom: Boolean = true
    ) {
        ViewCompat.setOnApplyWindowInsetsListener(targetView) { v, insets ->
            val statusBarInset = insets.getInsets(WindowInsetsCompat.Type.statusBars()).top
            val navBarInset = insets.getInsets(WindowInsetsCompat.Type.navigationBars()).bottom

            val topPadding = if (applyTop) statusBarInset else v.paddingTop
            val bottomPadding = if (applyBottom) navBarInset else v.paddingBottom

            v.updatePadding(top = topPadding, bottom = bottomPadding)
            insets
        }
        ViewCompat.requestApplyInsets(targetView)
    }

    fun applyImeBottomPadding(targetView: View, extraBottomPx: Int = 0) {
        ViewCompat.setOnApplyWindowInsetsListener(targetView) { v, insets ->
            val imeInset = insets.getInsets(WindowInsetsCompat.Type.ime()).bottom
            val navBarInset = insets.getInsets(WindowInsetsCompat.Type.navigationBars()).bottom
            val bottomInset = kotlin.math.max(imeInset, navBarInset) + extraBottomPx
            v.updatePadding(bottom = bottomInset)
            insets
        }
        ViewCompat.requestApplyInsets(targetView)
    }
}
