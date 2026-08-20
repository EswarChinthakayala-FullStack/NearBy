package com.example.nearby.presentation.profile.settings

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.tourismguide.app.data.remote.ApiResult
import com.tourismguide.app.data.remote.datasource.NotificationsRemoteDataSource
import com.tourismguide.app.data.remote.dto.NotificationDto
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class NotificationsUiState(
    val notifications: List<NotificationDto> = emptyList(),
    val filteredNotifications: List<NotificationDto> = emptyList(),
    val selectedFilter: String = "All",
    val isLoading: Boolean = false,
    val errorMessage: String? = null
)

@HiltViewModel
class NotificationsViewModel @Inject constructor(
    private val notificationsRemoteDataSource: NotificationsRemoteDataSource
) : ViewModel() {

    private val _uiState = MutableStateFlow(NotificationsUiState())
    val uiState: StateFlow<NotificationsUiState> = _uiState.asStateFlow()

    init {
        loadNotifications()
    }

    fun loadNotifications() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, errorMessage = null) }
            val result = notificationsRemoteDataSource.getNotifications()
            if (result is ApiResult.Success) {
                val list = result.data
                _uiState.update {
                    it.copy(
                        notifications = list,
                        filteredNotifications = filterList(list, it.selectedFilter),
                        isLoading = false
                    )
                }
            } else if (result is ApiResult.ServerError) {
                _uiState.update { it.copy(isLoading = false, errorMessage = result.message) }
            } else {
                _uiState.update { it.copy(isLoading = false, errorMessage = "Failed to load notifications.") }
            }
        }
    }

    fun selectFilter(filter: String) {
        _uiState.update {
            it.copy(
                selectedFilter = filter,
                filteredNotifications = filterList(it.notifications, filter)
            )
        }
    }

    fun clearAll() {
        viewModelScope.launch {
            notificationsRemoteDataSource.clearAll()
            _uiState.update {
                it.copy(notifications = emptyList(), filteredNotifications = emptyList())
            }
        }
    }

    private fun filterList(list: List<NotificationDto>, filter: String): List<NotificationDto> {
        return when (filter) {
            "Unread" -> list.filter { !it.isRead }
            "Security" -> list.filter { it.type.contains("security", ignoreCase = true) || it.title.contains("Security", ignoreCase = true) || it.title.contains("Authentication", ignoreCase = true) }
            "Reviews" -> list.filter { it.type.contains("review", ignoreCase = true) || it.title.contains("Review", ignoreCase = true) }
            "Favorites" -> list.filter { it.type.contains("favorite", ignoreCase = true) || it.title.contains("Bookmark", ignoreCase = true) }
            "Spatial AI" -> list.filter { it.type.contains("ai", ignoreCase = true) || it.title.contains("Spatial", ignoreCase = true) || it.title.contains("Radar", ignoreCase = true) }
            else -> list
        }
    }
}
