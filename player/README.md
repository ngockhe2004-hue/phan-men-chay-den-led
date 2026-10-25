# LED Player — Standalone Web Player

## Luồng Đăng Nhập & Kích Hoạt Thiết Bị Mới

1. **Bước 1 — Đăng Nhập Tài Khoản & Mật Khẩu CMS:**
   - Mở `player/index.html` trong trình duyệt Chrome / Android TV Box.
   - Nhập **Địa chỉ Server CMS** (ví dụ: `http://localhost:5000` hoặc IP máy chủ).
   - Nhập **Tài khoản / Email** (ví dụ: `admin@led.vn`) và **Mật khẩu** (`admin123`).
   - Nhấn **"Đăng Nhập & Kích Hoạt Thiết Bị"** (Hoặc dùng nút **"Chế Độ Local"** nếu chạy chung máy).

2. **Bước 2 — Hiển Thị Mã Thiết Bị & Xác Nhận Đổi Tên:**
   - Sau khi đăng nhập thành công, Player tự tạo & hiển thị **Mã Thiết Bị Độc Bản** (Pairing Code, ví dụ: `LED-8829`) trên màn hình.
   - Hiển thị bảng **Xác Nhận Đăng Ký**: Cho phép đổi tên thiết bị (ví dụ: `Màn Hình LED Sảnh A`), chọn Nhóm Quản Lý và Vị Trí Cụ Thể.
   - Nhấn **"Xác Nhận Đăng Ký & Bắt Đầu Phát"** để ghi danh vào CMS và tự động phát nội dung!

---

### Cấu trúc Files

```
player/
├── index.html    — Giao diện Pairing Screen + Player Shell
├── player.js     — Logic engine: pairing, layout rendering, heartbeat, transitions
└── player.css    — Fullscreen styles, animations, kiosk UI
```

---

### Tính năng Giai đoạn 1

| Tính năng | Trạng thái |
|---|---|
| Màn hình Pairing (nhập code) | ✅ Hoàn thành |
| Phát video + ảnh slideshow | ✅ Hoàn thành |
| Multi-zone layout | ✅ Hoàn thành |
| Ticker text chạy ngang | ✅ Hoàn thành |
| Widget đồng hồ | ✅ Hoàn thành |
| Emergency override | ✅ Hoàn thành |
| Heartbeat ping (API mode) | ✅ Hoàn thành |
| Auto-poll cập nhật (10s) | ✅ Hoàn thành |
| Local Mode (same-machine) | ✅ Hoàn thành |
| Hiệu ứng chuyển cảnh (4 loại) | ✅ Hoàn thành |
| HUD status bar | ✅ Hoàn thành |
| Màn hình tắt / sleep state | ✅ Hoàn thành |
| Fit image / fit device scale mode | ✅ Hoàn thành |

### Backend API Endpoints (Giai đoạn 2)

Đã tạo PlayerModule tại `backend/src/player/`:

| Endpoint | Method | Mô tả |
|---|---|---|
| `/api/player/pair` | POST | Đăng ký thiết bị bằng pairing code |
| `/api/player/config/:code` | GET | Lấy layout + media của màn hình |
| `/api/player/heartbeat` | POST | Gửi nhịp tim online status |
| `/api/player/proof-of-play` | POST | Báo cáo đã phát xong 1 clip |

---

### Phím Tắt (Khi Player Đang Chạy)

| Phím | Hành động |
|---|---|
| `ESC` | Quay về màn hình Pairing |
| `H` | Ẩn/hiện HUD status bar |
| `1` | Hiệu ứng CrossFade |
| `2` | Hiệu ứng Slide Right |
| `3` | Hiệu ứng Slide Left |
| `4` | Hiệu ứng Ken Burns |

---

### Cài đặt trên Android TV Box (Giai đoạn 3 — Capacitor)

```bash
# Cài Capacitor
npm install @capacitor/core @capacitor/android

# Init và build
npx cap init "LED Player" "vn.ledplayer.app"
npx cap add android
npx cap copy
npx cap open android
# → Build APK trong Android Studio
```

---

*LED Player v1.0.0 — Xây dựng cho Digital Signage LED Controllers*
