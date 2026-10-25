import React, { useState, useEffect } from 'react';
import { 
  Tv, 
  Wifi, 
  WifiOff, 
  Film, 
  Calendar, 
  Layers, 
  Activity, 
  ShieldAlert, 
  ArrowUpRight, 
  Clock, 
  HardDrive,
  Sliders,
  ChevronRight,
  ExternalLink,
  Users2,
  DollarSign
} from 'lucide-react';
import { storageService } from '../services/storage';
import { Screen, LayoutTemplate, ProofOfPlayLog, Advertiser } from '../types';

interface DashboardViewProps {
  onNavigate: (tab: any) => void;
  onSelectScreenForRemote: (screen: Screen) => void;
  onOpenPairModal: () => void;
  onOpenPlayerSimulator: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onSelectScreenForRemote,
  onOpenPairModal,
  onOpenPlayerSimulator
}) => {
  const [screens, setScreens] = useState<Screen[]>(storageService.getScreens());
  const [layouts, setLayouts] = useState<LayoutTemplate[]>(storageService.getLayouts());
  const [logs, setLogs] = useState<ProofOfPlayLog[]>(storageService.getLogs());

  useEffect(() => {
    const update = () => {
      setScreens(storageService.getScreens());
      setLayouts(storageService.getLayouts());
      setLogs(storageService.getLogs());
    };
    return storageService.subscribe(update);
  }, []);

  const onlineScreens = screens.filter(s => s.status === 'online');
  const offlineScreens = screens.filter(s => s.status !== 'online');
  const mediaCount = storageService.getMedia().length;
  const scheduleCount = storageService.getSchedules().filter(s => s.isActive).length;
  const advertisers = storageService.getAdvertisers();
  const activeAdvCount = advertisers.filter(a => a.status === 'active').length;
  const totalContractValue = advertisers
    .flatMap(a => a.contracts.filter(c => c.status === 'active'))
    .reduce((sum, c) => sum + c.value, 0);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 border border-cyan-500/20 p-6 md:p-8 shadow-2xl">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Hệ Thống Trình Chiếu LED & Digital Signage Đang Hoạt Động</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Trung Tâm Điều Khiển Màn Hình LED Tập Trung
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Quản lý phân phối nội dung đa vùng, lập lịch tự động và giám sát từ xa cho màn hình LED hội trường, màn hình ngoài trời P3/P4, Kiosk chân đứng và Smart TV.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenPairModal}
              className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/30 transition-all active:scale-95 flex items-center space-x-2"
            >
              <Tv className="w-4 h-4" />
              <span>+ Ghép Nối Màn Hình</span>
            </button>

            <button
              onClick={onOpenPlayerSimulator}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-all flex items-center space-x-2"
            >
              <ExternalLink className="w-4 h-4 text-cyan-400" />
              <span>Chạy Thử Player (Simulator)</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Screens */}
        <div
          onClick={() => onNavigate('screens')}
          className="p-5 rounded-2xl glass-panel bg-slate-900/60 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900/90 transition-all flex items-center justify-between cursor-pointer group shadow-md hover:shadow-cyan-500/10"
          title="Bấm để xem danh sách và quản lý màn hình LED"
        >
          <div>
            <span className="text-xs font-medium text-slate-400 group-hover:text-cyan-300 transition-colors">Tổng Màn Hình LED</span>
            <div className="text-2xl font-black text-white mt-1">{screens.length}</div>
            <div className="flex items-center space-x-1.5 text-[11px] text-emerald-400 mt-2 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{onlineScreens.length} đang kết nối trực tuyến</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
            <Tv className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Layouts */}
        <div
          onClick={() => onNavigate('layouts')}
          className="p-5 rounded-2xl glass-panel bg-slate-900/60 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-900/90 transition-all flex items-center justify-between cursor-pointer group shadow-md hover:shadow-blue-500/10"
          title="Bấm để thiết kế và biên tập bố cục đa vùng"
        >
          <div>
            <span className="text-xs font-medium text-slate-400 group-hover:text-blue-300 transition-colors">Bố Cục Đa Vùng (Layouts)</span>
            <div className="text-2xl font-black text-white mt-1">{layouts.length}</div>
            <div className="text-[11px] text-slate-400 mt-2">
              Chia khung Video, Poster & Ticker
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Media */}
        <div
          onClick={() => onNavigate('media')}
          className="p-5 rounded-2xl glass-panel bg-slate-900/60 border border-slate-800 hover:border-violet-500/50 hover:bg-slate-900/90 transition-all flex items-center justify-between cursor-pointer group shadow-md hover:shadow-violet-500/10"
          title="Bấm để vào Thư Viện Media tải video/hình ảnh"
        >
          <div>
            <span className="text-xs font-medium text-slate-400 group-hover:text-violet-300 transition-colors">Tệp Tin Media Lưu Trữ</span>
            <div className="text-2xl font-black text-white mt-1">{mediaCount}</div>
            <div className="text-[11px] text-slate-400 mt-2">
              Video 4K, Ảnh, Chữ chạy, Widget
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 group-hover:scale-110 transition-transform">
            <Film className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Schedules */}
        <div
          onClick={() => onNavigate('schedules')}
          className="p-5 rounded-2xl glass-panel bg-slate-900/60 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-900/90 transition-all flex items-center justify-between cursor-pointer group shadow-md hover:shadow-amber-500/10"
          title="Bấm để lập lịch và phân bổ phát sóng"
        >
          <div>
            <span className="text-xs font-medium text-slate-400 group-hover:text-amber-300 transition-colors">Chiến Dịch Lập Lịch</span>
            <div className="text-2xl font-black text-white mt-1">{scheduleCount}</div>
            <div className="text-[11px] text-cyan-400 mt-2 font-medium">
              Đang phát sóng tự động theo giờ
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        {/* Card 5: CRM Advertisers */}
        <div
          onClick={() => onNavigate('crm')}
          className="p-5 rounded-2xl glass-panel bg-slate-900/60 border border-slate-800 hover:border-orange-500/50 hover:bg-slate-900/90 transition-all flex items-center justify-between cursor-pointer group shadow-md hover:shadow-orange-500/10"
          title="Bấm để quản lý khách hàng quảng cáo và hợp đồng"
        >
          <div>
            <span className="text-xs font-medium text-slate-400 group-hover:text-orange-300 transition-colors">Khách Hàng QC (CRM)</span>
            <div className="text-2xl font-black text-white mt-1">{activeAdvCount}</div>
            <div className="text-[11px] text-orange-400 mt-2 font-medium">
              {new Intl.NumberFormat('vi-VN', { notation: 'compact', maximumFractionDigits: 1 }).format(totalContractValue)}đ giá trị HĐ
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 group-hover:scale-110 transition-transform">
            <Users2 className="w-6 h-6" />
          </div>
        </div>
      </div>


      {/* Main Grid: Screen Statuses & Realtime Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Active Screen Grid (2 Cols on Large) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-bold text-white">Trạng Thái Màn Hình Trực Tiếp (Live Screens)</h2>
            </div>
            <button
              onClick={() => onNavigate('screens')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center space-x-1"
            >
              <span>Xem tất cả ({screens.length})</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {screens.slice(0, 4).map((screen) => {
              const layout = layouts.find(l => l.id === screen.currentLayoutId);
              return (
                <div
                  key={screen.id}
                  className="rounded-2xl glass-panel bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 transition-all p-4 space-y-3 group"
                >
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                    <img
                      src={screen.screenshotUrl}
                      alt={screen.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-[10px] font-mono text-cyan-300 border border-cyan-500/30">
                      {screen.code}
                    </div>
                    <div className="absolute top-2 right-2">
                      <span
                        className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          screen.status === 'online'
                            ? 'bg-emerald-500/90 text-white'
                            : 'bg-rose-500/90 text-white'
                        }`}
                      >
                        {screen.status === 'online' ? 'Online' : 'Offline'}
                      </span>
                    </div>
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] text-slate-300 px-2 py-1 rounded bg-black/60 backdrop-blur-sm">
                      <span className="truncate">{layout ? layout.name : 'Bố cục chuẩn'}</span>
                      <span className="font-mono">{screen.resolution.width}x{screen.resolution.height}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white truncate">{screen.name}</h3>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{screen.location}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                    <span className="text-[11px] text-slate-400">
                      Cập nhật: {screen.lastPing}
                    </span>
                    <button
                      onClick={() => onSelectScreenForRemote(screen)}
                      className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-cyan-600 hover:text-white text-cyan-400 font-semibold text-xs transition-all flex items-center space-x-1"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Điều Khiển</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Realtime Broadcast Activity (Proof of Play) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-bold text-white">Nhật Ký Phát Sóng</h2>
            </div>
            <button
              onClick={() => onNavigate('logs')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center space-x-1"
            >
              <span>Chi tiết</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="rounded-2xl glass-panel bg-slate-900/70 border border-slate-800 p-4 space-y-3">
            {logs.slice(0, 6).map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-slate-950/60 border border-slate-850 hover:border-slate-700 transition-all space-y-1.5"
              >
                <div className="flex items-start justify-between">
                  <span className="text-xs font-bold text-white line-clamp-1">
                    {log.mediaTitle}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0 ml-2">
                    {log.durationSeconds}s
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="truncate">{log.screenName}</span>
                  <span className="shrink-0 text-slate-400">{log.playedAt.split(' ')[1] || log.playedAt}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
