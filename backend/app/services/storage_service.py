import os
import uuid
from typing import Any, Dict, Optional
from app.core.config import settings
from app.core.exceptions import ValidationException
from app.core.logging_config import logger

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
MIME_TYPE_MAP = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif"
}


class StorageService:
    """Enterprise file storage service managing structured image uploads under uploads/."""

    def __init__(self, base_dir: Optional[str] = None):
        self.base_dir = base_dir or settings.MEDIA_UPLOAD_DIR
        self._ensure_upload_directories()

    def _ensure_upload_directories(self) -> None:
        """Create structured upload subdirectories for places, reviews, avatars, and thumbnails."""
        categories = ["places", "reviews", "avatars", "thumbnails"]
        for cat in categories:
            dir_path = os.path.join(self.base_dir, cat)
            os.makedirs(dir_path, exist_ok=True)

    def validate_file(self, filename: str, file_size: int) -> str:
        """Validate filename extension and maximum allowed upload file size."""
        if file_size > settings.MAX_UPLOAD_SIZE_BYTES:
            max_mb = settings.MAX_UPLOAD_SIZE_BYTES / (1024 * 1024)
            raise ValidationException(f"File size exceeds maximum limit of {max_mb:.1f}MB")

        ext = os.path.splitext(filename)[1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            allowed_str = ", ".join(sorted(ALLOWED_EXTENSIONS))
            raise ValidationException(f"Invalid image format '{ext}'. Allowed extensions: {allowed_str}")

        return ext

    async def save_image(
        self,
        file_bytes: bytes,
        original_filename: str,
        category: str = "places"
    ) -> Dict[str, Any]:
        """Save uploaded image bytes to structured upload folder and return metadata envelope."""
        if category not in ["places", "reviews", "avatars"]:
            category = "places"

        file_size = len(file_bytes)
        ext = self.validate_file(original_filename, file_size)

        # Generate unique UUID filename
        unique_id = str(uuid.uuid4())
        new_filename = f"{unique_id}{ext}"
        relative_path = os.path.join(category, new_filename)
        absolute_path = os.path.join(self.base_dir, relative_path)

        # Write image bytes to disk
        with open(absolute_path, "wb") as f:
            f.write(file_bytes)

        logger.info(f"Successfully saved uploaded image to {absolute_path} ({file_size} bytes)")

        # Formulate public access URL
        public_url = f"{settings.UPLOAD_URL_PREFIX}/{category}/{new_filename}"
        mime_type = MIME_TYPE_MAP.get(ext, "image/jpeg")

        return {
            "image_url": public_url,
            "thumbnail_url": public_url,
            "filename": new_filename,
            "file_size_bytes": file_size,
            "mime_type": mime_type
        }

    def delete_image(self, relative_path: str) -> bool:
        """Safely delete an uploaded image file."""
        # Strip leading slash or prefix if present
        clean_path = relative_path.replace(settings.UPLOAD_URL_PREFIX, "").lstrip("/\\")
        absolute_path = os.path.abspath(os.path.join(self.base_dir, clean_path))

        # Security check: prevent path traversal attacks
        base_abs = os.path.abspath(self.base_dir)
        if not absolute_path.startswith(base_abs):
            logger.warning(f"Prevented unsafe path traversal deletion attempt: {relative_path}")
            return False

        if os.path.exists(absolute_path):
            os.remove(absolute_path)
            logger.info(f"Deleted image file: {absolute_path}")
            return True

        return False


storage_service = StorageService()
