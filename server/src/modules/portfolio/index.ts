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
  .get("/me", async ({ userId, set }) => {
    try {
      const port = await PortfolioService.getMyPort(userId);
      if (!port) {
        set.status = 400;
        return { message: "ไม่มี port ในบัญชีนี้" };
      }
      return {
        success: true,
        portfolio: port,
      };
    } catch (error: any) {
      console.log(error);
      set.status = 500;
      return { message: error };
    }
  })
  .get('/analytic', async({userId, set})=>{
    try{
      // ค่อยทำ รอ utils เสร็จหมดก่อน
    }catch(error:any){
      console.log(error)
      set.status = 500
      return {message: error}
    }
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
    "/:port_name",
    async ({ params, userId, set }) => {
      try {
        console.log(userId, params.port_name);
        const data = await PortfolioService.getPortfolioSummary(
          userId,
          params.port_name,
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
  })
  .put(
    "/:port_name/assets/:symbol",
    async ({ userId, params, body, set }) => {
      try {
        const result = await PortfolioService.updateAssetPosition(
          userId,
          params.port_name,
          params.symbol,
          body.quantity,
        );

        return { success: true, ...result };
      } catch (error: any) {
        console.error(error);
        set.status = 400;
        return {
          success: false,
          error: error.message || "เกิดข้อผิดพลาดในการอัปเดตข้อมูลสินทรัพย์",
        };
      }
    },
    {
      params: t.Object({
        port_name: t.String(),
        symbol: t.String(),
      }),
      body: t.Object({
        quantity: t.Numeric(),
        average_price: t.Numeric(),
      }),
    },
  )

  .put(
    "/:port_name",
    async ({ userId, params, body, set }) => {
      try {
        const updatedPort = await PortfolioService.updatePortfolioName(
          userId,
          params.port_name,
          body.new_port_name,
        );

        return {
          success: true,
          message: "อัปเดตชื่อพอร์ตโฟลิโอสำเร็จ",
          data: updatedPort,
        };
      } catch (error: any) {
        console.log(error);
        set.status = 400;
        return {
          success: false,
          message: error.message || "เกิดข้อผิดพลาดในการอัปเดตพอร์ต",
        };
      }
    },
    {
      params: t.Object({
        port_name: t.String(),
      }),
      body: t.Object({
        new_port_name: t.String(),
      }),
    },
  )

  .delete("/:port_name", async ({ userId, params, set }) => {
    try {
      const port = await PortfolioService.deletePort(userId, params.port_name);

      if (!port.success) {
        set.status = 500;
        return { message: "ลบพอร์ตไม่สำเร็จ" };
      }
      set.status = 204;
      return;
    } catch (error: any) {
      console.log(error);
      set.status = 500;
      return { message: error };
    }
  });
