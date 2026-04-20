import { eq, and, desc, sql } from "drizzle-orm";
import { db } from "../../db";
import { users } from "../../db/schema/users";
import { portfolios } from "../../db/schema/portfolios";
import { positions } from "../../db/schema/positions";
import { transactions } from "../../db/schema/transactions";
import { assets } from "../../db/schema/assets";
import { MarketService } from "../market/service";
import { portfolioAssets } from "../../db/schema/portfolio_asset";

export interface AssetInput {
  symbol: string;
  weight: number;
}

export const PortfolioService = {
  // เช็คพอร์ตในบัญชีนี้
  async getMyPort(userId: number) {
    const ports = await db
      .select({
        port_name: portfolios.port_name,
      })
      .from(portfolios)
      .where(eq(portfolios.userId, userId));

    return ports;
  },

  // สร้างพอร์ตใหม่
  async createPortfolio(userId: number, port_name: string) {
    const [newPortfolio] = await db
      .insert(portfolios)
      .values({
        userId,
        port_name,
      })
      .returning();

    return newPortfolio;
  },

  // ดึงสรุปข้อมูลพอร์ต
  async getPortfolioSummary(userId: number, port_name: string) {
    console.log(userId, port_name);
    // ดึงข้อมูลพอร์ตและเงินสดคงเหลือ
    const [portfolio] = await db
      .select()
      .from(portfolios)
      .where(
        and(eq(portfolios.userId, userId), eq(portfolios.port_name, port_name)),
      );

    if (!portfolio) throw new Error("ไม่พบพอร์ตโฟลิโอที่ระบุ");

    const cashBalance = parseFloat(portfolio.cashBalance?.toString() || "0");

    // ดึงรายการสินทรัพย์
    const userPositions = await db
      .select({
        id: positions.id,
        assetId: positions.assetId,
        symbol: assets.symbol,
        quantity: positions.quantity,
        averagePrice: positions.averagePrice,
      })
      .from(positions)
      .innerJoin(assets, eq(positions.assetId, assets.id))
      .where(eq(positions.portfolioId, portfolio.id));

    // คำนวณมูลค่าและ PnL
    let totalAssetValue = 0;

    const enrichedPositions = await Promise.all(
      userPositions.map(async (pos) => {
        const marketData = await MarketService.getLivePrice(pos.symbol);

        const quantity = parseFloat(pos.quantity?.toString() || "0");
        const averagePrice = parseFloat(pos.averagePrice?.toString() || "0"); // ต้นทุน

        const currentPrice = marketData ? marketData.price : averagePrice;

        const currentValue = quantity * currentPrice; // มูลค่าปัจจุบัน
        const totalCost = quantity * averagePrice; // มูลค่าต้นทุน

        const unrealizedPnL = currentValue - totalCost; // กำไร/ขาดทุน
        const unrealizedPnLPercent =
          totalCost > 0 ? (unrealizedPnL / totalCost) * 100 : 0;

        totalAssetValue += currentValue;

        return {
          id: pos.id,
          symbol: pos.symbol,
          quantity,
          averagePrice,
          currentPrice,
          currentValue,
          unrealizedPnL,
          unrealizedPnLPercent,
        };
      }),
    );

    const netWorth = cashBalance + totalAssetValue; // ความมั่งคั่งสุทธิ (เงินสด + หุ้น)

    return {
      portfolioId: portfolio.id,
      portName: portfolio.port_name,
      netWorth,
      cashBalance,
      totalAssetValue,
      positions: enrichedPositions,
    };
  },
  async Create(userId: number, name: string, assets: AssetInput[]) {
    const totalWeight = assets.reduce((sum, item) => sum + item.weight, 0);
    if (Math.abs(totalWeight - 1) > 0.0001) {
      throw new Error(
        `Total asset weight must be exactly 1. Current is ${totalWeight}`,
      );
    }

    try {
      const result = await db.transaction(async (tx) => {
        const [newPortfolio] = await tx
          .insert(portfolios)
          .values({
            userId: userId,
            port_name: name,
          })
          .returning({
            id: portfolios.id,
            port_name: portfolios.port_name,
            cashBalance: portfolios.cashBalance,
          });

        if (!newPortfolio || newPortfolio.id === undefined) {
          throw new Error("Failed to create portfolio record.");
        }

        const assetsToInsert = assets.map((a) => ({
          portfolioId: newPortfolio.id,
          symbol: a.symbol.toUpperCase(),
          weight: a.weight.toString(),
        }));

        const insertedAssets = await tx
          .insert(portfolioAssets)
          .values(assetsToInsert)
          .returning({
            symbol: portfolioAssets.symbol,
            weight: portfolioAssets.weight,
          });

        return {
          ...newPortfolio,
          assets: insertedAssets,
        };
      });

      return result;
    } catch (error: any) {
      console.error("[PortfolioService.createPortfolio] Error:", error);
      throw new Error(
        "Could not create portfolio. Database transaction failed.",
      );
    }
  },

  // ดึงประวัติการทำธุรกรรมย้อนหลัง
  async getTransactionHistory(userId: number) {
    // ดึงประวัติจากตาราง transactions
    const history = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.executedAt)) // อิงจาก executed_at ใน DB
      .limit(50);

    return history;
  },
  async updateAssetPosition(
    userId: number,
    port_name: string,
    symbol: string,
    newQuantity: number,
  ) {
    const symbolUpper = symbol.toUpperCase();

    if (newQuantity < 0) throw new Error("จำนวนสินทรัพย์ต้องไม่ติดลบ");

    // ดึงราคาตลาดปัจจุบัน
    const marketData = await MarketService.getLivePrice(symbolUpper);
    if (!marketData)
      throw new Error(`ไม่สามารถดึงราคาล่าสุดของ ${symbolUpper} ได้`);
    const currentMarketPrice = marketData.price;

    return await db.transaction(async (tx) => {
      // หาพอร์ตและ Asset ID
      const [portfolio] = await tx
        .select()
        .from(portfolios)
        .where(
          and(
            eq(portfolios.userId, userId),
            eq(portfolios.port_name, port_name),
          ),
        );
      if (!portfolio) throw new Error(`ไม่พบพอร์ตโฟลิโอชื่อ "${port_name}"`);

      const [asset] = await tx
        .select()
        .from(assets)
        .where(eq(assets.symbol, symbolUpper));
      if (!asset) throw new Error(`ไม่รู้จักสินทรัพย์ ${symbolUpper} ในระบบ`);

      // หา Position เก่า
      const [position] = await tx
        .select()
        .from(positions)
        .where(
          and(
            eq(positions.portfolioId, portfolio.id),
            eq(positions.assetId, asset.id),
          ),
        );

      if (!position) {
        throw new Error(
          `ไม่พบข้อมูลของ ${symbolUpper} ในพอร์ตนี้ กรุณาซื้อก่อนอัปเดต`,
        );
      }

      if (newQuantity === 0) {
        await tx.delete(positions).where(eq(positions.id, position.id));
        return { message: `ลบ ${symbolUpper} ออกจากพอร์ตเรียบร้อยแล้ว` };
      }

      // คำนวณ Average Price
      const oldQuantity = parseFloat(position.quantity);
      const oldAvgPrice = parseFloat(position.averagePrice);
      let calculatedAvgPrice = oldAvgPrice; // ตั้งค่าเริ่มต้นเป็นของเดิมก่อน

      if (newQuantity > oldQuantity) {
        const qtyDiff = newQuantity - oldQuantity;
        const oldTotalCost = oldQuantity * oldAvgPrice;
        const newTotalCost = qtyDiff * currentMarketPrice;

        calculatedAvgPrice = (oldTotalCost + newTotalCost) / newQuantity;
      } else if (newQuantity < oldQuantity) {
        calculatedAvgPrice = oldAvgPrice;
      }

      const [updatedPosition] = await tx
        .update(positions)
        .set({
          quantity: newQuantity.toFixed(6),
          averagePrice: calculatedAvgPrice.toFixed(4),
          updatedAt: new Date(),
        })
        .where(eq(positions.id, position.id))
        .returning();

      return {
        message: `ปรับจำนวน ${symbolUpper} เป็น ${newQuantity} สำเร็จ`,
        data: updatedPosition,
      };
    });
  },
  async updatePortfolioName(
    userId: number,
    currentPortName: string,
    newPortName: string,
  ) {
    // เช็คก่อนว่าตั้งชื่อใหม่ไปซ้ำกับพอร์ตอื่นที่ตัวเองมีอยู่แล้วหรือเปล่า
    const [duplicatePort] = await db
      .select()
      .from(portfolios)
      .where(
        and(
          eq(portfolios.userId, userId),
          eq(portfolios.port_name, newPortName),
        ),
      );

    if (duplicatePort) {
      throw new Error(
        `คุณมีพอร์ตชื่อ "${newPortName}" อยู่แล้ว กรุณาใช้ชื่ออื่น`,
      );
    }

    // ทำการอัปเดตชื่อพอร์ต
    const [updatedPort] = await db
      .update(portfolios)
      .set({ port_name: newPortName })
      .where(
        and(
          eq(portfolios.userId, userId),
          eq(portfolios.port_name, currentPortName),
        ),
      )
      .returning();

    if (!updatedPort) {
      throw new Error(`ไม่พบพอร์ตโฟลิโอชื่อ "${currentPortName}"`);
    }

    return updatedPort;
  },

  async deletePort(userId: number, port_name: string) {
    return await db.transaction(async (tx) => {
      // หาพอร์ต
      const [portfolio] = await tx
        .select()
        .from(portfolios)
        .where(
          and(
            eq(portfolios.userId, userId),
            eq(portfolios.port_name, port_name),
          ),
        );

      if (!portfolio) {
        throw new Error(`ไม่พบพอร์ตโฟลิโอชื่อ "${port_name}"`);
      }

      //ลบพอร์ตที่ยังมีสินทรัพย์ค้างอยู่
      const existingPositions = await tx
        .select()
        .from(positions)
        .where(eq(positions.portfolioId, portfolio.id));

      if (existingPositions.length > 0) {
        throw new Error(
          `ไม่สามารถลบพอร์ตได้! คุณยังมีสินทรัพย์ค้างอยู่ในพอร์ตนี้ กรุณาขายออกให้หมดก่อน`,
        );
      }

      // ถ้าพอร์ตว่างเปล่าแล้วลบได้เลย
      await tx.delete(portfolios).where(eq(portfolios.id, portfolio.id));

      return {
        success: true,
        message: `ลบพอร์ตโฟลิโอ ${port_name} สำเร็จเรียบร้อยแล้ว`,
      };
    });
  },

  async getAssetInPort(portName: string) {
  const result = await db
    .select({
      symbol: portfolioAssets.symbol,
      weight: sql<number>`CAST(${portfolioAssets.weight} AS FLOAT)`,
    })
    .from(portfolios)
    .innerJoin(
      portfolioAssets,
      eq(portfolios.id, portfolioAssets.portfolioId)
    )
    .where(eq(portfolios.port_name, portName));

  return result;
}
};
