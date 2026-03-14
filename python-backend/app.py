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
from data_collection import ForexDataCollector

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

if __name__ == '__main__':
    # Default Flask port 5000 is used by Next.js `.env.local`
    app.run(host='0.0.0.0', port=5000, debug=True)
