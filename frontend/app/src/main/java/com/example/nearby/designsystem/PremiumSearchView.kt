package com.example.nearby.designsystem

import android.content.Context
import android.text.Editable
import android.text.TextWatcher
import android.util.AttributeSet
import android.view.LayoutInflater
import android.view.View
import android.widget.FrameLayout
import com.example.nearby.databinding.ViewPremiumSearchViewBinding

class PremiumSearchView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : FrameLayout(context, attrs, defStyleAttr) {

    private val binding = ViewPremiumSearchViewBinding.inflate(
        LayoutInflater.from(context),
        this,
        true
    )

    init {
        binding.etQuery.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                val hasText = !s.isNullOrEmpty()
                binding.btnClear.visibility = if (hasText) View.VISIBLE else View.GONE
            }
            override fun afterTextChanged(s: Editable?) {}
        })

        binding.btnClear.setOnClickListener {
            binding.etQuery.setText("")
        }
    }

    fun setHint(hintText: String) {
        binding.etQuery.hint = hintText
    }

    fun getText(): String = binding.etQuery.text?.toString() ?: ""

    fun setText(text: String) {
        binding.etQuery.setText(text)
    }

    fun addTextChangedListener(watcher: TextWatcher) {
        binding.etQuery.addTextChangedListener(watcher)
    }

    fun setOnFilterClickListener(listener: OnClickListener) {
        binding.btnFilter.setOnClickListener(listener)
    }

    fun setOnVoiceClickListener(listener: OnClickListener) {
        binding.btnVoice.setOnClickListener(listener)
    }

    fun setFilterButtonVisible(visible: Boolean) {
        binding.btnFilter.visibility = if (visible) View.VISIBLE else View.GONE
    }
}
