from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class RegisterRequest(BaseModel):
    """New user account registration payload."""
    email: EmailStr = Field(..., description="Valid user email address")
    password: str = Field(..., min_length=8, max_length=100, description="Account password (minimum 8 characters)")
    full_name: str = Field(..., min_length=2, max_length=150, description="Full display name")
    phone: Optional[str] = Field(None, max_length=20, description="Optional phone number")

    @field_validator("full_name")
    def validate_full_name(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Full name cannot be blank or empty whitespace")
        return v


class LoginRequest(BaseModel):
    """User authentication login payload."""
    email: EmailStr = Field(..., description="Registered email address")
    password: str = Field(..., min_length=1, description="Account password")


class RefreshRequest(BaseModel):
    """JWT Refresh Token payload for obtaining new access token."""
    refresh_token: str = Field(..., min_length=10, description="Valid signed JWT refresh token string")


class TokenPair(BaseModel):
    """Signed JWT token pair response payload."""
    model_config = ConfigDict(from_attributes=True)

    access_token: str = Field(..., description="JWT bearer access token string")
    refresh_token: str = Field(..., description="JWT refresh token string")
    token_type: str = Field("bearer", description="Token authentication scheme")
    expires_in: int = Field(3600, description="Access token expiration lifetime in seconds")


class TokenData(BaseModel):
    """Decoded JWT payload data representation."""
    user_uuid: Optional[str] = Field(None, description="Decoded public user UUID string")
