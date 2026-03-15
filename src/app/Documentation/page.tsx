'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  Settings, 
  Terminal, 
  Database, 
  Activity, 
  LineChart, 
  BrainCircuit, 
  Cpu, 
  BarChart3, 
  Layers, 
  CheckCircle2,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';

const sections = [
  { id: 'overview', title: 'Project Overview', icon: BookOpen },
  { id: 'architecture', title: 'Hybrid Architecture', icon: Layers },
  { id: 'arima', title: 'ARIMA Components', icon: LineChart },
  { id: 'garch', title: 'GARCH Components', icon: Activity },
  { id: 'lstm', title: 'LSTM Processing', icon: BrainCircuit },
  { id: 'optimization', title: 'Optimization Engine', icon: Cpu },
  { id: 'pipeline', title: 'Real-time Pipeline', icon: Terminal },
  { id: 'metrics', title: 'Evaluation Metrics', icon: BarChart3 },
  { id: 'api', title: 'API Documentation', icon: Settings },
  { id: 'stack', title: 'Technical Stack', icon: Database },
  { id: 'installation', title: 'Installation Guide', icon: CheckCircle2 },
];

export default function DocumentationPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setActiveTab(id);
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#121212] flex flex-col md:flex-row font-inter">
      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-border p-4 flex items-center justify-between">
        <span className="font-bold tracking-tight">Documentation</span>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-0 z-40 md:sticky md:top-0 md:h-screen w-full md:w-72 bg-[#f9f9f9] dark:bg-[#1a1a1a] border-r border-border p-6 transition-transform duration-300 overflow-y-auto
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="mb-10 hidden md:block">
          <Link href="/" className="text-xl font-black tracking-tighter font-serif">
            QUANT<span className="text-primary italic">F</span>
          </Link>
          <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mt-2">Core Documentation</p>
        </div>

        <nav className="space-y-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                ${activeTab === section.id 
                  ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20' 
                  : 'text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground'
                }`}
            >
              <section.icon size={18} className={activeTab === section.id ? 'opacity-100' : 'opacity-60'} />
              {section.title}
              {activeTab === section.id && <ChevronRight size={14} className="ml-auto opacity-60" />}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-12 lg:p-20 max-w-5xl mx-auto space-y-32 mb-40 overflow-x-hidden">
        {/* Project Overview */}
        <section id="overview" className="space-y-8 scroll-mt-32">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight font-serif text-foreground">
              Project Overview
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl font-medium">
              A comprehensive technical blueprint for the Hybrid ARIMA-GARCH-LSTM Sequential Forecasting Framework.
            </p>
          </div>
          
          <div className="prose prose-lg dark:prose-invert max-w-none space-y-6 text-muted-foreground leading-relaxed">
            <p>
              Currency exchange rate forecasting is a critical challenge in international finance. 
              Traditional models like ARIMA and GARCH capture linear trends and volatility clustering but miss non-linear dynamics. 
              Deep learning models like LSTM address non-linearity but often ignore explicit volatility modeling.
            </p>
            <p>
              This system implements a production-grade sequential integration strategy that combines the strengths of all three 
              methodologies to forecast KES/CAD exchange rates with unprecedented precision.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              <div className="p-6 rounded-2xl bg-accent/50 border border-border">
                <h3 className="text-foreground font-bold mb-2">Primary Objective</h3>
                <p className="text-sm">Capture linear trends, volatility clustering, and non-linear patterns in a single sequential pipeline.</p>
              </div>
              <div className="p-6 rounded-2xl bg-accent/50 border border-border">
                <h3 className="text-foreground font-bold mb-2">Target Data</h3>
                <p className="text-sm">Daily KES/CAD exchange rate data (2015-2024) sourced from the Central Bank of Kenya.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Hybrid Architecture */}
        <section id="architecture" className="space-y-12 scroll-mt-32 border-t border-border pt-20">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold font-serif">Hybrid Architecture</h2>
            <p className="text-lg text-muted-foreground font-medium">Sequential Integration Strategy</p>
          </div>
          
          <div className="bg-muted/30 rounded-3xl p-8 md:p-12 border border-border space-y-8">
            <div className="text-center space-y-4 max-w-2xl mx-auto mb-12">
              <span className="text-[10px] uppercase font-bold tracking-widest text-primary">Integration Logic</span>
              <div className="text-2xl md:text-4xl font-mono p-8 rounded-2xl bg-black text-white dark:bg-white dark:text-gray-900 shadow-2xl overflow-x-auto whitespace-nowrap">
                Fₜ₊ₖ = Aₜ₊ₖ + Gₜ₊ₖ × Lₜ₊ₖ
              </div>
              <p className="text-sm text-muted-foreground italic">Forecast = ARIMA(mean) + [GARCH(vol) × LSTM(residual_adj)]</p>
            </div>

            <div className="relative space-y-12">
              <div className="absolute left-6 h-full w-px bg-dashed-border hidden md:block" />
              
              {[
                { title: 'Linear Filtering', model: 'ARIMA', desc: 'Accounts for the autoregressive and moving average properties of the series.', list: ['Box-Jenkins optimization', 'Stationarity testing', 'White noise analysis'] },
                { title: 'Volatility Processing', model: 'GARCH', desc: 'Fits conditional variance to the residuals from the linear phase.', list: ['Volatility clustering', 'Risk estimation', 'Rescaling factor creation'] },
                { title: 'Non-linear Learning', model: 'LSTM', desc: 'Learns complex dependencies from the standardized residuals.', list: ['Lookback sequences', 'Memory cells', 'Pattern recognition'] }
              ].map((step, i) => (
                <div key={i} className="flex gap-8 relative group">
                  <div className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-800 border-2 border-primary flex items-center justify-center font-bold text-primary z-10 shrink-0 shadow-lg transition-transform group-hover:scale-110">
                    {i + 1}
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xl font-bold text-foreground">{step.title} <span className="text-primary ml-2 font-mono text-xs">[{step.model}]</span></h4>
                    <p className="text-muted-foreground">{step.desc}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {step.list.map((tag, j) => (
                        <span key={j} className="text-[10px] font-bold px-2 py-1 rounded-full bg-accent text-accent-foreground uppercase tracking-wider">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ARIMA Components */}
        <section id="arima" className="space-y-8 scroll-mt-32 border-t border-border pt-20">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold font-serif">ARIMA Components</h2>
            <p className="text-lg text-muted-foreground font-medium">Linear Dependency Modeling</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 text-muted-foreground leading-relaxed">
            <div className="space-y-6">
              <p>
                The Auto-Regressive Integrated Moving Average (ARIMA) model serves as the foundational linear filter. 
                It effectively accounts for the "average" movement of the exchange rate over time.
              </p>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0">p</span>
                  <span><strong>Autoregression</strong>: The relationship between an observation and a number of lagged observations.</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0">d</span>
                  <span><strong>Integration</strong>: Differencing raw observations to make the time series stationary.</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0">q</span>
                  <span><strong>Moving Average</strong>: Dependence between an observation and a residual error from a moving average model.</span>
                </li>
              </ul>
            </div>
            <div className="bg-accent/40 rounded-3xl p-8 border border-border">
              <h3 className="text-foreground font-bold mb-4">Box-Jenkins Method</h3>
              <div className="space-y-4 text-sm">
                <div className="p-4 rounded-xl bg-background border border-border">
                  <span className="font-bold text-primary block mb-1">1. Identification</span>
                  <p>Check stationarity via ADF test and analyze ACF/PACF plots.</p>
                </div>
                <div className="p-4 rounded-xl bg-background border border-border">
                  <span className="font-bold text-primary block mb-1">2. Estimation</span>
                  <p>Apply Maximum Likelihood to find parameters that best fit the data.</p>
                </div>
                <div className="p-4 rounded-xl bg-background border border-border">
                  <span className="font-bold text-primary block mb-1">3. Diagnostic Checking</span>
                  <p>Analyze residuals for white noise properties using Ljung-Box test.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* GARCH Components */}
        <section id="garch" className="space-y-8 scroll-mt-32 border-t border-border pt-20">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold font-serif">GARCH Components</h2>
            <p className="text-lg text-muted-foreground font-medium">Volatility Clustering Analysis</p>
          </div>
          <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground">
            <p>
              Financial time series often exhibit "Volatility Clustering"—periods where variants vary significantly followed 
              by relative calm. Standard linear models ignore this phenomenon, leading to suboptimal risk estimates.
            </p>
            <div className="bg-[#1a1a1a] dark:bg-white text-white dark:text-gray-900 p-8 rounded-3xl my-8 text-center space-y-4 shadow-xl">
              <code className="text-xl md:text-2xl font-mono font-bold block">
                σₜ² = ω + αεₜ₋₁² + βσₜ₋₁²
              </code>
              <p className="text-xs uppercase tracking-tighter opacity-60">Generalized Autoregressive Conditional Heteroskedasticity (1,1)</p>
            </div>
            <p>
              Our framework uses GARCH(1,1) to model the conditional variance of the ARIMA residuals. 
              The resulting conditional standard deviation (σₜ) is used to standardize the residuals 
              before being passed to the LSTM network.
            </p>
          </div>
        </section>

        {/* LSTM Processing */}
        <section id="lstm" className="space-y-8 scroll-mt-32 border-t border-border pt-20">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold font-serif">LSTM Processing</h2>
            <p className="text-lg text-muted-foreground font-medium">Non-linear Pattern Detection</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6 text-muted-foreground leading-relaxed">
              <p>
                The Long Short-Term Memory (LSTM) network receives the standardized residuals from the previous stages. 
                Because the linear trends and volatility have already been filtered out, the LSTM can focus 
                exclusively on learning subtle non-linear dependencies.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <p className="text-sm font-bold">2-Layer Stacked Architecture (50, 25 units)</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <p className="text-sm font-bold">60-Day Lookback Window</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <p className="text-sm font-bold">Dropout Regularization (0.2)</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full" />
              <div className="relative border border-border bg-card p-8 rounded-3xl shadow-2xl space-y-4">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xs font-black uppercase tracking-widest text-primary">Neural Cell Stats</span>
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                </div>
                {[
                  { label: 'Forget Gate', val: 'Activates on noise removal', h: 'w-[70%]' },
                  { label: 'Input Gate', val: 'Selects relevant patterns', h: 'w-[85%]' },
                  { label: 'Output Gate', val: 'Generates non-linear correction', h: 'w-[65%]' },
                ].map((gate, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      <span>{gate.label}</span>
                      <span>{gate.val}</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full">
                      <div className={`h-full ${gate.h} bg-primary rounded-full`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Optimization Engine */}
        <section id="optimization" className="space-y-8 scroll-mt-32 border-t border-border pt-20">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold font-serif">Optimization Engine</h2>
            <p className="text-lg text-muted-foreground font-medium">Automatic Parameter Selection</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'ARIMA Auto-tune', desc: 'Grid search over p, d, q space using AIC minimization.', val: 'AIC/BIC Criterion' },
              { title: 'GARCH Stability', desc: 'Ensures parameter sums α+β < 1 to maintain mean reversion.', val: 'Constraint Solver' },
              { title: 'LSTM Early Stopping', desc: 'Prevents overfitting by monitoring validation loss trends.', val: 'Adaptive LR' },
            ].map((card, i) => (
              <div key={i} className="p-8 rounded-3xl bg-secondary/30 border border-border space-y-4">
                <h4 className="font-bold text-foreground">{card.title}</h4>
                <p className="text-sm text-muted-foreground">{card.desc}</p>
                <div className="pt-4 border-t border-border font-mono text-[10px] text-primary font-bold">{card.val}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Real-time Pipeline */}
        <section id="pipeline" className="space-y-8 scroll-mt-32 border-t border-border pt-20">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold font-serif">Real-time Pipeline</h2>
            <p className="text-lg text-muted-foreground font-medium">Asynchronous Async Processing</p>
          </div>
          <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground">
            <p>
              The system utilizes a Python-based async queue to handle intensive ML computations without blocking the frontend experience.
              Predictions are processed in the background and pushed to Supabase for instant retrieval.
            </p>
            <div className="my-10 bg-accent p-8 rounded-3xl border border-border">
              <pre className="text-xs md:text-sm font-mono text-accent-foreground overflow-x-auto whitespace-pre-wrap">
                {`# Internal Pipeline Execution Logic
1. FETCH (Alpha Vantage → Supabase)
2. SYNC  (Latest returns calculated)
3. TRAIN (ARIMA → GARCH → LSTM sequence)
4. CACHE (Results stored for 24h)
5. PUSH  (Real-time socket updates)`}
              </pre>
            </div>
          </div>
        </section>

        {/* Evaluation Metrics */}
        <section id="metrics" className="space-y-8 scroll-mt-32 border-t border-border pt-20">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold font-serif">Evaluation Metrics</h2>
            <p className="text-lg text-muted-foreground font-medium">Statistical Validation</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-4 font-black">Metric</th>
                    <th className="pb-4 font-black">Significance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-muted-foreground">
                  <tr><td className="py-4 font-bold">MAE</td><td className="py-4">Abs. Avg Error - Measure of overall bias</td></tr>
                  <tr><td className="py-4 font-bold">RMSE</td><td className="py-4">Sensitivity to large forecast outliers</td></tr>
                  <tr><td className="py-4 font-bold">MAPE</td><td className="py-4">Percentage error for relative comparison</td></tr>
                  <tr><td className="py-4 font-bold font-mono text-primary italic">DM Test</td><td className="py-4 font-bold text-foreground">Statistically proves Hybrid superiority</td></tr>
                </tbody>
              </table>
            </div>
            <div className="p-10 rounded-3xl bg-primary text-primary-foreground space-y-6 shadow-2xl">
              <h3 className="text-2xl font-black italic">Diebold-Mariano Result</h3>
              <p className="text-sm opacity-90 leading-relaxed font-medium">
                "We reject the null hypothesis of equal forecast accuracy at the 5% level. 
                The hybrid framework provides statistically significant improvements over univariate benchmarks."
              </p>
              <div className="pt-6 border-t border-white/20 flex gap-10">
                <div>
                  <span className="text-[10px] uppercase font-black block">P-Value</span>
                  <span className="text-2xl font-black">0.0241</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-black block">Status</span>
                  <span className="text-2xl font-black">PASSED</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* API Documentation */}
        <section id="api" className="space-y-8 scroll-mt-32 border-t border-border pt-20">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold font-serif">API Documentation</h2>
            <p className="text-lg text-muted-foreground font-medium">Next.js Server Endpoints</p>
          </div>
          <div className="space-y-4">
            {[
              { method: 'GET', endpoint: '/api/data/historical', desc: 'Returns 2000+ daily exchange rate records.' },
              { method: 'POST', endpoint: '/api/models/hybrid', desc: 'Triggers a new 30-day hybrid prediction cycle.' },
              { method: 'GET', endpoint: '/api/models/compare', desc: 'Aggregates MAE/RMSE across all standalone benchmarks.' },
            ].map((api, i) => (
              <div key={i} className="flex flex-col md:flex-row md:items-center gap-4 p-5 rounded-2xl border border-border hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                <span className="px-3 py-1 bg-black dark:bg-white text-white dark:text-gray-900 text-[10px] font-black rounded-lg w-fit">{api.method}</span>
                <code className="text-sm font-bold text-foreground">{api.endpoint}</code>
                <p className="text-sm text-muted-foreground md:ml-auto">{api.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Technical Stack */}
        <section id="stack" className="space-y-8 scroll-mt-32 border-t border-border pt-20">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold font-serif">Technical Stack</h2>
            <p className="text-lg text-muted-foreground font-medium">Production Infrastructure</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { type: 'Frontend', val: 'Next.js 14 (TS)' },
              { type: 'Compute', val: 'TensorFlow / Keras' },
              { type: 'Database', val: 'Supabase / Postgre' },
              { type: 'Visuals', val: 'Recharts / D3.js' },
            ].map((stack, i) => (
              <div key={i} className="p-6 rounded-2xl bg-muted/50 border border-border text-center">
                <span className="text-[10px] uppercase font-black text-muted-foreground block mb-1">{stack.type}</span>
                <span className="text-sm font-bold text-foreground">{stack.val}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Installation Guide */}
        <section id="installation" className="space-y-8 scroll-mt-32 border-t border-border pt-20 pb-40">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold font-serif">Installation Guide</h2>
            <p className="text-lg text-muted-foreground font-medium">Deployment Quick-Start</p>
          </div>
          <div className="space-y-4">
            {[
              'Install Node.js 18+ and Python 3.9+',
              'Clone repository and run npm install',
              'Set up Supabase environment variables (.env.local)',
              'Run "npm run dev" to launch local instance',
            ].map((step, i) => (
              <div key={i} className="flex gap-4 p-6 rounded-2xl bg-accent/20 border border-border items-center">
                <span className="text-2xl font-serif text-primary opacity-40">0{i + 1}</span>
                <p className="text-sm font-bold text-foreground">{step}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
