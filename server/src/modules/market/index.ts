import { Elysia, t } from "elysia";
import { MarketService } from "./service";

export const MarketModule = new Elysia({ prefix: "/market" })
  // ดึงรายการสินทรัพย์ทั้งหมด
  .get("/asset", async ({ set }) => {
    try {
      const data = await MarketService.getAllAssets();
      return {
        success: true,
        total: data.length,
        data: data,
      };
    } catch (error) {
      const err = error as Error;
      console.error(err.message);
      set.status = 500;
      return { success: false, message: err.message };
    }
  }, {
    detail: {
      tags: ["Market"],
      summary: "ดึงรายการสินทรัพย์ทั้งหมด",
      description: "เรียกดูรายชื่อหุ้นหรือสินทรัพย์ที่มีทั้งหมดในระบบ"
    }
  })

  // ดึงราคา Real-time ของสินทรัพย์รายตัว
  .get("/asset/:symbol", async ({ params, set }) => {
    const { symbol } = params;
    try {
      const data = await MarketService.getLivePrice(symbol);

      if (!data) {
        set.status = 404;
        return { success: false, error: "ไม่พบข้อมูลหุ้นสัญลักษณ์นี้" };
      }

      return { success: true, data: data };
    } catch (error) {
      const err = error as Error;
      set.status = 500;
      return { success: false, error: err.message };
    }
  }, {
    params: t.Object({
      symbol: t.String({ description: "ชื่อย่อสินทรัพย์ เช่น AAPL, BTC" })
    }),
    detail: {
      tags: ["Market"],
      summary: "ดึงราคาปัจจุบัน",
    }
  })

  // ดึงข้อมูลราคาย้อนหลัง
  .post("/history", async ({ body, set }) => {
    try {
      const data = await MarketService.getHistory(
        body.symbol,
        body.startDate,
        body.endDate,
      );
      return { success: true, data };
    } catch (error) {
      const err = error as Error;
      set.status = 500;
      console.error(err.message);
      return { success: false, message: err.message };
    }
  }, {
    body: t.Object({
      symbol: t.String(),
      startDate: t.Date(),
      endDate: t.Date(),
    }),
    detail: {
      tags: ["Market"],
      summary: "ดึงข้อมูลราคาย้อนหลัง (Historical Data)",
    }
  })

  // WebSocket สำหรับราคาสด
  .ws("/live", {
    body: t.Object({
      action: t.Union([t.Literal("subscribe"), t.Literal("unsubscribe")]),
      symbol: t.String(),
    }),
    // กำหนด Type ให้กับ WebSocket Data เพื่อความปลอดภัยใน Strict Mode
    async message(ws, message) {
      const { action, symbol } = message;

      if (action === "subscribe") {
        console.log(`User subscribed to: ${symbol}`);

        // ส่งข้อมูลทันทีครั้งแรก
        const initialData = await MarketService.getLivePrice(symbol);
        if (initialData) ws.send({ type: "PRICE_UPDATE", data: initialData });

        // ตั้ง Interval ส่งข้อมูลทุก 10 วินาที
        const intervalId = setInterval(async () => {
          const data = await MarketService.getLivePrice(symbol);
          if (data) ws.send({ type: "PRICE_UPDATE", data });
        }, 10000);

        // เก็บ Interval ID ไว้ใน ws.data โดยใช้ Record Type casting
        const currentData = (ws.data as Record<string, any>);
        currentData[`interval_${symbol}`] = intervalId;
      }

      if (action === "unsubscribe") {
        const currentData = (ws.data as Record<string, any>);
        const intervalId = currentData[`interval_${symbol}`];
        if (intervalId) {
          clearInterval(intervalId as Timer);
          delete currentData[`interval_${symbol}`];
          console.log(`User unsubscribed from: ${symbol}`);
        }
      }
    },

    close(ws) {
      console.log("Client disconnected");
      const currentData = (ws.data as Record<string, any>);
      for (const key in currentData) {
        if (key.startsWith("interval_")) {
          clearInterval(currentData[key] as Timer);
        }
      }
    },
    detail: {
      tags: ["Market WebSocket"],
      summary: "WebSocket สำหรับติดตามราคา Real-time",
    }
  });