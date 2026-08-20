package com.example.nearby.presentation.gallery

import android.app.DownloadManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.os.Environment
import android.os.Parcel
import android.os.Parcelable
import android.view.Gravity
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.view.WindowManager
import androidx.fragment.app.DialogFragment
import androidx.viewpager2.widget.ViewPager2
import com.example.nearby.R
import com.example.nearby.databinding.DialogImageViewerBinding
import com.example.nearby.designsystem.EmeraldToastManager
import com.example.nearby.presentation.gallery.adapter.ImageViewerAdapter
import com.tourismguide.app.common.util.InputMethodLeakFixer
import com.tourismguide.app.data.remote.dto.PlacePhotoDto

class ImageViewerDialogFragment : DialogFragment() {

    private var _binding: DialogImageViewerBinding? = null
    private val binding get() = _binding!!

    private var photoList: ArrayList<PlacePhotoDto> = arrayListOf()
    private var initialPosition: Int = 0
    private var placeName: String = "Place"

    private lateinit var adapter: ImageViewerAdapter
    private var pageChangeCallback: ViewPager2.OnPageChangeCallback? = null

    companion object {
        fun newInstance(photos: List<PlacePhotoDto>, initialIndex: Int, placeName: String): ImageViewerDialogFragment {
            val fragment = ImageViewerDialogFragment()
            val args = Bundle().apply {
                putParcelableArrayList("photos", ArrayList(photos.map { PhotoParcelable(it.imageUrl, it.thumbnailUrl, it.title, it.source) }))
                putInt("initialIndex", initialIndex)
                putString("placeName", placeName)
            }
            fragment.arguments = args
            return fragment
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setStyle(STYLE_NORMAL, R.style.Theme_Nearby)
        val parcelables = arguments?.getParcelableArrayList<PhotoParcelable>("photos") ?: arrayListOf()
        photoList = ArrayList(parcelables.map { PlacePhotoDto(it.imageUrl, it.thumbnailUrl, it.title, it.source) })
        initialPosition = arguments?.getInt("initialIndex") ?: 0
        placeName = arguments?.getString("placeName") ?: "Place"
    }

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = DialogImageViewerBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        setupDialogWindow()
        setupViewPager()
        setupListeners()
    }

    private fun setupDialogWindow() {
        dialog?.window?.let { win ->
            win.setLayout(
                WindowManager.LayoutParams.MATCH_PARENT,
                WindowManager.LayoutParams.MATCH_PARENT
            )
            win.setGravity(Gravity.CENTER)
            win.setBackgroundDrawableResource(android.R.color.black)
        }
    }

    private fun setupViewPager() {
        adapter = ImageViewerAdapter()
        binding.vpImageViewer.adapter = adapter
        adapter.submitList(photoList)

        if (initialPosition in photoList.indices) {
            binding.vpImageViewer.setCurrentItem(initialPosition, false)
            updateCounter(initialPosition)
        }

        pageChangeCallback = object : ViewPager2.OnPageChangeCallback() {
            override fun onPageSelected(position: Int) {
                super.onPageSelected(position)
                updateCounter(position)
            }
        }
        binding.vpImageViewer.registerOnPageChangeCallback(pageChangeCallback!!)
    }

    private fun updateCounter(position: Int) {
        val total = photoList.size
        binding.tvViewerCounter.text = "${position + 1} / $total"
        if (position in photoList.indices) {
            val item = photoList[position]
            binding.tvViewerTitle.text = item.title.ifEmpty { "$placeName Photo" }
            binding.tvViewerSource.text = "Source: ${item.source ?: "HD Scraper"}"
        }
    }

    private fun setupListeners() {
        binding.btnViewerClose.setOnClickListener { dismiss() }

        binding.btnViewerDownload.setOnClickListener {
            val currentPos = binding.vpImageViewer.currentItem
            if (currentPos in photoList.indices) {
                val photo = photoList[currentPos]
                downloadImageToMediaStore(photo.displayUrl)
            }
        }

        binding.btnViewerShare.setOnClickListener {
            val currentPos = binding.vpImageViewer.currentItem
            if (currentPos in photoList.indices) {
                val photo = photoList[currentPos]
                shareImage(photo.displayUrl)
            }
        }

        binding.btnViewerRefresh.setOnClickListener {
            activity?.let { act ->
                EmeraldToastManager.showToast(act, "Gallery Refreshed", "Showing latest high-resolution render.", EmeraldToastManager.Type.SUCCESS)
            }
        }
    }

    private fun downloadImageToMediaStore(imageUrl: String) {
        if (imageUrl.isEmpty()) return
        try {
            val request = DownloadManager.Request(Uri.parse(imageUrl)).apply {
                setTitle("$placeName Photo")
                setDescription("Downloading HD photo to gallery...")
                setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
                setDestinationInExternalPublicDir(Environment.DIRECTORY_PICTURES, "Nearby_${System.currentTimeMillis()}.jpg")
            }
            val dm = requireContext().getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
            dm.enqueue(request)

            activity?.let { act ->
                EmeraldToastManager.showToast(act, "Download Started", "Saving photo to Pictures directory.", EmeraldToastManager.Type.SUCCESS)
            }
        } catch (e: Exception) {
            activity?.let { act ->
                EmeraldToastManager.showToast(act, "Download Error", "Could not save photo: ${e.message}", EmeraldToastManager.Type.ERROR)
            }
        }
    }

    private fun shareImage(imageUrl: String) {
        val shareIntent = Intent(Intent.ACTION_SEND).apply {
            type = "text/plain"
            putExtra(Intent.EXTRA_SUBJECT, "$placeName Photo")
            putExtra(Intent.EXTRA_TEXT, "Check out this beautiful photo of $placeName: $imageUrl")
        }
        startActivity(Intent.createChooser(shareIntent, "Share Photo via"))
    }

    override fun onDestroyView() {
        context?.let { InputMethodLeakFixer.fixInputMethodManagerLeak(it) }
        pageChangeCallback?.let { _binding?.vpImageViewer?.unregisterOnPageChangeCallback(it) }
        pageChangeCallback = null
        _binding?.vpImageViewer?.adapter = null
        dialog?.setOnDismissListener(null)
        super.onDestroyView()
        _binding = null
    }

    override fun onDestroy() {
        dialog?.dismiss()
        super.onDestroy()
    }
}

data class PhotoParcelable(
    val imageUrl: String,
    val thumbnailUrl: String?,
    val title: String,
    val source: String?
) : Parcelable {
    constructor(parcel: Parcel) : this(
        parcel.readString() ?: "",
        parcel.readString(),
        parcel.readString() ?: "",
        parcel.readString()
    )

    override fun writeToParcel(parcel: Parcel, flags: Int) {
        parcel.writeString(imageUrl)
        parcel.writeString(thumbnailUrl)
        parcel.writeString(title)
        parcel.writeString(source)
    }

    override fun describeContents(): Int = 0

    companion object CREATOR : Parcelable.Creator<PhotoParcelable> {
        override fun createFromParcel(parcel: Parcel): PhotoParcelable = PhotoParcelable(parcel)
        override fun newArray(size: Int): Array<PhotoParcelable?> = arrayOfNulls(size)
    }
}
