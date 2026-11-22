-- ============================================================================
-- LED SIGNAGE CMS PRO - SQLITE DATABASE SCHEMA (v2.5.0)
-- Tương thích: SQLite 3+, Chạy Cục Bộ (Local File .db), Không Cần Cài Đặt Server
-- ============================================================================

PRAGMA foreign_keys = OFF;

-- 1. BẢNG USERS
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'OPERATOR',
    group_id TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    avatar TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    last_login TEXT
);

-- 2. BẢNG USER_GROUPS
DROP TABLE IF EXISTS user_groups;
CREATE TABLE user_groups (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    permissions TEXT NOT NULL DEFAULT '[]',
    is_system INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
);

-- 3. BẢNG BRANCHES
DROP TABLE IF EXISTS branches;
CREATE TABLE branches (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    region TEXT NOT NULL,
    address TEXT,
    manager_name TEXT,
    phone TEXT,
    email TEXT,
    screen_count INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
);

-- 4. BẢNG ADVERTISERS
DROP TABLE IF EXISTS advertisers;
CREATE TABLE advertisers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    company_name TEXT,
    tax_code TEXT,
    contact_person TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    status TEXT DEFAULT 'active',
    assigned_screens TEXT DEFAULT '[]',
    contracts TEXT DEFAULT '[]',
    created_at TEXT DEFAULT (datetime('now'))
);

-- 5. BẢNG LAYOUT_TEMPLATES
DROP TABLE IF EXISTS layout_templates;
CREATE TABLE layout_templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    width INTEGER NOT NULL DEFAULT 1920,
    height INTEGER NOT NULL DEFAULT 1080,
    zones TEXT NOT NULL DEFAULT '[]',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- 6. BẢNG SCREENS
DROP TABLE IF EXISTS screens;
CREATE TABLE screens (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    resolution_width INTEGER NOT NULL DEFAULT 1920,
    resolution_height INTEGER NOT NULL DEFAULT 1080,
    orientation TEXT NOT NULL DEFAULT 'landscape',
    location TEXT,
    "group" TEXT DEFAULT 'Chung',
    branch TEXT,
    device_type TEXT,
    coordinates TEXT,
    status TEXT NOT NULL DEFAULT 'online',
    last_ping TEXT,
    ip_address TEXT,
    current_layout_id TEXT,
    volume INTEGER DEFAULT 80,
    is_muted INTEGER DEFAULT 0,
    power_state TEXT DEFAULT 'on',
    screenshot_url TEXT,
    image_scale_mode TEXT DEFAULT 'fit_device',
    app_version TEXT DEFAULT 'v2.4.12',
    device_model TEXT,
    storage_used REAL DEFAULT 0,
    storage_total REAL DEFAULT 32,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- 7. BẢNG MEDIA_ITEMS
DROP TABLE IF EXISTS media_items;
CREATE TABLE media_items (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    url TEXT NOT NULL,
    thumbnail TEXT,
    duration INTEGER DEFAULT 15,
    size TEXT,
    resolution TEXT,
    uploaded_at TEXT,
    tags TEXT DEFAULT '[]',
    created_at TEXT DEFAULT (datetime('now'))
);

-- 8. BẢNG SCHEDULES
DROP TABLE IF EXISTS schedules;
CREATE TABLE schedules (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    screen_ids TEXT NOT NULL DEFAULT '[]',
    layout_id TEXT NOT NULL,
    priority TEXT DEFAULT 'normal',
    repeat_type TEXT DEFAULT 'daily',
    start_date TEXT,
    end_date TEXT,
    start_time TEXT,
    end_time TEXT,
    days_of_week TEXT DEFAULT '[]',
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
);

-- 9. BẢNG PROOF_OF_PLAY_LOGS
DROP TABLE IF EXISTS proof_of_play_logs;
CREATE TABLE proof_of_play_logs (
    id TEXT PRIMARY KEY,
    screen_id TEXT NOT NULL,
    screen_name TEXT,
    media_id TEXT NOT NULL,
    media_title TEXT,
    played_at TEXT DEFAULT (datetime('now')),
    duration_seconds INTEGER NOT NULL DEFAULT 0,
    status TEXT DEFAULT 'completed'
);

-- 10. BẢNG AUDIT_LOGS
DROP TABLE IF EXISTS audit_logs;
CREATE TABLE audit_logs (
    id TEXT PRIMARY KEY,
    timestamp TEXT DEFAULT (datetime('now')),
    user_id TEXT,
    user_name TEXT,
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    entity_name TEXT,
    details TEXT,
    ip_address TEXT
);

CREATE INDEX idx_screens_code ON screens(code);
CREATE INDEX idx_media_type ON media_items(type);
CREATE INDEX idx_logs_screen ON proof_of_play_logs(screen_id);

PRAGMA foreign_keys = ON;
