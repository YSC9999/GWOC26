"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import {
  ArrowUpRight,
  Filter,
  MoreHorizontal,
  User,
  Edit2,
  Check,
  X as XIcon,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
} from "lucide-react";

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // UI State
  const [chartMode, setChartMode] = useState<"revenue" | "orders">("revenue");
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [newTarget, setNewTarget] = useState("");
  const [targetMenuOpen, setTargetMenuOpen] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      let url = "/api/admin/analytics";
      const params = new URLSearchParams();
      if (startDate) params.append("from", startDate);
      if (endDate) params.append("to", endDate);

      if (params.toString()) url += `? ${params.toString()} `;

      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateTarget = async () => {
    if (!newTarget) return;
    try {
      const res = await fetch("/api/admin/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: parseInt(newTarget) }),
      });
      if (res.ok) {
        setIsEditingTarget(false);
        fetchAnalytics(); // Refresh to get updated target
      }
    } catch (err) {
      alert("Failed to update target");
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen text-soil font-serif">Loading...</div>;
  if (!data) return <div className="flex items-center justify-center min-h-screen text-red-500 font-serif">Failed to load data</div>;

  const targetValue = parseInt(newTarget) || data.summary.target || 50000;
  const gaugeData = [
    { name: 'Progress', value: data.today.orders || 0, fill: '#8D6E63' },
    { name: 'Remaining', value: Math.max(0, targetValue - (data.today.orders || 0)), fill: '#f5f5f4' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-clay/10 p-2 md:p-6 font-sans text-soil" onClick={() => setTargetMenuOpen(false)}>
      {/* Header */}
      {/* Header */}
      <div className="flex flex-col gap-6 mb-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-soil/40 hover:text-soil transition-colors font-medium shrink-0">← Admin</Link>
          <h1 className="text-xl md:text-3xl font-serif font-bold text-soil break-words leading-tight">Analytics Dashboard</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 md:gap-4 bg-white/50 backdrop-blur border border-white/60 p-3 md:p-4 rounded-xl shadow-sm w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3 items-center">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-soil/40 text-xs font-bold uppercase pointer-events-none md:hidden">From</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-white border border-soil/10 rounded-lg py-2.5 pl-12 pr-3 md:px-3 focus:ring-0 w-full text-soil/80 focus:border-clay text-sm"
              />
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-soil/40 text-xs font-bold uppercase pointer-events-none md:hidden">To</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-white border border-soil/10 rounded-lg py-2.5 pl-8 pr-3 md:px-3 focus:ring-0 w-full text-soil/80 focus:border-clay text-sm"
              />
            </div>
          </div>
          <button onClick={fetchAnalytics} className="bg-soil text-white px-6 py-2.5 rounded-lg hover:bg-clay transition-colors shadow-lg shadow-soil/10 w-full h-full flex justify-center items-center gap-2 font-bold uppercase tracking-wider text-xs md:text-sm">
            <Filter size={16} /> Filter
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 md:gap-6 max-w-7xl mx-auto">

        {/* LEFT COLUMN (4 cols) */}
        <div className="col-span-12 lg:col-span-4 space-y-6">

          {/* Today's Increase (Gauge) */}
          <div className="bg-white/60 backdrop-blur p-4 rounded-3xl shadow-sm border border-white/60 relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-soil text-white rounded-full shadow-lg shadow-soil/20">
                  <TrendingUp size={16} />
                </div>
                <span className="font-bold font-serif text-lg">Today's Sales</span>
              </div>

              <div className="relative">
                <button
                  onClick={(e) => { e.stopPropagation(); setTargetMenuOpen(!targetMenuOpen); }}
                  className="p-1 hover:bg-sand/20 rounded-full text-soil/40"
                >
                  <MoreHorizontal size={20} />
                </button>
                {targetMenuOpen && (
                  <div className="absolute right-0 top-8 bg-white shadow-xl rounded-xl p-2 z-10 w-32 border border-soil/5 animate-in fade-in zoom-in duration-100">
                    <button
                      onClick={() => { setIsEditingTarget(true); setNewTarget(targetValue.toString()); }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-sand/20 rounded-lg text-soil flex items-center gap-2 font-medium"
                    >
                      <Edit2 size={12} /> Set Target
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Gauge Chart */}
            <div className="h-[200px] relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={gaugeData}
                    cx="50%"
                    cy="80%" // Move down to make semi-circle
                    startAngle={180}
                    endAngle={0}
                    innerRadius={80}
                    outerRadius={100}
                    paddingAngle={0}
                    dataKey="value"
                    stroke="none"
                    cornerRadius={8}
                  >
                    {gaugeData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-[60%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                <span className="text-4xl font-bold text-soil font-serif">{data.today.orders}</span>
                <p className="text-xs text-soil/50 uppercase tracking-wider font-bold mt-1">Orders Today</p>
              </div>
            </div>

            <div className="mt-2 flex justify-between border-t border-soil/5 pt-4">
              <div>
                <p className="text-xs text-soil/40 uppercase font-bold mb-1">Total Revenue</p>
                <p className="font-bold text-lg text-clay">₹{data.today.revenue.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-soil/40 uppercase font-bold mb-1">Target</p>
                {isEditingTarget ? (
                  <div className="flex items-center gap-1 justify-end mt-1">
                    <input
                      type="number"
                      value={newTarget}
                      onChange={(e) => setNewTarget(e.target.value)}
                      className="w-20 p-1 text-sm border border-clay/20 rounded bg-white"
                      autoFocus
                    />
                    <button onClick={updateTarget} className="bg-green-100 text-green-700 p-1 rounded"><Check size={12} /></button>
                    <button onClick={() => setIsEditingTarget(false)} className="bg-red-100 text-red-700 p-1 rounded"><XIcon size={12} /></button>
                  </div>
                ) : (
                  <p className="font-bold text-lg text-soil/30 cursor-pointer hover:text-clay transition-colors" onClick={() => { setIsEditingTarget(true); setNewTarget(targetValue.toString()); }}>
                    ₹{targetValue.toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Cancelled / Refunds Stats */}
          <div className="bg-white/60 backdrop-blur p-4 rounded-3xl shadow-sm border border-white/60 space-y-4">
            <h3 className="font-bold text-soil flex items-center gap-2 font-serif text-lg">
              <div className="w-2 h-2 rounded-full bg-red-400"></div> Returns & Cancellations
            </h3>
            <div className="grid grid-cols-2 gap-2 md:gap-4">
              <div className="p-4 bg-red-50/50 border border-red-100 rounded-2xl">
                <p className="text-xs text-red-400 font-bold uppercase mb-1">Cancelled Orders</p>
                <p className="text-2xl font-bold text-red-800">{data.summary.cancelledOrders || 0}</p>
                <p className="text-[10px] text-red-400/70">Volume</p>
              </div>
              <div className="p-4 bg-red-50/50 border border-red-100 rounded-2xl">
                <p className="text-xs text-red-400 font-bold uppercase mb-1">Refunded Amount</p>
                <p className="text-2xl font-bold text-red-800">₹{(data.summary.cancelledRevenue || 0).toLocaleString()}</p>
                <p className="text-[10px] text-red-400/70">Value</p>
              </div>
            </div>
          </div>

          {/* Billing & Transactions (Recent Orders) */}
          <div className="bg-white/60 backdrop-blur p-4 rounded-3xl shadow-sm border border-white/60 h-[400px] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-clay/10 text-clay rounded-lg">
                  <User size={16} />
                </div>
                <span className="font-bold font-serif text-lg">Latest Orders</span>
              </div>
              <Link href="/admin/orders" className="text-xs text-soil/40 cursor-pointer hover:text-clay hover:underline font-bold">
                VIEW ALL
              </Link>
            </div>

            <div className="overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {data.recentOrders.map((order: any) => (
                <div key={order._id} className="flex items-center justify-between group p-2 hover:bg-white/50 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-sand/30 flex items-center justify-center text-xs font-bold text-soil/70">
                      {order.userId?.name?.[0] || 'G'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-soil">{order.userId?.name || 'Guest'}</p>
                      <p className="text-xs text-soil/40">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-soil">₹{order.total.toLocaleString()}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'} `}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN (8 cols) */}
        <div className="col-span-12 lg:col-span-8 space-y-6">

          {/* Main Chart (Target Sales Breakdown) */}
          <div className="bg-white/60 backdrop-blur p-4 md:p-8 rounded-3xl shadow-sm border border-white/60">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div>
                <h3 className="text-4xl font-serif font-bold flex items-center gap-2 text-soil">
                  {chartMode === 'revenue'
                    ? `₹${data.summary.totalRevenue.toLocaleString()} `
                    : data.summary.totalOrders
                  }
                </h3>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold flex items-center gap-1">
                    <Package size={12} /> {data.summary.totalOrders} Total Orders
                  </span>
                  {chartMode === 'revenue' && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold flex items-center gap-1">
                      <DollarSign size={12} /> Avg Order: ₹{Math.round(data.summary.avgOrderValue)}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex bg-white border border-soil/5 p-1 rounded-full text-xs font-medium shadow-sm">
                <button
                  onClick={() => setChartMode('revenue')}
                  className={`px-4 py-1.5 rounded-full transition-all ${chartMode === 'revenue' ? 'bg-soil text-white shadow-md' : 'text-soil/40 hover:text-soil'} `}
                >
                  Revenue
                </button>
                <button
                  onClick={() => setChartMode('orders')}
                  className={`px-4 py-1.5 rounded-full transition-all ${chartMode === 'orders' ? 'bg-soil text-white shadow-md' : 'text-soil/40 hover:text-soil'} `}
                >
                  Orders Breakdown
                </button>
              </div>
            </div>

            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.chartData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D27D2D" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#D27D2D" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8D6E63" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#8D6E63" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#8D6E63', fontSize: 12 }}
                    dy={10}
                    tickFormatter={(str) => {
                      if (str.includes(':')) return new Date(str).toLocaleTimeString([], { hour: 'numeric' });
                      if (str.length === 7) {
                        const [y, m] = str.split('-');
                        return new Date(parseInt(y), parseInt(m) - 1).toLocaleDateString([], { month: 'short', year: '2-digit' });
                      }
                      return new Date(str).toLocaleDateString([], { month: 'short', day: 'numeric' });
                    }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#8D6E63', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', fontFamily: 'serif' }}
                    cursor={{ stroke: '#D27D2D', strokeWidth: 1, strokeDasharray: '5 5' }}
                  />
                  <Area
                    type="monotone"
                    dataKey={chartMode === 'revenue' ? "revenue" : "orders"}
                    stroke={chartMode === 'revenue' ? "#D27D2D" : "#8D6E63"}
                    strokeWidth={3}
                    fillOpacity={1}
                    fill={`url(#${chartMode === 'revenue' ? "colorRevenue" : "colorOrders"})`}
                    name={chartMode === 'revenue' ? "Revenue" : "Orders"}
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Products (Replacing Countries) */}
          <div className="bg-white/60 backdrop-blur p-4 md:p-8 rounded-3xl shadow-sm border border-white/60">
            <h3 className="font-bold font-serif text-xl mb-6 text-soil">Top Performing Products</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                {data.topProducts.slice(0, 3).map((product: any, i: number) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-bold text-soil">{product.name}</span>
                      <span className="font-bold text-clay">₹{product.revenue.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-sand/20 rounded-full h-2">
                      <div
                        className="bg-soil h-2 rounded-full"
                        style={{ width: `${(product.revenue / data.summary.totalRevenue) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.topProducts}>
                    <Bar dataKey="revenue" fill="#8D6E63" radius={[4, 4, 0, 0]} barSize={20} />
                    <XAxis dataKey="name" hide />
                    <Tooltip
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
