"use client";

import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import "./salesdashboard.css";

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
          <span className="text-slate-400">vs last week</span>
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

/** ---------- Data (Demo) ---------- */
const last7DaysSales = [
  { day: "Mon", revenue: 3100, units: 42 },
  { day: "Tue", revenue: 4300, units: 58 },
  { day: "Wed", revenue: 3900, units: 51 },
  { day: "Thu", revenue: 5600, units: 76 },
  { day: "Fri", revenue: 5200, units: 69 },
  { day: "Sat", revenue: 6400, units: 88 },
  { day: "Sun", revenue: 4800, units: 61 },
];

const top5Products = [
  { name: "Milk", units: 120 },
  { name: "Bread", units: 92 },
  { name: "Eggs", units: 84 },
  { name: "Curd", units: 73 },
  { name: "Banana", units: 66 },
];

const lowStockList = [
  { sku: "Bread (SKU-2341)", note: "Below reorder threshold" },
  { sku: "Curd (SKU-2210)", note: "Only 5 packs left" },
  { sku: "Eggs (SKU-1102)", note: "Demand rising, stock low" },
];

export default function SalesDashboard() {
  const summary = useMemo(() => {
    const today = last7DaysSales[last7DaysSales.length - 1];

    const thisWeekRevenue = last7DaysSales.reduce((s, d) => s + d.revenue, 0);
    const lastWeekRevenue = Math.round(thisWeekRevenue * 0.88);
    const weekChangePct =
      lastWeekRevenue === 0 ? 0 : Math.round(((thisWeekRevenue - lastWeekRevenue) / lastWeekRevenue) * 100);

    const bestProduct = top5Products[0];

    const thisWeekUnits = last7DaysSales.reduce((s, d) => s + d.units, 0);
    const next7DaysForecastUnits = Math.round(thisWeekUnits * 1.06);
    const forecastDailyAvg = Math.round(next7DaysForecastUnits / 7);

    return {
      todayRevenue: today.revenue,
      todayUnits: today.units,
      weekChangePct,
      bestProductName: bestProduct.name,
      bestProductUnits: bestProduct.units,
      lowStockCount: lowStockList.length,
      next7DaysForecastUnits,
      forecastDailyAvg,
    };
  }, []);

  return (
    <div className="w-full">

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-2 tracking-tight">
            Vendor Dashboard
          </h1>
          <p className="text-sm text-slate-600">
            Daily sales, weekly comparison, product performance, stock alerts & forecast.
          </p>
        </div>

        <div className="space-y-8">
          {/* KPI Cards (Vendor Requirements) */}
          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
            <StatCard
              title="Today’s Sales"
              value={`₹${summary.todayRevenue.toLocaleString("en-IN")} • ${summary.todayUnits} units`}
              change="+"
              changePositive
              accent="from-cyan-500 to-blue-600"
              icon={<span role="img" aria-label="money">💰</span>}
            />
            <StatCard
              title="This Week vs Last Week"
              value={`${summary.weekChangePct}%`}
              change={`${summary.weekChangePct >= 0 ? "+" : ""}${summary.weekChangePct}%`}
              changePositive={summary.weekChangePct >= 0}
              accent="from-emerald-500 to-lime-600"
              icon={<span role="img" aria-label="trend">📈</span>}
            />
            <StatCard
              title="Best-selling product (today)"
              value={summary.bestProductName}
              change={`${summary.bestProductUnits} units (top list)`}
              changePositive
              accent="from-purple-500 to-fuchsia-600"
              icon={<span role="img" aria-label="star">⭐</span>}
            />
            <StatCard
              title="Low stock alerts"
              value={`${summary.lowStockCount}`}
              change="Needs attention"
              changePositive={false}
              accent="from-amber-500 to-orange-600"
              icon={<span role="img" aria-label="alert">⚠️</span>}
            />
            <StatCard
              title="Next 7 days forecast"
              value={`${summary.next7DaysForecastUnits} units`}
              change={`~${summary.forecastDailyAvg}/day`}
              changePositive
              accent="from-sky-500 to-indigo-600"
              icon={<span role="img" aria-label="forecast">🔮</span>}
            />
          </section>

          {/* Mini Trend + Alerts */}
          <section className="grid gap-6 xl:grid-cols-3">
            {/* Mini trend chart (line) */}
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5 xl:col-span-2 transition-all duration-300 hover:shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-900">
                  Mini Trend (Last 7 days)
                </h2>
                <div className="flex items-center gap-2 text-xs">
                  <Badge>Revenue</Badge>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-500">₹</span>
                </div>
              </div>

              <div className="w-full rounded-xl bg-gradient-to-b from-indigo-50 to-white p-4" style={{ height: "300px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={last7DaysSales}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="day" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "0.75rem",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Line type="monotone" dataKey="revenue" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Low stock alerts list */}
            <div className="space-y-4">
              <h2 className="px-1 text-lg font-semibold text-slate-900">Low Stock Alerts</h2>
              <div className="space-y-3">
                {lowStockList.map((item) => (
                  <AlertCard
                    key={item.sku}
                    title="Low Stock"
                    desc={`${item.sku} • ${item.note}`}
                    tone="rose"
                  />
                ))}
              </div>
            </div>
          </section>

          {/* Top 5 products */}
          <section>
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5 transition-all duration-300 hover:shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Top 5 Products</h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Most sold products by units (last 7 days)
                  </p>
                </div>
              </div>

              <div className="w-full rounded-xl bg-gradient-to-b from-slate-50 to-white p-4" style={{ height: "350px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={top5Products}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "0.75rem",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="units" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>
        </div>
      </div>

      <footer className="mx-auto max-w-7xl px-4 py-8 text-center">
        <p className="text-xs text-slate-500">
          Vendor Dashboard • Replace demo data with live API data
        </p>
      </footer>
    </div>
  );
}
