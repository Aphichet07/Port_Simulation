const sum = (arr: number[]): number => arr.reduce((a, b) => a + b, 0);

const mean = (arr: number[]): number => {
  if (arr.length === 0) return 0;
  return sum(arr) / arr.length;
};

const variance = (arr: number[], isSample: boolean = true): number => {
  if (arr.length <= 1) return 0;
  const m = mean(arr);
  const v = arr.reduce((a, b) => a + Math.pow(b - m, 2), 0) / (arr.length - (isSample ? 1 : 0));
  return Math.max(0, v);
};

const stdDev = (arr: number[], isSample: boolean = true): number => Math.sqrt(variance(arr, isSample));

const covariance = (arr1: number[], arr2: number[]): number => {
  if (arr1.length !== arr2.length || arr1.length <= 1) return 0;
  const m1 = mean(arr1), m2 = mean(arr2);
  let cov = 0;
  for (let i = 0; i < arr1.length; i++) {
    const val1 = arr1[i];
    const val2 = arr2[i];
    if (val1 === undefined || val2 === undefined) continue;
    cov += (val1 - m1) * (val2 - m2);
  }
  return cov / (arr1.length - 1);
};

const correlation = (arr1: number[], arr2: number[]): number => {
  const cov = covariance(arr1, arr2);
  const sd1 = stdDev(arr1);
  const sd2 = stdDev(arr2);
  if (sd1 === 0 || sd2 === 0) return 0;
  return cov / (sd1 * sd2);
};


export class QuantService {
  private static readonly TRADING_DAYS_PER_YEAR: number = 252;

  //  Basic Returns


  /**
   * แปลงราคาปิดรายวันให้เป็น % ผลตอบแทนรายวัน (Daily Returns)
   * @param prices Array ของมูลค่าหรือราคา (เช่น [100, 101, 99, 105])
   * @returns Array ของผลตอบแทนรายวัน (ขนาดจะลดลง 1 เสมอ เพราะวันแรกไม่มีตัวเปรียบเทียบ)
   */
  static getDailyReturns(prices: number[]): number[] {
    if (prices.length <= 1) return [];
    const returns: number[] = [];
    for (let i = 1; i < prices.length; i++) {
      const current = prices[i];
      const previous = prices[i - 1];
      if (current === undefined || previous === undefined || previous === 0) continue;
      returns.push((current - previous) / previous);
    }
    return returns;
  }

  /**
   * ผลตอบแทนรวมทั้งหมด (Total Return)
   * @param initialValue เงินเริ่มต้น
   * @param finalValue เงินวันสุดท้าย
   */
  static calculateTotalReturn(initialValue: number, finalValue: number): number {
    if (initialValue === 0) return 0;
    return (finalValue - initialValue) / initialValue;
  }

  /**
   * อัตราผลตอบแทนทบต้นต่อปี (CAGR)
   * @param initialValue เงินเริ่มต้น
   * @param finalValue เงินวันสุดท้าย
   * @param totalTradingDays จำนวนวันเทรดทั้งหมดตั้งแต่วันแรกถึงวันสุดท้าย
   */
  static calculateCAGR(initialValue: number, finalValue: number, totalTradingDays: number): number {
    if (totalTradingDays === 0 || initialValue === 0 || finalValue < 0) return 0;
    const years = totalTradingDays / this.TRADING_DAYS_PER_YEAR;
    return Math.pow(finalValue / initialValue, 1 / years) - 1;
  }

  /**
   * คำนวณผลตอบแทนรายปีเฉลี่ยจากข้อมูลผลตอบแทนรายวัน (Annualized Return)
   * (หมายเหตุ: calculateAnnualizedReturn คือตัวเดียวกัน ใช้ฟังก์ชันนี้แทนได้เลย)
   * @param dailyReturns Array ของผลตอบแทนรายวัน
   */
  static calculateAnnualizedReturn(dailyReturns: number[]): number {
    if (dailyReturns.length === 0) return 0;
    // วิธี Geometric Linkage: นำ (1+R) มาคูณกันแล้วแปลงเป็นรายปี
    const compoundReturn = dailyReturns.reduce((acc, r) => acc * (1 + r), 1);
    const years = dailyReturns.length / this.TRADING_DAYS_PER_YEAR;
    if (years === 0 || compoundReturn < 0) return 0;
    return Math.pow(compoundReturn, 1 / years) - 1;
  }

  /**
   * ผลตอบแทนแบบกลิ้ง (Rolling Returns)
   * @param equityCurve Array ของมูลค่าพอร์ตรายวัน
   * @param windowSize ขนาดหน้าต่างเวลา (เช่น 252 สำหรับดู Rolling 1 ปี)
   */
  static calculateRollingReturn(equityCurve: number[], windowSize: number): number[] {
    if (equityCurve.length <= windowSize) return [];
    const rolling: number[] = [];
    for (let i = windowSize; i < equityCurve.length; i++) {
      const current = equityCurve[i];
      const past = equityCurve[i - windowSize];
      if (current === undefined || past === undefined || past === 0) continue;
      rolling.push((current - past) / past);
    }
    return rolling;
  }

  //  Volatility & Risk

  /**
   * ความผันผวนรายวัน (Daily Volatility / Standard Deviation)
   * @param dailyReturns Array ของผลตอบแทนรายวัน
   */
  static getVolatility(dailyReturns: number[]): number {
    return stdDev(dailyReturns);
  }

  /**
   * ความผันผวนรายปี (Annualized Volatility)
   * @param dailyReturns Array ของผลตอบแทนรายวัน
   */
  static calculateAnnualizedVolatility(dailyReturns: number[]): number {
    return this.getVolatility(dailyReturns) * Math.sqrt(this.TRADING_DAYS_PER_YEAR);
  }

  /**
   * Value at Risk (VaR) ประเมินความเสียหายที่แย่ที่สุดในระดับความมั่นใจที่กำหนด (Historical Method)
   * @param dailyReturns Array ของผลตอบแทนรายวัน
   * @param confidenceLevel ระดับความมั่นใจ (ค่า Default คือ 0.95 หรือ 95%)
   */
  static calculateValueAtRisk(dailyReturns: number[], confidenceLevel: number = 0.95): number {
    if (dailyReturns.length === 0) return 0;
    const sortedReturns = [...dailyReturns].sort((a, b) => a - b);
    const index = Math.floor(sortedReturns.length * (1 - confidenceLevel));
    const varValue = sortedReturns[index];
    return varValue !== undefined ? varValue : 0;
  }

  /**
   * Conditional Value at Risk (CVaR) / Expected Shortfall ค่าเฉลี่ยของการขาดทุนที่หลุดเส้น VaR ลงไป
   * @param dailyReturns Array ของผลตอบแทนรายวัน
   * @param confidenceLevel ระดับความมั่นใจ (ค่า Default คือ 0.95 หรือ 95%)
   */
  static calculateConditionalVar(dailyReturns: number[], confidenceLevel: number = 0.95): number {
    if (dailyReturns.length === 0) return 0;
    const varLimit = this.calculateValueAtRisk(dailyReturns, confidenceLevel);
    const tailReturns = dailyReturns.filter(r => r <= varLimit);
    return mean(tailReturns);
  }

  // Drawdown Analysis

  /**
   * ขาดทุนหนักสุด (Maximum Drawdown)
   * @param equityCurve Array ของมูลค่าพอร์ตรายวัน
   */
  static calculateMaximumDrawDown(equityCurve: number[]): number {
    const firstValue = equityCurve[0];
    if (firstValue === undefined) return 0;

    let peak = firstValue;
    let maxDD = 0;
    for (let i = 0; i < equityCurve.length; i++) {
      const val = equityCurve[i];
      if (val === undefined) continue;
      if (val > peak) peak = val;
      const dd = peak !== 0 ? (peak - val) / peak : 0;
      if (dd > maxDD) maxDD = dd;
    }
    return maxDD; // ค่าเป็นบวก เช่น 0.20 คือติดลบ 20%
  }

  /**
   * ระยะเวลาที่ใช้ในการร่วงหล่น (Drawdown Duration) นับจากจุด Peak สู่จุดที่ลึกที่สุด (Trough)
   * @param equityCurve Array ของมูลค่าพอร์ตรายวัน
   * @returns จำนวนวันเทรด
   */
  static calculateDrawDownDuration(equityCurve: number[]): number {
    if (equityCurve.length === 0) return 0;
    let peak = equityCurve[0] ?? 0;
    let maxDD = 0;
    let currentPeakIdx = 0;
    let maxDuration = 0;

    for (let i = 0; i < equityCurve.length; i++) {
      const val = equityCurve[i];
      if (val === undefined) continue;

      if (val >= peak) {
        peak = val;
        currentPeakIdx = i;
      } else {
        const dd = peak !== 0 ? (peak - val) / peak : 0;
        if (dd > maxDD) {
          maxDD = dd;
          maxDuration = i - currentPeakIdx; // นับระยะห่างจาก Peak ล่าสุด
        }
      }
    }
    return maxDuration;
  }

  /**
   * ระยะเวลาที่ใช้ฟื้นตัว (Recovery Time) นับจากจุดที่ลึกที่สุด กลับมาทะลุ Peak เดิม
   * @param equityCurve Array ของมูลค่าพอร์ตรายวัน
   * @returns จำนวนวันเทรดที่ใช้ฟื้นตัว
   */
  static calculateRecoverTime(equityCurve: number[]): number {
    if (equityCurve.length === 0) return 0;
    let peak = equityCurve[0] ?? 0;
    let maxDD = 0;
    let troughIdx = 0;
    let maxRecoverTime = 0;
    let inDrawdown = false;

    for (let i = 0; i < equityCurve.length; i++) {
      const val = equityCurve[i];
      if (val === undefined) continue;

      if (val > peak) { // New Peak (ฟื้นตัวสำเร็จ)
        if (inDrawdown) {
          const recoverTime = i - troughIdx;
          if (recoverTime > maxRecoverTime) maxRecoverTime = recoverTime;
        }
        peak = val;
        inDrawdown = false;
        maxDD = 0; // Reset DD
      } else { // In Drawdown
        inDrawdown = true;
        const dd = peak !== 0 ? (peak - val) / peak : 0;
        if (dd > maxDD) {
          maxDD = dd;
          troughIdx = i; // บันทึกจุดต่ำสุดใหม่
        }
      }
    }
    return maxRecoverTime;
  }

  //  Risk-Adjusted Ratios 

  /**
   * Sharpe Ratio: ผลตอบแทนเทียบความเสี่ยงรวม
   * @param portReturns Array ของผลตอบแทนรายวันของพอร์ต
   * @param riskFreeRateAnnual ดอกเบี้ยปลอดความเสี่ยงรายปี (เช่น 0.03)
   */
  static calculateSharpeRatio(portReturns: number[], riskFreeRateAnnual: number = 0.03): number {
    if (portReturns.length === 0) return 0;
    const rfDaily = riskFreeRateAnnual / this.TRADING_DAYS_PER_YEAR;
    const excess = portReturns.map(r => r - rfDaily);
    const sd = stdDev(excess);
    if (sd === 0) return 0;
    return (mean(excess) / sd) * Math.sqrt(this.TRADING_DAYS_PER_YEAR);
  }

  /**
   * Sortino Ratio: ผลตอบแทนเทียบความเสี่ยงเฉพาะขาลง
   * @param portReturns Array ของผลตอบแทนรายวันของพอร์ต
   * @param riskFreeRateAnnual ดอกเบี้ยปลอดความเสี่ยงรายปี
   */
  static calculateSortinoRatio(portReturns: number[], riskFreeRateAnnual: number = 0.03): number {
    if (portReturns.length === 0) return 0;
    const rfDaily = riskFreeRateAnnual / this.TRADING_DAYS_PER_YEAR;
    const excess = portReturns.map(r => r - rfDaily);
    const downside = excess.filter(r => r < 0);
    
    if (downside.length === 0) return 0;
    const downsideDev = Math.sqrt(downside.reduce((a, b) => a + Math.pow(b, 2), 0) / portReturns.length);
    if (downsideDev === 0) return 0;
    
    return (mean(excess) / downsideDev) * Math.sqrt(this.TRADING_DAYS_PER_YEAR);
  }

  /**
   * Tracking Error: ความผันผวนของส่วนต่างผลตอบแทนระหว่างพอร์ตกับดัชนีชี้วัด
   * @param portReturns Array ของผลตอบแทนรายวันของพอร์ต
   * @param benchReturns Array ของผลตอบแทนรายวันของ Benchmark (ความยาวต้องเท่ากัน)
   */
  static calculateTrackingError(portReturns: number[], benchReturns: number[]): number {
    if (portReturns.length === 0 || portReturns.length !== benchReturns.length) return 0;
    const activeReturns: number[] = [];
    for (let i = 0; i < portReturns.length; i++) {
      const p = portReturns[i];
      const b = benchReturns[i];
      if (p !== undefined && b !== undefined) activeReturns.push(p - b);
    }
    return stdDev(activeReturns) * Math.sqrt(this.TRADING_DAYS_PER_YEAR);
  }

  /**
   * Information Ratio: ผลตอบแทนส่วนเกินเทียบกับ Tracking Error (ดูความสามารถผู้จัดการกองทุน)
   * @param portReturns Array ของผลตอบแทนรายวันของพอร์ต
   * @param benchReturns Array ของผลตอบแทนรายวันของ Benchmark
   */
  static calculateInformationRatio(portReturns: number[], benchReturns: number[]): number {
    const trackingError = this.calculateTrackingError(portReturns, benchReturns);
    if (trackingError === 0) return 0;
    const annPortRet = this.calculateAnnualizedReturn(portReturns);
    const annBenchRet = this.calculateAnnualizedReturn(benchReturns);
    return (annPortRet - annBenchRet) / trackingError;
  }

  // Market Analysis

  /**
   * Beta: ค่าความผันผวนของพอร์ตเมื่อเทียบกับตลาด (>1 คือซิ่งกว่าตลาด, <1 คือนิ่งกว่า)
   * @param portReturns Array ของผลตอบแทนรายวันของพอร์ต
   * @param benchReturns Array ของผลตอบแทนรายวันของ Benchmark
   */
  static calculateBeta(portReturns: number[], benchReturns: number[]): number {
    if (portReturns.length === 0 || portReturns.length !== benchReturns.length) return 0;
    const varBench = variance(benchReturns);
    if (varBench === 0) return 0;
    return covariance(portReturns, benchReturns) / varBench;
  }

  /**
   * Alpha (Jensen's Alpha): ผลตอบแทนส่วนเกินเหนือสมการ CAPM (Alpha บวกแปลว่าชนะตลาดจริงๆ)
   * @param portReturns Array ของผลตอบแทนรายวันของพอร์ต
   * @param benchReturns Array ของผลตอบแทนรายวันของ Benchmark
   * @param riskFreeRateAnnual ดอกเบี้ยปลอดความเสี่ยงรายปี
   */
  static calculateAlpha(portReturns: number[], benchReturns: number[], riskFreeRateAnnual: number = 0.03): number {
    const portAnn = this.calculateAnnualizedReturn(portReturns);
    const benchAnn = this.calculateAnnualizedReturn(benchReturns);
    const beta = this.calculateBeta(portReturns, benchReturns);
    return portAnn - (riskFreeRateAnnual + beta * (benchAnn - riskFreeRateAnnual));
  }

  /**
   * R-Squared: วัดว่าการขึ้นลงของพอร์ต อธิบายด้วยการขึ้นลงของ Benchmark ได้กี่ % (0 ถึง 1)
   * @param portReturns Array ของผลตอบแทนรายวันของพอร์ต
   * @param benchReturns Array ของผลตอบแทนรายวันของ Benchmark
   */
  static calculateRSquared(portReturns: number[], benchReturns: number[]): number {
    return Math.pow(correlation(portReturns, benchReturns), 2);
  }

  /**
   * Up-Market Capture Ratio: ช่วงตลาดขาขึ้น เราได้กำไรกี่เปอร์เซ็นต์ของตลาด (>1 คือเก่งกว่าตลาดขาขึ้น)
   * @param portReturns Array ของผลตอบแทนรายวันของพอร์ต
   * @param benchReturns Array ของผลตอบแทนรายวันของ Benchmark
   */
  static calculateUpMarketCapture(portReturns: number[], benchReturns: number[]): number {
    if (portReturns.length === 0 || portReturns.length !== benchReturns.length) return 0;
    const upPortReturns: number[] = [];
    const upBenchReturns: number[] = [];
    for (let i = 0; i < benchReturns.length; i++) {
      const p = portReturns[i];
      const b = benchReturns[i];
      if (p !== undefined && b !== undefined && b > 0) { // จับเฉพาะวันที่ตลาดบวก
        upPortReturns.push(p);
        upBenchReturns.push(b);
      }
    }
    const annUpPort = this.calculateAnnualizedReturn(upPortReturns);
    const annUpBench = this.calculateAnnualizedReturn(upBenchReturns);
    if (annUpBench === 0) return 0;
    return annUpPort / annUpBench;
  }

  /**
   * Down-Market Capture Ratio: ช่วงตลาดขาลง เราขาดทุนกี่เปอร์เซ็นต์ของตลาด (<1 คือป้องกันขาลงได้ดีกว่าตลาด)
   * @param portReturns Array ของผลตอบแทนรายวันของพอร์ต
   * @param benchReturns Array ของผลตอบแทนรายวันของ Benchmark
   */
  static calculateDownMarketCapture(portReturns: number[], benchReturns: number[]): number {
    if (portReturns.length === 0 || portReturns.length !== benchReturns.length) return 0;
    const downPortReturns: number[] = [];
    const downBenchReturns: number[] = [];
    for (let i = 0; i < benchReturns.length; i++) {
      const p = portReturns[i];
      const b = benchReturns[i];
      if (p !== undefined && b !== undefined && b < 0) { // จับเฉพาะวันที่ตลาดติดลบ
        downPortReturns.push(p);
        downBenchReturns.push(b);
      }
    }
    const annDownPort = this.calculateAnnualizedReturn(downPortReturns);
    const annDownBench = this.calculateAnnualizedReturn(downBenchReturns);
    if (annDownBench === 0) return 0;
    return annDownPort / annDownBench;
  }

  //  Portfolio Mathematics 

  /**
   * Correlation Matrix: เมทริกซ์ความสัมพันธ์ระหว่างสินทรัพย์
   * @param assetReturns 2D Array ของผลตอบแทน (เช่น [[returnAAPL], [returnBTC]])
   */
  static calculateCorrelationMat(assetReturns: number[][]): number[][] {
    const numAssets = assetReturns.length;
    if (numAssets === 0) return [];
    const matrix: number[][] = Array.from({ length: numAssets }, () => Array(numAssets).fill(0));

    for (let i = 0; i < numAssets; i++) {
      for (let j = 0; j < numAssets; j++) {
        const rowTarget = matrix[i];
        const retI = assetReturns[i];
        const retJ = assetReturns[j];
        if (rowTarget === undefined || retI === undefined || retJ === undefined) continue;
        rowTarget[j] = correlation(retI, retJ);
      }
    }
    return matrix;
  }

  /**
   * Covariance Matrix: เมทริกซ์ความแปรปรวนเกี่ยวเนื่องระหว่างสินทรัพย์
   * @param assetReturns 2D Array ของผลตอบแทน (เช่น [[returnAAPL], [returnBTC]])
   */
  static calculateCovarianceMat(assetReturns: number[][]): number[][] {
    const numAssets = assetReturns.length;
    if (numAssets === 0) return [];
    const matrix: number[][] = Array.from({ length: numAssets }, () => Array(numAssets).fill(0));

    for (let i = 0; i < numAssets; i++) {
      for (let j = 0; j < numAssets; j++) {
        const rowTarget = matrix[i];
        const retI = assetReturns[i];
        const retJ = assetReturns[j];
        if (rowTarget === undefined || retI === undefined || retJ === undefined) continue;
        rowTarget[j] = covariance(retI, retJ);
      }
    }
    return matrix;
  }

  /**
   * Asset Contribution to Risk (ACTR): สัดส่วนที่สินทรัพย์แต่ละตัวสร้างความเสี่ยงให้พอร์ตรวม
   * @param weights Array น้ำหนักการลงทุนของแต่ละสินทรัพย์ (ผลรวม = 1)
   * @param assetReturns 2D Array ของผลตอบแทนของแต่ละสินทรัพย์
   * @param portfolioReturns Array ของผลตอบแทนรายวันของพอร์ตรวม
   */
  static calculateACTR(weights: number[], assetReturns: number[][], portfolioReturns: number[]): number[] {
    if (weights.length === 0 || assetReturns.length === 0) return [];
    const portStdDev = stdDev(portfolioReturns);
    if (portStdDev === 0) return weights.map(() => 0);

    return weights.map((weight, index) => {
      const assetReturn = assetReturns[index];
      if (assetReturn === undefined) return 0;
      const covAssetPort = covariance(assetReturn, portfolioReturns);
      return weight * (covAssetPort / portStdDev);
    });
  }
  /**
   * Calmar Ratio: ผลตอบแทนรายปีเทียบกับ Max Drawdown (ยิ่งสูงยิ่งดี)
   */
  static calculateCalmarRatio(initialValue: number, finalValue: number, totalTradingDays: number, equityCurve: number[]): number {
    const cagr = this.calculateCAGR(initialValue, finalValue, totalTradingDays);
    const maxDD = this.calculateMaximumDrawDown(equityCurve);
    if (maxDD === 0) return 0;
    return cagr / maxDD;
  }

  /**
   * Win Rate: สัดส่วนวันที่ผลตอบแทนเป็นบวก
   */
  static calculateWinRate(dailyReturns: number[]): number {
    if (dailyReturns.length === 0) return 0;
    const wins = dailyReturns.filter(r => r > 0).length;
    return wins / dailyReturns.length;
  }

  /**
   * Profit Factor: สัดส่วนยอดรวมกำไร เทียบกับ ยอดรวมขาดทุน
   */
  static calculateProfitFactor(dailyReturns: number[]): number {
    const grossProfit = dailyReturns.filter(r => r > 0).reduce((a, b) => a + b, 0);
    const grossLoss = Math.abs(dailyReturns.filter(r => r < 0).reduce((a, b) => a + b, 0));
    if (grossLoss === 0) return grossProfit > 0 ? 999 : 0;
    return grossProfit / grossLoss;
  }
  /**
   * คำนวณสายธาร Drawdown (Underwater Curve) เพื่อเอาไปพลอตกราฟ
   * @returns Array ของ % ที่ติดลบในแต่ละวัน (เช่น [0, -0.02, -0.05, 0])
   */
  static getUnderwaterCurve(equityCurve: number[]): number[] {
    if (equityCurve.length === 0) return [];
    let peak = -Infinity;
    return equityCurve.map(val => {
      if (val > peak) peak = val;
      return peak !== 0 ? (val - peak) / peak : 0;
    });
  }
  /**
   * Diversification Ratio: วัดประสิทธิภาพการกระจายความเสี่ยง
   * สูตร: Weighted Volatility / Portfolio Volatility
   */
  static calculateDiversificationRatio(weights: number[], assetReturns: number[][], portfolioReturns: number[]): number {
    const weightedVol = weights.reduce((acc, w, i) => {
      const assetRet = assetReturns[i];
      return acc + (w * (assetRet ? stdDev(assetRet) : 0));
    }, 0);
    const portVol = stdDev(portfolioReturns);
    if (portVol === 0) return 0;
    return weightedVol / portVol;
  }
  /**
   * Ulcer Index: ยิ่งค่าน้อย แปลว่าพอร์ตฟื้นตัวเร็วและไม่จมลึก
   */
  static calculateUlcerIndex(equityCurve: number[]): number {
    const drawdownCurve = this.getUnderwaterCurve(equityCurve);
    if (drawdownCurve.length === 0) return 0;
    const squaredDD = drawdownCurve.reduce((acc, dd) => acc + Math.pow(dd, 2), 0);
    return Math.sqrt(squaredDD / drawdownCurve.length);
  }

  /**
   * Arithmetic Mean (Monthly) - ค่าเฉลี่ยเลขคณิตรายเดือน
   * หมายเหตุ: สมมติว่า dailyReturns มีประมาณ 21 วันเทรดต่อเดือน
   */
  static calculateMonthlyArithmeticMean(dailyReturns: number[]): number {
    return mean(dailyReturns) * 21;
  }

  /**
   * Geometric Mean (Monthly) - ค่าเฉลี่ยเรขาคณิตรายเดือน
   */
  static calculateMonthlyGeometricMean(dailyReturns: number[]): number {
    const compoundReturn = dailyReturns.reduce((acc, r) => acc * (1 + r), 1);
    const months = dailyReturns.length / 21;
    if (months === 0 || compoundReturn < 0) return 0;
    return Math.pow(compoundReturn, 1 / months) - 1;
  }

  /**
   * Downside Deviation (Standalone) - ใช้บ่อยในการวิเคราะห์แยกต่างหาก
   * @param portReturns ผลตอบแทนรายวัน
   * @param targetReturn ผลตอบแทนเป้าหมาย (เช่น 0)
   */
  static calculateDownsideDeviation(portReturns: number[], targetReturn: number = 0): number {
    if (portReturns.length === 0) return 0;
    const downside = portReturns.filter(r => r < targetReturn);
    if (downside.length === 0) return 0;
    
    // คำนวณโดยหารด้วย N ทั้งหมดของพอร์ต (ไม่ใช่แค่ N ของ downside)
    const sumSquared = downside.reduce((sum, r) => sum + Math.pow(r - targetReturn, 2), 0);
    return Math.sqrt(sumSquared / portReturns.length);
  }

  /**
   * Treynor Ratio: ผลตอบแทนเทียบกับความเสี่ยงระบบ (Beta)
   * เหมาะสำหรับพอร์ตที่มีการกระจายความเสี่ยงดีแล้ว
   */
  static calculateTreynorRatio(portReturns: number[], benchReturns: number[], riskFreeRateAnnual: number = 0.03): number {
    const annPortRet = this.calculateAnnualizedReturn(portReturns);
    const beta = this.calculateBeta(portReturns, benchReturns);
    if (beta === 0) return 0;
    return (annPortRet - riskFreeRateAnnual) / beta;
  }

  /**
   * Modigliani–Modigliani Measure (M2): 
   * Sharpe Ratio ในรูปของผลตอบแทนเปอร์เซ็นต์ (เข้าใจง่ายกว่า Sharpe ที่เป็นตัวเลขสัมประสิทธิ์)
   */
  static calculateM2(portReturns: number[], benchReturns: number[], riskFreeRateAnnual: number = 0.03): number {
    const sharpe = this.calculateSharpeRatio(portReturns, riskFreeRateAnnual);
    const benchVol = this.calculateAnnualizedVolatility(benchReturns);
    return (sharpe * benchVol) + riskFreeRateAnnual;
  }

  /**
   * Skewness: ความเบ้ของการกระจายตัว
   * ค่าลบ (Negative Skew) หมายถึงมีโอกาสขาดทุนหนักๆ ซ่อนอยู่ (Fat left tail)
   */
  static calculateSkewness(returns: number[]): number {
    if (returns.length < 3) return 0;
    const m = mean(returns);
    const s = stdDev(returns);
    if (s === 0) return 0;

    const n = returns.length;
    const sumCubed = returns.reduce((acc, r) => acc + Math.pow(r - m, 3), 0);
    
    // Adjusted Fisher-Pearson standardized moment coefficient
    return (n * sumCubed) / ((n - 1) * (n - 2) * Math.pow(s, 3));
  }

  /**
   * Excess Kurtosis: ความโด่งของการกระจายตัว
   * ค่า > 0 (Leptokurtic) แปลว่ามีความเสี่ยงที่จะเกิด Extreme events บ่อยกว่าปกติ (Black Swan)
   */
  static calculateExcessKurtosis(returns: number[]): number {
    if (returns.length < 4) return 0;
    const m = mean(returns);
    const s = stdDev(returns);
    if (s === 0) return 0;

    const n = returns.length;
    const sumQuart = returns.reduce((acc, r) => acc + Math.pow(r - m, 4), 0);
    
    const kurtosis = (n * (n + 1) * sumQuart) / ((n - 1) * (n - 2) * (n - 3) * Math.pow(s, 4));
    const excessAdjustment = (3 * Math.pow(n - 1, 2)) / ((n - 2) * (n - 3));
    
    return kurtosis - excessAdjustment;
  }

  /**
   * Analytical Value at Risk (Parametric VaR)
   * คำนวณ VaR จากสมมติฐานการแจกแจงแบบปกติ (Normal Distribution) 
   * Z-Score สำหรับ 95% คือ 1.645
   */
  static calculateAnalyticalVaR(returns: number[], zScore: number = 1.645): number {
    const m = mean(returns);
    const s = stdDev(returns);
    return m - (zScore * s); 
  }

  /**
   * Active Return: ผลตอบแทนส่วนต่างจาก Benchmark สุทธิ
   */
  static calculateActiveReturn(portReturns: number[], benchReturns: number[]): number {
    return this.calculateAnnualizedReturn(portReturns) - this.calculateAnnualizedReturn(benchReturns);
  }

  /**
   * Gain/Loss Ratio: ต่างจาก Profit Factor ตรงที่ใช้อัตราส่วนของ "ค่าเฉลี่ย" ของกำไร/ขาดทุน
   */
  static calculateGainLossRatio(dailyReturns: number[]): number {
    const wins = dailyReturns.filter(r => r > 0);
    const losses = dailyReturns.filter(r => r < 0);
    
    if (losses.length === 0) return 999;
    if (wins.length === 0) return 0;

    const avgWin = mean(wins);
    const avgLoss = Math.abs(mean(losses));
    
    return avgLoss === 0 ? 999 : avgWin / avgLoss;
  }

  static calculateAnnualizedArithmeticMean(dailyReturns: number[]): number {
    return mean(dailyReturns) * this.TRADING_DAYS_PER_YEAR;
  }

  /**
   * Standard Deviation (Monthly)
   */
  static calculateMonthlyVolatility(dailyReturns: number[]): number {
    // สมมติฐาน: 1 เดือนมีวันเทรดประมาณ 21 วัน
    return stdDev(dailyReturns) * Math.sqrt(21);
  }

  /**
   * Downside Deviation (Monthly)
   */
  static calculateMonthlyDownsideDeviation(dailyReturns: number[], targetReturn: number = 0): number {
    return this.calculateDownsideDeviation(dailyReturns, targetReturn) * Math.sqrt(21);
  }

  /**
   * Positive Periods (นับจำนวนวันที่ชนะตลาด พร้อม %)
   */
  static getPositivePeriods(dailyReturns: number[]): { wins: number; total: number; winRate: number } {
    if (dailyReturns.length === 0) return { wins: 0, total: 0, winRate: 0 };
    const wins = dailyReturns.filter((r) => r > 0).length;
    return {
      wins,
      total: dailyReturns.length,
      winRate: wins / dailyReturns.length,
    };
  }

  /**
   * Perpetual Withdrawal Rate (PWR) 
   * อัตราถอนเงินสูงสุดที่จะทำให้เงินต้นอยู่ครบไปตลอดกาล (ปรับอัตราเงินเฟ้อแล้ว)
   * @param cagr อัตราผลตอบแทนทบต้นต่อปี
   * @param inflationRate อัตราเงินเฟ้อคาดการณ์ (ค่า Default คือ 3% หรือ 0.03)
   */
  static calculatePerpetualWithdrawalRate(cagr: number, inflationRate: number = 0.03): number {
    // คำนวณ Real Return (ผลตอบแทนที่แท้จริงหลังหักเงินเฟ้อ)
    return ((1 + cagr) / (1 + inflationRate)) - 1;
  }

  /**
   * Safe Withdrawal Rate (SWR)
   * อัตราถอนเงินที่ปลอดภัยที่สุดโดยที่เงินจะไม่หมดพอร์ตตลอดระยะเวลาลงทุน (ตามสมการ Annuity)
   * @param cagr อัตราผลตอบแทนทบต้นต่อปี
   * @param years จำนวนปีที่ลงทุน
   * @param inflationRate อัตราเงินเฟ้อคาดการณ์
   */
  static calculateSafeWithdrawalRate(cagr: number, years: number, inflationRate: number = 0.03): number {
    if (years <= 0) return 0;
    const realReturn = this.calculatePerpetualWithdrawalRate(cagr, inflationRate);
    
    // ถ้าผลตอบแทนแพ้เงินเฟ้อ ให้ถอนแบบหารเฉลี่ยตรงๆ ไปเลยเพื่อเซฟเงิน
    if (realReturn <= 0) return 1 / years; 
    
    // สมการคำนวณ PMT แบบง่าย (Annuity Formula)
    return realReturn / (1 - Math.pow(1 + realReturn, -years));
  }

  /**
   * Omega Ratio: วัดผลตอบแทนส่วนที่ชนะเป้าหมาย เทียบกับส่วนที่แพ้เป้าหมาย
   * (ดีกว่า Sharpe Ratio ตรงที่ไม่มองการพุ่งขึ้นแรงๆ เป็นความเสี่ยง)
   * @param returns Array ของผลตอบแทน
   * @param targetReturn เป้าหมายผลตอบแทน (ค่า Default คือ 0)
   */
  static calculateOmegaRatio(returns: number[], targetReturn: number = 0): number {
    let sumWin = 0;
    let sumLoss = 0;
    
    for (const r of returns) {
      if (r > targetReturn) {
        sumWin += (r - targetReturn);
      } else if (r < targetReturn) {
        sumLoss += Math.abs(targetReturn - r); // นับเฉพาะระยะที่พลาดเป้า
      }
    }
    
    if (sumLoss === 0) return 999; // ถ้าไม่เคยขาดทุนเลย ให้ค่าเป็นอนันต์ (999)
    return sumWin / sumLoss;
  }

  /**
   * Tail Ratio: วัดว่าเวลาพอร์ตแจ็คพอตแตก (ได้กำไรสูงสุด 5%) เทียบกับเวลาซวย (ขาดทุนหนักสุด 5%) อัตราส่วนเป็นเท่าไหร่
   * ค่า > 1 แปลว่า Upside มากกว่า Downside
   */
  static calculateTailRatio(returns: number[]): number {
    if (returns.length < 20) return 0; // ต้องมีข้อมูลมากพอ
    
    // เรียงลำดับผลตอบแทนจากน้อยไปมาก
    const sorted = [...returns].sort((a, b) => a - b);
    
    // หาตำแหน่ง P95 (กำไรฝั่งขวา) และ P05 (ขาดทุนฝั่งซ้าย)
    const p95Idx = Math.floor(sorted.length * 0.95);
    const p05Idx = Math.floor(sorted.length * 0.05);
    
    const p95 = sorted[p95Idx] ?? 0;
    const p05 = Math.abs(sorted[p05Idx] ?? 0);
    
    if (p05 === 0) return 999;
    return p95 / p05;
  }

  /**
   * Expectancy (ค่าความคาดหวังของพอร์ต): เทรด 1 วันโดยเฉลี่ยแล้วจะได้หรือเสียเงินเท่าไหร่
   */
  static calculateExpectancy(returns: number[]): number {
    if (returns.length === 0) return 0;
    
    const wins = returns.filter(r => r > 0);
    const losses = returns.filter(r => r < 0);
    
    const winRate = wins.length / returns.length;
    const lossRate = losses.length / returns.length;
    
    const avgWin = wins.length > 0 ? (wins.reduce((a, b) => a + b, 0) / wins.length) : 0;
    const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((a, b) => a + b, 0) / losses.length) : 0;
    
    return (winRate * avgWin) - (lossRate * avgLoss);
  }

  /**
   * ปรับฐานราคา Benchmark ให้เริ่มต้นเท่ากับเงินทุนของพอร์ต (เพื่อพล็อตกราฟเปรียบเทียบ Equity Curve)
   */
  static normalizeEquity(prices: number[], initialCapital: number): number[] {
    if (prices.length === 0) return [];
    const firstPrice = prices[0];
    if (firstPrice === undefined || firstPrice === 0) return prices.map(() => 0);
    
    const units = initialCapital / firstPrice;
    return prices.map(price => price * units);
  }

  /**
   * สร้างข้อมูลสำหรับตาราง Heatmap ผลตอบแทนรายเดือน
   * @param dates Array ของวันที่ รูปแบบ 'YYYY-MM-DD'
   * @param dailyReturns Array ของผลตอบแทนรายวัน
   */
  static calculateMonthlyReturnsBreakdown(dates: string[], dailyReturns: number[]) {
    if (dates.length === 0 || dates.length - 1 !== dailyReturns.length) return [];

    const monthlyMap = new Map<string, number[]>();

    // จัดกลุ่มผลตอบแทนรายวันตาม 'YYYY-MM'
    for (let i = 0; i < dailyReturns.length; i++) {
      // dailyReturns จะช้ากว่า dates อยู่ 1 index เสมอ (เพราะวันแรกไม่มีผลตอบแทน)
      const dateStr = dates[i + 1]; 
      const ret = dailyReturns[i];
      if (!dateStr || ret === undefined) continue;

      const yearMonth = dateStr.substring(0, 7); // สกัด 'YYYY-MM'
      if (!monthlyMap.has(yearMonth)) {
        monthlyMap.set(yearMonth, []);
      }
      monthlyMap.get(yearMonth)!.push(ret);
    }

    // คำนวณ Geometric Return สำหรับแต่ละเดือน
    const result = Array.from(monthlyMap.entries()).map(([yearMonth, returns]) => {
      const [year, month] = yearMonth.split('-');
      const compoundReturn = returns.reduce((acc, r) => acc * (1 + r), 1) - 1;
      return {
        year: parseInt(year!),
        month: parseInt(month!),
        label: yearMonth,
        return: compoundReturn
      };
    });

    return result.sort((a, b) => a.label.localeCompare(b.label)); // เรียงจากอดีต -> ปัจจุบัน
  }
}