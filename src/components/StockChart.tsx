import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { formatCurrency } from '../lib/utils';
import { Skeleton } from './Skeleton';

interface StockChartProps {
  data: any[];
  loading?: boolean;
}

export default function StockChart({ data, loading }: StockChartProps) {
  if (loading) {
    return (
      <div className="w-full h-full flex flex-col gap-4">
        <div className="flex-1 w-full bg-white/5 rounded-xl animate-pulse flex items-end p-4 gap-2">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i} 
              className="flex-1 bg-white/10 rounded-t-sm" 
              style={{ height: `${20 + Math.random() * 60}%` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) return null;

  const chartData = data.map(d => {
    const date = new Date(d.date);
    const isIntraday = data.length > 0 && (new Date(data[data.length - 1].date).getTime() - new Date(data[0].date).getTime()) < 2 * 24 * 60 * 60 * 1000;
    
    return {
      date: isIntraday 
        ? date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      price: d.close,
      volume: d.volume,
    };
  });

  const minPrice = Math.min(...chartData.map(d => d.price)) * 0.98;
  const maxPrice = Math.max(...chartData.map(d => d.price)) * 1.02;

  const isUp = chartData[chartData.length - 1].price >= chartData[0].price;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={isUp ? "#00ff88" : "#ff4444"} stopOpacity={0.3}/>
            <stop offset="95%" stopColor={isUp ? "#00ff88" : "#ff4444"} stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#242428" vertical={false} />
        <XAxis 
          dataKey="date" 
          stroke="#475569" 
          fontSize={10} 
          tickLine={false} 
          axisLine={false}
          minTickGap={30}
        />
        <YAxis 
          domain={[minPrice, maxPrice]} 
          stroke="#475569" 
          fontSize={10} 
          tickLine={false} 
          axisLine={false}
          tickFormatter={(val) => `₹${val.toFixed(0)}`}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#141417', 
            border: '1px solid #242428', 
            borderRadius: '12px',
            fontSize: '12px',
            color: '#fff'
          }}
          itemStyle={{ color: isUp ? '#00ff88' : '#ff4444' }}
          formatter={(value: number) => [formatCurrency(value), 'Price']}
        />
        <Area 
          type="monotone" 
          dataKey="price" 
          stroke={isUp ? "#00ff88" : "#ff4444"} 
          strokeWidth={2}
          fillOpacity={1} 
          fill="url(#colorPrice)" 
          isAnimationActive={true}
          animationDuration={300}
          animationEasing="ease-in-out"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
