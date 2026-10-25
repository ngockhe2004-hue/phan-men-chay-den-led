import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutTemplate as LayoutIcon, 
  Plus, 
  Trash2, 
  Save, 
  Film, 
  Image as ImageIcon, 
  Type, 
  Clock, 
  Sliders, 
  CheckCircle2, 
  AlertTriangle,
  X,
  Move,
  Maximize,
  Ratio,
  Monitor,
  Sparkles,
  ChevronDown,
  Tv
} from 'lucide-react';
import { LayoutTemplate, LayoutZone, ZoneType, ImageScaleMode } from '../types';
import { storageService } from '../services/storage';

interface ResolutionPreset {
  id: string;
  label: string;
  category: string;
  width: number;
  height: number;
  description: string;
}

const RESOLUTION_PRESETS: ResolutionPreset[] = [
  { id: 'fhd-16-9', label: 'Full HD 16:9 (1920 x 1080)', category: '16:9 Ngang', width: 1920, height: 1080, description: 'Chuẩn phổ biến nhất cho LED sảnh & TV' },
  { id: '4k-16-9', label: '4K Ultra HD 16:9 (3840 x 2160)', category: '16:9 Ngang', width: 3840, height: 2160, description: 'Màn hình ghép lớn & LED độ nét cao' },
  { id: 'hd-16-9', label: 'HD Ready 16:9 (1280 x 720)', category: '16:9 Ngang', width: 1280, height: 720, description: 'Màn hình kích thước vừa & nhỏ' },
  { id: 'kiosk-9-16', label: 'Kiosk Đứng 9:16 (1080 x 1920)', category: '9:16 Dọc', width: 1080, height: 1920, description: 'Màn hình quảng cáo chân đứng thang máy' },
  { id: 'kiosk-hd-9-16', label: 'Kiosk Dọc HD (720 x 1280)', category: '9:16 Dọc', width: 720, height: 1280, description: 'Bảng thông tin dọc kích thước vừa' },
  { id: 'uw-21-9', label: 'LED Ultrawide 21:9 (2560 x 1080)', category: 'Màn hình rộng', width: 2560, height: 1080, description: 'Màn hình LED quảng cáo ngoài trời' },
  { id: 'suw-32-9', label: 'LED Super Ultrawide 32:9 (3840 x 1080)', category: 'Màn hình rộng', width: 3840, height: 1080, description: 'LED sân khấu & hội trường trải dài' },
  { id: 'matrix-p3', label: 'LED Ma Trận P3/P4 (1280 x 384)', category: 'Đặc thù LED', width: 1280, height: 384, description: 'Kích thước ghép cabin LED ngang' },
  { id: 'ribbon-led', label: 'LED Dải Băng Tòa Nhà (1920 x 480)', category: 'Đặc thù LED', width: 1920, height: 480, description: 'Dải LED chạy dài viền tòa nhà' },
  { id: 'square-1-1', label: 'LED Vuông 1:1 (1024 x 1024)', category: 'Đặc thù LED', width: 1024, height: 1024, description: 'Khối Rubik LED / Trụ hiển thị 4 mặt' },
  { id: 'custom', label: 'Tùy Chỉnh Kích Thước Tự Do (Custom)', category: 'Tùy biến', width: 1920, height: 1080, description: 'Tự nhập chiều rộng & chiều cao pixel' }
];

type DragAction = 'move' | 'resize-br' | 'resize-r' | 'resize-b' | 'resize-tl';

interface DragState {
  action: DragAction;
  zoneId: string;
  startX: number;
  startY: number;
  initialX: number;
  initialY: number;
  initialW: number;
  initialH: number;
}

export const LayoutBuilderView: React.FC = () => {
  const [layouts, setLayouts] = useState<LayoutTemplate[]>(storageService.getLayouts());
  const [selectedLayoutId, setSelectedLayoutId] = useState<string>(layouts[0]?.id || '');
  const [activeLayout, setActiveLayout] = useState<LayoutTemplate | null>(layouts[0] || null);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [notification, setNotification] = useState('');

  // Delete Layout Confirmation Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Drag & Resize State
  const [dragState, setDragState] = useState<DragState | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const mediaList = storageService.getMedia();

  // Load selected layout
  useEffect(() => {
    const current = layouts.find(l => l.id === selectedLayoutId);
    if (current) {
      setActiveLayout(JSON.parse(JSON.stringify(current)));
      setSelectedZoneId(current.zones[0]?.id || null);
    }
  }, [selectedLayoutId, layouts]);

  // Global mouse event listener for dragging & resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragState || !canvasRef.current || !activeLayout) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const deltaXPct = ((e.clientX - dragState.startX) / rect.width) * 100;
      const deltaYPct = ((e.clientY - dragState.startY) / rect.height) * 100;

      const targetZone = activeLayout.zones.find(z => z.id === dragState.zoneId);
      if (!targetZone) return;

      let newX = targetZone.x;
      let newY = targetZone.y;
      let newW = targetZone.width;
      let newH = targetZone.height;

      if (dragState.action === 'move') {
        const rawX = dragState.initialX + deltaXPct;
        const rawY = dragState.initialY + deltaYPct;
        newX = Math.max(0, Math.min(100 - targetZone.width, rawX));
        newY = Math.max(0, Math.min(100 - targetZone.height, rawY));
      } else if (dragState.action === 'resize-br') {
        const rawW = dragState.initialW + deltaXPct;
        const rawH = dragState.initialH + deltaYPct;
        newW = Math.max(5, Math.min(100 - targetZone.x, rawW));
        newH = Math.max(5, Math.min(100 - targetZone.y, rawH));
      } else if (dragState.action === 'resize-r') {
        const rawW = dragState.initialW + deltaXPct;
        newW = Math.max(5, Math.min(100 - targetZone.x, rawW));
      } else if (dragState.action === 'resize-b') {
        const rawH = dragState.initialH + deltaYPct;
        newH = Math.max(5, Math.min(100 - targetZone.y, rawH));
      } else if (dragState.action === 'resize-tl') {
        const rawX = dragState.initialX + deltaXPct;
        const rawY = dragState.initialY + deltaYPct;
        newX = Math.max(0, Math.min(dragState.initialX + dragState.initialW - 5, rawX));
        newY = Math.max(0, Math.min(dragState.initialY + dragState.initialH - 5, rawY));
        newW = dragState.initialW - (newX - dragState.initialX);
        newH = dragState.initialH - (newY - dragState.initialY);
      }

      // Round to 1 decimal place
      newX = Math.round(newX * 10) / 10;
      newY = Math.round(newY * 10) / 10;
      newW = Math.round(newW * 10) / 10;
      newH = Math.round(newH * 10) / 10;

      const updatedZones = activeLayout.zones.map(z => 
        z.id === dragState.zoneId 
          ? { ...z, x: newX, y: newY, width: newW, height: newH } 
          : z
      );

      setActiveLayout({ ...activeLayout, zones: updatedZones });
    };

    const handleMouseUp = () => {
      if (dragState) {
        setDragState(null);
      }
    };

    if (dragState) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState, activeLayout]);

  const startDrag = (e: React.MouseEvent, zone: LayoutZone, action: DragAction) => {
    e.stopPropagation();
    setSelectedZoneId(zone.id);
    setDragState({
      action,
      zoneId: zone.id,
      startX: e.clientX,
      startY: e.clientY,
      initialX: zone.x,
      initialY: zone.y,
      initialW: zone.width,
      initialH: zone.height
    });
  };

  const handleSelectLayout = (id: string) => {
    setSelectedLayoutId(id);
  };

  const handlePresetResolutionChange = (presetId: string) => {
    if (!activeLayout) return;
    const preset = RESOLUTION_PRESETS.find(p => p.id === presetId);
    if (!preset) return;

    if (preset.id !== 'custom') {
      setActiveLayout({
        ...activeLayout,
        width: preset.width,
        height: preset.height
      });
      showNotice(`Đã đổi kích thước sang ${preset.label}`);
    }
  };

  const getCurrentPresetId = (): string => {
    if (!activeLayout) return 'custom';
    const match = RESOLUTION_PRESETS.find(
      p => p.id !== 'custom' && p.width === activeLayout.width && p.height === activeLayout.height
    );
    return match ? match.id : 'custom';
  };

  const handleCreateNewLayout = () => {
    const newLayout: LayoutTemplate = {
      id: 'layout-' + Date.now(),
      name: 'Bố Cục Mới ' + (layouts.length + 1),
      description: 'Bố cục tùy biến vừa được tạo',
      width: 1920,
      height: 1080,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      zones: [
        {
          id: 'zone-main-' + Date.now(),
          name: 'Khung Video Chính',
          x: 0,
          y: 0,
          width: 70,
          height: 90,
          zIndex: 1,
          type: 'video',
          mediaPlaylist: [
            { mediaId: mediaList[0]?.id || 'media-1', duration: 30 }
          ]
        },
        {
          id: 'zone-side-' + Date.now(),
          name: 'Khung Poster Phụ',
          x: 70,
          y: 0,
          width: 30,
          height: 90,
          zIndex: 1,
          type: 'image_slider',
          mediaPlaylist: [
            { mediaId: mediaList[2]?.id || 'media-3', duration: 15 }
          ]
        },
        {
          id: 'zone-ticker-' + Date.now(),
          name: 'Chữ Chạy Chân Trang',
          x: 0,
          y: 90,
          width: 100,
          height: 10,
          zIndex: 2,
          type: 'ticker',
          tickerText: '★ CHÀO MỪNG QUÝ KHÁCH ĐẾN VỚI HỆ THỐNG MÀN HÌNH LED ★',
          tickerSpeed: 15,
          tickerBgColor: '#0f172a',
          tickerTextColor: '#38bdf8',
          mediaPlaylist: []
        }
      ]
    };

    storageService.addLayout(newLayout);
    const updatedLayouts = storageService.getLayouts();
    setLayouts(updatedLayouts);
    setSelectedLayoutId(newLayout.id);
    showNotice(`Đã tạo bố cục mới "${newLayout.name}"`);
  };

  const handleAddZone = (type: ZoneType) => {
    if (!activeLayout) return;

    // Smart placement
    const currentZoneCount = activeLayout.zones.length;
    const isTicker = type === 'ticker';
    const newZone: LayoutZone = {
      id: 'zone-' + Date.now(),
      name: type === 'video' 
        ? `Khung Video ${currentZoneCount + 1}` 
        : type === 'image_slider' 
        ? `Khung Poster ${currentZoneCount + 1}` 
        : type === 'ticker' 
        ? `Dải Chữ Chạy ${currentZoneCount + 1}` 
        : `Khung Tiện Ích ${currentZoneCount + 1}`,
      x: isTicker ? 0 : Math.min(50, (currentZoneCount * 8) % 60),
      y: isTicker ? 90 : Math.min(50, (currentZoneCount * 8) % 60),
      width: isTicker ? 100 : 45,
      height: isTicker ? 10 : 40,
      zIndex: activeLayout.zones.length + 1,
      type,
      mediaPlaylist: [],
      tickerText: isTicker ? '★ THÔNG BÁO MỚI: Kính chúc quý khách một ngày làm việc hiệu quả và thành công! ★' : undefined,
      tickerSpeed: 15,
      tickerBgColor: '#0f172a',
      tickerTextColor: '#06b6d4',
      widgetType: type === 'widget' ? 'clock' : undefined
    };

    const updated = {
      ...activeLayout,
      zones: [...activeLayout.zones, newZone]
    };
    setActiveLayout(updated);
    setSelectedZoneId(newZone.id);
    showNotice(`Đã thêm ${newZone.name}. Bạn có thể kéo di chuyển hoặc kéo góc để đổi kích thước!`);
  };

  const handleDeleteZone = (zoneId: string) => {
    if (!activeLayout) return;
    const deletedZone = activeLayout.zones.find(z => z.id === zoneId);
    const updatedZones = activeLayout.zones.filter(z => z.id !== zoneId);
    setActiveLayout({ ...activeLayout, zones: updatedZones });
    setSelectedZoneId(updatedZones[0]?.id || null);
    showNotice(`Đã xóa vùng "${deletedZone?.name || 'Vùng'}" thành công!`);
  };

  const handleUpdateZone = (zoneId: string, patch: Partial<LayoutZone>) => {
    if (!activeLayout) return;
    const updatedZones = activeLayout.zones.map(z => z.id === zoneId ? { ...z, ...patch } : z);
    setActiveLayout({ ...activeLayout, zones: updatedZones });
  };

  const handleSaveLayout = () => {
    if (!activeLayout) return;
    storageService.updateLayout(activeLayout);
    setLayouts(storageService.getLayouts());
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleConfirmDeleteLayout = () => {
    if (!activeLayout) return;
    const all = storageService.getLayouts();
    if (all.length <= 1) {
      alert('Hệ thống bắt buộc phải giữ lại ít nhất 1 bố cục mẫu!');
      setDeleteModalOpen(false);
      return;
    }

    const layoutName = activeLayout.name;
    storageService.deleteLayout(activeLayout.id);
    const remaining = storageService.getLayouts();
    setLayouts(remaining);
    setSelectedLayoutId(remaining[0].id);
    setActiveLayout(remaining[0]);
    setDeleteModalOpen(false);
    showNotice(`Đã xóa bố cục "${layoutName}" thành công!`);
  };

  const showNotice = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  const selectedZone = activeLayout?.zones.find(z => z.id === selectedZoneId);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Title & Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2.5">
            <LayoutIcon className="w-6 h-6 text-cyan-400" />
            <span>Thiết Kế Bố Cục Màn Hình (Visual Layout Builder)</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Chọn kích thước LED từ danh sách mẫu, kéo thả trực quan vị trí & kích thước các vùng hiển thị (Multi-Zone)
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleCreateNewLayout}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all flex items-center space-x-1.5 shadow-sm active:scale-95"
          >
            <Plus className="w-4 h-4 text-cyan-400" />
            <span>Tạo Bố Cục Mới</span>
          </button>

          {/* Delete Layout Button */}
          <button
            onClick={() => setDeleteModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 text-xs font-semibold transition-all flex items-center space-x-1.5 active:scale-95"
            title="Xóa bố cục hiện tại"
          >
            <Trash2 className="w-4 h-4 text-rose-400" />
            <span>Xóa Bố Cục</span>
          </button>

          <button
            onClick={handleSaveLayout}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/25 transition-all flex items-center space-x-2 active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Lưu Thay Đổi Bố Cục</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center space-x-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold">Đã lưu bố cục màn hình thành công! Mọi màn hình sử dụng layout này sẽ tự động cập nhật.</span>
        </div>
      )}

      {notification && (
        <div className="p-3 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs flex items-center space-x-2 animate-fadeIn">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Layout Editor Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Template List & Dimension Presets (3 Cols) */}
        <div className="lg:col-span-3 space-y-4">
          {/* 1. Template List */}
          <div className="rounded-2xl glass-panel bg-slate-900/70 border border-slate-800 p-4 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Danh Sách Mẫu Bố Cục ({layouts.length})
            </span>

            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
              {layouts.map(layout => {
                const isCurrent = layout.id === selectedLayoutId;
                return (
                  <button
                    key={layout.id}
                    onClick={() => handleSelectLayout(layout.id)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all ${
                      isCurrent
                        ? 'bg-cyan-500/15 border-cyan-500/60 shadow-md shadow-cyan-500/10'
                        : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/50 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-bold ${isCurrent ? 'text-cyan-300' : 'text-white'} truncate`}>
                        {layout.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-[10px] text-slate-400">
                      <span className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
                        {layout.width}x{layout.height}
                      </span>
                      <span>{layout.zones.length} vùng</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. List Box Lựa Chọn Kích Thước Bố Cục (Resolution Presets Listbox) */}
          {activeLayout && (
            <div className="p-4 rounded-2xl glass-panel bg-slate-900/70 border border-slate-800 space-y-3">
              <div className="flex items-center space-x-2 text-xs font-bold text-white pb-2 border-b border-slate-800">
                <Ratio className="w-4 h-4 text-cyan-400" />
                <span>Kích Thước Màn Hình LED</span>
              </div>

              {/* List Box Select */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                  Chọn Chuẩn Độ Phân Giải (List Box):
                </label>
                <select
                  value={getCurrentPresetId()}
                  onChange={(e) => handlePresetResolutionChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-semibold text-cyan-300 focus:outline-none focus:border-cyan-500"
                >
                  <optgroup label="16:9 Ngang Phổ Biến">
                    <option value="fhd-16-9">Full HD 16:9 (1920 x 1080 px)</option>
                    <option value="4k-16-9">4K Ultra HD 16:9 (3840 x 2160 px)</option>
                    <option value="hd-16-9">HD Ready 16:9 (1280 x 720 px)</option>
                  </optgroup>
                  <optgroup label="9:16 Dọc Kiosk Chân Đứng">
                    <option value="kiosk-9-16">Kiosk Đứng 9:16 (1080 x 1920 px)</option>
                    <option value="kiosk-hd-9-16">Kiosk Dọc HD (720 x 1280 px)</option>
                  </optgroup>
                  <optgroup label="Màn Hình LED Rộng (Ultrawide)">
                    <option value="uw-21-9">LED Ultrawide 21:9 (2560 x 1080 px)</option>
                    <option value="suw-32-9">LED Super Ultrawide 32:9 (3840 x 1080 px)</option>
                  </optgroup>
                  <optgroup label="Màn Hình Ghép Cabin LED Đặc Thù">
                    <option value="matrix-p3">LED Ma Trận P3/P4 (1280 x 384 px)</option>
                    <option value="ribbon-led">LED Dải Băng Dài (1920 x 480 px)</option>
                    <option value="square-1-1">LED Vuông 1:1 (1024 x 1024 px)</option>
                  </optgroup>
                  <optgroup label="Khác">
                    <option value="custom">Tùy Chỉnh Kích Thước Pixel Tự Do</option>
                  </optgroup>
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  {RESOLUTION_PRESETS.find(p => p.id === getCurrentPresetId())?.description || ''}
                </p>
              </div>

              {/* Exact Pixel Inputs */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Rộng (Width px)</label>
                  <input
                    type="number"
                    min="100"
                    value={activeLayout.width}
                    onChange={(e) => setActiveLayout({ ...activeLayout, width: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Cao (Height px)</label>
                  <input
                    type="number"
                    min="100"
                    value={activeLayout.height}
                    onChange={(e) => setActiveLayout({ ...activeLayout, height: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                  />
                </div>
              </div>

              {/* Layout Name */}
              <div className="pt-2">
                <label className="text-[10px] text-slate-400 block mb-1">Tên Bố Cục</label>
                <input
                  type="text"
                  value={activeLayout.name}
                  onChange={(e) => setActiveLayout({ ...activeLayout, name: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                />
              </div>
            </div>
          )}
        </div>

        {/* Center Column: Interactive Drag & Drop Visual Canvas (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          {activeLayout && (
            <div className="rounded-2xl glass-panel bg-slate-900/70 border border-slate-800 p-5 space-y-4 shadow-xl">
              {/* Toolbar: Add Zones */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs font-bold text-slate-300 mr-1">+ Thêm Vùng:</span>
                  <button
                    onClick={() => handleAddZone('video')}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-cyan-600 hover:text-white text-xs text-cyan-300 font-semibold border border-slate-700 flex items-center space-x-1 transition-all"
                    title="Thêm khung phát Video clip"
                  >
                    <Film className="w-3 h-3" />
                    <span>Video</span>
                  </button>
                  <button
                    onClick={() => handleAddZone('image_slider')}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-emerald-600 hover:text-white text-xs text-emerald-300 font-semibold border border-slate-700 flex items-center space-x-1 transition-all"
                    title="Thêm khung trình chiếu Slide ảnh"
                  >
                    <ImageIcon className="w-3 h-3" />
                    <span>Slide Ảnh</span>
                  </button>
                  <button
                    onClick={() => handleAddZone('ticker')}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-amber-600 hover:text-white text-xs text-amber-300 font-semibold border border-slate-700 flex items-center space-x-1 transition-all"
                    title="Thêm dải băng chữ chạy chân trang"
                  >
                    <Type className="w-3 h-3" />
                    <span>Chữ Chạy</span>
                  </button>
                  <button
                    onClick={() => handleAddZone('widget')}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-purple-600 hover:text-white text-xs text-purple-300 font-semibold border border-slate-700 flex items-center space-x-1 transition-all"
                    title="Thêm tiện ích Đồng hồ, Thời tiết"
                  >
                    <Clock className="w-3 h-3" />
                    <span>Widget</span>
                  </button>
                </div>

                <div className="text-[11px] font-mono text-cyan-400 bg-black/60 px-2 py-1 rounded border border-cyan-500/30">
                  {activeLayout.width} x {activeLayout.height} px
                </div>
              </div>

              {/* Instructions banner */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
                <span className="flex items-center space-x-1.5">
                  <Move className="w-3.5 h-3.5 text-cyan-400" />
                  <span><strong>Kéo & Thả (Drag & Drop):</strong> Giữ chuột vào giữa khung để di chuyển; Kéo góc phải-dưới để thay đổi kích thước.</span>
                </span>
                <span className="text-cyan-400 font-bold">{activeLayout.zones.length} Vùng</span>
              </div>

              {/* The Interactive Visual Canvas */}
              <div
                ref={canvasRef}
                className="relative w-full rounded-xl overflow-hidden bg-black border-2 border-slate-700 led-grid-pattern shadow-2xl select-none"
                style={{
                  aspectRatio: `${activeLayout.width} / ${activeLayout.height}`,
                  maxHeight: '480px'
                }}
              >
                {activeLayout.zones.map((zone) => {
                  const isSelected = zone.id === selectedZoneId;
                  return (
                    <div
                      key={zone.id}
                      onMouseDown={(e) => startDrag(e, zone, 'move')}
                      className={`absolute transition-colors flex flex-col justify-between select-none overflow-visible group ${
                        isSelected
                          ? 'border-2 border-cyan-400 bg-cyan-500/25 shadow-2xl shadow-cyan-500/40 z-30 ring-1 ring-cyan-300'
                          : 'border border-slate-600/80 bg-slate-900/70 hover:bg-slate-900/90 hover:border-slate-400 z-10'
                      }`}
                      style={{
                        left: `${zone.x}%`,
                        top: `${zone.y}%`,
                        width: `${zone.width}%`,
                        height: `${zone.height}%`,
                        cursor: 'move',
                        backgroundColor: zone.type === 'ticker' ? zone.tickerBgColor || '#0f172a' : undefined
                      }}
                    >
                      {/* Zone Header Bar with Title, Coordinates & Quick Delete Button */}
                      <div className="flex items-center justify-between text-[10px] font-bold text-white bg-black/80 backdrop-blur-sm px-1.5 py-0.5 rounded m-1 w-auto pointer-events-auto">
                        <span className="flex items-center space-x-1 truncate mr-1">
                          {zone.type === 'video' && <Film className="w-2.5 h-2.5 text-cyan-400" />}
                          {zone.type === 'image_slider' && <ImageIcon className="w-2.5 h-2.5 text-emerald-400" />}
                          {zone.type === 'ticker' && <Type className="w-2.5 h-2.5 text-amber-400" />}
                          {zone.type === 'widget' && <Clock className="w-2.5 h-2.5 text-purple-400" />}
                          <span className="truncate max-w-[110px]">{zone.name}</span>
                        </span>

                        <div className="flex items-center space-x-1 shrink-0">
                          {/* Quick Delete Zone Button right on Canvas */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteZone(zone.id);
                            }}
                            className="p-0.5 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 transition-all"
                            title="Xóa vùng này"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Zone Content Mock Display */}
                      <div className="flex-1 flex items-center justify-center my-1 overflow-hidden px-2 pointer-events-none">
                        {zone.type === 'video' && (
                          <div className="text-center text-cyan-300 text-xs">
                            <Film className="w-6 h-6 mx-auto opacity-75 mb-1 animate-pulse" />
                            <span className="text-[10px] block opacity-90 font-medium">Khung Video (Clip TVC)</span>
                          </div>
                        )}
                        {zone.type === 'image_slider' && (
                          <div className="text-center text-emerald-300 text-xs">
                            <ImageIcon className="w-6 h-6 mx-auto opacity-75 mb-1" />
                            <span className="text-[10px] block opacity-90 font-medium">Slide Ảnh Poster</span>
                          </div>
                        )}
                        {zone.type === 'ticker' && (
                          <div
                            className="w-full text-xs font-semibold truncate animate-ticker"
                            style={{ color: zone.tickerTextColor || '#38bdf8' }}
                          >
                            {zone.tickerText}
                          </div>
                        )}
                        {zone.type === 'widget' && (
                          <div className="text-center text-purple-300 text-xs">
                            <Clock className="w-5 h-5 mx-auto opacity-75 mb-1" />
                            <span className="text-[11px] font-bold font-mono">17:55 • TP.HCM</span>
                          </div>
                        )}
                      </div>

                      {/* Live Dimension Indicator */}
                      <div className="px-1.5 py-0.5 text-[9px] font-mono text-slate-300 bg-black/70 rounded self-end m-1 pointer-events-none">
                        {zone.width}% x {zone.height}% ({Math.round(activeLayout.width * (zone.width / 100))}x{Math.round(activeLayout.height * (zone.height / 100))}px)
                      </div>

                      {/* RESIZE HANDLES (Shown when zone is selected) */}
                      {isSelected && (
                        <>
                          {/* Bottom-Right Corner Handle (Both W & H) */}
                          <div
                            onMouseDown={(e) => startDrag(e, zone, 'resize-br')}
                            className="absolute -bottom-1.5 -right-1.5 w-4 h-4 bg-cyan-400 border-2 border-slate-950 rounded-full cursor-se-resize shadow-md hover:scale-125 transition-transform z-40"
                            title="Kéo để chỉnh Chiều Rộng và Chiều Cao"
                          />

                          {/* Right Edge Handle (Width only) */}
                          <div
                            onMouseDown={(e) => startDrag(e, zone, 'resize-r')}
                            className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-5 bg-cyan-400 border border-slate-950 rounded cursor-e-resize shadow-md hover:scale-110 transition-transform z-40"
                            title="Kéo để chỉnh Chiều Rộng"
                          />

                          {/* Bottom Edge Handle (Height only) */}
                          <div
                            onMouseDown={(e) => startDrag(e, zone, 'resize-b')}
                            className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-3 bg-cyan-400 border border-slate-950 rounded cursor-s-resize shadow-md hover:scale-110 transition-transform z-40"
                            title="Kéo để chỉnh Chiều Cao"
                          />

                          {/* Top-Left Corner Handle */}
                          <div
                            onMouseDown={(e) => startDrag(e, zone, 'resize-tl')}
                            className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-cyan-400 border-2 border-slate-950 rounded-full cursor-nw-resize shadow-md hover:scale-125 transition-transform z-40"
                            title="Kéo để chỉnh vị trí và kích thước góc trên"
                          />
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Selected Zone Properties & Media Assignment (3 Cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="rounded-2xl glass-panel bg-slate-900/70 border border-slate-800 p-5 space-y-4 shadow-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Thuộc Tính Vùng Đang Chọn</span>
            </span>

            {selectedZone ? (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Tên Vùng
                  </label>
                  <input
                    type="text"
                    value={selectedZone.name}
                    onChange={(e) => handleUpdateZone(selectedZone.id, { name: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-medium"
                  />
                </div>

                {/* Coordinates & Dimensions % (Synchronized with Canvas Drag/Resize) */}
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <span className="text-[10px] font-bold uppercase text-cyan-400 block">
                    Tọa Độ & Kích Thước (% Màn Hình)
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-0.5">X (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        value={selectedZone.x}
                        onChange={(e) => handleUpdateZone(selectedZone.id, { x: Number(e.target.value) })}
                        className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-700 text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 mb-0.5">Y (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        value={selectedZone.y}
                        onChange={(e) => handleUpdateZone(selectedZone.id, { y: Number(e.target.value) })}
                        className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-700 text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 mb-0.5">Rộng Width (%)</label>
                      <input
                        type="number"
                        min="5"
                        max="100"
                        step="0.5"
                        value={selectedZone.width}
                        onChange={(e) => handleUpdateZone(selectedZone.id, { width: Number(e.target.value) })}
                        className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-700 text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 mb-0.5">Cao Height (%)</label>
                      <input
                        type="number"
                        min="5"
                        max="100"
                        step="0.5"
                        value={selectedZone.height}
                        onChange={(e) => handleUpdateZone(selectedZone.id, { height: Number(e.target.value) })}
                        className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-700 text-white font-mono"
                      />
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-400 pt-1 font-mono">
                    * Điểm bắt đầu: ({Math.round(activeLayout.width * (selectedZone.x / 100))}, {Math.round(activeLayout.height * (selectedZone.y / 100))} px)
                  </div>
                </div>

                {/* Specific configs for Ticker */}
                {selectedZone.type === 'ticker' && (
                  <div className="space-y-2.5 pt-2 border-t border-slate-800">
                    <div>
                      <label className="block text-[11px] font-semibold text-amber-300 mb-1">
                        Nội Dung Dòng Chữ Chạy (Ticker Text)
                      </label>
                      <textarea
                        rows={3}
                        value={selectedZone.tickerText || ''}
                        onChange={(e) => handleUpdateZone(selectedZone.id, { tickerText: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">Màu Chữ</label>
                        <input
                          type="color"
                          value={selectedZone.tickerTextColor || '#38bdf8'}
                          onChange={(e) => handleUpdateZone(selectedZone.id, { tickerTextColor: e.target.value })}
                          className="w-full h-8 rounded-lg bg-slate-950 border border-slate-700 cursor-pointer p-1"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">Màu Nền Băng</label>
                        <input
                          type="color"
                          value={selectedZone.tickerBgColor || '#0f172a'}
                          onChange={(e) => handleUpdateZone(selectedZone.id, { tickerBgColor: e.target.value })}
                          className="w-full h-8 rounded-lg bg-slate-950 border border-slate-700 cursor-pointer p-1"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Scale Mode & Assign Media for Video & Slider */}
                {(selectedZone.type === 'video' || selectedZone.type === 'image_slider') && (
                  <div className="space-y-3 pt-2 border-t border-slate-800">
                    {/* Chế độ co giãn hình ảnh của vùng này */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                        Chế Độ Áp Dụng Hình Ảnh / Video
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleUpdateZone(selectedZone.id, { imageScaleMode: 'fit_device' })}
                          className={`py-1.5 px-2 rounded-lg text-[10px] font-semibold flex items-center justify-center space-x-1 border transition-all ${
                            (selectedZone.imageScaleMode || 'fit_device') === 'fit_device'
                              ? 'bg-cyan-600 text-white border-cyan-500 shadow-sm'
                              : 'bg-slate-950 border-slate-700 text-slate-400 hover:text-white'
                          }`}
                        >
                          <Tv className="w-3 h-3" />
                          <span>Kích Thước Thiết Bị</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateZone(selectedZone.id, { imageScaleMode: 'fit_image' })}
                          className={`py-1.5 px-2 rounded-lg text-[10px] font-semibold flex items-center justify-center space-x-1 border transition-all ${
                            selectedZone.imageScaleMode === 'fit_image'
                              ? 'bg-cyan-600 text-white border-cyan-500 shadow-sm'
                              : 'bg-slate-950 border-slate-700 text-slate-400 hover:text-white'
                          }`}
                        >
                          <ImageIcon className="w-3 h-3" />
                          <span>Kích Thước Hình</span>
                        </button>
                      </div>
                      <p className="text-[9px] text-slate-400 mt-1">
                        {(selectedZone.imageScaleMode || 'fit_device') === 'fit_device'
                          ? '• Lấp đầy toàn khung thiết bị, không để viền đen'
                          : '• Giữ nguyên 100% tỷ lệ ảnh gốc, không bị cắt mép'}
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-semibold text-slate-300">
                        Gán Media Từ Thư Viện Vào Vùng
                      </label>
                      <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {mediaList
                        .filter(m => selectedZone.type === 'video' ? m.type === 'video' : m.type === 'image')
                        .map(media => {
                          const isAssigned = selectedZone.mediaPlaylist?.some(p => p.mediaId === media.id);
                          return (
                            <div
                              key={media.id}
                              onClick={() => {
                                const currentList = selectedZone.mediaPlaylist || [];
                                const nextList = isAssigned
                                  ? currentList.filter(p => p.mediaId !== media.id)
                                  : [...currentList, { mediaId: media.id, duration: media.duration || 15 }];
                                handleUpdateZone(selectedZone.id, { mediaPlaylist: nextList });
                              }}
                              className={`p-2 rounded-lg border text-[11px] cursor-pointer flex items-center justify-between transition-all ${
                                isAssigned
                                  ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-200'
                                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                              }`}
                            >
                              <span className="truncate mr-2 font-medium">{media.title}</span>
                              <span className="text-[10px] font-mono shrink-0">
                                {isAssigned ? '✓ Đã gán' : '+ Chọn'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Delete Zone Button */}
                <div className="pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => handleDeleteZone(selectedZone.id)}
                    className="w-full py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition-all flex items-center justify-center space-x-1.5"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Xóa Vùng Này Khỏi Bố Cục</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 text-xs">
                Chọn một vùng trên màn hình để cấu hình
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Deleting Layout */}
      {deleteModalOpen && activeLayout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl glass-panel-glow bg-slate-900 border border-rose-500/50 shadow-2xl p-6 relative">
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Xác Nhận Xóa Bố Cục?</h3>
                <p className="text-xs text-slate-400">Hành động này sẽ xóa vĩnh viễn mẫu bố cục khỏi hệ thống.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5 mb-5">
              <div className="text-slate-300">
                Tên bố cục: <strong className="text-white">{activeLayout.name}</strong>
              </div>
              <div className="text-slate-400">
                Độ phân giải: <span className="font-mono text-cyan-300">{activeLayout.width}x{activeLayout.height} px</span> ({activeLayout.zones.length} vùng)
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteLayout}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all active:scale-95 flex items-center space-x-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Xác Nhận Xóa Bố Cục</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
