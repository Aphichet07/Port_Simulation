import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { AlgoController } from "./controller";

export const AlgoModule = new Elysia({ prefix: "/algo" })
  .use(jwt({ name: "jwt", secret: process.env.JWT_SECRET! }))

  .derive(async ({ jwt, headers: { authorization } }) => {
    if (!authorization?.startsWith("Bearer ")) throw new Error("Unauthorized");
    const token = authorization.slice(7);
    const payload = await jwt.verify(token);
    if (!payload) throw new Error("Unauthorized");
    return { userId: payload.userId as number, token };
  })

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

  .get("/containers", async ({ set }) => {
    const result = await AlgoController.getContainers();
    if (!result.success) set.status = 500;
    return result;
  })

  .get("/containers/:id", async ({ params, set }) => {
    const result = await AlgoController.getContainerById(params.id);
    if (!result.success) set.status = 404;
    return result;
  })

  .post("/containers/:id/stop", async ({ params, set }) => {
    const result = await AlgoController.stopContainer(params.id);
    if (!result.success) set.status = 400;
    return result;
  })

  .get("/containers/:id/logs", async ({ params, set }) => {
    const result = await AlgoController.getLogs(params.id);
    if (!result.success) set.status = 404;
    return result;
  })

  .get("/containers/:id/trades", async ({ params, set }) => {
    const result = await AlgoController.getTrades(params.id);
    if (!result.success) set.status = 404;
    return result;
  })

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
  )

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
    }
  );