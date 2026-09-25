import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ChevronRight, ArrowLeft, CheckCircle } from 'lucide-react';
import ApiClient from '../utils/apiClient';

const Login = ({ navigate, setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
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
              <span className="text-2xl font-black text-white tracking-tight">AUTOPARTS<span className="text-[#ea580c]">PRO</span></span>
            </div>

            <h1 className="text-2xl font-bold text-white tracking-tight leading-snug mb-3">
              เข้าสู่ระบบสมาชิก
            </h1>
            <p className="text-xs text-blue-200 leading-relaxed">
              เข้าสู่ระบบเพื่อรับสิทธิ์ราคาส่ง ตรวจสอบอะไหล่ตรงรุ่นด้วยเลขตัวถัง และดูประวัติการสั่งซื้อแบบ Real-time
            </p>
          </div>

          <div className="space-y-4 my-8 relative z-10">
            <div className="flex items-center gap-3 text-xs text-white/90 font-bold">
              <CheckCircle className="w-5 h-5 text-[#ea580c] shrink-0" />
              <span>ราคาส่งพิเศษสำหรับอู่ซ่อมรถและร้านค้า</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-white/90 font-bold">
              <CheckCircle className="w-5 h-5 text-[#ea580c] shrink-0" />
              <span>เช็ครหัส OEM และความตรงรุ่น 100%</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-white/90 font-bold">
              <CheckCircle className="w-5 h-5 text-[#ea580c] shrink-0" />
              <span>ติดตามสถานะการจัดส่งพัสดุได้ตลอด 24 ชั่วโมง</span>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 text-[11px] text-blue-300 relative z-10">
            © 2026 AutoParts Pro Platform. All rights reserved.
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="md:col-span-7 p-8 sm:p-12 flex flex-col justify-center bg-white">
          <div className="mb-8 pt-6 sm:pt-0">
            <h2 className="text-2xl font-black text-[#0e1932] mb-1">ยินดีต้อนรับกลับมา</h2>
            <p className="text-sm text-slate-500 font-medium">กรอกอีเมลและรหัสผ่านเพื่อเข้าใช้งานบัญชีสมาชิก</p>
          </div>

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
                <button type="button" className="text-xs font-bold text-[#2563eb] hover:underline">ลืมรหัสผ่าน?</button>
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
              className="w-full bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold py-3.5 px-4 rounded-xl shadow-md flex items-center justify-center gap-2 text-sm transition-all disabled:opacity-50 mt-4"
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
                className="font-bold text-[#2563eb] hover:underline"
              >
                สมัครสมาชิกใหม่ที่นี่
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
