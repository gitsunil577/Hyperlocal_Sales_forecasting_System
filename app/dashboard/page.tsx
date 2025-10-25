'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import './dashboard.css';
import SalesDashboard from "./salesdashboard";

export default function DashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('month');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const router = useRouter();

  // Logout handler
  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    // Clear any stored authentication tokens
    localStorage.removeItem('authToken');
    sessionStorage.clear();
    
    // You can also call your logout API here
    // await fetch('/api/auth/logout', { method: 'POST' });
    
    // Redirect to home page
    router.push('/');
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <div className="dashboard-wrapper">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
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
          <Link href="/dashboard" className="nav-item active">
            <span className="nav-icon">📈</span>
            {sidebarOpen && <span>Dashboard</span>}
          </Link>
          <Link href="/predictions" className="nav-item">
            <span className="nav-icon">🔮</span>
            {sidebarOpen && <span>Predictions</span>}
          </Link>
          <Link href="/inventory" className="nav-item">
            <span className="nav-icon">📦</span>
            {sidebarOpen && <span>Inventory</span>}
          </Link>
          <Link href="/analytics" className="nav-item">
            <span className="nav-icon">📊</span>
            {sidebarOpen && <span>Analytics</span>}
          </Link>
          <Link href="/reports" className="nav-item">
            <span className="nav-icon">📄</span>
            {sidebarOpen && <span>Reports</span>}
          </Link>
          <Link href="/settings" className="nav-item">
            <span className="nav-icon">⚙️</span>
            {sidebarOpen && <span>Settings</span>}
          </Link>
        </nav>

        <div className="sidebar-footer">
          <Link href="/profile" className="nav-item">
            <span className="nav-icon">👤</span>
            {sidebarOpen && <span>Profile</span>}
          </Link>
          {/* Logout button with onClick handler */}
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
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
          <div className="top-bar-right">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input type="text" placeholder="Search..." />
            </div>
            <button className="notification-btn">
              <span>🔔</span>
              <span className="notification-badge">3</span>
            </button>
            <div className="user-profile">
              <div className="user-avatar">JD</div>
              <div className="user-info">
                <div className="user-name">John Doe</div>
                <div className="user-role">Store Manager</div>
              </div>
            </div>
          </div>
        </header>

        {/* Sales Dashboard Component */}
        <div className="sales-dashboard-container">
          <SalesDashboard />
        </div>
      </main>
    </div>
  );
}