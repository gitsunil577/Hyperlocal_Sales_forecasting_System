'use client';

import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface Report {
  id: string;
  title: string;
  type: string;
  category: string;
  generatedDate: string;
  size: string;
  status: 'ready' | 'generating' | 'scheduled';
  icon: string;
}

export default function ReportsPage() {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'sales' | 'inventory' | 'forecast' | 'customer'>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Sample reports data
  const reports: Report[] = [
    {
      id: '1',
      title: 'Monthly Sales Summary',
      type: 'PDF',
      category: 'sales',
      generatedDate: '2025-01-22',
      size: '2.4 MB',
      status: 'ready',
      icon: '📊'
    },
    {
      id: '2',
      title: 'Inventory Status Report',
      type: 'Excel',
      category: 'inventory',
      generatedDate: '2025-01-21',
      size: '1.8 MB',
      status: 'ready',
      icon: '📦'
    },
    {
      id: '3',
      title: 'Q1 Sales Forecast',
      type: 'PDF',
      category: 'forecast',
      generatedDate: '2025-01-20',
      size: '3.2 MB',
      status: 'ready',
      icon: '🔮'
    },
    {
      id: '4',
      title: 'Customer Analytics Report',
      type: 'PDF',
      category: 'customer',
      generatedDate: '2025-01-19',
      size: '2.1 MB',
      status: 'ready',
      icon: '👥'
    },
    {
      id: '5',
      title: 'Weekly Performance Dashboard',
      type: 'Excel',
      category: 'sales',
      generatedDate: '2025-01-18',
      size: '1.5 MB',
      status: 'generating',
      icon: '📈'
    },
    {
      id: '6',
      title: 'Product Category Analysis',
      type: 'PDF',
      category: 'inventory',
      generatedDate: '2025-01-17',
      size: '2.8 MB',
      status: 'ready',
      icon: '🏷️'
    },
    {
      id: '7',
      title: 'Annual Forecast Report 2025',
      type: 'PDF',
      category: 'forecast',
      generatedDate: '2025-01-15',
      size: '4.5 MB',
      status: 'scheduled',
      icon: '📅'
    },
    {
      id: '8',
      title: 'Revenue by Region',
      type: 'Excel',
      category: 'sales',
      generatedDate: '2025-01-14',
      size: '1.9 MB',
      status: 'ready',
      icon: '🌍'
    },
  ];

  // Report generation stats
  const reportStats = [
    { month: 'Jan', generated: 45, downloaded: 38 },
    { month: 'Feb', generated: 52, downloaded: 46 },
    { month: 'Mar', generated: 48, downloaded: 42 },
    { month: 'Apr', generated: 61, downloaded: 55 },
    { month: 'May', generated: 55, downloaded: 49 },
    { month: 'Jun', generated: 67, downloaded: 61 },
  ];

  // Quick stats
  const quickStats = [
    {
      title: 'Total Reports',
      value: '234',
      change: '+12',
      icon: '📄',
      gradient: 'from-purple-500 to-indigo-600',
      trend: 'up'
    },
    {
      title: 'This Month',
      value: '45',
      change: '+8',
      icon: '📊',
      gradient: 'from-pink-500 to-rose-600',
      trend: 'up'
    },
    {
      title: 'Downloads',
      value: '1,892',
      change: '+156',
      icon: '⬇️',
      gradient: 'from-emerald-500 to-teal-600',
      trend: 'up'
    },
    {
      title: 'Scheduled',
      value: '12',
      change: '+3',
      icon: '⏰',
      gradient: 'from-amber-500 to-orange-600',
      trend: 'up'
    },
  ];

  // Report templates
  const reportTemplates = [
    {
      name: 'Sales Performance',
      description: 'Comprehensive sales analysis with trends and forecasts',
      icon: '💰',
      color: 'from-purple-400 to-indigo-500'
    },
    {
      name: 'Inventory Analysis',
      description: 'Stock levels, reorder points, and inventory turnover',
      icon: '📦',
      color: 'from-pink-400 to-rose-500'
    },
    {
      name: 'Forecast Report',
      description: 'Predictive analytics and future sales projections',
      icon: '🔮',
      color: 'from-emerald-400 to-teal-500'
    },
    {
      name: 'Customer Insights',
      description: 'Customer behavior, segmentation, and retention',
      icon: '👥',
      color: 'from-amber-400 to-orange-500'
    },
    {
      name: 'Regional Performance',
      description: 'Geographic sales distribution and regional trends',
      icon: '🌍',
      color: 'from-blue-400 to-cyan-500'
    },
    {
      name: 'Product Analytics',
      description: 'Top products, categories, and product performance',
      icon: '🏆',
      color: 'from-violet-400 to-purple-500'
    },
  ];

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; color: string }> = {
      'ready': { label: 'Ready', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
      'generating': { label: 'Generating', color: 'bg-amber-100 text-amber-700 border-amber-200' },
      'scheduled': { label: 'Scheduled', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    };
    return configs[status] || configs['ready'];
  };

  const filteredReports = reports.filter(report => {
    return selectedCategory === 'all' || report.category === selectedCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
      <div className="max-w-[1800px] mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              Reports & Analytics
            </h1>
            <p className="text-slate-600 text-lg">Generate, view, and download comprehensive business reports</p>
          </div>
          <div className="flex gap-3">
            <button className="px-6 py-3 bg-white text-slate-700 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2 font-medium border border-slate-200">
              ⚙️ Schedule Report
            </button>
            <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 font-medium hover:scale-105">
              ➕ Generate New Report
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100 group hover:scale-105">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform text-2xl`}>
                  {stat.icon}
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                  {stat.change}
                </span>
              </div>
              <h3 className="text-sm font-medium text-slate-600 mb-1">{stat.title}</h3>
              <p className="text-3xl font-bold text-slate-800">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Report Activity Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-1">Report Activity</h2>
            <p className="text-sm text-slate-600">Monthly report generation and download trends</p>
          </div>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={reportStats}>
                <defs>
                  <linearGradient id="colorGenerated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorDownloaded" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
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
                <Area type="monotone" dataKey="generated" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorGenerated)" name="Generated" />
                <Area type="monotone" dataKey="downloaded" stroke="#ec4899" fillOpacity={1} fill="url(#colorDownloaded)" name="Downloaded" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Report Templates */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-1">Report Templates</h2>
            <p className="text-sm text-slate-600">Choose from pre-built templates to generate reports quickly</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportTemplates.map((template, index) => (
              <div key={index} className="group relative overflow-hidden rounded-xl border-2 border-slate-200 hover:border-purple-300 transition-all duration-300 cursor-pointer hover:shadow-lg">
                <div className={`absolute inset-0 bg-gradient-to-br ${template.color} opacity-5 group-hover:opacity-10 transition-opacity`}></div>
                <div className="relative p-6">
                  <div className="text-4xl mb-3">{template.icon}</div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">{template.name}</h3>
                  <p className="text-sm text-slate-600 mb-4">{template.description}</p>
                  <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg text-sm font-medium hover:shadow-md transition-all">
                    Generate Report
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Filter Reports</h3>
              <div className="flex gap-3 flex-wrap">
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as any)}
                  className="px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-700 bg-white text-sm"
                >
                  <option value="all">All Categories</option>
                  <option value="sales">Sales</option>
                  <option value="inventory">Inventory</option>
                  <option value="forecast">Forecast</option>
                  <option value="customer">Customer</option>
                </select>

                <select 
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value as any)}
                  className="px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-700 bg-white text-sm"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                className={`p-2 rounded-lg border transition-all ${viewMode === 'grid' ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                onClick={() => setViewMode('grid')}
              >
                ⊞
              </button>
              <button 
                className={`p-2 rounded-lg border transition-all ${viewMode === 'list' ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                onClick={() => setViewMode('list')}
              >
                ☰
              </button>
            </div>
          </div>
        </div>

        {/* Reports Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredReports.map((report) => {
              const statusConfig = getStatusConfig(report.status);
              return (
                <div key={report.id} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100 group hover:scale-105">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl">{report.icon}</div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                      {statusConfig.label}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-2">{report.title}</h3>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <span>📁</span>
                      <span>{report.type}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <span>📅</span>
                      <span>{new Date(report.generatedDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <span>💾</span>
                      <span>{report.size}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {report.status === 'ready' && (
                      <>
                        <button className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg text-sm font-medium hover:shadow-md transition-all">
                          📥 Download
                        </button>
                        <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-all">
                          👁️
                        </button>
                      </>
                    )}
                    {report.status === 'generating' && (
                      <button className="flex-1 px-4 py-2 bg-amber-100 text-amber-700 rounded-lg text-sm font-medium cursor-not-allowed">
                        ⏳ Generating...
                      </button>
                    )}
                    {report.status === 'scheduled' && (
                      <button className="flex-1 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                        📅 Scheduled
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Report</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Generated</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Size</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredReports.map((report) => {
                    const statusConfig = getStatusConfig(report.status);
                    return (
                      <tr key={report.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">{report.icon}</div>
                            <span className="text-sm font-medium text-slate-800">{report.title}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-slate-700 bg-slate-100 px-3 py-1 rounded-full capitalize">{report.category}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-slate-700">{report.type}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {new Date(report.generatedDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{report.size}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            {report.status === 'ready' && (
                              <>
                                <button className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" title="Download">
                                  📥
                                </button>
                                <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View">
                                  👁️
                                </button>
                                <button className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors" title="Share">
                                  🔗
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* No Results */}
        {filteredReports.length === 0 && (
          <div className="bg-white rounded-2xl p-12 shadow-lg border border-slate-100 text-center">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No Reports Found</h3>
            <p className="text-slate-600 mb-6">No reports match your current filter criteria</p>
            <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-medium">
              Generate Your First Report
            </button>
          </div>
        )}
      </div>
    </div>
  );
}