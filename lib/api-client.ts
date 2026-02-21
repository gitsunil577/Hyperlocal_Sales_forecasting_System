/**
 * API Client for Sales Forecasting Backend
 * Connects frontend2 to the Flask backend
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = API_URL;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Secret': process.env.NEXT_PUBLIC_INTERNAL_SECRET || '',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Health Check
  async healthCheck() {
    return this.request('/api/health');
  }

  // Products
  async getProducts() {
    return this.request('/api/products');
  }

  // Data Summary
  async getDataSummary() {
    return this.request('/api/data/summary');
  }

  // Models Status
  async getModelsStatus() {
    return this.request('/api/models/status');
  }

  // Sales Data
  async getSalesData(params: {
    product_family?: string;
    store_nbr?: number;
    start_date?: string;
    end_date?: string;
  }) {
    return this.request('/api/data/sales', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // Train Model
  async trainModel(params: {
    product_family?: string;
    model_type?: 'arima' | 'prophet' | 'lstm';
    store_nbr?: number;
  }) {
    return this.request('/api/forecast/train', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // Get Predictions
  async getPredictions(params: {
    product_family?: string;
    model_type?: 'arima' | 'prophet' | 'lstm';
    steps?: number;
    store_nbr?: number;
  }) {
    return this.request('/api/forecast/predict', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // Inventory Recommendations
  async getInventoryRecommendations(params: {
    product_family?: string;
    model_type?: 'arima' | 'prophet' | 'lstm';
    current_stock?: number;
    store_nbr?: number;
    lead_time?: number;
    service_level?: number;
  }) {
    return this.request('/api/inventory/recommendations', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // Weather
  async getCurrentWeather(city: string = 'Quito', country: string = 'EC') {
    return this.request(`/api/weather/current?city=${city}&country=${country}`);
  }

  async getWeatherForecast(city: string = 'Quito', country: string = 'EC', days: number = 7) {
    return this.request(`/api/weather/forecast?city=${city}&country=${country}&days=${days}`);
  }

  // Events
  async getHolidays(country: string = 'EC', year?: number) {
    const yearParam = year ? `&year=${year}` : '';
    return this.request(`/api/events/holidays?country=${country}${yearParam}`);
  }

  async getUpcomingHolidays(country: string = 'EC', days: number = 30) {
    return this.request(`/api/events/upcoming?country=${country}&days=${days}`);
  }

  // Upload & Analyze - Parse uploaded file
  async uploadAndParse(file: File) {
    // Reject files over 200MB
    if (file.size > 200 * 1024 * 1024) {
      throw new Error('File is too large (max 200MB). Try a smaller dataset.');
    }

    const formData = new FormData();
    formData.append('file', file);

    const url = `${this.baseURL}/api/upload/parse`;
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      headers: {
        'X-Internal-Secret': process.env.NEXT_PUBLIC_INTERNAL_SECRET || '',
      },
      signal: AbortSignal.timeout(300000), // 5 min timeout for large files
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`Server error (${response.status}). The file may be too large or in an unsupported format.`);
    }
    if (!response.ok) {
      throw new Error(data.error || `Upload failed with status ${response.status}`);
    }
    return data;
  }

  // Upload & Analyze - Train model on uploaded data
  async trainOnUpload(params: {
    session_id: string;
    date_column: string;
    target_column: string;
    model_type: 'arima' | 'prophet' | 'lstm';
  }) {
    return this.request('/api/upload/train', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // Upload & Analyze - Predict on uploaded data
  async predictOnUpload(params: {
    session_id: string;
    model_type: 'arima' | 'prophet' | 'lstm';
    steps: number;
  }) {
    return this.request('/api/upload/predict', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }
}

export const apiClient = new ApiClient();
export default apiClient;
