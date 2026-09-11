import React, { useState } from 'react';
import {
  Mail,
  Send,
  CheckCircle2,
  Smartphone,
  ChevronRight,
  Globe,
  Phone,
  Clock
} from 'lucide-react';

export const Footer = ({ navigate }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-[#215ada] text-white font-sans relative overflow-hidden mt-12">
      {/* 1. Giant Watermark Across Top of Footer: "Buy@Unimart" */}
      <div className="pt-16 pb-8 px-4 sm:px-6 lg:px-8 text-center relative select-none">
        <h1 className="text-6xl sm:text-8xl lg:text-[140px] font-black text-white/15 tracking-tighter leading-none pointer-events-none">
          Buy@Unimart
        </h1>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 relative z-10">
        {/* 2. Top Controls Row: Social Circles (Left) & Payment Icons (Right) */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-12 border-b border-white/15">
          {/* Social Icons */}
          <div className="flex items-center gap-3">
            {/* Facebook */}
            <button
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white hover:text-[#215ada] text-white flex items-center justify-center transition-all duration-200 shadow-sm"
              title="Facebook"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
              </svg>
            </button>
            {/* Twitter / X */}
            <button
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white hover:text-[#215ada] text-white flex items-center justify-center transition-all duration-200 shadow-sm"
              title="Twitter"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </button>
            {/* Instagram */}
            <button
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white hover:text-[#215ada] text-white flex items-center justify-center transition-all duration-200 shadow-sm"
              title="Instagram"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </button>
            {/* YouTube */}
            <button
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white hover:text-[#215ada] text-white flex items-center justify-center transition-all duration-200 shadow-sm"
              title="YouTube"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </button>
            {/* LinkedIn */}
            <button
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white hover:text-[#215ada] text-white flex items-center justify-center transition-all duration-200 shadow-sm"
              title="LinkedIn"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </button>
          </div>

          {/* Payment Method Badges */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
            <span className="bg-white text-slate-800 px-3 py-1 rounded-md font-mono text-[11px] shadow-sm">PAYPAL</span>
            <span className="bg-white text-slate-800 px-3 py-1 rounded-md font-mono text-[11px] shadow-sm">VISA</span>
            <span className="bg-white text-slate-800 px-3 py-1 rounded-md font-mono text-[11px] shadow-sm">MASTERCARD</span>
            <span className="bg-white text-slate-800 px-3 py-1 rounded-md font-mono text-[11px] shadow-sm">AMEX</span>
            <span className="bg-white text-slate-800 px-3 py-1 rounded-md font-mono text-[11px] shadow-sm">APPLE PAY</span>
            <span className="bg-white text-slate-800 px-3 py-1 rounded-md font-mono text-[11px] shadow-sm">STRIPE</span>
          </div>
        </div>

        {/* 3. 5-Column Navigation Grid */}
        <div className="py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 text-xs">
          {/* Col 1: About Unimart */}
          <div>
            <h4 className="font-black text-sm text-white tracking-wider mb-4 uppercase">
              About Unimart
            </h4>
            <ul className="space-y-2.5 text-blue-100">
              <li><button onClick={() => navigate?.('home')} className="hover:text-white transition-colors text-left">About Us</button></li>
              <li><button onClick={() => navigate?.('home')} className="hover:text-white transition-colors text-left">Careers & Culture</button></li>
              <li><button onClick={() => navigate?.('home')} className="hover:text-white transition-colors text-left">Press & News</button></li>
              <li><button onClick={() => navigate?.('home')} className="hover:text-white transition-colors text-left">Contact Us</button></li>
              <li><button onClick={() => navigate?.('home')} className="hover:text-white transition-colors text-left">Terms & Conditions</button></li>
            </ul>
          </div>

          {/* Col 2: Customer Service */}
          <div>
            <h4 className="font-black text-sm text-white tracking-wider mb-4 uppercase">
              Customer Service
            </h4>
            <ul className="space-y-2.5 text-blue-100">
              <li><button onClick={() => navigate?.('home')} className="hover:text-white transition-colors text-left">Help Center</button></li>
              <li><button onClick={() => navigate?.('home')} className="hover:text-white transition-colors text-left">Returns & Refunds</button></li>
              <li><button onClick={() => navigate?.('my-orders')} className="hover:text-white transition-colors text-left">Track Order</button></li>
              <li><button onClick={() => navigate?.('home')} className="hover:text-white transition-colors text-left">Shipping Delivery</button></li>
              <li><button onClick={() => navigate?.('home')} className="hover:text-white transition-colors text-left">FAQs</button></li>
            </ul>
          </div>

          {/* Col 3: Quick Links */}
          <div>
            <h4 className="font-black text-sm text-white tracking-wider mb-4 uppercase">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-blue-100">
              <li><button onClick={() => navigate?.('product-list')} className="hover:text-white transition-colors text-left">Shop All</button></li>
              <li><button onClick={() => navigate?.('product-list', { filters: { featured: true } })} className="hover:text-white transition-colors text-left">Today's Deals</button></li>
              <li><button onClick={() => navigate?.('product-list')} className="hover:text-white transition-colors text-left">Featured Brands</button></li>
              <li><button onClick={() => navigate?.('home')} className="hover:text-white transition-colors text-left">Gift Cards</button></li>
              <li><button onClick={() => navigate?.('home')} className="hover:text-white transition-colors text-left">Affiliate Program</button></li>
            </ul>
          </div>

          {/* Col 4: Categories */}
          <div>
            <h4 className="font-black text-sm text-white tracking-wider mb-4 uppercase">
              Categories
            </h4>
            <ul className="space-y-2.5 text-blue-100">
              <li><button onClick={() => navigate?.('product-list', { filters: { category: 'brakes' } })} className="hover:text-white transition-colors text-left">Brakes & Rotors</button></li>
              <li><button onClick={() => navigate?.('product-list', { filters: { category: 'engine' } })} className="hover:text-white transition-colors text-left">Engine & Ignition</button></li>
              <li><button onClick={() => navigate?.('product-list', { filters: { category: 'fluids' } })} className="hover:text-white transition-colors text-left">Synthetic Oils & Fluids</button></li>
              <li><button onClick={() => navigate?.('product-list', { filters: { category: 'filters' } })} className="hover:text-white transition-colors text-left">Filters & Air Intake</button></li>
              <li><button onClick={() => navigate?.('product-list', { filters: { category: 'suspension' } })} className="hover:text-white transition-colors text-left">Suspension & Steering</button></li>
            </ul>
          </div>

          {/* Col 5: App Download & Newsletter */}
          <div>
            <h4 className="font-black text-sm text-white tracking-wider mb-4 uppercase">
              Download App & Subscribe
            </h4>

            {/* App Buttons */}
            <div className="flex flex-col gap-2 mb-4">
              <button className="flex items-center gap-2 bg-black/40 hover:bg-black/60 text-white p-2.5 rounded-xl border border-white/10 transition-colors text-left">
                <Smartphone className="w-5 h-5" />
                <div>
                  <div className="text-[9px] text-blue-200 leading-none">Download on the</div>
                  <div className="text-xs font-bold leading-tight">App Store</div>
                </div>
              </button>
              <button className="flex items-center gap-2 bg-black/40 hover:bg-black/60 text-white p-2.5 rounded-xl border border-white/10 transition-colors text-left">
                <Smartphone className="w-5 h-5" />
                <div>
                  <div className="text-[9px] text-blue-200 leading-none">GET IT ON</div>
                  <div className="text-xs font-bold leading-tight">Google Play</div>
                </div>
              </button>
            </div>

            {/* Newsletter Input */}
            <div className="mt-4">
              <div className="text-[11px] font-bold text-white mb-2">Subscribe to our newsletter</div>
              {subscribed ? (
                <div className="text-[11px] bg-emerald-900/60 border border-emerald-400/40 p-2 rounded-xl text-emerald-200">
                  Subscribed successfully!
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white text-slate-800 text-xs placeholder-slate-400 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="w-full py-2 bg-[#0e1932] hover:bg-black text-white font-bold rounded-xl text-xs transition-colors shadow-md"
                  >
                    Subscribe
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* 4. Bottom Copyright Row */}
        <div className="pt-8 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-blue-200">
          <div>
            Copyright © {new Date().getFullYear()} <strong className="text-white">Unimart</strong>. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate?.('home')} className="hover:text-white transition-colors">Privacy Policy</button>
            <span>•</span>
            <button onClick={() => navigate?.('home')} className="hover:text-white transition-colors">Terms of Service</button>
            <span>•</span>
            <button onClick={() => navigate?.('home')} className="hover:text-white transition-colors">Cookie Settings</button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
