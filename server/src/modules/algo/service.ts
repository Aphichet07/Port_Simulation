import Docker from "dockerode";
import path from "path";
import fs from "fs/promises";
import os from "os";

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

const docker = new Docker();
const BOT_IMAGE = "trading-bot";
const BACKTEST_URL = process.env.BACKTEST_SERVICE_URL || "http://localhost:8001";

const bots = new Map<string, BotContainer>();
const trades = new Map<string, Trade[]>();


async function deployDockerBot(params: {
  script: string;
  symbol: string;
  userId: number;
  token: string;
}): Promise<BotContainer> {
  const botId = crypto.randomUUID().slice(0, 8);
  const tmpDir = path.join(os.tmpdir(), "trading-bots", botId);
  
  // สร้างไดเรกทอรี่และเขียน script
  await fs.mkdir(tmpDir, { recursive: true });
  const scriptPath = path.join(tmpDir, "user_script.py");
  await fs.writeFile(scriptPath, params.script);

  // สร้าง Docker container
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
      Memory: 128 * 1024 * 1024,
      NanoCpus: 500_000_000,
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

  console.log(`Bot deployed: ${botId}`);
  return bot;
}

async function listAllBots(): Promise<BotContainer[]> {
  // Sync status กับ Docker docker
  for (const bot of bots.values()) {
    try {
      const container = docker.getContainer(bot.dockerId);
      const info = await container.inspect();
      if (!info.State.Running && bot.status === "RUNNING") {
        bot.status = info.State.ExitCode === 0 ? "EXECUTED" : "ERROR";
      }
    } catch {
      if (bot.status === "RUNNING") bot.status = "STOPPED";
    }
  }
  return Array.from(bots.values());
}

async function getBotById(id: string): Promise<BotContainer | null> {
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
}

async function stopBotById(id: string): Promise<void> {
  const bot = bots.get(id);
  if (!bot) throw new Error("ไม่พบ bot");

  try {
    const container = docker.getContainer(bot.dockerId);
    await container.stop({ t: 5 });
  } catch {
    // container อาจปิดไปแล้ว
  }

  bot.status = "STOPPED";
  console.log(`Bot stopped: ${id}`);
}

// LOGS & TRADES


async function getBotLogs(id: string): Promise<string> {
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
    return "(ไม่สามารถดึง logs ได้)";
  }
}

async function getTradesForBot(botId: string): Promise<Trade[]> {
  if (!bots.has(botId)) throw new Error("ไม่พบ bot");
  return trades.get(botId) ?? [];
}

async function recordBotTrade(botId: string, trade: Omit<Trade, "id" | "container_id">): Promise<void> {
  const bot = bots.get(botId);
  if (!bot) return;

  const newTrade: Trade = {
    id: crypto.randomUUID().slice(0, 8),
    container_id: botId,
    ...trade,
  };

  const history = trades.get(botId) ?? [];
  history.push(newTrade);
  trades.set(botId, history);
}

// BACKTEST: Python Subprocess


async function runBacktest(params: {
  script: string;
  symbol: string;
  timeframe: string;
  start_date?: string;
  end_date?: string;
  max_trades?: number;
}): Promise<any> {
  const res = await fetch(`${BACKTEST_URL}/backtest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      script: params.script,
      symbol: params.symbol,
      timeframe: params.timeframe,
      start_date: params.start_date || null,
      end_date: params.end_date || null,
      max_trades: params.max_trades || 0,
    }),
  });

  const json = await res.json() as any;

  if (!res.ok) {
    throw new Error(json.detail || `Backtest service error: ${res.status}`);
  }

  return json.data;
}

// EXPORT SERVICE

export const AlgoService = {
  deployBot: deployDockerBot,
  listContainers: listAllBots,
  getContainer: getBotById,
  stopBot: stopBotById,
  getLogs: getBotLogs,
  getTradeHistory: getTradesForBot,
  recordTrade: recordBotTrade,
  backtestScript: runBacktest,
};