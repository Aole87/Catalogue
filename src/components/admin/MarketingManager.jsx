import React, { useState, useEffect } from 'react';
import {
  Tag,
  Percent,
  Ticket,
  Award,
  Megaphone,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  Eye,
  CheckCircle,
  AlertCircle,
  Clock,
  Calendar,
  DollarSign,
  Users,
  Search,
  X,
  PlusCircle,
  ArrowUpRight,
  TrendingUp,
  Sliders
} from 'lucide-react';
import ApiClient from '../../utils/apiClient';
import MemberManager from './MemberManager';

export default function MarketingManager() {
  const [activeSubTab, setActiveSubTab] = useState('promotions'); // 'promotions', 'coupons', 'loyalty', 'campaigns'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Promotions State
  const [promotions, setPromotions] = useState([]);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [promoForm, setPromoForm] = useState({
    name: '',
    description: '',
    type: 'PERCENTAGE',
    discountValue: 10,
    minOrderAmount: 0,
    maxDiscountAmount: 500,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    isActive: true,
  });

  // Coupons State
  const [coupons, setCoupons] = useState([]);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: '',
    promotionId: '',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    minOrderAmount: 0,
    maxDiscountAmount: 500,
    usageLimit: 100,
    perCustomerLimit: 1,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    isActive: true,
  });

  // Loyalty Accounts & Ledger State
  const [loyaltyAccounts, setLoyaltyAccounts] = useState([]);
  const [loyaltyLedger, setLoyaltyLedger] = useState([]);
  const [selectedLoyaltyUser, setSelectedLoyaltyUser] = useState(null);
  const [showLoyaltyAdjustModal, setShowLoyaltyAdjustModal] = useState(false);
  const [loyaltyAdjustForm, setLoyaltyAdjustForm] = useState({
    points: 100,
    type: 'STAFF_ADJUSTMENT',
    reason: 'VIP Promotion Goodwill',
  });

  // Campaigns State
  const [campaigns, setCampaigns] = useState([]);
  const [segments, setSegments] = useState([]);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    type: 'SEASONAL',
    channel: 'EMAIL',
    targetSegmentId: '',
    budget: 5000,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
  });

  // Fetch Promotions
  const fetchPromotions = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await ApiClient.getAdminPromotions();
      if (res?.data && res.data.length > 0) {
        setPromotions(res.data);
        return;
      }
    } catch (err) {
      console.warn('API fetch promotions fallback to local:', err.message);
    } finally {
      setLoading(false);
    }

    // Local fallback
    const saved = localStorage.getItem('mobex_admin_promotions');
    if (saved) {
      try {
        setPromotions(JSON.parse(saved));
        return;
      } catch (e) {}
    }
    const defaultPromos = [
      { id: 'promo-1', name: 'เปิดตัวศูนย์บริการอะไหล่แท้ ลดทันที 10%', type: 'PERCENTAGE', discountValue: 10, minOrderAmount: 1000, maxDiscountAmount: 500, startDate: '2026-09-01', endDate: '2026-10-31', isActive: true },
      { id: 'promo-2', name: 'ส่วนลดพิเศษลูกค้าอู่ซ่อมรถ ลด 15%', type: 'PERCENTAGE', discountValue: 15, minOrderAmount: 3000, maxDiscountAmount: 1500, startDate: '2026-09-10', endDate: '2026-12-31', isActive: true },
    ];
    setPromotions(defaultPromos);
    localStorage.setItem('mobex_admin_promotions', JSON.stringify(defaultPromos));
  };

  // Fetch Coupons
  const fetchCoupons = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await ApiClient.getAdminCoupons();
      if (res?.data && res.data.length > 0) {
        setCoupons(res.data);
        return;
      }
    } catch (err) {
      console.warn('API fetch coupons fallback to local:', err.message);
    } finally {
      setLoading(false);
    }

    const saved = localStorage.getItem('mobex_admin_coupons');
    if (saved) {
      try {
        setCoupons(JSON.parse(saved));
        return;
      } catch (e) {}
    }
    const defaultCoupons = [
      { id: 'cp-1', code: 'MOBEX10', discountType: 'PERCENTAGE', discountValue: 10, minOrderAmount: 500, maxDiscountAmount: 300, usageLimit: 200, usedCount: 14, isActive: true },
      { id: 'cp-2', code: 'GARAGEVIP', discountType: 'FIXED_AMOUNT', discountValue: 200, minOrderAmount: 2000, usageLimit: 50, usedCount: 8, isActive: true },
    ];
    setCoupons(defaultCoupons);
    localStorage.setItem('mobex_admin_coupons', JSON.stringify(defaultCoupons));
  };

  // Fetch Loyalty Accounts
  const fetchLoyaltyAccounts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await ApiClient.getAdminLoyaltyAccounts();
      if (res?.data && res.data.length > 0) {
        setLoyaltyAccounts(res.data);
        return;
      }
    } catch (err) {
      console.warn('API fetch loyalty fallback to local:', err.message);
    } finally {
      setLoading(false);
    }

    const saved = localStorage.getItem('mobex_admin_loyalty');
    if (saved) {
      try {
        setLoyaltyAccounts(JSON.parse(saved));
        return;
      } catch (e) {}
    }
    const defaultLoyalty = [
      { id: 'ly-1', userId: 'usr-1', points: 450, totalEarned: 1200, totalRedeemed: 750, user: { firstName: 'สมชาย', lastName: 'รักอะไหล่', email: 'somchai@garage.co.th' } },
      { id: 'ly-2', userId: 'usr-2', points: 980, totalEarned: 2400, totalRedeemed: 1420, user: { firstName: 'วิชัย', lastName: 'อู่ยนต์การช่าง', email: 'wichai@autoservice.com' } },
    ];
    setLoyaltyAccounts(defaultLoyalty);
    localStorage.setItem('mobex_admin_loyalty', JSON.stringify(defaultLoyalty));
  };

  // Fetch Campaigns & Segments
  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);
      const [campRes, segRes] = await Promise.all([
        ApiClient.getAdminCampaigns().catch(() => null),
        ApiClient.getAdminSegments().catch(() => null),
      ]);
      if (campRes?.data && campRes.data.length > 0) setCampaigns(campRes.data);
      if (segRes?.data && segRes.data.length > 0) setSegments(segRes.data);
      if (campRes?.data) return;
    } catch (err) {
      console.warn('API fetch campaigns fallback to local:', err.message);
    } finally {
      setLoading(false);
    }

    const saved = localStorage.getItem('mobex_admin_campaigns');
    if (saved) {
      try {
        setCampaigns(JSON.parse(saved));
        return;
      } catch (e) {}
    }
    const defaultCampaigns = [
      { id: 'cmp-1', name: 'แคมเปญอะไหล่ช่วงล่าง & เบรก ฤดูฝน', type: 'SEASONAL', channel: 'LINE_OA', status: 'ACTIVE', budget: 15000, startDate: '2026-09-01', endDate: '2026-10-31' },
      { id: 'cmp-2', name: 'ส่งเสริมการขายน้ำมันเครื่องสังเคราะห์แท้', type: 'FLASH_SALE', channel: 'FACEBOOK', status: 'DRAFT', budget: 8000, startDate: '2026-09-15', endDate: '2026-09-30' },
    ];
    setCampaigns(defaultCampaigns);
    localStorage.setItem('mobex_admin_campaigns', JSON.stringify(defaultCampaigns));
  };

  useEffect(() => {
    if (activeSubTab === 'promotions') fetchPromotions();
    else if (activeSubTab === 'coupons') {
      fetchCoupons();
      fetchPromotions();
    } else if (activeSubTab === 'loyalty') fetchLoyaltyAccounts();
    else if (activeSubTab === 'campaigns') fetchCampaigns();
  }, [activeSubTab]);

  // Handle Save Promotion
  const handleSavePromotion = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      await ApiClient.createAdminPromotion({
        ...promoForm,
        discountValue: Number(promoForm.discountValue),
        minOrderAmount: Number(promoForm.minOrderAmount || 0),
        maxDiscountAmount: promoForm.maxDiscountAmount ? Number(promoForm.maxDiscountAmount) : null,
      });
    } catch (err) {
      console.warn('API create promotion error, saving locally:', err.message);
    }

    // Always update state & localStorage
    const newPromo = {
      id: `promo-${Date.now()}`,
      ...promoForm,
      discountValue: Number(promoForm.discountValue),
      minOrderAmount: Number(promoForm.minOrderAmount || 0),
      maxDiscountAmount: promoForm.maxDiscountAmount ? Number(promoForm.maxDiscountAmount) : null,
      createdAt: new Date().toISOString(),
    };
    const updated = [newPromo, ...promotions];
    setPromotions(updated);
    localStorage.setItem('mobex_admin_promotions', JSON.stringify(updated));
    setSuccess('สร้างและบันทึกโปรโมชั่นสำเร็จเรียบร้อย');
    setTimeout(() => setSuccess(null), 3000);
    setShowPromoModal(false);
  };

  // Handle Save Coupon
  const handleSaveCoupon = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      await ApiClient.createAdminCoupon({
        ...couponForm,
        promotionId: couponForm.promotionId || undefined,
        discountValue: Number(couponForm.discountValue),
        minOrderAmount: Number(couponForm.minOrderAmount || 0),
        maxDiscountAmount: couponForm.maxDiscountAmount ? Number(couponForm.maxDiscountAmount) : null,
        usageLimit: Number(couponForm.usageLimit || 100),
        perCustomerLimit: Number(couponForm.perCustomerLimit || 1),
      });
    } catch (err) {
      console.warn('API create coupon error, saving locally:', err.message);
    }

    const newCoupon = {
      id: `cp-${Date.now()}`,
      ...couponForm,
      discountValue: Number(couponForm.discountValue),
      minOrderAmount: Number(couponForm.minOrderAmount || 0),
      maxDiscountAmount: couponForm.maxDiscountAmount ? Number(couponForm.maxDiscountAmount) : null,
      usageLimit: Number(couponForm.usageLimit || 100),
      usedCount: 0,
      createdAt: new Date().toISOString(),
    };
    const updated = [newCoupon, ...coupons];
    setCoupons(updated);
    localStorage.setItem('mobex_admin_coupons', JSON.stringify(updated));
    setSuccess('สร้างและบันทึกคูปองส่วนลดสำเร็จเรียบร้อย');
    setTimeout(() => setSuccess(null), 3000);
    setShowCouponModal(false);
  };

  // Handle Loyalty Adjust
  const handleLoyaltyAdjust = async (e) => {
    e.preventDefault();
    if (!selectedLoyaltyUser) return;
    try {
      setError(null);
      await ApiClient.adjustAdminLoyalty(selectedLoyaltyUser.userId, {
        points: Number(loyaltyAdjustForm.points),
        type: loyaltyAdjustForm.type,
        reason: loyaltyAdjustForm.reason,
      });
    } catch (err) {
      console.warn('API loyalty adjust error, saving locally:', err.message);
    }

    const updated = loyaltyAccounts.map(la => {
      if (la.userId === selectedLoyaltyUser.userId) {
        const added = Number(loyaltyAdjustForm.points || 0);
        return {
          ...la,
          points: Math.max(0, la.points + added),
          totalEarned: added > 0 ? la.totalEarned + added : la.totalEarned,
        };
      }
      return la;
    });
    setLoyaltyAccounts(updated);
    localStorage.setItem('mobex_admin_loyalty', JSON.stringify(updated));
    setSuccess('ปรับคะแนนสะสมเรียบร้อยแล้ว');
    setTimeout(() => setSuccess(null), 3000);
    setShowLoyaltyAdjustModal(false);
  };

  // Handle Save Campaign
  const handleSaveCampaign = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      await ApiClient.createAdminCampaign({
        ...campaignForm,
        budget: Number(campaignForm.budget || 0),
        targetSegmentId: campaignForm.targetSegmentId || undefined,
      });
    } catch (err) {
      console.warn('API create campaign error, saving locally:', err.message);
    }

    const newCamp = {
      id: `cmp-${Date.now()}`,
      ...campaignForm,
      budget: Number(campaignForm.budget || 0),
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };
    const updated = [newCamp, ...campaigns];
    setCampaigns(updated);
    localStorage.setItem('mobex_admin_campaigns', JSON.stringify(updated));
    setSuccess('สร้างและบันทึกแคมเปญสำเร็จเรียบร้อย');
    setTimeout(() => setSuccess(null), 3000);
    setShowCampaignModal(false);
  };

  // Handle Change Campaign Status
  const handleChangeCampaignStatus = async (id, status) => {
    try {
      await ApiClient.updateAdminCampaignStatus(id, status);
      setSuccess(`Campaign marked as ${status}`);
      fetchCampaigns();
    } catch (err) {
      setError(err.message || 'Failed to update campaign status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Alert Banners */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span className="flex-1">{success}</span>
          <button onClick={() => setSuccess(null)} className="text-emerald-500 hover:text-emerald-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('promotions')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
              activeSubTab === 'promotions'
                ? 'bg-[#0c2b2f] text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Percent className="w-4 h-4" />
            <span>Promotions ({promotions.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('coupons')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
              activeSubTab === 'coupons'
                ? 'bg-[#0c2b2f] text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Ticket className="w-4 h-4" />
            <span>Coupons ({coupons.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('loyalty')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
              activeSubTab === 'loyalty'
                ? 'bg-[#0c2b2f] text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Loyalty Ledger</span>
          </button>
          <button
            onClick={() => setActiveSubTab('campaigns')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
              activeSubTab === 'campaigns'
                ? 'bg-[#0c2b2f] text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            <span>Campaigns ({campaigns.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('members')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
              activeSubTab === 'members'
                ? 'bg-[#0c2b2f] text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>ข้อมูลสมาชิก & สิทธิ์ราคา (Members)</span>
          </button>
        </div>

        <div>
          {activeSubTab === 'promotions' && (
            <button
              onClick={() => setShowPromoModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#ff6b2b] hover:bg-[#ff5500] text-white rounded-xl text-sm font-semibold shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>New Promotion</span>
            </button>
          )}

          {activeSubTab === 'coupons' && (
            <button
              onClick={() => setShowCouponModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#ff6b2b] hover:bg-[#ff5500] text-white rounded-xl text-sm font-semibold shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>New Coupon</span>
            </button>
          )}

          {activeSubTab === 'campaigns' && (
            <button
              onClick={() => setShowCampaignModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#ff6b2b] hover:bg-[#ff5500] text-white rounded-xl text-sm font-semibold shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>New Campaign</span>
            </button>
          )}
        </div>
      </div>

      {/* Subtab 1: Promotions */}
      {activeSubTab === 'promotions' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="py-3 px-4">Promotion Name</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Discount</th>
                <th className="py-3 px-4">Min Order</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {promotions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-400">
                    No promotions found.
                  </td>
                </tr>
              ) : (
                promotions.map((p) => (
                  <tr key={p.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-gray-900">{p.name}</div>
                      <div className="text-xs text-gray-500">{p.description || '-'}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#0c2b2f]/10 text-[#0c2b2f]">
                        {p.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-[#0c2b2f]">
                      {p.type === 'PERCENTAGE' ? `${p.discountValue}%` : `฿${p.discountValue}`}
                    </td>
                    <td className="py-3 px-4 font-mono text-gray-700">
                      ฿{Number(p.minOrderAmount || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-500">
                      {new Date(p.startDate).toLocaleDateString()} - {new Date(p.endDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          p.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {p.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Subtab 2: Coupons */}
      {activeSubTab === 'coupons' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="py-3 px-4">Coupon Code</th>
                <th className="py-3 px-4">Discount</th>
                <th className="py-3 px-4">Usage Limit</th>
                <th className="py-3 px-4">Per Customer</th>
                <th className="py-3 px-4">Min Order</th>
                <th className="py-3 px-4">Validity</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-400">
                    No coupons found.
                  </td>
                </tr>
              ) : (
                coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-[#ff6b2b] bg-[#ff6b2b]/10 px-2.5 py-1 rounded-lg border border-[#ff6b2b]/30">
                        {c.code}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">
                      {c.discountType === 'PERCENTAGE' ? `${c.discountValue}%` : `฿${c.discountValue}`}
                    </td>
                    <td className="py-3 px-4 text-gray-700 font-mono">
                      {c.usedCount || 0} / {c.usageLimit || '∞'}
                    </td>
                    <td className="py-3 px-4 text-gray-700 font-mono">{c.perCustomerLimit || 1}</td>
                    <td className="py-3 px-4 font-mono text-gray-700">
                      ฿{Number(c.minOrderAmount || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-500">
                      {new Date(c.startDate).toLocaleDateString()} - {new Date(c.endDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          c.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {c.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Subtab 3: Loyalty Ledger */}
      {activeSubTab === 'loyalty' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h4 className="font-bold text-gray-900 text-sm">Customer Loyalty Balances</h4>
              <button
                onClick={fetchLoyaltyAccounts}
                className="p-1.5 text-gray-400 hover:text-[#0c2b2f] rounded-lg hover:bg-gray-100"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4 text-center">Points Balance</th>
                  <th className="py-3 px-4 text-center">Lifetime Earned</th>
                  <th className="py-3 px-4 text-center">Lifetime Redeemed</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {loyaltyAccounts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-400">
                      No loyalty accounts found.
                    </td>
                  </tr>
                ) : (
                  loyaltyAccounts.map((acc) => (
                    <tr key={acc.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-gray-900">
                          {acc.user?.first_name} {acc.user?.last_name}
                        </div>
                        <div className="text-xs text-gray-400 font-mono">{acc.user?.email}</div>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-amber-600 text-base">
                        {acc.balance} pts
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-emerald-600 font-semibold">
                        +{acc.lifetimeEarned || 0}
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-rose-600 font-semibold">
                        -{acc.lifetimeRedeemed || 0}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedLoyaltyUser(acc);
                            setShowLoyaltyAdjustModal(true);
                          }}
                          className="px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white rounded-lg text-xs font-semibold transition-all"
                        >
                          Adjust Points
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subtab 4: Campaigns */}
      {activeSubTab === 'campaigns' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.length === 0 ? (
            <div className="col-span-3 text-center py-12 bg-white rounded-2xl border border-gray-100 text-gray-400">
              No marketing campaigns created yet.
            </div>
          ) : (
            campaigns.map((camp) => (
              <div
                key={camp.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-gray-900 text-base">{camp.name}</h4>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        camp.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700'
                          : camp.status === 'SCHEDULED'
                          ? 'bg-blue-50 text-blue-700'
                          : camp.status === 'COMPLETED'
                          ? 'bg-purple-50 text-purple-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {camp.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                    <span className="font-semibold text-[#0c2b2f]">{camp.channel}</span>
                    <span>•</span>
                    <span>Budget: ฿{Number(camp.budget || 0).toLocaleString()}</span>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 space-y-1 text-xs">
                    <div className="text-gray-500">
                      Segment: <span className="font-semibold text-gray-800">{camp.segment?.name || 'All'}</span>
                    </div>
                    <div className="text-gray-500">
                      Dates: {new Date(camp.startDate).toLocaleDateString()} - {new Date(camp.endDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div className="text-xs text-gray-400">
                    Audiences: {camp.audiences?.length ?? camp._count?.audiences ?? 0}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {camp.status === 'DRAFT' && (
                      <button
                        onClick={() => handleChangeCampaignStatus(camp.id, 'ACTIVE')}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm"
                      >
                        Activate
                      </button>
                    )}
                    {camp.status === 'ACTIVE' && (
                      <button
                        onClick={() => handleChangeCampaignStatus(camp.id, 'COMPLETED')}
                        className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-sm"
                      >
                        Complete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Subtab 5: Members & Pricing Tiers */}
      {activeSubTab === 'members' && (
        <div className="pt-2">
          <MemberManager />
        </div>
      )}

      {/* New Promotion Modal */}
      {showPromoModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSavePromotion} className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-gray-900 text-lg">Create Promotion</h3>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Promotion Name</label>
              <input
                type="text"
                required
                value={promoForm.name}
                onChange={(e) => setPromoForm({ ...promoForm, name: e.target.value })}
                className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Rainy Season Brake Discount"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Discount Type</label>
                <select
                  value={promoForm.type}
                  onChange={(e) => setPromoForm({ ...promoForm, type: e.target.value })}
                  className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl"
                >
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED_AMOUNT">Fixed Amount (THB)</option>
                  <option value="FREE_SHIPPING">Free Shipping</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Discount Value</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={promoForm.discountValue}
                  onChange={(e) => setPromoForm({ ...promoForm, discountValue: e.target.value })}
                  className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Min Order Amount (THB)</label>
                <input
                  type="number"
                  min="0"
                  value={promoForm.minOrderAmount}
                  onChange={(e) => setPromoForm({ ...promoForm, minOrderAmount: e.target.value })}
                  className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Max Cap (THB)</label>
                <input
                  type="number"
                  min="0"
                  value={promoForm.maxDiscountAmount}
                  onChange={(e) => setPromoForm({ ...promoForm, maxDiscountAmount: e.target.value })}
                  className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Start Date</label>
                <input
                  type="date"
                  required
                  value={promoForm.startDate}
                  onChange={(e) => setPromoForm({ ...promoForm, startDate: e.target.value })}
                  className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">End Date</label>
                <input
                  type="date"
                  required
                  value={promoForm.endDate}
                  onChange={(e) => setPromoForm({ ...promoForm, endDate: e.target.value })}
                  className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowPromoModal(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-semibold bg-[#ff6b2b] hover:bg-[#e04b00] text-white rounded-xl shadow-md shadow-orange-950/20"
              >
                Create Promotion
              </button>
            </div>
          </form>
        </div>
      )}

      {/* New Coupon Modal */}
      {showCouponModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSaveCoupon} className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-gray-900 text-lg">Create Coupon Code</h3>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Coupon Code</label>
              <input
                type="text"
                required
                value={couponForm.code}
                onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                className="w-full p-2.5 text-sm font-mono uppercase bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. WELCOME10"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Discount Type</label>
                <select
                  value={couponForm.discountType}
                  onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value })}
                  className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl"
                >
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED_AMOUNT">Fixed Amount (THB)</option>
                  <option value="FREE_SHIPPING">Free Shipping</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Discount Value</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={couponForm.discountValue}
                  onChange={(e) => setCouponForm({ ...couponForm, discountValue: e.target.value })}
                  className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Total Usage Limit</label>
                <input
                  type="number"
                  min="1"
                  value={couponForm.usageLimit}
                  onChange={(e) => setCouponForm({ ...couponForm, usageLimit: e.target.value })}
                  className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Per-Customer Limit</label>
                <input
                  type="number"
                  min="1"
                  value={couponForm.perCustomerLimit}
                  onChange={(e) => setCouponForm({ ...couponForm, perCustomerLimit: e.target.value })}
                  className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Start Date</label>
                <input
                  type="date"
                  required
                  value={couponForm.startDate}
                  onChange={(e) => setCouponForm({ ...couponForm, startDate: e.target.value })}
                  className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">End Date</label>
                <input
                  type="date"
                  required
                  value={couponForm.endDate}
                  onChange={(e) => setCouponForm({ ...couponForm, endDate: e.target.value })}
                  className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCouponModal(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-semibold bg-[#ff6b2b] hover:bg-[#e04b00] text-white rounded-xl shadow-md shadow-orange-950/20"
              >
                Create Coupon
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Adjust Loyalty Modal */}
      {showLoyaltyAdjustModal && selectedLoyaltyUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleLoyaltyAdjust} className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-gray-900 text-lg">Adjust Loyalty Points</h3>
            <div className="text-xs text-gray-500">
              Customer: <span className="font-bold text-gray-800">{selectedLoyaltyUser.user?.first_name} {selectedLoyaltyUser.user?.last_name}</span> ({selectedLoyaltyUser.user?.email})
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Points Delta (Positive or Negative)</label>
              <input
                type="number"
                required
                value={loyaltyAdjustForm.points}
                onChange={(e) => setLoyaltyAdjustForm({ ...loyaltyAdjustForm, points: e.target.value })}
                className="w-full p-2.5 text-sm font-mono bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. 100 or -50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Reason / Notes</label>
              <textarea
                required
                value={loyaltyAdjustForm.reason}
                onChange={(e) => setLoyaltyAdjustForm({ ...loyaltyAdjustForm, reason: e.target.value })}
                className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl"
                rows={2}
                placeholder="Reason for adjustment..."
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowLoyaltyAdjustModal(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-semibold bg-[#ff6b2b] hover:bg-[#e04b00] text-white rounded-xl shadow-md shadow-orange-950/20"
              >
                Apply Adjustment
              </button>
            </div>
          </form>
        </div>
      )}

      {/* New Campaign Modal */}
      {showCampaignModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSaveCampaign} className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-gray-900 text-lg">Create Marketing Campaign</h3>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Campaign Name</label>
              <input
                type="text"
                required
                value={campaignForm.name}
                onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
                className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Songkran Brake Service Flash Sale"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Channel</label>
                <select
                  value={campaignForm.channel}
                  onChange={(e) => setCampaignForm({ ...campaignForm, channel: e.target.value })}
                  className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl"
                >
                  <option value="EMAIL">Email</option>
                  <option value="LINE">LINE Official</option>
                  <option value="SMS">SMS</option>
                  <option value="STORE_BANNER">Storefront Banner</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Target Segment</label>
                <select
                  value={campaignForm.targetSegmentId}
                  onChange={(e) => setCampaignForm({ ...campaignForm, targetSegmentId: e.target.value })}
                  className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl"
                >
                  <option value="">-- All Customers --</option>
                  {segments.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Budget (THB)</label>
                <input
                  type="number"
                  min="0"
                  value={campaignForm.budget}
                  onChange={(e) => setCampaignForm({ ...campaignForm, budget: e.target.value })}
                  className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Start Date</label>
                <input
                  type="date"
                  required
                  value={campaignForm.startDate}
                  onChange={(e) => setCampaignForm({ ...campaignForm, startDate: e.target.value })}
                  className="w-full p-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCampaignModal(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-semibold bg-[#ff6b2b] hover:bg-[#e04b00] text-white rounded-xl shadow-md shadow-orange-950/20"
              >
                Create Campaign
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
