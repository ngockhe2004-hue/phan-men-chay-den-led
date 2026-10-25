import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users2,
  Cpu,
  Plus,
  Search,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  BadgeCheck,
  Layers,
  Zap,
  Wifi,
  Clock,
  FileText,
  DollarSign,
  Calendar,
  X,
  Save,
  Monitor,
  Thermometer,
  Globe
} from 'lucide-react';
import { storageService } from '../services/storage';
import {
  Branch,
  Advertiser,
  HardwareProfile,
  AdvertiserContract,
  AdvertiserStatus,
  ContractStatus,
  LEDType,
  ControllerBrand
} from '../types';

type CRMTab = 'branches' | 'advertisers' | 'hardware';

// ─── Utility helpers ──────────────────────────────────────────────
const formatVND = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);

const REGION_LABELS: Record<Branch['region'], string> = {
  north: 'Miền Bắc',
  central: 'Miền Trung',
  south: 'Miền Nam',
  southwest: 'Tây Nam Bộ',
};
const REGION_COLORS: Record<Branch['region'], string> = {
  north: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  central: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
  south: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
  southwest: 'text-purple-400 bg-purple-400/10 border-purple-400/30',
};

const ADV_STATUS: Record<AdvertiserStatus, { label: string; cls: string; icon: React.ReactNode }> = {
  active: { label: 'Đang hợp tác', cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  inactive: { label: 'Ngừng hợp tác', cls: 'text-slate-400 bg-slate-500/10 border-slate-500/30', icon: <XCircle className="w-3.5 h-3.5" /> },
  pending: { label: 'Đang đàm phán', cls: 'text-amber-400 bg-amber-500/10 border-amber-500/30', icon: <AlertCircle className="w-3.5 h-3.5" /> },
};

const CONTRACT_STATUS: Record<ContractStatus, { label: string; cls: string }> = {
  active: { label: 'Đang hiệu lực', cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  draft: { label: 'Dự thảo', cls: 'text-sky-400 bg-sky-500/10 border-sky-500/30' },
  expired: { label: 'Đã hết hạn', cls: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
  cancelled: { label: 'Đã huỷ', cls: 'text-slate-400 bg-slate-500/10 border-slate-500/30' },
};

const LED_TYPE_LABELS: Record<LEDType, { label: string; cls: string }> = {
  indoor: { label: 'Trong nhà (Indoor)', cls: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
  outdoor: { label: 'Ngoài trời (Outdoor)', cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  'semi-outdoor': { label: 'Bán ngoài trời', cls: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
};

const CONTROLLER_BRAND_COLORS: Record<ControllerBrand, string> = {
  NovaStar: 'text-red-400',
  Colorlight: 'text-orange-400',
  Huidu: 'text-yellow-400',
  Linsn: 'text-blue-400',
  'Android TV': 'text-green-400',
  'Windows PC': 'text-sky-400',
  Aloloader: 'text-cyan-400',
};

// ─── Branch Modal ────────────────────────────────────────────────
interface BranchModalProps {
  branch?: Branch | null;
  onClose: () => void;
  onSave: (b: Branch) => void;
}
const BranchModal: React.FC<BranchModalProps> = ({ branch, onClose, onSave }) => {
  const isEdit = !!branch;
  const [form, setForm] = useState<Partial<Branch>>(branch || {
    region: 'south', isActive: true
  });
  const set = (k: keyof Branch, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toLocaleDateString('vi-VN');
    onSave({
      id: branch?.id || 'branch-' + Date.now(),
      code: form.code || '',
      name: form.name || '',
      region: form.region as Branch['region'],
      city: form.city || '',
      address: form.address || '',
      manager: form.manager || '',
      phone: form.phone || '',
      email: form.email,
      screenCount: form.screenCount || 0,
      isActive: form.isActive !== false,
      createdAt: branch?.createdAt || now,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h2 className="font-bold text-white text-base flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-cyan-400" />
            <span>{isEdit ? 'Chỉnh Sửa Chi Nhánh' : 'Thêm Chi Nhánh Mới'}</span>
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors"><X className="w-4 h-4 text-slate-400" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Mã Chi Nhánh *</label>
              <input required value={form.code || ''} onChange={e => set('code', e.target.value)} placeholder="HAN-HQ" className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500" />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Khu Vực *</label>
              <select value={form.region || 'south'} onChange={e => set('region', e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500">
                {Object.entries(REGION_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">Tên Chi Nhánh *</label>
            <input required value={form.name || ''} onChange={e => set('name', e.target.value)} placeholder="Chi nhánh Miền Nam (TP.HCM)" className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Tỉnh/Thành Phố *</label>
              <input required value={form.city || ''} onChange={e => set('city', e.target.value)} placeholder="TP. Hồ Chí Minh" className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500" />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Trưởng Chi Nhánh *</label>
              <input required value={form.manager || ''} onChange={e => set('manager', e.target.value)} placeholder="Nguyễn Văn A" className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500" />
            </div>
          </div>
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">Địa Chỉ Văn Phòng</label>
            <input value={form.address || ''} onChange={e => set('address', e.target.value)} placeholder="Số nhà, Đường, Phường/Xã, Quận/Huyện, Tỉnh/TP" className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Số Điện Thoại *</label>
              <input required value={form.phone || ''} onChange={e => set('phone', e.target.value)} placeholder="028 3822 9090" className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500" />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Email</label>
              <input type="email" value={form.email || ''} onChange={e => set('email', e.target.value)} placeholder="hcm@ledsignage.vn" className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500" />
            </div>
          </div>
          <div className="flex items-center space-x-2 pt-1">
            <input type="checkbox" checked={form.isActive !== false} onChange={e => set('isActive', e.target.checked)} className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-cyan-600" />
            <span className="text-slate-300">Chi nhánh đang hoạt động</span>
          </div>
          <div className="flex space-x-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors">Huỷ</button>
            <button type="submit" className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 text-white font-bold flex items-center justify-center space-x-2 hover:opacity-90 transition-opacity">
              <Save className="w-3.5 h-3.5" /><span>{isEdit ? 'Lưu Thay Đổi' : 'Thêm Chi Nhánh'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Advertiser Modal ─────────────────────────────────────────────
interface AdvModalProps {
  adv?: Advertiser | null;
  onClose: () => void;
  onSave: (a: Advertiser) => void;
}
const AdvModal: React.FC<AdvModalProps> = ({ adv, onClose, onSave }) => {
  const isEdit = !!adv;
  const [form, setForm] = useState<Partial<Advertiser>>(adv || { status: 'active', contracts: [] });
  const set = (k: keyof Advertiser, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toLocaleDateString('vi-VN');
    onSave({
      id: adv?.id || 'adv-' + Date.now(),
      code: form.code || 'ADV-' + Date.now().toString().slice(-4),
      name: form.name || '',
      shortName: form.shortName,
      taxCode: form.taxCode,
      contactName: form.contactName || '',
      contactPhone: form.contactPhone || '',
      contactEmail: form.contactEmail,
      industry: form.industry,
      logoUrl: form.logoUrl,
      status: (form.status as AdvertiserStatus) || 'active',
      contracts: adv?.contracts || [],
      note: form.note,
      createdAt: adv?.createdAt || now,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h2 className="font-bold text-white text-base flex items-center space-x-2">
            <Users2 className="w-4 h-4 text-amber-400" />
            <span>{isEdit ? 'Chỉnh Sửa Khách Hàng' : 'Thêm Khách Hàng Quảng Cáo'}</span>
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors"><X className="w-4 h-4 text-slate-400" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Mã Khách Hàng</label>
              <input value={form.code || ''} onChange={e => set('code', e.target.value)} placeholder="ADV-VINA" className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500" />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Thương Hiệu (Ngắn)</label>
              <input value={form.shortName || ''} onChange={e => set('shortName', e.target.value)} placeholder="Vinamilk" className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500" />
            </div>
          </div>
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">Tên Công Ty / Nhãn Hàng *</label>
            <input required value={form.name || ''} onChange={e => set('name', e.target.value)} placeholder="Công ty Cổ phần Sữa Việt Nam" className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Ngành Nghề</label>
              <input value={form.industry || ''} onChange={e => set('industry', e.target.value)} placeholder="Thực phẩm & Đồ uống" className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500" />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Mã Số Thuế</label>
              <input value={form.taxCode || ''} onChange={e => set('taxCode', e.target.value)} placeholder="0300894117" className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500" />
            </div>
          </div>
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">Người Liên Hệ *</label>
            <input required value={form.contactName || ''} onChange={e => set('contactName', e.target.value)} placeholder="Nguyễn Thị Hương" className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Số Điện Thoại *</label>
              <input required value={form.contactPhone || ''} onChange={e => set('contactPhone', e.target.value)} placeholder="028 3930 5800" className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500" />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Email Liên Hệ</label>
              <input type="email" value={form.contactEmail || ''} onChange={e => set('contactEmail', e.target.value)} placeholder="marketing@company.vn" className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500" />
            </div>
          </div>
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">Trạng Thái Hợp Tác</label>
            <select value={form.status || 'active'} onChange={e => set('status', e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500">
              <option value="active">Đang hợp tác</option>
              <option value="pending">Đang đàm phán</option>
              <option value="inactive">Ngừng hợp tác</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">Ghi Chú</label>
            <textarea value={form.note || ''} onChange={e => set('note', e.target.value)} rows={2} placeholder="Thông tin thêm về khách hàng..." className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500 resize-none" />
          </div>
          <div className="flex space-x-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors">Huỷ</button>
            <button type="submit" className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold flex items-center justify-center space-x-2 hover:opacity-90 transition-opacity">
              <Save className="w-3.5 h-3.5" /><span>{isEdit ? 'Lưu Thay Đổi' : 'Thêm Khách Hàng'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Hardware Modal ────────────────────────────────────────────────
interface HwModalProps {
  profile?: HardwareProfile | null;
  onClose: () => void;
  onSave: (p: HardwareProfile) => void;
}
const HwModal: React.FC<HwModalProps> = ({ profile, onClose, onSave }) => {
  const isEdit = !!profile;
  const [form, setForm] = useState<Partial<HardwareProfile>>(profile || {
    ledType: 'indoor', controllerBrand: 'NovaStar'
  });
  const set = (k: keyof HardwareProfile, v: any) => setForm(f => ({ ...f, [k]: v }));
  const brands: ControllerBrand[] = ['NovaStar', 'Colorlight', 'Huidu', 'Linsn', 'Android TV', 'Windows PC', 'Aloloader'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toLocaleDateString('vi-VN');
    onSave({
      id: profile?.id || 'hw-' + Date.now(),
      code: form.code || '',
      name: form.name || '',
      pixelPitch: form.pixelPitch || '',
      ledType: (form.ledType as LEDType) || 'indoor',
      controllerBrand: (form.controllerBrand as ControllerBrand) || 'NovaStar',
      controllerModel: form.controllerModel || '',
      physicalWidth: Number(form.physicalWidth) || 0,
      physicalHeight: Number(form.physicalHeight) || 0,
      defaultResolution: form.defaultResolution || '1920x1080',
      maxBrightness: Number(form.maxBrightness) || 0,
      ipRating: form.ipRating,
      weight: form.weight ? Number(form.weight) : undefined,
      powerConsumption: form.powerConsumption ? Number(form.powerConsumption) : undefined,
      note: form.note,
      createdAt: profile?.createdAt || now,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h2 className="font-bold text-white text-base flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-violet-400" />
            <span>{isEdit ? 'Chỉnh Sửa Loại Thiết Bị' : 'Thêm Loại Thiết Bị LED'}</span>
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors"><X className="w-4 h-4 text-slate-400" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Mã Thiết Bị *</label>
              <input required value={form.code || ''} onChange={e => set('code', e.target.value)} placeholder="LED-P25-INDOOR" className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500" />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Pixel Pitch *</label>
              <input required value={form.pixelPitch || ''} onChange={e => set('pixelPitch', e.target.value)} placeholder="P2.5" className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500" />
            </div>
          </div>
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">Tên Loại Thiết Bị *</label>
            <input required value={form.name || ''} onChange={e => set('name', e.target.value)} placeholder="LED P2.5 Indoor Cabinet — Phòng họp & Sảnh" className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Loại LED *</label>
              <select value={form.ledType || 'indoor'} onChange={e => set('ledType', e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500">
                <option value="indoor">Trong nhà (Indoor)</option>
                <option value="outdoor">Ngoài trời (Outdoor)</option>
                <option value="semi-outdoor">Bán ngoài trời</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Hãng Bộ Điều Khiển *</label>
              <select value={form.controllerBrand || 'NovaStar'} onChange={e => set('controllerBrand', e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500">
                {brands.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">Model Bộ Điều Khiển *</label>
            <input required value={form.controllerModel || ''} onChange={e => set('controllerModel', e.target.value)} placeholder="NovaStar Taurus TB60" className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Rộng Module (mm)</label>
              <input type="number" value={form.physicalWidth || ''} onChange={e => set('physicalWidth', e.target.value)} placeholder="500" className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500" />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Cao Module (mm)</label>
              <input type="number" value={form.physicalHeight || ''} onChange={e => set('physicalHeight', e.target.value)} placeholder="500" className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500" />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Độ Phân Giải</label>
              <input value={form.defaultResolution || ''} onChange={e => set('defaultResolution', e.target.value)} placeholder="1920x1080" className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Độ Sáng (nits)</label>
              <input type="number" value={form.maxBrightness || ''} onChange={e => set('maxBrightness', e.target.value)} placeholder="800" className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500" />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Chuẩn Chống Nước</label>
              <input value={form.ipRating || ''} onChange={e => set('ipRating', e.target.value)} placeholder="IP65" className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500" />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Công Suất (W/m²)</label>
              <input type="number" value={form.powerConsumption || ''} onChange={e => set('powerConsumption', e.target.value)} placeholder="400" className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500" />
            </div>
          </div>
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">Ghi Chú / Mô Tả</label>
            <textarea value={form.note || ''} onChange={e => set('note', e.target.value)} rows={2} placeholder="Ứng dụng, tầm nhìn tối ưu, ghi chú vận hành..." className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500 resize-none" />
          </div>
          <div className="flex space-x-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors">Huỷ</button>
            <button type="submit" className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold flex items-center justify-center space-x-2 hover:opacity-90 transition-opacity">
              <Save className="w-3.5 h-3.5" /><span>{isEdit ? 'Lưu Thay Đổi' : 'Thêm Thiết Bị'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Main CRM View ────────────────────────────────────────────────
export const CRMView: React.FC = () => {
  const [tab, setTab] = useState<CRMTab>('advertisers');
  const [branches, setBranches] = useState<Branch[]>(storageService.getBranches());
  const [advertisers, setAdvertisers] = useState<Advertiser[]>(storageService.getAdvertisers());
  const [hardware, setHardware] = useState<HardwareProfile[]>(storageService.getHardwareProfiles());
  const [search, setSearch] = useState('');
  const [expandedAdvId, setExpandedAdvId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState('');

  // Modal states
  const [branchModal, setBranchModal] = useState<{ open: boolean; editing?: Branch | null }>({ open: false });
  const [advModal, setAdvModal] = useState<{ open: boolean; editing?: Advertiser | null }>({ open: false });
  const [hwModal, setHwModal] = useState<{ open: boolean; editing?: HardwareProfile | null }>({ open: false });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  useEffect(() => {
    return storageService.subscribe(() => {
      setBranches(storageService.getBranches());
      setAdvertisers(storageService.getAdvertisers());
      setHardware(storageService.getHardwareProfiles());
    });
  }, []);

  // ─ Branches ─
  const filteredBranches = branches.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.city.toLowerCase().includes(search.toLowerCase()) ||
    b.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleSaveBranch = (b: Branch) => {
    if (branchModal.editing) {
      storageService.updateBranch(b);
      showToast(`✓ Đã cập nhật chi nhánh "${b.name}"`);
    } else {
      storageService.addBranch(b);
      showToast(`✓ Đã thêm chi nhánh "${b.name}"`);
    }
    setBranchModal({ open: false });
  };

  const handleDeleteBranch = (id: string, name: string) => {
    if (window.confirm(`Xác nhận xoá chi nhánh "${name}"?`)) {
      storageService.deleteBranch(id);
      showToast(`✓ Đã xoá chi nhánh "${name}"`);
    }
  };

  // ─ Advertisers ─
  const filteredAdv = advertisers.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    (a.shortName || '').toLowerCase().includes(search.toLowerCase()) ||
    a.contactName.toLowerCase().includes(search.toLowerCase()) ||
    a.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleSaveAdv = (a: Advertiser) => {
    if (advModal.editing) {
      storageService.updateAdvertiser(a);
      showToast(`✓ Đã cập nhật khách hàng "${a.name}"`);
    } else {
      storageService.addAdvertiser(a);
      showToast(`✓ Đã thêm khách hàng "${a.name}"`);
    }
    setAdvModal({ open: false });
  };

  const handleDeleteAdv = (id: string, name: string) => {
    if (window.confirm(`Xác nhận xoá khách hàng "${name}"?`)) {
      storageService.deleteAdvertiser(id);
      showToast(`✓ Đã xoá "${name}"`);
    }
  };

  // ─ Hardware ─
  const filteredHw = hardware.filter(h =>
    h.name.toLowerCase().includes(search.toLowerCase()) ||
    h.code.toLowerCase().includes(search.toLowerCase()) ||
    h.controllerBrand.toLowerCase().includes(search.toLowerCase()) ||
    h.pixelPitch.toLowerCase().includes(search.toLowerCase())
  );

  const handleSaveHw = (p: HardwareProfile) => {
    if (hwModal.editing) {
      storageService.updateHardwareProfile(p);
      showToast(`✓ Đã cập nhật "${p.name}"`);
    } else {
      storageService.addHardwareProfile(p);
      showToast(`✓ Đã thêm thiết bị "${p.name}"`);
    }
    setHwModal({ open: false });
  };

  const handleDeleteHw = (id: string, name: string) => {
    if (window.confirm(`Xác nhận xoá loại thiết bị "${name}"?`)) {
      storageService.deleteHardwareProfile(id);
      showToast(`✓ Đã xoá "${name}"`);
    }
  };

  const tabs = [
    {
      id: 'advertisers' as CRMTab,
      label: 'Khách Hàng Quảng Cáo',
      icon: <Users2 className="w-4 h-4" />,
      count: advertisers.length,
      color: 'from-amber-600 to-orange-600',
      badge: 'CRM',
      badgeCls: 'text-amber-400 bg-amber-500/10 border-amber-500/30'
    },
    {
      id: 'branches' as CRMTab,
      label: 'Chi Nhánh & Khu Vực',
      icon: <Building2 className="w-4 h-4" />,
      count: branches.length,
      color: 'from-cyan-600 to-sky-600',
      badge: `${branches.filter(b => b.isActive).length} Hoạt động`,
      badgeCls: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30'
    },
    {
      id: 'hardware' as CRMTab,
      label: 'Danh Mục Thiết Bị LED',
      icon: <Cpu className="w-4 h-4" />,
      count: hardware.length,
      color: 'from-violet-600 to-purple-600',
      badge: 'Phần cứng',
      badgeCls: 'text-violet-400 bg-violet-500/10 border-violet-500/30'
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl bg-emerald-600 text-white text-sm font-semibold shadow-2xl shadow-emerald-600/30 animate-bounce">
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30">
              <Globe className="w-6 h-6 text-amber-400" />
            </div>
            <span>Quản Lý Tổ Chức & CRM</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Chi nhánh, khách hàng quảng cáo và danh mục phần cứng LED</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/25"><Users2 className="w-5 h-5 text-amber-400" /></div>
            <div>
              <div className="text-2xl font-black text-white">{advertisers.filter(a => a.status === 'active').length}</div>
              <div className="text-[11px] text-amber-300">Khách hàng đang hợp tác</div>
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-400 font-mono">
            Tổng giá trị HĐ: <span className="text-amber-300 font-bold">
              {formatVND(advertisers.flatMap(a => a.contracts.filter(c => c.status === 'active')).reduce((sum, c) => sum + c.value, 0))}
            </span>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/20">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-500/25"><Building2 className="w-5 h-5 text-cyan-400" /></div>
            <div>
              <div className="text-2xl font-black text-white">{branches.filter(b => b.isActive).length}</div>
              <div className="text-[11px] text-cyan-300">Chi nhánh hoạt động</div>
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-400 font-mono">
            Tổng màn hình: <span className="text-cyan-300 font-bold">{branches.reduce((s, b) => s + b.screenCount, 0)} thiết bị</span>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-violet-500/5 border border-violet-500/20">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-violet-500/15 border border-violet-500/25"><Cpu className="w-5 h-5 text-violet-400" /></div>
            <div>
              <div className="text-2xl font-black text-white">{hardware.length}</div>
              <div className="text-[11px] text-violet-300">Loại phần cứng LED</div>
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-400 font-mono">
            Trong nhà: <span className="text-violet-300 font-bold">{hardware.filter(h => h.ledType === 'indoor').length}</span>
            {' '}&nbsp; Ngoài trời: <span className="text-emerald-300 font-bold">{hardware.filter(h => h.ledType === 'outdoor').length}</span>
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex items-center space-x-1 bg-slate-900/60 border border-slate-800 p-1.5 rounded-2xl">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); setSearch(''); }}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              tab === t.id
                ? `bg-gradient-to-r ${t.color} text-white shadow-lg`
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            {t.icon}
            <span>{t.label}</span>
            <span className={`px-2 py-0.5 text-[10px] rounded-full border font-bold ${tab === t.id ? 'bg-white/20 text-white border-white/20' : t.badgeCls}`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={tab === 'branches' ? 'Tìm chi nhánh, thành phố...' : tab === 'advertisers' ? 'Tìm tên công ty, người liên hệ...' : 'Tìm loại thiết bị, hãng...'}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
        <button
          onClick={() => {
            if (tab === 'branches') setBranchModal({ open: true });
            else if (tab === 'advertisers') setAdvModal({ open: true });
            else setHwModal({ open: true });
          }}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg transition-all hover:scale-105 bg-gradient-to-r ${
            tab === 'branches' ? 'from-cyan-600 to-sky-600 shadow-cyan-600/20' :
            tab === 'advertisers' ? 'from-amber-600 to-orange-600 shadow-amber-600/20' :
            'from-violet-600 to-purple-600 shadow-violet-600/20'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>{tab === 'branches' ? 'Thêm Chi Nhánh' : tab === 'advertisers' ? 'Thêm Khách Hàng' : 'Thêm Thiết Bị'}</span>
        </button>
      </div>

      {/* ─ Tab: Advertisers ─ */}
      {tab === 'advertisers' && (
        <div className="space-y-3">
          {filteredAdv.length === 0 && (
            <div className="text-center py-16 text-slate-500">
              <Users2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Chưa có khách hàng nào.</p>
            </div>
          )}
          {filteredAdv.map(adv => {
            const isExpanded = expandedAdvId === adv.id;
            const totalValue = adv.contracts.reduce((s, c) => s + c.value, 0);
            const activeContracts = adv.contracts.filter(c => c.status === 'active').length;
            const statusMeta = ADV_STATUS[adv.status];

            return (
              <div key={adv.id} className="rounded-2xl bg-slate-900/70 border border-slate-800 overflow-hidden hover:border-slate-700 transition-colors">
                <div className="p-4 flex items-center gap-4">
                  {/* Logo */}
                  <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                    {adv.logoUrl ? (
                      <img src={adv.logoUrl} alt={adv.shortName} className="w-full h-full object-cover" />
                    ) : (
                      <Users2 className="w-6 h-6 text-slate-500" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-0.5">
                      <span className="font-bold text-white text-sm truncate">{adv.shortName || adv.name}</span>
                      <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusMeta.cls}`}>
                        {statusMeta.icon}<span>{statusMeta.label}</span>
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">{adv.name}</p>
                    <div className="flex items-center space-x-3 mt-1 text-[11px] text-slate-400">
                      {adv.industry && <span className="flex items-center space-x-1"><Layers className="w-3 h-3" /><span>{adv.industry}</span></span>}
                      <span className="flex items-center space-x-1"><Phone className="w-3 h-3" /><span>{adv.contactPhone}</span></span>
                      <span className="flex items-center space-x-1"><FileText className="w-3 h-3" /><span>{adv.contracts.length} HĐ</span></span>
                    </div>
                  </div>

                  {/* Value */}
                  <div className="text-right shrink-0 hidden md:block">
                    <div className="text-sm font-bold text-amber-300">{formatVND(totalValue)}</div>
                    <div className="text-[11px] text-slate-400">{activeContracts} HĐ đang hiệu lực</div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-1.5 shrink-0">
                    <button
                      onClick={() => setExpandedAdvId(isExpanded ? null : adv.id)}
                      className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400"
                      title="Xem hợp đồng"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    <button onClick={() => setAdvModal({ open: true, editing: adv })} className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-cyan-400">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteAdv(adv.id, adv.name)} className="p-2 hover:bg-rose-500/10 rounded-lg transition-colors text-slate-400 hover:text-rose-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded: Contracts */}
                {isExpanded && (
                  <div className="border-t border-slate-800 bg-slate-950/40 p-4 space-y-2">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Danh Sách Hợp Đồng Quảng Cáo ({adv.contracts.length})
                    </div>
                    {adv.contracts.length === 0 && (
                      <p className="text-xs text-slate-500 italic">Chưa có hợp đồng nào được ghi nhận.</p>
                    )}
                    {adv.contracts.map((c: AdvertiserContract) => {
                      const cs = CONTRACT_STATUS[c.status];
                      return (
                        <div key={c.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                          <div className="space-y-0.5">
                            <div className="flex items-center space-x-2">
                              <span className="font-mono font-bold text-white">{c.contractCode}</span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${cs.cls}`}>{cs.label}</span>
                            </div>
                            <div className="text-slate-400 flex items-center space-x-3">
                              <span className="flex items-center space-x-1"><Calendar className="w-3 h-3" /><span>{c.startDate} → {c.endDate}</span></span>
                              <span className="flex items-center space-x-1"><Monitor className="w-3 h-3" /><span>{c.screenIds.length} màn hình</span></span>
                            </div>
                            {c.note && <p className="text-slate-500 italic">{c.note}</p>}
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-amber-300">{formatVND(c.value)}</div>
                          </div>
                        </div>
                      );
                    })}
                    <div className="flex items-center justify-between pt-1 text-xs font-bold">
                      <span className="text-slate-400">Liên hệ: {adv.contactName} • {adv.contactPhone}</span>
                      {adv.contactEmail && <span className="text-slate-400">{adv.contactEmail}</span>}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ─ Tab: Branches ─ */}
      {tab === 'branches' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredBranches.length === 0 && (
            <div className="col-span-2 text-center py-16 text-slate-500">
              <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Chưa có chi nhánh nào.</p>
            </div>
          )}
          {filteredBranches.map(b => (
            <div key={b.id} className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/30 transition-all group space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2.5 rounded-xl border ${REGION_COLORS[b.region]}`}>
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white text-sm">{b.name}</span>
                      {b.isActive
                        ? <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">Đang HĐ</span>
                        : <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-500/10 text-slate-400 border border-slate-500/30">Tạm dừng</span>
                      }
                    </div>
                    <div className="flex items-center space-x-2 mt-0.5">
                      <span className="font-mono text-[10px] text-slate-400">{b.code}</span>
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] border ${REGION_COLORS[b.region]}`}>{REGION_LABELS[b.region]}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setBranchModal({ open: true, editing: b })} className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-cyan-400"><Edit className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDeleteBranch(b.id, b.name)} className="p-1.5 hover:bg-rose-500/10 rounded-lg transition-colors text-slate-400 hover:text-rose-400"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>

              <div className="space-y-1.5 text-[11px] text-slate-400">
                <div className="flex items-center space-x-2"><MapPin className="w-3.5 h-3.5 shrink-0" /><span className="truncate">{b.address}</span></div>
                <div className="flex items-center space-x-2"><Phone className="w-3.5 h-3.5" /><span>{b.phone}</span></div>
                {b.email && <div className="flex items-center space-x-2"><Mail className="w-3.5 h-3.5" /><span>{b.email}</span></div>}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px]">
                <span className="text-slate-400">Trưởng CN: <span className="text-white font-semibold">{b.manager}</span></span>
                <span className="flex items-center space-x-1 text-cyan-300 font-bold">
                  <Monitor className="w-3.5 h-3.5" />
                  <span>{b.screenCount} màn hình</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─ Tab: Hardware Profiles ─ */}
      {tab === 'hardware' && (
        <div className="space-y-3">
          {filteredHw.length === 0 && (
            <div className="text-center py-16 text-slate-500">
              <Cpu className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Chưa có loại thiết bị nào.</p>
            </div>
          )}
          {filteredHw.map(hw => {
            const ltMeta = LED_TYPE_LABELS[hw.ledType];
            return (
              <div key={hw.id} className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-violet-500/30 transition-all group">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 shrink-0">
                    <Cpu className="w-6 h-6 text-violet-400" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1 flex-wrap gap-y-1">
                      <span className="font-bold text-white text-sm">{hw.name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${ltMeta.cls}`}>{ltMeta.label}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 border border-slate-700 text-slate-300 font-mono">{hw.pixelPitch}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mb-3">{hw.code}</div>

                    {/* Specs Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
                      <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                        <div className="text-slate-500 mb-0.5">Bộ điều khiển</div>
                        <div className={`font-bold ${CONTROLLER_BRAND_COLORS[hw.controllerBrand]}`}>{hw.controllerBrand}</div>
                        <div className="text-slate-300 text-[10px] truncate">{hw.controllerModel}</div>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                        <div className="text-slate-500 mb-0.5">Kích thước module</div>
                        <div className="font-bold text-white">{hw.physicalWidth}×{hw.physicalHeight} mm</div>
                        <div className="text-slate-300 text-[10px]">Phân giải: {hw.defaultResolution}</div>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                        <div className="text-slate-500 mb-0.5">Độ sáng tối đa</div>
                        <div className="font-bold text-amber-300">{hw.maxBrightness > 0 ? `${hw.maxBrightness.toLocaleString()} nits` : 'LCD Panel'}</div>
                        {hw.ipRating && <div className="text-[10px] text-emerald-300">Chống nước: {hw.ipRating}</div>}
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                        <div className="text-slate-500 mb-0.5">Công suất</div>
                        <div className="font-bold text-white">{hw.powerConsumption ? `${hw.powerConsumption} W/m²` : '—'}</div>
                        {hw.weight && <div className="text-[10px] text-slate-300">{hw.weight} kg/module</div>}
                      </div>
                    </div>

                    {hw.note && (
                      <p className="mt-2 text-[11px] text-slate-400 italic border-l-2 border-violet-500/40 pl-2">{hw.note}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col space-y-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setHwModal({ open: true, editing: hw })} className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-violet-400">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteHw(hw.id, hw.name)} className="p-2 hover:bg-rose-500/10 rounded-lg transition-colors text-slate-400 hover:text-rose-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {branchModal.open && (
        <BranchModal
          branch={branchModal.editing}
          onClose={() => setBranchModal({ open: false })}
          onSave={handleSaveBranch}
        />
      )}
      {advModal.open && (
        <AdvModal
          adv={advModal.editing}
          onClose={() => setAdvModal({ open: false })}
          onSave={handleSaveAdv}
        />
      )}
      {hwModal.open && (
        <HwModal
          profile={hwModal.editing}
          onClose={() => setHwModal({ open: false })}
          onSave={handleSaveHw}
        />
      )}
    </div>
  );
};
