"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Edit3, Save, Loader2 } from "lucide-react";

interface AssetAllocationProps {
  data: any[];
  isLoading: boolean;
  portName?: string;
}

const COLORS = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444"];

const AssetAllocationChart = ({
  data,
  isLoading,
  portName,
}: AssetAllocationProps) => {
  return (
    <div className="bg-white text-slate-900 p-8 rounded-xl shadow-sm border border-slate-100 h-full min-h-112.5">
      {/*Header */}
      <h2 className="text-2xl font-bold text-blue-700 mb-8">
        {portName || "Portfolio"}
      </h2>

      <div className="flex-1">
        {isLoading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-3">
            <Loader2 className="animate-spin text-blue-600" size={32} />
            <p className="text-sm text-slate-400 font-medium lowercase italic">Loading Data...</p>
          </div>
        ) : data.length > 0 ? (
          <div className="flex flex-col lg:flex-row gap-12 items-start">
            {/* Table */}
            <div className="flex-1 w-full lg:w-1/2 flex flex-col justify-between">
              <table className="w-full text-left border-collapse mb-8">
                <thead>
                  <tr className="border-b-2 border-slate-100">
                    <th className="py-2 font-bold text-slate-500 text-sm">
                      Asset Class
                    </th>
                    <th className="py-2 font-bold text-slate-500 text-right text-sm">
                      Allocation
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((asset) => (
                    <tr
                      key={asset.symbol}
                      className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
                    >
                      <td className="py-3 text-sm text-slate-600 font-medium">
                        {asset.symbol}
                      </td>
                      <td className="py-3 text-sm text-slate-700 text-right font-semibold">
                        {Number(asset.weight).toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button className="cursor-pointer flex items-center gap-2 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-all text-sm font-bold shadow-sm">
                  <Edit3 size={16} /> Edit Portfolio
                </button>
                {/* <button className="cursor-pointer flex items-center gap-2 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-all text-sm font-bold shadow-sm">
                  <Save size={16} /> Save Portfolio
                </button> */}
              </div>
            </div>

            {/* Donut Chart */}
            <div className="flex-1 w-full lg:w-1/2 flex flex-col items-center">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                      dataKey="weight"
                      nameKey="symbol"
                      stroke="#fff"
                      strokeWidth={2}
                      label={({
                        cx = 0,
                        cy = 0,
                        midAngle = 0,
                        innerRadius = 0,
                        outerRadius = 0,
                        percent = 0,
                      }: any) => {
                        const RADIAN = Math.PI / 180;
                        const radius =
                          innerRadius + (outerRadius - innerRadius) * 0.5;
                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                        const y = cy + radius * Math.sin(-midAngle * RADIAN);
                        return (
                          <text
                            x={x}
                            y={y}
                            fill="white"
                            textAnchor="middle"
                            dominantBaseline="central"
                            className="text-[10px] font-black"
                          >
                            {`${(percent * 100).toFixed(1)}%`}
                          </text>
                        );
                      }}
                      labelLine={false}
                    >
                      {data.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend ใต้กราฟ */}
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 mt-6 px-4">
                {data.map((asset, index) => (
                  <div key={asset.symbol} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full shadow-sm"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-xs text-slate-600 font-semibold">
                      {asset.symbol}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-slate-400 italic border-2 border-dashed border-slate-100 rounded-xl">
            No portfolio data available
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetAllocationChart;