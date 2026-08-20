from typing import Optional, Union
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.security import get_password_hash, verify_password
from app.crud.base import CRUDBase
from app.models.user import User
from app.schemas.auth import RegisterRequest
from app.schemas.user import UserUpdate


class CRUDUser(CRUDBase[User, RegisterRequest, UserUpdate]):
    """User repository providing authentication and user account management operations."""

    async def get_by_email(self, db: AsyncSession, email: str) -> Optional[User]:
        """Fetch user record by email address."""
        stmt = select(User).where(func.lower(User.email) == email.lower().strip())
        result = await db.execute(stmt)
        return result.scalars().first()

    async def get_by_uuid(self, db: AsyncSession, uuid: str) -> Optional[User]:
        """Fetch user record by public UUID string."""
        stmt = select(User).where(User.uuid == uuid)
        result = await db.execute(stmt)
        return result.scalars().first()

    async def authenticate(self, db: AsyncSession, email: str, password: str) -> Optional[User]:
        """Authenticate user credentials using email and bcrypt password verification."""
        user = await self.get_by_email(db, email=email)
        if not user:
            return None
        if not verify_password(password, user.password_hash):
            return None
        return user

    async def create_user(self, db: AsyncSession, obj_in: RegisterRequest) -> User:
        """Create new registered user account with bcrypt password hashing."""
        create_data = obj_in.model_dump(exclude_unset=True)
        password = create_data.pop("password")
        create_data["password_hash"] = get_password_hash(password)

        db_obj = User(**create_data)
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def change_password(self, db: AsyncSession, db_obj: User, new_password: str) -> User:
        """Update user account password."""
        db_obj.password_hash = get_password_hash(new_password)
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def activate_account(self, db: AsyncSession, db_obj: User) -> User:
        """Activate user account status."""
        db_obj.is_active = True
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj


crud_user = CRUDUser(User)
