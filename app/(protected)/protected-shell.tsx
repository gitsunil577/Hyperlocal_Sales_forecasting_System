"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { apiClient } from "@/lib/api-client";
import {
  LayoutDashboard, ClipboardList, History, TrendingUp,
  Upload, Package, BarChart3, Settings, Users, Globe,
  Settings2, User, LogOut
} from "lucide-react";

type NavItem = { href: string; label: string; icon: React.ReactNode };

export default function ProtectedShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const { data: session, status } = useSession();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const mounted = status !== "loading";
  const role = (session?.user?.role ?? "vendor") as "vendor" | "admin";
  const userEmail = session?.user?.email ?? "user@company.com";

  useEffect(() => {
    apiClient.healthCheck()
      .then(() => setBackendOnline(true))
      .catch(() => setBackendOnline(false));
  }, []);

  // Close notification dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const vendorNav: NavItem[] = [
    { href: "/dashboard",                label: "Dashboard",         icon: <LayoutDashboard size={18}/> },
    { href: "/dashboard/sales",          label: "Daily Sales Entry", icon: <ClipboardList size={18}/> },
    { href: "/dashboard/history",        label: "Sales History",     icon: <History size={18}/> },
    { href: "/dashboard/forecast",       label: "Forecast",          icon: <TrendingUp size={18}/> },
    { href: "/dashboard/upload-analyze", label: "Upload & Analyze",  icon: <Upload size={18}/> },
    { href: "/inventory",                label: "Inventory",         icon: <Package size={18}/> },
    { href: "/dashboard/analytics",      label: "Analytics",         icon: <BarChart3 size={18}/> },
  ];

  const adminNav: NavItem[] = [
    { href: "/admin",                    label: "Admin Dashboard",   icon: <Settings2 size={18}/> },
    { href: "/admin/vendors",            label: "Vendors",           icon: <Users size={18}/> },
    { href: "/admin/analytics",          label: "Global Analytics",  icon: <Globe size={18}/> },
    { href: "/dashboard/upload-analyze", label: "Upload & Analyze",  icon: <Upload size={18}/> },
    { href: "/admin/settings",           label: "Settings",          icon: <Settings size={18}/> },
  ];

  const navItems = useMemo(() => (role === "admin" ? adminNav : vendorNav), [role]);

  // Filter nav items by search query
  const filteredNav = useMemo(() => {
    if (!searchQuery.trim()) return navItems;
    const q = searchQuery.toLowerCase();
    return navItems.filter((item) => item.label.toLowerCase().includes(q));
  }, [navItems, searchQuery]);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.replace("/login");
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname.startsWith(href + "/");
  };

  const displayName = useMemo(() => {
    const base = userEmail?.includes("@") ? userEmail.split("@")[0] : "user";
    return base || "user";
  }, [userEmail]);

  const hasAlert = mounted && backendOnline === false;

  return (
    <div className="dashboard-wrapper">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span className="logo-icon">
              <span className="logo-icon-large">
                <Image src="/forecast.png" alt="SalesForecast Logo" width={40} height={40} />
              </span>
            </span>
            {sidebarOpen && <span className="logo-text">SalesForecast</span>}
          </div>
        </div>

        <nav className="sidebar-nav">
          {filteredNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${isActive(item.href) ? "active" : ""}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
          {filteredNav.length === 0 && sidebarOpen && (
            <div style={{ padding: "12px 24px", color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 500 }}>
              No pages match "{searchQuery}"
            </div>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="nav-item" style={{ cursor: "default", opacity: 0.95 }}>
            <span className="nav-icon"><User size={18}/></span>
            {sidebarOpen && (
              <span>
                {mounted ? (role === "admin" ? "Admin" : "Vendor") : "User"} •{" "}
                {mounted ? displayName : "user"}
              </span>
            )}
          </div>

          <button onClick={handleLogout} className="nav-item logout-btn" type="button">
            <span className="nav-icon"><LogOut size={18}/></span>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Top Bar */}
        <header className="top-bar">
          <button className="sidebar-toggle" onClick={() => setSidebarOpen((s) => !s)} type="button">
            ☰
          </button>

          <div className="top-bar-right">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search pages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: "#94a3b8", fontSize: 16, padding: 0, lineHeight: 1,
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Notification bell with dropdown */}
            <div ref={notifRef} style={{ position: "relative" }}>
              <button
                className="notification-btn"
                type="button"
                aria-label="Notifications"
                onClick={() => setNotifOpen((o) => !o)}
              >
                <span>🔔</span>
                {hasAlert && <span className="notification-badge">!</span>}
              </button>

              {notifOpen && (
                <div
                  style={{
                    position: "absolute", top: "calc(100% + 8px)", right: 0,
                    background: "white", borderRadius: 12, padding: 0,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.12)", minWidth: 280,
                    border: "1px solid #e2e8f0", zIndex: 200, overflow: "hidden",
                  }}
                >
                  <div style={{ padding: "14px 16px", borderBottom: "1px solid #f1f5f9", fontWeight: 700, fontSize: 13, color: "#0f172a" }}>
                    System Status
                  </div>
                  <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{
                      width: 8, height: 8, borderRadius: "50%",
                      background: backendOnline ? "#22c55e" : "#ef4444",
                    }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>
                      Backend Server
                    </span>
                    <span style={{
                      marginLeft: "auto", fontSize: 12, fontWeight: 700,
                      color: backendOnline ? "#16a34a" : "#dc2626",
                    }}>
                      {backendOnline === null ? "Checking..." : backendOnline ? "Online" : "Offline"}
                    </span>
                  </div>
                  <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, borderTop: "1px solid #f8fafc" }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e" }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>
                      Frontend
                    </span>
                    <span style={{ marginLeft: "auto", fontSize: 12, fontWeight: 700, color: "#16a34a" }}>
                      Online
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="user-profile">
              <div className="user-avatar">{role === "admin" ? "AD" : "VD"}</div>
              <div className="user-info">
                <div className="user-name">{role === "admin" ? "Admin" : "Vendor"}</div>
                <div className="user-role">{role === "admin" ? "System Manager" : "Store Manager"}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Backend status banner */}
        {mounted && backendOnline === false && (
          <div
            style={{
              margin: "12px 16px 0",
              padding: "10px 16px",
              background: "#fef3c7",
              border: "1px solid #fde68a",
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontWeight: 600,
              fontSize: 13,
              color: "#92400e",
            }}
          >
            Backend server is offline. Start the Flask server on port 5000 for live data.
          </div>
        )}

        {/* Page content slot */}
        <div className="sales-dashboard-container">{children}</div>
      </main>
    </div>
  );
}
