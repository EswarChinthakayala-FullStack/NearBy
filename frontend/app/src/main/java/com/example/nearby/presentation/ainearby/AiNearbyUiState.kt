package com.example.nearby.presentation.ainearby

import com.tourismguide.app.data.remote.dto.AINearbyRecommendationDto

data class AgentStepUi(
    val agentName: String,
    val message: String,
    val isComplete: Boolean = false
)

data class AiNearbyUiState(
    val isLoading: Boolean = false,
    val isRefreshing: Boolean = false,
    val query: String = "",
    val latitude: Double = 17.385044,
    val longitude: Double = 78.486671,
    val locationStatusText: String = "Hyderabad, India",
    val summaryText: String = "",
    val recommendations: List<AINearbyRecommendationDto> = emptyList(),
    val suggestedPrompts: List<String> = listOf(
        "Best Tourist Attractions",
        "Hidden Gems",
        "Nature",
        "Restaurants",
        "Temples",
        "Waterfalls",
        "Adventure",
        "Photography",
        "Shopping",
        "Family Friendly"
    ),
    val errorMessage: String? = null,
    val isOfflineMode: Boolean = false,
    // Agent metadata
    val activeAgents: List<String> = emptyList(),
    val currentThinkingAgent: String = "",
    val currentThinkingMessage: String = "",
    val agentSteps: List<AgentStepUi> = emptyList(),
    val isWebSocketConnected: Boolean = false
)
