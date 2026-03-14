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

interface VolatilityChartProps {
    data: any[];
}

export default function VolatilityChart({ data }: VolatilityChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <p className="text-gray-500">No volatility data available</p>
            </div>
        );
    }

    return (
        <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#d94040" stopOpacity={0.05} />
                            <stop offset="95%" stopColor="#d94040" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0dbd5" />
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
                            backgroundColor: 'white',
                            borderRadius: '16px',
                            border: '1px solid #e0dbd5',
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.05)',
                            padding: '12px'
                        }}
                    />
                    <Area
                        type="monotone"
                        dataKey="volatility"
                        stroke="#d94040"
                        fillOpacity={1}
                        fill="url(#colorVol)"
                        strokeWidth={2}
                        name="Conditional Volatility"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
