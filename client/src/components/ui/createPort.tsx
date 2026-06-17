"use client";

import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { API_URL } from "@/src/config";
import {
  Trash2,
  Save,
  Plus,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
} from "lucide-react";

interface Asset {
  id: number;
  symbol: string;
  name: string;
  type: string;
  exchange: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface PortfolioItem {
  symbol: string;
  ratio: number | "";
}

interface AssetFormProps {
  onClose: () => void;
}

export const AssetForm = ({ onClose }: AssetFormProps) => {
  const [name, setName] = useState<string>("");
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([
    { symbol: "", ratio: "" },
  ]);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [messageError, setMessageError] = useState<string>("");
  const [isCreated, setIsCreated] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState(false);
  const [availableAssets, setAvailableAssets] = useState<Asset[]>([]);

  useEffect(() => {
    setIsMounted(true);

    const fetchAssets = async () => {
      try {
        const res = await axios.get(`${API_URL}/market/asset`);
        const assetsData = Array.isArray(res.data)
          ? res.data
          : res.data?.data || [];
        setAvailableAssets(assetsData.filter((a: Asset) => a.isActive));
      } catch (error) {
        console.error("Failed to fetch assets:", error);
      }
    };

    fetchAssets();
  }, []);

  const totalWeight = useMemo(() => {
    return portfolioItems.reduce(
      (sum, item) => sum + (Number(item.ratio) || 0),
      0,
    );
  }, [portfolioItems]);

  const handleAddRow = () => {
    if (portfolioItems.length < 15) {
      setPortfolioItems([...portfolioItems, { symbol: "", ratio: "" }]);
    }
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

  const handleSelectStock = (index: number, symbol: string) => {
    handleChange(index, "symbol", symbol);
    setActiveDropdown(null);
  };

  const handleCreate = async () => {
    setMessageError("");
    setIsCreated(false);

    if (!name.trim()) {
      setMessageError("Please enter a portfolio name.");
      return;
    }

    const activeItems = portfolioItems.filter(
      (item) => item.symbol.trim() !== "" || item.ratio !== ""
    );

    const currentTotalWeight = activeItems.reduce(
      (sum, item) => sum + (Number(item.ratio) || 0),
      0
    );

    if (currentTotalWeight !== 100) {
      setMessageError(
        `Total ratio must be exactly 100. Current is ${currentTotalWeight}.`,
      );
      return;
    }

    const hasEmptySymbol = activeItems.some((item) => !item.symbol.trim());
    if (hasEmptySymbol) {
      setMessageError("Please fill in all asset symbols.");
      return;
    }

    setIsLoading(true);

    const assetArray = activeItems.map((item) => ({
      symbol: item.symbol,
      weight: Number(item.ratio) / 100,
    }));
    
    const payload = { name: name, asset: assetArray };
    const endpoint = "/portfolio/create";

    try {
      const authToken =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

      if (!authToken) {
        throw new Error("ไม่พบ Token การเข้าสู่ระบบ กรุณา Login ใหม่");
      }
      
      const res = await axios.post(
        `${API_URL}${endpoint}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        },
      );
      console.log(res);
      setIsCreated(true);
      setName("");
      setPortfolioItems([{ symbol: "", ratio: "" }]);

      setTimeout(() => {
        onClose();
      }, 1500);
      console.log("port :", res.data);
      return res.data;
    } catch (error: any) {
      console.log(error.message);
      const errMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to create portfolio.";
      setMessageError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl animate-in zoom-in-95 duration-200">
        <div className="bg-white rounded-[10px] border border-slate-200 p-8 shadow-2xl flex flex-col h-full text-slate-900 max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-medium tracking-tight">
                Portfolio Allocation
              </h3>
              <p className="text-[12px] font-regular text-slate-400 uppercase mt-1">
                เลือกสินทรัพย์และสัดส่วนการถือครอง
              </p>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={onClose}
                className="cursor-pointer text-slate-400 hover:text-slate-800 hover:bg-slate-100 p-1.5 rounded-md transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto custom-scrollbar flex-1 pr-2">
            {/* Status Messages */}
            {isCreated && (
              <div className="mb-6 p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-lg flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500" />
                <p className="text-[12px] font-bold">
                  Portfolio created successfully!
                </p>
              </div>
            )}
            {messageError && (
              <div className="mb-6 p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-lg flex items-center gap-2">
                <AlertCircle size={16} className="text-rose-500" />
                <p className="text-[12px] font-bold">{messageError}</p>
              </div>
            )}

            {/* Allocation Items */}
            <div className="space-y-4">
              <div className="grid grid-cols-12 gap-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest px-2">
                <div className="col-span-7">Asset Class</div>
                <div className="col-span-4 text-center">Weight (%)</div>
                <div className="col-span-1"></div>
              </div>

              {portfolioItems.map((item, index) => {
                const filteredStocks = availableAssets
                  .filter((asset) => {
                    const searchTerm = item.symbol.toLowerCase();
                    return (
                      asset.symbol.toLowerCase().includes(searchTerm) ||
                      asset.name.toLowerCase().includes(searchTerm)
                    );
                  })
                  .slice(0, 15);

                return (
                  <div
                    key={index}
                    className="grid grid-cols-12 gap-3 items-center bg-slate-50 p-3 rounded-[10px] group transition-all hover:bg-slate-100/50"
                  >
                    <div className="col-span-7 relative">
                      <input
                        type="text"
                        placeholder="TICKER (e.g. AAPL)"
                        className="w-full bg-white border border-slate-200 rounded-md py-2 px-3 text-xs font-bold uppercase appearance-none outline-none focus:border-black transition-colors"
                        value={item.symbol}
                        onChange={(e) => {
                          handleChange(index, "symbol", e.target.value);
                          setActiveDropdown(index);
                        }}
                        onFocus={() => setActiveDropdown(index)}
                        onBlur={() => setActiveDropdown(null)}
                      />

                      {activeDropdown === index &&
                        item.symbol.length > 0 &&
                        filteredStocks.length > 0 && (
                          <ul className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-48 overflow-y-auto custom-scrollbar">
                            {filteredStocks.map((asset) => (
                              <li
                                key={asset.id}
                                onMouseDown={() =>
                                  handleSelectStock(index, asset.symbol)
                                }
                                className="px-3 py-2.5 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0 flex flex-col gap-0.5"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-[12px] font-bold text-slate-800">
                                    {asset.symbol}
                                  </span>
                                  <span className="text-[9px] font-semibold text-slate-400 uppercase bg-slate-100 px-1 rounded">
                                    {asset.exchange}
                                  </span>
                                </div>
                                <span className="text-[10px] text-slate-500 line-clamp-1">
                                  {asset.name}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                    </div>

                    <div className="col-span-4 relative flex items-center">
                      <input
                        type="number"
                        value={item.ratio}
                        onChange={(e) =>
                          handleChange(index, "ratio", e.target.value)
                        }
                        placeholder="0"
                        min="1"
                        max="100"
                        className="w-full bg-white border border-slate-200 rounded-md py-2 px-3 text-center text-xs font-bold outline-none focus:border-black transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <span className="absolute right-3 text-slate-400 font-mono text-[11px] pointer-events-none">
                        %
                      </span>
                    </div>

                    <div className="col-span-1 flex justify-center">
                      {portfolioItems.length > 1 ? (
                        <button
                          onClick={() => handleRemoveRow(index)}
                          className="cursor-pointer text-slate-300 hover:text-rose-500 transition-colors"
                          title="Remove Asset"
                        >
                          <Trash2 size={16} />
                        </button>
                      ) : (
                        <div className="w-4 h-4"></div>
                      )}
                    </div>
                  </div>
                );
              })}

              <button
                onClick={handleAddRow}
                className="cursor-pointer w-full py-3 border-2 border-dashed border-slate-200 rounded-[10px] text-slate-400 hover:text-slate-600 hover:border-slate-400 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest mt-2"
              >
                <Plus size={16} /> ADD NEW ASSET
              </button>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100 shrink-0">
            <div className="flex justify-between items-end mb-6">
              <div className="flex-1 pr-6">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Portfolio Identity
                </p>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter Portfolio Name..."
                  className="w-full bg-transparent border-b border-slate-200 py-1 text-sm font-bold text-slate-800 outline-none focus:border-black placeholder:font-normal"
                />
              </div>
              <div className="text-right">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Total Weight
                </p>
                <h4
                  className={`text-3xl font-black tracking-tighter ${
                    totalWeight === 100 ? "text-[#10B981]" : "text-rose-500"
                  }`}
                >
                  {totalWeight} %
                </h4>
              </div>
            </div>

            <button
              onClick={handleCreate}
              disabled={isLoading || totalWeight !== 100 || !name.trim()}
              className={`w-full py-4 rounded-lg font-bold uppercase text-xs flex items-center justify-center gap-3 transition-all ${
                totalWeight === 100 && name.trim() && !isLoading
                  ? "cursor-pointer bg-[#10B981] text-white hover:brightness-110 active:scale-[0.98] shadow-md"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> CREATING...
                </>
              ) : (
                <>
                  <Save size={18} /> SAVE CONFIGURATION
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetForm;