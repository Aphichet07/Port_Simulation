"use client";
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  RefreshCcw,
  Zap,
  TrendingUp,
  Activity,
  AlertTriangle,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Settings,
  ArrowRightCircle,
} from "lucide-react";
import { AppHeader } from "../overview/header";
import BonkChatWidget from "@/src/components/ui/bonk";

export const SimulateView = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [selectedPortId, setSelectedPortId] = useState<number | null>(null);
  const [topN, setTopN] = useState<number>(3);

  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [optResult, setOptResult] = useState<any>(null);

  const [allocationData, setAllocationData] = useState<any[]>([]);
  const [isAllocLoading, setIsAllocLoading] = useState(false);

  useEffect(() => {
    setIsMounted(true);
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
    fetchPortfolios();
  }, []);

  const fetchPortfolioAllocation = async (portId: number) => {
    const activePort = portfolios.find((p) => p.id === portId);
    if (!activePort?.port_name) return [];

    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return [];

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
        weight: parseFloat(item.weight),
      }));

      setAllocationData(formattedData);
      return formattedData;
    } catch (err) {
      console.error("Failed to fetch allocation:", err);
      setAllocationData([]);
      return [];
    } finally {
      setIsAllocLoading(false);
    }
  };

  const handleOptimize = async () => {
    if (!selectedPortId) return;

    const activePort = portfolios.find((p) => p.id === selectedPortId);
    if (!activePort) return;

    const assets = await fetchPortfolioAllocation(activePort.id);

    if (!assets || assets.length === 0) {
      alert("พอร์ตนี้ไม่มีสินทรัพย์ กรุณาเลือกพอร์ตอื่น");
      return;
    }

    const userPortfolioDict: Record<string, number> = {};
    assets.forEach((item: any) => {
      userPortfolioDict[item.symbol] = item.weight;
    });

    const payload = {
      user_portfolio: userPortfolioDict,
      top_n_recommendations: topN,
    };

    try {
      setIsOptimizing(true);
      setOptResult(null);

      const res = await axios.post("http://127.0.0.1:8000/optimize", payload);

      // 🛠️ ปรับการเข้าถึงข้อมูลตาม JSON Structure ใหม่ (res.data.data)
      if (res.data?.status === "success") {
        setOptResult(res.data.data);
      } else {
        setOptResult(res.data); // เผื่อกรณีไม่ได้ห่อด้วย status
      }
    } catch (err: any) {
      console.error("Optimization Error:", err);
      alert(err.response?.data?.detail || "เกิดข้อผิดพลาดในการ Optimize");
    } finally {
      setIsOptimizing(false);
    }
  };

  const weightChartData = useMemo(() => {
    if (!optResult) return [];
    const orig = optResult.original_portfolio || {};
    const target = optResult.portfolio_optimization?.target_weights_pct || {};

    const allTickers = Array.from(
      new Set([...Object.keys(orig), ...Object.keys(target)]),
    );

    const formattedData = allTickers.map((ticker) => ({
      ticker,
      Original: (orig[ticker] || 0) * 100,
      Target:
        typeof target[ticker] === "number"
          ? target[ticker]
          : parseFloat(target[ticker] || 0),
    }));

    return formattedData.filter((data) => data.Original > 0 || data.Target > 0);
  }, [optResult]);

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans flex flex-col h-screen overflow-hidden selection:bg-blue-500 selection:text-white">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@100..900&family=Work+Sans:ital,wght@0,100..900;1,100..900&display=swap');
        * { font-family: 'Work Sans', 'Noto Sans Thai', sans-serif !important; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `,
        }}
      />

      <AppHeader />

      <div className="flex-1 overflow-hidden px-4 md:px-8 pb-8 pt-4">
        <main className="w-full h-full bg-white rounded-2xl shadow-xl overflow-hidden flex text-slate-900 border border-slate-200">
          {/* LEFT SIDEBAR: CONFIGURATION */}
          <aside className="w-80 border-r border-slate-100 bg-slate-50/50 flex flex-col shrink-0">
            <div className="p-6 border-b border-slate-200 bg-white">
              <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <Zap className="text-amber-500" size={24} /> AI Optimizer
              </h2>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Rebalance & Enhance your portfolio
              </p>
            </div>

            <div className="p-6 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
              {/* Select Portfolio */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Briefcase size={16} /> Select Portfolio
                </label>
                <select
                  className="w-full p-3 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={selectedPortId !== null ? selectedPortId : ""}
                  onChange={(e) => setSelectedPortId(Number(e.target.value))}
                >
                  <option value="" disabled>
                    -- เลือกพอร์ตที่ต้องการปรับสมดุล --
                  </option>
                  {portfolios.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.port_name || p.name || `Portfolio #${p.id}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Set Top N */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Settings size={16} /> Asset Recommendations
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={topN}
                    onChange={(e) => setTopN(Number(e.target.value))}
                    className="flex-1 accent-blue-600"
                  />
                  <span className="w-10 text-center font-bold text-blue-600 bg-blue-50 py-1 rounded-md">
                    {topN}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">
                  จำนวนสินทรัพย์แนะนำที่ระบบจะเสนอเพิ่มเข้ามาในพอร์ต
                </p>
              </div>
            </div>

            {/* Action Button */}
            <div className="p-6 bg-white border-t border-slate-100">
              <button
                onClick={handleOptimize}
                disabled={selectedPortId === null || isOptimizing}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white p-4 rounded-xl font-bold hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {isOptimizing ? (
                  <>
                    <RefreshCcw className="animate-spin" size={18} />{" "}
                    Optimizing...
                  </>
                ) : (
                  <>
                    <Zap size={18} /> Run Optimization
                  </>
                )}
              </button>
            </div>
          </aside>

          {/* RIGHT MAIN: RESULTS DASHBOARD */}
          <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/30 p-6 lg:p-8">
            {!optResult && !isOptimizing && (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                  <Activity size={48} className="text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-600">
                  Ready to Optimize
                </h3>
                <p className="text-sm">
                  เลือกพอร์ตโฟลิโอด้านซ้ายแล้วกดรัน เพื่อหาจุดสมดุลที่ดีที่สุด
                </p>
              </div>
            )}

            {isOptimizing && (
              <div className="h-full flex flex-col items-center justify-center space-y-6">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-slate-100 rounded-full"></div>
                  <div className="w-20 h-20 border-4 border-blue-500 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
                  <Zap
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-amber-500 animate-pulse"
                    size={24}
                  />
                </div>
                <div className="text-center">
                  <p className="font-bold text-slate-700">
                    Genetic Algorithm is evolving...
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    กำลังวิเคราะห์สภาพตลาดและคำนวณสัดส่วนที่คุ้มค่าที่สุด
                  </p>
                </div>
              </div>
            )}

            {optResult && !isOptimizing && (
              <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Market Context Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div
                      className={`p-3 rounded-lg ${optResult.market_context?.regime?.includes("Bull") ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}
                    >
                      <TrendingUp size={24} />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase">
                        Market Regime
                      </p>
                      <p className="text-lg font-black text-slate-800">
                        {optResult.market_context?.regime || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                      <AlertTriangle size={24} />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase">
                        VIX Index (Risk)
                      </p>
                      <p className="text-lg font-black text-slate-800">
                        {optResult.market_context?.vix_index || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                      <CheckCircle2 size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-slate-400 uppercase">
                        Allowed Styles
                      </p>
                      <p
                        className="text-sm font-bold text-slate-800 truncate"
                        title={optResult.market_context?.description}
                      >
                        {optResult.market_context?.description?.replace(
                          "อนุญาตสไตล์: ",
                          "",
                        ) || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Portfolio Optimization Impact & Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-bold text-slate-800 text-lg">
                      Allocation Adjustment
                    </h3>
                  </div>
                  <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Weight Chart */}
                    <div className="lg:col-span-2 h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={weightChartData}
                          margin={{ top: 20, right: 0, left: -20, bottom: 0 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="#f1f5f9"
                          />
                          <XAxis
                            dataKey="ticker"
                            tick={{ fontSize: 12, fill: "#64748b" }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis
                            tick={{ fontSize: 12, fill: "#64748b" }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(val) => `${val}%`}
                          />
                          <Tooltip
                            contentStyle={{
                              borderRadius: "8px",
                              border: "1px solid #e2e8f0",
                            }}
                            formatter={(value: any) => [
                              `${Number(value).toFixed(2)}%`,
                              undefined,
                            ]}
                          />
                          <Legend wrapperStyle={{ paddingTop: "10px" }} />
                          <Bar
                            dataKey="Original"
                            name="Current Weight"
                            fill="#cbd5e1"
                            radius={[4, 4, 0, 0]}
                          />
                          <Bar
                            dataKey="Target"
                            name="Optimal Weight"
                            fill="#3b82f6"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Right: Projected Performance (Original vs Optimized) */}
                    <div className="space-y-4 flex flex-col justify-center">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                        Projected Performance
                      </h4>
                      <div className="space-y-3">
                        {/* Expected Return */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                          <div>
                            <p className="text-xs text-slate-500 font-bold">
                              Expected Return
                            </p>
                            <p className="text-sm font-semibold text-slate-400 line-through decoration-rose-500/50">
                              {
                                optResult.portfolio_optimization
                                  ?.projected_performance?.original
                                  ?.expected_return_pct
                              }
                              %
                            </p>
                          </div>
                          <ArrowRightCircle
                            size={16}
                            className="text-blue-300"
                          />
                          <div className="text-right">
                            <p className="text-[10px] text-blue-500 font-bold uppercase">
                              Optimized
                            </p>
                            <p className="text-lg font-black text-blue-600">
                              {
                                optResult.portfolio_optimization
                                  ?.projected_performance?.optimized
                                  ?.expected_return_pct
                              }
                              %
                            </p>
                          </div>
                        </div>

                        {/* Volatility */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                          <div>
                            <p className="text-xs text-slate-500 font-bold">
                              Volatility (Risk)
                            </p>
                            <p className="text-sm font-semibold text-slate-400">
                              {
                                optResult.portfolio_optimization
                                  ?.projected_performance?.original
                                  ?.volatility_pct
                              }
                              %
                            </p>
                          </div>
                          <ArrowRightCircle
                            size={16}
                            className="text-blue-300"
                          />
                          <div className="text-right">
                            <p className="text-[10px] text-blue-500 font-bold uppercase">
                              Optimized
                            </p>
                            <p className="text-lg font-black text-blue-600">
                              {
                                optResult.portfolio_optimization
                                  ?.projected_performance?.optimized
                                  ?.volatility_pct
                              }
                              %
                            </p>
                          </div>
                        </div>

                        {/* Sharpe Ratio */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                          <div>
                            <p className="text-xs text-slate-500 font-bold">
                              Sharpe Ratio
                            </p>
                            <p className="text-sm font-semibold text-slate-400">
                              {
                                optResult.portfolio_optimization
                                  ?.projected_performance?.original
                                  ?.sharpe_ratio
                              }
                            </p>
                          </div>
                          <ArrowRightCircle
                            size={16}
                            className="text-blue-300"
                          />
                          <div className="text-right">
                            <p className="text-[10px] text-blue-500 font-bold uppercase">
                              Optimized
                            </p>
                            <p className="text-lg font-black text-blue-600">
                              {
                                optResult.portfolio_optimization
                                  ?.projected_performance?.optimized
                                  ?.sharpe_ratio
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rebalancing Action Plan & Recommendations */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Rebalancing Plan*/}
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-fit">
                    <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                      <h3 className="font-bold text-slate-800">
                        Action Plan (Rebalance)
                      </h3>
                    </div>
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-[11px] font-black text-slate-400 uppercase">
                        <tr className="border-b border-slate-100">
                          <th className="p-4">Asset</th>
                          <th className="p-4 text-center">Weight Shift</th>
                          <th className="p-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {optResult.portfolio_optimization?.rebalancing_plan?.map(
                          (plan: any, idx: number) => {
                            const isBuy = plan.action === "BUY";
                            const isSell = plan.action === "SELL";
                            return (
                              <tr
                                key={idx}
                                className="border-b border-slate-50 hover:bg-slate-50/50"
                              >
                                <td className="p-4 font-bold text-slate-700">
                                  {plan.ticker}
                                </td>
                                <td className="p-4 text-center text-slate-500 text-xs font-semibold">
                                  {plan.current_weight_pct}%{" "}
                                  <span className="mx-1 text-slate-300">→</span>{" "}
                                  {plan.target_weight_pct}%
                                </td>
                                <td className="p-4 text-right">
                                  <span
                                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-bold text-xs ${isBuy ? "bg-emerald-100 text-emerald-700" : isSell ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-600"}`}
                                  >
                                    {plan.action}{" "}
                                    {plan.adjustment_pct > 0
                                      ? `+${plan.adjustment_pct}`
                                      : plan.adjustment_pct}
                                    %
                                  </span>
                                </td>
                              </tr>
                            );
                          },
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* AI Recommendations */}
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-fit">
                    <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                      <h3 className="font-bold text-slate-800">
                        AI Candidates
                      </h3>
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded">
                        Top {topN} Suggestion
                      </span>
                    </div>
                    <div className="p-4 space-y-3">
                      {optResult.recommended_candidates?.map(
                        (cand: any, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:border-blue-200 transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-slate-900 text-white rounded-lg flex items-center justify-center font-black">
                                {cand.Ticker}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-blue-500 uppercase">
                                  {cand.Style_Label}
                                </p>
                                <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                                  Risk Score (Corr):{" "}
                                  {cand["Risk_Score (Corr)"]?.toFixed(2)}
                                </p>
                              </div>
                            </div>
                            <ArrowRight className="text-slate-300" size={16} />
                          </div>
                        ),
                      )}
                      {(!optResult.recommended_candidates ||
                        optResult.recommended_candidates.length === 0) && (
                        <p className="text-center text-slate-400 py-6 text-sm italic">
                          ไม่มีสินทรัพย์แนะนำเพิ่มเติมในสภาวะตลาดนี้
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <BonkChatWidget />
    </div>
  );
};

export default SimulateView;
