'use client';

import React, { useState } from 'react';
import {
  AreaChart, Area,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ReferenceLine,
} from 'recharts';

// ─── helpers ────────────────────────────────────────────────────────────────
const fmt    = (n: number) => n.toLocaleString();
const fmtUSD = (n: number) => `$${n.toLocaleString()}`;

// ─── sub-components ─────────────────────────────────────────────────────────
function TrendPill({ value }: { value: string }) {
  const up = !value.startsWith('-');
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 2,
      padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
      background: up ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
      color: up ? '#059669' : '#dc2626',
    }}>
      {up ? '▲' : '▼'} {value}
    </span>
  );
}

function Card({ children, style, className = '' }: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <div className={className} style={{
      background: '#fff',
      borderRadius: 16,
      boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)',
      border: '1px solid #f1f5f9',
      ...style,
    }}>
      {children}
    </div>
  );
}

function CardHeader({ title, subtitle, accent = '#8b5cf6' }: {
  title: string; subtitle?: string; accent?: string;
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 3 }}>
        <div style={{ width: 4, height: 20, borderRadius: 2, background: accent, flexShrink: 0 }} />
        <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>{title}</h2>
      </div>
      {subtitle && <p style={{ fontSize: 12.5, color: '#94a3b8', margin: 0, marginLeft: 14 }}>{subtitle}</p>}
    </div>
  );
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#fff', border: '1px solid #e2e8f0',
      borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
      padding: '10px 14px', fontSize: 13, minWidth: 160,
    }}>
      <p style={{ fontWeight: 700, color: '#334155', marginBottom: 8 }}>{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 4 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, display: 'inline-block' }} />
            <span style={{ color: '#64748b' }}>{p.name}</span>
          </span>
          <span style={{ fontWeight: 700, color: '#1e293b' }}>
            {typeof p.value === 'number' ? fmtUSD(p.value) : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── data ───────────────────────────────────────────────────────────────────
const salesData = [
  { month: 'Jan', actual: 45000, forecast: 42000, target: 50000 },
  { month: 'Feb', actual: 52000, forecast: 48000, target: 52000 },
  { month: 'Mar', actual: 48000, forecast: 51000, target: 54000 },
  { month: 'Apr', actual: 61000, forecast: 58000, target: 56000 },
  { month: 'May', actual: 55000, forecast: 62000, target: 58000 },
  { month: 'Jun', actual: 67000, forecast: 65000, target: 60000 },
  { month: 'Jul', actual: 72000, forecast: 70000, target: 62000 },
  { month: 'Aug', actual: null,  forecast: 75000, target: 64000 },
  { month: 'Sep', actual: null,  forecast: 78000, target: 66000 },
  { month: 'Oct', actual: null,  forecast: 82000, target: 68000 },
  { month: 'Nov', actual: null,  forecast: 88000, target: 70000 },
  { month: 'Dec', actual: null,  forecast: 95000, target: 72000 },
];

const categoryData = [
  { name: 'Electronics',      value: 35, amount: 125000, color: '#8b5cf6' },
  { name: 'Clothing',         value: 25, amount:  89000, color: '#ec4899' },
  { name: 'Food & Beverages', value: 20, amount:  71000, color: '#10b981' },
  { name: 'Home & Garden',    value: 12, amount:  43000, color: '#f59e0b' },
  { name: 'Others',           value:  8, amount:  28000, color: '#6366f1' },
];

const regionalData = [
  { region: 'Asia Pacific',  sales: 94000, growth: 15.7, color: '#8b5cf6' },
  { region: 'North America', sales: 89000, growth: 12.5, color: '#6366f1' },
  { region: 'Europe',        sales: 76000, growth:  8.3, color: '#3b82f6' },
  { region: 'Latin America', sales: 43000, growth:  6.2, color: '#06b6d4' },
  { region: 'Middle East',   sales: 31000, growth:  9.8, color: '#10b981' },
];

const radarData = [
  { metric: 'Sales',      value: 85 },
  { metric: 'Quality',    value: 92 },
  { metric: 'Delivery',   value: 78 },
  { metric: 'Support',    value: 88 },
  { metric: 'Innovation', value: 75 },
  { metric: 'Value',      value: 90 },
];

const segmentData = [
  { segment: 'Enterprise', revenue: 245000, fill: '#8b5cf6' },
  { segment: 'SMB',        revenue: 156000, fill: '#6366f1' },
  { segment: 'Startup',    revenue:  78000, fill: '#ec4899' },
  { segment: 'Individual', revenue:  34000, fill: '#f59e0b' },
];

const topProducts = [
  { name: 'Wireless Headphones Pro', sales: 1234, revenue: 110000, growth: 23.5 },
  { name: 'Smart Watch Series X',    sales:  987, revenue: 295000, growth: 18.2 },
  { name: 'Laptop Stand Premium',    sales:  856, revenue:  42800, growth: 15.7 },
  { name: 'Office Desk Chair',       sales:  743, revenue: 185000, growth: 12.3 },
  { name: 'Premium Coffee Beans',    sales: 2341, revenue:  58500, growth:  9.8 },
];

const kpis = [
  {
    title: 'Total Revenue', value: '$456,789', change: '+12.5%', sub: 'vs last period',
    pct: 78, icon: '💰',
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
    glow: 'rgba(124,58,237,0.25)',
  },
  {
    title: 'Total Orders', value: '8,234', change: '+8.3%', sub: 'vs last period',
    pct: 65, icon: '📦',
    gradient: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
    glow: 'rgba(79,70,229,0.25)',
  },
  {
    title: 'Avg Order Value', value: '$55.48', change: '+4.2%', sub: 'per transaction',
    pct: 54, icon: '🧾',
    gradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
    glow: 'rgba(5,150,105,0.25)',
  },
  {
    title: 'Conversion Rate', value: '3.24%', change: '-0.8%', sub: 'site visits → orders',
    pct: 32, icon: '📊',
    gradient: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
    glow: 'rgba(217,119,6,0.25)',
  },
];

const medalColors = ['#f59e0b', '#94a3b8', '#cd7c3e', '#8b5cf6', '#6366f1'];

// ─── per-range data ──────────────────────────────────────────────────────────
type TR = '7d' | '30d' | '90d' | '1y';

const KPI_BASE = {
  gradient: kpis.map((k) => k.gradient),
  glow:     kpis.map((k) => k.glow),
  icon:     kpis.map((k) => k.icon),
  title:    kpis.map((k) => k.title),
};

const rangeKpis: Record<TR, typeof kpis> = {
  '7d': [
    { ...KPI_BASE, title: 'Total Revenue',    value: '$38,450',  change: '+5.2%',  sub: 'vs last week',       pct: 62, icon: '💰', gradient: KPI_BASE.gradient[0], glow: KPI_BASE.glow[0] },
    { ...KPI_BASE, title: 'Total Orders',     value: '687',      change: '+3.1%',  sub: 'vs last week',       pct: 48, icon: '📦', gradient: KPI_BASE.gradient[1], glow: KPI_BASE.glow[1] },
    { ...KPI_BASE, title: 'Avg Order Value',  value: '$55.97',   change: '+1.8%',  sub: 'per transaction',    pct: 54, icon: '🧾', gradient: KPI_BASE.gradient[2], glow: KPI_BASE.glow[2] },
    { ...KPI_BASE, title: 'Conversion Rate',  value: '2.91%',    change: '-0.3%',  sub: 'site visits → orders', pct: 28, icon: '📊', gradient: KPI_BASE.gradient[3], glow: KPI_BASE.glow[3] },
  ],
  '30d': kpis,
  '90d': [
    { ...KPI_BASE, title: 'Total Revenue',    value: '$1,187,340', change: '+18.3%', sub: 'vs last quarter',    pct: 85, icon: '💰', gradient: KPI_BASE.gradient[0], glow: KPI_BASE.glow[0] },
    { ...KPI_BASE, title: 'Total Orders',     value: '21,450',     change: '+14.6%', sub: 'vs last quarter',    pct: 74, icon: '📦', gradient: KPI_BASE.gradient[1], glow: KPI_BASE.glow[1] },
    { ...KPI_BASE, title: 'Avg Order Value',  value: '$55.35',     change: '+3.6%',  sub: 'per transaction',    pct: 57, icon: '🧾', gradient: KPI_BASE.gradient[2], glow: KPI_BASE.glow[2] },
    { ...KPI_BASE, title: 'Conversion Rate',  value: '3.41%',      change: '+0.4%',  sub: 'site visits → orders', pct: 36, icon: '📊', gradient: KPI_BASE.gradient[3], glow: KPI_BASE.glow[3] },
  ],
  '1y': [
    { ...KPI_BASE, title: 'Total Revenue',    value: '$4,892,100', change: '+24.7%', sub: 'vs last year',       pct: 92, icon: '💰', gradient: KPI_BASE.gradient[0], glow: KPI_BASE.glow[0] },
    { ...KPI_BASE, title: 'Total Orders',     value: '89,234',     change: '+21.3%', sub: 'vs last year',       pct: 88, icon: '📦', gradient: KPI_BASE.gradient[1], glow: KPI_BASE.glow[1] },
    { ...KPI_BASE, title: 'Avg Order Value',  value: '$54.83',     change: '+2.9%',  sub: 'per transaction',    pct: 51, icon: '🧾', gradient: KPI_BASE.gradient[2], glow: KPI_BASE.glow[2] },
    { ...KPI_BASE, title: 'Conversion Rate',  value: '3.56%',      change: '+1.1%',  sub: 'site visits → orders', pct: 42, icon: '📊', gradient: KPI_BASE.gradient[3], glow: KPI_BASE.glow[3] },
  ],
};

const rangeChart: Record<TR, { period: string; actual: number | null; forecast: number; target: number }[]> = {
  '7d': [
    { period: 'Mon', actual: 5200, forecast: 4900, target: 5500 },
    { period: 'Tue', actual: 6100, forecast: 5800, target: 5500 },
    { period: 'Wed', actual: 5400, forecast: 6200, target: 5500 },
    { period: 'Thu', actual: 7800, forecast: 7100, target: 5500 },
    { period: 'Fri', actual: 8100, forecast: 7500, target: 5500 },
    { period: 'Sat', actual: null, forecast: 4200, target: 5500 },
    { period: 'Sun', actual: null, forecast: 2600, target: 5500 },
  ],
  '30d': salesData.map((d) => ({ period: d.month, actual: d.actual, forecast: d.forecast, target: d.target })),
  '90d': [
    { period: 'Wk 1',  actual: 88000,  forecast: 82000,  target: 90000  },
    { period: 'Wk 2',  actual: 94000,  forecast: 89000,  target: 90000  },
    { period: 'Wk 3',  actual: 91000,  forecast: 93000,  target: 92000  },
    { period: 'Wk 4',  actual: 102000, forecast: 98000,  target: 92000  },
    { period: 'Wk 5',  actual: 97000,  forecast: 104000, target: 94000  },
    { period: 'Wk 6',  actual: 115000, forecast: 109000, target: 94000  },
    { period: 'Wk 7',  actual: 121000, forecast: 116000, target: 96000  },
    { period: 'Wk 8',  actual: 118000, forecast: 122000, target: 96000  },
    { period: 'Wk 9',  actual: 130000, forecast: 127000, target: 98000  },
    { period: 'Wk 10', actual: 142000, forecast: 138000, target: 100000 },
    { period: 'Wk 11', actual: null,   forecast: 149000, target: 102000 },
    { period: 'Wk 12', actual: null,   forecast: 158000, target: 104000 },
    { period: 'Wk 13', actual: null,   forecast: 166000, target: 106000 },
  ],
  '1y': salesData.map((d) => ({
    period: d.month,
    actual: d.actual ? d.actual * 11 : null,
    forecast: d.forecast * 11,
    target: d.target * 11,
  })),
};

const rangeTodayMark: Record<TR, string | null> = {
  '7d': 'Fri', '30d': 'Jul', '90d': 'Wk 10', '1y': null,
};

// ─── export helper ───────────────────────────────────────────────────────────
function buildCSV(tr: TR): string {
  const label = { '7d': 'Last 7 Days', '30d': 'Last 30 Days', '90d': 'Last 90 Days', '1y': 'Last Year' }[tr];
  const today = new Date().toLocaleDateString();
  const ck = rangeKpis[tr];
  const rows: string[] = [
    `Sales Analytics Report — ${label}`,
    `Generated: ${today}`,
    '',
    '=== KPI Summary ===',
    'Metric,Value,Change',
    ...ck.map((k) => `${k.title},${k.value},${k.change}`),
    '',
    '=== Top Products ===',
    'Product,Units Sold,Revenue,Growth',
    ...topProducts.map((p) => `${p.name},${p.sales},$${p.revenue},+${p.growth}%`),
    '',
    '=== Revenue by Category ===',
    'Category,Share,Amount',
    ...categoryData.map((c) => `${c.name},${c.value}%,$${c.amount.toLocaleString()}`),
    '',
    '=== Regional Performance ===',
    'Region,Sales,Growth',
    ...regionalData.map((r) => `${r.region},$${r.sales.toLocaleString()},+${r.growth}%`),
    '',
    '=== Customer Segments ===',
    'Segment,Revenue',
    ...segmentData.map((s) => `${s.segment},$${s.revenue.toLocaleString()}`),
  ];
  return rows.join('\n');
}

// ─── page ────────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<TR>('30d');
  const [exporting, setExporting] = useState(false);

  const currentKpis  = rangeKpis[timeRange];
  const currentChart = rangeChart[timeRange];
  const todayMark    = rangeTodayMark[timeRange];

  function handleExport() {
    setExporting(true);
    setTimeout(() => {
      const csv  = buildCSV(timeRange);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      const date = new Date().toISOString().split('T')[0];
      a.href     = url;
      a.download = `sales-report-${timeRange}-${date}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setExporting(false);
    }, 400);
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f4f6fb', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <div style={{ maxWidth: 1500, margin: '0 auto', padding: '32px 32px 48px' }}>

        {/* ── PAGE HEADER ────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, boxShadow: '0 4px 16px rgba(124,58,237,0.35)',
              flexShrink: 0,
            }}>📊</div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: -0.5 }}>
                  Sales Analytics
                </h1>
                <span style={{
                  fontSize: 10, fontWeight: 700, color: '#7c3aed',
                  background: '#ede9fe', padding: '3px 8px', borderRadius: 6,
                  textTransform: 'uppercase', letterSpacing: 1,
                }}>Admin</span>
              </div>
              <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>
                Comprehensive insights and forecast analysis
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as TR)}
              style={{
                padding: '9px 14px', background: '#fff', border: '1.5px solid #e2e8f0',
                borderRadius: 10, fontSize: 13, fontWeight: 600, color: '#334155',
                cursor: 'pointer', outline: 'none',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              }}
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </select>
            <button
              onClick={handleExport}
              disabled={exporting}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '9px 16px',
                background: exporting ? '#a78bfa' : 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                color: '#fff', border: 'none', borderRadius: 10,
                fontSize: 13, fontWeight: 700, cursor: exporting ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 14px rgba(124,58,237,0.35)',
                transition: 'all 0.2s',
              }}
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {exporting ? 'Exporting…' : 'Export Report'}
            </button>
          </div>
        </div>

        {/* ── KPI CARDS ──────────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          {currentKpis.map((kpi) => (
            <div key={kpi.title} style={{
              borderRadius: 18,
              background: kpi.gradient,
              padding: '22px 22px 18px',
              color: '#fff',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: `0 8px 24px ${kpi.glow}`,
            }}>
              {/* decorative circle */}
              <div style={{
                position: 'absolute', right: -16, top: -16,
                width: 80, height: 80,
                background: 'rgba(255,255,255,0.12)', borderRadius: '50%',
              }} />
              <div style={{
                position: 'absolute', right: 20, bottom: -20,
                width: 60, height: 60,
                background: 'rgba(255,255,255,0.07)', borderRadius: '50%',
              }} />
              <div style={{ position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, opacity: 0.8, margin: 0, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                    {kpi.title}
                  </p>
                  <span style={{ fontSize: 20 }}>{kpi.icon}</span>
                </div>
                <p style={{ fontSize: 30, fontWeight: 800, margin: 0, letterSpacing: -1 }}>{kpi.value}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                  <span style={{ fontSize: 11, opacity: 0.7 }}>{kpi.sub}</span>
                  <span style={{
                    fontSize: 11, fontWeight: 700,
                    background: 'rgba(255,255,255,0.2)',
                    padding: '2px 8px', borderRadius: 999,
                    color: kpi.change.startsWith('-') ? '#fca5a5' : '#bbf7d0',
                  }}>
                    {kpi.change.startsWith('-') ? '▼' : '▲'} {kpi.change}
                  </span>
                </div>
                {/* progress bar */}
                <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 999, height: 4, marginTop: 14 }}>
                  <div style={{ height: 4, borderRadius: 999, background: 'rgba(255,255,255,0.7)', width: `${kpi.pct}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── SALES FORECAST CHART ────────────────────────────────────────── */}
        <Card style={{ padding: '24px 24px 16px', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <CardHeader
              title="Sales Forecast vs Actual"
              subtitle={`Predicted trends vs actual performance · ${
                { '7d': 'This week', '30d': 'Current month: Jul', '90d': 'Last 13 weeks', '1y': 'Full year' }[timeRange]
              }`}
              accent="#8b5cf6"
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, fontSize: 12, color: '#94a3b8', marginBottom: 20 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 24, height: 2, background: '#8b5cf6', borderRadius: 2, display: 'inline-block' }} />
                Actual
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 24, height: 0, borderTop: '2px dashed #ec4899', display: 'inline-block' }} />
                Forecast
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 24, height: 0, borderTop: '2px dashed #10b981', display: 'inline-block' }} />
                Target
              </span>
            </div>
          </div>
          <div style={{ height: 340 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={currentChart} margin={{ top: 5, right: 16, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradForecast" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="period" stroke="#cbd5e1" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis stroke="#cbd5e1" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => `$${v / 1000}k`} width={48} />
                <Tooltip content={<ChartTooltip />} />
                {todayMark && (
                  <ReferenceLine x={todayMark} stroke="#e2e8f0" strokeDasharray="5 4"
                    label={{ value: 'Today', fill: '#94a3b8', fontSize: 11 }} />
                )}
                <Area type="monotone" dataKey="actual" name="Actual" stroke="#8b5cf6" strokeWidth={2.5}
                  fill="url(#gradActual)" dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 0 }} activeDot={{ r: 6 }} connectNulls={false} />
                <Area type="monotone" dataKey="forecast" name="Forecast" stroke="#ec4899" strokeWidth={2}
                  strokeDasharray="6 3" fill="url(#gradForecast)" dot={false} />
                <Area type="monotone" dataKey="target" name="Target" stroke="#10b981" strokeWidth={1.5}
                  strokeDasharray="3 4" fill="none" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* ── REVENUE BY CATEGORY + REGIONAL ─────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>

          {/* Pie / Category */}
          <Card style={{ padding: 24 }}>
            <CardHeader title="Revenue by Category" subtitle="Distribution across product categories" accent="#ec4899" />
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ width: 190, height: 190, flexShrink: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={52} outerRadius={85}
                      dataKey="value" paddingAngle={4} startAngle={90} endAngle={-270}>
                      {categoryData.map((e, i) => <Cell key={i} fill={e.color} stroke="none" />)}
                    </Pie>
                    <Tooltip formatter={(v: any, _: any, p: any) => [fmtUSD(p.payload.amount), p.payload.name]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {categoryData.map((cat) => (
                  <div key={cat.name}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 500, color: '#334155' }}>
                        <span style={{ width: 9, height: 9, borderRadius: '50%', background: cat.color, display: 'inline-block', flexShrink: 0 }} />
                        {cat.name}
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{cat.value}%</span>
                    </div>
                    <div style={{ background: '#f1f5f9', borderRadius: 999, height: 5 }}>
                      <div style={{ height: 5, borderRadius: 999, background: cat.color, width: `${cat.value * 2.5}%` }} />
                    </div>
                    <p style={{ fontSize: 11, color: '#94a3b8', margin: '2px 0 0', textAlign: 'right' }}>{fmtUSD(cat.amount)}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Regional Performance */}
          <Card style={{ padding: 24 }}>
            <CardHeader title="Regional Performance" subtitle="Sales distribution by geography" accent="#6366f1" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {regionalData.map((r) => {
                const max = Math.max(...regionalData.map((d) => d.sales));
                const pct = Math.round((r.sales / max) * 100);
                return (
                  <div key={r.region}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: '#334155' }}>{r.region}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{fmtUSD(r.sales)}</span>
                        <span style={{
                          fontSize: 11, fontWeight: 700, color: '#059669',
                          background: '#ecfdf5', padding: '2px 8px', borderRadius: 999,
                        }}>+{r.growth}%</span>
                      </div>
                    </div>
                    <div style={{ background: '#f1f5f9', borderRadius: 999, height: 7, overflow: 'hidden' }}>
                      <div style={{
                        height: 7, borderRadius: 999,
                        background: r.color,
                        width: `${pct}%`,
                        boxShadow: `0 2px 6px ${r.color}55`,
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* ── RADAR + BAR CHARTS ─────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>

          <Card style={{ padding: 24 }}>
            <CardHeader title="Product Performance Metrics" subtitle="Multi-dimensional quality analysis" accent="#10b981" />
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} margin={{ top: 8, right: 28, bottom: 8, left: 28 }}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12, fill: '#64748b' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <Radar name="Score" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2}
                    dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 0 }} />
                  <Tooltip formatter={(v: any) => [`${v}/100`, 'Score']} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card style={{ padding: 24 }}>
            <CardHeader title="Customer Segments" subtitle="Revenue distribution by customer type" accent="#f59e0b" />
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={segmentData} margin={{ top: 5, right: 12, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="segment" stroke="#cbd5e1" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#cbd5e1" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                    tickFormatter={(v) => `$${v / 1000}k`} width={48} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="revenue" name="Revenue" radius={[8, 8, 0, 0]} maxBarSize={56}>
                    {segmentData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* ── TOP PRODUCTS TABLE ─────────────────────────────────────────── */}
        <Card style={{ marginBottom: 24, overflow: 'hidden' }}>
          <div style={{
            padding: '20px 24px', borderBottom: '1px solid #f1f5f9',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <CardHeader title="Top Performing Products" subtitle="Best sellers ranked by growth" accent="#8b5cf6" />
            <button style={{
              fontSize: 13, fontWeight: 600, color: '#7c3aed',
              background: '#ede9fe', border: 'none', padding: '6px 14px',
              borderRadius: 8, cursor: 'pointer',
            }}>
              View all →
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#fafafa' }}>
                  {['#', 'Product', 'Units Sold', 'Revenue', 'Growth', 'Performance'].map((h) => (
                    <th key={h} style={{
                      padding: '10px 20px', textAlign: 'left',
                      fontSize: 11, fontWeight: 700, color: '#94a3b8',
                      textTransform: 'uppercase', letterSpacing: 0.8,
                      borderBottom: '1px solid #f1f5f9',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p, i) => {
                  const maxRev = Math.max(...topProducts.map((x) => x.revenue));
                  const revPct = Math.round((p.revenue / maxRev) * 100);
                  return (
                    <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#fafbff')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          width: 28, height: 28, borderRadius: '50%',
                          background: medalColors[i], color: '#fff', fontSize: 12, fontWeight: 700,
                        }}>{i + 1}</span>
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{p.name}</td>
                      <td style={{ padding: '14px 20px', fontSize: 13, color: '#475569', fontWeight: 500 }}>{fmt(p.sales)}</td>
                      <td style={{ padding: '14px 20px', fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{fmtUSD(p.revenue)}</td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{
                          fontSize: 12, fontWeight: 700, color: '#059669',
                          background: '#ecfdf5', padding: '3px 9px', borderRadius: 999,
                        }}>+{p.growth}%</span>
                      </td>
                      <td style={{ padding: '14px 20px', minWidth: 140 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ flex: 1, background: '#f1f5f9', borderRadius: 999, height: 6 }}>
                            <div style={{
                              height: 6, borderRadius: 999,
                              background: 'linear-gradient(90deg, #8b5cf6, #6366f1)',
                              width: `${revPct}%`,
                            }} />
                          </div>
                          <span style={{ fontSize: 11, color: '#94a3b8', width: 28 }}>{revPct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* ── INSIGHT CARDS ──────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {[
            {
              tag: 'Goal Tracker', title: 'Q3 Achievement',
              body: 'On track to exceed quarterly target by 15%',
              gradient: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              glow: 'rgba(124,58,237,0.3)',
              extra: (
                <div>
                  <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 999, height: 5, margin: '14px 0 6px' }}>
                    <div style={{ height: 5, borderRadius: 999, background: 'rgba(255,255,255,0.75)', width: '85%' }} />
                  </div>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', margin: 0 }}>85% of target achieved</p>
                </div>
              ),
            },
            {
              tag: 'Trending', title: 'Top Category',
              body: 'Electronics showing +23.5% growth this month',
              gradient: 'linear-gradient(135deg, #ec4899, #be185d)',
              glow: 'rgba(236,72,153,0.3)',
              extra: (
                <button style={{
                  fontSize: 12, fontWeight: 600, color: '#fff',
                  background: 'rgba(255,255,255,0.2)', border: 'none',
                  padding: '7px 14px', borderRadius: 8, cursor: 'pointer', marginTop: 14,
                }}>View Details →</button>
              ),
            },
            {
              tag: 'AI Insight', title: 'Recommendation',
              body: 'Increase Smart Watch Series X inventory before peak season',
              gradient: 'linear-gradient(135deg, #059669, #0f766e)',
              glow: 'rgba(5,150,105,0.3)',
              extra: (
                <button style={{
                  fontSize: 12, fontWeight: 600, color: '#fff',
                  background: 'rgba(255,255,255,0.2)', border: 'none',
                  padding: '7px 14px', borderRadius: 8, cursor: 'pointer', marginTop: 14,
                }}>Learn More →</button>
              ),
            },
          ].map((card) => (
            <div key={card.title} style={{
              borderRadius: 18, padding: 24, color: '#fff',
              background: card.gradient,
              boxShadow: `0 8px 24px ${card.glow}`,
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', right: -14, top: -14, width: 80, height: 80, background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />
              <div style={{ position: 'relative' }}>
                <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, opacity: 0.75, margin: '0 0 6px' }}>
                  {card.tag}
                </p>
                <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 8px', letterSpacing: -0.3 }}>{card.title}</h3>
                <p style={{ fontSize: 13, opacity: 0.85, margin: 0, lineHeight: 1.5 }}>{card.body}</p>
                {card.extra}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
