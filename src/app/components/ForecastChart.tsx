import {
    LineChart,
    Line,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ComposedChart
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
    const gridColor = isDark ? '#333' : '#e0dbd5';
    const axisColor = isDark ? '#666' : '#888';
    const tickColor = isDark ? '#aaa' : '#555';
    const mainColor = isDark ? '#fff' : '#1a1a1a';
    const tooltipBg = isDark ? '#1e1e1e' : '#fff';
    const tooltipBorder = isDark ? '#333' : '#e0dbd5';

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
                        // Skip if value is an array (from Area component) or not a number
                        if (Array.isArray(entry.value) || typeof entry.value !== 'number') return null;

                        return (
                            <p key={index} className="text-sm flex justify-between gap-4 py-1" style={{ color: entry.color }}>
                                <span className="font-bold">{entry.name}:</span>
                                <span className="font-mono">{entry.value.toFixed(5)}</span>
                            </p>
                        );
                    })}
                    {/* Display range if available in the payload */}
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

    return (
        <div className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                    data={data}
                    margin={{ top: 10, right: 10, left: 20, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={mainColor} stopOpacity={0.05} />
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
                        tick={{ fill: tickColor, fontSize: 10, fontWeight: 500 }}
                        dy={10}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        domain={[(dataMin: number) => dataMin * 0.995, (dataMax: number) => dataMax * 1.005]}
                        stroke={axisColor}
                        tick={{ fill: tickColor, fontSize: 10, fontWeight: 500 }}
                        tickFormatter={(value) => value.toFixed(3)}
                        axisLine={false}
                        tickLine={false}
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
                        fill={isDark ? '#fff' : '#1a1a1a'}
                        fillOpacity={isDark ? 0.1 : 0.05}
                        connectNulls
                    />

                    <Line
                        type="monotone"
                        dataKey="actual"
                        name="Historical Rate"
                        stroke={mainColor}
                        strokeWidth={2.5}
                        dot={false}
                        activeDot={{ r: 5, strokeWidth: 0, fill: mainColor }}
                        connectNulls
                    />

                    <Line
                        type="monotone"
                        dataKey="forecast"
                        name="Hybrid Prediction"
                        stroke="#d94040"
                        strokeWidth={3}
                        strokeDasharray="6 6"
                        dot={false}
                        activeDot={{ r: 5, strokeWidth: 0, fill: '#d94040' }}
                        connectNulls
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}
