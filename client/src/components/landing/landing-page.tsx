"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from 'next/navigation';

// --- Hook: Scroll-triggered reveal ---
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// --- Hook: Animated counter ---
function useCounter(target: number, inView: boolean, duration = 1600) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target, duration]);
  return count;
}
const PORTFOLIOS = [
  { name: "Mebane Faber Ivy Portfolio",      ytd: "+15.11%", y1: "+29.76%" },
  { name: "Bill Bernstein No Brainer",        ytd: "+6.76%",  y1: "+24.96%" },
  { name: "Rick Ferri Core Four",             ytd: "+6.16%",  y1: "+24.79%" },
  { name: "Marc Faber Portfolio",             ytd: "+5.93%",  y1: "+22.40%" },
  { name: "Stocks / Bonds (60/40)",           ytd: "+3.67%",  y1: "+19.68%" },
  { name: "Harry Browne Permanent Portfolio", ytd: "+3.34%",  y1: "+19.00%" },
];

const TOOLS = [
  {
    category: "Portfolio Analysis",
    items: ["Backtest Asset Class Allocation", "Backtest Portfolio", "Manager Performance Analysis"],
  },
  {
    category: "Simulation",
    items: ["Monte Carlo Simulation", "Financial Goals", "Scenario Analysis"],
  },
  {
    category: "Optimization",
    items: ["Efficient Frontier", "Portfolio Optimization", "Black-Litterman Model"],
  },
  {
    category: "Factor Analysis",
    items: ["Factor Regression", "Risk Factor Allocation", "Performance Attribution"],
  },
];

const STATS = [
  { num: "5.1M",  label: "Annual Visits" },
  { num: "100+",  label: "Countries" },
  { num: "30",    label: "Global Markets" },
  { num: "187K+", label: "Securities" },
];

const FOOTER_LINKS = {
  Product:  ["Features", "Pricing", "Changelog", "Roadmap"],
  Tools:    ["Backtest Portfolio", "Monte Carlo", "Factor Analysis", "Optimization"],
  Company:  ["About", "Blog", "Careers", "Press"],
  Legal:    ["Privacy Policy", "Terms of Service", "Cookie Policy", "Affiliates"],
};



export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  // Scroll reveal sections
  const statsSection  = useInView(0.2);
  const valueSection  = useInView(0.15);
  const toolsSection  = useInView(0.1);
  const ctaSection    = useInView(0.2);

  // Animated stat counters
  const STAT_NUMS = [5100000, 100, 30, 187000];
  const c0 = useCounter(STAT_NUMS[0], statsSection.inView);
  const c1 = useCounter(STAT_NUMS[1], statsSection.inView);
  const c2 = useCounter(STAT_NUMS[2], statsSection.inView);
  const c3 = useCounter(STAT_NUMS[3], statsSection.inView);
  const counters = [c0, c1, c2, c3];
  const formatStat = (idx: number, val: number) => {
    if (idx === 0) return val >= 1000000 ? `${(val/1000000).toFixed(1)}M` : val.toLocaleString();
    if (idx === 3) return val >= 1000 ? `${Math.round(val/1000)}K+` : val.toString();
    if (idx === 1) return val >= 100 ? "100+" : val.toString();
    return val.toString();
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white overflow-x-hidden">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@100..900&family=Work+Sans:ital,wght@0,100..900;1,100..900&display=swap');
        * { font-family: 'Work Sans', 'Noto Sans Thai', sans-serif !important; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-32px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(32px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.92); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.2} }
        @keyframes float {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-8px); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes borderPulse {
          0%,100% { border-color: rgba(0,232,122,0.3); }
          50%      { border-color: rgba(0,232,122,0.8); }
        }

        .fade-up   { animation: fadeUp  .65s cubic-bezier(.22,1,.36,1) both; }
        .fade-in   { animation: fadeIn  .6s ease both; }
        .slide-left  { animation: slideInLeft  .65s cubic-bezier(.22,1,.36,1) both; }
        .slide-right { animation: slideInRight .65s cubic-bezier(.22,1,.36,1) both; }
        .scale-in  { animation: scaleIn .65s cubic-bezier(.22,1,.36,1) both; }

        .d1{animation-delay:.08s} .d2{animation-delay:.18s}
        .d3{animation-delay:.28s} .d4{animation-delay:.40s}
        .d5{animation-delay:.52s} .d6{animation-delay:.64s}

        .live-dot  { animation: blink 2s infinite; }
        .float-card { animation: float 4s ease-in-out infinite; }

        .reveal { opacity: 0; transform: translateY(24px); transition: opacity .65s cubic-bezier(.22,1,.36,1), transform .65s cubic-bezier(.22,1,.36,1); }
        .reveal.visible { opacity: 1; transform: translateY(0); }
        .reveal-left { opacity: 0; transform: translateX(-28px); transition: opacity .65s cubic-bezier(.22,1,.36,1), transform .65s cubic-bezier(.22,1,.36,1); }
        .reveal-left.visible { opacity: 1; transform: translateX(0); }
        .reveal-right { opacity: 0; transform: translateX(28px); transition: opacity .65s cubic-bezier(.22,1,.36,1), transform .65s cubic-bezier(.22,1,.36,1); }
        .reveal-right.visible { opacity: 1; transform: translateX(0); }
        .reveal-scale { opacity: 0; transform: scale(0.93); transition: opacity .65s cubic-bezier(.22,1,.36,1), transform .65s cubic-bezier(.22,1,.36,1); }
        .reveal-scale.visible { opacity: 1; transform: scale(1); }

        .stagger-1 { transition-delay: .05s; }
        .stagger-2 { transition-delay: .12s; }
        .stagger-3 { transition-delay: .19s; }
        .stagger-4 { transition-delay: .26s; }
        .stagger-5 { transition-delay: .33s; }
        .stagger-6 { transition-delay: .40s; }

        .shimmer-text {
          background: linear-gradient(90deg, #000 40%, #00E87A 50%, #000 60%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s linear infinite;
        }
        .nav-link-underline {
          position: relative;
        }
        .nav-link-underline::after {
          content: '';
          position: absolute;
          bottom: -2px; left: 0;
          width: 0; height: 1px;
          background: black;
          transition: width .25s ease;
        }
        .nav-link-underline:hover::after { width: 100%; }

        .tool-card {
          transition: background .2s, transform .2s, box-shadow .2s;
        }
        .tool-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.07);
        }
        .stat-card {
          transition: transform .3s cubic-bezier(.22,1,.36,1);
        }
        .stat-card:hover { transform: scale(1.06); }

        .green-dot-pulse {
          animation: blink 2s infinite;
          box-shadow: 0 0 0 0 rgba(0,232,122,0.4);
        }
        .feature-row {
          transition: border-color .25s, background .25s, transform .25s;
        }
        .feature-row:hover {
          border-color: rgba(255,255,255,0.18) !important;
          background: rgba(255,255,255,0.04);
          transform: translateX(4px);
        }
        .portfolio-row {
          transition: background .2s;
        }
        .portfolio-row:hover { background: rgba(255,255,255,0.04); }

        .cta-btn {
          position: relative; overflow: hidden;
          transition: transform .2s, box-shadow .2s;
        }
        .cta-btn::after {
          content: '';
          position: absolute; inset: 0;
          background: rgba(255,255,255,0.12);
          transform: translateX(-100%);
          transition: transform .3s ease;
        }
        .cta-btn:hover::after { transform: translateX(0); }
        .cta-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(37,99,235,0.35); }
      `}} />

      {/* ── NAV ── */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md border-b border-black/6">
        <div className="max-w-6xl mx-auto px-6 xl:px-0 h-15.5 flex items-center justify-between">

          <Link href="/" className="flex items-center gap-2.5 group">
            <img src="picture/logo_dark.png" alt="Logo" className="w-10 h-10" />
            <span className="text-[14px] font-medium tracking-tight">Portfolio Visualizer</span>
          </Link>
          

          <nav className="hidden md:flex items-center gap-8">
            {["Analysis", "Markets", "Pricing", "Docs"].map(l => (
              <a key={l} href="#" className="nav-link-underline text-[13px] text-black/40 hover:text-black transition-colors tracking-tight">{l}</a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/authen" className="text-[13px] text-black/40 hover:text-black transition-colors">Log In</Link>
            <Link href="/authen?mode=register" className="bg-black text-white text-[12px] font-semibold px-5 py-2.5 rounded-[7px] hover:bg-black/80 transition-colors tracking-tight">
              Sign Up
            </Link>
          </div>

          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden w-8 h-8 flex flex-col items-center justify-center gap-1.25">
            <span className={`block w-5 h-[1.5px] bg-black transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-[6.5px]" : ""}`}/>
            <span className={`block w-5 h-[1.5px] bg-black transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`}/>
            <span className={`block w-5 h-[1.5px] bg-black transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-[6.5px]" : ""}`}/>
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-white border-t border-black/6 px-6 py-4 flex flex-col gap-1">
            {["Analysis", "Markets", "Pricing", "Docs"].map(l => (
              <a key={l} href="#" className="text-[14px] text-black/50 py-3 border-b border-black/5">{l}</a>
            ))}
            <Link href="/authen?mode=register" className="mt-3 bg-black text-white text-[13px] font-semibold text-center py-3.5 rounded-[7px]">Sign Up Free</Link>
          </div>
        )}
      </header>

      {/* ── HERO — white dominant ── */}
      <section className="pt-36 pb-24 px-6 max-w-6xl mx-auto xl:px-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left */}
          <div>
            <p className="fade-up text-[10px] font-bold tracking-[0.22em] uppercase text-black/30 mb-7">
              Compare your portfolio
            </p>
            <h1 className="fade-up d1 text-[clamp(40px,6vw,76px)] font-semibold leading-[1.04] tracking-[-0.03em] mb-6">
              Tools for<br/>
              <span className="italic font-light">Better</span><br/>
              Investors
            </h1>
            <p className="fade-up d2 text-[15px] text-black/40 font-light leading-relaxed max-w-xs mb-10">
              Sophisticated analytics once reserved for institutions — explained clearly, built for everyone.
            </p>
            <div className="fade-up d3 flex items-center gap-4 flex-wrap">
              <Link href="/authen?mode=register" className="cta-btn bg-blue-600 text-white text-[13px] font-semibold px-7 py-3.5 rounded-[7px] hover:bg-blue-800 transition-colors">
                Get Started →
              </Link>
              <a href="" className="flex items-center gap-2 text-[13px] text-black/35 hover:text-black transition-colors">
                <span className="live-dot w-1.5 h-1.5 rounded-full bg-[#00E87A] inline-block"/>
                Live Markets
              </a>
            </div>
          </div>

          {/* Right — dark card (30% black) */}
          <div id="market" className="fade-up d4 float-card bg-black rounded-[14px] p-7 text-white">
            <div className="flex items-center justify-between mb-5">
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/90">Market Monitor</p>
              <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase text-[#00E87A]">
                <span className="live-dot w-1.5 h-1.5 rounded-full bg-[#00E87A] inline-block"/>
                Live
              </span>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/8">
                  <th className="pb-3 text-left text-[9px] font-bold tracking-[0.18em] uppercase text-white/70">Portfolio</th>
                  <th className="pb-3 text-right text-[9px] font-bold tracking-[0.18em] uppercase text-white/70">YTD</th>
                  <th className="pb-3 text-right text-[9px] font-bold tracking-[0.18em] uppercase text-white/70 hidden sm:table-cell">1Y</th>
                </tr>
              </thead>
              <tbody>
                {PORTFOLIOS.map((p, i) => (
                  <tr key={i} className="portfolio-row border-b border-white/5 last:border-0 cursor-default">
                    <td className="py-3 text-[11px] text-white/50 pr-4">{p.name}</td>
                    <td className="py-3 text-right text-[11px] font-semibold text-[#00E87A]">{p.ytd}</td>
                    <td className="py-3 text-right text-[11px] text-white/50 hidden sm:table-cell">{p.y1}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-5 pt-5 border-t border-white/8 text-center">
              <a href="#" className="text-[10px] font-bold tracking-[0.15em] uppercase text-white/25 hover:text-white transition-colors">
                View Full Dashboard →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS — white bg ── */}
      <section className="border-y border-black/6" ref={statsSection.ref}>
        <div className="max-w-6xl mx-auto px-6 xl:px-0 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((s, i) => (
            <div key={i} className={`stat-card text-center reveal stagger-${i+1} ${statsSection.inView ? 'visible' : ''}`}>
              <div className="text-[clamp(28px,4vw,40px)] font-semibold tracking-tight">
                {statsSection.inView ? formatStat(i, counters[i]) : "0"}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/30 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── VALUE PROP — black section (30%) ── */}
      <section className="bg-black text-white" ref={valueSection.ref}>
        <div className="max-w-6xl mx-auto px-6 xl:px-0 py-24 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className={`reveal-left ${valueSection.inView ? 'visible' : ''}`}>
            <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-white/50 mb-5">Design. Analyze. Compare.</p>
            <h2 className="text-[clamp(28px,4vw,52px)] font-semibold tracking-tight leading-tight mb-5">
              Investments worst<br/>
              <span className="italic font-light text-white/50">kept secret</span>
            </h2>
            <p className="text-[14px] text-white/50 font-light leading-relaxed max-w-sm mb-8">
              Portfolio Visualizer turns sophisticated analytics into actionable insight — explained by AI. Available to anyone, anywhere.
            </p>
            <Link href="/authen?mode=register" className="cta-btn inline-block bg-white text-black text-[12px] font-semibold px-6 py-3 rounded-[7px] hover:bg-white/85 transition-colors tracking-tight">
              Get Started Free →
            </Link>
          </div>
          <div className={`space-y-4 reveal-right ${valueSection.inView ? 'visible' : ''}`} style={{transitionDelay: '0.1s'}}>
            {[
              { label: "Institutional Grade Security",   sub: "Bank-level encryption for all your data" },
              { label: "End-to-End Encryption",          sub: "Your portfolio data stays private" },
              { label: "Real-Time Simulation Engine",    sub: "Sub-second backtesting on any device" },
              { label: "Global Market Access",           sub: "30+ markets, 187K+ securities" },
            ].map((f, i) => (
              <div key={f.label} className="feature-row flex items-start gap-4 p-4 rounded-[10px] border border-white/6 transition-colors">
                <div className="w-2 h-2 rounded-full bg-[#00E87A] mt-1.5 shrink-0 green-dot-pulse"/>
                <div>
                  <p className="text-[13px] font-medium text-white/90 mb-0.5">{f.label}</p>
                  <p className="text-[12px] text-white/50 font-light">{f.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TOOLS — white bg ── */}
      <section className="max-w-6xl mx-auto px-6 xl:px-0 py-24" ref={toolsSection.ref}>
        <div className={`reveal ${toolsSection.inView ? 'visible' : ''}`}>
          <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-black/30 mb-4">Most Popular</p>
          <h2 className="text-[clamp(26px,3.5vw,44px)] font-semibold tracking-tight leading-tight mb-14">
            Understand your<br/>portfolio better
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-black/6 border border-black/6 rounded-xl overflow-hidden">
          {TOOLS.map((group, gi) => (
            <div key={group.category} className={`tool-card bg-white p-7 reveal stagger-${gi+1} ${toolsSection.inView ? 'visible' : ''}`}>
              <p className="text-[9px] font-black tracking-[0.22em] uppercase text-[#00E87A] mb-5 pb-3 border-b border-black/6">
                {group.category}
              </p>
              <div className="space-y-3">
                {group.items.map(item => (
                  <a key={item} href="#" className="block text-[13px] text-black/55 hover:text-black transition-colors font-light">
                    {item}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-7 text-center">
          <a href="#" className="text-[11px] font-bold tracking-[0.18em] uppercase text-black/30 hover:text-black transition-colors inline-flex items-center gap-2 group">
            See all Analytics Tools
            <span className="transition-transform group-hover:translate-x-1 inline-block">→</span>
          </a>
        </div>
      </section>

      {/* ── CTA — green (10%) ── */}
      <section className="bg-black py-24 px-6 text-center" ref={ctaSection.ref}>
        <div className={`reveal ${ctaSection.inView ? 'visible' : ''}`}>
          <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-white/90 mb-5">Join the Outperformance</p>
          <h2 className="text-[clamp(30px,4.5vw,58px)] font-semibold tracking-tight leading-tight mb-5 text-white">
            Ready to invest<br/>
            <span className="italic font-light">without the risk?</span>
          </h2>
          <p className="text-[15px] text-white/75 font-light max-w-sm mx-auto mb-10 leading-relaxed">
            Join thousands of traders who simulate before they commit.
          </p>
          <Link href="/authen?mode=register" className="cta-btn inline-block bg-blue-600 text-white text-[13px] font-semibold px-10 py-4 rounded-[7px] hover:bg-blue-800 transition-colors">
            Get Started Free →
          </Link>
        </div>
      </section>


      {/* ── FOOTER — full ── */}
      <footer className="bg-white border-t border-black/6">

        {/* Top links grid */}
        <div className="max-w-6xl mx-auto px-6 xl:px-0 pt-16 pb-12 grid grid-cols-2 md:grid-cols-5 gap-10">
                        
          {/* Brand col */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-5">
              <img src="picture/logo_dark.png" alt="Logo" className="w-10 h-10" />
              <span className="text-[13px] font-medium tracking-tight">Portfolio Visualizer</span>
            </Link>
            <p className="text-[12px] text-black/55 font-light leading-relaxed mb-5">
              Sophisticated portfolio analytics for modern investors.
            </p>
            <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-black/40">
              Portviz Pro V2.4 • 2026
            </p>
          </div>

          {/* Link cols */}
          {Object.entries(FOOTER_LINKS).map(([group, links]) => (
            <div key={group}>
              <p className="text-[10px] font-black tracking-[0.2em] uppercase text-black/40 mb-5">{group}</p>
              <ul className="space-y-2.5">
                {links.map(l => (
                  <li key={l}>
                    <a href="#" className="text-[13px] text-black/40 hover:text-black transition-colors font-light">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-black/6"/>

        {/* Bottom bar */}
        <div className="max-w-6xl mx-auto px-6 xl:px-0 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-black/40 font-light">
            © 2026 SRL Global. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {/* Social icons */}
            {[
              { label: "X", path: "M4 4l12 12M16 4L4 16" },
              { label: "GitHub", path: "M10 2C5.58 2 2 5.58 2 10c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38v-1.33c-2.22.48-2.69-1.07-2.69-1.07-.36-.92-.88-1.17-.88-1.17-.72-.49.05-.48.05-.48.8.06 1.22.82 1.22.82.71 1.21 1.87.86 2.33.66.07-.52.28-.86.5-1.06-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.42 7.42 0 012 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48v2.19c0 .21.15.46.55.38C15.71 16.53 18 13.54 18 10c0-4.42-3.58-8-8-8z" },
              { label: "LinkedIn", path: "M4 6h2v8H4V6zm1-3a1 1 0 110 2 1 1 0 010-2zm3 3h1.9v1.1h.03C10.4 6.6 11.4 6 12.5 6 14.8 6 15 7.5 15 9.5V14h-2v-4c0-.8 0-1.8-1.1-1.8-1.1 0-1.3.9-1.3 1.8V14H8V6z" },
            ].map(s => (
              <a key={s.label} href="#" className="text-black/35 hover:text-black transition-colors" aria-label={s.label}>
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d={s.path}/>
                </svg>
              </a>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="live-dot w-1.5 h-1.5 rounded-full bg-[#00E87A] inline-block"/>
            <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-black/40">All systems operational</span>
          </div>
        </div>
      </footer>
    </div>
  );
}