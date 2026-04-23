export interface PortfolioResult {
  weights: Record<string, number>;
  expectedReturn: number;
  volatility: number;
  sharpeRatio: number;
}

export interface MonteCarloSimulationResult {
  optimalPortfolio: PortfolioResult;
  minVariancePortfolio: PortfolioResult;
  allSimulations: PortfolioResult[];
}

/**
 * ฟังก์ชันหลักสำหรับรัน Monte Carlo Simulation
 */
export function runMonteCarloOptimization(
  tickers: string[],
  expReturns: number[],
  covMatrix: number[][],
  numSimulations: number = 10000,
  riskFreeRate: number = 0.03
): MonteCarloSimulationResult {
  const numAssets = tickers.length;
  const results: PortfolioResult[] = [];

  let bestSharpeRatio = -Infinity;
  let minVolatility = Infinity;
  
  let optimalPortfolio: PortfolioResult | null = null;
  let minVariancePortfolio: PortfolioResult | null = null;

  for (let i = 0; i < numSimulations; i++) {
    const rawWeights: number[] = Array.from({ length: numAssets }, () => Math.random());
    
    const totalWeight = rawWeights.reduce((sum, w) => sum + w, 0);
    const weights = rawWeights.map(w => w / totalWeight);

    // คำนวณผลตอบแทนของพอร์ต
    let portReturn = 0;
    for (let j = 0; j < numAssets; j++) {
      portReturn += weights[j]! * expReturns[j]!;
    }

    // คำนวณความเสี่ยงของพอร์ต
    let portVariance = 0;
    for (let row = 0; row < numAssets; row++) {
      for (let col = 0; col < numAssets; col++) {
        const rowCov = covMatrix[row];
        if (rowCov) {
          portVariance += weights[row]! * weights[col]! * (rowCov[col] ?? 0);
        }
      }
    }
    const portVolatility = Math.sqrt(portVariance);

    // คำนวณ Sharpe Ratio
    const sharpeRatio = (portReturn - riskFreeRate) / portVolatility;

    //  แปลง Weights Array เป็น Object
    const weightObj: Record<string, number> = {};
    tickers.forEach((ticker, idx) => {
      weightObj[ticker] = weights[idx]!;
    });

    const currentSim: PortfolioResult = {
      weights: weightObj,
      expectedReturn: portReturn,
      volatility: portVolatility,
      sharpeRatio: sharpeRatio
    };

    results.push(currentSim);

    // อัปเดตหาค่าที่ดีที่สุด
    if (sharpeRatio > bestSharpeRatio) {
      bestSharpeRatio = sharpeRatio;
      optimalPortfolio = currentSim;
    }

    // อัปเดตหาพอร์ตที่เสี่ยงต่ำที่สุด
    if (portVolatility < minVolatility) {
      minVolatility = portVolatility;
      minVariancePortfolio = currentSim;
    }
  }

  if (!optimalPortfolio || !minVariancePortfolio) {
    throw new Error("Simulation failed to generate results");
  }

  return {
    optimalPortfolio,
    minVariancePortfolio,
    allSimulations: results
  };
}