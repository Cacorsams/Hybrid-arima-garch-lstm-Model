"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Database,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Loader2,
  Table2,
  TrendingUp,
  Activity,
  Brain,
  Layers,
  BarChart3,
} from 'lucide-react';

// ─── TABLE DEFINITIONS ─────────────────────────────────────────────
const TABLE_CONFIG = [
  {
    key: 'exchange_rates',
    label: 'Exchange Rates',
    icon: TrendingUp,
    color: '#00e5ff',
    description: 'KES/CAD daily OHLCV + log returns',
    columns: ['id', 'date', 'open', 'high', 'low', 'close', 'volume', 'log_return'],
  },
  {
    key: 'arima_predictions',
    label: 'ARIMA Predictions',
    icon: BarChart3,
    color: '#00e5ff',
    description: 'ARIMA model forecasts with CI',
    columns: ['id', 'forecast_date', 'predicted_return', 'predicted_rate', 'confidence_interval_lower', 'confidence_interval_upper', 'actual_return', 'actual_rate', 'mae', 'rmse', 'mape', 'arima_order'],
  },
  {
    key: 'garch_volatility',
    label: 'GARCH Volatility',
    icon: Activity,
    color: '#ff4081',
    description: 'Conditional variance & residuals',
    columns: ['id', 'date', 'conditional_variance', 'conditional_std', 'standardized_residuals', 'garch_order'],
  },
  {
    key: 'lstm_predictions',
    label: 'LSTM Predictions',
    icon: Brain,
    color: '#69f0ae',
    description: 'LSTM neural network forecasts',
    columns: ['id', 'forecast_date', 'predicted_return', 'predicted_rate', 'actual_return', 'actual_rate', 'mae', 'rmse', 'mape', 'model_epoch'],
  },
  {
    key: 'hybrid_predictions',
    label: 'Hybrid Predictions',
    icon: Layers,
    color: '#ffd740',
    description: 'Combined ARIMA-GARCH-LSTM output',
    columns: ['id', 'forecast_date', 'arima_component', 'garch_component', 'lstm_component', 'combined_prediction', 'confidence_lower', 'confidence_upper'],
  },
  {
    key: 'macro_indicators',
    label: 'Macro Indicators',
    icon: Table2,
    color: '#8892b0',
    description: 'Economic indicator time series',
    columns: ['id', 'date', 'indicator_type', 'value', 'source'],
  },
];

// ─── FORMAT HELPERS ─────────────────────────────────────────────────
const formatCell = (value: any, col: string): string => {
  if (value === null || value === undefined) return '—';
  if (col === 'date' || col === 'forecast_date') {
    return new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }
  if (typeof value === 'number') {
    if (col === 'volume') return value.toLocaleString();
    if (col === 'id' || col === 'model_epoch') return value.toString();
    return value.toFixed(6);
  }
  if (col === 'created_at' || col === 'updated_at') {
    return new Date(value).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  }
  return String(value);
};

const formatColumnHeader = (col: string): string => {
  return col
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .replace('Mae', 'MAE')
    .replace('Rmse', 'RMSE')
    .replace('Mape', 'MAPE')
    .replace('Lstm', 'LSTM')
    .replace('Arima', 'ARIMA')
    .replace('Garch', 'GARCH')
    .replace('Ci ', 'CI ')
    .replace('Std', 'Std.');
};

// ─── MAIN COMPONENT ─────────────────────────────────────────────────
export default function DataExplorerPage() {
  const [activeTable, setActiveTable] = useState(TABLE_CONFIG[0].key);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const pageSize = 50;

  const activeConfig = TABLE_CONFIG.find(t => t.key === activeTable)!;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/data/tables?table=${activeTable}&page=${page}&pageSize=${pageSize}&search=${encodeURIComponent(searchTerm)}`
      );
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json.data || []);
      setTotalPages(json.totalPages || 1);
      setTotalRows(json.total || 0);
    } catch (err) {
      console.error('Data fetch error:', err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [activeTable, page, searchTerm]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setPage(1);
  }, [activeTable]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans">

      {/* ── HEADER ── */}
      <header className="flex items-center justify-between pb-4 border-b border-border">
        <div className="flex items-center gap-4">
          <Link
            href="/system/Dashboard"
            className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-foreground tracking-tight flex items-center gap-2">
              <Database size={20} className="text-zinc-500" />
              Data Explorer
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              {totalRows.toLocaleString()} records across {TABLE_CONFIG.length} tables
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search records…"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 focus:border-cyan-500/30 transition-all"
          />
        </div>
      </header>

      {/* ── TABLE SELECTOR TABS ── */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {TABLE_CONFIG.map((table) => {
          const Icon = table.icon;
          const isActive = activeTable === table.key;
          return (
            <button
              key={table.key}
              onClick={() => setActiveTable(table.key)}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200
                ${isActive
                  ? 'bg-white/10 border border-white/15 text-white shadow-lg'
                  : 'bg-transparent border border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                }
              `}
            >
              <Icon size={14} style={{ color: isActive ? table.color : undefined }} />
              {table.label}
            </button>
          );
        })}
      </div>

      {/* ── TABLE CARD ── */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">

        {/* Table Meta Bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-1 h-5 rounded-full" style={{ backgroundColor: activeConfig.color }} />
            <div>
              <h2 className="text-sm font-semibold text-foreground">{activeConfig.label}</h2>
              <p className="text-[10px] text-zinc-500">{activeConfig.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-[10px] text-zinc-500 font-mono">
            <span>{totalRows.toLocaleString()} rows</span>
            <span>{activeConfig.columns.length} cols</span>
            <span>Page {page}/{totalPages}</span>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5">
                {activeConfig.columns.map((col) => (
                  <th
                    key={col}
                    className="px-4 py-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest whitespace-nowrap bg-white/[0.02]"
                  >
                    {formatColumnHeader(col)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={activeConfig.columns.length} className="text-center py-20">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 size={24} className="animate-spin text-zinc-500" />
                      <span className="text-xs text-zinc-500 tracking-widest uppercase">Loading data…</span>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={activeConfig.columns.length} className="text-center py-20">
                    <span className="text-xs text-zinc-600">No records found</span>
                  </td>
                </tr>
              ) : (
                data.map((row, idx) => (
                  <tr
                    key={row.id || idx}
                    className="border-b border-white/[0.03] hover:bg-white/[0.03] transition-colors duration-150"
                  >
                    {activeConfig.columns.map((col) => (
                      <td
                        key={col}
                        className={`px-4 py-2.5 text-[11px] whitespace-nowrap font-mono ${
                          col === 'id' ? 'text-zinc-600' : 'text-zinc-300'
                        }`}
                      >
                        {formatCell(row[col], col)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-border">
          <p className="text-[10px] text-zinc-500 font-mono">
            Showing {((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, totalRows)} of {totalRows.toLocaleString()}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="p-1.5 rounded-md text-zinc-500 hover:text-white hover:bg-white/5 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronsLeft size={14} />
            </button>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-md text-zinc-500 hover:text-white hover:bg-white/5 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={14} />
            </button>

            {/* Page numbers */}
            <div className="flex items-center gap-0.5 mx-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`
                      w-7 h-7 rounded-md text-[10px] font-medium transition-all
                      ${pageNum === page
                        ? 'bg-white/10 text-white border border-white/10'
                        : 'text-zinc-500 hover:text-white hover:bg-white/5'
                      }
                    `}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-md text-zinc-500 hover:text-white hover:bg-white/5 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={14} />
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              className="p-1.5 rounded-md text-zinc-500 hover:text-white hover:bg-white/5 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronsRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
