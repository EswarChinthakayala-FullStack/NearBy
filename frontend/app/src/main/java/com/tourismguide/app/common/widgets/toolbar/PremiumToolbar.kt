package com.tourismguide.app.common.widgets.toolbar

import android.content.Context
import android.util.AttributeSet
import android.view.LayoutInflater
import android.view.ViewTreeObserver
import android.widget.FrameLayout
import android.widget.ScrollView
import com.example.nearby.databinding.ViewPremiumToolbarBinding
import com.example.nearby.utils.WindowInsetsHelper
import java.lang.ref.WeakReference

class PremiumToolbar @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : FrameLayout(context, attrs, defStyleAttr) {

    private val binding = ViewPremiumToolbarBinding.inflate(
        LayoutInflater.from(context),
        this,
        true
    )

    private var scrollChangedListener: ViewTreeObserver.OnScrollChangedListener? = null
    private var attachedScrollViewRef: WeakReference<ScrollView>? = null
    private var attachedTreeObserverRef: WeakReference<ViewTreeObserver>? = null

    init {
        WindowInsetsHelper.applyStatusBarTopPadding(this)
        alpha = 0f
        elevation = 0f
    }

    fun setTitle(title: String) {
        binding.tvToolbarTitle.text = title
    }

    fun setSubtitle(subtitle: String?) {
        if (subtitle.isNullOrEmpty()) {
            binding.tvToolbarSubtitle.visibility = GONE
        } else {
            binding.tvToolbarSubtitle.text = subtitle
            binding.tvToolbarSubtitle.visibility = VISIBLE
        }
    }

    fun setBackVisible(visible: Boolean) {
        binding.btnToolbarBack.visibility = if (visible) VISIBLE else GONE
    }

    fun setOnBackClickListener(listener: OnClickListener) {
        binding.btnToolbarBack.setOnClickListener(listener)
    }

    fun setAction1(iconRes: Int, listener: OnClickListener) {
        binding.ivToolbarAction1.setImageResource(iconRes)
        binding.btnToolbarAction1.visibility = VISIBLE
        binding.btnToolbarAction1.setOnClickListener(listener)
    }

    fun setAction2(iconRes: Int, badgeCount: Int = 0, listener: OnClickListener) {
        binding.ivToolbarAction2.setImageResource(iconRes)
        binding.btnToolbarAction2.visibility = VISIBLE
        binding.btnToolbarAction2.setOnClickListener(listener)

        if (badgeCount > 0) {
            binding.tvToolbarBadge.text = if (badgeCount > 99) "99+" else badgeCount.toString()
            binding.tvToolbarBadge.visibility = VISIBLE
        } else {
            binding.tvToolbarBadge.visibility = GONE
        }
    }

    fun attachToScrollView(scrollView: ScrollView, fadeThresholdPx: Int = 180) {
        detachFromScrollView()

        attachedScrollViewRef = WeakReference(scrollView)
        val vto = scrollView.viewTreeObserver
        attachedTreeObserverRef = WeakReference(vto)

        val listener = ViewTreeObserver.OnScrollChangedListener {
            val sv = attachedScrollViewRef?.get() ?: return@OnScrollChangedListener
            val scrollY = sv.scrollY
            val progress = (scrollY.toFloat() / fadeThresholdPx.toFloat()).coerceIn(0f, 1f)

            alpha = progress
            elevation = progress * 8f * resources.displayMetrics.density
        }
        scrollChangedListener = listener

        if (vto.isAlive) {
            vto.addOnScrollChangedListener(listener)
        }
    }

    fun detachFromScrollView() {
        val listener = scrollChangedListener
        if (listener != null) {
            // 1. Unregister from stored ViewTreeObserver instance
            attachedTreeObserverRef?.get()?.let { vto ->
                if (vto.isAlive) {
                    vto.removeOnScrollChangedListener(listener)
                }
            }
            // 2. Unregister from ScrollView's active ViewTreeObserver
            attachedScrollViewRef?.get()?.let { sv ->
                if (sv.viewTreeObserver.isAlive) {
                    sv.viewTreeObserver.removeOnScrollChangedListener(listener)
                }
            }
            // 3. Unregister from toolbar's own ViewTreeObserver
            if (viewTreeObserver.isAlive) {
                viewTreeObserver.removeOnScrollChangedListener(listener)
            }
        }
        scrollChangedListener = null
        attachedScrollViewRef = null
        attachedTreeObserverRef = null
    }

    override fun onDetachedFromWindow() {
        detachFromScrollView()
        binding.btnToolbarBack.setOnClickListener(null)
        binding.btnToolbarAction1.setOnClickListener(null)
        binding.btnToolbarAction2.setOnClickListener(null)
        super.onDetachedFromWindow()
    }
}
