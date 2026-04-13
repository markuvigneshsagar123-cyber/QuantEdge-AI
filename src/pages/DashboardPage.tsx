import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, Activity, Newspaper, Brain, RefreshCw, BarChart3, ShieldAlert, ArrowLeft, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatCurrency, formatNumber, cn } from '../lib/utils';
import StockChart from '../components/StockChart';
import SentimentPanel from '../components/SentimentPanel';
import PredictionCard from '../components/PredictionCard';
import ReportModal from '../components/ReportModal';
import SearchAutocomplete from '../components/SearchAutocomplete';
import { Skeleton } from '../components/Skeleton';

export default function DashboardPage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const initialSymbol = searchParams.get('symbol') || 'RELIANCE.NS';
  
  const [symbol, setSymbol] = useState(initialSymbol);
  const [timeframe, setTimeframe] = useState('1M');
  const [stockData, setStockData] = useState<any>(null);
  const [newsData, setNewsData] = useState<any[]>([]);
  const [socialData, setSocialData] = useState<any[]>([]);
  const [prediction, setPrediction] = useState<any>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(true);

  const fetchPriceUpdate = async (targetSymbol: string) => {
    try {
      const stockRes = await fetch(`/api/stock/${targetSymbol}?light=true`);
      if (stockRes.ok) {
        const stockJson = await stockRes.json();
        
        // Add a tiny bit of random noise (0.01%) to simulate real-time tick movement
        // This makes the 0.5s updates feel "alive" even if the API data is slightly delayed
        const noise = 1 + (Math.random() * 0.0002 - 0.0001);
        const simulatedPrice = stockJson.quote.regularMarketPrice * noise;
        
        setStockData((prev: any) => {
          if (!prev) return stockJson;
          
          const updatedQuote = {
            ...stockJson.quote,
            regularMarketPrice: simulatedPrice,
            regularMarketChange: simulatedPrice - stockJson.quote.regularMarketOpen,
            regularMarketChangePercent: ((simulatedPrice - stockJson.quote.regularMarketOpen) / stockJson.quote.regularMarketOpen) * 100
          };

          return {
            ...prev,
            quote: updatedQuote,
            // Update the last history point to reflect the live price
            history: prev.history?.length > 0 
              ? [...prev.history.slice(0, -1), { ...prev.history[prev.history.length - 1], close: simulatedPrice }]
              : prev.history
          };
        });
      }
    } catch (err) {
      console.warn('Price update failed', err);
    }
  };

  const fetchData = async (targetSymbol: string, range: string = '1m', isInitial = true) => {
    if (isInitial) setLoading(true);
    setError(null);
    try {
      const stockRes = await fetch(`/api/stock/${targetSymbol}?range=${range.toLowerCase()}`);
      if (!stockRes.ok) throw new Error('Stock not found');
      const stockJson = await stockRes.json();
      setStockData(stockJson);

      // Only fetch news and prediction on initial load or symbol change
      if (isInitial || targetSymbol !== stockData?.quote.symbol) {
        const newsRes = await fetch(`/api/news/${targetSymbol}`);
        const newsJson = await newsRes.json();
        setNewsData(newsJson.news);
        setSocialData(newsJson.social);

        const mockSentiment = { score: Math.random() * 2 - 1 };
        const predictRes = await fetch('/api/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            symbol: targetSymbol,
            technicals: {
              rsi: 45 + Math.random() * 30,
              sma20: stockJson.quote.regularMarketPrice * 0.98,
              sma50: stockJson.quote.regularMarketPrice * 0.95,
            },
            sentiment: mockSentiment
          })
        });
        const predictJson = await predictRes.json();
        setPrediction(predictJson);
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(symbol, timeframe, true);
  }, [symbol, timeframe]);

  // High-frequency price polling
  useEffect(() => {
    const isMarketOpen = stockData?.quote.marketState === 'REGULAR';
    if (!isLive || !symbol || !isMarketOpen) return;

    const interval = setInterval(() => {
      fetchPriceUpdate(symbol);
    }, 500);

    return () => clearInterval(interval);
  }, [symbol, isLive, stockData?.quote.marketState]);

  return (
    <div className="min-h-screen bg-brand-dark text-slate-200 p-4 md:p-8">
      {/* Header */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/')}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-white"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-primary rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(0,255,136,0.3)]">
              <Activity className="text-brand-dark" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">QuantEdge AI</h1>
              <p className="text-xs text-slate-400 font-mono uppercase tracking-widest">Institutional Intelligence</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/market')}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 glass-panel hover:bg-white/5 transition-colors text-[10px] font-mono text-slate-400 hover:text-brand-primary"
          >
            <Globe size={12} />
            MARKET
          </button>
        </div>

        <SearchAutocomplete 
          onSelect={(s) => setSymbol(s)}
          placeholder="Search NSE/BSE (e.g. RELIANCE, TCS)..."
          className="md:w-96"
        />

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className={cn(
            "flex items-center gap-2 px-3 py-1.5 glass-panel",
            stockData?.quote.marketState === 'REGULAR' ? "text-brand-primary" : "text-red-400"
          )}>
            <span className={cn(
              "w-2 h-2 rounded-full animate-pulse",
              stockData?.quote.marketState === 'REGULAR' ? "bg-brand-primary" : "bg-red-400"
            )} />
            {stockData?.quote.marketState === 'REGULAR' ? 'MARKET OPEN' : 'MARKET CLOSED'}
          </div>
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 glass-panel">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            {new Date().toLocaleTimeString()}
          </div>
          <button 
            onClick={() => setIsLive(!isLive)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 glass-panel transition-colors",
              isLive ? "text-brand-primary border-brand-primary/50" : "text-slate-500"
            )}
          >
            <Activity size={14} className={isLive ? "animate-pulse" : ""} />
            {isLive ? "LIVE" : "PAUSED"}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-6">
          <section className="glass-panel p-6 flex flex-wrap justify-between items-end gap-6 min-h-[120px]">
            {loading && !stockData ? (
              <div className="w-full flex justify-between items-end">
                <div className="space-y-2">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-10 w-64" />
                </div>
                <div className="flex gap-8">
                  {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-12 w-20" />)}
                </div>
              </div>
            ) : stockData ? (
              <>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-3xl font-bold text-white">{stockData.quote.symbol}</h2>
                    <span className="text-sm text-slate-500 font-medium">{stockData.quote.longName}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <motion.span 
                      key={stockData.quote.regularMarketPrice}
                      initial={{ opacity: 0.8 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className="text-4xl font-bold text-white"
                    >
                      {formatCurrency(stockData.quote.regularMarketPrice)}
                    </motion.span>
                    <motion.div 
                      key={stockData.quote.regularMarketChange}
                      initial={{ scale: 0.95 }}
                      animate={{ scale: 1 }}
                      className={cn(
                        "flex items-center gap-1 font-medium px-2 py-1 rounded-lg text-sm",
                        stockData.quote.regularMarketChange >= 0 ? "text-brand-primary bg-brand-primary/10" : "text-red-400 bg-red-400/10"
                      )}
                    >
                      {stockData.quote.regularMarketChange >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                      {formatNumber(stockData.quote.regularMarketChange)} ({formatNumber(stockData.quote.regularMarketChangePercent)}%)
                    </motion.div>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-sm border-l border-brand-border pl-8">
                  <div>
                    <p className="text-slate-500 mb-1">Open</p>
                    <p className="font-mono text-white">{formatCurrency(stockData.quote.regularMarketOpen)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-1">High</p>
                    <p className="font-mono text-white">{formatCurrency(stockData.quote.regularMarketDayHigh)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-1">Low</p>
                    <p className="font-mono text-white">{formatCurrency(stockData.quote.regularMarketDayLow)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-1">Volume</p>
                    <p className="font-mono text-white">{formatNumber(stockData.quote.regularMarketVolume)}</p>
                  </div>
                </div>
              </>
            ) : null}
          </section>

          <section className="glass-panel p-6 h-[500px]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold flex items-center gap-2">
                <BarChart3 size={18} className="text-brand-primary" />
                Technical Analysis
              </h3>
              <div className="flex gap-2">
                {['1D', '1W', '1M', '1Y', 'ALL'].map((p) => (
                  <button 
                    key={p} 
                    onClick={() => setTimeframe(p)}
                    className={cn(
                      "px-3 py-1 text-xs font-mono rounded-md transition-colors border",
                      timeframe === p 
                        ? "bg-brand-primary text-brand-dark border-brand-primary font-bold shadow-[0_0_15px_rgba(0,255,136,0.3)]" 
                        : "bg-transparent text-slate-400 border-brand-border hover:bg-brand-primary/10 hover:text-brand-primary"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-[400px] w-full">
              <StockChart data={stockData?.history} loading={loading && !stockData} />
            </div>
          </section>

          <div className="grid grid-cols-1 gap-6">
            <section className="glass-panel p-6">
              <h3 className="font-semibold flex items-center gap-2 mb-4">
                <Newspaper size={18} className="text-brand-secondary" />
                Market Sentiment
              </h3>
              {loading && newsData.length === 0 ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full" />)}
                </div>
              ) : (
                <SentimentPanel news={newsData} loading={loading} />
              )}
            </section>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 space-y-6">
          <section className="glass-panel p-6 border-l-4 border-l-brand-primary">
            <h3 className="font-semibold flex items-center gap-2 mb-6">
              <Brain size={18} className="text-brand-primary" />
              AI Prediction Engine
            </h3>
            {loading && !prediction ? (
              <div className="space-y-6">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <PredictionCard 
                prediction={prediction} 
                loading={loading} 
                onGenerateReport={() => setIsReportOpen(true)} 
              />
            )}
          </section>

          <section className="glass-panel p-6">
            <h3 className="font-semibold flex items-center gap-2 mb-4">
              <ShieldAlert size={18} className="text-orange-400" />
              Risk Assessment
            </h3>
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-2 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Volatility Index</span>
                  <span className="text-sm font-mono text-white">Medium</span>
                </div>
                <div className="w-full bg-brand-border h-2 rounded-full overflow-hidden">
                  <div className="bg-orange-400 h-full w-[65%]" />
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Current market conditions show moderate volatility. RSI levels are stabilizing but news sentiment remains cautious.
                </p>
              </div>
            )}
          </section>

          <section className="glass-panel p-6">
            <h3 className="font-semibold flex items-center gap-2 mb-4 text-brand-primary">
              <Activity size={18} />
              Social Intelligence (X/Twitter)
            </h3>
            <div className="space-y-3">
              {loading && socialData.length === 0 ? (
                [1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 w-full" />)
              ) : (
                socialData.map((post, i) => (
                  <motion.div 
                    key={i} 
                    whileHover={{ scale: 1.02, x: 4, backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
                    className="p-3 rounded-lg bg-white/5 border border-white/5 hover:border-brand-primary/30 transition-all group cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[10px] font-bold text-brand-secondary">{post.user}</span>
                      <span className="text-[10px] text-slate-500">{post.time}</span>
                    </div>
                    <p className="text-xs text-slate-300 mb-2 leading-snug">{post.content}</p>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-[8px] px-1.5 py-0.5 rounded font-bold uppercase",
                        post.sentiment === 'Bullish' ? "bg-brand-primary/10 text-brand-primary" : "bg-slate-500/10 text-slate-500"
                      )}>
                        {post.sentiment}
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </section>
        </div>
      </main>

      <ReportModal 
        isOpen={isReportOpen} 
        onClose={() => setIsReportOpen(false)} 
        data={{ stockData, prediction, newsData, socialData }} 
      />

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 right-8 bg-red-500 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 z-50"
          >
            <ShieldAlert size={20} />
            <span className="font-medium">{error}</span>
            <button onClick={() => setError(null)} className="ml-4 hover:opacity-70">✕</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
