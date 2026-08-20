import os
import pytest
from app.core.exceptions import ValidationException
from app.services.storage_service import StorageService, storage_service


@pytest.mark.asyncio
async def test_storage_service_save_and_delete_image(tmp_path):
    """Verify storage service saving image file and deleting."""
    custom_storage = StorageService(base_dir=str(tmp_path))

    fake_file_bytes = b"\xFF\xD8\xFF\xE0\x00\x10JFIF"  # Minimal JPEG header bytes
    filename = "sunset.jpg"

    result = await custom_storage.save_image(fake_file_bytes, filename, category="places")

    assert result["image_url"].startswith("/uploads/places/")
    assert result["filename"].endswith(".jpg")
    assert result["file_size_bytes"] == len(fake_file_bytes)
    assert result["mime_type"] == "image/jpeg"

    # Verify physical file existence
    saved_path = os.path.join(str(tmp_path), "places", result["filename"])
    assert os.path.exists(saved_path)

    # Test deleting file
    deleted = custom_storage.delete_image(result["image_url"])
    assert deleted is True
    assert not os.path.exists(saved_path)


def test_storage_service_invalid_file_extension(tmp_path):
    """Verify storage service rejects invalid file formats."""
    custom_storage = StorageService(base_dir=str(tmp_path))

    with pytest.raises(ValidationException) as exc_info:
        custom_storage.validate_file("malicious_script.exe", 100)

    assert "Invalid image format" in exc_info.value.message
