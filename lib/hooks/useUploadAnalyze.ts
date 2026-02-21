import { useState } from 'react';
import { apiClient } from '../api-client';

type WizardStep = 'upload' | 'preview' | 'configure' | 'results';
type ModelType = 'arima' | 'prophet' | 'lstm';

interface ColumnInfo {
  date_columns: string[];
  numeric_columns: string[];
  suggested_date: string | null;
  suggested_target: string | null;
}

export interface UploadAnalyzeState {
  step: WizardStep;
  uploading: boolean;
  training: boolean;
  predicting: boolean;
  error: string | null;

  sessionId: string | null;
  filename: string | null;
  totalRows: number;
  columns: string[];
  columnInfo: ColumnInfo | null;
  preview: Record<string, any>[];

  dateColumn: string;
  targetColumn: string;
  setDateColumn: (col: string) => void;
  setTargetColumn: (col: string) => void;

  selectedModel: ModelType;
  setSelectedModel: (m: ModelType) => void;

  metrics: Record<string, number> | null;
  trainInfo: { rows_used: number; train_rows: number; test_rows: number; aggregated?: boolean; original_rows?: number } | null;

  forecast: any[];
  historical: any[];

  uploadFile: (file: File) => Promise<void>;
  goToStep: (step: WizardStep) => void;
  trainModel: () => Promise<void>;
  predict: (steps: number) => Promise<void>;
  reset: () => void;
}

export function useUploadAnalyze(): UploadAnalyzeState {
  const [step, setStep] = useState<WizardStep>('upload');
  const [uploading, setUploading] = useState(false);
  const [training, setTraining] = useState(false);
  const [predicting, setPredicting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [filename, setFilename] = useState<string | null>(null);
  const [totalRows, setTotalRows] = useState(0);
  const [columns, setColumns] = useState<string[]>([]);
  const [columnInfo, setColumnInfo] = useState<ColumnInfo | null>(null);
  const [preview, setPreview] = useState<Record<string, any>[]>([]);

  const [dateColumn, setDateColumn] = useState('');
  const [targetColumn, setTargetColumn] = useState('');
  const [selectedModel, setSelectedModel] = useState<ModelType>('prophet');

  const [metrics, setMetrics] = useState<Record<string, number> | null>(null);
  const [trainInfo, setTrainInfo] = useState<{ rows_used: number; train_rows: number; test_rows: number; aggregated?: boolean; original_rows?: number } | null>(null);
  const [forecast, setForecast] = useState<any[]>([]);
  const [historical, setHistorical] = useState<any[]>([]);

  const uploadFile = async (file: File) => {
    try {
      setUploading(true);
      setError(null);

      const resp = await apiClient.uploadAndParse(file);

      if (resp.success) {
        setSessionId(resp.session_id);
        setFilename(resp.filename);
        setTotalRows(resp.total_rows);
        setColumns(resp.columns);
        setColumnInfo(resp.column_info);
        setPreview(resp.preview);

        if (resp.column_info.suggested_date) setDateColumn(resp.column_info.suggested_date);
        if (resp.column_info.suggested_target) setTargetColumn(resp.column_info.suggested_target);

        setStep('preview');
      } else {
        throw new Error(resp.error || 'Upload failed');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const trainModel = async () => {
    if (!sessionId || !dateColumn || !targetColumn) return;
    try {
      setTraining(true);
      setError(null);

      const resp = await apiClient.trainOnUpload({
        session_id: sessionId,
        date_column: dateColumn,
        target_column: targetColumn,
        model_type: selectedModel,
      });

      if (resp.success) {
        setMetrics(resp.metrics);
        setTrainInfo({
          rows_used: resp.rows_used,
          train_rows: resp.train_rows,
          test_rows: resp.test_rows,
          aggregated: resp.aggregated,
          original_rows: resp.original_rows,
        });
        setStep('results');
      } else {
        throw new Error(resp.error || 'Training failed');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to train model');
    } finally {
      setTraining(false);
    }
  };

  const predict = async (steps: number) => {
    if (!sessionId) return;
    try {
      setPredicting(true);
      setError(null);

      const resp = await apiClient.predictOnUpload({
        session_id: sessionId,
        model_type: selectedModel,
        steps,
      });

      if (resp.success) {
        setForecast(resp.forecast);
        setHistorical(resp.historical || []);
      } else {
        throw new Error(resp.error || 'Prediction failed');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to get predictions');
    } finally {
      setPredicting(false);
    }
  };

  const goToStep = (s: WizardStep) => {
    setError(null);
    setStep(s);
  };

  const reset = () => {
    setStep('upload');
    setSessionId(null);
    setFilename(null);
    setTotalRows(0);
    setColumns([]);
    setColumnInfo(null);
    setPreview([]);
    setDateColumn('');
    setTargetColumn('');
    setSelectedModel('prophet');
    setMetrics(null);
    setTrainInfo(null);
    setForecast([]);
    setHistorical([]);
    setError(null);
  };

  return {
    step, uploading, training, predicting, error,
    sessionId, filename, totalRows, columns, columnInfo, preview,
    dateColumn, targetColumn, setDateColumn, setTargetColumn,
    selectedModel, setSelectedModel,
    metrics, trainInfo, forecast, historical,
    uploadFile, goToStep, trainModel, predict, reset,
  };
}

export default useUploadAnalyze;
