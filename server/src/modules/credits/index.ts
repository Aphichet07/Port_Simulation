import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { CreditsService } from "./service";

export const CreditsModule = new Elysia({ prefix: "/credits" })
  .use(jwt({ name: "jwt", secret: process.env.JWT_SECRET! }))
  .derive(async ({ jwt, headers: { authorization } }) => {
    if (!authorization?.startsWith("Bearer ")) throw new Error("Unauthorized");
    const token = authorization.slice(7);
    const payload = await jwt.verify(token);
    if (!payload) throw new Error("Unauthorized");
    return { userId: payload.userId as number };
  })

  // ดึง balance ปัจจุบัน
  .get(
    "/balance",
    async ({ userId, set }) => {
      try {
        if (!userId) throw new Error("Unauthorized");
        const result = await CreditsService.getBalance(userId);
        return result;
      } catch (error: any) {
        set.status = 400;
        return { success: false, error: error.message };
      }
    },
  )

  // รีเซ็ต credits กลับค่าเริ่มต้น (100,000)
  .post(
    "/reset",
    async ({ userId, set }) => {
      try {
        const result = await CreditsService.resetCredits(userId);
        return result;
      } catch (error: any) {
        set.status = 400;
        return { success: false, error: error.message };
      }
    },
  )

  // เพิ่ม credits (Admin only)
  .post(
    "/add",
    async ({ body, userId, set }) => {
      try {
        if (!userId) throw new Error("Unauthorized");
        const result = await CreditsService.addCredits(
          userId,
          body.amount,
          body.reason,
        );
        return result;
      } catch (error: any) {
        set.status = 400;
        return { success: false, error: error.message };
      }
    },
    {
      body: t.Object({
        amount: t.Numeric(),
        reason: t.Optional(t.String()),
      }),
    },
  )

  // ดูประวัติธุรกรรม
  .get(
    "/history",
    async ({ userId, query, set }) => {
      try {
        if (!userId) throw new Error("Unauthorized");
        const limit = query.limit ? parseInt(query.limit) : 50;
        const result = await CreditsService.getTransactionHistory(userId, limit);
        return {
          userId,
          transactions: result,
          total: result.length,
        };
      } catch (error: any) {
        set.status = 400;
        return { success: false, error: error.message };
      }
    },
  );
