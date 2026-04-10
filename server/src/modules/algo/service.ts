import Docker from "dockerode";
import path from "path";
import fs from "fs/promises";
import os from "os";

const docker = new Docker();
const BOT_IMAGE = "trading-bot";

export type ContainerStatus = "RUNNING" | "STOPPED" | "EXECUTED" | "ERROR";

export interface BotContainer {
  id: string;
  dockerId: string;
  symbol: string;
  status: ContainerStatus;
  created_at: string;
  script: string;
}

export interface Trade {
  id: string;
  container_id: string;
  action: "BUY" | "SELL";
  symbol: string;
  executed_price: number;
  quantity: number;
  timestamp: string;
}

// In-memory store (เปลี่ยนเป็น DB ทีหลัง)
const bots = new Map<string, BotContainer>();
const trades = new Map<string, Trade[]>();

export const AlgoService = {

  // ── Deploy bot ──────────────────────────────────
  async deployBot(params: {
    script: string;
    symbol: string;
    userId: number;
    token: string;
  }): Promise<BotContainer> {
    const botId = crypto.randomUUID().slice(0, 8);

    // เขียน user script ลง temp file
    const tmpDir = path.join(os.tmpdir(), "trading-bots", botId);
    await fs.mkdir(tmpDir, { recursive: true });
    const scriptPath = path.join(tmpDir, "user_script.py");
    await fs.writeFile(scriptPath, params.script);

    // Spawn Docker container
    const container = await docker.createContainer({
      Image: BOT_IMAGE,
      name: `bot-${botId}`,
      Env: [
        `BOT_ID=${botId}`,
        `API_URL=http://host.docker.internal:${process.env.PORT || 8000}`,
        `API_TOKEN=${params.token}`,
      ],
      HostConfig: {
        Binds: [`${scriptPath}:/app/user_script.py:ro`],
        Memory: 128 * 1024 * 1024,   // 128MB limit
        NanoCpus: 500_000_000,        // 0.5 CPU
        NetworkMode: "bridge",
        AutoRemove: false,
      },
    });

    await container.start();

    const bot: BotContainer = {
      id: botId,
      dockerId: container.id,
      symbol: params.symbol,
      status: "RUNNING",
      created_at: new Date().toISOString(),
      script: params.script,
    };

    bots.set(botId, bot);
    trades.set(botId, []);

    console.log(`[AlgoService] Bot deployed: ${botId} (docker: ${container.id.slice(0, 12)})`);
    return bot;
  },

  // ── List bots ───────────────────────────────────
  async listContainers(): Promise<BotContainer[]> {
    // Sync status กับ Docker จริง
    for (const bot of bots.values()) {
      try {
        const container = docker.getContainer(bot.dockerId);
        const info = await container.inspect();
        if (!info.State.Running && bot.status === "RUNNING") {
          bot.status = info.State.ExitCode === 0 ? "EXECUTED" : "ERROR";
        }
      } catch {
        // container ถูกลบไปแล้ว
        if (bot.status === "RUNNING") bot.status = "STOPPED";
      }
    }
    return Array.from(bots.values());
  },

  // ── Get single bot ──────────────────────────────
  async getContainer(id: string): Promise<BotContainer | null> {
    const bot = bots.get(id);
    if (!bot) return null;

    try {
      const container = docker.getContainer(bot.dockerId);
      const info = await container.inspect();
      if (!info.State.Running && bot.status === "RUNNING") {
        bot.status = info.State.ExitCode === 0 ? "EXECUTED" : "ERROR";
      }
    } catch {
      if (bot.status === "RUNNING") bot.status = "STOPPED";
    }

    return bot;
  },

  // ── Stop bot ────────────────────────────────────
  async stopBot(id: string): Promise<void> {
    const bot = bots.get(id);
    if (!bot) throw new Error("ไม่พบ bot");

    try {
      const container = docker.getContainer(bot.dockerId);
      await container.stop({ t: 5 });
    } catch {
      // container อาจจบไปแล้ว
    }

    bot.status = "STOPPED";
    console.log(`[AlgoService] Bot stopped: ${id}`);
  },

  // ── Get logs ────────────────────────────────────
  async getLogs(id: string): Promise<string> {
    const bot = bots.get(id);
    if (!bot) throw new Error("ไม่พบ bot");

    try {
      const container = docker.getContainer(bot.dockerId);
      const logs = await container.logs({
        stdout: true,
        stderr: true,
        tail: 100,
      });
      return logs.toString();
    } catch {
      return "ไม่สามารถดึง logs ได้";
    }
  },

  // ── Trade history ───────────────────────────────
  async getTradeHistory(containerId: string): Promise<Trade[]> {
    if (!bots.has(containerId)) throw new Error("ไม่พบ bot");
    return trades.get(containerId) ?? [];
  },

  // ── Record trade (เรียกจาก SDK callback) ────────
  async recordTrade(containerId: string, trade: Omit<Trade, "id" | "container_id">) {
    const bot = bots.get(containerId);
    if (!bot) return;

    const newTrade: Trade = {
      id: crypto.randomUUID().slice(0, 8),
      container_id: containerId,
      ...trade,
    };

    const history = trades.get(containerId) ?? [];
    history.push(newTrade);
    trades.set(containerId, history);
  },
};