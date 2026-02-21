"use client";

import React, { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import "./predictions.css";
import { apiClient } from "@/lib/api-client";
import { getDisplayName, getEmoji } from "@/lib/product-mapping";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import ErrorBanner from "@/app/components/ErrorBanner";

type ModelType = "arima" | "prophet" | "lstm";

interface FamilyStatus {
  family: string;
  displayName: string;
  trained: boolean;
  training: boolean;
  predictions: any[];
  metrics: any | null;
  error: string | null;
}

export default function PredictionsPage() {
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [modelType, setModelType] = useState<ModelType>("prophet");
  const [steps, setSteps] = useState(7);
  const [families, setFamilies] = useState<FamilyStatus[]>([]);
  const [selectedFamily, setSelectedFamily] = useState<string | null>(null);

  // Load product families
  useEffect(() => {
    apiClient
      .getProducts()
      .then((resp) => {
        if (resp.products) {
          setFamilies(
            resp.products.map((f: string) => ({
              family: f,
              displayName: getDisplayName(f),
              trained: false,
              training: false,
              predictions: [],
              metrics: null,
              error: null,
            }))
          );
        }
      })
      .catch((err) => setPageError(err.message))
      .finally(() => setPageLoading(false));
  }, []);

  const trainFamily = async (family: string) => {
    setFamilies((prev) =>
      prev.map((f) =>
        f.family === family ? { ...f, training: true, error: null } : f
      )
    );

    try {
      const trainResp = await apiClient.trainModel({
        product_family: family,
        model_type: modelType,
      });

      if (!trainResp.success) throw new Error(trainResp.error || "Training failed");

      // Get predictions
      const predResp = await apiClient.getPredictions({
        product_family: family,
        model_type: modelType,
        steps,
      });

      setFamilies((prev) =>
        prev.map((f) =>
          f.family === family
            ? {
                ...f,
                trained: true,
                training: false,
                metrics: trainResp.metrics || null,
                predictions: predResp.success ? predResp.forecast || [] : [],
                error: predResp.success ? null : predResp.error,
              }
            : f
        )
      );
    } catch (err: any) {
      setFamilies((prev) =>
        prev.map((f) =>
          f.family === family
            ? { ...f, training: false, error: err.message || "Failed" }
            : f
        )
      );
    }
  };

  const trainAll = async () => {
    for (const f of families) {
      if (!f.trained && !f.training) {
        await trainFamily(f.family);
      }
    }
  };

  const trainedFamilies = families.filter((f) => f.trained);
  const totalPredictedUnits = trainedFamilies.reduce(
    (sum, f) => sum + f.predictions.reduce((s: number, p: any) => s + (p.forecast ?? p.predicted ?? 0), 0),
    0
  );
  const avgAccuracy = trainedFamilies.length
    ? trainedFamilies.reduce((s, f) => s + (f.metrics?.mape != null ? (1 - f.metrics.mape) * 100 : 0), 0) /
      trainedFamilies.length
    : 0;

  // Chart data for selected family
  const selectedData = families.find((f) => f.family === selectedFamily);
  const chartData = (selectedData?.predictions || []).map((p: any) => ({
    date: p.date,
    predicted: Math.round(p.forecast ?? p.predicted ?? 0),
  }));

  if (pageLoading) return <LoadingSpinner message="Loading predictions..." />;
  if (pageError) return <ErrorBanner message={pageError} />;

  return (
    <div className="predictions-page">
      <div className="predictions-container">
        {/* Header */}
        <div className="predictions-header">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-2 tracking-tight">
              Sales Predictions
            </h1>
            <p className="predictions-subtitle">
              ML-powered forecasts for all perishable product categories
            </p>
          </div>
          <div className="header-actions">
            <select
              className="time-range-select"
              value={steps}
              onChange={(e) => setSteps(Number(e.target.value))}
            >
              <option value={7}>Next 7 Days</option>
              <option value={14}>Next 14 Days</option>
              <option value={30}>Next 30 Days</option>
            </select>
            <select
              className="time-range-select"
              value={modelType}
              onChange={(e) => setModelType(e.target.value as ModelType)}
            >
              <option value="prophet">Prophet</option>
              <option value="arima">ARIMA</option>
              <option value="lstm">LSTM</option>
            </select>
            <button className="generate-report-btn" onClick={trainAll}>
              Train All Models
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="summary-cards">
          <div className="summary-card">
            <div className="summary-icon" style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)" }}>
              🎯
            </div>
            <div className="summary-content">
              <h3>Avg Model Accuracy</h3>
              <p className="summary-value">{avgAccuracy > 0 ? `${avgAccuracy.toFixed(1)}%` : "N/A"}</p>
              <span className="summary-change neutral">
                {trainedFamilies.length}/{families.length} models trained
              </span>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon" style={{ background: "linear-gradient(135deg, #10b981 0%, #34d399 100%)" }}>
              📈
            </div>
            <div className="summary-content">
              <h3>Total Predicted</h3>
              <p className="summary-value">{Math.round(totalPredictedUnits).toLocaleString()} units</p>
              <span className="summary-change positive">Next {steps} days</span>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon" style={{ background: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)" }}>
              📦
            </div>
            <div className="summary-content">
              <h3>Product Categories</h3>
              <p className="summary-value">{families.length}</p>
              <span className="summary-change neutral">Perishable items</span>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon" style={{ background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)" }}>
              🤖
            </div>
            <div className="summary-content">
              <h3>Model Type</h3>
              <p className="summary-value">{modelType.toUpperCase()}</p>
              <span className="summary-change neutral">Active model</span>
            </div>
          </div>
        </div>

        {/* Chart for selected family */}
        {selectedData && chartData.length > 0 && (
          <div className="chart-section">
            <div className="chart-card-large">
              <div className="chart-card-header">
                <div>
                  <h2>{selectedData.displayName} — Forecast</h2>
                  <p>{modelType.toUpperCase()} model, {steps}-day prediction</p>
                </div>
              </div>
              <div className="chart-wrapper" style={{ height: "400px", minHeight: "400px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: "0.875rem" }} />
                    <YAxis stroke="#64748b" style={{ fontSize: "0.875rem" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "0.75rem",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
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
        )}

        {/* Product Family Table */}
        <div className="predictions-table-section">
          <div className="table-header-section">
            <div>
              <h2>Product Category Predictions</h2>
              <p>Train models and view forecasts for each perishable category</p>
            </div>
          </div>

          <div className="predictions-table-wrapper">
            <table className="predictions-table">
              <thead>
                <tr>
                  <th>Product Category</th>
                  <th>Status</th>
                  <th>Predicted ({steps}d)</th>
                  <th>MAE</th>
                  <th>RMSE</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {families.map((f) => {
                  const totalPred = f.predictions.reduce(
                    (s: number, p: any) => s + Math.round(p.forecast ?? p.predicted ?? 0),
                    0
                  );
                  return (
                    <tr key={f.family}>
                      <td className="product-name-cell">
                        <div className="product-icon">{getEmoji(f.family)}</div>
                        <span>{f.displayName}</span>
                      </td>
                      <td>
                        <span
                          className={`category-badge`}
                          style={{
                            background: f.trained ? "#dcfce7" : f.training ? "#fef3c7" : "#f1f5f9",
                            color: f.trained ? "#166534" : f.training ? "#92400e" : "#64748b",
                          }}
                        >
                          {f.training ? "Training..." : f.trained ? "Trained" : "Not trained"}
                        </span>
                      </td>
                      <td className="numeric-cell predicted">
                        {f.trained ? `${totalPred.toLocaleString()} units` : "—"}
                      </td>
                      <td className="numeric-cell">
                        {f.metrics?.mae != null ? f.metrics.mae.toFixed(1) : "—"}
                      </td>
                      <td className="numeric-cell">
                        {f.metrics?.rmse != null ? f.metrics.rmse.toFixed(1) : "—"}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            onClick={() => trainFamily(f.family)}
                            disabled={f.training}
                            style={{
                              padding: "6px 14px",
                              borderRadius: 8,
                              border: "none",
                              background: f.training ? "#94a3b8" : "#4f46e5",
                              color: "white",
                              fontWeight: 700,
                              fontSize: 12,
                              cursor: f.training ? "wait" : "pointer",
                            }}
                          >
                            {f.training ? "..." : f.trained ? "Retrain" : "Train"}
                          </button>
                          {f.trained && (
                            <button
                              onClick={() => setSelectedFamily(f.family === selectedFamily ? null : f.family)}
                              style={{
                                padding: "6px 14px",
                                borderRadius: 8,
                                border: "1px solid #e2e8f0",
                                background: f.family === selectedFamily ? "#eef2ff" : "white",
                                color: "#4f46e5",
                                fontWeight: 700,
                                fontSize: 12,
                                cursor: "pointer",
                              }}
                            >
                              {f.family === selectedFamily ? "Hide Chart" : "View Chart"}
                            </button>
                          )}
                        </div>
                        {f.error && (
                          <p style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>{f.error}</p>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Insights */}
        <div className="insights-section">
          <h2>Getting Started</h2>
          <div className="insights-grid">
            <div className="insight-card info">
              <div className="insight-header">
                <span className="insight-icon">💡</span>
                <h3>How It Works</h3>
              </div>
              <p>
                Click "Train" on any product category to build an ML model using historical sales data.
                Once trained, view the {steps}-day forecast chart and accuracy metrics.
              </p>
            </div>

            <div className="insight-card success">
              <div className="insight-header">
                <span className="insight-icon">✅</span>
                <h3>Recommended Model</h3>
              </div>
              <p>
                Prophet is recommended for most categories. ARIMA works well for stationary data.
                LSTM is powerful but slower to train.
              </p>
            </div>

            <div className="insight-card warning">
              <div className="insight-header">
                <span className="insight-icon">⚠️</span>
                <h3>Train All</h3>
              </div>
              <p>
                Use the "Train All Models" button to train every category at once.
                This may take a few minutes depending on the model type.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
