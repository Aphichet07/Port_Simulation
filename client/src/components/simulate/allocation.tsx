"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import { 
  Home, Layers, ShoppingCart, History, User, 
  ChevronDown, Search, Activity, Code2, Play, Bot, X, Send,
  TrendingUp, RefreshCcw, Cpu, Zap, ShieldCheck, Trash2, Save, Plus, Sparkles
} from 'lucide-react';

// --- Types & Interfaces ---
interface AllocationItem {
  id: number;
  type: string;
  weight: number;
}

const ASSET_OPTIONS = [
  { id: 'CASH', label: 'CASH' },
  { id: 'BONDS', label: 'BONDS' },
  { id: 'US_EQUITY', label: 'US EQUITY' },
  { id: 'GOLD', label: 'GOLD' },
  { id: 'CRYPTO', label: 'CRYPTOCURRENCY' },
];

export const Asset = () => {
  // กำหนด Type ให้ State
  const [allocations, setAllocations] = useState<AllocationItem[]>([
    { id: 1, type: 'CASH', weight: 30 },
    { id: 2, type: 'BONDS', weight: 35 },
    { id: 3, type: 'US_EQUITY', weight: 35 },
  ]);
  const [portfolioName, setPortfolioName] = useState<string>('');

  const totalWeight = useMemo(() => 
    allocations.reduce((sum, item) => sum + (Number(item.weight) || 0), 0)
  , [allocations]);

  const addAsset = () => {
    if (allocations.length < 8) {
      setAllocations([...allocations, { id: Date.now(), type: 'CASH', weight: 0 }]);
    }
  };

  // ระบุ Type: number
  const removeAsset = (id: number) => {
    setAllocations(allocations.filter(a => a.id !== id));
  };

  // ระบุ Type: id เป็น number และ val เป็น string (จาก input)
  const updateWeight = (id: number, val: string) => {
    const numValue = val === '' ? 0 : Number(val);
    setAllocations(allocations.map(a => a.id === id ? { ...a, weight: numValue } : a));
  };

  const updateType = (id: number, type: string) => {
    setAllocations(allocations.map(a => a.id === id ? { ...a, type } : a));
  };

  return (
    <div className="lg:col-span-4 flex flex-col gap-6">
      <div className="bg-white rounded-[10px] border border-slate-200 p-8 shadow-sm flex flex-col h-full text-slate-900">
        <div className="flex justify-between items-start mb-10">
          <div>
            <h3 className="text-xl font-medium tracking-tight">Portfolio Allocation</h3>
            <p className="text-[12px] font-regular text-slate-400 uppercase mt-1">เลือกสินทรัพย์และสัดส่วนการถือครอง</p>
          </div>
          <button className="cursor-pointer bg-black text-white px-6 py-2 rounded-md text-[9px] font-bold uppercase flex items-center gap-1 shadow-lg mt-1.5">
            <Sparkles size={12} /> AI RECOMMEND
          </button>
        </div>

        {/* Allocation Items */}
        <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
          <div className="grid grid-cols-12 gap-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest px-2">
            <div className="col-span-7">Asset Class</div>
            <div className="col-span-4 text-center">Weight (%)</div>
            <div className="col-span-1"></div>
          </div>

          {allocations.map((item) => (
            <div key={item.id} className="grid grid-cols-12 gap-3 items-center bg-slate-50 p-3 rounded-[10px] group transition-all hover:bg-slate-100/50">
              <div className="col-span-7 relative">
                <select 
                  value={item.type}
                  onChange={(e) => updateType(item.id, e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-md py-2 px-3 text-xs font-bold appearance-none cursor-pointer outline-none focus:border-black"
                >
                  {ASSET_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
              <div className="col-span-4">
                <input 
                  type="number" 
                  value={item.weight} 
                  onChange={(e) => updateWeight(item.id, e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-md py-2 px-3 text-center text-xs font-bold outline-none focus:border-black" 
                />
              </div>
              <div className="col-span-1 flex justify-center">
                <button onClick={() => removeAsset(item.id)} className="cursor-pointer text-slate-300 hover:text-rose-500 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}

          <button 
            onClick={addAsset}
            className="cursor-pointer w-full py-3 border-2 border-dashed border-slate-100 rounded-[10px] text-slate-300 hover:text-slate-500 hover:border-slate-300 transition-all flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest"
          >
            <Plus size={16} /> ADD NEW ASSET
          </button>
        </div>

        {/* Summary & Save */}
        <div className="mt-10 pt-10 border-t border-slate-100">
          <div className="flex justify-between items-end mb-8">
            <div className="flex-1 pr-6">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Portfolio Identity</p>
              <input 
                value={portfolioName}
                onChange={(e) => setPortfolioName(e.target.value)}
                placeholder="Enter Name..." 
                className="w-full bg-transparent border-b border-slate-200 py-1 text-sm font-regular outline-none focus:border-black" 
              />
            </div>
            <div className="text-right">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Weight</p>
              <h4 className={`text-3xl font-black tracking-tighter ${totalWeight === 100 ? 'text-[#10B981]' : 'text-rose-500'}`}>
                {totalWeight} %
              </h4>
            </div>
          </div>

          <button 
            disabled={totalWeight !== 100}
            className={`w-full py-4 rounded-lg font-bold uppercase text-xs flex items-center justify-center gap-3  ${
              totalWeight === 100 ? 'cursor-pointer bg-[#10B981] text-white hover:brightness-110 active:scale-95' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Save size={18} /> SAVE CONFIGURATION
          </button>
        </div>
      </div>
    </div>
  );
};