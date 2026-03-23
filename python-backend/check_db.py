
import os
import sys
from dotenv import load_dotenv

# Ensure we can import from the current directory
sys.path.append(os.getcwd())

# Load environment
load_dotenv(dotenv_path='../.env.local')

from data_collection import supabase as sb

def check_tables():
    tables = ["arima_predictions", "garch_volatility", "lstm_predictions", "exchange_rates"]
    for table in tables:
        try:
            res = sb.table(table).select("count", count="exact").limit(1).execute()
            print(f"Table '{table}': {res.count} rows")
        except Exception as e:
            print(f"Error checking table '{table}': {e}")

if __name__ == "__main__":
    check_tables()
