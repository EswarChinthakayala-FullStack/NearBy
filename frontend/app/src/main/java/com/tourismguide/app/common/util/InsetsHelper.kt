package com.tourismguide.app.common.util

import android.app.Activity
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

object InsetsHelper {

    fun setupEdgeToEdge(activity: Activity) {
        val window = activity.window
        WindowCompat.setDecorFitsSystemWindows(window, false)

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            window.attributes.layoutInDisplayCutoutMode =
                WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES
        }

        window.statusBarColor = Color.parseColor("#059669")
        window.navigationBarColor = Color.TRANSPARENT

        val insetsController = WindowCompat.getInsetsController(window, window.decorView)
        // White system status bar icons (time, battery, signal, Wi-Fi) over Emerald background
        insetsController.isAppearanceLightStatusBars = false
        insetsController.isAppearanceLightNavigationBars = false
    }

    fun applySystemWindowInsets(
        rootView: View,
        headerView: View? = null,
        bottomNavView: View? = null,
        extraBottomMarginDp: Int = 16
    ) {
        ViewCompat.setOnApplyWindowInsetsListener(rootView) { _, insets ->
            val statusBarTop = insets.getInsets(WindowInsetsCompat.Type.statusBars()).top
            val navBarBottom = insets.getInsets(WindowInsetsCompat.Type.navigationBars()).bottom
            val density = rootView.resources.displayMetrics.density

            headerView?.updatePadding(top = statusBarTop)

            bottomNavView?.updateLayoutParams<MarginLayoutParams> {
                bottomMargin = (navBarBottom + (extraBottomMarginDp * density)).toInt()
            }

            insets
        }
        ViewCompat.requestApplyInsets(rootView)
    }
}
