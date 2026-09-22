import React, { useState } from 'react';
import { User, Phone, Briefcase, Mail, Lock, Eye, EyeOff, ChevronRight, ArrowLeft, Shield, Wrench, CheckCircle, FileText } from 'lucide-react';
import ApiClient from '../utils/apiClient';

const Register = ({ navigate }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    companyName: '',
    taxId: '',
    customerType: 'CUSTOMER', // 'CUSTOMER', 'GARAGE', 'SHOP'
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    if (formData.password.length < 6) {
      setError('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
      return;
    }

    setIsLoading(true);
    try {
      await ApiClient.register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        companyName: formData.companyName || undefined,
        taxId: formData.taxId || undefined,
        customerType: formData.customerType,
      });
      setSuccess(true);
      setTimeout(() => navigate('login'), 2500);
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการลงทะเบียนสมาชิก');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f6fb] p-4 sm:p-6 font-sans">
        <div className="bg-white border border-slate-100 p-8 md:p-12 rounded-[24px] shadow-xl text-center max-w-md w-full">
          <div className="w-16 h-16 bg-green-50 text-green-500 border border-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h2 className="text-xl md:text-2xl font-black text-[#0e1932] mb-3">สมัครสมาชิกสำเร็จ!</h2>
          <p className="text-sm text-slate-500 leading-relaxed mb-6 font-medium">
            ระบบได้ลงทะเบียนบัญชีของคุณเรียบร้อยแล้ว กำลังนำคุณไปยังหน้าเข้าสู่ระบบ...
          </p>
          <div className="flex items-center justify-center gap-2 text-[#2563eb] font-bold text-sm uppercase tracking-widest animate-pulse">
            กำลังเปลี่ยนหน้าไปที่ Login...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f6fb] py-10 px-4 sm:px-6 flex items-center justify-center font-sans relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-96 bg-[#0c3175] rounded-b-[60px] md:rounded-b-[100px] shadow-lg"></div>

      <div className="w-full max-w-3xl bg-white border border-slate-100 p-6 sm:p-10 rounded-[24px] shadow-2xl relative z-10">
        <button
          onClick={() => navigate('login')}
          className="absolute top-6 left-6 p-2 rounded-xl bg-slate-50 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors flex items-center gap-1.5 text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับหน้าเข้าสู่ระบบ</span>
        </button>

        <div className="text-center mb-8 pt-10 sm:pt-4">
          <div className="text-xl font-black text-[#0c3175] tracking-wider mb-2">
            AUTOPARTS<span className="text-[#ea580c]">PRO</span>
          </div>
          <h2 className="text-2xl font-black text-[#0e1932] mb-2">สมัครสมาชิกใหม่</h2>
          <p className="text-sm text-slate-500 font-medium">ร่วมเป็นส่วนหนึ่งกับเครือข่ายอู่ซ่อมรถและร้านค้าอะไหล่ชั้นนำ</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-rose-50 text-rose-600 p-4 rounded-xl text-sm font-bold border border-rose-100 text-center">
              {error}
            </div>
          )}

          {/* Account Type Selector */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-[#0e1932]">เลือกประเภทบัญชีสมาชิก (Account Type)</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, customerType: 'CUSTOMER' })}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  formData.customerType === 'CUSTOMER'
                    ? 'bg-blue-50 border-[#2563eb] shadow-sm'
                    : 'bg-white border-slate-200 hover:border-blue-200 hover:bg-blue-50/50'
                }`}
              >
                <div className={`flex items-center gap-2 text-sm font-bold mb-1 ${formData.customerType === 'CUSTOMER' ? 'text-[#2563eb]' : 'text-slate-700'}`}>
                  <User className="w-4.5 h-4.5" /> ลูกค้าทั่วไป (Retail)
                </div>
                <div className={`text-xs ${formData.customerType === 'CUSTOMER' ? 'text-blue-700/80' : 'text-slate-500'}`}>
                  สำหรับบุคคลทั่วไปที่ต้องการซื้ออะไหล่เปลี่ยนเอง
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, customerType: 'GARAGE' })}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  formData.customerType === 'GARAGE'
                    ? 'bg-orange-50 border-[#ea580c] shadow-sm'
                    : 'bg-white border-slate-200 hover:border-orange-200 hover:bg-orange-50/50'
                }`}
              >
                <div className={`flex items-center gap-2 text-sm font-bold mb-1 ${formData.customerType === 'GARAGE' ? 'text-[#ea580c]' : 'text-slate-700'}`}>
                  <Wrench className="w-4.5 h-4.5" /> อู่ซ่อมรถ (Workshop)
                </div>
                <div className={`text-xs ${formData.customerType === 'GARAGE' ? 'text-orange-700/80' : 'text-slate-500'}`}>
                  รับสิทธิ์ราคาส่งอู่ และระบบวางบิลเครดิต
                </div>
              </button>
            </div>
          </div>

          <div className="w-full h-px bg-slate-100 my-2"></div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#0e1932]">ชื่อแรก (First Name) *</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="สมชาย"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] p-3 pl-11 rounded-xl text-sm text-slate-800 font-medium outline-none transition-all placeholder:text-slate-400"
                  value={formData.firstName}
                  onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#0e1932]">นามสกุล (Last Name) *</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="ใจดี"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] p-3 pl-11 rounded-xl text-sm text-slate-800 font-medium outline-none transition-all placeholder:text-slate-400"
                  value={formData.lastName}
                  onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#0e1932]">เบอร์โทรศัพท์ (Phone Number) *</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="0812345678"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] p-3 pl-11 rounded-xl text-sm text-slate-800 font-medium outline-none transition-all placeholder:text-slate-400"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#0e1932]">อีเมล (Email Address) *</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] p-3 pl-11 rounded-xl text-sm text-slate-800 font-medium outline-none transition-all placeholder:text-slate-400"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            {formData.customerType === 'GARAGE' && (
              <>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#0e1932]">ชื่ออู่ / บริษัท (Garage Name)</label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="สมชาย อู่ยนต์ 2026"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] p-3 pl-11 rounded-xl text-sm text-slate-800 font-medium outline-none transition-all placeholder:text-slate-400"
                      value={formData.companyName}
                      onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#0e1932]">เลขประจำตัวผู้เสียภาษี (Tax ID)</label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="เลข 13 หลักสำหรับออกใบกำกับภาษี"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] p-3 pl-11 rounded-xl text-sm text-slate-800 font-medium outline-none transition-all placeholder:text-slate-400"
                      value={formData.taxId}
                      onChange={e => setFormData({ ...formData, taxId: e.target.value })}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#0e1932]">รหัสผ่าน (Password) *</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] p-3 pl-11 pr-11 rounded-xl text-sm text-slate-800 font-medium outline-none transition-all placeholder:text-slate-400"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#0e1932]">ยืนยันรหัสผ่าน (Confirm Password) *</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] p-3 pl-11 rounded-xl text-sm text-slate-800 font-medium outline-none transition-all placeholder:text-slate-400"
                  value={formData.confirmPassword}
                  onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold py-4 px-4 rounded-xl shadow-md flex items-center justify-center gap-2 text-sm transition-all disabled:opacity-50 mt-6"
          >
            {isLoading ? 'กำลังสร้างบัญชี...' : 'ยืนยันการสมัครสมาชิก'} <ChevronRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-8 text-center border-t border-slate-100 pt-6">
          <p className="text-sm font-medium text-slate-500">
            มีบัญชีสมาชิกอยู่แล้ว?{' '}
            <button
              onClick={() => navigate('login')}
              className="font-bold text-[#2563eb] hover:underline"
            >
              เข้าสู่ระบบที่นี่
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
