package com.example.nearby.presentation.auth.widgets

import android.content.Context
import android.util.AttributeSet
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.TextView
import androidx.core.content.ContextCompat
import com.example.nearby.R

class PremiumAuthTextField @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : LinearLayout(context, attrs, defStyleAttr) {

    val editText: EditText
    private val tvLabel: TextView
    private val tvError: TextView

    init {
        orientation = VERTICAL

        tvLabel = TextView(context).apply {
            setTextAppearance(R.style.Typography_Caption)
            setTextColor(ContextCompat.getColor(context, R.color.text_secondary))
        }

        editText = EditText(context).apply {
            setTextAppearance(R.style.Typography_BodyMedium)
            setBackgroundResource(R.drawable.bg_input_field)
            setTextColor(ContextCompat.getColor(context, R.color.text_primary))
            setPadding(32, 24, 32, 24)
        }

        tvError = TextView(context).apply {
            setTextAppearance(R.style.Typography_Caption)
            setTextColor(ContextCompat.getColor(context, R.color.status_danger))
            visibility = GONE
        }

        addView(tvLabel)
        addView(editText, LayoutParams(LayoutParams.MATCH_PARENT, 120).apply { topMargin = 8 })
        addView(tvError, LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.WRAP_CONTENT).apply { topMargin = 8 })
    }

    fun setLabel(label: String) { tvLabel.text = label.uppercase() }
    fun setError(error: String?) {
        if (error.isNullOrEmpty()) {
            tvError.visibility = GONE
        } else {
            tvError.text = error
            tvError.visibility = VISIBLE
        }
    }
}
