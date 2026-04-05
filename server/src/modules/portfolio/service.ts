import { eq, desc } from 'drizzle-orm';
import { db } from '../../db';
import { users } from '../../db/schema/users';
import { portfolio } from '../../db/schema/portfolio';
import { orders } from '../../db/schema/order';
import { MarketService } from '../market/service';

export const PortfolioService = {
  async getPortfolioSummary(userId: number) {
    // ดึงข้อมูลเงินสดคงเหลือ
    const [user] = await db.select({ balance: users.balance }).from(users).where(eq(users.id, userId));
    if (!user) throw new Error("ไม่พบผู้ใช้งาน");

    const cashBalance = parseFloat(user.balance || '0');

    // ดึงรายการสินทรัพย์ที่ถืออยู่ทั้งหมด
    const positions = await db.select().from(portfolio).where(eq(portfolio.userId, userId));

    // ดึงราคาล่าสุดคำนวณ กำไร/ขาดทุน 
    let totalAssetValue = 0;
    
    const enrichedPositions = await Promise.all(positions.map(async (pos) => {
      // เรียกใช้ MarketService ที่กุ Cache ไว้แล้ว
      const marketData = await MarketService.getLivePrice(pos.symbol);
      
      const quantity = parseFloat(pos.quantity);
      const averagePrice = parseFloat(pos.averagePrice); // ต้นทุน
      
      // ถ้าระบบดึงราคาไม่ได้ ให้ใช้ราคาต้นทุนแทนชั่วคราว
      const currentPrice = marketData ? marketData.price : averagePrice; 
      
      const currentValue = quantity * currentPrice; // มูลค่าปัจจุบัน
      const totalCost = quantity * averagePrice;    // มูลค่าต้นทุน
      
      const unrealizedPnL = currentValue - totalCost; // กำไร/ขาดทุน (ดอลลาร์)
      const unrealizedPnLPercent = (unrealizedPnL / totalCost) * 100; // กำไร/ขาดทุน (%)

      totalAssetValue += currentValue; // เอาไปบวกเป็นมูลค่าพอร์ตรวม

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
      netWorth,
      cashBalance,
      totalAssetValue,
      positions: enrichedPositions
    };
  },

  // ดึงประวัติการทำธุรกรรมย้อนหลัง
  async getTransactionHistory(userId: number) {
    // ดึงประวัติการ ซื้อ/ขาย ล่าสุด 50 รายการ
    const history = await db.select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt)) // เรียงจากใหม่ไปเก่า
      .limit(50);
      
    return history;
  }
};