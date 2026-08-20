from enum import Enum


class UserRole(str, Enum):
    """User authorization roles."""
    USER = "user"
    ADMIN = "admin"


class PlaceStatus(str, Enum):
    """Tourist place publishing status."""
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class PlaceSource(str, Enum):
    """Tourist place data origin."""
    OSM = "osm"
    ADMIN = "admin"


class ImageSource(str, Enum):
    """Image data origin."""
    WIKIMEDIA = "wikimedia"
    BING = "bing"
    ADMIN = "admin"
    USER = "user"


class ReviewStatus(str, Enum):
    """Review moderation status."""
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class OsmSyncStatus(str, Enum):
    """OSM import job status."""
    RUNNING = "running"
    SUCCESS = "success"
    FAILED = "failed"


class ContentSyncType(str, Enum):
    """Content synchronization job type."""
    WIKIPEDIA = "wikipedia"
    WIKIMEDIA_IMAGE = "wikimedia_image"
    BING_IMAGE = "bing_image"


class ContentSyncStatus(str, Enum):
    """Content synchronization status."""
    SUCCESS = "success"
    FAILED = "failed"
