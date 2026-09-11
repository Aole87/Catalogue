import React, { useState } from 'react';
import { Mail, Lock, ChevronRight, ArrowLeft } from 'lucide-react';
import ApiClient from '../utils/ApiClient';

const Login = ({ navigate, setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const res = await ApiClient.login(email, password);
      if (res && res.data && res.data.user) {
        if (setUser) setUser(res.data.user);
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
      <div className="bg-white p-6 sm:p-10 md:p-12 rounded-[32px] shadow-2xl shadow-blue-950/5 w-full max-w-lg relative overflow-hidden border border-slate-100">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#215ada]/5 rounded-full -mr-16 -mt-16 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#ff4c1a]/5 rounded-full -ml-12 -mb-12 pointer-events-none"></div>

        <button
          onClick={() => navigate('home')}
          className="absolute top-6 left-6 p-2 rounded-full text-slate-400 hover:text-[#215ada] hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center mb-10 pt-4">
          <div className="text-3xl font-black text-[#215ada] tracking-tight mb-2">UNIMART</div>
          <h2 className="text-2xl font-black text-[#0e1932] mb-1">Welcome Back!</h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sign in to your Unimart account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl text-xs font-bold text-center border border-rose-100 animate-shake">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full bg-[#f8fafc] border border-slate-200 focus:border-[#215ada] focus:bg-white p-3.5 pl-11 rounded-2xl text-xs font-semibold outline-none transition-all"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Password</label>
              <button type="button" className="text-[11px] font-bold text-[#215ada] hover:underline">Forgot?</button>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-[#f8fafc] border border-slate-200 focus:border-[#215ada] focus:bg-white p-3.5 pl-11 rounded-2xl text-xs font-semibold outline-none transition-all"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-2 px-1">
            <input type="checkbox" id="remember" className="w-4 h-4 rounded border-slate-300 text-[#215ada] focus:ring-[#215ada]" />
            <label htmlFor="remember" className="text-xs font-semibold text-slate-600">Keep me signed in</label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#215ada] hover:bg-[#163d94] text-white font-bold py-4 rounded-full shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 text-xs uppercase tracking-wider transition-all disabled:opacity-50"
          >
            {isLoading ? 'Signing In...' : 'Sign In'} <ChevronRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-xs font-semibold text-slate-500">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('register')}
              className="font-bold text-[#215ada] hover:underline"
            >
              Create Account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
