# pyre-ignore-all-errors
# type: ignore
import pandas as pd
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers, models
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error

class LSTMPredictor:
    """LSTM network for non-linear pattern learning"""
    
    def __init__(self, lookback=30, units=100, dropout=0.2):
        self.lookback = lookback
        self.units = units
        self.dropout = dropout
        self.model = None
        self.scaler = MinMaxScaler()
        self.history = None
    
    def create_sequences(self, data):
        """Create sequences for LSTM"""
        X, y = [], []
        for i in range(len(data) - self.lookback):
            X.append(data[i:i+self.lookback])
            y.append(data[i+self.lookback])
        return np.array(X), np.array(y)
    
    def build_model(self, input_shape):
        """Build LSTM architecture"""
        model = models.Sequential([
            layers.LSTM(
                self.units,
                activation='relu',
                return_sequences=True,
                input_shape=input_shape
            ),
            layers.Dropout(self.dropout),
            
            layers.LSTM(
                int(self.units // 2),
                activation='relu',
                return_sequences=False
            ),
            layers.Dropout(self.dropout),
            
            layers.Dense(25, activation='relu'),
            layers.Dense(1)
        ])
        
        model.compile(optimizer='adam', loss='mse', metrics=['mae'])
        return model
    
    def fit(self, data, epochs=30, batch_size=32, validation_split=0.2):
        """Fit LSTM to standardized residuals"""
        scaled_data = self.scaler.fit_transform(data.reshape(-1, 1))
        
        X, y = self.create_sequences(scaled_data)
        if len(X) == 0:
            raise ValueError("Not enough data to create sequences with lookback")
            
        X = X.reshape(X.shape[0], X.shape[1], 1)
        self.model = self.build_model((X.shape[1], X.shape[2]))
        
        self.history = self.model.fit(
            X, y,
            epochs=epochs,
            batch_size=batch_size,
            validation_split=validation_split,
            verbose=1,
            callbacks=[
                keras.callbacks.EarlyStopping(
                    monitor='val_loss',
                    patience=5,
                    restore_best_weights=True
                )
            ]
        )
        
        print("✓ LSTM model trained")
        return self.history
    
    def predict(self, data):
        """Generate predictions"""
        scaled_data = self.scaler.transform(data.reshape(-1, 1))
        X, _ = self.create_sequences(np.append(scaled_data, [[0]], axis=0)) # Append dummy for last prediction if needed
        # Just use the last sequence to predict the next value
        recent_seq = scaled_data[-self.lookback:]
        X = recent_seq.reshape(1, self.lookback, 1)
        
        predictions_scaled = self.model.predict(X, verbose=0)
        predictions = self.scaler.inverse_transform(predictions_scaled)
        return float(predictions[0][0])
    
    def evaluate(self, test_data, predictions):
        """Calculate metrics"""
        mae = mean_absolute_error(test_data, predictions)
        mse = mean_squared_error(test_data, predictions)
        rmse = np.sqrt(mse)
        # Avoid division by zero
        test_data_safe = np.where(test_data == 0, 1e-8, test_data)
        mape = np.mean(np.abs((test_data - predictions) / test_data_safe)) * 100
        if not np.isfinite(mape):
            mape = 0.0
            
        return {'mae': mae, 'rmse': rmse, 'mape': mape}
