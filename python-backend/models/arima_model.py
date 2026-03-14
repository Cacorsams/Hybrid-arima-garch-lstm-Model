# pyre-ignore-all-errors
# type: ignore
import pandas as pd
import numpy as np
from statsmodels.tsa.arima.model import ARIMA
from pmdarima import auto_arima
from sklearn.metrics import mean_absolute_error, mean_squared_error
import warnings
warnings.filterwarnings('ignore')

class ARIMAForecaster:
    """ARIMA model for linear trend forecasting"""
    
    def __init__(self):
        self.model = None
        self.fitted_model = None
        self.order = None
        self.aic = None
        self.bic = None
    
    def find_optimal_order(self, series, max_p=5, max_d=2, max_q=5):
        """Use auto_arima to find optimal (p,d,q) order"""
        print("Finding optimal ARIMA order...")
        auto_model = auto_arima(
            series,
            max_p=3,
            max_d=1,
            max_q=3,
            seasonal=False,
            stepwise=True,
            information_criterion='aic',
            trace=False,
            error_action='ignore',
            suppress_warnings=True
        )
        self.order = auto_model.order
        self.aic = auto_model.aic()
        self.bic = auto_model.bic()
        
        print(f"✓ Optimal order found: ARIMA{self.order}")
        return self.order
    
    def fit(self, series, order=None):
        """Fit ARIMA model to series"""
        if order is None:
            order = self.find_optimal_order(series)
        
        self.model = ARIMA(series, order=order)
        # Using low_memory solver and larger maxiter to help convergence as per troubleshooting guide
        self.fitted_model = self.model.fit(method='innovations_mle', low_memory=True)
        print(f"✓ ARIMA{order} fitted")
        return self.fitted_model
    
    def forecast(self, steps=1):
        """Generate forecasts"""
        if self.fitted_model is None:
            raise ValueError("Model not fitted yet")
        
        forecast_result = self.fitted_model.get_forecast(steps=steps)
        predictions = forecast_result.predicted_mean
        conf_int = forecast_result.conf_int(alpha=0.05)
        
        return {
            'predictions': predictions,
            'confidence_intervals': conf_int,
            'std_errors': forecast_result.se_mean
        }
    
    def get_residuals(self):
        """Get model residuals for GARCH fitting"""
        return self.fitted_model.resid
    
    def evaluate(self, test_set, predictions):
        """Calculate error metrics"""
        mae = mean_absolute_error(test_set, predictions)
        mse = mean_squared_error(test_set, predictions)
        rmse = np.sqrt(mse)
        mape = np.mean(np.abs((test_set - predictions) / test_set)) * 100
        return {'mae': mae, 'rmse': rmse, 'mape': mape}
