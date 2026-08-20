import pytest

def test_lightweight_launcher():
    """Verify lightweight start.py module imports cleanly."""
    import start
    assert hasattr(start, "uvicorn")
