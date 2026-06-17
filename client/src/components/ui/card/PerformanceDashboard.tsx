"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import PnLSummaryCard from "./PnLSummaryCard";
import EquityCurveCard from "./EquityCurveCard";

import { API_URL } from "@/src/config";

const PortfolioDashboard = ({ portfolioId }: { portfolioId: number }) => {
  const [backtestData, setBacktestData] = useState<any>(null);
  const [timeframe, setTimeframe] = useState("1M");
  const [isLoading, setIsLoading] = useState(true);

  const INITIAL_CAPITAL = 100000;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const end = new Date().toISOString().split("T")[0];
        const start = new Date(
          new Date().setFullYear(new Date().getFullYear() - 1),
        )
          .toISOString()
          .split("T")[0];

        const res = await axios.get(
          `${API_URL}/backtest/report/${portfolioId}?start=${start}&end=${end}&initialCapital=100000`,
        );

        if (res.data.success) {
          setBacktestData(res.data.data);
        }
      } catch (err) {
        console.error("Fetch Backtest Error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [portfolioId]);

  if (isLoading)
    return (
      <div className="p-10 text-center text-slate-500">
        Loading Portfolio Analytics...
      </div>
    );
  if (!backtestData || !backtestData.metrics)
    return (
      <div className="p-10 text-center text-slate-500">No data available</div>
    );

  const { metrics, dates, equityCurve, underwaterCurve } = backtestData;

  // คำนวณ Daily PnL จาก Equity Curve
  const lastIdx = equityCurve.length - 1;
  const prevIdx = lastIdx > 0 ? lastIdx - 1 : 0;

  const latestEquity = equityCurve[lastIdx] || 0;
  const previousEquity = equityCurve[prevIdx] || latestEquity;

  const dailyAmount = latestEquity - previousEquity;
  const dailyPercent =
    previousEquity !== 0 ? (dailyAmount / previousEquity) * 100 : 0;

  // ข้อมูลสำหรับ กราฟ
  const chartData = dates.map((date: string, index: number) => ({
    date: new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    value: Number(equityCurve[index].toFixed(2)),
    drawdown: Number((underwaterCurve[index] * 100).toFixed(2)), // แปลงเป็น %
  }));

  return (
    <div className="flex flex-col gap-6 ">
      {/* สรุปตัวเลข PnL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PnLSummaryCard
          title="Total PnL"
          // คำนวณจาก (มูลค่าปัจจุบัน - ทุนเริ่มต้น)
          amount={latestEquity - INITIAL_CAPITAL}
          percent={metrics.totalReturn * 100}
          description={`Win Rate: ${(metrics.winRate * 100).toFixed(1)}% | Profit Factor: ${Number(metrics.profitFactor).toFixed(2)}`}
        />
        <PnLSummaryCard
          title="Daily PnL (Latest)"
          amount={dailyAmount}
          percent={dailyPercent}
          description={`Max Drawdown: ${(metrics.maxDrawdown * 100).toFixed(2)}%`}
          isDaily
        />
      </div>

      {/* กราฟ Equity Curve */}
      <EquityCurveCard
        data={chartData}
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
      />

      {/*สถิติ Quant  */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col gap-1">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Sharpe Ratio
          </p>
          <p className="text-xl font-bold text-blue-600">
            {Number(metrics.sharpeRatio).toFixed(2)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col gap-1">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Calmar Ratio
          </p>
          <p className="text-xl font-bold text-emerald-600">
            {Number(metrics.calmarRatio).toFixed(2)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col gap-1">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Annualized Vol
          </p>
          <p className="text-xl font-bold text-slate-700">
            {(metrics.annualizedVolatility * 100).toFixed(2)}%
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col gap-1">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            VaR (95%)
          </p>
          <p className="text-xl font-bold text-rose-500">
            {(metrics.valueAtRisk * 100).toFixed(2)}%
          </p>
        </div>
      </div>
    </div>
  );
};

export default PortfolioDashboard;
