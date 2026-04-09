import { AlgoService } from "./service";

export const AlgoController = {

  async deploy(body: {
    script: string;
    symbol: string;
    userId: number;
    token: string;
  }) {
    try {
      const container = await AlgoService.deployBot(body);
      return { success: true, data: container };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async getContainers() {
    try {
      const containers = await AlgoService.listContainers();
      return { success: true, data: containers };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async getContainerById(id: string) {
    try {
      const container = await AlgoService.getContainer(id);
      if (!container) return { success: false, error: "ไม่พบ bot" };
      return { success: true, data: container };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async stopContainer(id: string) {
    try {
      await AlgoService.stopBot(id);
      return { success: true, message: `Bot ${id} stopped` };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async getLogs(id: string) {
    try {
      const logs = await AlgoService.getLogs(id);
      return { success: true, data: logs };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async getTrades(containerId: string) {
    try {
      const trades = await AlgoService.getTradeHistory(containerId);
      return { success: true, data: trades };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async reportTrade(containerId: string, trade: {
    action: "BUY" | "SELL";
    symbol: string;
    quantity: number;
    executed_price: number;
  }) {
    try {
      await AlgoService.recordTrade(containerId, {
        ...trade,
        timestamp: new Date().toISOString(),
      });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },
};