"use client";

import React, { useState } from 'react';
import { 
  X, Bot, RefreshCcw
} from 'lucide-react';

import { AppHeader } from "./header";
import { AssetPerformanceTable } from "./asset";
import { MarketFeed } from "./livemarket";
import { SimulationEditor } from "./stock";
import BonkChatWidget from "@/src/components/ui/bonk"


const HomePage = () => {
  const [activeTab] = useState('Home'); 
  
  const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);
  
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isPortfolioDropdownOpen, setIsPortfolioDropdownOpen] = useState(false);
  const [selectedPortfolio, setSelectedPortfolio] = useState('Default Portfolio');
  
  const [hftCode, setHftCode] = useState(`// HFT Scalping Strategy v1.0\n// เป้าหมาย: ทำกำไรจาก Spread ระยะสั้น\n\nasync function onTick(symbol) {\n  const price = await getMarketPrice(symbol);\n  const spread = await getSpread(symbol);\n\n  if (spread > 0.05 && !hasPosition(symbol)) {\n    await buy(symbol, 1000); // ส่งคำสั่งซื้อผ่าน HFT Node\n    log(\`[BUY] \${symbol} at \${price}\`);\n  }\n}`);

  const chartData = React.useMemo(() => Array.from({ length: 30 }, (_, i) => ({
    time: i,
    price: 350 + Math.sin(i * 0.5) * 5 + Math.random() * 2
  })), []);

  const renderHome = () => (
  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 animate-in fade-in duration-500">
    <AssetPerformanceTable 
      isPortfolioDropdownOpen={isPortfolioDropdownOpen}
      setIsPortfolioDropdownOpen={setIsPortfolioDropdownOpen}
      selectedPortfolio={selectedPortfolio}
      setSelectedPortfolio={setSelectedPortfolio}
      selectedAssetId={selectedAssetId}
      setSelectedAssetId={(id: number) => setSelectedAssetId(id)} 
    />
    <div className="lg:col-span-7 flex flex-col gap-4 md:gap-6 text-slate-900">
      <MarketFeed chartData={chartData} />
      <SimulationEditor hftCode={hftCode} setHftCode={setHftCode} />
    </div>
  </div>
);

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-emerald-500 selection:text-white flex flex-col h-screen overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@100..900&family=Work+Sans:ital,wght@0,100..900;1,100..900&display=swap');
        * { font-family: 'Work Sans', 'Noto Sans Thai' !important; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      <AppHeader />

      <div className="flex-1 overflow-hidden px-4 sm:px-8 pb-8">
        <main className="w-full h-full bg-white rounded-[10px] shadow-[0_40px_100px_rgba(0,0,0,0.5)] p-4 sm:p-8 lg:p-10 overflow-y-auto custom-scrollbar">
          {activeTab === 'Home' ? renderHome() : (
            <div className="flex flex-col items-center justify-center h-full text-slate-300">
              <RefreshCcw size={80} className="animate-spin mb-10 opacity-10" />
              <h2 className="text-4xl sm:text-6xl font-black italic uppercase tracking-tighter text-center">{activeTab} View Ready</h2>
              <p className="text-slate-400 font-bold uppercase tracking-[0.4em] mt-4 text-center">Module Initializing...</p>
            </div>
          )}
        </main>
      </div>

      {/* Floating Action Button */}
      <BonkChatWidget />
    </div>
  );
};

export default HomePage;