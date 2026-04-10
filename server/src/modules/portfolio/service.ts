import { eq, and, desc } from 'drizzle-orm';
import { db } from '../../db';
import { users } from '../../db/schema/users';
import { portfolios } from '../../db/schema/portfolios';
import { positions } from '../../db/schema/positions';
import { transactions } from '../../db/schema/transactions';
import { assets } from '../../db/schema/assets';
import { MarketService } from '../market/service';

export const PortfolioService = {
  // สร้างพอร์ตใหม่ 
  async createPortfolio(userId: number, port_name: string) {
    const [newPortfolio] = await db.insert(portfolios).values({
      userId,
      port_name,
    }).returning();
    
    return newPortfolio;
  },

  // ดึงสรุปข้อมูลพอร์ต 
  async getPortfolioSummary(userId: number, port_name: string) {
    console.log(userId, port_name)
    // ดึงข้อมูลพอร์ตและเงินสดคงเหลือ
    const [portfolio] = await db
      .select()
      .from(portfolios)
      .where(and(eq(portfolios.userId, userId), eq(portfolios.port_name, port_name)));
      
    if (!portfolio) throw new Error("ไม่พบพอร์ตโฟลิโอที่ระบุ");

    const cashBalance = parseFloat(portfolio.cashBalance?.toString() || '0');

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
    
    const enrichedPositions = await Promise.all(userPositions.map(async (pos) => {
  
      const marketData = await MarketService.getLivePrice(pos.symbol);
      
      const quantity = parseFloat(pos.quantity?.toString() || '0');
      const averagePrice = parseFloat(pos.averagePrice?.toString() || '0'); // ต้นทุน
      
      const currentPrice = marketData ? marketData.price : averagePrice; 
      
      const currentValue = quantity * currentPrice; // มูลค่าปัจจุบัน
      const totalCost = quantity * averagePrice;    // มูลค่าต้นทุน
      
      const unrealizedPnL = currentValue - totalCost; // กำไร/ขาดทุน 
      const unrealizedPnLPercent = totalCost > 0 ? (unrealizedPnL / totalCost) * 100 : 0; 

      totalAssetValue += currentValue; 

      return {
        id: pos.id,
        symbol: pos.symbol,
        quantity,
        averagePrice,
        currentPrice,
        currentValue,
        unrealizedPnL,
        unrealizedPnLPercent
      };
    }));

    const netWorth = cashBalance + totalAssetValue; // ความมั่งคั่งสุทธิ (เงินสด + หุ้น)

    return {
      portfolioId: portfolio.id,
      portName: portfolio.port_name,
      netWorth,
      cashBalance,
      totalAssetValue,
      positions: enrichedPositions
    };
  },

  // ดึงประวัติการทำธุรกรรมย้อนหลัง
  async getTransactionHistory(userId: number) {
    // ดึงประวัติจากตาราง transactions 
    const history = await db.select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.executedAt)) // อิงจาก executed_at ใน DB
      .limit(50);
      
    return history;
  }
};