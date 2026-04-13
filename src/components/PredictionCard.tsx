import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, ShieldAlert, Target, Info, ArrowUpRight, ArrowDownRight, Minus, FileText } from 'lucide-react';
import { cn } from '../lib/utils';

interface PredictionCardProps {
  prediction: any;
  loading: boolean;
  onGenerateReport: () => void;
}

export default function PredictionCard({ prediction, loading, onGenerateReport }: PredictionCardProps) {
  if (loading || !prediction) return (
    <div className="space-y-6 animate-pulse">
      <div className="h-32 bg-white/5 rounded-xl" />
      <div className="h-24 bg-white/5 rounded-xl" />
    </div>
  );

  const getPredictionColor = (p: string) => {
    switch (p) {
      case 'BUY': return 'text-brand-primary';
      case 'SELL': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getPredictionIcon = (p: string) => {
    switch (p) {
      case 'BUY': return <ArrowUpRight className="text-brand-primary" size={32} />;
      case 'SELL': return <ArrowDownRight className="text-red-400" size={32} />;
      default: return <Minus className="text-slate-400" size={32} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Signal */}
      <motion.div 
        whileHover={{ scale: 1.02, translateY: -2 }}
        className="relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br from-brand-surface to-brand-dark border border-brand-border cursor-default"
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-1">Signal Output</p>
            <h4 className={cn("text-4xl font-black tracking-tighter", getPredictionColor(prediction.prediction))}>
              {prediction.prediction}
            </h4>
          </div>
          {getPredictionIcon(prediction.prediction)}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-500">Confidence Score</span>
            <span className="text-white">{prediction.confidence}%</span>
          </div>
          <div className="w-full bg-brand-border h-1.5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${prediction.confidence}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={cn("h-full", getPredictionColor(prediction.prediction).replace('text-', 'bg-'))} 
            />
          </div>
        </div>
      </motion.div>

      {/* Explanation Engine */}
      <motion.div 
        whileHover={{ x: 4 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <Target size={16} className="text-brand-secondary" />
          AI Explanation Engine
        </div>
        <div className="p-4 rounded-xl bg-brand-secondary/5 border border-brand-secondary/10 text-xs leading-relaxed text-slate-300">
          {prediction.explanation}
        </div>
      </motion.div>

      {/* Multi-Factor Score */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div 
          whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
          className="p-4 rounded-xl bg-white/5 border border-white/5 cursor-default"
        >
          <p className="text-[10px] font-mono text-slate-500 uppercase mb-1">Market Mood</p>
          <div className="flex items-center gap-2">
            <span className={cn("w-2 h-2 rounded-full", prediction.marketMood === 'Bullish' ? 'bg-brand-primary' : 'bg-red-400')} />
            <span className="text-sm font-bold text-white">{prediction.marketMood}</span>
          </div>
        </motion.div>
        <motion.div 
          whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
          className="p-4 rounded-xl bg-white/5 border border-white/5 cursor-default"
        >
          <p className="text-[10px] font-mono text-slate-500 uppercase mb-1">Risk Factor</p>
          <div className="flex items-center gap-2">
            <ShieldAlert size={14} className={prediction.riskLevel === 'High' ? 'text-red-400' : 'text-orange-400'} />
            <span className="text-sm font-bold text-white">{prediction.riskLevel}</span>
          </div>
        </motion.div>
      </div>

      {/* Concise Overview */}
      <motion.div 
        whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
        className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3 cursor-default"
      >
        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Intelligence Overview</h4>
        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-400">Final Signal</span>
          <span className={cn(
            "text-xs font-bold px-2 py-0.5 rounded",
            prediction.prediction === 'BUY' ? "bg-brand-primary/10 text-brand-primary" : "bg-red-400/10 text-red-400"
          )}>{prediction.prediction}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-400">AI Confidence</span>
          <span className="text-xs font-bold text-white">{prediction.confidence}%</span>
        </div>
        <div className="pt-2 border-t border-white/5">
          <p className="text-[10px] text-slate-500 uppercase mb-1">Primary Factor</p>
          <p className="text-[11px] text-slate-300 leading-snug">
            {prediction.explanation.split('.')[0]}.
          </p>
        </div>
      </motion.div>

      {/* Action Button */}
      <motion.button 
        whileHover={{ scale: 1.02, boxShadow: '0 0 50px rgba(0, 255, 136, 0.5)' }}
        whileTap={{ scale: 0.98 }}
        onClick={onGenerateReport}
        className="w-full py-4 rounded-xl bg-brand-primary text-brand-dark font-black text-sm shadow-[0_0_30px_rgba(0,255,136,0.2)] transition-all flex items-center justify-center gap-3 group cursor-pointer"
      >
        <FileText size={18} className="group-hover:scale-110 transition-transform" />
        GENERATE FULL INTELLIGENCE REPORT
      </motion.button>
    </div>
  );
}
