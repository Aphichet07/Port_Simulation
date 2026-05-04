"use client";

import React from 'react';

interface StatsCardProps {
  label: string;
  subLabel: string;
  value: string | number;
  change: string;
  isNegative?: boolean; 
}

export const StatsCard: React.FC<StatsCardProps> = ({ 
  label, 
  subLabel, 
  value, 
  change, 
  isNegative = false 
}) => {
  return (
    <div className="bg-black text-white p-4 md:p-6 rounded-[10px] flex flex-col justify-between h-36 md:h-45 shadow-xl border border-white/5 transition-all duration-300 hover:-translate-y-1 hover:border-white/20 group">
  <div>
    <h4 className="text-[13px] md:text-[16px] font-semibold tracking-tight mb-1 group-hover:text-[#B5F28B] transition-colors">
      {label}
    </h4>
    <p className="text-[9px] md:text-[10px] text-slate-500 font-medium uppercase tracking-widest">
      {subLabel}
    </p>
  </div>
  <div>
    <h3 className="text-xl md:text-3xl font-bold tracking-tighter">
      {value}
    </h3>
    <p className={`text-[12px] md:text-[14px] font-medium uppercase mt-1 flex items-center gap-1 ${isNegative ? 'text-rose-500' : 'text-[#B5F28B]'}`}>
      {isNegative ? '▼' : '▲'} {change}
    </p>
  </div>
</div>
  );
};