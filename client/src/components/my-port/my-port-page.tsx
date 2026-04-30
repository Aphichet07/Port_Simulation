"use client";

import React, { useState } from 'react';
import { Bot } from 'lucide-react';

import { AppHeader } from "../overview/header";
import { GrowthSimulation } from "./growth";
import { StatsCard } from "./card";
import { PerformanceTable } from "./subasset";

export const Myport = () => {
  const [isPortfolioDropdownOpen, setIsPortfolioDropdownOpen] = useState(false);
  const [selectedPortfolio, setSelectedPortfolio] = useState('Default Portfolio');
  const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#B5F28B] selection:text-black flex flex-col h-screen overflow-hidden">
      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@100..900&family=Work+Sans:ital,wght@0,100..900;1,100..900&display=swap');
        * { font-family: 'Work Sans', 'Noto Sans Thai' !important; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
      `}} />

      <AppHeader />

      <div className="flex-1 overflow-hidden px-8 pb-8">
        <main className="w-full h-full bg-white rounded-[10px] shadow-[0_40px_100px_rgba(0,0,0,0.5)] p-10 overflow-y-auto custom-scrollbar">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full min-h-225">

            {/* LEFT: Portfolio Growth */}
            <div className="lg:col-span-7 h-212.5">
              <GrowthSimulation />
            </div>

            {/* RIGHT: Stats & Table */}
            <div className="lg:col-span-5 flex flex-col gap-8">

              {/* Top Stats Card Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <StatsCard
                  label="Portfolio NAV"
                  subLabel="มูลค่าสินทรัพย์สุทธิ (NAV)"
                  value="150,000 $"
                  change="+ 5.64 %"
                />
                <StatsCard
                  label="Portfolio Delta"
                  subLabel="ความไวต่อตลาด (Delta)"
                  value="+ 8,500 $"
                  change="+ 9.64 %"
                />
                <StatsCard
                  label="ML Forecast"
                  subLabel="พยากรณ์โดย AI"
                  value="- 50,000 $"
                  change="30 Days Forecast"
                  isNegative
                />
              </div>

              {/* Asset Class Performance Table */}
              <div className="flex-1 min-h-150">
                <PerformanceTable 
                  isPortfolioDropdownOpen={isPortfolioDropdownOpen}
                  setIsPortfolioDropdownOpen={setIsPortfolioDropdownOpen}
                  selectedPortfolio={selectedPortfolio}
                  setSelectedPortfolio={setSelectedPortfolio}
                  selectedAssetId={selectedAssetId}
                  setSelectedAssetId={(id: number) => setSelectedAssetId(id)}
                />
              </div>

            </div>
          </div>

        </main>
      </div>

      {/* Floating Bot */}
      <div className="fixed bottom-10 right-10 z-200">
        <button className="bg-black text-white p-5 rounded-full shadow-[0_20px_60px_rgba(0,0,0,0.4)] hover:scale-110 active:scale-95 transition-all border border-white/10 group relative">
          <Bot size={28} />
          <div className="absolute inset-0 bg-[#B5F28B]/20 rounded-full animate-ping pointer-events-none group-hover:hidden"></div>
        </button>
      </div>
    </div>
  );
};

export default Myport;