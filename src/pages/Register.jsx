import React, { useState } from 'react';
import { User, Phone, Briefcase, Mail, Lock, ChevronRight, ArrowLeft } from 'lucide-react';

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (window.electronAPI && typeof window.electronAPI.query === 'function') {
        await window.electronAPI.query(
          'INSERT INTO users (first_name, last_name, phone, business_name, business_type, email, password) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [formData.first_name, formData.last_name, formData.phone, formData.business_name, formData.business_type, formData.email, formData.password]
        );
      }
      setSuccess(true);
      setTimeout(() => navigate('login'), 3000);
    } catch (err) {
      alert('Error registering user');
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
    <div className="min-h-screen bg-[#F4F7F9] py-10 md:py-20 px-4 sm:px-6 flex items-center justify-center">
      <div className="bg-white w-full max-w-3xl p-6 md:p-12 rounded-[24px] md:rounded-[40px] shadow-2xl shadow-primary/5 relative overflow-hidden">
        <button
          onClick={() => navigate('login')}
          className="absolute top-8 left-8 p-2 text-gray-400 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center mb-12">
          <div className="text-4xl font-black text-primary italic tracking-tighter mb-4">MOBEX</div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Create New Account</h2>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Join our community of experts</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="First Name" icon={User} placeholder="John"
              onChange={e => setFormData({ ...formData, first_name: e.target.value })}
            />
            <InputField
              label="Last Name" icon={User} placeholder="Doe"
              onChange={e => setFormData({ ...formData, last_name: e.target.value })}
            />
            <InputField
              label="Phone Number" icon={Phone} type="tel" placeholder="081-234-5678"
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
            />
            <InputField
              label="Business Name" icon={Briefcase} placeholder="Your Workshop Name"
              onChange={e => setFormData({ ...formData, business_name: e.target.value })}
            />
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Business Type</label>
              <select
                className="w-full bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white p-4 rounded-2xl outline-none font-bold transition-all appearance-none cursor-pointer"
                onChange={e => setFormData({ ...formData, business_type: e.target.value })}
              >
                <option value="General">ลูกค้าทั่วไป (General Customer)</option>
                <option value="Garage">อู่ซ่อมรถ (Garage)</option>
                <option value="Shop">ร้านค้าอะไหล่ (Auto Shop)</option>
              </select>
            </div>
            <InputField
              label="Email Address" icon={Mail} type="email" placeholder="john@example.com"
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
            <InputField
              label="Password" icon={Lock} type="password" placeholder="••••••••"
              onChange={e => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <div className="pt-4">
            <button type="submit" className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 uppercase tracking-widest text-sm">
              Register Now <ChevronRight className="w-4 h-4" />
            </button>
            <p className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-6">
              By clicking register, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
