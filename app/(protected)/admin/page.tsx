"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";

export default function AdminPage() {
  const router = useRouter();
  const [products, setProducts] = useState<number | null>(null);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [trainedModels, setTrainedModels] = useState<number | null>(null);
  const [totalRecords, setTotalRecords] = useState<string | null>(null);

  useEffect(() => {
    apiClient.healthCheck()
      .then(() => setBackendOnline(true))
      .catch(() => setBackendOnline(false));

    apiClient.getProducts()
      .then((r) => setProducts(r.products?.length ?? 0))
      .catch(() => setProducts(null));

    apiClient.getModelsStatus()
      .then((r) => setTrainedModels(r.total_models ?? 0))
      .catch(() => setTrainedModels(0));

    apiClient.getDataSummary()
      .then((r) => setTotalRecords(r.data?.total_records?.toLocaleString() ?? "N/A"))
      .catch(() => setTotalRecords("N/A"));
  }, []);

  const quickActions = [
    { label: "Manage Vendors", href: "/admin/vendors", desc: "Add, edit, and manage vendor accounts" },
    { label: "Global Analytics", href: "/admin/analytics", desc: "View sales trends and performance data" },
    { label: "Upload & Analyze", href: "/dashboard/upload-analyze", desc: "Upload datasets and run ML predictions" },
    { label: "Settings", href: "/admin/settings", desc: "Configure system defaults and preferences" },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a" }}>Admin Dashboard</h1>
      <p style={{ marginTop: 4, fontSize: 14, color: "#94a3b8", fontWeight: 500 }}>
        System overview and quick actions
      </p>

      {/* KPI Cards */}
      <div style={{ marginTop: 24, display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        <KPI label="Products" value={products !== null ? `${products}` : "..."} sub="Tracked families" />
        <KPI
          label="Backend Status"
          value={backendOnline === null ? "..." : backendOnline ? "Online" : "Offline"}
          sub="Flask server"
          valueColor={backendOnline ? "#059669" : backendOnline === false ? "#dc2626" : "#64748b"}
        />
        <KPI label="Trained Models" value={trainedModels !== null ? `${trainedModels}` : "..."} sub="In memory cache" />
        <KPI label="Dataset Records" value={totalRecords ?? "..."} sub="Total training rows" />
      </div>

      {/* Quick Actions */}
      <div style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", marginBottom: 16 }}>Quick Actions</h2>
        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
          {quickActions.map((a) => (
            <button
              key={a.href}
              type="button"
              onClick={() => router.push(a.href)}
              style={{
                background: "white",
                borderRadius: 12,
                padding: "20px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                border: "1px solid #f1f5f9",
                cursor: "pointer",
                textAlign: "left",
                transition: "box-shadow 0.15s, border-color 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.08)";
                e.currentTarget.style.borderColor = "#e2e8f0";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)";
                e.currentTarget.style.borderColor = "#f1f5f9";
              }}
            >
              <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>{a.label}</div>
              <div style={{ marginTop: 6, fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>{a.desc}</div>
              <div style={{ marginTop: 12, fontSize: 13, fontWeight: 700, color: "#4f46e5" }}>Go &rarr;</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function KPI({ label, value, sub, valueColor }: { label: string; value: string; sub: string; valueColor?: string }) {
  return (
    <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" as const }}>{label}</div>
      <div style={{ marginTop: 10, fontSize: 22, fontWeight: 800, color: valueColor || "#0f172a" }}>{value}</div>
      <div style={{ marginTop: 6, fontSize: 12, fontWeight: 500, color: "#94a3b8" }}>{sub}</div>
    </div>
  );
}
