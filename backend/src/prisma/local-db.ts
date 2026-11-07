import * as fs from 'fs';
import * as path from 'path';
import * as bcrypt from 'bcryptjs';

const DB_FILE = path.join(process.cwd(), 'local_db.json');

interface LocalDbData {
  users: any[];
  screens: any[];
  mediaItems: any[];
  layoutTemplates: any[];
  schedules: any[];
  proofOfPlayLogs: any[];
  refreshTokens: any[];
}

function getDefaultData(): LocalDbData {
  const adminPassword = bcrypt.hashSync('admin123', 10);
  return {
    users: [
      {
        id: 'user-admin-1',
        email: 'admin@ledcms.vn',
        name: 'Quản Trị Viên (Admin)',
        password: adminPassword,
        role: 'SUPER_ADMIN',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'user-op-1',
        email: 'operator@ledcms.vn',
        name: 'Kỹ Thuật Viên LED',
        password: adminPassword,
        role: 'OPERATOR',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    screens: [
      {
        id: 'screen-1',
        code: 'SCR-P5-01',
        name: 'LED Khán Đài Chính (P5 outdoor)',
        resolutionWidth: 1920,
        resolutionHeight: 1080,
        orientation: 'landscape',
        location: 'Sân vận động / Mặt trước tòa nhà',
        group: 'Khu A',
        status: 'online',
        volume: 85,
        isMuted: false,
        powerState: 'on',
        currentLayoutId: 'layout-1',
        appVersion: 'v1.0.0',
        deviceModel: 'NovaStar Taurus TB60',
        storageUsed: 4.8,
        storageTotal: 32,
        imageScaleMode: 'fit_device',
        lastPing: 'Vừa xong',
        ipAddress: '192.168.1.101',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'screen-2',
        code: 'SCR-P3-02',
        name: 'LED Sảnh Đón Khách (P3 indoor)',
        resolutionWidth: 1920,
        resolutionHeight: 1080,
        orientation: 'landscape',
        location: 'Sảnh chính Tầng 1',
        group: 'Khu B',
        status: 'online',
        volume: 60,
        isMuted: false,
        powerState: 'on',
        currentLayoutId: 'layout-1',
        appVersion: 'v1.0.0',
        deviceModel: 'Android TV Box Pro',
        storageUsed: 2.1,
        storageTotal: 16,
        imageScaleMode: 'fit_device',
        lastPing: 'Vừa xong',
        ipAddress: '192.168.1.102',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'screen-3',
        code: 'SCR-P2-03',
        name: 'LED Phòng Họp VIP (P2 indoor)',
        resolutionWidth: 3840,
        resolutionHeight: 2160,
        orientation: 'landscape',
        location: 'Phòng họp Hội nghị Tầng 3',
        group: 'Khu C',
        status: 'online',
        volume: 70,
        isMuted: false,
        powerState: 'on',
        currentLayoutId: 'layout-2',
        appVersion: 'v1.0.0',
        deviceModel: 'Colorlight C3 Core',
        storageUsed: 8.5,
        storageTotal: 64,
        imageScaleMode: 'fit_device',
        lastPing: 'Vừa xong',
        ipAddress: '192.168.1.103',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'screen-4',
        code: 'SCR-KSK-04',
        name: 'Kiosk Đứng Thông Tin (Kiosk 55")',
        resolutionWidth: 1080,
        resolutionHeight: 1920,
        orientation: 'portrait',
        location: 'Cửa ra vào thang máy Tầng 1',
        group: 'Khu B',
        status: 'offline',
        volume: 50,
        isMuted: false,
        powerState: 'on',
        currentLayoutId: 'layout-3',
        appVersion: 'v1.0.0',
        deviceModel: 'Smart Kiosk RK3568',
        storageUsed: 1.2,
        storageTotal: 32,
        imageScaleMode: 'fit_device',
        lastPing: '2 giờ trước',
        ipAddress: '192.168.1.104',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    layoutTemplates: [
      {
        id: 'layout-1',
        name: 'Bố cục Sảnh Chính (Đa vùng)',
        description: 'Video 70% bên trái + Banner ảnh 30% bên phải + Chữ chạy chân trang',
        width: 1920,
        height: 1080,
        zones: [
          {
            id: 'zone-1',
            name: 'Khu Vực Video',
            x: 0,
            y: 0,
            width: 70,
            height: 85,
            zIndex: 1,
            type: 'video',
            mediaPlaylist: [
              { mediaId: 'media-1', duration: 30 },
              { mediaId: 'media-2', duration: 15 },
            ],
          },
          {
            id: 'zone-2',
            name: 'Poster Ảnh Quảng Cáo',
            x: 70,
            y: 0,
            width: 30,
            height: 85,
            zIndex: 1,
            type: 'image_slider',
            mediaPlaylist: [
              { mediaId: 'media-3', duration: 10 },
              { mediaId: 'media-4', duration: 10 },
            ],
          },
          {
            id: 'zone-3',
            name: 'Chữ Chạy Khuyến Mãi',
            x: 0,
            y: 85,
            width: 100,
            height: 15,
            zIndex: 2,
            type: 'ticker',
            tickerText: '⭐ CHÀO MỪNG QUÝ KHÁCH — HỆ THỐNG QUẢN TRỊ TRÌNH CHIẾU MÀN HÌNH LED SIGNAGE CMS PRO ⭐',
            tickerSpeed: 50,
            tickerBgColor: '#0284c7',
            tickerTextColor: '#ffffff',
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'layout-2',
        name: 'Toàn Màn Hình (Full 4K/FullHD)',
        description: 'Trình chiếu video chất lượng cao tràn viền 100%',
        width: 1920,
        height: 1080,
        zones: [
          {
            id: 'zone-full',
            name: 'Màn Hình Tràn Viền',
            x: 0,
            y: 0,
            width: 100,
            height: 100,
            zIndex: 1,
            type: 'video',
            mediaPlaylist: [{ mediaId: 'media-1', duration: 30 }],
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    mediaItems: [
      {
        id: 'media-1',
        title: 'Video Giới Thiệu Doanh Nghiệp',
        type: 'video',
        url: '/videos/sample-video.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=600&q=80',
        duration: 30,
        sizeLabel: '1.2 MB',
        resolution: '1920x1080',
        tags: ['quang_cao', 'video'],
        uploadedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'media-2',
        title: 'Video TVC Sản Phẩm Mới',
        type: 'video',
        url: '/videos/sample-video-2.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
        duration: 15,
        sizeLabel: '515 KB',
        resolution: '1920x1080',
        tags: ['tvc', 'san_pham'],
        uploadedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'media-3',
        title: 'Poster Ưu Đãi Tháng 10',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=300&q=80',
        duration: 10,
        sizeLabel: '340 KB',
        resolution: '1080x1920',
        tags: ['khuyen_mai', 'poster'],
        uploadedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    schedules: [
      {
        id: 'sched-1',
        name: 'Lịch Phát Quảng Cáo Giờ Cao Điểm',
        screenIds: ['screen-1', 'screen-2'],
        layoutId: 'layout-1',
        priority: 'high',
        repeatType: 'daily',
        startDate: '2026-01-01',
        endDate: '2026-12-31',
        startTime: '08:00',
        endTime: '21:00',
        daysOfWeek: [1, 2, 3, 4, 5, 6, 0],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    proofOfPlayLogs: [],
    refreshTokens: [],
  };
}

export class LocalDbStore {
  private data: LocalDbData;

  constructor() {
    this.data = this.load();
  }

  private load(): LocalDbData {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch {}
    const initial = getDefaultData();
    this.save(initial);
    return initial;
  }

  private save(data?: LocalDbData) {
    try {
      const d = data || this.data;
      fs.writeFileSync(DB_FILE, JSON.stringify(d, null, 2), 'utf-8');
    } catch (err: any) {
      console.warn('⚠️ Không thể lưu local_db.json:', err.message);
    }
  }

  private matchItem(item: any, w: any): boolean {
    if (!w) return true;
    if (w.OR && Array.isArray(w.OR)) {
      return w.OR.some((cond: any) => this.matchItem(item, cond));
    }
    if (w.AND && Array.isArray(w.AND)) {
      return w.AND.every((cond: any) => this.matchItem(item, cond));
    }
    for (const key of Object.keys(w)) {
      if (key === 'OR' || key === 'AND') continue;
      const target = item[key];
      const val = w[key];
      if (val && typeof val === 'object') {
        if (val.contains !== undefined) {
          if (!target || !target.toString().toLowerCase().includes(val.contains.toLowerCase())) return false;
        } else if (val.in !== undefined && Array.isArray(val.in)) {
          if (!val.in.includes(target)) return false;
        } else if (val.equals !== undefined) {
          if (target !== val.equals) return false;
        }
      } else if (val !== undefined) {
        if (typeof val === 'string' && typeof target === 'string') {
          if (val.toLowerCase() !== target.toLowerCase()) return false;
        } else if (target !== val) {
          return false;
        }
      }
    }
    return true;
  }

  createCollectionHandler(collectionName: keyof LocalDbData) {
    return {
      findMany: async (args?: any) => {
        let list = [...this.data[collectionName]];
        if (args?.where) {
          list = list.filter((item: any) => this.matchItem(item, args.where));
        }
        if (args?.take) {
          list = list.slice(0, args.take);
        }
        return list;
      },
      findUnique: async (args: any) => {
        const list = this.data[collectionName];
        return list.find((item: any) => this.matchItem(item, args?.where)) || null;
      },
      findFirst: async (args?: any) => {
        const list = this.data[collectionName];
        return list.find((item: any) => this.matchItem(item, args?.where)) || null;
      },
      create: async (args: any) => {
        const newItem = {
          id: args.data.id || `${collectionName}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          ...args.data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        (this.data[collectionName] as any[]).push(newItem);
        this.save();
        return newItem;
      },
      update: async (args: any) => {
        const list = this.data[collectionName] as any[];
        const idx = list.findIndex((item: any) => this.matchItem(item, args?.where));
        if (idx !== -1) {
          list[idx] = {
            ...list[idx],
            ...args.data,
            updatedAt: new Date().toISOString(),
          };
          this.save();
          return list[idx];
        }
        return null;
      },
      upsert: async (args: any) => {
        const list = this.data[collectionName] as any[];
        const idx = list.findIndex((item: any) => this.matchItem(item, args?.where));
        if (idx !== -1) {
          list[idx] = {
            ...list[idx],
            ...(args.update || {}),
            updatedAt: new Date().toISOString(),
          };
          this.save();
          return list[idx];
        }
        const created = {
          id: args.create.id || `${collectionName}-${Date.now()}`,
          ...args.create,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        list.push(created);
        this.save();
        return created;
      },
      delete: async (args: any) => {
        const list = this.data[collectionName] as any[];
        const idx = list.findIndex((item: any) => this.matchItem(item, args?.where));
        if (idx !== -1) {
          const removed = list.splice(idx, 1)[0];
          this.save();
          return removed;
        }
        return null;
      },
      count: async () => {
        return (this.data[collectionName] as any[]).length;
      },
    };
  }
}
