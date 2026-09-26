import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, ChevronRight, ArrowLeft, ArrowRight, CheckCircle, CheckCircle2, X, KeyRound, ShieldAlert, Sparkles, ExternalLink, RefreshCw, Send } from 'lucide-react';
import ApiClient from '../utils/apiClient';
import { useSettings } from '../context/SettingsContext';
import { useLanguage } from '../context/LanguageContext';

const Login = ({ navigate, setUser }) => {
  const { settings } = useSettings();
  const { lang } = useLanguage();
  const authConfig = settings?.authPage || {};

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccessMsg, setLoginSuccessMsg] = useState('');

  // Forgot Password Wizard State:
  // forgotStep: 'EMAIL' | 'VERIFY' | 'LINK_RESET'
  // verifyTab: 'LINK' | 'OTP'
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState('EMAIL');
  const [verifyTab, setVerifyTab] = useState('LINK');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [showForgotPass, setShowForgotPass] = useState(false);
  const [showForgotConfirmPass, setShowForgotConfirmPass] = useState(false);
  const [forgotCooldown, setForgotCooldown] = useState(0);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotDebugCode, setForgotDebugCode] = useState('');
  const [forgotResetUrl, setForgotResetUrl] = useState('');
  const [resetToken, setResetToken] = useState('');

  // Check on mount if user arrived via Reset Password Magic Link
  useEffect(() => {
    const handleUrlParams = () => {
      const hash = typeof window !== 'undefined' ? window.location.hash || '' : '';
      const search = typeof window !== 'undefined' ? window.location.search || '' : '';
      const queryStr = hash.includes('?') ? hash.split('?')[1] : search.replace(/^\?/, '');
      const params = new URLSearchParams(queryStr);
      const urlEmail = params.get('email');
      const urlToken = params.get('token');

      if ((hash.includes('reset-password') || hash.includes('token=')) && urlEmail && urlToken) {
        setForgotEmail(urlEmail);
        setResetToken(urlToken);
        setForgotStep('LINK_RESET');
        setForgotError('');
        setForgotSuccess('ยืนยันตัวตนผ่านลิงก์สำเร็จ กรุณากำหนดรหัสผ่านใหม่ของคุณ');
        setShowForgotModal(true);
      }
    };

    handleUrlParams();
    window.addEventListener('hashchange', handleUrlParams);
    return () => window.removeEventListener('hashchange', handleUrlParams);
  }, []);

  // Countdown timer for OTP / Link resend
  useEffect(() => {
    let timer;
    if (forgotCooldown > 0) {
      timer = setInterval(() => {
        setForgotCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [forgotCooldown]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoginSuccessMsg('');
    setIsLoading(true);
    try {
      const res = await ApiClient.login(email, password);
      if (res && (res.user || res.data?.user)) {
        const loggedUser = res.user || res.data?.user;
        if (setUser) setUser(loggedUser);
        navigate('home');
      } else {
        setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      }
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenForgotModal = () => {
    setForgotEmail(email || '');
    setForgotOtp('');
    setForgotNewPassword('');
    setForgotConfirmPassword('');
    setForgotError('');
    setForgotSuccess('');
    setForgotStep('EMAIL');
    setVerifyTab('LINK');
    setShowForgotModal(true);
  };

  // Step 1: Send Reset Link & OTP
  const handleSendForgotOtp = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const trimmed = (forgotEmail || '').trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setForgotError('กรุณากรอกอีเมลที่ถูกต้องก่อนดำเนินการ');
      return;
    }
    setForgotLoading(true);
    setForgotError('');
    setForgotSuccess('');
    try {
      const res = await ApiClient.sendOtp(trimmed, 'PASSWORD_RESET');
      setForgotCooldown(60);
      const msg = res?.data?.message || res?.message || `ส่งลิงก์และรหัสยืนยันไปยังอีเมล ${trimmed} เรียบร้อยแล้ว`;
      setForgotSuccess(msg);
      
      const dbg = res?.data?.debugCode || res?.debugCode;
      if (dbg) setForgotDebugCode(dbg);

      const rUrl = res?.data?.resetUrl || res?.resetUrl;
      if (rUrl) setForgotResetUrl(rUrl);

      const tok = res?.data?.verificationToken || res?.verificationToken;
      if (tok) setResetToken(tok);

      // Advance to Step 2!
      setForgotStep('VERIFY');
    } catch (err) {
      setForgotError(err?.message || 'ไม่สามารถส่งคำขอได้ กรุณาตรวจสอบอีเมลหรือลองใหม่อีกครั้ง');
    } finally {
      setForgotLoading(false);
    }
  };

  // Step 2 / 3: Reset password submit
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setForgotError('');
    const trimmedEmail = (forgotEmail || '').trim().toLowerCase();

    if (!trimmedEmail) {
      setForgotError('กรุณาระบุอีเมลบัญชีของคุณ');
      return;
    }

    if (!forgotNewPassword || forgotNewPassword.length < 8) {
      setForgotError('รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 8 ตัวอักษร');
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError('รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    const payload = {
      email: trimmedEmail,
      newPassword: forgotNewPassword,
    };

    if (forgotStep === 'LINK_RESET') {
      if (!resetToken) {
        setForgotError('ไม่พบโทเค็นยืนยันตัวตน กรุณาขอลิงก์ใหม่อีกครั้ง');
        return;
      }
      payload.verificationToken = resetToken;
    } else {
      const trimmedOtp = (forgotOtp || '').trim();
      if (!trimmedOtp) {
        setForgotError('กรุณากรอกรหัส OTP 6 หลักจากอีเมล');
        return;
      }
      payload.code = trimmedOtp;
    }

    setForgotLoading(true);
    try {
      const res = await ApiClient.resetPassword(payload);
      const successMsg = res?.data?.message || res?.message || 'ตั้งรหัสผ่านใหม่สำเร็จ!';
      setForgotSuccess(successMsg);
      setLoginSuccessMsg('รีเซ็ตรหัสผ่านสำเร็จเรียบร้อย! กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่');
      setEmail(trimmedEmail);
      setPassword('');
      
      // Clean URL hash if it had reset-password
      if (typeof window !== 'undefined' && window.location.hash.includes('reset-password')) {
        window.location.hash = 'login';
      }

      setTimeout(() => {
        setShowForgotModal(false);
      }, 1500);
    } catch (err) {
      setForgotError(err?.message || 'การรีเซ็ตรหัสผ่านไม่สำเร็จ กรุณาตรวจสอบข้อมูลหรือขอรหัสใหม่อีกครั้ง');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f6fb] p-4 sm:p-6 font-sans">
      <div className="w-full max-w-4xl bg-white rounded-[24px] shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-12 relative">
        
        {/* Back Home Button */}
        <button
          onClick={() => navigate('home')}
          className="absolute top-4 left-4 z-20 p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all flex items-center gap-1.5 text-xs font-bold backdrop-blur-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับหน้าหลัก</span>
        </button>

        {/* Left Side: Automotive Branding Panel */}
        <div className="md:col-span-5 bg-gradient-to-br from-[#0c3175] to-[#051124] p-8 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1486262715619-6708146bc45e?w=800&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="pt-10 relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl font-black text-white tracking-tight">
                {authConfig.brandNameTh || 'AUTOPARTS'}
                <span className="text-[#ea580c]">{authConfig.brandNameHighlight || 'PRO'}</span>
              </span>
            </div>

            <h1 className="text-2xl font-bold text-white tracking-tight leading-snug mb-3">
              {(lang === 'en' ? authConfig.titleEn : authConfig.titleTh) || 'เข้าสู่ระบบสมาชิก'}
            </h1>
            <p className="text-xs text-blue-200 leading-relaxed">
              {(lang === 'en' ? authConfig.subtitleEn : authConfig.subtitleTh) ||
                'เข้าสู่ระบบเพื่อรับสิทธิ์ราคาส่ง ตรวจสอบอะไหล่ตรงรุ่นด้วยเลขตัวถัง และดูประวัติการสั่งซื้อแบบ Real-time'}
            </p>
          </div>

          <div className="space-y-4 my-8 relative z-10">
            <div className="flex items-center gap-3 text-xs text-white/90 font-bold">
              <CheckCircle className="w-5 h-5 text-[#ea580c] shrink-0" />
              <span>{(lang === 'en' ? authConfig.benefit1En : authConfig.benefit1Th) || 'ราคาส่งพิเศษสำหรับอู่ซ่อมรถและร้านค้า'}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-white/90 font-bold">
              <CheckCircle className="w-5 h-5 text-[#ea580c] shrink-0" />
              <span>{(lang === 'en' ? authConfig.benefit2En : authConfig.benefit2Th) || 'เช็ครหัส OEM และความตรงรุ่น 100%'}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-white/90 font-bold">
              <CheckCircle className="w-5 h-5 text-[#ea580c] shrink-0" />
              <span>{(lang === 'en' ? authConfig.benefit3En : authConfig.benefit3Th) || 'ติดตามสถานะการจัดส่งพัสดุได้ตลอด 24 ชั่วโมง'}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 text-[11px] text-blue-300 relative z-10">
            {authConfig.copyrightText || '© 2026 AutoParts Pro Platform. All rights reserved.'}
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="md:col-span-7 p-8 sm:p-12 flex flex-col justify-center bg-white">
          <div className="mb-8 pt-6 sm:pt-0">
            <h2 className="text-2xl font-black text-[#0e1932] mb-1">ยินดีต้อนรับกลับมา</h2>
            <p className="text-sm text-slate-500 font-medium">กรอกอีเมลและรหัสผ่านเพื่อเข้าใช้งานบัญชีสมาชิก</p>
          </div>

          {loginSuccessMsg && (
            <div className="mb-4 bg-emerald-50 text-emerald-800 p-3.5 rounded-xl text-xs font-bold border border-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{loginSuccessMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="bg-rose-50 text-rose-600 p-3.5 rounded-xl text-xs font-bold border border-rose-100 flex items-center gap-2">
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#0e1932]">อีเมล (Email Address)</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] p-3.5 pl-11 rounded-xl text-sm text-slate-800 font-medium outline-none transition-all placeholder:text-slate-400"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-[#0e1932]">รหัสผ่าน (Password)</label>
                <button
                  type="button"
                  onClick={handleOpenForgotModal}
                  className="text-xs font-bold text-[#2563eb] hover:underline cursor-pointer"
                >
                  ลืมรหัสผ่าน?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] p-3.5 pl-11 pr-11 rounded-xl text-sm text-slate-800 font-medium outline-none transition-all placeholder:text-slate-400"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold py-3.5 px-4 rounded-xl shadow-md flex items-center justify-center gap-2 text-sm transition-all disabled:opacity-50 mt-4 cursor-pointer"
            >
              {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'} <ChevronRight className="w-4 h-4" />
            </button>
          </form>

          {/* Redirect Register */}
          <div className="mt-8 text-center border-t border-slate-100 pt-6">
            <p className="text-sm font-medium text-slate-500">
              ยังไม่มีบัญชีสมาชิก?{' '}
              <button
                onClick={() => navigate('register')}
                className="font-bold text-[#2563eb] hover:underline cursor-pointer"
              >
                สมัครสมาชิกใหม่ที่นี่
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100 relative space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#0c3175] flex items-center justify-center shrink-0">
                  <KeyRound className="w-5 h-5 text-[#0c3175]" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#0e1932]">
                    {forgotStep === 'EMAIL' && 'ลืมรหัสผ่าน (ขั้นตอนที่ 1/2)'}
                    {forgotStep === 'VERIFY' && 'ยืนยันและตั้งรหัสผ่าน (ขั้นตอนที่ 2/2)'}
                    {forgotStep === 'LINK_RESET' && 'ตั้งรหัสผ่านใหม่'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {forgotStep === 'EMAIL' && 'กรอกอีเมลเพื่อรับลิงก์รีเซ็ตและรหัส OTP'}
                    {forgotStep === 'VERIFY' && `ส่งไปยัง ${forgotEmail} เรียบร้อยแล้ว`}
                    {forgotStep === 'LINK_RESET' && `ยืนยันตัวตนสำเร็จสำหรับ ${forgotEmail}`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Step Progress Bar (when in standard wizard) */}
            {forgotStep !== 'LINK_RESET' && (
              <div className="flex items-center gap-2 pt-0.5">
                <div className={`flex-1 h-1.5 rounded-full transition-all ${forgotStep === 'EMAIL' ? 'bg-[#0c3175]' : 'bg-emerald-500'}`} />
                <div className={`flex-1 h-1.5 rounded-full transition-all ${forgotStep === 'VERIFY' ? 'bg-[#0c3175]' : 'bg-slate-200'}`} />
              </div>
            )}

            {/* Error Message */}
            {forgotError && (
              <div className="bg-rose-50 text-rose-700 p-3 rounded-xl text-xs font-semibold border border-rose-200 flex items-start gap-2 animate-in fade-in">
                <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span className="flex-1">{forgotError}</span>
              </div>
            )}

            {/* Success Message */}
            {forgotSuccess && forgotStep !== 'VERIFY' && (
              <div className="bg-emerald-50 text-emerald-800 p-3 rounded-xl text-xs font-semibold border border-emerald-200 flex items-start gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="flex-1">{forgotSuccess}</span>
              </div>
            )}

            {/* ========================================================
                STEP 1: ENTER EMAIL TO RECEIVE RESET LINK & OTP
               ======================================================== */}
            {forgotStep === 'EMAIL' && (
              <form onSubmit={handleSendForgotOtp} className="space-y-4">
                <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4 text-xs text-slate-600 leading-relaxed">
                  <div className="font-bold text-[#0c3175] flex items-center gap-1.5 mb-1 text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>วิธีรีเซ็ตรหัสผ่านที่สะดวกรวดเร็ว</span>
                  </div>
                  ระบุอีเมลบัญชีของคุณ ระบบจะจัดส่ง <strong>ลิงก์สำหรับคลิกตั้งรหัสใหม่ทันที</strong> พร้อมรหัสยืนยัน OTP ไปยังอีเมล
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    อีเมลบัญชีของคุณ
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#0c3175] focus:bg-white text-xs font-medium pl-10 pr-3.5 py-3 rounded-xl outline-none transition-all"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading || !forgotEmail.trim()}
                    className="flex-1 py-3 rounded-xl bg-[#0c3175] hover:bg-[#133e8d] text-white font-bold text-xs shadow-md transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {forgotLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>กำลังส่งข้อมูล...</span>
                      </>
                    ) : (
                      <>
                        <span>ส่งลิงก์และรหัสยืนยัน</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* ========================================================
                STEP 2: VERIFICATION & SET NEW PASSWORD
               ======================================================== */}
            {forgotStep === 'VERIFY' && (
              <div className="space-y-4">
                {/* Destination Pill & Change Email */}
                <div className="flex items-center justify-between bg-slate-100/90 px-3.5 py-2.5 rounded-xl text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-slate-500 font-medium shrink-0">ส่งไปยัง:</span>
                    <span className="font-bold text-slate-800 truncate">{forgotEmail}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotStep('EMAIL');
                      setForgotError('');
                    }}
                    className="text-xs font-bold text-[#2563eb] hover:underline shrink-0 ml-2 cursor-pointer"
                  >
                    เปลี่ยนอีเมล
                  </button>
                </div>

                {/* Method Tabs */}
                <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl gap-1">
                  <button
                    type="button"
                    onClick={() => setVerifyTab('LINK')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      verifyTab === 'LINK'
                        ? 'bg-white text-[#0c3175] shadow-xs'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5 text-[#0c3175]" />
                    <span>1. คลิกลิงก์ในอีเมล</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setVerifyTab('OTP')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      verifyTab === 'OTP'
                        ? 'bg-white text-[#0c3175] shadow-xs'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <KeyRound className="w-3.5 h-3.5 text-[#ea580c]" />
                    <span>2. กรอกรหัส OTP ในนี้</span>
                  </button>
                </div>

                {/* Tab 1: Magic Link in Email (Recommended) */}
                {verifyTab === 'LINK' && (
                  <div className="space-y-3.5 pt-1">
                    <div className="border border-blue-100 bg-linear-to-b from-blue-50/60 to-white rounded-2xl p-5 text-center space-y-3">
                      <div className="w-12 h-12 mx-auto rounded-full bg-blue-100 text-[#0c3175] flex items-center justify-center shadow-2xs">
                        <Mail className="w-6 h-6 text-[#0c3175]" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 mb-1">
                          เปิดอีเมลเพื่อตั้งรหัสผ่านใหม่ทันที
                        </h4>
                        <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                          เราได้จัดส่งอีเมลไปยัง <strong>{forgotEmail}</strong> เรียบร้อยแล้ว ให้คุณเปิดกล่องจดหมายแล้วคลิกปุ่ม <strong>"คลิกที่นี่เพื่อตั้งรหัสผ่านใหม่"</strong> เพื่อตั้งรหัสได้ทันทีโดยไม่ต้องจำรหัส OTP
                        </p>
                      </div>

                      {/* Dev simulation button (hidden in production) */}
                      {forgotResetUrl && !import.meta.env.PROD && (
                        <div className="pt-2 border-t border-blue-100/70">
                          <button
                            type="button"
                            onClick={() => {
                              setForgotStep('LINK_RESET');
                              setForgotError('');
                              setForgotSuccess('เข้าสู่โหมดตั้งรหัสผ่านใหม่เรียบร้อยแล้ว');
                            }}
                            className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                            title="คลิกเพื่อจำลองการเปิดลิงก์จากอีเมล"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>เปิดลิงก์จำลองเพื่อตั้งรหัสใหม่ทันที (Dev Mode)</span>
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1 text-xs">
                      <button
                        type="button"
                        onClick={() => setVerifyTab('OTP')}
                        className="text-slate-600 hover:text-[#0c3175] font-semibold underline underline-offset-2 cursor-pointer"
                      >
                        ไม่ได้เปิดอีเมลในเครื่องนี้? กรอกรหัส OTP แทน
                      </button>
                      <button
                        type="button"
                        onClick={handleSendForgotOtp}
                        disabled={forgotLoading || forgotCooldown > 0}
                        className="text-[#2563eb] hover:underline font-bold disabled:opacity-40 cursor-pointer"
                      >
                        {forgotCooldown > 0 ? `ส่งใหม่อีกครั้ง (${forgotCooldown}s)` : 'ส่งอีเมลอีกครั้ง'}
                      </button>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setShowForgotModal(false)}
                        className="w-full py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        ปิดหน้าต่าง
                      </button>
                    </div>
                  </div>
                )}

                {/* Tab 2: Enter OTP Code + New Password */}
                {verifyTab === 'OTP' && (
                  <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5 pt-1">
                    {/* OTP Input */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-700">
                          รหัสยืนยัน OTP (6 หลักจากอีเมล)
                        </label>
                        <button
                          type="button"
                          onClick={handleSendForgotOtp}
                          disabled={forgotLoading || forgotCooldown > 0}
                          className="text-[11px] font-bold text-[#2563eb] hover:underline disabled:opacity-40 cursor-pointer"
                        >
                          {forgotCooldown > 0 ? `ขอรหัสใหม่ (${forgotCooldown}s)` : 'ขอรหัสใหม่'}
                        </button>
                      </div>
                      <input
                        type="text"
                        maxLength={6}
                        value={forgotOtp}
                        onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                        placeholder="เช่น 123456"
                        className="w-full bg-slate-50 border border-slate-200 focus:border-[#0c3175] focus:bg-white text-center font-mono font-bold tracking-widest text-lg py-2.5 rounded-xl outline-none text-[#0c3175]"
                        required
                        autoFocus
                      />
                      {forgotDebugCode && !import.meta.env.PROD && (
                        <div className="mt-1 flex items-center gap-1.5 justify-center">
                          <span className="text-[10px] text-slate-500 font-medium">รหัสทดสอบ:</span>
                          <button
                            type="button"
                            onClick={() => setForgotOtp(forgotDebugCode)}
                            className="text-[11px] font-mono font-black text-emerald-700 underline cursor-pointer"
                          >
                            {forgotDebugCode} (คลิกเพื่อใส่)
                          </button>
                        </div>
                      )}
                    </div>

                    {/* New Password */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        รหัสผ่านใหม่ (อย่างน้อย 8 ตัวอักษร)
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type={showForgotPass ? 'text' : 'password'}
                          value={forgotNewPassword}
                          onChange={(e) => setForgotNewPassword(e.target.value)}
                          placeholder="••••••••"
                          minLength={8}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-[#0c3175] focus:bg-white text-xs font-medium pl-9 pr-9 py-2.5 rounded-xl outline-none"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowForgotPass(!showForgotPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showForgotPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        ยืนยันรหัสผ่านใหม่อีกครั้ง
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type={showForgotConfirmPass ? 'text' : 'password'}
                          value={forgotConfirmPassword}
                          onChange={(e) => setForgotConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          minLength={8}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-[#0c3175] focus:bg-white text-xs font-medium pl-9 pr-9 py-2.5 rounded-xl outline-none"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowForgotConfirmPass(!showForgotConfirmPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showForgotConfirmPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowForgotModal(false)}
                        className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                      >
                        ยกเลิก
                      </button>
                      <button
                        type="submit"
                        disabled={forgotLoading}
                        className="flex-1 py-3 rounded-xl bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold text-xs shadow-md transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        {forgotLoading ? 'กำลังบันทึก...' : 'บันทึกรหัสผ่านใหม่'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* ========================================================
                STATE 3: DIRECT SET NEW PASSWORD (VIA MAGIC LINK)
               ======================================================== */}
            {forgotStep === 'LINK_RESET' && (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="text-xs">
                    <div className="font-bold text-emerald-900 mb-0.5">ยืนยันตัวตนผ่านลิงก์สำเร็จ</div>
                    <div className="text-emerald-700 leading-relaxed">
                      กำลังตั้งรหัสผ่านใหม่สำหรับบัญชี: <strong>{forgotEmail}</strong> (ไม่ต้องกรอกรหัส OTP)
                    </div>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    รหัสผ่านใหม่ (อย่างน้อย 8 ตัวอักษร)
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showForgotPass ? 'text' : 'password'}
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      placeholder="••••••••"
                      minLength={8}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#0c3175] focus:bg-white text-xs font-medium pl-9 pr-9 py-2.5 rounded-xl outline-none"
                      required
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowForgotPass(!showForgotPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showForgotPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    ยืนยันรหัสผ่านใหม่อีกครั้ง
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showForgotConfirmPass ? 'text' : 'password'}
                      value={forgotConfirmPassword}
                      onChange={(e) => setForgotConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      minLength={8}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#0c3175] focus:bg-white text-xs font-medium pl-9 pr-9 py-2.5 rounded-xl outline-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowForgotConfirmPass(!showForgotConfirmPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showForgotConfirmPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="flex-1 py-3 rounded-xl bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold text-xs shadow-md transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {forgotLoading ? 'กำลังบันทึก...' : 'บันทึกรหัสผ่านใหม่'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
