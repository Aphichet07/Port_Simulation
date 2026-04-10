import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { OrderService } from "./service";

export const OrderModule = new Elysia({ prefix: "/orders" })
  .use(jwt({ name: "jwt", secret: process.env.JWT_SECRET! }))
  .derive(async ({ jwt, headers: { authorization } }) => {
    if (!authorization?.startsWith("Bearer ")) throw new Error("Unauthorized");
    const token = authorization.slice(7);
    const payload = await jwt.verify(token);
    if (!payload) throw new Error("Unauthorized");
    return { userId: payload.userId as number };
  })

  .post(
    "/buy",
    async ({ body, userId, set }) => {
      try {
        const result = await OrderService.buyAsset(
          userId,
          body.symbol,
          body.quantity,
          body.port_name
        );
        return result;
      } catch (error: any) {
        set.status = 400;
        return { success: false, error: error.message };
      }
    },
    {
      body: t.Object({
        symbol: t.String(),
        quantity: t.Numeric(),
        port_name: t.String()
      }),
    },
  )

  .post(
    "/sell",
    async ({ body, userId, set }) => {
      try {
        const result = await OrderService.sellAsset(
          userId,
          body.symbol,
          body.quantity,
          body.port_name
        );
        return result;
      } catch (error: any) {
        set.status = 400;
        return { success: false, error: error.message };
      }
    },
    {
      body: t.Object({
        symbol: t.String(),
        quantity: t.Numeric(),
        port_name: t.String()
      }),
    },
  );
