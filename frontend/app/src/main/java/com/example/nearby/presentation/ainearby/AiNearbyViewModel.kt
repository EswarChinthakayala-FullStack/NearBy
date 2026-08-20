package com.example.nearby.presentation.ainearby

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.nearby.presentation.favorites.FavoritesRepository
import com.tourismguide.app.data.remote.api.AiApiService
import com.tourismguide.app.data.remote.dto.AINearbyRequestDto
import com.tourismguide.app.data.remote.dto.AINearbyRecommendationDto
import com.tourismguide.app.data.remote.ws.AiAgentEvent
import com.tourismguide.app.data.remote.ws.AiWebSocketClient
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class AiNearbyViewModel @Inject constructor(
    private val aiApiService: AiApiService,
    private val favoritesRepository: FavoritesRepository,
    private val aiWebSocketClient: AiWebSocketClient
) : ViewModel() {

    private val _uiState = MutableStateFlow(AiNearbyUiState())
    val uiState: StateFlow<AiNearbyUiState> = _uiState.asStateFlow()

    private val _effectFlow = MutableSharedFlow<AiNearbyEffect>()
    val effectFlow: SharedFlow<AiNearbyEffect> = _effectFlow.asSharedFlow()

    private var wsCollectorJob: Job? = null

    init {
        connectWebSocket()
        submitAiQuery("Best tourist attractions near me")
    }

    private fun connectWebSocket() {
        aiWebSocketClient.connect()
        wsCollectorJob?.cancel()
        wsCollectorJob = viewModelScope.launch {
            aiWebSocketClient.events.collect { event ->
                handleWebSocketEvent(event)
            }
        }
    }

    private fun handleWebSocketEvent(event: AiAgentEvent) {
        when (event) {
            is AiAgentEvent.Connected -> {
                _uiState.update { it.copy(isWebSocketConnected = true) }
            }
            is AiAgentEvent.AgentStart -> {
                _uiState.update { state ->
                    val step = AgentStepUi(event.agentName, event.message, isComplete = false)
                    state.copy(
                        currentThinkingAgent = event.agentName,
                        currentThinkingMessage = event.message,
                        agentSteps = state.agentSteps + step
                    )
                }
            }
            is AiAgentEvent.AgentThinking -> {
                _uiState.update { state ->
                    state.copy(
                        currentThinkingAgent = event.agentName,
                        currentThinkingMessage = event.message
                    )
                }
            }
            is AiAgentEvent.AgentComplete -> {
                _uiState.update { state ->
                    val updatedSteps = state.agentSteps.map { step ->
                        if (step.agentName == event.agentName) step.copy(isComplete = true, message = event.message)
                        else step
                    }
                    state.copy(agentSteps = updatedSteps)
                }
            }
            is AiAgentEvent.NearbyResult -> {
                handleNearbyWsResult(event.data)
            }
            is AiAgentEvent.Error -> {
                Log.w("AiNearbyVM", "WS error: ${event.message}")
            }
            is AiAgentEvent.Disconnected -> {
                _uiState.update { it.copy(isWebSocketConnected = false) }
            }
            else -> { /* ItineraryResult handled by chat VM */ }
        }
    }

    @Suppress("UNCHECKED_CAST")
    private fun handleNearbyWsResult(data: Map<String, Any?>) {
        try {
            val summary = data["summary"] as? String ?: ""
            val recsRaw = data["recommendations"] as? List<*> ?: emptyList<Any>()
            val activeAgents = (data["query_understanding"] as? Map<*, *>)?.get("active_agents") as? List<*> ?: emptyList<Any>()

            val recommendations = recsRaw.mapNotNull { raw ->
                if (raw is Map<*, *>) {
                    AINearbyRecommendationDto(
                        placeUuid = raw["place_uuid"]?.toString() ?: "",
                        placeName = raw["place_name"]?.toString() ?: "",
                        placeSlug = raw["place_slug"]?.toString() ?: "",
                        category = raw["category"]?.toString() ?: "",
                        rating = (raw["rating"] as? Number)?.toDouble() ?: 0.0,
                        distanceKm = (raw["distance_km"] as? Number)?.toDouble() ?: 0.0,
                        confidence = (raw["confidence"] as? Number)?.toInt() ?: 90,
                        reason = raw["reason"]?.toString() ?: "",
                        coverImage = raw["cover_image"]?.toString(),
                        latitude = (raw["latitude"] as? Number)?.toDouble() ?: 0.0,
                        longitude = (raw["longitude"] as? Number)?.toDouble() ?: 0.0
                    )
                } else null
            }

            _uiState.update {
                it.copy(
                    isLoading = false,
                    summaryText = summary,
                    recommendations = recommendations,
                    activeAgents = activeAgents.map { a -> a.toString() },
                    currentThinkingAgent = "",
                    currentThinkingMessage = ""
                )
            }
        } catch (e: Exception) {
            Log.e("AiNearbyVM", "Failed to parse WS result: ${e.message}", e)
            _uiState.update { it.copy(isLoading = false) }
        }
    }

    fun onEvent(event: AiNearbyEvent) {
        when (event) {
            is AiNearbyEvent.SubmitQuery -> submitAiQuery(event.query)
            is AiNearbyEvent.UpdateLocation -> {
                _uiState.update { it.copy(latitude = event.latitude, longitude = event.longitude) }
            }
            is AiNearbyEvent.ToggleFavorite -> toggleFavorite(event.placeUuid)
            is AiNearbyEvent.Refresh -> submitAiQuery(_uiState.value.query.ifEmpty { "Best places nearby" })
        }
    }

    fun submitAiQuery(userQuery: String) {
        if (userQuery.isBlank()) return

        _uiState.update {
            it.copy(
                isLoading = true,
                query = userQuery,
                errorMessage = null,
                agentSteps = emptyList(),
                currentThinkingAgent = "",
                currentThinkingMessage = ""
            )
        }

        val currentState = _uiState.value

        // Try WebSocket first, fall back to HTTP
        if (aiWebSocketClient.isActive()) {
            aiWebSocketClient.sendNearbyQuery(
                query = userQuery,
                latitude = currentState.latitude,
                longitude = currentState.longitude
            )
        } else {
            // HTTP fallback
            viewModelScope.launch {
                val request = AINearbyRequestDto(
                    latitude = currentState.latitude,
                    longitude = currentState.longitude,
                    query = userQuery
                )

                try {
                    val response = aiApiService.getNearbyRecommendations(request)
                    val body = response.body()
                    if (response.isSuccessful && body != null && body.data != null) {
                        val aiData = body.data!!
                        _uiState.update {
                            it.copy(
                                isLoading = false,
                                summaryText = aiData.summary,
                                recommendations = aiData.recommendations,
                                activeAgents = aiData.queryUnderstanding?.let { qu ->
                                    // Parse active agents if present in the response
                                    listOf("Query Intent Specialist", "Geospatial & Weather Specialist", "Tourism Recommendation Architect", "ValidationAgent", "FormatterAgent")
                                } ?: emptyList()
                            )
                        }
                    } else {
                        Log.w("AiNearbyVM", "API response error ${response.code()}")
                        _uiState.update {
                            it.copy(
                                isLoading = false,
                                errorMessage = "Unable to fetch AI recommendations from server."
                            )
                        }
                        _effectFlow.emit(AiNearbyEffect.ShowToast("Search Error", "Could not load AI recommendations.", isError = true))
                    }
                } catch (e: Exception) {
                    Log.e("AiNearbyVM", "Network exception in AI search: ${e.message}", e)
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            errorMessage = e.message ?: "Connection error."
                        )
                    }
                    _effectFlow.emit(AiNearbyEffect.ShowToast("Network Error", e.message ?: "Network error", isError = true))
                }
            }
        }
    }

    private fun toggleFavorite(placeUuid: String) {
        viewModelScope.launch {
            try {
                favoritesRepository.toggleFavorite(placeUuid, false)
                _effectFlow.emit(AiNearbyEffect.ShowToast("Favorites Updated", "Place updated in favorites."))
            } catch (e: Exception) {
                Log.e("AiNearbyVM", "Toggle favorite error: ${e.message}")
            }
        }
    }

    override fun onCleared() {
        wsCollectorJob?.cancel()
        super.onCleared()
    }
}
