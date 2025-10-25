'use client';

import React, { useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import './predictions.css';

interface PredictionData {
  date: string;
  predicted: number;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
}

interface ProductPrediction {
  id: number;
  name: string;
  category: string;
  currentSales: number;
  predictedSales: number;
  confidence: number;
  recommendation: string;
  trend: 'up' | 'down' | 'stable';
}

export default function PredictionsPage() {
  const [timeRange, setTimeRange] = useState<'7days' | '30days' | '90days'>('30days');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'electronics' | 'clothing' | 'food'>('all');

  // Sample prediction data for next 30 days
  const predictionData: PredictionData[] = [
    { date: 'Week 1', predicted: 12500, confidence: 95, trend: 'up' },
    { date: 'Week 2', predicted: 13200, confidence: 93, trend: 'up' },
    { date: 'Week 3', predicted: 14100, confidence: 91, trend: 'up' },
    { date: 'Week 4', predicted: 13800, confidence: 89, trend: 'stable' },
    { date: 'Week 5', predicted: 15200, confidence: 87, trend: 'up' },
    { date: 'Week 6', predicted: 14900, confidence: 85, trend: 'stable' },
  ];

  // Sample product predictions
  const productPredictions: ProductPrediction[] = [
    {
      id: 1,
      name: 'Wireless Headphones Pro',
      category: 'Electronics',
      currentSales: 450,
      predictedSales: 680,
      confidence: 94,
      recommendation: 'Increase stock by 40%',
      trend: 'up'
    },
    {
      id: 2,
      name: 'Smart Watch Series X',
      category: 'Electronics',
      currentSales: 320,
      predictedSales: 280,
      confidence: 91,
      recommendation: 'Reduce stock by 15%',
      trend: 'down'
    },
    {
      id: 3,
      name: 'Premium T-Shirt',
      category: 'Clothing',
      currentSales: 890,
      predictedSales: 1250,
      confidence: 96,
      recommendation: 'Increase stock by 50%',
      trend: 'up'
    },
    {
      id: 4,
      name: 'Running Shoes Elite',
      category: 'Clothing',
      currentSales: 560,
      predictedSales: 540,
      confidence: 89,
      recommendation: 'Maintain current stock',
      trend: 'stable'
    },
    {
      id: 5,
      name: 'Organic Coffee Beans',
      category: 'Food',
      currentSales: 1200,
      predictedSales: 1580,
      confidence: 93,
      recommendation: 'Increase stock by 35%',
      trend: 'up'
    },
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      case 'stable': return '➡️';
      default: return '➡️';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'trend-up';
      case 'down': return 'trend-down';
      case 'stable': return 'trend-stable';
      default: return 'trend-stable';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'confidence-high';
    if (confidence >= 80) return 'confidence-medium';
    return 'confidence-low';
  };

  return (
    <div className="predictions-page">
      <div className="predictions-container">
        {/* Page Header */}
        <div className="predictions-header">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-2 tracking-tight">
              Sales Predictions
            </h1>
            <p className="predictions-subtitle">
              AI-powered forecasts and demand predictions for your inventory
            </p>
          </div>
          <div className="header-actions">
            <select 
              className="time-range-select"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
            >
              <option value="7days">Next 7 Days</option>
              <option value="30days">Next 30 Days</option>
              <option value="90days">Next 90 Days</option>
            </select>
            <button className="generate-report-btn">
              📊 Generate Report
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="summary-cards">
          <div className="summary-card">
            <div className="summary-icon" style={{background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'}}>
              🎯
            </div>
            <div className="summary-content">
              <h3>Average Accuracy</h3>
              <p className="summary-value">94.2%</p>
              <span className="summary-change positive">↑ 2.1% from last month</span>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon" style={{background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)'}}>
              📈
            </div>
            <div className="summary-content">
              <h3>Predicted Growth</h3>
              <p className="summary-value">+18.5%</p>
              <span className="summary-change positive">Next 30 days</span>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon" style={{background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)'}}>
              ⚠️
            </div>
            <div className="summary-content">
              <h3>High Demand Items</h3>
              <p className="summary-value">12</p>
              <span className="summary-change neutral">Requires restocking</span>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon" style={{background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'}}>
              📉
            </div>
            <div className="summary-content">
              <h3>Declining Items</h3>
              <p className="summary-value">5</p>
              <span className="summary-change negative">Consider promotions</span>
            </div>
          </div>
        </div>

        {/* Prediction Chart */}
        <div className="chart-section">
          <div className="chart-card-large">
            <div className="chart-card-header">
              <div>
                <h2>Sales Forecast Trend</h2>
                <p>Predicted sales performance for the next period</p>
              </div>
              <div className="confidence-legend">
                <span className="legend-item">
                  <span className="legend-dot high"></span>
                  High Confidence (90%+)
                </span>
                <span className="legend-item">
                  <span className="legend-dot medium"></span>
                  Medium Confidence (80-89%)
                </span>
              </div>
            </div>
            <div className="chart-wrapper" style={{ height: '400px', minHeight: '400px' }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <AreaChart data={predictionData}>
                  <defs>
                    <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: '0.875rem' }} />
                  <YAxis stroke="#64748b" style={{ fontSize: '0.875rem' }} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.75rem',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="predicted" 
                    stroke="#6366f1" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorPredicted)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Product Predictions Table */}
        <div className="predictions-table-section">
          <div className="table-header-section">
            <div>
              <h2>Product-Level Predictions</h2>
              <p>Detailed forecasts for individual products</p>
            </div>
            <div className="table-filters">
              <select 
                className="category-filter"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as any)}
              >
                <option value="all">All Categories</option>
                <option value="electronics">Electronics</option>
                <option value="clothing">Clothing</option>
                <option value="food">Food & Beverages</option>
              </select>
              <button className="export-table-btn">
                📤 Export
              </button>
            </div>
          </div>

          <div className="predictions-table-wrapper">
            <table className="predictions-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Current Sales</th>
                  <th>Predicted Sales</th>
                  <th>Change</th>
                  <th>Confidence</th>
                  <th>Trend</th>
                  <th>Recommendation</th>
                </tr>
              </thead>
              <tbody>
                {productPredictions.map((product) => (
                  <tr key={product.id}>
                    <td className="product-name-cell">
                      <div className="product-icon">📦</div>
                      <span>{product.name}</span>
                    </td>
                    <td>
                      <span className="category-badge">{product.category}</span>
                    </td>
                    <td className="numeric-cell">{product.currentSales.toLocaleString()}</td>
                    <td className="numeric-cell predicted">{product.predictedSales.toLocaleString()}</td>
                    <td>
                      <span className={`change-badge ${getTrendColor(product.trend)}`}>
                        {getTrendIcon(product.trend)}
                        {Math.abs(product.predictedSales - product.currentSales)} units
                      </span>
                    </td>
                    <td>
                      <div className="confidence-cell">
                        <div className={`confidence-bar ${getConfidenceColor(product.confidence)}`}>
                          <div 
                            className="confidence-fill"
                            style={{ width: `${product.confidence}%` }}
                          ></div>
                        </div>
                        <span className="confidence-text">{product.confidence}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={`trend-indicator ${getTrendColor(product.trend)}`}>
                        {getTrendIcon(product.trend)}
                      </span>
                    </td>
                    <td>
                      <span className="recommendation-text">{product.recommendation}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Insights Section */}
        <div className="insights-section">
          <h2>AI-Generated Insights</h2>
          <div className="insights-grid">
            <div className="insight-card success">
              <div className="insight-header">
                <span className="insight-icon">✅</span>
                <h3>Opportunity Detected</h3>
              </div>
              <p>Electronics category showing 23% growth potential. Consider expanding inventory for Wireless Headphones and Smart Watches.</p>
              <button className="insight-action">View Details →</button>
            </div>

            <div className="insight-card warning">
              <div className="insight-header">
                <span className="insight-icon">⚠️</span>
                <h3>Stock Alert</h3>
              </div>
              <p>Premium T-Shirt predicted to have 50% sales increase. Current stock may run out in 10 days. Immediate reorder recommended.</p>
              <button className="insight-action">Take Action →</button>
            </div>

            <div className="insight-card info">
              <div className="insight-header">
                <span className="insight-icon">💡</span>
                <h3>Market Trend</h3>
              </div>
              <p>Seasonal pattern detected: Food & Beverages category typically sees 30% increase in next 2 weeks based on historical data.</p>
              <button className="insight-action">Learn More →</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}