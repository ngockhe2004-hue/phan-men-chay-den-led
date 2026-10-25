import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, ShieldAlert, Check, Flame, Radio } from 'lucide-react';
import { storageService, EmergencyState } from '../services/storage';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ isOpen, onClose }) => {
  const [emergency, setEmergency] = useState<EmergencyState>(storageService.getEmergencyState());
  const [message, setMessage] = useState(
    '⚠️ CẢNH BÁO KHẨN CẤP: YÊU CẦU TOÀN BỘ NHÂN VIÊN VÀ KHÁCH HÀNG DI CHUYỂN RA KHỎI TÒA NHÀ THEO LỐI THOÁT HIỂM GẦN NHẤT!'
  );
  const [selectedType, setSelectedType] = useState<'fire' | 'weather' | 'custom'>('fire');

  useEffect(() => {
    setEmergency(storageService.getEmergencyState());
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTrigger = () => {
    storageService.triggerEmergency(message);
    setEmergency(storageService.getEmergencyState());
    onClose();
  };

  const handleCancel = () => {
    storageService.cancelEmergency();
    setEmergency(storageService.getEmergencyState());
    onClose();
  };

  const handlePresetSelect = (type: 'fire' | 'weather' | 'custom') => {
    setSelectedType(type);
    if (type === 'fire') {
      setMessage('⚠️ BÁO ĐỘNG HỎA HOẠN: YÊU CẦU DI TẢN KHẨN CẤP! BÌNH TĨNH THEO ĐÈN CHỈ DẪN THOÁT HIỂM!');
    } else if (type === 'weather') {
      setMessage('🌧️ CẢNH BÁO BÃO & THỜI TIẾT CỰC ĐOAN: VUI LÒNG KHÔNG ĐI LẠI NGOÀI TRỜI, GIỮ AN TOÀN TRONG TÒA NHÀ!');
    } else {
      setMessage('★ THÔNG BÁO QUAN TRỌNG TỪ BAN QUẢN LÝ: ...');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-rose-500/50 shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-5">
          <div className="w-11 h-11 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 animate-pulse">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <span>Phát Sóng Khẩn Cấp (Emergency Override)</span>
            </h3>
            <p className="text-xs text-rose-300/80">
              Lập tức ghi đè toàn bộ lịch phát của tất cả màn hình LED trong mạng lưới
            </p>
          </div>
        </div>

        {emergency.isActive ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-rose-500/20 border border-rose-500 text-rose-200 text-sm">
              <div className="flex items-center space-x-2 font-bold mb-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Hệ Thống Đang Trong Trạng Thái Báo Động</span>
              </div>
              <p className="text-xs font-mono bg-black/40 p-2.5 rounded-lg border border-rose-500/30 text-rose-300">
                "{emergency.message}"
              </p>
              <div className="text-[11px] text-slate-400 mt-2">
                Kích hoạt lúc: {emergency.triggeredAt}
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={handleCancel}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold border border-slate-600 transition-all"
              >
                HỦY PHÁT KHẨN CẤP (Khôi Phục Lịch Phát Bình Thường)
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Chọn Mẫu Thông Báo Khẩn Nhanh
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handlePresetSelect('fire')}
                  className={`p-2.5 rounded-xl border text-xs font-medium text-left flex items-center space-x-2 transition-all ${
                    selectedType === 'fire'
                      ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <Flame className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>Hỏa Hoạn</span>
                </button>

                <button
                  type="button"
                  onClick={() => handlePresetSelect('weather')}
                  className={`p-2.5 rounded-xl border text-xs font-medium text-left flex items-center space-x-2 transition-all ${
                    selectedType === 'weather'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Thời Tiết Xấu</span>
                </button>

                <button
                  type="button"
                  onClick={() => handlePresetSelect('custom')}
                  className={`p-2.5 rounded-xl border text-xs font-medium text-left flex items-center space-x-2 transition-all ${
                    selectedType === 'custom'
                      ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <Radio className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Tùy Chỉnh</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Nội Dung Tin Khẩn Sẽ Hiển Thị Tràn Toàn Bộ Màn Hình
              </label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-rose-500 leading-relaxed font-mono"
              />
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] leading-relaxed">
              * Khi kích hoạt, tất cả các màn hình LED, Kiosk và TV đang online sẽ chuyển sang màn hình đỏ cảnh báo với âm thanh chú ý ngay lập tức.
            </div>

            <div className="pt-2 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleTrigger}
                className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all active:scale-95"
              >
                KÍCH HOẠT PHÁT KHẨN CẤP NGAY
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
