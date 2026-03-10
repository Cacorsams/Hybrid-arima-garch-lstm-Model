# pyre-ignore-all-errors
# type: ignore
import pandas as pd
import numpy as np
import os
import sys

# Add parent dir to path so we can import other models
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.arima_model import ARIMAForecaster
from models.garch_model import GARCHVolatilityModeler
from models.lstm_model import LSTMPredictor
from sklearn.metrics import mean_absolute_error, mean_squared_error
import json

class HybridARIMAGARCHLSTM:
    """
    Sequential hybrid integration:
    1. ARIMA captures linear mean
    2. GARCH models conditional variance
    3. LSTM learns from standardized residuals
    """
    
    def __init__(self):
        self.arima = ARIMAForecaster()
        self.garch = GARCHVolatilityModeler()
        self.lstm = LSTMPredictor()
        self.components = {}
    
    def fit(self, data_df, arima_order=None):
        """Fit hybrid model sequentially"""
        log_returns = data_df['log_return'].dropna()
        
        print("\n" + "="*60)
        print("FITTING HYBRID ARIMA-GARCH-LSTM MODEL")
        print("="*60)
        
        # Step 1: Fit ARIMA
        print("\n[STEP 1/3] Fitting ARIMA...")
        self.arima.fit(log_returns, order=arima_order)
        
        arima_residuals = self.arima.get_residuals()
        self.components['arima'] = {
            'order': self.arima.order,
            'aic': self.arima.aic,
            'bic': self.arima.bic
        }
        
        # Step 2: Fit GARCH to ARIMA residuals
        print("\n[STEP 2/3] Fitting GARCH...")
        self.garch.fit(arima_residuals)
        standardized_residuals = self.garch.standardized_residuals
        self.components['garch'] = self.garch.get_parameters()
        
        # Step 3: Fit LSTM to standardized residuals
        print("\n[STEP 3/3] Fitting LSTM...")
        self.lstm.fit(standardized_residuals.values, epochs=50)
        self.components['lstm'] = {
            'lookback': self.lstm.lookback,
            'units': self.lstm.units,
            'dropout': self.lstm.dropout
        }
        
        print("\n" + "="*60)
        print("✓ HYBRID MODEL SUCCESSFULLY FITTED")
        print("="*60)
    
    def forecast_hybrid(self, steps=1):
        """Generate hybrid forecast combining all three components"""
        # Get ARIMA forecast
        arima_forecast = self.arima.forecast(steps=steps)
        arima_pred = arima_forecast['predictions'].values[-1]
        arima_conf = arima_forecast['confidence_intervals'].values[-1]
        
        # Get GARCH volatility forecast
        garch_forecast = self.garch.forecast_variance(horizon=steps)
        garch_vol = garch_forecast['std'][-1]
        
        # LSTM contribution
        # Predict the residual adjustment using the recent standardized residuals
        standardized_resids = self.garch.standardized_residuals.values
        lstm_pred = self.lstm.predict(standardized_resids)
        
        # Combine components
        combined = arima_pred + (lstm_pred * garch_vol)
        
        # Robust confidence intervals using GARCH volatility
        # Using 1.96 for 95% confidence
        conf_lower = combined - (1.96 * garch_vol)
        conf_upper = combined + (1.96 * garch_vol)
        
        return {
            'arima_component': float(arima_pred),
            'garch_volatility': float(garch_vol),
            'lstm_component': float(lstm_pred),
            'combined_prediction': float(combined),
            'confidence_lower': float(conf_lower),
            'confidence_upper': float(conf_upper)
        }
    
    def evaluate_all_models(self, test_returns):
        """Evaluate all component models and the hybrid one"""
        n = len(test_returns)
        if n == 0:
            return {}
            
        # 1. ARIMA Baseline (fitted values for simplicity in this demo)
        arima_preds = self.arima.fitted_model.fittedvalues[-n:]
        arima_metrics = self.arima.evaluate(test_returns, arima_preds)
        
        # 2. GARCH Volatility Evaluation (on ARIMA residuals)
        arima_resids = self.arima.get_residuals()[-n:]
        garch_vol = self.garch.conditional_variance[-n:] ** 0.5
        # GARCH doesn't predict "returns" directly but volatility
        # We can evaluate how well it captures absolute residuals
        garch_metrics = {
            'mae': float(np.mean(np.abs(np.abs(arima_resids) - garch_vol))),
            'rmse': float(np.sqrt(np.mean((np.abs(arima_resids) - garch_vol)**2)))
        }
        
        # 3. LSTM Evaluation
        # We need the standardized residuals to predict
        std_resids = self.garch.standardized_residuals.values
        lstm_all_preds = []
        
        # Simple walk-forward for the test set (simplified for speed)
        # In production use a proper rolling window
        for i in range(n):
            idx = i - n
            seq_input = std_resids[idx-self.lstm.lookback:idx]
            if len(seq_input) == self.lstm.lookback:
                p = self.lstm.predict(seq_input)
                lstm_all_preds.append(p)
            else:
                lstm_all_preds.append(0)
        
        lstm_metrics = self.lstm.evaluate(std_resids[-n:], np.array(lstm_all_preds))
        
        # 4. Hybrid Evaluation
        # Hybrid pred = ARIMA + (LSTM * GARCH_vol)
        hybrid_preds = arima_preds + (np.array(lstm_all_preds) * garch_vol)
        hybrid_metrics = {
            'mae': float(mean_absolute_error(test_returns, hybrid_preds)),
            'rmse': float(np.sqrt(mean_squared_error(test_returns, hybrid_preds))),
            'mape': float(np.mean(np.abs((test_returns - hybrid_preds) / (test_returns + 1e-8))) * 100)
        }
        
        return {
            'arima': arima_metrics,
            'garch': garch_metrics,
            'lstm': lstm_metrics,
            'hybrid': hybrid_metrics,
            'models_components': self.components
        }
    
    def diebold_mariano_test(self, errors_model1, errors_model2):
        """Diebold-Mariano test for forecast comparison"""
        from scipy import stats
        
        # Loss differential
        loss_diff = (np.array(errors_model1)**2) - (np.array(errors_model2)**2)
        mean_diff = np.mean(loss_diff)
        var_diff = np.var(loss_diff, ddof=1)
        
        dm_stat = mean_diff / np.sqrt(var_diff / len(loss_diff))
        p_value = 2 * (1 - stats.norm.cdf(abs(dm_stat)))
        
        return {
            'test_statistic': float(dm_stat),
            'p_value': float(p_value),
            'significant_at_5pct': p_value < 0.05
        }
    
    def save_model_config(self, filepath):
        """Save model configuration for production"""
        config = {
            'model_type': 'hybrid_arima_garch_lstm',
            'components': self.components,
            'fit_date': pd.Timestamp.now().isoformat(),
            'lookback': self.lstm.lookback
        }
        with open(filepath, 'w') as f:
            json.dump(config, f, indent=2)
        print(f"✓ Model config saved to {filepath}")
