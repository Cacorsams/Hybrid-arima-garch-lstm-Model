'use client';

import { useState, useEffect } from 'react';
import GarchDiagnosticsChart from '../../components/GarchDiagnosticsChart';

interface GarchMetrics {
    parameters: {
        omega: number;
        alpha: number;
        beta: number;
    };
    persistence: number;
    is_stable: boolean;
    diagnostics: {
        date: string;
        actual_return: number;
        abs_return: number;
        conditional_volatility: number;
    }[];
}

interface GarchForecastData {
    steps: number;
    forecast_variance: number[];
    forecast_volatility: number[];
}

interface ChartPoint {
    date: string;
    empiricalVol: number | null;
    condVol: number | null;
    forecastVol: number | null;
}

export default function GarchPage() {
    const [historicalData, setHistoricalData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [training, setTraining] = useState(false);
    const [metrics, setMetrics] = useState<GarchMetrics | null>(null);
    const [forecastData, setForecastData] = useState<GarchForecastData | null>(null);
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
            const trainRes = await fetch('/api/models/garch', { method: 'POST' });
            const trainJson = await trainRes.json();
            if (!trainRes.ok) throw new Error(trainJson.error || 'Training failed');

            // 2. Forecast & Metrics
            const [forecastRes, metricsRes] = await Promise.all([
                fetch('/api/models/garch?action=forecast&steps=30'),
                fetch('/api/models/garch?action=metrics'),
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
    const chartData: ChartPoint[] = [];

    if (metrics && metrics.diagnostics) {
        // Add historical diagnostic points
        metrics.diagnostics.forEach(d => {
            chartData.push({
                date: d.date,
                empiricalVol: d.abs_return,
                condVol: d.conditional_volatility,
                forecastVol: null
            });
        });
    }

    if (forecastData && chartData.length > 0) {
        // Connect forecast to last actual conditional volatility
        const last = chartData[chartData.length - 1];
        last.forecastVol = last.condVol;

        const lastDate = new Date(chartData[chartData.length - 1].date);
        
        forecastData.forecast_volatility.forEach((vol, i) => {
            const next = new Date(lastDate);
            next.setDate(lastDate.getDate() + i + 1);
            chartData.push({
                date: next.toISOString().split('T')[0],
                empiricalVol: null,
                condVol: null,
                forecastVol: vol
            });
        });
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-700 font-sans">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-border">
                <div className="space-y-2">
                    <span className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
                        KES/CAD · Standalone Model
                    </span>
                    <h1 className="text-xl md:text-2xl font-semibold text-foreground tracking-tight">
                        GARCH Volatility Modeler
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-2xl">
                        Generalized Autoregressive Conditional Heteroskedasticity — assessing risk and volatility clustering.
                    </p>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <button
                        onClick={trainAndForecast}
                        disabled={training}
                        className={`flex-1 md:flex-none px-5 py-2.5 rounded-lg text-sm font-medium text-primary-foreground transition-colors
                            ${training ? 'bg-muted text-muted-foreground cursor-wait' : 'bg-primary hover:bg-primary/90'}`}
                    >
                        {training ? 'Running GARCH Pipeline…' : 'Run GARCH Pipeline'}
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

            {/* Persistence banner */}
            {metrics && (
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card text-sm">
                        <span className="text-zinc-500 dark:text-zinc-400 text-[11px] uppercase tracking-wider">Persistence</span>
                        <span className="font-mono font-semibold text-foreground">{metrics.persistence.toFixed(4)}</span>
                    </div>
                    
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm ${metrics.is_stable ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'border-destructive/30 bg-destructive/10 text-destructive'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${metrics.is_stable ? 'bg-emerald-500' : 'bg-destructive'}`} />
                        <span className="font-semibold">{metrics.is_stable ? 'Mean-Reverting (Stable)' : 'Explosive Risk'}</span>
                    </div>
                </div>
            )}

            <div className="space-y-6">
                {/* Main Volatility Chart */}
                <div className="bg-card rounded-xl p-5 border border-border">
                    <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                        <span className="w-1.5 h-4 bg-destructive rounded-full" />
                        Conditional Volatility Forecast
                    </h2>
                    <div className="h-[350px]">
                        {loading || !metrics ? (
                            <div className="h-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-800/50 rounded-xl animate-pulse" />
                        ) : (
                            <GarchDiagnosticsChart data={chartData} />
                        )}
                    </div>

                    {/* Volatility Stat Chips */}
                    {forecastData && chartData.length > 0 && (
                        <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
                            {[
                                { label: 'Latest Daily Vol', val: chartData[chartData.length - forecastData.steps - 1]?.condVol },
                                { label: 'T+1 Predicted Vol', val: forecastData.forecast_volatility[0] },
                                { label: 'T+7 Predicted Vol', val: forecastData.forecast_volatility[6] },
                                { label: 'T+30 Predicted Vol', val: forecastData.forecast_volatility[29] },
                            ].map((item, i) => (
                                <div key={i} className={`p-4 rounded-xl border border-border ${i === 1 ? 'bg-destructive text-destructive-foreground' : 'bg-card'}`}>
                                    <span className={`text-[11px] uppercase tracking-wider mb-1 block ${i === 1 ? 'text-white/80 dark:text-black/60' : 'text-zinc-500 dark:text-zinc-400'}`}>
                                        {item.label}
                                    </span>
                                    <div className={`text-base font-mono font-semibold ${i === 1 ? 'text-current' : 'text-foreground'}`}>
                                        {item.val ? item.val.toFixed(5) : '—'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Bottom row */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* GARCH Parameters */}
                    <div className="lg:col-span-8 bg-card rounded-xl p-5 border border-border">
                        <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-foreground" />
                            GARCH(1,1) Estimated Parameters
                        </h2>
                        
                        {metrics ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[240px]">
                                {[
                                    { symbol: 'ω (Omega)', name: 'Long-Run Variance Weight', val: metrics.parameters.omega.toExponential(4) },
                                    { symbol: 'α (Alpha)', name: 'Reaction to New Shocks', val: metrics.parameters.alpha.toFixed(4) },
                                    { symbol: 'β (Beta)', name: 'Volatility Persistence', val: metrics.parameters.beta.toFixed(4) },
                                ].map((p, i) => (
                                    <div key={i} className="flex flex-col justify-center p-6 rounded-xl bg-zinc-50 dark:bg-zinc-800/30 border border-border/50 text-center space-y-2">
                                        <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{p.name}</div>
                                        <div className="text-3xl font-bold font-mono tracking-tight text-foreground">{p.symbol.split('(')[0]}</div>
                                        <div className="text-xs text-zinc-400 pb-2">{p.symbol.split('(')[1]?.replace(')', '')}</div>
                                        <div className="text-xl font-mono text-primary font-semibold">{p.val}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-[240px] flex items-center justify-center border-2 border-dashed border-border rounded-xl">
                                <p className="text-zinc-500 dark:text-zinc-400 text-sm">Awaiting pipeline results…</p>
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-zinc-900 dark:bg-zinc-800 rounded-xl p-6 text-zinc-100 border border-zinc-700 h-full flex flex-col justify-center">
                            <h2 className="text-lg font-semibold mb-3">Standalone GARCH</h2>
                            <p className="text-zinc-300 dark:text-zinc-400 text-sm leading-relaxed mb-4">
                                The GARCH(1,1) model isolates and predicts volatility clustering—the tendency for large market moves to be followed by large moves, and quiet periods to remain quiet.
                            </p>
                            <p className="text-zinc-300 dark:text-zinc-400 text-sm leading-relaxed mb-4">
                                Alpha (α) measures how fast the model reacts to new market shocks (the ARCH effect).
                                Beta (β) measures how long past volatility persists (the GARCH effect).
                            </p>
                            <div className="mt-auto pt-4 border-t border-zinc-700/50">
                                <p className="text-zinc-500 dark:text-zinc-500 text-xs leading-relaxed">
                                    The sum of α + β must be {"<"} 1 for the model to be stable and mean-reverting. If it is mathematically stable, volatility will eventually collapse back to the long-run mean.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
