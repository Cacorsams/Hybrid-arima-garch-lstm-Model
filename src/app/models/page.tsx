import Link from 'next/link';

export default function ModelsPage() {
    return (
        <div className="min-h-screen bg-[#f5f0eb] dark:bg-[#121212] pb-20 font-sans text-[#1a1a1a] dark:text-gray-100 transition-colors duration-200">
            {/* Standard Navigation */}
            <nav className="sticky top-0 z-50 bg-[#f5f0eb]/95 dark:bg-[#121212]/95 backdrop-blur-sm border-b border-[#e0dbd5] dark:border-gray-800 transition-colors">
                <div className="max-w-7xl mx-auto px-6 md:px-10 flex items-center justify-between h-16 md:h-20">
                    <Link
                        href="/"
                        className="text-2xl md:text-3xl font-bold text-[#1a1a1a] dark:text-white tracking-tight font-serif"
                    >
                        QuantForecast®
                    </Link>
                    <ul className="hidden md:flex items-center gap-8 text-sm text-[#555] dark:text-gray-400">
                        <li>
                            <Link href="/" className="hover:text-[#1a1a1a] dark:hover:text-white transition-colors duration-200">Home</Link>
                        </li>
                        <li>
                            <Link href="/models" className="text-[#1a1a1a] dark:text-white font-bold border-b-2 border-[#1a1a1a] dark:border-white pb-1">About</Link>
                        </li>
                        <li>
                            <Link href="/system/hybrid" className="hover:text-[#1a1a1a] dark:hover:text-white transition-colors duration-200">Dashboard</Link>
                        </li>
                    </ul>
                </div>
            </nav>

            <header className="max-w-7xl mx-auto px-6 md:px-10 py-16 md:py-24 border-b border-[#e0dbd5] dark:border-gray-800 transition-colors">
                <div className="max-w-4xl">
                    <Link href="/" className="text-xs uppercase tracking-widest font-bold text-[#d94040] dark:text-red-400 mb-8 inline-block hover:bg-[#d94040] dark:hover:bg-red-500 hover:text-white dark:hover:text-white px-2 py-1 rounded transition-all">
                        ← Back to Home
                    </Link>
                    <h1 className="text-[40px] md:text-[64px] leading-tight font-normal text-[#1a1a1a] dark:text-white font-serif mb-6">
                        Methodology & <br />Hybrid Architecture
                    </h1>
                    <p className="text-[#555] dark:text-gray-400 text-xl leading-relaxed max-w-2xl">
                        A deep dive into how our sequential integration framework combines three diverse modeling techniques to forecast financial markets.
                    </p>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 md:px-10 py-16 md:py-24 space-y-24">
                {/* Intro */}
                <section className="max-w-4xl space-y-8">
                    <h2 className="text-3xl font-normal font-serif text-[#1a1a1a] dark:text-white">Sequential Integration Strategy</h2>
                    <p className="text-[#555] dark:text-gray-400 leading-relaxed text-lg">
                        The core challenge in exchange rate forecasting is the coexistence of linear trends,
                        volatility clusters, and complex non-linear temporal patterns. No single model can
                        capture all these dynamics simultaneously with high precision.
                    </p>
                    <div className="bg-white dark:bg-[#1e1e1e] border border-[#e0dbd5] dark:border-gray-800 p-10 rounded-3xl space-y-6 shadow-sm transition-colors">
                        <div className="font-bold text-[#1a1a1a] dark:text-gray-300 text-sm uppercase tracking-widest">The Hybrid Formula:</div>
                        <div className="text-lg md:text-2xl font-mono text-[#1a1a1a] dark:text-white bg-[#f9f7f5] dark:bg-gray-800 p-6 rounded-2xl border border-[#e0dbd5] dark:border-gray-700">
                            Forecast = ARIMA(mean) + [GARCH(vol) × LSTM(residual_adj)]
                        </div>
                    </div>
                </section>

                {/* Component Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { step: '1', title: 'ARIMA', desc: 'Captures long-term linear trends and autoregressive properties in the raw returns series.', color: 'bg-[#1a1a1a] dark:bg-gray-700' },
                        { step: '2', title: 'GARCH', desc: 'Estimates time-varying conditional variance from the ARIMA residuals to model risk and volatility clustering.', color: 'bg-[#d94040] dark:bg-red-500/80' },
                        { step: '3', title: 'LSTM', desc: 'A deep Recurrent Neural Network trained on standardized residuals to learn complex, non-linear dependencies.', color: 'bg-[#555] dark:bg-gray-600' },
                    ].map((item, i) => (
                        <div key={i} className="p-10 bg-white dark:bg-[#1e1e1e] rounded-3xl border border-[#e0dbd5] dark:border-gray-800 space-y-6 hover:shadow-lg transition-all duration-500">
                            <div className={`w-10 h-10 ${item.color} rounded-xl flex items-center justify-center text-white font-bold`}>{item.step}</div>
                            <h3 className="text-2xl font-normal font-serif text-[#1a1a1a] dark:text-white">{item.title}</h3>
                            <p className="text-sm text-[#555] dark:text-gray-400 leading-relaxed">
                                {item.desc}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Mathematical Details */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    <div className="space-y-12">
                        <div className="space-y-4">
                            <h2 className="text-2xl font-normal font-serif text-[#1a1a1a] dark:text-white">ARIMA (Linear Component)</h2>
                            <p className="text-[#555] dark:text-gray-400 leading-relaxed">
                                We utilize the Box-Jenkins methodology to fit an Auto-Regressive Integrated Moving Average model.
                                The Integrated (I) component handles non-stationarity, while AR and MA capture temporal correlations.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-2xl font-normal font-serif text-[#1a1a1a] dark:text-white">GARCH (Volatility Modeling)</h2>
                            <p className="text-[#555] dark:text-gray-400 leading-relaxed">
                                Since financial returns exhibit "volatility clustering" (periods of high or low volatility),
                                we use GARCH(1,1) to predict the variance of the next period.
                            </p>
                            <div className="bg-[#1a1a1a] dark:bg-gray-800 text-white p-8 rounded-2xl font-mono text-sm shadow-xl transition-colors">
                                σₜ² = ω + αεₜ₋₁² + βσₜ₋₁²
                            </div>
                        </div>
                    </div>

                    <div className="space-y-12">
                        <div className="space-y-4">
                            <h2 className="text-2xl font-normal font-serif text-[#1a1a1a] dark:text-white">LSTM (Non-linear Refinement)</h2>
                            <p className="text-[#555] dark:text-gray-400 leading-relaxed">
                                Standard residuals are passed to a 2-layer LSTM network. With a lookback of 60 trading days,
                                the network identifies subtle patterns that classical statistical models missed.
                            </p>
                        </div>

                        <div className="pt-12 border-t border-[#e0dbd5] dark:border-gray-800">
                            <Link href="/system/hybrid" className="inline-flex items-center gap-4 px-10 py-5 bg-[#1a1a1a] dark:bg-white text-white dark:text-[#1a1a1a] font-bold rounded-full shadow-2xl hover:bg-[#333] dark:hover:bg-gray-200 hover:scale-[1.05] transition-all">
                                Experience the Model Live
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
