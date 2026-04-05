const priceCache = new Map<
  string,
  { price: number; change: number; timestamp: number }
>();

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
};
