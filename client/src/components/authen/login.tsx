"use client";

import React, { useState } from 'react';
import { 
  Mail, Lock, User, ArrowRight,  ShieldCheck, 
  Sparkles, Eye, EyeOff, CheckCircle2, ChevronLeft, Fingerprint
} from 'lucide-react';

import { RegisterPage } from './regis';
const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"/>
  </svg>
);
export const LoginPage = ({ onRegister }: { onRegister: () => void }) => {
  

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  
  

  const handleAuth = (e) => {
    e.preventDefault();
    setIsLoading(true);
   
    setTimeout(() => {
      setIsLoading(false);
     
    }, 1500);
  };
 

  return (
    
    
      
 
   
    <div className="min-h-screen bg-black flex items-center justify-center p-4 lg:p-0 font-sans selection:bg-[#10B981] selection:text-white">
      {/* Import Font Work Sans */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Work+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
        * { font-family: 'Work Sans', sans-serif !important; }
      `}} />

      {/* Auth Container */}
      <div className="bg-white w-full max-w-[1000px] min-h-[650px] rounded-[10px] shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 animate-in fade-in zoom-in-95 duration-700">
        
        {/* Left Side: Branding & Visuals (Visible on LG up) */}
        <div className="hidden lg:flex bg-black relative p-12 flex-col justify-between overflow-hidden">
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 w-full h-full opacity-20 pointer-events-none">
            <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-[#10B981] rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-slate-700 rounded-full blur-[100px]"></div>
          </div>

          <div className="relative z-10 flex items-center gap-3">
            <div >
               <img src="picture/logo.png" alt="Logo" className="w-10 h-10"/>
            </div>
            <span className="text-white text-xl font-bold uppercase italic tracking-tight">Portfolio Visualizer</span>
          </div>

          <div className="relative z-10">
            <h1 className="text-5xl font-black text-white leading-[1.1] italic uppercase tracking-tighter mb-6">
              Precision <br />
              <span className="text-[#10B981]">Engineering</span> <br />
              for wealth.
            </h1>
            <p className="text-slate-400 text-sm font-medium max-w-sm leading-relaxed mb-8 italic">
              "ก้าวสู่โลกแห่งการวิเคราะห์ข้อมูลเชิงปริมาณระดับสถาบัน ด้วยระบบจำลองพอร์ตที่รวดเร็วและแม่นยำที่สุด"
            </p>
            
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 text-white/60">
                <ShieldCheck size={18} className="text-[#10B981]" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Institutional Grade Security</span>
              </div>
              <div className="flex items-center gap-3 text-white/60">
                <Fingerprint size={18} className="text-[#10B981]" />
                <span className="text-[10px] font-bold uppercase tracking-widest">End-to-End Encryption</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-10 border-t border-white/10">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">PortViz Pro v2.4 • 2026</p>
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <div className="p-8 lg:p-16 flex flex-col justify-center bg-white">
          <button 
                 
                className="flex items-center gap-2 text-[10px] font-bold text-slate-400 hover:text-black uppercase tracking-[0.2em] mb-10 w-fit transition-all group"
              >
                <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                ย้อนกลับไปหน้าแรก
              </button>
          <div className="mb-10">
            
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase mb-2">
              {'Welcome Back'}
            </h2>
            <p className="text-slate-400 text-[11px] font-bold uppercase tracking-[0.2em] italic">
              {'ลงชื่อเข้าใช้เพื่อจัดการกลยุทธ์ของคุณ'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Terminal ID</label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-black transition-colors" size={16} />
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  className="w-full bg-slate-50 border border-slate-100 focus:border-black py-3.5 pl-10 pr-4 rounded-[10px] outline-none text-sm font-semibold transition-all placeholder:text-slate-300"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Access Key</label>
                { <button type="button" className="text-[10px] font-bold text-slate-400 hover:text-black uppercase tracking-tighter">Forgot Key?</button>}
              </div>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-black transition-colors" size={16} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  className="w-full bg-slate-50 border border-slate-100 focus:border-black py-3.5 pl-10 pr-12 rounded-[10px] outline-none text-sm font-semibold transition-all placeholder:text-slate-300"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-4 bg-black text-white rounded-[10px] font-bold uppercase text-[11px] tracking-[0.2em] shadow-xl hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-6 group disabled:opacity-70"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  {'Authenticate' }
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Alternative Auth */}
          <div className="mt-8">
            <div className="relative flex items-center justify-center mb-6">
              <div className="border-t border-slate-100 w-full"></div>
              <span className="bg-white px-4 text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em] absolute">Global Access</span>
            </div>

            
              <button className="h-[40px] w-full flex items-center justify-center  border border-slate-100 rounded-[10px] hover:bg-slate-50 transition-all font-bold text-[10px] uppercase tracking-widest text-slate-600 italic">
                <GoogleIcon /> Sign in with Google
              </button>
            </div>
          

          <div className="mt-auto pt-10 text-center">
            <button onClick={onRegister} className="text-[11px] font-bold text-slate-400 hover:text-black transition-all uppercase tracking-widest">
              {"Need access? "}
              <span className="text-black font-black underline underline-offset-4 decoration-[#10B981] decoration-2">
              'Sign up'
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
   
  );
};

