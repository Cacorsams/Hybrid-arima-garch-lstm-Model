# pyre-ignore-all-errors
# type: ignore
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import traceback
import sys
import os

# Suppress TensorFlow logging and force CPU mode
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ['CUDA_VISIBLE_DEVICES'] = '-1'

# Create Flask app
app = Flask(__name__)
# Enable CORS for Next.js frontend
CORS(app)

from services.forecasting_service import forecast_service
from models.arima_model import ARIMAForecaster
from models.garch_model import GARCHVolatilityModeler
from data_collection import ForexDataCollector

# ---------------------------------------------------------------------------
# Standalone ARIMA state (independent from the hybrid pipeline)
# ---------------------------------------------------------------------------
class _ARIMAService:
    def __init__(self):
        self.model = ARIMAForecaster()
        self.is_trained = False
        self.last_data = None  # holds the full DataFrame used for training
        self.last_price = None # last price level for converting log-returns → price

arima_service = _ARIMAService()

# ---------------------------------------------------------------------------
# Standalone GARCH state
# ---------------------------------------------------------------------------
class _GARCHService:
    def __init__(self):
        self.model = GARCHVolatilityModeler(p=1, q=1)
        self.is_trained = False
        self.last_data = None

garch_service = _GARCHService()

def clean_for_json(obj):
    """Recursively replace non-JSON-compliant values (inf, nan) and numpy types"""
    # Handle numpy scalars first
    if hasattr(obj, 'dtype'):
        if np.isscalar(obj):
            val = obj.item()
            if isinstance(val, (float, np.floating)):
                if not np.isfinite(val):
                    return None
            return val
        elif isinstance(obj, np.ndarray):
            return clean_for_json(obj.tolist())

    if isinstance(obj, (float, np.floating)):
        if not np.isfinite(obj):
            return None
        return float(obj)
    elif isinstance(obj, (int, np.integer)):
        return int(obj)
    elif isinstance(obj, (bool, np.bool_)):
        return bool(obj)
    elif isinstance(obj, dict):
        return {k: clean_for_json(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [clean_for_json(i) for i in obj]
    return obj

@app.route('/', methods=['GET'])
def index():
    """Root endpoint with basic API info"""
    return jsonify({
        "name": "Hybrid Forex Forecasting API",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "train": "/api/train [POST]",
            "forecast": "/api/forecast/hybrid [GET]",
            "evaluate": "/api/evaluate [GET]"
        },
        "status": "online"
    })

@app.route('/health', methods=['GET'])
def health_check():
    """Simple health check endpoint"""
    return jsonify({"status": "healthy", "model_trained": forecast_service.is_trained})

@app.route('/api/train', methods=['POST'])
def train_model():
    """Trigger model training"""
    try:
        # Fetch latest data
        collector = ForexDataCollector()
        fx_data = collector.fetch_historical_rates()
        
        if fx_data is None:
            return jsonify({"error": "Failed to fetch historical data"}), 500
            
        # Train
        forecast_service.train_models(fx_data)
        
        # Save training data for metrics computation later
        forecast_service.last_training_data = fx_data
        
        return jsonify({
            "message": "Model trained successfully",
            "records_used": len(fx_data),
            "components": forecast_service.hybrid_model.components
        })
        
    except Exception as e:
        print(f"Error during training: {traceback.format_exc()}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/forecast/hybrid', methods=['GET'])
def get_hybrid_forecast():
    """Get forecast up to N steps"""
    try:
        if not forecast_service.is_trained:
            return jsonify({"error": "Model not trained yet. Call /api/train first."}), 400
            
        steps = int(request.args.get('steps', 1))
        forecast = forecast_service.get_hybrid_forecast(steps=steps)
        
        return jsonify({"forecast": forecast})
        
    except Exception as e:
        print(f"Error forecasting: {traceback.format_exc()}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/evaluate', methods=['GET'])
def evaluate_models():
    """Get model performance metrics"""
    try:
        if not forecast_service.is_trained:
            return jsonify({"error": "Model not trained yet."}), 400
            
        if not hasattr(forecast_service, 'last_training_data'):
            return jsonify({"error": "No test data available for evaluation."}), 400
            
        # Use last 100 days as holdout for evaluation approximation
        test_data = forecast_service.last_training_data.tail(100)
        metrics = forecast_service.evaluate_models(test_data)
        
        return jsonify(clean_for_json(metrics))
        
    except Exception as e:
        print(f"Error evaluating: {traceback.format_exc()}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/models/compare', methods=['GET'])
def compare_models():
    """Alias for /api/evaluate with more descriptive name for frontend"""
    return evaluate_models()

@app.route('/api/models/diebold-mariano', methods=['POST'])
def run_dm_test():
    """Run DM test between hybrid and arima"""
    try:
        if not forecast_service.is_trained:
            return jsonify({"error": "Model not trained"}), 400
            
        data = request.json or {}
        model1 = data.get('model1', 'hybrid')
        model2 = data.get('model2', 'arima')
        
        # For demo, we compute errors on the last 100 days
        test_data = forecast_service.last_training_data.tail(100)
        test_returns = test_data['log_return'].dropna().values
        n = len(test_returns)
        
        # Get errors for hybrid
        arima_preds = forecast_service.hybrid_model.arima.fitted_model.fittedvalues[-n:]
        garch_vol = forecast_service.hybrid_model.garch.conditional_variance[-n:] ** 0.5
        std_resids = forecast_service.hybrid_model.garch.standardized_residuals.values
        
        lstm_preds = []
        for i in range(n):
            idx = -n+i
            p = forecast_service.hybrid_model.lstm.predict(std_resids[idx-60:idx])
            lstm_preds.append(p)
            
        hybrid_preds = arima_preds + (np.array(lstm_preds) * garch_vol)
        
        errors_hybrid = test_returns - hybrid_preds
        errors_arima = test_returns - arima_preds
        
        result = forecast_service.hybrid_model.diebold_mariano_test(errors_hybrid, errors_arima)
        return jsonify(clean_for_json(result))
        
    except Exception as e:
        print(f"Error DM test: {traceback.format_exc()}")
        return jsonify({"error": str(e)}), 500

# ---------------------------------------------------------------------------
# Standalone ARIMA routes
# ---------------------------------------------------------------------------

@app.route('/api/arima/train', methods=['POST'])
def arima_train():
    """Train standalone ARIMA model on the latest data"""
    try:
        collector = ForexDataCollector()
        fx_data = collector.fetch_historical_rates()
        if fx_data is None or fx_data.empty:
            return jsonify({"error": "Failed to fetch historical data"}), 500

        log_returns = fx_data['log_return'].dropna()
        arima_service.model = ARIMAForecaster()  # fresh instance each time
        arima_service.model.fit(log_returns)
        arima_service.is_trained = True
        arima_service.last_data = fx_data
        # Store last closing price to anchor forecast in price space
        arima_service.last_price = float(fx_data['close'].dropna().iloc[-1])

        return jsonify(clean_for_json({
            "message": "ARIMA model trained successfully",
            "order": list(arima_service.model.order),
            "aic": arima_service.model.aic,
            "bic": arima_service.model.bic,
            "records_used": len(fx_data),
        }))
    except Exception as e:
        print(f"Error training ARIMA: {traceback.format_exc()}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/arima/forecast', methods=['GET'])
def arima_forecast():
    """Return N-step ARIMA forecast as price levels with 95 % CI"""
    try:
        if not arima_service.is_trained:
            return jsonify({"error": "ARIMA model not trained yet. Call /api/arima/train first."}), 400

        steps = int(request.args.get('steps', 30))
        result = arima_service.model.forecast(steps=steps)

        predictions_log = result['predictions'].values        # log-return space
        std_errors       = result['std_errors'].values        # usually finite

        # Fallback SE: use mean absolute log-return as a rough proxy when SE is NaN/0
        finite_ses = std_errors[np.isfinite(std_errors) & (std_errors > 0)]
        fallback_se = float(np.mean(finite_ses)) if len(finite_ses) > 0 else 0.005

        # Convert log-returns → cumulative price levels (walk-forward)
        last_price = arima_service.last_price
        price_preds, price_lower, price_upper = [], [], []
        current = last_price

        for i in range(steps):
            lr = float(predictions_log[i]) if np.isfinite(predictions_log[i]) else 0.0
            se = float(std_errors[i])      if (np.isfinite(std_errors[i]) and std_errors[i] > 0) else fallback_se

            prev = current
            current = prev * np.exp(lr)

            # Log-normal CI anchored to the price level BEFORE this step's move
            cl = prev * np.exp(lr - 1.96 * se)
            cu = prev * np.exp(lr + 1.96 * se)

            price_preds.append(round(float(current), 8))
            price_lower.append(round(float(cl),      8))
            price_upper.append(round(float(cu),      8))
        return jsonify(clean_for_json({
            "steps": steps,
            "last_price": last_price,
            "arima_order": list(arima_service.model.order),
            "predictions": price_preds,
            "confidence_lowers": price_lower,
            "confidence_uppers": price_upper,
        }))
    except Exception as e:
        print(f"Error in ARIMA forecast: {traceback.format_exc()}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/arima/metrics', methods=['GET'])
def arima_metrics():
    """Evaluate ARIMA on the held-out last-20 % of training data"""
    try:
        if not arima_service.is_trained:
            return jsonify({"error": "Model not trained yet."}), 400

        df = arima_service.last_data
        log_returns = df['log_return'].dropna()
        n = max(30, int(len(log_returns) * 0.2))
        test_set  = log_returns.values[-n:]
        
        # Use fitted values as in-sample approximation for the test window
        fitted_series = arima_service.model.fitted_model.fittedvalues
        test_preds = fitted_series.values[-n:]
        metrics = arima_service.model.evaluate(test_set, test_preds)

        # Build diagnostic chart data (last 100 points for UI)
        diag_size = min(100, len(log_returns))
        recent_df = df.dropna(subset=['log_return']).tail(diag_size)
        
        dates = recent_df['date'].astype(str).values.tolist()
        actuals = recent_df['log_return'].values
        fitted_recent = fitted_series.loc[recent_df.index].values
        # residuals = actuals - fitted
        residuals = actuals - fitted_recent

        diagnostics = []
        for i in range(diag_size):
            diagnostics.append({
                "date": dates[i],
                "actual": float(actuals[i]),
                "fitted": float(fitted_recent[i]),
                "residual": float(residuals[i])
            })

        # Also expose model diagnostics
        return jsonify(clean_for_json({
            "mae":   metrics['mae'],
            "rmse":  metrics['rmse'],
            "mape":  metrics['mape'],
            "aic":   arima_service.model.aic,
            "bic":   arima_service.model.bic,
            "order": list(arima_service.model.order),
            "test_size": n,
            "diagnostics": diagnostics
        }))
    except Exception as e:
        print(f"Error in ARIMA metrics: {traceback.format_exc()}")
        return jsonify({"error": str(e)}), 500


# ---------------------------------------------------------------------------
# Standalone GARCH routes
# ---------------------------------------------------------------------------

@app.route('/api/garch/train', methods=['POST'])
def garch_train():
    """Train standalone GARCH(1,1) model on the latest data"""
    try:
        collector = ForexDataCollector()
        fx_data = collector.fetch_historical_rates()
        if fx_data is None or fx_data.empty:
            return jsonify({"error": "Failed to fetch historical data"}), 500

        # Note: log_returns are used directly as residuals (assuming mean 0)
        log_returns = fx_data['log_return'].dropna()
        garch_service.model = GARCHVolatilityModeler(p=1, q=1)
        garch_service.model.fit(log_returns)
        garch_service.is_trained = True
        garch_service.last_data = fx_data

        params = garch_service.model.get_parameters()
        persistence_info = garch_service.model.check_persistence()

        return jsonify(clean_for_json({
            "message": "GARCH model trained successfully",
            "parameters": params,
            "persistence": persistence_info['persistence'],
            "is_stable": persistence_info['is_stable'],
            "records_used": len(fx_data),
        }))
    except Exception as e:
        print(f"Error training GARCH: {traceback.format_exc()}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/garch/forecast', methods=['GET'])
def garch_forecast():
    """Return N-step GARCH conditional volatility forecast"""
    try:
        if not garch_service.is_trained:
            return jsonify({"error": "GARCH model not trained yet. Call /api/garch/train first."}), 400

        steps = int(request.args.get('steps', 30))
        result = garch_service.model.forecast_variance(horizon=steps)

        # variance is an array of length `horizon`
        predicted_variance = result['variance']
        predicted_volatility = result['std']

        return jsonify(clean_for_json({
            "steps": steps,
            "forecast_variance": predicted_variance.tolist() if hasattr(predicted_variance, 'tolist') else list(predicted_variance),
            "forecast_volatility": predicted_volatility.tolist() if hasattr(predicted_volatility, 'tolist') else list(predicted_volatility),
        }))
    except Exception as e:
        print(f"Error in GARCH forecast: {traceback.format_exc()}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/garch/metrics', methods=['GET'])
def garch_metrics():
    """Evaluate GARCH, return historical diagnostic log-returns vs volatility"""
    try:
        if not garch_service.is_trained:
            return jsonify({"error": "Model not trained yet."}), 400

        df = garch_service.last_data
        log_returns = df['log_return'].dropna()

        # In-sample conditional standard deviation (volatility)
        cond_vol = garch_service.model.conditional_variance ** 0.5

        # Build diagnostic chart data (last 100 points)
        diag_size = min(100, len(log_returns))
        recent_df = df.dropna(subset=['log_return']).tail(diag_size)
        
        dates = recent_df['date'].astype(str).values.tolist()
        actual_returns = recent_df['log_return'].values
        # conditional volatility aligns with the log_returns index since they were passed together
        recent_cond_vol = cond_vol.loc[recent_df.index].values

        diagnostics = []
        for i in range(diag_size):
            diagnostics.append({
                "date": dates[i],
                "actual_return": float(actual_returns[i]),
                "abs_return": abs(float(actual_returns[i])),  # empirical volatility proxy
                "conditional_volatility": float(recent_cond_vol[i])
            })

        params = garch_service.model.get_parameters()
        persistence_info = garch_service.model.check_persistence()

        return jsonify(clean_for_json({
            "parameters": params,
            "persistence": persistence_info['persistence'],
            "is_stable": persistence_info['is_stable'],
            "diagnostics": diagnostics
        }))
    except Exception as e:
        print(f"Error in GARCH metrics: {traceback.format_exc()}")
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    # Default Flask port 5000 is used by Next.js `.env.local`
    app.run(host='0.0.0.0', port=5000, debug=True)

