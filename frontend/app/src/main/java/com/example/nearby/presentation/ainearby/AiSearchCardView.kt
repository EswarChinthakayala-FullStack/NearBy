package com.example.nearby.presentation.ainearby

import android.content.Context
import android.util.AttributeSet
import android.view.LayoutInflater
import android.widget.FrameLayout
import com.example.nearby.databinding.ViewAiSearchCardBinding

class AiSearchCardView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : FrameLayout(context, attrs, defStyleAttr) {

    private val binding = ViewAiSearchCardBinding.inflate(
        LayoutInflater.from(context),
        this,
        true
    )

    fun getQuery(): String = binding.etAiQuery.text?.toString() ?: ""

    fun setQuery(text: String) {
        binding.etAiQuery.setText(text)
    }

    fun setOnSendClickListener(onSend: (String) -> Unit) {
        binding.btnSendQuery.setOnClickListener {
            val q = getQuery().trim()
            if (q.isNotEmpty()) {
                onSend(q)
            }
        }
    }

    fun setOnVoiceClickListener(onVoice: () -> Unit) {
        binding.btnVoiceSearch.setOnClickListener { onVoice() }
    }
}
