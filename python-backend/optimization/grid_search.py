# pyre-ignore-all-errors
# type: ignore
import numpy as np
import pandas as pd
from pmdarima import auto_arima
from arch import arch_model
from tensorflow.keras import layers, models, callbacks
from sklearn.model_selection import TimeSeriesSplit
import warnings
warnings.filterwarnings('ignore')

class GridSearchOptimizer:
    """Hyperparameter tuning for all models"""
    
    @staticmethod
    def optimize_arima(series, max_p=5, max_d=2, max_q=5):
        """Auto-ARIMA already does robust grid search"""
        print("Running Auto-ARIMA optimization...")
        model = auto_arima(
            series,
            start_p=1, start_q=1,
            max_p=max_p, max_d=max_d, max_q=max_q,
            d=None,
            seasonal=False,
            trace=True,
            error_action='ignore',
            suppress_warnings=True,
            stepwise=True
        )
        return {'best_order': model.order, 'aic': model.aic()}
    
    @staticmethod
    def optimize_garch(residuals, p_range=range(1, 4), q_range=range(1, 4)):
        """Grid search for GARCH(p,q) parameters"""
        best_aic = np.inf
        best_order = None
        
        residuals_clean = residuals.dropna()
        scale = 100
        scaled_residuals = residuals_clean * scale
        
        print("Running GARCH grid search...")
        for p in p_range:
            for q in q_range:
                try:
                    model = arch_model(scaled_residuals, vol='Garch', p=p, q=q, rescale=False)
                    results = model.fit(disp='off')
                    
                    if results.aic < best_aic:
                        best_aic = results.aic
                        best_order = (p, q)
                        print(f"  New best found: GARCH({p},{q}) - AIC: {results.aic:.2f}")
                except Exception as e:
                    continue
        
        return {'best_order': best_order, 'aic': best_aic}
    
    @staticmethod
    def tune_lstm(X_train, y_train, units_list=[32, 50, 64], dropout_list=[0.1, 0.2, 0.3]):
        """Simple random search / grid search for LSTM"""
        import random
        
        best_loss = np.inf
        best_hyperparams = None
        
        print(f"Running LSTM tuning with {len(units_list) * len(dropout_list)} combinations...")
        
        # We'll use a single time-based split for validation to keep simple
        split_idx = int(len(X_train) * 0.8)
        X_t, y_t = X_train[:split_idx], y_train[:split_idx]
        X_val, y_val = X_train[split_idx:], y_train[split_idx:]
        
        for u in units_list:
            for d in dropout_list:
                print(f"  Testing units={u}, dropout={d}")
                
                model = models.Sequential([
                    layers.LSTM(u, activation='relu', return_sequences=True, input_shape=(X_t.shape[1], 1)),
                    layers.Dropout(d),
                    layers.LSTM(int(u) // 2, activation='relu', return_sequences=False),
                    layers.Dropout(d),
                    layers.Dense(1)
                ])
                model.compile(optimizer='adam', loss='mse')
                
                # Fit with minimal epochs just to compare relative performance
                history = model.fit(
                    X_t, y_t,
                    epochs=10, batch_size=32,
                    validation_data=(X_val, y_val),
                    verbose=0
                )
                
                val_loss = history.history['val_loss'][-1]
                if val_loss < best_loss:
                    best_loss = val_loss
                    best_hyperparams = {'units': u, 'dropout': d}
                    print(f"  New best: units={u}, dropout={d} - Val Loss: {val_loss:.6f}")
        
        return best_hyperparams
