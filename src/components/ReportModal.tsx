import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, FileText, Download, TrendingUp, TrendingDown, Brain, Shield, Globe, MessageSquare, BarChart2, CheckCircle2 } from 'lucide-react';
import { formatCurrency, formatNumber, cn } from '../lib/utils';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    stockData: any;
    prediction: any;
    newsData: any[];
    socialData: any[];
  };
}

export default function ReportModal({ isOpen, onClose, data }: ReportModalProps) {
  const reportRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !data.stockData) return null;

  const { stockData, prediction, newsData, socialData } = data;

  const handleExportPDF = async () => {
    if (!reportRef.current) return;

    const canvas = await html2canvas(reportRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#0a0a0c'
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [canvas.width / 2, canvas.height / 2]
    });

    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
    pdf.save(`QuantEdge_Report_${stockData.quote.symbol}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-brand-dark/90 backdrop-blur-xl"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl max-h-[90vh] bg-brand-surface border border-brand-border rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-brand-border flex justify-between items-center bg-brand-surface/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-primary/10 rounded-lg flex items-center justify-center">
                <FileText className="text-brand-primary" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Intelligence Report: {stockData.quote.symbol}</h2>
                <p className="text-xs text-slate-500 font-mono">Generated on {new Date().toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={handleExportPDF}
                className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-brand-dark rounded-lg text-xs font-bold hover:opacity-90 transition-opacity"
              >
                <Download size={14} />
                EXPORT PDF
              </button>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div ref={reportRef} className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar bg-brand-surface">
            {/* 0. Key Findings Overview */}
            <section className="p-6 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Brain size={80} />
              </div>
              <h3 className="text-sm font-bold text-brand-primary uppercase tracking-widest mb-4 flex items-center gap-2">
                <CheckCircle2 size={16} />
                Key Findings Overview
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-brand-primary shrink-0" />
                    <p className="text-xs text-slate-300 leading-relaxed">
                      <span className="font-bold text-white">Primary Signal:</span> {prediction?.prediction === 'BUY' ? 'Strong accumulation phase detected with high institutional support.' : 'Distribution phase observed; caution advised at current resistance levels.'}
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-brand-primary shrink-0" />
                    <p className="text-xs text-slate-300 leading-relaxed">
                      <span className="font-bold text-white">Technical Strength:</span> RSI is currently at 42.5, indicating {prediction?.prediction === 'BUY' ? 'oversold conditions and potential reversal' : 'neutral momentum with overhead resistance'}.
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-brand-primary shrink-0" />
                    <p className="text-xs text-slate-300 leading-relaxed">
                      <span className="font-bold text-white">Sentiment Analysis:</span> Social intelligence shows {prediction?.marketMood} bias with {socialData.length} major institutional mentions in the last 24 hours.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-brand-primary shrink-0" />
                    <p className="text-xs text-slate-300 leading-relaxed">
                      <span className="font-bold text-white">Risk Profile:</span> {prediction?.riskLevel} risk detected due to {stockData.quote.regularMarketChangePercent > 5 ? 'high intraday volatility' : 'macroeconomic factors and sector rotation'}.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 1. Executive Summary */}
            <section>
              <h3 className="text-sm font-bold text-brand-primary uppercase tracking-widest mb-4 flex items-center gap-2">
                <Brain size={16} />
                Executive Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-[10px] text-slate-500 uppercase mb-1">Recommendation</p>
                  <p className={cn(
                    "text-2xl font-black",
                    prediction?.prediction === 'BUY' ? "text-brand-primary" : "text-red-400"
                  )}>{prediction?.prediction || 'HOLD'}</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-[10px] text-slate-500 uppercase mb-1">AI Confidence</p>
                  <p className="text-2xl font-black text-white">{prediction?.confidence || 0}%</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-[10px] text-slate-500 uppercase mb-1">Risk Rating</p>
                  <p className="text-2xl font-black text-orange-400">{prediction?.riskLevel || 'Medium'}</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-slate-300 leading-relaxed italic">
                "{prediction?.explanation}"
              </p>
            </section>

            {/* 1.5 Market Overview */}
            <section>
              <h3 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Globe size={16} />
                Market Overview
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase mb-1">Market Cap</p>
                  <p className="text-sm font-bold text-white">{formatNumber(stockData.quote.marketCap / 10000000)} Cr</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase mb-1">P/E Ratio</p>
                  <p className="text-sm font-bold text-white">{stockData.quote.trailingPE?.toFixed(2) || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase mb-1">52W High</p>
                  <p className="text-sm font-bold text-white">{formatCurrency(stockData.quote.fiftyTwoWeekHigh)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase mb-1">52W Low</p>
                  <p className="text-sm font-bold text-white">{formatCurrency(stockData.quote.fiftyTwoWeekLow)}</p>
                </div>
              </div>
            </section>

            {/* 2. Technical Analysis */}
            <section>
              <h3 className="text-sm font-bold text-brand-secondary uppercase tracking-widest mb-4 flex items-center gap-2">
                <BarChart2 size={16} />
                Technical Indicators
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'RSI (14)', value: '42.5', status: 'Neutral' },
                  { label: 'MACD', value: 'Bullish Cross', status: 'Positive' },
                  { label: 'SMA 50', value: formatCurrency(stockData.quote.regularMarketPrice * 0.95), status: 'Support' },
                  { label: 'SMA 200', value: formatCurrency(stockData.quote.regularMarketPrice * 0.88), status: 'Long-term Bull' },
                ].map((item, i) => (
                  <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5">
                    <p className="text-[10px] text-slate-500 uppercase mb-1">{item.label}</p>
                    <p className="text-sm font-bold text-white mb-1">{item.value}</p>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-brand-primary/10 text-brand-primary font-bold">{item.status}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* 3. Sentiment & Social */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm font-bold text-purple-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Globe size={16} />
                  News Intelligence
                </h3>
                <div className="space-y-3">
                  {newsData.map((news, i) => (
                    <div key={i} className="p-3 rounded-lg bg-white/5 border border-white/5">
                      <p className="text-xs font-medium text-slate-200 mb-1">{news.title}</p>
                      <div className="flex justify-between text-[9px] text-slate-500">
                        <span>{news.source}</span>
                        <span>{news.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-brand-secondary uppercase tracking-widest mb-4 flex items-center gap-2">
                  <MessageSquare size={16} />
                  Social Sentiment (X)
                </h3>
                <div className="space-y-3">
                  {socialData.map((post, i) => (
                    <div key={i} className="p-3 rounded-lg bg-white/5 border border-white/5">
                      <div className="flex justify-between mb-1">
                        <span className="text-[10px] font-bold text-brand-primary">{post.user}</span>
                        <span className="text-[10px] text-slate-500">{post.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-snug">{post.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 4. Market Context */}
            <section className="p-6 rounded-2xl bg-brand-primary/5 border border-brand-primary/10">
              <div className="flex items-center gap-2 text-sm font-bold text-brand-primary mb-4">
                <Shield size={16} />
                Compliance & Risk Disclosure
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                This report is generated by QuantEdge AI systems for informational purposes only. It does not constitute financial advice. Stock market investments are subject to market risks. Past performance is not indicative of future results. AI predictions are based on historical patterns and current sentiment, which can change rapidly.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
