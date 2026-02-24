"use client";

import React, { useEffect, useMemo, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { getDisplayName, getEmoji } from "@/lib/product-mapping";

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

  const [productFamilies, setProductFamilies] = useState<string[]>([]);
  const [selectedFamily, setSelectedFamily] = useState("BREAD/BAKERY");
  const [recommendations, setRecommendations] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [recLoading, setRecLoading] = useState(false);
  const [recError, setRecError] = useState<string | null>(null);

  const [actionPlan, setActionPlan] = useState<string | null>(null);
  const [actionPlanLoading, setActionPlanLoading] = useState(false);
  const [actionPlanError, setActionPlanError] = useState<string | null>(null);

  useEffect(() => {
    apiClient.getProducts()
      .then((resp) => { if (resp.products) setProductFamilies(resp.products); })
      .catch(() => {});
  }, []);

  const fetchRecommendations = async () => {
    setRecLoading(true);
    setRecError(null);
    setActionPlan(null);
    setActionPlanError(null);
    try {
      const resp = await apiClient.getInventoryRecommendations({
        product_family: selectedFamily,
        model_type: "prophet",
        current_stock: 100,
      });
      if (resp.success) {
        setRecommendations(resp.recommendations);
        setAlerts(resp.alerts || []);
        setActionPlanLoading(true);
        apiClient
          .getInventoryInsight({ product_family: selectedFamily, recommendations: resp.recommendations })
          .then((insightResp) => {
            if (insightResp.success) setActionPlan(insightResp.insight);
            else setActionPlanError(insightResp.error || "Failed to generate insight");
          })
          .catch(() => setActionPlanError("Gemini insight unavailable — check API key"))
          .finally(() => setActionPlanLoading(false));
      } else {
        setRecError(resp.error || "Failed to get recommendations");
      }
    } catch (err: any) {
      setRecError(err.message || "Backend not available or model not trained. Train a model first in the Forecast page.");
    } finally {
      setRecLoading(false);
    }
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      setSettings(parsed && typeof parsed === "object" ? { ...DEFAULT_SETTINGS, ...parsed } : DEFAULT_SETTINGS);
    } catch { setSettings(DEFAULT_SETTINGS); }
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(INVENTORY_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      setItems(Array.isArray(parsed) ? parsed : []);
    } catch { setItems([]); }
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      setHistory(Array.isArray(parsed) ? parsed : []);
    } catch { setHistory([]); }
  }, []);

  useEffect(() => {
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(items));
  }, [items]);

  const computed = useMemo(() => {
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

    const leadTimeDays = settings.leadTimeDays ?? 3;
    const safetyDays = settings.safetyDays ?? 2;

    const rows = items.map((p) => {
      const sold = soldMap.get(p.id) || soldMap.get(p.name);
      const totalUnitsLast7 = sold?.units || 0;
      const avgDaily = totalUnitsLast7 / 7;
      const suggested = Math.max(0, Math.ceil(avgDaily * (leadTimeDays + safetyDays) - p.stock));
      const lowStock = p.stock <= p.reorderPoint;
      return { ...p, avgDaily: Number(avgDaily.toFixed(2)), suggested, lowStock, totalUnitsLast7 };
    });

    const lowCount = rows.filter((r) => r.lowStock).length;
    const totalValue = rows.reduce((a, r) => a + r.stock * r.unitPrice, 0);
    const totalSkus = rows.length;

    return { rows, lowCount, totalValue, totalSkus };
  }, [items, history, settings]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return computed.rows;
    return computed.rows.filter((r) =>
      r.name.toLowerCase().includes(query) ||
      r.sku.toLowerCase().includes(query) ||
      r.category.toLowerCase().includes(query)
    );
  }, [q, computed.rows]);

  const openAdd = () => { setEdit(null); setShowModal(true); };
  const openEdit = (p: InventoryItem) => { setEdit(p); setShowModal(true); };
  const removeItem = (id: string) => {
    if (!confirm("Delete this product?")) return;
    setItems((prev) => prev.filter((x) => x.id !== id));
  };

  const onSave = (payload: Omit<InventoryItem, "id"> & { id?: string }) => {
    if (edit) {
      setItems((prev) => prev.map((x) => x.id === edit.id ? ({ ...x, ...payload, id: edit.id } as InventoryItem) : x));
    } else {
      setItems((prev) => [{ id: uid(), ...payload } as InventoryItem, ...prev]);
    }
    setShowModal(false);
    setEdit(null);
  };

  const lowStockRows = computed.rows.filter((r) => r.lowStock);

  return (
    <div className="pg-page">
      <div className="pg-container">

        {/* Header */}
        <div className="pg-header">
          <div className="pg-header-left">
            <h1 className="pg-title">Inventory</h1>
            <p className="pg-subtitle">
              Track stock, low-stock alerts, and reorder suggestions (based on last 7 sales).
              Lead time: <b>{settings.leadTimeDays}</b>d · Safety: <b>{settings.safetyDays}</b>d
            </p>
          </div>
          <div className="pg-header-right">
            <input
              className="pg-input"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search product / SKU / category..."
              style={{ width: 280 }}
            />
            <button type="button" className="pg-btn pg-btn-primary" onClick={openAdd}>
              + Add Product
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="pg-kpi-grid">
          <div className="pg-kpi">
            <p className="pg-kpi-label">Total Products</p>
            <p className="pg-kpi-value">{computed.totalSkus}</p>
            <p className="pg-kpi-sub">SKUs tracked</p>
          </div>
          <div className="pg-kpi">
            <p className="pg-kpi-label">Low Stock Alerts</p>
            <p className="pg-kpi-value" style={{ color: computed.lowCount > 0 ? "#dc2626" : "#0f172a" }}>
              {computed.lowCount}
            </p>
            <p className="pg-kpi-sub">{settings.lowStockAlertsEnabled ? "Needs attention" : "Disabled by Admin"}</p>
          </div>
          <div className="pg-kpi">
            <p className="pg-kpi-label">Inventory Value</p>
            <p className="pg-kpi-value">₹ {computed.totalValue.toFixed(0)}</p>
            <p className="pg-kpi-sub">Stock × unit price</p>
          </div>
          <div className="pg-kpi">
            <p className="pg-kpi-label">Reorder Tip</p>
            <p className="pg-kpi-value" style={{ fontSize: "0.9375rem" }}>Use suggestions</p>
            <p className="pg-kpi-sub">Based on last 7 sales</p>
          </div>
        </div>

        {/* Split: Alerts + Table */}
        <div className={`pg-split-row`}>
          {/* Low Stock Panel */}
          {settings.lowStockAlertsEnabled && (
            <div className="pg-card" style={{ alignSelf: "start" }}>
              <div className="pg-card-header">
                <div>
                  <p className="pg-card-title">Low Stock Alerts</p>
                  <p className="pg-card-sub">Products below reorder point</p>
                </div>
                {lowStockRows.length > 0 && (
                  <span className="pg-badge pg-badge-rose">{lowStockRows.length}</span>
                )}
              </div>
              {lowStockRows.length === 0 ? (
                <p className="pg-empty">No low-stock alerts 🎉</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                  {lowStockRows.slice(0, 6).map((r) => (
                    <div key={r.id} className="pg-alert-card">
                      <p className="pg-alert-name">{r.name}</p>
                      <p className="pg-alert-info">Stock: {r.stock} · Reorder: {r.reorderPoint}</p>
                      <p className="pg-alert-info">Suggested reorder: <b>{r.suggested}</b></p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Products Table */}
          <div className="pg-card">
            <div className="pg-card-header">
              <div>
                <p className="pg-card-title">Products</p>
                <p className="pg-card-sub">Stock + reorder suggestion based on sales history</p>
              </div>
            </div>
            <div className="pg-table-wrap">
              <table className="pg-table" style={{ minWidth: 860 }}>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Category</th>
                    <th>Stock</th>
                    <th>Reorder Pt.</th>
                    <th>Avg Daily (7d)</th>
                    <th>Suggested</th>
                    <th style={{ width: 160 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.id} className={settings.lowStockAlertsEnabled && r.lowStock ? "row-danger" : ""}>
                      <td>
                        <span className="cell-bold">{r.name}</span>
                        <div style={{ marginTop: 2, fontSize: "0.6875rem", color: "#94a3b8" }}>₹ {r.unitPrice}</div>
                      </td>
                      <td className="cell-bold">{r.sku}</td>
                      <td>{r.category}</td>
                      <td>
                        <span className={`pg-badge ${settings.lowStockAlertsEnabled && r.lowStock ? "pg-badge-rose" : "pg-badge-slate"}`}>
                          {r.stock}
                        </span>
                      </td>
                      <td><span className="pg-badge pg-badge-indigo">{r.reorderPoint}</span></td>
                      <td>
                        <span className="cell-bold">{r.avgDaily}</span>
                        <div style={{ marginTop: 2, fontSize: "0.6875rem", color: "#94a3b8" }}>Sold: {r.totalUnitsLast7}</div>
                      </td>
                      <td>
                        <span className={`pg-badge ${r.suggested > 0 ? "pg-badge-emerald" : "pg-badge-slate"}`}>
                          {r.suggested}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <button type="button" className="pg-btn pg-btn-sm" onClick={() => openEdit(r)}>Edit</button>
                          <button type="button" className="pg-btn pg-btn-danger pg-btn-sm" onClick={() => removeItem(r.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && <p className="pg-empty">No products found.</p>}
            </div>
          </div>
        </div>

        {/* AI Recommendations Section */}
        <div className="pg-card">
          <div className="pg-card-header">
            <div>
              <p className="pg-card-title">AI-Powered Recommendations</p>
              <p className="pg-card-sub">Get inventory recommendations from the ML backend for perishable products.</p>
            </div>
            <div style={{ display: "flex", gap: "0.625rem", alignItems: "flex-end", flexWrap: "wrap" }}>
              <div className="pg-field">
                <label className="pg-label">Product Family</label>
                <select
                  className="pg-select"
                  value={selectedFamily}
                  onChange={(e) => setSelectedFamily(e.target.value)}
                >
                  {productFamilies.map((f) => (
                    <option key={f} value={f}>{getEmoji(f)} {getDisplayName(f)}</option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                className="pg-btn pg-btn-success"
                onClick={fetchRecommendations}
                disabled={recLoading}
              >
                {recLoading ? "Loading..." : "Get Recommendations"}
              </button>
            </div>
          </div>

          {recError && (
            <div className="pg-banner pg-banner-error" style={{ marginTop: "0.5rem" }}>{recError}</div>
          )}

          {/* Gemini Action Plan */}
          {(actionPlanLoading || actionPlan || actionPlanError) && (
            <div className="pg-ai-card pg-ai-card-green" style={{ marginTop: "1rem" }}>
              <div className="pg-ai-card-head">
                <span className="pg-ai-badge pg-ai-badge-green">AI ACTION PLAN</span>
                <span className="pg-ai-title pg-ai-title-green">Gemini Inventory Advisor</span>
              </div>
              {actionPlanLoading && <p className="pg-ai-generating">Generating action plan...</p>}
              {actionPlanError && <div className="pg-banner pg-banner-error" style={{ marginTop: "0.5rem" }}>{actionPlanError}</div>}
              {actionPlan && <p className="pg-ai-text pg-ai-text-green">{actionPlan}</p>}
            </div>
          )}

          {/* Recommendations KPIs */}
          {recommendations && (
            <div className="pg-kpi-grid" style={{ marginTop: "1rem" }}>
              {[
                { label: "Stock Status", value: recommendations.stock_status || "N/A", sub: getDisplayName(selectedFamily) },
                { label: "Order Recommendation", value: recommendations.order_recommendation || "N/A", sub: "Action needed" },
                { label: "Order Quantity", value: `${recommendations.order_quantity ?? "N/A"}`, sub: "Suggested units" },
                { label: "Wastage Risk", value: recommendations.wastage_risk || "N/A", sub: "Perishability factor" },
                { label: "Safety Stock", value: `${recommendations.safety_stock?.toFixed(0) ?? "N/A"}`, sub: "Buffer units" },
                { label: "Reorder Point", value: `${recommendations.reorder_point?.toFixed(0) ?? "N/A"}`, sub: "Trigger level" },
                { label: "Days of Stock", value: `${recommendations.days_of_stock?.toFixed(1) ?? "N/A"}`, sub: "At current rate" },
                { label: "Daily Forecast", value: `${recommendations.avg_daily_forecast?.toFixed(1) ?? "N/A"}`, sub: "Avg units/day" },
              ].map((kpi) => (
                <div key={kpi.label} className="pg-kpi">
                  <p className="pg-kpi-label">{kpi.label}</p>
                  <p className="pg-kpi-value" style={{ fontSize: "0.9375rem" }}>{kpi.value}</p>
                  <p className="pg-kpi-sub">{kpi.sub}</p>
                </div>
              ))}
            </div>
          )}

          {/* Alerts */}
          {alerts.length > 0 && (
            <div style={{ marginTop: "1rem" }}>
              <p className="pg-section-heading" style={{ marginBottom: "0.625rem" }}>Alerts</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {alerts.map((alert: any, idx: number) => (
                  <div
                    key={idx}
                    className={`pg-banner ${
                      alert.type === "critical" ? "pg-banner-error" :
                      alert.type === "warning" ? "pg-banner-error" :
                      "pg-banner-success"
                    }`}
                  >
                    {alert.message || JSON.stringify(alert)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Modal */}
      {showModal && (
        <ProductModal
          initial={edit}
          defaultReorderPoint={settings.defaultReorderPoint}
          onClose={() => { setShowModal(false); setEdit(null); }}
          onSave={onSave}
        />
      )}
    </div>
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
  const [reorderPoint, setReorderPoint] = useState(String(initial?.reorderPoint ?? defaultReorderPoint ?? 10));
  const [err, setErr] = useState<string | null>(null);

  const submit = () => {
    setErr(null);
    if (!name.trim()) return setErr("Product name is required.");
    if (!sku.trim()) return setErr("SKU is required.");
    onSave({
      name: name.trim(),
      sku: sku.trim(),
      category: category.trim(),
      unitPrice: clampNum(Number(unitPrice)),
      stock: Math.max(0, clampNum(Number(stock))),
      reorderPoint: Math.max(0, clampNum(Number(reorderPoint))),
    });
  };

  return (
    <div className="pg-overlay">
      <div className="pg-modal">
        <div className="pg-modal-header">
          <div>
            <p className="pg-modal-title">{initial ? "Edit Product" : "Add Product"}</p>
            <p className="pg-modal-sub">Inventory data is stored locally.</p>
          </div>
          <button className="pg-modal-close" onClick={onClose}>✕</button>
        </div>

        {err && (
          <div className="pg-banner pg-banner-error" style={{ marginBottom: "0.875rem" }}>{err}</div>
        )}

        <div className="pg-field-grid">
          <Field label="Product Name" value={name} onChange={setName} placeholder="e.g., Milk 500ml" />
          <Field label="SKU" value={sku} onChange={setSku} placeholder="e.g., SKU-1001" />
          <Field label="Category" value={category} onChange={setCategory} placeholder="e.g., Dairy" />
          <Field label="Unit Price (₹)" value={unitPrice} onChange={setUnitPrice} type="number" />
          <Field label="Stock" value={stock} onChange={setStock} type="number" />
          <Field label="Reorder Point" value={reorderPoint} onChange={setReorderPoint} type="number" />
        </div>

        <div style={{ marginTop: "1.125rem", display: "flex", gap: "0.625rem", justifyContent: "flex-end" }}>
          <button type="button" className="pg-btn" onClick={onClose}>Cancel</button>
          <button type="button" className="pg-btn pg-btn-primary" onClick={submit}>Save</button>
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
    <div className="pg-field">
      <label className="pg-label">{label}</label>
      <input
        className="pg-input pg-input-full"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        type={type}
      />
    </div>
  );
}
