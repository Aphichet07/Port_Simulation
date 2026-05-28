"use client";

import React, { useState } from "react";
import { X, Bot, RefreshCcw } from "lucide-react";

import { AppHeader } from "./header";
import { AssetPerformanceTable } from "./asset";
import { MarketFeed } from "./livemarket";
import BonkChatWidget from "../ui/bonk";
import CreatePortfolioForm from "@/src/components/ui/createPort";
import MarketOverviewWidget from "@/src/components/ui/card/marketWidget";
import TotalWealthChart from "@/src/components/ui/card/totalWealth";

const HomePage = () => {
  const [activeTab] = useState("Home");

  const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isPortfolioDropdownOpen, setIsPortfolioDropdownOpen] = useState(false);
  const [selectedPortfolio, setSelectedPortfolio] =
    useState("Default Portfolio");

  const chartData = React.useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        time: i,
        price: 350 + Math.sin(i * 0.5) * 5 + Math.random() * 2,
      })),
    [],
  );

  const andleBenchmark = async () => {};

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-emerald-500 selection:text-white flex flex-col h-screen overflow-hidden">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@100..900&family=Work+Sans:ital,wght@0,100..900;1,100..900&display=swap');
        * { font-family: 'Work Sans', 'Noto Sans Thai' !important; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `,
        }}
      />

      <AppHeader />

      <div className="flex-1 overflow-hidden px-4 sm:px-8 pb-8">
        <main className="w-full h-full bg-white rounded-[10px] shadow-[0_40px_100px_rgba(0,0,0,0.5)] p-4 sm:p-8 lg:p-10 overflow-y-auto custom-scrollbar">
          <div className="flex flex-col gap-y-12">
            <section className="flex flex-col gap-y-4">
              <div className="border-l-4 border-blue-600 pl-4">
                <h2 className="text-xl font-semibold text-slate-800 tracking-tight">
                  Market Overview
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  ข้อมูลสรุปความเคลื่อนไหวของดัชนีตลาดสำคัญทั่วโลก
                </p>
              </div>
              <MarketOverviewWidget />
            </section>

            <section className="flex flex-col gap-y-4">
              <div className="border-l-4 border-emerald-500 pl-4">
                <h2 className="text-xl font-semibold text-slate-800 tracking-tight">
                  Portfolio Performance
                </h2>
                <p className="text-sm  text-slate-500 mt-1">
                  วิเคราะห์มูลค่าสินทรัพย์รวม (Backtest)
                  และตัวชี้วัดประสิทธิภาพเชิงปริมาณ (Quantitative Metrics)
                </p>
              </div>
              <TotalWealthChart />
            </section>

            {/*     
    {activeTab === "Home" ? (
      <section className="flex flex-col gap-y-4">
        <div className="border-l-4 border-amber-500 pl-4">
          <h2 className="text-xl font-bold text-slate-800 uppercase tracking-tight">Asset & Feed</h2>
          <p className="text-sm text-slate-500 mt-1">จัดการพอร์ตการลงทุนและติดตามความเคลื่อนไหวของรายสินทรัพย์</p>
        </div>
        {renderHome()}
      </section>
    ) : (
      <div className="flex flex-col items-center justify-center h-full text-slate-300 min-h-100">
        <RefreshCcw size={80} className="animate-spin mb-10 opacity-10" />
        <h2 className="text-4xl sm:text-6xl font-black italic uppercase tracking-tighter text-center">
          {activeTab} View Ready
        </h2>
        <p className="text-slate-400 font-bold uppercase tracking-[0.4em] mt-4 text-center">
          Module Initializing...
        </p>
      </div>
    )} */}
          </div>
        </main>
      </div>

      <BonkChatWidget></BonkChatWidget>
    </div>
  );
};

export default HomePage;
