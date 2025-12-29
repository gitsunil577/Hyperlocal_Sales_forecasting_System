"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Legend,
} from "recharts";

type HistoryItem = {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

type HistoryEntry = {
  id: number;
  saleDate: string; // YYYY-MM-DD
  note?: string;
  items: HistoryItem[];
  totalUnits: number;
  totalAmount: number;
};

const HISTORY_KEY = "sf_sales_history_v1";

type Preset = "7d" | "1m" | "custom";

function parseISO(d: string) {
  return new Date(d + "T00:00:00");
}

function toISO(date: Date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function todayISO() {
  return toISO(new Date());
}

function daysAgoISO(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return toISO(d);
}

function weekdayShort(iso: string) {
  return parseISO(iso).toLocaleDateString(undefined, { weekday: "short" });
}

export default function VendorAnalyticsPage() {
  const [preset, setPreset] = useState<Preset>("7d");
  const [from, setFrom] = useState<string>(daysAgoISO(6));
  const [to, setTo] = useState<string>(todayISO());

  const [data, setData] = useState<HistoryEntry[]>([]);

  // Load history
  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      setData(Array.isArray(parsed) ? parsed : []);
    } catch {
      setData([]);
    }
  }, []);

  // Preset -> date range
  useEffect(() => {
    if (preset === "7d") {
      setFrom(daysAgoISO(6));
      setTo(todayISO());
    }
    if (preset === "1m") {
      setFrom(daysAgoISO(30));
      setTo(todayISO());
    }
  }, [preset]);

  const filtered = useMemo(() => {
    const f = parseISO(from);
    const t = parseISO(to);
    return data
      .filter((e) => {
        const d = parseISO(e.saleDate);
        return d >= f && d <= t;
      })
      .sort((a, b) => (a.saleDate > b.saleDate ? 1 : -1));
  }, [data, from, to]);

  // KPI + Aggregations
  const analytics = useMemo(() => {
    const totalRevenue = filtered.reduce((a, e) => a + (e.totalAmount || 0), 0);
    const totalUnits = filtered.reduce((a, e) => a + (e.totalUnits || 0), 0);

    const uniqueDays = new Set(filtered.map((e) => e.saleDate)).size || 1;
    const avgDailyRevenue = totalRevenue / uniqueDays;

    // best product by revenue
    const productRevenue = new Map<string, { name: string; revenue: number; units: number }>();
    filtered.forEach((entry) => {
      entry.items.forEach((it) => {
        const key = it.productId || it.productName;
        const prev = productRevenue.get(key) || { name: it.productName, revenue: 0, units: 0 };
        productRevenue.set(key, {
          name: it.productName,
          revenue: prev.revenue + (it.total || 0),
          units: prev.units + (it.quantity || 0),
        });
      });
    });

    let best = { name: "—", revenue: 0, units: 0 };
    for (const v of productRevenue.values()) {
      if (v.revenue > best.revenue) best = v;
    }

    // Daily revenue series
    const dailyRevenue = filtered.map((e) => ({
      date: e.saleDate,
      revenue: Number((e.totalAmount || 0).toFixed(2)),
      units: e.totalUnits || 0,
    }));

    // Top products by revenue
    const topProducts = Array.from(productRevenue.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8)
      .map((p) => ({
        product: p.name.length > 16 ? p.name.slice(0, 16) + "…" : p.name,
        revenue: Number(p.revenue.toFixed(2)),
        units: p.units,
      }));

    // Revenue by weekday
    const weekdayAgg = new Map<string, number>();
    filtered.forEach((e) => {
      const w = weekdayShort(e.saleDate);
      weekdayAgg.set(w, (weekdayAgg.get(w) || 0) + (e.totalAmount || 0));
    });

    const weekdayOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const revenueByWeekday = weekdayOrder.map((w) => ({
      weekday: w,
      revenue: Number(((weekdayAgg.get(w) || 0)).toFixed(2)),
    }));

    return {
      totalRevenue,
      totalUnits,
      avgDailyRevenue,
      bestProduct: best,
      dailyRevenue,
      topProducts,
      revenueByWeekday,
      daysCount: uniqueDays,
    };
  }, [filtered]);

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: "#0f172a" }}>Analytics</h1>
          <p style={{ marginTop: 6, color: "#64748b", fontWeight: 600 }}>
            Charts are generated from Sales History stored locally (for now).
          </p>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "end" }}>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 900, color: "#334155" }}>
              Range
            </label>
            <select
              value={preset}
              onChange={(e) => setPreset(e.target.value as Preset)}
              style={{ marginTop: 8, borderRadius: 12, border: "1px solid #e2e8f0", padding: "10px 12px", background: "white" }}
            >
              <option value="7d">Last 7 Days</option>
              <option value="1m">Last 1 Month</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 900, color: "#334155" }}>
              From
            </label>
            <input
              type="date"
              value={from}
              onChange={(e) => {
                setPreset("custom");
                setFrom(e.target.value);
              }}
              style={{ marginTop: 8, borderRadius: 12, border: "1px solid #e2e8f0", padding: "10px 12px" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 900, color: "#334155" }}>
              To
            </label>
            <input
              type="date"
              value={to}
              onChange={(e) => {
                setPreset("custom");
                setTo(e.target.value);
              }}
              style={{ marginTop: 8, borderRadius: 12, border: "1px solid #e2e8f0", padding: "10px 12px" }}
            />
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ marginTop: 16, display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        <KPI title="Total Revenue" value={`₹ ${analytics.totalRevenue.toFixed(2)}`} subtitle={`${analytics.daysCount} day(s)`} />
        <KPI title="Total Units" value={`${analytics.totalUnits}`} subtitle="Units sold" />
        <KPI title="Avg Daily Revenue" value={`₹ ${analytics.avgDailyRevenue.toFixed(2)}`} subtitle="Per day" />
        <KPI title="Best-selling Product" value={analytics.bestProduct.name} subtitle={`₹ ${analytics.bestProduct.revenue.toFixed(2)}`} />
      </div>

      {filtered.length === 0 ? (
        <div style={{ marginTop: 16, background: "white", padding: 16, borderRadius: 16, boxShadow: "0 1px 12px rgba(0,0,0,0.06)", color: "#64748b", fontWeight: 700 }}>
          No sales data found for this range. Add data from <b>Add Daily Sales</b>.
        </div>
      ) : (
        <div style={{ marginTop: 16, display: "grid", gap: 16, gridTemplateColumns: "repeat(12, 1fr)" }}>
          {/* Daily Revenue Trend */}
          <Card title="Daily Revenue Trend" subtitle="Revenue per day" colSpan={8}>
            <div style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.dailyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Revenue by Weekday */}
          <Card title="Revenue by Weekday" subtitle="Which days perform better" colSpan={4}>
            <div style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.revenueByWeekday}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="weekday" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Top Products */}
          <Card title="Top Products by Revenue" subtitle="Top contributors in selected range" colSpan={12}>
            <div style={{ height: 340 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.topProducts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="product" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function KPI({ title, value, subtitle }: { title: string; value: string; subtitle: string }) {
  return (
    <div style={{ background: "white", borderRadius: 16, padding: 16, boxShadow: "0 1px 12px rgba(0,0,0,0.06)" }}>
      <div style={{ color: "#64748b", fontWeight: 900, fontSize: 12, textTransform: "uppercase" }}>{title}</div>
      <div style={{ marginTop: 10, fontSize: 22, fontWeight: 900, color: "#0f172a" }}>{value}</div>
      <div style={{ marginTop: 6, color: "#64748b", fontWeight: 700, fontSize: 12 }}>{subtitle}</div>
    </div>
  );
}

function Card({
  title,
  subtitle,
  children,
  colSpan,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  colSpan: number;
}) {
  return (
    <div
      style={{
        gridColumn: `span ${colSpan}`,
        background: "white",
        borderRadius: 16,
        padding: 16,
        boxShadow: "0 1px 12px rgba(0,0,0,0.06)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 900, color: "#0f172a" }}>{title}</div>
          <div style={{ marginTop: 4, fontSize: 12, fontWeight: 700, color: "#64748b" }}>{subtitle}</div>
        </div>
      </div>
      <div style={{ marginTop: 12 }}>{children}</div>
    </div>
  );
}
