import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { motion } from 'motion/react';
import { NIFTY_50, SECTORS, INDEXES } from '../constants/indianStocks';
import { cn } from '../lib/utils';

interface SearchAutocompleteProps {
  onSelect: (symbol: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchAutocomplete({ onSelect, placeholder, className }: SearchAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<{ symbol: string; name: string }[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Combine all stocks and indexes for searching
  const allStocks = [
    ...INDEXES,
    ...NIFTY_50,
    ...Object.values(SECTORS).flat()
  ].filter((v, i, a) => a.findIndex(t => t.symbol === v.symbol) === i);

  useEffect(() => {
    if (query.length > 1) {
      const filtered = allStocks.filter(
        s => s.symbol.toLowerCase().includes(query.toLowerCase()) || 
             s.name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8);
      setSuggestions(filtered);
      setIsOpen(true);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (symbol: string) => {
    onSelect(symbol);
    setQuery('');
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (suggestions.length > 0) {
        handleSelect(suggestions[0].symbol);
      } else if (query.trim()) {
        let symbol = query.trim().toUpperCase();
        if (!symbol.includes('.') && !symbol.includes('-') && !symbol.startsWith('^')) {
          symbol += '.NS';
        }
        handleSelect(symbol);
      }
    }
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <div className="relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-primary transition-colors" size={18} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || "Search stocks..."}
          className="w-full bg-brand-surface border border-brand-border rounded-xl py-2.5 pl-10 pr-10 focus:outline-none focus:border-brand-primary transition-colors text-sm"
          onFocus={() => query.length > 1 && setIsOpen(true)}
        />
        {query && (
          <button 
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 w-full mt-2 bg-brand-surface border border-brand-border rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {suggestions.map((s) => (
            <motion.button
              key={s.symbol}
              whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.08)', x: 4 }}
              onClick={() => handleSelect(s.symbol)}
              className="w-full flex items-center justify-between px-4 py-3 transition-all border-b border-white/5 last:border-0 text-left cursor-pointer"
            >
              <div>
                <p className="font-bold text-white text-sm">{s.symbol.split('.')[0]}</p>
                <p className="text-[10px] text-slate-500 truncate max-w-[200px]">{s.name}</p>
              </div>
              <span className="text-[10px] font-mono text-brand-primary/50 group-hover:text-brand-primary">SELECT</span>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}
