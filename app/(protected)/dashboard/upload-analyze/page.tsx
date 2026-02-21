"use client";

import React, { useMemo, useState, useRef, useCallback } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useUploadAnalyze } from "@/lib/hooks/useUploadAnalyze";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import ErrorBanner from "@/app/components/ErrorBanner";

type Horizon = 7 | 14 | 30;

const STEPS = [
  { key: "upload", label: "Upload" },
  { key: "preview", label: "Preview & Map" },
  { key: "configure", label: "Configure" },
  { key: "results", label: "Results" },
] as const;

const MODEL_OPTIONS = [
  { value: "prophet" as const, label: "Prophet", desc: "Best for data with strong seasonal patterns. Fast training." },
  { value: "arima" as const, label: "ARIMA", desc: "Classic statistical model. Good for stable trends." },
  { value: "lstm" as const, label: "LSTM", desc: "Deep learning model. Needs more data (80+ rows). Slower training." },
];

export default function UploadAnalyzePage() {
  const ua = useUploadAnalyze();
  const [horizon, setHorizon] = useState<Horizon>(7);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (!["csv", "xlsx", "xls"].includes(ext || "")) {
        return;
      }
      ua.uploadFile(file);
    },
    [ua]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    },
    [handleFile]
  );

  const chartData = useMemo(() => {
    const hist: any[] = ua.historical.map((r: any) => ({
      date: r.date,
      actual: Math.round(r.sales ?? 0),
    }));
    const fcast = ua.forecast.map((r: any) => ({
      date: r.date,
      forecast: Math.round(r.forecast ?? 0),
      lower: r.lower_bound != null ? Math.round(r.lower_bound) : undefined,
      upper: r.upper_bound != null ? Math.round(r.upper_bound) : undefined,
    }));

    // Bridge point: last historical value also gets a forecast value
    // so the two lines connect seamlessly
    if (hist.length > 0 && fcast.length > 0) {
      hist[hist.length - 1].forecast = hist[hist.length - 1].actual;
    }

    return [...hist, ...fcast];
  }, [ua.historical, ua.forecast]);

  const forecastSummary = useMemo(() => {
    if (!ua.forecast.length)
      return { total: 0, avg: 0, minDay: { date: "", forecast: 0 }, maxDay: { date: "", forecast: 0 } };

    const mapped = ua.forecast.map((r: any) => ({
      date: r.date,
      forecast: Math.round(r.forecast ?? 0),
    }));
    const total = mapped.reduce((a, r) => a + r.forecast, 0);
    const avg = total / mapped.length;
    const minDay = mapped.reduce((best, r) => (r.forecast < best.forecast ? r : best), mapped[0]);
    const maxDay = mapped.reduce((best, r) => (r.forecast > best.forecast ? r : best), mapped[0]);
    return { total, avg, minDay, maxDay };
  }, [ua.forecast]);

  function fmtShort(iso: string) {
    try {
      return new Date(iso).toLocaleDateString(undefined, { day: "2-digit", month: "short" });
    } catch {
      return iso;
    }
  }

  const stepIdx = STEPS.findIndex((s) => s.key === ua.step);

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a" }}>Upload & Analyze</h1>
        <p style={{ marginTop: 6, color: "#94a3b8", fontWeight: 500, fontSize: 14 }}>
          Upload your own CSV or Excel file, map columns, and get AI-powered predictions.
        </p>
      </div>

      {/* Step Indicator */}
      <div
        style={{
          marginTop: 20,
          display: "flex",
          alignItems: "center",
          gap: 0,
          justifyContent: "center",
        }}
      >
        {STEPS.map((s, i) => (
          <React.Fragment key={s.key}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 80 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: 13,
                  background: i <= stepIdx ? "#4f46e5" : "#e2e8f0",
                  color: i <= stepIdx ? "white" : "#94a3b8",
                  transition: "all 0.2s",
                }}
              >
                {i + 1}
              </div>
              <span
                style={{
                  marginTop: 6,
                  fontSize: 11,
                  fontWeight: 800,
                  color: i <= stepIdx ? "#4f46e5" : "#94a3b8",
                }}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: 2,
                  background: i < stepIdx ? "#4f46e5" : "#e2e8f0",
                  marginBottom: 20,
                  minWidth: 40,
                  maxWidth: 120,
                  transition: "all 0.2s",
                }}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Error */}
      {ua.error && (
        <div style={{ marginTop: 16 }}>
          <ErrorBanner message={ua.error} />
        </div>
      )}

      {/* ==================== Step 1: Upload ==================== */}
      {ua.step === "upload" && (
        <div>
          {ua.uploading ? (
            <div style={{ marginTop: 32 }}>
              <LoadingSpinner message="Parsing your file..." />
            </div>
          ) : (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                marginTop: 24,
                padding: 64,
                border: `2px dashed ${dragOver ? "#4f46e5" : "#e2e8f0"}`,
                borderRadius: 12,
                background: dragOver ? "#eef2ff" : "white",
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.2s",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              }}
            >
              <div style={{ fontSize: 48 }}>&#128193;</div>
              <p style={{ marginTop: 12, fontSize: 16, fontWeight: 800, color: "#0f172a" }}>
                Drag & drop your file here
              </p>
              <p style={{ marginTop: 8, color: "#64748b", fontWeight: 600 }}>or click to browse</p>
              <p style={{ marginTop: 12, fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>
                Supported formats: CSV, XLSX, XLS
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                style={{ display: "none" }}
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFile(e.target.files[0]);
                  e.target.value = "";
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* ==================== Step 2: Preview & Map ==================== */}
      {ua.step === "preview" && (
        <div>
          {/* File Summary */}
          <div
            style={{
              marginTop: 16,
              display: "grid",
              gap: 20,
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            }}
          >
            <KPI title="File" value={ua.filename || "Unknown"} subtitle="Uploaded file" />
            <KPI title="Rows" value={`${ua.totalRows}`} subtitle="Total data rows" />
            <KPI title="Columns" value={`${ua.columns.length}`} subtitle="Total columns" />
            <KPI
              title="Date Cols Found"
              value={`${ua.columnInfo?.date_columns.length ?? 0}`}
              subtitle="Auto-detected"
            />
          </div>

          {/* Data Preview Table */}
          <div
            style={{
              marginTop: 16,
              background: "white",
              borderRadius: 12,
              padding: 16,
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              overflowX: "auto",
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", marginBottom: 12 }}>
              Data Preview (first 20 rows)
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr>
                  {ua.columns.map((col) => (
                    <th
                      key={col}
                      style={{
                        padding: "10px 12px",
                        textAlign: "left",
                        fontWeight: 800,
                        color: "#64748b",
                        fontSize: 11,
                        textTransform: "uppercase",
                        borderBottom: "2px solid #e2e8f0",
                        whiteSpace: "nowrap",
                        background:
                          col === ua.dateColumn
                            ? "#eef2ff"
                            : col === ua.targetColumn
                            ? "#ecfdf5"
                            : undefined,
                      }}
                    >
                      {col}
                      {col === ua.dateColumn && (
                        <span style={{ marginLeft: 6, color: "#4f46e5", fontSize: 10 }}>(DATE)</span>
                      )}
                      {col === ua.targetColumn && (
                        <span style={{ marginLeft: 6, color: "#059669", fontSize: 10 }}>(TARGET)</span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ua.preview.map((row, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    {ua.columns.map((col) => (
                      <td
                        key={col}
                        style={{
                          padding: "8px 12px",
                          fontWeight: 600,
                          color: "#0f172a",
                          whiteSpace: "nowrap",
                          background:
                            col === ua.dateColumn
                              ? "#f8faff"
                              : col === ua.targetColumn
                              ? "#f8fdf9"
                              : undefined,
                        }}
                      >
                        {String(row[col] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Column Mapping */}
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
              <label
                style={{ display: "block", fontSize: 12, fontWeight: 800, color: "#64748b", marginBottom: 6 }}
              >
                Date Column
              </label>
              <select
                value={ua.dateColumn}
                onChange={(e) => ua.setDateColumn(e.target.value)}
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1px solid #e2e8f0",
                  fontWeight: 700,
                  minWidth: 200,
                }}
              >
                <option value="">-- Select --</option>
                {(ua.columnInfo?.date_columns ?? []).map((col) => (
                  <option key={col} value={col}>
                    {col} (auto-detected)
                  </option>
                ))}
                {ua.columns
                  .filter((c) => !(ua.columnInfo?.date_columns ?? []).includes(c))
                  .map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label
                style={{ display: "block", fontSize: 12, fontWeight: 800, color: "#64748b", marginBottom: 6 }}
              >
                Target Column (numeric)
              </label>
              <select
                value={ua.targetColumn}
                onChange={(e) => ua.setTargetColumn(e.target.value)}
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1px solid #e2e8f0",
                  fontWeight: 700,
                  minWidth: 200,
                }}
              >
                <option value="">-- Select --</option>
                {(ua.columnInfo?.numeric_columns ?? []).map((col) => (
                  <option key={col} value={col}>
                    {col} {col === ua.columnInfo?.suggested_target ? "(suggested)" : ""}
                  </option>
                ))}
                {ua.columns
                  .filter((c) => !(ua.columnInfo?.numeric_columns ?? []).includes(c))
                  .map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
              </select>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                onClick={() => ua.goToStep("upload")}
                style={{
                  padding: "10px 24px",
                  borderRadius: 10,
                  border: "1px solid #e2e8f0",
                  background: "white",
                  color: "#0f172a",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => ua.goToStep("configure")}
                disabled={!ua.dateColumn || !ua.targetColumn}
                style={{
                  padding: "10px 24px",
                  borderRadius: 10,
                  border: "none",
                  background: !ua.dateColumn || !ua.targetColumn ? "#94a3b8" : "#4f46e5",
                  color: "white",
                  fontWeight: 800,
                  cursor: !ua.dateColumn || !ua.targetColumn ? "not-allowed" : "pointer",
                }}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== Step 3: Configure & Train ==================== */}
      {ua.step === "configure" && (
        <div>
          {/* Mapping Summary */}
          <div
            style={{
              marginTop: 16,
              display: "grid",
              gap: 20,
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            }}
          >
            <KPI title="Date Column" value={ua.dateColumn} subtitle="Time series index" />
            <KPI title="Target Column" value={ua.targetColumn} subtitle="Values to forecast" />
            <KPI title="Rows" value={`${ua.totalRows}`} subtitle="Total data points" />
            <KPI title="File" value={ua.filename || ""} subtitle="Source file" />
          </div>

          {/* Model Selection */}
          <div
            style={{
              marginTop: 16,
              background: "white",
              borderRadius: 12,
              padding: 20,
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", marginBottom: 16 }}>
              Select Model
            </div>
            <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
              {MODEL_OPTIONS.map((m) => {
                const isSelected = ua.selectedModel === m.value;
                const lstmWarn = m.value === "lstm" && ua.totalRows < 80;
                return (
                  <div
                    key={m.value}
                    onClick={() => ua.setSelectedModel(m.value)}
                    style={{
                      padding: 16,
                      borderRadius: 12,
                      border: isSelected ? "2px solid #4f46e5" : "2px solid #e2e8f0",
                      background: isSelected ? "#eef2ff" : "white",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    <div style={{ fontWeight: 800, fontSize: 15, color: "#0f172a" }}>{m.label}</div>
                    <div style={{ marginTop: 6, fontSize: 12, fontWeight: 600, color: "#64748b" }}>
                      {m.desc}
                    </div>
                    {lstmWarn && (
                      <div
                        style={{
                          marginTop: 8,
                          fontSize: 11,
                          fontWeight: 800,
                          color: "#dc2626",
                          background: "#fef2f2",
                          padding: "4px 8px",
                          borderRadius: 6,
                          display: "inline-block",
                        }}
                      >
                        Your data has {ua.totalRows} rows (needs 80+)
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
            <button
              type="button"
              onClick={() => ua.goToStep("preview")}
              style={{
                padding: "10px 24px",
                borderRadius: 10,
                border: "1px solid #e2e8f0",
                background: "white",
                color: "#0f172a",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => ua.trainModel()}
              disabled={ua.training}
              style={{
                padding: "10px 24px",
                borderRadius: 10,
                border: "none",
                background: ua.training ? "#94a3b8" : "#4f46e5",
                color: "white",
                fontWeight: 800,
                cursor: ua.training ? "wait" : "pointer",
              }}
            >
              {ua.training ? "Training..." : `Train ${ua.selectedModel.toUpperCase()} Model`}
            </button>
          </div>

          {ua.training && (
            <div style={{ marginTop: 16 }}>
              <LoadingSpinner
                message={`Training ${ua.selectedModel.toUpperCase()} model on your data...`}
              />
            </div>
          )}
        </div>
      )}

      {/* ==================== Step 4: Results ==================== */}
      {ua.step === "results" && (
        <div>
          {/* Metrics */}
          {ua.metrics && (
            <div
              style={{
                marginTop: 16,
                display: "grid",
                gap: 20,
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              }}
            >
              <KPI title="Model" value={ua.selectedModel.toUpperCase()} subtitle="Trained successfully" />
              {ua.metrics.MAE != null && (
                <KPI title="MAE" value={ua.metrics.MAE.toFixed(2)} subtitle="Mean Absolute Error" />
              )}
              {ua.metrics.RMSE != null && (
                <KPI title="RMSE" value={ua.metrics.RMSE.toFixed(2)} subtitle="Root Mean Sq Error" />
              )}
              {ua.metrics.MAPE != null && (
                <KPI
                  title="MAPE"
                  value={
                    ua.metrics.MAPE < 1
                      ? `${(ua.metrics.MAPE * 100).toFixed(1)}%`
                      : `${ua.metrics.MAPE.toFixed(1)}%`
                  }
                  subtitle="Mean Abs % Error"
                />
              )}
              {ua.trainInfo && (
                <KPI
                  title="Data Used"
                  value={`${ua.trainInfo.rows_used} rows`}
                  subtitle={
                    ua.trainInfo.aggregated
                      ? `Aggregated from ${ua.trainInfo.original_rows?.toLocaleString()} rows (grouped by date)`
                      : `Train: ${ua.trainInfo.train_rows} / Test: ${ua.trainInfo.test_rows}`
                  }
                />
              )}
            </div>
          )}

          {/* Horizon + Predict */}
          <div
            style={{
              marginTop: 16,
              background: "white",
              borderRadius: 12,
              padding: 20,
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              display: "flex",
              gap: 12,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontWeight: 800, fontSize: 13, color: "#64748b" }}>Forecast Horizon:</span>
            <HorizonButton active={horizon === 7} onClick={() => setHorizon(7)} label="7 Days" />
            <HorizonButton active={horizon === 14} onClick={() => setHorizon(14)} label="14 Days" />
            <HorizonButton active={horizon === 30} onClick={() => setHorizon(30)} label="30 Days" />

            <button
              type="button"
              onClick={() => ua.predict(horizon)}
              disabled={ua.predicting}
              style={{
                padding: "10px 24px",
                borderRadius: 10,
                border: "none",
                background: ua.predicting ? "#94a3b8" : "#059669",
                color: "white",
                fontWeight: 800,
                cursor: ua.predicting ? "wait" : "pointer",
                marginLeft: 8,
              }}
            >
              {ua.predicting ? "Predicting..." : `Get ${horizon}-Day Predictions`}
            </button>
          </div>

          {ua.predicting && (
            <div style={{ marginTop: 16 }}>
              <LoadingSpinner message="Generating predictions..." />
            </div>
          )}

          {/* Forecast Summary */}
          {ua.forecast.length > 0 && !ua.predicting && (
            <>
              <div
                style={{
                  marginTop: 16,
                  display: "grid",
                  gap: 20,
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                }}
              >
                <KPI
                  title="Total Predicted"
                  value={`${forecastSummary.total}`}
                  subtitle={`Next ${horizon} days`}
                />
                <KPI
                  title="Avg Daily"
                  value={`${forecastSummary.avg.toFixed(1)}`}
                  subtitle="Units/day"
                />
                <KPI
                  title="Peak Day"
                  value={`${fmtShort(forecastSummary.maxDay.date)} - ${forecastSummary.maxDay.forecast}`}
                  subtitle="Highest predicted"
                />
                <KPI
                  title="Low Day"
                  value={`${fmtShort(forecastSummary.minDay.date)} - ${forecastSummary.minDay.forecast}`}
                  subtitle="Lowest predicted"
                />
              </div>

              {/* Chart */}
              <Card
                title="Historical + Forecast"
                subtitle={`${ua.selectedModel.toUpperCase()} model - ${ua.filename}`}
              >
                <div style={{ height: 380 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tickFormatter={fmtShort} />
                      <YAxis />
                      <Tooltip
                        formatter={(value: any, name: any) => [
                          value != null ? Math.round(value) : "-",
                          name,
                        ]}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="upper"
                        stroke="none"
                        fillOpacity={0.08}
                        fill="#4f46e5"
                        name="Upper Band"
                      />
                      <Area
                        type="monotone"
                        dataKey="lower"
                        stroke="none"
                        fillOpacity={0.08}
                        fill="#4f46e5"
                        name="Lower Band"
                      />
                      <Line
                        type="monotone"
                        dataKey="actual"
                        strokeWidth={2}
                        stroke="#94a3b8"
                        dot={false}
                        name="Historical"
                      />
                      <Line
                        type="monotone"
                        dataKey="forecast"
                        strokeWidth={3}
                        stroke="#4f46e5"
                        dot={false}
                        name="Forecast"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>

                <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <Pill text={`Lowest: ${fmtShort(forecastSummary.minDay.date)} (${forecastSummary.minDay.forecast})`} />
                  <Pill text={`Highest: ${fmtShort(forecastSummary.maxDay.date)} (${forecastSummary.maxDay.forecast})`} />
                </div>
              </Card>
            </>
          )}

          {/* Start Over */}
          <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
            <button
              type="button"
              onClick={() => ua.goToStep("configure")}
              style={{
                padding: "10px 24px",
                borderRadius: 10,
                border: "1px solid #e2e8f0",
                background: "white",
                color: "#0f172a",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              Back to Configure
            </button>
            <button
              type="button"
              onClick={() => ua.reset()}
              style={{
                padding: "10px 24px",
                borderRadius: 10,
                border: "none",
                background: "#dc2626",
                color: "white",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              Start Over
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ==================== Helper Components ==================== */

function HorizonButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
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
      <div style={{ color: "#64748b", fontWeight: 800, fontSize: 12, textTransform: "uppercase" }}>{title}</div>
      <div
        style={{
          marginTop: 10,
          fontSize: 22,
          fontWeight: 800,
          color: "#0f172a",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </div>
      <div style={{ marginTop: 6, color: "#64748b", fontWeight: 700, fontSize: 12 }}>{subtitle}</div>
    </div>
  );
}

function Card({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
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
