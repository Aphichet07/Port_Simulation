"use client";

import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  Plus,
  Loader2,
  BarChart2,
  Activity,
  Briefcase,
  ChevronRight,
  Info,
  Layout,
  TrendingDown,
  Trash2,
  Target,
  CalendarDays,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ScatterChart,
  Scatter,
  ZAxis,
  Legend,
} from "recharts";

import { AppHeader } from "../overview/header";
import BonkChatWidget from "../ui/bonk";
import AssetForm from "@/src/components/ui/createPort";
import DeleteConfirmModal from "../ui/DeleteConfirmModal";
import AssetAllocationChart from "@/src/components/ui/card/AssetAllocationChart";

export const Myport = () => {
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [selectedPortId, setSelectedPortId] = useState<number | null>(null);

  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [portfolioToDelete, setPortfolioToDelete] = useState<any | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "detail">("list");

  const [allocationData, setAllocationData] = useState<any[]>([]);
  const [isAllocLoading, setIsAllocLoading] = useState(false);

  const fetchPortfolios = async () => {
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) return;
      const res = await axios.get("http://localhost:7000/portfolio/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data?.portfolio || res.data;
      if (Array.isArray(data)) setPortfolios(data);
    } catch (err) {
      console.error("Failed to fetch portfolios:", err);
    }
  };

  const fetchPortfolioAllocation = async (portId: number) => {
    const activePort = portfolios.find((p) => p.id === portId);
    if (!activePort?.port_name) return;

    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return;

    try {
      setIsAllocLoading(true);
      const res = await axios.get(
        `http://localhost:7000/portfolio/inform/${encodeURIComponent(activePort.port_name)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const rawData = res.data?.data || [];
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

  useEffect(() => {
    fetchPortfolios();
  }, []);

  const confirmDelete = async () => {
    if (!portfolioToDelete) return;

    const API_URL = "http://localhost:7000";
    const endpoint = `${API_URL}/portfolio/${portfolioToDelete.id}`;
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (!token) return;

    try {
      await axios.delete(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (selectedPortId === portfolioToDelete.id) {
        setSelectedPortId(null);
        setAnalytics(null);
      }

      await fetchPortfolios();
    } catch (error: any) {
      console.error("Delete Error:", error);
      alert(`ลบพอร์ตไม่สำเร็จ`);
    } finally {
      setPortfolioToDelete(null);
    }
  };

  const handleDeepAnalyze = async (id: number) => {
    setSelectedPortId(id);
    setMobileView("detail");
    fetchPortfolioAllocation(id);
    try {
      setIsLoadingAnalytics(true);
      const end = new Date().toISOString().split("T")[0];
      const res = await axios.get(
        `http://localhost:7000/backtest/report/${id}?start=2020-01-01&end=${end}&initialCapital=10000`,
      );
      if (res.data?.success) {
        setAnalytics(res.data.data);
      } else {
        setAnalytics(null);
      }
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
      setAnalytics(null);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  const activePortfolio = portfolios.find((p) => p.id === selectedPortId);

  const metrics = analytics?.metrics;
  const charts = analytics?.charts;

  const timeSeriesData = useMemo(() => {
    if (!charts?.equity) return [];
    return charts.equity.dates.map((date: string, index: number) => ({
      date,
      equity: charts.equity.portfolio[index],
      benchmark: charts.equity.benchmark?.[index] || null,
      drawdown: charts.underwater.drawdowns[index] * 100,
    }));
  }, [charts]);

  const scatterData = useMemo(() => {
    if (!charts?.scatterPlot) return [];
    return charts.scatterPlot.map((d: any) => ({
      name: d.name,
      cagr: d.cagr * 100,
      volatility: d.volatility * 100,
    }));
  }, [charts]);

  const heatmapByYear = useMemo(() => {
    if (!charts?.monthlyHeatmap) return {};
    const grouped: Record<number, (any | null)[]> = {};

    charts.monthlyHeatmap.forEach((item: any) => {
      if (!grouped[item.year]) grouped[item.year] = Array(12).fill(null);
      grouped[item.year][item.month - 1] = item;
    });
    return grouped;
  }, [charts]);

  const performanceGroups = metrics
    ? [
      {
        category: "Return Metrics (ผลตอบแทน)",
        data: [
          {
            label: "Total Return",
            value: `${(metrics.totalReturn * 100).toFixed(2)}%`,
            showInfo: false,
          },
          {
            label: "Annualized Return",
            value: `${(metrics.annualizedReturn * 100).toFixed(2)}%`,
            showInfo: true,
          },
          {
            label: "CAGR",
            value: `${(metrics.cagr * 100).toFixed(2)}%`,
            showInfo: true,
          },
          {
            label: "Monthly Geometric Mean",
            value: `${(metrics.geometricMeanMonthly * 100).toFixed(2)}%`,
            showInfo: false,
          },
        ],
      },
      {
        category: "Risk & Drawdown (ความเสี่ยง)",
        data: [
          {
            label: "Annualized Volatility",
            value: `${(metrics.annualizedVolatility * 100).toFixed(2)}%`,
            showInfo: false,
          },
          {
            label: "Max Drawdown",
            value: `${(metrics.maxDrawdown * 100).toFixed(2)}%`,
            showInfo: true,
          },
          {
            label: "Drawdown Duration",
            value: `${metrics.drawdownDuration} Days`,
            showInfo: false,
          },
          {
            label: "Historical VaR (5%)",
            value: `${(metrics.historicalVaR5 * 100).toFixed(2)}%`,
            showInfo: true,
          },
          {
            label: "Conditional VaR (5%)",
            value: `${(metrics.conditionalVaR5 * 100).toFixed(2)}%`,
            showInfo: true,
          },
        ],
      },
      {
        category: "Advanced Ratios (อัตราส่วนปรับด้วยความเสี่ยง)",
        data: [
          {
            label: "Sharpe Ratio",
            value: metrics.sharpeRatio?.toFixed(4),
            showInfo: true,
          },
          {
            label: "Sortino Ratio",
            value: metrics.sortinoRatio?.toFixed(4),
            showInfo: true,
          },
          {
            label: "Calmar Ratio",
            value: metrics.calmarRatio?.toFixed(4),
            showInfo: true,
          },
          {
            label: "Omega Ratio",
            value: metrics.omegaRatio?.toFixed(4),
            showInfo: true,
          },
          {
            label: "Tail Ratio",
            value: metrics.tailRatio?.toFixed(4),
            showInfo: true,
          },
        ],
      },
      {
        category: "Market Relative (เทียบตลาด)",
        data: [
          {
            label: "Alpha (Annualized)",
            value: `${(metrics.alphaAnnualized * 100).toFixed(2)}%`,
            showInfo: true,
          },
          { label: "Beta", value: metrics.beta?.toFixed(4), showInfo: true },
          {
            label: "Tracking Error",
            value: `${(metrics.trackingError * 100).toFixed(2)}%`,
            showInfo: true,
          },
          {
            label: "Information Ratio",
            value: metrics.informationRatio?.toFixed(4),
            showInfo: true,
          },
          {
            label: "R-Squared",
            value: metrics.rSquared?.toFixed(4),
            showInfo: false,
          },
        ],
      },
      {
        category: "Trade Statistics (สถิติพอร์ต)",
        data: [
          {
            label: "Win Rate",
            value: `${(metrics.winRate * 100).toFixed(2)}%`,
            showInfo: false,
          },
          {
            label: "Profit Factor",
            value: metrics.profitFactor?.toFixed(4),
            showInfo: false,
          },
          {
            label: "Expectancy",
            value: metrics.expectancy?.toFixed(6),
            showInfo: true,
          },
          {
            label: "Safe Withdrawal Rate",
            value: `${(metrics.safeWithdrawalRate * 100).toFixed(2)}%`,
            showInfo: true,
          },
        ],
      },
    ]
    : [];

  return (
    <div className="h-screen bg-black text-white font-sans flex flex-col overflow-hidden">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@100..900&family=Work+Sans:wght@100..900&display=swap');
        * { font-family: 'Work Sans', 'Noto Sans Thai' !important; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `,
        }}
      />

      <AppHeader />

      <div className="flex-1 overflow-hidden px-4 sm:px-8 pb-8">
        <div className="w-full h-full bg-white rounded-[10px] shadow-[0_40px_100px_rgba(0,0,0,0.5)] flex overflow-hidden gap-4 p-4 md:p-6">

          {/* ========================================== */}
          {/* LEFT SIDE: Portfolio List */}
          {/* ========================================== */}
          <aside className={`w-full md:w-80 lg:w-96 flex-col bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 shrink-0 ${mobileView === "detail" ? "hidden md:flex" : "flex"}`}>
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                   My Vault
                </h2>
                <p className="text-xs text-slate-500 mt-1 font-medium uppercase">
                  {portfolios.length} Portfolios
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="cursor-pointer p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-800 transition-colors"
              >
                <Plus size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
              {portfolios.map((port) => (
                <div
                  key={port.id}
                  onClick={() => handleDeepAnalyze(port.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer group ${selectedPortId === port.id
                      ? "border-blue-500 bg-blue-50 shadow-sm"
                      : "border-slate-100 bg-white hover:border-slate-300"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${selectedPortId === port.id
                          ? "bg-blue-500 text-white"
                          : "bg-slate-100 text-slate-400"
                        }`}
                    >
                      <BarChart2 size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-slate-900 truncate">
                        {port.port_name || port.name || "Untitled"}
                      </h3>
                      <p className="text-[10px] text-slate-400 font-medium  tracking-tighter">
                        Backtest Ready
                      </p>
                    </div>
                    {selectedPortId === port.id ? (
                      <Activity
                        size={16}
                        className="text-blue-500 animate-pulse"
                      />
                    ) : (
                      <ChevronRight
                        size={16}
                        className="text-slate-300 group-hover:translate-x-1 transition-transform"
                      />
                    )}
                    <button
                      type="button"
                      className="p-2 cursor-pointer rounded-md hover:bg-red-100 transition-colors focus:outline-none focus:ring-2 focus:ring-red-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPortfolioToDelete(port);
                      }}
                    >
                      <Trash2
                        size={16}
                        className="text-red-500 hover:scale-110 transition-transform"
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* ========================================== */}
          {/* RIGHT SIDE: Analytics Dashboard */}
          {/* ========================================== */}
          <main className={`flex-1 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex-col min-w-0 ${mobileView === "list" ? "hidden md:flex" : "flex"}`}>
            {!selectedPortId ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <Layout size={40} className="text-slate-200" />
                </div>
                <p className="font-medium">
                  Select a portfolio to view deep analytics
                </p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => setMobileView("list")}
                      className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors shrink-0"
                    >
                      <ChevronRight size={16} className="text-slate-600 rotate-180" />
                    </button>
                    <div className="min-w-0">
                      <h1 className="text-xl font-bold text-slate-900 tracking-tight truncate">
                        {activePortfolio?.port_name ||
                          activePortfolio?.name ||
                          "Portfolio Performance"}
                      </h1>
                      <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        Institutional Quant Report
                      </span>
                    </div>
                  </div>
                  {isLoadingAnalytics && (
                    <Loader2 className="animate-spin text-blue-500" size={24} />
                  )}
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-slate-50/30">
                  {isLoadingAnalytics ? (
                    <div className="h-full flex flex-col items-center justify-center space-y-4">
                      <Loader2
                        className="animate-spin text-slate-200"
                        size={48}
                      />
                      <p className="text-slate-400 animate-pulse text-sm font-bold uppercase">
                        Running Quant Models...
                      </p>
                    </div>
                  ) : metrics && charts ? (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                      {/* Asset Allocation Chart  */}
                      <AssetAllocationChart
                        data={allocationData}
                        isLoading={isAllocLoading}
                        portName={
                          activePortfolio?.port_name || activePortfolio?.name
                        }
                      />

                      <div className="flex flex-col gap-6">
                        {/* Equity Curve Chart */}
                        <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-sm flex flex-col h-112.5">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                              <Activity size={16} className="text-blue-500" />
                              Equity Curve vs Benchmark
                            </h3>
                          </div>
                          <div className="flex-1 w-full min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={timeSeriesData}>
                                <CartesianGrid
                                  strokeDasharray="3 3"
                                  vertical={false}
                                  stroke="#f1f5f9"
                                />
                                <XAxis
                                  dataKey="date"
                                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                                  tickLine={false}
                                  axisLine={false}
                                  minTickGap={30}
                                />
                                <YAxis
                                  domain={["auto", "auto"]}
                                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                                  tickLine={false}
                                  axisLine={false}
                                  tickFormatter={(val) =>
                                    `$${val.toLocaleString()}`
                                  }
                                  width={60}
                                />
                                <Tooltip
                                  contentStyle={{
                                    borderRadius: "8px",
                                    border: "1px solid #e2e8f0",
                                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                                  }}
                                  formatter={(value: any, name: any) => [
                                    `$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                                    name === "equity" ? "Portfolio" : "S&P 500",
                                  ]}
                                  labelStyle={{
                                    color: "#64748b",
                                    fontWeight: "bold",
                                    marginBottom: "4px",
                                  }}
                                />
                                <Legend
                                  iconType="circle"
                                  wrapperStyle={{ fontSize: "12px" }}
                                />
                                {charts.equity.benchmark && (
                                  <Line
                                    type="monotone"
                                    name="S&P 500"
                                    dataKey="benchmark"
                                    stroke="#cbd5e1"
                                    strokeWidth={2}
                                    dot={false}
                                    activeDot={false}
                                  />
                                )}
                                <Line
                                  type="monotone"
                                  name="Portfolio"
                                  dataKey="equity"
                                  stroke="#3b82f6"
                                  strokeWidth={2}
                                  dot={false}
                                  activeDot={{ r: 4, strokeWidth: 0 }}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        {/* Underwater Curve (Drawdown) */}
                        <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-sm flex flex-col h-112.5">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                              <TrendingDown size={16} className="text-rose-500" />
                              Underwater Curve (Drawdown)
                            </h3>
                          </div>
                          <div className="flex-1 w-full min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={timeSeriesData}>
                                <defs>
                                  <linearGradient
                                    id="colorDrawdown"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                  >
                                    <stop
                                      offset="5%"
                                      stopColor="#f43f5e"
                                      stopOpacity={0.3}
                                    />
                                    <stop
                                      offset="95%"
                                      stopColor="#f43f5e"
                                      stopOpacity={0}
                                    />
                                  </linearGradient>
                                </defs>
                                <CartesianGrid
                                  strokeDasharray="3 3"
                                  vertical={false}
                                  stroke="#f1f5f9"
                                />
                                <XAxis
                                  dataKey="date"
                                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                                  tickLine={false}
                                  axisLine={false}
                                  minTickGap={30}
                                />
                                <YAxis
                                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                                  tickLine={false}
                                  axisLine={false}
                                  tickFormatter={(val) => `${val}%`}
                                  width={40}
                                />
                                <Tooltip
                                  contentStyle={{
                                    borderRadius: "8px",
                                    border: "1px solid #e2e8f0",
                                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                                  }}
                                  formatter={(value: any, name: any) => [
                                    `${Number(value).toFixed(2)}%`,
                                    "Drawdown",
                                  ]}
                                  labelStyle={{
                                    color: "#64748b",
                                    fontWeight: "bold",
                                    marginBottom: "4px",
                                  }}
                                />
                                <Area
                                  type="monotone"
                                  dataKey="drawdown"
                                  stroke="#f43f5e"
                                  fillOpacity={1}
                                  fill="url(#colorDrawdown)"
                                />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        {/*Scatter Plot (Risk vs Return) */}
                        <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-sm flex flex-col h-112.5">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                              <Target size={16} className="text-indigo-500" />
                              Risk vs Return
                            </h3>
                          </div>
                          <div className="flex-1 w-full min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                              <ScatterChart
                                margin={{
                                  top: 10,
                                  right: 20,
                                  bottom: 10,
                                  left: 0,
                                }}
                              >
                                <CartesianGrid
                                  strokeDasharray="3 3"
                                  stroke="#f1f5f9"
                                />
                                <XAxis
                                  type="number"
                                  dataKey="volatility"
                                  name="Volatility"
                                  unit="%"
                                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                                  tickLine={false}
                                  axisLine={false}
                                />
                                <YAxis
                                  type="number"
                                  dataKey="cagr"
                                  name="Return (CAGR)"
                                  unit="%"
                                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                                  tickLine={false}
                                  axisLine={false}
                                  width={40}
                                />
                                <ZAxis
                                  type="category"
                                  dataKey="name"
                                  name="Asset"
                                />
                                <Tooltip
                                  cursor={{ strokeDasharray: "3 3" }}
                                  contentStyle={{
                                    borderRadius: "8px",
                                    border: "1px solid #e2e8f0",
                                    fontSize: "12px",
                                  }}
                                  formatter={(value: any, name: any) => [
                                    `${Number(value).toFixed(2)}%`,
                                    name,
                                  ]}
                                />
                                {scatterData.map((entry: any, index: number) => (
                                  <Scatter
                                    key={index}
                                    name={entry.name}
                                    data={[entry]}
                                    fill={
                                      entry.name === "Portfolio"
                                        ? "#3b82f6"
                                        : "#94a3b8"
                                    }
                                  />
                                ))}
                                <Legend
                                  iconType="circle"
                                  wrapperStyle={{ fontSize: "12px" }}
                                />
                              </ScatterChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        {/* 4. Monthly Returns Heatmap */}
                        <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-sm flex flex-col h-auto">
                          <div className="flex justify-between items-center mb-4 shrink-0">
                            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                              <CalendarDays
                                size={16}
                                className="text-emerald-500"
                              />
                              Monthly Returns (%)
                            </h3>
                          </div>
                          <div className="w-full overflow-x-auto">
                            <table className="min-w-full text-center text-xs border-collapse">
                              <thead>
                                <tr className="text-slate-400 border-b border-slate-100">
                                  <th className="py-2 pr-2 text-left font-medium sticky left-0 bg-white z-10 min-w-10">
                                    Year
                                  </th>
                                  {[
                                    "Jan",
                                    "Feb",
                                    "Mar",
                                    "Apr",
                                    "May",
                                    "Jun",
                                    "Jul",
                                    "Aug",
                                    "Sep",
                                    "Oct",
                                    "Nov",
                                    "Dec",
                                  ].map((m) => (
                                    <th key={m} className="py-2 font-medium min-w-11">
                                      {m}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {Object.keys(heatmapByYear)
                                  .sort()
                                  .reverse()
                                  .map((year) => (
                                    <tr
                                      key={year}
                                      className="border-b border-slate-50"
                                    >
                                      <td className="py-3 pr-2 text-left font-bold text-slate-600 sticky left-0 bg-white z-10">
                                        {year}
                                      </td>
                                      {heatmapByYear[Number(year)].map(
                                        (data, idx) => {
                                          if (!data)
                                            return (
                                              <td key={idx} className="py-1 px-0.5">
                                                <div className="h-9 min-w-10 rounded bg-slate-50"></div>
                                              </td>
                                            );
                                          const val = data.return * 100;
                                          const isPos = val >= 0;
                                          const opacity =
                                            Math.min(Math.abs(val) / 15, 1) *
                                            0.8 +
                                            0.2;
                                          return (
                                            <td key={idx} className="py-1 px-0.5">
                                              <div
                                                className={`h-9 min-w-10 flex items-center justify-center rounded text-[10px] font-bold ${isPos ? "text-emerald-900" : "text-rose-900"}`}
                                                style={{
                                                  backgroundColor: isPos
                                                    ? `rgba(16, 185, 129, ${opacity})`
                                                    : `rgba(244, 63, 94, ${opacity})`,
                                                }}
                                                title={`${data.label}: ${val.toFixed(2)}%`}
                                              >
                                                {val.toFixed(1)}
                                              </div>
                                            </td>
                                          );
                                        },
                                      )}
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>

                      {/* 📋 Metrics Details Table */}
                      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white mt-6">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-200">
                              <th className="py-3 px-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                Metric
                              </th>
                              <th className="py-3 px-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">
                                Value
                              </th>
                            </tr>
                          </thead>
                          <tbody className="text-sm">
                            {performanceGroups.map((group, gIdx) => (
                              <React.Fragment key={gIdx}>
                                <tr className="bg-slate-50/30">
                                  <td
                                    colSpan={2}
                                    className="py-2 px-6 font-bold text-[10px] text-blue-500 uppercase tracking-widest border-b border-slate-100"
                                  >
                                    {group.category}
                                  </td>
                                </tr>
                                {group.data.map((row, rIdx) => {
                                  const isNeg = row.value
                                    ?.toString()
                                    .includes("-");
                                  return (
                                    <tr
                                      key={rIdx}
                                      className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                                    >
                                      <td className="py-3 px-8 text-slate-600 font-medium">
                                        {row.label}
                                      </td>
                                      <td
                                        className={`py-3 px-6 text-right font-bold ${isNeg ? "text-rose-500" : "text-slate-900"}`}
                                      >
                                        <div className="flex items-center justify-end gap-2">
                                          {row.showInfo && (
                                            <Info
                                              size={14}
                                              className="text-slate-300"
                                            />
                                          )}
                                          {row.value ?? "N/A"}
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </React.Fragment>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-20 text-slate-400">
                      <Activity size={40} className="mx-auto mb-4 opacity-20" />
                      <p>No analytics data available for this range.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      <BonkChatWidget />

      {isCreateModalOpen && (
        <AssetForm
          onClose={() => {
            setIsCreateModalOpen(false);
            fetchPortfolios();
          }}
        />
      )}

      {/* Pop-up ยืนยันการลบ */}
      <DeleteConfirmModal
        isOpen={!!portfolioToDelete}
        onClose={() => setPortfolioToDelete(null)}
        onConfirm={confirmDelete}
        portfolioName={
          portfolioToDelete?.port_name || portfolioToDelete?.name || "Untitled"
        }
      />
    </div>
  );
};

export default Myport;