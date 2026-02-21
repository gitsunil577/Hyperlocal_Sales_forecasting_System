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
  saleDate: string; // YYYY-MM-DD
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
  // show as DD MMM YYYY (simple)
  const dt = parseISO(d);
  return dt.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
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

function downloadCSV(filename: string, rows: string[][]) {
  const csv = rows
    .map((r) =>
      r
        .map((cell) => {
          const v = String(cell ?? "");
          const escaped = v.replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(",")
    )
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
  const [from, setFrom] = useState<string>(daysAgoISO(6)); // last 7 days includes today
  const [to, setTo] = useState<string>(todayISO());
  const [q, setQ] = useState<string>("");

  const [data, setData] = useState<HistoryEntry[]>([]);

  // Backend data state
  const [tab, setTab] = useState<"local" | "backend">("local");
  const [productFamilies, setProductFamilies] = useState<string[]>([]);
  const [selectedFamily, setSelectedFamily] = useState("BREAD/BAKERY");
  const [backendData, setBackendData] = useState<any[]>([]);
  const [backendLoading, setBackendLoading] = useState(false);

  // Load product families
  useEffect(() => {
    apiClient.getProducts()
      .then((resp) => { if (resp.products) setProductFamilies(resp.products); })
      .catch(() => {});
  }, []);

  // Fetch backend sales data when tab or family changes
  useEffect(() => {
    if (tab !== "backend") return;
    setBackendLoading(true);
    apiClient.getSalesData({ product_family: selectedFamily })
      .then((resp) => {
        if (resp.success && resp.data) {
          const sorted = resp.data.sort(
            (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          setBackendData(sorted.slice(0, 100)); // show last 100 records
        }
      })
      .catch(() => setBackendData([]))
      .finally(() => setBackendLoading(false));
  }, [tab, selectedFamily]);

  // Load saved history
  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      setData(Array.isArray(parsed) ? parsed : []);
    } catch {
      setData([]);
    }
  }, []);

  // When preset changes, update date range
  useEffect(() => {
    if (preset === "7d") {
      setFrom(daysAgoISO(6));
      setTo(todayISO());
    }
    if (preset === "1w") {
      setFrom(daysAgoISO(7));
      setTo(todayISO());
    }
    if (preset === "1m") {
      setFrom(daysAgoISO(30));
      setTo(todayISO());
    }
  }, [preset]);

  const filtered = useMemo(() => {
    const fromD = parseISO(from);
    const toD = parseISO(to);

    const query = q.trim().toLowerCase();

    return data.filter((e) => {
      const d = parseISO(e.saleDate);
      const inRange = d >= fromD && d <= toD;

      if (!inRange) return false;
      if (!query) return true;

      const matchNote = (e.note || "").toLowerCase().includes(query);
      const matchDate = e.saleDate.includes(query);
      const matchProducts = e.items.some((it) => it.productName.toLowerCase().includes(query));

      return matchNote || matchDate || matchProducts;
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
          idx === 0 ? String(entry.totalAmount) : "", // show day total once
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
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a" }}>Sales History</h1>
          <p style={{ marginTop: 6, fontSize: 14, color: "#94a3b8", fontWeight: 500 }}>
            View sales records by date range (7 days, 1 week, 1 month, custom) and export as CSV.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={exportCSV}
            style={{
              borderRadius: 12,
              border: "1px solid #4f46e5",
              background: "#4f46e5",
              color: "white",
              padding: "10px 12px",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Export CSV
          </button>

          <button
            type="button"
            onClick={clearAll}
            style={{
              borderRadius: 12,
              border: "1px solid #fecaca",
              background: "#fee2e2",
              color: "#991b1b",
              padding: "10px 12px",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Clear Local Data
          </button>
        </div>
      </div>

      {/* Tab Switcher */}
      <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
        <button
          onClick={() => setTab("local")}
          type="button"
          style={{
            padding: "10px 20px",
            borderRadius: 999,
            border: tab === "local" ? "1px solid #4f46e5" : "1px solid #e2e8f0",
            background: tab === "local" ? "#4f46e5" : "white",
            color: tab === "local" ? "white" : "#0f172a",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          Local History
        </button>
        <button
          onClick={() => setTab("backend")}
          type="button"
          style={{
            padding: "10px 20px",
            borderRadius: 999,
            border: tab === "backend" ? "1px solid #4f46e5" : "1px solid #e2e8f0",
            background: tab === "backend" ? "#4f46e5" : "white",
            color: tab === "backend" ? "white" : "#0f172a",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          Backend Dataset
        </button>
      </div>

      {tab === "backend" ? (
        <div style={{ marginTop: 16 }}>
          <div style={{ background: "white", borderRadius: 12, padding: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "end", flexWrap: "wrap", marginBottom: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 800, color: "#334155" }}>Product Family</label>
                <select
                  value={selectedFamily}
                  onChange={(e) => setSelectedFamily(e.target.value)}
                  style={{ marginTop: 8, borderRadius: 12, border: "1px solid #e2e8f0", padding: "10px 12px", fontWeight: 700 }}
                >
                  {productFamilies.map((f) => (
                    <option key={f} value={f}>{getDisplayName(f)}</option>
                  ))}
                </select>
              </div>
              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "10px 12px", borderRadius: 12, fontWeight: 800, color: "#0f172a" }}>
                Showing last 100 records
              </div>
            </div>

            {backendLoading ? (
              <div style={{ padding: 24, textAlign: "center", color: "#64748b", fontWeight: 700 }}>Loading backend data...</div>
            ) : backendData.length === 0 ? (
              <div style={{ color: "#64748b", fontWeight: 700 }}>No data found. Make sure the backend is running.</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 8px", minWidth: 600 }}>
                  <thead>
                    <tr style={{ textAlign: "left", color: "#64748b", fontSize: 13 }}>
                      <th style={{ padding: "0 10px" }}>Date</th>
                      <th style={{ padding: "0 10px" }}>Product Family</th>
                      <th style={{ padding: "0 10px" }}>Sales (units)</th>
                      <th style={{ padding: "0 10px" }}>On Promotion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {backendData.map((r: any, idx: number) => (
                      <tr key={idx} style={{ background: "#f8fafc" }}>
                        <td style={{ padding: 10, borderRadius: 12, fontWeight: 800, color: "#0f172a" }}>{r.date}</td>
                        <td style={{ padding: 10, fontWeight: 700, color: "#334155" }}>{getDisplayName(selectedFamily)}</td>
                        <td style={{ padding: 10, fontWeight: 800, color: "#0f172a" }}>{Math.round(r.sales || 0)}</td>
                        <td style={{ padding: 10, fontWeight: 700, color: "#64748b" }}>{r.onpromotion ?? "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
      <>
      {/* Filters */}
      <div style={{ marginTop: 16, background: "white", borderRadius: 12, padding: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "end" }}>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 800, color: "#334155" }}>Range</label>
            <select
              value={preset}
              onChange={(e) => setPreset(e.target.value as Preset)}
              style={{ marginTop: 8, borderRadius: 12, border: "1px solid #e2e8f0", padding: "10px 12px", background: "white" }}
            >
              <option value="7d">Last 7 Days</option>
              <option value="1w">Last 1 Week</option>
              <option value="1m">Last 1 Month</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 800, color: "#334155" }}>From</label>
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
            <label style={{ display: "block", fontSize: 13, fontWeight: 800, color: "#334155" }}>To</label>
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

          <div style={{ flex: 1, minWidth: 220 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 800, color: "#334155" }}>Search</label>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by product, note, or date..."
              style={{
                marginTop: 8,
                width: "100%",
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                padding: "10px 12px",
              }}
            />
          </div>
        </div>

        {/* Totals row */}
        <div style={{ marginTop: 14, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "10px 12px", borderRadius: 12, fontWeight: 800, color: "#0f172a" }}>
            Days: {totals.daysCount}
          </div>
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "10px 12px", borderRadius: 12, fontWeight: 800, color: "#0f172a" }}>
            Total Units: {totals.totalUnits}
          </div>
          <div style={{ background: "#eef2ff", border: "1px solid #c7d2fe", padding: "10px 12px", borderRadius: 12, fontWeight: 800, color: "#3730a3" }}>
            Total Amount: ₹ {totals.totalAmount.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={{ marginTop: 16, background: "white", borderRadius: 12, padding: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>Records</h2>

        {filtered.length === 0 ? (
          <div style={{ marginTop: 12, color: "#64748b", fontWeight: 600 }}>
            No records found for this range. Add sales from <b>Add Daily Sales</b>.
          </div>
        ) : (
          <div style={{ marginTop: 12, overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 10px", minWidth: 900 }}>
              <thead>
                <tr style={{ textAlign: "left", color: "#64748b", fontSize: 13 }}>
                  <th style={{ padding: "0 10px" }}>Date</th>
                  <th style={{ padding: "0 10px" }}>Note</th>
                  <th style={{ padding: "0 10px" }}>Products</th>
                  <th style={{ padding: "0 10px", width: 140 }}>Units</th>
                  <th style={{ padding: "0 10px", width: 160 }}>Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((entry) => (
                  <tr key={entry.id} style={{ background: "#f8fafc" }}>
                    <td style={{ padding: 12, borderRadius: 12, fontWeight: 800, color: "#0f172a" }}>
                      {formatDate(entry.saleDate)}
                      <div style={{ marginTop: 4, fontSize: 12, color: "#64748b" }}>{entry.saleDate}</div>
                    </td>

                    <td style={{ padding: 12, color: "#334155", fontWeight: 700 }}>
                      {entry.note || <span style={{ color: "#94a3b8" }}>—</span>}
                    </td>

                    <td style={{ padding: 12 }}>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {entry.items.slice(0, 4).map((it, idx) => (
                          <span
                            key={idx}
                            style={{
                              background: "white",
                              border: "1px solid #e2e8f0",
                              padding: "6px 10px",
                              borderRadius: 999,
                              fontSize: 12,
                              fontWeight: 800,
                              color: "#0f172a",
                            }}
                          >
                            {it.productName} × {it.quantity}
                          </span>
                        ))}
                        {entry.items.length > 4 && (
                          <span style={{ fontSize: 12, fontWeight: 800, color: "#6366f1" }}>
                            +{entry.items.length - 4} more
                          </span>
                        )}
                      </div>
                    </td>

                    <td style={{ padding: 12, fontWeight: 800, color: "#0f172a" }}>{entry.totalUnits}</td>
                    <td style={{ padding: 12, fontWeight: 800, color: "#0f172a" }}>₹ {entry.totalAmount.toFixed(2)}</td>
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
  );
}
