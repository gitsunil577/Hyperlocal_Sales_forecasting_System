"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  ReferenceLine,
  Cell,
  LabelList,
} from "recharts";
import {
  DollarSign,
  TrendingUp,
  Star,
  Package,
  BarChart2,
  Clock,
  ChevronDown,
  RefreshCw,
  Database,
  Layers,
  Calendar,
  History,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import "./salesdashboard.css";
import { apiClient } from "@/lib/api-client";
import { getDisplayName } from "@/lib/product-mapping";
import LoadingSpinner from "@/app/components/LoadingSpinner";

/* ─── KPI Card (horizontal compact) ──────────────── */
type KpiCardProps = {
  title: string;
  value: string | number;
  sub: string;
  icon: React.ReactNode;
  iconClass: string;
  trend?: { up: boolean; label: string } | null;
  delay?: number;
};

const KpiCard = ({
  title,
  value,
  sub,
  icon,
  iconClass,
  trend,
  delay = 0,
}: KpiCardProps) => (
  <div className="kpi-card" style={{ animationDelay: `${delay}s` }}>
    <div className={`kpi-icon ${iconClass}`}>{icon}</div>
    <div className="kpi-body">
      <p className="kpi-value">{value}</p>
      <p className="kpi-title">{title}</p>
      <p className="kpi-sub">{sub}</p>
    </div>
    {trend && (
      <span className={`kpi-trend ${trend.up ? "up" : "down"}`}>
        {trend.up ? "↑" : "↓"} {trend.label}
      </span>
    )}
  </div>
);

/* ─── Number formatter helpers ───────────────────── */
const fmtK = (v: number) =>
  v >= 1_000_000
    ? `${(v / 1_000_000).toFixed(1)}M`
    : v >= 1_000
    ? `${(v / 1_000).toFixed(0)}K`
    : `${v}`;

/* ─── Main Dashboard ─────────────────────────────── */
export default function SalesDashboard() {
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<{ name: string; units: number }[]>([]);
  const [productFamilies, setProductFamilies] = useState<string[]>([]);
  const [selectedFamily, setSelectedFamily] = useState("BREAD/BAKERY");
  const [dataSummary, setDataSummary] = useState<any>(null);

  const fetchDashboardData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);

      const [productsResp, summaryResp] = await Promise.all([
        apiClient.getProducts(),
        apiClient.getDataSummary(),
      ]);

      const families: string[] = productsResp.products || [];
      setProductFamilies(families);
      if (summaryResp.success) setDataSummary(summaryResp.data);

      const salesResp = await apiClient.getSalesData({ product_family: selectedFamily });
      if (salesResp.success && salesResp.data) {
        const sorted = salesResp.data.sort(
          (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        setRecentSales(
          sorted.slice(-7).map((r: any) => ({
            day: new Date(r.date).toLocaleDateString("en-US", { weekday: "short" }),
            date: r.date,
            sales: Math.round(r.sales || 0),
          }))
        );
      }

      const familySalesPromises = families.map(async (family: string) => {
        try {
          const resp = await apiClient.getSalesData({ product_family: family });
          if (resp.success && resp.data) {
            const sorted = resp.data.sort(
              (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()
            );
            const totalUnits = sorted
              .slice(-30)
              .reduce((sum: number, r: any) => sum + (r.sales || 0), 0);
            return { name: getDisplayName(family), units: Math.round(totalUnits) };
          }
          return { name: getDisplayName(family), units: 0 };
        } catch {
          return { name: getDisplayName(family), units: 0 };
        }
      });

      const familySales = await Promise.all(familySalesPromises);
      setTopProducts(familySales.sort((a, b) => b.units - a.units).slice(0, 5));
    } catch {
      // Backend offline — shell banner already notifies user; show empty dashboard silently
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchDashboardData(true);
    setIsRefreshing(false);
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
        changePct: 0,
        bestProductName: topProducts[0]?.name || "N/A",
        bestProductUnits: topProducts[0]?.units || 0,
        productCount: productFamilies.length,
      };
    }
    const latestSales = recentSales[recentSales.length - 1]?.sales || 0;
    const totalSales = recentSales.reduce((s, d) => s + d.sales, 0);
    const avgDaily = Math.round(totalSales / recentSales.length);
    const mid = Math.floor(recentSales.length / 2);
    const firstHalf = recentSales.slice(0, mid).reduce((s, d) => s + d.sales, 0);
    const secondHalf = recentSales.slice(mid).reduce((s, d) => s + d.sales, 0);
    const changePct =
      firstHalf > 0 ? Math.round(((secondHalf - firstHalf) / firstHalf) * 100) : 0;
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

  const BAR_COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6"];

  if (loading) return <LoadingSpinner message="Loading dashboard data…" />;

  const selectedName = getDisplayName(selectedFamily);

  return (
    <div className="dash-page">
      <div className="dash-container">

        {/* ── Page Header ──────────────────────────────── */}
        <header className="dash-header">
          <div className="dash-header-left">
            <div className="dash-live-pill">
              <span className="dash-live-dot" />
              LIVE
            </div>
            <h1 className="dash-title">Vendor Dashboard</h1>
            <p className="dash-subtitle">
              Sales data &middot; product performance &middot; forecasts
            </p>
          </div>

          <div className="dash-header-right">
            <div className="dash-time">
              <Clock size={12} />
              Updated just now
            </div>

            <div className="dash-select-wrap">
              <select
                value={selectedFamily}
                onChange={(e) => setSelectedFamily(e.target.value)}
                className="dash-select"
              >
                {productFamilies.map((f) => (
                  <option key={f} value={f}>
                    {getDisplayName(f)}
                  </option>
                ))}
              </select>
              <ChevronDown size={13} className="dash-select-icon" />
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="dash-refresh"
            >
              <RefreshCw size={13} className={isRefreshing ? "spin" : ""} />
              {isRefreshing ? "Refreshing…" : "Refresh"}
            </button>
          </div>
        </header>

        {/* ── KPI Grid ─────────────────────────────────── */}
        <div className="kpi-grid">
          <KpiCard
            title="Latest Day Sales"
            value={summary.latestSales.toLocaleString()}
            sub={`units · ${selectedName}`}
            icon={<DollarSign size={18} />}
            iconClass="icon-cyan"
            delay={0}
          />
          <KpiCard
            title="7-Day Total"
            value={summary.totalSales.toLocaleString()}
            sub="units this week"
            icon={<TrendingUp size={18} />}
            iconClass="icon-emerald"
            trend={{
              up: summary.changePct >= 0,
              label: `${Math.abs(summary.changePct)}%`,
            }}
            delay={0.06}
          />
          <KpiCard
            title="Best-Selling Category"
            value={summary.bestProductName}
            sub={`${summary.bestProductUnits.toLocaleString()} units (30d)`}
            icon={<Star size={18} />}
            iconClass="icon-purple"
            delay={0.12}
          />
          <KpiCard
            title="Product Categories"
            value={summary.productCount}
            sub="perishable families"
            icon={<Package size={18} />}
            iconClass="icon-amber"
            delay={0.18}
          />
          <KpiCard
            title="Avg Daily Demand"
            value={summary.avgDaily.toLocaleString()}
            sub={`units/day · ${selectedName}`}
            icon={<BarChart2 size={18} />}
            iconClass="icon-sky"
            delay={0.24}
          />
        </div>

        {/* ── Charts Row ───────────────────────────────── */}
        <div className="charts-row">

          {/* Area Chart */}
          <div className="chart-panel">
            <div className="panel-header">
              <div>
                <p className="panel-title">Sales Trend &mdash; {selectedName}</p>
                <p className="panel-sub">Last 7 data points &middot; daily units sold</p>
              </div>
              <span className="units-badge">Units Sold</span>
            </div>
            <div className="chart-area">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={recentSales}
                  margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                    width={52}
                    tickFormatter={(v) =>
                      v >= 1000 ? `${(v / 1000).toFixed(0)}K` : `${v}`
                    }
                  />
                  <Tooltip
                    contentStyle={{
                      background: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: 10,
                      fontSize: 13,
                      boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                    }}
                    cursor={{ stroke: "#e2e8f0", strokeWidth: 1 }}
                  />
                  <ReferenceLine
                    y={summary.avgDaily}
                    stroke="#c7d2fe"
                    strokeDasharray="4 4"
                    label={{
                      value: "Avg",
                      position: "right",
                      fontSize: 10,
                      fill: "#94a3b8",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fill="url(#salesGrad)"
                    dot={{ r: 3.5, fill: "white", stroke: "#6366f1", strokeWidth: 2 }}
                    activeDot={{ r: 5, fill: "#6366f1", stroke: "white", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Dataset Info Panel */}
          <div className="dataset-panel">
            <div className="ds-header">
              <Database size={15} />
              Dataset Info
            </div>
            <div className="ds-body">
              {dataSummary ? (
                <>
                  <div className="ds-row">
                    <div className="ds-icon ds-icon-sky">
                      <Database size={14} />
                    </div>
                    <div className="ds-text">
                      <p className="ds-label">Total Records</p>
                      <p className="ds-value">
                        {dataSummary.total_records?.toLocaleString() || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="ds-row">
                    <div className="ds-icon ds-icon-amber">
                      <Layers size={14} />
                    </div>
                    <div className="ds-text">
                      <p className="ds-label">Product Families</p>
                      <p className="ds-value">
                        {dataSummary.num_families || productFamilies.length}{" "}
                        <span className="ds-value-note">categories</span>
                      </p>
                    </div>
                  </div>
                  <div className="ds-row">
                    <div className="ds-icon ds-icon-indigo">
                      <Calendar size={14} />
                    </div>
                    <div className="ds-text">
                      <p className="ds-label">Date Range</p>
                      <p className="ds-value" style={{ fontSize: "0.8125rem" }}>
                        {dataSummary.date_range?.start || "N/A"}
                        <br />
                        <span className="ds-value-note">to</span>{" "}
                        {dataSummary.date_range?.end || "N/A"}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="ds-row">
                  <div className="ds-icon ds-icon-amber">
                    <TrendingUp size={14} />
                  </div>
                  <div className="ds-text">
                    <p className="ds-label">Tip</p>
                    <p className="ds-value" style={{ fontSize: "0.8rem", fontWeight: 400 }}>
                      Train a model in Forecast to unlock predictions.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Bar Chart ────────────────────────────────── */}
        <div className="chart-panel">
          <div className="panel-header">
            <div>
              <p className="panel-title">Top Product Categories</p>
              <p className="panel-sub">
                Most sold by units &middot; last 30 data points per category
              </p>
            </div>
          </div>
          <div className="chart-area-tall">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topProducts}
                margin={{ top: 28, right: 16, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f1f5f9"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  width={52}
                  tickFormatter={fmtK}
                />
                <Tooltip
                  contentStyle={{
                    background: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: 10,
                    fontSize: 13,
                    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                  }}
                  cursor={{ fill: "rgba(99,102,241,0.04)" }}
                />
                <Bar dataKey="units" radius={[6, 6, 0, 0]}>
                  {topProducts.map((_, i) => (
                    <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                  ))}
                  <LabelList
                    dataKey="units"
                    position="top"
                    style={{ fontSize: 10, fontWeight: 700, fill: "#475569" }}
                    formatter={(v: any) => fmtK(Number(v))}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Quick Navigation ─────────────────────────── */}
        <div>
          <p className="qnav-heading">Quick Navigation</p>
          <div className="qnav-grid">
            <Link href="/dashboard/forecast" className="qnav-card qnav-purple">
              <div className="qnav-icon">
                <TrendingUp size={18} />
              </div>
              <div className="qnav-text">
                <span className="qnav-label">Forecast</span>
                <span className="qnav-sub">Train ML models</span>
              </div>
              <ArrowRight size={15} className="qnav-arrow" />
            </Link>

            <Link href="/dashboard/history" className="qnav-card qnav-blue">
              <div className="qnav-icon">
                <History size={18} />
              </div>
              <div className="qnav-text">
                <span className="qnav-label">Sales History</span>
                <span className="qnav-sub">View past records</span>
              </div>
              <ArrowRight size={15} className="qnav-arrow" />
            </Link>

            <Link href="/inventory" className="qnav-card qnav-orange">
              <div className="qnav-icon">
                <Package size={18} />
              </div>
              <div className="qnav-text">
                <span className="qnav-label">Inventory</span>
                <span className="qnav-sub">Stock &amp; reorder</span>
              </div>
              <ArrowRight size={15} className="qnav-arrow" />
            </Link>

            <Link href="/dashboard/analytics" className="qnav-card qnav-green">
              <div className="qnav-icon">
                <BarChart2 size={18} />
              </div>
              <div className="qnav-text">
                <span className="qnav-label">Analytics</span>
                <span className="qnav-sub">Anomaly detection</span>
              </div>
              <ArrowRight size={15} className="qnav-arrow" />
            </Link>
          </div>
        </div>

        <footer className="dash-footer">
          SalesForecast &mdash; Live data via Flask backend &mdash; &copy; 2026
        </footer>
      </div>
    </div>
  );
}
