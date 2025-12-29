"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
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

type Horizon = 7 | 14 | 30;

function parseISO(d: string) {
  return new Date(d + "T00:00:00");
}
function toISO(date: Date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
function addDaysISO(iso: string, n: number) {
  const d = parseISO(iso);
  d.setDate(d.getDate() + n);
  return toISO(d);
}
function fmtShort(iso: string) {
  return parseISO(iso).toLocaleDateString(undefined, { day: "2-digit", month: "short" });
}

function mean(nums: number[]) {
  if (!nums.length) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

/**
 * Mock forecast generator:
 * - uses recent daily units average from history as baseline
 * - adds gentle trend + weekday noise
 * - produces confidence band
 * Later: replace with real forecast API.
 */
function buildMockForecast(lastDate: string, horizon: Horizon, baselineUnits: number) {
  const rows: Array<{
    date: string;
    predicted: number;
    lower: number;
    upper: number;
    confidence: number; // 0..1
  }> = [];

  const base = Math.max(1, Math.round(baselineUnits || 20));

  for (let i = 1; i <= horizon; i++) {
    const date = addDaysISO(lastDate, i);
    const weekday = parseISO(date).getDay(); // 0 Sun .. 6 Sat

    // mild trend: +0.2% per day
    const trendFactor = 1 + i * 0.002;

    // weekday bump (weekend higher)
    const weekdayBump = weekday === 0 || weekday === 6 ? 1.12 : 1.0;

    // random noise (stable-ish)
    const noise = (Math.sin(i * 1.7) + 1) * 0.03; // 0..0.06

    const predicted = Math.round(base * trendFactor * weekdayBump * (1 + noise));

    // confidence: decreases slightly as horizon increases
    const confidence = clamp(0.92 - i * 0.008, 0.65, 0.92);

    // band width grows as confidence drops
    const band = Math.round(predicted * (1 - confidence) * 1.4);

    rows.push({
      date,
      predicted,
      lower: Math.max(0, predicted - band),
      upper: predicted + band,
      confidence,
    });
  }

  return rows;
}

export default function ForecastPage() {
  const [horizon, setHorizon] = useState<Horizon>(7);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      setHistory(Array.isArray(parsed) ? parsed : []);
    } catch {
      setHistory([]);
    }
  }, []);

  const recentStats = useMemo(() => {
    const sorted = [...history].sort((a, b) => (a.saleDate > b.saleDate ? 1 : -1));
    const lastDate = sorted.length ? sorted[sorted.length - 1].saleDate : toISO(new Date());

    // last 7 recorded days baseline
    const last7 = sorted.slice(-7).map((e) => e.totalUnits || 0);
    const baselineUnits = Math.round(mean(last7.length ? last7 : sorted.map((e) => e.totalUnits || 0)));

    // Top products (by units) in last 14 records
    const productAgg = new Map<string, { name: string; units: number }>();
    sorted.slice(-14).forEach((entry) => {
      entry.items.forEach((it) => {
        const key = it.productId || it.productName;
        const prev = productAgg.get(key) || { name: it.productName, units: 0 };
        productAgg.set(key, { name: it.productName, units: prev.units + (it.quantity || 0) });
      });
    });

    const topProducts = Array.from(productAgg.values())
      .sort((a, b) => b.units - a.units)
      .slice(0, 5);

    return { lastDate, baselineUnits, topProducts };
  }, [history]);

  const forecast = useMemo(() => {
    return buildMockForecast(recentStats.lastDate, horizon, recentStats.baselineUnits);
  }, [recentStats.lastDate, recentStats.baselineUnits, horizon]);

  const summary = useMemo(() => {
    const total = forecast.reduce((a, r) => a + r.predicted, 0);
    const avg = forecast.length ? total / forecast.length : 0;

    const minDay = forecast.reduce(
      (best, r) => (r.predicted < best.predicted ? r : best),
      forecast[0] ?? { predicted: 0, date: "" }
    );
    const maxDay = forecast.reduce(
      (best, r) => (r.predicted > best.predicted ? r : best),
      forecast[0] ?? { predicted: 0, date: "" }
    );

    // suggested reorder qty = max day predicted - baseline
    const reorder = Math.max(0, Math.round(maxDay.predicted * 1.05 - (recentStats.baselineUnits || 0)));

    // overall confidence average
    const confidenceAvg = forecast.length
      ? forecast.reduce((a, r) => a + r.confidence, 0) / forecast.length
      : 0;

    return {
      total,
      avg,
      minDay,
      maxDay,
      reorder,
      confidenceAvg,
    };
  }, [forecast, recentStats.baselineUnits]);

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: "#0f172a" }}>Demand Forecast</h1>
          <p style={{ marginTop: 6, color: "#64748b", fontWeight: 600 }}>
            Forecast for next {horizon} days with confidence band + suggestions.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <HorizonButton active={horizon === 7} onClick={() => setHorizon(7)} label="7 Days" />
          <HorizonButton active={horizon === 14} onClick={() => setHorizon(14)} label="14 Days" />
          <HorizonButton active={horizon === 30} onClick={() => setHorizon(30)} label="30 Days" />
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ marginTop: 16, display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        <KPI title="Total Predicted Units" value={`${summary.total}`} subtitle={`Next ${horizon} days`} />
        <KPI title="Avg Daily Demand" value={`${summary.avg.toFixed(1)}`} subtitle="Units/day" />
        <KPI title="Peak Day" value={`${fmtShort(summary.maxDay.date)} • ${summary.maxDay.predicted}`} subtitle="Highest predicted units" />
        <KPI title="Confidence" value={`${Math.round(summary.confidenceAvg * 100)}%`} subtitle="Avg model confidence" />
      </div>

      {/* Chart + Suggestions */}
      <div style={{ marginTop: 16, display: "grid", gap: 16, gridTemplateColumns: "repeat(12, 1fr)" }}>
        <Card title="Forecast Trend" subtitle="Predicted demand with confidence band" colSpan={8}>
          <div style={{ height: 360 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecast}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={fmtShort} />
                <YAxis />
                <Tooltip
                  formatter={(value: any, name: any) => [value, name]}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Legend />
                {/* Confidence band */}
                <Area type="monotone" dataKey="upper" strokeWidth={0} fillOpacity={0.15} />
                <Area type="monotone" dataKey="lower" strokeWidth={0} fillOpacity={0.15} />
                {/* Main line */}
                <Area type="monotone" dataKey="predicted" strokeWidth={3} fillOpacity={0.25} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Pill text={`Baseline (recent avg): ${recentStats.baselineUnits || 0} units/day`} />
            <Pill text={`Lowest: ${fmtShort(summary.minDay.date)} (${summary.minDay.predicted})`} />
            <Pill text={`Highest: ${fmtShort(summary.maxDay.date)} (${summary.maxDay.predicted})`} />
          </div>
        </Card>

        <Card title="Smart Suggestions" subtitle="Actionable recommendations" colSpan={4}>
          <Suggestion
            title="Reorder suggestion"
            desc={`Consider stocking ~${summary.reorder} extra units to safely handle peak demand.`}
            tone="indigo"
          />
          <Suggestion
            title="Peak-day readiness"
            desc={`Prepare for highest demand around ${fmtShort(summary.maxDay.date)}.`}
            tone="emerald"
          />
          <Suggestion
            title="Risk / uncertainty"
            desc={`Confidence reduces with longer horizons. Use 7-day view for tighter planning.`}
            tone="amber"
          />

          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: "#0f172a" }}>Top products (recent)</div>
            <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
              {(recentStats.topProducts.length ? recentStats.topProducts : [{ name: "—", units: 0 }]).map((p, idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, color: "#334155" }}>
                  <span>{p.name}</span>
                  <span>{p.units}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Footer note */}
      <div style={{ marginTop: 16, color: "#64748b", fontWeight: 700, fontSize: 12 }}>
        Note: Forecast is currently generated on the frontend for UI development. Later it will come from your ML backend.
      </div>
    </div>
  );
}

function HorizonButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        borderRadius: 999,
        border: active ? "1px solid #4f46e5" : "1px solid #e2e8f0",
        background: active ? "#4f46e5" : "white",
        color: active ? "white" : "#0f172a",
        padding: "10px 12px",
        fontWeight: 900,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
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
      <div>
        <div style={{ fontSize: 16, fontWeight: 900, color: "#0f172a" }}>{title}</div>
        <div style={{ marginTop: 4, fontSize: 12, fontWeight: 700, color: "#64748b" }}>{subtitle}</div>
      </div>
      <div style={{ marginTop: 12 }}>{children}</div>
    </div>
  );
}

function Pill({ text }: { text: string }) {
  return (
    <span
      style={{
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
        padding: "8px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 900,
        color: "#0f172a",
      }}
    >
      {text}
    </span>
  );
}

function Suggestion({
  title,
  desc,
  tone,
}: {
  title: string;
  desc: string;
  tone: "indigo" | "emerald" | "amber";
}) {
  const toneMap: Record<string, { bg: string; border: string; title: string }> = {
    indigo: { bg: "#eef2ff", border: "#c7d2fe", title: "#3730a3" },
    emerald: { bg: "#ecfdf5", border: "#a7f3d0", title: "#065f46" },
    amber: { bg: "#fffbeb", border: "#fde68a", title: "#92400e" },
  };

  const t = toneMap[tone];

  return (
    <div style={{ background: t.bg, border: `1px solid ${t.border}`, borderRadius: 16, padding: 12, marginTop: 10 }}>
      <div style={{ fontWeight: 900, color: t.title }}>{title}</div>
      <div style={{ marginTop: 6, color: "#334155", fontWeight: 700, fontSize: 13, lineHeight: 1.5 }}>{desc}</div>
    </div>
  );
}
