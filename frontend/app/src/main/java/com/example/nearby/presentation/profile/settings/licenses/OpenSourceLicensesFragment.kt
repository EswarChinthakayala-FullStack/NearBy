package com.example.nearby.presentation.profile.settings.licenses

import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.nearby.R
import com.example.nearby.databinding.FragmentLicensesBinding
import com.example.nearby.utils.WindowInsetsHelper
import dagger.hilt.android.AndroidEntryPoint
import org.json.JSONArray

@AndroidEntryPoint
class OpenSourceLicensesFragment : Fragment() {

    private var _binding: FragmentLicensesBinding? = null
    private val binding get() = _binding!!

    private var allLicenses = listOf<LicenseItem>()
    private lateinit var adapter: LicenseAdapter

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentLicensesBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        activity?.let { WindowInsetsHelper.setupEdgeToEdge(it) }

        binding.licensesToolbar.setTitle("Open Source Licenses")
        binding.licensesToolbar.setBackButtonVisible(true)
        binding.licensesToolbar.setOnBackClickListener {
            findNavController().navigateUp()
        }

        binding.searchLicensesView.setHint("Search library, license...")

        loadLicensesFromAsset()
        setupRecyclerView()
        setupSearch()
    }

    private fun loadLicensesFromAsset() {
        try {
            val jsonStr = requireContext().assets.open("open_source_licenses.json").bufferedReader().use { it.readText() }
            val array = JSONArray(jsonStr)
            val list = mutableListOf<LicenseItem>()
            for (i in 0 until array.length()) {
                val obj = array.getJSONObject(i)
                list.add(
                    LicenseItem(
                        library = obj.getString("library"),
                        version = obj.getString("version"),
                        license = obj.getString("license"),
                        website = obj.getString("website")
                    )
                )
            }
            allLicenses = list
        } catch (e: Exception) {
            allLicenses = emptyList()
        }
    }

    private fun setupRecyclerView() {
        adapter = LicenseAdapter(allLicenses)
        binding.rvLicenses.layoutManager = LinearLayoutManager(requireContext())
        binding.rvLicenses.adapter = adapter
    }

    private fun setupSearch() {
        binding.searchLicensesView.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                val q = s?.toString()?.lowercase() ?: ""
                val filtered = if (q.isBlank()) allLicenses else allLicenses.filter {
                    it.library.lowercase().contains(q) || it.license.lowercase().contains(q)
                }
                adapter.updateItems(filtered)
            }
            override fun afterTextChanged(s: Editable?) {}
        })
    }

    data class LicenseItem(val library: String, val version: String, val license: String, val website: String)

    private class LicenseAdapter(private var itemList: List<LicenseItem>) : RecyclerView.Adapter<LicenseAdapter.ViewHolder>() {

        fun updateItems(newList: List<LicenseItem>) {
            itemList = newList
            notifyDataSetChanged()
        }

        inner class ViewHolder(val view: View) : RecyclerView.ViewHolder(view) {
            val tvName: TextView = view.findViewById(R.id.tvInfoRowValue)
            val tvSub: TextView = view.findViewById(R.id.tvInfoRowLabel)
        }

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
            val v = LayoutInflater.from(parent.context).inflate(R.layout.item_profile_info_row, parent, false)
            return ViewHolder(v)
        }

        override fun onBindViewHolder(holder: ViewHolder, position: Int) {
            val item = itemList[position]
            holder.tvSub.text = "LICENSE: ${item.license} • v${item.version}"
            holder.tvName.text = item.library
        }

        override fun getItemCount(): Int = itemList.size
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
