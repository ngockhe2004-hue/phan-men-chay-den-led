export type ScreenStatus = 'online' | 'offline' | 'warning';
export type ScreenPowerState = 'on' | 'sleep' | 'off';
export type MediaType = 'video' | 'image' | 'ticker' | 'widget' | 'webpage';
export type ZoneType = 'video' | 'image_slider' | 'ticker' | 'widget' | 'webpage';
export type ImageScaleMode = 'fit_device' | 'fit_image'; // 'fit_device': Kích thước thiết bị (cover/lấp đầy), 'fit_image': Kích thước hình (contain/giữ tỷ lệ gốc)

export interface Screen {
  id: string;
  name: string;
  code: string; // Pairing code (e.g., "LED-8829")
  resolution: {
    width: number;
    height: number;
  };
  orientation: 'landscape' | 'portrait';
  location: string;
  group: string;
  status: ScreenStatus;
  lastPing: string;
  ipAddress: string;
  currentLayoutId: string;
  volume: number;
  isMuted: boolean;
  powerState: ScreenPowerState;
  screenshotUrl: string;
  appVersion: string;
  deviceModel: string;
  storageUsed: number;
  storageTotal: number;
  imageScaleMode?: ImageScaleMode;
  coordinates?: {
    lat: number;
    lng: number;
    city: string;
    mapX?: number; // % x trên bản đồ số trực quan (0-100)
    mapY?: number; // % y trên bản đồ số trực quan (0-100)
  };
  branch?: string;
  deviceType?: string;
}

// ─────────────────────────────────────────────
// Identity & Access Management (IAM)
// ─────────────────────────────────────────────
export type UserRole = 'SUPER_ADMIN' | 'BRANCH_ADMIN' | 'CONTENT_MANAGER' | 'OPERATOR' | 'VIEWER';

export interface UserPermission {
  id: string;
  name: string;
  description: string;
  category: 'screens' | 'layouts' | 'media' | 'schedules' | 'approval' | 'reports' | 'system';
}

export interface UserGroup {
  id: string;
  code: string;
  name: string;
  leader: string;
  note?: string;
  memberCount: number;
  permissions: string[]; // Mảng các Permission ID
  createdAt: string;
}

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  groupId?: string;
  groupName?: string;
  branch?: string;
  isActive: boolean;
  avatar?: string;
  lastLoginAt?: string;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  action: 'LOGIN' | 'LOGOUT' | 'CREATE' | 'UPDATE' | 'DELETE' | 'COMMAND' | 'EMERGENCY';
  module: 'AUTH' | 'SCREENS' | 'LAYOUTS' | 'MEDIA' | 'SCHEDULES' | 'IAM' | 'SYSTEM' | 'CRM';
  details: string;
  ipAddress: string;
  timestamp: string;
}

// ─────────────────────────────────────────────
// Organization & CRM (Giai đoạn 2)
// ─────────────────────────────────────────────

export interface Branch {
  id: string;
  code: string;
  name: string;
  region: 'north' | 'central' | 'south' | 'southwest';
  city: string;
  address: string;
  manager: string;
  phone: string;
  email?: string;
  screenCount: number;
  isActive: boolean;
  createdAt: string;
}

export type AdvertiserStatus = 'active' | 'inactive' | 'pending';
export type ContractStatus = 'draft' | 'active' | 'expired' | 'cancelled';

export interface AdvertiserContract {
  id: string;
  contractCode: string;
  startDate: string;
  endDate: string;
  value: number; // VND
  status: ContractStatus;
  screenIds: string[];
  note?: string;
}

export interface Advertiser {
  id: string;
  code: string;
  name: string;           // Tên doanh nghiệp / nhãn hàng
  shortName?: string;     // Tên viết tắt / thương hiệu
  taxCode?: string;       // Mã số thuế
  contactName: string;   // Người liên hệ
  contactPhone: string;
  contactEmail?: string;
  industry?: string;      // Ngành nghề (F&B, Bất động sản, Ô tô, ...)
  logoUrl?: string;
  status: AdvertiserStatus;
  contracts: AdvertiserContract[];
  note?: string;
  createdAt: string;
}

export type ControllerBrand = 'NovaStar' | 'Colorlight' | 'Huidu' | 'Linsn' | 'Android TV' | 'Windows PC' | 'Aloloader';
export type LEDType = 'indoor' | 'outdoor' | 'semi-outdoor';

export interface HardwareProfile {
  id: string;
  code: string;
  name: string;            // Ví dụ: LED P2.5 Indoor Cabinet
  pixelPitch: string;     // P1.5 / P2 / P2.5 / P3 / P4 / P5 / P10
  ledType: LEDType;
  controllerBrand: ControllerBrand;
  controllerModel: string; // TB30 / TB40 / TB60 / X4e / HX710...
  physicalWidth: number;  // mm
  physicalHeight: number; // mm
  defaultResolution: string; // 1920x1080
  maxBrightness: number;  // nits
  ipRating?: string;      // IP54 / IP65 / IP67
  weight?: number;        // kg per module
  powerConsumption?: number; // W/m²
  note?: string;
  createdAt: string;
}


export interface MediaItem {
  id: string;
  title: string;
  type: MediaType;
  url: string;
  thumbnail: string;
  duration: number; // in seconds
  size: string;
  resolution: string;
  uploadedAt: string;
  tags: string[];
  widgetConfig?: {
    widgetType: 'clock' | 'weather' | 'rates' | 'custom_html';
    theme?: 'dark' | 'light' | 'neon';
    location?: string;
    fontSize?: number;
    content?: string;
  };
}

export interface LayoutZone {
  id: string;
  name: string;
  x: number; // in percent (0 to 100)
  y: number; // in percent (0 to 100)
  width: number; // in percent
  height: number; // in percent
  zIndex: number;
  type: ZoneType;
  imageScaleMode?: ImageScaleMode;
  mediaPlaylist: {
    mediaId: string;
    duration: number;
    scaleMode?: ImageScaleMode;
    enabled?: boolean; // true/undefined: được phát; false: không phát
  }[];
  tickerText?: string;
  tickerSpeed?: number;
  tickerBgColor?: string;
  tickerTextColor?: string;
  widgetType?: 'clock' | 'weather' | 'rates';
}

export interface LayoutTemplate {
  id: string;
  name: string;
  description: string;
  width: number;
  height: number;
  zones: LayoutZone[];
  thumbnailUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Schedule {
  id: string;
  name: string;
  screenIds: string[];
  layoutId: string;
  priority: 'normal' | 'high' | 'emergency';
  repeatType: 'always' | 'daily' | 'weekly' | 'date_range';
  startDate: string;
  endDate: string;
  startTime: string; // "08:00"
  endTime: string;   // "22:00"
  daysOfWeek: number[]; // 0=Sun, 1=Mon ... 6=Sat
  isActive: boolean;
}

export interface ProofOfPlayLog {
  id: string;
  screenId: string;
  screenName: string;
  mediaId: string;
  mediaTitle: string;
  playedAt: string;
  durationSeconds: number;
  status: 'completed' | 'interrupted';
}
