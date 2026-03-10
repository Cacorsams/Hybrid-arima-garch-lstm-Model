# pyre-ignore-all-errors
# type: ignore
import pandas as pd
import numpy as np
from scipy import stats
from sklearn.preprocessing import StandardScaler, MinMaxScaler

class DataPreprocessor:
    """Handle stationarity testing, scaling, and windowing"""
    
    @staticmethod
    def adf_test(series, verbose=True):
        """Augmented Dickey-Fuller test for stationarity"""
        from statsmodels.tsa.stattools import adfuller
        
        result = adfuller(series.dropna(), autolag='AIC')
        
        if verbose:
            print(f'ADF Statistic: {result[0]:.6f}')
            print(f'p-value: {result[1]:.6f}')
            print(f'Critical Values:')
            for key, value in result[4].items():
                print(f'\t{key}: {value:.3f}')
        
        is_stationary = result[1] < 0.05
        return is_stationary, result
    
    @staticmethod
    def remove_outliers(series, method='iqr', threshold=3):
        """Remove outliers using IQR or Z-score method"""
        if method == 'iqr':
            Q1 = series.quantile(0.25)
            Q3 = series.quantile(0.75)
            IQR = Q3 - Q1
            lower_bound = Q1 - 1.5 * IQR
            upper_bound = Q3 + 1.5 * IQR
            return series[(series >= lower_bound) & (series <= upper_bound)]
        elif method == 'zscore':
            dropped = series.dropna()
            z_scores = np.abs(stats.zscore(dropped))
            return dropped[z_scores < threshold]
    
    @staticmethod
    def scale_data(data, method='standard', scaler=None):
        """Scale data for LSTM input"""
        if scaler is None:
            if method == 'standard':
                scaler = StandardScaler()
            else:
                scaler = MinMaxScaler()
            scaler.fit(data.reshape(-1, 1))
        
        scaled = scaler.transform(data.reshape(-1, 1))
        return scaled, scaler
    
    @staticmethod
    def create_sequences(data, lookback=60, lookahead=1):
        """Create sequences for LSTM training"""
        X, y = [], []
        for i in range(len(data) - lookback - lookahead + 1):
            X.append(data[i:i+lookback])
            y.append(data[i+lookback+lookahead-1])
        return np.array(X), np.array(y)
