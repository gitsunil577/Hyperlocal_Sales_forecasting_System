# Sales Forecasting Frontend (v2)

Complete Next.js dashboard with authentication, connected to Flask ML backend.

## Features

- 🔐 **Authentication** - Login/Register/Logout
- 📊 **Dashboard** - Sales analytics and visualizations
- 📈 **Forecasting** - ML-powered predictions (ARIMA, Prophet, LSTM)
- 📦 **Inventory** - Stock management and optimization
- 📑 **Reports** - Detailed analytics and insights
- 💬 **Chatbot** - AI assistant for queries
- 🎨 **Modern UI** - Tailwind CSS, Recharts, responsive design

  

## Connected to Backend

This frontend is now connected to the Flask backend API at `http://localhost:5000`.

### API Integration

- **API Client**: `lib/api-client.ts`
- **React Hooks**:
  - `lib/hooks/useSalesData.ts` - Fetch sales data
  - `lib/hooks/useForecast.ts` - Train models and get predictions

## Installation

```bash
cd frontend2

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### 1. Start Backend First

Make sure the Flask backend is running:

```bash
cd backend
python main.py
```

Backend should be running on `http://localhost:5000`

### 2. Start Frontend

```bash
cd frontend2
npm run dev
```

Frontend runs on `http://localhost:3000`

### 3. Use the Dashboard

1. **Login/Register** - Create an account or login
2. **Dashboard** - View sales analytics (will use real backend data)
3. **Forecast** - Train ML models and get predictions
4. **Inventory** - Get stock recommendations
5. **Reports** - View detailed analytics

## Connecting Dashboard to Backend

The dashboard currently uses mock data. To use real backend data:

### Option 1: Use the Hooks (Recommended)

```typescript
import { useSalesData } from '@/lib/hooks/useSalesData';
import { useForecast } from '@/lib/hooks/useForecast';

function MyComponent() {
  // Get sales data
  const { salesData, summary, loading, error } = useSalesData('BREAD/BAKERY');

  // Train and predict
  const { trainModel, getPredictions, predictions, metrics } = useForecast();

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {salesData && <p>Data loaded!</p>}
    </div>
  );
}
```

### Option 2: Direct API Calls

```typescript
import { apiClient } from '@/lib/api-client';

async function fetchData() {
  // Get summary
  const summary = await apiClient.getDataSummary();

  // Get sales data
  const sales = await apiClient.getSalesData({
    product_family: 'BREAD/BAKERY'
  });

  // Train model
  const trained = await apiClient.trainModel({
    product_family: 'BREAD/BAKERY',
    model_type: 'prophet'
  });

  // Get predictions
  const predictions = await apiClient.getPredictions({
    product_family: 'BREAD/BAKERY',
    model_type: 'prophet',
    steps: 7
  });
}
```

## Project Structure

```
frontend2/
├── app/
│   ├── (auth)/              # Authentication pages
│   │   ├── login/
│   │   └── register/
│   ├── (protected)/         # Protected routes
│   │   ├── dashboard/       # Main dashboard
│   │   ├── inventory/       # Inventory management
│   │   ├── predictions/     # Forecasting page
│   │   ├── reports/         # Analytics reports
│   │   └── admin/           # Admin panel
│   ├── components/          # Shared components
│   ├── page.tsx            # Landing page
│   └── layout.tsx          # Root layout
├── lib/
│   ├── api-client.ts       # Backend API client
│   ├── hooks/              # Custom React hooks
│   │   ├── useSalesData.ts
│   │   └── useForecast.ts
│   ├── auth-client.ts      # Auth utilities
│   └── auth-store.ts       # Auth state
├── public/                 # Static assets
├── .env.local             # Environment variables
└── package.json
```

## Environment Variables

Create `.env.local` in the root:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

For production deployment, update this to your deployed backend URL.

## Available Pages

- `/` - Landing page
- `/login` - Login page
- `/register` - Register page
- `/dashboard` - Main dashboard (protected)
- `/dashboard/forecast` - Forecasting (protected)
- `/dashboard/analytics` - Analytics (protected)
- `/inventory` - Inventory management (protected)
- `/predictions` - Predictions page (protected)
- `/reports` - Reports page (protected)
- `/admin` - Admin panel (protected)

## Next Steps

1. **Update Dashboard** - Replace mock data in `salesdashboard.tsx` with real API calls
2. **Update Forecast Page** - Connect to ML models API
3. **Update Inventory** - Use inventory recommendations API
4. **Add Loading States** - Show loading spinners while fetching
5. **Error Handling** - Display user-friendly error messages

## Deployment

### Frontend (Vercel - Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Backend

Deploy Flask backend separately (Heroku, Railway, Render, etc.)

Update `NEXT_PUBLIC_API_URL` to deployed backend URL.

## Tech Stack

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **Recharts** - Charts and visualizations
- **Lucide React** - Icons

## License

Academic project - NIST University (Project ID: 34232)
