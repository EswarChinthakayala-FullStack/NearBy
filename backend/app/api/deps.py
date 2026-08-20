from typing import AsyncGenerator, Optional
from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.core.exceptions import AuthenticationException, AuthorizationException
from app.core.security import decode_jwt_token
from app.crud.crud_user import crud_user
from app.db.session import get_db
from app.models.user import User

# OAuth2 Bearer password flow scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login", auto_error=False)


async def get_current_user(
    db: AsyncSession = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> User:
    """FastAPI dependency decoding JWT bearer token and returning authenticated user entity."""
    payload = decode_jwt_token(token, expected_type="access")
    user_uuid = payload.get("sub")
    if not user_uuid:
        raise AuthenticationException("Invalid authentication token: missing subject claim")

    user = await crud_user.get_by_uuid(db, uuid=str(user_uuid))
    if not user:
        raise AuthenticationException("Authenticated user account no longer exists")

    return user


async def get_current_user_optional(
    db: AsyncSession = Depends(get_db),
    token: Optional[str] = Depends(oauth2_scheme_optional)
) -> Optional[User]:
    """FastAPI dependency returning authenticated user entity if token is provided, or None if guest."""
    if not token:
        return None
    try:
        payload = decode_jwt_token(token, expected_type="access")
        user_uuid = payload.get("sub")
        if user_uuid:
            return await crud_user.get_by_uuid(db, uuid=str(user_uuid))
    except Exception:
        pass
    return None


async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """FastAPI dependency verifying current user account is active."""
    if not current_user.is_active:
        raise AuthenticationException("Inactive user account")
    return current_user


async def get_current_admin(
    current_user: User = Depends(get_current_active_user)
) -> User:
    """FastAPI dependency enforcing administrative authorization privileges."""
    if current_user.role != "admin":
        raise AuthorizationException("Administrative access privileges required")
    return current_user
