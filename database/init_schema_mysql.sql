-- ============================================================================
-- LED SIGNAGE CMS PRO - MYSQL / MARIADB DATABASE SCHEMA (v2.5.0)
-- Tương thích: MySQL 5.7+, MySQL 8.0+, MariaDB 10.3+, phpMyAdmin, XAMPP, AWS RDS
-- ============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. BẢNG PHÂN QUYỀN & NGƯỜI DÙNG (Users)
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
    `id` VARCHAR(64) NOT NULL,
    `username` VARCHAR(64) NOT NULL,
    `email` VARCHAR(128) NOT NULL,
    `name` VARCHAR(128) NOT NULL,
    `role` VARCHAR(32) NOT NULL DEFAULT 'OPERATOR',
    `group_id` VARCHAR(64) DEFAULT NULL,
    `status` VARCHAR(32) NOT NULL DEFAULT 'active',
    `avatar` TEXT DEFAULT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `last_login` DATETIME DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_users_username` (`username`),
    UNIQUE KEY `uk_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. BẢNG NHÓM NGƯỜI DÙNG (User Groups)
DROP TABLE IF EXISTS `user_groups`;
CREATE TABLE `user_groups` (
    `id` VARCHAR(64) NOT NULL,
    `name` VARCHAR(128) NOT NULL,
    `description` TEXT DEFAULT NULL,
    `permissions` JSON NOT NULL,
    `is_system` TINYINT(1) DEFAULT 0,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. BẢNG CHI NHÁNH & ĐỊA ĐIỂM (Branches)
DROP TABLE IF EXISTS `branches`;
CREATE TABLE `branches` (
    `id` VARCHAR(64) NOT NULL,
    `code` VARCHAR(32) NOT NULL,
    `name` VARCHAR(128) NOT NULL,
    `region` VARCHAR(64) NOT NULL,
    `address` TEXT DEFAULT NULL,
    `manager_name` VARCHAR(128) DEFAULT NULL,
    `phone` VARCHAR(32) DEFAULT NULL,
    `email` VARCHAR(128) DEFAULT NULL,
    `screen_count` INT DEFAULT 0,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_branches_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. BẢNG KHÁCH HÀNG & NHÀ QUẢNG CÁO (Advertisers)
DROP TABLE IF EXISTS `advertisers`;
CREATE TABLE `advertisers` (
    `id` VARCHAR(64) NOT NULL,
    `name` VARCHAR(128) NOT NULL,
    `company_name` VARCHAR(256) DEFAULT NULL,
    `tax_code` VARCHAR(32) DEFAULT NULL,
    `contact_person` VARCHAR(128) DEFAULT NULL,
    `phone` VARCHAR(32) DEFAULT NULL,
    `email` VARCHAR(128) DEFAULT NULL,
    `address` TEXT DEFAULT NULL,
    `status` VARCHAR(32) DEFAULT 'active',
    `assigned_screens` JSON DEFAULT NULL,
    `contracts` JSON DEFAULT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. BẢNG BỐ CỤC TRÌNH CHIẾU (Layout Templates)
DROP TABLE IF EXISTS `layout_templates`;
CREATE TABLE `layout_templates` (
    `id` VARCHAR(64) NOT NULL,
    `name` VARCHAR(128) NOT NULL,
    `description` TEXT DEFAULT NULL,
    `width` INT NOT NULL DEFAULT 1920,
    `height` INT NOT NULL DEFAULT 1080,
    `zones` JSON NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. BẢNG THIẾT BỊ MÀN HÌNH LED (Screens)
DROP TABLE IF EXISTS `screens`;
CREATE TABLE `screens` (
    `id` VARCHAR(64) NOT NULL,
    `code` VARCHAR(32) NOT NULL,
    `name` VARCHAR(128) NOT NULL,
    `resolution_width` INT NOT NULL DEFAULT 1920,
    `resolution_height` INT NOT NULL DEFAULT 1080,
    `orientation` VARCHAR(16) NOT NULL DEFAULT 'landscape',
    `location` TEXT DEFAULT NULL,
    `group` VARCHAR(64) DEFAULT 'Chung',
    `branch` VARCHAR(128) DEFAULT NULL,
    `device_type` VARCHAR(128) DEFAULT NULL,
    `coordinates` JSON DEFAULT NULL,
    `status` VARCHAR(32) NOT NULL DEFAULT 'online',
    `last_ping` VARCHAR(64) DEFAULT NULL,
    `ip_address` VARCHAR(45) DEFAULT NULL,
    `current_layout_id` VARCHAR(64) DEFAULT NULL,
    `volume` INT DEFAULT 80,
    `is_muted` TINYINT(1) DEFAULT 0,
    `power_state` VARCHAR(16) DEFAULT 'on',
    `screenshot_url` TEXT DEFAULT NULL,
    `image_scale_mode` VARCHAR(32) DEFAULT 'fit_device',
    `app_version` VARCHAR(32) DEFAULT 'v2.4.12',
    `device_model` VARCHAR(128) DEFAULT NULL,
    `storage_used` DECIMAL(8, 2) DEFAULT 0,
    `storage_total` DECIMAL(8, 2) DEFAULT 32,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_screens_code` (`code`),
    INDEX `idx_screens_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. BẢNG THƯ VIỆN ĐA PHƯƠNG TIỆN (Media Items)
DROP TABLE IF EXISTS `media_items`;
CREATE TABLE `media_items` (
    `id` VARCHAR(64) NOT NULL,
    `title` VARCHAR(256) NOT NULL,
    `type` VARCHAR(32) NOT NULL,
    `url` TEXT NOT NULL,
    `thumbnail` TEXT DEFAULT NULL,
    `duration` INT DEFAULT 15,
    `size` VARCHAR(32) DEFAULT NULL,
    `resolution` VARCHAR(64) DEFAULT NULL,
    `uploaded_at` VARCHAR(64) DEFAULT NULL,
    `tags` JSON DEFAULT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_media_type` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. BẢNG LỊCH PHÁT SÓNG (Schedules)
DROP TABLE IF EXISTS `schedules`;
CREATE TABLE `schedules` (
    `id` VARCHAR(64) NOT NULL,
    `name` VARCHAR(128) NOT NULL,
    `screen_ids` JSON NOT NULL,
    `layout_id` VARCHAR(64) NOT NULL,
    `priority` VARCHAR(32) DEFAULT 'normal',
    `repeat_type` VARCHAR(32) DEFAULT 'daily',
    `start_date` VARCHAR(32) DEFAULT NULL,
    `end_date` VARCHAR(32) DEFAULT NULL,
    `start_time` VARCHAR(16) DEFAULT NULL,
    `end_time` VARCHAR(16) DEFAULT NULL,
    `days_of_week` JSON DEFAULT NULL,
    `is_active` TINYINT(1) DEFAULT 1,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. BẢNG NHẬT KÝ PHÁT SÓNG (Proof of Play Logs)
DROP TABLE IF EXISTS `proof_of_play_logs`;
CREATE TABLE `proof_of_play_logs` (
    `id` VARCHAR(64) NOT NULL,
    `screen_id` VARCHAR(64) NOT NULL,
    `screen_name` VARCHAR(128) DEFAULT NULL,
    `media_id` VARCHAR(64) NOT NULL,
    `media_title` VARCHAR(256) DEFAULT NULL,
    `played_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `duration_seconds` INT NOT NULL DEFAULT 0,
    `status` VARCHAR(32) DEFAULT 'completed',
    PRIMARY KEY (`id`),
    INDEX `idx_logs_screen` (`screen_id`),
    INDEX `idx_logs_played_at` (`played_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. BẢNG NHẬT KÝ THAO TÁC HỆ THỐNG (Audit Logs)
DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs` (
    `id` VARCHAR(64) NOT NULL,
    `timestamp` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `user_id` VARCHAR(64) DEFAULT NULL,
    `user_name` VARCHAR(128) DEFAULT NULL,
    `action` VARCHAR(64) NOT NULL,
    `entity` VARCHAR(64) NOT NULL,
    `entity_name` VARCHAR(256) DEFAULT NULL,
    `details` TEXT DEFAULT NULL,
    `ip_address` VARCHAR(45) DEFAULT NULL,
    PRIMARY KEY (`id`),
    INDEX `idx_audit_user` (`user_id`),
    INDEX `idx_audit_timestamp` (`timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
