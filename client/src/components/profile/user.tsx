"use client";

import React, { useState, useEffect } from 'react';
import { 
  Home, Layers, ShoppingCart, History, User, 
  Mail, ShieldCheck, LogOut, Wallet, RefreshCcw, 
  ChevronDown, Bot, X, Menu, CheckCircle2, 
  Plus, Settings, Send, Sparkles, Loader2,
  ShieldAlert, Shield, AlertCircle, Save
} from 'lucide-react';

import { AppHeader } from '../overview/header';

// --- Constants ---
const MAX_BALANCE = 100000;







// --- Main Application ---

const App = () => {
  // Database States (Saved state)
  const [dbBalance, setDbBalance] = useState(4000);
  const [dbRisk, setDbRisk] = useState('MODERATE');
  const [dbCurrency, setDbCurrency] = useState('USD - US Dollar');

  // Working States (Unsaved changes)
  const [balance, setBalance] = useState(4000);
  const [risk, setRisk] = useState('MODERATE');
  const [currency, setCurrency] = useState('USD - US Dollar');

  const [isSaving, setIsSaving] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Check if there are unsaved changes
  const isDirty = balance !== dbBalance || risk !== dbRisk || currency !== dbCurrency;

  const handleTopUp = () => {
    if (balance + 1000 > MAX_BALANCE) {
      setErrorMsg(`วงเงินจำลองสูงสุดคือ $${MAX_BALANCE.toLocaleString()}`);
      setTimeout(() => setErrorMsg(""), 3000);
      return;
    }
    setBalance(prev => prev + 1000);
  };

  const handleReset = () => { 
    setBalance(4000); 
    setRisk('MODERATE');
    setCurrency('USD - US Dollar');
  };

  const handleSave = async () => {
    if (!isDirty) return;
    setIsSaving(true);
    
    // Simulate DB Write
    try {
      const prompt = `ผู้ใช้บันทึกการตั้งค่าใหม่: เงิน $${balance}, ความเสี่ยง ${risk}, สกุลเงิน ${currency}. สรุปสั้นๆ ให้ผู้ใช้หน่อย`;
      const aiResponse = await callGemini(prompt);
      
      setDbBalance(balance);
      setDbRisk(risk);
      setDbCurrency(currency);
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      setErrorMsg("ไม่สามารถบันทึกข้อมูลลง Database ได้");
    } finally {
      setIsSaving(false);
    }
  };

  const getRiskStyles = (level) => {
    switch(level) {
      case 'LOW': return { active: 'bg-[#10B981] text-white', text: 'text-[#10B981]', label: 'ง่าย (Low Risk)' };
      case 'MODERATE': return { active: 'bg-[#F59E0B] text-white', text: 'text-[#F59E0B]', label: 'กลาง (Medium Risk)' };
      case 'AGGRESSIVE': return { active: 'bg-[#EF4444] text-white', text: 'text-[#EF4444]', label: 'ยาก (High Risk)' };
      default: return { active: 'bg-black text-white', text: 'text-black', label: '' };
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-emerald-500 selection:text-white flex flex-col h-screen overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@100..900&family=Work+Sans:ital,wght@0,100..900;1,100..900&display=swap');
        * { font-family: 'Work Sans', 'Noto Sans Thai', sans-serif !important; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #CBD5E0; border-radius: 10px; }
      `}} />

      <AppHeader />

      <div className="flex-1 overflow-hidden px-8 pb-8">
        
        {/* Alerts & Toasts */}
        {errorMsg && (
          <div className="absolute top-10 left-1/2 -translate-x-1/2 z-[200] bg-rose-600 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-10 duration-300 border border-white/20 font-black uppercase text-xs tracking-widest">
            <AlertCircle size={20} /> {errorMsg}
          </div>
        )}

        {saveSuccess && (
          <div className="absolute top-10 left-1/2 -translate-x-1/2 z-[200] bg-[#10B981] text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-10 duration-300 border border-white/20 font-black uppercase text-xs tracking-widest">
            <CheckCircle2 size={20} /> บันทึกการเปลี่ยนแปลงเรียบร้อยแล้ว
          </div>
        )}



   <main className="w-full h-full bg-white rounded-[10px] shadow-[0_40px_100px_rgba(0,0,0,0.5)] p-4 md:p-6 lg:p-8 overflow-y-auto custom-scrollbar">
  <div className="p-2 flex flex-col lg:flex-row gap-4 w-full min-h-full">  
    {/* Identity Section (Left) */}
    <div className="w-full lg:w-[32%] bg-white rounded-[10px] border border-slate-200 shadow-sm flex flex-col items-center text-center p-6 shrink-0">
      <div className="relative group mb-6">
        <div className="w-24 h-24 md:w-36 md:h-36 rounded-full bg-black flex items-center justify-center shadow-2xl ring-8 ring-slate-50 overflow-hidden transition-transform group-hover:scale-105 duration-500">
          <User size={60} className="text-white" />
        </div>
      </div>
      <h2 className="text-lg md:text-xl font-medium text-slate-800 tracking-tighter leading-none mb-1">Apichet Runbor</h2>
      <p className="text-[11px] font-medium text-slate-400 uppercase mb-8">ID:00000001</p>
      <div className="w-full space-y-3 mb-auto">
        <div className="bg-[#F1F5F9] p-4 rounded-[10px] flex items-center gap-4 text-left border border-slate-50 transition-all hover:bg-white hover:border-black group">
          <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100 text-black group-hover:bg-black group-hover:text-white transition-all shrink-0"><Mail size={18} /></div>
          <div className="overflow-hidden">
            <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest leading-none mb-1">Email Address</p>
            <p className="text-[13px] font-bold text-slate-700 truncate tracking-tighter">apichet.run@gmail.com</p>
          </div>
        </div>
        <div className="bg-[#F1F5F9] p-4 rounded-[10px] flex items-center gap-4 text-left border border-slate-50 transition-all hover:bg-white hover:border-[#10B981] group">
          <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100 text-[#10B981] group-hover:bg-[#10B981] group-hover:text-white transition-all shrink-0"><ShieldCheck size={18} /></div>
          <div className="overflow-hidden">
            <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest leading-none mb-1">Account Security</p>
            <p className="text-[13px] font-bold text-[#10B981] truncate tracking-tighter">Verified Member</p>
          </div>
        </div>
      </div>
      <button className="cursor-pointer w-full mt-8 py-3 border border-[#FF4D4D] text-[#FF4D4D] rounded-[10px] font-black uppercase text-[11px] tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-[#FF4D4D] hover:text-white transition-all active:scale-95">
        <LogOut size={16} className="rotate-180" /> SIGN OUT
      </button>
    </div>

    {/* Content Section (Right) */}
    <div className="flex-1 bg-white rounded-[10px] border border-slate-200 shadow-sm flex flex-col p-6 gap-6">
      
      {/* Simulation Wallet */}
      <div className="flex flex-col">
        <div className="mb-4">
          <h3 className="text-xl font-medium tracking-tight text-black">Simulation Wallet</h3>
          <p className="text-[12px] font-regular text-slate-400 uppercase mt-1">จัดการเครดิตจำลองเพื่อใช้ในการทดสอบพอร์ตการลงทุน</p>
        </div>
        <div className="mb-6">
          <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 opacity-70">
            Available Credit {isDirty && <span className="text-amber-500">(Draft: ${balance.toLocaleString()})</span>}
          </p>
          <h4 className={`text-4xl md:text-5xl font-black tracking-tighter leading-none transition-all duration-500 ${isDirty ? 'text-slate-400' : 'text-black'}`}>
            ${dbBalance.toLocaleString()}
          </h4>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={handleTopUp} className="cursor-pointer py-4 bg-[#00A86B] text-white rounded-[10px] font-black uppercase text-[11px] tracking-widest hover:brightness-110 active:scale-95 transition-all">Top up virtual money</button>
          <button onClick={handleReset} className="cursor-pointer py-4 bg-[#F1F5F9] text-slate-400 rounded-[10px] font-black uppercase text-[11px] tracking-widest hover:bg-slate-200 transition-all active:scale-95">RESET ALL</button>
        </div>
      </div>

      <div className="h-px w-full bg-slate-100" />

      {/* Preferences */}
      <div className="flex flex-col gap-6">
        <div>
          <h3 className="text-xl font-medium tracking-tight text-black">Preferences</h3>
          <p className="text-[12px] font-regular text-slate-400 uppercase mt-1">การตั้งค่า</p>
        </div>

        <div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 opacity-70">Risk Tolerance Profile</p>
          <div className="flex flex-row bg-[#F1F5F9] p-1.5 rounded-[10px] gap-1.5 border border-slate-50 shadow-inner">
            {['LOW', 'MODERATE', 'AGGRESSIVE'].map(lv => (
              <button
                key={lv}
                onClick={() => setRisk(lv)}
                className={`cursor-pointer flex-1 py-3 text-[10px] md:text-[11px] font-black uppercase tracking-widest rounded-[8px] transition-all ${risk === lv ? `${getRiskStyles(lv).active} shadow-lg scale-[1.02]` : 'bg-white text-slate-400 hover:text-black'}`}
              >
                {lv}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 opacity-70">Default Currency</p>
          <div className="relative max-w-full sm:max-w-sm group">
            <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full bg-[#F1F5F9] rounded-[10px] py-3 px-5 text-[14px] font-medium text-slate-800 appearance-none outline-none cursor-pointer">
              <option>USD - US Dollar</option>
              <option>THB - Thai Baht</option>
              <option>EUR - Euro</option>
            </select>
            <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>


      {/* SAVE BUTTON */}
      <div className="mt-auto pt-5 flex flex-col sm:flex-row items-center gap-4 border-t border-slate-100">
        <div className="flex-1 w-full">
          {isDirty ? (
            <p className="text-[10px] text-amber-600 font-bold uppercase tracking-widest flex items-center gap-2 animate-pulse">
              <AlertCircle size={13}/> มีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก
            </p>
          ) : (
            <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest flex items-center gap-2">
              <CheckCircle2 size={13}/> ข้อมูลตรงกับ Database แล้ว
            </p>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={!isDirty || isSaving}
          className={`w-full sm:w-auto cursor-pointer px-8 py-4 rounded-[10px] font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 transition-all ${
            isDirty ? 'bg-black text-white hover:scale-105 active:scale-95' : 'bg-slate-50 text-slate-300 cursor-not-allowed'
          }`}
        >
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16}/>}
          SAVE CONFIGURATION
        </button>
      </div>

    </div>
  </div>
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