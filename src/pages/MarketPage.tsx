import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, TrendingUp, TrendingDown, Activity, ArrowLeft, BarChart3, Globe, PieChart, Scale, Plus, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { NIFTY_50, SECTORS, INDEXES } from '../constants/indianStocks';
import { formatCurrency, formatNumber, cn } from '../lib/utils';
import { Skeleton } from '../components/Skeleton';

export default function MarketPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'INDEXES' | 'NIFTY50' | 'SECTORS'>('INDEXES');
  const [activeSector, setActiveSector] = useState<string>('BANKING');
  const [marketData, setMarketData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

  const toggleCompare = (e: React.MouseEvent, symbol: string) => {
    e.stopPropagation();
    setSelectedForCompare(prev => 
      prev.includes(symbol) 
        ? prev.filter(s => s !== symbol) 
        : prev.length < 3 ? [...prev, symbol] : prev
    );
  };

  const fetchBatchData = async (symbols: string[]) => {
    setLoading(true);
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const data: Record<string, any> = {};
      
      // Simulate live data for the list
      symbols.forEach(symbol => {
        const isIndex = symbol.startsWith('^');
        const basePrice = isIndex ? Math.random() * 20000 + 5000 : Math.random() * 2000 + 100;
        const change = (Math.random() * 4 - 2);
        data[symbol] = {
          price: basePrice,
          change: change,
          changePercent: (change / basePrice) * 100
        };
      });
      
      setMarketData(data);
    } catch (err) {
      console.error('Failed to fetch market data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let symbols: string[] = [];
    if (activeTab === 'INDEXES') {
      symbols = INDEXES.map(s => s.symbol);
    } else if (activeTab === 'NIFTY50') {
      symbols = NIFTY_50.map(s => s.symbol);
    } else {
      symbols = SECTORS[activeSector as keyof typeof SECTORS].map(s => s.symbol);
    }
    fetchBatchData(symbols);
  }, [activeTab, activeSector]);

  const getFilteredList = () => {
    if (activeTab === 'INDEXES') return INDEXES;
    if (activeTab === 'NIFTY50') return NIFTY_50;
    return SECTORS[activeSector as keyof typeof SECTORS];
  };

  const filteredStocks = getFilteredList()
    .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.symbol.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="min-h-screen bg-brand-dark text-slate-200 p-4 md:p-8">
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
              <Globe className="text-brand-dark" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Market Explorer</h1>
              <p className="text-xs text-slate-400 font-mono uppercase tracking-widest">Indian Equities Overview</p>
            </div>
          </div>
        </div>

        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Filter stocks..."
            className="w-full bg-brand-surface border border-brand-border rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-brand-primary transition-colors text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      <main className="max-w-7xl mx-auto space-y-8">
        {/* Market Tabs */}
        <div className="flex gap-4 border-b border-brand-border pb-4">
          <button 
            onClick={() => setActiveTab('INDEXES')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium",
              activeTab === 'INDEXES' ? "bg-brand-primary text-brand-dark" : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
          >
            <Activity size={18} />
            Indexes
          </button>
          <button 
            onClick={() => setActiveTab('NIFTY50')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium",
              activeTab === 'NIFTY50' ? "bg-brand-primary text-brand-dark" : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
          >
            <BarChart3 size={18} />
            NIFTY 50
          </button>
          <button 
            onClick={() => setActiveTab('SECTORS')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium",
              activeTab === 'SECTORS' ? "bg-brand-primary text-brand-dark" : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
          >
            <PieChart size={18} />
            Sectors
          </button>
        </div>

        {activeTab === 'SECTORS' && (
          <div className="flex flex-wrap gap-2">
            {Object.keys(SECTORS).map(sector => (
              <button
                key={sector}
                onClick={() => setActiveSector(sector)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-bold transition-all border",
                  activeSector === sector 
                    ? "bg-brand-secondary/20 text-brand-secondary border-brand-secondary" 
                    : "border-brand-border text-slate-500 hover:border-slate-400"
                )}
              >
                {sector}
              </button>
            ))}
          </div>
        )}

        {/* Stock Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {loading ? (
            [...Array(12)].map((_, i) => (
              <div key={i} className="glass-panel p-4 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <div className="space-y-2 text-right">
                    <Skeleton className="h-5 w-16 ml-auto" />
                    <Skeleton className="h-3 w-12 ml-auto" />
                  </div>
                </div>
                <Skeleton className="h-1 w-full" />
              </div>
            ))
          ) : filteredStocks.map((stock, i) => {
            const data = marketData[stock.symbol];
            return (
              <motion.div
                key={stock.symbol}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ 
                  scale: 1.02, 
                  translateY: -4,
                  borderColor: 'rgba(0, 255, 136, 0.5)',
                  boxShadow: '0 10px 30px -10px rgba(0, 255, 136, 0.2)'
                }}
                transition={{ 
                  type: 'spring',
                  stiffness: 300,
                  damping: 20,
                  delay: i * 0.02 
                }}
                onClick={() => navigate(`/dashboard?symbol=${stock.symbol}`)}
                className="glass-panel p-4 cursor-pointer group transition-all"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white group-hover:text-brand-primary transition-colors">{stock.symbol.split('.')[0]}</h4>
                      {!stock.symbol.startsWith('^') && (
                        <button
                          onClick={(e) => toggleCompare(e, stock.symbol)}
                          className={cn(
                            "p-1 rounded-md transition-all",
                            selectedForCompare.includes(stock.symbol) 
                              ? "bg-brand-secondary text-brand-dark" 
                              : "bg-white/5 text-slate-500 hover:text-brand-secondary hover:bg-brand-secondary/10"
                          )}
                          title="Add to comparison"
                        >
                          {selectedForCompare.includes(stock.symbol) ? <Check size={12} /> : <Plus size={12} />}
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 truncate max-w-[120px]">{stock.name}</p>
                  </div>
                  {data && (
                    <div className={cn(
                      "text-right",
                      data.change >= 0 ? "text-brand-primary" : "text-red-400"
                    )}>
                      <p className="font-mono font-bold text-sm">{formatCurrency(data.price)}</p>
                      <p className="text-[10px] flex items-center justify-end gap-1">
                        {data.change >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                        {formatNumber(data.changePercent)}%
                      </p>
                    </div>
                  )}
                </div>
                <div className="h-1 w-full bg-brand-border rounded-full overflow-hidden mt-4">
                  <div 
                    className={cn(
                      "h-full transition-all duration-1000",
                      data?.change >= 0 ? "bg-brand-primary" : "bg-red-400"
                    )}
                    style={{ width: `${Math.abs(data?.changePercent * 10 || 50)}%` }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </main>

      {/* Floating Compare Button */}
      <AnimatePresence>
        {selectedForCompare.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="glass-panel p-4 flex items-center gap-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-brand-secondary/30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-brand-secondary rounded-lg flex items-center justify-center">
                  <Scale className="text-brand-dark" size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">{selectedForCompare.length} Stocks Selected</p>
                  <p className="text-[10px] text-slate-500 font-mono">{selectedForCompare.join(', ')}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setSelectedForCompare([])}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
                >
                  Clear
                </button>
                <button 
                  onClick={() => navigate(`/compare?symbols=${selectedForCompare.join(',')}`)}
                  disabled={selectedForCompare.length < 2}
                  className={cn(
                    "px-6 py-2 rounded-xl font-bold text-xs transition-all",
                    selectedForCompare.length >= 2 
                      ? "bg-brand-secondary text-brand-dark shadow-[0_0_20px_rgba(0,210,255,0.3)] hover:scale-105 active:scale-95" 
                      : "bg-white/5 text-slate-600 cursor-not-allowed"
                  )}
                >
                  Compare Now
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
