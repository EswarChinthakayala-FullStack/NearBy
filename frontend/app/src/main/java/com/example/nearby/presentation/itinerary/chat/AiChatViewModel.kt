package com.example.nearby.presentation.itinerary.chat

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.nearby.presentation.itinerary.adapter.ChatMessage
import com.tourismguide.app.data.remote.ApiResult
import com.tourismguide.app.data.remote.dto.ItineraryDayDto
import com.tourismguide.app.data.remote.dto.ItineraryResponseDto
import com.tourismguide.app.data.remote.dto.WeatherSummaryDto
import com.tourismguide.app.data.remote.ws.AiAgentEvent
import com.tourismguide.app.data.remote.ws.AiWebSocketClient
import com.tourismguide.app.domain.repository.ItineraryRepository
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

data class AiChatUiState(
    val messages: List<ChatMessage> = listOf(
        ChatMessage(
            text = "Hello! I am Nearby AI, your personal travel architect. Where would you like to travel?",
            isUser = false
        )
    ),
    val isThinking: Boolean = false,
    val thinkingStepMessage: String = "Analyzing destination & current weather...",
    val errorMessage: String? = null,
    val suggestedPrompts: List<String> = listOf(
        "3-day trip to Mysore",
        "Family trip to Coorg",
        "One day in Hyderabad",
        "Temple tour in Ongole",
        "Weekend getaway to Goa"
    )
)

sealed interface AiChatEffect {
    data class NavigateToDetail(val itinerary: ItineraryResponseDto) : AiChatEffect
    data class ShowToast(val message: String) : AiChatEffect
}

@HiltViewModel
class AiChatViewModel @Inject constructor(
    private val itineraryRepository: ItineraryRepository,
    private val aiWebSocketClient: AiWebSocketClient
) : ViewModel() {

    private val _uiState = MutableStateFlow(AiChatUiState())
    val uiState: StateFlow<AiChatUiState> = _uiState.asStateFlow()

    private val _effectFlow = MutableSharedFlow<AiChatEffect>()
    val effectFlow: SharedFlow<AiChatEffect> = _effectFlow.asSharedFlow()

    private var wsCollectorJob: Job? = null

    init {
        connectWebSocket()
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
            is AiAgentEvent.AgentStart, is AiAgentEvent.AgentThinking -> {
                val agentName = if (event is AiAgentEvent.AgentStart) event.agentName else (event as AiAgentEvent.AgentThinking).agentName
                val message = if (event is AiAgentEvent.AgentStart) event.message else (event as AiAgentEvent.AgentThinking).message

                val stepMsg = ChatMessage(
                    text = message,
                    isUser = false,
                    agentName = agentName,
                    isAgentStep = true
                )

                _uiState.update { state ->
                    // Filter out previous steps from the same agent to keep chat clean
                    val filteredMessages = state.messages.filterNot { it.isAgentStep && it.agentName == agentName }
                    state.copy(
                        messages = filteredMessages + stepMsg,
                        isThinking = true,
                        thinkingStepMessage = "🧠 $agentName — $message"
                    )
                }
            }
            is AiAgentEvent.AgentComplete -> {
                val agentName = event.agentName
                _uiState.update { state ->
                    val filteredMessages = state.messages.filterNot { it.isAgentStep && it.agentName == agentName }
                    state.copy(messages = filteredMessages)
                }
            }
            is AiAgentEvent.ItineraryResult -> {
                handleItineraryWsResult(event.data)
            }
            is AiAgentEvent.Error -> {
                Log.w("AiChatVM", "WS error: ${event.message}")
            }
            else -> {}
        }
    }

    @Suppress("UNCHECKED_CAST")
    private fun handleItineraryWsResult(data: Map<String, Any?>) {
        try {
            val destination = data["destination"]?.toString() ?: "Your Destination"
            val summary = data["summary"]?.toString() ?: "Custom AI travel plan generated."
            val title = data["title"]?.toString() ?: "Custom Trip to $destination"
            val id = data["id"]?.toString() ?: data["uuid"]?.toString() ?: java.util.UUID.randomUUID().toString()

            val dto = ItineraryResponseDto(
                id = id,
                destination = destination,
                title = title,
                summary = summary,
                days = emptyList() // Details screen will fetch full model
            )

            // Filter out inline agent steps upon final completion
            val cleanedMessages = _uiState.value.messages.filterNot { it.isAgentStep }
            val aiMsg = ChatMessage(
                text = "✨ I've generated your custom travel itinerary for $destination!\n\n$summary",
                isUser = false,
                itineraryData = dto,
                agentName = "Travel Itinerary Architect Agent"
            )

            _uiState.update { state ->
                state.copy(
                    messages = cleanedMessages + aiMsg,
                    isThinking = false,
                    thinkingStepMessage = ""
                )
            }

            viewModelScope.launch {
                _effectFlow.emit(AiChatEffect.NavigateToDetail(dto))
            }
        } catch (e: Exception) {
            Log.e("AiChatVM", "Failed to parse itinerary result: ${e.message}", e)
            _uiState.update { it.copy(isThinking = false) }
        }
    }

    fun sendMessage(prompt: String) {
        val cleanPrompt = prompt.trim()
        if (cleanPrompt.isEmpty()) return

        // 1. Append user message to chat history
        val userMsg = ChatMessage(text = cleanPrompt, isUser = true)
        _uiState.update { state ->
            state.copy(
                messages = state.messages + userMsg,
                isThinking = true,
                thinkingStepMessage = "Architecting your travel itinerary..."
            )
        }

        // 2. Try WebSocket first, fall back to HTTP REST
        if (aiWebSocketClient.isActive()) {
            aiWebSocketClient.sendItineraryQuery(query = cleanPrompt)
        } else {
            viewModelScope.launch {
                when (val result = itineraryRepository.generateItinerary(cleanPrompt)) {
                    is ApiResult.Success -> {
                        val dto = result.data
                        val aiMsg = ChatMessage(
                            text = "✨ I've generated your custom ${dto.days.size}-day travel itinerary for ${dto.destination}!\n\n${dto.summary}",
                            isUser = false,
                            itineraryData = dto,
                            agentName = "Travel Itinerary Architect Agent"
                        )
                        _uiState.update { state ->
                            state.copy(
                                messages = state.messages + aiMsg,
                                isThinking = false
                            )
                        }
                        _effectFlow.emit(AiChatEffect.NavigateToDetail(dto))
                    }
                    is ApiResult.ValidationError -> handleChatError(result.message)
                    is ApiResult.NetworkError -> handleChatError(result.message)
                    is ApiResult.ServerError -> handleChatError(result.message)
                    else -> handleChatError("Failed to generate itinerary.")
                }
            }
        }
    }

    private fun handleChatError(message: String) {
        val errorMsg = ChatMessage(
            text = "Sorry, I couldn't generate an itinerary for that request. $message",
            isUser = false
        )
        _uiState.update { state ->
            val cleanedMessages = state.messages.filterNot { it.isAgentStep }
            state.copy(
                messages = cleanedMessages + errorMsg,
                isThinking = false
            )
        }
    }

    override fun onCleared() {
        wsCollectorJob?.cancel()
        super.onCleared()
    }
}
