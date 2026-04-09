import * as math from "mathjs"

export const ComputeReturn = {
  // Input: [100, 105, 110, ..., 150] (Array ของราคาปิด)
  TotalReturn(prices: number[]): number {
    if (prices.length < 2) return 0;
    
    const startPrice = prices[0];
    const endPrice = prices[prices.length - 1];
    
    return (endPrice! - startPrice!) / startPrice!; 
  },

  // Input: Array ของราคาปิด
  CAGR(prices: number[]): number {
    const n = prices.length;
    if (n < 2) return 0;

    const startPrice = prices[0];
    const endPrice = prices[n - 1];
    
    // แปลงจำนวนวันเป็น "ปี" (ตลาดหุ้นสหรัฐฯ มีวันเทรดประมาณ 252 วันต่อปี)
    const years = n / 252; 
    
    return Math.pow(endPrice! / startPrice!, 1 / years) - 1;
  },

  // Input: Array ของ % ผลตอบแทนรายวัน เช่น [0.01, -0.02, 0.005, ...]
  AnnualizedReturn(dailyReturns: number[]): number {
    const n = dailyReturns.length;
    if (n === 0) return 0;

    const cumulativeReturn = dailyReturns.reduce((acc, r) => acc * (1 + r), 1);
    
    const years = n / 252;
    return Math.pow(cumulativeReturn, 1 / years) - 1;
  },

  // Input: Array ของราคาปิด และขนาดของหน้าต่าง (เช่น 252 = ดูผลตอบแทนย้อนหลัง 1 ปี)
  RollingReturn(prices: number[], windowSize: number = 252): number[] {
    if (prices.length <= windowSize) return []; 

    const rollingReturns: number[] = [];

    for (let i = windowSize; i < prices.length; i++) {
      const startPrice = prices[i - windowSize];
      const endPrice = prices[i];
      
      const currentReturn = (endPrice! - startPrice!) / startPrice!;
      rollingReturns.push(currentReturn);
    }

    return rollingReturns;
  },

  GetDailyReturns(prices: number[]): number[] {
    const dailyReturns: number[] = [];
    for (let i = 1; i < prices.length; i++) {
      dailyReturns.push((prices[i]! - prices[i - 1]!) / prices[i - 1]!);
    }
    return dailyReturns;
  }
};