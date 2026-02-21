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

  // Fetch product families on mount
  useEffect(() => {
    apiClient
      .getProducts()
      .then((resp) => {
        if (resp.products) setProductFamilies(resp.products);
      })
      .catch(console.error)
      .finally(() => setPageLoading(false));
  }, []);

  // When trained and horizon changes, fetch new predictions
  useEffect(() => {
    if (trained) {
      getPredictions(selectedFamily, selectedModel, horizon);
    }
  }, [horizon]);

  const handleTrain = async () => {
    await trainModel(selectedFamily, selectedModel);
  };

  const handlePredict = async () => {
    await getPredictions(selectedFamily, selectedModel, horizon);
  };

  // Transform predictions for chart
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
    } catch {
      return iso;
    }
  }

  if (pageLoading) return <LoadingSpinner message="Loading forecast page..." />;

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a" }}>Demand Forecast</h1>
          <p style={{ marginTop: 6, color: "#94a3b8", fontWeight: 500, fontSize: 14 }}>
            Train ML models and get real sales predictions from the backend.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <HorizonButton active={horizon === 7} onClick={() => setHorizon(7)} label="7 Days" />
          <HorizonButton active={horizon === 14} onClick={() => setHorizon(14)} label="14 Days" />
          <HorizonButton active={horizon === 30} onClick={() => setHorizon(30)} label="30 Days" />
        </div>
      </div>

      {/* Controls */}
      <div
        style={{
          marginTop: 16,
          background: "white",
          borderRadius: 12,
          padding: 20,
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          display: "flex",
          gap: 16,
          alignItems: "end",
          flexWrap: "wrap",
        }}
      >
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "#64748b", marginBottom: 6 }}>
            Product Family
          </label>
          <select
            value={selectedFamily}
            onChange={(e) => setSelectedFamily(e.target.value)}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #e2e8f0",
              fontWeight: 700,
              minWidth: 200,
            }}
          >
            {productFamilies.map((f) => (
              <option key={f} value={f}>
                {getDisplayName(f)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "#64748b", marginBottom: 6 }}>
            Model Type
          </label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value as ModelType)}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #e2e8f0",
              fontWeight: 700,
              minWidth: 160,
            }}
          >
            <option value="prophet">Prophet (Recommended)</option>
            <option value="arima">ARIMA</option>
            <option value="lstm">LSTM (Slow)</option>
          </select>
        </div>

        <button
          onClick={handleTrain}
          disabled={training}
          type="button"
          style={{
            padding: "10px 24px",
            borderRadius: 10,
            border: "none",
            background: training ? "#94a3b8" : "#4f46e5",
            color: "white",
            fontWeight: 800,
            cursor: training ? "wait" : "pointer",
          }}
        >
          {training ? "Training..." : "Train Model"}
        </button>

        {trained && (
          <button
            onClick={handlePredict}
            disabled={predicting}
            type="button"
            style={{
              padding: "10px 24px",
              borderRadius: 10,
              border: "none",
              background: predicting ? "#94a3b8" : "#059669",
              color: "white",
              fontWeight: 800,
              cursor: predicting ? "wait" : "pointer",
            }}
          >
            {predicting ? "Predicting..." : `Predict ${horizon} Days`}
          </button>
        )}
      </div>

      {error && <ErrorBanner message={error} />}

      {/* Metrics after training */}
      {trained && metrics && (
        <div
          style={{
            marginTop: 16,
            display: "grid",
            gap: 20,
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          }}
        >
          <KPI title="Model" value={selectedModel.toUpperCase()} subtitle={getDisplayName(selectedFamily)} />
          {metrics.mae != null && <KPI title="MAE" value={metrics.mae.toFixed(2)} subtitle="Mean Absolute Error" />}
          {metrics.rmse != null && <KPI title="RMSE" value={metrics.rmse.toFixed(2)} subtitle="Root Mean Sq Error" />}
          {metrics.mape != null && <KPI title="MAPE" value={`${(metrics.mape * 100).toFixed(1)}%`} subtitle="Mean Abs % Error" />}
        </div>
      )}

      {/* Chart or empty state */}
      {!trained && !training && (
        <div
          style={{
            marginTop: 16,
            background: "white",
            borderRadius: 12,
            padding: 32,
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            color: "#64748b",
            fontWeight: 800,
            textAlign: "center",
          }}
        >
          Select a product family and model type, then click "Train Model" to generate forecasts.
        </div>
      )}

      {training && <LoadingSpinner message={`Training ${selectedModel.toUpperCase()} model on ${getDisplayName(selectedFamily)}...`} />}

      {predicting && <LoadingSpinner message="Generating predictions..." />}

      {chartData.length > 0 && !predicting && (
        <>
          {/* Summary Cards */}
          <div
            style={{
              marginTop: 16,
              display: "grid",
              gap: 20,
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            }}
          >
            <KPI title="Total Predicted Units" value={`${summary.total}`} subtitle={`Next ${horizon} days`} />
            <KPI title="Avg Daily Demand" value={`${summary.avg.toFixed(1)}`} subtitle="Units/day" />
            <KPI
              title="Peak Day"
              value={`${fmtShort(summary.maxDay.date)} - ${summary.maxDay.predicted}`}
              subtitle="Highest predicted units"
            />
            <KPI
              title="Low Day"
              value={`${fmtShort(summary.minDay.date)} - ${summary.minDay.predicted}`}
              subtitle="Lowest predicted units"
            />
          </div>

          {/* Chart */}
          <Card title="Forecast Trend" subtitle={`${getDisplayName(selectedFamily)} — ${selectedModel.toUpperCase()} model`}>
            <div style={{ height: 360 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={fmtShort} />
                  <YAxis />
                  <Tooltip
                    formatter={(value: any, name: any) => [Math.round(value), name]}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="upper" stroke="none" fillOpacity={0.1} fill="#4f46e5" name="Upper Band" />
                  <Area type="monotone" dataKey="lower" stroke="none" fillOpacity={0.1} fill="#4f46e5" name="Lower Band" />
                  <Area type="monotone" dataKey="predicted" strokeWidth={3} fillOpacity={0.25} fill="#4f46e5" stroke="#4f46e5" name="Predicted" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Pill text={`Lowest: ${fmtShort(summary.minDay.date)} (${summary.minDay.predicted})`} />
              <Pill text={`Highest: ${fmtShort(summary.maxDay.date)} (${summary.maxDay.predicted})`} />
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

function HorizonButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        borderRadius: 999,
        border: active ? "1px solid #4f46e5" : "1px solid #e2e8f0",
        background: active ? "#4f46e5" : "white",
        color: active ? "white" : "#0f172a",
        padding: "10px 12px",
        fontWeight: 800,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}

function KPI({ title, value, subtitle }: { title: string; value: string; subtitle: string }) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: 12,
        padding: 16,
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      <div style={{ color: "#64748b", fontWeight: 800, fontSize: 12, textTransform: "uppercase" }}>
        {title}
      </div>
      <div style={{ marginTop: 10, fontSize: 22, fontWeight: 800, color: "#0f172a" }}>{value}</div>
      <div style={{ marginTop: 6, color: "#64748b", fontWeight: 700, fontSize: 12 }}>{subtitle}</div>
    </div>
  );
}

function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        marginTop: 16,
        background: "white",
        borderRadius: 12,
        padding: 16,
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      <div>
        <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>{title}</div>
        <div style={{ marginTop: 4, fontSize: 12, fontWeight: 700, color: "#64748b" }}>{subtitle}</div>
      </div>
      <div style={{ marginTop: 12 }}>{children}</div>
    </div>
  );
}

function Pill({ text }: { text: string }) {
  return (
    <span
      style={{
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
        padding: "8px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 800,
        color: "#0f172a",
      }}
    >
      {text}
    </span>
  );
}
