import React, { useState, useEffect } from 'react';
import { 
  Tv, 
  Plus, 
  Sliders, 
  RefreshCw, 
  Search, 
  Filter, 
  Layers, 
  Power, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  HardDrive,
  Trash2,
  ExternalLink,
  CheckCircle2,
  XCircle,
  MapPin,
  Cpu,
  LayoutGrid,
  List,
  Map as MapIcon,
  MonitorPlay
} from 'lucide-react';
import { Screen, LayoutTemplate } from '../types';
import { storageService } from '../services/storage';
import { ScreenMapView } from '../components/ScreenMapView';

interface ScreensViewProps {
  onSelectScreenForRemote: (screen: Screen) => void;
  onOpenPairModal: () => void;
  onOpenPlayerSimulator: (screenId?: string) => void;
}

export const ScreensView: React.FC<ScreensViewProps> = ({
  onSelectScreenForRemote,
  onOpenPairModal,
  onOpenPlayerSimulator
}) => {
  const [screens, setScreens] = useState<Screen[]>(storageService.getScreens());
  const [layouts, setLayouts] = useState<LayoutTemplate[]>(storageService.getLayouts());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [displayMode, setDisplayMode] = useState<'grid' | 'table' | 'map'>('grid');

  useEffect(() => {
    const update = () => {
      setScreens(storageService.getScreens());
      setLayouts(storageService.getLayouts());
    };
    return storageService.subscribe(update);
  }, []);

  const groups = ['ALL', ...Array.from(new Set(screens.map(s => s.group)))];

  const filteredScreens = screens.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchGroup = selectedGroup === 'ALL' || s.group === selectedGroup;
    const matchStatus = selectedStatus === 'ALL' || s.status === selectedStatus;
    return matchSearch && matchGroup && matchStatus;
  });

  const handleDeleteScreen = (id: string, name: string) => {
    if (confirm(`Bạn có chắc muốn gỡ bỏ màn hình "${name}" khỏi hệ thống?`)) {
      storageService.deleteScreen(id);
    }
  };

  const handleQuickLayoutChange = (screenId: string, layoutId: string) => {
    storageService.sendRemoteCommand(screenId, { type: 'apply_layout', value: layoutId });
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2.5">
            <Tv className="w-6 h-6 text-cyan-400" />
            <span>Quản Lý Màn Hình & Thiết Bị LED</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Theo dõi tình trạng kết nối, điều khiển từ xa và phân bổ bố cục phát sóng cho từng màn hình
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Mode Switcher */}
          <div className="flex items-center space-x-1 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <button
              onClick={() => setDisplayMode('grid')}
              className={`p-1.5 rounded-lg transition-all flex items-center space-x-1 ${
                displayMode === 'grid'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Chế độ thẻ lưới"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline font-semibold">Lưới</span>
            </button>

            <button
              onClick={() => setDisplayMode('table')}
              className={`p-1.5 rounded-lg transition-all flex items-center space-x-1 ${
                displayMode === 'table'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Chế độ bảng danh sách"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline font-semibold">Bảng</span>
            </button>

            <button
              onClick={() => setDisplayMode('map')}
              className={`p-1.5 rounded-lg transition-all flex items-center space-x-1 ${
                displayMode === 'map'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Chế độ bản đồ số GIS"
            >
              <MapIcon className="w-4 h-4" />
              <span className="hidden sm:inline font-semibold">Bản Đồ</span>
            </button>
          </div>

          <button
            onClick={onOpenPairModal}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/20 transition-all active:scale-95 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Ghép Nối Màn Hình Mới</span>
          </button>
        </div>
      </div>

      {/* Conditional Rendering based on displayMode */}
      {displayMode === 'map' ? (
        <ScreenMapView
          screens={screens}
          layouts={layouts}
          onSelectScreenForRemote={onSelectScreenForRemote}
          onOpenPlayerSimulator={onOpenPlayerSimulator}
        />
      ) : (
        <>
          {/* Filter & Search Bar */}
          <div className="glass-panel p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm theo tên, mã pairing (LED-xxxx), vị trí..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              {/* Group Filter */}
              <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                <span className="text-slate-400 text-[11px] px-2">Nhóm:</span>
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="bg-transparent text-white font-medium text-xs focus:outline-none cursor-pointer pr-2"
                >
                  {groups.map(g => (
                    <option key={g} value={g} className="bg-slate-900">
                      {g === 'ALL' ? 'Tất cả nhóm' : g}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                <span className="text-slate-400 text-[11px] px-2">Trạng thái:</span>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="bg-transparent text-white font-medium text-xs focus:outline-none cursor-pointer pr-2"
                >
                  <option value="ALL" className="bg-slate-900">Tất cả</option>
                  <option value="online" className="bg-slate-900">Đang Online</option>
                  <option value="offline" className="bg-slate-900">Ngoại tuyến</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table Mode */}
          {displayMode === 'table' ? (
            <div className="rounded-2xl glass-panel bg-slate-900/60 border border-slate-800 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-3.5">Mã & Tên Màn Hình</th>
                      <th className="p-3.5">Độ Phân Giải</th>
                      <th className="p-3.5">Vị Trí & Đơn Vị</th>
                      <th className="p-3.5">Trạng Thái</th>
                      <th className="p-3.5">Bố Cục Đang Phát</th>
                      <th className="p-3.5">Card Điều Khiển</th>
                      <th className="p-3.5 text-right">Điều Khiển</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {filteredScreens.map((screen) => {
                      const layout = layouts.find(l => l.id === screen.currentLayoutId);
                      return (
                        <tr key={screen.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="p-3.5">
                            <div className="flex items-center space-x-3">
                              <img
                                src={screen.screenshotUrl}
                                alt={screen.name}
                                className="w-12 h-8 rounded-lg object-cover ring-1 ring-slate-700"
                              />
                              <div>
                                <div className="font-bold text-white text-xs">{screen.name}</div>
                                <div className="text-[11px] font-mono text-cyan-400 font-bold">{screen.code}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3.5 font-mono text-slate-300">
                            {screen.resolution.width}x{screen.resolution.height}
                          </td>
                          <td className="p-3.5">
                            <div className="text-slate-200">{screen.location}</div>
                            <div className="text-[10px] text-slate-400">{screen.branch || screen.group}</div>
                          </td>
                          <td className="p-3.5">
                            <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              screen.status === 'online'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${screen.status === 'online' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                              <span>{screen.status === 'online' ? 'Online' : 'Offline'}</span>
                            </span>
                          </td>
                          <td className="p-3.5">
                            <span className="font-semibold text-cyan-300">
                              {layout?.name || 'Mặc định'}
                            </span>
                          </td>
                          <td className="p-3.5 text-slate-400 font-mono text-[11px]">
                            {screen.deviceModel}
                          </td>
                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end space-x-1">
                              <button
                                onClick={() => onOpenPlayerSimulator(screen.id)}
                                className="p-1.5 text-slate-400 hover:text-cyan-300 rounded-lg hover:bg-slate-800"
                                title="Xem Player"
                              >
                                <MonitorPlay className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => onSelectScreenForRemote(screen)}
                                className="p-1.5 text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-slate-800"
                                title="Điều khiển từ xa"
                              >
                                <Sliders className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteScreen(screen.id, screen.name)}
                                className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800"
                                title="Gỡ bỏ"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Screen Cards Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredScreens.map((screen) => {
          const layout = layouts.find(l => l.id === screen.currentLayoutId);
          return (
            <div
              key={screen.id}
              className="rounded-2xl glass-panel bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 transition-all p-5 flex flex-col justify-between space-y-4 shadow-lg group"
            >
              <div className="space-y-3">
                {/* Header: Name, Code & Status */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold">
                        {screen.code}
                      </span>
                      <span className="text-[11px] font-medium text-slate-400">
                        {screen.group}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white mt-1.5 line-clamp-1">
                      {screen.name}
                    </h3>
                  </div>

                  <span
                    className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                      screen.status === 'online'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        screen.status === 'online' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                      }`}
                    />
                    <span>{screen.status === 'online' ? 'Online' : 'Offline'}</span>
                  </span>
                </div>

                {/* Screenshot & Resolution Preview */}
                <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950 border border-slate-800 group/img">
                  <img
                    src={screen.screenshotUrl}
                    alt={screen.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-105"
                  />
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[10px] font-mono text-slate-300">
                    {screen.resolution?.width || 1920}x{screen.resolution?.height || 1080} ({screen.orientation === 'portrait' ? 'Dọc' : 'Ngang'})
                  </div>
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[10px] text-slate-300 flex items-center space-x-1">
                    <Cpu className="w-3 h-3 text-cyan-400" />
                    <span>{(screen.deviceModel || 'LED Controller').split(' ')[0]}</span>
                  </div>
                </div>

                {/* Meta details */}
                <div className="space-y-1.5 text-xs text-slate-400">
                  <div className="flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{screen.location}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span>Bộ nhớ đệm: <strong>{screen.storageUsed} GB / {screen.storageTotal} GB</strong></span>
                    <span>Âm lượng: <strong>{screen.isMuted ? 'Tắt' : `${screen.volume}%`}</strong></span>
                  </div>
                </div>

                {/* Current Layout Picker */}
                <div className="pt-2 border-t border-slate-800">
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Bố Cục Đang Phát (Layout)
                  </label>
                  <select
                    value={screen.currentLayoutId}
                    onChange={(e) => handleQuickLayoutChange(screen.id, e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500 truncate"
                  >
                    {layouts.map(l => (
                      <option key={l.id} value={l.id} className="bg-slate-900">
                        {l.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => onOpenPlayerSimulator(screen.id)}
                    className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center space-x-1 text-[11px]"
                    title="Mở trình phát mô phỏng màn hình này"
                  >
                    <MonitorPlay className="w-3.5 h-3.5" />
                    <span>Mô Phỏng</span>
                  </button>

                  <a
                    href="/player/index.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center space-x-1 text-[11px]"
                    title="Mở Web Player độc lập toàn màn hình cho màn hình LED hoặc TV"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Web Player</span>
                  </a>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onSelectScreenForRemote(screen)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-cyan-600 hover:text-white text-cyan-400 font-bold text-xs transition-all flex items-center space-x-1.5 shadow-sm"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Điều Khiển</span>
                  </button>

                  <button
                    onClick={() => handleDeleteScreen(screen.id, screen.name)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                    title="Gỡ bỏ màn hình"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    )}

      {filteredScreens.length === 0 && (
          <div className="text-center py-16 rounded-2xl glass-panel bg-slate-900/40 border border-slate-800 space-y-3">
            <Tv className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-slate-300">Không tìm thấy màn hình LED nào phù hợp</h3>
            <p className="text-xs text-slate-400">Hãy thử điều chỉnh bộ lọc hoặc ghép nối thêm màn hình mới</p>
            <button
              onClick={onOpenPairModal}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold"
            >
              + Ghép Nối Màn Hình Mới
            </button>
          </div>
        )}
        </>
      )}
    </div>
  );
};
