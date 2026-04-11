import { AlgoService } from "./service";

// Helper: แปลง Promise ให้เป็น {success, data/error}
const handle = async <T>(fn: () => Promise<T>) => {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

export const AlgoController = {
  // Deploy bot ไปยัง Docker
  async deploy(body: {
    script: string;
    symbol: string;
    userId: number;
    token: string;
  }) {
    return handle(() => AlgoService.deployBot(body));
  },

  // ดูทุก bots ทั้งหมด
  async getContainers() {
    return handle(() => AlgoService.listContainers());
  },

  // ดู bot ตัวเดียว
  async getContainerById(id: string) {
    return handle(async () => {
      const container = await AlgoService.getContainer(id);
      if (!container) throw new Error("ไม่พบ bot");
      return container;
    });
  },

  // หยุด bot
  async stopContainer(id: string) {
    return handle(async () => {
      await AlgoService.stopBot(id);
      return { message: `Bot ${id} stopped` };
    });
  },

  // ดู logs ของ bot
  async getLogs(id: string) {
    return handle(() => AlgoService.getLogs(id));
  },

  // ดู trade history
  async getTrades(containerId: string) {
    return handle(() => AlgoService.getTradeHistory(containerId));
  },

  // บันทึก trade (callback จาก SDK)
  async reportTrade(
    containerId: string,
    trade: {
      action: "BUY" | "SELL";
      symbol: string;
      quantity: number;
      executed_price: number;
    }
  ) {
    return handle(async () => {
      await AlgoService.recordTrade(containerId, {
        ...trade,
        timestamp: new Date().toISOString(),
      });
      return { message: "Trade recorded" };
    });
  },

  // Backtest script ก่อน deploy
  async backtest(body: {
    script: string;
    symbol: string;
    timeframe: string;
    start_date?: string;
    end_date?: string;
  }) {
    return handle(() => AlgoService.backtestScript(body));
  },
};