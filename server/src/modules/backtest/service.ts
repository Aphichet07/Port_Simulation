import yahooFinance from "yahoo-finance2";
import { MarketService } from "../market/service";
import { QuantService } from "./../../common/utils/quantService";

export interface AssetInput {
  symbol: string;
  weight: number;
}

export interface MarketDataResult {
  dates: string[];
  prices: Record<string, number[]>;
  benchmarkPrices?: number[];
}

export interface AnalyticResult {
  dates: string[];
  equityCurve: number[];
  portfolioReturns: number[];
  prices: Record<string, number[]>;
  benchmarkReturns?: number[];
}

export interface ScatterDataPoint {
  name: string;
  cagr: number;
  volatility: number;
}

export interface MonthlyReturnDetail {
  year: number;
  month: number;
  label: string;
  return: number;
}

export interface ChartDataReport {
  equity: {
    dates: string[];
    portfolio: number[];
    benchmark?: number[];
  };
  underwater: {
    dates: string[];
    drawdowns: number[];
  };
  distribution: {
    returns: number[]; // Frontend นำไปทำ Histogram bins ต่อได้เลย
  };
  monthlyHeatmap: MonthlyReturnDetail[];
  scatterPlot: ScatterDataPoint[];
}

export interface ComprehensiveMetricsReport {
  // --- Basic Returns ---
  totalReturn: number;
  cagr: number;
  annualizedReturn: number;

  // --- Quant Returns ---
  arithmeticMeanMonthly: number;
  arithmeticMeanAnnualized: number;
  geometricMeanMonthly: number;
  geometricMeanAnnualized: number;
  winRate: number;
  profitFactor: number;
  gainLossRatio: number;

  // --- Risk & Volatility ---
  annualizedVolatility: number;
  stdDevMonthly: number;
  stdDevAnnualized: number;
  downsideDeviationMonthly: number;

  // --- Drawdown ---
  maxDrawdown: number;
  drawdownDuration: number;
  recoveryTime: number;
  ulcerIndex: number;
  underwaterCurve: number[];

  // --- Market/Benchmark Metrics ---
  benchmarkCorrelation?: number;
  beta?: number;
  alphaAnnualized?: number;
  rSquared?: number;
  activeReturn?: number;
  trackingError?: number;
  informationRatio?: number;
  upsideCaptureRatio?: number;
  downsideCaptureRatio?: number;

  // --- Risk-Adjusted Ratios ---
  sharpeRatio: number;
  sortinoRatio: number;
  treynorRatio?: number;
  calmarRatio: number;
  m2Measure?: number;

  // --- Distribution & Tail Risk ---
  skewness: number;
  excessKurtosis: number;
  historicalVaR5: number;
  analyticalVaR5: number;
  conditionalVaR5: number;

  // --- Retirement/Withdrawal ---
  safeWithdrawalRate: number;
  perpetualWithdrawalRate: number;
  positivePeriods: { wins: number; total: number; winRate: number };

  // --- Advanced Institutional ---
  omegaRatio: number;
  tailRatio: number;
  expectancy: number;
}

// ==========================================
// 🛠️ 1. Context Object: รวบรวมตัวแปรตั้งต้นที่ต้องใช้บ่อย
// ==========================================
interface MetricContext {
  initialCapital: number;
  finalValue: number;
  totalDays: number;
  years: number;
  cagr: number;
  portfolioReturns: number[];
  equityCurve: number[];
  riskFreeRate: number;
  inflationRate: number;
}

// ==========================================
// 🛠️ 2. Metrics Aggregator: แยกการคำนวณเป็นหมวดหมู่
// ==========================================
const MetricsAggregator = {
  getReturns(ctx: MetricContext) {
    return {
      totalReturn: QuantService.calculateTotalReturn(
        ctx.initialCapital,
        ctx.finalValue,
      ),
      cagr: ctx.cagr,
      annualizedReturn: QuantService.calculateAnnualizedReturn(
        ctx.portfolioReturns,
      ),
      arithmeticMeanMonthly: QuantService.calculateMonthlyArithmeticMean(
        ctx.portfolioReturns,
      ),
      arithmeticMeanAnnualized: QuantService.calculateAnnualizedArithmeticMean(
        ctx.portfolioReturns,
      ),
      geometricMeanMonthly: QuantService.calculateMonthlyGeometricMean(
        ctx.portfolioReturns,
      ),
      geometricMeanAnnualized: ctx.cagr,
      winRate: QuantService.calculateWinRate(ctx.portfolioReturns),
      profitFactor: QuantService.calculateProfitFactor(ctx.portfolioReturns),
      gainLossRatio: QuantService.calculateGainLossRatio(ctx.portfolioReturns),
    };
  },

  getRisk(ctx: MetricContext) {
    return {
      annualizedVolatility: QuantService.calculateAnnualizedVolatility(
        ctx.portfolioReturns,
      ),
      stdDevMonthly: QuantService.calculateMonthlyVolatility(
        ctx.portfolioReturns,
      ),
      stdDevAnnualized: QuantService.calculateAnnualizedVolatility(
        ctx.portfolioReturns,
      ), // ซ้ำกับ annualizedVol แต่คงไว้ตาม Interface
      downsideDeviationMonthly: QuantService.calculateMonthlyDownsideDeviation(
        ctx.portfolioReturns,
      ),
    };
  },

  getDrawdown(ctx: MetricContext) {
    return {
      maxDrawdown: QuantService.calculateMaximumDrawDown(ctx.equityCurve),
      drawdownDuration: QuantService.calculateDrawDownDuration(ctx.equityCurve),
      recoveryTime: QuantService.calculateRecoverTime(ctx.equityCurve),
      ulcerIndex: QuantService.calculateUlcerIndex(ctx.equityCurve),
      underwaterCurve: QuantService.getUnderwaterCurve(ctx.equityCurve),
    };
  },

  getRatios(ctx: MetricContext) {
    return {
      sharpeRatio: QuantService.calculateSharpeRatio(
        ctx.portfolioReturns,
        ctx.riskFreeRate,
      ),
      sortinoRatio: QuantService.calculateSortinoRatio(
        ctx.portfolioReturns,
        ctx.riskFreeRate,
      ),
      calmarRatio: QuantService.calculateCalmarRatio(
        ctx.initialCapital,
        ctx.finalValue,
        ctx.totalDays,
        ctx.equityCurve,
      ),
    };
  },

  getDistribution(ctx: MetricContext) {
    return {
      skewness: QuantService.calculateSkewness(ctx.portfolioReturns),
      excessKurtosis: QuantService.calculateExcessKurtosis(
        ctx.portfolioReturns,
      ),
      historicalVaR5: QuantService.calculateValueAtRisk(
        ctx.portfolioReturns,
        0.95,
      ),
      analyticalVaR5: QuantService.calculateAnalyticalVaR(
        ctx.portfolioReturns,
        1.645,
      ),
      conditionalVaR5: QuantService.calculateConditionalVar(
        ctx.portfolioReturns,
        0.95,
      ),
      omegaRatio: QuantService.calculateOmegaRatio(
        ctx.portfolioReturns,
        ctx.riskFreeRate / 252,
      ),
      tailRatio: QuantService.calculateTailRatio(ctx.portfolioReturns),
      expectancy: QuantService.calculateExpectancy(ctx.portfolioReturns),
    };
  },

  getRetirement(ctx: MetricContext) {
    return {
      safeWithdrawalRate: QuantService.calculateSafeWithdrawalRate(
        ctx.cagr,
        ctx.years,
        ctx.inflationRate,
      ),
      perpetualWithdrawalRate: QuantService.calculatePerpetualWithdrawalRate(
        ctx.cagr,
        ctx.inflationRate,
      ),
      positivePeriods: QuantService.getPositivePeriods(ctx.portfolioReturns),
    };
  },

  getMarket(ctx: MetricContext, benchmarkReturns: number[]) {
    const beta = QuantService.calculateBeta(
      ctx.portfolioReturns,
      benchmarkReturns,
    );
    const rSquared = QuantService.calculateRSquared(
      ctx.portfolioReturns,
      benchmarkReturns,
    );

    return {
      benchmarkCorrelation: Math.sqrt(rSquared) * (beta >= 0 ? 1 : -1),
      beta,
      alphaAnnualized: QuantService.calculateAlpha(
        ctx.portfolioReturns,
        benchmarkReturns,
        ctx.riskFreeRate,
      ),
      rSquared,
      treynorRatio: QuantService.calculateTreynorRatio(
        ctx.portfolioReturns,
        benchmarkReturns,
        ctx.riskFreeRate,
      ),
      m2Measure: QuantService.calculateM2(
        ctx.portfolioReturns,
        benchmarkReturns,
        ctx.riskFreeRate,
      ),
      activeReturn: QuantService.calculateActiveReturn(
        ctx.portfolioReturns,
        benchmarkReturns,
      ),
      trackingError: QuantService.calculateTrackingError(
        ctx.portfolioReturns,
        benchmarkReturns,
      ),
      informationRatio: QuantService.calculateInformationRatio(
        ctx.portfolioReturns,
        benchmarkReturns,
      ),
      upsideCaptureRatio: QuantService.calculateUpMarketCapture(
        ctx.portfolioReturns,
        benchmarkReturns,
      ),
      downsideCaptureRatio: QuantService.calculateDownMarketCapture(
        ctx.portfolioReturns,
        benchmarkReturns,
      ),
    };
  },
};

// ==========================================
// 🛠️ 3. Main Service: จัดการ Flow หลัก
// ==========================================
export const BacktestService = {
  getCharts(
    ctx: MetricContext, 
    dates: string[], 
    benchmarkPrices?: number[], 
    benchmarkReturns?: number[]
  ): ChartDataReport {
    
    // 1. Scatter Plot (เทียบเรากับตลาด)
    const scatterPlot: ScatterDataPoint[] = [{
      name: "Portfolio",
      cagr: ctx.cagr,
      volatility: QuantService.calculateAnnualizedVolatility(ctx.portfolioReturns)
    }];

    if (benchmarkReturns && benchmarkReturns.length > 0) {
      const benchVol = QuantService.calculateAnnualizedVolatility(benchmarkReturns);
      const benchCagr = QuantService.calculateAnnualizedReturn(benchmarkReturns);
      scatterPlot.push({ name: "Benchmark", cagr: benchCagr, volatility: benchVol });
    }

    return {
      // 1. Cumulative Performance
      equity: {
        dates: dates,
        portfolio: ctx.equityCurve,
        benchmark: benchmarkPrices ? QuantService.normalizeEquity(benchmarkPrices, ctx.initialCapital) : undefined
      },
      
      // 2. Underwater Curve
      underwater: {
        dates: dates,
        drawdowns: QuantService.getUnderwaterCurve(ctx.equityCurve)
      },

      // 3. Return Distribution
      distribution: {
        returns: ctx.portfolioReturns 
      },

      // 4. Monthly Heatmap
      monthlyHeatmap: QuantService.calculateMonthlyReturnsBreakdown(dates, ctx.portfolioReturns),

      // 5. Risk-Return Scatter Plot
      scatterPlot: scatterPlot
    };
  },

  async getDataMarket(
    assets: AssetInput[],
    startDate: Date,
    endDate: Date,
    benchmarkSymbol?: string,
  ): Promise<MarketDataResult> {
    if (assets.length === 0) throw new Error("Asset list cannot be empty");

    const allSymbols = assets.map((a) => a.symbol);
    if (benchmarkSymbol) allSymbols.push(benchmarkSymbol);

    const fetchPromises = allSymbols.map((symbol) =>
      MarketService.getHistory(symbol, startDate, endDate),
    );
    const results = await Promise.all(fetchPromises);

    const dateCountMap = new Map<string, number>();
    const requiredDataCount = allSymbols.length;

    for (const assetData of results) {
      if (!assetData) continue;
      for (const item of assetData) {
        if (!item.date) continue;
        dateCountMap.set(item.date, (dateCountMap.get(item.date) ?? 0) + 1);
      }
    }

    const commonDates = Array.from(dateCountMap.entries())
      .filter(([_, count]) => count === requiredDataCount)
      .map(([date]) => date)
      .sort();

    if (commonDates.length === 0) {
      throw new Error(
        "No overlapping trading days found for the selected assets and benchmark.",
      );
    }

    const alignedPrices: Record<string, number[]> = {};
    let benchmarkPrices: number[] | undefined = undefined;

    allSymbols.forEach((symbol, index) => {
      const assetData = results[index];
      if (!assetData) return;

      const dataMap = new Map<string, number>();
      for (const item of assetData) {
        if (item.date && item.closePrice !== undefined) {
          dataMap.set(item.date, item.closePrice!);
        }
      }

      const priceArray = commonDates.map((date) => dataMap.get(date) ?? 0);

      if (symbol === benchmarkSymbol) {
        benchmarkPrices = priceArray;
      } else {
        alignedPrices[symbol] = priceArray;
      }
    });

    return { dates: commonDates, prices: alignedPrices, benchmarkPrices };
  },

  async Analytic(
    assets: AssetInput[],
    startDate: Date,
    endDate: Date,
    initialCapital: number = 10000,
    benchmarkSymbol?: string,
  ): Promise<AnalyticResult> {
    const totalWeight = assets.reduce((sum, a) => sum + a.weight, 0);
    if (Math.abs(totalWeight - 1) > 0.0001) {
      throw new Error("Total portfolio weight must be exactly 1.");
    }

    const marketData = await this.getDataMarket(
      assets,
      startDate,
      endDate,
      benchmarkSymbol,
    );
    const totalDays = marketData.dates.length;

    if (totalDays === 0) {
      throw new Error("No market data available to run analytics.");
    }

    const assetUnits: Record<string, number> = {};
    for (const asset of assets) {
      const prices = marketData.prices[asset.symbol];
      const firstPrice = prices?.[0];

      if (firstPrice === undefined || firstPrice === 0) {
        throw new Error(`Invalid initial price for ${asset.symbol}`);
      }

      assetUnits[asset.symbol] = (initialCapital * asset.weight) / firstPrice;
    }

    const equityCurve: number[] = [];
    for (let day = 0; day < totalDays; day++) {
      let dailyTotalValue = 0;

      for (const asset of assets) {
        const units = assetUnits[asset.symbol] ?? 0;
        const currentPrice = marketData.prices[asset.symbol]?.[day] ?? 0;
        dailyTotalValue += units * currentPrice;
      }

      equityCurve.push(dailyTotalValue);
    }

    const portfolioReturns = QuantService.getDailyReturns(equityCurve);

    let benchmarkReturns: number[] | undefined = undefined;
    if (marketData.benchmarkPrices) {
      benchmarkReturns = QuantService.getDailyReturns(
        marketData.benchmarkPrices,
      );
    }

    return {
      dates: marketData.dates,
      equityCurve,
      portfolioReturns,
      prices: marketData.prices,
      benchmarkReturns,
    };
  },

  /**
   * ฟังก์ชันกลาง: ควบคุมและประกอบร่าง Metrics ทั้งหมด
   */
  async getMetrics(
    analyticResult: AnalyticResult,
    initialCapital: number,
    riskFreeRate: number = 0.03,
    inflationRate: number = 0.03,
  ): Promise<ComprehensiveMetricsReport> {
    const { equityCurve, portfolioReturns, benchmarkReturns } = analyticResult;
    const finalValue = equityCurve[equityCurve.length - 1] ?? initialCapital;
    const totalDays = equityCurve.length;

    const ctx: MetricContext = {
      initialCapital,
      finalValue,
      totalDays,
      years: totalDays / 252,
      cagr: QuantService.calculateCAGR(initialCapital, finalValue, totalDays),
      portfolioReturns,
      equityCurve,
      riskFreeRate,
      inflationRate,
    };

    const report: ComprehensiveMetricsReport = {
      ...MetricsAggregator.getReturns(ctx),
      ...MetricsAggregator.getRisk(ctx),
      ...MetricsAggregator.getDrawdown(ctx),
      ...MetricsAggregator.getRatios(ctx),
      ...MetricsAggregator.getDistribution(ctx),
      ...MetricsAggregator.getRetirement(ctx),
    };

    
    if (
      benchmarkReturns &&
      benchmarkReturns.length === portfolioReturns.length
    ) {
      const marketMetrics = MetricsAggregator.getMarket(ctx, benchmarkReturns);
      Object.assign(report, marketMetrics);
    }

    return report;
  },

  async runFullBacktest(
    assets: AssetInput[],
    startDate: Date,
    endDate: Date,
    initialCapital: number,
    benchmarkSymbol?: string,
  ) {
    try {
      const analyticData = await this.Analytic(
        assets,
        startDate,
        endDate,
        initialCapital,
        benchmarkSymbol,
      );
      
      const metrics = await this.getMetrics(analyticData, initialCapital);

      const ctx: MetricContext = {
        initialCapital,
        finalValue: analyticData.equityCurve[analyticData.equityCurve.length - 1] ?? initialCapital,
        totalDays: analyticData.equityCurve.length,
        years: analyticData.equityCurve.length / 252,
        cagr: metrics.cagr,
        portfolioReturns: analyticData.portfolioReturns,
        equityCurve: analyticData.equityCurve,
        riskFreeRate: 0.03, 
        inflationRate: 0.03,
      };

      // 🛠️ ดึงข้อมูล Benchmark เพื่อปรับสเกลกราฟให้เริ่มต้นเท่ากับเงินทุนเรา
      const benchmarkPrices = benchmarkSymbol ? analyticData.prices[benchmarkSymbol] : undefined;

      const charts = this.getCharts(
        ctx, 
        analyticData.dates, 
        benchmarkPrices, 
        analyticData.benchmarkReturns
      );

      return {
        success: true,
        data: {
          analytic: analyticData,
          metrics: metrics,
          charts: charts, 
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
};