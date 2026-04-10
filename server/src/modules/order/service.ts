import { eq, and } from "drizzle-orm";
import { db } from "../../db";
import { users } from "../../db/schema/users";
import { portfolios } from "../../db/schema/portfolios";
import { positions } from "../../db/schema/positions"; 
import { transactions } from "../../db/schema/transactions"; 
import { assets } from "../../db/schema/assets"; 
import { MarketService } from "../market/service";

export const OrderService = {
  async buyAsset(
    userId: number,
    symbol: string, 
    quantity: number,
    port_name: string,
  ) {
    if (quantity <= 0) throw new Error("จำนวนที่ซื้อต้องมากกว่า 0");

    const symbolUpper = symbol.toUpperCase();

    // ดึงราคาล่าสุดจากตลาด
    const marketData = await MarketService.getLivePrice(symbolUpper);
    if (!marketData)
      throw new Error(`ไม่สามารถดึงราคาล่าสุดของ ${symbolUpper} ได้`);

    const price = marketData.price;
    const totalCost = quantity * price;

    return await db.transaction(async (tx) => {
      let [asset] = await tx
        .select()
        .from(assets)
        .where(eq(assets.symbol, symbolUpper));

      // ถ้าไม่เคยมีสินทรัพย์นี้ใน DB ให้สร้างใหม่ทันที
      if (!asset) {
        [asset] = await tx
          .insert(assets)
          .values({ 
            symbol: symbolUpper,
            name: `${symbolUpper} (Auto-created)`, 
            type: "crypto", 
            exchange: "UNKNOWN" 
          })
          .returning();
      }
      if (!asset) throw new Error("System Error: เกิดข้อผิดพลาดในการดึงข้อมูล Asset");

      const assetId = asset.id; 

      // ดึงข้อมูล Portfolio ตามชื่อพอร์ตของ User
      const [portfolio] = await tx
        .select()
        .from(portfolios)
        .where(
          and(
            eq(portfolios.userId, userId),
            eq(portfolios.port_name, port_name)
          )
        );

      if (!portfolio) throw new Error("ไม่พบ Portfolio ที่ระบุ");

      // เช็คเงินในกระเป๋า
      const currentBalance = Number(portfolio.cashBalance ?? 0);
      if (currentBalance < totalCost) {
        const error: any = new Error("Insufficient funds");
        error.insufficient = true;
        error.required = totalCost;
        error.available = currentBalance;
        throw error;
      }

      // ตัดเงิน 
      const newBalance = currentBalance - totalCost;
      await tx
        .update(portfolios)
        .set({ cashBalance: newBalance.toFixed(2) })
        .where(eq(portfolios.id, portfolio.id));

      // บันทึกประวัติลง Transactions
      await tx.insert(transactions).values({
        userId,
        assetId,
        type: "BUY",
        quantity: quantity.toString(),
        pricePerUnit: price.toFixed(4),
        totalAmount: totalCost.toFixed(2),
        executedAt: new Date(),
      });

      // จัดการ Positions ในพอร์ต
      const [existingPosition] = await tx
        .select()
        .from(positions)
        .where(
          and(
            eq(positions.portfolioId, portfolio.id),
            eq(positions.assetId, assetId)
          )
        );

      if (existingPosition) {
        // ถัวเฉลี่ยต้นทุน (DCA)
        const oldQty = parseFloat(existingPosition.quantity);
        const oldAvgPrice = parseFloat(existingPosition.averagePrice);

        const newQty = oldQty + quantity;
        const newAvgPrice = (oldQty * oldAvgPrice + totalCost) / newQty;

        await tx
          .update(positions)
          .set({
            quantity: newQty.toString(),
            averagePrice: newAvgPrice.toFixed(4),
            updatedAt: new Date(),
          })
          .where(eq(positions.id, existingPosition.id));
      } else {
        // เพิ่มสินทรัพย์ใหม่เข้าพอร์ต
        await tx.insert(positions).values({
          portfolioId: portfolio.id,
          assetId: assetId,
          quantity: quantity.toString(),
          averagePrice: price.toFixed(4),
        });
      }

      return {
        success: true,
        message: `ซื้อ ${quantity} ${symbolUpper} ที่ราคา $${price} สำเร็จ`,
        balance: newBalance,
      };
    });
  },

  async sellAsset(
    userId: number,
    symbol: string,
    quantity: number,
    port_name: string 
  ) {
    if (quantity <= 0) throw new Error("จำนวนที่ขายต้องมากกว่า 0");

    const symbolUpper = symbol.toUpperCase();

    // ดึงราคาล่าสุดจากตลาด
    const marketData = await MarketService.getLivePrice(symbolUpper);
    if (!marketData)
      throw new Error(`ไม่สามารถดึงราคาล่าสุดของ ${symbolUpper} ได้`);

    const price = marketData.price;
    const totalRevenue = quantity * price;

    return await db.transaction(async (tx) => {
      const [asset] = await tx
        .select()
        .from(assets)
        .where(eq(assets.symbol, symbolUpper));
      
      if (!asset) throw new Error(`ไม่รู้จักสินทรัพย์ ${symbolUpper} ในระบบ`);
      const assetId = asset.id;

      // ดึงข้อมูล Portfolio
      const [portfolio] = await tx
        .select()
        .from(portfolios)
        .where(
          and(
            eq(portfolios.userId, userId),
            eq(portfolios.port_name, port_name)
          )
        );

      if (!portfolio) throw new Error("ไม่พบ Portfolio ที่ระบุ");

      // เช็คว่ามีสินทรัพย์ในพอร์ตพอขายไหม
      const [existingPosition] = await tx
        .select()
        .from(positions)
        .where(
          and(
            eq(positions.portfolioId, portfolio.id),
            eq(positions.assetId, assetId) 
          )
        );

      if (!existingPosition) throw new Error(`คุณไม่มี ${symbolUpper} ในพอร์ตนี้`);

      const currentQty = parseFloat(existingPosition.quantity);
      if (currentQty < quantity)
        throw new Error("จำนวนสินทรัพย์ไม่เพียงพอสำหรับการขาย");

      // เพิ่มเงินเข้ากระเป๋า
      const currentBalance = parseFloat(portfolio.cashBalance?.toString() || "0");
      const newBalance = currentBalance + totalRevenue;

      await tx
        .update(portfolios)
        .set({ cashBalance: newBalance.toFixed(2) })
        .where(eq(portfolios.id, portfolio.id));

      // บันทึกประวัติลง Transactions
      await tx.insert(transactions).values({
        userId,
        assetId,
        type: "SELL",
        quantity: quantity.toString(),
        pricePerUnit: price.toFixed(4),
        totalAmount: totalRevenue.toFixed(2),
        executedAt: new Date(),
      });

      // หักของออกจาก Positions
      const remainingQty = currentQty - quantity;

      if (remainingQty <= 0) { 
        // ขายหมดเกลี้ยง ลบ Position ทิ้ง
        await tx.delete(positions).where(eq(positions.id, existingPosition.id));
      } else {
        // อัปเดตจำนวนที่เหลือ
        await tx
          .update(positions)
          .set({ 
            quantity: remainingQty.toString(), 
            updatedAt: new Date() 
          })
          .where(eq(positions.id, existingPosition.id));
      }

      return {
        success: true,
        message: `ขาย ${quantity} ${symbolUpper} ที่ราคา $${price} สำเร็จ`,
        balance: newBalance,
      };
    });
  },
};