'use client';

import React, { useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'orders' | 'customers' | 'products'>('revenue');

  // Sales trend data
  const salesTrendData = [
    { month: 'Jan', actual: 45000, forecast: 42000, target: 50000 },
    { month: 'Feb', actual: 52000, forecast: 48000, target: 52000 },
    { month: 'Mar', actual: 48000, forecast: 51000, target: 54000 },
    { month: 'Apr', actual: 61000, forecast: 58000, target: 56000 },
    { month: 'May', actual: 55000, forecast: 62000, target: 58000 },
    { month: 'Jun', actual: 67000, forecast: 65000, target: 60000 },
    { month: 'Jul', actual: 72000, forecast: 70000, target: 62000 },
    { month: 'Aug', actual: 0, forecast: 75000, target: 64000 },
    { month: 'Sep', actual: 0, forecast: 78000, target: 66000 },
    { month: 'Oct', actual: 0, forecast: 82000, target: 68000 },
    { month: 'Nov', actual: 0, forecast: 88000, target: 70000 },
    { month: 'Dec', actual: 0, forecast: 95000, target: 72000 },
  ];

  // Revenue by category
  const categoryData = [
    { name: 'Electronics', value: 35, amount: 125000, color: '#8b5cf6' },
    { name: 'Clothing', value: 25, amount: 89000, color: '#ec4899' },
    { name: 'Food & Beverages', value: 20, amount: 71000, color: '#10b981' },
    { name: 'Home & Garden', value: 12, amount: 43000, color: '#f59e0b' },
    { name: 'Others', value: 8, amount: 28000, color: '#6366f1' },
  ];

  // Regional performance
  const regionalData = [
    { region: 'North America', sales: 89000, growth: 12.5 },
    { region: 'Europe', sales: 76000, growth: 8.3 },
    { region: 'Asia Pacific', sales: 94000, growth: 15.7 },
    { region: 'Latin America', sales: 43000, growth: 6.2 },
    { region: 'Middle East', sales: 31000, growth: 9.8 },
  ];

  // Product performance radar
  const productPerformanceData = [
    { metric: 'Sales', value: 85 },
    { metric: 'Quality', value: 92 },
    { metric: 'Delivery', value: 78 },
    { metric: 'Support', value: 88 },
    { metric: 'Innovation', value: 75 },
    { metric: 'Value', value: 90 },
  ];

  // Top products
  const topProducts = [
    { name: 'Wireless Headphones Pro', sales: 1234, revenue: 110000, growth: 23.5 },
    { name: 'Smart Watch Series X', sales: 987, revenue: 295000, growth: 18.2 },
    { name: 'Laptop Stand Premium', sales: 856, revenue: 42800, growth: 15.7 },
    { name: 'Office Desk Chair', sales: 743, revenue: 185000, growth: 12.3 },
    { name: 'Premium Coffee Beans', sales: 2341, revenue: 58500, growth: 9.8 },
  ];

  // Customer segments
  const customerSegmentData = [
    { segment: 'Enterprise', count: 45, revenue: 245000, fill: '#8b5cf6' },
    { segment: 'SMB', count: 234, revenue: 156000, fill: '#ec4899' },
    { segment: 'Startup', count: 567, revenue: 78000, fill: '#10b981' },
    { segment: 'Individual', count: 1234, revenue: 34000, fill: '#f59e0b' },
  ];

  const kpiCards = [
    {
      title: 'Total Revenue',
      value: '$456,789',
      change: '+12.5%',
      trend: 'up',
      icon: '💰',
      gradient: 'from-purple-500 to-indigo-600',
    },
    {
      title: 'Total Orders',
      value: '8,234',
      change: '+8.3%',
      trend: 'up',
      icon: '📦',
      gradient: 'from-pink-500 to-rose-600',
    },
    {
      title: 'Avg Order Value',
      value: '$55.48',
      change: '+4.2%',
      trend: 'up',
      icon: '💵',
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      title: 'Conversion Rate',
      value: '3.24%',
      change: '-0.8%',
      trend: 'down',
      icon: '📈',
      gradient: 'from-amber-500 to-orange-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
      <div className="max-w-[1800px] mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              Sales Analytics
            </h1>
            <p className="text-slate-600 text-lg">Comprehensive insights and forecast analysis</p>
          </div>
          <div className="flex gap-3">
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-6 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 font-medium shadow-sm hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </select>
            <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-medium hover:scale-105">
              📊 Export Report
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpiCards.map((kpi, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100 group hover:scale-105">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${kpi.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform text-2xl`}>
                  {kpi.icon}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${kpi.trend === 'up' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                  {kpi.change}
                </span>
              </div>
              <h3 className="text-sm font-medium text-slate-600 mb-1">{kpi.title}</h3>
              <p className="text-3xl font-bold text-slate-800">{kpi.value}</p>
            </div>
          ))}
        </div>

        {/* Sales Forecast Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-1">Sales Forecast vs Actual</h2>
            <p className="text-sm text-slate-600">Predicted sales trends and actual performance comparison</p>
          </div>
          <div style={{ height: '400px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#64748b" style={{ fontSize: '0.875rem' }} />
                <YAxis stroke="#64748b" style={{ fontSize: '0.875rem' }} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.75rem',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="actual" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 5 }} name="Actual Sales" />
                <Line type="monotone" dataKey="forecast" stroke="#ec4899" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 5 }} name="Forecasted" />
                <Line type="monotone" dataKey="target" stroke="#10b981" strokeWidth={2} strokeDasharray="3 3" dot={{ r: 4 }} name="Target" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Distribution and Regional Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue by Category */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-800 mb-1">Revenue by Category</h2>
              <p className="text-sm text-slate-600">Distribution of sales across product categories</p>
            </div>
            <div style={{ height: '350px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={(entry: any) => `${entry.name}: ${entry.value}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any, name: any, props: any) => [`$${props.payload.amount.toLocaleString()}`, 'Revenue']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {categoryData.map((cat, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}></div>
                  <span className="text-xs text-slate-600">{cat.name}: ${cat.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Regional Performance */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-800 mb-1">Regional Performance</h2>
              <p className="text-sm text-slate-600">Sales distribution across geographical regions</p>
            </div>
            <div style={{ height: '350px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={regionalData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" stroke="#64748b" style={{ fontSize: '0.875rem' }} />
                  <YAxis dataKey="region" type="category" stroke="#64748b" style={{ fontSize: '0.875rem' }} width={120} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.75rem',
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Bar dataKey="sales" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Product Performance Radar and Customer Segments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Product Performance Radar */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-800 mb-1">Product Performance Metrics</h2>
              <p className="text-sm text-slate-600">Multi-dimensional product quality analysis</p>
            </div>
            <div style={{ height: '350px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={productPerformanceData}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="metric" stroke="#64748b" style={{ fontSize: '0.875rem' }} />
                  <PolarRadiusAxis stroke="#64748b" />
                  <Radar name="Performance" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Customer Segments */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-800 mb-1">Customer Segments</h2>
              <p className="text-sm text-slate-600">Revenue distribution by customer type</p>
            </div>
            <div style={{ height: '350px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={customerSegmentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="segment" stroke="#64748b" style={{ fontSize: '0.875rem' }} />
                  <YAxis stroke="#64748b" style={{ fontSize: '0.875rem' }} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.75rem',
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Bar dataKey="revenue" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Top Products Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 mb-1">Top Performing Products</h2>
            <p className="text-sm text-slate-600">Best selling products with growth metrics</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Rank</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Product Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Units Sold</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Revenue</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Growth</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Performance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topProducts.map((product, index) => (
                  <tr key={index} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 text-purple-700 font-bold text-sm">
                        {index + 1}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-xl">
                          🏆
                        </div>
                        <span className="text-sm font-medium text-slate-800">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-slate-700">{product.sales.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-slate-800">${product.revenue.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                        +{product.growth}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} className={i < Math.floor(product.growth / 5) ? 'text-yellow-400' : 'text-slate-300'}>
                            ⭐
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Insights Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="text-4xl mb-3">🎯</div>
            <h3 className="text-xl font-bold mb-2">Goal Achievement</h3>
            <p className="text-purple-100 mb-4">You're on track to exceed your quarterly target by 15%</p>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div className="bg-white rounded-full h-2" style={{ width: '85%' }}></div>
            </div>
            <p className="text-xs text-purple-100 mt-2">85% of Q3 target achieved</p>
          </div>

          <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="text-4xl mb-3">📊</div>
            <h3 className="text-xl font-bold mb-2">Trending Products</h3>
            <p className="text-pink-100 mb-4">Electronics category showing 23.5% growth this month</p>
            <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-all">
              View Details →
            </button>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="text-4xl mb-3">💡</div>
            <h3 className="text-xl font-bold mb-2">AI Recommendation</h3>
            <p className="text-emerald-100 mb-4">Consider increasing inventory for Smart Watch Series X</p>
            <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-all">
              Learn More →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}