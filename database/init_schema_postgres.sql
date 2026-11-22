-- ============================================================================
-- LED SIGNAGE CMS PRO - POSTGRESQL DATABASE SCHEMA (v2.5.0)
-- Tương thích: PostgreSQL 12+, Supabase, Neon, AWS RDS, Docker
-- ============================================================================

-- Kích hoạt extension hỗ trợ sinh UUID/CUID nếu cần
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. BẢNG PHÂN QUYỀN & NGƯỜI DÙNG (Users & Roles)
DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users (
    id VARCHAR(64) PRIMARY KEY,
    username VARCHAR(64) UNIQUE NOT NULL,
    email VARCHAR(128) UNIQUE NOT NULL,
    name VARCHAR(128) NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'OPERATOR',
    group_id VARCHAR(64),
    status VARCHAR(32) NOT NULL DEFAULT 'active',
    avatar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

-- 2. BẢNG NHÓM NGƯỜI DÙNG (User Groups)
DROP TABLE IF EXISTS user_groups CASCADE;
CREATE TABLE user_groups (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    description TEXT,
    permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. BẢNG CHI NHÁNH & ĐỊA ĐIỂM (Branches)
DROP TABLE IF EXISTS branches CASCADE;
CREATE TABLE branches (
    id VARCHAR(64) PRIMARY KEY,
    code VARCHAR(32) UNIQUE NOT NULL,
    name VARCHAR(128) NOT NULL,
    region VARCHAR(64) NOT NULL,
    address TEXT,
    manager_name VARCHAR(128),
    phone VARCHAR(32),
    email VARCHAR(128),
    screen_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. BẢNG KHÁCH HÀNG & NHÀ QUẢNG CÁO (Advertisers)
DROP TABLE IF EXISTS advertisers CASCADE;
CREATE TABLE advertisers (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    company_name VARCHAR(256),
    tax_code VARCHAR(32),
    contact_person VARCHAR(128),
    phone VARCHAR(32),
    email VARCHAR(128),
    address TEXT,
    status VARCHAR(32) DEFAULT 'active',
    assigned_screens JSONB DEFAULT '[]'::jsonb,
    contracts JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. BẢNG BỐ CỤC TRÌNH CHIẾU (Layout Templates)
DROP TABLE IF EXISTS layout_templates CASCADE;
CREATE TABLE layout_templates (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    description TEXT,
    width INT NOT NULL DEFAULT 1920,
    height INT NOT NULL DEFAULT 1080,
    zones JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. BẢNG THIẾT BỊ MÀN HÌNH LED (Screens)
DROP TABLE IF EXISTS screens CASCADE;
CREATE TABLE screens (
    id VARCHAR(64) PRIMARY KEY,
    code VARCHAR(32) UNIQUE NOT NULL,
    name VARCHAR(128) NOT NULL,
    resolution_width INT NOT NULL DEFAULT 1920,
    resolution_height INT NOT NULL DEFAULT 1080,
    orientation VARCHAR(16) NOT NULL DEFAULT 'landscape',
    location TEXT,
    "group" VARCHAR(64) DEFAULT 'Chung',
    branch VARCHAR(128),
    device_type VARCHAR(128),
    coordinates JSONB,
    status VARCHAR(32) NOT NULL DEFAULT 'online',
    last_ping VARCHAR(64),
    ip_address VARCHAR(45),
    current_layout_id VARCHAR(64),
    volume INT DEFAULT 80,
    is_muted BOOLEAN DEFAULT FALSE,
    power_state VARCHAR(16) DEFAULT 'on',
    screenshot_url TEXT,
    image_scale_mode VARCHAR(32) DEFAULT 'fit_device',
    app_version VARCHAR(32) DEFAULT 'v2.4.12',
    device_model VARCHAR(128),
    storage_used NUMERIC(8, 2) DEFAULT 0,
    storage_total NUMERIC(8, 2) DEFAULT 32,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. BẢNG THƯ VIỆN ĐA PHƯƠNG TIỆN (Media Items)
DROP TABLE IF EXISTS media_items CASCADE;
CREATE TABLE media_items (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(256) NOT NULL,
    type VARCHAR(32) NOT NULL,
    url TEXT NOT NULL,
    thumbnail TEXT,
    duration INT DEFAULT 15,
    size VARCHAR(32),
    resolution VARCHAR(64),
    uploaded_at VARCHAR(64),
    tags JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. BẢNG LỊCH PHÁT SÓNG (Schedules)
DROP TABLE IF EXISTS schedules CASCADE;
CREATE TABLE schedules (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    screen_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    layout_id VARCHAR(64) NOT NULL,
    priority VARCHAR(32) DEFAULT 'normal',
    repeat_type VARCHAR(32) DEFAULT 'daily',
    start_date VARCHAR(32),
    end_date VARCHAR(32),
    start_time VARCHAR(16),
    end_time VARCHAR(16),
    days_of_week JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. BẢNG NHẬT KÝ PHÁT SÓNG (Proof of Play Logs)
DROP TABLE IF EXISTS proof_of_play_logs CASCADE;
CREATE TABLE proof_of_play_logs (
    id VARCHAR(64) PRIMARY KEY,
    screen_id VARCHAR(64) NOT NULL,
    screen_name VARCHAR(128),
    media_id VARCHAR(64) NOT NULL,
    media_title VARCHAR(256),
    played_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    duration_seconds INT NOT NULL DEFAULT 0,
    status VARCHAR(32) DEFAULT 'completed'
);

-- 10. BẢNG NHẬT KÝ THAO TÁC HỆ THỐNG (Audit Logs)
DROP TABLE IF EXISTS audit_logs CASCADE;
CREATE TABLE audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id VARCHAR(64),
    user_name VARCHAR(128),
    action VARCHAR(64) NOT NULL,
    entity VARCHAR(64) NOT NULL,
    entity_name VARCHAR(256),
    details TEXT,
    ip_address VARCHAR(45)
);

-- INDEXES NÂNG CAO TỐI ƯU TRUY VẤN
CREATE INDEX idx_screens_code ON screens(code);
CREATE INDEX idx_screens_status ON screens(status);
CREATE INDEX idx_media_type ON media_items(type);
CREATE INDEX idx_logs_screen ON proof_of_play_logs(screen_id);
CREATE INDEX idx_logs_played_at ON proof_of_play_logs(played_at);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp);
