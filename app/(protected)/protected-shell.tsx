"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { getClientRole, getCookie } from "@/lib/auth-store";
import { logoutClient } from "@/lib/auth-client";
import React, { useEffect, useMemo, useState } from "react";


type NavItem = { href: string; label: string; icon: string };

export default function ProtectedShell({
  children,
}: {
  children: React.ReactNode;
}) {
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


  const vendorNav: NavItem[] = [
    { href: "/dashboard", label: "Dashboard", icon: "📈" },
    { href: "/dashboard/sales", label: "Add Daily Sales", icon: "🧾" },
    { href: "/dashboard/history", label: "Sales History", icon: "🗓️" },
    { href: "/dashboard/forecast", label: "Forecast", icon: "📅" },
    { href: "/predictions", label: "Predictions", icon: "🔮" },
    { href: "/inventory", label: "Inventory", icon: "📦" },
    { href: "/analytics", label: "Analytics", icon: "📊" },
    { href: "/reports", label: "Reports", icon: "📄" },
  ];

  const adminNav: NavItem[] = [
    { href: "/admin", label: "Admin Dashboard", icon: "🛠️" },
    { href: "/admin/vendors", label: "Vendors", icon: "👥" },
    { href: "/admin/analytics", label: "Global Analytics", icon: "🌍" },
    { href: "/admin/settings", label: "Settings", icon: "⚙️" },
  ];

  const navItems = useMemo(() => {
    return role === "admin" ? adminNav : vendorNav;
  }, [role]);

  const handleLogout = () => {
    logoutClient();
    router.replace("/login");
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <div className="dashboard-wrapper">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span className="logo-icon">
              <span className="logo-icon-large">
                <Image
                  src="/forecast.png"
                  alt="SalesForecast Logo"
                  width={40}
                  height={40}
                />
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
                {mounted ? userEmail.split("@")[0] : "user"}
              </span>
            )}
          </div>

          <button onClick={handleLogout} className="nav-item logout-btn">
            <span className="nav-icon">🚪</span>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Top Bar */}
        <header className="top-bar">
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen((s) => !s)}
          >
            ☰
          </button>

          <div className="top-bar-right">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input type="text" placeholder="Search..." />
            </div>

            <button className="notification-btn" type="button">
              <span>🔔</span>
              <span className="notification-badge">3</span>
            </button>

            <div className="user-profile">
              <div className="user-avatar">
                {(role === "admin" ? "AD" : "VD")}
              </div>
              <div className="user-info">
                <div className="user-name">
                  {role === "admin" ? "Admin" : "Vendor"}
                </div>
                <div className="user-role">
                  {role === "admin" ? "System Manager" : "Store Manager"}
                </div>
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
