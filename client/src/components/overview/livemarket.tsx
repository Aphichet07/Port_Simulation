"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import { 
  Home, Layers, ShoppingCart, History, User, 
  ChevronDown, Search, Activity, Code2, Play, Bot, X, Send,
  TrendingUp, RefreshCcw, Cpu, Zap, ShieldCheck, Trash2, Save, Plus
} from 'lucide-react';

export const MarketFeed = ({ chartData }) =>{return (
  <div className="bg-white rounded-[10px] border border-slate-200 p-6 lg:p-8 shadow-sm flex flex-col h-[420px]">
    <div className="flex items-center gap-4 mb-8">
      <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-500 shadow-inner">
        <Activity size={24} />
      </div>
      <div>
        <h3 className="text-xl font-medium text-slate-800 leading-none">Live Market Feed</h3>
        <p className="text-[12px] font-light text-slate-400 uppercase mt-0">ข้อมูลตลาดแบบเรียลไทม์</p>
      </div>
    </div>
    
    <div className="flex-1 w-full bg-[#ECFDF5] rounded-[10px] overflow-hidden border border-emerald-100 shadow-inner relative">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <Area type="monotone" dataKey="price" stroke="#10B981" strokeWidth={4} fill="#10B981" fillOpacity={0.15} animationDuration={1000} />
        </AreaChart>
      </ResponsiveContainer>
    </div>

    <div className="grid grid-cols-2 gap-4 mt-6">
      <div className="h-20 bg-white border border-slate-100 rounded-[10px] shadow-sm p-4 flex items-center justify-between">
        <div>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Market Momentum</p>
          <h4 className="text-xl font-black text-emerald-500 tracking-tighter">+12.42%</h4>
        </div>
        <TrendingUp className="text-emerald-500 opacity-20" size={24}/>
      </div>
      <div className="h-20 bg-white border border-slate-100 rounded-[10px] shadow-sm p-4 flex items-center justify-between">
        <div>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">System Latency</p>
          <h4 className="text-xl font-black text-slate-800 tracking-tighter">0.42 ms</h4>
        </div>
        <Zap className="text-amber-500 opacity-20" size={24}/>
      </div>
    </div>
  </div>
);
}