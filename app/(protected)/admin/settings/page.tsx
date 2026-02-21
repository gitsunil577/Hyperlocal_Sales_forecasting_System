"use client";

import React, { useEffect, useMemo, useState } from "react";

type AdminSettings = {
  orgName: string;

  // Forecast settings
  defaultForecastHorizon: 7 | 14 | 30;
  leadTimeDays: number;      // used in reorder suggestion later
  safetyDays: number;        // used in reorder suggestion later

  // Inventory settings
  defaultReorderPoint: number;
  lowStockAlertsEnabled: boolean;

  // UI / ML display
  showConfidence: boolean;
  showSuggestions: boolean;

  // Vendor onboarding
  vendorApprovalMode: "auto" | "manual";
};

const SETTINGS_KEY = "sf_admin_settings_v1";

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

function clampInt(n: number, min: number, max: number) {
  const x = Math.round(Number.isFinite(n) ? n : min);
  return Math.max(min, Math.min(max, x));
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<AdminSettings>(DEFAULT_SETTINGS);
  const [savedToast, setSavedToast] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      if (parsed && typeof parsed === "object") {
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }
    } catch {
      setSettings(DEFAULT_SETTINGS);
    }
  }, []);

  const dirty = useMemo(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      const parsed = raw ? JSON.parse(raw) : DEFAULT_SETTINGS;
      return JSON.stringify({ ...DEFAULT_SETTINGS, ...parsed }) !== JSON.stringify(settings);
    } catch {
      return true;
    }
  }, [settings]);

  const save = () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 1200);
  };

  const reset = () => {
    if (!confirm("Reset settings to defaults?")) return;
    setSettings(DEFAULT_SETTINGS);
  };

  return (
    <div style={{ padding: 24, position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a" }}>Admin Settings</h1>
          <p style={{ marginTop: 6, color: "#94a3b8", fontWeight: 500, fontSize: 14 }}>
            Configure forecasting + inventory defaults (frontend now, DB later).
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <button
            onClick={reset}
            style={{
              borderRadius: 12,
              border: "1px solid #e2e8f0",
              background: "white",
              padding: "10px 12px",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Reset
          </button>

          <button
            onClick={save}
            disabled={!dirty}
            style={{
              borderRadius: 12,
              border: "1px solid #c7d2fe",
              background: dirty ? "#4f46e5" : "#a5b4fc",
              color: "white",
              padding: "10px 12px",
              fontWeight: 800,
              cursor: dirty ? "pointer" : "not-allowed",
            }}
          >
            Save Settings
          </button>
        </div>
      </div>

      {/* Layout */}
      <div style={{ marginTop: 16, display: "grid", gap: 16, gridTemplateColumns: "repeat(12, 1fr)" }}>
        <Card title="Organization" subtitle="Branding & defaults" colSpan={4}>
          <Field
            label="Organization Name"
            value={settings.orgName}
            onChange={(v) => setSettings((s) => ({ ...s, orgName: v }))}
            placeholder="e.g., SalesForecast"
          />
        </Card>

        <Card title="Forecast Defaults" subtitle="Used across vendor forecast UI + reorder logic" colSpan={8}>
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
            <Select
              label="Default Horizon"
              value={String(settings.defaultForecastHorizon)}
              onChange={(v) =>
                setSettings((s) => ({ ...s, defaultForecastHorizon: Number(v) as 7 | 14 | 30 }))
              }
              options={[
                { label: "7 days", value: "7" },
                { label: "14 days", value: "14" },
                { label: "30 days", value: "30" },
              ]}
            />
            <NumberField
              label="Lead Time (days)"
              value={settings.leadTimeDays}
              onChange={(n) => setSettings((s) => ({ ...s, leadTimeDays: clampInt(n, 1, 30) }))}
              hint="Time to receive stock after ordering"
            />
            <NumberField
              label="Safety Days"
              value={settings.safetyDays}
              onChange={(n) => setSettings((s) => ({ ...s, safetyDays: clampInt(n, 0, 30) }))}
              hint="Extra buffer days to avoid stockout"
            />
          </div>

          <Divider />

          <ToggleRow
            label="Show confidence in forecast UI"
            desc="Display confidence % and confidence band"
            checked={settings.showConfidence}
            onToggle={(v) => setSettings((s) => ({ ...s, showConfidence: v }))}
          />
          <ToggleRow
            label="Show suggestions panel"
            desc="Reorder tips, peak-day readiness, risk notes"
            checked={settings.showSuggestions}
            onToggle={(v) => setSettings((s) => ({ ...s, showSuggestions: v }))}
          />
        </Card>

        <Card title="Inventory Defaults" subtitle="Low stock logic & alerts" colSpan={6}>
          <NumberField
            label="Default Reorder Point"
            value={settings.defaultReorderPoint}
            onChange={(n) => setSettings((s) => ({ ...s, defaultReorderPoint: clampInt(n, 0, 99999) }))}
            hint="Applied when vendor creates a new product (later)"
          />

          <Divider />

          <ToggleRow
            label="Enable low-stock alerts"
            desc="Highlights products below reorder point"
            checked={settings.lowStockAlertsEnabled}
            onToggle={(v) => setSettings((s) => ({ ...s, lowStockAlertsEnabled: v }))}
          />
        </Card>

        <Card title="Vendor Onboarding" subtitle="Approval workflow (frontend placeholder)" colSpan={6}>
          <Select
            label="Vendor approval mode"
            value={settings.vendorApprovalMode}
            onChange={(v) => setSettings((s) => ({ ...s, vendorApprovalMode: v as "auto" | "manual" }))}
            options={[
              { label: "Auto approve vendors", value: "auto" },
              { label: "Manual approval required", value: "manual" },
            ]}
          />

          <div style={{ marginTop: 12, color: "#64748b", fontWeight: 700, fontSize: 12, lineHeight: 1.5 }}>
            Later (backend): this will control whether new vendor registrations become active immediately or wait for admin approval.
          </div>
        </Card>
      </div>

      {/* Toast */}
      {savedToast && (
        <div
          style={{
            position: "fixed",
            bottom: 22,
            right: 22,
            background: "#0f172a",
            color: "white",
            padding: "12px 14px",
            borderRadius: 12,
            fontWeight: 800,
            boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
            zIndex: 9999,
          }}
        >
          ✅ Settings saved
        </div>
      )}
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
      <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>{title}</div>
      <div style={{ marginTop: 4, fontSize: 12, fontWeight: 700, color: "#64748b" }}>{subtitle}</div>
      <div style={{ marginTop: 12 }}>{children}</div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 800, color: "#334155" }}>{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
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

function NumberField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  hint?: string;
}) {
  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 800, color: "#334155" }}>{label}</div>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          marginTop: 8,
          width: "100%",
          borderRadius: 12,
          border: "1px solid #e2e8f0",
          padding: "10px 12px",
        }}
      />
      {hint && (
        <div style={{ marginTop: 6, color: "#64748b", fontWeight: 700, fontSize: 12 }}>
          {hint}
        </div>
      )}
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
}) {
  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 800, color: "#334155" }}>{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          marginTop: 8,
          width: "100%",
          borderRadius: 12,
          border: "1px solid #e2e8f0",
          padding: "10px 12px",
          background: "white",
          fontWeight: 800,
        }}
      >
        {options.map((o) => (
          <option value={o.value} key={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function ToggleRow({
  label,
  desc,
  checked,
  onToggle,
}: {
  label: string;
  desc: string;
  checked: boolean;
  onToggle: (v: boolean) => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, padding: "10px 0" }}>
      <div>
        <div style={{ fontWeight: 800, color: "#0f172a" }}>{label}</div>
        <div style={{ marginTop: 4, fontWeight: 700, color: "#64748b", fontSize: 12 }}>{desc}</div>
      </div>

      <button
        type="button"
        onClick={() => onToggle(!checked)}
        style={{
          width: 56,
          height: 32,
          borderRadius: 999,
          border: "1px solid #e2e8f0",
          background: checked ? "#4f46e5" : "#f1f5f9",
          position: "relative",
          cursor: "pointer",
        }}
        aria-pressed={checked}
      >
        <span
          style={{
            position: "absolute",
            top: 3,
            left: checked ? 28 : 3,
            width: 26,
            height: 26,
            borderRadius: 999,
            background: "white",
            boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
            transition: "left 160ms ease",
          }}
        />
      </button>
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: "#e2e8f0", margin: "14px 0" }} />;
}
