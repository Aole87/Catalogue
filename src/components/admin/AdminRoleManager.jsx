import React, { useState, useEffect } from 'react';
import {
  Shield, UserCheck, Plus, Trash2, Edit2, CheckCircle2,
  XCircle, Search, Key, Mail, Lock, User, AlertCircle,
  Eye, Check, X, ShieldAlert, Sparkles, Sliders
} from 'lucide-react';

export const AVAILABLE_PERMISSIONS = [
  { id: 'products', label: 'แค็ตตาล็อกสินค้า & Multi-SKU', category: 'การจัดการสินค้า' },
  { id: 'inventory', label: 'คลังสินค้า & จัดการสต็อก', category: 'การจัดการสินค้า' },
  { id: 'masterData', label: 'ข้อมูลหลัก (แบรนด์, ยี่ห้อรถ, รุ่นรถ, ปี)', category: 'การจัดการสินค้า' },
  { id: 'orders', label: 'จัดการคำสั่งซื้อ & ออกใบเสร็จรับเงิน', category: 'ยอดขาย & ออเดอร์' },
  { id: 'analytics', label: 'วิเคราะห์ยอดขายเชิงลึก (Sales Analytics)', category: 'การตลาด & CRM' },
  { id: 'marketing', label: 'แคมเปญการตลาด & คูปองส่วนลด', category: 'การตลาด & CRM' },
  { id: 'crm', label: 'ข้อมูลลูกค้า & CRM 360', category: 'การตลาด & CRM' },
  { id: 'storefront', label: 'ตกแต่งหน้าร้าน & แบนเนอร์', category: 'เว็บไซต์ & คอนเทนต์' },
  { id: 'articles', label: 'ระบบบทความ & ข่าวสาร (Article CMS)', category: 'เว็บไซต์ & คอนเทนต์' },
  { id: 'seo', label: 'การจัดการ SEO & เมตาแท็ก', category: 'เว็บไซต์ & คอนเทนต์' },
  { id: 'members', label: 'จัดการข้อมูลสมาชิก & อู่ยนต์', category: 'ผู้ใช้งาน & ระบบ' },
  { id: 'settings', label: 'ตั้งค่าระบบ & API ช่องทางชำระเงิน', category: 'ผู้ใช้งาน & ระบบ' },
  { id: 'admins', label: 'จัดการผู้ดูแลระบบ & สิทธิ์การใช้งาน', category: 'ผู้ใช้งาน & ระบบ' },
];

export default function AdminRoleManager({ currentAdmin, setCurrentAdmin }) {
  const [admins, setAdmins] = useState(() => {
    const saved = localStorage.getItem('adnex_admins_list');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return [
      {
        id: 'adm-1',
        name: 'John Doe (Super Admin)',
        email: 'john.doe@adnex.com',
        role: 'SUPER_ADMIN',
        department: 'ผู้บริหารระดับสูง & เจ้าของระบบ',
        permissions: AVAILABLE_PERMISSIONS.map(p => p.id),
        isActive: true,
        lastLogin: 'วันนี้, 13:20 น.',
        avatar: 'JD',
      },
      {
        id: 'adm-2',
        name: 'สิทธิชัย การค้า',
        email: 'sittichai.ops@adnex.com',
        role: 'ADMIN',
        department: 'ฝ่ายบริหารสินค้าและคลัง (Inventory & Orders)',
        permissions: ['products', 'inventory', 'masterData', 'orders'],
        isActive: true,
        lastLogin: 'เมื่อวานนี้, 16:45 น.',
        avatar: 'ST',
      },
      {
        id: 'adm-3',
        name: 'กุลธิดา การตลาด',
        email: 'kunthida.mkt@adnex.com',
        role: 'ADMIN',
        department: 'ฝ่ายการตลาดและประชาสัมพันธ์ (Marketing & SEO)',
        permissions: ['marketing', 'crm', 'analytics', 'storefront', 'articles', 'seo'],
        isActive: true,
        lastLogin: '18 ก.ย. 2026',
        avatar: 'KT',
      },
      {
        id: 'adm-4',
        name: 'ธนกร ช่างเทคนิค',
        email: 'thanakorn.tech@adnex.com',
        role: 'ADMIN',
        department: 'ฝ่ายข้อมูลยานยนต์ & Master Data',
        permissions: ['products', 'masterData'],
        isActive: true,
        lastLogin: '16 ก.ย. 2026',
        avatar: 'TK',
      }
    ];
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'ADMIN', // 'SUPER_ADMIN', 'ADMIN'
    department: '',
    permissions: ['products', 'orders'],
    isActive: true,
  });

  useEffect(() => {
    localStorage.setItem('adnex_admins_list', JSON.stringify(admins));
  }, [admins]);

  const handleOpenAdd = () => {
    setEditingAdmin(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'ADMIN',
      department: '',
      permissions: ['products', 'orders'],
      isActive: true,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (admin) => {
    setEditingAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email,
      password: '',
      role: admin.role,
      department: admin.department || '',
      permissions: admin.role === 'SUPER_ADMIN' ? AVAILABLE_PERMISSIONS.map(p => p.id) : (admin.permissions || []),
      isActive: admin.isActive !== false,
    });
    setShowModal(true);
  };

  const handleTogglePermission = (permId) => {
    if (formData.role === 'SUPER_ADMIN') return; // Super admin has all permissions
    const exists = formData.permissions.includes(permId);
    if (exists) {
      setFormData({
        ...formData,
        permissions: formData.permissions.filter(p => p !== permId)
      });
    } else {
      setFormData({
        ...formData,
        permissions: [...formData.permissions, permId]
      });
    }
  };

  const handleSelectAllPermissions = () => {
    setFormData({
      ...formData,
      permissions: AVAILABLE_PERMISSIONS.map(p => p.id)
    });
  };

  const handleClearPermissions = () => {
    setFormData({
      ...formData,
      permissions: []
    });
  };

  const handleSaveAdmin = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      alert('กรุณากรอกชื่อและอีเมลให้ครบถ้วน');
      return;
    }

    const assignedPermissions = formData.role === 'SUPER_ADMIN'
      ? AVAILABLE_PERMISSIONS.map(p => p.id)
      : formData.permissions;

    if (editingAdmin) {
      const updated = admins.map(a => {
        if (a.id === editingAdmin.id) {
          const updatedItem = {
            ...a,
            name: formData.name,
            email: formData.email,
            role: formData.role,
            department: formData.department,
            permissions: assignedPermissions,
            isActive: formData.isActive,
          };
          if (currentAdmin?.id === a.id && setCurrentAdmin) {
            setCurrentAdmin(updatedItem);
          }
          return updatedItem;
        }
        return a;
      });
      setAdmins(updated);
      setSuccessMsg(`อัปเดตข้อมูลผู้ดูแลระบบ ${formData.name} เรียบร้อยแล้ว`);
    } else {
      const initials = formData.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'AD';
      const newAdmin = {
        id: `adm-${Date.now()}`,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        department: formData.department || 'เจ้าหน้าที่ผู้ดูแลระบบ',
        permissions: assignedPermissions,
        isActive: formData.isActive,
        lastLogin: 'เพิ่งสร้างบัญชี',
        avatar: initials,
      };
      setAdmins([...admins, newAdmin]);
      setSuccessMsg(`เพิ่มผู้ดูแลระบบ ${formData.name} (${formData.role}) เรียบร้อยแล้ว`);
    }

    setTimeout(() => setSuccessMsg(''), 3000);
    setShowModal(false);
  };

  const handleDeleteAdmin = (admin) => {
    if (admin.id === 'adm-1') {
      alert('ไม่สามารถลบ Super Admin หลักของระบบได้');
      return;
    }
    if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบผู้ดูแลระบบ "${admin.name}" ออกจากระบบ?`)) {
      setAdmins(admins.filter(a => a.id !== admin.id));
      setSuccessMsg(`ลบผู้ดูแลระบบ ${admin.name} เรียบร้อยแล้ว`);
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  const handleToggleActive = (admin) => {
    if (admin.id === 'adm-1') {
      alert('ไม่สามารถปิดการใช้งาน Super Admin หลักของระบบได้');
      return;
    }
    const updated = admins.map(a => {
      if (a.id === admin.id) {
        return { ...a, isActive: !a.isActive };
      }
      return a;
    });
    setAdmins(updated);
  };

  const filteredAdmins = admins.filter(a => {
    const matchSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        a.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (a.department && a.department.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchRole = roleFilter === 'ALL' || a.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-violet-50 text-violet-700 border border-violet-100">
              <Shield className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              การจัดการผู้ดูแลระบบ & กำหนดสิทธิ์ (Administrator & Role Permissions)
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            ระบบสิทธิ์ 2 ระดับ: <b className="text-violet-700">Super Admin (สิทธิ์เต็มทุกฟังก์ชัน 100%)</b> และ <b className="text-blue-700">Admin (กำหนดสิทธิ์ตามโมดูลที่เลือก)</b> สามารถเพิ่มผู้ดูแลระบบได้ไม่จำกัด
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 bg-[#0c3175] hover:bg-[#081e4b] text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-2 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ เพิ่มผู้ดูแลระบบใหม่</span>
        </button>
      </div>

      {/* Role Simulator Bar (ให้ทดสอบสลับดูมุมมอง Super Admin vs Admin แต่ละคน) */}
      {currentAdmin && setCurrentAdmin && (
        <div className="p-4 bg-gradient-to-r from-slate-900 to-[#0c3175] text-white rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center font-bold text-xs">
              {currentAdmin.avatar || 'AD'}
            </div>
            <div>
              <div className="text-xs font-bold flex items-center gap-2">
                <span>บัญชีที่เข้าสู่ระบบปัจจุบัน: {currentAdmin.name}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  currentAdmin.role === 'SUPER_ADMIN'
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'bg-blue-400 text-slate-950'
                }`}>
                  {currentAdmin.role === 'SUPER_ADMIN' ? '👑 Super Admin' : '🛡️ Admin'}
                </span>
              </div>
              <div className="text-[11px] text-blue-200/80 mt-0.5">
                {currentAdmin.role === 'SUPER_ADMIN'
                  ? 'เข้าถึงและจัดการได้ทุกเมนูของระบบ 100%'
                  : `ได้รับสิทธิ์ ${currentAdmin.permissions?.length || 0} โมดูล (เมนูที่ไม่มีสิทธิ์จะถูกซ่อนอัตโนมัติ)`}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-blue-200">จำลองสลับผู้ใช้:</span>
            <select
              value={currentAdmin.id}
              onChange={(e) => {
                const target = admins.find(a => a.id === e.target.value);
                if (target) setCurrentAdmin(target);
              }}
              className="bg-white/15 border border-white/30 text-white rounded-xl px-3 py-1.5 text-xs font-bold outline-none cursor-pointer"
            >
              {admins.map(a => (
                <option key={a.id} value={a.id} className="text-slate-900">
                  {a.name} ({a.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาชื่อ, อีเมล หรือฝ่าย..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#0c3175]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500">ระดับสิทธิ์:</span>
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
            {[
              { id: 'ALL', label: 'ทั้งหมด' },
              { id: 'SUPER_ADMIN', label: 'Super Admin' },
              { id: 'ADMIN', label: 'Admin' },
            ].map(pill => (
              <button
                key={pill.id}
                onClick={() => setRoleFilter(pill.id)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  roleFilter === pill.id ? 'bg-white text-[#0c3175] shadow-xs' : 'text-slate-500'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Admins Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] text-slate-500 uppercase font-bold tracking-wider">
                <th className="p-4">ผู้ดูแลระบบ (Administrator)</th>
                <th className="p-4">ระดับสิทธิ์ (Role Level)</th>
                <th className="p-4">โมดูลที่ได้รับอนุญาต (Permissions)</th>
                <th className="p-4 text-center">สถานะ</th>
                <th className="p-4 text-right">เข้าสู่ระบบล่าสุด</th>
                <th className="p-4 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAdmins.map(admin => {
                const isSuper = admin.role === 'SUPER_ADMIN';
                return (
                  <tr key={admin.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${
                          isSuper ? 'bg-violet-100 text-violet-800 border border-violet-200' : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}>
                          {admin.avatar || 'AD'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                            <span>{admin.name}</span>
                            {isSuper && (
                              <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md font-black border border-amber-200">
                                👑 เจ้าของระบบ
                              </span>
                            )}
                          </div>
                          <div className="text-slate-400 text-xs">{admin.email}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{admin.department}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      {isSuper ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 text-violet-800 border border-violet-200 font-black text-xs">
                          <Shield className="w-3.5 h-3.5 text-violet-600" />
                          <span>SUPER ADMIN (สิทธิ์เต็ม)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 font-bold text-xs">
                          <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                          <span>ADMIN (ตามที่กำหนด)</span>
                        </span>
                      )}
                    </td>

                    <td className="p-4">
                      {isSuper ? (
                        <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>เข้าถึงได้ทุกส่วนของระบบ (13 โมดูล)</span>
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-1 max-w-sm">
                          {admin.permissions && admin.permissions.length > 0 ? (
                            admin.permissions.map(pid => {
                              const perm = AVAILABLE_PERMISSIONS.find(p => p.id === pid);
                              return (
                                <span key={pid} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold border border-slate-200">
                                  {perm ? perm.label.split(' ')[0] : pid}
                                </span>
                              );
                            })
                          ) : (
                            <span className="text-slate-400 text-[11px] italic">ไม่มีสิทธิ์โมดูลใดๆ</span>
                          )}
                        </div>
                      )}
                    </td>

                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleToggleActive(admin)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          admin.isActive !== false
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${admin.isActive !== false ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                        <span>{admin.isActive !== false ? 'เปิดใช้งาน' : 'ระงับชั่วคราว'}</span>
                      </button>
                    </td>

                    <td className="p-4 text-right text-slate-500 font-mono text-[11px]">
                      {admin.lastLogin || '-'}
                    </td>

                    <td className="p-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleOpenEdit(admin)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg mr-1.5 transition-colors cursor-pointer"
                        title="แก้ไขสิทธิ์"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {admin.id !== 'adm-1' && (
                        <button
                          onClick={() => handleDeleteAdmin(admin)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="ลบผู้ดูแลระบบ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add/Edit Administrator & Permissions */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 animate-scale-up">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#0c3175] text-white flex items-center justify-center font-bold">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">
                    {editingAdmin ? 'แก้ไขข้อมูลและสิทธิ์ผู้ดูแลระบบ' : 'เพิ่มผู้ดูแลระบบใหม่ (Add Administrator)'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    กำหนดระดับสิทธิ์การเข้าถึง Super Admin หรือ Admin รายโมดูล
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveAdmin} className="p-6 overflow-y-auto space-y-5 flex-1">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ชื่อ-นามสกุล <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="เช่น วิภาดา สุขใจ"
                    className="w-full border border-slate-200 p-2.5 rounded-xl text-xs outline-none focus:border-[#0c3175]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    อีเมลสำหรับเข้าสู่ระบบ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@adnex.com"
                    className="w-full border border-slate-200 p-2.5 rounded-xl text-xs outline-none focus:border-[#0c3175]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    รหัสผ่าน {editingAdmin ? '(เว้นว่างหากไม่ต้องการเปลี่ยน)' : <span className="text-rose-500">*</span>}
                  </label>
                  <input
                    type="password"
                    required={!editingAdmin}
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full border border-slate-200 p-2.5 rounded-xl text-xs outline-none focus:border-[#0c3175]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    แผนก / ฝ่ายงาน
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                    placeholder="เช่น ฝ่ายการตลาด, ฝ่ายคลังสินค้า"
                    className="w-full border border-slate-200 p-2.5 rounded-xl text-xs outline-none focus:border-[#0c3175]"
                  />
                </div>
              </div>

              {/* Role Level 2 Choices */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-bold text-slate-800">
                  ระดับสิทธิ์ผู้ดูแลระบบ (Role Level) <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* Super Admin Choice */}
                  <div
                    onClick={() => setFormData({ ...formData, role: 'SUPER_ADMIN' })}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                      formData.role === 'SUPER_ADMIN'
                        ? 'border-violet-600 bg-violet-50/70 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                      formData.role === 'SUPER_ADMIN' ? 'border-violet-600 bg-violet-600' : 'border-slate-300'
                    }`}>
                      {formData.role === 'SUPER_ADMIN' && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-violet-950 flex items-center gap-1.5">
                        <span>👑 Super Admin</span>
                      </div>
                      <p className="text-[11px] text-violet-800 mt-1 leading-relaxed">
                        ทำได้ทุกอย่าง 100% มีสิทธิ์เข้าถึง จัดการ และตั้งค่าทุกโมดูลในระบบโดยไม่มีข้อจำกัด
                      </p>
                    </div>
                  </div>

                  {/* Admin Choice */}
                  <div
                    onClick={() => setFormData({ ...formData, role: 'ADMIN' })}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                      formData.role === 'ADMIN'
                        ? 'border-blue-600 bg-blue-50/70 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                      formData.role === 'ADMIN' ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                    }`}>
                      {formData.role === 'ADMIN' && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-blue-950 flex items-center gap-1.5">
                        <span>🛡️ Admin</span>
                      </div>
                      <p className="text-[11px] text-blue-800 mt-1 leading-relaxed">
                        ทำได้ตามที่กำหนดสิทธิ์ สามารถเลือกติ๊กอนุญาตเฉพาะโมดูลที่เกี่ยวข้องกับหน้าที่ได้
                      </p>
                    </div>
                  </div>

                </div>
              </div>

              {/* Permission Matrix (Active when ADMIN is chosen) */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-bold text-slate-800">
                      รายการสิทธิ์การใช้งาน (Module Permissions)
                    </label>
                    <p className="text-[11px] text-slate-500">
                      {formData.role === 'SUPER_ADMIN'
                        ? 'Super Admin ได้รับสิทธิ์ครบทุกโมดูลโดยอัตโนมัติ'
                        : 'เลือกโมดูลที่อนุญาตให้ผู้ดูแลระบบรายนี้เข้าถึง'}
                    </p>
                  </div>

                  {formData.role === 'ADMIN' && (
                    <div className="flex items-center gap-2 text-xs font-bold">
                      <button
                        type="button"
                        onClick={handleSelectAllPermissions}
                        className="text-blue-600 hover:underline cursor-pointer text-[11px]"
                      >
                        เลือกทั้งหมด
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        type="button"
                        onClick={handleClearPermissions}
                        className="text-rose-600 hover:underline cursor-pointer text-[11px]"
                      >
                        ล้างทั้งหมด
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-4 rounded-2xl bg-slate-50 border border-slate-200 max-h-60 overflow-y-auto">
                  {AVAILABLE_PERMISSIONS.map(perm => {
                    const isChecked = formData.role === 'SUPER_ADMIN' || formData.permissions.includes(perm.id);
                    return (
                      <label
                        key={perm.id}
                        className={`flex items-start gap-2.5 p-2 rounded-xl transition-all ${
                          formData.role === 'SUPER_ADMIN'
                            ? 'opacity-80 cursor-not-allowed bg-white/60'
                            : 'cursor-pointer hover:bg-white bg-white/40'
                        }`}
                      >
                        <input
                          type="checkbox"
                          disabled={formData.role === 'SUPER_ADMIN'}
                          checked={isChecked}
                          onChange={() => handleTogglePermission(perm.id)}
                          className="w-4 h-4 mt-0.5 accent-[#0c3175] shrink-0"
                        />
                        <div className="text-xs">
                          <div className="font-bold text-slate-800 leading-snug">{perm.label}</div>
                          <div className="text-[10px] text-slate-400">{perm.category}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <span className="text-xs font-bold text-slate-800">เปิดใช้งานบัญชีนี้ (Active Account)</span>
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 accent-[#0c3175]"
                />
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 border border-slate-200 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#0c3175] hover:bg-[#081e4b] text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  {editingAdmin ? 'บันทึกการแก้ไข' : 'สร้างบัญชีผู้ดูแลระบบ'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
