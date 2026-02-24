"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { getDisplayName } from "@/lib/product-mapping";

type SaleRow = {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
};

const FALLBACK_CATALOG = [
  { id: "p1", name: "Milk (1L)" },
  { id: "p2", name: "Bread" },
  { id: "p3", name: "Eggs (12)" },
  { id: "p4", name: "Rice (1kg)" },
  { id: "p5", name: "Cooking Oil (1L)" },
];

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

const DRAFT_KEY = "sf_daily_sales_draft_v1";

export default function DailySalesEntryPage() {
  const router = useRouter();
  const [saleDate, setSaleDate] = useState<string>(todayISO());
  const [rows, setRows] = useState<SaleRow[]>([
    { id: uid(), productId: "", productName: "", quantity: 1, unitPrice: 0 },
  ]);
  const [note, setNote] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [submitted, setSubmitted] = useState(false);
  const [productCatalog, setProductCatalog] = useState(FALLBACK_CATALOG);

  useEffect(() => {
    apiClient.getProducts()
      .then((resp) => {
        if (resp.products && resp.products.length > 0) {
          const catalog = resp.products.map((family: string, idx: number) => ({
            id: `pf_${idx}`,
            name: getDisplayName(family),
          }));
          setProductCatalog(catalog);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed?.saleDate) setSaleDate(parsed.saleDate);
      if (Array.isArray(parsed?.rows) && parsed.rows.length > 0) setRows(parsed.rows);
      if (typeof parsed?.note === "string") setNote(parsed.note);
    } catch {
      // ignore
    }
  }, []);

  const totals = useMemo(() => {
    const lineTotals = rows.map((r) => (r.quantity || 0) * (r.unitPrice || 0));
    const grandTotal = lineTotals.reduce((a, b) => a + b, 0);
    const totalUnits = rows.reduce((a, r) => a + (r.quantity || 0), 0);
    return { lineTotals, grandTotal, totalUnits };
  }, [rows]);

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      { id: uid(), productId: "", productName: "", quantity: 1, unitPrice: 0 },
    ]);
  };

  const removeRow = (id: string) => {
    setRows((prev) => (prev.length === 1 ? prev : prev.filter((r) => r.id !== id)));
  };

  const updateRow = (id: string, patch: Partial<SaleRow>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const onSelectProduct = (id: string, productId: string) => {
    const prod = productCatalog.find((p) => p.id === productId);
    updateRow(id, { productId, productName: prod?.name ?? "" });
  };

  const validate = () => {
    if (!saleDate) return "Please select a sale date.";
    const chosen = new Date(saleDate + "T00:00:00");
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (chosen > today) return "Sale date cannot be in the future.";
    for (const r of rows) {
      if (!r.productId) return "Please select a product in each row.";
      if (!Number.isFinite(r.quantity) || r.quantity <= 0) return "Quantity must be greater than 0.";
      if (!Number.isFinite(r.unitPrice) || r.unitPrice < 0) return "Unit price cannot be negative.";
    }
    return null;
  };

  const saveDraft = () => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ saleDate, rows, note }));
    setStatus("Draft saved locally ✅");
    setTimeout(() => setStatus(""), 2000);
  };

  const submit = () => {
    const err = validate();
    if (err) { setStatus(err); return; }

    const HISTORY_KEY = "sf_sales_history_v1";
    let existing: any[] = [];
    try {
      existing = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
      if (!Array.isArray(existing)) existing = [];
    } catch { existing = []; }

    const entry = {
      id: Date.now(),
      saleDate,
      note,
      items: rows.map((r) => ({
        productId: r.productId,
        productName: r.productName,
        quantity: r.quantity,
        unitPrice: r.unitPrice,
        total: r.quantity * r.unitPrice,
      })),
      totalUnits: rows.reduce((a, r) => a + r.quantity, 0),
      totalAmount: rows.reduce((a, r) => a + r.quantity * r.unitPrice, 0),
    };

    localStorage.setItem(HISTORY_KEY, JSON.stringify([entry, ...existing]));
    localStorage.removeItem(DRAFT_KEY);

    setRows([{ id: uid(), productId: "", productName: "", quantity: 1, unitPrice: 0 }]);
    setNote("");
    setSaleDate(todayISO());
    setSubmitted(true);
    setStatus("");
  };

  return (
    <div className="pg-page">
      <div className="pg-container">

        {/* Success Banner */}
        {submitted && (
          <div className="pg-banner pg-banner-success">
            <span>✓ Sales entry submitted successfully!</span>
            <div className="pg-header-right">
              <button type="button" className="pg-btn pg-btn-success pg-btn-sm" onClick={() => router.push("/dashboard/history")}>
                View in History
              </button>
              <button type="button" className="pg-btn pg-btn-sm" onClick={() => setSubmitted(false)}>
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Page Header */}
        <div className="pg-header">
          <div className="pg-header-left">
            <h1 className="pg-title">Add Daily Sales</h1>
            <p className="pg-subtitle">Enter today&apos;s sales as line items. Add multiple products in one submission.</p>
          </div>

          {/* Summary Box */}
          <div className="pg-kpi" style={{ minWidth: 220 }}>
            <p className="pg-kpi-label">Summary</p>
            <p className="pg-kpi-value">{totals.totalUnits} units</p>
            <p className="pg-kpi-sub">₹ {totals.grandTotal.toFixed(2)} total amount</p>
          </div>
        </div>

        {/* Date + Note */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem" }}>
          <div className="pg-card">
            <div className="pg-field">
              <label className="pg-label">Sale Date</label>
              <input
                type="date"
                className="pg-input pg-input-full"
                value={saleDate}
                onChange={(e) => setSaleDate(e.target.value)}
              />
            </div>
          </div>
          <div className="pg-card">
            <div className="pg-field">
              <label className="pg-label">Note (optional)</label>
              <input
                className="pg-input pg-input-full"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Festival sale, rainy day, discount, etc."
              />
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="pg-card">
          <div className="pg-card-header">
            <div>
              <p className="pg-card-title">Line Items</p>
              <p className="pg-card-sub">{rows.length} row{rows.length !== 1 ? "s" : ""} added</p>
            </div>
            <button type="button" className="pg-btn pg-btn-primary" onClick={addRow}>
              + Add Row
            </button>
          </div>

          <div className="pg-table-wrap">
            <table className="pg-table" style={{ minWidth: 760 }}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th style={{ width: 140 }}>Quantity</th>
                  <th style={{ width: 180 }}>Unit Price (₹)</th>
                  <th style={{ width: 160 }}>Total (₹)</th>
                  <th style={{ width: 90 }}>Remove</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, idx) => (
                  <tr key={r.id}>
                    <td>
                      <select
                        className="pg-select pg-input-full"
                        value={r.productId}
                        onChange={(e) => onSelectProduct(r.id, e.target.value)}
                      >
                        <option value="">Select product</option>
                        {productCatalog.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                      <div style={{ marginTop: 4, fontSize: "0.6875rem", color: "#94a3b8" }}>Row {idx + 1}</div>
                    </td>
                    <td>
                      <input
                        type="number"
                        className="pg-input pg-input-full"
                        value={r.quantity}
                        min={1}
                        onChange={(e) => updateRow(r.id, { quantity: Number(e.target.value) })}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="pg-input pg-input-full"
                        value={r.unitPrice}
                        min={0}
                        step="0.01"
                        onChange={(e) => updateRow(r.id, { unitPrice: Number(e.target.value) })}
                      />
                    </td>
                    <td className="cell-bold">₹ {(totals.lineTotals[idx] ?? 0).toFixed(2)}</td>
                    <td>
                      <button
                        type="button"
                        className="pg-btn pg-btn-danger pg-btn-sm"
                        onClick={() => removeRow(r.id)}
                        title="Remove row"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {status && (
            <p className={`${status.includes("✅") ? "pg-status-ok" : "pg-status-err"}`} style={{ marginTop: "0.75rem" }}>
              {status}
            </p>
          )}

          <div style={{ marginTop: "1rem", display: "flex", gap: "0.75rem", justifyContent: "flex-end", flexWrap: "wrap" }}>
            <button type="button" className="pg-btn" onClick={saveDraft}>
              Save Draft
            </button>
            <button type="button" className="pg-btn pg-btn-primary" onClick={submit}>
              Submit Sales
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
