import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  History, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Lock, 
  Unlock, 
  Check, 
  X, 
  Copy, 
  CheckCircle2, 
  AlertCircle, 
  KeyRound, 
  Layers, 
  Building2, 
  Shield, 
  SlidersHorizontal,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { storageService } from '../services/storage';
import { UserAccount, UserGroup, UserPermission, AuditLogEntry, UserRole } from '../types';
import { INITIAL_PERMISSIONS } from '../mockData';

export const IAMView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'users' | 'groups' | 'audit'>('users');
  const [users, setUsers] = useState<UserAccount[]>(storageService.getUsers());
  const [groups, setGroups] = useState<UserGroup[]>(storageService.getUserGroups());
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(storageService.getAuditLogs());

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [auditModuleFilter, setAuditModuleFilter] = useState('ALL');

  // Selected Group for Permission Matrix
  const [selectedGroupId, setSelectedGroupId] = useState<string>(groups[0]?.id || 'group-superadmin');

  // Modals state
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<UserGroup | null>(null);
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [copySourceGroupId, setCopySourceGroupId] = useState<string>('');

  // Notification Toast
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  useEffect(() => {
    const update = () => {
      setUsers(storageService.getUsers());
      setGroups(storageService.getUserGroups());
      setAuditLogs(storageService.getAuditLogs());
    };
    return storageService.subscribe(update);
  }, []);

  const selectedGroup = groups.find(g => g.id === selectedGroupId) || groups[0];

  // --- Handlers for Users ---
  const handleSaveUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const role = formData.get('role') as UserRole;
    const groupId = formData.get('groupId') as string;
    const branch = formData.get('branch') as string;

    const matchedGroup = groups.find(g => g.id === groupId);

    if (editingUser) {
      const updated: UserAccount = {
        ...editingUser,
        name,
        email,
        phone,
        role,
        groupId,
        groupName: matchedGroup?.name || editingUser.groupName,
        branch
      };
      storageService.updateUser(updated);
      showToast(`Đã cập nhật thông tin tài khoản "${name}"!`);
    } else {
      const newUser: UserAccount = {
        id: 'user-' + Date.now(),
        name,
        email,
        phone,
        role,
        groupId,
        groupName: matchedGroup?.name || 'Chưa gán nhóm',
        branch,
        isActive: true,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        createdAt: new Date().toLocaleDateString('vi-VN')
      };
      storageService.addUser(newUser);
      showToast(`Đã thêm mới tài khoản "${name}" thành công!`);
    }
    setIsUserModalOpen(false);
    setEditingUser(null);
  };

  const handleToggleUserActive = (user: UserAccount) => {
    const updated = { ...user, isActive: !user.isActive };
    storageService.updateUser(updated);
    showToast(`Đã ${updated.isActive ? 'mở khóa' : 'tạm khóa'} tài khoản "${user.name}"!`);
  };

  const handleDeleteUser = (id: string, name: string) => {
    if (confirm(`Bạn có chắc muốn xóa tài khoản "${name}" khỏi hệ thống?`)) {
      storageService.deleteUser(id);
      showToast(`Đã xóa tài khoản "${name}"!`);
    }
  };

  // --- Handlers for Groups & Permissions ---
  const handleSaveGroup = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const code = formData.get('code') as string;
    const name = formData.get('name') as string;
    const leader = formData.get('leader') as string;
    const note = formData.get('note') as string;

    if (editingGroup) {
      const updated: UserGroup = {
        ...editingGroup,
        code,
        name,
        leader,
        note
      };
      storageService.updateUserGroup(updated);
      showToast(`Đã cập nhật thông tin nhóm "${name}"!`);
    } else {
      const newGroup: UserGroup = {
        id: 'group-' + Date.now(),
        code,
        name,
        leader,
        note,
        memberCount: 0,
        permissions: ['screen_view', 'layout_view', 'media_view', 'schedule_view'],
        createdAt: new Date().toLocaleDateString('vi-VN')
      };
      storageService.addUserGroup(newGroup);
      setSelectedGroupId(newGroup.id);
      showToast(`Đã tạo nhóm tài khoản mới "${name}"!`);
    }
    setIsGroupModalOpen(false);
    setEditingGroup(null);
  };

  const handleDeleteGroup = (id: string, name: string) => {
    if (confirm(`Bạn có chắc muốn xóa nhóm tài khoản "${name}"?`)) {
      storageService.deleteUserGroup(id);
      const remaining = groups.filter(g => g.id !== id);
      if (remaining.length > 0) setSelectedGroupId(remaining[0].id);
      showToast(`Đã xóa nhóm tài khoản "${name}"!`);
    }
  };

  const handleTogglePermission = (permissionId: string) => {
    if (!selectedGroup) return;
    const currentPerms = selectedGroup.permissions || [];
    const hasPerm = currentPerms.includes(permissionId);
    const newPerms = hasPerm
      ? currentPerms.filter(p => p !== permissionId)
      : [...currentPerms, permissionId];

    const updated = { ...selectedGroup, permissions: newPerms };
    storageService.updateUserGroup(updated);
  };

  const handleSelectAllPermissions = () => {
    if (!selectedGroup) return;
    const allPermIds = INITIAL_PERMISSIONS.map(p => p.id);
    const updated = { ...selectedGroup, permissions: allPermIds };
    storageService.updateUserGroup(updated);
    showToast('Đã cấp toàn bộ quyền cho nhóm!');
  };

  const handleClearAllPermissions = () => {
    if (!selectedGroup) return;
    const updated = { ...selectedGroup, permissions: [] };
    storageService.updateUserGroup(updated);
    showToast('Đã thu hồi toàn bộ quyền của nhóm!');
  };

  const handleCopyPermissions = () => {
    if (!copySourceGroupId || !selectedGroup) return;
    storageService.copyPermissions(copySourceGroupId, selectedGroup.id);
    setIsCopyModalOpen(false);
    showToast(`Đã sao chép phân quyền sang nhóm "${selectedGroup.name}" thành công!`);
  };

  // Filtered lists
  const filteredUsers = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.branch && u.branch.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const filteredAuditLogs = auditLogs.filter(log => {
    const matchSearch = log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.ipAddress.toLowerCase().includes(searchQuery.toLowerCase());
    const matchModule = auditModuleFilter === 'ALL' || log.module === auditModuleFilter;
    return matchSearch && matchModule;
  });

  // Group permissions by category for visual matrix
  const categories: { key: UserPermission['category']; label: string }[] = [
    { key: 'screens', label: 'Quản Lý Màn Hình & Phần Cứng' },
    { key: 'layouts', label: 'Thiết Kế Bố Cục (Layout Builder)' },
    { key: 'media', label: 'Thư Viện Media & Tệp Tin' },
    { key: 'schedules', label: 'Lập Lịch Phát Sóng & Khẩn Cấp' },
    { key: 'reports', label: 'Báo Cáo Nghiệm Thu (Proof of Play)' },
    { key: 'system', label: 'Quản Trị Hệ Thống & Cài Đặt' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 px-4 py-3 rounded-2xl bg-cyan-600 text-white font-bold text-xs shadow-2xl shadow-cyan-600/40 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2.5">
            <Users className="w-6 h-6 text-cyan-400" />
            <span>Quản Trị Tài Khoản & Phân Quyền (IAM)</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Quản lý danh sách người dùng, nhóm tài khoản, ma trận phân quyền chi tiết và nhật ký truy cập (Chuẩn Alo360)
          </p>
        </div>

        {/* Sub-tab Switcher */}
        <div className="flex items-center space-x-1 p-1 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveSubTab('users')}
            className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center space-x-2 ${
              activeSubTab === 'users'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Danh Sách Tài Khoản ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('groups')}
            className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center space-x-2 ${
              activeSubTab === 'groups'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Nhóm & Ma Trận Phân Quyền</span>
          </button>

          <button
            onClick={() => setActiveSubTab('audit')}
            className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center space-x-2 ${
              activeSubTab === 'audit'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Lịch Sử Truy Cập (Audit)</span>
          </button>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* SUB-TAB 1: DANH SÁCH TÀI KHOẢN (USERS)                        */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeSubTab === 'users' && (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="glass-panel p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3 w-full md:w-auto">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm theo tên, email, chi nhánh..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value="ALL">Tất cả vai trò</option>
                <option value="SUPER_ADMIN">Super Admin</option>
                <option value="BRANCH_ADMIN">Quản lý chi nhánh</option>
                <option value="CONTENT_MANAGER">Biên tập nội dung</option>
                <option value="OPERATOR">Kỹ thuật viên</option>
                <option value="VIEWER">Khách xem</option>
              </select>
            </div>

            <button
              onClick={() => {
                setEditingUser(null);
                setIsUserModalOpen(true);
              }}
              className="w-full md:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/20 flex items-center justify-center space-x-2 transition-all active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>Thêm Tài Khoản Mới</span>
            </button>
          </div>

          {/* Users Table */}
          <div className="rounded-2xl glass-panel bg-slate-900/60 border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Thành Viên</th>
                    <th className="p-3.5">Vai Trò & Nhóm</th>
                    <th className="p-3.5">Chi Nhánh / Đơn Vị</th>
                    <th className="p-3.5">Số Điện Thoại</th>
                    <th className="p-3.5">Trạng Thái</th>
                    <th className="p-3.5">Đăng Nhập Gần Nhất</th>
                    <th className="p-3.5 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center space-x-3">
                          <img
                            src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                            alt={user.name}
                            className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-700"
                          />
                          <div>
                            <div className="font-bold text-white text-xs">{user.name}</div>
                            <div className="text-[11px] text-slate-400 font-mono">{user.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="space-y-1">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            user.role === 'SUPER_ADMIN'
                              ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                              : user.role === 'BRANCH_ADMIN'
                              ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                              : user.role === 'CONTENT_MANAGER'
                              ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                              : 'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}>
                            {user.role}
                          </span>
                          <div className="text-[11px] text-slate-400">{user.groupName}</div>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center space-x-1 text-slate-300 text-[11px]">
                          <Building2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span>{user.branch || 'Chưa phân bổ'}</span>
                        </div>
                      </td>

                      <td className="p-3.5 font-mono text-slate-300 text-[11px]">
                        {user.phone || '—'}
                      </td>

                      <td className="p-3.5">
                        <button
                          onClick={() => handleToggleUserActive(user)}
                          className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                            user.isActive
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25'
                              : 'bg-rose-500/15 text-rose-400 border border-rose-500/30 hover:bg-rose-500/25'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-emerald-400' : 'bg-rose-500'}`} />
                          <span>{user.isActive ? 'Đang Hoạt Động' : 'Đã Khóa'}</span>
                        </button>
                      </td>

                      <td className="p-3.5 text-slate-400 text-[11px]">
                        {user.lastLoginAt || 'Chưa đăng nhập'}
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => {
                              setEditingUser(user);
                              setIsUserModalOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-cyan-300 rounded-lg hover:bg-slate-800 transition-colors"
                            title="Chỉnh sửa thông tin"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id, user.name)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                            title="Xóa tài khoản"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* SUB-TAB 2: NHÓM TÀI KHOẢN & MA TRẬN PHÂN QUYỀN                 */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeSubTab === 'groups' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: User Groups List (Slide 8-11 Alo360) (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>Danh Sách Nhóm Tài Khoản</span>
              </h3>
              <button
                onClick={() => {
                  setEditingGroup(null);
                  setIsGroupModalOpen(true);
                }}
                className="px-2.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-bold flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm Nhóm</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {groups.map((group) => {
                const isSelected = selectedGroupId === group.id;
                return (
                  <div
                    key={group.id}
                    onClick={() => setSelectedGroupId(group.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-sky-950/70 to-slate-900 border-cyan-500/60 shadow-lg shadow-cyan-600/15'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-cyan-300">
                        {group.code}
                      </span>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingGroup(group);
                            setIsGroupModalOpen(true);
                          }}
                          className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                          title="Sửa thông tin nhóm"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteGroup(group.id, group.name);
                          }}
                          className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800"
                          title="Xóa nhóm"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h4 className="text-xs font-extrabold text-white mt-2">{group.name}</h4>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{group.note || 'Không có ghi chú'}</p>

                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                      <span>Trưởng nhóm: <strong className="text-slate-200">{group.leader}</strong></span>
                      <span className="text-cyan-400 font-bold">{group.permissions.length} quyền cấp</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Permission Matrix (Slide 15-16 Alo360) (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {selectedGroup && (
              <div className="rounded-3xl glass-panel bg-slate-900/70 border border-slate-800 p-6 space-y-5">
                {/* Group Details Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        {selectedGroup.code}
                      </span>
                      <h3 className="text-base font-extrabold text-white">
                        Ma Trận Phân Quyền: {selectedGroup.name}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Tick chọn các quyền chức năng được phép sử dụng cho thành viên thuộc nhóm này (Slide 15-16 Alo360)
                    </p>
                  </div>

                  {/* Actions: Copy & Select All */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setCopySourceGroupId(groups.find(g => g.id !== selectedGroup.id)?.id || '');
                        setIsCopyModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5"
                    >
                      <Copy className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Sao Chép Quyền</span>
                    </button>

                    <button
                      onClick={handleSelectAllPermissions}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold"
                    >
                      Cấp Tất Cả
                    </button>

                    <button
                      onClick={handleClearAllPermissions}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 text-xs font-semibold"
                    >
                      Xóa Toàn Bộ
                    </button>
                  </div>
                </div>

                {/* Categorized Permissions Grid */}
                <div className="space-y-6">
                  {categories.map((cat) => {
                    const catPerms = INITIAL_PERMISSIONS.filter(p => p.category === cat.key);
                    if (catPerms.length === 0) return null;

                    return (
                      <div key={cat.key} className="space-y-3">
                        <div className="flex items-center space-x-2 text-xs font-bold text-slate-300 uppercase tracking-wider pb-1 border-b border-slate-800/80">
                          <Layers className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{cat.label}</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                          {catPerms.map((perm) => {
                            const isChecked = selectedGroup.permissions.includes(perm.id);
                            return (
                              <label
                                key={perm.id}
                                className={`flex items-start space-x-3 p-3 rounded-2xl border transition-all cursor-pointer ${
                                  isChecked
                                    ? 'bg-cyan-950/30 border-cyan-500/40 text-white'
                                    : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleTogglePermission(perm.id)}
                                  className="mt-0.5 w-4 h-4 rounded bg-slate-900 border-slate-700 text-cyan-600 focus:ring-0"
                                />
                                <div className="space-y-0.5">
                                  <div className={`text-xs font-semibold ${isChecked ? 'text-white' : 'text-slate-300'}`}>
                                    {perm.name}
                                  </div>
                                  <p className="text-[11px] text-slate-400 leading-relaxed">
                                    {perm.description}
                                  </p>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Save Confirmation Button */}
                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    Đã lưu tự động khi tick chọn quyền
                  </span>
                  <div className="flex items-center space-x-2 text-xs text-emerald-400 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Dữ liệu phân quyền có hiệu lực tức thì</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* SUB-TAB 3: LỊCH SỬ TRUY CẬP & THAO TÁC (AUDIT LOGS)           */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeSubTab === 'audit' && (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="glass-panel p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3 w-full md:w-auto">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm theo người thực hiện, thao tác..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <select
                value={auditModuleFilter}
                onChange={(e) => setAuditModuleFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value="ALL">Tất cả phân hệ</option>
                <option value="AUTH">Đăng Nhập / Phiên</option>
                <option value="SCREENS">Màn Hình LED</option>
                <option value="MEDIA">Thư Viện Media</option>
                <option value="SCHEDULES">Lập Lịch Phát</option>
                <option value="IAM">Quản Trị Phân Quyền</option>
              </select>
            </div>

            <span className="text-xs text-slate-400">
              Tổng số ghi nhận: <strong className="text-white">{filteredAuditLogs.length}</strong> sự kiện
            </span>
          </div>

          {/* Audit Logs Table (Slide 17-18 Alo360) */}
          <div className="rounded-2xl glass-panel bg-slate-900/60 border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Thời Gian</th>
                    <th className="p-3.5">Người Thao Tác</th>
                    <th className="p-3.5">Hành Động</th>
                    <th className="p-3.5">Phân Hệ</th>
                    <th className="p-3.5">Nội Dung Chi Tiết</th>
                    <th className="p-3.5">Địa Chỉ IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredAuditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                        {log.timestamp}
                      </td>
                      <td className="p-3.5 font-bold text-white whitespace-nowrap">
                        {log.userName}
                      </td>
                      <td className="p-3.5">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.action === 'LOGIN'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : log.action === 'COMMAND'
                            ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                            : log.action === 'DELETE'
                            ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-[10px] text-slate-300">
                        {log.module}
                      </td>
                      <td className="p-3.5 text-slate-200">
                        {log.details}
                      </td>
                      <td className="p-3.5 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                        {log.ipAddress}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL: THÊM / SỬA TÀI KHOẢN                                    */}
      {/* ───────────────────────────────────────────────────────────── */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-cyan-400" />
                <span>{editingUser ? 'Chỉnh Sửa Tài Khoản' : 'Thêm Tài Khoản Người Dùng Mới'}</span>
              </h3>
              <button
                onClick={() => setIsUserModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Họ và tên <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    defaultValue={editingUser?.name || ''}
                    placeholder="Nguyễn Văn A"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    defaultValue={editingUser?.phone || ''}
                    placeholder="0908 123 456"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Email đăng nhập <span className="text-rose-400">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  defaultValue={editingUser?.email || ''}
                  placeholder="user@ledsignage.vn"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Vai trò hệ thống <span className="text-rose-400">*</span>
                  </label>
                  <select
                    name="role"
                    defaultValue={editingUser?.role || 'OPERATOR'}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="SUPER_ADMIN">SUPER_ADMIN (Toàn quyền)</option>
                    <option value="BRANCH_ADMIN">BRANCH_ADMIN (Quản lý chi nhánh)</option>
                    <option value="CONTENT_MANAGER">CONTENT_MANAGER (Biên tập nội dung)</option>
                    <option value="OPERATOR">OPERATOR (Kỹ thuật viên)</option>
                    <option value="VIEWER">VIEWER (Chỉ xem)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Nhóm tài khoản
                  </label>
                  <select
                    name="groupId"
                    defaultValue={editingUser?.groupId || groups[0]?.id}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                  >
                    {groups.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Văn phòng / Chi nhánh (Slide 19-23 Alo360)
                </label>
                <input
                  type="text"
                  name="branch"
                  defaultValue={editingUser?.branch || 'Trụ sở chính - Toàn hệ thống'}
                  placeholder="VD: Chi nhánh Miền Nam (TP.HCM)"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 text-white font-bold shadow-lg shadow-cyan-600/20"
                >
                  {editingUser ? 'Lưu Thay Đổi' : 'Tạo Tài Khoản'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL: THÊM / SỬA NHÓM TÀI KHOẢN (SLIDE 9, 11 ALO360)         */}
      {/* ───────────────────────────────────────────────────────────── */}
      {isGroupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Shield className="w-5 h-5 text-cyan-400" />
                <span>{editingGroup ? 'Sửa Thông Tin Nhóm' : 'Thêm Nhóm Tài Khoản Mới'}</span>
              </h3>
              <button
                onClick={() => setIsGroupModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGroup} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Mã nhóm <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  name="code"
                  required
                  defaultValue={editingGroup?.code || `GRP-${Math.floor(100 + Math.random() * 900)}`}
                  placeholder="VD: GRP-TECH"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono uppercase focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Tên nhóm <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  defaultValue={editingGroup?.name || ''}
                  placeholder="VD: Ban Quản Trị Chi Nhánh"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Nhóm trưởng (Leader) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  name="leader"
                  required
                  defaultValue={editingGroup?.leader || ''}
                  placeholder="VD: Nguyễn Văn A"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Ghi chú (Mô tả trách nhiệm)
                </label>
                <textarea
                  name="note"
                  rows={3}
                  defaultValue={editingGroup?.note || ''}
                  placeholder="Nhập ghi chú hoặc mô tả nhiệm vụ của nhóm..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsGroupModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 text-white font-bold shadow-lg shadow-cyan-600/20"
                >
                  {editingGroup ? 'Lưu Thông Tin' : 'Lưu Nhóm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL: SAO CHÉP PHÂN QUYỀN (SLIDE 16 ALO360)                   */}
      {/* ───────────────────────────────────────────────────────────── */}
      {isCopyModalOpen && selectedGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Copy className="w-5 h-5 text-cyan-400" />
                <span>Sao Chép Phân Quyền Giữa Các Nhóm</span>
              </h3>
              <button
                onClick={() => setIsCopyModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 text-cyan-300">
                Toàn bộ quyền hạn của nhóm nguồn sẽ được sao chép đè sang nhóm đích: <strong>"{selectedGroup.name}"</strong>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Chọn nhóm nguồn muốn sao chép:
                </label>
                <select
                  value={copySourceGroupId}
                  onChange={(e) => setCopySourceGroupId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500 font-semibold"
                >
                  {groups
                    .filter(g => g.id !== selectedGroup.id)
                    .map(g => (
                      <option key={g.id} value={g.id}>
                        {g.name} ({g.permissions.length} quyền)
                      </option>
                    ))}
                </select>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCopyModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleCopyPermissions}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 text-white font-bold shadow-lg shadow-cyan-600/20"
                >
                  Tiến Hành Sao Chép
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
