"use client";
import { useState, useMemo, useEffect } from "react";
import axios from "axios";
import OptimizationResult from "@/src/components/ui/result";
import { AI_API_URL } from "@/src/config";
import { Settings, Play, X, Plus, PieChart } from "lucide-react";

interface PortfolioItem {
  symbol: string;
  ratio: number | "";
}

export default function PortFolioForm() {
  const [isMounted, setIsMounted] = useState(false);

  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([
    { symbol: "", ratio: "" },
  ]);
  const [numberRecommendations, setNumberRecommendations] = useState<number>(5);
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const totalRatio = useMemo(() => {
    return portfolioItems.reduce(
      (sum, item) => sum + (Number(item.ratio) || 0),
      0,
    );
  }, [portfolioItems]);

  const handleAddRow = () => {
    setPortfolioItems([...portfolioItems, { symbol: "", ratio: "" }]);
  };

  const handleRemoveRow = (index: number) => {
    const newItems = portfolioItems.filter((_, i) => i !== index);
    setPortfolioItems(newItems);
  };

  const handleChange = (
    index: number,
    field: keyof PortfolioItem,
    value: string,
  ) => {
    const newItems = [...portfolioItems];
    if (field === "ratio") {
      newItems[index][field] = value === "" ? "" : Number(value);
    } else {
      newItems[index][field] = value.toUpperCase();
    }
    setPortfolioItems(newItems);
  };

  const fetchData = async () => {
    setError(null);
    setData(null);

    if (totalRatio !== 100) {
      setError(
        `Total ratio must be exactly 100. Current total is ${totalRatio}.`,
      );
      return;
    }

    const hasEmptySymbol = portfolioItems.some((item) => !item.symbol.trim());
    if (hasEmptySymbol) {
      setError("Please fill in all symbols before submitting.");
      return;
    }

    setIsLoading(true);

    const portfolioRecord = portfolioItems.reduce(
      (acc, item) => {
        acc[item.symbol] = Number(item.ratio) / 100;
        return acc;
      },
      {} as Record<string, number>,
    );

    const payload = {
      user_portfolio: portfolioRecord,
      top_n_recommendations: numberRecommendations,
    };

    try {
      const res = await axios.post(`${AI_API_URL}/optimize`, payload);
      setData(res.data);
    } catch (error: any) {
      console.error(error.message);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-lg p-6 sm:p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 border-b border-slate-100 pb-6">
        <div className="p-3 bg-slate-50 rounded-xl text-slate-700 border border-slate-200 shadow-sm">
          <PieChart size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">
            Portfolio Setup
          </h2>
          <p className="text-[13px] text-slate-500 mt-1">
            กำหนดสัดส่วนหุ้นปัจจุบันของคุณเพื่อให้ AI ช่วยประเมินและจัดพอร์ต
          </p>
        </div>
      </div>

      {/* Form Content */}
      <div className="space-y-6">
        {/* Status Bar */}
        <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
          <span className="text-[12px] font-bold text-slate-500 uppercase tracking-widest">
            Assets Allocation
          </span>
          <div
            className={`text-[12px] font-bold px-3 py-1 rounded-md uppercase tracking-wide border ${
              totalRatio === 100
                ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                : "bg-rose-50 text-rose-500 border-rose-100"
            }`}
          >
            Total: {totalRatio} / 100
          </div>
        </div>

        {/* Dynamic Inputs */}
        <div className="space-y-3">
          {portfolioItems.map((item, index) => (
            <div key={index} className="flex gap-3 items-center group">
              <input
                type="text"
                placeholder="TICKER (e.g. AAPL)"
                className="flex-1 bg-white border border-slate-200 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none font-mono text-[13px] text-slate-800 p-3 rounded-lg uppercase transition-all shadow-sm"
                value={item.symbol}
                onChange={(e) => handleChange(index, "symbol", e.target.value)}
              />
              <div className="flex items-center relative">
                <input
                  type="number"
                  placeholder="Ratio"
                  className="bg-white border border-slate-200 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none font-mono text-[13px] text-slate-800 p-3 rounded-lg w-24 text-center transition-all shadow-sm"
                  value={item.ratio}
                  onChange={(e) => handleChange(index, "ratio", e.target.value)}
                  min="1"
                  max="100"
                />
                <span className="absolute right-3 text-slate-400 font-mono text-[13px] pointer-events-none">
                  %
                </span>
              </div>

              {portfolioItems.length > 1 ? (
                <button
                  onClick={() => handleRemoveRow(index)}
                  className="w-11 h-11 border border-slate-200 text-slate-400 rounded-lg hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50 flex items-center justify-center transition-colors shadow-sm"
                  title="Remove Asset"
                >
                  <X size={16} />
                </button>
              ) : (
                <div className="w-11 h-11"></div> 
              )}
            </div>
          ))}
        </div>

        {/* Add Button */}
        <button
          onClick={handleAddRow}
          className="w-full py-3 border-2 border-dashed border-slate-200 text-slate-500 text-[12px] font-bold hover:text-slate-800 hover:border-slate-400 hover:bg-slate-50 rounded-xl transition-all uppercase tracking-widest flex items-center justify-center gap-2"
        >
          <Plus size={16} /> Add Asset
        </button>

        {/* Options */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-6">
          <span className="text-[12px] font-bold text-slate-500 uppercase tracking-widest">
            Top N Picks{" "}
            <span className="text-slate-400 lowercase ml-1">
              (จำนวนหุ้นแนะนำ)
            </span>
          </span>
          <input
            type="number"
            className="bg-white border border-slate-200 focus:border-slate-800 outline-none font-mono text-[13px] text-slate-800 p-2.5 rounded-lg w-20 text-center transition-all shadow-sm"
            value={numberRecommendations}
            onChange={(e) => setNumberRecommendations(Number(e.target.value))}
            min="1"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 border border-rose-200 text-rose-600 text-[13px] bg-rose-50 rounded-lg font-medium flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={fetchData}
          disabled={isLoading || totalRatio !== 100}
          className="w-full mt-4 bg-slate-900 text-white p-4 rounded-xl text-[13px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg active:scale-[0.98] disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-4 w-4 text-slate-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Running Optimization...
            </span>
          ) : (
            <>
              <Play size={16} fill="white" /> Run Optimize
            </>
          )}
        </button>
      </div>

      {/* Result Section */}
      {data && data.status === "success" && (
        <div className="mt-8 pt-8 border-t border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <OptimizationResult data={data.data} />
        </div>
      )}
    </div>
  );
}
