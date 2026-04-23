import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { OrderService } from "./service";

export const OrderModule = new Elysia({ prefix: "/orders" })
  .use(jwt({ name: "jwt", secret: process.env.JWT_SECRET! }))
  // Middleware สำหรับดึงข้อมูล User จาก Token
  .derive(async ({ jwt, headers: { authorization } }) => {
    if (!authorization?.startsWith("Bearer ")) throw new Error("Unauthorized");
    const token = authorization.slice(7);
    const payload = await jwt.verify(token);
    
    if (!payload || typeof payload.userId !== 'number') {
      throw new Error("Unauthorized");
    }
    
    return { userId: payload.userId };
  })

  // 1. ส่งคำสั่งซื้อ (Buy Order)
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
        return { success: true, data: result };
      } catch (error) {
        const err = error as Error;
        set.status = 400;
        return { success: false, error: err.message };
      }
    },
    {
      body: t.Object({
        symbol: t.String({ description: "สัญลักษณ์สินทรัพย์ เช่น BTC, AAPL" }),
        quantity: t.Numeric({ minimum: 0, description: "จำนวนที่ต้องการซื้อ" }),
        port_name: t.String({ description: "ชื่อพอร์ตที่ต้องการเพิ่มสินทรัพย์เข้า" })
      }),
      detail: {
        tags: ["Order"],
        summary: "ส่งคำสั่งซื้อสินทรัพย์",
        description: "หักเงินในบัญชีและเพิ่มสินทรัพย์เข้าในพอร์ตที่ระบุ"
      }
    }
  )

  // 2. ส่งคำสั่งขาย (Sell Order)
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
        return { success: true, data: result };
      } catch (error) {
        const err = error as Error;
        set.status = 400;
        return { success: false, error: err.message };
      }
    },
    {
      body: t.Object({
        symbol: t.String({ description: "สัญลักษณ์สินทรัพย์ เช่น BTC, AAPL" }),
        quantity: t.Numeric({ minimum: 0, description: "จำนวนที่ต้องการขาย" }),
        port_name: t.String({ description: "ชื่อพอร์ตที่ต้องการขายสินทรัพย์ออก" })
      }),
      detail: {
        tags: ["Order"],
        summary: "ส่งคำสั่งขายสินทรัพย์",
        description: "ลดจำนวนสินทรัพย์ในพอร์ตและเพิ่มเงินเข้าในบัญชี"
      }
    }
  );