import { Elysia, t } from "elysia";
import { BacktestService } from "./service";
import { PortfolioService } from "../portfolio/service";
import { getFullAnalyticsAuto } from "../report/service";

export const BacktestModule = new Elysia({ prefix: "/backtest" }).get(
  "/report/:id",
  async ({ params, query, set }) => {
    try {
      const { id: portfolioId } = params;
      const { start: startStr, end: endStr, initialCapital } = query;

      const start = new Date(startStr);
      const end = new Date(endStr);
      if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
        set.status = 400;
        return { success: false, error: "วันที่ไม่ถูกต้อง หรือวันที่เริ่มต้นต้องมาก่อนวันสิ้นสุด" };
      }

      const capital = initialCapital ?? 10000;

      const rawAssets = await PortfolioService.getAssetsByPortfolioId(portfolioId);
      if (!rawAssets || rawAssets.length === 0) {
        set.status = 404;
        return { success: false, error: `ไม่พบสินทรัพย์ในพอร์ตไอดี: ${portfolioId}` };
      }

      const assets = rawAssets.map((a) => ({
        symbol: a.symbol,
        weight: parseFloat(a.weight.toString()), 
      }));

      const BENCHMARK_SYMBOL = "^GSPC";

      const backtestResult = await BacktestService.runFullBacktest(
        assets,
        start,
        end,
        capital,
        BENCHMARK_SYMBOL
      );

      if (!backtestResult.success || !backtestResult.data) {
        set.status = 500;
        return { success: false, error: backtestResult.error || "เกิดข้อผิดพลาดในการคำนวณ Backtest" };
      }

      const { analytic, metrics, charts } = backtestResult.data;

      const benchmarkPrices = analytic.prices[BENCHMARK_SYMBOL] || [];
      const finalReport = getFullAnalyticsAuto(
        assets,
        analytic,
        benchmarkPrices
      );

  
      return {
        success: true,
        data: {
     
          metrics: { ...finalReport, ...metrics },
          charts: charts, 
          dates: analytic.dates,
          equityCurve: analytic.equityCurve,
          underwaterCurve: metrics.underwaterCurve,
        },
      };
    } catch (error) {
      const err = error as Error;
      set.status = 500;
      console.error(`[BacktestModule] Error on Portfolio ID ${params.id}:`, err);
      return {
        success: false,
        error: err.message || "เกิดข้อผิดพลาดรุนแรงระหว่างการทำ Backtesting",
      };
    }
  },
  {
    params: t.Object({
      id: t.Numeric({
        description: "ไอดีของพอร์ตโฟลิโอ (PK จากตาราง portfolios)",
      }),
    }),
    query: t.Object({
      start: t.String({
        default: "2020-01-01",
        pattern: "^\\d{4}-\\d{2}-\\d{2}$",
        description: "วันที่เริ่มต้นวิเคราะห์",
      }),
      end: t.String({
        default: "2024-12-31",
        pattern: "^\\d{4}-\\d{2}-\\d{2}$",
        description: "วันที่สิ้นสุดวิเคราะห์",
      }),
      initialCapital: t.Optional(
        t.Numeric({
          default: 10000,
          description: "เงินทุนสมมติเริ่มต้น",
        }),
      ),
    }),
    detail: {
      tags: ["Backtest"],
      summary: "สร้างรายงานวิเคราะห์พอร์ตย้อนหลังเชิงลึก (Institutional Grade)",
    },
  },
);