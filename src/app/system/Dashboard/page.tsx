"use client";

import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
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
import { ChevronDown, Monitor, Share, HelpCircle, Settings, Download, Copy, X, Check, Maximize, Minimize } from 'lucide-react';

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
    return (
      <div className="backdrop-blur-xl bg-zinc-900/80 border border-white/10 p-4 rounded-xl shadow-2xl text-[11px] text-white min-w-[180px] ring-1 ring-white/5">
        <div className="flex items-center justify-between mb-2 border-b border-white/10 pb-2">
          <span className="text-zinc-400 font-bold tracking-widest uppercase">{label}</span>
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
        </div>
        <div className="space-y-2">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-1 h-3 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
                <span className="text-zinc-400 font-medium">{entry.name}</span>
              </div>
              <span className="font-mono font-bold text-zinc-100">
                {typeof entry.value === 'number' 
                  ? entry.value > 1 ? entry.value.toFixed(5) : entry.value.toFixed(6)
                  : entry.value}
              </span>
            </div>
          ))}
        </div>
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
  <div className="flex flex-col h-full bg-white/5 border border-white/5 rounded-2xl p-4 transition-all duration-300 hover:bg-white/[0.08] group">
    <div className="mb-2">
      <h3 className="text-zinc-500 text-[9px] font-bold tracking-[0.2em] uppercase opacity-70 group-hover:opacity-100 transition-opacity">
        {title}
      </h3>
      <div className="flex items-baseline gap-2 mt-1">
        <span className="text-2xl font-bold tracking-tight" style={{ color }}>
          {value}
        </span>
      </div>
    </div>
    <div className="flex-grow min-h-[50px] mt-2 relative">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="val"
            stroke={color}
            strokeWidth={2.5}
            dot={false}
            isAnimationActive={true}
          />
        </LineChart>
      </ResponsiveContainer>
      {subValue && (
        <div className="absolute -bottom-1 left-0 text-[10px] font-medium" style={{ color }}>
          <span className="opacity-90">{subValue}</span> <span className="text-zinc-600 font-normal lowercase">{subLabel}</span>
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // --- ACTIONS ---
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const exportToCSV = (data: any[], filename: string) => {
    if (!data.length) return;
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(obj => Object.values(obj).join(',')).join('\n');
    const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
              prediction: pred,
              upper: arimaData.confidence_uppers?.[i] || pred,
              lower: arimaData.confidence_lowers?.[i] || pred,
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
              prediction: pred,
              upper: pred,
              lower: pred,
              volatility: 0,
            }));

            // Overlay with GARCH volatility if available
            if (garchForecastRes.status === 'fulfilled' && garchForecastRes.value.ok) {
              const garchData = await garchForecastRes.value.json();
              if (garchData?.forecast_volatility) {
                chartPoints.forEach((pt: any, i: number) => {
                  const vol = garchData.forecast_volatility[i] || 0;
                  pt.volatility = vol;
                  // Use 1.96 standard deviations for a 95% confidence band
                  pt.upper = pt.prediction + (vol * 1.96);
                  pt.lower = pt.prediction - (vol * 1.96);
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
        <div className="flex items-center gap-4 text-zinc-500 relative">
          <button 
            onClick={toggleFullscreen}
            className="hover:text-foreground p-1 transition-colors relative group"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-zinc-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            </span>
          </button>
          
          <button 
            onClick={() => setShowShareModal(true)}
            className="hover:text-foreground p-1 transition-colors relative group"
            title="Share or Export"
          >
            <Share size={18} />
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-zinc-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Share / Export
            </span>
          </button>

          <button 
            onClick={() => setShowHelpModal(true)}
            className="hover:text-foreground p-1 transition-colors relative group"
            title="Help & Info"
          >
            <HelpCircle size={18} />
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-zinc-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Help Guide
            </span>
          </button>
        </div>
      </header>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">

        {/* TOP LEFT: ARIMA Forecast vs CI Width */}
        <div className="flex flex-col h-[400px] bg-card rounded-xl p-5 border border-border relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          <PanelHeader title="ARIMA FORECAST VS CONFIDENCE INTERVAL" />
          <div className="flex-grow relative mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={arimaChartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorPrediction" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors.cyan} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={colors.cyan} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCI" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors.magenta} stopOpacity={0.1}/>
                    <stop offset="95%" stopColor={colors.magenta} stopOpacity={0.02}/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={colors.gridLine} vertical={false} strokeDasharray="3 3" opacity={0.5} />
                <XAxis
                  dataKey="x"
                  tick={{ fill: colors.textMuted, fontSize: 10, fontWeight: 500 }}
                  axisLine={{ stroke: colors.gridLine, opacity: 0.5 }}
                  tickLine={false}
                  dy={10}
                  interval={4}
                />
                <YAxis
                  tick={{ fill: colors.textMuted, fontSize: 10, fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                  domain={['auto', 'auto']}
                  tickFormatter={(val) => val.toFixed(4)}
                />
                <Tooltip 
                  content={<CustomTooltip />} 
                  cursor={{ stroke: colors.cyan, strokeWidth: 1, strokeDasharray: '5 5' }} 
                />
                
                {/* Confidence Interval Area */}
                <Area
                  type="monotone"
                  dataKey="upper"
                  stroke="none"
                  fill="url(#colorCI)"
                  fillOpacity={1}
                  connectNulls
                  isAnimationActive={true}
                />
                <Area
                  type="monotone"
                  dataKey="lower"
                  stroke="none"
                  fill={colors.bg}
                  fillOpacity={1}
                  connectNulls
                  isAnimationActive={true}
                />
                
                {/* Prediction Line & Area */}
                <Area
                  type="monotone"
                  dataKey="prediction"
                  name="Predicted Rate"
                  stroke={colors.cyan}
                  strokeWidth={3}
                  fill="url(#colorPrediction)"
                  fillOpacity={1}
                  dot={{ r: 0, fill: colors.cyan, strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, strokeWidth: 0, fill: colors.cyan }}
                />
                
                {arimaChartData.length > 0 && (
                  <ReferenceLine x="T+1" stroke={colors.cyan} strokeDasharray="5 5" opacity={0.5} />
                )}
                
                <text x="50%" y="5%" textAnchor="middle" fill={colors.textMuted} fontSize={10} className="font-medium tracking-widest opacity-80 uppercase">
                  {arimaMetrics ? `ARIMA${arimaMetrics.order ? `(${arimaMetrics.order.join(',')})` : ''} | MAE: ${fmt(arimaMetrics.mae, 6)}` : loading ? 'PROcessing ARIMA data…' : ''}
                </text>
              </ComposedChart>
            </ResponsiveContainer>
            <div className="absolute bottom-[-10px] w-full flex justify-center gap-8 text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]"></div>
                <span>Prediction</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-magenta-500/20 border border-magenta-500/40"></div>
                <span>95% Confidence Band</span>
              </div>
            </div>
          </div>
        </div>

        {/* TOP RIGHT: LSTM Forecast vs GARCH Volatility */}
        <div className="flex flex-col h-[400px] bg-card rounded-xl p-5 border border-border relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          <PanelHeader title="LSTM FORECAST VS GARCH VOLATILITY" />
          <div className="flex-grow relative mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={lstmChartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorLstm" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors.green} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={colors.green} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorGarch" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors.magenta} stopOpacity={0.1}/>
                    <stop offset="95%" stopColor={colors.magenta} stopOpacity={0.02}/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={colors.gridLine} vertical={false} strokeDasharray="3 3" opacity={0.5} />
                <XAxis
                  dataKey="x"
                  tick={{ fill: colors.textMuted, fontSize: 10, fontWeight: 500 }}
                  axisLine={{ stroke: colors.gridLine, opacity: 0.5 }}
                  tickLine={false}
                  dy={10}
                  interval={4}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fill: colors.textMuted, fontSize: 10, fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                  domain={['auto', 'auto']}
                  tickFormatter={(val) => val.toFixed(4)}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: colors.magenta, fontSize: 10, fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => val.toFixed(5)}
                />
                <Tooltip 
                  content={<CustomTooltip />} 
                  cursor={{ stroke: colors.green, strokeWidth: 1, strokeDasharray: '5 5' }} 
                />
                
                {/* GARCH Volatility Band */}
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="upper"
                  stroke="none"
                  fill="url(#colorGarch)"
                  fillOpacity={1}
                  connectNulls
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="lower"
                  stroke="none"
                  fill={colors.bg}
                  fillOpacity={1}
                  connectNulls
                />
                
                {/* LSTM Prediction */}
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="prediction"
                  name="LSTM Rate"
                  stroke={colors.green}
                  strokeWidth={3}
                  fill="url(#colorLstm)"
                  fillOpacity={1}
                  dot={false}
                  activeDot={{ r: 6, strokeWidth: 0, fill: colors.green }}
                />
                
                {/* GARCH Volatility Line */}
                <Line
                  yAxisId="right"
                  type="stepAfter"
                  dataKey="volatility"
                  name="GARCH Volatility"
                  stroke={colors.magenta}
                  strokeWidth={2}
                  strokeDasharray="3 3"
                  dot={false}
                  opacity={0.7}
                />
                
                {lstmChartData.length > 0 && (
                  <ReferenceLine yAxisId="left" x="T+1" stroke={colors.green} strokeDasharray="5 5" opacity={0.5} />
                )}
                
                <text x="50%" y="5%" textAnchor="middle" fill={colors.textMuted} fontSize={10} className="font-medium tracking-widest opacity-80 uppercase">
                  {lstmMetrics ? `Epochs: ${lstmMetrics.epochs} | Final Loss: ${fmt(lstmMetrics.final_loss, 6)}` : loading ? 'PROcessing LSTM data…' : ''}
                </text>
              </ComposedChart>
            </ResponsiveContainer>
            <div className="absolute bottom-[-10px] w-full flex justify-center gap-8 text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                <span>LSTM Rate</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-[2px] bg-magenta-500 shadow-[0_0_8px_rgba(255,64,129,0.5)]"></div>
                <span>GARCH Volatility</span>
              </div>
            </div>
          </div>
        </div>
                {/* BOTTOM LEFT: Historical Close vs Log Return */}
        <div className="flex flex-col h-[400px] bg-card rounded-xl p-6 border border-border relative overflow-hidden group mt-8 lg:mt-0">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          <PanelHeader title="HISTORICAL EXCHANGE RATE VS LOG RETURN" />
 
          {/* Stat Chips Header */}
          <div className="grid grid-cols-3 gap-4 mb-6 pt-2">
            <div className="bg-white/5 border border-white/5 p-3 rounded-xl">
              <div className="text-zinc-500 text-[10px] font-bold tracking-widest uppercase mb-1">Latest KES/CAD</div>
              <div className="text-[#00e5ff] text-2xl font-bold tracking-tight">
                {historyStats ? fmt(historyStats.latestClose, 5) : '—'}
              </div>
            </div>
            <div className="bg-white/5 border border-white/5 p-3 rounded-xl">
              <div className="text-zinc-500 text-[10px] font-bold tracking-widest uppercase mb-1">Data Points</div>
              <div className="text-[#ff4081] text-2xl font-bold tracking-tight">
                {historyStats ? `${historyStats.dataPoints}` : '—'}
              </div>
            </div>
            <div className="bg-white/10 border border-white/10 p-3 rounded-xl shadow-inner group/stat">
              <div className="text-zinc-500 text-[10px] font-bold tracking-widest uppercase mb-1 opacity-80">Avg Log Return</div>
              <div className="text-zinc-100 text-2xl font-bold tracking-tight flex items-center gap-2">
                <div className="w-1 h-4 bg-white/20 rounded-full" />
                {historyStats ? fmtPct(historyStats.avgReturn) : '—'}
              </div>
            </div>
          </div>
 
          <div className="flex-grow relative">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={historyChartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors.cyan} stopOpacity={0.15}/>
                    <stop offset="95%" stopColor={colors.cyan} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={colors.gridLine} vertical={false} strokeDasharray="3 3" opacity={0.5} />
                <XAxis dataKey="time" hide />
                <YAxis
                  yAxisId="left"
                  tick={{ fill: colors.textMuted, fontSize: 10, fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                  domain={['auto', 'auto']}
                  tickFormatter={(val) => val.toFixed(4)}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: colors.magenta, fontSize: 10, fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `${(val * 100).toFixed(2)}%`}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ stroke: colors.cyan, strokeWidth: 1, strokeDasharray: '5 5' }}
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="close"
                  stroke="none"
                  fill="url(#colorClose)"
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="close"
                  name="Close Rate"
                  stroke={colors.cyan}
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, strokeWidth: 0, fill: colors.cyan }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="logReturn"
                  name="Log Return"
                  stroke={colors.magenta}
                  strokeWidth={1.5}
                  dot={false}
                  opacity={0.8}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* BOTTOM RIGHT: Model KPIs Grid */}
        <div className="flex flex-col h-[400px] bg-card rounded-xl p-6 border border-border relative overflow-hidden group mt-8 lg:mt-0">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          <PanelHeader title="MODEL KPIs" />
 
          <div className="grid grid-cols-3 grid-rows-2 gap-4 h-full pt-2">
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
      {/* HELP MODAL */}
      {showHelpModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowHelpModal(false)} />
          <div className="relative bg-zinc-900 border border-white/10 rounded-2xl p-8 max-w-2xl w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowHelpModal(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
              <HelpCircle className="text-cyan-400" /> Dashboard Guide
            </h2>
            <div className="space-y-6 text-zinc-400 text-sm leading-relaxed overflow-y-auto max-h-[60vh] pr-4">
              <section>
                <h3 className="text-white font-semibold mb-2">ARIMA-GARCH-LSTM Sequential Hybrid</h3>
                <p>This dashboard visualizes a three-stage forecasting model. First, **ARIMA** captures linear trends. Second, **GARCH** models the volatility clustering in the residuals. Third, **LSTM** learns complex non-linear patterns from the remaining variance.</p>
              </section>
              <section>
                <h3 className="text-white font-semibold mb-2">Confidence Bands</h3>
                <p>The shaded areas in the charts represent the statistical uncertainty. For ARIMA, this is the 95% confidence interval. For LSTM, the band is derived from GARCH volatility predictions.</p>
              </section>
              <section>
                <h3 className="text-white font-semibold mb-2">Model Metrics (KPIs)</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li><span className="text-white">MAE:</span> Mean Absolute Error (lower is better)</li>
                  <li><span className="text-white">RMSE:</span> Root Mean Square Error (penalizes large outliers)</li>
                  <li><span className="text-white">MAPE:</span> Mean Absolute Percentage Error (percentage-based accuracy)</li>
                  <li><span className="text-white">GARCH Persistence:</span> How long volatility shocks last (closer to 1 = long-lasting)</li>
                </ul>
              </section>
            </div>
            <div className="mt-8 pt-6 border-t border-white/5 flex justify-end">
              <button 
                onClick={() => setShowHelpModal(false)}
                className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-2 px-6 rounded-lg transition-colors"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SHARE/EXPORT MODAL */}
      {showShareModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowShareModal(false)} />
          <div className="relative bg-zinc-900 border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowShareModal(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
              <Share className="text-cyan-400" /> Share & Export
            </h2>
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Share Link</label>
                <div className="flex gap-2">
                  <div className="flex-grow bg-zinc-800 border border-white/5 rounded-lg px-3 py-2 text-zinc-300 text-xs truncate">
                    {typeof window !== 'undefined' ? window.location.href : 'Loading...'}
                  </div>
                  <button 
                    onClick={handleCopyLink}
                    className="bg-white/5 hover:bg-white/10 border border-white/10 p-2 rounded-lg transition-colors group relative"
                  >
                    {copySuccess ? <Check size={18} className="text-green-500" /> : <Copy size={18} className="text-zinc-400" />}
                    {copySuccess && (
                      <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-green-500 text-black text-[10px] px-2 py-1 rounded whitespace-nowrap">
                        Copied!
                      </span>
                    )}
                  </button>
                </div>
              </div>
              <div className="pt-4 border-t border-white/5">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 block">Data Export</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => exportToCSV(arimaChartData, 'arima_forecast')}
                    className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-white/5 p-3 rounded-xl transition-colors text-xs text-white"
                  >
                    <Download size={16} className="text-cyan-400" /> ARIMA CSV
                  </button>
                  <button 
                    onClick={() => exportToCSV(lstmChartData, 'lstm_forecast')}
                    className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-white/5 p-3 rounded-xl transition-colors text-xs text-white"
                  >
                    <Download size={16} className="text-green-400" /> LSTM CSV
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
