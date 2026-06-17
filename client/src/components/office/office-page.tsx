"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ShieldAlert,
  Flame,
  MessageSquare,
  Cpu,
  RefreshCw,
  Play,
  Square,
  ShieldCheck,
  Terminal,
  Wallet,
  TrendingUp,
  UserCheck,
  ScanEye,
  Briefcase,
  List,
  BarChart2,
} from "lucide-react";
import { AppHeader } from "../overview/header";
import "./office.css";
import { API_URL } from "@/src/config";

const API_BASE = `${API_URL}/guardian`;

// Interfaces
interface Position {
  symbol: string;
  side: string;
  status: string;
  opened_by: string;
  entry: number;
  current: number;
  tp: number;
  sl: number;
  lev: string;
  margin: number;
  risk: number;
  rr: number;
  pnl: number;
}

interface LastClosedTrade {
  result: string;
  symbol: string;
  close_reason: string;
  pnl: number;
  summary: string;
  root_cause: string;
  feedback: {
    scout: string;
    sigma: string;
    vault: string;
    shield: string;
    captain: string;
  };
}

interface MarketAnalysis {
  signal: string;
  confidence: number;
  long_score: number;
  short_score: number;
  current_price: number;
  support: number;
  resistance: number;
  market_structure: string;
  rsi: number;
  rsi_zone: string;
  macd_state: string;
  macd_hist: number;
  volume_ratio: number;
  volume_state: string;
  rsi_divergence: string;
  elliott_wave: string;
  momentum_analysis: {
    rsi: string;
    macd: string;
    volume: string;
    divergence: string;
  };
  elliott_wave_analysis: {
    likely_wave: string;
    mode: string;
    confidence: number;
    comment: string;
  };
  reasons: string[];
}

export const OfficeView = () => {
  const [activeTab, setActiveTab] = useState<"office" | "positions" | "market">("office");
  const [autoRun, setAutoRun] = useState<boolean>(true);
  const [checkedCount, setCheckedCount] = useState<number>(0);
  const [closedCount, setClosedCount] = useState<number>(0);
  const [equity, setEquity] = useState<number>(500.00);
  const [realizedPnl, setRealizedPnl] = useState<number>(0.00);
  const [unrealizedPnl, setUnrealizedPnl] = useState<number>(0.00);
  const [winRate, setWinRate] = useState<number>(100.00);
  const [closedTrades, setClosedTrades] = useState<number>(0);
  const [winningTrades, setWinningTrades] = useState<number>(0);
  const [btcPrice, setBtcPrice] = useState<number>(0);
  const [solPrice, setSolPrice] = useState<number>(0);
  
  const [aiCycleTimer, setAiCycleTimer] = useState<number>(60);
  const [pnlUpdateTimer, setPnlUpdateTimer] = useState<number>(5);
  const [activeAgentStep, setActiveAgentStep] = useState<number>(-1);
  
  const [positions, setPositions] = useState<Position[]>([]);
  const [lastClosedTrade, setLastClosedTrade] = useState<LastClosedTrade | null>(null);
  const [marketAnalysis, setMarketAnalysis] = useState<MarketAnalysis | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const consoleEndRef = useRef<HTMLDivElement>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);

  // Scroll console to bottom
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  // Fetch status
  const fetchStatus = async () => {
    try {
      const res = await fetch(`${API_BASE}/status`);
      if (res.ok) {
        const data = await res.json();
        setAutoRun(data.auto_run);
        setCheckedCount(data.checked_positions_count);
        setClosedCount(data.closed_positions_count);
        setEquity(data.equity);
        setRealizedPnl(data.realized_pnl);
        setUnrealizedPnl(data.unrealized_pnl);
        setWinRate(data.win_rate);
        setClosedTrades(data.closed_trades);
        setWinningTrades(data.winning_trades);
        setAiCycleTimer(data.ai_cycle_timer);
        setPnlUpdateTimer(data.pnl_update_timer);
        setActiveAgentStep(data.active_agent_step);
        setBtcPrice(data.btc_price || 0);
        setSolPrice(data.sol_price || 0);
      }
    } catch (err) {
      console.error("Failed to fetch state status", err);
    }
  };

  // Fetch positions
  const fetchPositions = async () => {
    try {
      const res = await fetch(`${API_BASE}/positions`);
      if (res.ok) {
        const data = await res.json();
        setPositions(data);
      }
    } catch (err) {
      console.error("Failed to fetch positions", err);
    }
  };

  // Fetch feedback details
  const fetchFeedback = async () => {
    try {
      const res = await fetch(`${API_BASE}/last-closed-trade`);
      if (res.ok) {
        const data = await res.json();
        setLastClosedTrade(data);
      }
    } catch (err) {
      console.error("Failed to fetch feedback", err);
    }
  };

  // Fetch market analysis
  const fetchMarketAnalysis = async () => {
    try {
      const res = await fetch(`${API_BASE}/market-analysis`);
      if (res.ok) {
        const data = await res.json();
        setMarketAnalysis(data);
      }
    } catch (err) {
      console.error("Failed to fetch market analysis", err);
    }
  };

  // Fetch logs
  const fetchLogs = async () => {
    try {
      const res = await fetch(`${API_BASE}/logs`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (err) {
      console.error("Failed to fetch system logs", err);
    }
  };

  // Actions
  const handleToggleAutoRun = async () => {
    try {
      const res = await fetch(`${API_BASE}/toggle-auto-run`, { method: "POST" });
      if (res.ok) {
        fetchStatus();
      }
    } catch (err) {
      console.error("Failed to toggle auto run", err);
    }
  };

  const handleManualCheck = async () => {
    try {
      setIsScanning(true);
      const res = await fetch(`${API_BASE}/check-guardian-status`, { method: "POST" });
      if (res.ok) {
        addSystemLog("Manual scan successfully requested to AI agent team");
      }
    } catch (err) {
      console.error("Failed to trigger check status", err);
    } finally {
      setTimeout(() => {
        setIsScanning(false);
      }, 3000);
    }
  };

  const handleManualClose = async () => {
    if (!window.confirm("คุณมั่นใจที่จะบังคับสั่งปิดโพซิชั่นทั้งหมดด้วยตัวเอง (Manual Close) หรือไม่?")) return;
    try {
      const res = await fetch(`${API_BASE}/run-guardian-close`, { method: "POST" });
      if (res.ok) {
        addSystemLog("Manual close executed successfully");
        fetchPositions();
        fetchStatus();
        fetchFeedback();
      } else {
        const err = await res.json();
        alert(err.error || "เกิดข้อผิดพลาดในการสั่งปิดโพซิชั่น");
      }
    } catch (err) {
      console.error("Failed to manual close position", err);
    }
  };

  const addSystemLog = (text: string) => {
    const time_str = new Date().toLocaleTimeString("th-TH", { hour12: false });
    setLogs(prev => [...prev, `[${time_str}] [System] ${text}`]);
  };

  // Set intervals for updates
  useEffect(() => {
    fetchStatus();
    fetchPositions();
    fetchFeedback();
    fetchMarketAnalysis();
    fetchLogs();

    const fastInterval = setInterval(() => {
      fetchStatus();
      fetchPositions();
      fetchLogs();
    }, 1000);

    const slowInterval = setInterval(() => {
      fetchFeedback();
      fetchMarketAnalysis();
    }, 2000);

    return () => {
      clearInterval(fastInterval);
      clearInterval(slowInterval);
    };
  }, []);

  // Parse log line helper
  const parseLogLine = (line: string) => {
    const match = line.match(/^\[(.*?)\]\s+\[(.*?)\]\s+(.*)$/);
    if (match) {
      const [, time, tag, msg] = match;
      let tagClass = "text-cyan";
      if (tag === "System") tagClass = "text-white";
      else if (tag === "Scout") tagClass = "text-warning";
      else if (tag === "Sigma") tagClass = "text-success";
      else if (tag === "Vault") tagClass = "text-cyan";
      else if (tag === "Shield") tagClass = "text-white";
      else if (tag === "Captain") tagClass = "text-danger";

      return (
        <div className="console-line">
          <span className="console-time">[{time}]</span>
          <span className={`console-tag ${tagClass}`}>[{tag}]</span>
          <span className="console-msg">{msg}</span>
        </div>
      );
    }
    return <div className="console-line"><span className="console-msg">{line}</span></div>;
  };

  return (
    <div className="office-root select-none min-h-screen bg-[#05070f] text-[#e2e8f0]">
      {/* Header bar component integrated */}
      <AppHeader />

      {/* Sub-Header / Tab Switcher */}
      <div className="office-sub-header">
        <div className="office-tabs">
          <button
            className={`office-tab ${activeTab === "office" ? "active" : ""}`}
            onClick={() => setActiveTab("office")}
          >
            <Briefcase size={12} /> Control Room
          </button>
          <button
            className={`office-tab ${activeTab === "positions" ? "active" : ""}`}
            onClick={() => setActiveTab("positions")}
          >
            <ShieldAlert size={12} /> Open Positions
          </button>
          <button
            className={`office-tab ${activeTab === "market" ? "active" : ""}`}
            onClick={() => setActiveTab("market")}
          >
            <BarChart2 size={12} /> Market Intelligence
          </button>
        </div>

        {/* Quick state indicators */}
        <div className="quick-state-bar">
          <span className="state-item">
            Auto Run: <strong className={autoRun ? "text-success" : "text-danger"}>{autoRun ? "ON" : "OFF"}</strong>
          </span>
          <span className="state-divider">|</span>
          <span className="state-item">
            Next AI Cycle: <strong>{aiCycleTimer}s</strong>
          </span>
          <span className="state-divider">|</span>
          <span className="state-item">
            PnL Update: <strong>{pnlUpdateTimer}s</strong>
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === "office" && (
        <div className="dashboard-grid">
          {/* Left Panel */}
          <div className="panel left-panel">
            {/* Control Center */}
            <div className="card danger-zone-card">
              <div className="card-header border-b">
                <Flame className="text-danger" />
                <span className="pixel-text card-title text-danger">Control Center</span>
              </div>
              <div className="card-content flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Auto Running Mode</span>
                  <button
                    onClick={handleToggleAutoRun}
                    className={`action-btn ${autoRun ? "btn-red" : "btn-blue"}`}
                  >
                    {autoRun ? "Pause Auto Run" : "Start Auto Run"}
                  </button>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                  <span className="text-sm">Manual Agent Check</span>
                  <button
                    onClick={handleManualCheck}
                    disabled={isScanning}
                    className="action-btn btn-blue"
                  >
                    {isScanning ? "Scanning..." : "Check Status"}
                  </button>
                </div>
              </div>
            </div>

            {/* Account Summary */}
            <div className="stats-grid">
              <div className="card stat-card">
                <span className="stat-label">Account Equity</span>
                <span className="stat-value font-digital text-cyan">
                  ${equity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="card stat-card">
                <span className="stat-label">Realized PnL</span>
                <span className={`stat-value font-digital ${realizedPnl >= 0 ? "text-success" : "text-danger"}`}>
                  {realizedPnl >= 0 ? "+" : "-"}${Math.abs(realizedPnl).toFixed(2)}
                </span>
              </div>
              <div className="card stat-card">
                <span className="stat-label">Unrealized PnL</span>
                <span className={`stat-value font-digital ${unrealizedPnl >= 0 ? "text-success" : "text-danger"}`}>
                  {unrealizedPnl >= 0 ? "+" : "-"}${Math.abs(unrealizedPnl).toFixed(2)}
                </span>
              </div>
              <div className="card stat-card">
                <span className="stat-label">Win Rate</span>
                <span className="stat-value font-digital text-cyan">{winRate.toFixed(2)}%</span>
                <span className="sub-stat">{winningTrades} / {closedTrades} Trades</span>
              </div>
            </div>

            {/* Live Asset Prices */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="card-header border-b">
                <TrendingUp className="text-cyan" size={16} />
                <span className="pixel-text card-title text-cyan">Live Asset Prices</span>
                <span className="relative flex h-2 w-2 ml-auto">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                </span>
              </div>
              <div className="card-content flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-400">BTCUSDT</span>
                  <span className="font-digital text-white font-bold text-base">
                    ${btcPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-800/40">
                  <span className="text-xs font-semibold text-slate-400">SOLUSDT</span>
                  <span className="font-digital text-white font-bold text-base">
                    ${solPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Center Panel (Pixel Office & logs combined) */}
          <div className="panel center-panel">
            {/* Pixel Art Office */}
            <div className="card office-card">
              <div className="office-container">
                <div className="office-overlay-title">KMUTT TRADING CONTROL</div>

                {/* Captain */}
                <div className={`character-wrapper captain-pos ${activeAgentStep === 4 ? "active" : ""}`}>
                  <div className="speech-bubble">
                    {activeAgentStep === 4 ? "Captain: MONITORING..." : "Captain: GUARDING"}
                  </div>
                  <div className="char-sprite captain-sprite">
                    <div className="holo-effect"></div>
                  </div>
                  <div className="char-label">Captain</div>
                </div>

                {/* Scout */}
                <div className={`character-wrapper scout-pos ${activeAgentStep === 0 ? "active" : ""}`}>
                  <div className="speech-bubble">
                    {activeAgentStep === 0 ? "Scout: ANALYZING..." : "Scout: SCANNING"}
                  </div>
                  <div className="char-sprite scout-sprite"></div>
                  <div className="char-label">Scout</div>
                </div>

                {/* Sigma */}
                <div className={`character-wrapper sigma-pos ${activeAgentStep === 1 ? "active" : ""}`}>
                  <div className="speech-bubble">
                    {activeAgentStep === 1 ? "Sigma: STRATEGIZING..." : "Sigma: PLANNING"}
                  </div>
                  <div className="char-sprite sigma-sprite"></div>
                  <div className="char-label">Sigma</div>
                </div>

                {/* Vault */}
                <div className={`character-wrapper vault-pos ${activeAgentStep === 2 ? "active" : ""}`}>
                  <div className="speech-bubble">
                    {activeAgentStep === 2 ? "Vault: SIZING..." : "Vault: PRICING"}
                  </div>
                  <div className="char-sprite vault-sprite"></div>
                  <div className="char-label">Vault</div>
                </div>
              </div>
            </div>

            {/* Terminal Console Log */}
            <div className="card console-panel" style={{ height: "290px" }}>
              <div className="console-header">
                <Terminal />
                <span className="pixel-text card-title">SYSTEM MONITOR & LOGS</span>
              </div>
              <div className="console-body" id="console-logs">
                {logs.map((line, idx) => (
                  <React.Fragment key={idx}>{parseLogLine(line)}</React.Fragment>
                ))}
                <div ref={consoleEndRef} />
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="panel right-panel">
            {/* Trade Feedback Details */}
            <div className="card feedback-card">
              <div className="card-header border-b">
                <MessageSquare className="text-cyan" />
                <span className="pixel-text card-title text-cyan">
                  Last Closed: <span className={lastClosedTrade?.result === "WIN" ? "text-success" : "text-danger"}>{lastClosedTrade?.result || "WIN"}</span>
                </span>
              </div>
              <div className="card-content feedback-content">
                {lastClosedTrade ? (
                  <>
                    <div className="feedback-info">
                      <div>Symbol: <strong className="text-white">{lastClosedTrade.symbol}</strong></div>
                      <div>Reason: <strong className={lastClosedTrade.result === "WIN" ? "text-success" : "text-danger"}>{lastClosedTrade.close_reason}</strong></div>
                      <div>PNL: <strong className={lastClosedTrade.pnl >= 0 ? "text-success" : "text-danger"}>{lastClosedTrade.pnl >= 0 ? "+" : ""}{lastClosedTrade.pnl.toFixed(2)} USDT</strong></div>
                    </div>
                    <div className="feedback-summary">
                      <span className="section-title">Summary:</span>
                      <p className="text-white">{lastClosedTrade.summary}</p>
                    </div>
                    <div className="feedback-rootcause">
                      <span className="section-title">Root Cause:</span>
                      <p>{lastClosedTrade.root_cause}</p>
                    </div>
                    <div className="agent-feedbacks">
                      <span className="section-title">Feedback:</span>
                      <ul>
                        <li><ScanEye /> <span>{lastClosedTrade.feedback.scout}</span></li>
                        <li><TrendingUp /> <span>{lastClosedTrade.feedback.sigma}</span></li>
                        <li><Wallet /> <span>{lastClosedTrade.feedback.vault}</span></li>
                        <li><ShieldAlert /> <span>{lastClosedTrade.feedback.shield}</span></li>
                        <li><UserCheck /> <span>{lastClosedTrade.feedback.captain}</span></li>
                      </ul>
                    </div>
                  </>
                ) : (
                  <p className="text-muted text-center py-8">ไม่มีข้อมูลการเทรดล่าสุด</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "positions" && (
        <div className="wide-panel">
          <div className="view-title-section">
            <h2 className="pixel-text view-title">Monitored Portfolio Positions</h2>
            <div className="guardian-actions">
              <button 
                onClick={handleManualCheck} 
                disabled={isScanning}
                className="action-btn btn-blue"
              >
                {isScanning ? "Scanning..." : "Force Guardian Scan"}
              </button>
              <button 
                onClick={handleManualClose} 
                disabled={positions.length === 0}
                className={`action-btn btn-red ${positions.length === 0 ? "opacity-50" : ""}`}
              >
                Close All Positions
              </button>
            </div>
          </div>

          {positions.length > 0 ? (
            <div className="positions-grid">
              {positions.map((p, idx) => {
                let progressPct = 50;
                if (p.tp !== p.sl) {
                  if (p.side === "LONG") {
                    progressPct = ((p.current - p.sl) / (p.tp - p.sl)) * 100;
                  } else {
                    progressPct = ((p.sl - p.current) / (p.sl - p.tp)) * 100;
                  }
                  if (progressPct < 0) progressPct = 0;
                  if (progressPct > 100) progressPct = 100;
                }
                
                return (
                  <div key={idx} className="unified-position-card">
                    <div className="card-top-row">
                      <div className="symbol-badge-container">
                        <span className="symbol-badge">{p.symbol}</span>
                        <span className={`side-badge ${p.side === "LONG" ? "long" : "short"}`}>
                          {p.side}
                        </span>
                        <span className="text-secondary text-xs font-semibold">
                          Leverage {p.lev} • Margin ${p.margin.toFixed(2)}
                        </span>
                      </div>
                      <div className={`card-pnl-section ${p.pnl >= 0 ? "text-success" : "text-danger"}`}>
                        {p.pnl >= 0 ? "+" : ""}{p.pnl.toFixed(2)} USDT
                      </div>
                    </div>

                    <div className="details-grid">
                      <div className="detail-item">
                        <span className="detail-lbl">Entry Price</span>
                        <span className="detail-val font-digital">${p.entry.toFixed(2)}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-lbl">Current Price</span>
                        <span className="detail-val font-digital text-white">${p.current.toFixed(2)}</span>
                      </div>
                      <div className="detail-item font-semibold">
                        <span className="detail-lbl">Stop Loss</span>
                        <span className="detail-val font-digital text-danger">${p.sl.toFixed(2)}</span>
                      </div>
                      <div className="detail-item font-semibold">
                        <span className="detail-lbl">Take Profit</span>
                        <span className="detail-val font-digital text-success">${p.tp.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Visual Progress Bar */}
                    <div className="progress-section">
                      <div className="progress-labels">
                        <span className="text-danger font-semibold">STOP LOSS (${p.sl.toFixed(2)})</span>
                        <span className="text-success font-semibold">TAKE PROFIT (${p.tp.toFixed(2)})</span>
                      </div>
                      <div className="progress-track-wrapper">
                        <div className="progress-track">
                          <div 
                            className="progress-fill" 
                            style={{ width: `${progressPct}%` }}
                          ></div>
                        </div>
                        <div 
                          className="price-indicator-dot" 
                          style={{ left: `${progressPct}%` }}
                        >
                          <div className="price-tooltip">${p.current.toFixed(2)}</div>
                        </div>
                      </div>
                    </div>

                    <div className="guardian-footer-row">
                      <div className="guardian-badges">
                        <div className="guardian-badge text-warning">
                          <ScanEye /> MONITORING
                        </div>
                        <div className="guardian-badge text-success">
                          <ShieldCheck /> Active Safe
                        </div>
                        <div className="guardian-badge text-danger">
                          <ShieldAlert /> Bearish Trend
                        </div>
                        <span className="text-secondary text-xs pl-2">
                          เฝ้าระวังจุด TP/SL ของโพซิชั่นแบบเรียลไทม์
                        </span>
                      </div>
                      
                      <button className="close-btn" onClick={handleManualClose}>
                        Force Close
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state-card">
              <ShieldCheck className="empty-state-icon text-success" />
              <h3 className="empty-state-title">ไม่มีโพซิชั่นเปิดอยู่ในระบบ</h3>
              <p className="empty-state-desc">
                ระบบสแกนพอร์ตปลอดภัยสมบูรณ์ (No monitored positions). บอทเฝ้าระวังจะแจ้งให้คุณทราบทันทีเมื่อมีรายการเปิดเทรดใหม่เกิดขึ้น
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === "market" && marketAnalysis && (
        <div className="wide-panel">
          <div className="view-title-section">
            <h2 className="pixel-text view-title">Market Intelligence</h2>
            <span className="text-secondary text-xs font-semibold">
              Technical analysis updated real-time
            </span>
          </div>

          <div className="market-intel-grid">
            {/* Left Side (Decision & Prices) */}
            <div className="market-left-side">
              {/* Signal Hero Card */}
              <div className="card signal-hero-card">
                <span className="stat-label">AI Consensus Signal</span>
                <span className={`signal-value-large text-glow ${marketAnalysis.signal === "BUY" ? "text-success text-glow-success" : marketAnalysis.signal === "SELL" ? "text-danger text-glow-danger" : "text-warning text-glow-warning"}`}>
                  {marketAnalysis.signal}
                </span>
                <div className="w-full mt-2">
                  <div className="flex justify-between text-xs text-secondary mb-1">
                    <span>Confidence Level</span>
                    <span>{marketAnalysis.confidence}%</span>
                  </div>
                  <div className="confidence-progress-bar">
                    <div 
                      className="confidence-progress-fill" 
                      style={{ 
                        width: `${marketAnalysis.confidence}%`,
                        backgroundColor: marketAnalysis.signal === "BUY" ? "var(--success)" : marketAnalysis.signal === "SELL" ? "var(--danger)" : "var(--warning)" 
                      }}
                    ></div>
                  </div>
                </div>
                <div className="w-full mt-4">
                  <div className="score-comparison-bar">
                    <div 
                      className="score-fill-long" 
                      style={{ width: `${(marketAnalysis.long_score / (marketAnalysis.long_score + marketAnalysis.short_score || 1)) * 100}%` }}
                    ></div>
                    <div 
                      className="score-fill-short" 
                      style={{ width: `${(marketAnalysis.short_score / (marketAnalysis.long_score + marketAnalysis.short_score || 1)) * 100}%` }}
                    ></div>
                  </div>
                  <div className="score-legend">
                    <span>Long Score: {marketAnalysis.long_score}</span>
                    <span>Short Score: {marketAnalysis.short_score}</span>
                  </div>
                </div>
              </div>

              {/* Core Prices Grid */}
              <div className="clean-indicator-row-grid">
                <div className="card clean-indicator-card">
                  <div className="clean-indicator-icon-box">
                    <TrendingUp size={16} />
                  </div>
                  <div className="clean-indicator-info">
                    <span className="clean-indicator-title">Current BTC Price</span>
                    <span className="clean-indicator-val digital text-cyan">
                      ${marketAnalysis.current_price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className="card clean-indicator-card">
                  <div className="clean-indicator-icon-box">
                    <ScanEye size={16} />
                  </div>
                  <div className="clean-indicator-info">
                    <span className="clean-indicator-title">Market Structure</span>
                    <span className="clean-indicator-val text-warning">
                      {marketAnalysis.market_structure}
                    </span>
                  </div>
                </div>

                <div className="card clean-indicator-card">
                  <div className="clean-indicator-icon-box">
                    <ShieldCheck size={16} className="text-success" />
                  </div>
                  <div className="clean-indicator-info">
                    <span className="clean-indicator-title">Support Level</span>
                    <span className="clean-indicator-val digital text-success">
                      ${marketAnalysis.support.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className="card clean-indicator-card">
                  <div className="clean-indicator-icon-box">
                    <ShieldAlert size={16} className="text-danger" />
                  </div>
                  <div className="clean-indicator-info">
                    <span className="clean-indicator-title">Resistance Level</span>
                    <span className="clean-indicator-val digital text-danger">
                      ${marketAnalysis.resistance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Technical Indicators */}
              <div className="clean-indicator-row-grid">
                <div className="card clean-indicator-card">
                  <div className="clean-indicator-info">
                    <span className="clean-indicator-title">RSI (Relative Strength)</span>
                    <span className="clean-indicator-val digital">{marketAnalysis.rsi.toFixed(2)} ({marketAnalysis.rsi_zone})</span>
                  </div>
                </div>

                <div className="card clean-indicator-card">
                  <div className="clean-indicator-info">
                    <span className="clean-indicator-title">MACD (Histogram)</span>
                    <span className="clean-indicator-val digital">{marketAnalysis.macd_hist.toFixed(4)} ({marketAnalysis.macd_state})</span>
                  </div>
                </div>

                <div className="card clean-indicator-card">
                  <div className="clean-indicator-info">
                    <span className="clean-indicator-title">Volume (Ratio)</span>
                    <span className="clean-indicator-val">{marketAnalysis.volume_state} ({marketAnalysis.volume_ratio.toFixed(2)})</span>
                  </div>
                </div>

                <div className="card clean-indicator-card">
                  <div className="clean-indicator-info">
                    <span className="clean-indicator-title">RSI Divergence</span>
                    <span className="clean-indicator-val text-success">{marketAnalysis.rsi_divergence}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side (Narratives & Explanations) */}
            <div className="market-right-side">
              {/* Momentum Analysis Narrative */}
              <div className="card analysis-card">
                <div className="card-header border-b">
                  <TrendingUp className="text-cyan" />
                  <span className="pixel-text card-title text-cyan">Momentum Narrative</span>
                </div>
                <div className="card-content analysis-content">
                  <div className="analysis-row">
                    <strong>RSI Status:</strong> <span className="text-slate-300">{marketAnalysis.momentum_analysis.rsi}</span>
                  </div>
                  <div className="analysis-row">
                    <strong>MACD Status:</strong> <span className="text-slate-300">{marketAnalysis.momentum_analysis.macd}</span>
                  </div>
                  <div className="analysis-row">
                    <strong>Volume Trend:</strong> <span className="text-slate-300">{marketAnalysis.momentum_analysis.volume}</span>
                  </div>
                  <div className="analysis-row">
                    <strong>Divergence Alert:</strong> <span className="text-success">{marketAnalysis.momentum_analysis.divergence}</span>
                  </div>
                </div>
              </div>

              {/* Elliott Wave Analysis */}
              <div className="card analysis-card">
                <div className="card-header border-b">
                  <BarChart2 className="text-warning" />
                  <span className="pixel-text card-title text-warning">Elliott Wave Breakdown</span>
                </div>
                <div className="card-content wave-content">
                  <div className="wave-stats">
                    <div>Likely Wave: <strong className="text-white">{marketAnalysis.elliott_wave_analysis.likely_wave}</strong></div>
                    <div>Wave Mode: <strong className="text-white">{marketAnalysis.elliott_wave_analysis.mode}</strong></div>
                    <div>Confidence: <strong className="text-cyan">{marketAnalysis.elliott_wave_analysis.confidence}%</strong></div>
                  </div>
                  <div className="wave-comment pt-2">
                    <strong>Wave Commentary:</strong> <p className="text-slate-300 mt-1">{marketAnalysis.elliott_wave_analysis.comment}</p>
                  </div>
                </div>
              </div>

              {/* Decision Rationale */}
              <div className="card reasons-card">
                <div className="card-header border-b">
                  <List className="text-cyan" />
                  <span className="pixel-text card-title text-cyan">Decision Rationale (Reasons)</span>
                </div>
                <div className="card-content">
                  <ul className="reasons-list">
                    {marketAnalysis.reasons.map((r, idx) => (
                      <li key={idx} className="text-slate-300">{r}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficeView;
