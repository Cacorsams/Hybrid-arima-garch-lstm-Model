'use client';

import { useState, useEffect } from 'react';
import LstmForecastChart from '../../components/LstmForecastChart';
import LstmDiagnosticsChart from '../../components/LstmDiagnosticsChart';

interface LstmMetrics {
    epochs: number;
    final_loss: number;
    final_val_loss: number;
    loss_curve: {
        epoch: number;
        train_loss: number;
        val_loss: number | null;
        train_mae: number | null;
        val_mae: number | null;
    }[];
}

interface LstmForecastData {
    steps: number;
    last_price: number;
    predictions: number[];
    predicted_log_returns: number[];
}

interface ChartPoint {
    date: string;
    actual: number | null;
    forecast: number | null;
}

export default function LstmPage() {
    const [historicalData, setHistoricalData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [training, setTraining] = useState(false);
    const [metrics, setMetrics] = useState<LstmMetrics | null>(null);
    const [forecastData, setForecastData] = useState<LstmForecastData | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchHistoricalData();
    }, []);

    const fetchHistoricalData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/data/historical?limit=20000');
            if (!res.ok) throw new Error('Failed to fetch historical data');
            const data = await res.json();
            setHistoricalData(data);
        } catch (err: any) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const trainAndForecast = async () => {
        setTraining(true);
        setError(null);
        try {
            // 1. Train
            const trainRes = await fetch('/api/models/lstm', { method: 'POST' });
            const trainJson = await trainRes.json();
            if (!trainRes.ok) throw new Error(trainJson.error || 'Training failed');

            // 2. Forecast & Metrics
            const [forecastRes, metricsRes] = await Promise.all([
                fetch('/api/models/lstm?action=forecast&steps=30'),
                fetch('/api/models/lstm?action=metrics'),
            ]);
            const [forecastJson, metricsJson] = await Promise.all([
                forecastRes.json(),
                metricsRes.json(),
            ]);

            if (!forecastRes.ok) throw new Error(forecastJson.error || 'Forecast failed');
            if (!metricsRes.ok) throw new Error(metricsJson.error || 'Metrics fetch failed');

            setForecastData(forecastJson);
            setMetrics(metricsJson);

            // Refresh historical data
            await fetchHistoricalData();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setTraining(false);
        }
    };

    // Build chart data
    const chartData: ChartPoint[] = historicalData.map(d => ({
        date: d.date,
        actual: d.close,
        forecast: null
    }));

    if (forecastData && historicalData.length > 0) {
        // Connect forecast to last actual
        const last = chartData[chartData.length - 1];
        last.forecast = last.actual;

        const lastDate = new Date(historicalData[historicalData.length - 1].date);
        
        forecastData.predictions.forEach((pred, i) => {
            const next = new Date(lastDate);
            next.setDate(lastDate.getDate() + i + 1);
            chartData.push({
                date: next.toISOString().split('T')[0],
                actual: null,
                forecast: pred
            });
        });
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-700 font-sans">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-border">
                <div className="space-y-2">
                    <span className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                        KES/CAD · Standalone Model
                    </span>
                    <h1 className="text-xl md:text-2xl font-semibold text-foreground tracking-tight">
                        LSTM Neural Network
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-2xl">
                        Long Short-Term Memory — deep learning model uncovering non-linear temporal dependencies.
                    </p>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <button
                        onClick={trainAndForecast}
                        disabled={training}
                        className={`flex-1 md:flex-none px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-colors
                            ${training ? 'bg-zinc-800 text-zinc-500 cursor-wait' : 'bg-violet-600 hover:bg-violet-700 dark:bg-violet-600 dark:hover:bg-violet-500 shadow-sm'}`}
                    >
                        {training ? 'Training Network…' : 'Train LSTM Pipeline'}
                    </button>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-xl flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-destructive shrink-0" />
                    <p className="text-sm font-medium text-destructive">{error}</p>
                </div>
            )}

            {/* Metrics banner */}
            {metrics && (
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card text-sm">
                        <span className="text-zinc-500 dark:text-zinc-400 text-[11px] uppercase tracking-wider">Epochs Trained</span>
                        <span className="font-mono font-semibold text-foreground">{metrics.epochs}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card text-sm">
                        <span className="text-zinc-500 dark:text-zinc-400 text-[11px] uppercase tracking-wider">Final Train Loss (MSE)</span>
                        <span className="font-mono font-semibold text-violet-600 dark:text-violet-400">{metrics.final_loss.toExponential(4)}</span>
                    </div>

                    {metrics.final_val_loss > 0 && (
                        <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card text-sm">
                            <span className="text-zinc-500 dark:text-zinc-400 text-[11px] uppercase tracking-wider">Val Loss</span>
                            <span className="font-mono font-semibold text-destructive">{metrics.final_val_loss.toExponential(4)}</span>
                        </div>
                    )}
                </div>
            )}

            <div className="space-y-6">
                {/* Main Price Forecast Chart */}
                <div className="bg-card rounded-xl p-5 border border-border">
                    <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                        <span className="w-1.5 h-4 bg-violet-500 rounded-full" />
                        Autoregressive Price Forecast
                    </h2>
                    <div className="h-[350px]">
                        {loading ? (
                            <div className="h-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-800/50 rounded-xl animate-pulse" />
                        ) : (
                            <LstmForecastChart data={chartData} />
                        )}
                    </div>

                    {/* Forecast Stat Chips */}
                    {forecastData && (
                        <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
                            {[
                                { label: 'T+1 Predicted', val: forecastData.predictions[0] },
                                { label: 'T+7 Predicted', val: forecastData.predictions[6] },
                                { label: 'T+14 Predicted', val: forecastData.predictions[13] },
                                { label: 'T+30 Predicted', val: forecastData.predictions[29] },
                            ].map((item, i) => (
                                <div key={i} className={`p-4 rounded-xl border border-border ${i === 0 ? 'bg-violet-600 dark:bg-violet-900/50 dark:border-violet-500/30' : 'bg-card'}`}>
                                    <span className={`text-[11px] uppercase tracking-wider mb-1 block ${i === 0 ? 'text-white/80 dark:text-violet-200/70' : 'text-zinc-500 dark:text-zinc-400'}`}>
                                        {item.label}
                                    </span>
                                    <div className={`text-base font-mono font-semibold ${i === 0 ? 'text-white dark:text-violet-100' : 'text-foreground'}`}>
                                        {item.val ? item.val.toFixed(5) : '—'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Bottom row */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Learning Curves */}
                    <div className="lg:col-span-8 bg-card rounded-xl p-5 border border-border">
                        <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-foreground" />
                            Network Convergence (Learning Curves)
                        </h2>
                        <div className="h-[240px]">
                            {loading || !metrics ? (
                                <div className="h-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-border border-dashed">
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Run pipeline to show learning curves</p>
                                </div>
                            ) : (
                                <LstmDiagnosticsChart data={metrics.loss_curve} />
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-zinc-900 dark:bg-zinc-800 rounded-xl p-6 text-zinc-100 border border-zinc-700 h-full flex flex-col justify-center">
                            <h2 className="text-lg font-semibold mb-3">Standalone LSTM</h2>
                            <p className="text-zinc-300 dark:text-zinc-400 text-sm leading-relaxed mb-4">
                                This Long Short-Term Memory network uses a 30-day lookback window across multiple hidden layers with dropout regularization.
                            </p>
                            <p className="text-zinc-300 dark:text-zinc-400 text-sm leading-relaxed mb-4">
                                Unlike ARIMA which fits a linear equation, the neural network learns complex non-linear patterns.
                                The iterative forecast predicts T+1, appends it to the sequence, and continues to predict up to T+30.
                            </p>
                            <div className="mt-auto pt-4 border-t border-zinc-700/50">
                                <p className="text-zinc-500 dark:text-zinc-500 text-xs leading-relaxed">
                                    Monitoring the learning curve helps prevent overfitting. The model automatically stops training early if validation loss fails to improve.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
