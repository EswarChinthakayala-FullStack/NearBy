from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.core.config import settings
from app.core.exceptions import AuthenticationException

# Bcrypt password hashing context setup
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain-text password against a bcrypt hash string."""
    if not plain_password or not hashed_password:
        return False
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Generate bcrypt password hash."""
    if not password:
        raise ValueError("Password cannot be empty")
    return pwd_context.hash(password)


def create_access_token(user_uuid: str, expires_delta: Optional[timedelta] = None) -> str:
    """Create a signed JWT access token containing public user UUID string in 'sub' claim."""
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode = {
        "sub": str(user_uuid),
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
        "type": "access"
    }

    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_refresh_token(user_uuid: str, expires_delta: Optional[timedelta] = None) -> str:
    """Create a signed JWT refresh token containing public user UUID string in 'sub' claim."""
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

    to_encode = {
        "sub": str(user_uuid),
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
        "type": "refresh"
    }

    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_jwt_token(token: str, expected_type: Optional[str] = None) -> Dict[str, Any]:
    """Decode and validate JWT token claims and signature."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_uuid: Optional[str] = payload.get("sub")
        token_type: Optional[str] = payload.get("type")

        if not user_uuid:
            raise AuthenticationException("Token payload is missing subject claim ('sub')")

        if expected_type and token_type != expected_type:
            raise AuthenticationException(f"Invalid token type: expected '{expected_type}', got '{token_type}'")

        return payload
    except JWTError as e:
        raise AuthenticationException(f"Invalid authentication token: {str(e)}")
