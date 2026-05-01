"use client";
import { useState, useMemo, useEffect } from "react";
import axios from "axios";
import OptimizationResult from "@/src/components/ui/result";

interface PortfolioItem {
    symbol: string;
    ratio: number | ""; 
}

export default function PortFolioForm() {
    const [isMounted, setIsMounted] = useState(false);

    const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([
        { symbol: "", ratio: "" }
    ]);
    const [numberRecommendations, setNumberRecommendations] = useState<number>(5);
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const totalRatio = useMemo(() => {
        return portfolioItems.reduce((sum, item) => sum + (Number(item.ratio) || 0), 0);
    }, [portfolioItems]);

    const handleAddRow = () => {
        setPortfolioItems([...portfolioItems, { symbol: "", ratio: "" }]);
    };

    const handleRemoveRow = (index: number) => {
        const newItems = portfolioItems.filter((_, i) => i !== index);
        setPortfolioItems(newItems);
    };

    const handleChange = (index: number, field: keyof PortfolioItem, value: string) => {
        const newItems = [...portfolioItems];
        if (field === 'ratio') {
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
            setError(`Total ratio must be exactly 100. Current total is ${totalRatio}.`);
            return;
        }

        const hasEmptySymbol = portfolioItems.some(item => !item.symbol.trim());
        if (hasEmptySymbol) {
            setError("Please fill in all symbols before submitting.");
            return;
        }

        setIsLoading(true);

        const portfolioRecord = portfolioItems.reduce((acc, item) => {
            acc[item.symbol] = Number(item.ratio) / 100;
            return acc;
        }, {} as Record<string, number>);

        const payload = {
            "user_portfolio": portfolioRecord, 
            "top_n_recommendations": numberRecommendations
        };

        try {
            const res = await axios.post(`http://127.0.0.1:8000/optimize`, payload);
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
        <div className="p-6 max-w-2xl mx-auto bg-white rounded-xl shadow-md space-y-6 text-black">
            <h2 className="text-2xl font-bold border-b pb-2">Portfolio Configuration</h2>
            
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <label className="font-semibold text-lg">Assets Allocation</label>
                    <div className={`font-bold px-3 py-1 rounded-full text-sm ${totalRatio === 100 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        Total Ratio: {totalRatio} / 100
                    </div>
                </div>

                <div className="space-y-3">
                    {portfolioItems.map((item, index) => (
                        <div key={index} className="flex gap-3 items-center">
                            <input 
                                type="text" 
                                placeholder="Symbol (e.g. AAPL)" 
                                className="border p-2 rounded flex-1 uppercase"
                                value={item.symbol}
                                onChange={(e) => handleChange(index, 'symbol', e.target.value)}
                            />
                            <div className="flex items-center gap-2">
                                <input 
                                    type="number" 
                                    placeholder="Ratio (%)" 
                                    className="border p-2 rounded w-28 text-center"
                                    value={item.ratio}
                                    onChange={(e) => handleChange(index, 'ratio', e.target.value)}
                                    min="1"
                                    max="100"
                                />
                                <span className="font-semibold text-gray-500">%</span>
                            </div>
                            
                            {portfolioItems.length > 1 ? (
                                <button 
                                    onClick={() => handleRemoveRow(index)}
                                    className="px-3 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200 font-bold"
                                >
                                    ✕
                                </button>
                            ) : (
                                <div className="w-10"></div>
                            )}
                        </div>
                    ))}
                </div>

                <button 
                    onClick={handleAddRow}
                    className="w-full py-2 border-2 border-dashed border-gray-300 text-gray-500 rounded font-semibold hover:border-gray-400 hover:text-gray-700 transition"
                >
                    + Add Asset
                </button>

                <div className="pt-4 border-t">
                    <label className="font-semibold block mb-2">Top N Recommendations</label>
                    <input 
                        type="number" 
                        className="border p-2 rounded w-full md:w-1/3"
                        value={numberRecommendations}
                        onChange={(e) => setNumberRecommendations(Number(e.target.value))}
                        min="1"
                    />
                </div>

                <button 
                    onClick={fetchData} 
                    disabled={isLoading || totalRatio !== 100}
                    className="w-full bg-blue-600 text-white p-3 rounded font-bold hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition mt-4"
                >
                    {isLoading ? "Running Optimization..." : "Run Model"}
                </button>
            </div>

            {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded">
                    ⚠️ {error}
                </div>
            )}

            {data && data.status === "success" && (
                <div className="mt-8">
                    <h3 className="text-xl font-bold mb-4 border-b pb-2">Result Dashboard</h3>
                    <OptimizationResult data={data.data} />
                </div>
            )}
        </div>
    );
}