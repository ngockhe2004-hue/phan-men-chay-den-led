import React, { useState, useEffect } from 'react';
import { 
  X, 
  Tv, 
  Volume2, 
  VolumeX, 
  Power, 
  RotateCcw, 
  Camera, 
  HardDrive,
  RefreshCw,
  CheckCircle2,
  Image as ImageIcon,
  Film,
  Play,
  Pause,
  Trash2,
  Plus,
  Search,
  Eye,
  Check,
  Clock,
  Layers,
  AlertCircle,
  Maximize2,
  Save,
  Radio,
  Sliders,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Screen, MediaItem, LayoutZone, LayoutTemplate, ImageScaleMode } from '../types';
import { storageService } from '../services/storage';

interface RemoteControlModalProps {
  screen: Screen | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export type PlaybackStatus = 'playing' | 'waiting' | 'disabled';

interface ScreenMediaItem {
  media: MediaItem;
  zoneId: string;
  zoneName: string;
  duration: number;
  status: PlaybackStatus;
  scaleMode: ImageScaleMode;
  enabled: boolean;
}

export const RemoteControlModal: React.FC<RemoteControlModalProps> = ({
  screen,
  isOpen,
  onClose,
  onUpdate
}) => {
  if (!isOpen || !screen) return null;

  // --- Hardware State ---
  const [volume, setVolume] = useState(screen.volume);
  const [isMuted, setIsMuted] = useState(screen.isMuted);
  const [powerState, setPowerState] = useState(screen.powerState);
  const [screenshotPreview, setScreenshotPreview] = useState(screen.screenshotUrl);
  const [isCapturing, setIsCapturing] = useState(false);
  const [actionNotice, setActionNotice] = useState('');
  const [previewMedia, setPreviewMedia] = useState<MediaItem | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // --- Display Aspect Ratio / Scaling Mode ---
  const [imageScaleMode, setImageScaleMode] = useState<ImageScaleMode>(screen.imageScaleMode || 'fit_device');

  // --- Media & Playlist State ---
  // activeMediaByZone: zoneId -> mediaId đang phát trực tiếp
  const [activeMediaByZone, setActiveMediaByZone] = useState<Record<string, string>>({});
  // disabledMediaIds: tập hợp các mediaId đang ở trạng thái "Không phát" (bị ngừng phát)
  const [disabledMediaIds, setDisabledMediaIds] = useState<string[]>([]);
  // itemScaleModes: mediaId -> scaleMode riêng
  const [itemScaleModes, setItemScaleModes] = useState<Record<string, ImageScaleMode>>({});
  // localPlaylistOrder: zoneId -> list of { mediaId, duration, scaleMode, enabled }
  const [editableZones, setEditableZones] = useState<LayoutZone[]>([]);

  // Modal thêm media từ thư viện
  const [isAddMediaOpen, setIsAddMediaOpen] = useState(false);
  const [librarySearch, setLibrarySearch] = useState('');
  const [libraryFilterType, setLibraryFilterType] = useState<'ALL' | 'image' | 'video'>('ALL');
  const [selectedTargetZoneId, setSelectedTargetZoneId] = useState<string>('');
  const [selectedLibraryMediaIds, setSelectedLibraryMediaIds] = useState<string[]>([]);
  const [addMediaScaleMode, setAddMediaScaleMode] = useState<ImageScaleMode>('fit_device');

  // Bộ lọc danh sách đang chiếu: 'all' | 'playing' | 'waiting' | 'disabled'
  const [mediaFilterTab, setMediaFilterTab] = useState<'all' | 'playing' | 'waiting' | 'disabled'>('all');

  const layouts = storageService.getLayouts();
  const allMedia = storageService.getMedia();
  const currentLayout = layouts.find(l => l.id === screen.currentLayoutId) || layouts[0];

  // Helper lấy playlist của zone (nếu zone chưa được khởi tạo playlist thì lấy fallback từ Thư viện Media)
  const getZonePlaylist = (zone: LayoutZone) => {
    if (Array.isArray(zone.mediaPlaylist)) {
      return zone.mediaPlaylist;
    }
    if (zone.type === 'video') {
      return allMedia
        .filter(m => m.type === 'video')
        .map(m => ({ mediaId: m.id, duration: m.duration || 15, enabled: true }));
    }
    if (zone.type === 'image_slider') {
      return allMedia
        .filter(m => m.type === 'image')
        .map(m => ({ mediaId: m.id, duration: m.duration || 15, enabled: true }));
    }
    return [];
  };

  // Khởi tạo dữ liệu khi mở modal hoặc đổi màn hình
  useEffect(() => {
    if (screen && isOpen) {
      setVolume(screen.volume);
      setIsMuted(screen.isMuted);
      setPowerState(screen.powerState);
      setScreenshotPreview(screen.screenshotUrl);
      setImageScaleMode(screen.imageScaleMode || 'fit_device');
      setHasUnsavedChanges(false);

      const latestLayouts = storageService.getLayouts();
      const targetLayout = latestLayouts.find(l => l.id === screen.currentLayoutId) || latestLayouts[0];

      if (targetLayout) {
        const initializedZones = targetLayout.zones.map(zone => ({
          ...zone,
          mediaPlaylist: getZonePlaylist(zone),
        }));
        setEditableZones(initializedZones);

        const initialActive: Record<string, string> = {};
        const initialDisabled: string[] = [];
        const initialModes: Record<string, ImageScaleMode> = {};

        initializedZones.forEach(zone => {
          const playlist = zone.mediaPlaylist;
          // Các item bị disabled (enabled === false)
          playlist.forEach(p => {
            if (p.enabled === false) {
              initialDisabled.push(p.mediaId);
            }
            if (p.scaleMode) {
              initialModes[p.mediaId] = p.scaleMode;
            }
          });

          // Tìm item đầu tiên không bị disabled để làm item đang phát
          const firstEnabled = playlist.find(p => p.enabled !== false);
          if (firstEnabled) {
            initialActive[zone.id] = firstEnabled.mediaId;
          }
        });

        setActiveMediaByZone(initialActive);
        setDisabledMediaIds(initialDisabled);
        setItemScaleModes(initialModes);

        if (targetLayout.zones.length > 0) {
          setSelectedTargetZoneId(targetLayout.zones[0].id);
        }
      }
    }
  }, [screen?.id, screen?.currentLayoutId, isOpen]);

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(''), 3500);
  };

  // ----------------------------------------------------
  // XÂY DỰNG DANH SÁCH MEDIA VỚI 3 TRẠNG THÁI CHUẨN:
  // 1. 'playing'  : Đang phát (màu xanh lá)
  // 2. 'waiting'  : Chờ phát (màu vàng cam)
  // 3. 'disabled' : Không phát (màu xám / đỏ)
  // ----------------------------------------------------
  const screenMediaList: ScreenMediaItem[] = [];
  editableZones.forEach(zone => {
    const playlist = getZonePlaylist(zone);
    playlist.forEach((p, idx) => {
      const found = allMedia.find(m => m.id === p.mediaId);
      if (found) {
        const isDisabled = disabledMediaIds.includes(found.id) || p.enabled === false;
        const isCurrentActive = !isDisabled && (activeMediaByZone[zone.id] === found.id || (!activeMediaByZone[zone.id] && idx === 0));
        
        let status: PlaybackStatus = 'waiting';
        if (isDisabled) {
          status = 'disabled';
        } else if (isCurrentActive) {
          status = 'playing';
        } else {
          status = 'waiting';
        }

        const effectiveScale = itemScaleModes[found.id] || p.scaleMode || zone.imageScaleMode || imageScaleMode || 'fit_device';

        screenMediaList.push({
          media: found,
          zoneId: zone.id,
          zoneName: zone.name,
          duration: p.duration || found.duration || 15,
          status,
          scaleMode: effectiveScale,
          enabled: !isDisabled,
        });
      }
    });
  });

  // Thống kê số lượng theo 3 trạng thái
  const countPlaying = screenMediaList.filter(s => s.status === 'playing').length;
  const countWaiting = screenMediaList.filter(s => s.status === 'waiting').length;
  const countDisabled = screenMediaList.filter(s => s.status === 'disabled').length;

  // Lọc theo tab
  const displayedMediaList = screenMediaList.filter(item => {
    if (mediaFilterTab === 'playing') return item.status === 'playing';
    if (mediaFilterTab === 'waiting') return item.status === 'waiting';
    if (mediaFilterTab === 'disabled') return item.status === 'disabled';
    return true;
  });

  // ----------------------------------------------------
  // NÚT ĐIỀU KHIỂN PHÁT / NGỪNG PHÁT / CHỜ PHÁT
  // ----------------------------------------------------

  // 1. NÚT PHÁT (PHÁT NGAY LẬP TỨC):
  // - Cho hình ấy chiếu NGAY LẬP TỨC
  // - Chuyển trạng thái sang 'Đang phát'
  // - Bỏ khỏi danh sách 'Không phát'
  const handlePlayImmediately = (item: ScreenMediaItem) => {
    // Gỡ khỏi disabled
    setDisabledMediaIds(prev => prev.filter(id => id !== item.media.id));
    
    // Đặt làm active media của zone này ngay lập tức
    setActiveMediaByZone(prev => ({
      ...prev,
      [item.zoneId]: item.media.id,
    }));

    // Cập nhật enabled = true trong editableZones
    setEditableZones(prev => prev.map(z => {
      if (z.id === item.zoneId) {
        return {
          ...z,
          mediaPlaylist: (z.mediaPlaylist || []).map(p => {
            if (p.mediaId === item.media.id) {
              return { ...p, enabled: true };
            }
            return p;
          }),
        };
      }
      return z;
    }));

    setHasUnsavedChanges(true);
    showNotice(`▶️ ĐANG PHÁT NGAY: "${item.media.title}" trên ${item.zoneName}!`);
  };

  // 2. NÚT NGỪNG PHÁT:
  // - Cho hình ấy KHÔNG ĐƯỢC CHIẾU NỮA
  // - Chuyển trạng thái sang 'Không phát'
  // - Nếu đang chiếu, đẩy mục khác đang chờ lên chiếu thay thế
  const handleStopPlayback = (item: ScreenMediaItem) => {
    // Thêm vào danh sách disabled
    setDisabledMediaIds(prev => Array.from(new Set([...prev, item.media.id])));

    // Cập nhật enabled = false trong editableZones
    setEditableZones(prev => prev.map(z => {
      if (z.id === item.zoneId) {
        return {
          ...z,
          mediaPlaylist: (z.mediaPlaylist || []).map(p => {
            if (p.mediaId === item.media.id) {
              return { ...p, enabled: false };
            }
            return p;
          }),
        };
      }
      return z;
    }));

    // Nếu item này đang phát, chuyển sang item tiếp theo đang chờ phát
    if (activeMediaByZone[item.zoneId] === item.media.id) {
      const remainingEnabled = screenMediaList.filter(
        s => s.zoneId === item.zoneId && s.media.id !== item.media.id && !disabledMediaIds.includes(s.media.id)
      );
      if (remainingEnabled.length > 0) {
        setActiveMediaByZone(prev => ({
          ...prev,
          [item.zoneId]: remainingEnabled[0].media.id,
        }));
      } else {
        setActiveMediaByZone(prev => {
          const clone = { ...prev };
          delete clone[item.zoneId];
          return clone;
        });
      }
    }

    setHasUnsavedChanges(true);
    showNotice(`⏸️ ĐÃ NGỪNG PHÁT: "${item.media.title}" (Hình này sẽ không được chiếu nữa)`);
  };

  // 3. NÚT ĐƯA VÀO CHỜ PHÁT:
  // - Chuyển từ 'Không phát' sang 'Chờ phát' (được xếp vào hàng đợi phát tuần tự)
  const handleSetWaiting = (item: ScreenMediaItem) => {
    setDisabledMediaIds(prev => prev.filter(id => id !== item.media.id));

    setEditableZones(prev => prev.map(z => {
      if (z.id === item.zoneId) {
        return {
          ...z,
          mediaPlaylist: (z.mediaPlaylist || []).map(p => {
            if (p.mediaId === item.media.id) {
              return { ...p, enabled: true };
            }
            return p;
          }),
        };
      }
      return z;
    }));

    setHasUnsavedChanges(true);
    showNotice(`⏱️ ĐÃ ĐƯA VÀO CHỜ PHÁT: "${item.media.title}"`);
  };

  // 4. NÚT XÓA: Gỡ hẳn khỏi màn hình
  const handleRemoveMedia = (item: ScreenMediaItem) => {
    if (confirm(`Bạn có chắc chắn muốn xóa "${item.media.title}" khỏi danh sách chiếu của màn hình này?`)) {
      setEditableZones(prev => prev.map(z => {
        if (z.id === item.zoneId) {
          const currentList = z.mediaPlaylist || getZonePlaylist(z);
          return {
            ...z,
            mediaPlaylist: currentList.filter(p => p.mediaId !== item.media.id),
          };
        }
        return z;
      }));
      setDisabledMediaIds(prev => prev.filter(id => id !== item.media.id));
      setHasUnsavedChanges(true);
      showNotice(`🗑️ Đã xóa "${item.media.title}" khỏi danh sách`);
    }
  };

  // 5. ĐỔI CHẾ ĐỘ CO GIÃN HÌNH ẢNH TOÀN THIẾT BỊ
  const handleToggleScreenScaleMode = (mode: ImageScaleMode) => {
    setImageScaleMode(mode);
    setHasUnsavedChanges(true);
    showNotice(
      mode === 'fit_device'
        ? 'Đã chọn: Co giãn theo kích thước thiết bị (Lấp đầy toàn màn hình LED)'
        : 'Đã chọn: Co giãn theo kích thước hình (Giữ nguyên tỷ lệ gốc 100%)'
    );
  };

  // 6. ĐỔI CHẾ ĐỘ CO GIÃN CHO RIÊNG 1 TỆP
  const handleToggleItemScaleMode = (item: ScreenMediaItem) => {
    const currentMode = item.scaleMode || imageScaleMode || 'fit_device';
    const nextMode: ImageScaleMode = currentMode === 'fit_device' ? 'fit_image' : 'fit_device';

    setItemScaleModes(prev => ({
      ...prev,
      [item.media.id]: nextMode,
    }));

    setEditableZones(prev => prev.map(z => {
      if (z.id === item.zoneId) {
        return {
          ...z,
          mediaPlaylist: (z.mediaPlaylist || []).map(p => {
            if (p.mediaId === item.media.id) {
              return { ...p, scaleMode: nextMode };
            }
            return p;
          }),
        };
      }
      return z;
    }));

    setHasUnsavedChanges(true);
    showNotice(`"${item.media.title}": Đã chuyển sang ${nextMode === 'fit_device' ? 'Kích thước thiết bị' : 'Kích thước hình gốc'}`);
  };

  // ----------------------------------------------------
  // NÚT LƯU & ÁP DỤNG THAY ĐỔI (QUAN TRỌNG NHẤT)
  // ----------------------------------------------------
  const handleSaveAndApply = () => {
    const allScreens = storageService.getScreens();
    const latestLayouts = storageService.getLayouts();
    const targetLayout = latestLayouts.find(l => l.id === screen.currentLayoutId) || latestLayouts[0];
    if (!targetLayout) return;

    // 1. Cập nhật Layout Template với zones đã chỉnh sửa
    const updatedZones = editableZones.map(z => {
      const playlist = getZonePlaylist(z);
      return {
        ...z,
        mediaPlaylist: playlist.map(p => ({
          ...p,
          enabled: !disabledMediaIds.includes(p.mediaId),
          scaleMode: itemScaleModes[p.mediaId] || p.scaleMode || imageScaleMode,
        })),
      };
    });

    // Tự động phân lập bộ nhớ: Nếu layout đang dùng chung bởi nhiều màn hình khác -> Clone layout riêng cho màn hình này
    const screensSharingLayout = allScreens.filter(s => s.currentLayoutId === targetLayout.id);
    let finalLayoutId = targetLayout.id;

    if (screensSharingLayout.length > 1) {
      finalLayoutId = `layout-${screen.id}-${Date.now()}`;
      const clonedLayout: LayoutTemplate = {
        ...targetLayout,
        id: finalLayoutId,
        name: `${targetLayout.name} (${screen.code})`,
        zones: updatedZones,
        updatedAt: new Date().toISOString(),
      };
      storageService.addLayout(clonedLayout);
    } else {
      const updatedLayout: LayoutTemplate = {
        ...targetLayout,
        zones: updatedZones,
        updatedAt: new Date().toISOString(),
      };
      storageService.updateLayout(updatedLayout);
    }

    // 2. Cập nhật thông tin Màn Hình (Screen) với Layout ID riêng biệt
    const updatedScreen: Screen = {
      ...screen,
      currentLayoutId: finalLayoutId,
      volume,
      isMuted,
      powerState,
      imageScaleMode,
    };
    storageService.updateScreen(updatedScreen);

    // 3. Gửi các lệnh điều khiển đồng bộ trực tiếp xuống thiết bị
    storageService.sendRemoteCommand(screen.id, { type: 'set_image_scale_mode', value: imageScaleMode });
    storageService.sendRemoteCommand(screen.id, { type: 'volume', value: volume });
    storageService.sendRemoteCommand(screen.id, { type: 'power', value: powerState });
    storageService.sendRemoteCommand(screen.id, { type: 'apply_layout', value: finalLayoutId });

    setHasUnsavedChanges(false);
    showNotice(`🎉 ĐÃ LƯU & ÁP DỤNG THÀNH CÔNG THAY ĐỔI RIÊNG CHO MÀN HÌNH ${screen.code}!`);
    onUpdate();
  };

  // Các thao tác phần cứng tức thời
  const handleTogglePower = (newState: 'on' | 'off') => {
    setPowerState(newState);
    storageService.sendRemoteCommand(screen.id, { type: 'power', value: newState });
    setHasUnsavedChanges(true);
    showNotice(newState === 'on' ? 'Đã bật nguồn thiết bị' : 'Đã tắt màn hình thiết bị');
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    setIsMuted(false);
    storageService.sendRemoteCommand(screen.id, { type: 'volume', value: newVol });
    setHasUnsavedChanges(true);
  };

  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    storageService.sendRemoteCommand(screen.id, { type: 'mute' });
    setHasUnsavedChanges(true);
    showNotice(nextMute ? 'Đã tắt tiếng (Mute)' : 'Đã bật lại âm thanh');
  };

  const handleReboot = () => {
    if (confirm(`Bạn có chắc chắn muốn gửi lệnh khởi động lại thiết bị "${screen.name}" không?`)) {
      storageService.sendRemoteCommand(screen.id, { type: 'reboot' });
      showNotice('🚀 Đang gửi lệnh khởi động lại thiết bị...');
      onUpdate();
    }
  };

  const handleTakeScreenshot = () => {
    setIsCapturing(true);
    showNotice('Đang chụp ảnh thực tế từ thiết bị...');
    setTimeout(() => {
      const newUrl = `${screen.screenshotUrl.split('?')[0]}?t=${Date.now()}`;
      setScreenshotPreview(newUrl);
      storageService.sendRemoteCommand(screen.id, { type: 'screenshot' });
      setIsCapturing(false);
      showNotice('Đã cập nhật ảnh chụp màn hình mới nhất!');
      onUpdate();
    }, 1000);
  };

  // Thêm media từ thư viện
  const handleAddMediaFromLibrary = () => {
    if (selectedLibraryMediaIds.length === 0 || !selectedTargetZoneId) return;

    setEditableZones(prev => prev.map(z => {
      if (z.id === selectedTargetZoneId) {
        const existingPlaylist = z.mediaPlaylist || [];
        const newItems = selectedLibraryMediaIds
          .filter(mId => !existingPlaylist.some(p => p.mediaId === mId))
          .map(mId => {
            const found = allMedia.find(m => m.id === mId);
            return {
              mediaId: mId,
              duration: found?.duration || 15,
              scaleMode: addMediaScaleMode,
              enabled: true,
            };
          });
        return {
          ...z,
          mediaPlaylist: [...existingPlaylist, ...newItems],
        };
      }
      return z;
    }));

    // Bỏ khỏi danh sách disabled nếu có
    setDisabledMediaIds(prev => prev.filter(id => !selectedLibraryMediaIds.includes(id)));

    setIsAddMediaOpen(false);
    setSelectedLibraryMediaIds([]);
    setHasUnsavedChanges(true);
    showNotice(`Đã thêm ${selectedLibraryMediaIds.length} tệp vào danh sách chiếu!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-5xl rounded-2xl glass-panel-glow bg-slate-900/95 border border-slate-700 shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
        
        {/* ======================================================== */}
        {/* HEADER MODAL */}
        {/* ======================================================== */}
        <div className="p-4 md:px-6 md:py-4 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-950/60">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-600 via-sky-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 shrink-0 ring-1 ring-cyan-400/30">
              <Tv className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h3 className="text-base md:text-lg font-bold text-white tracking-tight">{screen.name}</h3>
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-cyan-300 font-bold">
                  {screen.code}
                </span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-semibold flex items-center space-x-1.5 ${
                    screen.status === 'online'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${screen.status === 'online' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                  <span>{screen.status === 'online' ? 'Trực Tuyến (Online)' : 'Ngoại Tuyến'}</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {screen.location} • {screen.deviceModel} • IP: {screen.ipAddress} • {screen.resolution.width}x{screen.resolution.height}px
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {hasUnsavedChanges && (
              <span className="hidden sm:inline-flex items-center space-x-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30 animate-pulse">
                <span>⚠️ Có thay đổi chưa lưu</span>
              </span>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
              title="Đóng cửa sổ"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Thông báo thao tác nhanh (Toast Notice) */}
        {actionNotice && (
          <div className="px-6 py-2 bg-gradient-to-r from-cyan-950/80 via-cyan-900/60 to-slate-900 border-b border-cyan-500/30 text-cyan-300 text-xs flex items-center space-x-2 shrink-0 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="font-semibold">{actionNotice}</span>
          </div>
        )}

        {/* ======================================================== */}
        {/* BODY CONTAINER: 2 CỘT TỐI ƯU VỊ TRÍ */}
        {/* ======================================================== */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-5">
          
          {/* ────────────────────────────────────────────────────────── */}
          {/* CỘT TRÁI (4 cols): LIVE PREVIEW & ĐIỀU KHIỂN THIẾT BỊ PHẦN CỨNG */}
          {/* ────────────────────────────────────────────────────────── */}
          <div className="md:col-span-4 space-y-4">
            {/* 1. Live Preview Màn Hình */}
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                  <Camera className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Ảnh Chụp Màn Hình Trực Tiếp</span>
                </span>
                <button
                  onClick={handleTakeScreenshot}
                  disabled={isCapturing}
                  className="flex items-center space-x-1 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 transition-all active:scale-95"
                >
                  <RefreshCw className={`w-3 h-3 ${isCapturing ? 'animate-spin' : ''}`} />
                  <span>{isCapturing ? 'Đang chụp...' : 'Chụp Lại'}</span>
                </button>
              </div>

              <div className="relative rounded-lg overflow-hidden border border-slate-700 bg-slate-950 aspect-video shadow-inner group">
                <img
                  src={screenshotPreview}
                  alt={screen.name}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80';
                  }}
                />
                <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded bg-black/75 backdrop-blur-sm text-[10px] text-slate-300 font-mono border border-white/10">
                  {screen.resolution.width}x{screen.resolution.height}px
                </div>
              </div>
            </div>

            {/* 2. Nguồn Thiết Bị (Power On / Off) */}
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                  <Power className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Nguồn Thiết Bị (Power)</span>
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  powerState === 'on' 
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                }`}>
                  {powerState === 'on' ? 'Đang Bật' : 'Đang Tắt'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleTogglePower('on')}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 border transition-all ${
                    powerState === 'on'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/10'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Power className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Bật Thiết Bị</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTogglePower('off')}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 border transition-all ${
                    powerState === 'off' || powerState === 'sleep'
                      ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-md shadow-rose-500/10'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Power className="w-3.5 h-3.5 text-rose-400" />
                  <span>Tắt Thiết Bị</span>
                </button>
              </div>
            </div>

            {/* 3. Âm Lượng Loa Màn Hình */}
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Âm Lượng Loa</span>
                </span>
                <button
                  type="button"
                  onClick={handleToggleMute}
                  className={`px-2 py-0.5 rounded-md text-xs font-semibold border flex items-center space-x-1 transition-all ${
                    isMuted
                      ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                  }`}
                >
                  {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                  <span>{isMuted ? 'Đang Tắt' : `${volume}%`}</span>
                </button>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                className="w-full accent-cyan-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
            </div>

            {/* 4. Bộ Nhớ Đệm & Thông Số Phần Cứng */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center space-x-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-slate-400" />
                  <span>Bộ Nhớ Đệm (ROM)</span>
                </span>
                <span className="font-mono text-slate-300">
                  {screen.storageUsed} GB / {screen.storageTotal} GB
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-sky-400 rounded-full"
                  style={{ width: `${(screen.storageUsed / screen.storageTotal) * 100}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                <span>App: <strong className="text-slate-300">{screen.appVersion}</strong></span>
                <span>Tín hiệu: <strong className="text-emerald-400">98% Rất Tốt</strong></span>
              </div>
            </div>
          </div>

          {/* ────────────────────────────────────────────────────────── */}
          {/* CỘT PHẢI (8 cols): QUẢN LÝ NỘI DUNG & TRÌNH CHIẾU MEDIA */}
          {/* ────────────────────────────────────────────────────────── */}
          <div className="md:col-span-8 space-y-4 flex flex-col">
            
            {/* 1. CHỌN CHẾ ĐỘ CO GIÃN HÌNH ẢNH TOÀN MÀN HÌNH */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
                  <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Chế Độ Áp Dụng Hình Ảnh Trên Thiết Bị:</span>
                </span>
                <span className="text-[10px] font-mono text-cyan-300 font-bold px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30">
                  {imageScaleMode === 'fit_device' ? 'Kích Thước Thiết Bị' : 'Kích Thước Hình Gốc'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {/* Lựa chọn 1: Theo kích thước thiết bị */}
                <button
                  type="button"
                  onClick={() => handleToggleScreenScaleMode('fit_device')}
                  className={`p-2.5 rounded-xl border text-left transition-all flex items-start space-x-2.5 ${
                    imageScaleMode === 'fit_device'
                      ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-md shadow-cyan-500/10 ring-1 ring-cyan-400'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <Tv className={`w-4 h-4 shrink-0 mt-0.5 ${imageScaleMode === 'fit_device' ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <div className="min-w-0">
                    <div className="font-bold text-xs flex items-center justify-between">
                      <span>Theo Kích Thước Thiết Bị</span>
                      {imageScaleMode === 'fit_device' && <Check className="w-3.5 h-3.5 text-cyan-400 stroke-[3]" />}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                      Lấp đầy toàn màn hình ({screen.resolution.width}x{screen.resolution.height}), không viền đen
                    </p>
                  </div>
                </button>

                {/* Lựa chọn 2: Theo kích thước hình */}
                <button
                  type="button"
                  onClick={() => handleToggleScreenScaleMode('fit_image')}
                  className={`p-2.5 rounded-xl border text-left transition-all flex items-start space-x-2.5 ${
                    imageScaleMode === 'fit_image'
                      ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-md shadow-cyan-500/10 ring-1 ring-cyan-400'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <ImageIcon className={`w-4 h-4 shrink-0 mt-0.5 ${imageScaleMode === 'fit_image' ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <div className="min-w-0">
                    <div className="font-bold text-xs flex items-center justify-between">
                      <span>Theo Kích Thước Hình</span>
                      {imageScaleMode === 'fit_image' && <Check className="w-3.5 h-3.5 text-cyan-400 stroke-[3]" />}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                      Giữ nguyên tỷ lệ gốc 100%, trọn vẹn hình ảnh không bị cắt mép
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* 2. BẢNG QUẢN LÝ MEDIA TRÌNH CHIẾU (PLAYLIST CONTROLLER) */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3 flex-1 flex flex-col min-h-0">
              
              {/* Header Bar của Playlist */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
                    <Film className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Danh Sách Hình Ảnh & Media Trình Chiếu</span>
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold">
                    {screenMediaList.length} Tệp
                  </span>
                </div>

                {/* Nút Thêm Media từ Thư Viện */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedLibraryMediaIds([]);
                    setIsAddMediaOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white text-xs font-bold transition-all flex items-center space-x-1.5 shadow-md shadow-cyan-600/20 active:scale-95"
                  title="Thêm hình ảnh hoặc video từ Thư Viện Media vào màn hình này"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Thêm Từ Thư Viện</span>
                </button>
              </div>

              {/* Bộ lọc Tab Trạng Thái: Tất Cả / Đang Phát / Chờ Phát / Không Phát */}
              <div className="flex items-center space-x-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setMediaFilterTab('all')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center space-x-1.5 ${
                    mediaFilterTab === 'all'
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>Tất Cả ({screenMediaList.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMediaFilterTab('playing')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center space-x-1.5 ${
                    mediaFilterTab === 'playing'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-emerald-300'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Đang Phát ({countPlaying})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMediaFilterTab('waiting')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center space-x-1.5 ${
                    mediaFilterTab === 'waiting'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-amber-300'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>Chờ Phát ({countWaiting})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMediaFilterTab('disabled')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center space-x-1.5 ${
                    mediaFilterTab === 'disabled'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-rose-300'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-slate-500" />
                  <span>Không Phát ({countDisabled})</span>
                </button>
              </div>

              {/* Danh sách các Media Card có thanh cuộn mượt mà */}
              <div className="space-y-2.5 overflow-y-auto pr-1 flex-1 max-h-[360px]">
                {displayedMediaList.length > 0 ? (
                  displayedMediaList.map((item, idx) => (
                    <div
                      key={item.media.id + '-' + item.zoneId + '-' + idx}
                      className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 group ${
                        item.status === 'playing'
                          ? 'bg-slate-900/90 border-emerald-500/50 shadow-md shadow-emerald-500/5 ring-1 ring-emerald-500/20'
                          : item.status === 'waiting'
                          ? 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                          : 'bg-slate-950/60 border-slate-800/80 opacity-75 hover:opacity-100'
                      }`}
                    >
                      {/* Left: Media Thumbnail + Info */}
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        {/* Thumbnail với nút xem ảnh to */}
                        <div 
                          onClick={() => setPreviewMedia(item.media)}
                          className="relative w-16 h-12 rounded-lg overflow-hidden bg-black border border-slate-700 shrink-0 cursor-pointer group-hover:ring-1 group-hover:ring-cyan-400 shadow-sm"
                          title="Bấm để xem ảnh phóng to"
                        >
                          <img
                            src={item.media.thumbnail || item.media.url}
                            alt={item.media.title}
                            className={`w-full h-full ${item.scaleMode === 'fit_image' ? 'object-contain' : 'object-cover'}`}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=400&q=80';
                            }}
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Eye className="w-4 h-4 text-white" />
                          </div>
                        </div>

                        {/* Title, Zone & Metadata */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-xs font-bold text-white truncate group-hover:text-cyan-300 transition-colors">
                              {item.media.title}
                            </h4>

                            {/* BADGE TRẠNG THÁI 3 MÀU RÕ RÀNG */}
                            <span className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 border ${
                              item.status === 'playing'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                                : item.status === 'waiting'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                item.status === 'playing' 
                                  ? 'bg-emerald-400 animate-pulse' 
                                  : item.status === 'waiting' 
                                  ? 'bg-amber-400' 
                                  : 'bg-rose-400'
                              }`} />
                              <span>
                                {item.status === 'playing' ? 'Đang phát' : item.status === 'waiting' ? 'Chờ phát' : 'Không phát'}
                              </span>
                            </span>
                          </div>

                          {/* Sub-info: Zone, Duration & Individual Scaling Toggle */}
                          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5">
                            <div className="flex items-center space-x-2 truncate">
                              <span className="text-cyan-400 font-medium truncate">{item.zoneName}</span>
                              <span>•</span>
                              <span className="font-mono bg-slate-800/80 px-1.5 py-0.5 rounded text-slate-300 text-[10px]">
                                {item.duration}s
                              </span>
                              <span>•</span>
                              {/* Nút đổi co giãn cho riêng tệp này */}
                              <button
                                type="button"
                                onClick={() => handleToggleItemScaleMode(item)}
                                className={`px-2 py-0.5 rounded text-[10px] font-semibold border flex items-center space-x-1 transition-all ${
                                  item.scaleMode === 'fit_device'
                                    ? 'bg-sky-500/15 border-sky-500/30 text-sky-300 hover:bg-sky-500/25'
                                    : 'bg-purple-500/15 border-purple-500/30 text-purple-300 hover:bg-purple-500/25'
                                }`}
                                title="Bấm để đổi chế độ hiển thị: Kích thước thiết bị (Lấp đầy) vs Kích thước hình gốc"
                              >
                                {item.scaleMode === 'fit_device' ? (
                                  <>
                                    <Tv className="w-2.5 h-2.5" />
                                    <span>Kích thước thiết bị</span>
                                  </>
                                ) : (
                                  <>
                                    <ImageIcon className="w-2.5 h-2.5" />
                                    <span>Kích thước hình</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: ACTION BUTTONS (PHÁT NGAY / NGỪNG PHÁT / CHỜ PHÁT / XÓA) */}
                      <div className="flex items-center space-x-1.5 shrink-0 pl-1 border-l border-slate-800">
                        
                        {/* 1. Nếu đang phát -> Có nút NGỪNG PHÁT */}
                        {item.status === 'playing' && (
                          <button
                            type="button"
                            onClick={() => handleStopPlayback(item)}
                            className="px-2.5 py-1.5 rounded-lg bg-amber-600/80 hover:bg-amber-500 text-white text-[11px] font-bold transition-all flex items-center space-x-1 shadow-sm active:scale-95"
                            title="Ngừng chiếu hình này ngay lập tức (Chuyển sang 'Không phát')"
                          >
                            <Pause className="w-3 h-3 fill-current" />
                            <span>Ngừng phát</span>
                          </button>
                        )}

                        {/* 2. Nếu đang chờ phát -> Có nút PHÁT NGAY + Nút NGỪNG PHÁT */}
                        {item.status === 'waiting' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handlePlayImmediately(item)}
                              className="px-2.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-bold transition-all flex items-center space-x-1 shadow-sm active:scale-95"
                              title="Cho hình này chiếu NGAY LẬP TỨC trên màn hình LED"
                            >
                              <Play className="w-3 h-3 fill-current" />
                              <span>Phát ngay</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleStopPlayback(item)}
                              className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-300 text-[11px] font-semibold transition-all"
                              title="Ngừng phát tệp này"
                            >
                              <Pause className="w-3 h-3" />
                            </button>
                          </>
                        )}

                        {/* 3. Nếu đang KHÔNG PHÁT -> Có nút PHÁT NGAY + Nút CHỜ PHÁT */}
                        {item.status === 'disabled' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handlePlayImmediately(item)}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition-all flex items-center space-x-1 shadow-sm active:scale-95"
                              title="Chiếu ngay lập tức lên màn hình LED"
                            >
                              <Play className="w-3 h-3 fill-current" />
                              <span>Phát ngay</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleSetWaiting(item)}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-[11px] font-semibold transition-all flex items-center space-x-1"
                              title="Đưa tệp này trở lại danh sách chờ phát tuần tự"
                            >
                              <Clock className="w-3 h-3" />
                              <span>Chờ phát</span>
                            </button>
                          </>
                        )}

                        {/* Nút Xóa khỏi danh sách */}
                        <button
                          type="button"
                          onClick={() => handleRemoveMedia(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 transition-all"
                          title="Xóa hẳn tệp này khỏi màn hình"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-slate-500 text-xs space-y-2">
                    <p>Không có tệp nào trong mục này.</p>
                    <button
                      type="button"
                      onClick={() => setMediaFilterTab('all')}
                      className="text-cyan-400 font-bold hover:underline"
                    >
                      Xem tất cả tệp
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* ======================================================== */}
        {/* FOOTER MODAL CỐ ĐỊNH: NÚT LƯU & ÁP DỤNG NỔI BẬT */}
        {/* ======================================================== */}
        <div className="p-4 md:px-6 border-t border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span>Các thay đổi khi bấm Lưu sẽ có hiệu lực trực tiếp trên màn hình LED.</span>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              onClick={handleReboot}
              className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-amber-400 text-xs font-semibold flex items-center space-x-1.5 transition-all"
              title="Khởi động lại phần mềm trình chiếu trên màn hình LED"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Khởi Động Lại</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all"
            >
              Đóng
            </button>

            {/* NÚT LƯU ĐỂ ÁP DỤNG SAU KHI CHỈNH SỬA */}
            <button
              type="button"
              onClick={handleSaveAndApply}
              className={`px-5 py-2 rounded-xl font-extrabold text-xs transition-all flex items-center space-x-2 shadow-lg active:scale-95 ${
                hasUnsavedChanges
                  ? 'bg-gradient-to-r from-emerald-500 via-cyan-500 to-sky-500 text-white shadow-cyan-500/25 ring-2 ring-cyan-400 animate-pulse'
                  : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-600/20'
              }`}
            >
              <Save className="w-4 h-4" />
              <span>💾 Lưu & Áp Dụng Thay Đổi</span>
            </button>
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* MODAL PHÓNG TO XEM TRƯỚC MEDIA (PREVIEW) */}
      {/* ======================================================== */}
      {previewMedia && (
        <div 
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn"
          onClick={() => setPreviewMedia(null)}
        >
          <div 
            className="max-w-3xl w-full bg-slate-900 rounded-2xl border border-slate-700 p-4 space-y-3 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white truncate">{previewMedia.title}</h4>
              <button 
                onClick={() => setPreviewMedia(null)} 
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-video w-full rounded-xl overflow-hidden bg-black flex items-center justify-center">
              {previewMedia.type === 'video' ? (
                <video src={previewMedia.url} controls autoPlay className="max-h-full max-w-full" />
              ) : (
                <img src={previewMedia.url} alt={previewMedia.title} className="max-h-full max-w-full object-contain" />
              )}
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <span>Độ phân giải: <strong className="text-slate-200">{previewMedia.resolution}</strong></span>
              <span>Thời lượng: <strong className="text-slate-200">{previewMedia.duration} giây</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL THÊM MEDIA TỪ THƯ VIỆN */}
      {/* ======================================================== */}
      {isAddMediaOpen && currentLayout && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-2xl bg-slate-900 rounded-2xl border border-slate-700 p-5 space-y-4 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Thêm Hình Ảnh / Video Từ Thư Viện</h4>
                  <p className="text-[11px] text-slate-400">Chọn tệp sẵn có để đưa vào danh sách chiếu của màn hình</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAddMediaOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chọn Zone đích + Chọn Chế độ co giãn mặc định */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Vùng Chiếu (Zone):</label>
                <select
                  value={selectedTargetZoneId}
                  onChange={(e) => setSelectedTargetZoneId(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold focus:outline-none focus:border-cyan-500"
                >
                  {currentLayout.zones.map(z => (
                    <option key={z.id} value={z.id}>{z.name} ({z.type})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Chế Độ Áp Dụng Hình:</label>
                <select
                  value={addMediaScaleMode}
                  onChange={(e) => setAddMediaScaleMode(e.target.value as ImageScaleMode)}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold focus:outline-none focus:border-cyan-500"
                >
                  <option value="fit_device">Theo kích thước thiết bị (Lấp đầy)</option>
                  <option value="fit_image">Theo kích thước hình (Giữ nguyên tỷ lệ)</option>
                </select>
              </div>
            </div>

            {/* Search & Filter */}
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm kiếm tên hình ảnh hoặc video..."
                  value={librarySearch}
                  onChange={(e) => setLibrarySearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center space-x-1 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setLibraryFilterType('ALL')}
                  className={`px-2.5 py-0.5 rounded-lg font-semibold ${libraryFilterType === 'ALL' ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}
                >
                  Tất cả
                </button>
                <button
                  type="button"
                  onClick={() => setLibraryFilterType('image')}
                  className={`px-2.5 py-0.5 rounded-lg font-semibold ${libraryFilterType === 'image' ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}
                >
                  Ảnh
                </button>
                <button
                  type="button"
                  onClick={() => setLibraryFilterType('video')}
                  className={`px-2.5 py-0.5 rounded-lg font-semibold ${libraryFilterType === 'video' ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}
                >
                  Video
                </button>
              </div>
            </div>

            {/* Danh Sách Media trong Thư Viện */}
            <div className="flex-1 overflow-y-auto space-y-1.5 max-h-60 pr-1">
              {allMedia
                .filter(m => {
                  const matchSearch = m.title.toLowerCase().includes(librarySearch.toLowerCase());
                  const matchType = libraryFilterType === 'ALL' || m.type === libraryFilterType;
                  return matchSearch && matchType;
                })
                .map(media => {
                  const isSelected = selectedLibraryMediaIds.includes(media.id);
                  return (
                    <div
                      key={media.id}
                      onClick={() => {
                        setSelectedLibraryMediaIds(prev =>
                          prev.includes(media.id)
                            ? prev.filter(id => id !== media.id)
                            : [...prev, media.id]
                        );
                      }}
                      className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-cyan-500/15 border-cyan-500 text-white shadow-sm'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                        <div className="w-12 h-8 rounded-lg overflow-hidden bg-black shrink-0 border border-slate-700">
                          <img 
                            src={media.thumbnail || media.url} 
                            alt={media.title} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold truncate">{media.title}</div>
                          <div className="text-[10px] text-slate-400 flex items-center space-x-2">
                            <span>{media.type === 'video' ? '🎬 Video' : '🖼️ Hình ảnh'}</span>
                            <span>•</span>
                            <span>{media.resolution}</span>
                            <span>•</span>
                            <span>{media.duration}s</span>
                          </div>
                        </div>
                      </div>

                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ml-2 ${
                        isSelected ? 'bg-cyan-500 border-cyan-400 text-slate-950 font-bold' : 'border-slate-700'
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <span className="text-xs text-slate-400">
                Đã chọn: <strong className="text-cyan-400">{selectedLibraryMediaIds.length}</strong> tệp
              </span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddMediaOpen(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  disabled={selectedLibraryMediaIds.length === 0}
                  onClick={handleAddMediaFromLibrary}
                  className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-cyan-600/20"
                >
                  + Thêm Vào Màn Hình
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
