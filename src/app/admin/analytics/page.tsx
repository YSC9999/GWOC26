
"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, BarChart, Bar
} from "recharts";
import { ArrowUpRight, Filter, MoreHorizontal, User, Edit2, Check, X as XIcon } from "lucide-react";

export default function AnalyticsPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // UI State
    const [chartMode, setChartMode] = useState<'revenue' | 'orders'>('revenue');
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
                // Initialize target logic if needed
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
            const res = await fetch('/api/admin/analytics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ target: parseInt(newTarget) })
            });
            if (res.ok) {
                setIsEditingTarget(false);
                fetchAnalytics(); // Refresh to get updated target
            }
        } catch (err) {
            alert("Failed to update target");
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F4F5F7]">Loading Dashboard...</div>;
    if (!data) return <div className="text-center py-20">Failed to load data</div>;

    // Gauge Data for PieChart
    const salesValue = data.today.revenue;
    const targetValue = data.target || 50000;
    const percentage = Math.min((salesValue / targetValue) * 100, 100);

    const gaugeData = [
        { name: 'Sales', value: salesValue, fill: '#C97C5D' },
        { name: 'Remaining', value: Math.max(0, targetValue - salesValue), fill: '#E5E7EB' }
    ];

    return (
        <div className="min-h-screen bg-[#F4F5F7] p-6 font-sans text-slate-800" onClick={() => setTargetMenuOpen(false)}>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/admin" className="text-slate-400 hover:text-slate-600">← Admin</Link>
                    <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
                </div>

                <div className="flex w-full md:w-auto items-center justify-between md:justify-end gap-3 bg-white p-2 rounded-xl shadow-sm">
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="text-xs bg-slate-50 border-none rounded-lg p-2 focus:ring-0 w-full md:w-auto"
                    />
                    <span className="text-slate-300">-</span>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="text-xs bg-slate-50 border-none rounded-lg p-2 focus:ring-0 w-full md:w-auto"
                    />
                    <button onClick={fetchAnalytics} className="bg-slate-900 text-white p-2 rounded-lg hover:bg-slate-800">
                        <Filter size={16} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6">

                {/* LEFT COLUMN (4 cols) */}
                <div className="col-span-12 lg:col-span-4 space-y-6">

                    {/* Today's Increase (Gauge) */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm relative">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-slate-900 text-white rounded-full">
                                    <ArrowUpRight size={16} />
                                </div>
                                <span className="font-bold">Today's Sales</span>
                            </div>

                            <div className="relative">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setTargetMenuOpen(!targetMenuOpen); }}
                                    className="p-1 hover:bg-slate-100 rounded-full text-slate-400"
                                >
                                    <MoreHorizontal size={20} />
                                </button>
                                {targetMenuOpen && (
                                    <div className="absolute right-0 top-8 bg-white shadow-lg rounded-xl p-2 z-10 w-32 border border-slate-100 animate-in fade-in zoom-in duration-100">
                                        <button
                                            onClick={() => { setIsEditingTarget(true); setNewTarget(targetValue.toString()); }}
                                            className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 rounded-lg text-slate-700 flex items-center gap-2"
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
                                <span className="text-4xl font-bold text-slate-800">{data.today.orders}</span>
                                <p className="text-xs text-slate-400">Orders Today</p>
                            </div>
                        </div>

                        <div className="mt-2 flex justify-between border-t border-slate-100 pt-4">
                            <div>
                                <p className="text-xs text-slate-400">Total Revenue</p>
                                <p className="font-bold text-lg">₹{data.today.revenue.toLocaleString()}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-slate-400">Target</p>
                                {isEditingTarget ? (
                                    <div className="flex items-center gap-1 justify-end mt-1">
                                        <input
                                            type="number"
                                            value={newTarget}
                                            onChange={(e) => setNewTarget(e.target.value)}
                                            className="w-16 p-1 text-sm border border-slate-200 rounded"
                                            autoFocus
                                        />
                                        <button onClick={updateTarget} className="bg-green-100 text-green-700 p-1 rounded"><Check size={12} /></button>
                                        <button onClick={() => setIsEditingTarget(false)} className="bg-red-100 text-red-700 p-1 rounded"><XIcon size={12} /></button>
                                    </div>
                                ) : (
                                    <p className="font-bold text-lg text-slate-300 cursor-pointer hover:text-slate-400" onClick={() => { setIsEditingTarget(true); setNewTarget(targetValue.toString()); }}>
                                        ₹{targetValue.toLocaleString()}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Cancelled / Refunds Stats */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm space-y-4">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500"></div> Returns & Cancellations
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-red-50 rounded-2xl">
                                <p className="text-xs text-red-400 font-bold uppercase mb-1">Cancelled Orders</p>
                                <p className="text-2xl font-bold text-red-700">{data.summary.cancelledOrders || 0}</p>
                                <p className="text-[10px] text-red-400/70">Volume</p>
                            </div>
                            <div className="p-4 bg-red-50 rounded-2xl">
                                <p className="text-xs text-red-400 font-bold uppercase mb-1">Refunded Amount</p>
                                <p className="text-2xl font-bold text-red-700">₹{(data.summary.cancelledRevenue || 0).toLocaleString()}</p>
                                <p className="text-[10px] text-red-400/70">Value</p>
                            </div>
                        </div>
                    </div>

                    {/* Billing & Transactions (Recent Orders) */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm h-[400px] overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                                    <User size={16} />
                                </div>
                                <span className="font-bold">Latest Orders</span>
                            </div>
                            <Link href="/admin/orders" className="text-xs text-slate-400 cursor-pointer hover:text-slate-600 hover:underline">
                                View All
                            </Link>
                        </div>

                        <div className="overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                            {data.recentOrders.map((order: any) => (
                                <div key={order._id} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                                            {order.userId?.name?.[0] || 'G'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-800">{order.userId?.name || 'Guest'}</p>
                                            <p className="text-xs text-slate-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold">₹{order.total.toLocaleString()}</p>
                                        <span className={`text - [10px] px - 2 py - 0.5 rounded - full ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'} `}>
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
                    <div className="bg-white p-8 rounded-3xl shadow-sm">
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                            <div>
                                <h3 className="text-2xl font-bold flex items-center gap-2">
                                    {chartMode === 'revenue'
                                        ? `₹${data.summary.totalRevenue.toLocaleString()} `
                                        : data.summary.totalOrders
                                    }
                                    <span className="text-slate-300 text-sm font-normal">
                                        {chartMode === 'revenue' ? "Total Revenue" : "Total Orders"}
                                    </span>
                                </h3>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">
                                        {data.summary.totalOrders} Total Orders
                                    </span>
                                    {chartMode === 'revenue' && (
                                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                                            Avg ₹{Math.round(data.summary.avgOrderValue)}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex bg-slate-100 p-1 rounded-full text-xs font-medium">
                                <button
                                    onClick={() => setChartMode('revenue')}
                                    className={`px - 4 py - 1.5 rounded - full transition - shadow ${chartMode === 'revenue' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'} `}
                                >
                                    Overview
                                </button>
                                <button
                                    onClick={() => setChartMode('orders')}
                                    className={`px - 4 py - 1.5 rounded - full transition - shadow ${chartMode === 'orders' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'} `}
                                >
                                    Breakdown
                                </button>
                            </div>
                        </div>

                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data.chartData}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#C97C5D" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#C97C5D" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#334155" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#334155" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12 }}
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
                                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                                        cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '5 5' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey={chartMode === 'revenue' ? "revenue" : "orders"}
                                        stroke={chartMode === 'revenue' ? "#C97C5D" : "#334155"}
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill={`url(#${chartMode === 'revenue' ? "colorRevenue" : "colorOrders"})`}
                                        name={chartMode === 'revenue' ? "Revenue" : "Orders"}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Top Products (Replacing Countries) */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm">
                        <h3 className="font-bold text-lg mb-6">Top Performing Products</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                {data.topProducts.slice(0, 3).map((product: any, i: number) => (
                                    <div key={i}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-medium text-slate-700">{product.name}</span>
                                            <span className="font-bold">₹{product.revenue.toLocaleString()}</span>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-2">
                                            <div
                                                className="bg-slate-800 h-2 rounded-full"
                                                style={{ width: `${(product.revenue / data.summary.totalRevenue) * 100}% ` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="h-[200px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data.topProducts}>
                                        <Bar dataKey="revenue" fill="#334155" radius={[4, 4, 0, 0]} barSize={20} />
                                        <XAxis dataKey="name" hide />
                                        <Tooltip cursor={{ fill: 'transparent' }} />
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
