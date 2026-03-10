# pyre-ignore-all-errors
# type: ignore
import numpy as np
import pandas as pd
import json
import os
from datetime import datetime

class ModelMonitor:
    """Monitor model performance in production"""
    
    def __init__(self, alert_threshold=0.05):
        self.alert_threshold = alert_threshold
        self.performance_history = []
        
    def log_performance(self, metrics_dict):
        """Log performance metrics"""
        record = {
            'timestamp': datetime.now().isoformat(),
            'metrics': metrics_dict
        }
        self.performance_history.append(record)
        
        # Check for degradation
        if len(self.performance_history) > 1:
            self._check_degradation(metrics_dict)
            
    def _check_degradation(self, current_metrics):
        """Compare current metrics to running average"""
        if len(self.performance_history) < 5:
            return
            
        # Get historical MAPE
        hist_mape = [r['metrics'].get('mape', 0) for i, r in enumerate(self.performance_history) if i < len(self.performance_history) - 1]
        avg_hist_mape = np.mean(hist_mape)
        
        current_mape = current_metrics.get('mape', 0)
        
        if current_mape > avg_hist_mape * (1 + self.alert_threshold):
            print(f"⚠ WARNING: Model degradation detected!")
            print(f"Historical MAPE: {avg_hist_mape:.2f} | Current MAPE: {current_mape:.2f}")
            self._trigger_alert("MAPE threshold exceeded historical average.")
            
    def _trigger_alert(self, message):
        """In a real app, this would send an email/slack alert"""
        print(f"ALERT TRIGGERED: {message}")
