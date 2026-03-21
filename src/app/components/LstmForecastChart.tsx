'use client';

import {
    Line,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ComposedChart,
    Brush
} from 'recharts';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';

interface LstmChartDataPoint {
    date: string;
    actual: number | null;
    forecast: number | null;
}

interface LstmForecastChartProps {
    data: LstmChartDataPoint[];
}

export default function LstmForecastChart({ data }: LstmForecastChartProps) {
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className="h-full w-full" />;

    if (!data || data.length === 0) {
        return (
            <div className="h-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-border">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Run LSTM Pipeline to generate forecast</p>
            </div>
        );
    }

    const isDark = theme === 'dark';
    const gridColor = 'var(--border)';
    const axisColor = 'var(--muted-foreground)';
    const tickColor = 'var(--muted-foreground)';
    const actualColor = 'var(--foreground)';
    // Use a distinct color for LSTM (e.g. Violet/Purple)
    const forecastColor = isDark ? '#a78bfa' : '#8b5cf6';

    const tooltipBg = 'var(--card)';
    const tooltipBorder = 'var(--border)';
    const brushStroke = isDark ? '#444' : '#e0dbd5';
    const brushFill = isDark ? '#121212' : '#f9f7f5';

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div
                    className="p-3 shadow-lg rounded-xl border"
                    style={{ backgroundColor: tooltipBg, borderColor: tooltipBorder }}
                >
                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 border-b border-border pb-2">
                        {new Date(label).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    {payload.map((entry: any, index: number) => {
                        if (entry.value == null) return null;
                        return (
                            <p key={index} className="flex justify-between gap-6 py-0.5 text-sm" style={{ color: entry.color }}>
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

    const allVals = data.flatMap(d => [d.actual, d.forecast]).filter((v): v is number => v !== null);
    const minVal = Math.min(...allVals);
    const maxVal = Math.max(...allVals);
    const range = maxVal - minVal || 1;
    const domain: [number, number] = [minVal - range * 0.05, maxVal + range * 0.05];

    const brushStartIndex = Math.max(0, data.length - 120);

    return (
        <div className="w-full h-full pb-2">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <defs>
                        <linearGradient id="lstmActualGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={actualColor} stopOpacity={0.15} />
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
                        minTickGap={30}
                    />

                    <YAxis
                        domain={domain}
                        stroke={axisColor}
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: tickColor }}
                        tickFormatter={(v) => v.toFixed(3)}
                    />

                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: gridColor, strokeWidth: 1 }} />
                    
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

                    {/* Historical Actuals Area */}
                    <Area
                        type="monotone"
                        dataKey="actual"
                        name="Historical Price"
                        stroke={actualColor}
                        fill="url(#lstmActualGrad)"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4, fill: actualColor, strokeWidth: 0 }}
                        connectNulls
                    />

                    {/* LSTM Forecast Line */}
                    <Line
                        type="monotone"
                        dataKey="forecast"
                        name="LSTM Forecast"
                        stroke={forecastColor}
                        strokeWidth={2.5}
                        strokeDasharray="4 4"
                        dot={false}
                        activeDot={{ r: 4, fill: forecastColor, strokeWidth: 0 }}
                        connectNulls
                    />

                    <Brush
                        dataKey="date"
                        height={32}
                        stroke={brushStroke}
                        fill={brushFill}
                        startIndex={brushStartIndex}
                        travellerWidth={10}
                        gap={1}
                        tickFormatter={() => ''}
                    >
                        <ComposedChart>
                            <Area dataKey="actual" fill={isDark ? '#333' : '#e0dbd5'} stroke="none" fillOpacity={0.5} />
                        </ComposedChart>
                    </Brush>
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}
