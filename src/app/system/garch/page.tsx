'use client';

export default function GarchPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-700 font-sans">
      <div className="pb-4 border-b border-border">
        <h1 className="text-xl md:text-2xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
          Standalone GARCH
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-2xl mt-1">
          Generalized Autoregressive Conditional Heteroskedasticity for volatility modeling.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl p-5 border border-border">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Volatility Analysis</h2>
          <div className="space-y-3">
             <p className="text-sm text-zinc-500 dark:text-zinc-400 italic">Analysis pipeline initialization required...</p>
          </div>
        </div>

        <div className="bg-zinc-900 dark:bg-zinc-800 rounded-xl p-5 text-zinc-100 border border-zinc-700">
          <h2 className="text-base font-semibold mb-4">Model Description</h2>
          <p className="text-sm text-zinc-300 dark:text-zinc-400 leading-relaxed">
            GARCH modeled components focus on &quot;volatility clustering&quot; where periods of high variance are followed by high variance, crucial for risk assessment in the KES/CAD market.
          </p>
        </div>
      </div>
    </div>
  );
}
