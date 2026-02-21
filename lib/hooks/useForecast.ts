import { useState } from 'react';
import { apiClient } from '../api-client';

interface ForecastHook {
  training: boolean;
  predicting: boolean;
  trained: boolean;
  metrics: any;
  predictions: any[];
  error: string | null;
  trainModel: (productFamily: string, modelType: 'arima' | 'prophet' | 'lstm') => Promise<void>;
  getPredictions: (productFamily: string, modelType: 'arima' | 'prophet' | 'lstm', steps?: number) => Promise<void>;
}

export function useForecast(): ForecastHook {
  const [training, setTraining] = useState(false);
  const [predicting, setPredicting] = useState(false);
  const [trained, setTrained] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const trainModel = async (productFamily: string, modelType: 'arima' | 'prophet' | 'lstm') => {
    try {
      setTraining(true);
      setError(null);
      setTrained(false);

      const response = await apiClient.trainModel({
        product_family: productFamily,
        model_type: modelType,
      });

      if (response.success) {
        setTrained(true);
        setMetrics(response.metrics);
      } else {
        throw new Error(response.error || 'Training failed');
      }
    } catch (err: any) {
      console.error('Error training model:', err);
      setError(err.message || 'Failed to train model');
    } finally {
      setTraining(false);
    }
  };

  const getPredictions = async (
    productFamily: string,
    modelType: 'arima' | 'prophet' | 'lstm',
    steps: number = 7
  ) => {
    try {
      setPredicting(true);
      setError(null);

      const response = await apiClient.getPredictions({
        product_family: productFamily,
        model_type: modelType,
        steps,
      });

      if (response.success) {
        setPredictions(response.forecast);
      } else {
        throw new Error(response.error || 'Prediction failed');
      }
    } catch (err: any) {
      console.error('Error getting predictions:', err);
      setError(err.message || 'Failed to get predictions');
    } finally {
      setPredicting(false);
    }
  };

  return {
    training,
    predicting,
    trained,
    metrics,
    predictions,
    error,
    trainModel,
    getPredictions,
  };
}

export default useForecast;
