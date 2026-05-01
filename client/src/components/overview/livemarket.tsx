"use client";

import React from 'react';
import { 
  AreaChart, Area, ResponsiveContainer 
} from 'recharts';
import { 
  Activity, TrendingUp, Zap 
} from 'lucide-react';

interface ChartPoint {
  price: number;
  time?: string | number;
}

interface MarketFeedProps {
  chartData: ChartPoint[];
}

export const MarketFeed: React.FC<MarketFeedProps> = ({ chartData }) => {
  return (
    <div className="bg-white rounded-[10px] border border-slate-200 p-6 lg:p-8 shadow-sm flex flex-col h-105">
      
      {/* Header Section */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-500 shadow-inner border border-emerald-100">
          <Activity size={24} />
        </div>
        <div>
          <h3 className="text-xl font-medium text-slate-800 leading-none">Live Market Feed</h3>
          <p className="text-[12px] font-regular text-slate-400 uppercase mt-1">ข้อมูลตลาดแบบเรียลไทม์</p>
        </div>
      </div>
      
      {/* Chart Area */}
      <div className="flex-1 w-full bg-[#ECFDF5] rounded-[10px] overflow-hidden border border-emerald-100 shadow-inner relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart 
            data={chartData}
            margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Area 
              type="monotone" 
              dataKey="price" 
              stroke="#10B981" 
              strokeWidth={3} 
              fill="url(#colorPrice)" 
              animationDuration={1500}
              isAnimationActive={true}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        {/* Momentum Card */}
        <div className="h-20 bg-white border border-slate-100 rounded-[10px] shadow-sm p-4 flex items-center justify-between group hover:border-emerald-200 transition-colors">
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Market Momentum</p>
            <h4 className="text-xl font-black text-emerald-500 tracking-tighter">+12.42%</h4>
          </div>
          <TrendingUp className="text-emerald-500 opacity-20 group-hover:opacity-100 transition-opacity" size={24}/>
        </div>

        {/* Latency Card */}
        <div className="h-20 bg-white border border-slate-100 rounded-[10px] shadow-sm p-4 flex items-center justify-between group hover:border-amber-200 transition-colors">
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">System Latency</p>
            <h4 className="text-xl font-black text-slate-800 tracking-tighter">0.42 ms</h4>
          </div>
          <Zap className="text-amber-500 opacity-20 group-hover:opacity-100 transition-opacity" size={24}/>
        </div>
      </div>
    </div>
  );
};