import React from 'react';
import { ExternalLink, MessageSquare, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface SentimentPanelProps {
  news: any[];
  loading: boolean;
}

export default function SentimentPanel({ news, loading }: SentimentPanelProps) {
  if (loading) return <div className="space-y-4 animate-pulse">
    {[1, 2, 3].map(i => <div key={i} className="h-20 bg-white/5 rounded-lg" />)}
  </div>;

  const sentimentScore = 0.65; // Mock score

  return (
    <div className="space-y-6">
      {/* Sentiment Breakdown */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 rounded-xl bg-brand-primary/5 border border-brand-primary/10">
          <TrendingUp className="mx-auto mb-1 text-brand-primary" size={18} />
          <p className="text-xs text-slate-500 uppercase font-bold">Positive</p>
          <p className="text-lg font-mono text-white">62%</p>
        </div>
        <div className="text-center p-3 rounded-xl bg-slate-500/5 border border-slate-500/10">
          <Minus className="mx-auto mb-1 text-slate-500" size={18} />
          <p className="text-xs text-slate-500 uppercase font-bold">Neutral</p>
          <p className="text-lg font-mono text-white">28%</p>
        </div>
        <div className="text-center p-3 rounded-xl bg-red-500/5 border border-red-500/10">
          <TrendingDown className="mx-auto mb-1 text-red-500" size={18} />
          <p className="text-xs text-slate-500 uppercase font-bold">Negative</p>
          <p className="text-lg font-mono text-white">10%</p>
        </div>
      </div>

      {/* News List */}
      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
        {news.length > 0 ? news.map((item, i) => (
          <motion.div 
            key={i} 
            whileHover={{ scale: 1.01, x: 2, backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
            className="group p-4 rounded-xl bg-white/5 border border-white/5 hover:border-brand-secondary/30 transition-all cursor-default"
          >
            <div className="flex justify-between items-start gap-4 mb-2">
              <div className="space-y-1">
                <span className="text-[8px] font-bold text-brand-secondary uppercase tracking-tighter px-1.5 py-0.5 rounded bg-brand-secondary/10">
                  {i % 2 === 0 ? 'MARKET ANALYSIS' : 'CORPORATE NEWS'}
                </span>
                <h4 className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors line-clamp-2">
                  {item.title}
                </h4>
              </div>
              <a href={item.link} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-brand-secondary transition-colors shrink-0 cursor-pointer">
                <ExternalLink size={14} />
              </a>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500">
              <span className="flex items-center gap-1">
                <MessageSquare size={10} />
                {item.source}
              </span>
              <span>•</span>
              <span>{item.time}</span>
              <span className="ml-auto px-2 py-0.5 rounded bg-brand-primary/10 text-brand-primary">BULLISH</span>
            </div>
          </motion.div>
        )) : (
          <p className="text-center text-slate-500 text-sm py-8">No recent news found for this symbol.</p>
        )}
      </div>
    </div>
  );
}
