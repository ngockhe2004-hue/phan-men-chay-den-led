import { 
  Screen, 
  MediaItem, 
  LayoutTemplate, 
  Schedule, 
  ProofOfPlayLog,
  UserAccount,
  UserGroup,
  UserPermission,
  AuditLogEntry,
  UserRole,
  Branch,
  Advertiser,
  HardwareProfile
} from '../types';
import { 
  INITIAL_SCREENS, 
  INITIAL_MEDIA, 
  INITIAL_LAYOUTS, 
  INITIAL_SCHEDULES, 
  INITIAL_PROOF_OF_PLAY,
  INITIAL_PERMISSIONS,
  INITIAL_USER_GROUPS,
  INITIAL_USERS,
  INITIAL_AUDIT_LOGS,
  INITIAL_BRANCHES,
  INITIAL_ADVERTISERS,
  INITIAL_HARDWARE_PROFILES
} from '../mockData';

const STORAGE_KEYS = {
  SCREENS: 'led_cms_screens',
  MEDIA: 'led_cms_media',
  LAYOUTS: 'led_cms_layouts',
  SCHEDULES: 'led_cms_schedules',
  LOGS: 'led_cms_logs',
  EMERGENCY: 'led_cms_emergency',
  USERS: 'led_cms_users',
  GROUPS: 'led_cms_user_groups',
  AUDIT_LOGS: 'led_cms_audit_logs',
  CURRENT_USER: 'led_cms_current_user',
  BRANCHES: 'led_cms_branches',
  ADVERTISERS: 'led_cms_advertisers',
  HARDWARE_PROFILES: 'led_cms_hardware_profiles',
};

export interface EmergencyState {
  isActive: boolean;
  message: string;
  triggeredAt: string;
  mediaUrl?: string;
}

class StorageService {
  private listeners: (() => void)[] = [];

  constructor() {
    this.initDefaultData();
    // Dọn dẹp session cũ còn sót trong localStorage (migration)
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      // Reset users để luôn dùng INITIAL_USERS mới nhất (hỗ trợ admin/admin123)
      localStorage.removeItem(STORAGE_KEYS.USERS);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
      window.addEventListener('storage', () => {
        this.notify();
      });
    }
  }

  private initDefaultData() {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem(STORAGE_KEYS.SCREENS)) {
      localStorage.setItem(STORAGE_KEYS.SCREENS, JSON.stringify(INITIAL_SCREENS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.MEDIA)) {
      localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify(INITIAL_MEDIA));
    }
    if (!localStorage.getItem(STORAGE_KEYS.LAYOUTS)) {
      localStorage.setItem(STORAGE_KEYS.LAYOUTS, JSON.stringify(INITIAL_LAYOUTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SCHEDULES)) {
      localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(INITIAL_SCHEDULES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.LOGS)) {
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(INITIAL_PROOF_OF_PLAY));
    }
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.GROUPS)) {
      localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(INITIAL_USER_GROUPS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.BRANCHES)) {
      localStorage.setItem(STORAGE_KEYS.BRANCHES, JSON.stringify(INITIAL_BRANCHES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ADVERTISERS)) {
      localStorage.setItem(STORAGE_KEYS.ADVERTISERS, JSON.stringify(INITIAL_ADVERTISERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.HARDWARE_PROFILES)) {
      localStorage.setItem(STORAGE_KEYS.HARDWARE_PROFILES, JSON.stringify(INITIAL_HARDWARE_PROFILES));
    }
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('storage'));
    }
  }

  // --- Screens ---
  getScreens(): Screen[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SCREENS);
      return data ? JSON.parse(data) : INITIAL_SCREENS;
    } catch {
      return INITIAL_SCREENS;
    }
  }

  saveScreens(screens: Screen[]) {
    localStorage.setItem(STORAGE_KEYS.SCREENS, JSON.stringify(screens));
    this.notify();
  }

  getScreenById(id: string): Screen | undefined {
    return this.getScreens().find(s => s.id === id);
  }

  getScreenByCode(code: string): Screen | undefined {
    const formatted = code.trim().toUpperCase();
    return this.getScreens().find(s => s.code.toUpperCase() === formatted);
  }

  addScreen(screen: Screen) {
    const screens = this.getScreens();
    screens.push(screen);
    this.saveScreens(screens);
  }

  updateScreen(updatedScreen: Screen) {
    const screens = this.getScreens().map(s => s.id === updatedScreen.id ? updatedScreen : s);
    this.saveScreens(screens);
  }

  deleteScreen(id: string) {
    const screens = this.getScreens().filter(s => s.id !== id);
    this.saveScreens(screens);
  }

  pairScreen(code: string, details: Partial<Screen>): Screen | null {
    const screens = this.getScreens();
    const index = screens.findIndex(s => s.code.toUpperCase() === code.trim().toUpperCase());
    if (index !== -1) {
      screens[index] = {
        ...screens[index],
        ...details,
        status: 'online',
        lastPing: 'Vừa xong'
      };
      this.saveScreens(screens);
      return screens[index];
    } else {
      // Create new screen with this code
      const newScreen: Screen = {
        id: 'screen-' + Date.now(),
        code: code.trim().toUpperCase(),
        name: details.name || `Màn Hình Mới (${code})`,
        location: details.location || 'Chưa phân bổ',
        group: details.group || 'Chung',
        resolution: details.resolution || { width: 1920, height: 1080 },
        orientation: details.orientation || 'landscape',
        status: 'online',
        lastPing: 'Vừa xong',
        ipAddress: '192.168.1.' + Math.floor(Math.random() * 200 + 10),
        currentLayoutId: 'layout-1',
        volume: 80,
        isMuted: false,
        powerState: 'on',
        screenshotUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
        appVersion: 'v2.4.12-pro',
        deviceModel: details.deviceModel || 'Aloloader Android TV Player',
        storageUsed: 4.2,
        storageTotal: 32.0,
      };
      screens.push(newScreen);
      this.saveScreens(screens);
      return newScreen;
    }
  }

  sendRemoteCommand(screenId: string, command: { type: string; value?: any }): boolean {
    const screens = this.getScreens();
    const screen = screens.find(s => s.id === screenId);
    if (!screen) return false;

    if (command.type === 'volume') {
      screen.volume = command.value;
      screen.isMuted = false;
    } else if (command.type === 'mute') {
      screen.isMuted = !screen.isMuted;
    } else if (command.type === 'power') {
      screen.powerState = command.value;
    } else if (command.type === 'reboot') {
      screen.lastPing = 'Đang khởi động lại...';
    } else if (command.type === 'apply_layout') {
      screen.currentLayoutId = command.value;
    } else if (command.type === 'set_image_scale_mode' || command.type === 'scale_mode') {
      screen.imageScaleMode = command.value;
    } else if (command.type === 'screenshot') {
      // Simulate taking screenshot
      screen.lastPing = 'Vừa xong (Đã chụp ảnh)';
    }

    this.saveScreens(screens);
    // Broadcast event for active players
    window.dispatchEvent(new CustomEvent('led_player_command', {
      detail: { screenId, command }
    }));
    return true;
  }

  // --- Media ---
  getMedia(): MediaItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MEDIA);
      let list: MediaItem[] = data ? JSON.parse(data) : INITIAL_MEDIA;
      
      // Tự động khôi phục ảnh/video nếu URL blob cũ bị hết hạn hoặc đường dẫn file cục bộ không tải được
      const defaultImage = 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=800&q=80';
      const defaultVideo = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
      
      const isBadUrl = (u?: string) => {
        if (!u || !u.trim()) return true;
        const str = u.trim();
        return (
          str.startsWith('blob:') ||
          str.startsWith('file:') ||
          str.toLowerCase().includes('fakepath') ||
          /^[a-zA-Z]:\\/.test(str) ||
          /^[a-zA-Z]:\//.test(str)
        );
      };

      let hasFixedBlob = false;
      list = list.map(item => {
        let url = item.url;
        let thumb = item.thumbnail;
        if (isBadUrl(url)) {
          url = item.type === 'video' ? defaultVideo : defaultImage;
          hasFixedBlob = true;
        }
        if (isBadUrl(thumb)) {
          thumb = defaultImage;
          hasFixedBlob = true;
        }
        return {
          ...item,
          url: url || (item.type === 'video' ? defaultVideo : defaultImage),
          thumbnail: thumb || defaultImage
        };
      });

      if (hasFixedBlob) {
        localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify(list));
      }
      return list;
    } catch {
      return INITIAL_MEDIA;
    }
  }

  saveMedia(media: MediaItem[]) {
    localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify(media));
    this.notify();
  }

  addMedia(item: MediaItem) {
    const media = this.getMedia();
    media.unshift(item);
    this.saveMedia(media);
  }

  deleteMedia(id: string) {
    const media = this.getMedia().filter(m => m.id !== id);
    this.saveMedia(media);

    // Đồng thời gỡ bỏ tệp bị xoá khỏi toàn bộ danh sách phát của các bố cục màn hình
    const layouts = this.getLayouts();
    let layoutsChanged = false;
    layouts.forEach(l => {
      let lModified = false;
      l.zones.forEach(z => {
        if (Array.isArray(z.mediaPlaylist)) {
          const prevLen = z.mediaPlaylist.length;
          z.mediaPlaylist = z.mediaPlaylist.filter(p => p.mediaId !== id);
          if (z.mediaPlaylist.length !== prevLen) {
            lModified = true;
            layoutsChanged = true;
          }
        }
      });
      if (lModified) {
        l.updatedAt = new Date().toISOString();
      }
    });
    if (layoutsChanged) {
      this.saveLayouts(layouts);
    }
  }

  // --- Layouts ---
  getLayouts(): LayoutTemplate[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LAYOUTS);
      return data ? JSON.parse(data) : INITIAL_LAYOUTS;
    } catch {
      return INITIAL_LAYOUTS;
    }
  }

  saveLayouts(layouts: LayoutTemplate[]) {
    localStorage.setItem(STORAGE_KEYS.LAYOUTS, JSON.stringify(layouts));
    this.notify();
  }

  getLayoutById(id: string): LayoutTemplate | undefined {
    return this.getLayouts().find(l => l.id === id);
  }

  addLayout(layout: LayoutTemplate) {
    const layouts = this.getLayouts();
    layouts.unshift(layout);
    this.saveLayouts(layouts);
  }

  updateLayout(layout: LayoutTemplate) {
    const layouts = this.getLayouts().map(l => l.id === layout.id ? layout : l);
    this.saveLayouts(layouts);
  }

  deleteLayout(id: string) {
    const layouts = this.getLayouts().filter(l => l.id !== id);
    this.saveLayouts(layouts);
  }

  // --- Schedules ---
  getSchedules(): Schedule[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SCHEDULES);
      return data ? JSON.parse(data) : INITIAL_SCHEDULES;
    } catch {
      return INITIAL_SCHEDULES;
    }
  }

  saveSchedules(schedules: Schedule[]) {
    localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(schedules));
    this.notify();
  }

  addSchedule(schedule: Schedule) {
    const schedules = this.getSchedules();
    schedules.unshift(schedule);
    this.saveSchedules(schedules);
  }

  updateSchedule(schedule: Schedule) {
    const schedules = this.getSchedules().map(s => s.id === schedule.id ? schedule : s);
    this.saveSchedules(schedules);
  }

  deleteSchedule(id: string) {
    const schedules = this.getSchedules().filter(s => s.id !== id);
    this.saveSchedules(schedules);
  }

  // --- Logs ---
  getLogs(): ProofOfPlayLog[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LOGS);
      return data ? JSON.parse(data) : INITIAL_PROOF_OF_PLAY;
    } catch {
      return INITIAL_PROOF_OF_PLAY;
    }
  }

  addLog(log: ProofOfPlayLog) {
    const logs = this.getLogs();
    logs.unshift(log);
    // Keep max 500 logs
    if (logs.length > 500) logs.pop();
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
    this.notify();
  }

  // --- Emergency Broadcast ---
  getEmergencyState(): EmergencyState {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EMERGENCY);
      return data ? JSON.parse(data) : { isActive: false, message: '', triggeredAt: '' };
    } catch {
      return { isActive: false, message: '', triggeredAt: '' };
    }
  }

  triggerEmergency(message: string, mediaUrl?: string) {
    const state: EmergencyState = {
      isActive: true,
      message,
      triggeredAt: new Date().toLocaleTimeString('vi-VN') + ' ' + new Date().toLocaleDateString('vi-VN'),
      mediaUrl
    };
    localStorage.setItem(STORAGE_KEYS.EMERGENCY, JSON.stringify(state));
    this.notify();
    window.dispatchEvent(new CustomEvent('led_emergency_broadcast', { detail: state }));
  }

  cancelEmergency() {
    const state: EmergencyState = {
      isActive: false,
      message: '',
      triggeredAt: ''
    };
    localStorage.setItem(STORAGE_KEYS.EMERGENCY, JSON.stringify(state));
    this.notify();
    window.dispatchEvent(new CustomEvent('led_emergency_broadcast', { detail: state }));
  }

  // ─────────────────────────────────────────────
  // Auth & Current Session
  // ─────────────────────────────────────────────
  getCurrentUser(): UserAccount | null {
    try {
      // Dùng sessionStorage: session tự hết hạn khi đóng tab/trình duyệt
      const data = sessionStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  login(email: string, password?: string, role?: UserRole): UserAccount | null {
    const users = this.getUsers();
    const inputClean = email.trim().toLowerCase();

    // Chấp nhận mật khẩu: admin123 hoặc 123456 (legacy)
    const VALID_PASSWORDS = ['admin123', '123456'];
    const isValidPassword = password === undefined || VALID_PASSWORDS.includes(password.trim());

    if (!isValidPassword) return null;

    // Tìm user: ưu tiên khớp email, sau đó username "admin" → lấy SUPER_ADMIN đầu tiên
    let user: UserAccount | undefined;

    if (inputClean === 'admin') {
      // username "admin" → lấy user SUPER_ADMIN đầu tiên
      user = users.find(u => u.role === 'SUPER_ADMIN' && u.isActive);
      if (!user) user = users.find(u => u.isActive); // fallback: user bất kỳ còn hoạt động
    } else {
      user = users.find(u => u.email.toLowerCase() === inputClean && u.isActive);
    }

    // Fallback thêm theo role nếu được truyền vào
    if (!user && role) {
      user = users.find(u => u.role === role && u.isActive);
    }

    if (user) {
      user.lastLoginAt = 'Vừa xong';
      this.updateUser(user);
      sessionStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      this.addAuditLog('LOGIN', 'AUTH', `Đăng nhập thành công vào hệ thống với vai trò ${user.role}`);
      this.notify();
      return user;
    }
    return null;
  }

  logout() {
    const current = this.getCurrentUser();
    if (current) {
      this.addAuditLog('LOGOUT', 'AUTH', `Đăng xuất khỏi hệ thống CMS`);
    }
    sessionStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    this.notify();
  }

  changePassword(oldPass: string, newPass: string): { success: boolean; message: string } {
    if (!newPass || newPass.length < 6) {
      return { success: false, message: 'Mật khẩu mới phải có tối thiểu 6 ký tự' };
    }
    const current = this.getCurrentUser();
    if (current) {
      this.addAuditLog('UPDATE', 'AUTH', `Người dùng ${current.name} đã đổi mật khẩu đăng nhập`);
      return { success: true, message: 'Đổi mật khẩu thành công!' };
    }
    return { success: false, message: 'Chưa đăng nhập' };
  }

  // ─────────────────────────────────────────────
  // User Management
  // ─────────────────────────────────────────────
  getUsers(): UserAccount[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      return data ? JSON.parse(data) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  }

  getUserById(id: string): UserAccount | undefined {
    return this.getUsers().find(u => u.id === id);
  }

  addUser(user: UserAccount) {
    const users = this.getUsers();
    users.unshift(user);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    this.addAuditLog('CREATE', 'IAM', `Thêm mới tài khoản người dùng: ${user.name} (${user.email}) - Vai trò: ${user.role}`);
    this.notify();
  }

  updateUser(updated: UserAccount) {
    const users = this.getUsers().map(u => u.id === updated.id ? updated : u);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    
    // Nếu cập nhật tài khoản đang đăng nhập, đồng bộ session
    const current = this.getCurrentUser();
    if (current && current.id === updated.id) {
      sessionStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updated));
    }
    this.addAuditLog('UPDATE', 'IAM', `Cập nhật thông tin tài khoản người dùng: ${updated.name}`);
    this.notify();
  }

  deleteUser(id: string) {
    const user = this.getUserById(id);
    const users = this.getUsers().filter(u => u.id !== id);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    if (user) {
      this.addAuditLog('DELETE', 'IAM', `Xóa tài khoản người dùng: ${user.name} (${user.email})`);
    }
    this.notify();
  }

  // ─────────────────────────────────────────────
  // User Groups & Permissions
  // ─────────────────────────────────────────────
  getUserGroups(): UserGroup[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GROUPS);
      return data ? JSON.parse(data) : INITIAL_USER_GROUPS;
    } catch {
      return INITIAL_USER_GROUPS;
    }
  }

  getUserGroupById(id: string): UserGroup | undefined {
    return this.getUserGroups().find(g => g.id === id);
  }

  addUserGroup(group: UserGroup) {
    const groups = this.getUserGroups();
    groups.push(group);
    localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(groups));
    this.addAuditLog('CREATE', 'IAM', `Tạo nhóm tài khoản mới: "${group.name}" (${group.code})`);
    this.notify();
  }

  updateUserGroup(updated: UserGroup) {
    const groups = this.getUserGroups().map(g => g.id === updated.id ? updated : g);
    localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(groups));
    this.addAuditLog('UPDATE', 'IAM', `Cập nhật nhóm và phân quyền nhóm: "${updated.name}"`);
    this.notify();
  }

  deleteUserGroup(id: string) {
    const group = this.getUserGroupById(id);
    const groups = this.getUserGroups().filter(g => g.id !== id);
    localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(groups));
    if (group) {
      this.addAuditLog('DELETE', 'IAM', `Xóa nhóm tài khoản: "${group.name}"`);
    }
    this.notify();
  }

  copyPermissions(sourceGroupId: string, targetGroupId: string) {
    const source = this.getUserGroupById(sourceGroupId);
    const target = this.getUserGroupById(targetGroupId);
    if (source && target) {
      target.permissions = [...source.permissions];
      this.updateUserGroup(target);
      this.addAuditLog('UPDATE', 'IAM', `Sao chép phân quyền từ nhóm "${source.name}" sang nhóm "${target.name}"`);
    }
  }

  // ─────────────────────────────────────────────
  // Audit Logs (Lịch sử thao tác & truy cập)
  // ─────────────────────────────────────────────
  getAuditLogs(): AuditLogEntry[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      return data ? JSON.parse(data) : INITIAL_AUDIT_LOGS;
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  }

  addAuditLog(action: AuditLogEntry['action'], module: AuditLogEntry['module'], details: string) {
    const current = this.getCurrentUser();
    const logs = this.getAuditLogs();
    const newEntry: AuditLogEntry = {
      id: 'audit-' + Date.now(),
      userId: current ? current.id : 'system',
      userName: current ? current.name : 'Hệ thống tự động',
      action,
      module,
      details,
      ipAddress: '113.161.72.18 (Việt Nam)',
      timestamp: new Date().toLocaleTimeString('vi-VN') + ' ' + new Date().toLocaleDateString('vi-VN')
    };
    logs.unshift(newEntry);
    if (logs.length > 500) logs.pop();
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs));
    this.notify();
  }

  // ─────────────────────────────────────────────
  // Branch Management (Chi nhánh)
  // ─────────────────────────────────────────────
  getBranches(): Branch[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BRANCHES);
      return data ? JSON.parse(data) : INITIAL_BRANCHES;
    } catch {
      return INITIAL_BRANCHES;
    }
  }

  saveBranches(branches: Branch[]) {
    localStorage.setItem(STORAGE_KEYS.BRANCHES, JSON.stringify(branches));
    this.notify();
  }

  addBranch(branch: Branch) {
    const branches = this.getBranches();
    branches.push(branch);
    this.saveBranches(branches);
    this.addAuditLog('CREATE', 'CRM', `Tạo chi nhánh mới: "${branch.name}" (${branch.code})`);
  }

  updateBranch(updated: Branch) {
    const branches = this.getBranches().map(b => b.id === updated.id ? updated : b);
    this.saveBranches(branches);
    this.addAuditLog('UPDATE', 'CRM', `Cập nhật thông tin chi nhánh: "${updated.name}"`);
  }

  deleteBranch(id: string) {
    const branch = this.getBranches().find(b => b.id === id);
    const branches = this.getBranches().filter(b => b.id !== id);
    this.saveBranches(branches);
    if (branch) {
      this.addAuditLog('DELETE', 'CRM', `Xóa chi nhánh: "${branch.name}"`);
    }
  }

  // ─────────────────────────────────────────────
  // Advertiser Management (Khách hàng Quảng Cáo)
  // ─────────────────────────────────────────────
  getAdvertisers(): Advertiser[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ADVERTISERS);
      return data ? JSON.parse(data) : INITIAL_ADVERTISERS;
    } catch {
      return INITIAL_ADVERTISERS;
    }
  }

  saveAdvertisers(advertisers: Advertiser[]) {
    localStorage.setItem(STORAGE_KEYS.ADVERTISERS, JSON.stringify(advertisers));
    this.notify();
  }

  addAdvertiser(advertiser: Advertiser) {
    const list = this.getAdvertisers();
    list.unshift(advertiser);
    this.saveAdvertisers(list);
    this.addAuditLog('CREATE', 'CRM', `Thêm khách hàng quảng cáo mới: "${advertiser.name}" (${advertiser.code})`);
  }

  updateAdvertiser(updated: Advertiser) {
    const list = this.getAdvertisers().map(a => a.id === updated.id ? updated : a);
    this.saveAdvertisers(list);
    this.addAuditLog('UPDATE', 'CRM', `Cập nhật thông tin khách hàng: "${updated.name}"`);
  }

  deleteAdvertiser(id: string) {
    const adv = this.getAdvertisers().find(a => a.id === id);
    const list = this.getAdvertisers().filter(a => a.id !== id);
    this.saveAdvertisers(list);
    if (adv) {
      this.addAuditLog('DELETE', 'CRM', `Xóa khách hàng quảng cáo: "${adv.name}"`);
    }
  }

  // ─────────────────────────────────────────────
  // Hardware Profile Management (Loại Thiết Bị LED)
  // ─────────────────────────────────────────────
  getHardwareProfiles(): HardwareProfile[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HARDWARE_PROFILES);
      return data ? JSON.parse(data) : INITIAL_HARDWARE_PROFILES;
    } catch {
      return INITIAL_HARDWARE_PROFILES;
    }
  }

  saveHardwareProfiles(profiles: HardwareProfile[]) {
    localStorage.setItem(STORAGE_KEYS.HARDWARE_PROFILES, JSON.stringify(profiles));
    this.notify();
  }

  addHardwareProfile(profile: HardwareProfile) {
    const list = this.getHardwareProfiles();
    list.push(profile);
    this.saveHardwareProfiles(list);
    this.addAuditLog('CREATE', 'CRM', `Thêm loại thiết bị LED mới: "${profile.name}" (${profile.code})`);
  }

  updateHardwareProfile(updated: HardwareProfile) {
    const list = this.getHardwareProfiles().map(p => p.id === updated.id ? updated : p);
    this.saveHardwareProfiles(list);
    this.addAuditLog('UPDATE', 'CRM', `Cập nhật thông số phần cứng: "${updated.name}"`);
  }

  deleteHardwareProfile(id: string) {
    const profile = this.getHardwareProfiles().find(p => p.id === id);
    const list = this.getHardwareProfiles().filter(p => p.id !== id);
    this.saveHardwareProfiles(list);
    if (profile) {
      this.addAuditLog('DELETE', 'CRM', `Xóa loại thiết bị: "${profile.name}"`);
    }
  }
}

export const storageService = new StorageService();
