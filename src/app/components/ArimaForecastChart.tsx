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
    Brush,
} from 'recharts';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';

interface ArimaChartDataPoint {
    date: string;
    actual: number | null;
    forecast: number | null;
    confLower: number | null;
    confUpper: number | null;
}

interface ArimaForecastChartProps {
    data: ArimaChartDataPoint[];
}

export default function ArimaForecastChart({ data }: ArimaForecastChartProps) {
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className="h-full w-full" />;

    if (!data || data.length === 0) {
        return (
            <div className="h-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-border">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">No data available — run the ARIMA pipeline</p>
            </div>
        );
    }

    const isDark = theme === 'dark';
    const gridColor = 'var(--border)';
    const axisColor = 'var(--muted-foreground)';
    const tickColor = 'var(--muted-foreground)';
    const mainColor = 'var(--foreground)';
    const tooltipBg = 'var(--card)';
    const tooltipBorder = 'var(--border)';
    const brushStroke = isDark ? '#444' : '#e0dbd5';
    const brushFill = isDark ? '#121212' : '#f9f7f5';

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div
                    className="p-4 shadow-lg rounded-xl border"
                    style={{ backgroundColor: tooltipBg, borderColor: tooltipBorder }}
                >
                    <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 border-b border-gray-100 dark:border-gray-800 pb-2">
                        {new Date(label).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    {payload.map((entry: any, index: number) => {
                        if (Array.isArray(entry.value) || typeof entry.value !== 'number') return null;
                        return (
                            <p key={index} className="text-sm flex justify-between gap-4 py-1" style={{ color: entry.color }}>
                                <span className="font-bold">{entry.name}:</span>
                                <span className="font-mono">{entry.value.toFixed(5)}</span>
                            </p>
                        );
                    })}
                    {payload[0]?.payload?.confLower != null && (
                        <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-800 text-[10px] text-gray-400 dark:text-gray-500 font-mono">
                            95% CI: {payload[0].payload.confLower.toFixed(4)} – {payload[0].payload.confUpper.toFixed(4)}
                        </div>
                    )}
                </div>
            );
        }
        return null;
    };

    const allValues = data.flatMap(d =>
        [d.actual, d.forecast, d.confLower, d.confUpper].filter((v): v is number => v !== null)
    );
    const minVal = Math.min(...allValues);
    const maxVal = Math.max(...allValues);
    const range = maxVal - minVal || 1;
    const domain: [number, number] = [minVal - range * 0.05, maxVal + range * 0.05];

    const brushStartIndex = Math.max(0, data.length - 120);

    return (
        <div className="w-full h-full pb-4">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="arimaActualGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor={mainColor} stopOpacity={0.12} />
                            <stop offset="95%" stopColor={mainColor} stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="arimaConfGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="var(--primary)" stopOpacity={0.15} />
                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.04} />
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
                            paddingBottom: '30px',
                            fontSize: '11px',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                        }}
                        iconType="circle"
                    />

                    {/* 95% CI band */}
                    <Area
                        type="monotone"
                        dataKey={(d) => [d.confLower, d.confUpper]}
                        name="95% Confidence"
                        stroke="none"
                        fill="url(#arimaConfGrad)"
                        fillOpacity={1}
                        connectNulls
                    />

                    {/* Historical actual */}
                    <Area
                        type="monotone"
                        dataKey="actual"
                        name="Historical Rate"
                        stroke={mainColor}
                        fill="url(#arimaActualGrad)"
                        strokeWidth={2.5}
                        dot={false}
                        activeDot={{ r: 5, strokeWidth: 0, fill: mainColor }}
                        connectNulls
                    />

                    {/* ARIMA prediction */}
                    <Line
                        type="monotone"
                        dataKey="forecast"
                        name="ARIMA Forecast"
                        stroke="var(--primary)"
                        strokeWidth={2.5}
                        strokeDasharray="6 4"
                        dot={false}
                        activeDot={{ r: 5, strokeWidth: 0, fill: 'var(--primary)' }}
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
