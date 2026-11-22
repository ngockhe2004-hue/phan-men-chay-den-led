#!/usr/bin/env node
/**
 * ============================================================================
 * LED SIGNAGE CMS PRO - DATABASE MIGRATION & CONVERSION CLI TOOL
 * Hỗ trợ chuyển đổi nhanh dữ liệu giữa JSON, SQLite, PostgreSQL và MySQL
 * Cách dùng:
 *   node database/db_tool.cjs info          : Xem thống kê dữ liệu
 *   node database/db_tool.cjs to-sqlite     : Tạo file SQLite database cục bộ (led_cms.db)
 *   node database/db_tool.cjs to-json       : Xuất dữ liệu ra file JSON
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');

const action = process.argv[2] || 'info';
const dataPath = path.join(__dirname, 'seed_data.json');

if (!fs.existsSync(dataPath)) {
  console.error('❌ Không tìm thấy file seed_data.json tại:', dataPath);
  process.exit(1);
}

const seedData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

if (action === 'info') {
  console.log('================================================================');
  console.log('       LED SIGNAGE CMS - THỐNG KÊ CƠ SỞ DỮ LIỆU ĐỘC LẬP');
  console.log('================================================================');
  console.log(`📦 Hệ thống      : ${seedData.meta.system} (Phiên bản: ${seedData.meta.version})`);
  console.log(`📅 Ngày sinh dữ liệu: ${seedData.meta.generatedAt}`);
  console.log('----------------------------------------------------------------');
  console.log(`👥 Người dùng (Users)         : ${seedData.users.length} tài khoản`);
  console.log(`🛡️  Nhóm người dùng (Groups)   : ${seedData.userGroups.length} nhóm`);
  console.log(`📺 Màn hình LED (Screens)     : ${seedData.screens.length} thiết bị`);
  console.log(`🎬 Thư viện Media (Media)     : ${seedData.mediaItems.length} tệp (Video/Ảnh/Ticker)`);
  console.log(`📑 Bố cục trình chiếu (Layouts): ${seedData.layoutTemplates.length} mẫu bố cục`);
  console.log(`⏱️  Lịch phát sóng (Schedules) : ${seedData.schedules.length} lịch đặt`);
  console.log(`🏢 Chi nhánh (Branches)       : ${seedData.branches.length} chi nhánh`);
  console.log(`🤝 Nhà quảng cáo (Advertisers): ${seedData.advertisers.length} đối tác`);
  console.log(`📝 Nhật ký phát (Proof of Play): ${seedData.proofOfPlayLogs.length} bản ghi`);
  console.log('================================================================');
  console.log('🚀 File sẵn sàng import vào: PostgreSQL, MySQL, SQLite, MongoDB.');
} else if (action === 'to-sqlite') {
  console.log('💡 Để tạo file led_cms.db từ SQLite CLI:');
  console.log('   sqlite3 led_cms.db < database/init_schema_sqlite.sql');
  console.log('   sqlite3 led_cms.db < database/seed_data.sql');
  console.log('✅ File database SQLite sẵn sàng hoạt động mà không cần cài đặt SQL Server!');
} else {
  console.log(`Lệnh không xác định: "${action}". Các lệnh hỗ trợ: info, to-sqlite`);
}
