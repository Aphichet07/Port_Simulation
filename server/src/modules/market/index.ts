import { Elysia, t } from "elysia";
import { MarketService } from "./service";
import { BacktestSetvice } from "../backtest/service";

export const MarketModule = new Elysia({ prefix: "/market" })
  .get("/asset", async ({ set }) => {
    try {
      const data = await MarketService.getAllAssets();
      return {
        success: true,
        total: data.length,
        data: data,
      };
    } catch (error: any) {
      console.log(error);
      set.status = 500;
      return { message: error };
    }
  })

  .get("/asset/:symbol", async ({ params, set }) => {
    const symbol = params.symbol;

    const data = await MarketService.getLivePrice(symbol);

    if (!data) {
      set.status = 404;
      return { success: false, error: "ไม่พบข้อมูลหุ้นสัญลักษณ์นี้" };
    }

    return { success: true, data: data };
  })
  .post(
    "/history",
    async ({ body, set }) => {
      try {
        const data = await MarketService.getHistory(
          body.symbol,
          body.startDate,
          body.endDate,
        );
        return data;
      } catch (error) {
        set.status = 500;
        console.log(error);
        return { message: error };
      }
    },
    {
      body: t.Object({
        symbol: t.String(),
        startDate: t.Date(),
        endDate: t.Date(),
      }),
    },
  )
  .get("/test", async () => {
    MarketService.test();
  })
  .get("/test2", async () => {
    MarketService.test2();
  })

  .ws("/live", {
    body: t.Object({
      action: t.String(), // 'subscribe' หรือ 'unsubscribe'
      symbol: t.String(), // 'AAPL', 'TSLA'
    }),

    open(ws) {
      console.log("Client connected to Market WebSocket");
    },

    message(ws, message) {
      if (message.action === "subscribe") {
        const symbol = message.symbol;
        console.log(`User subscribed to: ${symbol}`);

        MarketService.getLivePrice(symbol).then((data) => {
          if (data) ws.send({ type: "PRICE_UPDATE", data });
        });

        const intervalId = setInterval(async () => {
          const data = await MarketService.getLivePrice(symbol);
          if (data) {
            ws.send({ type: "PRICE_UPDATE", data });
          }
        }, 10000);

        ws.data = { ...ws.data, [`interval_${symbol}`]: intervalId };
      }

      if (message.action === "unsubscribe") {
        const symbol = message.symbol;
        const intervalId = (ws.data as any)[`interval_${symbol}`];
        if (intervalId) {
          clearInterval(intervalId);
          console.log(`User unsubscribed from: ${symbol}`);
        }
      }
    },

    close(ws) {
      console.log("Client disconnected");
      for (const key in ws.data) {
        if (key.startsWith("interval_")) {
          clearInterval((ws.data as any)[key]);
        }
      }
    },
  });
