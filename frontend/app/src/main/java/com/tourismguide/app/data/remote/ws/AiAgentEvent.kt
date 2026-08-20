package com.tourismguide.app.data.remote.ws

import com.tourismguide.app.data.remote.dto.AINearbyResponseDto
import com.tourismguide.app.data.remote.dto.ItineraryResponseDto

/**
 * Sealed class hierarchy representing real-time AI agent events
 * streamed over WebSocket from the backend CrewAI orchestrators.
 */
sealed interface AiAgentEvent {

    /** WebSocket connection established */
    data class Connected(val message: String) : AiAgentEvent

    /** An AI agent has started its work */
    data class AgentStart(
        val agentName: String,
        val message: String = ""
    ) : AiAgentEvent

    /** An AI agent is currently processing (thinking step update) */
    data class AgentThinking(
        val agentName: String,
        val message: String = ""
    ) : AiAgentEvent

    /** An AI agent has completed its work */
    data class AgentComplete(
        val agentName: String,
        val message: String = ""
    ) : AiAgentEvent

    /** Final result received — nearby search */
    data class NearbyResult(val data: Map<String, Any?>) : AiAgentEvent

    /** Final result received — itinerary generation */
    data class ItineraryResult(val data: Map<String, Any?>) : AiAgentEvent

    /** Error event */
    data class Error(val message: String) : AiAgentEvent

    /** Connection closed */
    data object Disconnected : AiAgentEvent
}
