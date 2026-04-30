"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  Home, Layers, ShoppingCart, History, User,
  ChevronDown, Activity, Bot, X, TrendingUp, Zap,
  Target, BrainCircuit, ShieldCheck, Coins
} from 'lucide-react';

// --- Mock Data ---
const GROWTH_DATA = [
  { year: '2022', line1: 100, line2: 90, line3: 110, line4: 80, line5: 95, line6: 70, line7: 85, line8: 60 },
  { year: '2023', line1: 150, line2: 130, line3: 180, line4: 110, line5: 140, line6: 100, line7: 120, line8: 90 },
  { year: '2024', line1: 180, line2: 240, line3: 210, line4: 190, line5: 280, line6: 150, line7: 200, line8: 160 },
  { year: '2025', line1: 300, line2: 280, line3: 350, line4: 250, line5: 320, line6: 210, line7: 290, line8: 240 },
  { year: '2026', line1: 330, line2: 380, line3: 310, line4: 360, line5: 410, line6: 280, line7: 340, line8: 320 },
];


export const GrowthSimulation = () => {
  return (
    <div className="bg-white rounded-[10px] border border-slate-200 p-8 shadow-sm flex flex-col h-full text-slate-900">
      <div className="flex justify-between items-start mb-10">
        <div>
          <h2 className="text-xl font-medium text-slate-800 tracking-tight ">Portfolio Growth Simulation</h2>
          <p className="text-[12px] font-regular text-slate-400 uppercase mt-1 ">แบบจำลองการเติบโตของพอร์ตการลงทุน</p>
        </div>
        <div className="bg-[#10B981] text-white px-3 py-1 rounded-lg text-[9px] font-semibold tracking-widest flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div> API Real-time
        </div>
      </div>

      <div className="flex-1 w-full relative -ml-4 ">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={GROWTH_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
            <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#94A3B8' }} dy={15} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#94A3B8' }} tickFormatter={(v) => `$${v}`} />
            <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }} />
            <Legend iconType="circle" wrapperStyle={{ paddingTop: '40px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }} />
            {/* เส้นกราฟจำลองตามสีในรูป */}
            <Line type="monotone" dataKey="line1" stroke="#F59E0B" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="line2" stroke="#3B82F6" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="line3" stroke="#EF4444" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="line4" stroke="#8B5CF6" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="line5" stroke="#10B981" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="line6" stroke="#2DD4BF" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="line7" stroke="#000000" strokeWidth={3} dot={false} />
            <Line type="monotone" dataKey="line8" stroke="#F43F5E" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}