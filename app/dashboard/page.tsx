'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import './dashboard.css';

interface SalesData {
  month: string;
  actual: number;
  predicted: number;
}

interface Product {
  id: number;
  name: string;
  currentStock: number;
  predictedDemand: number;
  reorderPoint: number;
  status: 'optimal' | 'low' | 'critical';
}

interface Alert {
  id: number;
  type: 'warning' | 'info' | 'success';
  message: string;
  time: string;
}

export default function DashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('month');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Static data - Will be replaced with API calls
  const salesData: SalesData[] = [
    { month: 'Jan', actual: 45000, predicted: 43000 },
    { month: 'Feb', actual: 52000, predicted: 51000 },
    { month: 'Mar', actual: 48000, predicted: 49000 },
    { month: 'Apr', actual: 61000, predicted: 58000 },
    { month: 'May', actual: 55000, predicted: 57000 },
    { month: 'Jun', actual: 67000, predicted: 65000 },
  ];

  const topProducts: Product[] = [
    { id: 1, name: 'Premium Widget A', currentStock: 145, predictedDemand: 230, reorderPoint: 150, status: 'low' },
    { id: 2, name: 'Deluxe Product B', currentStock: 420, predictedDemand: 380, reorderPoint: 200, status: 'optimal' },
    { id: 3, name: 'Standard Item C', currentStock: 89, predictedDemand: 310, reorderPoint: 100, status: 'critical' },
    { id: 4, name: 'Basic Product D', currentStock: 567, predictedDemand: 450, reorderPoint: 250, status: 'optimal' },
    { id: 5, name: 'Elite Widget E', currentStock: 178, predictedDemand: 290, reorderPoint: 150, status: 'low' },
  ];

  const alerts: Alert[] = [
    { id: 1, type: 'warning', message: '8 products need restocking within 7 days', time: '2 hours ago' },
    { id: 2, type: 'info', message: 'Sales prediction updated for next quarter', time: '5 hours ago' },
    { id: 3, type: 'success', message: 'Inventory optimization completed', time: '1 day ago' },
  ];

  // This function will be replaced with actual API call
  const fetchDashboardData = async () => {
    // Example API call structure:
    // const response = await fetch('/api/dashboard', {
    //   headers: { 'Authorization': `Bearer ${token}` }
    // });
    // const data = await response.json();
    // return data;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'status-optimal';
      case 'low': return 'status-low';
      case 'critical': return 'status-critical';
      default: return 'status-optimal';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      case 'success': return '✅';
      default: return 'ℹ️';
    }
  };

  const maxSales = Math.max(...salesData.map(d => Math.max(d.actual, d.predicted)));

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

        {/* Dashboard Content */}
        <div className="dashboard-content">
          {/* Page Header */}
          <div className="page-header">
            <div>
              <h1>Dashboard Overview</h1>
              <p>Welcome back! Here's what's happening with your business today.</p>
            </div>
            <div className="period-selector">
              <button 
                className={selectedPeriod === 'week' ? 'active' : ''}
                onClick={() => setSelectedPeriod('week')}
              >
                Week
              </button>
              <button 
                className={selectedPeriod === 'month' ? 'active' : ''}
                onClick={() => setSelectedPeriod('month')}
              >
                Month
              </button>
              <button 
                className={selectedPeriod === 'quarter' ? 'active' : ''}
                onClick={() => setSelectedPeriod('quarter')}
              >
                Quarter
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-label">Total Sales</span>
                <span className="stat-icon">💰</span>
              </div>
              <div className="stat-value">$67,230</div>
              <div className="stat-change positive">
                <span>↑ 12.5%</span>
                <span className="stat-period">vs last month</span>
              </div>
              <div className="stat-chart">
                <div className="mini-bar" style={{height: '40%'}}></div>
                <div className="mini-bar" style={{height: '60%'}}></div>
                <div className="mini-bar" style={{height: '45%'}}></div>
                <div className="mini-bar" style={{height: '80%'}}></div>
                <div className="mini-bar" style={{height: '70%'}}></div>
                <div className="mini-bar" style={{height: '90%'}}></div>
                <div className="mini-bar" style={{height: '85%'}}></div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-label">Predicted Sales</span>
                <span className="stat-icon">🔮</span>
              </div>
              <div className="stat-value">$72,450</div>
              <div className="stat-change positive">
                <span>↑ 7.8%</span>
                <span className="stat-period">next month</span>
              </div>
              <div className="stat-chart">
                <div className="mini-bar prediction" style={{height: '50%'}}></div>
                <div className="mini-bar prediction" style={{height: '65%'}}></div>
                <div className="mini-bar prediction" style={{height: '55%'}}></div>
                <div className="mini-bar prediction" style={{height: '75%'}}></div>
                <div className="mini-bar prediction" style={{height: '70%'}}></div>
                <div className="mini-bar prediction" style={{height: '85%'}}></div>
                <div className="mini-bar prediction" style={{height: '95%'}}></div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-label">Inventory Value</span>
                <span className="stat-icon">📦</span>
              </div>
              <div className="stat-value">$45,890</div>
              <div className="stat-change neutral">
                <span>→ 0.3%</span>
                <span className="stat-period">vs last month</span>
              </div>
              <div className="stat-chart">
                <div className="mini-bar neutral" style={{height: '70%'}}></div>
                <div className="mini-bar neutral" style={{height: '72%'}}></div>
                <div className="mini-bar neutral" style={{height: '68%'}}></div>
                <div className="mini-bar neutral" style={{height: '71%'}}></div>
                <div className="mini-bar neutral" style={{height: '69%'}}></div>
                <div className="mini-bar neutral" style={{height: '70%'}}></div>
                <div className="mini-bar neutral" style={{height: '71%'}}></div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-label">Low Stock Items</span>
                <span className="stat-icon">⚠️</span>
              </div>
              <div className="stat-value">8</div>
              <div className="stat-change negative">
                <span>↑ 3 items</span>
                <span className="stat-period">need attention</span>
              </div>
              <div className="stat-chart">
                <div className="mini-bar warning" style={{height: '30%'}}></div>
                <div className="mini-bar warning" style={{height: '40%'}}></div>
                <div className="mini-bar warning" style={{height: '35%'}}></div>
                <div className="mini-bar warning" style={{height: '50%'}}></div>
                <div className="mini-bar warning" style={{height: '55%'}}></div>
                <div className="mini-bar warning" style={{height: '60%'}}></div>
                <div className="mini-bar warning" style={{height: '65%'}}></div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="charts-row">
            {/* Sales Prediction Chart */}
            <div className="chart-card large">
              <div className="chart-header">
                <div>
                  <h3>Sales Prediction vs Actual</h3>
                  <p>Comparison of predicted and actual sales performance</p>
                </div>
                <button className="export-btn">Export</button>
              </div>
              <div className="chart-container">
                <div className="chart-legend">
                  <div className="legend-item">
                    <span className="legend-dot actual"></span>
                    <span>Actual Sales</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-dot predicted"></span>
                    <span>Predicted Sales</span>
                  </div>
                </div>
                <div className="bar-chart">
                  {salesData.map((data, index) => (
                    <div key={index} className="bar-group">
                      <div className="bars">
                        <div 
                          className="bar actual"
                          style={{height: `${(data.actual / maxSales) * 100}%`}}
                          title={`Actual: $${data.actual.toLocaleString()}`}
                        ></div>
                        <div 
                          className="bar predicted"
                          style={{height: `${(data.predicted / maxSales) * 100}%`}}
                          title={`Predicted: $${data.predicted.toLocaleString()}`}
                        ></div>
                      </div>
                      <div className="bar-label">{data.month}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Alerts Card */}
            <div className="chart-card small">
              <div className="chart-header">
                <h3>Recent Alerts</h3>
              </div>
              <div className="alerts-list">
                {alerts.map(alert => (
                  <div key={alert.id} className={`alert-item ${alert.type}`}>
                    <span className="alert-icon">{getAlertIcon(alert.type)}</span>
                    <div className="alert-content">
                      <p>{alert.message}</p>
                      <span className="alert-time">{alert.time}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button className="view-all-btn">View All Alerts</button>
            </div>
          </div>

          {/* Products Table */}
          <div className="table-card">
            <div className="table-header">
              <div>
                <h3>Top Products by Predicted Demand</h3>
                <p>Products requiring attention based on AI predictions</p>
              </div>
              <button className="export-btn">View All Products</button>
            </div>
            <div className="table-container">
              <table className="products-table">
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>Current Stock</th>
                    <th>Predicted Demand</th>
                    <th>Reorder Point</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map(product => (
                    <tr key={product.id}>
                      <td className="product-name">
                        <div className="product-icon">📦</div>
                        {product.name}
                      </td>
                      <td>{product.currentStock}</td>
                      <td className="predicted-value">{product.predictedDemand}</td>
                      <td>{product.reorderPoint}</td>
                      <td>
                        <span className={`status-badge ${getStatusColor(product.status)}`}>
                          {product.status}
                        </span>
                      </td>
                      <td>
                        <button className="action-btn">Reorder</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}