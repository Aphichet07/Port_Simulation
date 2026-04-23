import { Elysia, t } from "elysia";
import { BacktestService } from "./service";
import type { AssetInput } from "./service";
import { PortfolioService } from "../portfolio/service";
import { generateQuantReport,getFullAnalyticsAuto} from "../report/service";
import { MarketService } from "../market/service";


export const BacktestModule = new Elysia({ prefix: "/backtest" }).get(
  "/report/:port_name",
  async ({ params, query, set }) => {
    try {
      const portName = params.port_name;
      
      const assets = await PortfolioService.getAssetInPort(portName);

      const start = new Date(query.start as string);
      const end = new Date(query.end as string);
      const capital = query.initialCapital
        ? Number(query.initialCapital)
        : 10000;

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        set.status = 400;
        return { error: "Invalid date format. Use YYYY-MM-DD" };
      }

      const backtestResult = await BacktestService.Analytic(assets, start, end, capital);

      const benchmarkPrices = await MarketService.getBenchmarkPrices(
        "^GSPC", 
        start, 
        end, 
        backtestResult.dates
      );
      
      const finalReport = getFullAnalyticsAuto(assets, backtestResult, benchmarkPrices);
      
      return finalReport;
    } catch (error: any) {
      set.status = 500;
      return {
        error: error.message || "An error occurred during backtesting",
      };
    }
  },
  {
    params: t.Object({
      port_name: t.String(),
    }),
    query: t.Object({
      start: t.String({ default: "1995-01-01" }),
      end: t.String({ default: "2025-12-31" }),
      initialCapital: t.Optional(t.String()),
    }),
  },
);
