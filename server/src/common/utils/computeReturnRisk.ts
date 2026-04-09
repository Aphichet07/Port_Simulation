import * as math from "mathjs";

export interface DailyReturnData {
  date: string;
  return: number;
}

export interface RiskMetrics {
  sharpeRatio: number;
  sortinoRatio: number;
  calmarRatio: number;
  treynorRatio: number;
  informationRatio: number;
  volatility: number;
}

export interface BenchmarkData {
  portfolioReturns: number[];
  marketReturns: number[]; // S&P 500
  riskFreeRate?: number;    // default 0.02
}

export const ComputeReturnRisk = {
  /**
   * คำนวณ Annualized Volatility (ความผันผวนต่อปี)
   * @param dailyReturns อาร์เรย์ของ % ผลตอบแทนรายวัน
   */
  getVolatility(dailyReturns: number[]): number {
    if (dailyReturns.length < 2) return 0;
    
    const std = math.std(dailyReturns);
    
    const stdNumber = std as unknown as number;
    
    return stdNumber * Math.sqrt(252);
  },
  SharpeRatio(dailyReturns: number[], riskFreeRate: number = 0.02) {
    const n = dailyReturns.length;
    if (n < 2) return 0;

    const cumulativeReturn = dailyReturns.reduce((acc, r) => acc * (1 + r), 1);
    const years = n / 252;
    const annReturn = Math.pow(cumulativeReturn, 1 / years) - 1;

    const annVol = this.getVolatility(dailyReturns);

    if (annVol === 0) return 0;
    return (annReturn - riskFreeRate) / annVol;
  },

  SortinoRatio(dailyReturns: number[], riskFreeRate: number = 0.02): number {
    const annReturn = this.calculateAnnualizedReturn(dailyReturns);
    const downsideReturns = dailyReturns.filter((r) => r < 0);
    
    if (downsideReturns.length < 2) return 0;

    const downsideStd = math.std(downsideReturns) as unknown as number;
    const downsideVol = downsideStd * Math.sqrt(252);
    
    return downsideVol === 0 ? 0 : (annReturn - riskFreeRate) / downsideVol;
  },

  InformationRatio(portfolioReturns: number[], marketReturns: number[]): number {
    if (portfolioReturns.length !== marketReturns.length || portfolioReturns.length === 0) {
      return 0;
    }

    const diffs = portfolioReturns.map((p, i) => p - marketReturns[i]!);
    
    const activeReturn = math.mean(diffs) * 252;
    
    const trackingErrorStd = math.std(diffs) as unknown as number;
    const trackingError = trackingErrorStd * Math.sqrt(252);

    return trackingError === 0 ? 0 : activeReturn / trackingError;
  },

  /**
   * Private Helper: คำนวณผลตอบแทนทบต้นต่อปีจากรายวัน
   */
  calculateAnnualizedReturn(dailyReturns: number[]): number {
    if (dailyReturns.length === 0) return 0;
    
    const totalGrowth = dailyReturns.reduce((acc, r) => acc * (1 + r), 1);
    const years = dailyReturns.length / 252;
    
    return Math.pow(totalGrowth, 1 / years) - 1;
  }
};