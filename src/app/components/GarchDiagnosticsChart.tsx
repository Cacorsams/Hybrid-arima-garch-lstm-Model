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

interface GarchPoint {
    date: string;
    empiricalVol: number | null; // actual abs_return
    condVol: number | null;      // GARCH fitted in-sample
    forecastVol: number | null;  // GARCH future prediction
}

interface GarchDiagnosticsChartProps {
    data: GarchPoint[];
}

export default function GarchDiagnosticsChart({ data }: GarchDiagnosticsChartProps) {
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className="h-full w-full" />;

    if (!data || data.length === 0) {
        return (
            <div className="h-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-border mt-2">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Run GARCH Pipeline to load volatility</p>
            </div>
        );
    }

    const isDark = theme === 'dark';
    const gridColor = 'var(--border)';
    const axisColor = 'var(--muted-foreground)';
    const tickColor = 'var(--muted-foreground)';
    
    // GARCH colors
    const condVolColor = 'var(--destructive)'; // Red for risk/volatility
    const empiricalColor = 'var(--foreground)'; // White/Black for actuals

    const tooltipBg = 'var(--card)';
    const tooltipBorder = 'var(--border)';
    const brushStroke = isDark ? '#444' : '#e0dbd5';
    const brushFill = isDark ? '#121212' : '#f9f7f5';

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div
                    className="p-3 shadow-lg rounded-xl border text-sm"
                    style={{ backgroundColor: tooltipBg, borderColor: tooltipBorder }}
                >
                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 border-b border-border pb-2">
                        {new Date(label).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    {payload.map((entry: any, index: number) => {
                        if (entry.value == null) return null;
                        return (
                            <p key={index} className="flex justify-between gap-6 py-0.5" style={{ color: entry.color }}>
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

    const allVals = data.flatMap(d => [d.empiricalVol, d.condVol, d.forecastVol]).filter((v): v is number => v !== null);
    const maxVal = Math.max(...allVals, 0);
    const domain: [number, number] = [0, maxVal * 1.05];

    const brushStartIndex = Math.max(0, data.length - 120);

    return (
        <div className="w-full h-full pb-2">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <defs>
                        <linearGradient id="empiricalGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={empiricalColor} stopOpacity={0.15} />
                            <stop offset="95%" stopColor={empiricalColor} stopOpacity={0} />
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

                    {/* Empirical Absolute Returns Area */}
                    <Area
                        type="monotone"
                        dataKey="empiricalVol"
                        name="Historical Magnitude"
                        stroke={empiricalColor}
                        fill="url(#empiricalGrad)"
                        strokeWidth={1}
                        dot={false}
                        activeDot={{ r: 4, fill: empiricalColor, strokeWidth: 0 }}
                    />

                    {/* Fitted Conditional Volatility */}
                    <Line
                        type="monotone"
                        dataKey="condVol"
                        name="Fitted GARCH Vol"
                        stroke={condVolColor}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4, fill: condVolColor, strokeWidth: 0 }}
                        connectNulls
                    />

                    {/* Out of Sample Forecast Volatility */}
                    <Line
                        type="monotone"
                        dataKey="forecastVol"
                        name="Forecast GARCH Vol"
                        stroke={condVolColor}
                        strokeWidth={2}
                        strokeDasharray="4 4"
                        dot={false}
                        activeDot={{ r: 4, fill: condVolColor, strokeWidth: 0 }}
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
                            <Area dataKey="condVol" fill={condVolColor} stroke="none" fillOpacity={0.2} />
                        </ComposedChart>
                    </Brush>
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}
