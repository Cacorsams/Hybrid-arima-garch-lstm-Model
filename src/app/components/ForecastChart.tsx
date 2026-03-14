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

interface ForecastChartProps {
    data: any[];
}

export default function ForecastChart({ data }: ForecastChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-500">No data available for chart</p>
            </div>
        );
    }

    // Custom tooltip to format dates and values cleanly
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 border border-gray-200 shadow-lg rounded-xl">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 border-b border-gray-50 pb-2">
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
                        <div className="mt-2 pt-2 border-t border-gray-50 text-[10px] text-gray-400 font-mono">
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
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                        </linearGradient>
                        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f4" />
                    <XAxis
                        dataKey="date"
                        tickFormatter={(value) => {
                            if (!value) return '';
                            const date = new Date(value);
                            return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                        }}
                        stroke="#94a3b8"
                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                        dy={10}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        domain={['auto', 'auto']}
                        stroke="#94a3b8"
                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                        tickFormatter={(value) => value.toFixed(3)}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e2e8f0', strokeWidth: 1 }} />
                    <Legend
                        verticalAlign="top"
                        align="right"
                        wrapperStyle={{ paddingBottom: '20px', fontSize: '12px', fontWeight: 700 }}
                        iconType="circle"
                    />

                    <Area
                        type="monotone"
                        dataKey={(d) => [d.confLower, d.confUpper]}
                        name="95% Confidence"
                        stroke="none"
                        fill="#10B981"
                        fillOpacity={0.15}
                        connectNulls
                    />

                    <Line
                        type="monotone"
                        dataKey="actual"
                        name="Historical Rate"
                        stroke="#4F46E5"
                        strokeWidth={3}
                        dot={false}
                        activeDot={{ r: 6, strokeWidth: 0, fill: '#4F46E5' }}
                        connectNulls
                    />

                    <Line
                        type="monotone"
                        dataKey="forecast"
                        name="Hybrid Prediction"
                        stroke="#10B981"
                        strokeWidth={4}
                        strokeDasharray="8 8"
                        dot={false}
                        activeDot={{ r: 6, strokeWidth: 0, fill: '#10B981' }}
                        connectNulls
                        filter="url(#glow)"
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}
