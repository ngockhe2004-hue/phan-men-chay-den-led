import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Search, 
  Filter, 
  Tv, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  BarChart3,
  Calendar
} from 'lucide-react';
import { ProofOfPlayLog, Screen } from '../types';
import { storageService } from '../services/storage';

export const LogsView: React.FC = () => {
  const [logs, setLogs] = useState<ProofOfPlayLog[]>(storageService.getLogs());
  const [screens, setScreens] = useState<Screen[]>(storageService.getScreens());
  const [selectedScreenId, setSelectedScreenId] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const update = () => {
      setLogs(storageService.getLogs());
      setScreens(storageService.getScreens());
    };
    return storageService.subscribe(update);
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchScreen = selectedScreenId === 'ALL' || log.screenId === selectedScreenId;
    const matchSearch = log.mediaTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.screenName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchScreen && matchSearch;
  });

  const totalPlays = filteredLogs.length;
  const totalDurationSeconds = filteredLogs.reduce((acc, l) => acc + l.durationSeconds, 0);
  const totalMinutes = (totalDurationSeconds / 60).toFixed(1);

  const handleExportCSV = () => {
    const headers = ['Mã Log', 'Màn Hình', 'Tên Media', 'Thời Điểm Phát', 'Thời Lượng (giây)', 'Trạng Thái'];
    const rows = filteredLogs.map(l => [
      l.id,
      `"${l.screenName}"`,
      `"${l.mediaTitle}"`,
      l.playedAt,
      l.durationSeconds,
      l.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Bao_Cao_Phat_Song_LED_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2.5">
            <FileText className="w-6 h-6 text-cyan-400" />
            <span>Báo Cáo Nghiệm Thu Phát Sóng (Proof of Play)</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Ghi nhận chính xác số lượt phát, thời lượng và lịch sử của từng clip quảng cáo để phục vụ nghiệm thu
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white text-xs font-bold transition-all flex items-center space-x-2 active:scale-95"
        >
          <Download className="w-4 h-4 text-cyan-400" />
          <span>Xuất Báo Cáo Excel (CSV)</span>
        </button>
      </div>

      {/* Summary KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl glass-panel bg-slate-900/60 border border-slate-800">
          <span className="text-xs font-medium text-slate-400">Tổng Số Lượt Phát Đã Ghi Nhận</span>
          <div className="text-2xl font-black text-white mt-1">{totalPlays} lượt</div>
          <span className="text-[11px] text-emerald-400 mt-1 block">Tỷ lệ hoàn thành 100%</span>
        </div>

        <div className="p-4 rounded-2xl glass-panel bg-slate-900/60 border border-slate-800">
          <span className="text-xs font-medium text-slate-400">Tổng Thời Lượng Phát Sóng</span>
          <div className="text-2xl font-black text-cyan-400 mt-1">{totalMinutes} phút</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Tương đương {totalDurationSeconds} giây</span>
        </div>

        <div className="p-4 rounded-2xl glass-panel bg-slate-900/60 border border-slate-800">
          <span className="text-xs font-medium text-slate-400">Số Màn Hình Đang Hoạt Động</span>
          <div className="text-2xl font-black text-white mt-1">{screens.filter(s => s.status === 'online').length} màn hình</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Đang kết nối liên tục</span>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-panel p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên clip, tên màn hình..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center space-x-2 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs w-full md:w-auto">
          <span className="text-slate-400 text-[11px] px-2">Lọc Màn Hình:</span>
          <select
            value={selectedScreenId}
            onChange={(e) => setSelectedScreenId(e.target.value)}
            className="bg-transparent text-white font-medium text-xs focus:outline-none cursor-pointer pr-2"
          >
            <option value="ALL" className="bg-slate-900">Tất cả màn hình</option>
            {screens.map(s => (
              <option key={s.id} value={s.id} className="bg-slate-900">
                {s.name} ({s.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Log Table */}
      <div className="rounded-2xl glass-panel bg-slate-900/70 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Thời Điểm Phát</th>
                <th className="py-3 px-4">Tên Media / Clip</th>
                <th className="py-3 px-4">Màn Hình LED</th>
                <th className="py-3 px-4">Thời Lượng</th>
                <th className="py-3 px-4 text-right">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono text-slate-300">
                    {log.playedAt}
                  </td>
                  <td className="py-3 px-4 font-bold text-white max-w-xs truncate">
                    {log.mediaTitle}
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    {log.screenName}
                  </td>
                  <td className="py-3 px-4 font-mono text-cyan-400 font-bold">
                    {log.durationSeconds}s
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Thành công</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
