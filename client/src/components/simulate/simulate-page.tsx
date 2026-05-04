"use client";

import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { 
  Home, Layers, ShoppingCart, History, User, 
  RefreshCcw, Plus, Trash2, Save, Bot, X, Send,
  ShieldCheck, ArrowUpRight, ChevronDown, Lightbulb, Sparkles, 
  ArrowRight, Loader2, TrendingUp, AlertCircle
} from 'lucide-react';
import { AppHeader } from '../overview/header';
import { Asset } from './allocation';

import BonkChatWidget from '../ui/bonk';
import AssetForm from '../ui/createPort';
// --- 1. Mock Data สำหรับกราฟความเสี่ยง ---
const RISK_DISTRIBUTION = [
  { range: '-25 %', count: 40 },
  { range: '-20 %', count: 60 },
  { range: '-15 %', count: 100 },
  { range: '-10 %', count: 350 },
  { range: '-5 %', count: 580 },
  { range: '0 %', count: 520 },
  { range: '5 %', count: 380 },
  { range: '10 %', count: 250 },
];




export const SimulateView = () => {
  

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#B5F28B] selection:text-black flex flex-col h-screen overflow-hidden">
      {/* Import Fonts */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@100..900&family=Work+Sans:ital,wght@0,100..900;1,100..900&display=swap');
        * { font-family: 'Work Sans', 'Noto Sans Thai', sans-serif !important; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
      `}} />

      <AppHeader  />

      <div className="flex-1 overflow-hidden px-8 pb-8">
        <main className="w-full h-full bg-white rounded-[10px] shadow-[0_40px_100px_rgba(0,0,0,0.5)] p-8 lg:p-10 overflow-y-auto custom-scrollbar">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full min-h-212.5">
            
            {/* LEFT COLUMN: Risk Intelligence Terminal*/}
            <div className="lg:col-span-8 bg-white rounded-[10px] border border-slate-200 p-8 shadow-sm flex flex-col text-slate-900">
               <div className="flex justify-between items-center mb-12">
                  <div>
                    <h2 className="text-xl font-medium tracking-tight ">Risk Intelligence Terminal</h2>
                    <p className="text-[12px] font-regular text-slate-400 uppercase mt-1">การวิเคราะห์เชิงปริมาณและการจำลองแบบเมทริก</p>
                  </div>
                  <button className="cursor-pointer bg-black text-white px-6 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all shadow-md mb-1.5">
                     <RefreshCcw size={14} /> RUN FULL RE-SIMULATION
                  </button>
               </div>

               {/* Histogram Chart */}
               <div className="flex-1 w-full relative mb-12">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={RISK_DISTRIBUTION} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 700, fill: '#94A3B8'}} dy={15} />
                      <YAxis hide />
                      <Tooltip cursor={{fill: '#F8FAFC'}} contentStyle={{borderRadius: '10px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)'}} />
                      <Bar dataKey="count" radius={[10, 10, 0, 0]}>
                        {RISK_DISTRIBUTION.map((entry, index) => {
                          let fill = '#A1A1AA'; // Neutral gray
                          if (index < 3) fill = '#FF6B6B'; // High risk area
                          if (index >= 6) fill = '#6EE7B7'; // Profit area
                          return <Cell key={`cell-${index}`} fill={fill} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
               </div>

               {/* Risk Metrics Footer */}
               <div className="grid grid-cols-3 gap-8 pt-10 border-t border-slate-100 ">
                  <div>
                    <p className="text-[10px] font-bold text-black uppercase  mb-2">Confidence Interval</p>
                    <h4 className="text-3xl font-semibold text-[#10B981] tracking-tighter">97.2%</h4>
                    <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 tracking-tighter">Probability Level</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-black uppercase  mb-2">95% Var (Annual)</p>
                    <h4 className="text-3xl font-semibold text-[#FF4D4D] tracking-tighter">$-22,100</h4>
                    <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 tracking-tighter">Max Expected Loss</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-black uppercase  mb-2">Systemic Beta</p>
                    <h4 className="text-3xl font-semibold text-slate-800 tracking-tighter">1.12</h4>
                    <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 tracking-tighter">Market Volatility</p>
                  </div>
               </div>
            </div>

            {/* <Asset /> */}
            <AssetForm/>

          </div>

        </main>
      </div>

      {/* Floating Chatbot */}
      <BonkChatWidget/>
    </div>
  );
};

export default SimulateView;