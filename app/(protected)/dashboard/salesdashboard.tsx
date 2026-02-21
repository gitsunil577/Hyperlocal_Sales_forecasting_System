"use client";

import React, { useEffect, useMemo, useState } from "react";
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
import { apiClient } from "@/lib/api-client";
import { getDisplayName } from "@/lib/product-mapping";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import ErrorBanner from "@/app/components/ErrorBanner";

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
          <span className="text-slate-400">vs prior period</span>
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

export default function SalesDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<{ name: string; units: number }[]>([]);
  const [productFamilies, setProductFamilies] = useState<string[]>([]);
  const [selectedFamily, setSelectedFamily] = useState("BREAD/BAKERY");
  const [dataSummary, setDataSummary] = useState<any>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch products and summary in parallel
      const [productsResp, summaryResp] = await Promise.all([
        apiClient.getProducts(),
        apiClient.getDataSummary(),
      ]);

      const families: string[] = productsResp.products || [];
      setProductFamilies(families);
      if (summaryResp.success) setDataSummary(summaryResp.data);

      // Fetch sales data for selected product family
      const salesResp = await apiClient.getSalesData({
        product_family: selectedFamily,
      });

      if (salesResp.success && salesResp.data) {
        // Take the last 7 data points for the trend chart
        const sorted = salesResp.data.sort(
          (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        const last7 = sorted.slice(-7);
        setRecentSales(
          last7.map((r: any) => {
            const d = new Date(r.date);
            const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
            return { day: dayName, date: r.date, sales: Math.round(r.sales || 0) };
          })
        );
      }

      // Fetch sales for all families to build top 5
      const familySalesPromises = families.map(async (family: string) => {
        try {
          const resp = await apiClient.getSalesData({ product_family: family });
          if (resp.success && resp.data) {
            // Sum the last 30 records of sales for this family
            const sorted = resp.data.sort(
              (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()
            );
            const recent = sorted.slice(-30);
            const totalUnits = recent.reduce((sum: number, r: any) => sum + (r.sales || 0), 0);
            return { name: getDisplayName(family), units: Math.round(totalUnits) };
          }
          return { name: getDisplayName(family), units: 0 };
        } catch {
          return { name: getDisplayName(family), units: 0 };
        }
      });

      const familySales = await Promise.all(familySalesPromises);
      const top5 = familySales.sort((a, b) => b.units - a.units).slice(0, 5);
      setTopProducts(top5);
    } catch (err: any) {
      console.error("Dashboard fetch error:", err);
      setError(err.message || "Failed to load dashboard data. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedFamily]);

  const summary = useMemo(() => {
    if (!recentSales.length) {
      return {
        latestSales: 0,
        totalSales: 0,
        avgDaily: 0,
        bestProductName: topProducts[0]?.name || "N/A",
        bestProductUnits: topProducts[0]?.units || 0,
        productCount: productFamilies.length,
      };
    }

    const latestSales = recentSales[recentSales.length - 1]?.sales || 0;
    const totalSales = recentSales.reduce((s, d) => s + d.sales, 0);
    const avgDaily = Math.round(totalSales / recentSales.length);

    // Compare first half vs second half for trend
    const mid = Math.floor(recentSales.length / 2);
    const firstHalf = recentSales.slice(0, mid).reduce((s, d) => s + d.sales, 0);
    const secondHalf = recentSales.slice(mid).reduce((s, d) => s + d.sales, 0);
    const changePct = firstHalf > 0 ? Math.round(((secondHalf - firstHalf) / firstHalf) * 100) : 0;

    return {
      latestSales,
      totalSales,
      avgDaily,
      changePct,
      bestProductName: topProducts[0]?.name || "N/A",
      bestProductUnits: topProducts[0]?.units || 0,
      productCount: productFamilies.length,
    };
  }, [recentSales, topProducts, productFamilies]);

  if (loading) return <LoadingSpinner message="Loading dashboard data from backend..." />;
  if (error) return <ErrorBanner message={error} onRetry={fetchDashboardData} />;

  return (
    <div className="w-full">

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-2 tracking-tight">
              Vendor Dashboard
            </h1>
            <p className="text-sm text-slate-600">
              Live data from backend API — sales, product performance & forecasts.
            </p>
          </div>

          {/* Product Family Selector */}
          <select
            value={selectedFamily}
            onChange={(e) => setSelectedFamily(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: 12,
              border: "1px solid #e2e8f0",
              fontWeight: 700,
              fontSize: 14,
              color: "#0f172a",
              background: "white",
            }}
          >
            {productFamilies.map((f) => (
              <option key={f} value={f}>
                {getDisplayName(f)}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-8">
          {/* KPI Cards */}
          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
            <StatCard
              title="Latest Day Sales"
              value={`${summary.latestSales.toLocaleString()} units`}
              change={`${getDisplayName(selectedFamily)}`}
              changePositive
              accent="from-cyan-500 to-blue-600"
              icon={<span role="img" aria-label="money">💰</span>}
            />
            <StatCard
              title="7-Day Total"
              value={`${summary.totalSales.toLocaleString()} units`}
              change={`${(summary as any).changePct ?? 0}%`}
              changePositive={((summary as any).changePct ?? 0) >= 0}
              accent="from-emerald-500 to-lime-600"
              icon={<span role="img" aria-label="trend">📈</span>}
            />
            <StatCard
              title="Best-Selling Category"
              value={summary.bestProductName}
              change={`${summary.bestProductUnits.toLocaleString()} units (30d)`}
              changePositive
              accent="from-purple-500 to-fuchsia-600"
              icon={<span role="img" aria-label="star">⭐</span>}
            />
            <StatCard
              title="Product Categories"
              value={`${summary.productCount}`}
              change="Perishable items tracked"
              changePositive
              accent="from-amber-500 to-orange-600"
              icon={<span role="img" aria-label="products">📦</span>}
            />
            <StatCard
              title="Avg Daily Demand"
              value={`${summary.avgDaily} units`}
              change={`${getDisplayName(selectedFamily)}`}
              changePositive
              accent="from-sky-500 to-indigo-600"
              icon={<span role="img" aria-label="forecast">🔮</span>}
            />
          </section>

          {/* Mini Trend + Info */}
          <section className="grid gap-6 xl:grid-cols-3">
            {/* Mini trend chart (line) */}
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5 xl:col-span-2 transition-all duration-300 hover:shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-900">
                  Sales Trend — {getDisplayName(selectedFamily)} (Last 7 data points)
                </h2>
                <div className="flex items-center gap-2 text-xs">
                  <Badge>Units Sold</Badge>
                </div>
              </div>

              <div className="w-full rounded-xl bg-gradient-to-b from-indigo-50 to-white p-4" style={{ height: "300px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={recentSales}>
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
                    <Line type="monotone" dataKey="sales" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Data Info */}
            <div className="space-y-4">
              <h2 className="px-1 text-lg font-semibold text-slate-900">Dataset Info</h2>
              {dataSummary ? (
                <div className="space-y-3">
                  <AlertCard
                    title="Total Records"
                    desc={`${dataSummary.total_records?.toLocaleString() || "N/A"} sales records in dataset`}
                    tone="sky"
                  />
                  <AlertCard
                    title="Product Families"
                    desc={`${dataSummary.num_families || productFamilies.length} perishable categories tracked`}
                    tone="amber"
                  />
                  <AlertCard
                    title="Date Range"
                    desc={`${dataSummary.date_range?.start || "N/A"} to ${dataSummary.date_range?.end || "N/A"}`}
                    tone="sky"
                  />
                </div>
              ) : (
                <AlertCard
                  title="Tip"
                  desc="Train a model in the Forecast page to unlock predictions and inventory alerts."
                  tone="amber"
                />
              )}
            </div>
          </section>

          {/* Top 5 products */}
          <section>
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5 transition-all duration-300 hover:shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Top Product Categories</h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Most sold categories by units (last 30 data points per category)
                  </p>
                </div>
              </div>

              <div className="w-full rounded-xl bg-gradient-to-b from-slate-50 to-white p-4" style={{ height: "350px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProducts}>
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
          Vendor Dashboard — Live data from Flask backend API
        </p>
      </footer>
    </div>
  );
}
