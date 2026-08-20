package com.example.nearby.presentation.profile.adapter

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.RecyclerView
import com.example.nearby.R
import com.example.nearby.databinding.ItemProfileMenuBinding
import com.example.nearby.presentation.profile.MenuItemData

class ProfileMenuAdapter(
    private val items: List<MenuItemData>,
    private val onItemClick: (MenuItemData) -> Unit
) : RecyclerView.Adapter<ProfileMenuAdapter.MenuViewHolder>() {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): MenuViewHolder {
        val binding = ItemProfileMenuBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return MenuViewHolder(binding)
    }

    override fun onBindViewHolder(holder: MenuViewHolder, position: Int) {
        holder.bind(items[position])
    }

    override fun getItemCount(): Int = items.size

    inner class MenuViewHolder(private val binding: ItemProfileMenuBinding) : RecyclerView.ViewHolder(binding.root) {
        fun bind(item: MenuItemData) {
            binding.tvMenuTitle.text = item.title
            binding.tvMenuSubtitle.text = item.subtitle
            binding.ivMenuIcon.setImageResource(item.iconRes)

            val context = binding.root.context
            when (item.id) {
                "saved_bookmarks" -> binding.ivMenuIcon.setColorFilter(ContextCompat.getColor(context, R.color.emerald_500))
                "my_reviews" -> binding.ivMenuIcon.setColorFilter(ContextCompat.getColor(context, R.color.emerald_400))
                "profile_settings" -> binding.ivMenuIcon.setColorFilter(ContextCompat.getColor(context, R.color.emerald_400))
                else -> binding.ivMenuIcon.setColorFilter(ContextCompat.getColor(context, R.color.emerald_400))
            }

            binding.root.setOnClickListener { onItemClick(item) }
        }
    }
}
