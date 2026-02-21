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
import { apiClient } from "@/lib/api-client";
import { getDisplayName } from "@/lib/product-mapping";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import ErrorBanner from "@/app/components/ErrorBanner";

function weekdayShort(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, { weekday: "short" });
  } catch {
    return iso;
  }
}

export default function VendorAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [productFamilies, setProductFamilies] = useState<string[]>([]);
  const [selectedFamily, setSelectedFamily] = useState("BREAD/BAKERY");
  const [salesData, setSalesData] = useState<any[]>([]);
  const [numDays, setNumDays] = useState(30);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch products if not loaded yet
      if (productFamilies.length === 0) {
        const prodResp = await apiClient.getProducts();
        if (prodResp.products) setProductFamilies(prodResp.products);
      }

      // Fetch sales data for the selected family
      const resp = await apiClient.getSalesData({
        product_family: selectedFamily,
      });

      if (resp.success && resp.data) {
        // Sort by date and take the last N days
        const sorted = resp.data.sort(
          (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        const recent = sorted.slice(-numDays);
        setSalesData(recent);
      } else {
        setSalesData([]);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedFamily, numDays]);

  // Compute analytics from API data
  const analytics = useMemo(() => {
    if (!salesData.length) {
      return {
        totalSales: 0,
        totalDays: 0,
        avgDaily: 0,
        maxDay: { date: "—", sales: 0 },
        dailyTrend: [],
        salesByWeekday: [],
      };
    }

    const totalSales = salesData.reduce((a: number, e: any) => a + (e.sales || 0), 0);
    const totalDays = salesData.length;
    const avgDaily = totalSales / totalDays;

    // Max day
    const maxDay = salesData.reduce(
      (best: any, e: any) => ((e.sales || 0) > best.sales ? { date: e.date, sales: e.sales } : best),
      { date: "—", sales: 0 }
    );

    // Daily trend chart data
    const dailyTrend = salesData.map((e: any) => ({
      date: e.date,
      sales: Math.round(e.sales || 0),
    }));

    // Aggregate by weekday
    const weekdayAgg = new Map<string, number>();
    salesData.forEach((e: any) => {
      const w = weekdayShort(e.date);
      weekdayAgg.set(w, (weekdayAgg.get(w) || 0) + (e.sales || 0));
    });

    const weekdayOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const salesByWeekday = weekdayOrder.map((w) => ({
      weekday: w,
      sales: Math.round(weekdayAgg.get(w) || 0),
    }));

    return { totalSales, totalDays, avgDaily, maxDay, dailyTrend, salesByWeekday };
  }, [salesData]);

  if (loading) return <LoadingSpinner message="Loading analytics..." />;
  if (error) return <ErrorBanner message={error} onRetry={fetchData} />;

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a" }}>Analytics</h1>
          <p style={{ marginTop: 6, color: "#94a3b8", fontWeight: 500, fontSize: 14 }}>
            Sales analytics from backend data — {getDisplayName(selectedFamily)}
          </p>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "end" }}>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 800, color: "#334155" }}>
              Product Family
            </label>
            <select
              value={selectedFamily}
              onChange={(e) => setSelectedFamily(e.target.value)}
              style={{
                marginTop: 8,
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                padding: "10px 12px",
                background: "white",
                fontWeight: 700,
              }}
            >
              {productFamilies.map((f) => (
                <option key={f} value={f}>
                  {getDisplayName(f)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 800, color: "#334155" }}>
              Period
            </label>
            <select
              value={numDays}
              onChange={(e) => setNumDays(Number(e.target.value))}
              style={{
                marginTop: 8,
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                padding: "10px 12px",
                background: "white",
                fontWeight: 700,
              }}
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
              <option value={365}>Last year</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          marginTop: 16,
          display: "grid",
          gap: 20,
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        }}
      >
        <KPI
          title="Total Sales"
          value={`${Math.round(analytics.totalSales).toLocaleString()} units`}
          subtitle={`${analytics.totalDays} data points`}
        />
        <KPI
          title="Avg Daily Sales"
          value={`${Math.round(analytics.avgDaily).toLocaleString()} units`}
          subtitle="Per day"
        />
        <KPI
          title="Peak Day"
          value={`${Math.round(analytics.maxDay.sales).toLocaleString()} units`}
          subtitle={analytics.maxDay.date}
        />
        <KPI
          title="Category"
          value={getDisplayName(selectedFamily)}
          subtitle="Selected product family"
        />
      </div>

      {salesData.length === 0 ? (
        <div
          style={{
            marginTop: 16,
            background: "white",
            padding: 16,
            borderRadius: 12,
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            color: "#64748b",
            fontWeight: 700,
          }}
        >
          No sales data found for this category. Make sure the backend is running and has data loaded.
        </div>
      ) : (
        <div
          style={{
            marginTop: 16,
            display: "grid",
            gap: 16,
            gridTemplateColumns: "repeat(12, 1fr)",
          }}
        >
          {/* Daily Sales Trend */}
          <Card title="Daily Sales Trend" subtitle={`${getDisplayName(selectedFamily)} — units sold per day`} colSpan={8}>
            <div style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.dailyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="sales" strokeWidth={2} dot={false} name="Units Sold" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Sales by Weekday */}
          <Card title="Sales by Weekday" subtitle="Which days have higher demand" colSpan={4}>
            <div style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.salesByWeekday}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="weekday" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="sales" name="Units Sold" />
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
    <div
      style={{
        background: "white",
        borderRadius: 12,
        padding: 16,
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      <div style={{ color: "#64748b", fontWeight: 800, fontSize: 12, textTransform: "uppercase" }}>
        {title}
      </div>
      <div style={{ marginTop: 10, fontSize: 22, fontWeight: 800, color: "#0f172a" }}>{value}</div>
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
        borderRadius: 12,
        padding: 16,
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      <div>
        <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>{title}</div>
        <div style={{ marginTop: 4, fontSize: 12, fontWeight: 700, color: "#64748b" }}>{subtitle}</div>
      </div>
      <div style={{ marginTop: 12 }}>{children}</div>
    </div>
  );
}
