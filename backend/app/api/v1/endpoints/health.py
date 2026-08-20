from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas.common import ResponseModel

router = APIRouter()


@router.get("/health", response_model=ResponseModel[dict])
async def health_check(db: AsyncSession = Depends(get_db)):
    """System health check and database connectivity verification."""
    try:
        await db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"

    return ResponseModel(
        success=True,
        message="System operational",
        data={
            "status": "healthy",
            "database": db_status
        }
    )
