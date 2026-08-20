package com.tourismguide.app.data.remote.ws

import android.util.Log
import com.example.nearby.BuildConfig
import kotlinx.coroutines.channels.BufferOverflow
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.asSharedFlow
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.Response
import okhttp3.WebSocket
import okhttp3.WebSocketListener
import org.json.JSONObject
import javax.inject.Inject
import javax.inject.Singleton

/**
 * OkHttp WebSocket client that connects to the backend AI WebSocket endpoint
 * and emits real-time [AiAgentEvent] updates as a [SharedFlow].
 */
@Singleton
class AiWebSocketClient @Inject constructor(
    private val okHttpClient: OkHttpClient
) {
    companion object {
        private const val TAG = "AiWebSocket"
    }

    private val _events = MutableSharedFlow<AiAgentEvent>(
        replay = 0,
        extraBufferCapacity = 64,
        onBufferOverflow = BufferOverflow.DROP_OLDEST
    )
    val events: SharedFlow<AiAgentEvent> = _events.asSharedFlow()

    private var webSocket: WebSocket? = null
    private var isConnected = false

    /**
     * Derive WebSocket URL from the REST base URL.
     * e.g., http://127.0.0.1:8000/api/v1/ → ws://127.0.0.1:8000/api/v1/ws/ai
     */
    private fun getWsUrl(): String {
        val baseUrl = BuildConfig.API_BASE_URL
        val wsBase = baseUrl
            .replace("https://", "wss://")
            .replace("http://", "ws://")
            .trimEnd('/')
        return "$wsBase/ws/ai"
    }

    fun connect() {
        if (isConnected) return

        val wsUrl = getWsUrl()
        Log.d(TAG, "Connecting to $wsUrl")

        val request = Request.Builder()
            .url(wsUrl)
            .build()

        webSocket = okHttpClient.newWebSocket(request, object : WebSocketListener() {
            override fun onOpen(webSocket: WebSocket, response: Response) {
                Log.d(TAG, "WebSocket connected")
                isConnected = true
                _events.tryEmit(AiAgentEvent.Connected("WebSocket connected"))
            }

            override fun onMessage(webSocket: WebSocket, text: String) {
                try {
                    val json = JSONObject(text)
                    val event = parseEvent(json)
                    _events.tryEmit(event)
                } catch (e: Exception) {
                    Log.e(TAG, "Failed to parse WS message: $text", e)
                }
            }

            override fun onClosing(webSocket: WebSocket, code: Int, reason: String) {
                Log.d(TAG, "WebSocket closing: $code $reason")
                webSocket.close(1000, null)
                isConnected = false
                _events.tryEmit(AiAgentEvent.Disconnected)
            }

            override fun onClosed(webSocket: WebSocket, code: Int, reason: String) {
                Log.d(TAG, "WebSocket closed: $code $reason")
                isConnected = false
                _events.tryEmit(AiAgentEvent.Disconnected)
            }

            override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
                Log.e(TAG, "WebSocket failure: ${t.message}", t)
                isConnected = false
                _events.tryEmit(AiAgentEvent.Error(t.message ?: "WebSocket connection failed"))
            }
        })
    }

    fun disconnect() {
        webSocket?.close(1000, "Client disconnect")
        webSocket = null
        isConnected = false
    }

    /**
     * Send a nearby search request over WebSocket.
     */
    fun sendNearbyQuery(query: String, latitude: Double, longitude: Double) {
        ensureConnected()
        val payload = JSONObject().apply {
            put("type", "nearby")
            put("payload", JSONObject().apply {
                put("query", query)
                put("latitude", latitude)
                put("longitude", longitude)
            })
        }
        webSocket?.send(payload.toString())
    }

    /**
     * Send an itinerary generation request over WebSocket.
     */
    fun sendItineraryQuery(query: String, destination: String? = null, days: Int? = null) {
        ensureConnected()
        val payload = JSONObject().apply {
            put("type", "itinerary")
            put("payload", JSONObject().apply {
                put("query", query)
                destination?.let { put("destination", it) }
                days?.let { put("days", it) }
            })
        }
        webSocket?.send(payload.toString())
    }

    fun isActive(): Boolean = isConnected

    private fun ensureConnected() {
        if (!isConnected) {
            connect()
        }
    }

    private fun parseEvent(json: JSONObject): AiAgentEvent {
        return when (val eventType = json.optString("event", "")) {
            "connected" -> AiAgentEvent.Connected(json.optString("message", ""))
            "agent_start" -> AiAgentEvent.AgentStart(
                agentName = json.optString("agent", "AI Agent"),
                message = json.optString("message", "")
            )
            "agent_thinking" -> AiAgentEvent.AgentThinking(
                agentName = json.optString("agent", "AI Agent"),
                message = json.optString("message", "")
            )
            "agent_complete" -> AiAgentEvent.AgentComplete(
                agentName = json.optString("agent", "AI Agent"),
                message = json.optString("message", "")
            )
            "result" -> {
                val resultType = json.optString("result_type", "")
                val dataJson = json.optJSONObject("data")
                val dataMap = jsonObjectToMap(dataJson)
                if (resultType == "itinerary") {
                    AiAgentEvent.ItineraryResult(dataMap)
                } else {
                    AiAgentEvent.NearbyResult(dataMap)
                }
            }
            "error" -> AiAgentEvent.Error(json.optString("message", "Unknown error"))
            else -> AiAgentEvent.Error("Unknown event type: $eventType")
        }
    }

    private fun jsonObjectToMap(json: JSONObject?): Map<String, Any?> {
        if (json == null) return emptyMap()
        val map = mutableMapOf<String, Any?>()
        val keys = json.keys()
        while (keys.hasNext()) {
            val key = keys.next()
            val value = json.opt(key)
            map[key] = when (value) {
                is JSONObject -> jsonObjectToMap(value)
                is org.json.JSONArray -> {
                    (0 until value.length()).map { i ->
                        when (val item = value.opt(i)) {
                            is JSONObject -> jsonObjectToMap(item)
                            else -> item
                        }
                    }
                }
                JSONObject.NULL -> null
                else -> value
            }
        }
        return map
    }
}
