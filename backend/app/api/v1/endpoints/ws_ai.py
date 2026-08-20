"""
WebSocket endpoint for real-time AI agent step streaming.
Streams CrewAI agent thinking events to mobile clients.
"""
import json
import logging
import traceback
from typing import Callable, Coroutine, Any

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.ai.orchestrator.nearby_orchestrator import nearby_orchestrator
from app.ai.orchestrator.itinerary_orchestrator import itinerary_orchestrator
from app.core.security import decode_jwt_token

router = APIRouter()
logger = logging.getLogger(__name__)


async def _authenticate_ws(websocket: WebSocket) -> dict | None:
    """Authenticate WebSocket connection via query param or first message token."""
    token = websocket.query_params.get("token")
    if token:
        try:
            payload = decode_jwt_token(token)
            return payload
        except Exception:
            pass
    # Allow unauthenticated for dev; production should enforce
    return {"sub": "anonymous", "user_id": 0}


async def _send_event(websocket: WebSocket, event: str, **kwargs):
    """Send a structured JSON event frame to the WebSocket client."""
    frame = {"event": event, **kwargs}
    try:
        await websocket.send_json(frame)
    except Exception:
        pass


def _make_step_callback(websocket: WebSocket) -> Callable[..., Coroutine[Any, Any, None]]:
    """Create an async callback that streams agent step events over WebSocket."""
    async def on_agent_step(event: str, agent: str, message: str = "", data: dict | None = None):
        await _send_event(
            websocket,
            event=event,
            agent=agent,
            message=message,
            data=data or {}
        )
    return on_agent_step


@router.websocket("/ai")
async def ws_ai_stream(websocket: WebSocket):
    """
    WebSocket endpoint for real-time AI agent streaming.
    
    Client sends:
        {"type": "nearby", "payload": {"query": "...", "latitude": ..., "longitude": ...}}
        {"type": "itinerary", "payload": {"query": "...", "destination": "...", "days": 2}}
    
    Server streams:
        {"event": "connected", "message": "AI WebSocket connected"}
        {"event": "agent_start", "agent": "Query Intent Specialist", "message": "Analyzing query..."}
        {"event": "agent_thinking", "agent": "...", "message": "..."}
        {"event": "agent_complete", "agent": "...", "message": "Done"}
        {"event": "result", "data": {...}}
        {"event": "error", "message": "..."}
    """
    await websocket.accept()
    logger.info("[WS-AI] Client connected")

    auth = await _authenticate_ws(websocket)
    await _send_event(websocket, "connected", message="AI WebSocket connected", agents=[])

    # Get database session
    from app.db.session import AsyncSessionFactory

    try:
        while True:
            raw = await websocket.receive_text()
            try:
                msg = json.loads(raw)
            except json.JSONDecodeError:
                await _send_event(websocket, "error", message="Invalid JSON payload")
                continue

            msg_type = msg.get("type", "").lower()
            payload = msg.get("payload", {})
            step_callback = _make_step_callback(websocket)

            if msg_type == "nearby":
                await _handle_nearby(websocket, payload, step_callback)
            elif msg_type == "itinerary":
                await _handle_itinerary(websocket, payload, step_callback, auth)
            else:
                await _send_event(websocket, "error", message=f"Unknown type: {msg_type}")

    except WebSocketDisconnect:
        logger.info("[WS-AI] Client disconnected")
    except Exception as e:
        logger.error(f"[WS-AI] Error: {e}\n{traceback.format_exc()}")
        try:
            await _send_event(websocket, "error", message=str(e))
        except Exception:
            pass


async def _handle_nearby(websocket: WebSocket, payload: dict, step_callback):
    """Handle AI Nearby search request over WebSocket."""
    from app.db.session import AsyncSessionFactory

    query = payload.get("query", "Best places nearby")
    lat = float(payload.get("latitude", 17.385))
    lng = float(payload.get("longitude", 78.487))

    try:
        async with AsyncSessionFactory() as db:
            result = await nearby_orchestrator.execute_nearby_crew(
                db=db,
                query=query,
                latitude=lat,
                longitude=lng,
                on_agent_step=step_callback
            )
            # Convert Pydantic model to dict for JSON serialization
            result_dict = result.model_dump() if hasattr(result, 'model_dump') else result.dict()
            await _send_event(websocket, "result", data=result_dict, result_type="nearby")
    except Exception as e:
        logger.error(f"[WS-AI] Nearby error: {e}")
        await _send_event(websocket, "error", message=f"Nearby search failed: {str(e)}")


async def _handle_itinerary(websocket: WebSocket, payload: dict, step_callback, auth: dict):
    """Handle AI Itinerary generation request over WebSocket."""
    from app.db.session import AsyncSessionFactory
    from app.services.itinerary.itinerary_storage import itinerary_storage_service

    query = payload.get("query", "Plan a trip")
    destination = payload.get("destination")
    days = payload.get("days")
    user_uuid = auth.get("sub", "anonymous") if auth else "anonymous"
    user_id = auth.get("user_id", 1) if auth and isinstance(auth.get("user_id"), int) and auth.get("user_id") > 0 else 1

    try:
        async with AsyncSessionFactory() as db:
            raw_itinerary = await itinerary_orchestrator.execute_itinerary_crew(
                db=db,
                user_uuid=user_uuid,
                query=query,
                destination=destination,
                days=days,
                on_agent_step=step_callback
            )

            raw_itinerary["original_prompt"] = query
            raw_itinerary["query"] = query

            # Persist itinerary to database
            saved_db_obj = await itinerary_storage_service.save_itinerary(
                db=db,
                user_id=user_id,
                raw_itinerary=raw_itinerary
            )

            response_schema = itinerary_storage_service.to_response_schema(saved_db_obj)
            result_dict = response_schema.model_dump() if hasattr(response_schema, 'model_dump') else response_schema.dict()

            await _send_event(websocket, "result", data=result_dict, result_type="itinerary")
    except Exception as e:
        logger.error(f"[WS-AI] Itinerary error: {e}")
        await _send_event(websocket, "error", message=f"Itinerary generation failed: {str(e)}")
