import React, { useState, useEffect, useRef } from 'react';
import { 
  MonitorPlay, 
  Maximize2, 
  Minimize2, 
  Volume2, 
  VolumeX, 
  Wifi, 
  WifiOff, 
  ShieldAlert, 
  RefreshCw, 
  Tv, 
  Layers, 
  HardDrive,
  Clock,
  Sparkles,
  Flame,
  LayoutGrid,
  Monitor,
  ChevronLeft,
  ChevronRight,
  Sliders,
  Cpu,
  Power,
  Play,
  Pause,
  ArrowRight,
  Maximize,
  Image as ImageIcon
} from 'lucide-react';
import { Screen, LayoutTemplate, LayoutZone, MediaItem, ImageScaleMode } from '../types';
import { storageService, EmergencyState } from '../services/storage';

interface PlayerSimulatorViewProps {
  initialScreenId?: string;
}

export type TransitionEffect = 'crossfade' | 'slide-right' | 'slide-left' | 'kenburns';

export const PlayerSimulatorView: React.FC<PlayerSimulatorViewProps> = ({ initialScreenId }) => {
  const [screens, setScreens] = useState<Screen[]>(storageService.getScreens());
  const [selectedScreenId, setSelectedScreenId] = useState<string>(
    initialScreenId || screens[0]?.id || ''
  );
  const [viewMode, setViewMode] = useState<'single' | 'grid'>('single');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isOfflineSimulated, setIsOfflineSimulated] = useState(false);
  const [emergency, setEmergency] = useState<EmergencyState>(storageService.getEmergencyState());
  const [transitionEffect, setTransitionEffect] = useState<TransitionEffect>('crossfade');

  // Clock state for widgets
  const [currentTime, setCurrentTime] = useState(new Date());

  // Cập nhật selectedScreenId khi props initialScreenId thay đổi từ navigation
  useEffect(() => {
    if (initialScreenId) {
      setSelectedScreenId(initialScreenId);
      setViewMode('single');
    }
  }, [initialScreenId]);

  // Clock tick
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync storage & real-time commands
  useEffect(() => {
    const update = () => {
      setScreens(storageService.getScreens());
      setEmergency(storageService.getEmergencyState());
    };
    return storageService.subscribe(update);
  }, []);

  // Listen for direct commands (volume, layout, power, screenshot)
  useEffect(() => {
    const handleCommand = () => {
      setScreens(storageService.getScreens());
    };
    window.addEventListener('led_player_command', handleCommand);
    return () => window.removeEventListener('led_player_command', handleCommand);
  }, []);

  const currentScreen = screens.find(s => s.id === selectedScreenId) || screens[0];
  const containerRef = useRef<HTMLDivElement>(null);
  const mediaList = storageService.getMedia();

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleTogglePowerShortcut = (screenId: string, currentState: string) => {
    const nextState = currentState === 'on' ? 'off' : 'on';
    storageService.sendRemoteCommand(screenId, { type: 'power', value: nextState });
    setScreens(storageService.getScreens());
  };

  const handleToggleSimScaleMode = (mode: ImageScaleMode) => {
    if (!currentScreen) return;
    const updated = { ...currentScreen, imageScaleMode: mode };
    storageService.updateScreen(updated);
    storageService.sendRemoteCommand(currentScreen.id, { type: 'set_image_scale_mode', value: mode });
    setScreens(storageService.getScreens());
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl glass-panel bg-slate-900/80 border border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-600 to-sky-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25 shrink-0">
            <MonitorPlay className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold text-white">
                Trình Phát Màn Hình LED (Player Engine Simulator)
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Mô Phỏng 1:1 Phần Cứng
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Xem trước chính xác nội dung hiển thị của từng màn hình LED, Kiosk và TV với hiệu ứng chuyển cảnh mượt mà
            </p>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Chuyển Chế Độ Xem: 1 Màn Hình vs Ma Trận Tất Cả Màn Hình */}
          <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800">
            <button
              type="button"
              onClick={() => setViewMode('single')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center space-x-1.5 transition-all ${
                viewMode === 'single'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Xem Từng Thiết Bị</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center space-x-1.5 transition-all ${
                viewMode === 'grid'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Xem Tất Cả ({screens.length})</span>
            </button>
          </div>

          {/* Chọn Chế Độ Áp Dụng Hình Ảnh: Theo Kích Thước Thiết Bị vs Theo Kích Thước Hình */}
          <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800">
            <button
              type="button"
              onClick={() => handleToggleSimScaleMode('fit_device')}
              className={`px-2.5 py-1.5 rounded-lg font-semibold flex items-center space-x-1.5 transition-all text-xs ${
                (currentScreen?.imageScaleMode || 'fit_device') === 'fit_device'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Lấp đầy toàn bộ diện tích màn hình thiết bị, không có viền đen (Cover)"
            >
              <Tv className="w-3.5 h-3.5" />
              <span>Kích Thước Thiết Bị</span>
            </button>
            <button
              type="button"
              onClick={() => handleToggleSimScaleMode('fit_image')}
              className={`px-2.5 py-1.5 rounded-lg font-semibold flex items-center space-x-1.5 transition-all text-xs ${
                currentScreen?.imageScaleMode === 'fit_image'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Giữ nguyên 100% tỷ lệ gốc theo kích thước hình, không bị cắt mép (Contain)"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Kích Thước Hình</span>
            </button>
          </div>

          {/* Chọn Hiệu Ứng Chuyển Cảnh (Transition Effect) */}
          <div className="flex items-center space-x-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[11px] font-medium">Chuyển Cảnh:</span>
            <select
              value={transitionEffect}
              onChange={(e) => setTransitionEffect(e.target.value as TransitionEffect)}
              className="bg-transparent text-cyan-300 font-bold text-xs focus:outline-none cursor-pointer"
            >
              <option value="crossfade" className="bg-slate-900">Mờ Dần (Crossfade)</option>
              <option value="slide-right" className="bg-slate-900">Trượt Sang Phải (Slide)</option>
              <option value="slide-left" className="bg-slate-900">Trượt Sang Trái (Slide)</option>
              <option value="kenburns" className="bg-slate-900">Phóng To Điện Ảnh (Ken Burns)</option>
            </select>
          </div>

          {/* Simulate Offline Button */}
          <button
            onClick={() => setIsOfflineSimulated(!isOfflineSimulated)}
            className={`px-3 py-1.5 rounded-xl border font-semibold flex items-center space-x-1.5 transition-all ${
              isOfflineSimulated
                ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
            title="Thử nghiệm ngắt mạng Internet xem Player có tự phát từ bộ nhớ đệm (Cache) không"
          >
            {isOfflineSimulated ? <WifiOff className="w-3.5 h-3.5 text-amber-400" /> : <Wifi className="w-3.5 h-3.5 text-emerald-400" />}
            <span>{isOfflineSimulated ? 'Mất Mạng (Offline)' : 'Mạng Online'}</span>
          </button>

          {/* Fullscreen Button */}
          {viewMode === 'single' && (
            <button
              onClick={toggleFullscreen}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center space-x-1.5 transition-all shadow-md shadow-cyan-600/20 active:scale-95"
              title="Nhấn F11 hoặc phóng to toàn màn hình"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span>{isFullscreen ? 'Thu Nhỏ' : 'Toàn Màn Hình'}</span>
            </button>
          )}
        </div>
      </div>

      {/* DEVICE SELECTOR BAR: Thanh Chọn Xem Từng Màn Hình Cụ Thể */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span className="font-semibold text-slate-300 flex items-center space-x-1.5">
            <Tv className="w-3.5 h-3.5 text-cyan-400" />
            <span>Chọn Thiết Bị Muốn Xem Trình Chiếu:</span>
          </span>
          <span className="text-[11px] text-slate-400">
            Nhấp vào bất kỳ màn hình nào để chuyển chế độ xem chi tiết
          </span>
        </div>

        {/* Carousel / Grid of Device Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {screens.map(s => {
            const isSelected = s.id === currentScreen.id;
            const isLandscape = s.orientation === 'landscape';
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setSelectedScreenId(s.id);
                  setViewMode('single');
                }}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between space-y-2 ${
                  isSelected && viewMode === 'single'
                    ? 'bg-cyan-500/15 border-cyan-400 shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400'
                    : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                    {s.code}
                  </span>
                  <span className={`w-2 h-2 rounded-full shrink-0 ${
                    s.status === 'online' && s.powerState === 'on' 
                      ? 'bg-emerald-400 animate-pulse' 
                      : s.powerState === 'off' 
                      ? 'bg-rose-500' 
                      : 'bg-amber-400'
                  }`} />
                </div>

                <div className="min-w-0">
                  <h4 className={`text-xs font-bold truncate ${isSelected ? 'text-cyan-300' : 'text-white'}`}>
                    {s.name}
                  </h4>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">
                    {s.group}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/60">
                  <span className="font-mono">
                    {s.resolution.width}x{s.resolution.height}
                  </span>
                  <span className={`px-1 rounded text-[9px] font-semibold ${isLandscape ? 'bg-blue-500/10 text-blue-300' : 'bg-purple-500/10 text-purple-300'}`}>
                    {isLandscape ? 'Ngang' : 'Dọc'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Offline Alert Banner if Simulated */}
      {isOfflineSimulated && (
        <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center space-x-2">
            <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Chế độ Ngoại Tuyến (Offline-First):</strong> Đang mô phỏng mất kết nối mạng. Màn hình tiếp tục chạy phát mượt mà không bị gián đoạn nhờ bộ nhớ đệm cục bộ (Cache).
            </span>
          </div>
          <span className="text-[10px] font-mono bg-amber-500/20 px-2 py-0.5 rounded font-bold">Cache: 100% Sẵn Sàng</span>
        </div>
      )}

      {/* VIEW MODE 1: CHẾ ĐỘ XEM CHI TIẾT 1 MÀN HÌNH (Single Device Focus) */}
      {viewMode === 'single' && (
        <div className="space-y-4">
          {/* Information Strip for the Active Screen */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300">
            <div className="flex items-center space-x-3">
              <span className="font-bold text-white flex items-center space-x-1.5">
                <Monitor className="w-4 h-4 text-cyan-400" />
                <span>{currentScreen.name}</span>
              </span>
              <span className="text-slate-500">•</span>
              <span>Độ phân giải thực: <strong className="font-mono text-cyan-300">{currentScreen.resolution.width} x {currentScreen.resolution.height} px</strong></span>
              <span className="text-slate-500">•</span>
              <span>Thiết bị: <strong className="text-slate-300">{currentScreen.deviceModel}</strong></span>
            </div>

            <div className="flex items-center space-x-3">
              <span>Nguồn: <strong className={currentScreen.powerState === 'on' ? 'text-emerald-400' : 'text-rose-400'}>
                {currentScreen.powerState === 'on' ? 'Đang Bật' : 'Đang Tắt'}
              </strong></span>
              <button
                type="button"
                onClick={() => handleTogglePowerShortcut(currentScreen.id, currentScreen.powerState)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center space-x-1 border transition-all ${
                  currentScreen.powerState === 'on'
                    ? 'bg-rose-500/15 border-rose-500/30 text-rose-300 hover:bg-rose-500/25'
                    : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25'
                }`}
              >
                <Power className="w-3 h-3" />
                <span>{currentScreen.powerState === 'on' ? 'Tắt Thiết Bị' : 'Bật Thiết Bị'}</span>
              </button>
            </div>
          </div>

          {/* Main Screen Player Render Frame */}
          <div
            ref={containerRef}
            className={`relative mx-auto rounded-2xl overflow-hidden bg-black border-4 border-slate-800 shadow-2xl flex flex-col justify-center select-none ${
              isFullscreen ? 'h-screen w-screen rounded-none border-none p-0' : ''
            }`}
            style={{
              aspectRatio: isFullscreen ? 'auto' : `${currentScreen.resolution.width} / ${currentScreen.resolution.height}`,
              maxHeight: isFullscreen ? '100vh' : currentScreen.orientation === 'portrait' ? '680px' : '580px',
              maxWidth: currentScreen.orientation === 'portrait' ? '380px' : '100%'
            }}
          >
            <SingleScreenPlayerContent
              screen={currentScreen}
              mediaList={mediaList}
              currentTime={currentTime}
              emergency={emergency}
              transitionEffect={transitionEffect}
              isFullscreen={isFullscreen}
            />
          </div>
        </div>
      )}

      {/* VIEW MODE 2: CHẾ ĐỘ MA TRẬN ĐA MÀN HÌNH (Multi-Screen Video Wall Matrix) */}
      {viewMode === 'grid' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold text-white">
              Giám Sát Ma Trận Toàn Bộ Mạng Lưới Màn Hình ({screens.length} Thiết Bị Đang Hoạt Động Đồng Thời)
            </span>
            <span>Bấm vào bất kỳ màn hình nào để phóng to</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {screens.map(screenItem => (
              <div
                key={screenItem.id}
                onClick={() => {
                  setSelectedScreenId(screenItem.id);
                  setViewMode('single');
                }}
                className="rounded-2xl glass-panel bg-slate-900/80 border border-slate-800 hover:border-cyan-400 transition-all p-3 space-y-2 cursor-pointer group shadow-xl"
              >
                {/* Header */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1.5 truncate">
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-cyan-300">
                      {screenItem.code}
                    </span>
                    <h3 className="font-bold text-white truncate text-xs group-hover:text-cyan-300">
                      {screenItem.name}
                    </h3>
                  </div>
                  <span className={`w-2 h-2 rounded-full shrink-0 ${screenItem.powerState === 'on' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
                </div>

                {/* Video / Content Display */}
                <div
                  className="relative w-full rounded-xl overflow-hidden bg-black border border-slate-800"
                  style={{
                    aspectRatio: `${screenItem.resolution.width} / ${screenItem.resolution.height}`,
                    maxHeight: '260px'
                  }}
                >
                  <SingleScreenPlayerContent
                    screen={screenItem}
                    mediaList={mediaList}
                    currentTime={currentTime}
                    emergency={emergency}
                    transitionEffect={transitionEffect}
                    isFullscreen={false}
                    isCompact={true}
                  />
                </div>

                {/* Footer specs */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>{screenItem.group}</span>
                  <span className="font-mono text-cyan-400 font-semibold">{screenItem.resolution.width}x{screenItem.resolution.height}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Component Render nội dung chi tiết của một thiết bị cụ thể
interface SingleScreenPlayerContentProps {
  screen: Screen;
  mediaList: MediaItem[];
  currentTime: Date;
  emergency: EmergencyState;
  transitionEffect: TransitionEffect;
  isFullscreen: boolean;
  isCompact?: boolean;
}

const SingleScreenPlayerContent: React.FC<SingleScreenPlayerContentProps> = ({
  screen,
  mediaList,
  currentTime,
  emergency,
  transitionEffect,
  isFullscreen,
  isCompact
}) => {
  const layouts = storageService.getLayouts();
  const layout = layouts.find(l => l.id === screen.currentLayoutId) || layouts[0];

  // Nếu màn hình bị tắt
  if (screen.powerState !== 'on') {
    return (
      <div className="absolute inset-0 bg-black flex flex-col items-center justify-center space-y-2 p-4 text-center z-50">
        <div className="w-3 h-3 rounded-full bg-rose-500/60 animate-ping" />
        <span className="text-xs font-mono text-slate-400 uppercase tracking-widest font-bold">
          {screen.powerState === 'sleep' ? 'CHẾ ĐỘ NGHỈ (SLEEP MODE)' : 'MÀN HÌNH ĐANG TẮT (OFF)'}
        </span>
        <span className="text-[10px] text-slate-600">
          Thiết bị đang ngắt cấp tín hiệu LED
        </span>
      </div>
    );
  }

  // Nếu có phát sóng khẩn cấp
  if (emergency.isActive) {
    return (
      <div className="absolute inset-0 bg-rose-950/95 z-50 flex flex-col items-center justify-center p-4 text-center space-y-3 animate-pulse border-4 border-rose-600">
        <div className="w-12 h-12 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-xl shadow-rose-600/50 animate-bounce">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="text-base md:text-xl font-black text-white uppercase">
          THÔNG BÁO KHẨN CẤP
        </h2>
        <p className="text-xs md:text-sm font-bold text-rose-200 font-mono bg-black/60 p-3 rounded-xl border border-rose-500 line-clamp-3">
          {emergency.message}
        </p>
      </div>
    );
  }

  // Render chuẩn các Zone theo Bố Cục của màn hình
  if (layout) {
    return (
      <div className="relative w-full h-full overflow-hidden bg-slate-950">
        {layout.zones.map((zone) => (
          <InteractivePlayerZone
            key={zone.id}
            zone={zone}
            mediaList={mediaList}
            currentTime={currentTime}
            screenVolume={screen.isMuted ? 0 : screen.volume}
            transitionEffect={transitionEffect}
            screenScaleMode={screen.imageScaleMode || 'fit_device'}
            isCompact={isCompact}
          />
        ))}

        {/* Small watermark tag when not in fullscreen */}
        {!isFullscreen && !isCompact && (
          <div className="absolute top-2 left-2 z-40 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[10px] font-mono text-slate-300 flex items-center space-x-1 pointer-events-none border border-white/10">
            <span>{screen.name}</span>
            <span>•</span>
            <span className="text-cyan-300">{screen.resolution.width}x{screen.resolution.height}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full text-slate-600 space-y-2">
      <Tv className="w-8 h-8" />
      <span className="text-xs">Chưa có bố cục được gán cho thiết bị</span>
    </div>
  );
};

// Component render từng Zone với CHUYỂN CẢNH MƯỢT MÀ & CO GIÃN HÌNH THEO THIẾT BỊ HOẶC HÌNH GỐC
interface InteractivePlayerZoneProps {
  zone: LayoutZone;
  mediaList: MediaItem[];
  currentTime: Date;
  screenVolume: number;
  transitionEffect: TransitionEffect;
  screenScaleMode: ImageScaleMode;
  isCompact?: boolean;
}

const InteractivePlayerZone: React.FC<InteractivePlayerZoneProps> = ({
  zone,
  mediaList,
  currentTime,
  screenVolume,
  transitionEffect,
  screenScaleMode,
  isCompact
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [transitionKey, setTransitionKey] = useState(0);

  // Lấy các tệp media được phép phát (bỏ qua các tệp đã bị 'Ngừng phát')
  const enabledPlaylists = (zone.mediaPlaylist || []).filter(p => p.enabled !== false);
  const assignedMedia = enabledPlaylists
    .map(p => mediaList.find(m => m.id === p.mediaId))
    .filter(Boolean) as MediaItem[];

  // Fallback nếu chưa có playlist cụ thể
  const fallbackMedia = mediaList.filter(m => m.type === (zone.type === 'video' ? 'video' : 'image'));
  const effectivePlaylist = assignedMedia.length > 0 ? assignedMedia : fallbackMedia;

  const currentMediaDuration = (enabledPlaylists[currentSlideIndex]?.duration || effectivePlaylist[currentSlideIndex]?.duration || 10);

  const [videoFailed, setVideoFailed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Khai báo activeMedia trước khi sử dụng trong hook useEffect
  const activeMedia = effectivePlaylist[currentSlideIndex] || effectivePlaylist[0];

  // Tự động chuyển slide với đồng hồ countdown và trigger hiệu ứng chuyển cảnh cho TẤT CẢ các loại playlist
  useEffect(() => {
    if (effectivePlaylist.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlideIndex(prev => (prev + 1) % effectivePlaylist.length);
        setTransitionKey(k => k + 1);
        setVideoFailed(false);
      }, currentMediaDuration * 1000);
      return () => clearInterval(interval);
    }
  }, [effectivePlaylist.length, currentSlideIndex, currentMediaDuration]);

  // Luôn đảm bảo video tự động phát được trong trình duyệt không bị chính sách âm thanh chặn
  useEffect(() => {
    setVideoFailed(false);
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {
        if (videoRef.current) {
          videoRef.current.muted = true;
          videoRef.current.play().catch(() => setVideoFailed(true));
        }
      });
    }
  }, [activeMedia?.id, activeMedia?.url]);

  // Xác định chế độ kích thước áp dụng: Kích thước hình (contain) vs Kích thước thiết bị (cover)
  const currentPlaylistItem = zone.mediaPlaylist?.[currentSlideIndex];
  const effectiveScaleMode: ImageScaleMode =
    currentPlaylistItem?.scaleMode ||
    zone.imageScaleMode ||
    screenScaleMode ||
    'fit_device';

  const fitClass = effectiveScaleMode === 'fit_image' ? 'object-contain' : 'object-cover';

  // Xác định class chuyển cảnh CSS
  const getTransitionClass = () => {
    switch (transitionEffect) {
      case 'slide-right':
        return 'transition-slide-right';
      case 'slide-left':
        return 'transition-slide-left';
      case 'kenburns':
        return 'transition-kenburns';
      case 'crossfade':
      default:
        return 'transition-crossfade';
    }
  };

  const handleNextSlide = (e?: React.SyntheticEvent) => {
    e?.stopPropagation?.();
    if (effectivePlaylist.length > 1) {
      setCurrentSlideIndex(prev => (prev + 1) % effectivePlaylist.length);
      setTransitionKey(k => k + 1);
    }
  };

  const handlePrevSlide = (e?: React.SyntheticEvent) => {
    e?.stopPropagation?.();
    if (effectivePlaylist.length > 1) {
      setCurrentSlideIndex(prev => (prev - 1 + effectivePlaylist.length) % effectivePlaylist.length);
      setTransitionKey(k => k + 1);
    }
  };

  return (
    <div
      className="absolute overflow-hidden flex flex-col justify-center group/zone"
      style={{
        left: `${zone.x}%`,
        top: `${zone.y}%`,
        width: `${zone.width}%`,
        height: `${zone.height}%`,
        zIndex: zone.zIndex,
        backgroundColor: zone.type === 'ticker' ? zone.tickerBgColor || '#0f172a' : '#000000'
      }}
    >
      {/* 1. Video & Image Slider Zone (Tương Thích Cả Video Lẫn Hình Ảnh) */}
      {(zone.type === 'video' || zone.type === 'image_slider') && (
        <div className="relative w-full h-full bg-black overflow-hidden flex items-center justify-center">
          {activeMedia ? (
            <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
              {/* Nếu là video và không bị lỗi -> Render Video với autoplay muted, poster và playsInline */}
              {activeMedia.type === 'video' && !videoFailed ? (
                <video
                  ref={videoRef}
                  key={`${activeMedia.id}-${transitionKey}`}
                  src={activeMedia.url}
                  poster={activeMedia.thumbnail || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80'}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className={`w-full h-full ${fitClass} ${getTransitionClass()}`}
                  onError={() => setVideoFailed(true)}
                  onStalled={() => {
                    // Nếu video bị nghẽn mạng thì vẫn giữ poster không bị đen màn hình
                  }}
                  onEnded={handleNextSlide}
                />
              ) : (
                /* Nếu là ảnh HOẶC video bị lỗi tải -> Render Ảnh với fallback an toàn */
                <img
                  key={`${activeMedia.id}-${transitionKey}`}
                  src={activeMedia.type === 'image' ? (activeMedia.url || activeMedia.thumbnail) : (activeMedia.thumbnail || activeMedia.url)}
                  alt={activeMedia.title}
                  className={`w-full h-full ${fitClass} ${getTransitionClass()}`}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80';
                  }}
                />
              )}

              {/* Tag hiển thị chế độ kích thước khi hover */}
              {!isCompact && (
                <div className="absolute bottom-2 left-2 z-20 opacity-0 group-hover/zone:opacity-100 transition-opacity px-2 py-0.5 rounded bg-black/80 backdrop-blur-sm text-[9px] font-medium text-slate-300 pointer-events-none flex items-center space-x-1 border border-white/10">
                  {effectiveScaleMode === 'fit_image' ? (
                    <>
                      <ImageIcon className="w-2.5 h-2.5 text-cyan-400" />
                      <span>Kích thước hình (Tỷ lệ gốc)</span>
                    </>
                  ) : (
                    <>
                      <Tv className="w-2.5 h-2.5 text-cyan-400" />
                      <span>Kích thước thiết bị (Lấp đầy)</span>
                    </>
                  )}
                </div>
              )}

              {/* Thanh tiến trình chuyển cảnh (Slide Countdown Progress Bar) */}
              {!isCompact && effectivePlaylist.length > 1 && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/40 z-20">
                  <div
                    key={`progress-${transitionKey}`}
                    className="h-full bg-gradient-to-r from-cyan-400 to-sky-300"
                    style={{
                      animation: `ticker ${currentMediaDuration}s linear infinite`
                    }}
                  />
                </div>
              )}

              {/* Nút thủ công chuyển slide khi hover (cho người vận hành kiểm tra chuyển cảnh) */}
              {!isCompact && effectivePlaylist.length > 1 && (
                <div className="absolute inset-0 flex items-center justify-between px-2 opacity-0 group-hover/zone:opacity-100 transition-opacity z-30 pointer-events-none">
                  <button
                    type="button"
                    onClick={handlePrevSlide}
                    className="p-1 rounded-full bg-black/70 text-white hover:bg-cyan-600 transition-all pointer-events-auto shadow-md"
                    title="Ảnh trước"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextSlide}
                    className="p-1 rounded-full bg-black/70 text-white hover:bg-cyan-600 transition-all pointer-events-auto shadow-md"
                    title="Ảnh tiếp theo (Kiểm tra chuyển cảnh)"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Slide Counter Badge */}
              {!isCompact && effectivePlaylist.length > 1 && (
                <div className="absolute top-2 right-2 z-20 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-mono text-white pointer-events-none">
                  {currentSlideIndex + 1}/{effectivePlaylist.length}
                </div>
              )}
            </div>
          ) : (
            <div className="text-slate-600 text-[10px] font-mono">Đang chờ hình ảnh...</div>
          )}
        </div>
      )}

      {/* 3. Ticker Marquee Zone */}
      {zone.type === 'ticker' && (
        <div className="w-full h-full flex items-center overflow-hidden px-3">
          <div
            className="animate-ticker text-xs md:text-sm font-bold tracking-wide"
            style={{
              color: zone.tickerTextColor || '#38bdf8',
              ['--ticker-duration' as any]: `${zone.tickerSpeed || 15}s`
            }}
          >
            {zone.tickerText || '★ HỆ THỐNG TRÌNH CHIẾU LED DIGITAL SIGNAGE THÔNG MINH ★'}
          </div>
        </div>
      )}

      {/* 4. Widget Zone (Clock, Weather) */}
      {zone.type === 'widget' && (
        <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-950 p-2 flex flex-col justify-center items-center text-center space-y-0.5 text-white border border-slate-800/80">
          <div className="text-base md:text-2xl font-black font-mono tracking-wider text-cyan-400">
            {currentTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <div className="text-[9px] md:text-[11px] text-slate-300 font-medium capitalize">
            {currentTime.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })}
          </div>
          {!isCompact && (
            <div className="text-[10px] text-amber-300 pt-0.5">
              ☀️ TP.HCM: 32°C
            </div>
          )}
        </div>
      )}
    </div>
  );
};
