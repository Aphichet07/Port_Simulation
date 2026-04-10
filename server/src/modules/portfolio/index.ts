import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { PortfolioService } from "./service";

export const PortfolioModule = new Elysia({ prefix: "/portfolio" })
  .use(jwt({ name: "jwt", secret: process.env.JWT_SECRET! }))
  .derive(async ({ jwt, headers: { authorization } }) => {
    if (!authorization?.startsWith("Bearer ")) throw new Error("Unauthorized");
    const token = authorization.slice(7);
    const payload = await jwt.verify(token);
    if (!payload) throw new Error("Unauthorized");
    return { userId: payload.userId as number };
  })
  .post(
    "/",
    async ({ body, userId, set }) => {
      try {
        const port = await PortfolioService.createPortfolio(
          userId,
          body.port_name,
        );

        set.status = 201;
        return {
          success: true,
          message: "สร้างพอร์ตโฟลิโอสำเร็จ",
          data: port,
        };
      } catch (error: any) {
        console.error("Create Portfolio Error:", error);

        set.status = 500;
        return {
          success: false,
          message: error.message || "เกิดข้อผิดพลาดในการสร้างพอร์ตโฟลิโอ",
        };
      }
    },
    {
      body: t.Object({
        port_name: t.String(),
      }),
    },
  )

  // ดึงภาพรวมพอร์ต
  .get(
    "/port",
    async ({ query, userId, set }) => {
      try {
        console.log(userId, query.port_name);
        const data = await PortfolioService.getPortfolioSummary(
          userId,
          query.port_name,
        );
        return { success: true, data };
      } catch (error: any) {
        set.status = 400;
        return { success: false, error: error.message };
      }
    },
    {
      query: t.Object({
        port_name: t.String(),
      }),
    },
  )

  // ดึงประวัติการซื้อขาย
  .get("/history", async ({ userId, set }) => {
    try {
      const data = await PortfolioService.getTransactionHistory(userId);
      return { success: true, data };
    } catch (error: any) {
      set.status = 400;
      return { success: false, error: error.message };
    }
  });
