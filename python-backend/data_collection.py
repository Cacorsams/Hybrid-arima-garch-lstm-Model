# pyre-ignore-all-errors
# type: ignore
import pandas as pd
import numpy as np
from datetime import datetime
import requests
import json
from dotenv import load_dotenv
import os
from supabase import create_client, Client

load_dotenv(dotenv_path='../.env.local')

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
ALPHA_VANTAGE_API_KEY = os.getenv("ALPHAVANTAGE_API_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

class ForexDataCollector:
    """Collect and preprocess FX and macro data"""
    
    def __init__(self):
        self.fx_data = None
        self.macro_data = None
    
    def fetch_historical_rates(self, from_symbol="KES", to_symbol="CAD"):
        """Fetch historical rates from Alpha Vantage API"""
        url = f"https://www.alphavantage.co/query"
        params = {
            "function": "FX_DAILY",
            "from_symbol": from_symbol,
            "to_symbol": to_symbol,
            "outputsize": "full",
            "apikey": ALPHA_VANTAGE_API_KEY
        }
        
        try:
            response = requests.get(url, params=params, timeout=30)
            data = response.json()
            
            if "Time Series FX (Daily)" not in data:
                raise ValueError("Invalid API response")
            
            ts_data = data["Time Series FX (Daily)"]
            records = []
            
            for date_str, ohlc in ts_data.items():
                records.append({
                    "date": date_str,
                    "open": float(ohlc["1. open"]),
                    "high": float(ohlc["2. high"]),
                    "low": float(ohlc["3. low"]),
                    "close": float(ohlc["4. close"]),
                    "volume": 0
                })
            
            records = sorted(records, key=lambda x: x["date"])
            self.fx_data = pd.DataFrame(records)
            self.fx_data['date'] = pd.to_datetime(self.fx_data['date'])
            
            self.fx_data['log_return'] = np.log(
                self.fx_data['close'] / self.fx_data['close'].shift(1)
            )
            
            print(f"✓ Fetched {len(self.fx_data)} records from {self.fx_data['date'].min()} to {self.fx_data['date'].max()}")
            return self.fx_data
            
        except Exception as e:
            print(f"✗ Error fetching rates: {e}")
            return None
    
    def fetch_macro_indicators(self):
        """Fetch inflation rates (CPI) and interest rates"""
        macro_records = []
        try:
            url = "https://api.worldbank.org/v2/country/KEN/indicators/NY.GDP.DEFL.ZS"
            params = {"format": "json", "per_page": 100}
            response = requests.get(url, params=params)
            inflation_data = response.json()[1]
            
            for record in inflation_data:
                if record.get('value'):
                    year = record['date']
                    if year.isdigit():
                        macro_records.append({
                            "date": f"{year}-12-31",
                            "indicator_type": "inflation",
                            "value": float(record['value']),
                            "source": "World Bank"
                        })
        except Exception as e:
            print(f"⚠ Warning fetching inflation: {e}")
        
        self.macro_data = pd.DataFrame(macro_records)
        if len(macro_records) > 0:
            self.macro_data['date'] = pd.to_datetime(self.macro_data['date'])
            print(f"✓ Fetched {len(macro_records)} macro indicators")
        
        return self.macro_data
    
    def save_to_supabase(self):
        """Upload processed data to Supabase"""
        try:
            fx_data = self.fx_data
            if fx_data is None:
                print("✗ No FX data to save")
                return False
                
            fx_records = []
            for _, row in fx_data.iterrows():
                fx_records.append({
                    "date": row['date'].strftime("%Y-%m-%d"),
                    "open": float(row['open']),
                    "high": float(row['high']),
                    "low": float(row['low']),
                    "close": float(row['close']),
                    "volume": int(row.get('volume', 0)),
                    "log_return": float(row['log_return']) if pd.notna(row['log_return']) else None
                })
            
            batch_size = 100
            for i in range(0, len(fx_records), batch_size):
                batch = [fx_records[j] for j in range(i, min(i+batch_size, len(fx_records)))]
                supabase.table("exchange_rates").upsert(batch).execute()
                print(f"✓ Inserted batch {i//batch_size + 1}: {len(batch)} records")
            
            macro_data = self.macro_data
            if macro_data is not None and not macro_data.empty:
                macro_records = []
                for _, row in macro_data.iterrows():
                    macro_records.append({
                        "date": row['date'].strftime("%Y-%m-%d"),
                        "indicator_type": row['indicator_type'],
                        "value": float(row['value']),
                        "source": row['source']
                    })
                
                for i in range(0, len(macro_records), batch_size):
                    batch = [macro_records[j] for j in range(i, min(i+batch_size, len(macro_records)))]
                    supabase.table("macro_indicators").insert(batch).execute()
            
            print("✓ Data successfully uploaded to Supabase")
            return True
            
        except Exception as e:
            print(f"✗ Error saving to Supabase: {e}")
            return False

if __name__ == "__main__":
    collector = ForexDataCollector()
    collector.fetch_historical_rates()
    collector.fetch_macro_indicators()
    collector.save_to_supabase()
