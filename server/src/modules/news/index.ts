import { Elysia, t } from "elysia";
import { NewsService } from "./service";

export const NewsModule = new Elysia({ prefix: "/news" })
  .get("/:symbol", 
    async ({ params, query, set }) => {
      const symbol = params.symbol;
      const limit = query.limit || 20;
      
      console.log(`📰 Fetching news for ${symbol}, limit: ${limit}`);
      
      const data = await NewsService.getNews(symbol, limit);

      if (!data.news || data.news.length === 0) {
        set.status = 404;
        return { success: false, data };
      }

      return { success: true, data };
    },
    {
      query: t.Object({
        limit: t.Optional(t.Numeric()),
      }),
    }
  );
