import React from 'react';
import { LineChart, ShieldAlert } from 'lucide-react';

interface PortfolioStatProps {
  name: string;
  value: number;
  sharpeRatio: number;
  volatility: number;
}

export const PortfolioStatCard = ({ name, value, sharpeRatio, volatility }: PortfolioStatProps) => {
  const riskLevel = volatility > 20 ? 'High' : volatility > 10 ? 'Medium' : 'Low';
  const riskColor = volatility > 20 ? 'bg-rose-100 text-rose-600' : volatility > 10 ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600';

  return (
    <div className="bg-white border border-slate-200 rounded-[10px] p-5 shadow-sm hover:shadow-md transition-all">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-slate-800 text-lg">{name}</h3>
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${riskColor}`}>
          {riskLevel} Risk
        </span>
      </div>

      <div className="mb-5">
        <p className="text-sm text-slate-500 mb-1">Portfolio Value</p>
        <p className="text-2xl font-black text-slate-900">
          ${value.toLocaleString()}
        </p>
      </div>

      {/* Quant Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
        <div>
          <div className="flex items-center gap-1 text-slate-500 mb-1">
            <LineChart size={14} />
            <span className="text-xs font-semibold">Sharpe Ratio</span>
          </div>
          <p className="text-sm font-bold text-slate-800">{sharpeRatio.toFixed(2)}</p>
        </div>
        <div>
          <div className="flex items-center gap-1 text-slate-500 mb-1">
            <ShieldAlert size={14} />
            <span className="text-xs font-semibold">Volatility</span>
          </div>
          <p className="text-sm font-bold text-slate-800">{volatility.toFixed(2)}%</p>
        </div>
      </div>
    </div>
  );
};