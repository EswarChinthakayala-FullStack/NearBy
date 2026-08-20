from typing import Optional
from pydantic import BaseModel
from app.schemas.user import UserResponse


class Token(BaseModel):
    """JWT Token pairs response payload."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenPayload(BaseModel):
    """Decoded JWT Token claims structure."""
    sub: Optional[str] = None
    exp: Optional[int] = None
    type: Optional[str] = None


class RefreshTokenRequest(BaseModel):
    """Payload for rotating refresh tokens."""
    refresh_token: str
