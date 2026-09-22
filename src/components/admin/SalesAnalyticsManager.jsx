import React, { useState } from 'react';
import {
  BarChart3, TrendingUp, TrendingDown, DollarSign, ShoppingBag,
  Users, Calendar, Download, Filter, ArrowUpRight, Award,
  Layers, CreditCard, ChevronRight, Package, Truck
} from 'lucide-react';

export default function SalesAnalyticsManager() {
  const [timeRange, setTimeRange] = useState('month'); // 'today', 'week', 'month', 'year'

  // Metric summaries
  const metrics = {
    totalRevenue: 842500,
    revenueGrowth: '+18.4%',
    totalOrders: 642,
    ordersGrowth: '+12.6%',
    aov: 1312.30,
    aovGrowth: '+5.2%',
    conversionRate: 3.42,
    conversionGrowth: '+0.8%',
  };

  // Top Selling Products Data
  const topProducts = [
    { rank: 1, name: 'Motul 8100 X-cess 5W-40 (4L)', sku: 'MOT-8100-4L', units: 148, revenue: 244200, growth: '+28%' },
    { rank: 2, name: 'ผ้าเบรกหน้า Brembo Ceramic Revo/Fortuner', sku: 'BRE-P83098N', units: 96, revenue: 177600, growth: '+15%' },
    { rank: 3, name: 'หัวเทียน Denso Iridium Tough (ชุด 4 หัว)', sku: 'DEN-IK20TT-4P', units: 82, revenue: 102500, growth: '+34%' },
    { rank: 4, name: 'ไส้กรองน้ำมันเครื่องแท้ Toyota Revo', sku: 'TOY-04152-YZZA6', units: 210, revenue: 46200, growth: '+9%' },
    { rank: 5, name: 'น้ำมันเกียร์อัตโนมัติ Motul ATF VI (1L)', sku: 'MOT-ATF-1L', units: 75, revenue: 39000, growth: '+21%' },
  ];

  // Sales by Category
  const categorySales = [
    { name: 'น้ำมันเครื่อง & สารหล่อลื่น', share: 44, amount: 370700, color: 'bg-[#ea580c]' },
    { name: 'ระบบเบรก & จานเบรก', share: 26, amount: 219050, color: 'bg-blue-600' },
    { name: 'ระบบจุดระเบิด & หัวเทียน', share: 15, amount: 126375, color: 'bg-emerald-600' },
    { name: 'ไส้กรองอากาศ & กรองน้ำมัน', share: 10, amount: 84250, color: 'bg-indigo-600' },
    { name: 'ช่วงล่าง & อื่นๆ', share: 5, amount: 42125, color: 'bg-amber-500' },
  ];

  // Sales by Customer Type
  const customerBreakdown = [
    { type: 'ลูกค้าทั่วไป (Retail / End-User)', orders: 412, amount: 488650, pct: 58 },
    { type: 'อู่ยนต์ & ร้านซ่อม (B2B Garage)', orders: 230, amount: 353850, pct: 42 },
  ];

  // Monthly Trend Mock Data
  const monthlyTrends = [
    { month: 'ม.ค.', sales: 520000, height: '62%' },
    { month: 'ก.พ.', sales: 590000, height: '70%' },
    { month: 'มี.ค.', sales: 680000, height: '80%' },
    { month: 'เม.ย.', sales: 610000, height: '72%' },
    { month: 'พ.ค.', sales: 740000, height: '88%' },
    { month: 'มิ.ย.', sales: 842500, height: '100%' },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-orange-50 text-[#ea580c] border border-orange-100">
              <BarChart3 className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              การวิเคราะห์ยอดขาย & ประสิทธิภาพการตลาด (Sales Analytics)
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            รายงานสถิติยอดขายเชิงลึก, สินค้าขายดี, สัดส่วนรายได้ตามหมวดหมู่ และพฤติกรรมการซื้อของลูกค้า
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Time range pill selector */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 text-xs font-bold">
            {[
              { id: 'today', label: 'วันนี้' },
              { id: 'week', label: '7 วันล่าสุด' },
              { id: 'month', label: 'เดือนนี้' },
              { id: 'year', label: 'รายปี 2026' },
            ].map(pill => (
              <button
                key={pill.id}
                onClick={() => setTimeRange(pill.id)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  timeRange === pill.id
                    ? 'bg-white text-[#0c3175] shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => alert('ส่งออกรายงานยอดขายเป็น Excel เรียบร้อยแล้ว')}
            className="p-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            title="Export Excel"
          >
            <Download className="w-4 h-4 text-[#ea580c]" />
            <span className="hidden sm:inline">Export XLS</span>
          </button>
        </div>
      </div>

      {/* 4 Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">ยอดขายรวม (GMV)</span>
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#ea580c] flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mb-1">
            ฿{metrics.totalRevenue.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{metrics.revenueGrowth}</span>
            <span className="text-slate-400 font-normal text-[10px]">เทียบเดือนก่อน</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">จำนวนคำสั่งซื้อ (Orders)</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mb-1">
            {metrics.totalOrders.toLocaleString()} รายการ
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{metrics.ordersGrowth}</span>
            <span className="text-slate-400 font-normal text-[10px]">เทียบเดือนก่อน</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">ยอดซื้อเฉลี่ย / บิล (AOV)</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mb-1">
            ฿{metrics.aov.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{metrics.aovGrowth}</span>
            <span className="text-slate-400 font-normal text-[10px]">เทียบเดือนก่อน</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">อัตราการสั่งซื้อ (Conversion)</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mb-1">
            {metrics.conversionRate}%
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{metrics.conversionGrowth}</span>
            <span className="text-slate-400 font-normal text-[10px]">ผู้เข้าชมซื้อสินค้า</span>
          </div>
        </div>
      </div>

      {/* Row 2: Sales Trend Chart & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Sales Trend Bar Chart Mockup (7 Cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between border-b pb-3 mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                <span>แนวโน้มยอดขายรายเดือน (Revenue Growth Trend)</span>
              </h3>
              <p className="text-[11px] text-slate-400">เปรียบเทียบยอดขายรวมตั้งแต่ต้นปี</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              เติบโตต่อเนื่อง +62%
            </span>
          </div>

          <div className="h-56 flex items-end justify-between gap-3 px-4 pt-6 pb-2">
            {monthlyTrends.map((t, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="text-[10px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  ฿{(t.sales / 1000).toFixed(0)}k
                </div>
                <div
                  style={{ height: t.height }}
                  className={`w-full max-w-[44px] rounded-t-xl transition-all group-hover:brightness-110 ${
                    idx === monthlyTrends.length - 1
                      ? 'bg-gradient-to-t from-[#ea580c] to-[#ff8c42] shadow-md shadow-orange-500/20'
                      : 'bg-gradient-to-t from-[#0c3175] to-blue-400'
                  }`}
                />
                <div className="text-xs font-bold text-slate-500 group-hover:text-slate-900">{t.month}</div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-[#0c3175]"></span>
                <span>ยอดขายเดือนก่อน</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-[#ea580c]"></span>
                <span>เดือนปัจจุบัน (New High)</span>
              </div>
            </div>
            <div className="font-bold text-slate-800">เป้าหมายเดือนนี้: ฿1,000,000</div>
          </div>
        </div>

        {/* Category Share (5 Cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between border-b pb-3 mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#ea580c]" />
                <span>สัดส่วนยอดขายตามหมวดหมู่อะไหล่</span>
              </h3>
              <p className="text-[11px] text-slate-400">สัดส่วนรายได้แยกตามประเภทสินค้า</p>
            </div>
          </div>

          <div className="space-y-3.5 my-auto">
            {categorySales.map((cat, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">{cat.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-500">฿{cat.amount.toLocaleString()}</span>
                    <span className="font-bold text-slate-900 w-10 text-right">{cat.share}%</span>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    style={{ width: `${cat.share}%` }}
                    className={`h-full rounded-full ${cat.color}`}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs text-slate-600">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-[10px] text-slate-400 font-bold uppercase">ลูกค้าทั่วไป</div>
              <div className="text-sm font-black text-slate-900 mt-0.5">58% (฿488k)</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-[10px] text-slate-400 font-bold uppercase">อู่ยนต์ & B2B</div>
              <div className="text-sm font-black text-slate-900 mt-0.5">42% (฿353k)</div>
            </div>
          </div>
        </div>

      </div>

      {/* Row 3: Top Selling Auto Parts Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <span>5 อันดับอะไหล่ขายดีที่สุด (Top-Selling Best Performers)</span>
            </h3>
            <p className="text-[11px] text-slate-400">จัดอันดับตามมูลค่ายอดขายและจำนวนชิ้นที่จำหน่ายได้</p>
          </div>
          <span className="text-xs text-blue-700 font-bold bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
            คิดเป็น 72% ของยอดขายรวม
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 text-[11px] text-slate-400 uppercase font-bold tracking-wider">
                <th className="p-3 w-12 text-center">#</th>
                <th className="p-3">สินค้า & รหัส SKU</th>
                <th className="p-3 text-right">จำนวนชิ้นที่ขายได้</th>
                <th className="p-3 text-right">ยอดขายรวม (฿)</th>
                <th className="p-3 text-right">อัตราการเติบโต</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {topProducts.map(p => (
                <tr key={p.rank} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 text-center">
                    <span className={`w-6 h-6 rounded-full inline-flex items-center justify-center font-black text-[11px] ${
                      p.rank === 1 ? 'bg-amber-100 text-amber-800' :
                      p.rank === 2 ? 'bg-slate-200 text-slate-700' :
                      p.rank === 3 ? 'bg-amber-50 text-amber-900' : 'text-slate-400'
                    }`}>
                      {p.rank}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="font-bold text-slate-900">{p.name}</div>
                    <div className="font-mono text-[11px] text-slate-400">{p.sku}</div>
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-slate-800">
                    {p.units.toLocaleString()} ชิ้น
                  </td>
                  <td className="p-3 text-right font-mono font-black text-slate-900">
                    ฿{p.revenue.toLocaleString()}
                  </td>
                  <td className="p-3 text-right">
                    <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-[11px]">
                      {p.growth}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
