import React, { useState } from 'react';
import { X, QrCode, Tv, CheckCircle, Smartphone, AlertCircle } from 'lucide-react';
import { storageService } from '../services/storage';

interface PairScreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PairScreenModal: React.FC<PairScreenModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [group, setGroup] = useState('Sảnh Đón Tiếp');
  const [location, setLocation] = useState('');
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1080);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('Vui lòng nhập mã ghép nối hiển thị trên màn hình!');
      return;
    }

    try {
      storageService.pairScreen(code.trim().toUpperCase(), {
        name: name.trim() || `Màn Hình LED (${code.trim().toUpperCase()})`,
        group,
        location: location.trim() || 'Chưa định vị',
        orientation,
        resolution: { width: Number(width), height: Number(height) }
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Lỗi khi ghép nối màn hình');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg rounded-2xl glass-panel-glow bg-slate-900 border border-slate-700 shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Ghép Nối Màn Hình LED Mới</h3>
            <p className="text-xs text-slate-400">
              Nhập mã 6 chữ số đang hiển thị trên ứng dụng Player (Android TV Box / NovaStar / Mini PC)
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Mã Ghép Nối (Pairing Code) <span className="text-cyan-400">*</span>
            </label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                setError('');
              }}
              placeholder="VD: LED-8821 HOẶC 8829"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-white font-mono text-center tracking-widest text-lg font-bold placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              * Mở tab "Trình Phát Player (Demo)" để lấy mã ghép nối thử nghiệm tức thì.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Tên Màn Hình / Vị Trí
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: LED Sảnh Tòa Nhà"
                className="w-full px-3 py-2 rounded-lg bg-slate-950/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Nhóm Quản Lý
              </label>
              <select
                value={group}
                onChange={(e) => setGroup(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value="Sảnh Đón Tiếp">Sảnh Đón Tiếp</option>
                <option value="Quảng Cáo Ngoài Trời">Quảng Cáo Ngoài Trời</option>
                <option value="Hội Trường & Phòng Họp">Hội Trường & Phòng Họp</option>
                <option value="Kiosk Thông Tin">Kiosk Thông Tin</option>
                <option value="Tiện Ích Nội Bộ">Tiện Ích Nội Bộ</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Địa Chỉ / Chi Nhánh Cụ Thể
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="VD: Landmark 81, 720A Điện Biên Phủ, TP.HCM"
              className="w-full px-3 py-2 rounded-lg bg-slate-950/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Hướng Màn Hình
              </label>
              <select
                value={orientation}
                onChange={(e) => setOrientation(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value="landscape">Ngang (16:9)</option>
                <option value="portrait">Dọc (9:16)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Độ Rộng (Width px)
              </label>
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-slate-950/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Chiều Cao (Height px)
              </label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-slate-950/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-all"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-600/25 transition-all"
            >
              Xác Nhận Ghép Nối
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
