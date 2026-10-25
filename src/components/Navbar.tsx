import React, { useState, useEffect } from 'react';
import { 
  Tv, 
  AlertTriangle, 
  Wifi, 
  Bell, 
  MonitorPlay, 
  PlusCircle, 
  ShieldAlert,
  Radio,
  Clock,
  Sparkles,
  Database,
  LogOut,
  KeyRound,
  User as UserIcon,
  ChevronDown
} from 'lucide-react';
import { storageService, EmergencyState } from '../services/storage';
import { api } from '../services/api';
import { UserAccount } from '../types';

interface NavbarProps {
  currentUser: UserAccount | null;
  onOpenPairModal: () => void;
  onOpenEmergencyModal: () => void;
  onOpenPlayerSimulator: () => void;
  onOpenChangePasswordModal: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  currentUser,
  onOpenPairModal, 
  onOpenEmergencyModal,
  onOpenPlayerSimulator,
  onOpenChangePasswordModal,
  onLogout
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [emergency, setEmergency] = useState<EmergencyState>(storageService.getEmergencyState());
  const [onlineCount, setOnlineCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [isBackendOnline, setIsBackendOnline] = useState<boolean | null>(null);

  useEffect(() => {
    const updateStats = () => {
      const screens = storageService.getScreens();
      setTotalCount(screens.length);
      setOnlineCount(screens.filter(s => s.status === 'online').length);
      setEmergency(storageService.getEmergencyState());
    };

    const checkBackend = async () => {
      const ok = await api.checkHealth();
      setIsBackendOnline(ok);
    };

    updateStats();
    checkBackend();
    const timer = setInterval(checkBackend, 15000);

    const unsub = storageService.subscribe(updateStats);
    return () => {
      unsub();
      clearInterval(timer);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Brand / Title */}
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/30">
            <Tv className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-cyan-400">
                LED Signage CMS Pro
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-full tracking-wider uppercase">
                Enterprise
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Quản Trị Mạng Lưới Màn Hình LED & Digital Signage Tập Trung
            </p>
          </div>
        </div>

        {/* Live Network Indicators */}
        <div className="hidden md:flex items-center space-x-6">
          <div className="flex items-center space-x-2.5 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs">
            <div className="flex items-center space-x-1.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="font-semibold text-emerald-400">Hệ Thống Trực Tuyến</span>
            </div>
            <span className="text-slate-600">|</span>
            <div className="text-slate-300">
              Màn hình hoạt động: <span className="font-bold text-white">{onlineCount}</span>/{totalCount}
            </div>
            <span className="text-slate-600">|</span>
            <div className="flex items-center space-x-1.5" title="Trạng thái kết nối Database PostgreSQL & MinIO S3">
              <Database className={`w-3.5 h-3.5 ${isBackendOnline ? 'text-emerald-400' : 'text-amber-400'}`} />
              <span className={`font-semibold ${isBackendOnline ? 'text-emerald-400' : 'text-amber-400'}`}>
                {isBackendOnline ? 'PostgreSQL: Online' : 'Bộ nhớ Cục bộ'}
              </span>
            </div>
          </div>

          {emergency.isActive && (
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-400 text-xs animate-pulse font-medium">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>Đang phát sóng KHẨN CẤP!</span>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex items-center space-x-3">
          {/* Open Player Simulator */}
          <button
            onClick={onOpenPlayerSimulator}
            className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-600/20 transition-all active:scale-95"
            title="Mở trình phát mô phỏng màn hình LED trên trình duyệt"
          >
            <MonitorPlay className="w-4 h-4" />
            <span className="hidden sm:inline">Mở Trình Phát (Player)</span>
          </button>

          {/* Quick Pair Screen */}
          <button
            onClick={onOpenPairModal}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white text-xs font-medium transition-all"
          >
            <PlusCircle className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Ghép Nối Màn Hình</span>
          </button>

          {/* Emergency Broadcast Toggle */}
          <button
            onClick={onOpenEmergencyModal}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
              emergency.isActive
                ? 'bg-rose-600 hover:bg-rose-500 border-rose-400 text-white shadow-lg shadow-rose-600/30 animate-bounce'
                : 'bg-rose-950/40 hover:bg-rose-900/60 border-rose-800/80 text-rose-300'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span className="hidden md:inline">
              {emergency.isActive ? 'Hủy Phát Khẩn' : 'Phát Khẩn Cấp'}
            </span>
          </button>

          {/* User Account Menu (Slide 4, 6 Alo360) */}
          {currentUser && (
            <div className="relative pl-2 border-l border-slate-800">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2.5 p-1 rounded-xl hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all text-left group"
              >
                <img
                  src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80'}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-xl object-cover ring-1 ring-cyan-500/40"
                />
                <div className="hidden lg:block text-xs">
                  <div className="font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-cyan-400 font-mono font-bold">
                    {currentUser.role}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-transform" />
              </button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 p-2 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl z-50 text-xs space-y-1 animate-fadeIn">
                    <div className="px-3 py-2 border-b border-slate-800">
                      <div className="font-bold text-white text-xs">{currentUser.name}</div>
                      <div className="text-[11px] text-slate-400 truncate">{currentUser.email}</div>
                      <div className="text-[10px] text-cyan-400 mt-1 font-mono">{currentUser.branch}</div>
                    </div>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onOpenChangePasswordModal();
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors font-medium"
                    >
                      <KeyRound className="w-4 h-4 text-cyan-400" />
                      <span>Đổi Mật Khẩu (Slide 6)</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors font-semibold"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Đăng Xuất Khỏi Hệ Thống</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
