import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Cpu, 
  Radio, 
  Server, 
  ShieldCheck, 
  HelpCircle, 
  Download, 
  HardDrive, 
  Tv, 
  Smartphone, 
  CheckCircle2,
  Copy
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [mqttBroker, setMqttBroker] = useState('mqtt://broker.emqx.io:1883');
  const [wsServer, setWsServer] = useState('wss://api.ledsignage.vn/gateway');
  const [cdnEndpoint, setCdnEndpoint] = useState('https://storage.ledsignage.vn/media');
  const [autoRebootTime, setAutoRebootTime] = useState('03:30');
  const [copied, setCopied] = useState(false);

  const copyConfig = () => {
    navigator.clipboard.writeText(JSON.stringify({ mqttBroker, wsServer, cdnEndpoint, autoRebootTime }, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2.5">
          <SettingsIcon className="w-6 h-6 text-cyan-400" />
          <span>Cấu Hình Hệ Thống & Kết Nối Phần Cứng LED</span>
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          Thiết lập cổng kết nối Realtime Gateway, bộ điều khiển phần cứng NovaStar/Colorlight và tài liệu tích hợp
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Connection Gateway Settings (6 cols) */}
        <div className="lg:col-span-6 space-y-5">
          <div className="rounded-2xl glass-panel bg-slate-900/70 border border-slate-800 p-5 space-y-4">
            <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
              <Server className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Cấu Hình Cổng Kết Nối Máy Chủ (Gateway & IoT)</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">
                  MQTT Broker Endpoint (Giao thức truyền nhận lệnh tức thì)
                </label>
                <input
                  type="text"
                  value={mqttBroker}
                  onChange={(e) => setMqttBroker(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">
                  WebSocket Realtime URL (Nhận nhịp tim Heartbeat & Live Screenshot)
                </label>
                <input
                  type="text"
                  value={wsServer}
                  onChange={(e) => setWsServer(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">
                  Media Storage CDN (Lưu trữ Video H.264/H.265 & Poster 4K)
                </label>
                <input
                  type="text"
                  value={cdnEndpoint}
                  onChange={(e) => setCdnEndpoint(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">
                  Hẹn Giờ Tự Động Khởi Động Lại Màn Hình (Reboot hàng ngày tránh rò bộ nhớ)
                </label>
                <input
                  type="time"
                  value={autoRebootTime}
                  onChange={(e) => setAutoRebootTime(e.target.value)}
                  className="w-40 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end">
              <button
                onClick={copyConfig}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition-all"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Đã Sao Chép Cấu Hình' : 'Sao Chép Cấu Hình JSON'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Hardware Integration Guide (6 cols) */}
        <div className="lg:col-span-6 space-y-5">
          <div className="rounded-2xl glass-panel bg-slate-900/70 border border-slate-800 p-5 space-y-4">
            <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Hướng Dẫn Kết Nối Phần Cứng Màn Hình LED</h3>
            </div>

            <div className="space-y-3.5 text-xs text-slate-300">
              {/* Option 1 */}
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center space-x-1.5">
                    <Radio className="w-3.5 h-3.5 text-cyan-400" />
                    <span>1. Card Phát LED Độc Lập NovaStar Taurus (TB30/TB40/TB60/TU20)</span>
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300">
                    Phổ Biến Nhất
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Cài file APK Player lên hệ điều hành Android có sẵn của Taurus box qua phần mềm NovaLCT hoặc thẻ nhớ USB. Khi khởi động, app sẽ hiển thị mã Pairing Code (VD: LED-8821) để gán vào Web CMS.
                </p>
              </div>

              {/* Option 2 */}
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center space-x-1.5">
                    <Tv className="w-3.5 h-3.5 text-emerald-400" />
                    <span>2. Android TV Box / Smart TV / Kiosk Chân Đứng</span>
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300">
                    Kiosk & TV
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Cài đặt ứng dụng APK Player trực tiếp lên Android TV (TCL, Sony, Xiaomi, Arirang, Alo360). Cấp quyền khởi động cùng hệ thống (Auto-boot on power) và quyền Device Administrator để tự động tắt mở màn hình theo lịch.
                </p>
              </div>

              {/* Option 3 */}
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center space-x-1.5">
                    <HardDrive className="w-3.5 h-3.5 text-purple-400" />
                    <span>3. Máy Tính Windows Mini PC (Màn Hình Hội Trường / Màn Hình Ghép)</span>
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300">
                    Độ Phân Giải Khủng
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Dành cho các màn hình LED kích thước lớn hoặc độ phân giải vượt 4K: Cắm HDMI/DisplayPort từ Mini PC vào Card phát NovaStar MSD300/MCTRL, chạy ứng dụng Windows Player (Electron / C#) để phát trơn tru.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
