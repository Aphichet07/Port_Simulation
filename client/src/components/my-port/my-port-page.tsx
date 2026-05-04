"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Loader2, BarChart2, Activity, Briefcase, ChevronRight, Info, Layout } from "lucide-react";

import { AppHeader } from "../overview/header";
import BonkChatWidget from "../ui/bonk";
import AssetForm from "@/src/components/ui/createPort";

export const Myport = () => {
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [selectedPortId, setSelectedPortId] = useState<number | null>(null);

  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchPortfolios = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) return;
      const res = await axios.get("http://localhost:7000/portfolio/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data?.portfolio || res.data;
      if (Array.isArray(data)) setPortfolios(data);
    } catch (err) {
      console.error("Failed to fetch portfolios:", err);
    }
  };

  useEffect(() => {
    fetchPortfolios();
  }, []);

  const handleDeepAnalyze = async (id: number) => {
    setSelectedPortId(id);
    try {
      setIsLoadingAnalytics(true);
      const end = new Date().toISOString().split("T")[0];
      const res = await axios.get(
        `http://localhost:7000/backtest/report/${id}?start=2020-01-01&end=${end}&initialCapital=10000`
      );
      if (res.data?.success) setAnalytics(res.data.data);
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
      setAnalytics(null);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  const activePortfolio = portfolios.find((p) => p.id === selectedPortId);
  const metrics = analytics?.metrics;

  const performanceGroups = metrics ? [
    {
      category: "Absolute Returns",
      data: [
        { label: "Total Return", value: `${(metrics.totalReturn * 100).toFixed(2)}%`, showInfo: false },
        { label: "Annualized Return (CAGR)", value: `${(metrics.cagr * 100).toFixed(2)}%`, showInfo: true },
        { label: "Win Rate", value: `${(metrics.winRate * 100).toFixed(2)}%`, showInfo: false },
        { label: "Profit Factor", value: metrics.profitFactor.toFixed(2), showInfo: false },
      ]
    },
    {
      category: "Absolute Risks",
      data: [
        { label: "Max Drawdown", value: `${(metrics.maxDrawdown * 100).toFixed(2)}%`, showInfo: true },
        { label: "Volatility (Ann.)", value: `${(metrics.annualizedVolatility * 100).toFixed(2)}%`, showInfo: false },
        { label: "Sharpe Ratio", value: metrics.sharpeRatio.toFixed(2), showInfo: false },
        { label: "Sortino Ratio", value: metrics.sortinoRatio.toFixed(2), showInfo: false },
      ]
    },
    {
        category: "Market Relative",
        data: [
          { label: "Alpha", value: `${(metrics.alpha * 100).toFixed(2)}%`, showInfo: true },
          { label: "Beta", value: metrics.beta.toFixed(2), showInfo: true },
        ]
    }
  ] : [];

  return (
    <div className="h-screen bg-black text-white font-sans flex flex-col overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@100..900&family=Work+Sans:wght@100..900&display=swap');
        * { font-family: 'Work Sans', 'Noto Sans Thai' !important; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}} />

      <AppHeader />

      {/* Main Content Split View */}
      <div className="flex-1 flex overflow-hidden p-4 md:p-6 gap-4 bg-[#0a0a0a]">
        
        {/* LEFT SIDE: Portfolio List (Sticky/Sidebar style) */}
        <aside className="w-full md:w-80 lg:w-96 flex flex-col bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <div>
              <h2 className="text-slate-900 font-bold flex items-center gap-2">
                <Briefcase size={18} className="text-blue-500" /> My Vault
              </h2>
              <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">{portfolios.length} Portfolios</p>
            </div>
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="p-2 bg-slate-900 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
            {portfolios.map((port) => (
              <div 
                key={port.id} 
                onClick={() => handleDeepAnalyze(port.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer group ${
                  selectedPortId === port.id 
                  ? 'border-blue-500 bg-blue-50 shadow-sm' 
                  : 'border-slate-100 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    selectedPortId === port.id ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-400'
                  }`}>
                    <BarChart2 size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-slate-900 truncate">
                      {port.port_name || port.name || "Untitled"}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Backtest Ready</p>
                  </div>
                  {selectedPortId === port.id ? (
                    <Activity size={16} className="text-blue-500 animate-pulse" />
                  ) : (
                    <ChevronRight size={16} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* RIGHT SIDE: Analytics Content */}
        <main className="flex-1 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col">
          {!selectedPortId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Layout size={40} className="text-slate-200" />
              </div>
              <p className="font-medium">Select a portfolio to view deep analytics</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Top Header for Detail */}
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                <div>
                  <h1 className="text-xl font-black text-slate-900 tracking-tight">
                    {activePortfolio?.port_name || activePortfolio?.name}
                  </h1>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase">Performance Report</span>
                </div>
                {isLoadingAnalytics && <Loader2 className="animate-spin text-blue-500" size={24} />}
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                {isLoadingAnalytics ? (
                  <div className="h-full flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="animate-spin text-slate-200" size={48} />
                    <p className="text-slate-400 animate-pulse text-sm font-bold uppercase">Processing Quant Data...</p>
                  </div>
                ) : metrics ? (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    
                    {/* Performance Table */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50/50 border-b border-slate-200">
                            <th className="py-3 px-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Metric</th>
                            <th className="py-3 px-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Value</th>
                          </tr>
                        </thead>
                        <tbody className="text-sm">
                          {performanceGroups.map((group, gIdx) => (
                            <React.Fragment key={gIdx}>
                              <tr className="bg-slate-50/30">
                                <td colSpan={2} className="py-2 px-6 font-bold text-[10px] text-blue-500 uppercase tracking-widest border-b border-slate-100">
                                  {group.category}
                                </td>
                              </tr>
                              {group.data.map((row, rIdx) => {
                                const isNeg = row.value.includes('-');
                                return (
                                  <tr key={rIdx} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                    <td className="py-3 px-8 text-slate-600 font-medium">{row.label}</td>
                                    <td className={`py-3 px-6 text-right font-bold ${isNeg ? 'text-rose-500' : 'text-slate-900'}`}>
                                      <div className="flex items-center justify-end gap-2">
                                        {row.showInfo && <Info size={14} className="text-slate-300" />}
                                        {row.value}
                                      </div>
                                    </td>
                                  </tr>
                                )
                              })}
                            </React.Fragment>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-20 text-slate-400">
                    <Activity size={40} className="mx-auto mb-4 opacity-20" />
                    <p>No analytics data available for this range.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      <BonkChatWidget />
      {isCreateModalOpen && <AssetForm onClose={() => setIsCreateModalOpen(false)} />}
    </div>
  );
};

export default Myport;