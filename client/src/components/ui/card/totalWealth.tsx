"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Wallet, ChevronDown, Loader2, AlertCircle } from "lucide-react";
import AssetAllocationChart from "@/src/components/ui/card/AssetAllocationChart";
import PortfolioDashboard from "@/src/components/ui/card/PerformanceDashboard";

interface BacktestReport {
  dates: string[];
  equityCurve: number[];
  metrics?: {
    cagr: number;
    sharpeRatio: number;
    maxDrawdown: number;
  };
}

interface Portfolio {
  id: number;
  port_name: string;
  cashBalance: string | number;
}

const TotalWealthChart = () => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [selectedPortId, setSelectedPortId] = useState<number | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [report, setReport] = useState<BacktestReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [allocationData, setAllocationData] = useState<any[]>([]);
  const [isAllocLoading, setIsAllocLoading] = useState(false);

  useEffect(() => {
    const fetchPortfolios = async () => {
      try {
        const token =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;

        const res = await axios.get("http://localhost:7000/portfolio/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = res.data?.portfolio || res.data;
        console.log("data : ", data);
        if (Array.isArray(data) && data.length > 0) {
          setPortfolios(data);
          setSelectedPortId(data[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch portfolios:", err);
        setError("ไม่สามารถดึงรายชื่อพอร์ตโฟลิโอได้");
      }
    };
    fetchPortfolios();
  }, []);

  useEffect(() => {
    if (!selectedPortId) return;

    const fetchBacktestData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const end = new Date().toISOString().split("T")[0];
        const start = new Date(
          new Date().setFullYear(new Date().getFullYear() - 1),
        )
          .toISOString()
          .split("T")[0];

        const response = await axios.get(
          `http://localhost:7000/backtest/report/${selectedPortId}?start=${start}&end=${end}&initialCapital=100000`,
        );

        if (response.data.success) {
          setReport(response.data.data);
        }
      } catch (err: any) {
        console.error("Failed to fetch backtest report:", err);
        setError(
          err.response?.data?.error || "เกิดข้อผิดพลาดในการดึงข้อมูลพอร์ต",
        );
        setReport(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBacktestData();
  }, [selectedPortId]);

  useEffect(() => {
    const activePort = portfolios.find((p) => p.id === selectedPortId);

    if (!activePort?.port_name) return;
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const fetchAllocation = async () => {
      try {
        setIsAllocLoading(true);
        const res = await axios.get(
          `http://localhost:7000/portfolio/inform/${encodeURIComponent(activePort.port_name)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const rawData = res.data.data || [];
        const formattedData = rawData.map((item: any) => ({
          symbol: item.asset?.symbol || "Unknown",
          weight: parseFloat(item.weight) * 100,
        }));

        setAllocationData(formattedData);
      } catch (err) {
        console.error("Failed to fetch allocation:", err);
        setAllocationData([]);
      } finally {
        setIsAllocLoading(false);
      }
    };

    fetchAllocation();
  }, [selectedPortId, portfolios]);

  const activePortfolio = portfolios.find((p) => p.id === selectedPortId);

  return (
    <div className="bg-white text-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col gap-6 relative">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Title Section */}
        <div className="flex items-center gap-2 text-slate-500">
          <Wallet size={20} className="text-blue-600" />
          <h2 className="font-semibold tracking-tight text-slate-800">
            Total Wealth (Backtest)
          </h2>
        </div>

        {portfolios.length > 0 && (
          <div className="relative">
            {/* Dropdown Button */}
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="cursor-pointer flex items-center gap-2 bg-slate-50 hover:bg-slate-100 px-4 py-2 rounded-lg text-sm font-bold transition-all border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {activePortfolio?.port_name || "กำลังโหลด..."}
              <ChevronDown
                size={16}
                className={`transition-transform duration-200 text-slate-400 ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isDropdownOpen && (
              <>
                {/* Overlay */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsDropdownOpen(false)}
                ></div>

                {/* Dropdown Menu */}
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl z-50 overflow-hidden border border-slate-100 py-1 ring-1 ring-black/5">
                  <div className="px-4 py-2 border-b border-slate-50 mb-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Select Portfolio
                    </p>
                  </div>
                  {portfolios.map((port) => (
                    <button
                      key={port.id}
                      onClick={() => {
                        setSelectedPortId(port.id);
                        setIsDropdownOpen(false);
                      }}
                      className={`cursor-pointer w-full text-left px-4 py-2.5 text-sm font-semibold transition-colors
                      ${
                        port.id === selectedPortId
                          ? "bg-blue-50 text-blue-700 border-r-4 border-blue-600"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }
                    `}
                    >
                      {port.port_name}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-87.5 text-slate-400 gap-3">
          <Loader2 className="animate-spin text-emerald-500" size={32} />
          <p className="font-semibold tracking-widest uppercase text-xs">
            Simulating Portfolio...
          </p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-87.5 text-rose-400 bg-slate-800/50 rounded-lg border border-rose-500/20">
          <AlertCircle size={40} className="mb-2 opacity-50" />
          <p className="font-semibold">{error}</p>
        </div>
      ) : report &&
        Array.isArray(report.dates) &&
        Array.isArray(report.equityCurve) ? (
        <>
          <div className="flex items-start justify-between animate-in fade-in duration-500">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold">
                ฿
                {report.equityCurve[
                  report.equityCurve.length - 1
                ].toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </h1>
            </div>

            {report.metrics && (
              <div className="hidden sm:flex gap-4">
                <div className="bg-slate-800 px-4 py-2 rounded-lg text-center border border-slate-700/50">
                  <p className="text-xs text-slate-300 mb-1">Sharpe</p>
                  <p className="font-semibold text-emerald-400">
                    {report.metrics.sharpeRatio.toFixed(2)}
                  </p>
                </div>
                <div className="bg-slate-800 px-4 py-2 rounded-lg text-center border border-slate-700/50">
                  <p className="text-xs text-slate-300 mb-1">Max DD</p>
                  <p className="font-semibold text-rose-400">
                    {report.metrics.maxDrawdown.toFixed(2)}%
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="h-62.5 sm:h-70 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={report.dates.map((date, index) => ({
                  date: new Date(date).toLocaleDateString("th-TH", {
                    month: "short",
                    year: "2-digit",
                  }),
                  value: report.equityCurve[index],
                }))}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#334155"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  stroke="#94a3b8"
                  fontSize={12}
                  tickMargin={10}
                  minTickGap={30}
                />
                <YAxis
                  domain={["auto", "auto"]}
                  stroke="#94a3b8"
                  fontSize={12}
                  tickFormatter={(val) => `฿${(val / 1000).toFixed(0)}k`}
                  width={60}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                  itemStyle={{ color: "#34d399", fontWeight: "semibold" }}
                  formatter={(value: any) => {
                    const numValue =
                      typeof value === "number" ? value : Number(value) || 0;
                    return [
                      `฿${numValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
                      "Portfolio Value",
                    ];
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={
                    report.equityCurve[report.equityCurve.length - 1] >=
                    report.equityCurve[0]
                      ? "#10b981"
                      : "#f43f5e"
                  }
                  strokeWidth={3}
                  dot={false}
                  activeDot={{
                    r: 6,
                    fill: "#10b981",
                    stroke: "#0f172a",
                    strokeWidth: 2,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="lg:col-span-1 flex flex-col gap-6 items-stretch">
            <AssetAllocationChart
              data={allocationData}
              isLoading={isAllocLoading}
              portName={activePortfolio?.port_name}
            />

            <div className="flex-1">
              <PortfolioDashboard portfolioId={activePortfolio?.id!} />
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default TotalWealthChart;
