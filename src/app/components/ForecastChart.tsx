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

interface ForecastChartProps {
    data: any[];
}

export default function ForecastChart({ data }: ForecastChartProps) {
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className="h-full w-full" />;

    if (!data || data.length === 0) {
        return (
            <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-gray-500 dark:text-gray-400">No data available for chart</p>
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
    
    // Brush styling
    const brushStroke = isDark ? '#444' : '#e0dbd5';
    const brushFill = isDark ? '#121212' : '#f9f7f5';

    // Custom tooltip to format dates and values cleanly
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div 
                    className="p-4 shadow-lg rounded-xl border"
                    style={{ backgroundColor: tooltipBg, borderColor: tooltipBorder }}
                >
                    <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 border-b border-gray-50 dark:border-gray-800 pb-2">
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
                        <div className="mt-2 pt-2 border-t border-gray-50 dark:border-gray-800 text-[10px] text-gray-400 dark:text-gray-500 font-mono">
                            Range: {payload[0].payload.confLower.toFixed(4)} - {payload[0].payload.confUpper.toFixed(4)}
                        </div>
                    )}
                </div>
            );
        }
        return null;
    };

    // Calculate dynamic Y domain with 5% padding
    // We filter out nulls to avoid NaN in Math functions
    const allValues = data.flatMap(d => [d.actual, d.forecast, d.confLower, d.confUpper].filter((v): v is number => v !== null));
    const minVal = Math.min(...allValues);
    const maxVal = Math.max(...allValues);
    const range = maxVal - minVal;
    const domain = [minVal - (range * 0.05), maxVal + (range * 0.05)];

    // Default Brush view: show last 120 days
    const brushStartIndex = Math.max(0, data.length - 120);

    return (
        <div className="w-full h-full pb-4">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                    data={data}
                    margin={{ top: 10, right: 10, left: 20, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={mainColor} stopOpacity={0.15} />
                            <stop offset="95%" stopColor={mainColor} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                    <XAxis
                        dataKey="date"
                        tickFormatter={(value) => {
                            if (!value) return '';
                            const date = new Date(value);
                            return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
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
                        tickFormatter={(value) => value.toFixed(3)}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: gridColor, strokeWidth: 1 }} />
                    <Legend
                        verticalAlign="top"
                        align="right"
                        wrapperStyle={{ paddingBottom: '30px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}
                        iconType="circle"
                    />

                    <Area
                        type="monotone"
                        dataKey={(d) => [d.confLower, d.confUpper]}
                        name="95% Confidence"
                        stroke="none"
                        fill="var(--primary)"
                        fillOpacity={0.1}
                        connectNulls
                    />

                    <Area
                        type="monotone"
                        dataKey="actual"
                        name="Historical Rate"
                        stroke={mainColor}
                        fill="url(#colorActual)"
                        strokeWidth={2.5}
                        dot={false}
                        activeDot={{ r: 5, strokeWidth: 0, fill: mainColor }}
                        connectNulls
                    />

                    <Line
                        type="monotone"
                        dataKey="forecast"
                        name="Hybrid Prediction"
                        stroke="var(--primary)"
                        strokeWidth={3}
                        strokeDasharray="6 6"
                        dot={false}
                        activeDot={{ r: 5, strokeWidth: 0, fill: "var(--primary)" }}
                        connectNulls
                    />

                    <Brush 
                        dataKey="date" 
                        height={35} 
                        stroke={brushStroke}
                        fill={brushFill}
                        startIndex={brushStartIndex}
                        travellerWidth={10}
                        gap={1}
                        tickFormatter={() => ""}
                    >
                        <ComposedChart>
                             <Area dataKey="actual" fill={isDark ? "#333" : "#e0dbd5"} stroke="none" fillOpacity={0.5} />
                        </ComposedChart>
                    </Brush>
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}
