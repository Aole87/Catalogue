import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, Edit2, Trash2, Shield, RefreshCw, CheckCircle, XCircle, UserCheck, Phone, Mail, Building, Tag, Check, X } from 'lucide-react';
import ApiClient from '../../utils/apiClient';

export default function MemberManager() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [customerTypeFilter, setCustomerTypeFilter] = useState('');
  const [editingMember, setEditingMember] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    customerType: 'CUSTOMER',
    companyName: '',
    taxId: '',
    isActive: true,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await ApiClient.getAdminCustomers({
        search: search || undefined,
        customerType: customerTypeFilter || undefined,
        limit: 100,
      });
      if (res?.data) {
        setMembers(res.data.data || res.data || []);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'ไม่สามารถดึงข้อมูลสมาชิกได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [customerTypeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchMembers();
  };

  const handleToggleActive = async (member) => {
    try {
      const currentActive = member.user?.isActive !== false;
      const newActive = !currentActive;
      await ApiClient.updateAdminCustomer(member.id, { isActive: newActive });
      setSuccess(`เปลี่ยนสถานะสมาชิก ${member.user?.firstName || member.companyName || ''} เป็น ${newActive ? 'Active' : 'Inactive'} เรียบร้อย`);
      setTimeout(() => setSuccess(''), 3000);
      fetchMembers();
    } catch (err) {
      setError(err.message || 'ไม่สามารถเปลี่ยนสถานะสมาชิกได้');
    }
  };

  const handleOpenEdit = (member) => {
    setEditingMember(member);
    setFormData({
      firstName: member.user?.firstName || '',
      lastName: member.user?.lastName || '',
      email: member.user?.email || '',
      phone: member.phone || member.user?.phone || '',
      customerType: member.customerType || 'CUSTOMER',
      companyName: member.companyName || '',
      taxId: member.taxId || '',
      isActive: member.user?.isActive !== false,
    });
  };

  const handleSaveMember = async (e) => {
    e.preventDefault();
    if (!editingMember) return;
    try {
      setError('');
      await ApiClient.updateAdminCustomer(editingMember.id, formData);
      setEditingMember(null);
      setSuccess('อัปเดตข้อมูลสมาชิกเรียบร้อยแล้ว');
      setTimeout(() => setSuccess(''), 3000);
      fetchMembers();
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูลสมาชิก');
    }
  };

  const handleDeleteMember = async (member) => {
    const name = `${member.user?.firstName || ''} ${member.user?.lastName || ''}`.trim() || member.companyName || 'สมาชิก';
    if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบสมาชิก "${name}" ออกจากระบบ?`)) {
      try {
        await ApiClient.deleteAdminCustomer(member.id);
        setSuccess(`ลบข้อมูลสมาชิก ${name} เรียบร้อยแล้ว`);
        setTimeout(() => setSuccess(''), 3000);
        fetchMembers();
      } catch (err) {
        setError(err.message || 'ไม่สามารถลบข้อมูลสมาชิกได้');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-600" /> การจัดการสมาชิก & สิทธิ์ราคา (Member Management)
          </h2>
          <p className="text-xs text-slate-500">จัดการข้อมูลสมาชิก, เปิด-ปิดการใช้งาน, แก้ไขข้อมูล และกำหนดสิทธิ์ราคาส่ง/อู่ซ่อมรถ</p>
        </div>
        <button
          onClick={fetchMembers}
          className="flex items-center gap-2 px-3 py-2 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg self-start sm:self-auto transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>รีเฟรชข้อมูล</span>
        </button>
      </div>

      {error && <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-lg text-xs font-semibold">{error}</div>}
      {success && <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-xs font-semibold">{success}</div>}

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาชื่อ, อีเมล, เบอร์โทรศัพท์ หรือชื่อบริษัท..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 focus:border-teal-600 focus:bg-white rounded-lg text-xs font-semibold outline-none"
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-colors">
            ค้นหา
          </button>
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={customerTypeFilter}
            onChange={e => setCustomerTypeFilter(e.target.value)}
            className="border border-slate-200 text-xs font-semibold p-2 rounded-lg bg-white outline-none focus:border-teal-600 w-full md:w-48"
          >
            <option value="">ทุกประเภทสมาชิก (All Types)</option>
            <option value="CUSTOMER">ลูกค้าทั่วไป (Retail / GENERAL)</option>
            <option value="GARAGE">อู่ซ่อมรถ (GARAGE Tier)</option>
            <option value="SHOP">ร้านค้าอะไหล่ (SHOP Tier)</option>
          </select>
        </div>
      </div>

      {/* Member Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
              <th className="p-3.5">ชื่อ-นามสกุล / สมาชิก</th>
              <th className="p-3.5">อีเมล / เบอร์โทร</th>
              <th className="p-3.5">ประเภทสมาชิก / สิทธิ์ราคา</th>
              <th className="p-3.5">บริษัท / เลขภาษี</th>
              <th className="p-3.5">สถานะบัญชี (Active)</th>
              <th className="p-3.5 text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {members.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-slate-400 font-medium">
                  {loading ? 'กำลังโหลดข้อมูลสมาชิก...' : 'ไม่พบข้อมูลสมาชิกตามเงื่อนไขที่ค้นหา'}
                </td>
              </tr>
            ) : (
              members.map((m) => {
                const isActive = m.user?.isActive !== false;
                const isStaffOrGeneral = m.customerType === 'CUSTOMER';
                return (
                  <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900 text-xs">
                        {m.user?.firstName ? `${m.user.firstName} ${m.user.lastName || ''}` : m.companyName || 'N/A'}
                      </div>
                      <div className="text-[10px] text-slate-400">ID: #{m.id.substring(0, 8)}...</div>
                    </td>
                    <td className="p-3.5">
                      <div className="text-slate-700 font-semibold">{m.user?.email || '-'}</div>
                      <div className="text-slate-400 text-[11px]">{m.phone || m.user?.phone || '-'}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="flex flex-col gap-1 items-start">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          m.customerType === 'GARAGE' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          m.customerType === 'SHOP' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                          'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {m.customerType === 'GARAGE' ? 'อู่ซ่อมรถ (GARAGE)' : m.customerType === 'SHOP' ? 'ร้านค้าส่ง (SHOP)' : 'ลูกค้าทั่วไป (Retail)'}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          {isStaffOrGeneral ? 'ราคาหน้าร้าน (GENERAL)' : 'ราคาส่งพิเศษ (Wholesale)'}
                        </span>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <div className="text-slate-700 font-medium">{m.companyName || '-'}</div>
                      <div className="text-slate-400 text-[10px]">{m.taxId ? `Tax: ${m.taxId}` : ''}</div>
                    </td>
                    <td className="p-3.5">
                      <button
                        onClick={() => handleToggleActive(m)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all border ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100'
                        }`}
                        title="คลิกเพื่อเปลี่ยนสถานะ Active/Inactive"
                      >
                        {isActive ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-rose-600" />}
                        <span>{isActive ? 'Active (ใช้งานปกติ)' : 'Inactive (ระงับ)'}</span>
                      </button>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleOpenEdit(m)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md mr-1 transition-colors"
                        title="แก้ไขข้อมูลสมาชิก"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteMember(m)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                        title="ลบสมาชิก"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Member Modal */}
      {editingMember && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-5 border border-slate-200 animate-fadeIn">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-teal-600" /> แก้ไขข้อมูลสมาชิก
              </h3>
              <button onClick={() => setEditingMember(null)} className="p-1 text-slate-400 hover:text-slate-600 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">ชื่อแรก *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full border border-slate-200 p-2 rounded-lg text-xs font-semibold outline-none focus:border-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">นามสกุล</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full border border-slate-200 p-2 rounded-lg text-xs font-semibold outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">อีเมล *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border border-slate-200 p-2 rounded-lg text-xs font-semibold outline-none focus:border-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">เบอร์โทรศัพท์</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full border border-slate-200 p-2 rounded-lg text-xs font-semibold outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">ประเภทสมาชิก & สิทธิ์ราคา</label>
                <select
                  value={formData.customerType}
                  onChange={e => setFormData({ ...formData, customerType: e.target.value })}
                  className="w-full border border-slate-200 p-2 rounded-lg text-xs font-semibold outline-none focus:border-teal-600"
                >
                  <option value="CUSTOMER">ลูกค้าทั่วไป / พนักงาน (ได้สินค้าราคาหน้าร้าน - GENERAL)</option>
                  <option value="GARAGE">อู่ซ่อมรถ / Workshop (ได้สินค้าราคาส่งอู่ - GARAGE Tier)</option>
                  <option value="SHOP">ร้านค้า / Dealer (ได้สินค้าราคาส่งร้านค้า - SHOP Tier)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">ชื่ออู่ / บริษัท</label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="เช่น สมชายอู่ยนต์"
                    className="w-full border border-slate-200 p-2 rounded-lg text-xs font-semibold outline-none focus:border-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">เลขประจำตัวผู้เสียภาษี (Tax ID)</label>
                  <input
                    type="text"
                    value={formData.taxId}
                    onChange={e => setFormData({ ...formData, taxId: e.target.value })}
                    placeholder="เลข 13 หลัก"
                    className="w-full border border-slate-200 p-2 rounded-lg text-xs font-semibold outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                  />
                  เปิดใช้งานบัญชีสมาชิกนี้ (Active Account)
                </label>
              </div>

              <div className="flex justify-end gap-2 border-t pt-4">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-lg"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg shadow-sm"
                >
                  บันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
