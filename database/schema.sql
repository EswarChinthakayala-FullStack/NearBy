-- =============================================================================
-- Nearby App - Production Database Schema (MySQL 8.0+)
-- =============================================================================
-- Description : Complete DDL for Nearby Tourist Place Directory & Navigation System.
--               Covers User Management, Place Directory, Media, Reviews, Favorites,
--               Spatial Location, Integration Logs, Routing Cache, and Audit Trail.
-- Includes    : Foreign Key Constraints, Spatial Indexes, Automated UUID Generation,
--               Spatial Location Auto-population, and Denormalized Counter Triggers.
-- Engine      : InnoDB
-- Charset     : utf8mb4 (utf8mb4_unicode_ci)
-- =============================================================================

SET FOREIGN_KEY_CHECKS = 0;
SET NAMES utf8mb4;
SET TIME_ZONE = '+00:00';

-- -----------------------------------------------------------------------------
-- Database Initialization (Optional/Configurable)
-- -----------------------------------------------------------------------------
CREATE DATABASE IF NOT EXISTS `nearby_db` 
    DEFAULT CHARACTER SET utf8mb4 
    DEFAULT COLLATE utf8mb4_unicode_ci;

USE `nearby_db`;

-- -----------------------------------------------------------------------------
-- Drop Existing Tables (Reverse Dependency Order)
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `admin_activity_logs`;
DROP TABLE IF EXISTS `routing_cache`;
DROP TABLE IF EXISTS `content_sync_logs`;
DROP TABLE IF EXISTS `osm_sync_logs`;
DROP TABLE IF EXISTS `favorites`;
DROP TABLE IF EXISTS `review_images`;
DROP TABLE IF EXISTS `reviews`;
DROP TABLE IF EXISTS `place_images`;
DROP TABLE IF EXISTS `place_timings`;
DROP TABLE IF EXISTS `places`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `refresh_tokens`;
DROP TABLE IF EXISTS `users`;

-- =============================================================================
-- 4.1 users
-- Registered app users and administrators.
-- =============================================================================
CREATE TABLE `users` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT COMMENT 'Internal surrogate primary key',
    `uuid` CHAR(36) NOT NULL COMMENT 'Public identifier used in API responses',
    `full_name` VARCHAR(150) NOT NULL COMMENT 'User full display name',
    `email` VARCHAR(191) NOT NULL COMMENT 'Unique user email address for authentication',
    `password_hash` VARCHAR(255) NOT NULL COMMENT 'Bcrypt password hash',
    `phone` VARCHAR(20) DEFAULT NULL COMMENT 'Optional contact phone number',
    `role` ENUM('user', 'admin') NOT NULL DEFAULT 'user' COMMENT 'Authorization role',
    `avatar_url` VARCHAR(500) DEFAULT NULL COMMENT 'URL to user profile avatar',
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Soft-disable account flag',
    `is_verified` BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Email address verification flag',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Record update timestamp',
    
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_users_uuid` (`uuid`),
    UNIQUE KEY `uk_users_email` (`email`),
    INDEX `idx_users_role` (`role`),
    INDEX `idx_users_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Registered users and administrative accounts';

-- =============================================================================
-- 4.2 refresh_tokens
-- Rotating JWT refresh tokens per session/device.
-- =============================================================================
CREATE TABLE `refresh_tokens` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT COMMENT 'Internal surrogate primary key',
    `user_id` BIGINT UNSIGNED NOT NULL COMMENT 'FK referencing users.id',
    `token` VARCHAR(500) NOT NULL COMMENT 'Hashed refresh token',
    `expires_at` DATETIME NOT NULL COMMENT 'Token expiration timestamp',
    `revoked` BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Revocation flag (set true on logout/rotation)',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Token issuance timestamp',
    
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_refresh_tokens_token` (`token`),
    INDEX `idx_refresh_tokens_user_id` (`user_id`),
    INDEX `idx_refresh_tokens_expires_revoked` (`expires_at`, `revoked`),
    CONSTRAINT `fk_refresh_tokens_user` FOREIGN KEY (`user_id`) 
        REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='JWT refresh tokens for active user sessions';

-- =============================================================================
-- 4.3 categories
-- Place categories (Temple, Beach, Museum, Park, etc.).
-- =============================================================================
CREATE TABLE `categories` (
    `id` INT UNSIGNED AUTO_INCREMENT COMMENT 'Internal surrogate primary key',
    `name` VARCHAR(100) NOT NULL COMMENT 'Category display name',
    `slug` VARCHAR(120) NOT NULL COMMENT 'URL-safe slug key',
    `icon` VARCHAR(255) DEFAULT NULL COMMENT 'Icon asset reference or URL',
    `description` TEXT DEFAULT NULL COMMENT 'Detailed category description',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
    
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_categories_name` (`name`),
    UNIQUE KEY `uk_categories_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tourist place categories';

-- =============================================================================
-- 4.4 places
-- Core tourist-place directory; the central table of the application.
-- =============================================================================
CREATE TABLE `places` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT COMMENT 'Internal surrogate primary key',
    `uuid` CHAR(36) NOT NULL COMMENT 'Public identifier used in API responses',
    `name` VARCHAR(200) NOT NULL COMMENT 'Place name from OSM or Admin',
    `slug` VARCHAR(220) NOT NULL COMMENT 'URL-safe place slug',
    `category_id` INT UNSIGNED NOT NULL COMMENT 'FK referencing categories.id',
    `description` TEXT DEFAULT NULL COMMENT 'Wikipedia overview or admin summary',
    `history` TEXT DEFAULT NULL COMMENT 'Historical context from Wikipedia or admin',
    `address` VARCHAR(500) DEFAULT NULL COMMENT 'Full physical street address',
    `city` VARCHAR(120) DEFAULT NULL COMMENT 'City / Municipality',
    `state` VARCHAR(120) DEFAULT NULL COMMENT 'State / Province / Region',
    `country` VARCHAR(120) DEFAULT NULL COMMENT 'Country name',
    `latitude` DECIMAL(10,7) NOT NULL COMMENT 'Geographic latitude (-90.0 to 90.0)',
    `longitude` DECIMAL(10,7) NOT NULL COMMENT 'Geographic longitude (-180.0 to 180.0)',
    `location` POINT SRID 4326 NOT NULL COMMENT 'Spatial POINT generated from lat/lng for spatial queries',
    `osm_id` BIGINT DEFAULT NULL COMMENT 'OpenStreetMap element ID',
    `osm_type` VARCHAR(20) DEFAULT NULL COMMENT 'OpenStreetMap element type (node, way, relation)',
    `entry_fee` VARCHAR(100) DEFAULT NULL COMMENT 'Ticket / Entry fee description',
    `best_time_to_visit` VARCHAR(150) DEFAULT NULL COMMENT 'Recommended visiting season or times',
    `status` ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft' COMMENT 'Publication state',
    `avg_rating` DECIMAL(3,2) NOT NULL DEFAULT 0.00 COMMENT 'Denormalized average rating score (1.00 - 5.00)',
    `total_reviews` INT NOT NULL DEFAULT 0 COMMENT 'Denormalized total count of approved user reviews',
    `total_favorites` INT NOT NULL DEFAULT 0 COMMENT 'Denormalized total count of user bookmarks',
    `source` ENUM('osm', 'admin') NOT NULL DEFAULT 'osm' COMMENT 'Data origin source',
    `created_by` BIGINT UNSIGNED DEFAULT NULL COMMENT 'FK referencing users.id for admin creator/editor',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Record update timestamp',
    
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_places_uuid` (`uuid`),
    UNIQUE KEY `uk_places_slug` (`slug`),
    INDEX `idx_places_category_id` (`category_id`),
    INDEX `idx_places_status` (`status`),
    INDEX `idx_places_source` (`source`),
    INDEX `idx_places_osm_ref` (`osm_id`, `osm_type`),
    INDEX `idx_places_location_search` (`city`, `state`, `country`),
    INDEX `idx_places_created_by` (`created_by`),
    SPATIAL INDEX `idx_places_spatial_location` (`location`),
    
    CONSTRAINT `fk_places_category` FOREIGN KEY (`category_id`) 
        REFERENCES `categories` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_places_created_by` FOREIGN KEY (`created_by`) 
        REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Central tourist place directory';

-- =============================================================================
-- 4.5 place_timings
-- Weekly opening hours per place (Admin-managed).
-- =============================================================================
CREATE TABLE `place_timings` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT COMMENT 'Internal surrogate primary key',
    `place_id` BIGINT UNSIGNED NOT NULL COMMENT 'FK referencing places.id',
    `day_of_week` TINYINT NOT NULL COMMENT 'Day of week: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat',
    `opens_at` TIME DEFAULT NULL COMMENT 'Daily opening time',
    `closes_at` TIME DEFAULT NULL COMMENT 'Daily closing time',
    `is_closed` BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Flag indicating if place is closed all day',
    
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_place_timings_day` (`place_id`, `day_of_week`),
    INDEX `idx_place_timings_place_id` (`place_id`),
    CONSTRAINT `chk_place_timings_day` CHECK (`day_of_week` BETWEEN 0 AND 6),
    CONSTRAINT `fk_place_timings_place` FOREIGN KEY (`place_id`) 
        REFERENCES `places` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Weekly opening hours per place';

-- =============================================================================
-- 4.6 place_images
-- Gallery images from all sources (Wikimedia, Bing, Admin, Users).
-- =============================================================================
CREATE TABLE `place_images` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT COMMENT 'Internal surrogate primary key',
    `place_id` BIGINT UNSIGNED NOT NULL COMMENT 'FK referencing places.id',
    `image_url` VARCHAR(500) NOT NULL COMMENT 'Full resolution image URL',
    `thumbnail_url` VARCHAR(500) DEFAULT NULL COMMENT 'Optimized thumbnail image URL',
    `source` ENUM('wikimedia', 'bing', 'admin', 'user') NOT NULL DEFAULT 'admin' COMMENT 'Image provenance source',
    `uploaded_by` BIGINT UNSIGNED DEFAULT NULL COMMENT 'FK referencing users.id (NULL for automated scrapers)',
    `is_cover` BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Primary cover image flag for place gallery',
    `sort_order` INT NOT NULL DEFAULT 0 COMMENT 'Display sorting index',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
    
    PRIMARY KEY (`id`),
    INDEX `idx_place_images_place_id` (`place_id`),
    INDEX `idx_place_images_uploaded_by` (`uploaded_by`),
    INDEX `idx_place_images_place_cover` (`place_id`, `is_cover`),
    CONSTRAINT `fk_place_images_place` FOREIGN KEY (`place_id`) 
        REFERENCES `places` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_place_images_user` FOREIGN KEY (`uploaded_by`) 
        REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Place photo gallery items and media references';

-- =============================================================================
-- 4.7 reviews
-- User ratings and comments per place.
-- =============================================================================
CREATE TABLE `reviews` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT COMMENT 'Internal surrogate primary key',
    `uuid` CHAR(36) NOT NULL COMMENT 'Public identifier used in API responses',
    `place_id` BIGINT UNSIGNED NOT NULL COMMENT 'FK referencing places.id',
    `user_id` BIGINT UNSIGNED NOT NULL COMMENT 'FK referencing users.id',
    `rating` TINYINT NOT NULL COMMENT 'Numerical star rating (1 to 5)',
    `comment` TEXT DEFAULT NULL COMMENT 'User written review content',
    `status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending' COMMENT 'Moderation workflow status',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Record update timestamp',
    
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_reviews_uuid` (`uuid`),
    UNIQUE KEY `uk_reviews_user_place` (`user_id`, `place_id`),
    INDEX `idx_reviews_place_status` (`place_id`, `status`),
    INDEX `idx_reviews_user_id` (`user_id`),
    CONSTRAINT `chk_reviews_rating` CHECK (`rating` BETWEEN 1 AND 5),
    CONSTRAINT `fk_reviews_place` FOREIGN KEY (`place_id`) 
        REFERENCES `places` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_reviews_user` FOREIGN KEY (`user_id`) 
        REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='User place reviews and rating scores';

-- =============================================================================
-- 4.8 review_images
-- Optional photos attached to user reviews.
-- =============================================================================
CREATE TABLE `review_images` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT COMMENT 'Internal surrogate primary key',
    `review_id` BIGINT UNSIGNED NOT NULL COMMENT 'FK referencing reviews.id',
    `image_url` VARCHAR(500) NOT NULL COMMENT 'URL of image uploaded with review',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
    
    PRIMARY KEY (`id`),
    INDEX `idx_review_images_review_id` (`review_id`),
    CONSTRAINT `fk_review_images_review` FOREIGN KEY (`review_id`) 
        REFERENCES `reviews` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Images attached to user place reviews';

-- =============================================================================
-- 4.9 favorites
-- User-saved places (bookmarking).
-- =============================================================================
CREATE TABLE `favorites` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT COMMENT 'Internal surrogate primary key',
    `user_id` BIGINT UNSIGNED NOT NULL COMMENT 'FK referencing users.id',
    `place_id` BIGINT UNSIGNED NOT NULL COMMENT 'FK referencing places.id',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Bookmark timestamp',
    
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_favorites_user_place` (`user_id`, `place_id`),
    INDEX `idx_favorites_user_id` (`user_id`),
    INDEX `idx_favorites_place_id` (`place_id`),
    CONSTRAINT `fk_favorites_user` FOREIGN KEY (`user_id`) 
        REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_favorites_place` FOREIGN KEY (`place_id`) 
        REFERENCES `places` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='User bookmarked/favorite places';

-- =============================================================================
-- 4.10 osm_sync_logs
-- Audit trail for OpenStreetMap import jobs (never on-request).
-- =============================================================================
CREATE TABLE `osm_sync_logs` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT COMMENT 'Internal surrogate primary key',
    `sync_type` VARCHAR(50) NOT NULL COMMENT 'Type of synchronization job (e.g. overpass_import)',
    `region` VARCHAR(150) DEFAULT NULL COMMENT 'Bounding box or geographic region name',
    `status` ENUM('running', 'success', 'failed') NOT NULL DEFAULT 'running' COMMENT 'Execution status',
    `total_fetched` INT NOT NULL DEFAULT 0 COMMENT 'Total entities fetched from OSM API',
    `total_imported` INT NOT NULL DEFAULT 0 COMMENT 'Total new places inserted into database',
    `total_skipped` INT NOT NULL DEFAULT 0 COMMENT 'Total duplicate or invalid entities skipped',
    `started_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Job start timestamp',
    `finished_at` DATETIME DEFAULT NULL COMMENT 'Job completion timestamp',
    `error_message` TEXT DEFAULT NULL COMMENT 'Detailed error stack trace if failed',
    
    PRIMARY KEY (`id`),
    INDEX `idx_osm_sync_status` (`status`),
    INDEX `idx_osm_sync_started_at` (`started_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Audit logs for OpenStreetMap data ingestion jobs';

-- =============================================================================
-- 4.11 content_sync_logs
-- Audit trail for Wikipedia + image enrichment jobs per place.
-- =============================================================================
CREATE TABLE `content_sync_logs` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT COMMENT 'Internal surrogate primary key',
    `place_id` BIGINT UNSIGNED NOT NULL COMMENT 'FK referencing places.id',
    `sync_type` ENUM('wikipedia', 'wikimedia_image', 'bing_image') NOT NULL COMMENT 'Enrichment provider type',
    `status` ENUM('success', 'failed') NOT NULL COMMENT 'Sync result status',
    `message` TEXT DEFAULT NULL COMMENT 'Summary message or error log details',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Sync execution timestamp',
    
    PRIMARY KEY (`id`),
    INDEX `idx_content_sync_place_id` (`place_id`),
    INDEX `idx_content_sync_type_status` (`sync_type`, `status`),
    CONSTRAINT `fk_content_sync_place` FOREIGN KEY (`place_id`) 
        REFERENCES `places` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Enrichment sync logs for Wikipedia descriptions and media APIs';

-- =============================================================================
-- 4.12 routing_cache
-- Caches routing-provider responses to avoid repeat external calls.
-- =============================================================================
CREATE TABLE `routing_cache` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT COMMENT 'Internal surrogate primary key',
    `origin_lat` DECIMAL(10,7) NOT NULL COMMENT 'Origin waypoint latitude',
    `origin_lng` DECIMAL(10,7) NOT NULL COMMENT 'Origin waypoint longitude',
    `dest_lat` DECIMAL(10,7) NOT NULL COMMENT 'Destination waypoint latitude',
    `dest_lng` DECIMAL(10,7) NOT NULL COMMENT 'Destination waypoint longitude',
    `provider` VARCHAR(30) NOT NULL COMMENT 'Routing engine provider (osrm, graphhopper, valhalla)',
    `distance_meters` INT NOT NULL COMMENT 'Calculated travel distance in meters',
    `duration_seconds` INT NOT NULL COMMENT 'Calculated travel time in seconds',
    `geometry_json` LONGTEXT DEFAULT NULL COMMENT 'Encoded polyline / GeoJSON route coordinates',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Cache entry creation timestamp',
    `expires_at` DATETIME NOT NULL COMMENT 'TTL cache expiration timestamp',
    
    PRIMARY KEY (`id`),
    INDEX `idx_routing_cache_lookup` (`origin_lat`, `origin_lng`, `dest_lat`, `dest_lng`, `provider`),
    INDEX `idx_routing_cache_expires` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Cached responses from external routing engines';

-- =============================================================================
-- 4.13 admin_activity_logs
-- Tracks every admin write action for accountability.
-- =============================================================================
CREATE TABLE `admin_activity_logs` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT COMMENT 'Internal surrogate primary key',
    `admin_id` BIGINT UNSIGNED NOT NULL COMMENT 'FK referencing users.id of performing admin',
    `action` VARCHAR(100) NOT NULL COMMENT 'Action identifier (e.g. place.create, review.approve)',
    `entity_type` VARCHAR(50) NOT NULL COMMENT 'Target entity class (e.g. places, reviews, users)',
    `entity_id` BIGINT UNSIGNED DEFAULT NULL COMMENT 'Surrogate ID of target entity',
    `meta_json` JSON DEFAULT NULL COMMENT 'JSON payload capturing diff or contextual metadata',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Log entry timestamp',
    
    PRIMARY KEY (`id`),
    INDEX `idx_admin_activity_admin_id` (`admin_id`),
    INDEX `idx_admin_activity_action` (`action`),
    INDEX `idx_admin_activity_entity` (`entity_type`, `entity_id`),
    INDEX `idx_admin_activity_created_at` (`created_at`),
    CONSTRAINT `fk_admin_activity_admin` FOREIGN KEY (`admin_id`) 
        REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Audit log for administrative write operations';


-- =============================================================================
-- DATABASE TRIGGERS FOR AUTOMATED DATA MAINTENANCE
-- =============================================================================

DELIMITER //

-- -----------------------------------------------------------------------------
-- 1. Auto-generate UUID for users if not provided on insert
-- -----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS `trg_users_before_insert` //
CREATE TRIGGER `trg_users_before_insert`
BEFORE INSERT ON `users`
FOR EACH ROW
BEGIN
    IF NEW.uuid IS NULL OR NEW.uuid = '' THEN
        SET NEW.uuid = (UUID());
    END IF;
END //

-- -----------------------------------------------------------------------------
-- 2. Auto-generate UUID and Spatial POINT location for places
-- -----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS `trg_places_before_insert` //
CREATE TRIGGER `trg_places_before_insert`
BEFORE INSERT ON `places`
FOR EACH ROW
BEGIN
    IF NEW.uuid IS NULL OR NEW.uuid = '' THEN
        SET NEW.uuid = (UUID());
    END IF;
    IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
        SET NEW.location = ST_SRID(POINT(NEW.longitude, NEW.latitude), 4326);
    END IF;
END //

DROP TRIGGER IF EXISTS `trg_places_before_update` //
CREATE TRIGGER `trg_places_before_update`
BEFORE UPDATE ON `places`
FOR EACH ROW
BEGIN
    IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
        SET NEW.location = ST_SRID(POINT(NEW.longitude, NEW.latitude), 4326);
    END IF;
END //

-- -----------------------------------------------------------------------------
-- 3. Auto-generate UUID for reviews if not provided on insert
-- -----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS `trg_reviews_before_insert` //
CREATE TRIGGER `trg_reviews_before_insert`
BEFORE INSERT ON `reviews`
FOR EACH ROW
BEGIN
    IF NEW.uuid IS NULL OR NEW.uuid = '' THEN
        SET NEW.uuid = (UUID());
    END IF;
END //

-- -----------------------------------------------------------------------------
-- 4. Automatically maintain places.total_favorites counter
-- -----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS `trg_favorites_after_insert` //
CREATE TRIGGER `trg_favorites_after_insert`
AFTER INSERT ON `favorites`
FOR EACH ROW
BEGIN
    UPDATE `places`
    SET `total_favorites` = `total_favorites` + 1
    WHERE `id` = NEW.place_id;
END //

DROP TRIGGER IF EXISTS `trg_favorites_after_delete` //
CREATE TRIGGER `trg_favorites_after_delete`
AFTER DELETE ON `favorites`
FOR EACH ROW
BEGIN
    UPDATE `places`
    SET `total_favorites` = GREATEST(0, `total_favorites` - 1)
    WHERE `id` = OLD.place_id;
END //

-- -----------------------------------------------------------------------------
-- 5. Automatically maintain places.total_reviews and places.avg_rating
--    (Considers only moderation-approved reviews with status = 'approved')
-- -----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS `trg_reviews_after_insert` //
CREATE TRIGGER `trg_reviews_after_insert`
AFTER INSERT ON `reviews`
FOR EACH ROW
BEGIN
    IF NEW.status = 'approved' THEN
        UPDATE `places`
        SET 
            `total_reviews` = (
                SELECT COUNT(*) FROM `reviews` 
                WHERE `place_id` = NEW.place_id AND `status` = 'approved'
            ),
            `avg_rating` = COALESCE((
                SELECT AVG(`rating`) FROM `reviews` 
                WHERE `place_id` = NEW.place_id AND `status` = 'approved'
            ), 0.00)
        WHERE `id` = NEW.place_id;
    END IF;
END //

DROP TRIGGER IF EXISTS `trg_reviews_after_update` //
CREATE TRIGGER `trg_reviews_after_update`
AFTER UPDATE ON `reviews`
FOR EACH ROW
BEGIN
    IF NEW.place_id != OLD.place_id THEN
        -- Recalculate rating and review counters for old place
        UPDATE `places`
        SET 
            `total_reviews` = (
                SELECT COUNT(*) FROM `reviews` 
                WHERE `place_id` = OLD.place_id AND `status` = 'approved'
            ),
            `avg_rating` = COALESCE((
                SELECT AVG(`rating`) FROM `reviews` 
                WHERE `place_id` = OLD.place_id AND `status` = 'approved'
            ), 0.00)
        WHERE `id` = OLD.place_id;

        -- Recalculate rating and review counters for new place
        UPDATE `places`
        SET 
            `total_reviews` = (
                SELECT COUNT(*) FROM `reviews` 
                WHERE `place_id` = NEW.place_id AND `status` = 'approved'
            ),
            `avg_rating` = COALESCE((
                SELECT AVG(`rating`) FROM `reviews` 
                WHERE `place_id` = NEW.place_id AND `status` = 'approved'
            ), 0.00)
        WHERE `id` = NEW.place_id;
    ELSEIF NEW.status != OLD.status OR NEW.rating != OLD.rating THEN
        UPDATE `places`
        SET 
            `total_reviews` = (
                SELECT COUNT(*) FROM `reviews` 
                WHERE `place_id` = NEW.place_id AND `status` = 'approved'
            ),
            `avg_rating` = COALESCE((
                SELECT AVG(`rating`) FROM `reviews` 
                WHERE `place_id` = NEW.place_id AND `status` = 'approved'
            ), 0.00)
        WHERE `id` = NEW.place_id;
    END IF;
END //

DROP TRIGGER IF EXISTS `trg_reviews_after_delete` //
CREATE TRIGGER `trg_reviews_after_delete`
AFTER DELETE ON `reviews`
FOR EACH ROW
BEGIN
    IF OLD.status = 'approved' THEN
        UPDATE `places`
        SET 
            `total_reviews` = (
                SELECT COUNT(*) FROM `reviews` 
                WHERE `place_id` = OLD.place_id AND `status` = 'approved'
            ),
            `avg_rating` = COALESCE((
                SELECT AVG(`rating`) FROM `reviews` 
                WHERE `place_id` = OLD.place_id AND `status` = 'approved'
            ), 0.00)
        WHERE `id` = OLD.place_id;
    END IF;
END //

DELIMITER ;

SET FOREIGN_KEY_CHECKS = 1;
