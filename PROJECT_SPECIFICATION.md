# TÀI LIỆU ĐẶC TẢ YÊU CẦU & THIẾT KẾ HỆ THỐNG
## PHẦN MỀM QUẢN LÝ & TRÌNH CHIẾU MÀN HÌNH LED / DIGITAL SIGNAGE
*(Hệ thống tương đương Alo360 & Aloloader)*

---

### I. TỔNG QUAN DỰ ÁN
Dự án nhằm xây dựng một hệ sinh thái phần mềm quản lý và trình chiếu nội dung tập trung qua mạng Internet/Mạng nội bộ cho hệ thống màn hình LED, Kiosk quảng cáo, Smart TV và bảng thông tin điện tử, giải quyết các bài toán:
- Thay thế việc cắm USB thủ công vào từng màn hình LED.
- Quản lý từ xa hàng chục đến hàng nghìn màn hình LED / TV rải rác ở các chi nhánh/địa điểm.
- Chia màn hình thành nhiều khu vực hiển thị (Multi-Zone/Split Screen) phục vụ đồng thời: Video quảng cáo, hình ảnh sản phẩm, đồng hồ, tin tức dạng chữ chạy chân trang (Ticker).
- Lập lịch phát sóng thông minh theo ngày/giờ, phát sóng khẩn cấp và giám sát trực tiếp thiết bị đang phát gì (Remote Screenshot).

---

### II. KIẾN TRÚC HỆ THỐNG (SYSTEM ARCHITECTURE)

Hệ thống bao gồm 3 phân vùng chính:

#### 1. Cloud Web CMS (Cổng Quản Trị Trung Tâm)
- **Công nghệ**: Next.js 14 / React, TailwindCSS, Fabric.js (Canvas editor).
- **Chức năng chính**:
  - Xác thực người dùng đa cấp (Super Admin, Branch Manager, Content Creator).
  - Quản lý thiết bị: Danh sách màn hình, nhóm màn hình, vị trí địa lý, tình trạng Online/Offline.
  - Quản lý Media: Upload và lưu trữ Video, Ảnh, Âm thanh, Luồng trực tiếp (Live Stream RTSP/HLS).
  - Trình thiết kế Bố cục (Layout Builder): Kéo thả trực quan chia vùng màn hình với kích thước bất kỳ (kể cả tỷ lệ đặc thù của LED ma trận/cabin LED).
  - Lập lịch phát sóng (Scheduler): Lập lịch lặp lại, phát theo khung giờ, phát theo ngày hoặc phát ưu tiên đè lịch.
  - Báo cáo phát sóng (Proof of Play): Thống kê số lần, thời lượng phát của từng nội dung quảng cáo.

#### 2. Realtime Gateway & Backend API
- **Công nghệ**: Node.js (NestJS) hoặc Python (FastAPI) + MQTT Broker (EMQX / Mosquitto) + WebSocket.
- **Chức năng**:
  - Giao tiếp hai chiều với các Player qua giao thức MQTT nhẹ và ổn định.
  - Nhận Heartbeat (nhịp tim 30 giây) để phát hiện màn hình rớt mạng.
  - Gửi lệnh điều khiển tức thì: Chụp màn hình (Screenshot), Bật/Tắt màn hình, Khởi động lại (Reboot), Tăng giảm âm lượng, Đẩy nội dung phát khẩn cấp.

#### 3. Client Player (Ứng Dụng Phát Trình Chiếu Đầu Cuối)
- **Nền tảng hỗ trợ**:
  - **Android TV / Android LED Box** (như NovaStar Taurus TB30/TB40/TB60, Huidu, Colorlight, TV thông minh): Ứng dụng APK chuyên dụng (tương tự `AloloaderTV` / `AloloaderTablet`).
  - **Windows / Mini PC Player**: Ứng dụng chạy trên máy tính Windows điều khiển card phát LED lớn (tương thích NovaLCT, LEDStudio).
- **Nguyên lý hoạt động Ngoại tuyến (Offline-First)**:
  - Tự động tải trước toàn bộ media về ổ cứng/bộ nhớ máy trước khi đến giờ phát.
  - Khi mất kết nối Internet, chương trình vẫn chạy liên tục mượt mà, không bị màn hình đen.
  - Tự động khởi động cùng hệ thống khi cắm nguồn điện (Auto-start on boot).

---

### III. BẢNG SO SÁNH TÍNH NĂNG VỚI ALO360 / ALOLOADER

| Tính năng | Alo360 / Aloloader | Hệ thống Đề xuất Nâng Cấp |
| :--- | :--- | :--- |
| **Giao diện quản trị (Web CMS)** | Giao diện kiểu truyền thống (ASP.NET/Bootstrap cũ) | Giao diện hiện đại Next.js/React, tối ưu trải nghiệm kéo thả mượt mà |
| **Chia khung màn hình (Layout)** | Chia theo mẫu cố định có sẵn | Tự do vẽ và chia khung tùy ý theo tọa độ pixel (Canvas kéo thả) |
| **Độ phân giải hỗ trợ** | Chủ yếu màn hình tỷ lệ 16:9, 9:16 | Hỗ trợ mọi độ phân giải tùy biến của LED (ví dụ: 1920x384, 768x288...) |
| **Cơ chế kết nối màn hình** | Cấu hình IP/tài khoản thủ công | Quét mã QR / Nhập mã 6 chữ số (Pairing Code) |
| **Giám sát thời gian thực** | Chỉ xem trạng thái ping Online/Offline | Xem ảnh chụp màn hình trực tiếp từ xa (Remote Live Screenshot) |
| **Hoạt động khi mất mạng** | Có hỗ trợ cache | Lưu cache hoàn toàn, tự đồng bộ nhật ký phát sóng khi có mạng lại |
| **Widget động** | Giới hạn chữ chạy | Hỗ trợ Thời tiết động, Đồng hồ, Tỉ giá, Tin RSS, Đếm ngược, Luồng Camera |

---

### IV. KẾ HOẠCH BẮT ĐẦU TRIỂN KHAI

Để triển khai dự án này, hệ thống sẽ được xây dựng theo các bước:
1. **Bước 1**: Khởi tạo cấu trúc dự án (Full-stack Web CMS + Backend Gateway + Web Player mô phỏng để test ngay trên trình duyệt).
2. **Bước 2**: Hoàn thiện tính năng Quản lý Màn hình, Ghép nối thiết bị (Pairing Code) và Thư viện Media.
3. **Bước 3**: Xây dựng Trình biên tập bố cục (Visual Canvas Editor) và Bộ lập lịch phát sóng.
4. **Bước 4**: Xây dựng ứng dụng Player (Player Web/Electron cho Windows và mã nguồn Android APK cho TV Box/LED Controller).
