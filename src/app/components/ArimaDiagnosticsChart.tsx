'use client';

import {
    Line,
    Area,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ComposedChart,
    Cell
} from 'recharts';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';

interface DiagnosticPoint {
    date: string;
    actual: number;
    fitted: number;
    residual: number;
}

interface ArimaDiagnosticsChartProps {
    data: DiagnosticPoint[];
}

export default function ArimaDiagnosticsChart({ data }: ArimaDiagnosticsChartProps) {
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className="h-full w-full" />;

    if (!data || data.length === 0) {
        return (
            <div className="h-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border-border">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Run ARIMA Pipeline to load diagnostics</p>
            </div>
        );
    }

    const isDark = theme === 'dark';
    const gridColor = 'var(--border)';
    const axisColor = 'var(--muted-foreground)';
    const tickColor = 'var(--muted-foreground)';
    const actualColor = 'var(--foreground)';
    const fittedColor = 'var(--primary)';
    
    // Residual colors
    const posResColor = isDark ? '#4ade80' : '#16a34a'; // green
    const negResColor = isDark ? '#f87171' : '#dc2626'; // red

    const tooltipBg = 'var(--card)';
    const tooltipBorder = 'var(--border)';

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div
                    className="p-3 shadow-lg rounded-xl border text-sm"
                    style={{ backgroundColor: tooltipBg, borderColor: tooltipBorder }}
                >
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 border-b border-border pb-2">
                        {new Date(label).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    {payload.map((entry: any, index: number) => {
                        let color = entry.color;
                        if (entry.dataKey === 'residual') {
                            color = entry.value >= 0 ? posResColor : negResColor;
                        }
                        return (
                            <p key={index} className="flex justify-between gap-4 py-0.5" style={{ color }}>
                                <span className="font-semibold">{entry.name}:</span>
                                <span className="font-mono">{Number(entry.value).toFixed(5)}</span>
                            </p>
                        );
                    })}
                </div>
            );
        }
        return null;
    };

    // Calculate domains
    const prices = data.flatMap(d => [d.actual, d.fitted]);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const pRange = maxPrice - minPrice || 1;
    const priceDomain: [number, number] = [minPrice - pRange * 0.1, maxPrice + pRange * 0.1];

    const residuals = data.map(d => d.residual);
    const maxRes = Math.max(...residuals.map(Math.abs));
    // Scale residuals up visually so they don't overlap too much with the lines
    const resDomain: [number, number] = [-maxRes * 3, maxRes * 3];

    return (
        <div className="w-full h-full pb-2">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <defs>
                        <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={actualColor} stopOpacity={0.1} />
                            <stop offset="95%" stopColor={actualColor} stopOpacity={0} />
                        </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                    
                    <XAxis
                        dataKey="date"
                        tickFormatter={(v) => {
                            if (!v) return '';
                            return new Date(v).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                        }}
                        stroke={axisColor}
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: tickColor }}
                        minTickGap={20}
                    />

                    {/* Primary Y-axis for Log Returns (Actual & Fitted) */}
                    <YAxis
                        yAxisId="left"
                        domain={priceDomain}
                        stroke={axisColor}
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: tickColor }}
                        tickFormatter={(v) => v.toFixed(3)}
                    />

                    {/* Secondary Y-axis for Residuals */}
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                        domain={resDomain}
                        hide
                    />

                    <Tooltip content={<CustomTooltip />} cursor={{ fill: isDark ? '#ffffff0a' : '#0000000a' }} />
                    
                    <Legend
                        verticalAlign="top"
                        align="right"
                        wrapperStyle={{
                            paddingBottom: '20px',
                            fontSize: '11px',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                        }}
                        iconType="circle"
                    />

                    {/* Residuals Bar Chart (tied to right y-axis) */}
                    <Bar
                        yAxisId="right"
                        dataKey="residual"
                        name="Model Residual (Error)"
                        barSize={6}
                        radius={[2, 2, 2, 2]}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.residual >= 0 ? posResColor : negResColor} fillOpacity={0.8} />
                        ))}
                    </Bar>

                    {/* Actual Log Returns Area */}
                    <Area
                        yAxisId="left"
                        type="monotone"
                        dataKey="actual"
                        name="Actual Return"
                        stroke={actualColor}
                        fill="url(#actualGrad)"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4, fill: actualColor, strokeWidth: 0 }}
                    />

                    {/* Fitted ARIMA Line */}
                    <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="fitted"
                        name="ARIMA Fitted"
                        stroke={fittedColor}
                        strokeWidth={2}
                        strokeDasharray="4 4"
                        dot={false}
                        activeDot={{ r: 4, fill: fittedColor, strokeWidth: 0 }}
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}
