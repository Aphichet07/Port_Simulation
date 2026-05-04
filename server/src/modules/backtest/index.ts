import { Elysia, t } from "elysia";
import { BacktestService } from "./service";
import { PortfolioService } from "../portfolio/service";
import { getFullAnalyticsAuto } from "../report/service";
import { MarketService } from "../market/service";

export const BacktestModule = new Elysia({ prefix: "/backtest" }).get(
  "/report/:id",
  async ({ params, query, set }) => {
    try {
      const { id: portfolioId } = params;
      const { start: startStr, end: endStr, initialCapital } = query;

      const rawAssets =
        await PortfolioService.getAssetsByPortfolioId(portfolioId);
      if (!rawAssets || rawAssets.length === 0) {
        set.status = 404;
        return { error: `ไม่พบสินทรัพย์ในพอร์ตไอดี: ${portfolioId}` };
      }

      const assets = rawAssets.map((a) => ({
        symbol: a.symbol,
        weight: parseFloat(a.weight),
      }));

      const start = new Date(startStr);
      const end = new Date(endStr);
      const capital = initialCapital ?? 10000;

      // ประมวลผลราคา
      const backtestResult = await BacktestService.Analytic(
        assets,
        start,
        end,
        capital,
      );

      //คำนวณสถิติ
      const quantitativeMetrics = await BacktestService.getMetrics(
        backtestResult,
        capital,
      );

      // 3. ดึงราคา Benchmark
      const benchmarkPrices = await MarketService.getBenchmarkPrices(
        "^GSPC",
        start,
        end,
        backtestResult.dates,
      );

      const finalReport = getFullAnalyticsAuto(
        assets,
        backtestResult,
        benchmarkPrices,
      );

      return {
        success: true,
        data: {
          metrics: { ...finalReport, ...quantitativeMetrics },
          dates: backtestResult.dates,
          equityCurve: backtestResult.equityCurve,
          underwaterCurve: quantitativeMetrics.underwaterCurve,
        },
      };
    } catch (error) {
      const err = error as Error;
      set.status = 500;
      console.error("[BacktestModule] Error:", err);
      return {
        success: false,
        error: err.message || "เกิดข้อผิดพลาดระหว่างการทำ Backtesting",
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
      summary: "สร้างรายงานวิเคราะห์พอร์ตย้อนหลัง",
    },
  },
);
