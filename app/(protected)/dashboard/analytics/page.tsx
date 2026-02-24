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

type AnomalyInsight = {
  date: string;
  actual: number;
  expected: number;
  deviation: number;
  insight: string | null;
  loading: boolean;
  error: string | null;
};

export default function VendorAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [productFamilies, setProductFamilies] = useState<string[]>([]);
  const [selectedFamily, setSelectedFamily] = useState("BREAD/BAKERY");
  const [salesData, setSalesData] = useState<any[]>([]);
  const [numDays, setNumDays] = useState(30);
  const [anomalies, setAnomalies] = useState<AnomalyInsight[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (productFamilies.length === 0) {
        const prodResp = await apiClient.getProducts();
        if (prodResp.products) setProductFamilies(prodResp.products);
      }

      const resp = await apiClient.getSalesData({
        product_family: selectedFamily,
      });

      if (resp.success && resp.data) {
        const sorted = resp.data.sort(
          (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        const recent = sorted.slice(-numDays);
        setSalesData(recent);

        if (recent.length >= 7) {
          const windowSize = 7;
          const detected: AnomalyInsight[] = [];
          for (let i = windowSize; i < recent.length; i++) {
            const window = recent.slice(i - windowSize, i);
            const avg = window.reduce((s: number, d: any) => s + (d.sales || 0), 0) / windowSize;
            const actual = recent[i].sales || 0;
            if (avg > 0) {
              const deviation = (actual - avg) / avg;
              if (Math.abs(deviation) > 0.15) {
                detected.push({
                  date: recent[i].date,
                  actual,
                  expected: avg,
                  deviation: deviation * 100,
                  insight: null,
                  loading: true,
                  error: null,
                });
              }
            }
          }
          setAnomalies(detected.slice(-3));
        } else {
          setAnomalies([]);
        }
      } else {
        setSalesData([]);
        setAnomalies([]);
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

  useEffect(() => {
    if (anomalies.length === 0) return;
    anomalies.forEach((anomaly, idx) => {
      apiClient
        .getAnomalyInsight({
          product_family: selectedFamily,
          date: anomaly.date,
          actual: anomaly.actual,
          expected: anomaly.expected,
        })
        .then((resp) => {
          setAnomalies((prev) =>
            prev.map((a, i) =>
              i === idx
                ? { ...a, insight: resp.success ? resp.insight : null, error: resp.success ? null : (resp.error || "Failed"), loading: false }
                : a
            )
          );
        })
        .catch(() => {
          setAnomalies((prev) =>
            prev.map((a, i) =>
              i === idx ? { ...a, error: "Gemini insight unavailable", loading: false } : a
            )
          );
        });
    });
  }, [anomalies.length, selectedFamily]);

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

    const maxDay = salesData.reduce(
      (best: any, e: any) => ((e.sales || 0) > best.sales ? { date: e.date, sales: e.sales } : best),
      { date: "—", sales: 0 }
    );

    const dailyTrend = salesData.map((e: any) => ({
      date: e.date,
      sales: Math.round(e.sales || 0),
    }));

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
    <div className="pg-page">
      <div className="pg-container">

        {/* Header */}
        <div className="pg-header">
          <div className="pg-header-left">
            <h1 className="pg-title">Analytics</h1>
            <p className="pg-subtitle">Sales analytics — {getDisplayName(selectedFamily)}</p>
          </div>
          <div className="pg-header-right">
            <div className="pg-field">
              <label className="pg-label">Product Family</label>
              <select
                className="pg-select"
                value={selectedFamily}
                onChange={(e) => setSelectedFamily(e.target.value)}
              >
                {productFamilies.map((f) => (
                  <option key={f} value={f}>{getDisplayName(f)}</option>
                ))}
              </select>
            </div>
            <div className="pg-field">
              <label className="pg-label">Period</label>
              <select
                className="pg-select"
                value={numDays}
                onChange={(e) => setNumDays(Number(e.target.value))}
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
        <div className="pg-kpi-grid">
          <div className="pg-kpi">
            <p className="pg-kpi-label">Total Sales</p>
            <p className="pg-kpi-value">{Math.round(analytics.totalSales).toLocaleString()} units</p>
            <p className="pg-kpi-sub">{analytics.totalDays} data points</p>
          </div>
          <div className="pg-kpi">
            <p className="pg-kpi-label">Avg Daily Sales</p>
            <p className="pg-kpi-value">{Math.round(analytics.avgDaily).toLocaleString()} units</p>
            <p className="pg-kpi-sub">Per day</p>
          </div>
          <div className="pg-kpi">
            <p className="pg-kpi-label">Peak Day</p>
            <p className="pg-kpi-value">{Math.round(analytics.maxDay.sales).toLocaleString()} units</p>
            <p className="pg-kpi-sub">{analytics.maxDay.date}</p>
          </div>
          <div className="pg-kpi">
            <p className="pg-kpi-label">Category</p>
            <p className="pg-kpi-value" style={{ fontSize: "1rem" }}>{getDisplayName(selectedFamily)}</p>
            <p className="pg-kpi-sub">Selected product family</p>
          </div>
        </div>

        {salesData.length === 0 ? (
          <div className="pg-card">
            <p className="pg-empty">
              No sales data found for this category. Make sure the backend is running and has data loaded.
            </p>
          </div>
        ) : (
          <>
            {/* Charts Row */}
            <div className="pg-chart-row">
              {/* Daily Trend */}
              <div className="pg-card">
                <div className="pg-card-header">
                  <div>
                    <p className="pg-card-title">Daily Sales Trend</p>
                    <p className="pg-card-sub">{getDisplayName(selectedFamily)} — units sold per day</p>
                  </div>
                </div>
                <div className="pg-chart-area-lg">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics.dailyTrend} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                      <YAxis
                        tick={{ fontSize: 11, fill: "#94a3b8" }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : `${v}`}
                      />
                      <Tooltip
                        contentStyle={{ borderRadius: "0.75rem", border: "1px solid #e2e8f0", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}
                        labelStyle={{ fontWeight: 700, color: "#0f172a" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="sales"
                        stroke="#6366f1"
                        strokeWidth={2.5}
                        dot={false}
                        activeDot={{ r: 5, fill: "#6366f1", stroke: "white", strokeWidth: 2 }}
                        name="Units Sold"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Sales by Weekday */}
              <div className="pg-card">
                <div className="pg-card-header">
                  <div>
                    <p className="pg-card-title">Sales by Weekday</p>
                    <p className="pg-card-sub">Which days have higher demand</p>
                  </div>
                </div>
                <div className="pg-chart-area-lg">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.salesByWeekday} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="weekday" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                      <YAxis
                        tick={{ fontSize: 11, fill: "#94a3b8" }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : `${v}`}
                      />
                      <Tooltip
                        contentStyle={{ borderRadius: "0.75rem", border: "1px solid #e2e8f0", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}
                        labelStyle={{ fontWeight: 700, color: "#0f172a" }}
                      />
                      <Bar dataKey="sales" fill="#6366f1" radius={[6, 6, 0, 0]} name="Units Sold" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Anomaly Cards */}
            {anomalies.length > 0 && (
              <div className="pg-card">
                <div className="pg-card-header" style={{ marginBottom: "0.875rem" }}>
                  <div>
                    <p className="pg-card-title">Anomaly Detection</p>
                    <p className="pg-card-sub">Days with significant deviation from 7-day rolling average</p>
                  </div>
                  <span className="pg-badge pg-badge-rose">{anomalies.length} found</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {anomalies.map((a, idx) => (
                    <AnomalyCard key={idx} anomaly={a} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function AnomalyCard({ anomaly }: { anomaly: AnomalyInsight }) {
  const isSpike = anomaly.deviation > 0;
  const absPct = Math.abs(anomaly.deviation).toFixed(1);

  return (
    <div className={`pg-anomaly-card ${isSpike ? "pg-anomaly-spike" : "pg-anomaly-drop"}`}>
      <div className="pg-anomaly-head">
        <span style={{ fontSize: 16 }}>{isSpike ? "📈" : "📉"}</span>
        <span className={`pg-anomaly-tag ${isSpike ? "pg-anomaly-tag-spike" : "pg-anomaly-tag-drop"}`}>
          ANOMALY
        </span>
        <span className="pg-anomaly-title" style={{ color: isSpike ? "#92400e" : "#991b1b" }}>
          {anomaly.date} — {isSpike ? "+" : ""}{absPct}% {isSpike ? "spike" : "drop"}
        </span>
      </div>

      <div className="pg-anomaly-stats">
        <span>Actual: <b>{Math.round(anomaly.actual)}</b> units</span>
        <span>Expected: <b>{Math.round(anomaly.expected)}</b> units</span>
      </div>

      {anomaly.loading && (
        <p className="pg-ai-generating">Generating explanation...</p>
      )}

      {anomaly.error && (
        <div className="pg-banner pg-banner-error" style={{ marginTop: "0.5rem" }}>
          {anomaly.error}
        </div>
      )}

      {anomaly.insight && (
        <div style={{ marginTop: "0.75rem" }}>
          <div className="pg-ai-card-head" style={{ marginBottom: "0.5rem" }}>
            <span className="pg-ai-badge">AI INSIGHT</span>
          </div>
          <p className="pg-ai-text">{anomaly.insight}</p>
        </div>
      )}
    </div>
  );
}
