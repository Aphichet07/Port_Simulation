"use client";

import React from "react";

interface PnLSummaryProps {
  title: string;
  amount: number;
  percent: number;
  description: string;
  isDaily?: boolean;
}

const PnLSummaryCard = ({ title, amount, percent, description, isDaily }: PnLSummaryProps) => {
  const isPositive = amount >= 0;

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-1 w-full">
      <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{title}</p>
      <div className="flex items-baseline gap-2">
        <h3 className={`text-2xl font-black ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
          {isDaily && (isPositive ? '▲ ' : '▼ ')}
          {!isDaily && (isPositive ? '+' : '')}
          ฿{Math.abs(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </h3>
        <div className={`px-2 py-0.5 rounded text-[10px] font-bold ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
          {isPositive ? '+' : ''}{percent.toFixed(2)}%
        </div>
      </div>
      <p className="text-[10px] text-slate-400 mt-1 font-medium">{description}</p>
    </div>
  );
};

export default PnLSummaryCard;