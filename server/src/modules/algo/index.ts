import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { AlgoController } from "./controller";

export const AlgoModule = new Elysia({ prefix: "/algo" })
  .use(jwt({ name: "jwt", secret: process.env.JWT_SECRET! }))

  // ── Authenticated routes ────────────────────────
  .derive(async ({ jwt, headers: { authorization } }) => {
    if (!authorization?.startsWith("Bearer ")) throw new Error("Unauthorized");
    const token = authorization.slice(7);
    const payload = await jwt.verify(token);
    if (!payload) throw new Error("Unauthorized");
    return { userId: payload.userId as number, token };
  })

  // POST /algo/deploy — ส่ง script ไปรันใน Docker sandbox
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
        script: t.String(),
        symbol: t.String(),
      }),
    }
  )

  // GET /algo/containers — ดู bot ทั้งหมด
  .get("/containers", async ({ set }) => {
    const result = await AlgoController.getContainers();
    if (!result.success) set.status = 500;
    return result;
  })

  // GET /algo/containers/:id — ดู bot ตัวเดียว
  .get("/containers/:id", async ({ params, set }) => {
    const result = await AlgoController.getContainerById(params.id);
    if (!result.success) set.status = 404;
    return result;
  })

  // GET /algo/containers/:id/logs — ดู logs ของ bot
  .get("/containers/:id/logs", async ({ params, set }) => {
    const result = await AlgoController.getLogs(params.id);
    if (!result.success) set.status = 404;
    return result;
  })

  // POST /algo/containers/:id/stop — หยุด bot
  .post("/containers/:id/stop", async ({ params, set }) => {
    const result = await AlgoController.stopContainer(params.id);
    if (!result.success) set.status = 400;
    return result;
  })

  // GET /algo/containers/:id/trades — ดูประวัติ trade
  .get("/containers/:id/trades", async ({ params, set }) => {
    const result = await AlgoController.getTrades(params.id);
    if (!result.success) set.status = 404;
    return result;
  })

  // POST /algo/containers/:id/report — SDK callback (bot รายงาน trade)
  .post(
    "/containers/:id/report",
    async ({ params, body, set }) => {
      const result = await AlgoController.reportTrade(params.id, body);
      if (!result.success) set.status = 400;
      return result;
    },
    {
      body: t.Object({
        action: t.Union([t.Literal("BUY"), t.Literal("SELL")]),
        symbol: t.String(),
        quantity: t.Number(),
        executed_price: t.Number(),
      }),
    }
  );