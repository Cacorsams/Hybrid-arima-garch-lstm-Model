import Link from 'next/link';

export default function ModelsPage() {
    return (
        <div className="min-h-screen bg-white font-sans text-gray-900 pb-20">
            {/* Header */}
            <header className="bg-gray-50 border-b border-gray-100 py-16">
                <div className="max-w-4xl mx-auto px-6">
                    <Link href="/" className="text-sm font-bold text-indigo-600 mb-8 inline-block hover:underline">← Back to Home</Link>
                    <h1 className="text-5xl font-black tracking-tighter text-gray-900">Methodology & Hybrid Architecture</h1>
                    <p className="mt-4 text-xl text-gray-500 leading-relaxed max-w-2xl">
                        A deep dive into how our sequential integration framework combines three diverse modeling techniques to forecast financial markets.
                    </p>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-16 space-y-20">
                {/* Intro */}
                <section className="space-y-6">
                    <h2 className="text-3xl font-bold tracking-tight">Sequential Integration Strategy</h2>
                    <p className="text-gray-600 leading-relaxed text-lg">
                        The core challenge in exchange rate forecasting is the coexistence of linear trends,
                        volatility clusters, and complex non-linear temporal patterns. No single model can
                        capture all these dynamics simultaneously with high precision.
                    </p>
                    <div className="bg-indigo-50 border border-indigo-100 p-8 rounded-3xl space-y-4">
                        <div className="font-bold text-indigo-900">The Hybrid Formula:</div>
                        <div className="text-2xl font-mono text-indigo-700 bg-white p-4 rounded-xl border border-indigo-200">
                            Forecast = ARIMA(mean) + [GARCH(vol) × LSTM(residual_adj)]
                        </div>
                    </div>
                </section>

                {/* Component Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="p-8 bg-gray-50 rounded-3xl border border-gray-100 space-y-4">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold">1</div>
                        <h3 className="text-xl font-bold">ARIMA</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            Captures long-term linear trends and autoregressive properties in the raw returns series.
                        </p>
                    </div>
                    <div className="p-8 bg-gray-50 rounded-3xl border border-gray-100 space-y-4">
                        <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white font-bold">2</div>
                        <h3 className="text-xl font-bold">GARCH</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            Estimates time-varying conditional variance from the ARIMA residuals to model risk and volatility clustering.
                        </p>
                    </div>
                    <div className="p-8 bg-gray-50 rounded-3xl border border-gray-100 space-y-4">
                        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-bold">3</div>
                        <h3 className="text-xl font-bold">LSTM</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            A deep Recurrent Neural Network trained on standardized residuals to learn complex, non-linear dependencies.
                        </p>
                    </div>
                </div>

                {/* Mathematical Details */}
                <section className="space-y-12">
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold">ARIMA (Linear Component)</h2>
                        <p className="text-gray-600 leading-relaxed">
                            We utilize the Box-Jenkins methodology to fit an Auto-Regressive Integrated Moving Average model.
                            The Integrated (I) component handles non-stationarity, while AR and MA capture temporal correlations.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold">GARCH (Volatility Modeling)</h2>
                        <p className="text-gray-600 leading-relaxed">
                            Since financial returns exhibit "volatility clustering" (periods of high or low volatility),
                            we use GARCH(1,1) to predict the variance of the next period.
                        </p>
                        <div className="bg-gray-900 text-white p-6 rounded-2xl font-mono text-sm">
                            σₜ² = ω + αεₜ₋₁² + βσₜ₋₁²
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold">LSTM (Non-linear Refinement)</h2>
                        <p className="text-gray-600 leading-relaxed">
                            Standard residuals are passed to a 2-layer LSTM network. With a lookback of 60 trading days,
                            the network identifies subtle patterns that classical statistical models missed.
                        </p>
                    </div>
                </section>

                <div className="pt-10 border-t border-gray-100 flex justify-center">
                    <Link href="/dashboard" className="px-10 py-5 bg-indigo-600 text-white font-black rounded-full shadow-2xl shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 transition-all">
                        Experience the Model Live
                    </Link>
                </div>
            </main>
        </div>
    );
}
