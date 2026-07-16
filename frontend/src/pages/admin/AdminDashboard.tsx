import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import {
  TrendingUp, TrendingDown, Users, Monitor, Database, Shield, Activity, Clock,
  ArrowUpRight, ArrowDownRight, Package, RefreshCw, Layers, Bell, CheckCircle2,
  AlertTriangle, Search, Sliders, Play, Plus, Landmark, DollarSign,
  ShoppingCart, AlertCircle, Info, HelpCircle, ChevronRight, Printer, CheckSquare, Banknote, User
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';

// --- Helper Hook for Count Up ---
function useCountUp(end: number, duration: number = 1000) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // ease out quad
      const easeProgress = progress * (2 - progress);
      setCount(Math.floor(easeProgress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);

  return count;
}

// --- Skeleton Component ---
function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse p-2">
      <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full"></div>
      <div className="flex gap-4">
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-32"></div>
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-32"></div>
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-32"></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1,2,3,4].map(i => <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-[20px]"></div>)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-96 bg-slate-200 dark:bg-slate-800 rounded-[20px]"></div>
        <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-[20px]"></div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'terminals' | 'system'>('overview');
  const [loading, setLoading] = useState(true);
  const [salesFilter, setSalesFilter] = useState<'today' | 'week' | 'month'>('today');

  // Simulate network fetch
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const businessInfo = {
    restaurantName: "Express Diner",
    businessDate: "July 13, 2026",
    currentShift: "Morning Shift (08:00 AM - 04:00 PM)",
    cashierName: "Admin User",
    weather: "Partly Cloudy • 29°C"
  };

  const stats = {
    salesToday: 42890,
    salesDiff: 12.5,
    ordersToday: 284,
    ordersDiff: 8.2,
    revenueToday: 40745,
    revenueDiff: 14.1,
    customersToday: 210,
    customersDiff: -3.4,
    kitchenPending: 5,
    packedPending: 2,
    inventoryAlerts: 3,
    cashiersOnline: 4,
    totalUsers: 12,
    totalTerminals: 4,
    onlineTerminals: 3,
    lastBackup: '2026-07-13 at 02:00 AM',
    licenseStatus: 'ACTIVE',
    licenseExpiry: '2027-01-10',
    cashCollection: 6000
  };

  // Animated counts
  const animatedSales = useCountUp(stats.salesToday, 1500);
  const animatedOrders = useCountUp(stats.ordersToday, 1500);
  const animatedKitchen = useCountUp(stats.kitchenPending, 1000);
  const animatedCash = useCountUp(stats.cashCollection, 1500);

  const salesTrendData = [
    { hour: '08:00', Sales: 4200, Orders: 28 },
    { hour: '10:00', Sales: 8500, Orders: 54 },
    { hour: '12:00', Sales: 18900, Orders: 110 },
    { hour: '14:00', Sales: 24500, Orders: 152 },
    { hour: '16:00', Sales: 29800, Orders: 194 },
    { hour: '18:00', Sales: 38200, Orders: 250 },
    { hour: '20:00', Sales: 42890, Orders: 284 }
  ];

  const paymentDonutData = [
    { name: 'UPI / QR', value: 24500, color: '#3B82F6' },
    { name: 'Card', value: 12390, color: '#10B981' },
    { name: 'Cash', value: 6000, color: '#F59E0B' }
  ];

  const categoryPerformanceData = [
    { name: 'Mains', Sales: 18500, percent: 43 },
    { name: 'Chinese', Sales: 10200, percent: 24 },
    { name: 'Snacks', Sales: 8400, percent: 19 },
    { name: 'Beverages', Sales: 4100, percent: 10 },
    { name: 'Desserts', Sales: 1690, percent: 4 }
  ];

  const recentOrders = [
    { id: '#ORD-1002', time: '2m ago', items: '2x Masala Dosa, 1x Tea', total: '₹220', status: 'Completed' },
    { id: '#ORD-1003', time: '5m ago', items: '1x Veg Chowmein, 2x Coke', total: '₹340', status: 'Preparing' },
    { id: '#ORD-1004', time: '12m ago', items: '4x Sattu Kachori, 4x Tea', total: '₹280', status: 'Completed' },
  ];

  const lowStock = [
    { item: 'Amul Butter', qty: '2 pkts', alert: 'Critical' },
    { item: 'Filter Coffee Powder', qty: '1.2 kg', alert: 'Warning' },
    { item: 'Paper Cups (Small)', qty: '45 pcs', alert: 'Warning' },
  ];

  const systemStatus = {
    database: { status: 'HEALTHY', latency: '4ms', label: 'Primary PostgreSQL Cluster' },
    printers: { status: 'ONLINE', count: '3 / 3 Active', label: 'Thermal Printers' },
    terminals: { status: 'WARNING', count: '3 Online / 1 Offline', label: 'POS Hardware' },
    kitchen: { status: 'HEALTHY', queue: '5 active orders', label: 'Kitchen Display Screen (KDS)' },
    businessDay: { status: 'HEALTHY', state: 'OPEN', label: 'Active Business Day: 2026-07-13' }
  };

  const recentAudit = [
    { id: '1', user: 'Admin User', role: 'SUPER_ADMIN', action: 'UPDATE', entity: 'Settings', desc: 'Updated GST percentage rate to 5%', time: '2026-07-13 11:32 AM', icon: Sliders },
    { id: '2', user: 'Sarah K.', role: 'CASHIER', action: 'LOGIN', entity: 'Shift Control', desc: 'Shift started on Terminal T02', time: '2026-07-13 11:15 AM', icon: Monitor },
    { id: '3', user: 'Jane S.', role: 'MANAGER', action: 'CANCEL', entity: 'Order #203', desc: 'Voided item: Noodles x1', time: '2026-07-13 10:42 AM', icon: AlertTriangle },
  ];

  const actionColors: Record<string, string> = {
    UPDATE: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    LOGIN: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    CANCEL: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
    CREATE: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
  };

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-8 animate-fadeIn p-4 md:p-6 lg:p-8">
      {/* ── HEADER & WELCOME BANNER ── */}
      <div className="relative overflow-hidden rounded-[20px] bg-card border border-border p-6 md:p-8 lg:p-10 text-foreground shadow-sm group hover:shadow-md transition-all duration-500">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-500/15 transition-all duration-700"></div>
        <div className="absolute left-0 bottom-0 -translate-x-12 translate-y-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/15 transition-all duration-700"></div>
        
        <div className="relative flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold tracking-widest bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 uppercase">
              <CheckCircle2 className="w-3.5 h-3.5" /> Shift Active
            </span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white">
              Welcome back, {businessInfo.cashierName}
            </h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-xl font-medium">
              Currently managing <strong className="text-gray-900 dark:text-white">{businessInfo.restaurantName}</strong> • {businessInfo.currentShift}
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 bg-slate-50/80 dark:bg-slate-900/50 backdrop-blur-sm p-4 rounded-2xl border border-border shrink-0 shadow-sm">
            <div className="text-right border-r border-border pr-4">
              <p className="text-[10px] uppercase tracking-wider font-extrabold text-muted-foreground">Business Date</p>
              <p className="text-sm font-black text-gray-900 dark:text-white mt-0.5">{businessInfo.businessDate}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider font-extrabold text-muted-foreground">Local Weather</p>
              <p className="text-sm font-black text-gray-900 dark:text-white mt-0.5">{businessInfo.weather}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── TAB NAVIGATION ── */}
      <div className="flex overflow-x-auto no-scrollbar border-b border-border pb-px">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-4 px-6 font-bold text-sm transition-all border-b-[3px] whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
          }`}
        >
          Overview & Sales
        </button>
        <button
          onClick={() => setActiveTab('terminals')}
          className={`pb-4 px-6 font-bold text-sm transition-all border-b-[3px] whitespace-nowrap ${
            activeTab === 'terminals'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
          }`}
        >
          Operations ({stats.onlineTerminals}/{stats.totalTerminals})
        </button>
        <button
          onClick={() => setActiveTab('system')}
          className={`pb-4 px-6 font-bold text-sm transition-all border-b-[3px] whitespace-nowrap ${
            activeTab === 'system'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
          }`}
        >
          System Health
        </button>
      </div>

      {activeTab === 'overview' && (
        <>
          {/* ── KPI ANALYTICS GRID ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* SALES */}
            <Card className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl border-border bg-card rounded-[20px] flex flex-col justify-between">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-sm">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center gap-1 font-bold shadow-sm">
                    <TrendingUp className="w-3.5 h-3.5" /> +{stats.salesDiff}%
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-bold tracking-wide">Gross Sales Today</p>
                  <h3 className="text-4xl font-black mt-1.5 text-foreground tracking-tight">₹{animatedSales.toLocaleString('en-IN')}</h3>
                  <p className="text-xs text-muted-foreground mt-2 font-medium bg-slate-50 dark:bg-slate-900 inline-block px-2 py-1 rounded-md">vs yesterday (₹38,125)</p>
                </div>
              </CardContent>
            </Card>

            {/* ORDERS */}
            <Card className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl border-border bg-card rounded-[20px] flex flex-col justify-between">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-sm">
                    <ShoppingCart className="w-6 h-6" />
                  </div>
                  <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center gap-1 font-bold shadow-sm">
                    <TrendingUp className="w-3.5 h-3.5" /> +{stats.ordersDiff}%
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-bold tracking-wide">Orders Completed</p>
                  <h3 className="text-4xl font-black mt-1.5 text-foreground tracking-tight">{animatedOrders}</h3>
                  <p className="text-xs text-muted-foreground mt-2 font-medium bg-slate-50 dark:bg-slate-900 inline-block px-2 py-1 rounded-md">Avg. ticket: ₹{Math.round(stats.salesToday / stats.ordersToday)}</p>
                </div>
              </CardContent>
            </Card>

            {/* KITCHEN ORDERS PENDING */}
            <Card className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl border-border bg-card rounded-[20px] flex flex-col justify-between">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-500 to-orange-500"></div>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-sm">
                    <Layers className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 px-3 py-1 bg-amber-500/10 rounded-full border border-amber-500/20 uppercase tracking-widest shadow-sm">
                    KDS Active
                  </span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-bold tracking-wide">Kitchen Prep Queue</p>
                  <h3 className="text-4xl font-black mt-1.5 text-foreground tracking-tight">
                    {animatedKitchen} <span className="text-sm font-bold text-muted-foreground">KOTs pending</span>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-2 font-medium bg-slate-50 dark:bg-slate-900 inline-block px-2 py-1 rounded-md">Avg KOT prep: 12 mins</p>
                </div>
              </CardContent>
            </Card>

            {/* CASH COLLECTION */}
            <Card className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl border-border bg-card rounded-[20px] flex flex-col justify-between">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-purple-500 to-pink-500"></div>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 shadow-sm">
                    <Banknote className="w-6 h-6" />
                  </div>
                  <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center gap-1 font-bold shadow-sm">
                    Matched
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-bold tracking-wide">Cash Collection</p>
                  <h3 className="text-4xl font-black mt-1.5 text-foreground tracking-tight">₹{animatedCash.toLocaleString('en-IN')}</h3>
                  <p className="text-xs text-muted-foreground mt-2 font-medium bg-slate-50 dark:bg-slate-900 inline-block px-2 py-1 rounded-md">Expected in drawer</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── CHARTS PANEL ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sales Trend Chart */}
            <Card className="lg:col-span-2 border-border bg-card rounded-[20px] shadow-sm">
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6">
                <div>
                  <CardTitle className="text-foreground text-xl font-black tracking-tight">Sales Trend</CardTitle>
                  <CardDescription className="font-medium mt-1">Hourly ticket sales and performance</CardDescription>
                </div>
                <div className="flex items-center gap-2 mt-4 sm:mt-0 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
                  {['today', 'week', 'month'].map(f => (
                    <button
                      key={f}
                      onClick={() => setSalesFilter(f as any)}
                      className={`px-4 py-1.5 text-xs font-bold rounded-lg capitalize transition-all ${
                        salesFilter === f 
                        ? 'bg-white dark:bg-slate-800 text-gray-900 dark:text-white shadow-sm' 
                        : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[320px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={salesTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:hidden" />
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1E293B" className="hidden dark:block" />
                      <XAxis dataKey="hour" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                      <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} dx={-10} tickFormatter={(val) => `₹${val/1000}k`} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} 
                        itemStyle={{ color: '#3B82F6', fontWeight: 'bold' }}
                        cursor={{ stroke: '#94A3B8', strokeWidth: 1, strokeDasharray: '4 4' }}
                      />
                      <Area type="monotone" dataKey="Sales" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" animationDuration={1000} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Donut Chart / Payment Distribution */}
            <Card className="border-border bg-card rounded-[20px] shadow-sm flex flex-col">
              <CardHeader>
                <CardTitle className="text-foreground text-xl font-black tracking-tight">Payment Methods</CardTitle>
                <CardDescription className="font-medium mt-1">Daily revenue channel breakout</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between pb-6">
                <div className="h-[220px] w-full relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentDonutData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={95}
                        paddingAngle={5}
                        dataKey="value"
                        animationDuration={1000}
                      >
                        {paymentDonutData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: any) => `₹${Number(value).toLocaleString()}`}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <p className="text-[10px] uppercase font-extrabold text-muted-foreground tracking-widest">Total Revenue</p>
                    <p className="text-2xl font-black text-gray-950 dark:text-white mt-1">₹{stats.salesToday.toLocaleString('en-IN')}</p>
                  </div>
                </div>
                
                <div className="space-y-3 mt-6">
                  {paymentDonutData.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm font-bold bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800">
                      <div className="flex items-center gap-3">
                        <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: item.color }}></span>
                        <span className="text-gray-700 dark:text-gray-300">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-gray-950 dark:text-white block leading-none mb-1">₹{item.value.toLocaleString('en-IN')}</span>
                        <span className="text-[10px] text-muted-foreground">{Math.round(item.value / stats.salesToday * 100)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── ADDITIONAL WIDGETS ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Top Categories */}
            <Card className="border-border bg-card rounded-[20px] shadow-sm">
              <CardHeader>
                <CardTitle className="text-foreground text-xl font-black tracking-tight">Top Selling Categories</CardTitle>
                <CardDescription className="font-medium mt-1">Daily sales volume per category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[260px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryPerformanceData} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E2E8F0" className="dark:hidden" />
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#1E293B" className="hidden dark:block" />
                      <XAxis type="number" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis dataKey="name" type="category" stroke="#94A3B8" fontSize={11} width={80} tickLine={false} axisLine={false} />
                      <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} />
                      <Bar dataKey="Sales" fill="#3B82F6" radius={[0, 6, 6, 0]} barSize={24} animationDuration={1000}>
                        {categoryPerformanceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? '#3B82F6' : '#93C5FD'} className="dark:fill-blue-500 dark:opacity-80" />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Recent Orders List */}
            <Card className="border-border bg-card rounded-[20px] shadow-sm flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div>
                  <CardTitle className="text-foreground text-xl font-black tracking-tight">Recent Orders</CardTitle>
                  <CardDescription className="font-medium mt-1">Live feed from KDS</CardDescription>
                </div>
                <Link to="/admin/orders">
                  <Button variant="ghost" size="sm" className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-bold rounded-lg">
                    View All
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-center">
                <div className="space-y-4">
                  {recentOrders.map((order, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-xl border border-gray-150 dark:border-gray-800 bg-gray-50/50 dark:bg-slate-900/30 hover:bg-white dark:hover:bg-slate-800 transition-colors shadow-sm">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-black text-gray-950 dark:text-white">{order.id}</span>
                          <Badge variant="outline" className={order.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]' : 'bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px]'}>{order.status}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground font-medium line-clamp-1">{order.items}</p>
                      </div>
                      <div className="text-right sm:text-right text-left w-full sm:w-auto mt-2 sm:mt-0 flex sm:flex-col flex-row justify-between sm:justify-center items-center sm:items-end">
                        <span className="text-sm font-black text-gray-900 dark:text-white">{order.total}</span>
                        <span className="text-[10px] text-muted-foreground font-bold">{order.time}</span>
                      </div>
                    </div>
                  ))}
                  {recentOrders.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-sm font-medium text-gray-500">No recent orders</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Low Stock Alerts */}
            <Card className="border-border bg-card rounded-[20px] shadow-sm flex flex-col">
              <CardHeader className="pb-4">
                <CardTitle className="text-foreground text-xl font-black tracking-tight flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-rose-500" /> Low Stock Alerts
                </CardTitle>
                <CardDescription className="font-medium mt-1">Items nearing reorder limits</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-center">
                <div className="space-y-4">
                  {lowStock.map((stock, idx) => (
                    <div key={idx} className="flex justify-between items-center p-4 rounded-xl border border-rose-100 dark:border-rose-900/30 bg-rose-50/50 dark:bg-rose-950/20">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${stock.alert === 'Critical' ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'}`}></div>
                        <div>
                          <p className="text-sm font-bold text-gray-950 dark:text-white">{stock.item}</p>
                          <p className="text-[10px] uppercase tracking-wider font-extrabold text-muted-foreground mt-0.5">{stock.alert}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black text-gray-900 dark:text-white bg-white dark:bg-slate-900 px-3 py-1 rounded-lg border border-border shadow-sm">{stock.qty}</span>
                      </div>
                    </div>
                  ))}
                  {lowStock.length === 0 && (
                    <div className="text-center py-8">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-50" />
                      <p className="text-sm font-medium text-gray-500">Inventory levels are healthy</p>
                    </div>
                  )}
                </div>
                <Button variant="outline" className="w-full mt-6 rounded-xl border-border font-bold">
                  View Inventory
                </Button>
              </CardContent>
            </Card>

          </div>
        </>
      )}

      {activeTab === 'terminals' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-border bg-card rounded-[20px] shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-foreground text-xl font-black tracking-tight">Active POS Registers</CardTitle>
              <CardDescription className="font-medium mt-1">Manage active POS terminals and assigned cashiers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { code: 'T01', name: 'Main Front Counter', cashier: 'John D.', status: 'ONLINE', drawer: '₹5,000.00' },
                  { code: 'T02', name: 'Expedited Bar Counter', cashier: 'Sarah K.', status: 'ONLINE', drawer: '₹2,500.00' },
                  { code: 'T03', name: 'Drive-Thru Window', cashier: 'Jane S.', status: 'ONLINE', drawer: '₹4,120.00' },
                  { code: 'T04', name: 'Back Kitchen Hub', cashier: 'Unassigned', status: 'OFFLINE', drawer: '₹0.00' }
                ].map((term, index) => (
                  <div key={index} className="flex flex-col justify-between p-5 border border-gray-150 dark:border-gray-800 rounded-2xl hover:shadow-md transition-all bg-slate-50/50 dark:bg-slate-900/30 group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-xl font-black text-sm shadow-sm ${term.status === 'ONLINE' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500 dark:bg-slate-800 dark:text-gray-400'}`}>
                          {term.code}
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-gray-950 dark:text-white leading-none mb-1.5">{term.name}</h4>
                          <div className="flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${term.status === 'ONLINE' ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">{term.status}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mt-2 pt-4 border-t border-border/50">
                      <div>
                        <p className="text-[10px] uppercase font-extrabold text-muted-foreground mb-1">Cashier</p>
                        <p className="text-xs font-bold text-gray-800 dark:text-gray-200">{term.cashier}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase font-extrabold text-muted-foreground mb-1">Drawer Cash</p>
                        <p className="text-xs font-bold text-gray-800 dark:text-gray-200">{term.drawer}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card rounded-[20px] shadow-sm flex flex-col">
            <CardHeader className="pb-4">
              <CardTitle className="text-foreground text-xl font-black tracking-tight">Printers & KDS</CardTitle>
              <CardDescription className="font-medium mt-1">Peripheral device status</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              {/* Printers */}
              <div className="p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/50 dark:bg-emerald-950/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 rounded-lg">
                    <Printer className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">Thermal Printers</p>
                    <p className="text-xs text-muted-foreground font-medium">3/3 Online • Healthy</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Button>
              </div>

              {/* Kitchen KDS */}
              <div className="p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/50 dark:bg-emerald-950/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 rounded-lg">
                    <Monitor className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">Kitchen Display</p>
                    <p className="text-xs text-muted-foreground font-medium">Active • 5 Orders Queue</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'system' && (
        <div className="space-y-6">
          <Card className="border-border bg-card rounded-[20px] shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-foreground text-xl font-black tracking-tight">Platform Audit Logs</CardTitle>
              <CardDescription className="font-medium mt-1">Real-time security and operational events timeline</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative pl-6 border-l-2 border-slate-100 dark:border-slate-800 space-y-8 mt-2">
                {recentAudit.map(log => {
                  const LogIcon = log.icon;
                  return (
                    <div key={log.id} className="relative flex items-start gap-6 group">
                      {/* Timeline Dot */}
                      <div className="absolute -left-[35px] flex items-center justify-center w-5 h-5 rounded-full bg-card border-4 border-slate-100 dark:border-slate-800 group-hover:border-blue-500 transition-colors duration-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 group-hover:bg-blue-500 transition-colors duration-300"></span>
                      </div>
                      
                      {/* Audit Content */}
                      <div className="flex-1 bg-slate-50 dark:bg-slate-900/40 rounded-2xl p-5 border border-border shadow-sm group-hover:shadow-md transition-all duration-300">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                          <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-xl border ${actionColors[log.action] || 'text-slate-400 border-slate-200'}`}>
                              <LogIcon className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-[10px] font-black tracking-widest px-2 py-0.5 rounded border ${actionColors[log.action]}`}>{log.action}</span>
                                <h4 className="text-sm font-black text-gray-900 dark:text-white">{log.entity}</h4>
                              </div>
                              <p className="text-sm text-gray-700 dark:text-gray-300 font-medium mb-2">{log.desc}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold">
                                <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {log.user}</span>
                                <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700"></span>
                                <span>{log.role}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-border">
                            <Clock className="w-3.5 h-3.5" />
                            {log.time}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-8 flex justify-center">
                <Link to="/admin/audit">
                  <Button variant="outline" className="font-bold rounded-xl border-border hover:bg-slate-50 dark:hover:bg-slate-800 px-8">
                    View Full Audit History
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* ── SYSTEM LICENSE & DATABASE SNAPSHOT SUMMARY ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* License details */}
            <Card className="border-border bg-card rounded-[20px] shadow-sm hover:-translate-y-1 transition-transform duration-300">
              <CardContent className="p-6 md:p-8 flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="p-4 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl shadow-sm">
                    <Shield className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-gray-950 dark:text-white mb-1">Enterprise POS License</h4>
                    <p className="text-xs font-bold text-gray-500 mb-0.5">Status: <strong className="text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">ACTIVE</strong></p>
                    <p className="text-xs font-medium text-gray-400">License Expiry: {stats.licenseExpiry}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="font-bold rounded-xl border-border hidden sm:flex" disabled>
                  Manage
                </Button>
              </CardContent>
            </Card>

            {/* Database backup */}
            <Card className="border-border bg-card rounded-[20px] shadow-sm hover:-translate-y-1 transition-transform duration-300">
              <CardContent className="p-6 md:p-8 flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="p-4 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl shadow-sm">
                    <Database className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-gray-950 dark:text-white mb-1">Automatic DB Backup</h4>
                    <p className="text-xs font-medium text-gray-500 mb-1">Last backup: <span className="font-bold">{stats.lastBackup}</span></p>
                    <p className="text-xs text-emerald-500 flex items-center gap-1 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Scheduled replication active
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="font-bold rounded-xl border-border hidden sm:flex" disabled>
                  Backup
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
