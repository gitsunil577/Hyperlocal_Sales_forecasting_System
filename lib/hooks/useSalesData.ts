import { useState, useEffect } from 'react';
import { apiClient } from '../api-client';

interface SalesDataHook {
  salesData: any[];
  summary: any;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useSalesData(productFamily: string = 'BREAD/BAKERY'): SalesDataHook {
  const [salesData, setSalesData] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get summary
      const summaryResponse = await apiClient.getDataSummary();
      if (summaryResponse.success) {
        setSummary(summaryResponse.data);
      }

      // Get sales data for specific product
      const salesResponse = await apiClient.getSalesData({
        product_family: productFamily,
      });

      if (salesResponse.success) {
        setSalesData(salesResponse.data);
      }
    } catch (err: any) {
      console.error('Error fetching sales data:', err);
      setError(err.message || 'Failed to fetch sales data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [productFamily]);

  return {
    salesData,
    summary,
    loading,
    error,
    refresh: fetchData,
  };
}

export default useSalesData;
