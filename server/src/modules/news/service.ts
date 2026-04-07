export const NewsService = {
  async getNews(symbol: string, limit: number = 20) {
    const symbolUpper = symbol.toUpperCase();
    
    try {
      const API_KEY = process.env.FINNHUB_API_KEY;
      
      // Get news for the past 30 days
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      const formattedStart = startDate.toISOString().split('T')[0];
      const formattedEnd = endDate.toISOString().split('T')[0];
      
      const response = await fetch(
        `https://finnhub.io/api/v1/company-news?symbol=${symbolUpper}&from=${formattedStart}&to=${formattedEnd}&token=${API_KEY}`,
      );

      const data = (await response.json()) as any;
      
      if (!Array.isArray(data)) {
        throw new Error("ไม่สามารถดึงข่าวได้");
      }

      // Finnhub ไม่รองรับ limit parameter ต้อง slice เอง
      const slicedData = data.slice(0, limit);

      return {
        symbol: symbolUpper,
        news: slicedData.map((item: any) => ({
          headline: item.headline,
          summary: item.summary,
          image: item.image,
          source: item.source,
          url: item.url,
          datetime: item.datetime,
          category: item.category,
        })),
      };
    } catch (error) {
      console.error(`ดึงข่าว ${symbolUpper} ล้มเหลว:`, error);
      return {
        symbol: symbolUpper,
        news: [],
        error: "ไม่สามารถดึงข่าวได้ ลองใหม่ในภายหลัง",
      };
    }
  },
};
