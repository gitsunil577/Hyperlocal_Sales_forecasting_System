"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { getClientRole, getCookie } from "@/lib/auth-store";
import { logoutClient } from "@/lib/auth-client";

type NavItem = { href: string; label: string; icon: string };

export default function ProtectedShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [mounted, setMounted] = useState(false);
  const [role, setRole] = useState<"vendor" | "admin">("vendor");
  const [userEmail, setUserEmail] = useState("user@company.com");

  useEffect(() => {
    setMounted(true);

    const r = getClientRole();
    const e = getCookie("sf_user");

    if (r) setRole(r);
    if (e) setUserEmail(e);
  }, []);

  // ✅ Vendor navigation (match your actual pages)
  const vendorNav: NavItem[] = [
    { href: "/dashboard", label: "Dashboard", icon: "📈" },
    { href: "/dashboard/sales", label: "Daily Sales Entry", icon: "🧾" },
    { href: "/dashboard/history", label: "Sales History", icon: "🗓️" },
    { href: "/dashboard/forecast", label: "Forecast", icon: "📅" },
    { href: "/inventory", label: "Inventory", icon: "📦" },
    { href: "/dashboard/analytics", label: "Analytics", icon: "📊" },
  ];

  // ✅ Admin navigation (includes Settings)
  const adminNav: NavItem[] = [
    { href: "/admin", label: "Admin Dashboard", icon: "🛠️" },
    { href: "/admin/vendors", label: "Vendors", icon: "👥" },
    { href: "/admin/analytics", label: "Global Analytics", icon: "🌍" },
    { href: "/admin/settings", label: "Settings", icon: "⚙️" },
  ];

  const navItems = useMemo(() => (role === "admin" ? adminNav : vendorNav), [role]);

  const handleLogout = () => {
    logoutClient();
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
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${isActive(item.href) ? "active" : ""}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="nav-item" style={{ cursor: "default", opacity: 0.95 }}>
            <span className="nav-icon">👤</span>
            {sidebarOpen && (
              <span>
                {mounted ? (role === "admin" ? "Admin" : "Vendor") : "User"} •{" "}
                {mounted ? displayName : "user"}
              </span>
            )}
          </div>

          <button onClick={handleLogout} className="nav-item logout-btn" type="button">
            <span className="nav-icon">🚪</span>
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
              <input type="text" placeholder="Search..." />
            </div>

            <button className="notification-btn" type="button" aria-label="Notifications">
              <span>🔔</span>
              <span className="notification-badge">3</span>
            </button>

            <div className="user-profile">
              <div className="user-avatar">{role === "admin" ? "AD" : "VD"}</div>
              <div className="user-info">
                <div className="user-name">{role === "admin" ? "Admin" : "Vendor"}</div>
                <div className="user-role">{role === "admin" ? "System Manager" : "Store Manager"}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content slot */}
        <div className="sales-dashboard-container">{children}</div>
      </main>
    </div>
  );
}
