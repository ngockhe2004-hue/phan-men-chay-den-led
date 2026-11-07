import React, { useState } from 'react';
import { 
  Tv, 
  MapPin, 
  Wifi, 
  Power, 
  Sliders, 
  MonitorPlay, 
  ExternalLink, 
  Layers, 
  Search, 
  Activity, 
  Cpu, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  Maximize2
} from 'lucide-react';
import { Screen, LayoutTemplate } from '../types';

interface ScreenMapViewProps {
  screens: Screen[];
  layouts: LayoutTemplate[];
  onSelectScreenForRemote: (screen: Screen) => void;
  onOpenPlayerSimulator: (screenId?: string) => void;
}

export const ScreenMapView: React.FC<ScreenMapViewProps> = ({
  screens,
  layouts,
  onSelectScreenForRemote,
  onOpenPlayerSimulator
}) => {
  const [selectedScreenId, setSelectedScreenId] = useState<string | null>(screens[0]?.id || null);
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('ALL');

  const selectedScreen = screens.find(s => s.id === selectedScreenId) || screens[0];
  const activeLayout = layouts.find(l => l.id === selectedScreen?.currentLayoutId);

  const cities = ['ALL', ...Array.from(new Set(screens.map(s => s.coordinates?.city || (s.location || '').split(',').pop()?.trim() || 'Khác')))];

  const filteredScreens = screens.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.code.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (s.location || '').toLowerCase().includes(searchFilter.toLowerCase());
    const city = s.coordinates?.city || (s.location || '').split(',').pop()?.trim() || 'Khác';
    const matchCity = selectedCity === 'ALL' || city === selectedCity;
    return matchSearch && matchCity;
  });

  return (
    <div className="rounded-3xl glass-panel bg-slate-900/70 border border-slate-800 overflow-hidden shadow-2xl">
      {/* Top Map Toolbar */}
      <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-950/40">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <span>Bản Đồ Phân Bổ Mạng Lưới Màn Hình LED (GIS Map)</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                Toàn Quốc
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Giám sát trực quan tọa độ địa lý, trạng thái phát sóng thời gian thực và ảnh chụp từ xa
            </p>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-48">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Tìm theo tên/mã LED..."
              className="w-full pl-8 pr-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500 font-medium"
          >
            {cities.map(c => (
              <option key={c} value={c}>
                {c === 'ALL' ? 'Tất cả khu vực' : c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Map Canvas (8 cols) + Screen Info Sidebar (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[540px]">
        
        {/* Left: Interactive Map Simulation Canvas (8 cols) */}
        <div className="lg:col-span-8 relative bg-gradient-to-b from-slate-950 via-[#071322] to-slate-950 p-6 flex flex-col justify-between overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800">
          {/* Subtle Map Grid Lines */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
          
          {/* Stylized Vietnam Vector Map Silhouette */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-25">
            <svg viewBox="0 0 500 800" className="w-full h-full max-h-[500px] text-cyan-500/20 fill-current">
              {/* Simplified Vietnam S-Curve Contour */}
              <path d="M220,50 C260,60 270,100 240,140 C220,170 210,210 230,250 C260,300 310,360 300,430 C290,480 250,530 260,590 C270,640 250,700 210,720 C180,730 160,680 180,640 C200,600 170,550 180,510 C190,460 210,400 200,340 C190,290 170,220 180,160 C190,110 180,60 220,50 Z" />
              {/* Islands simulation */}
              <circle cx="370" cy="420" r="16" />
              <circle cx="340" cy="650" r="22" />
            </svg>
          </div>

          {/* Regional Labels */}
          <div className="absolute top-8 left-8 text-[11px] font-bold tracking-wider text-slate-400 uppercase pointer-events-none">
            Khu Vực Miền Bắc (Hà Nội)
          </div>
          <div className="absolute top-1/2 -translate-y-1/2 right-12 text-[11px] font-bold tracking-wider text-slate-400 uppercase pointer-events-none">
            Khu Vực Miền Trung (Đà Nẵng)
          </div>
          <div className="absolute bottom-8 left-8 text-[11px] font-bold tracking-wider text-slate-400 uppercase pointer-events-none">
            Khu Vực Miền Nam (TP.HCM - Cần Thơ)
          </div>

          {/* Screen Pins on Map */}
          <div className="relative w-full h-full min-h-[460px]">
            {filteredScreens.map((screen) => {
              const posX = screen.coordinates?.mapX || 50;
              const posY = screen.coordinates?.mapY || 50;
              const isSelected = selectedScreen?.id === screen.id;
              const isOnline = screen.status === 'online';

              return (
                <div
                  key={screen.id}
                  style={{ left: `${posX}%`, top: `${posY}%` }}
                  onClick={() => setSelectedScreenId(screen.id)}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
                >
                  {/* Outer Pulsing Aura if Online */}
                  {isOnline && (
                    <span className="absolute -inset-2 rounded-full bg-cyan-400/25 animate-ping" />
                  )}

                  {/* Pin Icon / Marker */}
                  <div
                    className={`relative px-2.5 py-1 rounded-xl flex items-center space-x-1.5 text-xs font-bold transition-all shadow-xl ${
                      isSelected
                        ? 'bg-cyan-500 text-white scale-110 ring-4 ring-cyan-500/30'
                        : isOnline
                        ? 'bg-slate-900 border border-cyan-500/60 text-cyan-300 hover:scale-105'
                        : 'bg-slate-900 border border-slate-700 text-slate-400 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
                      }`}
                    />
                    <span className="text-[11px] font-mono whitespace-nowrap">{screen.code}</span>
                  </div>

                  {/* Hover Tooltip Preview */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-30 pointer-events-none">
                    <div className="px-3 py-2 rounded-xl bg-slate-950/95 border border-slate-700 shadow-2xl text-[11px] whitespace-nowrap text-left space-y-0.5">
                      <div className="font-bold text-white">{screen.name}</div>
                      <div className="text-slate-400 text-[10px]">{screen.location}</div>
                      <div className="text-cyan-400 text-[10px] font-mono">
                        {screen.resolution.width}x{screen.resolution.height} • {screen.deviceModel}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Map Legend */}
          <div className="relative z-10 flex items-center justify-between text-xs pt-3 border-t border-slate-800/80 bg-slate-950/50 -mx-6 -mb-6 px-6 py-2.5">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1.5 text-slate-300 text-[11px]">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span>Trực tuyến ({screens.filter(s => s.status === 'online').length})</span>
              </div>
              <div className="flex items-center space-x-1.5 text-slate-300 text-[11px]">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>Ngoại tuyến ({screens.filter(s => s.status === 'offline').length})</span>
              </div>
            </div>
            <div className="text-[11px] text-slate-400">
              Nhấp vào một điểm ghim trên bản đồ để xem chi tiết
            </div>
          </div>
        </div>

        {/* Right: Selected Screen Details & Quick Controls (4 cols) */}
        <div className="lg:col-span-4 p-5 bg-slate-950/70 space-y-4 flex flex-col justify-between">
          {selectedScreen ? (
            <div className="space-y-4">
              {/* Header Info */}
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                    {selectedScreen.group}
                  </span>
                  <div className="flex items-center space-x-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        selectedScreen.status === 'online' ? 'bg-emerald-400' : 'bg-rose-500'
                      }`}
                    />
                    <span
                      className={`text-xs font-bold capitalize ${
                        selectedScreen.status === 'online' ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {selectedScreen.status === 'online' ? 'Trực Tuyến' : 'Ngoại Tuyến'}
                    </span>
                  </div>
                </div>

                <h3 className="text-base font-extrabold text-white mt-1.5 tracking-tight">
                  {selectedScreen.name}
                </h3>
                <p className="text-slate-400 text-xs mt-0.5 flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>{selectedScreen.location}</span>
                </p>
              </div>

              {/* Remote Live Screenshot Box */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-black group aspect-video">
                <img
                  src={selectedScreen.screenshotUrl}
                  alt={selectedScreen.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-mono text-cyan-300 border border-cyan-500/30 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                  <span>Ảnh chụp từ xa (Live Screenshot)</span>
                </div>
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-mono text-slate-300">
                  {selectedScreen.lastPing}
                </div>
              </div>

              {/* Technical Specifications */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-medium">Mã Ghép Nối</span>
                  <span className="font-bold text-white font-mono">{selectedScreen.code}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-medium">Độ Phân Giải</span>
                  <span className="font-bold text-white font-mono">
                    {selectedScreen.resolution.width} x {selectedScreen.resolution.height}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-medium">Card Điều Khiển</span>
                  <span className="font-semibold text-slate-200 truncate block text-[11px]">
                    {selectedScreen.deviceModel}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-medium">Bố Cục Đang Phát</span>
                  <span className="font-semibold text-cyan-300 truncate block text-[11px]">
                    {activeLayout?.name || 'Mặc định'}
                  </span>
                </div>
              </div>

              {/* Chi nhánh & Khu vực */}
              {selectedScreen.branch && (
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                  <span className="text-[10px] text-slate-400 block font-medium">Đơn vị quản lý:</span>
                  <span className="font-semibold text-slate-200">{selectedScreen.branch}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              Chọn một màn hình trên bản đồ để xem thông số
            </div>
          )}

          {/* Action Buttons */}
          {selectedScreen && (
            <div className="space-y-2 pt-3 border-t border-slate-800/80">
              <button
                onClick={() => onSelectScreenForRemote(selectedScreen)}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/20 flex items-center justify-center space-x-2 transition-all active:scale-95"
              >
                <Sliders className="w-4 h-4" />
                <span>Mở Bảng Điều Khiển Từ Xa</span>
              </button>

              <button
                onClick={() => onOpenPlayerSimulator(selectedScreen.id)}
                className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center justify-center space-x-2 transition-all active:scale-95"
              >
                <MonitorPlay className="w-4 h-4 text-cyan-400" />
                <span>Xem Trực Tiếp Trình Phát (Player)</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
