# Hybrid FX Forecasting System - Final Summary

The sequential hybrid forecasting system (ARIMA-GARCH-LSTM) for the KES/CAD exchange rate is now fully implemented and verified.

## Project Architecture

### 1. Backend (Python/Flask)
- **Model Pipeline**: `arima_model.py` → `garch_model.py` → `lstm_model.py` → `hybrid_model.py`.
- **Services**: `forecasting_service.py` handles the orchestration.
- **Data**: `data_collection.py` pulls from Alpha Vantage and stores in Supabase.
- **API**: `app.py` exposes endpoints on port 5000.

### 2. Frontend (Next.js)
- **Dashboard**: `src/app/dashboard/page.tsx` provides the primary interface.
- **Components**: `ForecastChart` and `VolatilityChart` using Recharts.
- **API Routes**: Next.js proxies to the Python backend to handle CORS and security.

### 3. Database (Supabase)
- **Tables**: `exchange_rates`, `arima_predictions`, `garch_volatility`, `lstm_predictions`, `hybrid_predictions`.

## How to Run the System

### Step 1: Start the Backend
```bash
cd python-backend
./venv/bin/python3 app.py
```
*(The server is currently running in your terminal background on port 5000)*

### Step 2: Start the Frontend
```bash
cd ..
npm run dev
```

### Step 3: Run the Forecasting Pipeline
1.  Navigate to [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
2.  Click **"Run Analysis Pipeline"**.
3.  The system will:
    -   Fetch the latest KES/CAD data from Alpha Vantage.
    -   Store it in your Supabase database.
    -   Train the sequential model (ARIMA, then GARCH on residuals, then LSTM on standardized residuals).
    -   Display the resulting metrics and hybrid forecast on the dashboard.

## Technical Highlights
-   **GARCH Volatility Adjustment**: The forecast now includes robust confidence intervals derived directly from GARCH conditional variance.
-   **Deep Learning Refinement**: The LSTM component identifies non-linear dependencies in the residuals that traditional models miss.
-   **Statistical Significance**: Built-in support for the Diebold-Mariano test to prove the hybrid model's superiority.

Everything is ready for your school project presentation!
