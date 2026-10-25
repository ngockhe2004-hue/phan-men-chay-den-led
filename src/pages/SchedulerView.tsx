import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  Plus,
  Trash2,
  Clock,
  Tv,
  Layers,
  CheckCircle,
  AlertCircle,
  X,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  Play,
  CheckCircle2,
  Monitor,
  CheckSquare,
  Square
} from 'lucide-react';
import { Schedule, Screen, LayoutTemplate } from '../types';
import { storageService } from '../services/storage';

export const SchedulerView: React.FC = () => {
  const [schedules, setSchedules] = useState<Schedule[]>(storageService.getSchedules());
  const [screens, setScreens] = useState<Screen[]>(storageService.getScreens());
  const [layouts, setLayouts] = useState<LayoutTemplate[]>(storageService.getLayouts());
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [actionNotice, setActionNotice] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [layoutId, setLayoutId] = useState(layouts[0]?.id || '');
  const [selectedScreens, setSelectedScreens] = useState<string[]>([]);
  const [repeatType, setRepeatType] = useState<'always' | 'daily' | 'weekly' | 'date_range'>('daily');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('22:00');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('2026-12-31');
  const [priority, setPriority] = useState<'normal' | 'high' | 'emergency'>('normal');

  useEffect(() => {
    const update = () => {
      setSchedules(storageService.getSchedules());
      setScreens(storageService.getScreens());
      setLayouts(storageService.getLayouts());
    };
    return storageService.subscribe(update);
  }, []);

  const handleToggleActive = (schedule: Schedule) => {
    const updated = { ...schedule, isActive: !schedule.isActive };
    storageService.updateSchedule(updated);
  };

  const handleApplyScheduleNow = (schedule: Schedule) => {
    const layout = layouts.find(l => l.id === schedule.layoutId);
    schedule.screenIds.forEach(screenId => {
      storageService.sendRemoteCommand(screenId, { type: 'apply_layout', value: schedule.layoutId });
    });
    setActionNotice(`Đã áp dụng tức thì bố cục "${layout?.name || schedule.layoutId}" cho ${schedule.screenIds.length} màn hình!`);
    setTimeout(() => setActionNotice(''), 3500);
  };

  const handleDelete = (id: string, schedName: string) => {
    if (confirm(`Bạn có chắc muốn xóa lịch phát "${schedName}"?`)) {
      storageService.deleteSchedule(id);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newSched: Schedule = {
      id: 'sched-' + Date.now(),
      name: name.trim(),
      layoutId: layoutId || layouts[0]?.id || 'layout-1',
      screenIds: selectedScreens.length > 0 ? selectedScreens : screens.map(s => s.id),
      priority,
      repeatType,
      startDate,
      endDate,
      startTime,
      endTime,
      daysOfWeek: [1, 2, 3, 4, 5, 6, 0],
      isActive: true
    };

    storageService.addSchedule(newSched);
    setIsCreateOpen(false);
    setName('');
  };

  const handleToggleScreen = (screenId: string) => {
    setSelectedScreens(prev =>
      prev.includes(screenId) ? prev.filter(id => id !== screenId) : [...prev, screenId]
    );
  };

  const handleToggleAllScreens = () => {
    if (selectedScreens.length === screens.length) {
      setSelectedScreens([]);
    } else {
      setSelectedScreens(screens.map(s => s.id));
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2.5">
            <CalendarDays className="w-6 h-6 text-cyan-400" />
            <span>Lập Lịch Phát Sóng Thông Minh (Broadcast Scheduler)</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Thiết lập thời gian biểu tự động theo khung giờ trong ngày, theo thứ hoặc theo chiến dịch sự kiện
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedScreens(screens.map(s => s.id));
            setIsCreateOpen(true);
          }}
          className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/25 transition-all flex items-center space-x-2 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>+ Tạo Lịch Phát Sóng Mới</span>
        </button>
      </div>

      {actionNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center space-x-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Schedules List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {schedules.map((schedule) => {
          const layout = layouts.find(l => l.id === schedule.layoutId);
          return (
            <div
              key={schedule.id}
              className={`rounded-2xl glass-panel p-5 border transition-all flex flex-col justify-between space-y-4 shadow-lg ${
                schedule.isActive
                  ? 'bg-slate-900/80 border-slate-700/90'
                  : 'bg-slate-950/40 border-slate-850 opacity-60'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                        schedule.priority === 'emergency'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : schedule.priority === 'high'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                      }`}
                    >
                      {schedule.priority === 'emergency' ? 'Khẩn Cấp' : schedule.priority === 'high' ? 'Ưu Tiên Cao' : 'Bình Thường'}
                    </span>
                  </div>

                  <button
                    onClick={() => handleToggleActive(schedule)}
                    className="flex items-center space-x-1 text-xs font-semibold"
                  >
                    {schedule.isActive ? (
                      <ToggleRight className="w-6 h-6 text-emerald-400" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-slate-500" />
                    )}
                  </button>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white line-clamp-2">
                    {schedule.name}
                  </h3>
                </div>

                {/* Details */}
                <div className="space-y-2 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs">
                  {/* Ngày áp dụng */}
                  {(schedule.startDate || schedule.endDate) && (
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="flex items-center space-x-1.5 text-slate-400">
                        <CalendarDays className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Ngày Áp Dụng:</span>
                      </span>
                      <span className="font-mono font-bold text-white">
                        {schedule.startDate
                          ? new Date(schedule.startDate + 'T00:00:00').toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
                          : '---'}
                        {schedule.endDate && schedule.endDate !== schedule.startDate ? (
                          <> → {new Date(schedule.endDate + 'T00:00:00').toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</>
                        ) : null}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center space-x-1.5 text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Khung Giờ:</span>
                    </span>
                    <span className="font-mono font-bold text-white">
                      {schedule.startTime} - {schedule.endTime}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center space-x-1.5 text-slate-400">
                      <Layers className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Bố Cục:</span>
                    </span>
                    <span className="font-semibold text-cyan-300 truncate max-w-[140px]">
                      {layout ? layout.name : 'Mặc định'}
                    </span>
                  </div>

                  <div className="flex flex-col space-y-1">
                    <span className="flex items-center space-x-1.5 text-slate-400">
                      <Monitor className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Thiết bị ({schedule.screenIds.length}):</span>
                    </span>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {schedule.screenIds.slice(0, 3).map(sid => {
                        const sc = screens.find(s => s.id === sid);
                        return sc ? (
                          <span key={sid} className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-cyan-300 border border-slate-700 truncate max-w-[100px]">
                            {sc.code}
                          </span>
                        ) : null;
                      })}
                      {schedule.screenIds.length > 3 && (
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 border border-slate-700">
                          +{schedule.screenIds.length - 3} nữa
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                <span className={`text-[11px] font-medium ${schedule.isActive ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {schedule.isActive ? '● Đang tự động phát' : '○ Tạm dừng'}
                </span>

                <div className="flex items-center space-x-1.5">
                  <button
                    type="button"
                    onClick={() => handleApplyScheduleNow(schedule)}
                    className="px-2.5 py-1 rounded-lg bg-cyan-600/80 hover:bg-cyan-500 text-white text-[11px] font-bold transition-all shadow-sm flex items-center space-x-1"
                    title="Áp dụng ngay bố cục của lịch này cho tất cả màn hình được gán"
                  >
                    <Play className="w-2.5 h-2.5 fill-current" />
                    <span>Áp dụng ngay</span>
                  </button>

                  <button
                    onClick={() => handleDelete(schedule.id, schedule.name)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                    title="Xóa lịch phát sóng"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-2xl glass-panel-glow bg-slate-900 border border-slate-700 shadow-2xl p-6 relative">
            <button
              onClick={() => setIsCreateOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <CalendarDays className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Tạo Lịch Phát Sóng Mới</h3>
                <p className="text-xs text-slate-400">Lên lịch phát theo khung giờ cho màn hình LED</p>
              </div>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tên Chiến Dịch / Lịch Phát <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="VD: Lịch Chiếu Khuyến Mãi Buổi Sáng (08:00 - 12:00)"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Bố Cục Hiển Thị (Layout Template)
                </label>
                <select
                  value={layoutId}
                  onChange={(e) => setLayoutId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                >
                  {layouts.map(l => (
                    <option key={l.id} value={l.id}>
                      {l.name} ({l.width}x{l.height})
                    </option>
                  ))}
                </select>
              </div>

              {/* Ngày bắt đầu & kết thúc */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    📅 Ngày Bắt Đầu
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    📅 Ngày Kết Thúc
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Giờ bắt đầu & kết thúc */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    🕐 Giờ Bắt Đầu
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    🕐 Giờ Kết Thúc
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Chọn thiết bị áp dụng lịch */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                    <Monitor className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Thiết Bị Áp Dụng Lịch <span className="text-cyan-400">*</span></span>
                  </label>
                  <button
                    type="button"
                    onClick={handleToggleAllScreens}
                    className="flex items-center space-x-1 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 transition-all"
                  >
                    {selectedScreens.length === screens.length ? (
                      <><CheckSquare className="w-3.5 h-3.5" /><span>Bỏ chọn tất cả</span></>
                    ) : (
                      <><Square className="w-3.5 h-3.5" /><span>Chọn tất cả</span></>
                    )}
                  </button>
                </div>

                <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1 rounded-xl bg-slate-950 border border-slate-700 p-2">
                  {screens.map(sc => {
                    const isChecked = selectedScreens.includes(sc.id);
                    return (
                      <div
                        key={sc.id}
                        onClick={() => handleToggleScreen(sc.id)}
                        className={`flex items-center space-x-2.5 p-2 rounded-lg cursor-pointer transition-all border ${
                          isChecked
                            ? 'bg-cyan-500/15 border-cyan-500/40 text-white'
                            : 'bg-slate-900 border-transparent text-slate-400 hover:border-slate-700 hover:text-white'
                        }`}
                      >
                        {/* Checkbox custom */}
                        <div className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 transition-all ${
                          isChecked ? 'bg-cyan-500 border-cyan-400' : 'border-slate-600 bg-slate-800'
                        }`}>
                          {isChecked && <CheckCircle2 className="w-3 h-3 text-white stroke-[3]" />}
                        </div>

                        {/* Status dot */}
                        <span className={`w-2 h-2 rounded-full shrink-0 ${
                          sc.status === 'online' && sc.powerState === 'on'
                            ? 'bg-emerald-400'
                            : sc.powerState === 'off'
                            ? 'bg-rose-500'
                            : 'bg-amber-400'
                        }`} />

                        {/* Screen info */}
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold truncate">{sc.name}</p>
                          <p className="text-[10px] text-slate-500 truncate">{sc.code} • {sc.location}</p>
                        </div>

                        {/* Resolution badge */}
                        <span className="text-[9px] font-mono text-slate-500 shrink-0">
                          {sc.resolution.width}×{sc.resolution.height}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {selectedScreens.length === 0 && (
                  <p className="text-[11px] text-rose-400 mt-1 flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>Vui lòng chọn ít nhất 1 thiết bị</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Cấp Độ Ưu Tiên
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                >
                  <option value="normal">Bình thường (Phát tuần tự)</option>
                  <option value="high">Ưu tiên cao (Ghi đè lịch thông thường)</option>
                  <option value="emergency">Khẩn cấp (Chiếm toàn quyền màn hình)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={selectedScreens.length === 0}
                  className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-md shadow-cyan-600/20 transition-all"
                >
                  Lưu & Áp Dụng Lịch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
