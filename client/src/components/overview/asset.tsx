"use client";

import React from 'react';
import { ChevronDown } from 'lucide-react';

// --- 1. กำหนด Interfaces สำหรับ TypeScript ---
interface AssetData {
  id: number;
  name: string;
  y1: string;
  y3: string;
  y5: string;
  status: 'up' | 'down' | 'neutral' | 'light';
}

interface BadgeProps {
  val: string;
  status: AssetData['status'];
  index: number;
}

interface AssetPerformanceTableProps {
  isPortfolioDropdownOpen: boolean;
  setIsPortfolioDropdownOpen: (open: boolean) => void;
  selectedPortfolio: string;
  setSelectedPortfolio: (portfolio: string) => void;
  selectedAssetId: number | null;
  setSelectedAssetId: (id: number) => void;
}

// --- 2. คอมโพเนนต์ Badge (แยกส่วนการจัดการสี) ---
const Badge: React.FC<BadgeProps> = ({ val, status, index }) => {
  const styles = {
    upPrimary: "bg-[#10B981] text-white",      // Green
    upSecondary: "bg-[#D1FAE5] text-[#059669]", // Light Green
    down: "bg-[#FEE2E2] text-[#DC2626]",        // Red
    neutral: "bg-[#F1F5F9] text-[#64748B]",     // Gray
  };

  let selectedStyle = styles.neutral;

  if (status === 'up' || status === 'light') {
    selectedStyle = index === 0 ? styles.upPrimary : styles.upSecondary;
  } else if (status === 'down') {
    selectedStyle = styles.down;
  }

  return (
    <span className={`inline-block w-18.75 py-1.5 rounded-md text-[9px] font-black ${selectedStyle} uppercase text-center`}>
      {val}
    </span>
  );
};

// --- 3. ข้อมูล Mock Data และ Constants ---
const MOCK_ASSETS_DATA: AssetData[] = Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  name: i === 0 ? 'US EQUITY (S&P 500)' : i === 1 ? 'BITCOIN (BTC)' : 'GLOBAL BONDS',
  y1: '+12.42%',
  y3: '+35.10%',
  y5: '+64.20%',
  status: i % 4 === 0 ? 'up' : i % 4 === 1 ? 'neutral' : i % 4 === 2 ? 'light' : 'down'
}));

const PORTFOLIOS = [
  'Default Portfolio',
  'Tech Alpha Strategy',
  'Aggressive Growth',
  'Conservative Income'
];

// --- 4. คอมโพเนนต์หลัก ---
export const AssetPerformanceTable: React.FC<AssetPerformanceTableProps> = ({ 
  isPortfolioDropdownOpen, 
  setIsPortfolioDropdownOpen, 
  selectedPortfolio, 
  setSelectedPortfolio,
  selectedAssetId,
  setSelectedAssetId 
}) => {
  return (
    <div className="lg:col-span-5 bg-white rounded-[10px] border border-slate-200 p-4 md:p-6 lg:p-8 shadow-sm flex flex-col h-full text-slate-900 min-h-[400px] lg:min-h-125">

  {/* Header */}
  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4 md:mb-8">
    <div>
      <h2 className="text-lg md:text-xl font-medium text-slate-800 tracking-tight">Asset Class Performance</h2>
      <p className="text-[11px] text-slate-400 uppercase mt-1">ผลตอบแทนรายสินทรัพย์</p>
    </div>
    <div className="relative">
      <button 
        onClick={() => setIsPortfolioDropdownOpen(!isPortfolioDropdownOpen)}
        className="uppercase cursor-pointer bg-black text-white px-3 md:px-4 py-2 rounded-[10px] flex items-center gap-2 text-[10px] font-semibold tracking-tighter hover:bg-slate-800 transition-all shadow-md active:scale-95"
      >
        <span className="hidden sm:inline">{selectedPortfolio}</span>
        <span className="sm:hidden">Portfolio</span>
        <ChevronDown size={14} className={`transition-transform duration-300 ${isPortfolioDropdownOpen ? 'rotate-180' : ''}`} />
      </button>
      
        {/* Backdrop เพื่อให้คลิกข้างนอกเพื่อปิดได้ */}
      {isPortfolioDropdownOpen && (
        
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsPortfolioDropdownOpen(false)} />
          <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-[10px] shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {PORTFOLIOS.map((p) => (
              <button key={p} onClick={() => { setSelectedPortfolio(p); setIsPortfolioDropdownOpen(false); }}
                className="w-full text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                {p}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  </div>

  {/* Table */}
  <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
    <table className="w-full text-left">
      <thead className="sticky top-0 bg-white z-10">
        <tr className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
          <th className="pb-3 md:pb-4 w-[40%]">Asset Class</th>
          <th className="pb-3 md:pb-4 text-center w-[20%]">1Y</th>
          <th className="pb-3 md:pb-4 text-center w-[20%]">3Y</th>
          <th className="pb-3 md:pb-4 text-center w-[20%]">5Y</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-50">
        {MOCK_ASSETS_DATA.map((asset) => (
          <tr key={asset.id} onClick={() => setSelectedAssetId(asset.id)}
            className={`cursor-pointer transition-all duration-200 ${selectedAssetId === asset.id ? 'bg-slate-100/80 shadow-inner' : 'hover:bg-slate-50'}`}>
            <td className="py-3 md:py-5">
              <p className={`text-[10px] md:text-[11px] font-bold tracking-widest uppercase transition-colors ${selectedAssetId === asset.id ? 'text-black' : 'text-slate-500'}`}>
                {asset.name}
              </p>
            </td>
            <td className="py-3 md:py-5 text-center"><Badge val={asset.y1} status={asset.status} index={0} /></td>
            <td className="py-3 md:py-5 text-center"><Badge val={asset.y3} status={asset.status} index={1} /></td>
            <td className="py-3 md:py-5 text-center"><Badge val={asset.y5} status={asset.status} index={2} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
  );
};