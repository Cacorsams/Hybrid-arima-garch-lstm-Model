'use client';

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';

interface VolatilityChartProps {
    data: any[];
}

export default function VolatilityChart({ data }: VolatilityChartProps) {
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className="h-full w-full" />;

    if (!data || data.length === 0) {
        return (
            <div className="h-64 flex items-center justify-center bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border-2 border-dashed border-border">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">No volatility data available</p>
            </div>
        );
    }

    const isDark = theme === 'dark';
    const gridColor = 'var(--border)';
    const tooltipBg = 'var(--card)';
    const tooltipBorder = 'var(--border)';
    const tooltipText = 'var(--foreground)';

    return (
        <div className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 0, right: 0, left: -40, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.15} />
                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                    <XAxis
                        dataKey="date"
                        hide
                    />
                    <YAxis
                        hide
                        domain={['auto', 'auto']}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: tooltipBg,
                            borderRadius: '16px',
                            border: `1px solid ${tooltipBorder}`,
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                            padding: '12px',
                            color: tooltipText
                        }}
                        itemStyle={{ color: 'var(--primary)' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="volatility"
                        stroke="var(--primary)"
                        fillOpacity={1}
                        fill="url(#colorVol)"
                        strokeWidth={2.5}
                        name="Conditional Volatility"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
