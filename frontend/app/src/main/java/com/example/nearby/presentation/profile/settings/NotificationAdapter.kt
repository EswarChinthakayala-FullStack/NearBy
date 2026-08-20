package com.example.nearby.presentation.profile.settings

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.example.nearby.databinding.ItemNotificationCardBinding
import com.tourismguide.app.data.remote.dto.NotificationDto

class NotificationAdapter(
    private var items: List<NotificationDto>,
    private val onItemClick: (NotificationDto) -> Unit,
    private val onDismissClick: (NotificationDto) -> Unit
) : RecyclerView.Adapter<NotificationAdapter.NotificationViewHolder>() {

    fun updateItems(newItems: List<NotificationDto>) {
        items = newItems
        notifyDataSetChanged()
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): NotificationViewHolder {
        val binding = ItemNotificationCardBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return NotificationViewHolder(binding)
    }

    override fun onBindViewHolder(holder: NotificationViewHolder, position: Int) {
        holder.bind(items[position])
    }

    override fun getItemCount(): Int = items.size

    inner class NotificationViewHolder(private val binding: ItemNotificationCardBinding) :
        RecyclerView.ViewHolder(binding.root) {

        fun bind(item: NotificationDto) {
            binding.tvNotificationTitle.text = item.title
            binding.tvNotificationMessage.text = item.message
            binding.tvNotificationTag.text = item.type.uppercase()
            binding.tvNotificationTime.text = item.createdAt?.take(10) ?: "Recent"

            binding.btnCloseNotification.setOnClickListener { onDismissClick(item) }
            binding.root.setOnClickListener { onItemClick(item) }
            binding.btnViewPage.setOnClickListener { onItemClick(item) }
        }
    }
}
