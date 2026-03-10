# pyre-ignore-all-errors
# type: ignore
import pandas as pd
import numpy as np
from arch import arch_model
from scipy.stats import norm
import warnings
warnings.filterwarnings('ignore')

class GARCHVolatilityModeler:
    """GARCH(1,1) for volatility forecasting"""
    
    def __init__(self, p=1, q=1):
        self.p = p
        self.q = q
        self.model = None
        self.fitted_model = None
        self.conditional_variance = None
        self.standardized_residuals = None
    
    def fit(self, residuals):
        """Fit GARCH model to residuals"""
        residuals_clean = residuals.dropna()
        
        # Scale residuals up for fitting if they are very small (helps convergence)
        scale = 100
        scaled_residuals = residuals_clean * scale
        
        model = arch_model(
            scaled_residuals,
            vol='Garch',
            p=self.p,
            q=self.q,
            rescale=False
        )
        self.model = model
        
        fitted_model = model.fit(disp='off')
        self.fitted_model = fitted_model
        
        # Scale back down
        self.conditional_variance = (fitted_model.conditional_volatility / scale) ** 2
        conditional_std = fitted_model.conditional_volatility / scale
        
        # Add small epsilon to avoid division by zero
        self.standardized_residuals = residuals_clean / (conditional_std + 1e-8)
        
        print(f"✓ GARCH({self.p},{self.q}) fitted")
        return self.fitted_model
    
    def forecast_variance(self, horizon=1):
        """Forecast conditional variance"""
        variance_forecast = self.fitted_model.forecast(horizon=horizon)
        variance_forecast = variance_forecast.variance.values[-1, :]
        # Scale back down (since we scaled *100 during fitting, variance was *10000)
        variance_forecast = variance_forecast / 10000.0
        
        return {
            'variance': variance_forecast,
            'std': np.sqrt(variance_forecast)
        }
    
    def get_parameters(self):
        """Get model parameters"""
        params = self.fitted_model.params
        return {
            'omega': params['omega'], # Intercept used to be 'omega' in recent arch
            'alpha': params[f'alpha[1]'],
            'beta': params[f'beta[1]']
        }
    
    def check_persistence(self):
        """Check if model is mean-reverting (alpha + beta < 1)"""
        params = self.get_parameters()
        persistence = params['alpha'] + params['beta']
        is_mean_reverting = persistence < 1
        return {'persistence': persistence, 'is_stable': is_mean_reverting}
