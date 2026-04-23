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

const NavItem = ({ label, icon, active, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-3 px-6 py-2.5 rounded-[8px] text-[12px] font-bold transition-all duration-300 whitespace-nowrap ${
        active ? 'bg-white text-black shadow-2xl scale-105 italic ring-1 ring-black/5' : 'text-white/60 hover:text-white'
      }`}
    >
      {icon} <span className="uppercase tracking-tight">{label}</span>
    </button>
  );
};

export const AppHeader = ({ activeTab, setActiveTab }) => {
  

  return (
  <header className="h-[90px] px-4 lg:px-8 flex items-center justify-between shrink-0">
    <div className="flex items-center gap-4">
      <div className="  cursor-pointer transition-transform hover:scale-110 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
         <img src="picture/logo.png" alt="Logo" className="w-14 h-14"/>
      </div>
      <span className="text-xl font-medium tracking-tight  hidden sm:inline ">Portfolio Visualizer</span>
    </div>

    <nav className="flex items-center bg-black p-1 rounded-[10px] border border-white/10 shadow-2xl overflow-x-auto no-scrollbar max-w-[50%] lg:max-w-none">
      <NavItem label="Home" icon={<Home size={18}/>} active={activeTab === 'Home'} onClick={() => setActiveTab('Home')} />
      <NavItem label="My Portfolio & Allocation" icon={<Layers size={18}/>} active={activeTab === 'Portfolio'} onClick={() => setActiveTab('Portfolio')} />
      <NavItem label="Simulate Portfolio" icon={<ShoppingCart size={18}/>} active={activeTab === 'Simulate'} onClick={() => setActiveTab('Simulate')} />
      <NavItem label="Transaction Logs" icon={<History size={18}/>} active={activeTab === 'Logs'} onClick={() => setActiveTab('Logs')} />
    </nav>

    <div className="flex items-center gap-4 lg:gap-6">
      <div className="text-right hidden md:block">
        <p className="text-xs font-black text-white leading-none mb-1 uppercase tracking-widest">Apichet Runbor</p>
        <p className="text-[10px] text-white/40 uppercase tracking-tighter font-bold">Total Amount : 3,000 $</p>
      </div>
      <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center overflow-hidden border-2 border-white/10 cursor-pointer hover:ring-4 hover:ring-white/20 transition-all">
         <User size={24} className="text-black" />
      </div>
    </div>
  </header>
  );
};