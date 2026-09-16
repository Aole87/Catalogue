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
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 sm:p-6 font-sans">
        <div className="bg-slate-900 border border-slate-800 p-8 md:p-12 rounded-2xl shadow-2xl text-center max-w-md w-full">
          <div className="w-16 h-16 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white mb-3">สมัครสมาชิกสำเร็จ!</h2>
          <p className="text-xs text-slate-300 leading-relaxed mb-6">
            ระบบได้ลงทะเบียนบัญชีของคุณเรียบร้อยแล้ว กำลังนำคุณไปยังหน้าเข้าสู่ระบบ...
          </p>
          <div className="flex items-center justify-center gap-2 text-teal-400 font-bold text-xs uppercase tracking-widest animate-pulse">
            กำลังเปลี่ยนหน้าไปที่ Login...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 py-10 px-4 sm:px-6 flex items-center justify-center font-sans">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 p-6 sm:p-10 rounded-2xl shadow-2xl relative">
        <button
          onClick={() => navigate('login')}
          className="absolute top-6 left-6 p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับหน้าเข้าสู่ระบบ</span>
        </button>

        <div className="text-center mb-8 pt-4">
          <div className="text-xl font-black text-white tracking-wider mb-1">
            AUTOPARTS<span className="text-teal-400">PRO</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">สมัครสมาชิกใหม่ (Create Account)</h2>
          <p className="text-xs text-slate-400">ร่วมเป็นส่วนหนึ่งกับเครือข่ายอู่ซ่อมรถและร้านค้าอะไหล่ชั้นนำ</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-rose-950/60 text-rose-300 p-3.5 rounded-lg text-xs font-semibold border border-rose-800 text-center">
              {error}
            </div>
          )}

          {/* Account Type Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300">เลือกประเภทบัญชีสมาชิก (Account Type)</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, customerType: 'CUSTOMER' })}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  formData.customerType === 'CUSTOMER'
                    ? 'bg-teal-950/60 border-teal-500 text-white shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 text-xs font-bold text-white mb-0.5">
                  <User className="w-4 h-4 text-teal-400" /> ลูกค้าทั่วไป (Retail Customer)
                </div>
                <div className="text-[11px] text-slate-400">สำหรับบุคคลทั่วไปที่ต้องการซื้ออะไหล่เปลี่ยนเอง</div>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, customerType: 'GARAGE' })}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  formData.customerType === 'GARAGE'
                    ? 'bg-amber-950/60 border-amber-500 text-white shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 text-xs font-bold text-white mb-0.5">
                  <Wrench className="w-4 h-4 text-amber-400" /> อู่ซ่อมรถ / Workshop Member
                </div>
                <div className="text-[11px] text-slate-400">รับสิทธิ์ราคาส่งอู่ และระบบวางบิลเครดิต</div>
              </button>
            </div>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">ชื่อแรก (First Name) *</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="สมชาย"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 p-3 pl-10 rounded-lg text-xs text-white font-medium outline-none"
                  value={formData.firstName}
                  onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">นามสกุล (Last Name) *</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="ใจดี"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 p-3 pl-10 rounded-lg text-xs text-white font-medium outline-none"
                  value={formData.lastName}
                  onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">เบอร์โทรศัพท์ (Phone Number) *</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="0812345678"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 p-3 pl-10 rounded-lg text-xs text-white font-medium outline-none"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">อีเมล (Email Address) *</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 p-3 pl-10 rounded-lg text-xs text-white font-medium outline-none"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            {formData.customerType === 'GARAGE' && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">ชื่ออู่ / บริษัท (Garage Name)</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="สมชาย อู่ยนต์ 2026"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 p-3 pl-10 rounded-lg text-xs text-white font-medium outline-none"
                      value={formData.companyName}
                      onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">เลขประจำตัวผู้เสียภาษี (Tax ID)</label>
                  <div className="relative">
                    <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="เลข 13 หลักสำหรับออกใบกำกับภาษี"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 p-3 pl-10 rounded-lg text-xs text-white font-medium outline-none"
                      value={formData.taxId}
                      onChange={e => setFormData({ ...formData, taxId: e.target.value })}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">รหัสผ่าน (Password) *</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 p-3 pl-10 pr-10 rounded-lg text-xs text-white font-medium outline-none"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">ยืนยันรหัสผ่าน (Confirm Password) *</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 p-3 pl-10 rounded-lg text-xs text-white font-medium outline-none"
                  value={formData.confirmPassword}
                  onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold py-3.5 px-4 rounded-lg shadow-lg flex items-center justify-center gap-2 text-xs uppercase tracking-wider transition-all disabled:opacity-50 mt-4"
          >
            {isLoading ? 'กำลังสร้างบัญชี...' : 'ยืนยันการสมัครสมาชิก'} <ChevronRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-slate-400">
            มีบัญชีสมาชิกอยู่แล้ว?{' '}
            <button
              onClick={() => navigate('login')}
              className="font-bold text-teal-400 hover:text-teal-300 hover:underline"
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
