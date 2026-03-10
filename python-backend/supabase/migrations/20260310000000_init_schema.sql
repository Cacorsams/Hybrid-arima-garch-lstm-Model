-- Historical Exchange Rates Table
CREATE TABLE IF NOT EXISTS exchange_rates (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    open DECIMAL(10, 6) NOT NULL,
    high DECIMAL(10, 6) NOT NULL,
    low DECIMAL(10, 6) NOT NULL,
    close DECIMAL(10, 6) NOT NULL,
    volume BIGINT,
    log_return DECIMAL(12, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_exchange_rates_date ON exchange_rates(date DESC);

-- Macroeconomic Indicators
CREATE TABLE IF NOT EXISTS macro_indicators (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    indicator_type VARCHAR(50), -- 'inflation', 'interest_rate'
    value DECIMAL(10, 6),
    source VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_macro_indicators_date ON macro_indicators(date DESC);
CREATE INDEX IF NOT EXISTS idx_macro_indicators_type ON macro_indicators(indicator_type);

-- ARIMA Model Results
CREATE TABLE IF NOT EXISTS arima_predictions (
    id SERIAL PRIMARY KEY,
    forecast_date DATE NOT NULL,
    predicted_return DECIMAL(12, 8),
    predicted_rate DECIMAL(10, 6),
    confidence_interval_lower DECIMAL(10, 6),
    confidence_interval_upper DECIMAL(10, 6),
    actual_return DECIMAL(12, 8),
    actual_rate DECIMAL(10, 6),
    mae DECIMAL(12, 8),
    rmse DECIMAL(12, 8),
    mape DECIMAL(12, 8),
    arima_order VARCHAR(20), -- (p,d,q)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_arima_predictions_date ON arima_predictions(forecast_date DESC);

-- GARCH Model Volatility
CREATE TABLE IF NOT EXISTS garch_volatility (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    conditional_variance DECIMAL(12, 8),
    conditional_std DECIMAL(12, 8),
    standardized_residuals DECIMAL(12, 8),
    garch_order VARCHAR(20), -- (p,q)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_garch_volatility_date ON garch_volatility(date DESC);

-- LSTM Model Results
CREATE TABLE IF NOT EXISTS lstm_predictions (
    id SERIAL PRIMARY KEY,
    forecast_date DATE NOT NULL,
    predicted_return DECIMAL(12, 8),
    predicted_rate DECIMAL(10, 6),
    actual_return DECIMAL(12, 8),
    actual_rate DECIMAL(10, 6),
    mae DECIMAL(12, 8),
    rmse DECIMAL(12, 8),
    mape DECIMAL(12, 8),
    model_epoch INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_lstm_predictions_date ON lstm_predictions(forecast_date DESC);

-- Hybrid Model Predictions
CREATE TABLE IF NOT EXISTS hybrid_predictions (
    id SERIAL PRIMARY KEY,
    forecast_date DATE NOT NULL,
    arima_component DECIMAL(12, 8),
    garch_component DECIMAL(12, 8),
    lstm_component DECIMAL(12, 8),
    combined_prediction DECIMAL(10, 6),
    confidence_lower DECIMAL(10, 6),
    confidence_upper DECIMAL(10, 6),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_hybrid_predictions_date ON hybrid_predictions(forecast_date DESC);
