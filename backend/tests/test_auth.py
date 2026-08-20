import pytest
from app.core.security import create_access_token, decode_jwt_token, get_password_hash, verify_password


def test_password_hashing():
    """Test bcrypt password hashing and verification."""
    password = "SuperSecretPassword123!"
    hashed = get_password_hash(password)
    assert hashed != password
    assert verify_password(password, hashed) is True
    assert verify_password("WrongPassword", hashed) is False


def test_jwt_token_encoding():
    """Test JWT token encoding and decoding."""
    user_uuid = "550e8400-e29b-41d4-a716-446655440000"
    token = create_access_token(user_uuid=user_uuid)
    assert isinstance(token, str)

    payload = decode_jwt_token(token)
    assert payload is not None
    assert payload["sub"] == user_uuid
    assert payload["type"] == "access"
