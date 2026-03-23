"use client";

import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  ReferenceLine,
  Legend,
} from 'recharts';
import { ChevronDown, Monitor, Share, HelpCircle, Settings } from 'lucide-react';

// --- STYLES & COLORS ---
const colors = {
  bg: 'transparent',
  panelBg: 'transparent',
  cyan: '#00e5ff',
  magenta: '#ff4081',
  green: '#69f0ae',
  yellow: '#ffd740',
  textMain: 'currentColor',
  textMuted: '#8892b0',
  gridLine: '#27272a',
  border: '#27272a',
};

// --- CUSTOM COMPONENTS ---
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const bouncePayload = payload.find((p: any) => p.dataKey === 'volatility');
    if (bouncePayload) {
      return (
        <div className="bg-white text-black p-2 rounded shadow-lg text-xs font-bold border border-gray-200">
          <div className="text-gray-500 font-normal mb-1">Volatility</div>
          <div className="text-gray-400 font-normal">{label}</div>
          <div className="text-lg">{bouncePayload.value?.toFixed(5)}</div>
        </div>
      );
    }
    return (
      <div className="bg-popover border border-border p-2 rounded text-xs text-popover-foreground">
        <p>{`${label}`}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(5) : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const PanelHeader = ({ title }: { title: string }) => (
  <div className="flex justify-between items-center mb-4">
    <h2 className="text-zinc-500 text-xs font-bold tracking-wider uppercase">
      {title}
    </h2>
    <button className="text-zinc-500 hover:text-foreground text-xs flex items-center gap-1 transition-colors">
      <Settings size={12} /> OPTIONS
    </button>
  </div>
);

const MetricCard = ({
  title,
  value,
  color,
  data,
  subValue = '',
  subLabel = '',
}: {
  title: string;
  value: string;
  color: string;
  data: any[];
  subValue?: string;
  subLabel?: string;
}) => (
  <div className="flex flex-col h-full">
    <div className="mb-1">
      <h3 className="text-zinc-500 text-[10px] font-bold tracking-wider uppercase">
        {title}
      </h3>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold" style={{ color }}>
          {value}
        </span>
      </div>
    </div>
    <div className="flex-grow min-h-[40px] mt-2 relative">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="val"
            stroke={color}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
      {subValue && (
        <div className="absolute bottom-0 left-0 text-[10px]" style={{ color }}>
          {subValue} <span className="text-zinc-500">{subLabel}</span>
        </div>
      )}
    </div>
  </div>
);

// --- MAIN DASHBOARD COMPONENT ---
export default function AnalyticsDashboard() {
  // Chart data state
  const [arimaChartData, setArimaChartData] = useState<any[]>([]);
  const [lstmChartData, setLstmChartData] = useState<any[]>([]);
  const [historyChartData, setHistoryChartData] = useState<any[]>([]);

  // KPI metrics state
  const [arimaMetrics, setArimaMetrics] = useState<any>(null);
  const [garchMetrics, setGarchMetrics] = useState<any>(null);
  const [lstmMetrics, setLstmMetrics] = useState<any>(null);
  const [historyStats, setHistoryStats] = useState<{ latestClose: number; avgReturn: number; dataPoints: number } | null>(null);

  // Sparkline data state (derived from real data)
  const [sparklines, setSparklines] = useState<any[][]>([[], [], [], [], [], []]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        // Fetch from all data endpoints in parallel
        const [
          histRes,
          arimaForecastRes,
          arimaMetricsRes,
          garchForecastRes,
          garchMetricsRes,
          lstmForecastRes,
          lstmMetricsRes,
        ] = await Promise.allSettled([
          fetch('/api/data/historical?limit=200'),
          fetch('/api/data/arima?action=forecast&steps=30'),
          fetch('/api/data/arima?action=metrics'),
          fetch('/api/data/garch?action=forecast&steps=30'),
          fetch('/api/data/garch?action=metrics'),
          fetch('/api/data/lstm?action=forecast&steps=30'),
          fetch('/api/data/lstm?action=metrics'),
        ]);

        // --- Historical Exchange Rates ---
        if (histRes.status === 'fulfilled' && histRes.value.ok) {
          const hist = await histRes.value.json();
          if (Array.isArray(hist) && hist.length > 0) {
            const chartPoints = hist.slice(-60).map((d: any, i: number) => ({
              time: i,
              close: parseFloat(d.close),
              logReturn: parseFloat(d.log_return || 0),
            }));
            setHistoryChartData(chartPoints);

            const latestClose = parseFloat(hist[hist.length - 1]?.close || 0);
            const returns = hist.map((d: any) => parseFloat(d.log_return || 0)).filter(Boolean);
            const avgReturn = returns.reduce((s: number, v: number) => s + v, 0) / returns.length;
            setHistoryStats({ latestClose, avgReturn, dataPoints: hist.length });

            // Sparklines from last 10 close prices
            const closes = hist.slice(-10).map((d: any) => ({ val: parseFloat(d.close) }));
            const logRets = hist.slice(-10).map((d: any) => ({ val: Math.abs(parseFloat(d.log_return || 0)) * 1000 }));
            setSparklines(prev => {
              const s = [...prev];
              s[0] = closes;
              s[3] = logRets;
              return s;
            });
          }
        }

        // --- ARIMA Forecast ---
        let arimaMedianPrice = 0;
        if (arimaForecastRes.status === 'fulfilled' && arimaForecastRes.value.ok) {
          const arimaData = await arimaForecastRes.value.json();
          if (arimaData?.predictions && Array.isArray(arimaData.predictions)) {
            arimaMedianPrice = arimaData.predictions[0] || 0;
            const chartPoints = arimaData.predictions.map((pred: number, i: number) => ({
              x: `T+${i + 1}`,
              load: Math.round(pred * 10000), // scale for bar chart visual
              volatility: arimaData.confidence_uppers?.[i]
                ? ((arimaData.confidence_uppers[i] - arimaData.confidence_lowers[i]) / 2 * 100)
                : 0,
            }));
            setArimaChartData(chartPoints);
            // Sparkline from ARIMA predictions
            const spark = arimaData.predictions.slice(0, 10).map((v: number) => ({ val: v }));
            setSparklines(prev => {
              const s = [...prev];
              s[1] = spark;
              return s;
            });
          }
        }

        // --- ARIMA Metrics ---
        if (arimaMetricsRes.status === 'fulfilled' && arimaMetricsRes.value.ok) {
          const m = await arimaMetricsRes.value.json();
          setArimaMetrics(m);
        }

        // --- GARCH Metrics ---
        if (garchMetricsRes.status === 'fulfilled' && garchMetricsRes.value.ok) {
          const m = await garchMetricsRes.value.json();
          setGarchMetrics(m);
        }

        // --- LSTM Forecast ---
        if (lstmForecastRes.status === 'fulfilled' && lstmForecastRes.value.ok) {
          const lstmData = await lstmForecastRes.value.json();
          if (lstmData?.predictions && Array.isArray(lstmData.predictions)) {
            const chartPoints = lstmData.predictions.map((pred: number, i: number) => ({
              x: `T+${i + 1}`,
              load: Math.round(pred * 10000),
              volatility: 0,
            }));

            // Overlay with GARCH volatility if available
            if (garchForecastRes.status === 'fulfilled' && garchForecastRes.value.ok) {
              const garchData = await garchForecastRes.value.json();
              if (garchData?.forecast_volatility) {
                chartPoints.forEach((pt: any, i: number) => {
                  pt.volatility = (garchData.forecast_volatility[i] || 0) * 10000;
                });
              }
            }

            setLstmChartData(chartPoints);
            const spark = lstmData.predictions.slice(0, 10).map((v: number) => ({ val: v }));
            setSparklines(prev => {
              const s = [...prev];
              s[2] = spark;
              s[4] = spark;
              s[5] = spark;
              return s;
            });
          }
        }

        // --- LSTM Metrics ---
        if (lstmMetricsRes.status === 'fulfilled' && lstmMetricsRes.value.ok) {
          const m = await lstmMetricsRes.value.json();
          setLstmMetrics(m);
        }

      } catch (err) {
        console.error('Dashboard data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  // Format helper
  const fmt = (n: number | undefined | null, decimals = 5) =>
    n != null ? n.toFixed(decimals) : '—';
  const fmtPct = (n: number | undefined | null) =>
    n != null ? `${(n * 100).toFixed(3)}%` : '—';

  // Compute stats for header panels
  const arimaFirstPred = arimaChartData[0]?.load ? (arimaChartData[0].load / 10000) : null;
  const lstmFirstPred = lstmChartData[0]?.load ? (lstmChartData[0].load / 10000) : null;

  const histClose = historyStats?.latestClose;
  const histSpark = historyChartData.slice(-10).map((d: any) => ({ val: d.close }));

  return (
    <div className="space-y-6 animate-in fade-in duration-700 font-sans">
      {/* HEADER */}
      <header className="flex justify-between items-center mb-6 pb-4 border-b border-border">
        <div className="flex items-center gap-2 cursor-pointer group">
          <h1 className="text-xl md:text-2xl font-semibold text-foreground tracking-tight uppercase">
            KES/CAD FORECAST:{' '}
            <span className="text-zinc-500">LAST 7 DAYS MEDIAN ANALYSIS</span>
          </h1>
          <ChevronDown
            className="text-zinc-500 group-hover:text-foreground transition-colors"
            size={20}
          />
        </div>
        <div className="flex items-center gap-4 text-zinc-500">
          <Monitor className="hover:text-foreground cursor-pointer transition-colors" size={18} />
          <Share className="hover:text-foreground cursor-pointer transition-colors" size={18} />
          <HelpCircle className="hover:text-foreground cursor-pointer transition-colors" size={18} />
        </div>
      </header>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">

        {/* TOP LEFT: ARIMA Forecast vs CI Width */}
        <div className="flex flex-col h-[350px] bg-card rounded-xl p-5 border border-border">
          <PanelHeader title="ARIMA FORECAST VS CONFIDENCE INTERVAL" />
          <div className="flex-grow relative">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={arimaChartData}
                margin={{ top: 20, right: 0, left: -20, bottom: 0 }}
              >
                <CartesianGrid stroke={colors.gridLine} vertical={false} />
                <XAxis
                  dataKey="x"
                  tick={{ fill: colors.textMuted, fontSize: 10 }}
                  axisLine={{ stroke: colors.gridLine }}
                  tickLine={false}
                  dy={10}
                  interval={4}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fill: colors.textMuted, fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => val >= 1000 ? `${(val / 10000).toFixed(3)}` : val}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: colors.textMuted, fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `${(val / 100).toFixed(3)}`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                <Bar yAxisId="left" dataKey="load" name="Predicted Rate (×10k)" fill={colors.cyan} barSize={12} radius={[2, 2, 0, 0]} />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="volatility"
                  name="CI Width"
                  stroke={colors.magenta}
                  strokeWidth={2}
                  dot={false}
                />
                {arimaChartData.length > 0 && (
                  <ReferenceLine yAxisId="left" x="T+1" stroke={colors.cyan} strokeDasharray="3 3" />
                )}
                <text x="15%" y="10%" fill={colors.cyan} fontSize={10} className="hidden sm:block">
                  {arimaMetrics ? `ARIMA${arimaMetrics.order ? `(${arimaMetrics.order.join(',')})` : ''} | MAE: ${fmt(arimaMetrics.mae, 6)}` : loading ? 'Loading…' : 'Data unavailable'}
                </text>
              </ComposedChart>
            </ResponsiveContainer>
            <div className="absolute bottom-[-20px] w-full flex justify-center gap-6 text-[10px] text-zinc-500">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-[#00e5ff]"></div> Predicted Rate
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-[2px] bg-[#ff4081]"></div> CI Width
              </div>
            </div>
          </div>
        </div>

        {/* TOP RIGHT: LSTM Forecast vs GARCH Volatility */}
        <div className="flex flex-col h-[350px] bg-card rounded-xl p-5 border border-border">
          <PanelHeader title="LSTM FORECAST VS GARCH VOLATILITY" />
          <div className="flex-grow relative">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={lstmChartData}
                margin={{ top: 20, right: 0, left: -20, bottom: 0 }}
              >
                <CartesianGrid stroke={colors.gridLine} vertical={false} />
                <XAxis
                  dataKey="x"
                  tick={{ fill: colors.textMuted, fontSize: 10 }}
                  axisLine={{ stroke: colors.gridLine }}
                  tickLine={false}
                  dy={10}
                  interval={4}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fill: colors.textMuted, fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `${(val / 10000).toFixed(3)}`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: colors.textMuted, fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `${(val / 10000).toFixed(4)}`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                <Bar yAxisId="left" dataKey="load" name="LSTM Rate (×10k)" fill={colors.cyan} barSize={12} radius={[2, 2, 0, 0]} />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="volatility"
                  name="GARCH Vol (×10k)"
                  stroke={colors.magenta}
                  strokeWidth={2}
                  dot={false}
                />
                {lstmChartData.length > 0 && (
                  <ReferenceLine yAxisId="left" x="T+1" stroke={colors.cyan} strokeDasharray="3 3" />
                )}
                <text x="30%" y="10%" fill={colors.cyan} fontSize={10} className="hidden sm:block">
                  {lstmMetrics ? `Epochs: ${lstmMetrics.epochs} | Final Loss: ${fmt(lstmMetrics.final_loss, 6)}` : loading ? 'Loading…' : 'Data unavailable'}
                </text>
              </ComposedChart>
            </ResponsiveContainer>
            <div className="absolute bottom-[-20px] w-full flex justify-center gap-6 text-[10px] text-zinc-500">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-[#00e5ff]"></div> LSTM Rate
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-[2px] bg-[#ff4081]"></div> GARCH Volatility
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM LEFT: Historical Close vs Log Return */}
        <div className="flex flex-col h-[350px] bg-card rounded-xl p-5 border border-border mt-8 lg:mt-0">
          <PanelHeader title="HISTORICAL EXCHANGE RATE VS LOG RETURN" />

          {/* Stat Chips Header */}
          <div className="flex justify-between mb-4 border-b border-border pb-2">
            <div>
              <div className="text-[#00e5ff] text-xs mb-1">Latest KES/CAD</div>
              <div className="text-[#00e5ff] text-2xl font-bold">
                {historyStats ? fmt(historyStats.latestClose, 5) : '—'}
              </div>
            </div>
            <div>
              <div className="text-[#ff4081] text-xs mb-1">Data Points</div>
              <div className="text-[#ff4081] text-2xl font-bold">
                {historyStats ? `${historyStats.dataPoints}` : '—'}
              </div>
            </div>
            <div>
              <div className="text-white text-xs mb-1">Avg Log Return</div>
              <div className="text-white text-2xl font-bold">
                {historyStats ? fmtPct(historyStats.avgReturn) : '—'}
              </div>
            </div>
          </div>

          <div className="flex-grow relative">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={historyChartData}
                margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
              >
                <CartesianGrid stroke={colors.gridLine} vertical={false} />
                <XAxis dataKey="time" hide />
                <YAxis
                  yAxisId="left"
                  tick={{ fill: colors.cyan, fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `${val.toFixed(4)}`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: colors.magenta, fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `${(val * 100).toFixed(2)}%`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111122', borderColor: '#1e1e3f' }}
                  itemStyle={{ fontSize: 12 }}
                  labelStyle={{ display: 'none' }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="close"
                  name="Close"
                  stroke={colors.cyan}
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="logReturn"
                  name="Log Return"
                  stroke={colors.magenta}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* BOTTOM RIGHT: Model KPIs Grid */}
        <div className="flex flex-col h-[350px] bg-card rounded-xl p-5 border border-border mt-8 lg:mt-0">
          <PanelHeader title="MODEL KPIs" />

          <div className="grid grid-cols-3 grid-rows-2 gap-x-4 gap-y-8 h-full pt-2">
            {/* Row 1 */}
            <MetricCard
              title="ARIMA MAE"
              value={arimaMetrics ? fmt(arimaMetrics.mae, 5) : '—'}
              color={colors.cyan}
              data={sparklines[0]?.length ? sparklines[0] : [{ val: 0 }]}
              subValue={arimaMetrics ? `ARIMA(${arimaMetrics.order?.join(',') || '?'})` : ''}
            />
            <MetricCard
              title="ARIMA RMSE"
              value={arimaMetrics ? fmt(arimaMetrics.rmse, 5) : '—'}
              color={colors.green}
              data={sparklines[1]?.length ? sparklines[1] : [{ val: 0 }]}
            />
            <MetricCard
              title="GARCH Persist."
              value={garchMetrics ? fmt(garchMetrics.persistence, 4) : '—'}
              color={colors.green}
              data={sparklines[2]?.length ? sparklines[2] : [{ val: 0 }]}
              subValue={garchMetrics?.is_stable ? 'Stable' : garchMetrics ? 'Explosive' : ''}
            />
            {/* Row 2 */}
            <MetricCard
              title="LSTM Epochs"
              value={lstmMetrics ? `${lstmMetrics.epochs}` : '—'}
              color={colors.cyan}
              data={sparklines[3]?.length ? sparklines[3] : [{ val: 0 }]}
              subValue={lstmMetrics ? fmt(lstmMetrics.final_loss, 6) : ''}
              subLabel="loss"
            />
            <MetricCard
              title="LSTM Val Loss"
              value={lstmMetrics ? fmt(lstmMetrics.final_val_loss, 5) : '—'}
              color={colors.green}
              data={sparklines[4]?.length ? sparklines[4] : [{ val: 0 }]}
            />
            <MetricCard
              title="ARIMA MAPE"
              value={arimaMetrics ? `${fmt(arimaMetrics.mape, 3)}%` : '—'}
              color={colors.yellow}
              data={sparklines[5]?.length ? sparklines[5] : [{ val: 0 }]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
