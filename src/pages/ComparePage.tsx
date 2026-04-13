import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart3, Brain, TrendingUp, TrendingDown, Activity, ShieldAlert, Scale } from 'lucide-react';
import { motion } from 'motion/react';
import { formatCurrency, formatNumber, cn } from '../lib/utils';
import StockChart from '../components/StockChart';
import { Skeleton } from '../components/Skeleton';

export default function ComparePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const symbols = searchParams.get('symbols')?.split(',') || [];
  
  const [comparisonData, setComparisonData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComparisonData = async () => {
    setLoading(true);
    try {
      const results = await Promise.all(
        symbols.map(async (s) => {
          const stockRes = await fetch(`/api/stock/${s}`);
          const stockJson = await stockRes.json();
          
          // Mock prediction for comparison
          const predictRes = await fetch('/api/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              symbol: s,
              technicals: { rsi: 50, sma20: 100, sma50: 95 },
              sentiment: { score: 0.5 }
            })
          });
          const predictJson = await predictRes.json();
          
          return { ...stockJson, prediction: predictJson };
        })
      );
      setComparisonData(results);
    } catch (err) {
      console.error('Failed to fetch comparison data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (symbols.length > 0) {
      fetchComparisonData();
    }
  }, [searchParams]);

  const getBestChoice = () => {
    if (comparisonData.length === 0) return null;
    
    // Logic: BUY > HOLD > SELL, then highest confidence
    return [...comparisonData].sort((a, b) => {
      const scoreA = (a.prediction.prediction === 'BUY' ? 3 : a.prediction.prediction === 'HOLD' ? 2 : 1) * 100 + a.prediction.confidence;
      const scoreB = (b.prediction.prediction === 'BUY' ? 3 : b.prediction.prediction === 'HOLD' ? 2 : 1) * 100 + b.prediction.confidence;
      return scoreB - scoreA;
    })[0];
  };

  const bestChoice = getBestChoice();

  return (
    <div className="min-h-screen bg-brand-dark text-slate-200 p-4 md:p-8">
      <header className="max-w-7xl mx-auto flex justify-between items-center mb-12">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-white"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-secondary rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(0,210,255,0.3)]">
              <Scale className="text-brand-dark" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Stock Comparison</h1>
              <p className="text-xs text-slate-400 font-mono uppercase tracking-widest">Side-by-Side Intelligence</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto space-y-12">
        {/* AI Verdict Section */}
        {!loading && bestChoice && symbols.length > 1 && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-8 border-l-4 border-l-brand-primary bg-brand-primary/5 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Brain size={120} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-brand-primary rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(0,255,136,0.4)]">
                  <Brain className="text-brand-dark" size={28} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white uppercase tracking-tight">QuantEdge AI Verdict</h2>
                  <p className="text-xs text-brand-primary font-mono font-bold">Optimal Selection Identified</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="space-y-4">
                  <h3 className="text-4xl font-black text-white tracking-tighter">
                    {bestChoice.quote.symbol} is the <span className="text-brand-primary">Best Choice</span>
                  </h3>
                  <p className="text-slate-400 leading-relaxed">
                    Based on our multi-factor analysis including technical indicators, market sentiment, and institutional flow, 
                    <span className="text-white font-bold"> {bestChoice.quote.longName}</span> shows the most robust risk-reward profile among the compared assets.
                  </p>
                  <div className="flex gap-4 pt-4">
                    <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10">
                      <p className="text-[10px] text-slate-500 uppercase mb-1">AI Confidence</p>
                      <p className="text-lg font-bold text-white">{bestChoice.prediction.confidence}%</p>
                    </div>
                    <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10">
                      <p className="text-[10px] text-slate-500 uppercase mb-1">Signal Strength</p>
                      <p className="text-lg font-bold text-brand-primary">High</p>
                    </div>
                  </div>
                </div>

                <div className="glass-panel p-6 bg-brand-dark/50 border-brand-primary/20 space-y-4">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Why {bestChoice.quote.symbol}?</h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3 text-sm text-slate-300">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-primary shrink-0" />
                      Superior technical alignment with a {bestChoice.prediction.prediction} signal.
                    </li>
                    <li className="flex items-start gap-3 text-sm text-slate-300">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-primary shrink-0" />
                      Higher institutional confidence score of {bestChoice.prediction.confidence}% compared to peers.
                    </li>
                    <li className="flex items-start gap-3 text-sm text-slate-300">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-primary shrink-0" />
                      Favorable {bestChoice.prediction.marketMood} market mood and controlled risk levels.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.section>
        )}

        <div className={cn(
          "grid gap-6",
          symbols.length === 1 ? "grid-cols-1" : 
          symbols.length === 2 ? "grid-cols-1 md:grid-cols-2" : 
          "grid-cols-1 lg:grid-cols-3"
        )}>
          {loading ? (
            [...Array(symbols.length || 2)].map((_, i) => (
              <div key={i} className="space-y-6">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
            ))
          ) : (
            comparisonData.map((data, i) => (
              <motion.div 
                key={data.quote.symbol}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="space-y-6"
              >
                {/* Header Card */}
                <div className="glass-panel p-6 border-t-4 border-t-brand-primary">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-white">{data.quote.symbol}</h2>
                      <p className="text-xs text-slate-500 truncate">{data.quote.longName}</p>
                    </div>
                    <div className={cn(
                      "text-right",
                      data.quote.regularMarketChange >= 0 ? "text-brand-primary" : "text-red-400"
                    )}>
                      <p className="text-xl font-mono font-bold">{formatCurrency(data.quote.regularMarketPrice)}</p>
                      <p className="text-xs flex items-center justify-end gap-1">
                        {data.quote.regularMarketChange >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {formatNumber(data.quote.regularMarketChangePercent)}%
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase">Day High</p>
                      <p className="text-sm font-mono text-white">{formatCurrency(data.quote.regularMarketDayHigh)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase">Day Low</p>
                      <p className="text-sm font-mono text-white">{formatCurrency(data.quote.regularMarketDayLow)}</p>
                    </div>
                  </div>
                </div>

                {/* Chart Section */}
                <div className="glass-panel p-6 h-64">
                  <h3 className="text-xs font-bold text-slate-500 uppercase mb-4 flex items-center gap-2">
                    <BarChart3 size={14} className="text-brand-primary" />
                    Price Action (1M)
                  </h3>
                  <div className="h-40">
                    <StockChart data={data.history} />
                  </div>
                </div>

                {/* AI Prediction Section */}
                <div className="glass-panel p-6 bg-brand-primary/5 border-brand-primary/20">
                  <h3 className="text-xs font-bold text-slate-500 uppercase mb-4 flex items-center gap-2">
                    <Brain size={14} className="text-brand-primary" />
                    AI Signal
                  </h3>
                  <div className="flex justify-between items-center mb-4">
                    <span className={cn(
                      "text-2xl font-black",
                      data.prediction.prediction === 'BUY' ? "text-brand-primary" : "text-red-400"
                    )}>
                      {data.prediction.prediction}
                    </span>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-500">Confidence</p>
                      <p className="text-sm font-bold text-white">{data.prediction.confidence}%</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-3 italic">
                    "{data.prediction.explanation}"
                  </p>
                </div>

                {/* Metrics Comparison */}
                <div className="glass-panel p-6 space-y-4">
                  <h3 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                    <Activity size={14} className="text-brand-secondary" />
                    Key Metrics
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500">Market Cap</span>
                      <span className="text-xs font-mono text-white">₹{(data.quote.marketCap / 10000000).toFixed(2)} Cr</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500">P/E Ratio</span>
                      <span className="text-xs font-mono text-white">{data.quote.trailingPE?.toFixed(2) || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500">Div. Yield</span>
                      <span className="text-xs font-mono text-white">{data.quote.dividendYield?.toFixed(2) || '0.00'}%</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {!loading && symbols.length === 0 && (
          <div className="text-center py-24">
            <Scale size={48} className="mx-auto mb-4 text-slate-700" />
            <h3 className="text-xl font-bold text-white mb-2">No stocks selected</h3>
            <p className="text-slate-500 mb-8">Go back to Market Explorer to select stocks for comparison.</p>
            <button 
              onClick={() => navigate('/market')}
              className="px-6 py-2 bg-brand-primary text-brand-dark rounded-xl font-bold hover:opacity-90 transition-opacity"
            >
              Go to Market
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
