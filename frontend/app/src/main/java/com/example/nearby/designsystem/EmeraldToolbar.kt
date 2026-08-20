package com.example.nearby.designsystem

import android.content.Context
import android.util.AttributeSet
import android.view.LayoutInflater
import android.view.View
import android.view.ViewTreeObserver
import android.widget.FrameLayout
import androidx.core.widget.NestedScrollView
import com.example.nearby.databinding.ViewEmeraldToolbarBinding
import com.example.nearby.utils.WindowInsetsHelper

class EmeraldToolbar @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : FrameLayout(context, attrs, defStyleAttr) {

    private val binding = ViewEmeraldToolbarBinding.inflate(
        LayoutInflater.from(context),
        this,
        true
    )

    private var scrollListener: ViewTreeObserver.OnScrollChangedListener? = null

    init {
        WindowInsetsHelper.applyStatusBarTopPadding(this)
    }

    fun setTitle(title: String) {
        binding.tvTitle.text = title
    }

    fun setTitleAlpha(alphaValue: Float) {
        binding.tvTitle.alpha = alphaValue
    }

    fun setSubtitle(subtitle: String?) {
        if (subtitle.isNullOrEmpty()) {
            binding.tvSubtitle.visibility = View.GONE
        } else {
            binding.tvSubtitle.text = subtitle
            binding.tvSubtitle.visibility = View.VISIBLE
        }
    }

    fun setOnBackClickListener(listener: OnClickListener) {
        binding.btnBack.setOnClickListener(listener)
    }

    fun setOnActionClickListener(listener: OnClickListener) {
        binding.btnAction.setOnClickListener(listener)
    }

    fun setSecondaryAction(iconRes: Int, listener: OnClickListener) {
        binding.btnSecondaryAction.setImageResource(iconRes)
        binding.btnSecondaryAction.visibility = View.VISIBLE
        binding.btnSecondaryAction.setOnClickListener(listener)
    }

    fun setBackButtonVisible(visible: Boolean) {
        binding.btnBack.visibility = if (visible) View.VISIBLE else View.GONE
    }

    fun setActionButtonVisible(visible: Boolean) {
        binding.btnAction.visibility = if (visible) View.VISIBLE else View.GONE
    }

    fun setActionIcon(resId: Int) {
        binding.btnAction.setImageResource(resId)
        binding.btnAction.visibility = View.VISIBLE
    }

    fun attachToScrollView(scrollView: NestedScrollView, collapseThresholdPx: Int = 200) {
        scrollListener = ViewTreeObserver.OnScrollChangedListener {
            val scrollY = scrollView.scrollY
            val progress = (scrollY.toFloat() / collapseThresholdPx.toFloat()).coerceIn(0f, 1f)
            elevation = (4f + progress * 8f) * resources.displayMetrics.density
        }
        scrollView.viewTreeObserver.addOnScrollChangedListener(scrollListener)
    }

    override fun onDetachedFromWindow() {
        scrollListener = null
        super.onDetachedFromWindow()
    }
}
