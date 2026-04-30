"use client";
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  ShieldAlert,
  BarChart3,
  Target,
} from "lucide-react";

interface BacktestData {
  totalReturn: number;
  cagr: number;
  annualizedReturn: number;
  dailyVolatility: number;
  annualizedVolatility: number;
  maxDrawdown: number;
  drawdownDuration: number;
  recoveryTime: number;
  valueAtRisk: number;
  conditionalVar: number;
  sharpeRatio: number;
  sortinoRatio: number;
  rollingReturns: number[];
  beta: number;
  alpha: number;
  rSquared: number;
  informationRatio: number;
  trackingError: number;
  upMarketCapture: number;
  downMarketCapture: number;
  correlationMatrix: number[][];
  covarianceMatrix: number[][];
  actr: number[];
}

const formatPct = (value: number) => `${(value * 100).toFixed(2)}%`;
const formatNum = (value: number) => value.toFixed(2);

export default function BacktestResult({ data }: { data: BacktestData }) {
  if (!data) return null;

  const chartData = data.rollingReturns.map((val, index) => ({
    period: `Day ${index + 1}`,
    return: val * 100,
  }));

  const MetricCard = ({
    title,
    value,
    subtext,
    icon: Icon,
    isPositive,
  }: any) => (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-2">
      <div className="flex justify-between items-start">
        <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          {title}
        </span>
        <div
          className={`p-2 rounded-lg ${isPositive ? "bg-green-100 text-green-700" : isPositive === false ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}
        >
          <Icon size={18} />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
      </div>
      {subtext && <span className="text-xs text-gray-400">{subtext}</span>}
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans text-gray-800">
      <div className="border-b pb-4 mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Backtest Report</h2>
        <p className="text-gray-500 text-sm">
          Comprehensive performance and risk analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="CAGR"
          value={formatPct(data.cagr)}
          subtext={`Total Return: ${formatPct(data.totalReturn)}`}
          icon={TrendingUp}
          isPositive={data.cagr > 0}
        />
        <MetricCard
          title="Sharpe Ratio"
          value={formatNum(data.sharpeRatio)}
          subtext={`Sortino: ${formatNum(data.sortinoRatio)}`}
          icon={Activity}
          isPositive={data.sharpeRatio > 1}
        />
        <MetricCard
          title="Max Drawdown"
          value={formatPct(data.maxDrawdown)}
          subtext={`Duration: ${data.drawdownDuration} periods`}
          icon={TrendingDown}
          isPositive={false}
        />
        <MetricCard
          title="Ann. Volatility"
          value={formatPct(data.annualizedVolatility)}
          subtext={`Daily Vol: ${formatPct(data.dailyVolatility)}`}
          icon={ShieldAlert}
          isPositive={null}
        />
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-100">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <BarChart3 size={20} className="text-gray-500" />
          Rolling Returns (%)
        </h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#e5e7eb"
            />
            <XAxis
              dataKey="period"
              tick={{ fontSize: 12 }}
              minTickGap={30}
              stroke="#9ca3af"
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={(val) => `${val}%`}
              stroke="#9ca3af"
            />
            <Tooltip
              formatter={(value: any) => [
                `${Number(value).toFixed(2)}%`,
                "Return",
              ]}
              contentStyle={{
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
            />
            <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="3 3" />
            <Line
              type="monotone"
              dataKey="return"
              stroke="#2563eb"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Target size={20} className="text-gray-500" />
            Factor Analysis
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 border-b pb-4">
              <div>
                <span className="block text-sm text-gray-500 mb-1">Alpha</span>
                <span className="font-semibold text-lg">
                  {formatPct(data.alpha)}
                </span>
              </div>
              <div>
                <span className="block text-sm text-gray-500 mb-1">Beta</span>
                <span className="font-semibold text-lg">
                  {formatNum(data.beta)}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 border-b pb-4">
              <div>
                <span className="block text-sm text-gray-500 mb-1">
                  Up Market Capture
                </span>
                <span className="font-semibold text-lg text-green-600">
                  {formatNum(data.upMarketCapture)}
                </span>
              </div>
              <div>
                <span className="block text-sm text-gray-500 mb-1">
                  Down Market Capture
                </span>
                <span className="font-semibold text-lg text-red-600">
                  {formatNum(data.downMarketCapture)}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="block text-sm text-gray-500 mb-1">
                  Information Ratio
                </span>
                <span className="font-semibold text-lg">
                  {formatNum(data.informationRatio)}
                </span>
              </div>
              <div>
                <span className="block text-sm text-gray-500 mb-1">
                  Value at Risk (VaR)
                </span>
                <span className="font-semibold text-lg text-red-500">
                  {formatPct(data.valueAtRisk)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
          <h3 className="text-lg font-bold mb-4">Correlation Matrix</h3>
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-3 font-semibold text-gray-600 w-12">#</th>
                {data.correlationMatrix.map((_, i) => (
                  <th
                    key={i}
                    className="p-3 font-semibold text-gray-600 text-center"
                  >
                    A{i + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.correlationMatrix.map((row, i) => (
                <tr
                  key={i}
                  className="border-b last:border-0 hover:bg-gray-50 transition-colors"
                >
                  <td className="p-3 font-semibold text-gray-600 bg-gray-50">
                    A{i + 1}
                  </td>
                  {row.map((val, j) => {
                    const isSelf = i === j;
                    const bgIntensity = isSelf ? 0 : Math.abs(val);
                    return (
                      <td
                        key={j}
                        className={`p-3 text-center ${isSelf ? "font-bold text-blue-600" : "text-gray-700"}`}
                        style={{
                          backgroundColor: !isSelf
                            ? `rgba(37, 99, 235, ${bgIntensity * 0.15})`
                            : "transparent",
                        }}
                      >
                        {formatNum(val)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
