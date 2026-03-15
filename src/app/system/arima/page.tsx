'use client';

export default function ArimaPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-700 font-sans">
      <div className="pb-4 border-b border-border">
        <h1 className="text-xl md:text-2xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
          Standalone ARIMA
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-2xl mt-1">
          AutoRegressive Integrated Moving Average for linear trend forecasting.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl p-5 border border-border">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Statistical Metrics</h2>
          <div className="space-y-3">
             <p className="text-sm text-zinc-500 dark:text-zinc-400 italic">Analysis pipeline initialization required...</p>
          </div>
        </div>

        <div className="bg-zinc-900 dark:bg-zinc-800 rounded-xl p-5 text-zinc-100 border border-zinc-700">
          <h2 className="text-base font-semibold mb-4">Model Description</h2>
          <p className="text-sm text-zinc-300 dark:text-zinc-400 leading-relaxed">
            ARIMA captures linear dependencies and seasonal trends in the KES/CAD exchange rate. It serves as the baseline for the hybrid model&apos;s mean prediction.
          </p>
        </div>
      </div>
    </div>
  );
}
