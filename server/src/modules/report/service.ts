import { QuantService } from '../../common/utils/quantService';
import type { AnalyticResult, AssetInput } from '../backtest/service'; // อย่าลืม export AssetInput มาด้วยนะครับ

export interface PortfolioMetricsReport {
  //  Return Metrics
  totalReturn: number;
  cagr: number;
  annualizedReturn: number;
  rollingReturns?: number[]; 
  
  //  Risk & Drawdown
  dailyVolatility: number; 
  annualizedVolatility: number;
  maxDrawdown: number;
  drawdownDuration: number;
  recoveryTime: number;
  valueAtRisk: number;
  conditionalVar: number;
  
  //  Risk-Adjusted Ratios
  sharpeRatio: number;
  sortinoRatio: number;

  //  Market Metrics 
  beta?: number;
  alpha?: number;
  rSquared?: number;
  informationRatio?: number;
  trackingError?: number;
  upMarketCapture?: number;
  downMarketCapture?: number;

  //  Portfolio Mathematics (ถ้ามีข้อมูลแยกรายสินทรัพย์)
  correlationMatrix?: number[][];
  covarianceMatrix?: number[][];
  actr?: number[];
}

export interface QuantReportOptions {
  benchmarkReturns?: number[];
  riskFreeRateAnnual?: number;
  rollingWindow?: number;      // เช่น 252 สำหรับ 1 ปี
  assetReturns?: number[][];   // 2D Array ผลตอบแทนรายวันของแต่ละสินทรัพย์ เช่น [[returnAAPL], [returnBTC]]
  assetWeights?: number[];     // Array สัดส่วนน้ำหนัก เช่น [0.5, 0.5]
}

/**
 * [Core Function] ฟังก์ชันคำนวณ Report จาก Option ที่ส่งเข้ามา
 * @param analyticResult ผลลัพธ์ที่ได้จากการรัน BacktestService.Analytic()
 * @param options พารามิเตอร์เสริมสำหรับการคำนวณขั้นสูง (Benchmark, Portfolio Math)
 * @returns PortfolioMetricsReport
 */
export function generateQuantReport(
  analyticResult: AnalyticResult,
  options: QuantReportOptions = {}
): PortfolioMetricsReport {
  console.log("option --->" ,options)

  const { equityCurve, portfolioReturns } = analyticResult;
  const { 
    benchmarkReturns, 
    riskFreeRateAnnual = 0.03, 
    rollingWindow,
    assetReturns,
    assetWeights
  } = options;

  if (equityCurve.length === 0) {
    throw new Error("Cannot generate quant report: Equity curve is empty.");
  }
  
  const initialValue = equityCurve[0] ?? 0;
  const finalValue = equityCurve[equityCurve.length - 1] ?? 0;
  const totalTradingDays = equityCurve.length;

  // Basic & Risk & Drawdown
  const report: PortfolioMetricsReport = {
    totalReturn: QuantService.calculateTotalReturn(initialValue, finalValue),
    cagr: QuantService.calculateCAGR(initialValue, finalValue, totalTradingDays),
    annualizedReturn: QuantService.calculateAnnualizedReturn(portfolioReturns),
    
    dailyVolatility: QuantService.getVolatility(portfolioReturns),
    annualizedVolatility: QuantService.calculateAnnualizedVolatility(portfolioReturns),
    maxDrawdown: QuantService.calculateMaximumDrawDown(equityCurve),
    drawdownDuration: QuantService.calculateDrawDownDuration(equityCurve),
    recoveryTime: QuantService.calculateRecoverTime(equityCurve),
    
    valueAtRisk: QuantService.calculateValueAtRisk(portfolioReturns),
    conditionalVar: QuantService.calculateConditionalVar(portfolioReturns),
    
    sharpeRatio: QuantService.calculateSharpeRatio(portfolioReturns, riskFreeRateAnnual),
    sortinoRatio: QuantService.calculateSortinoRatio(portfolioReturns, riskFreeRateAnnual),
  };

  // Rolling Return 
  if (rollingWindow !== undefined && rollingWindow > 0) {
    report.rollingReturns = QuantService.calculateRollingReturn(equityCurve, rollingWindow);
  }

  // Market Metrics 
  if (benchmarkReturns && benchmarkReturns.length > 0) {
    if (benchmarkReturns.length !== portfolioReturns.length) {
      throw new Error("Benchmark returns length must match portfolio returns length.");
    }
    report.beta = QuantService.calculateBeta(portfolioReturns, benchmarkReturns);
    report.alpha = QuantService.calculateAlpha(portfolioReturns, benchmarkReturns, riskFreeRateAnnual);
    report.rSquared = QuantService.calculateRSquared(portfolioReturns, benchmarkReturns);
    report.informationRatio = QuantService.calculateInformationRatio(portfolioReturns, benchmarkReturns);
    report.trackingError = QuantService.calculateTrackingError(portfolioReturns, benchmarkReturns);
    report.upMarketCapture = QuantService.calculateUpMarketCapture(portfolioReturns, benchmarkReturns);
    report.downMarketCapture = QuantService.calculateDownMarketCapture(portfolioReturns, benchmarkReturns);
  }

  // Portfolio Mathematics 
  if (assetReturns && assetReturns.length > 0) {
    report.correlationMatrix = QuantService.calculateCorrelationMat(assetReturns);
    report.covarianceMatrix = QuantService.calculateCovarianceMat(assetReturns);
    
    // ACTR ต้องใช้น้ำหนักพอร์ตด้วย
    if (assetWeights && assetWeights.length === assetReturns.length) {
      report.actr = QuantService.calculateACTR(assetWeights, assetReturns, portfolioReturns);
    }
  }

  return report;
}

/**
 * @param assets รายการสินทรัพย์และน้ำหนักที่ User เลือก (AssetInput[])
 * @param analyticResult ผลลัพธ์จาก BacktestService.Analytic (ต้องคืนค่า prices กลับมาด้วย)
 * @param benchmarkPrices (Optional) Array ราคาปิดของดัชนีชี้วัดเพื่อใช้เปรียบเทียบตลาด
 * @returns PortfolioMetricsReport แบบครบทุกค่า
 */
export function getFullAnalyticsAuto(
  assets: AssetInput[], 
  analyticResult: AnalyticResult & { prices?: Record<string, number[]> }, // เผื่อไว้ในกรณีที่ลืมอัปเดต type ดั้งเดิม
  benchmarkPrices?: number[]
): PortfolioMetricsReport {

  const assetReturns: number[][] = [];
  const assetWeights: number[] = [];

  // แปลงราคาของหุ้นแต่ละตัว ให้เป็น Daily Returns 
  if (analyticResult.prices) {
    for (const asset of assets) {
      const rawPrices = analyticResult.prices[asset.symbol];
      if (rawPrices && rawPrices.length > 0) {
        assetReturns.push(QuantService.getDailyReturns(rawPrices));
        assetWeights.push(asset.weight);
      }
    }
  }

  // แปลงราคา Benchmark ให้เป็น Daily Returns
  let benchmarkReturns: number[] | undefined = undefined;
  if (benchmarkPrices && benchmarkPrices.length > 0) {
    benchmarkReturns = QuantService.getDailyReturns(benchmarkPrices);
  }


  const autoOptions: QuantReportOptions = {
    riskFreeRateAnnual: 0.03,  
    rollingWindow: 252,        
    assetReturns: assetReturns.length > 0 ? assetReturns : undefined,
    assetWeights: assetWeights.length > 0 ? assetWeights : undefined,
    benchmarkReturns: benchmarkReturns
  };

  

  return generateQuantReport(analyticResult, autoOptions);
}