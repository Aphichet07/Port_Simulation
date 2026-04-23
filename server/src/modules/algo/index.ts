import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { AlgoController } from "./controller";

export const AlgoModule = new Elysia({ prefix: "/algo" })
  .use(jwt({ name: "jwt", secret: process.env.JWT_SECRET! }))
  // Middleware สำหรับดึง User Info จาก JWT
  .derive(async ({ jwt, headers: { authorization } }) => {
    if (!authorization?.startsWith("Bearer ")) throw new Error("Unauthorized");
    const token = authorization.slice(7);
    const payload = await jwt.verify(token);
    if (!payload) throw new Error("Unauthorized");
    
    // บังคับ Type เป็น number เพื่อความปลอดภัยใน Strict Mode
    return { 
      userId: payload.userId as number, 
      token 
    };
  })

  // 1. Deploy bot ไปยัง Docker
  .post(
    "/deploy",
    async ({ body, userId, token, set }) => {
      const result = await AlgoController.deploy({
        script: body.script,
        symbol: body.symbol,
        userId,
        token,
      });
      if (!result.success) set.status = 400;
      return result;
    },
    {
      body: t.Object({
        script: t.String({ description: "Python/JS Script สำหรับ Bot" }),
        symbol: t.String({ description: "ชื่อย่อสินทรัพย์ เช่น BTC, AAPL" }),
      }),
      detail: {
        tags: ["Algo Bot"],
        summary: "Deploy trading bot ไปยัง Docker",
        description: "สร้าง Container ใหม่สำหรับรันกลยุทธ์การเทรดแบบอัตโนมัติ"
      }
    }
  )

  // 2. ดู bots ทั้งหมด
  .get("/containers", async ({ set }) => {
    const result = await AlgoController.getContainers();
    if (!result.success) set.status = 500;
    return result;
  }, {
    detail: {
      tags: ["Algo Bot"],
      summary: "รายการ Bot ทั้งหมด"
    }
  })

  // 3. ดูรายละเอียด bot รายตัว
  .get("/containers/:id", async ({ params, set }) => {
    const result = await AlgoController.getContainerById(params.id);
    if (!result.success) set.status = 404;
    return result;
  }, {
    params: t.Object({ id: t.String() }),
    detail: {
      tags: ["Algo Bot"],
      summary: "ดูรายละเอียดของ Bot รายตัว"
    }
  })

  // 4. สั่งหยุดการทำงานของ Bot
  .post("/containers/:id/stop", async ({ params, set }) => {
    const result = await AlgoController.stopContainer(params.id);
    if (!result.success) set.status = 400;
    return result;
  }, {
    params: t.Object({ id: t.String() }),
    detail: {
      tags: ["Algo Bot"],
      summary: "สั่งหยุดการทำงานของ Bot"
    }
  })

  // 5. ดู Logs การทำงาน
  .get("/containers/:id/logs", async ({ params, set }) => {
    const result = await AlgoController.getLogs(params.id);
    if (!result.success) set.status = 404;
    return result;
  }, {
    params: t.Object({ id: t.String() }),
    detail: {
      tags: ["Algo Bot"],
      summary: "ดึง Logs การทำงานจาก Docker"
    }
  })

  // 6. ดูประวัติการเทรด
  .get("/containers/:id/trades", async ({ params, set }) => {
    const result = await AlgoController.getTrades(params.id);
    if (!result.success) set.status = 404;
    return result;
  }, {
    params: t.Object({ id: t.String() }),
    detail: {
      tags: ["Algo Bot"],
      summary: "ดึงประวัติการเทรดของ Bot"
    }
  })

  // 7. บันทึกผลการเทรด (สำหรับ SDK)
  .post(
    "/containers/:id/report",
    async ({ params, body, set }) => {
      const result = await AlgoController.reportTrade(params.id, body);
      if (!result.success) set.status = 400;
      return result;
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        action: t.Union([t.Literal("BUY"), t.Literal("SELL")]),
        symbol: t.String(),
        quantity: t.Number(),
        executed_price: t.Number(),
      }),
      detail: {
        tags: ["Internal"],
        summary: "API สำหรับรายงานผลการเทรด (Internal SDK Use)",
      }
    }
  )

  // 8. ทดสอบ Backtest
  .post(
    "/backtest",
    async ({ body, set }) => {
      const result = await AlgoController.backtest(body);
      if (!result.success) set.status = 400;
      return result;
    },
    {
      body: t.Object({
        script: t.String(),
        symbol: t.String(),
        timeframe: t.String(),
        start_date: t.Optional(t.String()),
        end_date: t.Optional(t.String()),
        max_trades: t.Optional(t.Number()),
      }),
      detail: {
        tags: ["Algo Bot"],
        summary: "ทดสอบกลยุทธ์ย้อนหลัง (Backtest Script)",
      }
    }
  );