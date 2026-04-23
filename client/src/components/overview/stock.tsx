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

export const SimulationEditor = ({ hftCode, setHftCode }) => {return(
  <div className="bg-white rounded-[10px] border border-slate-200 p-6 lg:p-8 shadow-sm flex flex-col flex-1 min-h-[400px]">
    <div className="flex justify-between items-center mb-8">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-slate-100 rounded-lg text-black border border-slate-200">
          <Code2 size={22}/>
        </div>
        <div>
          <h3 className="text-xl font-medium text-slate-800 leading-none">Stock Simulation</h3>
          <p className="text-[12px] font-light text-slate-400 uppercase mt-0">การจำลองการซื้อขายหุ้น</p>
        </div>
      </div>
      <button className="cursor-pointer bg-black text-white px-8 py-3 rounded-[10px] text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all shadow-xl">
        <Play size={16} fill="white" /> Execute Script
      </button>
    </div>

    <div className="relative flex-1 bg-white rounded-[10px] border border-slate-200 p-6 flex gap-4 overflow-hidden shadow-inner group hover:border-black transition-colors duration-500">
      <div className="text-slate-300 text-right select-none font-mono text-xs w-6 border-r border-slate-100 pr-4 h-full leading-6">
        {Array.from({ length: 13 }).map((_, i) => <div key={i}>{i + 1}</div>)}
      </div>
      <textarea 
        value={hftCode}
        onChange={(e) => setHftCode(e.target.value)}
        spellCheck="false"
        className="flex-1 bg-transparent border-none outline-none font-mono text-[13px] text-slate-700 leading-6 resize-none custom-scrollbar italic font-medium"
      />
    </div>
  </div>
);
}