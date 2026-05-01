"use client";

import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const GROWTH_DATA = [
  { year: '2022', line1: 100, line2: 90, line3: 110, line4: 80, line5: 95, line6: 70, line7: 85, line8: 60 },
  { year: '2023', line1: 150, line2: 130, line3: 180, line4: 110, line5: 140, line6: 100, line7: 120, line8: 90 },
  { year: '2024', line1: 180, line2: 240, line3: 210, line4: 190, line5: 280, line6: 150, line7: 200, line8: 160 },
  { year: '2025', line1: 300, line2: 280, line3: 350, line4: 250, line5: 320, line6: 210, line7: 290, line8: 240 },
  { year: '2026', line1: 330, line2: 380, line3: 310, line4: 360, line5: 410, line6: 280, line7: 340, line8: 320 },
];

const LINES = [
  { key: 'line1', color: '#F59E0B' },
  { key: 'line2', color: '#3B82F6' },
  { key: 'line3', color: '#EF4444' },
  { key: 'line4', color: '#8B5CF6' },
  { key: 'line5', color: '#10B981' },
  { key: 'line6', color: '#2DD4BF' },
  { key: 'line7', color: '#000000' },
  { key: 'line8', color: '#F43F5E' },
];

const CustomLegend = () => (
  <div className="grid grid-cols-4 md:grid-cols-8 gap-x-3 gap-y-2 pt-4 px-2">
    {LINES.map((l) => (
      <div key={l.key} className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: l.color }} />
        <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">{l.key}</span>
      </div>
    ))}
  </div>
);

export const GrowthSimulation = () => {
  return (
    <div className="bg-white rounded-[10px] border border-slate-200 p-4 md:p-8 shadow-sm flex flex-col h-full text-slate-900">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-6 md:mb-10">
        <div>
          <h2 className="text-lg md:text-xl font-medium text-slate-800 tracking-tight">Portfolio Growth Simulation</h2>
          <p className="text-[11px] text-slate-400 uppercase mt-1">แบบจำลองการเติบโตของพอร์ตการลงทุน</p>
        </div>
        <div className="bg-[#10B981] text-white px-3 py-1 rounded-lg text-[9px] font-semibold tracking-widest flex items-center gap-2 w-fit">
          <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> API Real-time
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 w-full min-h-[200px] md:min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={GROWTH_DATA} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
            <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }} dy={15} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }} tickFormatter={(v) => `$${v}`} />
            <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }} />
            {LINES.map((l) => (
              <Line key={l.key} type="monotone" dataKey={l.key} stroke={l.color} strokeWidth={l.key === 'line7' ? 3 : 2} dot={false} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend — อยู่ใต้ chart เสมอ */}
      <div className="grid  grid-cols-4 md:grid-cols-8 gap-x-3 gap-y-2 pt-6 mt-2 border-t border-slate-100">
  {LINES.map((l) => (
    <div key={l.key} className="flex items-center gap-1.5">
      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: l.color }} />
      <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">{l.key}</span>
    </div>
  ))}
</div>

    </div>
  );
};