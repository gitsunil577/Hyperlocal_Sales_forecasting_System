"use client";

import React, { useEffect, useState, useMemo } from "react";

interface Vendor {
  id: string;
  name: string;
  email: string;
  status: "active" | "inactive";
  addedAt: string;
}

const LS_KEY = "sf_vendors_v1";

const SEED_VENDORS: Vendor[] = [
  { id: "1", name: "Fresh Mart", email: "orders@freshmart.com", status: "active", addedAt: "2025-12-01" },
  { id: "2", name: "Green Basket", email: "supply@greenbasket.com", status: "active", addedAt: "2026-01-15" },
];

function loadVendors(): Vendor[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  localStorage.setItem(LS_KEY, JSON.stringify(SEED_VENDORS));
  return SEED_VENDORS;
}

function saveVendors(v: Vendor[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(v));
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", status: "active" as "active" | "inactive" });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setVendors(loadVendors());
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return vendors;
    const q = search.toLowerCase();
    return vendors.filter((v) => v.name.toLowerCase().includes(q) || v.email.toLowerCase().includes(q));
  }, [vendors, search]);

  const update = (next: Vendor[]) => {
    setVendors(next);
    saveVendors(next);
  };

  const openAdd = () => {
    setEditId(null);
    setForm({ name: "", email: "", status: "active" });
    setModalOpen(true);
  };

  const openEdit = (v: Vendor) => {
    setEditId(v.id);
    setForm({ name: v.name, email: v.email, status: v.status });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.email.trim()) return;
    if (editId) {
      update(vendors.map((v) => (v.id === editId ? { ...v, ...form } : v)));
    } else {
      update([...vendors, { ...form, id: Date.now().toString(), addedAt: new Date().toISOString().slice(0, 10) }]);
    }
    setModalOpen(false);
  };

  const toggleStatus = (id: string) => {
    update(vendors.map((v) => (v.id === id ? { ...v, status: v.status === "active" ? "inactive" : "active" } : v)));
  };

  const deleteVendor = (id: string) => {
    update(vendors.filter((v) => v.id !== id));
  };

  if (!mounted) return null;

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a" }}>Vendors</h1>
      <p style={{ marginTop: 4, fontSize: 14, color: "#94a3b8", fontWeight: 500 }}>Manage vendor accounts</p>

      {/* Top bar */}
      <div style={{ marginTop: 20, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1, minWidth: 200, padding: "9px 14px", borderRadius: 8,
            border: "1px solid #e2e8f0", fontSize: 14, fontWeight: 500, outline: "none",
          }}
        />
        <button
          type="button"
          onClick={openAdd}
          style={{
            padding: "9px 20px", borderRadius: 8, border: "none",
            background: "#4f46e5", color: "white", fontWeight: 700, fontSize: 14, cursor: "pointer",
          }}
        >
          + Add Vendor
        </button>
      </div>

      {/* Table */}
      <div style={{ marginTop: 16, background: "white", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.04)", overflowX: "auto" }}>
        {filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "#94a3b8", fontWeight: 600, fontSize: 14 }}>
            {vendors.length === 0 ? "No vendors yet. Click \"+ Add Vendor\" to get started." : "No vendors match your search."}
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #f1f5f9" }}>
                {["Name", "Email", "Status", "Added", "Actions"].map((h) => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700, color: "#64748b", fontSize: 12, textTransform: "uppercase" as const }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((v) => (
                <tr key={v.id} style={{ borderBottom: "1px solid #f8fafc" }}>
                  <td style={{ padding: "12px 16px", fontWeight: 600, color: "#0f172a" }}>{v.name}</td>
                  <td style={{ padding: "12px 16px", color: "#64748b" }}>{v.email}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{
                      padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 700,
                      background: v.status === "active" ? "#ecfdf5" : "#f1f5f9",
                      color: v.status === "active" ? "#059669" : "#64748b",
                    }}>
                      {v.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", color: "#94a3b8", fontSize: 13 }}>{v.addedAt}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <SmallBtn bg="#f8fafc" color="#334155" onClick={() => openEdit(v)}>Edit</SmallBtn>
                      <SmallBtn bg={v.status === "active" ? "#fef3c7" : "#ecfdf5"} color={v.status === "active" ? "#92400e" : "#059669"} onClick={() => toggleStatus(v.id)}>
                        {v.status === "active" ? "Disable" : "Enable"}
                      </SmallBtn>
                      <SmallBtn bg="#fef2f2" color="#dc2626" onClick={() => deleteVendor(v.id)}>Delete</SmallBtn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
          onClick={() => setModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: "white", borderRadius: 14, padding: 28, width: "90%", maxWidth: 420, boxShadow: "0 16px 48px rgba(0,0,0,0.15)" }}
          >
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", marginBottom: 20 }}>
              {editId ? "Edit Vendor" : "Add Vendor"}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <FormField label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Vendor name" />
              <FormField label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} placeholder="vendor@email.com" type="email" />
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 6, textTransform: "uppercase" as const }}>Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as "active" | "inactive" })}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14, fontWeight: 500 }}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div style={{ marginTop: 24, display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button type="button" onClick={() => setModalOpen(false)} style={{ padding: "9px 20px", borderRadius: 8, border: "1px solid #e2e8f0", background: "white", fontWeight: 700, fontSize: 14, cursor: "pointer", color: "#64748b" }}>
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!form.name.trim() || !form.email.trim()}
                style={{
                  padding: "9px 20px", borderRadius: 8, border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer",
                  background: !form.name.trim() || !form.email.trim() ? "#94a3b8" : "#4f46e5", color: "white",
                }}
              >
                {editId ? "Save Changes" : "Add Vendor"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FormField({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder: string; type?: string }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 6, textTransform: "uppercase" as const }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14, fontWeight: 500, outline: "none" }}
      />
    </div>
  );
}

function SmallBtn({ bg, color, onClick, children }: { bg: string; color: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} style={{ padding: "5px 12px", borderRadius: 6, border: "none", background: bg, color, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
      {children}
    </button>
  );
}
