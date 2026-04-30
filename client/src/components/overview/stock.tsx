"use client";

import React from "react";
import { Play, Code2 } from "lucide-react";

interface SimulationEditorProps {
  hftCode: string;
  setHftCode: (code: string) => void;
}

export const SimulationEditor: React.FC<SimulationEditorProps> = ({
  hftCode,
  setHftCode,
}) => {
  const lineCount = hftCode.split("\n").length;
  const lines = Array.from(
    { length: Math.max(lineCount, 13) },
    (_, i) => i + 1,
  );

  return (
    <div className="bg-white rounded-[10px] border border-slate-200 p-6 lg:p-8 shadow-sm flex flex-col flex-1 min-h-100">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-slate-100 rounded-lg text-black border border-slate-200">
            <Code2 size={22} />
          </div>
          <div>
            <h3 className="text-xl font-medium text-slate-800 leading-none">
              Stock Simulation
            </h3>
            <p className="text-[12px] font-regular text-slate-400 uppercase mt-1">
              การจำลองการซื้อขายหุ้น (HFT Script)
            </p>
          </div>
        </div>

        <button
          onClick={() => console.log("Executing:", hftCode)} // สามารถใส่ฟังก์ชันรันจริงได้ที่นี่
          className="cursor-pointer w-full sm:w-auto bg-black text-white px-8 py-3 rounded-[10px] text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-xl active:scale-95"
        >
          <Play size={16} fill="white" /> Execute Script
        </button>
      </div>

      {/* Editor Section */}
      <div className="relative flex-1 bg-white rounded-[10px] border border-slate-200 p-6 flex gap-4 overflow-hidden shadow-inner group hover:border-black transition-colors duration-500">
        {/* Line Numbers - เลื่อนตาม textarea */}
        <div className="text-slate-300 text-right select-none font-mono text-xs w-6 border-r border-slate-100 pr-4 h-full leading-6 overflow-hidden">
          {lines.map((num) => (
            <div key={num}>{num}</div>
          ))}
        </div>

        {/* Code Input */}
        <textarea
          value={hftCode}
          onChange={(e) => setHftCode(e.target.value)}
          spellCheck="false"
          placeholder="// เขียนสคริปต์การซื้อขายที่นี่..."
          className="flex-1 bg-transparent border-none outline-none font-mono text-[13px] text-slate-700 leading-6 resize-none custom-scrollbar italic font-medium min-h-full"
        />
      </div>

      {/* Footer Hint */}
      <div className="mt-3 flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
        <span>Language: JavaScript / HFT Engine</span>
        <span>Lines: {lineCount}</span>
      </div>
    </div>
  );
};
