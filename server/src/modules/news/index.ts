import { Elysia, t } from "elysia";
import { NewsService } from "./service";

export const NewsModule = new Elysia({ prefix: "/news" })
  .get("/:symbol", 
    async ({ params, query, set }) => {
      try {
        const { symbol } = params;
        const limit = query.limit ?? 20;
        
        console.log(`📰 Fetching news for ${symbol}, limit: ${limit}`);
        
        const data = await NewsService.getNews(symbol, limit);

        if (!data || !data.news || data.news.length === 0) {
          set.status = 404;
          return { 
            success: false, 
            message: `ไม่พบข่าวสารสำหรับสัญลักษณ์: ${symbol}` 
          };
        }

        return { 
          success: true, 
          data: data.news,
          count: data.news.length 
        };
      } catch (error) {
        const err = error as Error;
        set.status = 500;
        return { 
          success: false, 
          error: err.message || "เกิดข้อผิดพลาดในการดึงข้อมูลข่าวสาร" 
        };
      }
    },
    {
      params: t.Object({
        symbol: t.String({ description: "ชื่อย่อสินทรัพย์ เช่น AAPL, BTC, TSLA" })
      }),
      query: t.Object({
        limit: t.Optional(
          t.Numeric({ 
            default: 20, 
            minimum: 1, 
            maximum: 100,
            description: "จำนวนข่าวที่ต้องการดึง (สูงสุด 100)" 
          })
        ),
      }),
      detail: {
        tags: ["Market"],
        summary: "ดึงข่าวสารล่าสุดของสินทรัพย์",
        description: "ดึงข่าวสารที่เกี่ยวข้องกับหุ้นหรือคริปโทเคอร์เรนซีรายตัวจากแหล่งข้อมูลภายนอก"
      }
    }
  );