"use client";

import React, { useMemo, useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { getDisplayName } from "@/lib/product-mapping";

type HistoryItem = {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

type HistoryEntry = {
  id: number;
  saleDate: string;
  note?: string;
  items: HistoryItem[];
  totalUnits: number;
  totalAmount: number;
};

const HISTORY_KEY = "sf_sales_history_v1";

type Preset = "7d" | "1w" | "1m" | "custom";

function parseISO(d: string) {
  return new Date(d + "T00:00:00");
}

function formatDate(d: string) {
  const dt = parseISO(d);
  return dt.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}

function toISO(date: Date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function todayISO() { return toISO(new Date()); }

function daysAgoISO(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return toISO(d);
}

function downloadCSV(filename: string, rows: string[][]) {
  const csv = rows
    .map((r) => r.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function SalesHistoryPage() {
  const [preset, setPreset] = useState<Preset>("7d");
  const [from, setFrom] = useState<string>(daysAgoISO(6));
  const [to, setTo] = useState<string>(todayISO());
  const [q, setQ] = useState<string>("");

  const [data, setData] = useState<HistoryEntry[]>([]);
  const [tab, setTab] = useState<"local" | "backend">("local");
  const [productFamilies, setProductFamilies] = useState<string[]>([]);
  const [selectedFamily, setSelectedFamily] = useState("BREAD/BAKERY");
  const [backendData, setBackendData] = useState<any[]>([]);
  const [backendLoading, setBackendLoading] = useState(false);

  useEffect(() => {
    apiClient.getProducts()
      .then((resp) => { if (resp.products) setProductFamilies(resp.products); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (tab !== "backend") return;
    setBackendLoading(true);
    apiClient.getSalesData({ product_family: selectedFamily })
      .then((resp) => {
        if (resp.success && resp.data) {
          const sorted = resp.data.sort(
            (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          setBackendData(sorted.slice(0, 100));
        }
      })
      .catch(() => setBackendData([]))
      .finally(() => setBackendLoading(false));
  }, [tab, selectedFamily]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      setData(Array.isArray(parsed) ? parsed : []);
    } catch { setData([]); }
  }, []);

  useEffect(() => {
    if (preset === "7d") { setFrom(daysAgoISO(6)); setTo(todayISO()); }
    if (preset === "1w") { setFrom(daysAgoISO(7)); setTo(todayISO()); }
    if (preset === "1m") { setFrom(daysAgoISO(30)); setTo(todayISO()); }
  }, [preset]);

  const filtered = useMemo(() => {
    const fromD = parseISO(from);
    const toD = parseISO(to);
    const query = q.trim().toLowerCase();

    return data.filter((e) => {
      const d = parseISO(e.saleDate);
      if (d < fromD || d > toD) return false;
      if (!query) return true;
      return (
        (e.note || "").toLowerCase().includes(query) ||
        e.saleDate.includes(query) ||
        e.items.some((it) => it.productName.toLowerCase().includes(query))
      );
    });
  }, [data, from, to, q]);

  const totals = useMemo(() => {
    const totalAmount = filtered.reduce((a, e) => a + (e.totalAmount || 0), 0);
    const totalUnits = filtered.reduce((a, e) => a + (e.totalUnits || 0), 0);
    const daysCount = new Set(filtered.map((e) => e.saleDate)).size;
    return { totalAmount, totalUnits, daysCount };
  }, [filtered]);

  const exportCSV = () => {
    const rows: string[][] = [
      ["Sale Date", "Note", "Product", "Quantity", "Unit Price", "Line Total", "Day Total Amount"],
    ];
    filtered.forEach((entry) => {
      entry.items.forEach((it, idx) => {
        rows.push([
          entry.saleDate,
          entry.note || "",
          it.productName,
          String(it.quantity),
          String(it.unitPrice),
          String(it.total),
          idx === 0 ? String(entry.totalAmount) : "",
        ]);
      });
    });
    downloadCSV(`sales_history_${from}_to_${to}.csv`, rows);
  };

  const clearAll = () => {
    if (!confirm("Clear all sales history stored locally?")) return;
    localStorage.removeItem(HISTORY_KEY);
    setData([]);
  };

  return (
    <div className="pg-page">
      <div className="pg-container">

        {/* Header */}
        <div className="pg-header">
          <div className="pg-header-left">
            <h1 className="pg-title">Sales History</h1>
            <p className="pg-subtitle">View records by date range and export as CSV.</p>
          </div>
          <div className="pg-header-right">
            <button type="button" className="pg-btn pg-btn-primary" onClick={exportCSV}>
              Export CSV
            </button>
            <button type="button" className="pg-btn pg-btn-danger" onClick={clearAll}>
              Clear Local Data
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="pg-tabs">
          <button type="button" className={`pg-tab ${tab === "local" ? "active" : ""}`} onClick={() => setTab("local")}>
            Local History
          </button>
          <button type="button" className={`pg-tab ${tab === "backend" ? "active" : ""}`} onClick={() => setTab("backend")}>
            Backend Dataset
          </button>
        </div>

        {tab === "backend" ? (
          <div className="pg-card">
            <div className="pg-card-header">
              <div>
                <p className="pg-card-title">Backend Dataset</p>
                <p className="pg-card-sub">Last 100 records from the backend API</p>
              </div>
            </div>
            <div className="pg-filter-bar" style={{ marginBottom: "1rem" }}>
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
              <span className="pg-badge pg-badge-slate" style={{ alignSelf: "flex-end", marginBottom: "2px" }}>
                Showing last 100 records
              </span>
            </div>

            {backendLoading ? (
              <p className="pg-loading">Loading backend data...</p>
            ) : backendData.length === 0 ? (
              <p className="pg-empty">No data found. Make sure the backend is running.</p>
            ) : (
              <div className="pg-table-wrap">
                <table className="pg-table" style={{ minWidth: 600 }}>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Product Family</th>
                      <th>Sales (units)</th>
                      <th>On Promotion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {backendData.map((r: any, idx: number) => (
                      <tr key={idx}>
                        <td className="cell-bold">{r.date}</td>
                        <td>{getDisplayName(selectedFamily)}</td>
                        <td className="cell-bold">{Math.round(r.sales || 0)}</td>
                        <td className="cell-muted">{r.onpromotion ?? "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Filters + Totals */}
            <div className="pg-card">
              <div className="pg-filter-bar">
                <div className="pg-field">
                  <label className="pg-label">Range</label>
                  <select
                    className="pg-select"
                    value={preset}
                    onChange={(e) => setPreset(e.target.value as Preset)}
                  >
                    <option value="7d">Last 7 Days</option>
                    <option value="1w">Last 1 Week</option>
                    <option value="1m">Last 1 Month</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                <div className="pg-field">
                  <label className="pg-label">From</label>
                  <input
                    type="date"
                    className="pg-input"
                    value={from}
                    onChange={(e) => { setPreset("custom"); setFrom(e.target.value); }}
                  />
                </div>
                <div className="pg-field">
                  <label className="pg-label">To</label>
                  <input
                    type="date"
                    className="pg-input"
                    value={to}
                    onChange={(e) => { setPreset("custom"); setTo(e.target.value); }}
                  />
                </div>
                <div className="pg-field" style={{ flex: 1, minWidth: 220 }}>
                  <label className="pg-label">Search</label>
                  <input
                    className="pg-input pg-input-full"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search by product, note, or date..."
                  />
                </div>
              </div>

              <div className="pg-pill-strip" style={{ marginTop: "1rem" }}>
                <span className="pg-pill">Days: {totals.daysCount}</span>
                <span className="pg-pill">Total Units: {totals.totalUnits}</span>
                <span className="pg-pill pg-pill-indigo">Total: ₹ {totals.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Records Table */}
            <div className="pg-card">
              <div className="pg-card-header">
                <div>
                  <p className="pg-card-title">Records</p>
                  <p className="pg-card-sub">{filtered.length} entr{filtered.length !== 1 ? "ies" : "y"} found</p>
                </div>
              </div>

              {filtered.length === 0 ? (
                <p className="pg-empty">
                  No records found for this range. Add sales from <b>Add Daily Sales</b>.
                </p>
              ) : (
                <div className="pg-table-wrap">
                  <table className="pg-table" style={{ minWidth: 860 }}>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Note</th>
                        <th>Products</th>
                        <th style={{ width: 120 }}>Units</th>
                        <th style={{ width: 150 }}>Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((entry) => (
                        <tr key={entry.id}>
                          <td>
                            <span className="cell-bold">{formatDate(entry.saleDate)}</span>
                            <div style={{ marginTop: 2, fontSize: "0.6875rem", color: "#94a3b8" }}>{entry.saleDate}</div>
                          </td>
                          <td>{entry.note || <span className="cell-muted">—</span>}</td>
                          <td>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
                              {entry.items.slice(0, 4).map((it, idx) => (
                                <span key={idx} className="pg-chip">{it.productName} × {it.quantity}</span>
                              ))}
                              {entry.items.length > 4 && (
                                <span style={{ fontSize: "0.6875rem", fontWeight: 800, color: "#6366f1" }}>
                                  +{entry.items.length - 4} more
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="cell-bold">{entry.totalUnits}</td>
                          <td className="cell-bold">₹ {entry.totalAmount.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
