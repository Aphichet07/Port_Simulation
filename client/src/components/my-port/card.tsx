"use client";

import React, { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  Home, Layers, ShoppingCart, History, User,
  ChevronDown, Activity, Bot, X, TrendingUp, Zap,
  Target, BrainCircuit, ShieldCheck, Coins
} from 'lucide-react';

export const StatsCard = ({ label, subLabel, value, change, isNegative }) => {
  return (
    <div className="bg-black text-white p-6 rounded-[10px] flex flex-col justify-between h-[180px] shadow-xl border border-white/5 transition-transform hover:-translate-y-1">
      <div>
        <h4 className="text-[16px] font-semibold tracking-tight mb-1">{label}</h4>
        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">{subLabel}</p>
      </div>
      <div>
        <h3 className="text-xl font-bold tracking-tighter">{value}</h3>
        <p className={`text-[14px] font-meduim uppercase mt-1 ${isNegative ? 'text-rose-500' : 'text-[#B5F28B]'}`}>
          {change}
        </p>
      </div>
    </div>
  );
}