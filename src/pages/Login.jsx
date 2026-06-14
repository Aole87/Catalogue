import React, { useState } from 'react';
import { Mail, Lock, ChevronRight, ArrowLeft } from 'lucide-react';

const Login = ({ navigate, setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      if (window.electronAPI && typeof window.electronAPI.query === 'function') {
        const users = await window.electronAPI.query(
          'SELECT * FROM users WHERE email = ? AND password = ?',
          [email, password]
        );
        if (users.length > 0) {
          setUser(users[0]);
          navigate('home');
        } else {
          setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
        }
      } else {
        // Fallback for web browser: log in as a mock garage user
        setUser({
          id: 1,
          first_name: 'เดชา',
          last_name: 'รักดี',
          email: email,
          business_type: 'Garage'
        });
        navigate('home');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F7F9] p-4 sm:p-6">
      <div className="bg-white p-6 md:p-12 rounded-[24px] md:rounded-[32px] shadow-2xl shadow-primary/5 w-full max-w-lg relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-secondary/5 rounded-full -ml-12 -mb-12"></div>

        <button
          onClick={() => navigate('home')}
          className="absolute top-8 left-8 p-2 text-gray-400 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center mb-12">
          <div className="text-4xl font-black text-primary italic tracking-tighter mb-4">MOBEX</div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Welcome Back!</h2>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Sign in to your account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-500 p-4 rounded-2xl text-xs font-bold text-center border border-red-100 animate-shake">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
              <input
                type="email"
                placeholder="example@mail.com"
                className="w-full bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white p-4 pl-12 rounded-2xl outline-none font-bold transition-all"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center px-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Password</label>
              <button type="button" className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Forgot?</button>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white p-4 pl-12 rounded-2xl outline-none font-bold transition-all"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-2 px-2">
            <input type="checkbox" id="remember" className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" />
            <label htmlFor="remember" className="text-xs font-bold text-gray-500">Keep me signed in</label>
          </div>

          <button type="submit" className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 uppercase tracking-widest text-sm">
            Sign In <ChevronRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-12 text-center">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Don't have an account?
            <button
              onClick={() => navigate('register')}
              className="text-primary ml-2 hover:underline"
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
