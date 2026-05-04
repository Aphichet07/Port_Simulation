import React from 'react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

export const MarketPulseCard = ({ data }: { data: MarketData }) => {
  const isPositive = data.change >= 0;

  return (
    <div className="bg-slate-50 border border-slate-100 rounded-[10px] p-4 flex flex-col justify-between hover:shadow-md transition-shadow duration-300">
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{data.symbol}</p>
          <p className="text-sm font-semibold text-slate-900 truncate">{data.name}</p>
        </div>
        <div className={`p-1.5 rounded-md ${isPositive ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
          {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
        </div>
      </div>
      
      <div className="mt-2">
        <h3 className="text-xl font-black text-slate-900">
          {data.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </h3>
        <div className="flex items-center gap-2 mt-1">
          <span className={`text-sm font-bold ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
            {isPositive ? '+' : ''}{data.change.toFixed(2)} ({data.changePercent.toFixed(2)}%)
          </span>
        </div>
      </div>
    </div>
  );
};