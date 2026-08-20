import os
import uuid
from fastapi import APIRouter, File, HTTPException, UploadFile, status, Request
from app.core.config import settings
from app.schemas.common import ResponseModel

router = APIRouter()

ALLOWED_MIME_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/svg+xml",
}

MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB limit


@router.post(
    "/image",
    response_model=ResponseModel[dict],
    summary="Upload image file to local uploads storage directory"
)
async def upload_image(
    request: Request,
    file: UploadFile = File(...)
):
    """
    Saves uploaded image to local `uploads/` directory and returns public static URL.
    """
    if file.content_type and file.content_type.lower() not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{file.content_type}'. Allowed formats: JPG, PNG, WEBP, GIF, SVG."
        )

    # Extract file extension
    ext = os.path.splitext(file.filename or "")[1].lower()
    if not ext:
        ext = ".jpg" if file.content_type == "image/jpeg" else ".png"

    unique_filename = f"{uuid.uuid4()}{ext}"
    upload_dir = settings.MEDIA_UPLOAD_DIR
    os.makedirs(upload_dir, exist_ok=True)
    destination_path = os.path.join(upload_dir, unique_filename)

    # Read and save file content directly to settings.MEDIA_UPLOAD_DIR
    contents = await file.read()
    size_bytes = len(contents)

    if size_bytes > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds maximum allowed limit of 10 MB."
        )

    with open(destination_path, "wb") as f:
        f.write(contents)

    # Build public static URL
    base_url = str(request.base_url).rstrip("/")
    public_url = f"{base_url}/uploads/{unique_filename}"

    return ResponseModel[dict](
        success=True,
        message="Image file uploaded successfully.",
        data={
            "url": public_url,
            "filename": unique_filename,
            "mime_type": file.content_type or "image/jpeg",
            "size_bytes": size_bytes
        }
    )
