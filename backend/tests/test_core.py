import pytest
from app.core.config import settings
from app.core.exceptions import (
    AppException,
    AuthenticationException,
    ResourceNotFoundException,
    ValidationException
)
from app.core.logging_config import get_logger
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_jwt_token,
    get_password_hash,
    verify_password
)


def test_settings_loaded():
    """Verify Settings singleton parameters."""
    assert settings.PROJECT_NAME == "Nearby Tourist Guide API"
    assert settings.ALGORITHM == "HS256"
    assert settings.ASYNC_DATABASE_URI.startswith("mysql+asyncmy://")
    assert settings.SYNC_DATABASE_URI.startswith("mysql+pymysql://")


def test_password_hashing_and_verification():
    """Verify bcrypt password hashing and verification."""
    password = "StrongPassword#2026"
    hashed = get_password_hash(password)

    assert hashed != password
    assert verify_password(password, hashed) is True
    assert verify_password("WrongPassword", hashed) is False
    assert verify_password("", hashed) is False


def test_jwt_tokens_access_and_refresh():
    """Verify JWT access and refresh token creation and claims decoding."""
    user_uuid = "e3e8f810-72f3-4e4b-9721-7f9999a09999"

    # Access token
    access_token = create_access_token(user_uuid=user_uuid)
    payload_access = decode_jwt_token(access_token, expected_type="access")
    assert payload_access["sub"] == user_uuid
    assert payload_access["type"] == "access"

    # Refresh token
    refresh_token = create_refresh_token(user_uuid=user_uuid)
    payload_refresh = decode_jwt_token(refresh_token, expected_type="refresh")
    assert payload_refresh["sub"] == user_uuid
    assert payload_refresh["type"] == "refresh"


def test_jwt_invalid_token_type_exception():
    """Verify decoding a token with wrong expected type raises AuthenticationException."""
    user_uuid = "e3e8f810-72f3-4e4b-9721-7f9999a09999"
    access_token = create_access_token(user_uuid=user_uuid)

    with pytest.raises(AuthenticationException) as exc_info:
        decode_jwt_token(access_token, expected_type="refresh")

    assert exc_info.value.code == "AUTHENTICATION_ERROR"
    assert "Invalid token type" in exc_info.value.message


def test_app_exception_hierarchy():
    """Verify custom exception inheritance and attribute formatting."""
    exc = ResourceNotFoundException("Place", "uuid-12345")
    assert exc.code == "RESOURCE_NOT_FOUND"
    assert exc.status_code == 404
    assert "Place with identifier 'uuid-12345' was not found." in exc.message


def test_logger_instantiation():
    """Verify logger creation utility."""
    logger_inst = get_logger("test_module")
    assert logger_inst.name == "test_module"
