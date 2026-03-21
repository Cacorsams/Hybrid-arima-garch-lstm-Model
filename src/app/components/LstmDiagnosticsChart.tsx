'use client';

import {
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart
} from 'recharts';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';

interface LstmDiagnosticPoint {
    epoch: number;
    train_loss: number;
    val_loss: number | null;
    train_mae: number | null;
    val_mae: number | null;
}

interface LstmDiagnosticsChartProps {
    data: LstmDiagnosticPoint[];
}

export default function LstmDiagnosticsChart({ data }: LstmDiagnosticsChartProps) {
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className="h-full w-full" />;

    if (!data || data.length === 0) {
        return (
            <div className="h-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-border border-dashed">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Run pipeline to show learning curves</p>
            </div>
        );
    }

    const isDark = theme === 'dark';
    const gridColor = 'var(--border)';
    const axisColor = 'var(--muted-foreground)';
    const tickColor = 'var(--muted-foreground)';
    
    // Loss curve colors
    const trainColor = isDark ? '#a78bfa' : '#8b5cf6'; // Violet
    const valColor = 'var(--destructive)'; // Red

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
                        Epoch {label}
                    </p>
                    {payload.map((entry: any, index: number) => {
                        if (entry.value == null) return null;
                        return (
                            <p key={index} className="flex justify-between gap-6 py-0.5" style={{ color: entry.color }}>
                                <span className="font-semibold">{entry.name}:</span>
                                <span className="font-mono">{Number(entry.value).toFixed(6)}</span>
                            </p>
                        );
                    })}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full h-full pb-2">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                    
                    <XAxis
                        dataKey="epoch"
                        stroke={axisColor}
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: tickColor }}
                        minTickGap={10}
                    />

                    <YAxis
                        stroke={axisColor}
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: tickColor }}
                        tickFormatter={(v) => v.toExponential(2)}
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

                    {/* Training Loss Line */}
                    <Line
                        type="monotone"
                        dataKey="train_loss"
                        name="Training Loss (MSE)"
                        stroke={trainColor}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4, fill: trainColor, strokeWidth: 0 }}
                        connectNulls
                    />

                    {/* Validation Loss Line */}
                    <Line
                        type="monotone"
                        dataKey="val_loss"
                        name="Validation Loss"
                        stroke={valColor}
                        strokeWidth={2}
                        strokeDasharray="4 4"
                        dot={false}
                        activeDot={{ r: 4, fill: valColor, strokeWidth: 0 }}
                        connectNulls
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
