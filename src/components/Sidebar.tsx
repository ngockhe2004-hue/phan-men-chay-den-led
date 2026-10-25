import React from 'react';
import { 
  LayoutDashboard, 
  Tv, 
  LayoutTemplate as LayoutIcon, 
  Film, 
  CalendarDays, 
  FileText, 
  MonitorPlay, 
  Settings, 
  Radio, 
  HelpCircle,
  Layers,
  Users,
  Globe
} from 'lucide-react';

export type NavTab = 
  | 'dashboard' 
  | 'screens' 
  | 'layouts' 
  | 'media' 
  | 'schedules' 
  | 'logs' 
  | 'player' 
  | 'iam'
  | 'crm'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const menuItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Bảng Tổng Quan',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'screens' as NavTab,
      label: 'Màn Hình & Thiết Bị',
      icon: Tv,
      badge: '5'
    },
    {
      id: 'layouts' as NavTab,
      label: 'Thiết Kế Bố Cục',
      icon: LayoutIcon,
      badge: '4'
    },
    {
      id: 'media' as NavTab,
      label: 'Thư Viện Media',
      icon: Film,
      badge: '6'
    },
    {
      id: 'schedules' as NavTab,
      label: 'Lập Lịch Phát Sóng',
      icon: CalendarDays,
      badge: '3'
    },
    {
      id: 'logs' as NavTab,
      label: 'Báo Cáo Phát Sóng',
      icon: FileText,
      badge: null
    },
    {
      id: 'player' as NavTab,
      label: 'Trình Phát Player (Demo)',
      icon: MonitorPlay,
      badge: 'Trực Tiếp',
      highlight: true
    },
    {
      id: 'iam' as NavTab,
      label: 'Tài Khoản & Phân Quyền',
      icon: Users,
      badge: 'RBAC'
    },
    {
      id: 'crm' as NavTab,
      label: 'Khách Hàng & Chi Nhánh',
      icon: Globe,
      badge: 'CRM'
    },
    {
      id: 'settings' as NavTab,
      label: 'Cấu Hình & Kết Nối LED',
      icon: Settings,
      badge: null
    }
  ];

  return (
    <aside className="w-64 bg-slate-900/60 border-r border-slate-800/80 flex flex-col justify-between p-4 shrink-0 min-h-[calc(100vh-61px)]">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Hệ Thống Quản Trị
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-gradient-to-r from-sky-600/90 to-cyan-600/90 text-white shadow-md shadow-cyan-600/25'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon
                  className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-white' : item.highlight ? 'text-cyan-400' : 'text-slate-400'
                  }`}
                />
                <span className={item.highlight && !isActive ? 'text-cyan-300 font-semibold' : ''}>
                  {item.label}
                </span>
              </div>

              {item.badge && (
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : item.highlight
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Hardware Controller Compatibility Footer */}
      <div className="mt-8 pt-4 border-t border-slate-800/80">
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/90">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300 mb-1">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Tương Thích Bộ Điều Khiển</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Hỗ trợ NovaStar Taurus (TB30/TB40/TB60), Huidu, Colorlight, Alo360/Aloloader Box, Android TV & Windows PC.
          </p>
        </div>
      </div>
    </aside>
  );
};
