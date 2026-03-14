import pandas as pd
import numpy as np
import os
from datetime import datetime
from dotenv import load_dotenv
from supabase import create_client, Client
from typing import List, Dict, Any, Union, Optional

# Load environment variables
load_dotenv(dotenv_path='../.env.local')

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: Supabase credentials not found in .env.local")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def clear_exchange_rates():
    """Clear existing exchange rates to start from scratch"""
    print("Clearing 'exchange_rates' table...")
    try:
        # Delete all rows (id >= 0 is a safe bet for serial id)
        supabase.table("exchange_rates").delete().neq("id", -1).execute()
        print("✓ Table cleared successfully.")
    except Exception as e:
        print(f"✗ Error clearing table: {e}")
        # Not exiting here as the table might be empty

def import_csv_to_supabase(file_path):
    """Parse CSV and upload to Supabase"""
    print(f"Reading CSV from {file_path}...")
    
    try:
        # Load the CSV
        df = pd.read_csv(file_path)
        
        # Preprocessing
        # Date format in CSV is DD/MM/YYYY
        df['date'] = pd.to_datetime(df['Date'], format='%d/%m/%Y')
        
        # Sort by date ascending to calculate log returns correctly
        df = df.sort_values('date')
        
        # Mapping:
        # Mean -> close, open
        # Buy -> low
        # Sell -> high
        # Note: In the schema, close is the primary price field
        
        df['open'] = df['Mean']
        df['high'] = df['Sell']
        df['low'] = df['Buy']
        df['close'] = df['Mean']
        df['volume'] = 0
        
        # Calculate log returns
        df['log_return'] = np.log(df['close'] / df['close'].shift(1))
        
        print(f"Prepared {len(df)} records for upload.")
        
        # Prepare records for Supabase
        records: List[Dict[str, Any]] = []
        for _, row in df.iterrows():
            records.append({
                "date": row['date'].strftime("%Y-%m-%d"),
                "open": float(row['open']),
                "high": float(row['high']),
                "low": float(row['low']),
                "close": float(row['close']),
                "volume": 0,
                "log_return": float(row['log_return']) if pd.notna(row['log_return']) else None
            })
            
        # Upload in batches
        batch_size = 100
        for i in range(0, len(records), batch_size):
            batch = records[i:i + batch_size]
            supabase.table("exchange_rates").upsert(batch).execute()
            print(f"✓ Uploaded batch {i//batch_size + 1}/{ (len(records)-1)//batch_size + 1}")
            
        print("Successfully imported all records.")
        
    except Exception as e:
        print(f"✗ Error during import: {e}")

if __name__ == "__main__":
    CSV_PATH = "../public/Daily KES Exchange Rates.csv"
    
    # Confirm working directory - script should be run from python-backend/
    if not os.path.exists(CSV_PATH):
        print(f"Error: Could not find CSV at {CSV_PATH}. Make sure to run the script from the 'python-backend' directory.")
        exit(1)
        
    clear_exchange_rates()
    import_csv_to_supabase(CSV_PATH)
