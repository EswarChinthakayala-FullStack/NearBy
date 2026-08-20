package com.example.nearby.presentation.profile.settings.widgets

import android.content.Context
import android.util.AttributeSet
import android.view.LayoutInflater
import android.view.View
import android.widget.FrameLayout
import androidx.core.content.ContextCompat
import com.example.nearby.R
import com.example.nearby.databinding.ViewSettingSwitchBinding

class SettingSwitchView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : FrameLayout(context, attrs, defStyleAttr) {

    private val binding = ViewSettingSwitchBinding.inflate(
        LayoutInflater.from(context),
        this,
        true
    )

    private var isChecked = false
    private var onCheckedChangeListener: ((Boolean) -> Unit)? = null

    init {
        binding.root.setOnClickListener {
            setChecked(!isChecked)
            onCheckedChangeListener?.invoke(isChecked)
        }
    }

    fun setTitle(title: String) {
        binding.tvSwitchTitle.text = title
    }

    fun setSubtitle(subtitle: String) {
        binding.tvSwitchSubtitle.text = subtitle
    }

    fun setIcon(resId: Int) {
        binding.ivSwitchIcon.setImageResource(resId)
    }

    fun setChecked(checked: Boolean) {
        isChecked = checked
        val trackBg = if (checked) R.drawable.bg_button_primary else R.drawable.bg_glass_panel
        binding.viewSwitchTrack.setBackgroundResource(trackBg)

        binding.viewSwitchThumb.animate()
            .translationX(if (checked) 24f * resources.displayMetrics.density else 0f)
            .setDuration(180)
            .start()
    }

    fun isChecked(): Boolean = isChecked

    fun setOnCheckedChangeListener(listener: (Boolean) -> Unit) {
        onCheckedChangeListener = listener
    }
}
