import React from 'react';

interface OptimizationData {
  market_context: {
    regime: string;
    vix_index: number;
    description: string;
  };
  original_portfolio: Record<string, number>;
  recommended_candidates: Array<{
    Ticker: string;
    Style_Label: string;
    "Risk_Score (Corr)": number;
  }>;
  portfolio_optimization: {
    target_weights_pct: Record<string, number>;
    rebalancing_plan: Array<{
      ticker: string;
      current_weight_pct: number;
      target_weight_pct: number;
      adjustment_pct: number;
      action: "BUY" | "SELL" | "HOLD";
    }>;
    projected_performance: {
      original: {
        expected_return_pct: number;
        volatility_pct: number;
        sharpe_ratio: number;
      };
      optimized: {
        expected_return_pct: number;
        volatility_pct: number;
        sharpe_ratio: number;
      };
    };
  };
}

export default function OptimizationResult({ data }: { data: OptimizationData }) {
  const { market_context, portfolio_optimization, recommended_candidates } = data;
  const { projected_performance, rebalancing_plan, target_weights_pct } = portfolio_optimization;

  const activeWeights = Object.entries(target_weights_pct).filter(([_, pct]) => pct > 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 text-black">
      
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex flex-col md:flex-row gap-4 justify-between items-center">
        <div>
          <h3 className="text-blue-800 font-bold text-lg">Market Context: {market_context.regime}</h3>
          <p className="text-sm text-blue-600">{market_context.description}</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm text-center">
          <span className="block text-xs text-gray-500 font-semibold uppercase">VIX Index</span>
          <span className="font-bold text-xl">{market_context.vix_index}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-xl border shadow-sm">
          <h4 className="text-gray-500 font-bold mb-4 uppercase text-sm tracking-wider">Original Portfolio</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Expected Return</span>
              <span className="font-bold">{projected_performance.original.expected_return_pct}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Volatility (Risk)</span>
              <span className="font-bold text-red-500">{projected_performance.original.volatility_pct}%</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-gray-600">Sharpe Ratio</span>
              <span className="font-bold">{projected_performance.original.sharpe_ratio}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 text-white p-5 rounded-xl shadow-md border border-gray-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-green-500 text-xs font-bold px-3 py-1 rounded-bl-lg">Optimized</div>
          <h4 className="text-gray-400 font-bold mb-4 uppercase text-sm tracking-wider">New Portfolio</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Expected Return</span>
              <span className="font-bold">{projected_performance.optimized.expected_return_pct}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Volatility (Risk)</span>
              <span className="font-bold text-green-400">{projected_performance.optimized.volatility_pct}%</span>
            </div>
            <div className="flex justify-between border-t border-gray-700 pt-2">
              <span className="text-gray-400">Sharpe Ratio</span>
              <span className="font-bold text-green-400">{projected_performance.optimized.sharpe_ratio}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border shadow-sm">
        <h4 className="font-bold mb-4">Target Allocation</h4>
        <div className="flex flex-wrap gap-3">
          {activeWeights.map(([ticker, pct]) => (
            <div key={ticker} className="bg-gray-100 border border-gray-200 px-4 py-2 rounded-lg flex items-center gap-2">
              <span className="font-bold">{ticker}</span>
              <span className="text-blue-600 font-semibold">{pct}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border shadow-sm overflow-x-auto">
        <h4 className="font-bold mb-4">Rebalancing Plan</h4>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="p-3 text-sm font-semibold text-gray-600">Action</th>
              <th className="p-3 text-sm font-semibold text-gray-600">Ticker</th>
              <th className="p-3 text-sm font-semibold text-gray-600">Current</th>
              <th className="p-3 text-sm font-semibold text-gray-600">Target</th>
              <th className="p-3 text-sm font-semibold text-gray-600">Adjustment</th>
            </tr>
          </thead>
          <tbody>
            {rebalancing_plan.map((item, index) => {
              const actionColors = {
                BUY: "bg-green-100 text-green-700 border-green-200",
                SELL: "bg-red-100 text-red-700 border-red-200",
                HOLD: "bg-gray-100 text-gray-600 border-gray-200"
              };

              return (
                <tr key={index} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="p-3">
                    <span className={`px-2 py-1 text-xs font-bold rounded border ${actionColors[item.action]}`}>
                      {item.action}
                    </span>
                  </td>
                  <td className="p-3 font-bold">{item.ticker}</td>
                  <td className="p-3 text-gray-600">{item.current_weight_pct}%</td>
                  <td className="p-3 font-semibold">{item.target_weight_pct}%</td>
                  <td className="p-3">
                    <span className={item.adjustment_pct > 0 ? "text-green-600" : item.adjustment_pct < 0 ? "text-red-500" : "text-gray-400"}>
                      {item.adjustment_pct > 0 ? "+" : ""}{item.adjustment_pct}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}