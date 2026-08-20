from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserRead(BaseModel):
    """User profile read response model (never exposes internal ID or password hash)."""
    model_config = ConfigDict(from_attributes=True)

    uuid: str = Field(..., description="Public identifier UUID string")
    full_name: str = Field(..., description="User full display name")
    email: EmailStr = Field(..., description="User registered email address")
    username: Optional[str] = Field(None, description="Public username handle")
    phone: Optional[str] = Field(None, description="Contact phone number")
    phone_number: Optional[str] = Field(None, description="Contact phone number alias")
    role: str = Field(..., description="User authorization role (user or admin)")
    avatar_url: Optional[str] = Field(None, description="Profile avatar picture URL")
    profile_image: Optional[str] = Field(None, description="Profile image URL alias")
    bio: Optional[str] = Field(None, description="Short user travel biography")
    gender: Optional[str] = Field(None, description="Gender identity")
    date_of_birth: Optional[str] = Field(None, description="Date of birth")
    country: Optional[str] = Field(None, description="Country of residence")
    state: Optional[str] = Field(None, description="State / region")
    city: Optional[str] = Field(None, description="City")
    preferred_language: Optional[str] = Field("English (US)", description="Preferred app language")
    is_active: bool = Field(True, description="Active account status flag")
    is_verified: bool = Field(False, description="Email verification status flag")
    email_verified: bool = Field(True, description="Email verification status flag")
    phone_verified: bool = Field(False, description="Phone verification status flag")
    created_at: Optional[datetime] = Field(None, description="Account creation timestamp")


from app.schemas.auth import LoginRequest, RegisterRequest

# Backward compatibility aliases
UserResponse = UserRead
UserCreate = RegisterRequest
UserLogin = LoginRequest


class UserUpdate(BaseModel):
    """User profile update payload."""
    full_name: Optional[str] = Field(None, min_length=2, max_length=150, description="Updated full name")
    username: Optional[str] = Field(None, max_length=50, description="Updated username handle")
    phone: Optional[str] = Field(None, max_length=20, description="Updated phone number")
    avatar_url: Optional[str] = Field(None, max_length=500, description="Updated avatar image URL")
    bio: Optional[str] = Field(None, max_length=250, description="Updated biography")
    gender: Optional[str] = Field(None, max_length=20, description="Updated gender")
    date_of_birth: Optional[str] = Field(None, max_length=30, description="Updated date of birth")
    country: Optional[str] = Field(None, max_length=100, description="Updated country")
    state: Optional[str] = Field(None, max_length=100, description="Updated state")
    city: Optional[str] = Field(None, max_length=100, description="Updated city")
    preferred_language: Optional[str] = Field(None, max_length=50, description="Updated language")


class PasswordChange(BaseModel):
    """User password change payload."""
    current_password: str = Field(..., min_length=1, description="Current account password")
    new_password: str = Field(..., min_length=8, max_length=100, description="New password (minimum 8 characters)")
