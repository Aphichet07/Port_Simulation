"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "@/src/config";
import { TrendingUp, TrendingDown, Loader2, AlertCircle } from "lucide-react";

interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

const MarketOverviewWidget = () => {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarketOverview = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await axios.get(
          `${API_URL}/market/overview`,
        );

        if (response.data && response.data.success) {
          setMarketData(response.data.data);
        } else {
          throw new Error("Invalid API response format");
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch market data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarketOverview();
    const intervalId = setInterval(fetchMarketOverview, 60000);
    return () => clearInterval(intervalId);
  }, []);

  if (isLoading && marketData.length === 0) {
    return (
      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="min-w-50 bg-slate-50 border border-slate-100 rounded-[10px] h-22.5 animate-pulse flex items-center justify-center text-slate-300"
          >
            <Loader2 className="animate-spin" size={20} />
          </div>
        ))}
      </div>
    );
  }

  if (error && marketData.length === 0) {
    return (
      <div className="bg-rose-50 text-rose-600 rounded-[10px] p-4 flex items-center gap-3 border border-rose-200">
        <AlertCircle size={20} />
        <span className="text-sm font-semibold">{error}</span>
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto custom-scrollbar pb-2">
      {marketData.map((data, index) => {
        const isPositive = data.change >= 0;
        return (
          <div
            key={index}
            className="min-w-55 flex-1 bg-slate-50 border border-slate-100 rounded-[10px] p-4 hover:shadow-sm transition-shadow"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  {data.symbol}
                </p>
                <p className="text-md font-bold text-slate-800">
                  {data.name}
                </p>
              </div>
              <div
                className={`p-1 rounded ${isPositive ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"}`}
              >
                {isPositive ? (
                  <TrendingUp size={14} />
                ) : (
                  <TrendingDown size={14} />
                )}
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                {data.price.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </h3>
              <p
                className={`text-xs font-semibold mt-1 ${isPositive ? "text-emerald-500" : "text-rose-500"}`}
              >
                {isPositive ? "+" : ""}
                {data.change.toFixed(2)} ({data.changePercent.toFixed(2)}%)
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MarketOverviewWidget;
