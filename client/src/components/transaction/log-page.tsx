"use client";

import React, { useState } from 'react';
import { 
  Home, Layers, ShoppingCart, History, User, 
  Search, Bot, X
} from 'lucide-react';

import { AppHeader } from '../overview/header';

const TRANSACTION_LOGS = [
  { id: 'TX9921', date: '2026-04-08 14:20', asset: 'AAPL', type: 'BUY', method: 'ONE-TIME', amount: '$1,852.00', status: 'SUCCESS' },
  { id: 'TX9920', date: '2026-04-07 09:15', asset: 'BTC', type: 'BUY', method: 'AUTO-DCA', amount: '$3,420.00', status: 'SUCCESS' },
  { id: 'TX9919', date: '2026-04-05 16:45', asset: 'GOLD', type: 'SELL', method: 'ONE-TIME', amount: '$4,700.20', status: 'SUCCESS' },
  { id: 'TX9918', date: '2026-04-02 11:30', asset: 'VTI', type: 'BUY', method: 'AUTO-DCA', amount: '$3,756.75', status: 'SUCCESS' },
  { id: 'TX9917', date: '2026-04-01 10:20', asset: 'AAPL', type: 'BUY', method: 'ONE-TIME', amount: '$1,982.80', status: 'SUCCESS' },
  { id: 'TX9916', date: '2026-03-18 04:05', asset: 'GOLD', type: 'BUY', method: 'ONE-TIME', amount: '$1,704.00', status: 'SUCCESS' },
  { id: 'TX9915', date: '2026-03-15 05:40', asset: 'BTC', type: 'BUY', method: 'AUTO-DCA', amount: '$1,052.00', status: 'SUCCESS' },
  { id: 'TX9914', date: '2026-03-08 15:00', asset: 'AAPL', type: 'SELL', method: 'AUTO-DCA', amount: '$152.00', status: 'FAIL' },
];

const TypeBadge = ({ type }) => (
  <span className={`px-3 py-1 rounded-[6px] text-[10px] font-black tracking-widest ${
    type === 'BUY' ? 'bg-[#D1FAE5] text-[#059669]' : 'bg-[#FEE2E2] text-[#DC2626]'
  }`}>
    {type}
  </span>
);

const StatusBadge = ({ status }) => (
  <span className={`px-3 py-1.5 rounded-[6px] text-[9px] font-black tracking-widest uppercase ${
    status === 'SUCCESS' ? 'bg-[#10B981] text-white' : 'bg-[#FF6B6B] text-white'
  } shadow-sm`}>
    {status}
  </span>
);

// Card layout for mobile
const TransactionCard = ({ log }) => (
  <div className="bg-white border border-slate-100 rounded-[10px] p-4 shadow-sm flex flex-col gap-3">
    <div className="flex items-center justify-between">
      <span className="text-xs font-black text-slate-900">#{log.id}</span>
      <StatusBadge status={log.status} />
    </div>
    <div className="flex items-center justify-between">
      <span className="text-[13px] font-black text-slate-800 tracking-tight uppercase">{log.asset}</span>
      <span className="text-[15px] font-bold text-slate-900 tracking-tighter">{log.amount}</span>
    </div>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <TypeBadge type={log.type} />
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{log.method}</span>
      </div>
      <span className="text-[11px] text-slate-400">{log.date}</span>
    </div>
  </div>
);

const TransactionLogsView = () => {
  const [search, setSearch] = useState('');

  const filtered = TRANSACTION_LOGS.filter(log =>
    log.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#B5F28B] selection:text-black flex flex-col h-screen overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@100..900&family=Work+Sans:ital,wght@0,100..900;1,100..900&display=swap');
        * { font-family: 'Work Sans', 'Noto Sans Thai', sans-serif !important; }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      <AppHeader />

      {/* Content Area */}
      <div className="flex-1 overflow-hidden px-3 sm:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8">
        <main className="w-full h-full bg-white rounded-[10px] shadow-[0_40px_100px_rgba(0,0,0,0.5)] p-4 sm:p-6 lg:p-10 overflow-y-auto custom-scrollbar">

          <div className="p-8 bg-white border border-slate-200 rounded-[10px] flex flex-col text-slate-900 mx-auto animate-in fade-in duration-700">

            {/* Header: Title & Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sm:mb-10 lg:mb-16">
              <div>
                <h2 className="text-lg sm:text-xl font-medium tracking-tight text-black">Transaction History</h2>
                <p className="text-[11px] sm:text-[12px] font-regular text-slate-400 uppercase mt-1">ประวัติการจำลองการซื้อขายทั้งหมด</p>
              </div>

              <div className="relative w-full sm:w-[260px] lg:w-[320px] group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-black transition-colors" size={16} />
                <input
                  type="text"
                  placeholder="Search by ID..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-slate-50/50 border-b-2 border-slate-100 focus:border-black py-3 sm:py-4 pl-12 pr-4 text-xs outline-none transition-all placeholder:text-slate-300 rounded-t-[10px]"
                />
              </div>
            </div>

            {/* Table — iPad & Desktop (md+) */}
            <div className="hidden md:block overflow-x-auto no-scrollbar -mx-2">
              <table className="w-full border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-4 lg:px-6 py-4 lg:py-6 text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-left">Transaction ID</th>
                    <th className="px-4 lg:px-6 py-4 lg:py-6 text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Date & Time</th>
                    <th className="px-4 lg:px-6 py-4 lg:py-6 text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Asset</th>
                    <th className="px-4 lg:px-6 py-4 lg:py-6 text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Type</th>
                    <th className="px-4 lg:px-6 py-4 lg:py-6 text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Method</th>
                    <th className="px-4 lg:px-6 py-4 lg:py-6 text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Total Amount</th>
                    <th className="px-4 lg:px-6 py-4 lg:py-6 text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map((log) => (
                    <tr key={log.id} className="group hover:bg-slate-50/50 transition-all cursor-pointer">
                      <td className="px-4 lg:px-6 py-5 lg:py-8 text-left">
                        <span className="text-xs font-black text-slate-900 opacity-90">#{log.id}</span>
                      </td>
                      <td className="px-4 lg:px-6 py-5 lg:py-8 text-center">
                        <span className="text-[11px] lg:text-[12px] font-bold text-slate-600">{log.date}</span>
                      </td>
                      <td className="px-4 lg:px-6 py-5 lg:py-8 text-center">
                        <span className="text-[12px] lg:text-[13px] font-black text-slate-800 tracking-tight uppercase">{log.asset}</span>
                      </td>
                      <td className="px-4 lg:px-6 py-5 lg:py-8 text-center">
                        <TypeBadge type={log.type} />
                      </td>
                      <td className="px-4 lg:px-6 py-5 lg:py-8 text-center">
                        <span className="text-[10px] lg:text-[11px] font-bold text-slate-800 uppercase tracking-widest">{log.method}</span>
                      </td>
                      <td className="px-4 lg:px-6 py-5 lg:py-8 text-center">
                        <span className="text-[13px] lg:text-[15px] font-bold text-slate-900 tracking-tighter">{log.amount}</span>
                      </td>
                      <td className="px-4 lg:px-6 py-5 lg:py-8 text-center">
                        <StatusBadge status={log.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Card Layout — Mobile only (< md) */}
            <div className="flex md:hidden flex-col gap-3">
              {filtered.map((log) => (
                <TransactionCard key={log.id} log={log} />
              ))}
            </div>

          </div>
        </main>
      </div>

      {/* Floating Bot */}
      <div className="fixed bottom-6 right-6 sm:bottom-10 sm:right-10 z-[200]">
        <button className="bg-black text-white p-4 sm:p-5 rounded-full shadow-[0_20px_60px_rgba(0,0,0,0.4)] hover:scale-110 active:scale-95 transition-all border border-white/10 group relative">
          <Bot size={24} className="sm:hidden" />
          <Bot size={28} className="hidden sm:block" />
          <div className="absolute inset-0 bg-[#B5F28B]/20 rounded-full animate-ping pointer-events-none"></div>
        </button>
      </div>
    </div>
  );
};

export default TransactionLogsView;