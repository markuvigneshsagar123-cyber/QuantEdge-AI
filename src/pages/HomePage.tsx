import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Brain, TrendingUp, ShieldCheck, Globe } from 'lucide-react';
import { motion } from 'motion/react';
import SearchAutocomplete from '../components/SearchAutocomplete';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-brand-dark text-slate-200 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Navigation */}
      <nav className="absolute top-8 right-8 z-20">
        <button 
          onClick={() => navigate('/market')}
          className="flex items-center gap-2 px-4 py-2 glass-panel hover:bg-white/5 transition-colors text-xs font-mono text-slate-400 hover:text-brand-primary"
        >
          <Globe size={14} />
          MARKET EXPLORER
        </button>
      </nav>

      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-primary/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-secondary/10 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl w-full text-center space-y-12 relative z-10"
      >
        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-brand-primary rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(0,255,136,0.4)]">
            <Activity className="text-brand-dark" size={36} />
          </div>
          <div>
            <h1 className="text-5xl font-black tracking-tighter text-white mb-2">QuantEdge AI</h1>
            <p className="text-slate-400 font-mono uppercase tracking-[0.3em] text-sm">Institutional Stock Intelligence</p>
          </div>
        </div>

        {/* Main Search Area */}
        <div className="max-w-xl mx-auto w-full space-y-8">
          {/* Search Card */}
          <motion.div 
            whileHover={{ scale: 1.01, translateY: -2 }}
            className="glass-panel p-8 flex flex-col items-center text-center group hover:border-brand-primary/50 transition-all cursor-default"
          >
            <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center mb-6 text-brand-primary group-hover:scale-110 transition-transform">
              <Activity size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Search Market</h3>
            <p className="text-sm text-slate-500 mb-8">Enter NSE/BSE ticker or company name for instant AI analysis.</p>
            
            <SearchAutocomplete 
              onSelect={(s) => navigate(`/dashboard?symbol=${s}`)}
              placeholder="e.g. RELIANCE, TCS, HDFCBANK"
            />
          </motion.div>

          {/* Popular Stocks Quick Access */}
          <div className="flex flex-wrap justify-center gap-3">
            {['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK', 'SBIN'].map(s => (
              <motion.button
                key={s}
                whileHover={{ scale: 1.1, backgroundColor: 'rgba(0, 255, 136, 0.1)', borderColor: 'rgba(0, 255, 136, 0.5)' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(`/dashboard?symbol=${s}.NS`)}
                className="px-3 py-1.5 rounded-lg bg-white/5 border border-brand-border text-[10px] font-mono text-slate-400 hover:text-brand-primary transition-all cursor-pointer"
              >
                ${s}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Features Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 border-t border-brand-border">
          {[
            { icon: <Brain size={16} />, label: 'AI Prediction' },
            { icon: <TrendingUp size={16} />, label: 'Live NSE/BSE' },
            { icon: <ShieldCheck size={16} />, label: 'Risk Analysis' },
            { icon: <Activity size={16} />, label: 'Sentiment' },
          ].map((f, i) => (
            <div key={i} className="flex items-center justify-center gap-2 text-xs font-mono text-slate-500">
              <span className="text-brand-primary">{f.icon}</span>
              {f.label}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Footer */}
      <footer className="absolute bottom-8 text-[10px] font-mono text-slate-600 tracking-widest uppercase">
        QuantEdge AI Systems • Professional Grade Terminal
      </footer>
    </div>
  );
}
