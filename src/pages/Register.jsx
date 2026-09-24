import React, { useState, useEffect } from 'react';
import {
  User,
  Phone,
  Briefcase,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ChevronRight,
  ArrowLeft,
  Shield,
  Wrench,
  CheckCircle,
  FileText,
  KeyRound,
  Send,
  RefreshCw,
  AlertCircle,
  Check,
} from 'lucide-react';
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

  // OTP & Verification State
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [verificationToken, setVerificationToken] = useState(null);
  const [cooldown, setCooldown] = useState(0);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpMessage, setOtpMessage] = useState('');
  const [otpError, setOtpError] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Cooldown countdown timer
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSendOtp = async () => {
    setOtpError('');
    setOtpMessage('');

    const emailTrimmed = formData.email.trim();
    if (!emailTrimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      setOtpError('กรุณากรอกอีเมลที่ถูกต้องก่อนขอรหัส OTP');
      return;
    }

    setIsSendingOtp(true);
    try {
      const res = await ApiClient.sendOtp(emailTrimmed, 'REGISTRATION');
      setOtpSent(true);
      setCooldown(60);
      setOtpMessage(res?.message || `ส่งรหัส OTP ไปยัง ${emailTrimmed} เรียบร้อยแล้ว (มีอายุ 5 นาที)`);
    } catch (err) {
      setOtpError(err.message || 'ไม่สามารถส่งรหัส OTP ได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    setOtpError('');
    setOtpMessage('');

    const codeTrimmed = otpCode.trim();
    if (codeTrimmed.length < 6) {
      setOtpError('กรุณากรอกรหัส OTP ให้ครบ 6 หลัก');
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const res = await ApiClient.verifyOtp(formData.email.trim(), codeTrimmed, 'REGISTRATION');
      const token = res?.data?.verificationToken || res?.verificationToken;
      setIsVerified(true);
      setVerificationToken(token || null);
      setOtpMessage('✓ ยืนยันอีเมลสำเร็จเรียบร้อย');
    } catch (err) {
      setOtpError(err.message || 'รหัส OTP ไม่ถูกต้องหรือหมดอายุ');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleResetEmailVerification = () => {
    setIsVerified(false);
    setVerificationToken(null);
    setOtpSent(false);
    setOtpCode('');
    setOtpMessage('');
    setOtpError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isVerified) {
      setError('กรุณายืนยันรหัส OTP ทางอีเมลก่อนทำการสมัครสมาชิก เพื่อความปลอดภัยของบัญชี');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    if (formData.password.length < 8) {
      setError('รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร เพื่อความปลอดภัย');
      return;
    }

    setIsLoading(true);
    try {
      await ApiClient.register({
        email: formData.email.trim(),
        password: formData.password,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
        companyName: formData.companyName ? formData.companyName.trim() : undefined,
        taxId: formData.taxId ? formData.taxId.trim() : undefined,
        customerType: formData.customerType,
        verificationToken: verificationToken || undefined,
        verificationCode: otpCode.trim() || undefined,
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

            <div className="md:col-span-2 space-y-2">
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

            {/* Email & OTP Verification Section */}
            <div className="md:col-span-2 space-y-3 p-4 sm:p-5 bg-slate-50/80 rounded-2xl border border-slate-200/80">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#0e1932] flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#2563eb]" />
                  อีเมล (Email Address) *
                </label>
                {isVerified && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    ยืนยันความปลอดภัยแล้ว
                  </span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    disabled={isVerified}
                    placeholder="you@example.com"
                    className={`w-full bg-white border ${
                      isVerified
                        ? 'border-emerald-300 bg-emerald-50/30 text-emerald-900 font-semibold'
                        : 'border-slate-200 focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] text-slate-800'
                    } p-3 pl-11 rounded-xl text-sm font-medium outline-none transition-all placeholder:text-slate-400 disabled:opacity-80`}
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (otpSent || isVerified) handleResetEmailVerification();
                    }}
                  />
                </div>

                {!isVerified ? (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={isSendingOtp || cooldown > 0 || !formData.email}
                    className="px-5 py-3 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm shrink-0"
                  >
                    {isSendingOtp ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        กำลังส่ง OTP...
                      </>
                    ) : cooldown > 0 ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5" />
                        ขอรหัสใหม่ ({cooldown}s)
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        {otpSent ? 'ส่งรหัสอีกครั้ง' : 'ขอรับรหัส OTP'}
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleResetEmailVerification}
                    className="px-4 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 text-xs font-bold transition-all shrink-0"
                  >
                    เปลี่ยนอีเมล
                  </button>
                )}
              </div>

              {/* Status & Error feedback */}
              {otpMessage && !isVerified && (
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{otpMessage}</span>
                </div>
              )}
              {otpError && (
                <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{otpError}</span>
                </div>
              )}

              {/* 6-Digit OTP Verification Box */}
              {otpSent && !isVerified && (
                <div className="mt-3 p-4 bg-white rounded-xl border border-blue-200 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#0c3175]">
                    <KeyRound className="w-4 h-4 text-[#2563eb]" />
                    <span>กรอกรหัสยืนยัน OTP 6 หลักที่ได้รับทางอีเมล:</span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <input
                      type="text"
                      maxLength={6}
                      pattern="[0-9]*"
                      inputMode="numeric"
                      placeholder="••••••"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      className="flex-1 bg-slate-50 border border-slate-300 focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] p-3 rounded-xl text-center text-lg font-black tracking-[0.4em] text-slate-900 outline-none placeholder:text-slate-300"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={isVerifyingOtp || otpCode.trim().length !== 6}
                      className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm shrink-0"
                    >
                      {isVerifyingOtp ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          กำลังตรวจสอบ...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          ยืนยันรหัส OTP
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    * รหัส OTP มีอายุการใช้งาน 5 นาที หากไม่พบอีเมล โปรดตรวจสอบในโฟลเดอร์ Junk/Spam
                  </p>
                </div>
              )}
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
