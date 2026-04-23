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

import {AppHeader} from "./header";
import { AssetPerformanceTable } from "./asset";
import { MarketFeed } from "./livemarket";
import { SimulationEditor } from "./stock";


// --- Main App ---

const App = () => {
  const [activeTab, setActiveTab] = useState('Home');
  const [selectedAssetId, setSelectedAssetId] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isPortfolioDropdownOpen, setIsPortfolioDropdownOpen] = useState(false);
  const [selectedPortfolio, setSelectedPortfolio] = useState('Default Portfolio');
  const [hftCode, setHftCode] = useState(`// HFT Scalping Strategy v1.0\n// เป้าหมาย: ทำกำไรจาก Spread ระยะสั้น\n\nasync function onTick(symbol) {\n  const price = await getMarketPrice(symbol);\n  const spread = await getSpread(symbol);\n\n  if (spread > 0.05 && !hasPosition(symbol)) {\n    await buy(symbol, 1000); // ส่งคำสั่งซื้อผ่าน HFT Node\n    log(\`[BUY] \${symbol} at \${price}\`);\n  }\n}`);

  // Chart Data Simulation
  const chartData = Array.from({ length: 30 }, (_, i) => ({
    time: i,
    price: 350 + Math.sin(i * 0.5) * 5 + Math.random() * 2
  }));

  const renderHome = () => (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-500 min-h-screen">
      <AssetPerformanceTable 
        isPortfolioDropdownOpen={isPortfolioDropdownOpen}
        setIsPortfolioDropdownOpen={setIsPortfolioDropdownOpen}
        selectedPortfolio={selectedPortfolio}
        setSelectedPortfolio={setSelectedPortfolio}
        selectedAssetId={selectedAssetId}
        setSelectedAssetId={setSelectedAssetId}
      />
      <div className="lg:col-span-7 flex flex-col gap-6 text-slate-900">
        <MarketFeed chartData={chartData} />
        <SimulationEditor hftCode={hftCode} setHftCode={setHftCode} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-emerald-500 selection:text-white flex flex-col h-screen overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Work+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
        * { font-family: 'Work Sans', sans-serif !important; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

        
      <AppHeader activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 overflow-hidden px-4 lg:px-8 pb-4 lg:pb-8">
        <main className="w-full h-full bg-[#F8FAFC] rounded-[10px] shadow-[0_40px_100px_rgba(0,0,0,0.5)] p-4 lg:p-8 overflow-y-auto custom-scrollbar relative">
          {activeTab === 'Home' ? renderHome() : (
            <div className="flex flex-col items-center justify-center h-full text-slate-300">
              <RefreshCcw size={80} className="animate-spin mb-10 opacity-10" />
              <h2 className="text-6xl font-black italic uppercase tracking-tighter text-center">{activeTab} View Ready</h2>
              <p className="text-slate-400 font-bold uppercase tracking-[0.4em] mt-4 text-center">Module Initializing...</p>
            </div>
          )}
        </main>
      </div>

      <div className="fixed bottom-6 right-6 lg:bottom-12 lg:right-12 z-[200]">
        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="bg-black text-white p-5 lg:p-6 rounded-full shadow-[0_30px_60px_rgba(0,0,0,0.6)] hover:scale-110 active:scale-95 border border-white/20"
        >
          {isChatOpen ? <X size={32}/> : <Bot size={32} />}
        </button>
      </div>
    </div>
  );
};

export default App;