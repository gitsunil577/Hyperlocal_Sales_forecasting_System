'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import './dashboard.css';
import SalesDashboard from "./salesdashboard";
import { Dispatch, SetStateAction } from 'react';

interface SalesDashboardProps {
  selectedPeriod: 'week' | 'month' | 'quarter';
  setSelectedPeriod: Dispatch<SetStateAction<'week' | 'month' | 'quarter'>>;
}

export default function DashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('month');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="dashboard-wrapper">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span className="logo-icon">📊</span>
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
          <Link href="/logout" className="nav-item">
            <span className="nav-icon">🚪</span>
            {sidebarOpen && <span>Logout</span>}
          </Link>
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
            <h1 className='text-4xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-2 tracking-tight'>
                Smart Inventory Dashboard
            </h1>
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
    <SalesDashboard/>
        </div>
        
      </main>
    </div>
  );
}