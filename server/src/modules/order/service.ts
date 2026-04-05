import { eq, and } from "drizzle-orm";
import { db } from "../../db";
import { users } from "../../db/schema/users";
import { orders } from "../../db/schema/order";
import { portfolio } from "../../db/schema/portfolio";
import { MarketService } from "../market/service";

export const OrderService = {
  async buyAsset(userId: number, symbol: string, quantity: number) {
    const symbolUpper = symbol.toUpperCase();

    //  ดึงราคาล่าสุดจากตลาด
    const marketData = await MarketService.getLivePrice(symbolUpper);
    if (!marketData)
      throw new Error(`ไม่สามารถดึงราคาล่าสุดของ ${symbolUpper} ได้`);

    const price = marketData.price;
    const totalCost = quantity * price;

    return await db.transaction(async (tx) => {
      // เช็คเงินในกระเป๋า
      const [user] = await tx.select().from(users).where(eq(users.id, userId));
      if (!user) throw new Error("ไม่พบผู้ใช้งาน");

      const currentBalance = parseFloat(user.balance || "0");
      if (currentBalance < totalCost) {
        throw new Error(
          `เงินทุนจำลองไม่เพียงพอ (ต้องการ $${totalCost.toFixed(2)} แต่มี $${currentBalance.toFixed(2)})`,
        );
      }

      // ตัดเงิน
      const newBalance = currentBalance - totalCost;
      await tx
        .update(users)
        .set({ balance: newBalance.toString() })
        .where(eq(users.id, userId));

      // บันทึกประวัติ Order
      await tx.insert(orders).values({
        userId,
        symbol: symbolUpper,
        side: "BUY",
        quantity: quantity.toString(),
        price: price.toString(),
        totalAmount: totalCost.toString(),
      });

      // เอาของใส่พอร์ตโฟลิโอ
      const [existingPosition] = await tx
        .select()
        .from(portfolio)
        .where(
          and(eq(portfolio.userId, userId), eq(portfolio.symbol, symbolUpper)),
        );

      if (existingPosition) {
        const oldQty = parseFloat(existingPosition.quantity);
        const oldAvgPrice = parseFloat(existingPosition.averagePrice);

        const newQty = oldQty + quantity;
        const newAvgPrice = (oldQty * oldAvgPrice + totalCost) / newQty;

        await tx
          .update(portfolio)
          .set({
            quantity: newQty.toString(),
            averagePrice: newAvgPrice.toString(),
            updatedAt: new Date(),
          })
          .where(eq(portfolio.id, existingPosition.id));
      } else {
        await tx.insert(portfolio).values({
          userId,
          symbol: symbolUpper,
          quantity: quantity.toString(),
          averagePrice: price.toString(),
        });
      }

      return {
        success: true,
        message: `ซื้อ ${quantity} ${symbolUpper} ที่ราคา $${price} สำเร็จ`,
        balance: newBalance,
      };
    });
  },

  async sellAsset(userId: number, symbol: string, quantity: number) {
    const symbolUpper = symbol.toUpperCase();

    // ดึงราคาล่าสุดจากตลาด
    const marketData = await MarketService.getLivePrice(symbolUpper);
    if (!marketData)
      throw new Error(`ไม่สามารถดึงราคาล่าสุดของ ${symbolUpper} ได้`);

    const price = marketData.price;
    const totalRevenue = quantity * price;

    return await db.transaction(async (tx) => {
      // เช็คว่ามีหุ้นในพอร์ตพอขายไหม
      const [existingPosition] = await tx
        .select()
        .from(portfolio)
        .where(
          and(eq(portfolio.userId, userId), eq(portfolio.symbol, symbolUpper)),
        );

      if (!existingPosition) throw new Error(`คุณไม่มี ${symbolUpper} ในพอร์ต`);

      const currentQty = parseFloat(existingPosition.quantity);
      if (currentQty < quantity)
        throw new Error("จำนวนสินทรัพย์ไม่เพียงพอสำหรับการขาย");

      // เพิ่มเงินเข้ากระเป๋า
      const [user] = await tx.select().from(users).where(eq(users.id, userId));
      if (!user) {
        throw new Error("ไม่พบ user");
      }
      const newBalance = parseFloat(user.balance || "0") + totalRevenue;

      await tx
        .update(users)
        .set({ balance: newBalance.toString() })
        .where(eq(users.id, userId));

      // บันทึกประวัติ Order
      await tx.insert(orders).values({
        userId,
        symbol: symbolUpper,
        side: "SELL",
        quantity: quantity.toString(),
        price: price.toString(),
        totalAmount: totalRevenue.toString(),
      });

      // หักของออกจากพอร์ตโฟลิโอ
      const remainingQty = currentQty - quantity;

      if (remainingQty === 0) {
        await tx.delete(portfolio).where(eq(portfolio.id, existingPosition.id));
      } else {
        await tx
          .update(portfolio)
          .set({ quantity: remainingQty.toString(), updatedAt: new Date() })
          .where(eq(portfolio.id, existingPosition.id));
      }

      return {
        success: true,
        message: `ขาย ${quantity} ${symbolUpper} ที่ราคา $${price} สำเร็จ`,
        balance: newBalance,
      };
    });
  },
};
