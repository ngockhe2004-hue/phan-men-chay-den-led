import React, { useState } from 'react';
import { 
  Tv, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  Globe, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Cpu, 
  Radio, 
  Layers, 
  UserCheck, 
  Zap,
  MonitorPlay
} from 'lucide-react';
import { storageService } from '../services/storage';
import { UserRole, UserAccount } from '../types';

interface LoginViewProps {
  onLoginSuccess: (user: UserAccount) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [language, setLanguage] = useState<'vi' | 'en'>('vi');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const users = storageService.getUsers();

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    setTimeout(() => {
      if (!password) {
        setIsLoading(false);
        setErrorMessage(language === 'vi' ? 'Vui lòng nhập mật khẩu!' : 'Please enter password!');
        return;
      }

      const user = storageService.login(email, password);
      setIsLoading(false);
      if (user) {
        onLoginSuccess(user);
      } else {
        setErrorMessage(
          language === 'vi'
            ? 'Tài khoản hoặc mật khẩu không chính xác! (Thử: admin / admin123)'
            : 'Invalid credentials! (Try: admin / admin123)'
        );
      }
    }, 400);
  };

  const handleQuickLogin = (targetUser: UserAccount) => {
    setEmail(targetUser.email);
    setPassword('admin123');
    setErrorMessage('');
    setIsLoading(true);
    setTimeout(() => {
      const user = storageService.login(targetUser.email, 'admin123', targetUser.role);
      setIsLoading(false);
      if (user) {
        onLoginSuccess(user);
      }
    }, 300);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden select-none">
      {/* Background Decorative Ambient Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-sky-900/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Header Bar */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 ring-1 ring-cyan-400/40">
            <Tv className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-base tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-cyan-400">
                LED Signage CMS Pro
              </span>
              <span className="px-2 py-0.5 text-[9px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 rounded-full tracking-wider uppercase">
                Enterprise
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {language === 'vi' ? 'Hệ thống Quản trị Màn hình LED & Digital Signage' : 'Centralized LED Screen & Digital Signage Platform'}
            </p>
          </div>
        </div>

        {/* Language Selector (Slide 4 Alo360) */}
        <div className="flex items-center space-x-2 bg-slate-900/80 border border-slate-800 rounded-xl p-1 text-xs">
          <button
            type="button"
            onClick={() => setLanguage('vi')}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg transition-all ${
              language === 'vi'
                ? 'bg-cyan-600 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🇻🇳</span>
            <span>Tiếng Việt</span>
          </button>
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg transition-all ${
              language === 'en'
                ? 'bg-cyan-600 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🇬🇧</span>
            <span>English</span>
          </button>
        </div>
      </header>

      {/* Main Login Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Hero & System Capabilities (7 cols) */}
          <div className="lg:col-span-7 space-y-6 hidden lg:block pr-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
              <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>{language === 'vi' ? 'Chuẩn Điều Khiển Card NovaStar & Colorlight 2026' : 'NovaStar Taurus & Colorlight 2026 Ready'}</span>
            </div>

            <h1 className="text-3xl xl:text-4xl font-black text-white tracking-tight leading-snug">
              {language === 'vi' ? (
                <>
                  Quản lý & Trình chiếu <br />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400">
                    Mạng Lưới Màn Hình LED
                  </span>{' '}
                  Tập Trung Toàn Quốc
                </>
              ) : (
                <>
                  Next-Gen Centralized <br />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400">
                    LED Digital Signage
                  </span>{' '}
                  Cloud Platform
                </>
              )}
            </h1>

            <p className="text-slate-400 text-sm leading-relaxed max-w-lg">
              {language === 'vi'
                ? 'Phần mềm tương thích hoàn toàn chuẩn Alo360/Aloloader, hỗ trợ quản lý đa chi nhánh, phân quyền đa cấp, chia vùng bố cục trực quan và phát sóng khẩn cấp tức thì.'
                : 'Enterprise-grade platform for LED video walls, kiosks and smart screens with multi-zone layouts, real-time remote telemetry and audit-ready proof-of-play.'}
            </p>

            {/* Feature Bullets */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                <div className="flex items-center space-x-2 text-white font-bold text-xs">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <span>{language === 'vi' ? 'Bản Đồ Số & Điều Khiển' : 'GIS Map & Telemetry'}</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {language === 'vi' ? 'Định vị GPS, giám sát nhiệt độ và chụp màn hình trực tiếp từ xa' : 'Live screenshots, receiving card temp and remote control'}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                <div className="flex items-center space-x-2 text-white font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>{language === 'vi' ? 'Phân Quyền RBAC Đa Cấp' : 'Role-Based Access (RBAC)'}</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {language === 'vi' ? 'Ma trận phân quyền chi tiết, sao chép nhóm quyền và nhật ký thao tác' : 'Granular permission matrix, group inheritance and audit logs'}
                </p>
              </div>
            </div>

            {/* Quick Demo One-Click Login Buttons */}
            <div className="pt-2">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                {language === 'vi' ? 'Đăng Nhập Nhanh Trải Nghiệm (Chọn Vai Trò):' : 'One-Click Demo Roles:'}
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {users.slice(0, 4).map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleQuickLogin(u)}
                    className="flex items-center space-x-2.5 p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-left transition-all group"
                  >
                    <img
                      src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80'}
                      alt={u.name}
                      className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-700 group-hover:ring-cyan-400"
                    />
                    <div className="overflow-hidden">
                      <div className="font-semibold text-slate-200 group-hover:text-cyan-300 truncate text-[11px]">
                        {u.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono truncate">
                        {u.role === 'SUPER_ADMIN' ? 'Super Admin' : u.role === 'BRANCH_ADMIN' ? 'Quản Lý Chi Nhánh' : u.role === 'CONTENT_MANAGER' ? 'Biên Tập Nội Dung' : 'Kỹ Thuật Viên'}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Login Form Card (5 cols) */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl glass-panel bg-slate-900/80 border border-slate-800 p-7 shadow-2xl backdrop-blur-xl relative">
              {/* Header inside Card */}
              <div className="mb-6">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {language === 'vi' ? 'Đăng Nhập Hệ Thống' : 'Account Sign In'}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  {language === 'vi' 
                    ? 'Nhập tài khoản và mật khẩu được cấp để truy cập cổng CMS' 
                    : 'Enter your assigned credentials to access LED CMS Pro'}
                </p>
              </div>

              {/* Error notification */}
              {errorMessage && (
                <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleLogin} className="space-y-4 text-xs">
                {/* Email / Username */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    {language === 'vi' ? 'Tài Khoản / Email' : 'Email Address'}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin hoặc email của bạn"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-slate-300 font-semibold">
                      {language === 'vi' ? 'Mật Khẩu' : 'Password'}
                    </label>
                    <span className="text-[11px] text-cyan-400 hover:underline cursor-pointer">
                      {language === 'vi' ? 'Quên mật khẩu?' : 'Forgot password?'}
                    </span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center space-x-2 cursor-pointer text-slate-400 hover:text-slate-200">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-cyan-600 focus:ring-0 focus:ring-offset-0"
                    />
                    <span>{language === 'vi' ? 'Ghi nhớ đăng nhập' : 'Remember me'}</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Pass: admin123
                  </span>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-sky-600 via-cyan-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/30 flex items-center justify-center space-x-2 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {isLoading ? (
                    <span>{language === 'vi' ? 'Đang xác thực...' : 'Verifying...'}</span>
                  ) : (
                    <>
                      <span>{language === 'vi' ? 'Đăng Nhập Quản Trị' : 'Sign In to Dashboard'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Security Badge Footer inside Card */}
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Mã hóa SSL 256-bit</span>
                </span>
                <span className="font-mono">Phiên bản v2.5 Enterprise</span>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Page Footer */}
      <footer className="relative z-10 px-6 py-3 border-t border-slate-900 bg-slate-950/80 text-center text-xs text-slate-400">
        <span>© 2026 LED Signage CMS Pro. Hệ thống điều khiển & trình chiếu màn hình LED tập trung (Chuẩn Alo360 & Aloloader).</span>
      </footer>
    </div>
  );
};
