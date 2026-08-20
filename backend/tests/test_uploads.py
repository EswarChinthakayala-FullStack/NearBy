import io
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_upload_image_success(tmp_path):
    """Test uploading a valid image file to /api/v1/uploads/image."""
    # Create fake image bytes
    file_bytes = b"\xFF\xD8\xFF\xE0\x00\x10JFIF\x00\x01\x01\x01\x00\x60\x00\x60\x00\x00"
    files = {
        "file": ("test_avatar.jpg", io.BytesIO(file_bytes), "image/jpeg")
    }

    response = client.post("/api/v1/uploads/image", files=files)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "url" in data["data"]
    assert "/uploads/" in data["data"]["url"]


def test_upload_image_invalid_type():
    """Test uploading an unsupported file format (e.g. text/plain)."""
    file_bytes = b"Hello world text"
    files = {
        "file": ("document.txt", io.BytesIO(file_bytes), "text/plain")
    }

    response = client.post("/api/v1/uploads/image", files=files)
    assert response.status_code == 400
