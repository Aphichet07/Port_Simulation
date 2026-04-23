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

const Badge = ({ val, status, index }) => {
  const styles = [
    "bg-[#10B981] text-white",      // Green (Up Primary)
    "bg-[#D1FAE5] text-[#059669]",  // Light Green (Up Secondary)
    "bg-[#FEE2E2] text-[#DC2626]",  // Red/Pink (Down)
    "bg-[#F1F5F9] text-[#64748B]",  // Gray (Neutral)
  ];

  let selectedStyle = styles[3];
  if (status === 'up') {
    selectedStyle = index === 0 ? styles[0] : styles[1];
  } else if (status === 'down') {
    selectedStyle = styles[2];
  }

  return (
    <span className={`inline-block w-[75px] py-1.5 rounded-[6px] text-[9px] font-black ${selectedStyle} shadow-sm uppercase`}>
      {val}
    </span>
  );
};


const MOCK_ASSETS_DATA = Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  name: 'XXXXXXXXXXXX',
  y1: 'XX.XX%',
  y3: 'XX.XX%',
  y5: 'XX.XX%',
  status: i % 4 === 0 ? 'up' : i % 4 === 1 ? 'neutral' : i % 4 === 2 ? 'light' : 'down'
}));

const PORTFOLIOS = [
  'Default Portfolio',
  'Tech Alpha Strategy',
  'Aggressive Growth',
  'Conservative Income'
];
export const AssetPerformanceTable = ({ 
  isPortfolioDropdownOpen, 
  setIsPortfolioDropdownOpen, 
  selectedPortfolio, 
  setSelectedPortfolio,
  selectedAssetId,
  setSelectedAssetId 
}) => {
  return (
    <div className="lg:col-span-5 bg-white rounded-[10px] border border-slate-200 p-6 lg:p-8 shadow-sm flex flex-col h-full text-slate-900">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-xl lg:text-2xl font-medium text-slate-800 tracking-tight">Asset Class Performance</h2>
          <p className="text-[12px] font-light text-slate-400 uppercase mt-0">ผลตอบแทนรายสินทรัพย์</p>
      </div>
      
      <div className="relative">
        <button 
          onClick={() => setIsPortfolioDropdownOpen(!isPortfolioDropdownOpen)}
          className="uppercase cursor-pointer bg-black text-white px-4 py-2 rounded-[10px] flex items-center gap-2 text-[10px] font-semibold tracking-tighter hover:bg-slate-800 transition-all"
        >
          {selectedPortfolio} <ChevronDown size={14} className={`transition-transform ${isPortfolioDropdownOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isPortfolioDropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-[10px] shadow-xl z-50 overflow-hidden">
            {PORTFOLIOS.map((p) => (
              <button
                key={p}
                onClick={() => {
                  setSelectedPortfolio(p);
                  setIsPortfolioDropdownOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>

    <div className="flex-1 overflow-y-auto custom-scrollbar">
      <table className="w-full text-left min-w-[400px]">
        <thead>
          <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
            <th className="pb-4 w-[40%]">Asset Class</th>
            <th className="pb-4 text-center w-[20%]">1Y</th>
            <th className="pb-4 text-center w-[20%]">3Y</th>
            <th className="pb-4 text-center w-[20%]">5Y</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {MOCK_ASSETS_DATA.map((asset) => (
            <tr 
              key={asset.id} 
              onClick={() => setSelectedAssetId(asset.id)}
              className={`cursor-pointer transition-colors ${selectedAssetId === asset.id ? 'bg-slate-50' : 'hover:bg-slate-50/50'}`}
            >
              <td className="py-5">
                <p className="text-[11px] font-medium text-slate-500 tracking-widest uppercase">{asset.name}</p>
              </td>
              <td className="py-5 text-center"><Badge val={asset.y1} status={asset.status} index={0} /></td>
              <td className="py-5 text-center"><Badge val={asset.y3} status={asset.status} index={1} /></td>
              <td className="py-5 text-center"><Badge val={asset.y5} status={asset.status} index={2} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
}