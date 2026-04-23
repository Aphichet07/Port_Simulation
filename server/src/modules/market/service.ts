import YahooFinance from "yahoo-finance2";
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
  

  async getBenchmarkPrices(
    symbol: string,
    startDate: Date,
    endDate: Date,
    commonDates: string[]
  ): Promise<number[]> {
    if (commonDates.length === 0) return [];

    const queryOptions = {
      period1: startDate,
      period2: endDate,
      interval: '1d' as const,
    };

    const result = await yahooFinance.historical(symbol, queryOptions);

    const dataMap = new Map<string, number>();
    for (const item of result) {
      const dateStr = item.date.toISOString().split('T')[0];
      
      if (dateStr && item.close !== undefined) {
        dataMap.set(dateStr, item.close);
      }
    }

    const benchmarkPrices: number[] = [];
    let lastValidPrice = 0; 

    for (const date of commonDates) {
      const price = dataMap.get(date);
      
      if (price !== undefined) {
        lastValidPrice = price;
        benchmarkPrices.push(price);
      } else {
        benchmarkPrices.push(lastValidPrice);
      }
    }

    return benchmarkPrices;
  }
};
