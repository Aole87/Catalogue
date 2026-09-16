import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ChevronRight, ArrowLeft, Shield, Wrench, UserCheck, CheckCircle, Sparkles } from 'lucide-react';
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

  const fillDemoAccount = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 sm:p-6 font-sans">
      <div className="w-full max-w-4xl bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 relative backdrop-blur-md">
        
        {/* Back Home Button */}
        <button
          onClick={() => navigate('home')}
          className="absolute top-4 left-4 z-20 p-2 rounded-lg bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition-all flex items-center gap-1.5 text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับหน้าหลัก</span>
        </button>

        {/* Left Side: Automotive Branding Panel */}
        <div className="md:col-span-5 bg-gradient-to-br from-teal-900 via-teal-950 to-slate-950 p-8 flex flex-col justify-between relative overflow-hidden border-b md:border-b-0 md:border-r border-slate-800">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="pt-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-teal-950">
                <span className="font-black text-white text-lg tracking-wider">AP</span>
              </div>
              <span className="text-xl font-black text-white tracking-wide">AUTOPARTS<span className="text-teal-400">PRO</span></span>
            </div>

            <h1 className="text-2xl font-bold text-white tracking-tight leading-snug mb-3">
              ศูนย์รวมอะไหล่รถยนต์ คุณภาพมาตรฐาน ราคาส่งอู่
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              เข้าสู่ระบบเพื่อรับสิทธิ์ราคาส่ง ตรวจสอบอะไหล่ตรงรุ่นด้วยเลขตัวถัง และดูประวัติการสั่งซื้อแบบ Real-time
            </p>
          </div>

          <div className="space-y-3 my-8">
            <div className="flex items-center gap-2.5 text-xs text-slate-200">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>ราคาส่งพิเศษสำหรับอู่ซ่อมรถและร้านค้า</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-200">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>เช็ครหัส OEM และความตรงรุ่น 100%</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-200">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>ติดตามสถานะการจัดส่งพัสดุได้ตลอด 24 ชั่วโมง</span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400">
            © 2026 AutoParts Pro Platform. All rights reserved.
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
          <div className="mb-6 pt-6 sm:pt-0">
            <h2 className="text-2xl font-bold text-white mb-1">เข้าสู่ระบบ (Sign In)</h2>
            <p className="text-xs text-slate-400">กรอกอีเมลและรหัสผ่านเพื่อเข้าใช้งานบัญชีสมาชิก</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-rose-950/60 text-rose-300 p-3.5 rounded-lg text-xs font-semibold border border-rose-800 flex items-center gap-2">
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">อีเมล (Email Address)</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 p-3 pl-10 rounded-lg text-xs text-white font-medium outline-none transition-all placeholder:text-slate-600"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-300">รหัสผ่าน (Password)</label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 p-3 pl-10 pr-10 rounded-lg text-xs text-white font-medium outline-none transition-all placeholder:text-slate-600"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg shadow-teal-950 flex items-center justify-center gap-2 text-xs uppercase tracking-wider transition-all disabled:opacity-50 mt-2"
            >
              {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'} <ChevronRight className="w-4 h-4" />
            </button>
          </form>

          {/* Demo Login Shortcuts */}
          <div className="mt-6 pt-6 border-t border-slate-800">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>ทดลองเข้าสู่ระบบด่วน (Quick Demo Accounts)</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => fillDemoAccount('customer@carparts.com', 'Customer123!')}
                className="p-2.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-200 text-left transition-all group"
              >
                <div className="flex items-center gap-1 text-[11px] font-bold text-teal-400">
                  <UserCheck className="w-3 h-3" /> ลูกค้าทั่วไป
                </div>
                <div className="text-[9px] text-slate-400 truncate">customer@carparts.com</div>
              </button>

              <button
                onClick={() => fillDemoAccount('garage@carparts.com', 'Garage123!')}
                className="p-2.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-200 text-left transition-all group"
              >
                <div className="flex items-center gap-1 text-[11px] font-bold text-amber-400">
                  <Wrench className="w-3 h-3" /> สมาชิกอู่ซ่อมรถ
                </div>
                <div className="text-[9px] text-slate-400 truncate">garage@carparts.com</div>
              </button>

              <button
                onClick={() => fillDemoAccount('admin@carparts.com', 'Admin123!')}
                className="p-2.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-200 text-left transition-all group"
              >
                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                  <Shield className="w-3 h-3" /> ผู้ดูแลระบบ
                </div>
                <div className="text-[9px] text-slate-400 truncate">admin@carparts.com</div>
              </button>
            </div>
          </div>

          {/* Redirect Register */}
          <div className="mt-6 text-center">
            <p className="text-xs text-slate-400">
              ยังไม่มีบัญชีสมาชิก?{' '}
              <button
                onClick={() => navigate('register')}
                className="font-bold text-teal-400 hover:text-teal-300 hover:underline"
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
