/**
 * LED PLAYER - STANDALONE JAVASCRIPT ENGINE
 * Version: 1.0.0
 * Chạy độc lập trên Chrome/WebView Android
 * Kết nối CMS qua REST API hoặc localStorage (same-machine)
 */

// ============================================================
//  CONFIG
// ============================================================
const PLAYER_VERSION = '1.0.0';
const HEARTBEAT_INTERVAL = 30000;   // 30 giây
const POLL_INTERVAL      = 10000;   // 10 giây kiểm tra lệnh mới
const STORAGE_KEY_CONFIG = 'led_player_config';
const STORAGE_KEY_PAIR   = 'led_player_pair_info';

// ============================================================
//  STATE
// ============================================================
const state = {
  serverUrl: '',
  pairingCode: '',
  screenId: '',
  screenName: '',
  screen: null,
  layout: null,
  mediaCache: {},          // { id: MediaItem }
  zoneTimers: {},          // { zoneId: intervalId }
  zoneStates: {},          // { zoneId: { index, mediaItems } }
  emergency: { isActive: false, message: '' },
  isOnline: true,
  heartbeatTimer: null,
  pollTimer: null,
  clockTimer: null,
  transitionEffect: 'crossfade',
  hudVisible: true,
  hudHideTimeout: null,
  useLocalStorage: false,  // chế độ không cần backend
};

// Helper to generate unique device pairing code
function generateDeviceCode() {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `LED-${num}`;
}

function readFromCMS(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || 'null');
  } catch {
    return null;
  }
}

function writeToCMS(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    window.dispatchEvent(new Event('storage'));
  } catch {}
}

// ============================================================
//  DOM REFS
// ============================================================
const $ = (id) => document.getElementById(id);
const DOM = {
  pairingScreen:      () => $('pairing-screen'),
  playerScreen:       () => $('player-screen'),
  zonesContainer:     () => $('zones-container'),
  emergencyOverlay:   () => $('emergency-overlay'),
  emergencyMsg:       () => $('emergency-msg'),
  screenOffOverlay:   () => $('screen-off-overlay'),
  screenOffLabel:     () => $('screen-off-label'),
  statusHud:          () => $('status-hud'),
  hudDot:             () => $('hud-dot'),
  hudStatus:          () => $('hud-status'),
  hudCode:            () => $('hud-code'),
  hudTime:            () => $('hud-time'),
  hudLayout:          () => $('hud-layout'),
  
  // Step 1: Login
  stepLogin:          () => $('step-login'),
  pairingServer:      () => $('input-server'),
  inputEmail:         () => $('input-email'),
  inputPassword:      () => $('input-password'),
  btnLogin:           () => $('btn-login'),
  pairingStatus:      () => $('pairing-status'),
  pairingStatusTxt:   () => $('pairing-status-text'),
  btnLocalMode:       () => $('btn-local-mode'),

  // Step 2: Confirm & Rename
  stepConfirm:        () => $('step-confirm'),
  userBadgeName:      () => $('user-badge-name'),
  deviceCodeDisplay:  () => $('device-code-display'),
  inputScreenName:    () => $('input-screen-name'),
  selectScreenGroup:  () => $('select-screen-group'),
  inputScreenLocation:() => $('input-screen-location'),
  btnConfirmDevice:   () => $('btn-confirm-device'),
  btnLogout:          () => $('btn-logout'),
  confirmStatus:      () => $('confirm-status'),
  confirmStatusTxt:   () => $('confirm-status-text'),
};

// ============================================================
//  PAIRING & LOGIN FLOW
// ============================================================
function initPairingEvents() {
  DOM.btnLogin().addEventListener('click', handleLoginSubmit);
  DOM.inputEmail().addEventListener('keydown', e => { if (e.key === 'Enter') handleLoginSubmit(); });
  DOM.inputPassword().addEventListener('keydown', e => { if (e.key === 'Enter') handleLoginSubmit(); });
  DOM.btnLocalMode().addEventListener('click', handleLocalLogin);
  DOM.btnConfirmDevice().addEventListener('click', handleConfirmDevice);
  DOM.btnLogout().addEventListener('click', handleLogout);

  // Load saved config
  const saved = loadSavedConfig();
  if (saved) {
    DOM.pairingServer().value = saved.serverUrl || '';
    if (saved.pairingCode) {
      state.pairingCode = saved.pairingCode;
      state.screenName = saved.screenName || '';
    }
  }
}

async function handleLoginSubmit() {
  const server = DOM.pairingServer().value.trim().replace(/\/$/, '') || 'http://localhost:5000';
  const email = DOM.inputEmail().value.trim();
  const password = DOM.inputPassword().value.trim();

  if (!email || !password) {
    showPairingStatus('error', '⚠ Vui lòng nhập đầy đủ Tài Khoản / Email và Mật Khẩu!');
    return;
  }

  showPairingStatus('loading', 'Đang xác thực tài khoản với Server CMS...');
  DOM.btnLogin().disabled = true;

  try {
    state.serverUrl = server;
    state.useLocalStorage = false;

    // POST /api/auth/login
    let userData = null;
    try {
      const resp = await fetch(`${server}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!resp.ok) {
        const errJson = await resp.json().catch(() => ({}));
        throw new Error(errJson.message || 'Email hoặc mật khẩu không chính xác');
      }

      const res = await resp.json();
      userData = res.user;
      state.userToken = res.accessToken;
    } catch (apiErr) {
      // Fallback cho tài khoản admin (local hoặc khi backend offline)
      if (password === 'admin123' && (
        email === 'admin' || 
        email === 'admin@led.vn' || 
        email === 'admin@ledsignage.vn' ||
        email === 'admin@ledcms.vn'
      )) {
        userData = { email, name: 'Quản Trị Viên (Admin Local)' };
        state.useLocalStorage = true;
      } else {
        throw apiErr;
      }
    }

    // Tự động kết nối trang quản trị CMS & bắt đầu phát
    autoConnectDevice(userData);

  } catch (err) {
    showPairingStatus('error', `✗ Lỗi đăng nhập: ${err.message}`);
    DOM.btnLogin().disabled = false;
  }
}

function handleLocalLogin() {
  state.useLocalStorage = true;
  state.serverUrl = (typeof window !== 'undefined' && window.location.origin) ? window.location.origin : 'http://localhost:3000';
  const email = DOM.inputEmail().value.trim() || 'admin@ledcms.vn';
  const userData = { email, name: 'Quản Trị Viên (Local CMS)' };

  // Tự động kết nối trang quản trị CMS & bắt đầu phát
  autoConnectDevice(userData);
}

async function autoConnectDevice(user) {
  // Sinh mã ghép nối độc bản nếu chưa có
  if (!state.pairingCode) {
    const saved = loadSavedConfig();
    state.pairingCode = saved?.pairingCode || generateDeviceCode();
  }

  const defaultName = state.screenName || `Màn Hình LED (${state.pairingCode})`;
  const group = 'Sảnh Đón Tiếp';
  const location = 'Tự động kết nối CMS';

  showPairingStatus('loading', `⚡ [${user.name || user.email}] Đã xác thực! Đang tự động kết nối trang quản trị CMS & ghép nối mã ${state.pairingCode}...`);

  try {
    let screen = null;

    if (state.useLocalStorage) {
      // Local Mode: Đọc và ghi trực tiếp vào localStorage CMS
      let screens = readFromCMS('led_cms_screens') || [];
      let index = screens.findIndex(s => s.code.toUpperCase() === state.pairingCode.toUpperCase());

      if (index !== -1) {
        screens[index] = {
          ...screens[index],
          status: 'online',
          lastPing: 'Vừa xong',
        };
        screen = screens[index];
      } else {
        screen = {
          id: 'screen-' + Date.now(),
          code: state.pairingCode,
          name: defaultName,
          group,
          location,
          resolution: { width: 1920, height: 1080 },
          orientation: 'landscape',
          status: 'online',
          lastPing: 'Vừa xong',
          ipAddress: '127.0.0.1',
          currentLayoutId: screens[0]?.currentLayoutId || null,
        };
        screens.push(screen);
      }
      writeToCMS('led_cms_screens', screens);

    } else {
      // API Mode: POST /api/player/pair
      const resp = await fetch(`${state.serverUrl}/api/player/pair`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: state.pairingCode,
          name: defaultName,
          group,
          location,
          ipAddress: 'unknown',
          deviceModel: navigator.userAgent.substring(0, 80),
          appVersion: PLAYER_VERSION,
          status: 'online',
        }),
      });

      if (!resp.ok) throw new Error(`Server trả về lỗi: ${resp.status}`);
      screen = await resp.json();
    }

    state.screenId = screen.id;
    state.screenName = screen.name;
    state.screen = screen;

    savePairInfo({
      serverUrl: state.serverUrl,
      pairingCode: state.pairingCode,
      screenId: screen.id,
      screenName: screen.name,
      useLocalStorage: state.useLocalStorage,
    });

    showPairingStatus('success', `🎉 Đã tự động kết nối trang quản trị CMS thành công! Mã thiết bị: ${state.pairingCode}. Đang phát...`);

    setTimeout(() => {
      startPlayer();
    }, 1000);

  } catch (err) {
    showPairingStatus('error', `✗ Lỗi kết nối tự động: ${err.message}`);
    DOM.btnLogin().disabled = false;
  }
}

function showConfirmStep(user) {
  // Sinh mã ghép nối nếu chưa có
  if (!state.pairingCode) {
    const saved = loadSavedConfig();
    state.pairingCode = saved?.pairingCode || generateDeviceCode();
  }

  if (DOM.userBadgeName()) DOM.userBadgeName().textContent = `Đã đăng nhập: ${user.name || user.email}`;
  if (DOM.deviceCodeDisplay()) DOM.deviceCodeDisplay().textContent = state.pairingCode;

  const defaultName = state.screenName || `Màn Hình LED (${state.pairingCode})`;
  if (DOM.inputScreenName()) DOM.inputScreenName().value = defaultName;

  DOM.stepLogin().style.display = 'none';
  DOM.stepConfirm().style.display = 'block';
}

async function handleConfirmDevice() {
  const screenName = DOM.inputScreenName().value.trim() || `Màn Hình LED (${state.pairingCode})`;
  const group = DOM.selectScreenGroup().value;
  const location = DOM.inputScreenLocation().value.trim() || 'Chưa phân bổ';

  showConfirmStatus('loading', `Đang xác nhận mã ${state.pairingCode} và đăng ký thiết bị...`);
  DOM.btnConfirmDevice().disabled = true;

  try {
    let screen = null;

    if (state.useLocalStorage) {
      // Local mode: lưu vào localStorage của CMS
      let screens = readFromCMS('led_cms_screens') || [];
      let index = screens.findIndex(s => s.code.toUpperCase() === state.pairingCode.toUpperCase());

      if (index !== -1) {
        screens[index] = {
          ...screens[index],
          name: screenName,
          group,
          location,
          status: 'online',
          lastPing: 'Vừa xong',
        };
        screen = screens[index];
      } else {
        screen = {
          id: 'screen-' + Date.now(),
          code: state.pairingCode,
          name: screenName,
          group,
          location,
          resolution: { width: 1920, height: 1080 },
          orientation: 'landscape',
          status: 'online',
          lastPing: 'Vừa xong',
          ipAddress: '127.0.0.1',
          currentLayoutId: screens[0]?.currentLayoutId || null,
        };
        screens.push(screen);
      }
      writeToCMS('led_cms_screens', screens);

    } else {
      // API Mode: POST /api/player/pair
      const resp = await fetch(`${state.serverUrl}/api/player/pair`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: state.pairingCode,
          name: screenName,
          group,
          location,
          ipAddress: 'unknown',
          deviceModel: navigator.userAgent.substring(0, 80),
          appVersion: PLAYER_VERSION,
          status: 'online',
        }),
      });

      if (!resp.ok) throw new Error(`Server trả về lỗi: ${resp.status}`);
      screen = await resp.json();
    }

    state.screenId = screen.id;
    state.screenName = screen.name;
    state.screen = screen;

    savePairInfo({
      serverUrl: state.serverUrl,
      pairingCode: state.pairingCode,
      screenId: screen.id,
      screenName: screen.name,
      useLocalStorage: state.useLocalStorage,
    });

    showConfirmStatus('success', `✓ Đã xác nhận mã ${state.pairingCode}! Đặt tên: "${screen.name}". Đang mở trình phát...`);

    setTimeout(() => startPlayer(), 1200);

  } catch (err) {
    showConfirmStatus('error', `✗ Lỗi xác nhận: ${err.message}`);
    DOM.btnConfirmDevice().disabled = false;
  }
}

function handleLogout() {
  DOM.stepConfirm().style.display = 'none';
  DOM.stepLogin().style.display = 'block';
  DOM.pairingStatus().style.display = 'none';
  DOM.confirmStatus().style.display = 'none';
  state.pairingCode = '';
}

function showPairingStatus(type, msg) {
  const el = DOM.pairingStatus();
  el.className = 'pairing-status ' + type;
  DOM.pairingStatusTxt().textContent = msg;
}

function showConfirmStatus(type, msg) {
  const el = DOM.confirmStatus();
  el.className = 'pairing-status ' + type;
  DOM.confirmStatusTxt().textContent = msg;
}

// ============================================================
//  START PLAYER
// ============================================================
function startPlayer() {
  DOM.pairingScreen().style.display = 'none';
  DOM.playerScreen().classList.add('active');

  // Start clocks
  updateHudTime();
  state.clockTimer = setInterval(updateHudTime, 1000);

  // Initial fetch + render
  fetchConfigAndRender();

  // Heartbeat
  state.heartbeatTimer = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);

  // Poll for updates / commands
  state.pollTimer = setInterval(fetchConfigAndRender, POLL_INTERVAL);

  // Auto-hide HUD after 5s
  scheduleHudHide();

  // Transition key: listen localStorage changes (same-machine CMS commands)
  window.addEventListener('storage', handleStorageEvent);
}

// ============================================================
//  FETCH CONFIG & RENDER
// ============================================================
async function fetchConfigAndRender() {
  try {
    let screen, layout, mediaList;

    if (state.useLocalStorage) {
      // ---- LOCAL MODE: đọc từ localStorage CMS ----
      const screens  = readFromCMS('led_cms_screens');
      const layouts  = readFromCMS('led_cms_layouts');
      const media    = readFromCMS('led_cms_media');
      const emergency= readFromCMS('led_cms_emergency');

      screen = screens?.find(s => s.id === state.screenId) || screens?.[0];
      if (!screen) return;

      layout = layouts?.find(l => l.id === screen.currentLayoutId) || layouts?.[0];
      mediaList = media || [];

      // Emergency từ localStorage
      if (emergency?.isActive) {
        setEmergency(true, emergency.message);
      } else {
        setEmergency(false, '');
      }

    } else {
      // ---- API MODE ----
      const configResp = await fetch(`${state.serverUrl}/api/player/config/${state.pairingCode}`);
      if (!configResp.ok) throw new Error('Config fetch failed');
      const config = await configResp.json();

      screen    = config.screen;
      layout    = config.layout;
      mediaList = config.mediaItems || [];
    }

    state.screen = screen;
    state.isOnline = true;
    setOnlineStatus(true);

    // Cập nhật screen state
    applyScreenState(screen);

    // Build media cache - rebuild from scratch to remove deleted items
    state.mediaCache = {};
    if (mediaList) {
      mediaList.forEach(m => { state.mediaCache[m.id] = m; });
    }

    // Render layout nếu có bất kỳ thay đổi nào (ID, thời gian sửa, hoặc danh sách tệp trong các zones)
    const layoutSig = layout ? `${layout.id}_${layout.updatedAt || ''}_${JSON.stringify((layout.zones || []).map(z => [z.id, (z.mediaPlaylist || []).map(p => p.mediaId + (p.enabled !== false ? '1' : '0'))]))}` : '';
    if (layout && layoutSig !== state._lastLayoutSig) {
      state.layout = layout;
      state._lastLayoutSig = layoutSig;
      state._lastLayoutId = layout.id;
      renderLayout(layout);
    } else if (state.layout) {
      // Re-render các zone đang phát để cập nhật playlist
      refreshAllMediaZones();
    }

    updateHud();

  } catch (err) {
    state.isOnline = false;
    setOnlineStatus(false);
    console.warn('[Player] Fetch error:', err.message);
    // Nếu có layout cached, tiếp tục phát offline
  }
}

// ============================================================
//  SCREEN STATE
// ============================================================
function applyScreenState(screen) {
  if (!screen) return;

  // Power state
  const isOff = screen.powerState === 'off' || screen.powerState === 'sleep';
  DOM.screenOffOverlay().classList.toggle('active', isOff);
  if (isOff) {
    DOM.screenOffLabel().textContent =
      screen.powerState === 'sleep' ? 'CHẾ ĐỘ NGHỈ (SLEEP MODE)' : 'MÀN HÌNH ĐANG TẮT (OFF)';
  }

  // Volume
  syncVolume(screen.isMuted ? 0 : (screen.volume || 80));
}

function syncVolume(vol) {
  const pct = vol / 100;
  document.querySelectorAll('video').forEach(v => { v.volume = pct; });
}

// ============================================================
//  LAYOUT RENDERING
// ============================================================

/**
 * Làm mới tất cả các zone đang phát khi media bị xoá/thêm mà không reload layout
 * Được gọi sau mỗi lần poll nếu layout không thay đổi
 */
function refreshAllMediaZones() {
  Object.entries(state.zoneStates).forEach(([zoneId, s]) => {
    if (!s || !s.zone) return;

    // Lọc playlist theo mediaCache hiện tại
    const freshPlaylist = s.playlist.filter(m => !!state.mediaCache[m.id]);
    const freshItems = s.playlistItems.filter(p => !!state.mediaCache[p.mediaId]);

    const wrapper = document.querySelector(`#zone-${zoneId} .zone-media`);
    if (!wrapper) return;

    if (freshPlaylist.length === 0) {
      // Tất cả media đã bị xóa - dừng timer và hiển thị placeholder
      if (state.zoneTimers[zoneId]) {
        clearTimeout(state.zoneTimers[zoneId]);
        delete state.zoneTimers[zoneId];
      }
      wrapper.innerHTML = `
        <div class="zone-empty-msg" style="color:#64748b;font-size:12px;font-family:sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;background:#020617;text-align:center;padding:12px;">
          <span style="font-weight:600;color:#94a3b8;">Chưa có tệp trình chiếu nào</span>
          <span style="font-size:10px;color:#475569;margin-top:2px;">(Đã xoá hết hình khỏi thiết bị)</span>
        </div>`;
      s.playlist = [];
      s.playlistItems = [];
      return;
    }

    // Có sự thay đổi trong playlist (một số media bị xóa)
    if (freshPlaylist.length !== s.playlist.length) {
      s.playlist = freshPlaylist;
      s.playlistItems = freshItems.length > 0 ? freshItems : freshPlaylist.map(m => ({ mediaId: m.id, duration: m.duration || 10 }));
      
      const targetIndex = s.isSecondary ? (1 % s.playlist.length) : 0;
      s.index = targetIndex;
      if (state.zoneTimers[zoneId]) {
        clearTimeout(state.zoneTimers[zoneId]);
        delete state.zoneTimers[zoneId];
      }
      wrapper.querySelector('.zone-empty-msg')?.remove();
      renderMediaItem(zoneId, wrapper, s.playlist[targetIndex], s.playlistItems[targetIndex], s.zone);

      if (s.isSecondary) {
        let badge = wrapper.querySelector('.small-zone-badge');
        if (badge) {
          badge.textContent = `→ Tiếp theo: ${(targetIndex + 1)}/${s.playlist.length}`;
        }
      }

      if (!s.isSecondary && s.playlist.length > 1) {
        const dur = (s.playlistItems[targetIndex]?.duration || s.playlist[targetIndex]?.duration || 10) * 1000;
        state.zoneTimers[zoneId] = setTimeout(() => advanceZone(zoneId), dur);
      }
    }
  });
}

function renderLayout(layout) {
  if (!layout || !layout.zones) return;

  // Clear existing zones & timers
  clearAllZoneTimers();
  DOM.zonesContainer().innerHTML = '';
  state.zoneStates = {};

  // Phân loại hình lớn và hình nhỏ
  const mediaZones = (layout.zones || []).filter(z => z.type === 'video' || z.type === 'image_slider');
  const sortedMediaZones = [...mediaZones].sort((a, b) => (b.width * b.height) - (a.width * a.height));
  const primaryZone = sortedMediaZones[0] || null;
  const secondaryZone = sortedMediaZones.length > 1 ? sortedMediaZones[1] : null;

  state.primaryZoneId = primaryZone ? primaryZone.id : null;
  state.secondaryZoneId = secondaryZone ? secondaryZone.id : null;

  // Render primaryZone trước để khởi tạo playlist chuẩn
  if (primaryZone) {
    renderZone(primaryZone);
  }
  layout.zones.forEach(zone => {
    if (!primaryZone || zone.id !== primaryZone.id) {
      renderZone(zone);
    }
  });
}

function renderZone(zone) {
  const el = document.createElement('div');
  el.className = 'zone';
  el.id = `zone-${zone.id}`;
  el.style.cssText = `
    left:${zone.x}%;
    top:${zone.y}%;
    width:${zone.width}%;
    height:${zone.height}%;
    z-index:${zone.zIndex || 1};
    background-color:${zone.type === 'ticker' ? (zone.tickerBgColor || '#0f172a') : '#000'};
  `;

  switch (zone.type) {
    case 'video':
    case 'image_slider':
      renderMediaZone(el, zone);
      break;
    case 'ticker':
      renderTickerZone(el, zone);
      break;
    case 'widget':
      renderWidgetZone(el, zone);
      break;
    case 'webpage':
      renderWebpageZone(el, zone);
      break;
    default:
      renderMediaZone(el, zone);
  }

  DOM.zonesContainer().appendChild(el);
}

// ---- Media Zone (Video + Image Slider) ----
function renderMediaZone(container, zone) {
  const isPrimary = zone.id === state.primaryZoneId;
  const isSecondary = state.secondaryZoneId && zone.id === state.secondaryZoneId;

  const isConfigured = Array.isArray(zone.mediaPlaylist);
  const enabledItems = (zone.mediaPlaylist || []).filter(p => p.enabled !== false);
  const mediaItems = enabledItems
    .map(p => state.mediaCache[p.mediaId])
    .filter(Boolean);

  let playlist = [];
  let playlistItems = [];

  if (isSecondary && state.primaryZoneId && state.zoneStates[state.primaryZoneId]) {
    // HÌNH NHỎ: Dùng chung playlist với hình lớn để hiển thị hình tiếp theo của hình lớn
    const primaryState = state.zoneStates[state.primaryZoneId];
    playlist = primaryState.playlist;
    playlistItems = primaryState.playlistItems;
  } else {
    // Tuyệt đối KHÔNG fallback sang mediaCache nếu zone.mediaPlaylist đã được cấu hình (kể cả rỗng [] khi xoá hết hình)
    const fallback = isConfigured ? [] : Object.values(state.mediaCache).filter(m =>
      zone.type === 'video' ? m.type === 'video' : m.type === 'image'
    );
    playlist = mediaItems.length > 0 ? mediaItems : (isConfigured ? [] : fallback);
    playlistItems = mediaItems.length > 0 ? enabledItems : playlist.map(m => ({ mediaId: m.id, duration: m.duration || 10 }));
  }

  // Nếu playlist rỗng (người dùng đã xoá hết hình trong thiết bị)
  if (playlist.length === 0) {
    container.innerHTML = `
      <div class="zone-media zone-empty" style="color:#64748b;font-size:12px;font-family:sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;background:#020617;text-align:center;padding:12px;">
        <svg style="width:28px;height:28px;opacity:0.4;margin-bottom:6px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        <span style="font-weight:600;color:#94a3b8;">Chưa có tệp trình chiếu nào</span>
        <span style="font-size:10px;color:#475569;margin-top:2px;">(Đã xoá hết hình khỏi thiết bị)</span>
      </div>`;
    state.zoneStates[zone.id] = { index: 0, playlist: [], playlistItems: [], zone, isPrimary, isSecondary };
    return;
  }

  // Vị trí index ban đầu:
  // Nếu là hình lớn (hoặc zone độc lập): index = 0
  // Nếu là hình nhỏ: index = 1 (hoặc 0 nếu chỉ có 1 hình)
  const initialIndex = isSecondary ? (1 % playlist.length) : 0;
  state.zoneStates[zone.id] = { index: initialIndex, playlist, playlistItems, zone, isPrimary, isSecondary };

  const wrapper = document.createElement('div');
  wrapper.className = 'zone-media';

  const progressBar = document.createElement('div');
  progressBar.className = 'media-progress';
  progressBar.innerHTML = '<div class="media-progress-fill" id="progress-' + zone.id + '"></div>';
  wrapper.appendChild(progressBar);

  if (isSecondary) {
    const badge = document.createElement('div');
    badge.className = 'small-zone-badge';
    badge.style.cssText = 'position:absolute;top:8px;right:8px;z-index:20;background:rgba(8,145,178,0.9);color:#fff;font-size:10px;font-weight:bold;font-family:monospace;padding:2px 8px;border-radius:9999px;box-shadow:0 2px 8px rgba(0,0,0,0.5);border:1px solid rgba(103,232,249,0.5);pointer-events:none;';
    badge.textContent = `→ Tiếp theo: ${(initialIndex + 1)}/${playlist.length}`;
    wrapper.appendChild(badge);
  }

  container.appendChild(wrapper);

  // Render initial media
  renderMediaItem(zone.id, wrapper, playlist[initialIndex], playlistItems[initialIndex], zone);

  // Auto-advance: CHỈ zone hình lớn (hoặc zone độc lập) chạy timer
  // Zone hình nhỏ không chạy timer độc lập mà chuyển đồng bộ cùng hình lớn!
  if (!isSecondary && playlist.length > 1) {
    const duration = (playlistItems[initialIndex]?.duration || playlist[initialIndex]?.duration || 10) * 1000;
    state.zoneTimers[zone.id] = setTimeout(() => advanceZone(zone.id), duration);
  }
}

function renderMediaItem(zoneId, wrapper, media, playlistItem, zone) {
  if (!media) return;

  const scaleMode = playlistItem?.scaleMode || zone.imageScaleMode || (state.screen?.imageScaleMode) || 'fit_device';
  const fitClass = scaleMode === 'fit_image' ? 'fit-contain' : 'fit-cover';
  const transClass = getTransitionClass();
  const duration = playlistItem?.duration || media.duration || 10;

  // Remove old media elements
  wrapper.querySelectorAll('video, img').forEach(el => el.remove());

  if (media.type === 'video') {
    const vid = document.createElement('video');
    vid.src = media.url;
    vid.autoplay = true;
    vid.muted = true;
    vid.loop = true;
    vid.playsInline = true;
    vid.className = `${fitClass} ${transClass}`;
    vid.volume = (state.screen?.isMuted ? 0 : (state.screen?.volume || 80)) / 100;
    vid.poster = media.thumbnail || '';
    vid.onerror = () => { fallbackToImage(wrapper, media, fitClass, transClass); };
    vid.onended = () => advanceZone(zoneId);
    wrapper.insertBefore(vid, wrapper.querySelector('.media-progress'));
    vid.play().catch(() => { vid.muted = true; vid.play().catch(() => fallbackToImage(wrapper, media, fitClass, transClass)); });
  } else {
    const img = document.createElement('img');
    img.src = media.url || media.thumbnail || '';
    img.alt = media.title || '';
    img.className = `${fitClass} ${transClass}`;
    img.onerror = () => { img.src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80'; };
    wrapper.insertBefore(img, wrapper.querySelector('.media-progress'));
  }

  // Animate progress bar
  const prog = wrapper.querySelector('.media-progress-fill');
  if (prog) {
    prog.style.transition = 'none';
    prog.style.width = '0%';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        prog.style.transition = `width ${duration}s linear`;
        prog.style.width = '100%';
      });
    });
  }
}

function fallbackToImage(wrapper, media, fitClass, transClass) {
  wrapper.querySelectorAll('video').forEach(el => el.remove());
  const img = document.createElement('img');
  img.src = media.thumbnail || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80';
  img.className = `${fitClass} ${transClass}`;
  wrapper.insertBefore(img, wrapper.querySelector('.media-progress'));
}

function advanceZone(zoneId, direction = 1) {
  const s = state.zoneStates[zoneId];
  if (!s || !s.playlist || s.playlist.length === 0) return;

  // Lọc lại playlist theo mediaCache hiện tại (loại bỏ media đã bị xóa)
  const freshPlaylist = s.playlist.filter(m => !!state.mediaCache[m.id]);
  if (freshPlaylist.length === 0) {
    // Tất cả media đã bị xóa - hiển thị placeholder
    const wrapper = document.querySelector(`#zone-${zoneId} .zone-media`);
    if (wrapper) {
      wrapper.innerHTML = `
        <div class="zone-empty-msg" style="color:#64748b;font-size:12px;font-family:sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;background:#020617;text-align:center;padding:12px;">
          <span style="font-weight:600;color:#94a3b8;">Chưa có tệp trình chiếu nào</span>
          <span style="font-size:10px;color:#475569;margin-top:2px;">(Đã xoá hết hình khỏi thiết bị)</span>
        </div>`;
    }
    return;
  }

  // Cập nhật state với playlist đã lọc
  s.playlist = freshPlaylist;
  s.playlistItems = s.playlistItems.filter(p => !!state.mediaCache[p.mediaId]);
  if (s.playlistItems.length === 0) {
    s.playlistItems = freshPlaylist.map(m => ({ mediaId: m.id, duration: m.duration || 10 }));
  }

  if (direction === -1) {
    s.index = (s.index - 1 + s.playlist.length) % s.playlist.length;
  } else {
    s.index = (s.index + 1) % s.playlist.length;
  }
  const media = s.playlist[s.index];
  const pItem = s.playlistItems[s.index] || { mediaId: media.id, duration: media.duration || 10 };
  const wrapper = document.querySelector(`#zone-${zoneId} .zone-media`);

  if (wrapper && media) {
    renderMediaItem(zoneId, wrapper, media, pItem, s.zone);
  }

  if (s.playlist.length > 1) {
    if (state.zoneTimers[zoneId]) clearTimeout(state.zoneTimers[zoneId]);
    const duration = (pItem?.duration || media?.duration || 10) * 1000;
    state.zoneTimers[zoneId] = setTimeout(() => advanceZone(zoneId), duration);
  }
}

// Chuyển ảnh thủ công cho tất cả zone media đang chiếu (dùng cho vuốt cảm ứng)
function swipeNextImage() {
  const targetZoneId = state.primaryZoneId || Object.keys(state.zoneStates)[0];
  if (targetZoneId) advanceZone(targetZoneId, 1);
}

function swipePrevImage() {
  const targetZoneId = state.primaryZoneId || Object.keys(state.zoneStates)[0];
  if (targetZoneId) advanceZone(targetZoneId, -1);
}

// ---- Ticker Zone ----
function renderTickerZone(container, zone) {
  const div = document.createElement('div');
  div.className = 'zone-ticker';
  div.style.backgroundColor = zone.tickerBgColor || '#0f172a';

  const span = document.createElement('span');
  span.className = 'ticker-text';
  span.style.color = zone.tickerTextColor || '#38bdf8';
  span.style.setProperty('--ticker-speed', `${zone.tickerSpeed || 15}s`);
  span.textContent = zone.tickerText || '★ HỆ THỐNG TRÌNH CHIẾU LED DIGITAL SIGNAGE THÔNG MINH ★';

  div.appendChild(span);
  container.appendChild(div);
}

// ---- Widget Zone ----
function renderWidgetZone(container, zone) {
  const div = document.createElement('div');
  div.className = 'zone-widget';
  div.id = `widget-${zone.id}`;

  const timeEl = document.createElement('div');
  timeEl.className = 'widget-clock-time';
  timeEl.id = `clock-time-${zone.id}`;

  const dateEl = document.createElement('div');
  dateEl.className = 'widget-clock-date';
  dateEl.id = `clock-date-${zone.id}`;

  const weatherEl = document.createElement('div');
  weatherEl.className = 'widget-weather';
  weatherEl.textContent = '☀ TP.HCM: 32°C';

  div.appendChild(timeEl);
  div.appendChild(dateEl);
  div.appendChild(weatherEl);
  container.appendChild(div);

  updateWidgetClock(zone.id);
}

function updateWidgetClock(zoneId) {
  const timeEl = $(`clock-time-${zoneId}`);
  const dateEl = $(`clock-date-${zoneId}`);
  if (!timeEl) return;

  const now = new Date();
  timeEl.textContent = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  dateEl.textContent = now.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
}

// ---- Webpage Zone ----
function renderWebpageZone(container, zone) {
  const iframe = document.createElement('iframe');
  iframe.src = zone.webpageUrl || 'about:blank';
  iframe.style.cssText = 'width:100%;height:100%;border:none;background:#000;';
  iframe.allow = 'autoplay; fullscreen';
  container.appendChild(iframe);
}

// ============================================================
//  TRANSITION EFFECTS
// ============================================================
function getTransitionClass() {
  const map = {
    crossfade:   'anim-crossfade',
    'slide-right': 'anim-slide-right',
    'slide-left':  'anim-slide-left',
    kenburns:    'anim-kenburns',
  };
  return map[state.transitionEffect] || 'anim-crossfade';
}

// ============================================================
//  EMERGENCY
// ============================================================
function setEmergency(active, message) {
  state.emergency = { isActive: active, message };
  const overlay = DOM.emergencyOverlay();
  overlay.classList.toggle('active', active);
  if (active && message) {
    DOM.emergencyMsg().textContent = message;
  }
}

// ============================================================
//  HEARTBEAT
// ============================================================
async function sendHeartbeat() {
  if (state.useLocalStorage) {
    try {
      const screens = readFromCMS('led_cms_screens') || [];
      const idx = screens.findIndex(s => 
        (s.code && state.pairingCode && s.code.toUpperCase() === state.pairingCode.toUpperCase()) || 
        s.id === state.screenId
      );
      if (idx !== -1) {
        screens[idx] = {
          ...screens[idx],
          status: 'online',
          lastPing: 'Vừa xong',
        };
        writeToCMS('led_cms_screens', screens);
      }
      state.isOnline = true;
      setOnlineStatus(true);
    } catch {}
    return;
  }

  if (!state.serverUrl) return;

  try {
    await fetch(`${state.serverUrl}/api/player/heartbeat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        screenId: state.screenId,
        code: state.pairingCode,
        status: 'online',
        appVersion: PLAYER_VERSION,
        timestamp: new Date().toISOString(),
      }),
    });
    state.isOnline = true;
    setOnlineStatus(true);
  } catch {
    state.isOnline = false;
    setOnlineStatus(false);
  }
}

// ============================================================
//  HUD (Status Bar)
// ============================================================
function updateHud() {
  const s = state.screen;
  if (!s) return;
  DOM.hudCode().textContent = state.pairingCode || state.screenId;
  DOM.hudLayout().textContent = state.layout?.name || 'N/A';
  DOM.hudStatus().textContent = state.useLocalStorage ? 'Local Mode' : (state.isOnline ? 'Online' : 'Offline (Cache)');
}

function updateHudTime() {
  const now = new Date();
  if (DOM.hudTime()) {
    DOM.hudTime().textContent = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  // Update all widget clocks
  document.querySelectorAll('[id^="clock-time-"]').forEach(el => {
    el.textContent = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  });
  document.querySelectorAll('[id^="clock-date-"]').forEach(el => {
    el.textContent = now.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
  });
}

function setOnlineStatus(online) {
  const dot = DOM.hudDot();
  if (!dot) return;
  dot.className = 'hud-dot ' + (online ? 'online' : 'offline');
}

function scheduleHudHide() {
  if (state.hudHideTimeout) clearTimeout(state.hudHideTimeout);
  state.hudHideTimeout = setTimeout(() => {
    DOM.statusHud()?.classList.add('hide');
    state.hudVisible = false;
  }, 6000);
}

// Touch/click to show HUD
document.addEventListener('click', () => {
  if (!state.hudVisible) {
    DOM.statusHud()?.classList.remove('hide');
    state.hudVisible = true;
    scheduleHudHide();
  }
});

// ============================================================
//  LOCAL STORAGE (CMS same-machine)
// ============================================================


function handleStorageEvent(e) {
  if (!state.useLocalStorage) return;
  const cmsKeys = ['led_cms_screens', 'led_cms_layouts', 'led_cms_media', 'led_cms_emergency', 'led_cms_command'];
  if (cmsKeys.includes(e.key)) {
    fetchConfigAndRender();
  }
}

// ============================================================
//  PERSIST CONFIG
// ============================================================
function savePairInfo(info) {
  try { localStorage.setItem(STORAGE_KEY_PAIR, JSON.stringify(info)); } catch {}
}

function loadSavedConfig() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY_PAIR) || 'null'); } catch { return null; }
}

// ============================================================
//  ZONE CLEANUP
// ============================================================
function clearAllZoneTimers() {
  Object.values(state.zoneTimers).forEach(t => { clearTimeout(t); clearInterval(t); });
  state.zoneTimers = {};
}

// ============================================================
//  KEYBOARD SHORTCUTS (chế độ demo/test)
// ============================================================
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    // Show pairing screen
    DOM.playerScreen().classList.remove('active');
    DOM.pairingScreen().style.display = 'flex';
    clearAllZoneTimers();
    if (state.heartbeatTimer) clearInterval(state.heartbeatTimer);
    if (state.pollTimer) clearInterval(state.pollTimer);
    if (state.clockTimer) clearInterval(state.clockTimer);
    state._lastLayoutId = null;
  }
  if (e.key === 'h' || e.key === 'H') {
    const hud = DOM.statusHud();
    state.hudVisible = !state.hudVisible;
    hud?.classList.toggle('hide', !state.hudVisible);
  }
  if (e.key === '1') state.transitionEffect = 'crossfade';
  if (e.key === '2') state.transitionEffect = 'slide-right';
  if (e.key === '3') state.transitionEffect = 'slide-left';
  if (e.key === '4') state.transitionEffect = 'kenburns';
});

// ============================================================
//  TOUCH & SWIPE GESTURES (LƯỚT MÀN HÌNH ĐỂ CHUYỂN ẢNH)
// ============================================================
function initTouchGestures() {
  let touchStartX = 0;
  let touchStartY = 0;
  let touchEndX = 0;
  let touchEndY = 0;

  const minSwipeDistance = 40; // pixel tối thiểu để tính là vuốt

  const handleTouchStart = (e) => {
    touchStartX = e.changedTouches ? e.changedTouches[0].screenX : e.clientX;
    touchStartY = e.changedTouches ? e.changedTouches[0].screenY : e.clientY;
  };

  const handleTouchEnd = (e) => {
    touchEndX = e.changedTouches ? e.changedTouches[0].screenX : e.clientX;
    touchEndY = e.changedTouches ? e.changedTouches[0].screenY : e.clientY;
    handleGesture();
  };

  const handleGesture = () => {
    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;

    // Ưu tiên cử chỉ vuốt ngang
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > minSwipeDistance) {
      if (diffX < 0) {
        // Vuốt từ Phải sang Trái (Swipe Left) -> Chuyển sang ảnh kế tiếp
        swipeNextImage();
      } else {
        // Vuốt từ Trái sang Phải (Swipe Right) -> Quay lại ảnh trước
        swipePrevImage();
      }
    }
  };

  const playerScreen = DOM.playerScreen();
  if (playerScreen) {
    playerScreen.addEventListener('touchstart', handleTouchStart, { passive: true });
    playerScreen.addEventListener('touchend', handleTouchEnd, { passive: true });

    // Hỗ trợ cả chuột kéo/thả trên PC mô phỏng cảm ứng
    let isMouseDown = false;
    playerScreen.addEventListener('mousedown', (e) => {
      // Bỏ qua nếu bấm vào HUD
      if (e.target.closest('#status-hud')) return;
      isMouseDown = true;
      touchStartX = e.clientX;
      touchStartY = e.clientY;
    });

    playerScreen.addEventListener('mouseup', (e) => {
      if (!isMouseDown) return;
      isMouseDown = false;
      touchEndX = e.clientX;
      touchEndY = e.clientY;
      handleGesture();
    });
  }
}

// ============================================================
//  BOOT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  initPairingEvents();
  initTouchGestures();

  // Tự động kết nối và phát ngay nếu đã từng đăng nhập/ghép nối trước đó
  const saved = loadSavedConfig();
  if (saved?.pairingCode) {
    if (DOM.pairingServer()) DOM.pairingServer().value = saved.serverUrl || '';
    state.serverUrl = saved.serverUrl || '';
    state.pairingCode = saved.pairingCode;
    state.screenId = saved.screenId || '';
    state.screenName = saved.screenName || '';
    state.useLocalStorage = !saved.serverUrl || saved.serverUrl.includes('localhost:3000') || saved.useLocalStorage;

    console.log(`[LED Player] Đã tìm thấy phiên đăng nhập trước: Mã ${state.pairingCode}. Đang tự động vào phát...`);
    startPlayer();
  } else {
    console.log(`[LED Player v${PLAYER_VERSION}] Sẵn sàng. Nhấn Đăng Nhập hoặc Dùng Chế Độ Local để bắt đầu.`);
  }
});
