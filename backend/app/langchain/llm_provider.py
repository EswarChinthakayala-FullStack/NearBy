import os
import logging
from typing import Optional
from langchain_mistralai import ChatMistralAI
from app.core.config import settings

logger = logging.getLogger(__name__)

class LLMProvider:
    """Centralized Enterprise LLM Provider for ChatMistralAI Large."""

    _instance: Optional[ChatMistralAI] = None

    @classmethod
    def get_llm(cls, temperature: float = 0.2) -> ChatMistralAI:
        api_key = getattr(settings, "MISTRAL_API_KEY", os.getenv("MISTRAL_API_KEY", "mock-key"))
        if cls._instance is None:
            cls._instance = ChatMistralAI(
                model="mistral-large-latest",
                temperature=temperature,
                mistral_api_key=api_key
            )
        return cls._instance

llm_provider = LLMProvider()
