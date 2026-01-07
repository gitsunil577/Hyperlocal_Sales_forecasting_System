"use client";

import React, { useEffect, useMemo, useState } from "react";

const SETTINGS_KEY = "sf_admin_settings_v1";

type AdminSettings = {
  defaultForecastHorizon: 7 | 14 | 30;
  leadTimeDays: number;
  safetyDays: number;
  defaultReorderPoint: number;
  lowStockAlertsEnabled: boolean;
  showConfidence: boolean;
  showSuggestions: boolean;
  vendorApprovalMode: "auto" | "manual";
  orgName: string;
};

const DEFAULT_SETTINGS: AdminSettings = {
  orgName: "SalesForecast",
  defaultForecastHorizon: 7,
  leadTimeDays: 3,
  safetyDays: 2,
  defaultReorderPoint: 10,
  lowStockAlertsEnabled: true,
  showConfidence: true,
  showSuggestions: true,
  vendorApprovalMode: "auto",
};

type InventoryItem = {
  id: string;
  name: string;
  sku: string;
  category: string;
  unitPrice: number;
  stock: number;
  reorderPoint: number;
};

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

const INVENTORY_KEY = "sf_inventory_v1";
const HISTORY_KEY = "sf_sales_history_v1";

function uid() {
  return "p_" + Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function clampNum(n: number) {
  if (!Number.isFinite(n)) return 0;
  return n;
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [q, setQ] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [edit, setEdit] = useState<InventoryItem | null>(null);

  const [settings, setSettings] = useState<AdminSettings>(DEFAULT_SETTINGS);

  // Load admin settings
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      if (parsed && typeof parsed === "object") {
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      } else {
        setSettings(DEFAULT_SETTINGS);
      }
    } catch {
      setSettings(DEFAULT_SETTINGS);
    }
  }, []);

  // Load inventory
  useEffect(() => {
    try {
      const raw = localStorage.getItem(INVENTORY_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      setItems(Array.isArray(parsed) ? parsed : []);
    } catch {
      setItems([]);
    }
  }, []);

  // Load sales history
  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      setHistory(Array.isArray(parsed) ? parsed : []);
    } catch {
      setHistory([]);
    }
  }, []);

  // Save inventory
  useEffect(() => {
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(items));
  }, [items]);

  const computed = useMemo(() => {
    // Aggregate units sold per product over last 7 entries
    const last7 = [...history]
      .sort((a, b) => (a.saleDate > b.saleDate ? 1 : -1))
      .slice(-7);

    const soldMap = new Map<string, { units: number; name: string }>();
    last7.forEach((entry) => {
      entry.items.forEach((it) => {
        const key = it.productId || it.productName;
        const prev = soldMap.get(key) || { units: 0, name: it.productName };
        soldMap.set(key, { units: prev.units + (it.quantity || 0), name: it.productName });
      });
    });

    // ✅ from admin settings
    const leadTimeDays = settings.leadTimeDays ?? 3;
    const safetyDays = settings.safetyDays ?? 2;

    const windowDays = 7;

    const rows = items.map((p) => {
      const sold = soldMap.get(p.id) || soldMap.get(p.name);
      const totalUnitsLast7 = sold?.units || 0;
      const avgDaily = totalUnitsLast7 / windowDays;

      const suggested = Math.max(
        0,
        Math.ceil(avgDaily * (leadTimeDays + safetyDays) - p.stock)
      );

      const lowStock = p.stock <= p.reorderPoint;

      return {
        ...p,
        avgDaily: Number(avgDaily.toFixed(2)),
        suggested,
        lowStock,
        totalUnitsLast7,
      };
    });

    // KPIs
    const lowCount = rows.filter((r) => r.lowStock).length;
    const totalValue = rows.reduce((a, r) => a + r.stock * r.unitPrice, 0);
    const totalSkus = rows.length;

    return { rows, lowCount, totalValue, totalSkus };
  }, [items, history, settings]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return computed.rows;

    return computed.rows.filter((r) => {
      return (
        r.name.toLowerCase().includes(query) ||
        r.sku.toLowerCase().includes(query) ||
        r.category.toLowerCase().includes(query)
      );
    });
  }, [q, computed.rows]);

  const openAdd = () => {
    setEdit(null);
    setShowModal(true);
  };

  const openEdit = (p: InventoryItem) => {
    setEdit(p);
    setShowModal(true);
  };

  const removeItem = (id: string) => {
    if (!confirm("Delete this product?")) return;
    setItems((prev) => prev.filter((x) => x.id !== id));
  };

  const onSave = (payload: Omit<InventoryItem, "id"> & { id?: string }) => {
    if (edit) {
      setItems((prev) =>
        prev.map((x) =>
          x.id === edit.id ? ({ ...x, ...payload, id: edit.id } as InventoryItem) : x
        )
      );
    } else {
      const newItem: InventoryItem = {
        id: uid(),
        ...payload,
      } as InventoryItem;
      setItems((prev) => [newItem, ...prev]);
    }
    setShowModal(false);
    setEdit(null);
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: "#0f172a" }}>Inventory</h1>
          <p style={{ marginTop: 6, color: "#64748b", fontWeight: 600 }}>
            Track stock, low-stock alerts, and reorder suggestions (based on last 7 sales).
          </p>
          <p style={{ marginTop: 6, color: "#64748b", fontWeight: 700, fontSize: 12 }}>
            Using Admin Settings → lead time: <b>{settings.leadTimeDays}</b> days, safety:{" "}
            <b>{settings.safetyDays}</b> days
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search product / SKU / category..."
            style={{
              width: 320,
              maxWidth: "100%",
              borderRadius: 12,
              border: "1px solid #e2e8f0",
              padding: "10px 12px",
            }}
          />
          <button
            onClick={openAdd}
            style={{
              borderRadius: 12,
              border: "1px solid #c7d2fe",
              background: "#4f46e5",
              color: "white",
              padding: "10px 12px",
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            + Add Product
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div
        style={{
          marginTop: 16,
          display: "grid",
          gap: 14,
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        }}
      >
        <KPI title="Total Products" value={`${computed.totalSkus}`} subtitle="SKUs tracked" />
        <KPI
          title="Low Stock Alerts"
          value={`${computed.lowCount}`}
          subtitle={settings.lowStockAlertsEnabled ? "Needs attention" : "Disabled by Admin"}
        />
        <KPI title="Inventory Value" value={`₹ ${computed.totalValue.toFixed(2)}`} subtitle="Stock × unit price" />
        <KPI title="Reorder Tip" value="Use suggestions" subtitle="Based on last 7 sales" />
      </div>

      <div style={{ marginTop: 16, display: "grid", gap: 16, gridTemplateColumns: "repeat(12, 1fr)" }}>
        {/* ✅ Low stock panel controlled by admin */}
        {settings.lowStockAlertsEnabled && (
          <Card title="Low Stock Alerts" subtitle="Products below reorder point" colSpan={4}>
            {computed.rows.filter((r) => r.lowStock).length === 0 ? (
              <div style={{ color: "#64748b", fontWeight: 800 }}>No low-stock alerts 🎉</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {computed.rows
                  .filter((r) => r.lowStock)
                  .slice(0, 6)
                  .map((r) => (
                    <div
                      key={r.id}
                      style={{
                        border: "1px solid #fecaca",
                        background: "#fee2e2",
                        borderRadius: 14,
                        padding: 12,
                      }}
                    >
                      <div style={{ fontWeight: 900, color: "#991b1b" }}>{r.name}</div>
                      <div style={{ marginTop: 6, fontSize: 13, color: "#7f1d1d", fontWeight: 800 }}>
                        Stock: {r.stock} • Reorder Point: {r.reorderPoint}
                      </div>
                      <div style={{ marginTop: 6, fontSize: 13, color: "#7f1d1d", fontWeight: 800 }}>
                        Suggested reorder: <b>{r.suggested}</b>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </Card>
        )}

        {/* Table */}
        <Card
          title="Products"
          subtitle="Stock + reorder suggestion"
          colSpan={settings.lowStockAlertsEnabled ? 8 : 12}
        >
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "separate",
                borderSpacing: "0 10px",
                minWidth: 900,
              }}
            >
              <thead>
                <tr style={{ textAlign: "left", color: "#64748b", fontSize: 13 }}>
                  <th style={{ padding: "0 10px" }}>Product</th>
                  <th style={{ padding: "0 10px" }}>SKU</th>
                  <th style={{ padding: "0 10px" }}>Category</th>
                  <th style={{ padding: "0 10px" }}>Stock</th>
                  <th style={{ padding: "0 10px" }}>Reorder Point</th>
                  <th style={{ padding: "0 10px" }}>Avg Daily (7d)</th>
                  <th style={{ padding: "0 10px" }}>Suggested Reorder</th>
                  <th style={{ padding: "0 10px", width: 180 }}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((r) => (
                  <tr
                    key={r.id}
                    style={{
                      background:
                        settings.lowStockAlertsEnabled && r.lowStock ? "#fff1f2" : "#f8fafc",
                    }}
                  >
                    <td style={{ padding: 12, borderRadius: 12, fontWeight: 900, color: "#0f172a" }}>
                      {r.name}
                      <div style={{ marginTop: 4, fontSize: 12, color: "#64748b" }}>
                        Unit price: ₹ {r.unitPrice}
                      </div>
                    </td>
                    <td style={{ padding: 12, fontWeight: 800, color: "#334155" }}>{r.sku}</td>
                    <td style={{ padding: 12, fontWeight: 800, color: "#334155" }}>{r.category}</td>

                    <td style={{ padding: 12 }}>
                      <Pill
                        text={`${r.stock}`}
                        tone={settings.lowStockAlertsEnabled && r.lowStock ? "rose" : "slate"}
                      />
                    </td>

                    <td style={{ padding: 12 }}>
                      <Pill text={`${r.reorderPoint}`} tone="indigo" />
                    </td>

                    <td style={{ padding: 12, fontWeight: 900, color: "#0f172a" }}>
                      {r.avgDaily}
                      <div style={{ marginTop: 4, fontSize: 12, color: "#64748b", fontWeight: 800 }}>
                        Sold (7 entries): {r.totalUnitsLast7}
                      </div>
                    </td>

                    <td style={{ padding: 12 }}>
                      <Pill text={`${r.suggested}`} tone={r.suggested > 0 ? "emerald" : "slate"} />
                    </td>

                    <td style={{ padding: 12, display: "flex", gap: 10 }}>
                      <button type="button" onClick={() => openEdit(r)} style={btnBase}>
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => removeItem(r.id)}
                        style={{
                          ...btnBase,
                          border: "1px solid #fecaca",
                          background: "#fee2e2",
                          color: "#991b1b",
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div style={{ marginTop: 10, color: "#64748b", fontWeight: 800 }}>
                No products found.
              </div>
            )}
          </div>
        </Card>
      </div>

      {showModal && (
        <ProductModal
          initial={edit}
          defaultReorderPoint={settings.defaultReorderPoint}
          onClose={() => {
            setShowModal(false);
            setEdit(null);
          }}
          onSave={onSave}
        />
      )}
    </div>
  );
}

const btnBase: React.CSSProperties = {
  borderRadius: 12,
  border: "1px solid #e2e8f0",
  background: "white",
  padding: "10px 12px",
  fontWeight: 900,
  cursor: "pointer",
};

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
      <div style={{ fontSize: 16, fontWeight: 900, color: "#0f172a" }}>{title}</div>
      <div style={{ marginTop: 4, fontSize: 12, fontWeight: 700, color: "#64748b" }}>{subtitle}</div>
      <div style={{ marginTop: 12 }}>{children}</div>
    </div>
  );
}

function Pill({ text, tone }: { text: string; tone: "rose" | "indigo" | "emerald" | "slate" }) {
  const map = {
    rose: { bg: "#ffe4e6", border: "#fecdd3", color: "#9f1239" },
    indigo: { bg: "#eef2ff", border: "#c7d2fe", color: "#3730a3" },
    emerald: { bg: "#ecfdf5", border: "#a7f3d0", color: "#065f46" },
    slate: { bg: "#f1f5f9", border: "#e2e8f0", color: "#0f172a" },
  }[tone];

  return (
    <span
      style={{
        display: "inline-block",
        background: map.bg,
        border: `1px solid ${map.border}`,
        color: map.color,
        padding: "6px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 900,
        minWidth: 42,
        textAlign: "center",
      }}
    >
      {text}
    </span>
  );
}

function ProductModal({
  initial,
  defaultReorderPoint,
  onClose,
  onSave,
}: {
  initial: InventoryItem | null;
  defaultReorderPoint: number;
  onClose: () => void;
  onSave: (p: Omit<InventoryItem, "id"> & { id?: string }) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [sku, setSku] = useState(initial?.sku ?? "");
  const [category, setCategory] = useState(initial?.category ?? "General");
  const [unitPrice, setUnitPrice] = useState(String(initial?.unitPrice ?? 0));
  const [stock, setStock] = useState(String(initial?.stock ?? 0));

  // ✅ default from Admin Settings when adding
  const [reorderPoint, setReorderPoint] = useState(
    String(initial?.reorderPoint ?? defaultReorderPoint ?? 10)
  );

  const [err, setErr] = useState<string | null>(null);

  const submit = () => {
    setErr(null);

    if (!name.trim()) return setErr("Product name is required.");
    if (!sku.trim()) return setErr("SKU is required.");

    const up = clampNum(Number(unitPrice));
    const st = Math.max(0, clampNum(Number(stock)));
    const rp = Math.max(0, clampNum(Number(reorderPoint)));

    onSave({
      name: name.trim(),
      sku: sku.trim(),
      category: category.trim(),
      unitPrice: up,
      stock: st,
      reorderPoint: rp,
    });
  };

  return (
    <div style={overlay}>
      <div style={modal}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#0f172a" }}>
              {initial ? "Edit Product" : "Add Product"}
            </div>
            <div style={{ marginTop: 4, fontSize: 12, fontWeight: 700, color: "#64748b" }}>
              Inventory data is local now; later it will save to DB.
            </div>
          </div>
          <button onClick={onClose} style={closeBtn}>✕</button>
        </div>

        {err && (
          <div
            style={{
              marginTop: 12,
              background: "#fee2e2",
              border: "1px solid #fecaca",
              color: "#991b1b",
              padding: "10px 12px",
              borderRadius: 12,
              fontWeight: 800,
            }}
          >
            {err}
          </div>
        )}

        <div style={{ marginTop: 14, display: "grid", gap: 12, gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
          <Field label="Product Name" value={name} onChange={setName} placeholder="e.g., Milk 500ml" />
          <Field label="SKU" value={sku} onChange={setSku} placeholder="e.g., SKU-1001" />
          <Field label="Category" value={category} onChange={setCategory} placeholder="e.g., Dairy" />
          <Field label="Unit Price (₹)" value={unitPrice} onChange={setUnitPrice} type="number" />
          <Field label="Stock" value={stock} onChange={setStock} type="number" />
          <Field label="Reorder Point" value={reorderPoint} onChange={setReorderPoint} type="number" />
        </div>

        <div style={{ marginTop: 16, display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={btnBase}>Cancel</button>
          <button
            onClick={submit}
            style={{
              ...btnBase,
              border: "1px solid #c7d2fe",
              background: "#4f46e5",
              color: "white",
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 900, color: "#334155" }}>{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        type={type}
        style={{
          marginTop: 8,
          width: "100%",
          borderRadius: 12,
          border: "1px solid #e2e8f0",
          padding: "10px 12px",
        }}
      />
    </div>
  );
}

const overlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.55)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
  padding: 16,
};

const modal: React.CSSProperties = {
  width: "min(760px, 100%)",
  background: "white",
  borderRadius: 18,
  padding: 16,
  boxShadow: "0 20px 80px rgba(0,0,0,0.25)",
};

const closeBtn: React.CSSProperties = {
  borderRadius: 12,
  border: "1px solid #e2e8f0",
  background: "white",
  width: 40,
  height: 40,
  cursor: "pointer",
  fontWeight: 900,
};
