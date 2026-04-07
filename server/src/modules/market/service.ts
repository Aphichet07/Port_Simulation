import * as finnhub from 'finnhub';

const priceCache = new Map<
  string,
  { price: number; change: number; timestamp: number }
>();


interface FinnhubCandleResponse {
  c: number[]; // ราคาปิด (Close prices)
  h: number[]; // ราคาสูงสุด (High prices)
  l: number[]; // ราคาต่ำสุด (Low prices)
  o: number[]; // ราคาเปิด (Open prices)
  s: string;   // สถานะ เช่น "ok" หรือ "no_data"
  t: number[]; // เวลาแบบ UNIX Timestamps
  v: number[]; // ปริมาณการซื้อขาย (Volume)
}


function toUnixTimestamp(date: Date): number {
  return Math.floor(date.getTime() / 1000);
}


export const MarketService = {
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
      // c คือ Current Price, d คือ Change
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
  async getHistory(symbol: String, startDate: Date, endDate: Date) {
    const symbolUpper = symbol.toUpperCase();
    const from = toUnixTimestamp(startDate);
    const to = toUnixTimestamp(endDate);
    const resolution = "D";

    try {
      const API_KEY = process.env.FINNHUB_API_KEY;
      const response = await fetch(
        `https://finnhub.io/api/v1/stock/candle?symbol=${symbolUpper}&resolution=${resolution}&from=${from}&to=${to}&token=${API_KEY}`,
      );
      const data = await response.json() as FinnhubCandleResponse;

      if (data.s !== 'ok') {
        console.warn(`No data found for ${symbolUpper} in this timeframe.`);
        return [];
      }
      const formattedData = data.t.map((unixTime: number, index: number) => ({
        date: new Date(unixTime * 1000).toISOString().split("T")[0], // แปลงกลับเป็น YYYY-MM-DD
        closePrice: data.c[index],
      }));
    } catch (error) {
      console.log(error)
      return {message: error}
    }
  },
};
