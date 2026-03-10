# pyre-ignore-all-errors
# type: ignore
import pandas as pd
import numpy as np
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from models.hybrid_model import HybridARIMAGARCHLSTM

class ForecastingService:
    """Service to handle model inference, data retrieval, and serving predictions"""
    
    def __init__(self, use_cache=True):
        self.hybrid_model = HybridARIMAGARCHLSTM()
        self.is_trained = False
        
    def train_models(self, fx_history):
        """Train models sequentially on historical data"""
        if fx_history is None or len(fx_history) < 100:
            raise ValueError("Insufficient data to train models")
            
        print(f"Training hybrid model on {len(fx_history)} records...")
        
        # Ensure log returns are calculated
        if 'log_return' not in fx_history.columns:
            fx_history['log_return'] = np.log(fx_history['close'] / fx_history['close'].shift(1))
            
        # Optional: Outlier truncation
        from data_preprocessing import DataPreprocessor
        fx_history['log_return_clean'] = DataPreprocessor.remove_outliers(fx_history['log_return'], method='zscore', threshold=4)
        
        # Fit hybrid model pipeline
        self.hybrid_model.fit(fx_history, arima_order=None)
        
        self.is_trained = True
        return True
        
    def get_hybrid_forecast(self, steps=1):
        """Get hybrid forecast"""
        if not self.is_trained:
            raise RuntimeError("Model must be trained before forecasting")
            
        return self.hybrid_model.forecast_hybrid(steps=steps)
    
    def evaluate_models(self, test_data):
        """Evaluate and return metrics for components"""
        if not self.is_trained:
            raise RuntimeError("Model must be trained before forecasting")
            
        test_returns = test_data['log_return'].dropna().values
        metrics = self.hybrid_model.evaluate_all_models(test_returns)
        return metrics

# Singleton service instance
forecast_service = ForecastingService()
