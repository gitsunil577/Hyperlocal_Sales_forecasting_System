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
  accent: string; // e.g. "from-cyan-500 to-blue-600"
};

const StatCard = ({
  title,
  value,
  change,
  changePositive = true,
  icon,
  accent,
}: StatProps) => (
  <div className="relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
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
    <div className={`rounded-xl ${toneMap[tone]} p-4 ring-1`}>
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
  <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-content-center rounded-xl bg-slate-100">
          ⚙️
        </div>
        <div>
          <p className="font-medium text-slate-800">{name}</p>
          <div className="mt-1 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-xs text-slate-500">{status}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const QuickButton = ({ label }: { label: string }) => (
  <button className="rounded-2xl bg-indigo-600/90 px-4 py-2 text-sm font-medium text-white shadow hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400">
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-200/70 via-indigo-200/40 to-purple-200/70 p-4 sm:p-6 lg:p-8">
      {/* Top bar */}
      <header className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between rounded-2xl bg-white/70 p-4 shadow-sm ring-1 ring-black/5 backdrop-blur">
          <h1 className="text-lg font-semibold text-slate-900 sm:text-xl">
            Smart Inventory Dashboard
          </h1>
          <div className="flex items-center gap-3">
            <Badge>5 alerts</Badge>
            <div className="grid h-9 w-9 place-content-center rounded-full bg-slate-800 text-xs font-semibold text-white">
              VU
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto mt-6 max-w-7xl space-y-6">
        {/* KPI Cards */}
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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

        {/* === Forecast + Alerts === */}
        <section className="grid gap-4 xl:grid-cols-3">
          {/* Daily Demand Forecast */}
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 xl:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">
                Daily Demand Forecast
              </h2>
              <div className="flex items-center gap-2 text-xs">
                <Badge>7 Days</Badge>
                <span className="text-slate-400">30 Days</span>
                <span className="text-slate-400">90 Days</span>
              </div>
            </div>

            <div className="mt-6 h-64 rounded-xl bg-gradient-to-b from-indigo-50 to-white p-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip />
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

          {/* Alerts */}
          <div className="space-y-3">
            <h2 className="px-1 text-base font-semibold text-slate-900">Active Alerts</h2>
            <AlertCard title="Low Stock Alert" desc="Product SKU-2341 below reorder threshold" tone="rose" />
            <AlertCard title="High Demand Predicted" desc="Festival season spike expected in 3 days" tone="amber" />
            <AlertCard title="Weather Impact" desc="Rain forecast may affect sales patterns" tone="sky" />
          </div>
        </section>

        {/* === External sources + Quick actions === */}
        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
            <h2 className="text-base font-semibold text-slate-900">External Data Sources</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <DataSourceCard name="Weather Data" status="Active" />
              <DataSourceCard name="Festival Events" status="Active" />
              <DataSourceCard name="Sales Data" status="Synced" />
              <DataSourceCard name="ML Engine" status="Running" />
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
            <h2 className="text-base font-semibold text-slate-900">Quick Actions</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              <QuickButton label="🛒 New Order" />
              <QuickButton label="✏️ Update Stock" />
              <QuickButton label="📤 Export Report" />
              <QuickButton label="⚙️ Settings" />
            </div>
          </div>
        </section>

        {/* === Sales Prediction vs Actual === */}
        <section className="mt-6">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Sales Prediction vs Actual</h2>
                <p className="text-sm text-slate-500">
                  Comparison of predicted and actual sales performance
                </p>
              </div>
              <button className="rounded-xl border border-indigo-300 px-3 py-1.5 text-sm text-indigo-700">
                Export
              </button>
            </div>

            <div style={{ width: "100%", height: 320 }}>
  <BarChart width={600} height={300} data={salesData}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="month" />
    <YAxis />
    <Tooltip />
    <Legend />
    <Bar dataKey="actual" fill="#6366f1" />
    <Bar dataKey="predicted" fill="#10b981" />
  </BarChart>
</div>

          </div>
        </section>
      </main>

      <footer className="mx-auto mt-8 max-w-7xl pb-8 text-center text-xs text-slate-500">
        UI demo • Replace with live data via API later.
      </footer>
    </div>
  );
}
