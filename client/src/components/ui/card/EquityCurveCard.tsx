"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface EquityCurveProps {
  data: any[];
  timeframe: string;
  onTimeframeChange: (tf: string) => void;
}

const EquityCurveCard = ({
  data,
  timeframe,
  onTimeframeChange,
}: EquityCurveProps) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Equity Curve</h3>
          <p className="text-xs text-slate-400 font-medium tracking-tight">
            กราฟแสดงการเติบโตของเงินทุนรวมย้อนหลัง
          </p>
        </div>

        {/* Timeframe Selector */}
        <div className="flex bg-slate-50 p-1 rounded-lg border border-slate-100 shadow-inner">
          {["1W", "1M", "YTD", "1Y"].map((tf) => (
            <button
              key={tf}
              onClick={() => onTimeframeChange(tf)}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all duration-200 ${
                timeframe === tf
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div className="h-75 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <Tooltip
              formatter={(value: any, name: string | number | undefined) => {
                const labelName = String(name);

                if (labelName === "value") {
                  return [
                    `฿${Number(value).toLocaleString()}`,
                    "Portfolio Value",
                  ];
                }
                if (labelName === "drawdown") {
                  return [`${Number(value).toFixed(2)}%`, "Drawdown"];
                }

                return [value, labelName];
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#2563eb"
              strokeWidth={3}
              dot={false}
            />
            
            <Line
              type="monotone"
              dataKey="drawdown"
              stroke="#f43f5e"
              strokeWidth={1}
              strokeDasharray="5 5"
              dot={false}
              opacity={0.5}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EquityCurveCard;
