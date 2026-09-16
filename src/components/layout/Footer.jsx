import React, { useState } from 'react';
import {
  Mail,
  Send,
  CheckCircle2,
  Smartphone,
  ChevronRight,
  Globe,
  Phone,
  Clock,
  ArrowRight
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
    <footer className="bg-[#f8fafc] text-slate-800 font-sans relative overflow-hidden border-t border-slate-200 mt-12">
      {/* 1. Giant Signature Logo Banner across Footer: "Buy@Unimart" */}
      <div className="pt-12 pb-6 px-4 sm:px-6 lg:px-8 text-center relative select-none bg-gradient-to-b from-white to-slate-100/60">
        <h1 className="text-5xl sm:text-7xl lg:text-[130px] font-black text-[#0d3c90] tracking-tighter leading-none transition-transform hover:scale-[1.01] duration-500">
          Buy<span className="text-[#f97316]">@</span>Unimart
        </h1>
        <p className="text-xs sm:text-sm font-bold text-slate-500 mt-2 uppercase tracking-widest">
          Premium Auto Parts & High-Performance Hardware Catalog
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        {/* 2. Controls & Social Icons Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-200">
          {/* Social Icons */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-500 mr-2">In direct view:</span>
            {/* Facebook */}
            <button
              className="w-9 h-9 rounded-full bg-slate-200 hover:bg-[#0d3c90] hover:text-white text-slate-700 flex items-center justify-center transition-all duration-200 shadow-xs"
              title="Facebook"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
              </svg>
            </button>
            {/* Twitter */}
            <button
              className="w-9 h-9 rounded-full bg-slate-200 hover:bg-[#0d3c90] hover:text-white text-slate-700 flex items-center justify-center transition-all duration-200 shadow-xs"
              title="Twitter"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </button>
            {/* Instagram */}
            <button
              className="w-9 h-9 rounded-full bg-slate-200 hover:bg-[#0d3c90] hover:text-white text-slate-700 flex items-center justify-center transition-all duration-200 shadow-xs"
              title="Instagram"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </button>
          </div>

          {/* Payment Method Badges */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-xs font-bold text-slate-500 mr-2">Payment list:</span>
            <span className="bg-[#0d3c90] text-white px-2.5 py-1 rounded text-[10px] font-mono font-bold">VISA</span>
            <span className="bg-[#0d3c90] text-white px-2.5 py-1 rounded text-[10px] font-mono font-bold">MASTER</span>
            <span className="bg-[#0d3c90] text-white px-2.5 py-1 rounded text-[10px] font-mono font-bold">PAYPAL</span>
            <span className="bg-[#0d3c90] text-white px-2.5 py-1 rounded text-[10px] font-mono font-bold">AMEX</span>
            <span className="bg-[#0d3c90] text-white px-2.5 py-1 rounded text-[10px] font-mono font-bold">APPLE PAY</span>
            <span className="bg-[#0d3c90] text-white px-2.5 py-1 rounded text-[10px] font-mono font-bold">STRIPE</span>
          </div>
        </div>

        {/* 3. 4-Column Navigation Links Grid */}
        <div className="py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-xs">
          {/* Col 1: Community */}
          <div>
            <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider mb-3">
              Community
            </h4>
            <ul className="space-y-2 text-slate-600">
              <li><button onClick={() => navigate?.('home')} className="hover:text-[#0d3c90] transition-colors text-left">About us</button></li>
              <li><button onClick={() => navigate?.('home')} className="hover:text-[#0d3c90] transition-colors text-left">Community forum</button></li>
              <li><button onClick={() => navigate?.('home')} className="hover:text-[#0d3c90] transition-colors text-left">Careers</button></li>
              <li><button onClick={() => navigate?.('home')} className="hover:text-[#0d3c90] transition-colors text-left">Affiliate program</button></li>
              <li><button onClick={() => navigate?.('home')} className="hover:text-[#0d3c90] transition-colors text-left">Press & media</button></li>
            </ul>
          </div>

          {/* Col 2: Download & Links */}
          <div>
            <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider mb-3">
              Download and links
            </h4>
            <ul className="space-y-2 text-slate-600">
              <li><button onClick={() => navigate?.('product-list')} className="hover:text-[#0d3c90] transition-colors text-left">Mobile Apps</button></li>
              <li><button onClick={() => navigate?.('home')} className="hover:text-[#0d3c90] transition-colors text-left">Brand assets</button></li>
              <li><button onClick={() => navigate?.('home')} className="hover:text-[#0d3c90] transition-colors text-left">Catalog PDF</button></li>
              <li><button onClick={() => navigate?.('home')} className="hover:text-[#0d3c90] transition-colors text-left">API documentation</button></li>
              <li><button onClick={() => navigate?.('home')} className="hover:text-[#0d3c90] transition-colors text-left">Fitment database</button></li>
            </ul>
          </div>

          {/* Col 3: User Guide */}
          <div>
            <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider mb-3">
              User guide
            </h4>
            <ul className="space-y-2 text-slate-600">
              <li><button onClick={() => navigate?.('home')} className="hover:text-[#0d3c90] transition-colors text-left">Order tracking</button></li>
              <li><button onClick={() => navigate?.('home')} className="hover:text-[#0d3c90] transition-colors text-left">Returns & Exchanges</button></li>
              <li><button onClick={() => navigate?.('home')} className="hover:text-[#0d3c90] transition-colors text-left">Shipping rates & policies</button></li>
              <li><button onClick={() => navigate?.('home')} className="hover:text-[#0d3c90] transition-colors text-left">Warranty & guarantee</button></li>
              <li><button onClick={() => navigate?.('home')} className="hover:text-[#0d3c90] transition-colors text-left">Contact support</button></li>
            </ul>
          </div>

          {/* Col 4: Newsletter & Mobile App Badges */}
          <div>
            <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider mb-3">
              Stream with us
            </h4>
            <p className="text-[11px] text-slate-500 mb-3">
              Subscribe for weekly deals, coupon codes & exclusive product releases.
            </p>

            {subscribed ? (
              <div className="text-xs bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl text-emerald-800 font-semibold mb-3">
                ✓ Thanks for subscribing to Buy@Unimart!
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex items-center gap-1 mb-4">
                <input
                  type="email"
                  required
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-full bg-white border border-slate-300 text-slate-800 text-xs focus:outline-none focus:border-[#0d3c90]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#f97316] hover:bg-[#ea580c] text-white font-bold rounded-full text-xs transition-colors shadow-sm shrink-0"
                >
                  Buy now
                </button>
              </form>
            )}

            {/* Mobile App Downloads */}
            <div className="flex items-center gap-2 pt-2">
              <button className="flex items-center gap-2 bg-slate-900 text-white px-3 py-1.5 rounded-xl text-[10px] font-bold hover:bg-[#0d3c90] transition-colors">
                <Smartphone className="w-4 h-4" />
                <span>App Store</span>
              </button>
              <button className="flex items-center gap-2 bg-slate-900 text-white px-3 py-1.5 rounded-xl text-[10px] font-bold hover:bg-[#0d3c90] transition-colors">
                <Smartphone className="w-4 h-4" />
                <span>Google Play</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4. Bottom Copyright Bar */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            Copyright © {new Date().getFullYear()} <strong className="text-[#0d3c90]">Buy@Unimart</strong>. All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <button onClick={() => navigate?.('home')} className="hover:text-[#0d3c90]">Privacy</button>
            <span>•</span>
            <button onClick={() => navigate?.('home')} className="hover:text-[#0d3c90]">Terms of Service</button>
            <span>•</span>
            <button onClick={() => navigate?.('home')} className="hover:text-[#0d3c90]">Cookies</button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
