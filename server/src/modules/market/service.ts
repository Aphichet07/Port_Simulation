import YahooFinance from "yahoo-finance2";
import { ComputeReturn } from "../../common/utils/computeReturn";
import { ComputeReturnRisk } from "../../common/utils/computeReturnRisk";
import { assets } from "../../db/schema/assets";
import {db} from "../../db/index"

const yahooFinance = new YahooFinance();
const priceCache = new Map<
  string,
  { price: number; change: number; timestamp: number }
>();

export const MarketService = {

 async getAllAssets() {
    const allAssets = await db.select().from(assets);
    return allAssets;
  },


  async getLivePrice(symbol: string) {
    const symbolUpper = symbol.toUpperCase();
    const now = Date.now();
    const cachedData = priceCache.get(symbolUpper);

    if (cachedData && now - cachedData.timestamp < 10000) {
      return { symbol: symbolUpper, ...cachedData };
    }

    try {
      const API_KEY = process.env.FINNHUB_API_KEY;
      const response = await fetch(
        `https://finnhub.io/api/v1/quote?symbol=${symbolUpper}&token=${API_KEY}`,
      );

      const data = (await response.json()) as any;
      console.log(data);
      if (data.c === 0 && data.d === null) {
        throw new Error("ไม่พบข้อมูลหุ้นสัญลักษณ์นี้");
      }

      const result = {
        price: data.c,
        change: data.d,
        percentChange: data.dp,
        timestamp: now,
      };

      priceCache.set(symbolUpper, result);

      return { symbol: symbolUpper, ...result };
    } catch (error) {
      console.error(`ดึงข้อมูล ${symbolUpper} ล้มเหลว:`, error);
      return cachedData ? { symbol: symbolUpper, ...cachedData } : null;
    }
  },
  async getHistory(symbol: string, startDate: Date, endDate: Date) {
    const symbolUpper = symbol.toUpperCase();

    try {
      const result = await yahooFinance.chart(symbolUpper, {
        period1: startDate,
        period2: endDate,
        interval: "1d",
      });

      const quotes = result.quotes;

      if (!quotes || quotes.length === 0) {
        console.warn(`ไม่มีข้อมูลสำหรับ ${symbolUpper} ในช่วงเวลานี้`);
        return [];
      }

      const formattedData = quotes.map((item) => ({
        date: item.date.toISOString().split("T")[0],
        closePrice: item.adjclose !== undefined ? item.adjclose : item.close,
      }));
      return formattedData;
    } catch (error: any) {
      console.error(`ดึงข้อมูลประวัติ ${symbolUpper} ล้มเหลว:`, error.message);
      return [];
    }
  },
  async test() {
    const historyData = await MarketService.getHistory(
      "AAPL",
      new Date("2023-01-01"),
      new Date("2024-01-31"),
    );

    const pricesOnly = historyData.map((item) => item.closePrice) as any;
    const totalRet = ComputeReturn.TotalReturn(pricesOnly);
    const cagrRet = ComputeReturn.CAGR(pricesOnly);
    const rolling1Y = ComputeReturn.RollingReturn(pricesOnly, 252);

    console.log(`Total Return: ${(totalRet * 100).toFixed(2)}%`);
    console.log(`CAGR: ${(cagrRet * 100).toFixed(2)}%`);
    console.log(`rolling1Y ${rolling1Y.length}`);
  },
  async test2() {
    const historyData = await MarketService.getHistory(
      "AAPL",
      new Date("2023-01-01"),
      new Date("2024-01-31"),
    );
    const prices = historyData.map((item) => item.closePrice) as any;

    // สร้าง Daily Returns
    const dailyReturns: number[] = [];
    for (let i = 1; i < prices.length; i++) {
      const prev = prices[i - 1]!;
      dailyReturns.push((prices[i]! - prev) / prev);
    }

    // เรียกใช้แบบ Type-safe
    const sharpe = ComputeReturnRisk.SharpeRatio(dailyReturns);
    const vol = ComputeReturnRisk.getVolatility(dailyReturns);

    console.log(
      `Sharpe: ${sharpe.toFixed(2)} | Vol: ${(vol * 100).toFixed(2)}%`,
    );
  },
};
