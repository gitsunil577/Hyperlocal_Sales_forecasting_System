// app/dashboard/salesdashboard.tsx
"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

/** ---------- Small UI helpers ---------- */
const Badge = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center rounded-full bg-white/70 px-2 py-0.5 text-xs font-medium text-slate-700 ring-1 ring-black/5">
    {children}
  </span>
);

type StatProps = {
  title: string;
  value: string | number;
  change: string;
  changePositive?: boolean;
  icon: React.ReactNode;
  accent: string;
};

const StatCard = ({
  title,
  value,
  change,
  changePositive = true,
  icon,
  accent,
}: StatProps) => (
  <div className="relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
    <div
      className={`absolute -right-10 -top-10 h-36 w-36 rounded-full bg-gradient-to-br ${accent} opacity-10`}
    />
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {title}
        </p>
        <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
        <div className="mt-2 flex items-center gap-2 text-sm">
          <span className={changePositive ? "text-emerald-600" : "text-rose-600"}>
            {changePositive ? "↑" : "↓"} {change}
          </span>
          <span className="text-slate-400">from last week</span>
        </div>
      </div>
      <div
        className={`grid h-10 w-10 place-content-center rounded-xl bg-gradient-to-br ${accent} text-white shadow`}
      >
        {icon}
      </div>
    </div>
  </div>
);

const AlertCard = ({
  title,
  desc,
  tone = "amber",
}: {
  title: string;
  desc: string;
  tone?: "rose" | "amber" | "sky";
}) => {
  const toneMap: Record<string, string> = {
    rose: "bg-rose-50 ring-rose-100",
    amber: "bg-amber-50 ring-amber-100",
    sky: "bg-sky-50 ring-sky-100",
  };
  const dotMap: Record<string, string> = {
    rose: "bg-rose-500",
    amber: "bg-amber-500",
    sky: "bg-sky-500",
  };
  return (
    <div className={`rounded-xl ${toneMap[tone]} p-4 ring-1 transition-all duration-200 hover:shadow-md`}>
      <div className="flex items-start gap-3">
        <span className={`mt-1 h-2.5 w-2.5 rounded-full ${dotMap[tone]}`} />
        <div>
          <p className="font-medium text-slate-800">{title}</p>
          <p className="mt-1 text-sm text-slate-600">{desc}</p>
        </div>
      </div>
    </div>
  );
};

const DataSourceCard = ({
  name,
  status,
}: {
  name: string;
  status: "Active" | "Synced" | "Running";
}) => (
  <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 transition-all duration-200 hover:shadow-md">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-content-center rounded-xl bg-slate-100">
          ⚙️
        </div>
        <div>
          <p className="font-medium text-slate-800">{name}</p>
          <div className="mt-1 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-slate-500">{status}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const QuickButton = ({ label }: { label: string }) => (
  <button className="rounded-2xl bg-indigo-600/90 px-4 py-2 text-sm font-medium text-white shadow hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all duration-200 hover:-translate-y-0.5">
    {label}
  </button>
);

/** ---------- Chart Data ---------- */
const dailyData = [
  { day: "Mon", value: 1240 },
  { day: "Tue", value: 860 },
  { day: "Wed", value: 1490 },
  { day: "Thu", value: 1550 },
  { day: "Fri", value: 720 },
  { day: "Sat", value: 410 },
  { day: "Sun", value: 1320 },
];

const salesData = [
  { month: "Jan", actual: 920, predicted: 980 },
  { month: "Feb", actual: 860, predicted: 900 },
  { month: "Mar", actual: 1040, predicted: 1010 },
  { month: "Apr", actual: 980, predicted: 1020 },
  { month: "May", actual: 1130, predicted: 1100 },
  { month: "Jun", actual: 990, predicted: 1050 },
];

export default function SalesDashboard() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Main Container */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-2 tracking-tight">
            Smart Inventory Dashboard
          </h1>
          
        </div>

        {/* Dashboard Content */}
        <div className="space-y-8">
          
          {/* KPI Cards */}
          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Predicted Demand"
              value="12,450"
              change="+18%"
              changePositive
              accent="from-cyan-500 to-blue-600"
              icon={<span role="img" aria-label="chart">📈</span>}
            />
            <StatCard
              title="Current Stock"
              value="8,760"
              change="-5%"
              changePositive={false}
              accent="from-emerald-500 to-lime-600"
              icon={<span role="img" aria-label="boxes">📦</span>}
            />
            <StatCard
              title="Active Alerts"
              value="5"
              change="Requires attention"
              changePositive
              accent="from-amber-500 to-orange-600"
              icon={<span role="img" aria-label="alert">⚠️</span>}
            />
            <StatCard
              title="ML Accuracy"
              value="94.2%"
              change="+2.3%"
              changePositive
              accent="from-purple-500 to-fuchsia-600"
              icon={<span role="img" aria-label="brain">🧠</span>}
            />
          </section>

          {/* Forecast + Alerts */}
          <section className="grid gap-6 xl:grid-cols-3">
            {/* Daily Demand Forecast */}
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5 xl:col-span-2 transition-all duration-300 hover:shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-900">
                  Daily Demand Forecast
                </h2>
                <div className="flex items-center gap-2 text-xs">
                  <Badge>7 Days</Badge>
                  <span className="text-slate-400 cursor-pointer hover:text-slate-600">30 Days</span>
                  <span className="text-slate-400 cursor-pointer hover:text-slate-600">90 Days</span>
                </div>
              </div>

              <div className="w-full rounded-xl bg-gradient-to-b from-indigo-50 to-white p-4" style={{ height: '300px', minHeight: '300px' }}>
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <BarChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="day" stroke="#64748b" style={{ fontSize: '0.875rem' }} />
                    <YAxis stroke="#64748b" style={{ fontSize: '0.875rem' }} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.75rem',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#818cf8" />
                        <stop offset="100%" stopColor="#6366f1" />
                      </linearGradient>
                    </defs>
                    <Bar dataKey="value" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Alerts Column */}
            <div className="space-y-4">
              <h2 className="px-1 text-lg font-semibold text-slate-900">Active Alerts</h2>
              <div className="space-y-3">
                <AlertCard title="Low Stock Alert" desc="Product SKU-2341 below reorder threshold" tone="rose" />
                <AlertCard title="High Demand Predicted" desc="Festival season spike expected in 3 days" tone="amber" />
                <AlertCard title="Weather Impact" desc="Rain forecast may affect sales patterns" tone="sky" />
              </div>
            </div>
          </section>

          {/* External Sources + Quick Actions */}
          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5 transition-all duration-300 hover:shadow-lg">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">External Data Sources</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <DataSourceCard name="Weather Data" status="Active" />
                <DataSourceCard name="Festival Events" status="Active" />
                <DataSourceCard name="Sales Data" status="Synced" />
                <DataSourceCard name="ML Engine" status="Running" />
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5 transition-all duration-300 hover:shadow-lg">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
              <div className="flex flex-wrap gap-3">
                <QuickButton label="🛒 New Order" />
                <QuickButton label="✏️ Update Stock" />
                <QuickButton label="📤 Export Report" />
                <QuickButton label="⚙️ Settings" />
              </div>
            </div>
          </section>

          {/* Sales Prediction vs Actual */}
          <section>
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5 transition-all duration-300 hover:shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Sales Prediction vs Actual</h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Comparison of predicted and actual sales performance
                  </p>
                </div>
                <button className="rounded-xl border-2 border-indigo-200 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-50 transition-colors duration-200">
                  Export
                </button>
              </div>

              <div className="w-full rounded-xl bg-gradient-to-b from-slate-50 to-white p-4" style={{ height: '350px', minHeight: '350px' }}>
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#64748b" style={{ fontSize: '0.875rem' }} />
                    <YAxis stroke="#64748b" style={{ fontSize: '0.875rem' }} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.75rem',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '20px' }}
                      iconType="square"
                    />
                    <defs>
                      <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#818cf8" />
                        <stop offset="100%" stopColor="#6366f1" />
                      </linearGradient>
                      <linearGradient id="predictedGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#34d399" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                    </defs>
                    <Bar dataKey="actual" fill="url(#actualGradient)" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="predicted" fill="url(#predictedGradient)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

        </div>
      </div>

      {/* Footer */}
      <footer className="mx-auto max-w-7xl px-4 py-8 text-center">
        <p className="text-xs text-slate-500">
          Smart Inventory Dashboard • Powered by AI • Replace with live data via API
        </p>
      </footer>
    </div>
  );
}