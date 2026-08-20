from typing import Any, List, Optional
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from app.crud.base import CRUDBase
from app.models.image import PlaceImage
from app.schemas.image import PlaceImageCreate


class CRUDImage(CRUDBase[PlaceImage, PlaceImageCreate, Any]):
    """Image repository managing place gallery uploads and cover image selection."""

    async def add_place_image(
        self,
        db: AsyncSession,
        place_id: int,
        image_in: PlaceImageCreate,
        uploaded_by: Optional[int] = None
    ) -> PlaceImage:
        """Add image to place gallery."""
        db_obj = PlaceImage(
            place_id=place_id,
            image_url=image_in.image_url,
            thumbnail_url=image_in.thumbnail_url,
            source=image_in.source or "admin",
            uploaded_by=uploaded_by,
            is_cover=image_in.is_cover or False,
            sort_order=image_in.sort_order or 0
        )
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def set_cover_image(self, db: AsyncSession, place_id: int, image_id: int) -> bool:
        """Set target image as primary cover image for place and unset all other cover flags."""
        # Unset all cover images for place
        unset_stmt = (
            update(PlaceImage)
            .where(PlaceImage.place_id == place_id)
            .values(is_cover=False)
        )
        await db.execute(unset_stmt)

        # Set target cover image
        set_stmt = (
            update(PlaceImage)
            .where(PlaceImage.id == image_id)
            .where(PlaceImage.place_id == place_id)
            .values(is_cover=True)
        )
        res = await db.execute(set_stmt)
        await db.commit()

        return res.rowcount > 0

    async def get_place_images(self, db: AsyncSession, place_id: int) -> List[PlaceImage]:
        """Fetch all gallery images for a place ordered by cover first and sort_order."""
        stmt = (
            select(PlaceImage)
            .where(PlaceImage.place_id == place_id)
            .order_by(PlaceImage.is_cover.desc(), PlaceImage.sort_order.asc(), PlaceImage.id.asc())
        )
        res = await db.execute(stmt)
        return list(res.scalars().all())


crud_image = CRUDImage(PlaceImage)
