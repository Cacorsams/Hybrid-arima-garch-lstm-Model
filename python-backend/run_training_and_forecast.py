import os
import sys
import pandas as pd
import numpy as np
from datetime import datetime
from dotenv import load_dotenv
from supabase import create_client, Client

# Add the current directory to sys.path to allow imports from services/models
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.forecasting_service import forecast_service

# Load environment variables
load_dotenv(dotenv_path='../.env.local')

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: Supabase credentials not found in .env.local")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def fetch_data_from_supabase():
    """Fetch all exchange rates from Supabase"""
    print("Fetching data from Supabase 'exchange_rates' table...")
    try:
        # Fetch all records sorted by date
        response = supabase.table("exchange_rates").select("*").order("date", desc=False).execute()
        data = response.data
        if not data:
            print("No data found in Supabase.")
            return None
        
        df = pd.DataFrame(data)
        df['date'] = pd.to_datetime(df['date'])
        print(f"✓ Fetched {len(df)} records.")
        return df
    except Exception as e:
        print(f"✗ Error fetching data: {e}")
        return None

def save_hybrid_prediction(forecast_result):
    """Save the hybrid forecast to Supabase"""
    print("Saving hybrid prediction to Supabase...")
    try:
        # Prepare the record
        # Note: In a real scenario, we'd forecast for the next business day.
        # For this demo, we'll label it as the next business day relative to the last data point.
        last_date = datetime.now() # or use df['date'].max() + offset
        
        prediction_record = {
            "forecast_date": datetime.now().strftime("%Y-%m-%d"),
            "arima_component": forecast_result['arima_component'],
            "garch_component": forecast_result['garch_volatility'], # Based on schema naming
            "lstm_component": forecast_result['lstm_component'],
            "combined_prediction": forecast_result['combined_prediction'],
            "confidence_lower": forecast_result['confidence_lower'],
            "confidence_upper": forecast_result['confidence_upper']
        }
        
        supabase.table("hybrid_predictions").insert(prediction_record).execute()
        print("✓ Prediction saved successfully.")
    except Exception as e:
        print(f"✗ Error saving prediction: {e}")

def main():
    # 1. Fetch data
    df = fetch_data_from_supabase()
    if df is None or len(df) < 100:
        print("Insufficient data for training. Need at least 100 records.")
        return

    # 2. Train models
    print("\nStarting model training...")
    try:
        forecast_service.train_models(df)
        print("✓ All models trained successfully.")
    except Exception as e:
        print(f"✗ Training failed: {e}")
        return

    # 3. Generate Forecast
    print("\nGenerating 1-step hybrid forecast...")
    try:
        forecast = forecast_service.get_hybrid_forecast(steps=1)
        print("\n" + "="*40)
        print("HYBRID FORECAST RESULTS")
        print("="*40)
        print(f"ARIMA Component:    {forecast['arima_component']:.6f}")
        print(f"GARCH Volatility:   {forecast['garch_volatility']:.6f}")
        print(f"LSTM Adjustment:    {forecast['lstm_component']:.6f}")
        print("-" * 40)
        print(f"COMBINED PREDICTION: {forecast['combined_prediction']:.6f}")
        print(f"95% Confidence Interval: [{forecast['confidence_lower']:.6f}, {forecast['confidence_upper']:.6f}]")
        print("="*40)
        
        # 4. Save result
        save_hybrid_prediction(forecast)
        
    except Exception as e:
        print(f"✗ Forecasting failed: {e}")

if __name__ == "__main__":
    main()
