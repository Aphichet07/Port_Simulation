import { t } from "elysia";

export const positionSchema = t.Object({
  symbol: t.String(),
  side: t.String(),
  status: t.String(),
  opened_by: t.String(),
  entry: t.Number(),
  current: t.Number(),
  tp: t.Number(),
  sl: t.Number(),
  lev: t.String(),
  margin: t.Number(),
  risk: t.Number(),
  rr: t.Number(),
  pnl: t.Number(),
});

export const statusResponseSchema = t.Object({
  auto_run: t.Boolean(),
  checked_positions_count: t.Numeric(),
  closed_positions_count: t.Numeric(),
  equity: t.Numeric(),
  realized_pnl: t.Numeric(),
  unrealized_pnl: t.Numeric(),
  win_rate: t.Numeric(),
  closed_trades: t.Numeric(),
  winning_trades: t.Numeric(),
  losing_trades: t.Numeric(),
  ai_cycle_timer: t.Numeric(),
  pnl_update_timer: t.Numeric(),
  active_agent_step: t.Numeric(),
  btc_price: t.Numeric(),
  sol_price: t.Numeric(),
});

export const lastClosedTradeResponseSchema = t.Nullable(
  t.Object({
    result: t.String(),
    symbol: t.String(),
    close_reason: t.String(),
    pnl: t.Numeric(),
    summary: t.String(),
    root_cause: t.String(),
    feedback: t.Object({
      scout: t.String(),
      sigma: t.String(),
      vault: t.String(),
      shield: t.String(),
      captain: t.String(),
    }),
  })
);

export const marketAnalysisResponseSchema = t.Nullable(
  t.Object({
    signal: t.String(),
    confidence: t.Numeric(),
    long_score: t.Numeric(),
    short_score: t.Numeric(),
    current_price: t.Numeric(),
    support: t.Numeric(),
    resistance: t.Numeric(),
    market_structure: t.String(),
    rsi: t.Numeric(),
    rsi_zone: t.String(),
    macd_state: t.String(),
    macd_hist: t.Numeric(),
    volume_ratio: t.Numeric(),
    volume_state: t.String(),
    rsi_divergence: t.String(),
    elliott_wave: t.String(),
    momentum_analysis: t.Object({
      rsi: t.String(),
      macd: t.String(),
      volume: t.String(),
      divergence: t.String(),
    }),
    elliott_wave_analysis: t.Object({
      likely_wave: t.String(),
      mode: t.String(),
      confidence: t.Numeric(),
      comment: t.String(),
    }),
    reasons: t.Array(t.String()),
  })
);

export const toggleAutoRunResponseSchema = t.Object({
  status: t.String(),
  auto_run: t.Boolean(),
});

export const checkGuardianResponseSchema = t.Object({
  status: t.String(),
  message: t.String(),
});

export const runGuardianCloseResponseSchema = t.Object({
  status: t.String(),
  closed_pnl: t.Numeric(),
});
