'use client';

import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Package, DollarSign, AlertTriangle, XCircle, Plus, Upload, Download, Grid, List, Edit, Trash2, RefreshCw, Search, Filter } from 'lucide-react';

interface InventoryItem {
  id: number;
  sku: string;
  name: string;
  category: string;
  quantity: number;
  reorderLevel: number;
  unitPrice: number;
  totalValue: number;
  supplier: string;
  lastRestocked: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'overstock';
}

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'electronics' | 'clothing' | 'food' | 'furniture'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'in-stock' | 'low-stock' | 'out-of-stock'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [showAddModal, setShowAddModal] = useState(false);

  const inventoryItems: InventoryItem[] = [
    {
      id: 1,
      sku: 'SKU-001',
      name: 'Wireless Headphones Pro',
      category: 'Electronics',
      quantity: 145,
      reorderLevel: 50,
      unitPrice: 89.99,
      totalValue: 13048.55,
      supplier: 'TechSupply Co.',
      lastRestocked: '2025-01-15',
      status: 'in-stock'
    },
    {
      id: 2,
      sku: 'SKU-002',
      name: 'Smart Watch Series X',
      category: 'Electronics',
      quantity: 32,
      reorderLevel: 40,
      unitPrice: 299.99,
      totalValue: 9599.68,
      supplier: 'TechSupply Co.',
      lastRestocked: '2025-01-10',
      status: 'low-stock'
    },
    {
      id: 3,
      sku: 'SKU-003',
      name: 'Premium T-Shirt',
      category: 'Clothing',
      quantity: 0,
      reorderLevel: 100,
      unitPrice: 29.99,
      totalValue: 0,
      supplier: 'Fashion Wholesale',
      lastRestocked: '2024-12-20',
      status: 'out-of-stock'
    },
    {
      id: 4,
      sku: 'SKU-004',
      name: 'Running Shoes Elite',
      category: 'Clothing',
      quantity: 234,
      reorderLevel: 80,
      unitPrice: 129.99,
      totalValue: 30417.66,
      supplier: 'Fashion Wholesale',
      lastRestocked: '2025-01-18',
      status: 'in-stock'
    },
    {
      id: 5,
      sku: 'SKU-005',
      name: 'Organic Coffee Beans',
      category: 'Food',
      quantity: 567,
      reorderLevel: 200,
      unitPrice: 24.99,
      totalValue: 14169.33,
      supplier: 'Fresh Foods Ltd.',
      lastRestocked: '2025-01-20',
      status: 'in-stock'
    },
    {
      id: 6,
      sku: 'SKU-006',
      name: 'Office Desk Chair',
      category: 'Furniture',
      quantity: 18,
      reorderLevel: 25,
      unitPrice: 249.99,
      totalValue: 4499.82,
      supplier: 'Furniture Direct',
      lastRestocked: '2025-01-05',
      status: 'low-stock'
    },
    {
      id: 7,
      sku: 'SKU-007',
      name: 'Laptop Stand Adjustable',
      category: 'Electronics',
      quantity: 89,
      reorderLevel: 30,
      unitPrice: 49.99,
      totalValue: 4449.11,
      supplier: 'TechSupply Co.',
      lastRestocked: '2025-01-16',
      status: 'in-stock'
    },
    {
      id: 8,
      sku: 'SKU-008',
      name: 'Winter Jacket Premium',
      category: 'Clothing',
      quantity: 450,
      reorderLevel: 50,
      unitPrice: 189.99,
      totalValue: 85495.50,
      supplier: 'Fashion Wholesale',
      lastRestocked: '2025-01-22',
      status: 'overstock'
    },
  ];

  const categoryData = [
    { name: 'Electronics', value: 35, color: '#8b5cf6' },
    { name: 'Clothing', value: 30, color: '#ec4899' },
    { name: 'Food', value: 20, color: '#10b981' },
    { name: 'Furniture', value: 15, color: '#f59e0b' },
  ];

  const stockLevelData = [
    { status: 'In Stock', count: 5, fill: '#10b981' },
    { status: 'Low Stock', count: 2, fill: '#f59e0b' },
    { status: 'Out of Stock', count: 1, fill: '#ef4444' },
  ];

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; color: string }> = {
      'in-stock': { label: 'In Stock', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
      'low-stock': { label: 'Low Stock', color: 'bg-amber-100 text-amber-700 border-amber-200' },
      'out-of-stock': { label: 'Out of Stock', color: 'bg-red-100 text-red-700 border-red-200' },
      'overstock': { label: 'Overstock', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    };
    return configs[status] || configs['in-stock'];
  };

  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category.toLowerCase() === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalInventoryValue = inventoryItems.reduce((sum, item) => sum + item.totalValue, 0);
  const lowStockCount = inventoryItems.filter(item => item.status === 'low-stock' || item.status === 'out-of-stock').length;
  const totalItems = inventoryItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-[1600px] mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Inventory Management
            </h1>
            <p className="text-slate-600 text-lg">Track and manage your product inventory in real-time</p>
          </div>
          <div className="flex gap-3">
            <button className="px-6 py-3 bg-white text-slate-700 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2 font-medium border border-slate-200">
              <Upload size={18} />
              Import CSV
            </button>
            <button className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 font-medium hover:scale-105">
              <Plus size={18} />
              Add New Item
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100 group hover:scale-105">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Package className="text-white" size={28} />
              </div>
              <div>
                <p className="text-slate-600 text-sm font-medium">Total Items</p>
                <p className="text-3xl font-bold text-slate-800">{totalItems.toLocaleString()}</p>
                <p className="text-xs text-slate-500 mt-1">{inventoryItems.length} Products</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100 group hover:scale-105">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <DollarSign className="text-white" size={28} />
              </div>
              <div>
                <p className="text-slate-600 text-sm font-medium">Total Value</p>
                <p className="text-3xl font-bold text-slate-800">${totalInventoryValue.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
                <p className="text-xs text-slate-500 mt-1">Inventory Worth</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100 group hover:scale-105">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <AlertTriangle className="text-white" size={28} />
              </div>
              <div>
                <p className="text-slate-600 text-sm font-medium">Low Stock Alert</p>
                <p className="text-3xl font-bold text-slate-800">{lowStockCount}</p>
                <p className="text-xs text-slate-500 mt-1">Need Restocking</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100 group hover:scale-105">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <XCircle className="text-white" size={28} />
              </div>
              <div>
                <p className="text-slate-600 text-sm font-medium">Out of Stock</p>
                <p className="text-3xl font-bold text-slate-800">{inventoryItems.filter(i => i.status === 'out-of-stock').length}</p>
                <p className="text-xs text-slate-500 mt-1">Critical Items</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-800">Stock Status Overview</h2>
              <p className="text-sm text-slate-600 mt-1">Current inventory distribution by status</p>
            </div>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stockLevelData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="status" stroke="#64748b" style={{ fontSize: '0.875rem' }} />
                  <YAxis stroke="#64748b" style={{ fontSize: '0.875rem' }} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.75rem',
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-800">Category Distribution</h2>
              <p className="text-sm text-slate-600 mt-1">Inventory breakdown by product category</p>
            </div>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry: any) => `${entry.name} ${(entry.percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search by product name or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-700"
              />
            </div>

            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as any)}
              className="px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 bg-white"
            >
              <option value="all">All Categories</option>
              <option value="electronics">Electronics</option>
              <option value="clothing">Clothing</option>
              <option value="food">Food</option>
              <option value="furniture">Furniture</option>
            </select>

            <select 
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 bg-white"
            >
              <option value="all">All Status</option>
              <option value="in-stock">In Stock</option>
              <option value="low-stock">Low Stock</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>

            <div className="flex gap-2">
              <button 
                className={`p-3 rounded-xl border transition-all ${viewMode === 'list' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                onClick={() => setViewMode('list')}
              >
                <List size={20} />
              </button>
              <button 
                className={`p-3 rounded-xl border transition-all ${viewMode === 'grid' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                onClick={() => setViewMode('grid')}
              >
                <Grid size={20} />
              </button>
            </div>

            <button className="px-6 py-3 bg-white text-slate-700 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all flex items-center gap-2 font-medium">
              <Download size={18} />
              Export
            </button>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">SKU</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Product Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Reorder</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Unit Price</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Total Value</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Supplier</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Last Restocked</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((item, index) => {
                  const statusConfig = getStatusConfig(item.status);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded">{item.sku}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                            <Package className="text-indigo-600" size={20} />
                          </div>
                          <span className="text-sm font-medium text-slate-800">{item.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-700 bg-slate-100 px-3 py-1 rounded-full">{item.category}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-semibold ${item.quantity <= item.reorderLevel ? 'text-red-600' : 'text-emerald-600'}`}>
                          {item.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{item.reorderLevel}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-700">${item.unitPrice.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-800">${item.totalValue.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{item.supplier}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{new Date(item.lastRestocked).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                            <Edit size={16} />
                          </button>
                          <button className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Restock">
                            <RefreshCw size={16} />
                          </button>
                          <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-500 text-lg">No items found matching your criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}