import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-indigo-100 italic:text-indigo-600">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-xs">HY</span>
            </div>
            <span className="font-bold tracking-tighter text-xl">HybridForex</span>
          </div>
          <div className="flex items-center gap-8">
            <Link href="/models" className="text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors">Methodology</Link>
            <Link href="/dashboard" className="px-5 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-full hover:bg-gray-800 transition-all">Launch Dashboard</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-20">
        <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">v1.2 Live on Mainnet</span>
            </div>

            <h1 className="text-7xl font-extrabold tracking-tighter leading-[1.1] text-gray-900">
              Next-Gen <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Forex</span> Forecasting.
            </h1>

            <p className="text-xl text-gray-500 leading-relaxed max-w-xl">
              Sequential Hybrid Intelligence combining ARIMA, GARCH, and LSTM architectures
              to predict KES/CAD exchange rates with unprecedented precision.
            </p>

            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-2xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 transition-all">
                Access Real-time Analysis
              </Link>
              <Link href="/models" className="px-8 py-4 bg-white text-gray-900 border border-gray-200 font-bold rounded-2xl hover:bg-gray-50 transition-all">
                Read Whitepaper
              </Link>
            </div>

            <div className="pt-10 flex items-center gap-12 border-t border-gray-100">
              <div>
                <div className="text-2xl font-black text-gray-900">0.0432</div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Avg MAE</div>
              </div>
              <div>
                <div className="text-2xl font-black text-gray-900">94.2%</div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Significance</div>
              </div>
              <div>
                <div className="text-2xl font-black text-gray-900">Daily</div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Updates</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-indigo-600/5 blur-3xl rounded-full"></div>
            <div className="relative bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
              <div className="bg-gray-900 p-4 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                </div>
                <div className="text-[10px] font-mono text-gray-500 ml-4">KES/CAD Prediction Engine</div>
              </div>
              <div className="p-8 space-y-6">
                <div className="h-4 bg-gray-100 rounded-full w-3/4"></div>
                <div className="h-40 bg-indigo-50/50 rounded-2xl flex items-end p-4 gap-2">
                  <div className="flex-1 bg-indigo-200 h-12 rounded"></div>
                  <div className="flex-1 bg-indigo-300 h-20 rounded"></div>
                  <div className="flex-1 bg-indigo-400 h-32 rounded"></div>
                  <div className="flex-1 bg-indigo-500 h-24 rounded"></div>
                  <div className="flex-1 bg-indigo-600 h-40 rounded animate-pulse"></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-12 bg-gray-50 rounded-xl"></div>
                  <div className="h-12 bg-gray-50 rounded-xl"></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400 font-medium">
          <p>© 2026 HybridForex Research Group. All rights reserved.</p>
          <div className="flex gap-8 mt-6 md:mt-0">
            <a href="#" className="hover:text-indigo-600 transition-colors">GitHub</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Documentation</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
