"use client";

import React, { useEffect, useMemo, useState } from "react";

type SaleRow = {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
};

const PRODUCT_CATALOG = [
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
  const [saleDate, setSaleDate] = useState<string>(todayISO());
  const [rows, setRows] = useState<SaleRow[]>([
    { id: uid(), productId: "", productName: "", quantity: 1, unitPrice: 0 },
  ]);
  const [note, setNote] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  // Load draft
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
    const prod = PRODUCT_CATALOG.find((p) => p.id === productId);
    updateRow(id, { productId, productName: prod?.name ?? "" });
  };

  const validate = () => {
    if (!saleDate) return "Please select a sale date.";

    // No future date
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

  const submit = async () => {
  const err = validate();
  if (err) {
    setStatus(err);
    return;
  }

  setStatus("Submitting...");

  try {
    // ✅ Later: Replace with real API call
    await new Promise((r) => setTimeout(r, 900));

    // ✅ Save into history ONLY after successful submit
    const HISTORY_KEY = "sf_sales_history_v1";

    let existing: any[] = [];
    try {
      existing = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
      if (!Array.isArray(existing)) existing = [];
    } catch {
      existing = [];
    }

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

    console.log("SUBMIT DAILY SALES", { saleDate, rows, note });

    localStorage.removeItem(DRAFT_KEY);
    setStatus("Submitted successfully ✅");

    // Reset form
    setRows([{ id: uid(), productId: "", productName: "", quantity: 1, unitPrice: 0 }]);
    setNote("");
    setSaleDate(todayISO());

    setTimeout(() => setStatus(""), 2500);
  } catch (e) {
    setStatus("Submission failed. Please try again.");
  }
};


  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a" }}>Add Daily Sales</h1>
          <p style={{ marginTop: 6, color: "#64748b" }}>
            Enter today’s sales as line items. You can add multiple products in one submission.
          </p>
        </div>

        <div style={{ minWidth: 260, background: "white", borderRadius: 16, padding: 16, boxShadow: "0 1px 12px rgba(0,0,0,0.06)" }}>
          <div style={{ fontWeight: 800, color: "#0f172a" }}>Summary</div>
          <div style={{ marginTop: 10, color: "#334155", fontWeight: 600 }}>Total Units: {totals.totalUnits}</div>
          <div style={{ marginTop: 6, color: "#334155", fontWeight: 600 }}>Total Amount: ₹ {totals.grandTotal.toFixed(2)}</div>
          <div style={{ marginTop: 10, fontSize: 12, color: "#64748b" }}>
            (This is calculated from Quantity × Unit Price)
          </div>
        </div>
      </div>

      <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, maxWidth: 900 }}>
        <div style={{ background: "white", borderRadius: 16, padding: 16, boxShadow: "0 1px 12px rgba(0,0,0,0.06)" }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#334155" }}>Sale Date</label>
          <input
            type="date"
            value={saleDate}
            onChange={(e) => setSaleDate(e.target.value)}
            style={{
              marginTop: 8,
              width: "100%",
              borderRadius: 12,
              border: "1px solid #e2e8f0",
              padding: "10px 12px",
              outline: "none",
            }}
          />
        </div>

        <div style={{ background: "white", borderRadius: 16, padding: 16, boxShadow: "0 1px 12px rgba(0,0,0,0.06)" }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#334155" }}>Note (optional)</label>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Festival sale, rainy day, discount, etc."
            style={{
              marginTop: 8,
              width: "100%",
              borderRadius: 12,
              border: "1px solid #e2e8f0",
              padding: "10px 12px",
              outline: "none",
            }}
          />
        </div>
      </div>

      <div style={{ marginTop: 16, background: "white", borderRadius: 16, padding: 16, boxShadow: "0 1px 12px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>Line Items</h2>
          <button
            type="button"
            onClick={addRow}
            style={{
              borderRadius: 12,
              border: "1px solid #c7d2fe",
              background: "#eef2ff",
              color: "#3730a3",
              padding: "10px 12px",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            + Add Row
          </button>
        </div>

        <div style={{ marginTop: 14, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 10px", minWidth: 760 }}>
            <thead>
              <tr style={{ textAlign: "left", color: "#64748b", fontSize: 13 }}>
                <th style={{ padding: "0 10px" }}>Product</th>
                <th style={{ padding: "0 10px", width: 140 }}>Quantity</th>
                <th style={{ padding: "0 10px", width: 180 }}>Unit Price (₹)</th>
                <th style={{ padding: "0 10px", width: 160 }}>Total (₹)</th>
                <th style={{ padding: "0 10px", width: 90 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, idx) => (
                <tr key={r.id} style={{ background: "#f8fafc" }}>
                  <td style={{ padding: 10, borderRadius: 12 }}>
                    <select
                      value={r.productId}
                      onChange={(e) => onSelectProduct(r.id, e.target.value)}
                      style={{
                        width: "100%",
                        borderRadius: 12,
                        border: "1px solid #e2e8f0",
                        padding: "10px 12px",
                        outline: "none",
                        background: "white",
                      }}
                    >
                      <option value="">Select product</option>
                      {PRODUCT_CATALOG.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    <div style={{ marginTop: 6, fontSize: 12, color: "#64748b" }}>
                      Row {idx + 1}
                    </div>
                  </td>

                  <td style={{ padding: 10 }}>
                    <input
                      type="number"
                      value={r.quantity}
                      min={1}
                      onChange={(e) => updateRow(r.id, { quantity: Number(e.target.value) })}
                      style={{
                        width: "100%",
                        borderRadius: 12,
                        border: "1px solid #e2e8f0",
                        padding: "10px 12px",
                        outline: "none",
                        background: "white",
                      }}
                    />
                  </td>

                  <td style={{ padding: 10 }}>
                    <input
                      type="number"
                      value={r.unitPrice}
                      min={0}
                      step="0.01"
                      onChange={(e) => updateRow(r.id, { unitPrice: Number(e.target.value) })}
                      style={{
                        width: "100%",
                        borderRadius: 12,
                        border: "1px solid #e2e8f0",
                        padding: "10px 12px",
                        outline: "none",
                        background: "white",
                      }}
                    />
                  </td>

                  <td style={{ padding: 10, fontWeight: 800, color: "#0f172a" }}>
                    ₹ {(totals.lineTotals[idx] ?? 0).toFixed(2)}
                  </td>

                  <td style={{ padding: 10 }}>
                    <button
                      type="button"
                      onClick={() => removeRow(r.id)}
                      title="Remove row"
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
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {status && (
          <div style={{ marginTop: 12, fontSize: 14, fontWeight: 700, color: status.includes("✅") ? "#065f46" : "#92400e" }}>
            {status}
          </div>
        )}

        <div style={{ marginTop: 14, display: "flex", gap: 12, justifyContent: "flex-end", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={saveDraft}
            style={{
              borderRadius: 12,
              border: "1px solid #e2e8f0",
              background: "white",
              color: "#0f172a",
              padding: "12px 14px",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Save Draft
          </button>

          <button
            type="button"
            onClick={submit}
            style={{
              borderRadius: 12,
              border: "1px solid #4f46e5",
              background: "#4f46e5",
              color: "white",
              padding: "12px 14px",
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            Submit Sales
          </button>
        </div>
      </div>
    </div>
  );
}
