"use client";

import React from "react";
import { Globe, Heart } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full py-6 px-8 border-t border-zinc-800 bg-black mt-auto">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Branding & Copyright */}
        <div className="flex flex-col items-center md:items-start gap-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-black tracking-tighter text-zinc-100 uppercase">
              SmartPort
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-zinc-800 text-zinc-400 font-bold uppercase">
              Beta
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 font-medium">
            © {currentYear} SmartPort Simulation. All rights reserved.
          </p>
        </div>

        {/* Attribution */}
        <div className="flex items-center gap-1 text-[11px] text-zinc-600">
          <span>Built for</span>
          <span className="text-zinc-400 font-bold">Quantitative Investors</span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-6">
          <a 
            href="#" 
            className="text-zinc-500 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold"
          >
            <Globe size={14} />
            <span>Market Data</span>
          </a>
        </div>

      </div>
    </footer>
  );
};

export default Footer;