package com.tourismguide.app.common.widgets

import android.content.Context
import android.util.AttributeSet
import android.view.LayoutInflater
import android.widget.FrameLayout
import com.example.nearby.databinding.ViewLoadingButtonBinding

class LoadingView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : FrameLayout(context, attrs, defStyleAttr) {

    private val binding = ViewLoadingButtonBinding.inflate(LayoutInflater.from(context), this, true)

    fun startLoading() {
        binding.layoutLoadingContainer.visibility = VISIBLE
    }

    fun stopLoading() {
        binding.layoutLoadingContainer.visibility = GONE
    }
}
