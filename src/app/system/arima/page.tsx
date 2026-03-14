'use client';

export default function ArimaPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="pb-2 border-b border-[#e0dbd5] dark:border-gray-800">
        <h1 className="text-[40px] md:text-[56px] leading-tight font-normal text-[#1a1a1a] dark:text-white font-serif">
          Standalone ARIMA
        </h1>
        <p className="text-[#555] dark:text-gray-400 text-lg max-w-2xl">
          AutoRegressive Integrated Moving Average for linear trend forecasting.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-[#1e1e1e] rounded-3xl p-8 border border-[#e0dbd5] dark:border-gray-800 shadow-sm">
          <h2 className="text-xl font-bold text-[#1a1a1a] dark:text-white mb-6 font-serif">Statistical Metrics</h2>
          <div className="space-y-4">
             <p className="text-sm text-gray-500 dark:text-gray-400 italic">Analysis pipeline initialization required...</p>
          </div>
        </div>
        
        <div className="bg-[#1a1a1a] dark:bg-gray-800 rounded-3xl p-8 text-white">
          <h2 className="text-xl font-bold mb-6 font-serif">Model Description</h2>
          <p className="text-sm text-white/60 leading-relaxed">
            ARIMA captures linear dependencies and seasonal trends in the KES/CAD exchange rate. It serves as the baseline for the hybrid model's mean prediction.
          </p>
        </div>
      </div>
    </div>
  );
}
