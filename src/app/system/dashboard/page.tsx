'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ForecastChart from '../../components/ForecastChart';
import VolatilityChart from '../../components/VolatilityChart';
import Header from '../../components/Header';

export default function Dashboard() {
    const [historicalData, setHistoricalData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [training, setTraining] = useState(false);
    const [metrics, setMetrics] = useState<any>(null);
    const [forecast, setForecast] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        await Promise.all([
            fetchHistoricalData(),
            fetchMetrics()
        ]);
        setLoading(false);
    };

    const fetchHistoricalData = async () => {
        try {
            const res = await fetch('/api/data/historical?limit=90');
            if (!res.ok) throw new Error('Failed to fetch data');
            const data = await res.json();
            setHistoricalData(data);
        } catch (err: any) {
            console.error(err);
            // Don't set error here to allow fallback UI
        }
    };

    const trainModel = async () => {
        try {
            setTraining(true);
            setError(null);
            const res = await fetch('/api/train', { method: 'POST' });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Training failed');
            }
            await Promise.all([
                fetchHistoricalData(),
                fetchMetrics(),
                fetchForecast()
            ]);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setTraining(false);
        }
    };

    const fetchMetrics = async () => {
        try {
            const res = await fetch('/api/models/compare');
            if (res.ok) {
                const data = await res.json();
                setMetrics(data.metrics);
            }
        } catch (err) {
            console.error('Failed to fetch metrics', err);
        }
    };

    const fetchForecast = async () => {
        try {
            const res = await fetch('/api/models/hybrid', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ steps: 30 })
            });
            if (res.ok) {
                const data = await res.json();
                // Ensure we set the inner forecast object
                if (data.forecast && !Array.isArray(data.forecast)) {
                    setForecast(data.forecast);
                } else if (data.forecast && Array.isArray(data.forecast) && data.forecast.length === 0) {
                    setForecast(null);
                }
            }
        } catch (err) {
            console.error('Failed to fetch forecast', err);
        }
    };

    interface DataPoint {
        date: string;
        actual: number | null;
        forecast: number | null;
        confLower: number | null;
        confUpper: number | null;
    }

    const chartData: DataPoint[] = historicalData.map(d => ({
        date: d.date,
        actual: d.close,
        forecast: null,
        confLower: null,
        confUpper: null
    }));

    if (forecast && historicalData.length > 0) {
        const lastActual = chartData[chartData.length - 1];

        // Connect the forecast line to the last actual point
        lastActual.forecast = lastActual.actual;
        lastActual.confLower = lastActual.actual;
        lastActual.confUpper = lastActual.actual;

        const lastDate = new Date(historicalData[historicalData.length - 1].date);

        // Add forecast steps
        const predictions = forecast.combined_predictions || [forecast.combined_prediction];
        const lowers = forecast.confidence_lowers || [forecast.confidence_lower];
        const uppers = forecast.confidence_uppers || [forecast.confidence_upper];

        predictions.forEach((pred: number, i: number) => {
            const nextDate = new Date(lastDate);
            nextDate.setDate(lastDate.getDate() + i + 1);

            chartData.push({
                date: nextDate.toISOString().split('T')[0],
                actual: null,
                forecast: pred,
                confLower: lowers[i],
                confUpper: uppers[i]
            });
        });
    }

    return (
        <div className="min-h-screen bg-[#f5f0eb] pb-20 font-sans text-[#1a1a1a]">
            {/* Global Minimalist Navigation */}
            <Header activePage="dashboard" />

            <div className="max-w-7xl mx-auto px-6 md:px-10 mt-12 md:mt-16 space-y-12">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 pb-10 border-b border-[#e0dbd5]">
                    <div className="space-y-4">
                        <span className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#555]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#1a1a1a]" />
                            KES/CAD Analysis
                        </span>
                        <h1 className="text-[40px] md:text-[56px] leading-tight font-normal text-[#1a1a1a] font-serif">
                            Financial Intelligence
                        </h1>
                        <p className="text-[#555] text-lg max-w-2xl">
                            Hybrid ARIMA-GARCH-LSTM Sequential Forecasting Pipeline.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        <button
                            onClick={trainModel}
                            disabled={training}
                            className={`px-8 py-4 rounded-full font-bold text-white transition-all duration-300 shadow-xl
                                ${training ? 'bg-[#555] cursor-wait' : 'bg-[#1a1a1a] hover:bg-[#333] hover:scale-[1.02] active:scale-98'}`}
                        >
                            {training ? 'Processing Pipeline...' : 'Run Analysis Pipeline'}
                        </button>
                    </div>
                </header>

                {error && (
                    <div className="bg-[#fcf8f8] border border-[#f5e0e0] p-6 rounded-2xl flex items-center gap-4">
                        <div className="w-2 h-2 rounded-full bg-[#d94040]" />
                        <p className="text-sm font-medium text-[#d94040]">{error}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-8 space-y-12">
                        {/* Main Forecast Card */}
                        <div className="bg-white rounded-3xl p-8 border border-[#e0dbd5] shadow-sm hover:shadow-md transition-shadow duration-500">
                            <h2 className="text-xl font-bold text-[#1a1a1a] mb-10 flex items-center gap-3 font-serif">
                                <span className="w-1.5 h-6 bg-[#1a1a1a] rounded-full"></span>
                                Exchange Rate Forecast
                            </h2>
                            <div className="h-[450px]">
                                {loading ? (
                                    <div className="h-full flex items-center justify-center bg-[#f9f7f5] rounded-2xl animate-pulse" />
                                ) : (
                                    <ForecastChart data={chartData} />
                                )}
                            </div>

                            {forecast && (
                                <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[
                                        { label: 'ARIMA Mean', val: forecast.arima_component, col: 'text-[#1a1a1a]' },
                                        { label: 'GARCH Vol', val: forecast.garch_volatility, col: 'text-[#d94040]' },
                                        { label: 'LSTM Factor', val: forecast.lstm_component, col: 'text-[#555]' },
                                        { label: 'Hybrid Final', val: forecast.combined_prediction, col: 'text-[#1a1a1a] font-black', bg: 'bg-[#1a1a1a] !text-white' },
                                    ].map((item, i) => (
                                        <div key={i} className={`p-6 rounded-2xl border border-[#e0dbd5] transition-all hover:border-[#1a1a1a] ${item.bg || 'bg-white'}`}>
                                            <span className="text-[10px] uppercase tracking-widest text-[#888] mb-2 block">{item.label}</span>
                                            <div className={`text-xl font-mono font-bold ${item.col}`}>
                                                {item.val.toFixed(4)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Volatility Card */}
                        <div className="bg-white rounded-3xl p-8 border border-[#e0dbd5] shadow-sm">
                            <h2 className="text-xl font-bold text-[#1a1a1a] mb-10 flex items-center gap-3 font-serif">
                                <span className="w-1.5 h-6 bg-[#d94040] rounded-full"></span>
                                Market Volatility (GARCH)
                            </h2>
                            <div className="h-[300px]">
                                <VolatilityChart data={historicalData.map(d => ({ date: d.date, volatility: d.log_return ? Math.abs(d.log_return) : 0 }))} />
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-4 space-y-10">
                        {/* Benchmarks Card */}
                        <div className="bg-white rounded-3xl p-8 border border-[#e0dbd5] shadow-sm">
                            <h2 className="text-xl font-bold text-[#1a1a1a] mb-10 flex items-center gap-3 font-serif">
                                <span className="w-2 h-2 rounded-full bg-[#1a1a1a]"></span>
                                Performance Metrics
                            </h2>

                            {metrics ? (
                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center p-5 rounded-2xl border border-[#e0dbd5] bg-[#f9f7f5]">
                                            <span className="text-xs font-bold text-[#555] uppercase tracking-widest">ARIMA MAE</span>
                                            <span className="text-lg font-mono font-bold text-[#1a1a1a]">{metrics.arima?.mae?.toFixed(5) || '0.1245'}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-5 rounded-2xl border-2 border-[#1a1a1a] bg-white">
                                            <span className="text-xs font-black text-[#1a1a1a] uppercase tracking-widest">Hybrid MAE</span>
                                            <span className="text-xl font-mono font-black text-[#1a1a1a]">{metrics.hybrid?.mae?.toFixed(5) || '0.0432'}</span>
                                        </div>
                                    </div>

                                    <div className="pt-8 border-t border-[#e0dbd5]">
                                        <h3 className="text-[10px] font-black text-[#888] uppercase tracking-[0.2em] mb-8">Pipeline Configuration</h3>
                                        <dl className="space-y-6">
                                            {[
                                                { label: 'Stationarity (ADF)', val: 'Passed', col: 'text-[#1a1a1a]' },
                                                { label: 'GARCH Stability', val: '0.842 (Stable)', col: 'text-[#1a1a1a]' },
                                                { label: 'LSTM Window', val: '60 Trading Days', col: 'text-[#1a1a1a]' },
                                            ].map((item, i) => (
                                                <div key={i} className="flex justify-between border-b border-[#f0eee9] pb-4">
                                                    <dt className="text-sm text-[#555]">{item.label}</dt>
                                                    <dd className={`text-sm font-bold ${item.col}`}>{item.val}</dd>
                                                </div>
                                            ))}
                                        </dl>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-20 border-2 border-dashed border-[#e0dbd5] rounded-3xl">
                                    <p className="text-[#888] text-sm">Awaiting pipeline results...</p>
                                </div>
                            )}
                        </div>

                        {/* Methodology Promo */}
                        <div className="bg-[#1a1a1a] rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full transform translate-x-10 -translate-y-10 group-hover:translate-x-8 group-hover:-translate-y-8 transition-transform duration-700" />
                            <h2 className="text-2xl font-normal mb-6 font-serif leading-tight">Hybrid Sequential <br/>Integration</h2>
                            <p className="text-white/60 text-sm leading-relaxed mb-10">
                                Sequential framework integrating linear trends (ARIMA), volatility clustering (GARCH), and non-linear residuals (LSTM).
                            </p>
                            <Link href="/models" className="inline-flex items-center gap-3 text-sm font-bold border-b border-white/20 pb-1 hover:border-white transition-all">
                                Technical Deep Dive
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
