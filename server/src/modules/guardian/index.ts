import { Elysia, t } from "elysia";
import { GuardianService } from "./service";
import {
  statusResponseSchema,
  positionSchema,
  lastClosedTradeResponseSchema,
  marketAnalysisResponseSchema,
  toggleAutoRunResponseSchema,
  checkGuardianResponseSchema,
  runGuardianCloseResponseSchema
} from "./schema";

export const GuardianModule = new Elysia({ prefix: "/guardian" })
  .get("/status", async ({ set }) => {
    try {
      return await GuardianService.getStatus();
    } catch (error) {
      set.status = 500;
      return { success: false, error: (error as Error).message };
    }
  }, {
    response: {
      200: statusResponseSchema,
      500: t.Object({ success: t.Boolean(), error: t.String() })
    },
    detail: {
      tags: ["Guardian"],
      summary: "Get system status and stats",
      description: "Retrieve current auto run state, equity, win rate, and timer statuses from Position Guardian."
    }
  })
  .get("/positions", async ({ set }) => {
    try {
      return await GuardianService.getPositions();
    } catch (error) {
      set.status = 500;
      return { success: false, error: (error as Error).message };
    }
  }, {
    response: {
      200: t.Array(positionSchema),
      500: t.Object({ success: t.Boolean(), error: t.String() })
    },
    detail: {
      tags: ["Guardian"],
      summary: "Get live open positions",
      description: "Retrieve list of all currently open positions monitored by Position Guardian."
    }
  })
  .get("/last-closed-trade", async ({ set }) => {
    try {
      return await GuardianService.getLastClosedTrade();
    } catch (error) {
      set.status = 500;
      return { success: false, error: (error as Error).message };
    }
  }, {
    response: {
      200: lastClosedTradeResponseSchema,
      500: t.Object({ success: t.Boolean(), error: t.String() })
    },
    detail: {
      tags: ["Guardian"],
      summary: "Get last closed trade details",
      description: "Retrieve summary and agent feedback on the last closed position."
    }
  })
  .get("/market-analysis", async ({ set }) => {
    try {
      return await GuardianService.getMarketAnalysis();
    } catch (error) {
      set.status = 500;
      return { success: false, error: (error as Error).message };
    }
  }, {
    response: {
      200: marketAnalysisResponseSchema,
      500: t.Object({ success: t.Boolean(), error: t.String() })
    },
    detail: {
      tags: ["Guardian"],
      summary: "Get technical market analysis",
      description: "Retrieve signal scores, momentum analysis, support/resistance, and Elliott Wave annotations."
    }
  })
  .get("/logs", async ({ set }) => {
    try {
      return await GuardianService.getLogs();
    } catch (error) {
      set.status = 500;
      return { success: false, error: (error as Error).message };
    }
  }, {
    response: {
      200: t.Array(t.String()),
      500: t.Object({ success: t.Boolean(), error: t.String() })
    },
    detail: {
      tags: ["Guardian"],
      summary: "Get system logs",
      description: "Retrieve logs printed by the AI agent team during state executions."
    }
  })
  .post("/toggle-auto-run", async ({ set }) => {
    try {
      return await GuardianService.toggleAutoRun();
    } catch (error) {
      set.status = 500;
      return { success: false, error: (error as Error).message };
    }
  }, {
    response: {
      200: toggleAutoRunResponseSchema,
      500: t.Object({ success: t.Boolean(), error: t.String() })
    },
    detail: {
      tags: ["Guardian"],
      summary: "Toggle auto run state",
      description: "Enable or disable automatic periodic scanning loops on the AI agents."
    }
  })
  .post("/check-guardian-status", async ({ set }) => {
    try {
      return await GuardianService.checkGuardianStatus();
    } catch (error) {
      set.status = 500;
      return { success: false, error: (error as Error).message };
    }
  }, {
    response: {
      200: checkGuardianResponseSchema,
      500: t.Object({ success: t.Boolean(), error: t.String() })
    },
    detail: {
      tags: ["Guardian"],
      summary: "Force manual scan",
      description: "Immediately trigger the 5-step Multi-Agent verification pipeline sequence."
    }
  })
  .post("/run-guardian-close", async ({ set }) => {
    try {
      return await GuardianService.runGuardianClose();
    } catch (error) {
      set.status = 500;
      return { success: false, error: (error as Error).message };
    }
  }, {
    response: {
      200: runGuardianCloseResponseSchema,
      500: t.Object({ success: t.Boolean(), error: t.String() })
    },
    detail: {
      tags: ["Guardian"],
      summary: "Force manual close positions",
      description: "Force close open positions immediately, updating realizing PnLs and writing feedback logs."
    }
  });
