import yahooFinance from 'yahoo-finance2';
import { portfolios } from '../../db/schema/portfolios';
import { portfolioAssets } from '../../db/schema/portfolio_asset';
import { MarketService } from '../market/service';
import { QuantService } from './../../common/utils/quantService';
export interface AssetInput {
  symbol: string;
  weight: number; 
}

export interface HistoricalPrice {
  date: string;
  closePrice: number;
}

export interface MarketDataResult {
  dates: string[]; // ['2023-01-01', '2023-01-02', ...]
  prices: Record<string, number[]>; // { 'AAPL': [150, 152], 'BTC-USD': [30000, 31000] }
}

export interface AnalyticResult {
  dates: string[];
  equityCurve: number[];
  portfolioReturns: number[];
  prices: Record<string, number[]>; 
}

export interface PortfolioMetricsReport {
  // Return Metrics
  totalReturn: number;
  cagr: number;
  annualizedReturn: number;
  
  // Risk & Drawdown
  annualizedVolatility: number;
  maxDrawdown: number;
  drawdownDuration: number;
  recoveryTime: number;
  valueAtRisk: number;
  conditionalVar: number;
  
  // Risk-Adjusted Ratios
  sharpeRatio: number;
  sortinoRatio: number;

  // Market Metrics (Optional: จะมีค่าต่อเมื่อส่งข้อมูล Benchmark มาด้วย)
  beta?: number;
  alpha?: number;
  rSquared?: number;
  informationRatio?: number;
  trackingError?: number;
  upMarketCapture?: number;
  downMarketCapture?: number;
}


export const BacktestService = {

  async getDataMarket(assets: AssetInput[], startDate: Date, endDate: Date): Promise<MarketDataResult> {
    if (assets.length === 0) {
      throw new Error("Asset list cannot be empty");
    }

    const fetchPromises = assets.map(asset => MarketService.getHistory(asset.symbol, startDate, endDate));
    const results = await Promise.all(fetchPromises);

    const dateCountMap = new Map<string, number>();

    for (const assetData of results) {
      if (assetData === undefined) continue; 
      
      for (const item of assetData) {
        if (item.date === undefined) continue;
        const currentCount = dateCountMap.get(item.date) ?? 0;
        dateCountMap.set(item.date, currentCount + 1);
      }
    }

    const commonDates = Array.from(dateCountMap.entries())
      .filter(([_, count]) => count === assets.length)
      .map(([date]) => date)
      .sort(); // เรียงจากอดีต -> ปัจจุบัน

    if (commonDates.length === 0) {
      throw new Error("No overlapping trading days found for the selected assets.");
    }

    const alignedPrices: Record<string, number[]> = {};

    assets.forEach((asset, index) => {
      const assetData = results[index];
      if (assetData === undefined) return; 

      const dataMap = new Map<string, number>();
      for (const item of assetData) {
        if (item.date !== undefined && item.closePrice !== undefined) {
          dataMap.set(item.date, item.closePrice!);
        }
      }

      // ดึงราคาเฉพาะวันที่ตรงกับ commonDates ใส่ Array
      const priceArray: number[] = [];
      for (const date of commonDates) {
        const price = dataMap.get(date) ?? 0; // ถ้าไม่เจอจริงๆ ให้เป็น 0
        priceArray.push(price);
      }

      alignedPrices[asset.symbol] = priceArray;
    });

    return {
      dates: commonDates,
      prices: alignedPrices
    };
  },

 
  async Analytic(assets: AssetInput[], startDate: Date, endDate: Date, initialCapital: number = 10000): Promise<AnalyticResult> {
    
    const totalWeight = assets.reduce((sum, a) => sum + a.weight, 0);
    if (Math.abs(totalWeight - 1) > 0.0001) {
      throw new Error("Total weight must be exactly 1.");
    }

    const marketData = await this.getDataMarket(assets, startDate, endDate);
    console.log(marketData)
    const totalDays = marketData.dates.length;

    if (totalDays === 0) {
      throw new Error("No market data available to run analytics.");
    }

    const assetUnits: Record<string, number> = {};
    for (const asset of assets) {
      const prices = marketData.prices[asset.symbol];
      if (prices === undefined) continue; 
      const firstPrice = prices[0];
      if (firstPrice === undefined || firstPrice === 0) {
        throw new Error(`Invalid initial price for ${asset.symbol}`);
      }

      const allocatedMoney = initialCapital * asset.weight;
      assetUnits[asset.symbol] = allocatedMoney / firstPrice;
    }

    const equityCurve: number[] = [];
    
    for (let day = 0; day < totalDays; day++) {
      let dailyTotalValue = 0;

      for (const asset of assets) {
        const units = assetUnits[asset.symbol] ?? 0;
        const prices = marketData.prices[asset.symbol];
        
        if (prices === undefined) continue; 
        const currentPrice = prices[day] ?? 0; 
        
        dailyTotalValue += units * currentPrice;
      }
      
      equityCurve.push(dailyTotalValue);
    }

    const portfolioReturns: number[] = [];
    for (let i = 1; i < equityCurve.length; i++) {
      const currentVal = equityCurve[i];
      const prevVal = equityCurve[i - 1];
      
      if (currentVal === undefined || prevVal === undefined || prevVal === 0) continue; 
      
      portfolioReturns.push((currentVal - prevVal) / prevVal);
    }

    return {
      dates: marketData.dates,
      equityCurve,
      portfolioReturns,
      prices: marketData.prices
    };
  }
};