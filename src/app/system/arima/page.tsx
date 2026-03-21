'use client';

import { useState, useEffect } from 'react';
import ArimaForecastChart from '../../components/ArimaForecastChart';
import ArimaDiagnosticsChart from '../../components/ArimaDiagnosticsChart';

interface DiagnosticPoint {
    date: string;
    actual: number;
    fitted: number;
    residual: number;
}

interface ArimaMetrics {
    mae: number;
    rmse: number;
    mape: number;
    aic: number;
    bic: number;
    order: number[];
    test_size: number;
    diagnostics: DiagnosticPoint[];
}

interface ArimaForecastData {
    predictions: number[];
    confidence_lowers: number[];
    confidence_uppers: number[];
    last_price: number;
    arima_order: number[];
}

interface ChartPoint {
    date: string;
    actual: number | null;
    forecast: number | null;
    confLower: number | null;
    confUpper: number | null;
}

export default function ArimaPage() {
    const [historicalData, setHistoricalData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [training, setTraining] = useState(false);
    const [metrics, setMetrics] = useState<ArimaMetrics | null>(null);
    const [forecastData, setForecastData] = useState<ArimaForecastData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [trainInfo, setTrainInfo] = useState<{ order: number[]; aic: number; bic: number } | null>(null);

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
            const trainRes = await fetch('/api/models/arima', { method: 'POST' });
            const trainJson = await trainRes.json();
            if (!trainRes.ok) throw new Error(trainJson.error || 'Training failed');
            setTrainInfo({ order: trainJson.order, aic: trainJson.aic, bic: trainJson.bic });

            // 2. Forecast (30 steps)
            const [forecastRes, metricsRes] = await Promise.all([
                fetch('/api/models/arima?action=forecast&steps=30'),
                fetch('/api/models/arima?action=metrics'),
            ]);
            const [forecastJson, metricsJson] = await Promise.all([
                forecastRes.json(),
                metricsRes.json(),
            ]);

            if (!forecastRes.ok) throw new Error(forecastJson.error || 'Forecast failed');
            if (!metricsRes.ok) throw new Error(metricsJson.error || 'Metrics fetch failed');

            setForecastData(forecastJson);
            setMetrics(metricsJson);

            // Refresh historical data too
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
        forecast: null,
        confLower: null,
        confUpper: null,
    }));

    if (forecastData && historicalData.length > 0) {
        // Connect forecast to last actual
        const last = chartData[chartData.length - 1];
        last.forecast = last.actual;
        last.confLower = last.actual;
        last.confUpper = last.actual;

        const lastDate = new Date(historicalData[historicalData.length - 1].date);
        forecastData.predictions.forEach((pred, i) => {
            const next = new Date(lastDate);
            next.setDate(lastDate.getDate() + i + 1);
            chartData.push({
                date: next.toISOString().split('T')[0],
                actual: null,
                forecast: pred,
                confLower: forecastData.confidence_lowers[i],
                confUpper: forecastData.confidence_uppers[i],
            });
        });
    }

    // (VolatilityData removed)

    return (
        <div className="space-y-6 animate-in fade-in duration-700 font-sans">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-border">
                <div className="space-y-2">
                    <span className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        KES/CAD · Standalone Model
                    </span>
                    <h1 className="text-xl md:text-2xl font-semibold text-foreground tracking-tight">
                        ARIMA Forecaster
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-2xl">
                        AutoRegressive Integrated Moving Average — linear trend and mean-reversion forecasting.
                    </p>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <button
                        onClick={trainAndForecast}
                        disabled={training}
                        className={`flex-1 md:flex-none px-5 py-2.5 rounded-lg text-sm font-medium text-primary-foreground transition-colors
                            ${training ? 'bg-muted text-muted-foreground cursor-wait' : 'bg-primary hover:bg-primary/90'}`}
                    >
                        {training ? 'Running ARIMA Pipeline…' : 'Run ARIMA Pipeline'}
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

            {/* Model order banner (shown after training) */}
            {trainInfo && (
                <div className="flex flex-wrap gap-3">
                    {[
                        { label: 'Model Order', val: `ARIMA(${trainInfo.order.join(',')})` },
                        { label: 'AIC', val: trainInfo.aic?.toFixed(2) },
                        { label: 'BIC', val: trainInfo.bic?.toFixed(2) },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card text-sm">
                            <span className="text-zinc-500 dark:text-zinc-400 text-[11px] uppercase tracking-wider">{item.label}</span>
                            <span className="font-mono font-semibold text-foreground">{item.val}</span>
                        </div>
                    ))}
                </div>
            )}

            <div className="space-y-6">
                {/* Main Forecast Chart — Full Width */}
                <div className="bg-card rounded-xl p-5 border border-border">
                    <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                        <span className="w-1.5 h-4 bg-primary rounded-full" />
                        Exchange Rate Forecast
                    </h2>
                    <div className="h-[350px]">
                        {loading ? (
                            <div className="h-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-800/50 rounded-xl animate-pulse" />
                        ) : (
                            <ArimaForecastChart data={chartData} />
                        )}
                    </div>

                    {/* Forecast stat chips */}
                    {forecastData && (
                        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-3">
                            {[
                                { label: 'Next Predicted', val: forecastData.predictions[0] },
                                { label: 'Lower 95% CI', val: forecastData.confidence_lowers[0] },
                                { label: 'Upper 95% CI', val: forecastData.confidence_uppers[0] },
                            ].map((item, i) => (
                                <div key={i} className={`p-4 rounded-xl border border-border ${i === 0 ? 'bg-primary' : 'bg-card'}`}>
                                    <span className={`text-[11px] uppercase tracking-wider mb-1 block ${i === 0 ? 'text-white/70 dark:text-black/60' : 'text-zinc-500 dark:text-zinc-400'}`}>
                                        {item.label}
                                    </span>
                                    <div className={`text-base font-mono font-semibold ${i === 0 ? 'text-primary-foreground' : 'text-foreground'}`}>
                                        {item.val?.toFixed(5) ?? '—'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Bottom row */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Residuals / Fit Diagnostics */}
                    <div className="lg:col-span-8 bg-card rounded-xl p-5 border border-border">
                        <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                            <span className="w-1.5 h-4 bg-destructive rounded-full" />
                            In-Sample Fit & Residuals
                        </h2>
                        <div className="h-[240px]">
                            {loading || !metrics ? (
                                <div className="h-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-border border-dashed">
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Run pipeline to show diagnostics</p>
                                </div>
                            ) : (
                                <ArimaDiagnosticsChart data={metrics.diagnostics} />
                            )}
                        </div>
                    </div>

                    {/* Metrics + Description */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Metrics card */}
                        <div className="bg-card rounded-xl p-5 border border-border">
                            <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-primary" />
                                Model Diagnostics
                            </h2>

                            {metrics ? (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        {[
                                            { label: 'MAE', val: metrics.mae?.toFixed(6) },
                                            { label: 'RMSE', val: metrics.rmse?.toFixed(6) },
                                            { label: 'MAPE', val: `${metrics.mape?.toFixed(3)} %` },
                                        ].map((item, i) => (
                                            <div
                                                key={i}
                                                className={`flex justify-between items-center p-3 rounded-xl border border-border ${i === 0 ? 'bg-zinc-50/50 dark:bg-zinc-800/30' : 'bg-card'}`}
                                            >
                                                <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{item.label}</span>
                                                <span className="text-sm font-mono font-semibold text-foreground">{item.val}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="pt-4 border-t border-border">
                                        <h3 className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">Configuration</h3>
                                        <dl className="space-y-2.5">
                                            {[
                                                { label: 'Order (p,d,q)', val: metrics.order ? `(${metrics.order.join(', ')})` : '—' },
                                                { label: 'AIC', val: metrics.aic?.toFixed(2) ?? '—' },
                                                { label: 'BIC', val: metrics.bic?.toFixed(2) ?? '—' },
                                                { label: 'Test Window', val: `${metrics.test_size} days` },
                                            ].map((item, i) => (
                                                <div key={i} className="flex justify-between border-b border-border pb-2.5">
                                                    <dt className="text-sm text-zinc-500 dark:text-zinc-400">{item.label}</dt>
                                                    <dd className="text-sm font-mono font-medium text-foreground">{item.val}</dd>
                                                </div>
                                            ))}
                                        </dl>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-14 border-2 border-dashed border-border rounded-xl">
                                    <p className="text-zinc-500 dark:text-zinc-400 text-sm">Awaiting pipeline results…</p>
                                </div>
                            )}
                        </div>

                        {/* Model description */}
                        <div className="bg-zinc-900 dark:bg-zinc-800 rounded-xl p-5 text-zinc-100 border border-zinc-700">
                            <h2 className="text-base font-semibold mb-2">Standalone ARIMA</h2>
                            <p className="text-zinc-300 dark:text-zinc-400 text-sm leading-relaxed mb-4">
                                ARIMA captures linear autocorrelation and mean-reversion in the KES/CAD log-return series.
                                Optimal (p,d,q) order is selected via stepwise auto-ARIMA with AIC minimization.
                            </p>
                            <p className="text-zinc-400 dark:text-zinc-500 text-xs leading-relaxed">
                                Note: ARIMA assumes linearity and constant variance. Volatility clustering is handled in the full Hybrid pipeline.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
