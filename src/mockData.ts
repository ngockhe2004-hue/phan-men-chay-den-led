import { 
  Screen, 
  MediaItem, 
  LayoutTemplate, 
  Schedule, 
  ProofOfPlayLog,
  UserPermission,
  UserGroup,
  UserAccount,
  AuditLogEntry,
  Branch,
  Advertiser,
  HardwareProfile
} from './types';

export const INITIAL_SCREENS: Screen[] = [
  {
    id: 'screen-1',
    name: 'Màn Hình LED Sảnh Chính - Tầng 1',
    code: 'LED-8821',
    resolution: { width: 1920, height: 1080 },
    orientation: 'landscape',
    location: 'Tòa nhà Landmark 81, Quận Bình Thạnh, TP.HCM',
    group: 'Sảnh Đón Tiếp',
    branch: 'Chi nhánh Miền Nam (TP.HCM)',
    deviceType: 'LED P2.5 Cabinet Nhôm Đúc',
    coordinates: { lat: 10.795, lng: 106.721, city: 'TP. Hồ Chí Minh', mapX: 52, mapY: 82 },
    status: 'online',
    lastPing: 'Vừa xong',
    ipAddress: '192.168.1.102',
    currentLayoutId: 'layout-1',
    volume: 75,
    isMuted: false,
    powerState: 'on',
    screenshotUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
    appVersion: 'v2.4.12-pro',
    deviceModel: 'NovaStar Taurus TB60 LED Controller',
    storageUsed: 18.4,
    storageTotal: 64.0,
    imageScaleMode: 'fit_device',
  },
  {
    id: 'screen-2',
    name: 'Màn Hình LED Mặt Tiền Ngoài Trời P3',
    code: 'LED-3390',
    resolution: { width: 2560, height: 1080 },
    orientation: 'landscape',
    location: 'Mặt tiền Đại lộ Nguyễn Huệ, Quận 1, TP.HCM',
    group: 'Quảng Cáo Ngoài Trời',
    branch: 'Chi nhánh Miền Nam (TP.HCM)',
    deviceType: 'LED P3 Outdoor Chống Nước IP65',
    coordinates: { lat: 10.774, lng: 106.703, city: 'TP. Hồ Chí Minh', mapX: 50, mapY: 84 },
    status: 'online',
    lastPing: '1 phút trước',
    ipAddress: '192.168.1.115',
    currentLayoutId: 'layout-4',
    volume: 0,
    isMuted: true,
    powerState: 'on',
    screenshotUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=800&q=80',
    appVersion: 'v2.4.12-pro',
    deviceModel: 'Colorlight X4e Master Box',
    storageUsed: 32.1,
    storageTotal: 128.0,
  },
  {
    id: 'screen-3',
    name: 'Màn Hình Ghép Hội Trường Lớn',
    code: 'LED-7712',
    resolution: { width: 3840, height: 2160 },
    orientation: 'landscape',
    location: 'Trung tâm Hội Nghị Quốc Gia, Nam Từ Liêm, Hà Nội',
    group: 'Hội Trường & Phòng Họp',
    branch: 'Chi nhánh Miền Bắc (Hà Nội)',
    deviceType: 'LED Ghép Video Wall P1.8 Ultra HD',
    coordinates: { lat: 21.006, lng: 105.783, city: 'Hà Nội', mapX: 46, mapY: 18 },
    status: 'online',
    lastPing: 'Vừa xong',
    ipAddress: '192.168.2.45',
    currentLayoutId: 'layout-2',
    volume: 85,
    isMuted: false,
    powerState: 'on',
    screenshotUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80',
    appVersion: 'v2.5.0-beta',
    deviceModel: 'Windows Mini PC i7 (Aloloader WinPlayer)',
    storageUsed: 78.5,
    storageTotal: 512.0,
  },
  {
    id: 'screen-4',
    name: 'Kiosk Quảng Cáo Chân Đứng 55"',
    code: 'LED-5509',
    resolution: { width: 1080, height: 1920 },
    orientation: 'portrait',
    location: 'Sân bay Quốc tế Đà Nẵng, Hải Châu, Đà Nẵng',
    group: 'Kiosk Thông Tin',
    branch: 'Chi nhánh Miền Trung (Đà Nẵng)',
    deviceType: 'Kiosk Đứng Chân Quỳ Cảm Ứng 55"',
    coordinates: { lat: 16.054, lng: 108.202, city: 'Đà Nẵng', mapX: 63, mapY: 48 },
    status: 'online',
    lastPing: '2 phút trước',
    ipAddress: '192.168.1.88',
    currentLayoutId: 'layout-3',
    volume: 50,
    isMuted: false,
    powerState: 'on',
    screenshotUrl: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=800&q=80',
    appVersion: 'v2.4.10',
    deviceModel: 'Alo360 Kiosk Display Android 11',
    storageUsed: 12.2,
    storageTotal: 32.0,
  },
  {
    id: 'screen-5',
    name: 'Màn Hình LED Quảng Cáo TTTM Cần Thơ',
    code: 'LED-1204',
    resolution: { width: 1920, height: 1080 },
    orientation: 'landscape',
    location: 'TTTM Vincom Plaza Xuân Khánh, Ninh Kiều, Cần Thơ',
    group: 'Quảng Cáo TTTM',
    branch: 'Chi nhánh Tây Nam Bộ (Cần Thơ)',
    deviceType: 'Màn Hình Smart LED 85" Viền Mỏng',
    coordinates: { lat: 10.029, lng: 105.772, city: 'Cần Thơ', mapX: 40, mapY: 88 },
    status: 'offline',
    lastPing: '35 phút trước',
    ipAddress: '192.168.3.12',
    currentLayoutId: 'layout-1',
    volume: 40,
    isMuted: false,
    powerState: 'sleep',
    screenshotUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    appVersion: 'v2.3.8',
    deviceModel: 'Android TV Box S905X4',
    storageUsed: 8.5,
    storageTotal: 32.0,
  }
];

export const INITIAL_MEDIA: MediaItem[] = [
  {
    id: 'media-1',
    title: 'Video Giới Thiệu Thương Hiệu & Công Nghệ 2026',
    type: 'video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
    duration: 60,
    size: '48.5 MB',
    resolution: '1920x1080',
    uploadedAt: '12/09/2026',
    tags: ['Quảng Cáo', 'Thương Hiệu', 'HD 1080p']
  },
  {
    id: 'media-2',
    title: 'TVC Quảng Cáo Siêu Xe & Thiết Bị Tương Lai',
    type: 'video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80',
    duration: 45,
    size: '32.1 MB',
    resolution: '1920x1080',
    uploadedAt: '10/09/2026',
    tags: ['TVC', 'Sản Phẩm']
  },
  {
    id: 'media-3',
    title: 'Banner Chào Mừng Quý Khách Tham Quan Doanh Nghiệp',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80',
    duration: 15,
    size: '4.2 MB',
    resolution: '1920x1080',
    uploadedAt: '08/09/2026',
    tags: ['Banner', 'Chào Mừng']
  },
  {
    id: 'media-4',
    title: 'Poster Ưu Đãi Mùa Thu & Khuyến Mãi Hội Viên',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=600&q=80',
    duration: 12,
    size: '3.8 MB',
    resolution: '1080x1920',
    uploadedAt: '05/09/2026',
    tags: ['Khuyến Mãi', 'Dọc 9:16']
  },
  {
    id: 'media-5',
    title: 'Tin Chữ Chạy: Thông Báo Hội Nghị & Thời Tiết Hôm Nay',
    type: 'ticker',
    url: '',
    thumbnail: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=600&q=80',
    duration: 0,
    size: '12 KB',
    resolution: 'Auto',
    uploadedAt: '01/09/2026',
    tags: ['Chữ Chạy', 'Tin Tức']
  },
  {
    id: 'media-6',
    title: 'Widget Đồng Hồ Kỹ Thuật Số & Dự Báo Thời Tiết',
    type: 'widget',
    url: '',
    thumbnail: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
    duration: 0,
    size: '45 KB',
    resolution: 'Widget',
    uploadedAt: '01/09/2026',
    tags: ['Tiện Ích', 'Thời Tiết', 'Đồng Hồ'],
    widgetConfig: {
      widgetType: 'clock',
      theme: 'neon',
      location: 'Hồ Chí Minh'
    }
  }
];

export const INITIAL_LAYOUTS: LayoutTemplate[] = [
  {
    id: 'layout-1',
    name: 'Bố Cục Chuẩn Sảnh (Video 70% + Cột Poster 30% + Ticker Chân)',
    description: 'Phổ biến nhất cho màn hình sảnh đón tiếp khách, vừa phát clip vừa hiển thị poster và chữ chạy thông báo.',
    width: 1920,
    height: 1080,
    createdAt: '2026-09-01',
    updatedAt: '2026-09-12',
    zones: [
      {
        id: 'zone-1',
        name: 'Khung Video Chính (Trái)',
        x: 0,
        y: 0,
        width: 70,
        height: 90,
        zIndex: 1,
        type: 'video',
        mediaPlaylist: [
          { mediaId: 'media-1', duration: 60 },
          { mediaId: 'media-2', duration: 45 }
        ]
      },
      {
        id: 'zone-2',
        name: 'Khung Slide Poster Phụ (Phải)',
        x: 70,
        y: 0,
        width: 30,
        height: 55,
        zIndex: 1,
        type: 'image_slider',
        mediaPlaylist: [
          { mediaId: 'media-3', duration: 15 },
          { mediaId: 'media-4', duration: 15 }
        ]
      },
      {
        id: 'zone-3',
        name: 'Khung Đồng Hồ & Thời Tiết',
        x: 70,
        y: 55,
        width: 30,
        height: 35,
        zIndex: 2,
        type: 'widget',
        widgetType: 'clock',
        mediaPlaylist: [
          { mediaId: 'media-6', duration: 0 }
        ]
      },
      {
        id: 'zone-4',
        name: 'Dải Băng Chữ Chạy Chân Trang (Ticker)',
        x: 0,
        y: 90,
        width: 100,
        height: 10,
        zIndex: 3,
        type: 'ticker',
        tickerText: '★ CHÀO MỪNG QUÝ ĐỐI TÁC VÀ KHÁCH HÀNG ĐẾN THAM QUAN HỆ THỐNG TRÌNH CHIẾU LED THÔNG MINH ★ CHÚC QUÝ KHÁCH MỘT NGÀY LÀM VIỆC HIỆU QUẢ VÀ THÀNH CÔNG ★ LIÊN HỆ BỘ PHẬN HỖ TRỢ KỸ THUẬT: 1900 6868 ★',
        tickerSpeed: 18,
        tickerBgColor: '#0f172a',
        tickerTextColor: '#38bdf8',
        mediaPlaylist: []
      }
    ]
  },
  {
    id: 'layout-2',
    name: 'Bố Cục Hội Trường (Toàn Màn Hình 16:9 / 4K)',
    description: 'Trình chiếu video full màn hình với độ nét cao không bị che khuất viền vi tính.',
    width: 1920,
    height: 1080,
    createdAt: '2026-09-05',
    updatedAt: '2026-09-10',
    zones: [
      {
        id: 'zone-main',
        name: 'Khu Vực Phát Toàn Màn Hình',
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        zIndex: 1,
        type: 'video',
        mediaPlaylist: [
          { mediaId: 'media-1', duration: 60 },
          { mediaId: 'media-2', duration: 45 }
        ]
      }
    ]
  },
  {
    id: 'layout-3',
    name: 'Bố Cục Kiosk Chân Đứng (Màn Hình Dọc 9:16)',
    description: 'Thiết kế tối ưu cho Kiosk thang máy và bảng thông tin cảm ứng dạng dọc.',
    width: 1080,
    height: 1920,
    createdAt: '2026-09-08',
    updatedAt: '2026-09-12',
    zones: [
      {
        id: 'zone-top',
        name: 'Banner Tiêu Đề Trên Cùng',
        x: 0,
        y: 0,
        width: 100,
        height: 20,
        zIndex: 1,
        type: 'image_slider',
        mediaPlaylist: [
          { mediaId: 'media-3', duration: 10 }
        ]
      },
      {
        id: 'zone-center',
        name: 'Video Trung Tâm',
        x: 0,
        y: 20,
        width: 100,
        height: 55,
        zIndex: 2,
        type: 'video',
        mediaPlaylist: [
          { mediaId: 'media-1', duration: 60 }
        ]
      },
      {
        id: 'zone-bottom',
        name: 'Tiện Ích Thông Tin & Thời Tiết',
        x: 0,
        y: 75,
        width: 100,
        height: 18,
        zIndex: 2,
        type: 'widget',
        widgetType: 'weather',
        mediaPlaylist: [
          { mediaId: 'media-6', duration: 0 }
        ]
      },
      {
        id: 'zone-kiosk-ticker',
        name: 'Dòng Chữ Chạy Cuối',
        x: 0,
        y: 93,
        width: 100,
        height: 7,
        zIndex: 3,
        type: 'ticker',
        tickerText: 'Hệ Thống Kiosk Cảm Ứng Thông Minh - Quý Khách Vui Lòng Chạm Để Tra Cứu Thông Tin',
        tickerSpeed: 12,
        tickerBgColor: '#1e293b',
        tickerTextColor: '#f59e0b',
        mediaPlaylist: []
      }
    ]
  },
  {
    id: 'layout-4',
    name: 'Màn Hình LED Ngang Tùy Biến (2560x1080 Ultrawide)',
    description: 'Chuyên dụng cho màn hình LED ngoài trời tỉ lệ đặc thù hoặc dải LED chạy dài.',
    width: 2560,
    height: 1080,
    createdAt: '2026-09-10',
    updatedAt: '2026-09-12',
    zones: [
      {
        id: 'zone-uw-1',
        name: 'Clip Quảng Cáo Trọng Điểm',
        x: 0,
        y: 0,
        width: 65,
        height: 100,
        zIndex: 1,
        type: 'video',
        mediaPlaylist: [
          { mediaId: 'media-2', duration: 45 }
        ]
      },
      {
        id: 'zone-uw-2',
        name: 'Khu Vực Thông Tin & Banner Nhãn Hàng',
        x: 65,
        y: 0,
        width: 35,
        height: 85,
        zIndex: 1,
        type: 'image_slider',
        mediaPlaylist: [
          { mediaId: 'media-4', duration: 15 },
          { mediaId: 'media-3', duration: 15 }
        ]
      },
      {
        id: 'zone-uw-ticker',
        name: 'Dải Băng Chạy Chữ LED',
        x: 65,
        y: 85,
        width: 35,
        height: 15,
        zIndex: 2,
        type: 'ticker',
        tickerText: 'LED ULTRA-WIDE DISPLAY SYSTEM ★ HOTLINE ĐẶT QUẢNG CÁO: 0988.360.360',
        tickerSpeed: 15,
        tickerBgColor: '#000000',
        tickerTextColor: '#10b981',
        mediaPlaylist: []
      }
    ]
  }
];

export const INITIAL_SCHEDULES: Schedule[] = [
  {
    id: 'sched-1',
    name: 'Lịch Phát Quảng Cáo Mặc Định Hàng Ngày (06:00 - 23:00)',
    screenIds: ['screen-1', 'screen-2', 'screen-3'],
    layoutId: 'layout-1',
    priority: 'normal',
    repeatType: 'daily',
    startDate: '2026-09-01',
    endDate: '2026-12-31',
    startTime: '06:00',
    endTime: '23:00',
    daysOfWeek: [1, 2, 3, 4, 5, 6, 0],
    isActive: true
  },
  {
    id: 'sched-2',
    name: 'Lịch Trình Chiếu Kiosk Thông Tin Khách Hàng',
    screenIds: ['screen-4'],
    layoutId: 'layout-3',
    priority: 'normal',
    repeatType: 'always',
    startDate: '2026-09-01',
    endDate: '2026-12-31',
    startTime: '00:00',
    endTime: '23:59',
    daysOfWeek: [1, 2, 3, 4, 5, 6, 0],
    isActive: true
  },
  {
    id: 'sched-3',
    name: 'Sự Kiện Ra Mắt Sản Phẩm Mới (Ưu Tiên Cao)',
    screenIds: ['screen-1', 'screen-3'],
    layoutId: 'layout-2',
    priority: 'high',
    repeatType: 'date_range',
    startDate: '2026-09-15',
    endDate: '2026-09-16',
    startTime: '09:00',
    endTime: '12:00',
    daysOfWeek: [2, 3],
    isActive: true
  }
];

export const INITIAL_PROOF_OF_PLAY: ProofOfPlayLog[] = [
  {
    id: 'log-1',
    screenId: 'screen-1',
    screenName: 'Màn Hình LED Sảnh Chính - Tầng 1',
    mediaId: 'media-1',
    mediaTitle: 'Video Giới Thiệu Thương Hiệu & Công Nghệ 2026',
    playedAt: '13/09/2026 16:45:00',
    durationSeconds: 60,
    status: 'completed'
  },
  {
    id: 'log-2',
    screenId: 'screen-1',
    screenName: 'Màn Hình LED Sảnh Chính - Tầng 1',
    mediaId: 'media-2',
    mediaTitle: 'TVC Quảng Cáo Siêu Xe & Thiết Bị Tương Lai',
    playedAt: '13/09/2026 16:46:00',
    durationSeconds: 45,
    status: 'completed'
  },
  {
    id: 'log-3',
    screenId: 'screen-2',
    screenName: 'Màn Hình LED Mặt Tiền Ngoài Trời P3',
    mediaId: 'media-2',
    mediaTitle: 'TVC Quảng Cáo Siêu Xe & Thiết Bị Tương Lai',
    playedAt: '13/09/2026 16:50:12',
    durationSeconds: 45,
    status: 'completed'
  },
  {
    id: 'log-4',
    screenId: 'screen-4',
    screenName: 'Kiosk Quảng Cáo Chân Đứng 55"',
    mediaId: 'media-3',
    mediaTitle: 'Banner Chào Mừng Quý Khách Tham Quan Doanh Nghiệp',
    playedAt: '13/09/2026 17:05:00',
    durationSeconds: 15,
    status: 'completed'
  }
];

// ─────────────────────────────────────────────
// Danh mục Phân Quyền Chức Năng Hệ Thống (Permissions)
// ─────────────────────────────────────────────
export const INITIAL_PERMISSIONS: UserPermission[] = [
  // Quản lý Màn hình
  { id: 'screen_view', name: 'Xem danh sách màn hình', description: 'Xem trạng thái, thông số kỹ thuật và vị trí màn hình', category: 'screens' },
  { id: 'screen_control', name: 'Điều khiển màn hình từ xa', description: 'Bật/tắt, chỉnh âm lượng, chụp màn hình, khởi động lại', category: 'screens' },
  { id: 'screen_pair', name: 'Ghép nối & Cấu hình màn hình', description: 'Nhập Pairing code, thêm và đổi thông số phần cứng LED', category: 'screens' },
  { id: 'screen_delete', name: 'Gỡ bỏ màn hình', description: 'Xóa thiết bị khỏi hệ thống mạng quản lý', category: 'screens' },

  // Bố cục Layout
  { id: 'layout_view', name: 'Xem thư viện bố cục', description: 'Xem các mẫu chia khung màn hình', category: 'layouts' },
  { id: 'layout_edit', name: 'Thiết kế bố cục trực quan', description: 'Tạo mới, chỉnh sửa vùng canvas, ticker, widget', category: 'layouts' },

  // Thư viện Media
  { id: 'media_view', name: 'Xem thư viện tệp media', description: 'Xem trước video, poster ảnh, widget', category: 'media' },
  { id: 'media_upload', name: 'Tải lên & Chỉnh sửa media', description: 'Tải video, ảnh, đặt thời lượng phát sóng', category: 'media' },
  { id: 'media_delete', name: 'Xóa tệp media', description: 'Xóa tệp khỏi kho lưu trữ hệ thống', category: 'media' },

  // Lập lịch phát sóng
  { id: 'schedule_view', name: 'Xem lịch phát sóng', description: 'Xem danh sách và timeline phát sóng', category: 'schedules' },
  { id: 'schedule_manage', name: 'Tạo & Chỉnh sửa lịch phát', description: 'Thiết lập khung giờ, phân bổ màn hình phát sóng', category: 'schedules' },
  { id: 'emergency_broadcast', name: 'Kích hoạt phát khẩn cấp', description: 'Gửi thông điệp khẩn cấp đè toàn hệ thống màn hình', category: 'schedules' },

  // Báo cáo nghiệm thu
  { id: 'reports_view', name: 'Xem báo cáo Proof of Play', description: 'Xem số lượt phát, thời lượng thực tế của từng clip', category: 'reports' },
  { id: 'reports_export', name: 'Xuất báo cáo nghiệm thu Excel', description: 'Tải file CSV/Excel phục vụ thanh toán hợp đồng quảng cáo', category: 'reports' },

  // Quản trị người dùng & Cấu hình
  { id: 'iam_manage', name: 'Quản trị người dùng & Nhóm', description: 'Thêm tài khoản, phân quyền, khóa/mở khóa thành viên', category: 'system' },
  { id: 'system_settings', name: 'Cấu hình Gateway & Máy chủ', description: 'Đổi thông số MQTT Broker, CDN, WebSocket Endpoint', category: 'system' },
];

// ─────────────────────────────────────────────
// Danh mục Nhóm Tài Khoản (User Groups)
// ─────────────────────────────────────────────
export const INITIAL_USER_GROUPS: UserGroup[] = [
  {
    id: 'group-superadmin',
    code: 'GRP-ADMIN',
    name: 'Ban Quản Trị Tối Cao (Super Admin)',
    leader: 'Nguyễn Văn Hùng (Giám Đốc Kỹ Thuật)',
    note: 'Toàn quyền điều hành mọi chức năng, phân quyền và cấu hình phần cứng',
    memberCount: 2,
    permissions: INITIAL_PERMISSIONS.map(p => p.id),
    createdAt: '01/08/2026'
  },
  {
    id: 'group-branch-manager',
    code: 'GRP-BRANCH',
    name: 'Quản Lý Chi Nhánh & Khu Vực',
    leader: 'Trần Thị Mai',
    note: 'Quản lý vận hành màn hình LED và duyệt nội dung trong chi nhánh được phân công',
    memberCount: 3,
    permissions: [
      'screen_view', 'screen_control', 'screen_pair',
      'layout_view', 'layout_edit',
      'media_view', 'media_upload',
      'schedule_view', 'schedule_manage',
      'reports_view', 'reports_export'
    ],
    createdAt: '05/08/2026'
  },
  {
    id: 'group-content-editor',
    code: 'GRP-CONTENT',
    name: 'Bộ Phận Thiết Kế & Biên Tập Nội Dung',
    leader: 'Lê Hoàng Nam',
    note: 'Chuyên trách dựng layout, tải lên video TVC, thiết kế banner và chữ chạy ticker',
    memberCount: 4,
    permissions: [
      'layout_view', 'layout_edit',
      'media_view', 'media_upload',
      'schedule_view',
      'reports_view'
    ],
    createdAt: '10/08/2026'
  },
  {
    id: 'group-operator',
    code: 'GRP-TECH',
    name: 'Kỹ Thuật Viên Vận Hành LED',
    leader: 'Phạm Quốc Bảo',
    note: 'Trực kỹ thuật 24/7, giám sát nhiệt độ màn hình, xử lý sự cố kết nối và bật/tắt thiết bị',
    memberCount: 3,
    permissions: [
      'screen_view', 'screen_control', 'screen_pair',
      'schedule_view',
      'reports_view'
    ],
    createdAt: '12/08/2026'
  }
];

// ─────────────────────────────────────────────
// Danh sách Tài Khoản Người Dùng (Users)
// ─────────────────────────────────────────────
export const INITIAL_USERS: UserAccount[] = [
  {
    id: 'user-1',
    email: 'admin@ledsignage.vn',
    name: 'Nguyễn Văn Hùng',
    phone: '0908 123 456',
    role: 'SUPER_ADMIN',
    groupId: 'group-superadmin',
    groupName: 'Ban Quản Trị Tối Cao (Super Admin)',
    branch: 'Trụ sở chính - Toàn hệ thống',
    isActive: true,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    lastLoginAt: 'Vừa xong',
    createdAt: '01/08/2026'
  },
  {
    id: 'user-2',
    email: 'mai.tran@ledsignage.vn',
    name: 'Trần Thị Mai',
    phone: '0912 345 678',
    role: 'BRANCH_ADMIN',
    groupId: 'group-branch-manager',
    groupName: 'Quản Lý Chi Nhánh & Khu Vực',
    branch: 'Chi nhánh Miền Nam (TP.HCM)',
    isActive: true,
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80',
    lastLoginAt: '2 giờ trước',
    createdAt: '05/08/2026'
  },
  {
    id: 'user-3',
    email: 'nam.le@ledsignage.vn',
    name: 'Lê Hoàng Nam',
    phone: '0933 998 877',
    role: 'CONTENT_MANAGER',
    groupId: 'group-content-editor',
    groupName: 'Bộ Phận Thiết Kế & Biên Tập Nội Dung',
    branch: 'Trụ sở chính - Toàn hệ thống',
    isActive: true,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    lastLoginAt: 'Hôm qua, 17:40',
    createdAt: '10/08/2026'
  },
  {
    id: 'user-4',
    email: 'bao.pham@ledsignage.vn',
    name: 'Phạm Quốc Bảo',
    phone: '0977 654 321',
    role: 'OPERATOR',
    groupId: 'group-operator',
    groupName: 'Kỹ Thuật Viên Vận Hành LED',
    branch: 'Chi nhánh Miền Bắc (Hà Nội)',
    isActive: true,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    lastLoginAt: 'Hôm qua, 09:15',
    createdAt: '12/08/2026'
  },
  {
    id: 'user-5',
    email: 'khachhang.demo@ledsignage.vn',
    name: 'Đại Diện Khách Hàng (Viewer)',
    phone: '0988 000 111',
    role: 'VIEWER',
    groupId: undefined,
    groupName: 'Tài khoản Xem Báo Cáo',
    branch: 'Đại diện nhãn hàng Vinamilk',
    isActive: true,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    lastLoginAt: '3 ngày trước',
    createdAt: '15/08/2026'
  }
];

// ─────────────────────────────────────────────
// Nhật Ký Hoạt Động & Truy Cập (Audit Logs)
// ─────────────────────────────────────────────
export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'audit-1',
    userId: 'user-1',
    userName: 'Nguyễn Văn Hùng',
    action: 'LOGIN',
    module: 'AUTH',
    details: 'Đăng nhập thành công vào Hệ thống CMS với quyền Super Admin',
    ipAddress: '113.161.72.18 (TP.HCM)',
    timestamp: '20/09/2026 15:30:12'
  },
  {
    id: 'audit-2',
    userId: 'user-1',
    userName: 'Nguyễn Văn Hùng',
    action: 'COMMAND',
    module: 'SCREENS',
    details: 'Gửi lệnh điều khiển âm lượng 75% đến màn hình "Màn Hình LED Sảnh Chính - Tầng 1" (LED-8821)',
    ipAddress: '113.161.72.18 (TP.HCM)',
    timestamp: '20/09/2026 15:35:40'
  },
  {
    id: 'audit-3',
    userId: 'user-2',
    userName: 'Trần Thị Mai',
    action: 'UPDATE',
    module: 'SCHEDULES',
    details: 'Cập nhật khung giờ phát sóng cho lịch "Lịch Chiếu Giờ Cao Điểm Màn Hình Ngoài Trời"',
    ipAddress: '14.232.160.95 (TP.HCM)',
    timestamp: '20/09/2026 14:15:20'
  },
  {
    id: 'audit-4',
    userId: 'user-3',
    userName: 'Lê Hoàng Nam',
    action: 'CREATE',
    module: 'MEDIA',
    details: 'Tải lên video mới "Video Giới Thiệu Thương Hiệu & Công Nghệ 2026.mp4" (48.5 MB)',
    ipAddress: '27.72.105.41 (Hà Nội)',
    timestamp: '19/09/2026 16:22:00'
  },
  {
    id: 'audit-5',
    userId: 'user-4',
    userName: 'Phạm Quốc Bảo',
    action: 'COMMAND',
    module: 'SCREENS',
    details: 'Khởi động lại card nhận tín hiệu màn hình ghép hội trường (LED-7712)',
    ipAddress: '118.70.188.62 (Hà Nội)',
    timestamp: '19/09/2026 10:05:14'
  }
];// ─────────────────────────────────────────────
// Danh mục Chi nhánh / Văn phòng
// ─────────────────────────────────────────────
export const INITIAL_BRANCHES: Branch[] = [
  {
    id: 'branch-1',
    code: 'HAN-HQ',
    name: 'Trụ sở chính (Hà Nội)',
    region: 'north',
    city: 'Hà Nội',
    address: 'Tầng 12, Tòa nhà Capital Tower, 109 Trần Hưng Đạo, Hoàn Kiếm, Hà Nội',
    manager: 'Nguyễn Văn Hùng',
    phone: '024 3936 8821',
    email: 'hanoi@ledsignage.vn',
    screenCount: 1,
    isActive: true,
    createdAt: '01/01/2024'
  },
  {
    id: 'branch-2',
    code: 'HCM-SOUTH',
    name: 'Chi nhánh Miền Nam (TP.HCM)',
    region: 'south',
    city: 'TP. Hồ Chí Minh',
    address: 'Tầng 8, Tòa nhà Saigon Centre, 65 Lê Lợi, Quận 1, TP.HCM',
    manager: 'Trần Thị Mai',
    phone: '028 3822 9090',
    email: 'hcm@ledsignage.vn',
    screenCount: 2,
    isActive: true,
    createdAt: '15/03/2024'
  },
  {
    id: 'branch-3',
    code: 'DAN-CENTRAL',
    name: 'Chi nhánh Miền Trung (Đà Nẵng)',
    region: 'central',
    city: 'Đà Nẵng',
    address: '88 Lê Duẩn, Thạch Thang, Hải Châu, Đà Nẵng',
    manager: 'Phạm Quốc Bảo',
    phone: '0236 3822 777',
    email: 'danang@ledsignage.vn',
    screenCount: 1,
    isActive: true,
    createdAt: '20/06/2024'
  },
  {
    id: 'branch-4',
    code: 'CT-SOUTHWEST',
    name: 'Chi nhánh Tây Nam Bộ (Cần Thơ)',
    region: 'southwest',
    city: 'Cần Thơ',
    address: '68 Lý Tự Trọng, Ninh Kiều, Cần Thơ',
    manager: 'Lê Hoàng Nam',
    phone: '0292 3812 456',
    email: 'cantho@ledsignage.vn',
    screenCount: 1,
    isActive: true,
    createdAt: '10/09/2024'
  }
];

// ─────────────────────────────────────────────
// Danh mục Khách hàng Quảng Cáo (Advertisers)
// ─────────────────────────────────────────────
export const INITIAL_ADVERTISERS: Advertiser[] = [
  {
    id: 'adv-1',
    code: 'ADV-VINA',
    name: 'Công ty Cổ phần Sữa Việt Nam (Vinamilk)',
    shortName: 'Vinamilk',
    taxCode: '0300894117',
    contactName: 'Nguyễn Thị Hương',
    contactPhone: '028 3930 5800',
    contactEmail: 'marketing@vinamilk.com.vn',
    industry: 'Thực phẩm & Đồ uống (F&B)',
    logoUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=100&q=80',
    status: 'active',
    contracts: [
      {
        id: 'contract-v1',
        contractCode: 'HD-2026-VINA-001',
        startDate: '01/07/2026',
        endDate: '31/12/2026',
        value: 480000000,
        status: 'active',
        screenIds: ['screen-1', 'screen-2'],
        note: 'Hợp đồng quảng cáo sản phẩm sữa tươi & sữa chua năm 2026'
      }
    ],
    createdAt: '01/06/2026'
  },
  {
    id: 'adv-2',
    code: 'ADV-TOYOTA',
    name: 'Công ty Toyota Việt Nam (TMV)',
    shortName: 'Toyota VN',
    taxCode: '0100106399',
    contactName: 'Phạm Anh Tuấn',
    contactPhone: '028 3935 4545',
    contactEmail: 'marketing@toyota.com.vn',
    industry: 'Ô tô & Phương tiện vận tải',
    logoUrl: 'https://images.unsplash.com/photo-1611195974226-a6a9be9dd763?auto=format&fit=crop&w=100&q=80',
    status: 'active',
    contracts: [
      {
        id: 'contract-t1',
        contractCode: 'HD-2026-TMV-002',
        startDate: '15/08/2026',
        endDate: '14/02/2027',
        value: 720000000,
        status: 'active',
        screenIds: ['screen-3', 'screen-4'],
        note: 'Chiến dịch ra mắt mẫu xe Camry 2027 tại 5 thành phố trọng điểm'
      }
    ],
    createdAt: '10/07/2026'
  },
  {
    id: 'adv-3',
    code: 'ADV-VINHOMES',
    name: 'Công ty Cổ phần VinHome (Vinhomes)',
    shortName: 'Vinhomes',
    taxCode: '0102671039',
    contactName: 'Lê Thị Lan',
    contactPhone: '1800 5678',
    contactEmail: 'pr@vinhomes.vn',
    industry: 'Bất động sản & Đầu tư',
    logoUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=100&q=80',
    status: 'active',
    contracts: [
      {
        id: 'contract-vh1',
        contractCode: 'HD-2026-VHM-003',
        startDate: '01/09/2026',
        endDate: '28/02/2027',
        value: 1200000000,
        status: 'active',
        screenIds: ['screen-1', 'screen-3'],
        note: 'Quảng cáo dự án Vinhomes Ocean Park 3 - The Crown'
      }
    ],
    createdAt: '20/08/2026'
  },
  {
    id: 'adv-4',
    code: 'ADV-SHOPEE',
    name: 'Công ty Shopee Việt Nam',
    shortName: 'Shopee',
    taxCode: '0309773909',
    contactName: 'Trần Minh Khoa',
    contactPhone: '1900 1234',
    contactEmail: 'ads@shopee.vn',
    industry: 'Thương mại Điện tử & Logistics',
    logoUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=100&q=80',
    status: 'pending',
    contracts: [
      {
        id: 'contract-s1',
        contractCode: 'HD-2026-SPE-004',
        startDate: '01/10/2026',
        endDate: '31/01/2027',
        value: 360000000,
        status: 'draft',
        screenIds: ['screen-2', 'screen-5'],
        note: 'Chiến dịch 10.10 & 11.11 Shopee Sisalê Sale'
      }
    ],
    createdAt: '15/09/2026'
  },
  {
    id: 'adv-5',
    code: 'ADV-HEINEKEN',
    name: 'Công ty TNHH Nước Giải Khát Heineken Việt Nam',
    shortName: 'Heineken VN',
    taxCode: '0303450512',
    contactName: 'Bùi Quốc Duy',
    contactPhone: '028 3823 9900',
    contactEmail: 'marketing@heineken.com.vn',
    industry: 'Đồ uống & Giải khát',
    status: 'inactive',
    contracts: [
      {
        id: 'contract-h1',
        contractCode: 'HD-2025-HNK-001',
        startDate: '01/01/2026',
        endDate: '30/06/2026',
        value: 540000000,
        status: 'expired',
        screenIds: ['screen-1', 'screen-2', 'screen-5'],
        note: 'Hợp đồng năm 2026 đã kết thúc, cần gia hạn'
      }
    ],
    createdAt: '15/12/2025'
  }
];

// ─────────────────────────────────────────────
// Danh mục Loại Thiết Bị LED (Hardware Profiles)
// ─────────────────────────────────────────────
export const INITIAL_HARDWARE_PROFILES: HardwareProfile[] = [
  {
    id: 'hw-1',
    code: 'LED-P25-INDOOR',
    name: 'LED P2.5 Indoor Cabinet — Phòng hỏi & Sảnh đón tiếp',
    pixelPitch: 'P2.5',
    ledType: 'indoor',
    controllerBrand: 'NovaStar',
    controllerModel: 'NovaStar Taurus TB60',
    physicalWidth: 500,
    physicalHeight: 500,
    defaultResolution: '1920x1080',
    maxBrightness: 800,
    ipRating: 'IP20',
    weight: 8.5,
    powerConsumption: 400,
    note: 'Phù hợp sảnh đón tiếp, phòng hỏi trường, showroom. Tầm nhìn tối ưu 2-8m.',
    createdAt: '01/01/2025'
  },
  {
    id: 'hw-2',
    code: 'LED-P3-OUTDOOR',
    name: 'LED P3 Outdoor — Mặt tiền ngoài trời IP65',
    pixelPitch: 'P3',
    ledType: 'outdoor',
    controllerBrand: 'Colorlight',
    controllerModel: 'Colorlight X4e Master Box',
    physicalWidth: 960,
    physicalHeight: 960,
    defaultResolution: '1920x1080',
    maxBrightness: 6000,
    ipRating: 'IP65',
    weight: 22.0,
    powerConsumption: 950,
    note: 'Phù hợp biển quảng cáo ngoài trời, mặt tiền toà nhà. Kháng thời tiết, mưa bão.',
    createdAt: '15/03/2025'
  },
  {
    id: 'hw-3',
    code: 'LED-P18-4K',
    name: 'LED P1.8 Ultra HD 4K — Video Wall Hội trường VIP',
    pixelPitch: 'P1.8',
    ledType: 'indoor',
    controllerBrand: 'NovaStar',
    controllerModel: 'NovaStar MX40 Pro (4K Controller)',
    physicalWidth: 600,
    physicalHeight: 337,
    defaultResolution: '3840x2160',
    maxBrightness: 1200,
    ipRating: 'IP20',
    weight: 11.0,
    powerConsumption: 550,
    note: 'Dòng cao cấp cho Hội trường VIP, Sân khấu biểu diễn, Bảng ghép video wall thượng đại.',
    createdAt: '20/06/2025'
  },
  {
    id: 'hw-4',
    code: 'KIOSK-55-TOUCH',
    name: 'Kiosk Đứng Chân Quỳ 55" Cảm Ứng — DOOH Interactive',
    pixelPitch: 'LCD 4K',
    ledType: 'indoor',
    controllerBrand: 'Aloloader',
    controllerModel: 'Aloloader Kiosk Android 13 (Amlogic S928X)',
    physicalWidth: 1400,
    physicalHeight: 350,
    defaultResolution: '1080x1920',
    maxBrightness: 700,
    ipRating: 'IP54',
    weight: 45.0,
    powerConsumption: 185,
    note: 'Kiosk chạm cảm ứng 10 điểm, tương tác khách tại sân bay, TTTM, bệnh viện, trung tâm hành chính.',
    createdAt: '01/08/2025'
  },
  {
    id: 'hw-5',
    code: 'LED-P4-SEMI',
    name: 'LED P4 Bán Ngoài Trời (Semi-Outdoor) — Tường Đường phố',
    pixelPitch: 'P4',
    ledType: 'semi-outdoor',
    controllerBrand: 'Huidu',
    controllerModel: 'Huidu HD-C15C (Async Controller)',
    physicalWidth: 768,
    physicalHeight: 768,
    defaultResolution: '1920x1080',
    maxBrightness: 2500,
    ipRating: 'IP54',
    weight: 16.0,
    powerConsumption: 640,
    note: 'Lắp mái hiên, cửa hàng, chiếu từ trong ra ngoài. Tầm nhìn 4-15m.',
    createdAt: '15/09/2025'
  },
  {
    id: 'hw-6',
    code: 'LED-P5-BILLBOARD',
    name: 'LED P5 Billboard Xa Lộ — OOH Quảng Cáo',
    pixelPitch: 'P5',
    ledType: 'outdoor',
    controllerBrand: 'Linsn',
    controllerModel: 'Linsn SC350d Sending Card',
    physicalWidth: 1000,
    physicalHeight: 1000,
    defaultResolution: '1920x1080',
    maxBrightness: 7000,
    ipRating: 'IP67',
    weight: 28.0,
    powerConsumption: 1200,
    note: 'Billboard đường cao tốc, xa lộ, khoảng cách xem 15-50m. Chống tương và nước mưa cấp độ IP67.',
    createdAt: '10/10/2025'
  },
  {
    id: 'hw-7',
    code: 'PC-ALOLOADER-WIN',
    name: 'Aloloader WinPlayer — Mini PC Windows i7 4K',
    pixelPitch: 'HDMI Output',
    ledType: 'indoor',
    controllerBrand: 'Windows PC',
    controllerModel: 'Intel NUC i7-1260P, 16GB RAM, 512GB SSD',
    physicalWidth: 120,
    physicalHeight: 120,
    defaultResolution: '3840x2160',
    maxBrightness: 0,
    note: 'Dnh cho hệ thống hội trường lớn cần xuất HDMI 4K. Chạy trình phát Aloloader WinPlayer.',
    createdAt: '05/11/2025'
  }
];
