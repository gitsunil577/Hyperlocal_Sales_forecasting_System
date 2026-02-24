"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { apiClient } from "@/lib/api-client";
import { useForecast } from "@/lib/hooks/useForecast";
import { getDisplayName } from "@/lib/product-mapping";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import ErrorBanner from "@/app/components/ErrorBanner";

type Horizon = 7 | 14 | 30;
type ModelType = "arima" | "prophet" | "lstm";

export default function ForecastPage() {
  const [productFamilies, setProductFamilies] = useState<string[]>([]);
  const [selectedFamily, setSelectedFamily] = useState("BREAD/BAKERY");
  const [selectedModel, setSelectedModel] = useState<ModelType>("prophet");
  const [horizon, setHorizon] = useState<Horizon>(7);
  const [pageLoading, setPageLoading] = useState(true);

  const [insightText, setInsightText] = useState<string | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const [insightError, setInsightError] = useState<string | null>(null);

  const {
    training,
    predicting,
    trained,
    metrics,
    predictions,
    error,
    trainModel,
    getPredictions,
  } = useForecast();

  useEffect(() => {
    apiClient
      .getProducts()
      .then((resp) => { if (resp.products) setProductFamilies(resp.products); })
      .catch(console.error)
      .finally(() => setPageLoading(false));
  }, []);

  useEffect(() => {
    if (trained) getPredictions(selectedFamily, selectedModel, horizon);
  }, [horizon]);

  useEffect(() => {
    if (!predictions || predictions.length === 0 || !metrics) return;
    setInsightText(null);
    setInsightError(null);
    setInsightLoading(true);
    apiClient
      .getForecastInsight({
        product_family: selectedFamily,
        model_type: selectedModel,
        metrics: metrics as Record<string, number | null>,
        predictions: predictions as Array<Record<string, unknown>>,
      })
      .then((resp) => {
        if (resp.success) setInsightText(resp.insight);
        else setInsightError(resp.error || "Failed to generate insight");
      })
      .catch(() => setInsightError("Gemini insight unavailable — check API key"))
      .finally(() => setInsightLoading(false));
  }, [predictions]);

  const handleTrain = async () => {
    await trainModel(selectedFamily, selectedModel);
  };

  const handlePredict = async () => {
    setInsightText(null);
    setInsightError(null);
    await getPredictions(selectedFamily, selectedModel, horizon);
  };

  const chartData = useMemo(() => {
    if (!predictions || !predictions.length) return [];
    return predictions.map((p: any) => ({
      date: p.date,
      predicted: Math.round(p.forecast ?? p.predicted ?? 0),
      lower: Math.round((p.forecast ?? p.predicted ?? 0) * 0.85),
      upper: Math.round((p.forecast ?? p.predicted ?? 0) * 1.15),
    }));
  }, [predictions]);

  const summary = useMemo(() => {
    if (!chartData.length)
      return { total: 0, avg: 0, minDay: { date: "", predicted: 0 }, maxDay: { date: "", predicted: 0 } };
    const total = chartData.reduce((a: number, r: any) => a + r.predicted, 0);
    const avg = total / chartData.length;
    const minDay = chartData.reduce((best: any, r: any) => (r.predicted < best.predicted ? r : best), chartData[0]);
    const maxDay = chartData.reduce((best: any, r: any) => (r.predicted > best.predicted ? r : best), chartData[0]);
    return { total, avg, minDay, maxDay };
  }, [chartData]);

  function fmtShort(iso: string) {
    try {
      return new Date(iso).toLocaleDateString(undefined, { day: "2-digit", month: "short" });
    } catch { return iso; }
  }

  if (pageLoading) return <LoadingSpinner message="Loading forecast page..." />;

  return (
    <div className="pg-page">
      <div className="pg-container">

        {/* Header */}
        <div className="pg-header">
          <div className="pg-header-left">
            <h1 className="pg-title">Demand Forecast</h1>
            <p className="pg-subtitle">Train ML models and get real sales predictions from the backend.</p>
          </div>
          <div className="pg-horizon-btns">
            {([7, 14, 30] as Horizon[]).map((h) => (
              <button
                key={h}
                type="button"
                className={`pg-horizon-btn ${horizon === h ? "active" : ""}`}
                onClick={() => setHorizon(h)}
              >
                {h} Days
              </button>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="pg-card">
          <div className="pg-card-header">
            <div>
              <p className="pg-card-title">Model Configuration</p>
              <p className="pg-card-sub">Select product family and model, then train</p>
            </div>
          </div>
          <div className="pg-filter-bar">
            <div className="pg-field">
              <label className="pg-label">Product Family</label>
              <select
                className="pg-select"
                value={selectedFamily}
                onChange={(e) => setSelectedFamily(e.target.value)}
                style={{ minWidth: 200 }}
              >
                {productFamilies.map((f) => (
                  <option key={f} value={f}>{getDisplayName(f)}</option>
                ))}
              </select>
            </div>
            <div className="pg-field">
              <label className="pg-label">Model Type</label>
              <select
                className="pg-select"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value as ModelType)}
                style={{ minWidth: 160 }}
              >
                <option value="prophet">Prophet (Recommended)</option>
                <option value="arima">ARIMA</option>
                <option value="lstm">LSTM (Slow)</option>
              </select>
            </div>
            <div className="pg-field" style={{ justifyContent: "flex-end" }}>
              <label className="pg-label" style={{ visibility: "hidden" }}>Action</label>
              <div style={{ display: "flex", gap: "0.625rem" }}>
                <button
                  type="button"
                  className="pg-btn pg-btn-primary"
                  onClick={handleTrain}
                  disabled={training}
                >
                  {training ? "Training..." : "Train Model"}
                </button>
                {trained && (
                  <button
                    type="button"
                    className="pg-btn pg-btn-success"
                    onClick={handlePredict}
                    disabled={predicting}
                  >
                    {predicting ? "Predicting..." : `Predict ${horizon} Days`}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {error && <ErrorBanner message={error} />}

        {/* Training spinner */}
        {training && <LoadingSpinner message={`Training ${selectedModel.toUpperCase()} model on ${getDisplayName(selectedFamily)}...`} />}
        {predicting && <LoadingSpinner message="Generating predictions..." />}

        {/* Empty state */}
        {!trained && !training && (
          <div className="pg-card">
            <p className="pg-empty">
              Select a product family and model type, then click <b>Train Model</b> to generate forecasts.
            </p>
          </div>
        )}

        {/* Metrics after training */}
        {trained && metrics && (
          <div className="pg-kpi-grid">
            <div className="pg-kpi">
              <p className="pg-kpi-label">Model</p>
              <p className="pg-kpi-value" style={{ fontSize: "1rem" }}>{selectedModel.toUpperCase()}</p>
              <p className="pg-kpi-sub">{getDisplayName(selectedFamily)}</p>
            </div>
            {metrics.mae != null && (
              <div className="pg-kpi">
                <p className="pg-kpi-label">MAE</p>
                <p className="pg-kpi-value">{metrics.mae.toFixed(2)}</p>
                <p className="pg-kpi-sub">Mean Absolute Error</p>
              </div>
            )}
            {metrics.rmse != null && (
              <div className="pg-kpi">
                <p className="pg-kpi-label">RMSE</p>
                <p className="pg-kpi-value">{metrics.rmse.toFixed(2)}</p>
                <p className="pg-kpi-sub">Root Mean Sq Error</p>
              </div>
            )}
            {metrics.mape != null && (
              <div className="pg-kpi">
                <p className="pg-kpi-label">MAPE</p>
                <p className="pg-kpi-value">{(metrics.mape * 100).toFixed(1)}%</p>
                <p className="pg-kpi-sub">Mean Abs % Error</p>
              </div>
            )}
          </div>
        )}

        {/* Forecast chart + summary */}
        {chartData.length > 0 && !predicting && (
          <>
            {/* Summary KPIs */}
            <div className="pg-kpi-grid">
              <div className="pg-kpi">
                <p className="pg-kpi-label">Total Predicted</p>
                <p className="pg-kpi-value">{summary.total.toLocaleString()}</p>
                <p className="pg-kpi-sub">Next {horizon} days</p>
              </div>
              <div className="pg-kpi">
                <p className="pg-kpi-label">Avg Daily Demand</p>
                <p className="pg-kpi-value">{summary.avg.toFixed(1)}</p>
                <p className="pg-kpi-sub">Units / day</p>
              </div>
              <div className="pg-kpi">
                <p className="pg-kpi-label">Peak Day</p>
                <p className="pg-kpi-value" style={{ fontSize: "0.9375rem" }}>
                  {fmtShort(summary.maxDay.date)} · {summary.maxDay.predicted}
                </p>
                <p className="pg-kpi-sub">Highest predicted units</p>
              </div>
              <div className="pg-kpi">
                <p className="pg-kpi-label">Low Day</p>
                <p className="pg-kpi-value" style={{ fontSize: "0.9375rem" }}>
                  {fmtShort(summary.minDay.date)} · {summary.minDay.predicted}
                </p>
                <p className="pg-kpi-sub">Lowest predicted units</p>
              </div>
            </div>

            {/* Chart */}
            <div className="pg-card">
              <div className="pg-card-header">
                <div>
                  <p className="pg-card-title">Forecast Trend</p>
                  <p className="pg-card-sub">{getDisplayName(selectedFamily)} — {selectedModel.toUpperCase()} model</p>
                </div>
              </div>
              <div className="pg-chart-area-lg">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" tickFormatter={fmtShort} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <Tooltip
                      formatter={(value: any, name: any) => [Math.round(value), name]}
                      labelFormatter={(label) => `Date: ${label}`}
                      contentStyle={{ borderRadius: "0.75rem", border: "1px solid #e2e8f0", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="upper" stroke="none" fillOpacity={0.08} fill="#4f46e5" name="Upper Band" />
                    <Area type="monotone" dataKey="lower" stroke="none" fillOpacity={0.08} fill="#4f46e5" name="Lower Band" />
                    <Area
                      type="monotone"
                      dataKey="predicted"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#forecastGrad)"
                      stroke="#6366f1"
                      name="Predicted"
                      dot={false}
                      activeDot={{ r: 5, fill: "#6366f1", stroke: "white", strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="pg-pill-strip">
                <span className="pg-pill">Lowest: {fmtShort(summary.minDay.date)} ({summary.minDay.predicted})</span>
                <span className="pg-pill">Highest: {fmtShort(summary.maxDay.date)} ({summary.maxDay.predicted})</span>
              </div>
            </div>

            {/* Gemini Insight */}
            {(insightLoading || insightText || insightError) && (
              <div className="pg-ai-card">
                <div className="pg-ai-card-head">
                  <span className="pg-ai-badge">AI INSIGHT</span>
                  <span className="pg-ai-title">Gemini Analysis</span>
                </div>
                {insightLoading && <p className="pg-ai-generating"><span className="pg-spin">⟳</span> Generating insight...</p>}
                {insightError && <div className="pg-banner pg-banner-error" style={{ marginTop: "0.5rem" }}>{insightError}</div>}
                {insightText && <p className="pg-ai-text">{insightText}</p>}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
