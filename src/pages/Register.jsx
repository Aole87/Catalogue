import React, { useState } from 'react';
import { User, Phone, Briefcase, Mail, Lock, ChevronRight, ArrowLeft } from 'lucide-react';
import ApiClient from '../utils/ApiClient';

const Register = ({ navigate }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    business_name: '',
    business_type: 'General',
    email: '',
    password: ''
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await ApiClient.register({
        email: formData.email,
        password: formData.password,
        firstName: formData.first_name,
        lastName: formData.last_name,
        phone: formData.phone,
        companyName: formData.business_name,
        customerType: formData.business_type === 'Garage' ? 'GARAGE' : 'CUSTOMER',
      });
      setSuccess(true);
      setTimeout(() => navigate('login'), 3000);
    } catch (err) {
      setError(err.message || 'Error registering user');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F7F9] p-4 sm:p-6">
        <div className="bg-white p-6 md:p-12 rounded-[24px] md:rounded-[32px] shadow-2xl text-center max-w-md">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <ChevronRight className="w-8 h-8 md:w-10 md:h-10 rotate-[-90deg]" />
          </div>
          <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-4">Registration Successful!</h2>
          <p className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-widest leading-relaxed">We've sent a verification email. Please check your inbox before logging in.</p>
          <div className="mt-8 pt-8 border-t">
            <div className="flex items-center justify-center gap-2 text-primary font-black text-xs uppercase tracking-widest animate-pulse">
              Redirecting to login...
            </div>
          </div>
        </div>
      </div>
    );
  }

  const InputField = ({ label, icon: Icon, type = "text", placeholder, value, onChange, required = true }) => (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">{label}</label>
      <div className="relative">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
        <input
          type={type}
          placeholder={placeholder}
          className="w-full bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white p-4 pl-12 rounded-2xl outline-none font-bold transition-all"
          value={value}
          onChange={onChange}
          required={required}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f4f6fb] py-10 md:py-16 px-4 sm:px-6 flex items-center justify-center font-sans">
      <div className="bg-white w-full max-w-3xl p-6 sm:p-10 md:p-12 rounded-[32px] shadow-2xl shadow-blue-950/5 relative overflow-hidden border border-slate-100">
        <button
          onClick={() => navigate('login')}
          className="absolute top-6 left-6 p-2 rounded-full text-slate-400 hover:text-[#215ada] hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center mb-10 pt-4">
          <div className="text-3xl font-black text-[#215ada] tracking-tight mb-2">UNIMART</div>
          <h2 className="text-2xl font-black text-[#0e1932] mb-1">Create New Account</h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Join our verified customer & garage network</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl text-xs font-bold text-center border border-rose-100 animate-shake">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <InputField
              label="First Name" icon={User} placeholder="John"
              value={formData.first_name}
              onChange={e => setFormData({ ...formData, first_name: e.target.value })}
            />
            <InputField
              label="Last Name" icon={User} placeholder="Doe"
              value={formData.last_name}
              onChange={e => setFormData({ ...formData, last_name: e.target.value })}
            />
            <InputField
              label="Phone Number" icon={Phone} placeholder="0812345678"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
            />
            <InputField
              label="Company / Garage Name (Optional)" icon={Briefcase} placeholder="Auto Garage"
              value={formData.business_name}
              onChange={e => setFormData({ ...formData, business_name: e.target.value })}
              required={false}
            />
            <InputField
              label="Email Address" icon={Mail} type="email" placeholder="you@example.com"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
            <InputField
              label="Password" icon={Lock} type="password" placeholder="••••••••"
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1">Account Type</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, business_type: 'General' })}
                className={`py-3 px-4 rounded-2xl text-xs font-bold transition-all border ${
                  formData.business_type === 'General'
                    ? 'bg-[#215ada] text-white border-[#215ada] shadow-md shadow-blue-600/20'
                    : 'bg-[#f8fafc] text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Individual Customer
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, business_type: 'Garage' })}
                className={`py-3 px-4 rounded-2xl text-xs font-bold transition-all border ${
                  formData.business_type === 'Garage'
                    ? 'bg-[#215ada] text-white border-[#215ada] shadow-md shadow-blue-600/20'
                    : 'bg-[#f8fafc] text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Garage / Workshop Member
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#215ada] hover:bg-[#163d94] text-white font-bold py-4 rounded-full shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 text-xs uppercase tracking-wider transition-all disabled:opacity-50"
          >
            {isLoading ? 'Creating Account...' : 'Complete Registration'} <ChevronRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-xs font-semibold text-slate-500">
            Already have an account?{' '}
            <button
              onClick={() => navigate('login')}
              className="font-bold text-[#215ada] hover:underline"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
