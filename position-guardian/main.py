import os
import random
import asyncio
import json
import urllib.request
import concurrent.futures
from datetime import datetime
from fastapi import FastAPI, BackgroundTasks, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import google.generativeai as genai
from dotenv import load_dotenv

# Thread pool for non-blocking standard library HTTP requests
executor = concurrent.futures.ThreadPoolExecutor(max_workers=3)

def fetch_elysia_price_sync(symbol: str) -> float:
    try:
        url = f"http://localhost:7000/market/asset/{symbol}"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=3) as response:
            res_data = json.loads(response.read().decode())
            if res_data.get("success") and "data" in res_data:
                price_val = res_data["data"].get("price")
                if price_val is not None:
                    return float(price_val)
    except Exception as e:
        print(f"Error fetching live price for {symbol} from Elysia: {e}")
    return 0.0

async def get_live_price_from_elysia(symbol: str) -> float:
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(executor, fetch_elysia_price_sync, symbol)

load_dotenv()

app = FastAPI(title="Position Guardian & Trading Office Service")

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Gemini configuration
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)
    print("Position Guardian: Gemini AI configured successfully.")
else:
    print("Position Guardian: GOOGLE_API_KEY not found. Using local template engine.")

# In-memory application state
state = {
    "auto_run": True,
    "checked_positions_count": 12,
    "closed_positions_count": 3,
    "equity": 500.00,
    "realized_pnl": 14.12,
    "unrealized_pnl": 1.66,
    "win_rate": 100.00,
    "closed_trades": 3,
    "winning_trades": 3,
    "losing_trades": 0,
    "ai_cycle_seconds": 60,
    "ai_cycle_timer": 11,  # starts at 11s for quick action on load
    "pnl_update_seconds": 5,
    "pnl_update_timer": 1,   # starts at 1s for quick action on load
    "active_agent_step": -1,  # -1 = idle, 0 = Scout, 1 = Sigma, 2 = Vault, 3 = Shield, 4 = Captain
    "btc_price": 60255.20,
    "sol_price": 81.32,
    "sol_entry": 82.04,
    "open_positions": [
        {
            "symbol": "SOLUSDT",
            "side": "SHORT",
            "status": "OPEN",
            "opened_by": "TrustIX AI Team",
            "entry": 82.04,
            "current": 81.32,
            "tp": 81.30,
            "sl": 82.54,
            "lev": "4x",
            "margin": 117.19,
            "risk": 3.75,
            "rr": 1.50,
            "pnl": 1.66,
        }
    ],
    "last_closed_trade": {
        "result": "WIN",
        "symbol": "SOLUSDT / SHORT",
        "close_reason": "TAKE PROFIT",
        "pnl": 6.63,
        "summary": "Trade SOLUSDT SHORT รับกำไร 0.6789 USDT",
        "root_cause": "ราคาร่วงทะลุ Take Profit หลังจากการสะสมแรงขายฝั่งหมีรุนแรง",
        "feedback": {
            "scout": "K-Line / แท่งเทียน: สัญญาณ technical บ่งชี้ Bearish คอนเฟิร์มตาม pattern ไฮเดิมกดต่ำลงไป",
            "sigma": "Sigma / ผู้ค้าอัจฉริยะ: กลยุทธ์ประเมินความเสี่ยงได้แม่นยำ",
            "vault": "Vault / ผู้ดูแลคลัง: position sizing อยู่ในกรอบ risk",
            "shield": "Shield / เกราะป้องกัน: การอนุมัติ risk ผ่านตลอด",
            "captain": "Captain / ผู้จัดการ: การจัดการปิดออเดอร์สอดคล้องกับกลยุทธ์"
        }
    },
    "market_analysis": {
        "signal": "WAIT",
        "confidence": 77,
        "long_score": 0,
        "short_score": 4,
        "current_price": 60255.20,
        "support": 59080.00,
        "resistance": 64739.80,
        "market_structure": "LH_LL",
        "rsi": 46.14,
        "rsi_zone": "neutral",
        "macd_state": "none",
        "macd_hist": 39.7005,
        "volume_ratio": 0.38,
        "volume_state": "low",
        "rsi_divergence": "bullish",
        "elliott_wave": "wave_A_or_C",
        "momentum_analysis": {
            "rsi": "RSI ตอนนี้เท่ากับ 46.14 ลดลงไปในโซนกลางของกราฟ 1h ตลาดยังไม่ชัดเจนมาก",
            "macd": "MACD ยังอยู่เหนือเส้น Signal แต่ Histogram อ่อนลง มีแนวโน้มว่าความแรงฝั่งซื้อเริ่มลดลง",
            "volume": "แท่งล่าสุดปิดลบ แต่ Volume ต่ำกว่าค่าเฉลี่ย แรงขายยังไม่รุนแรงมาก",
            "divergence": "พบ bullish RSI divergence ราคาร่วงแต่ RSI ยกตัวสูงขึ้น มีโอกาสเกิดการกลับตัว"
        },
        "elliott_wave_analysis": {
            "likely_wave": "wave_A_or_C",
            "mode": "corrective",
            "confidence": 55,
            "comment": "โครงสร้างขาลงชัด แต่ momentum ยังไม่ยืนยันว่าเป็น Wave A หรือ Wave C"
        },
        "reasons": [
            "ราคาอยู่ใต้ EMA20/50/200 และ EMA เรียงตัวขาลง",
            "Market Structure เป็น LH_LL",
            "MACD ยังไม่ชัดเจน",
            "Volume ยังไม่สูงกว่าค่าเฉลี่ย",
            "RSI ตอนนี้เท่ากับ 46.14 อยู่ในโซนกลางของกราฟ 1h ตลาดยังไม่ชัดเจนมาก",
            "MACD ยังอยู่เหนือเส้น Signal แต่ Histogram อ่อนลง มีแนวโน้มว่าความแรงฝั่งซื้อเริ่มลดลง",
            "แท่งล่าสุดปิดลบ แต่ Volume ต่ำกว่าค่าเฉลี่ย แรงขายยังไม่รุนแรงมาก"
        ]
    },
    "logs": [
        f"[{datetime.now().strftime('%H:%M:%S')}] [System] เริ่มต้นระบบ Position Guardian & Multi-Agent Dashboard",
        f"[{datetime.now().strftime('%H:%M:%S')}] [Captain] กำลังเฝ้าระวังตำแหน่ง SOLUSDT SHORT ยอด Margin=$117.19"
    ]
}

def add_log(agent: str, msg: str):
    time_str = datetime.now().strftime('%H:%M:%S')
    state["logs"].append(f"[{time_str}] [{agent}] {msg}")
    if len(state["logs"]) > 50:
        state["logs"].pop(0)

# Helper function to generate comments using Gemini or local template fallback
async def generate_gemini_feedback(trade_result: str, symbol: str, pnl: float):
    if GOOGLE_API_KEY:
        try:
            model = genai.GenerativeModel("gemini-1.5-flash")
            prompt = f"""
            คุณคือหัวหน้าทีมควบคุมบอทเทรดอัจฉริยะ (AI Agent Trading Team)
            บอทเพิ่งปิดโพซิชั่น {symbol} ด้วยผลลัพธ์ {trade_result} และได้กำไร/ขาดทุนสะสม {pnl} USDT
            
            จงระบุข้อมูลสรุปวิเคราะห์การปิดออเดอร์ในรูปแบบ JSON ดังนี้ (ตอบภาษาไทยเท่านั้น):
            {{
                "summary": "ข้อความสรุปการเทรดสั้นๆ เช่น Trade SOLUSDT SHORT รับกำไร 0.6789 USDT",
                "root_cause": "สาเหตุหลักทางเทคนิคคอลที่บอทตัดสินใจปิดออเดอร์ เช่น ราคาร่วงทะลุ Take Profit หรือราคาพุ่งชน Stop Loss เนื่องจาก...",
                "scout_feedback": "ความเห็นสั้นๆ จากฝ่ายสแกนตลาด Scout (เช่น K-Line / แท่งเทียน: ...)",
                "sigma_feedback": "ความเห็นสั้นๆ จากฝ่ายวางแผนเทรด Sigma (เช่น Sigma / ผู้ค้าอัจฉริยะ: ...)",
                "vault_feedback": "ความเห็นสั้นๆ จากฝ่ายจัดการเงิน Vault (เช่น Vault / ผู้ดูแลคลัง: ...)",
                "shield_feedback": "ความเห็นสั้นๆ จากฝ่ายประเมินความปลอดภัย Shield (เช่น Shield / เกราะป้องกัน: ...)",
                "captain_feedback": "ความเห็นสั้นๆ จากผู้ดำเนินการส่งออเดอร์ Captain (เช่น Captain / ผู้จัดการ: ...)"
            }}
            ให้ส่ง JSON กลับมาเท่านั้น ไม่มีข้อความเกริ่นนำ
            """
            response = await asyncio.to_thread(model.generate_content, prompt)
            import json
            text = response.text.strip().replace("```json", "").replace("```", "")
            data = json.loads(text)
            return data
        except Exception as e:
            print(f"Gemini error: {e}, falling back to template")
    
    # Fallback template
    is_win = trade_result == "WIN"
    pnl_abs = abs(pnl)
    if is_win:
        return {
            "summary": f"Trade {symbol} รับกำไร {pnl_abs:.4f} USDT",
            "root_cause": "ราคาร่วงทะลุจุด Take Profit หลังการสะสมแรงเทขายหนาแน่นของตลาดฝั่งหมี",
            "scout_feedback": "K-Line / แท่งเทียน: สัญญาณ technical บ่งชี้จุดกลับตัวของแท่งเทียน คอนเฟิร์มตามโซนแนวต้านด้านบน",
            "sigma_feedback": "Sigma / ผู้ค้าอัจฉริยะ: เลือกกลยุทธ์ Trend-Following และบริหารรอบได้แม่นยำสูง",
            "vault_feedback": "Vault / ผู้ดูแลคลัง: คำนวณ Position Sizing และคุมสัดส่วน Margin ปกติ",
            "shield_feedback": "Shield / เกราะป้องกัน: การควบคุมค่า Risk Limit ผ่านการอนุมัติแบบไร้ข้อผิดพลาด",
            "captain_feedback": "Captain / ผู้จัดการ: ส่งสัญญาณดำเนินการปิดสัญญาตามระดับ TP ได้อย่างรวดเร็ว"
        }
    else:
        return {
            "summary": f"Trade {symbol} ตัดขาดทุน {pnl_abs:.4f} USDT",
            "root_cause": "ราคาพุ่งชนจุด Stop Loss เนื่องจากมีแรงซื้อสวนกลับอย่างรุนแรงเหนือแนวต้านสำคัญ",
            "scout_feedback": "K-Line / แท่งเทียน: สัญญาณเบรกเอาท์หลอก ทำให้กราฟพุ่งหลุดกรอบแนวรับสะสมแรง",
            "sigma_feedback": "Sigma / ผู้ค้าอัจฉริยะ: แผนสำรองควบคุมจุดคัทลอสทำงานทันทีเมื่อสัญญาณเปลี่ยนทิศทาง",
            "vault_feedback": "Vault / ผู้ดูแลคลัง: การคุม Leverge 4x ช่วยจำกัดการสูญเสียไม่ให้พอร์ตเสียหายหนัก",
            "shield_feedback": "Shield / เกราะป้องกัน: อนุมัติการปิดตามระดับความเสี่ยงเพื่อรักษาวินัยของพอร์ต",
            "captain_feedback": "Captain / ผู้จัดการ: ดำเนินการตัดขาดทุนสำเร็จเพื่อล้างสถานะและรอสัญญาณรอบใหม่"
        }

# Background loops
async def agent_pipeline_simulation():
    """Simulates the 5-step agent execution sequence step by step over 5 seconds"""
    add_log("System", "เริ่มรอบการประมวลผล Multi-Agent Pipeline...")
    
    # Step 0: Scout
    state["active_agent_step"] = 0
    add_log("Scout", "เริ่มการสแกนความเคลื่อนไหวแท่งเทียนระดับ 1h และหาแนวรับ/แนวต้าน...")
    await asyncio.sleep(1)
    
    # Step 1: Sigma
    state["active_agent_step"] = 1
    add_log("Sigma", "ประเมิน Momentum Indicators: RSI neutral, MACD hist อ่อนลง แนะนำกลยุทธ์...")
    await asyncio.sleep(1)
    
    # Step 2: Vault
    state["active_agent_step"] = 2
    add_log("Vault", "คำนวณการใช้ Leverage 4x และกำหนดจุด TP/SL สำเร็จ...")
    await asyncio.sleep(1)
    
    # Step 3: Shield
    state["active_agent_step"] = 3
    add_log("Shield", "ตรวจสอบข้อกำหนด Risk Limit: ผ่านการอนุมัติ 100%...")
    await asyncio.sleep(1)
    
    # Step 4: Captain
    state["active_agent_step"] = 4
    add_log("Captain", "ประเมินคำสั่งปิด/เปิดออเดอร์ในพอร์ต...")
    
    # Execute actual trade logic check
    await execute_trading_decision()
    await asyncio.sleep(1)
    
    # Complete
    state["active_agent_step"] = -1
    state["checked_positions_count"] += 1
    add_log("System", "เสร็จสิ้นรอบการวิเคราะห์ของ AI Agent Trading Team")

async def execute_trading_decision():
    # If we have an open position, check if we close it based on actual TP/SL crossing
    if state["open_positions"]:
        pos = state["open_positions"][0]
        current = pos["current"]
        tp = pos["tp"]
        sl = pos["sl"]
        side = pos["side"]
        symbol = pos["symbol"]
        
        should_close = False
        is_win = False
        
        if side == "LONG":
            if current >= tp:
                should_close = True
                is_win = True
            elif current <= sl:
                should_close = True
                is_win = False
        else: # SHORT
            if current <= tp:
                should_close = True
                is_win = True
            elif current >= sl:
                should_close = True
                is_win = False
                
        # With a tiny 5% random chance in each AI cycle, we might close early to simulate active management
        if not should_close and random.random() < 0.05:
            should_close = True
            is_win = random.random() > 0.35 # 65% win chance on manual intervention
            
        if should_close:
            pnl = pos["pnl"]
            
            # Close position
            state["open_positions"] = []
            state["closed_positions_count"] += 1
            state["closed_trades"] += 1
            
            state["realized_pnl"] = round(state["realized_pnl"] + pnl, 2)
            state["equity"] = round(state["equity"] + pnl, 2)
            state["unrealized_pnl"] = 0.00
            
            if is_win:
                state["winning_trades"] += 1
                result_str = "WIN"
                reason_str = "TAKE PROFIT" if (current >= tp if side == "LONG" else current <= tp) else "AI TAKE PROFIT (MANUAL)"
            else:
                state["losing_trades"] += 1
                result_str = "LOSS"
                reason_str = "STOP LOSS" if (current <= sl if side == "LONG" else current >= sl) else "AI STOP LOSS (MANUAL)"
                
            state["win_rate"] = round((state["winning_trades"] / state["closed_trades"]) * 100, 2)
            
            # Generate Gemini review
            feedback_data = await generate_gemini_feedback(result_str, f"{symbol} / {side}", pnl)
            
            state["last_closed_trade"] = {
                "result": result_str,
                "symbol": f"{symbol} / {side}",
                "close_reason": reason_str,
                "pnl": pnl,
                "summary": feedback_data.get("summary", f"Trade {symbol} {side} รับกำไร {pnl} USDT"),
                "root_cause": feedback_data.get("root_cause", "ราคาวิ่งถึงระดับเป้าหมายของ AI Model"),
                "feedback": {
                    "scout": feedback_data.get("scout_feedback", "สแกนสัญญาณพบจุดออกโพซิชั่น"),
                    "sigma": feedback_data.get("sigma_feedback", "ประเมินความเสี่ยงและอัตราผลตอบแทนสำเร็จ"),
                    "vault": feedback_data.get("vault_feedback", "ปรับสมดุลเงินทุนสดในพอร์ตเรียบร้อย"),
                    "shield": feedback_data.get("shield_feedback", "การควบคุมความเสี่ยงอนุมัติการปิดตำแหน่ง"),
                    "captain": feedback_data.get("captain_feedback", "ดำเนินการส่งคำสั่งล้างสถานะเรียบร้อย")
                }
            }
            
            add_log("Captain", f"ปิดโพซิชั่น {symbol} {side} เรียบร้อย ผลลัพธ์={result_str} PnL={pnl} USDT ({reason_str})")
        else:
            add_log("Captain", f"เฝ้าระวังตำแหน่ง {symbol} {side} ต่อไป ที่ราคา ${current:.2f} (TP=${tp:.2f}, SL=${sl:.2f})")
            
    # If no open positions, let's open one with a 40% chance
    else:
        if random.random() < 0.40:
            symbol = "BTCUSDT" if random.random() > 0.5 else "SOLUSDT"
            current_price = state["btc_price"] if symbol == "BTCUSDT" else state["sol_price"]
            entry_price = round(current_price, 2)
            side = "SHORT" if random.random() > 0.5 else "LONG"
            
            # Set tighter TP/SL for BTC to make it highly interactive in real-time
            if symbol == "BTCUSDT":
                # 0.15% TP (about $90), 0.08% SL (about $50)
                tp_price = round(entry_price * 0.9985 if side == "SHORT" else entry_price * 1.0015, 2)
                sl_price = round(entry_price * 1.0008 if side == "SHORT" else entry_price * 0.9992, 2)
                margin = 250.00
                risk = 1.25
            else:
                # 1.5% TP (about $1.2), 0.8% SL (about $0.6)
                tp_price = round(entry_price * 0.985 if side == "SHORT" else entry_price * 1.015, 2)
                sl_price = round(entry_price * 1.008 if side == "SHORT" else entry_price * 0.992, 2)
                margin = 117.19
                risk = 3.75
                
            new_pos = {
                "symbol": symbol,
                "side": side,
                "status": "OPEN",
                "opened_by": "TrustIX AI Team",
                "entry": entry_price,
                "current": entry_price,
                "tp": tp_price,
                "sl": sl_price,
                "lev": "4x",
                "margin": margin,
                "risk": risk,
                "rr": 1.50,
                "pnl": 0.00
            }
            state["open_positions"].append(new_pos)
            add_log("Captain", f"เปิดโพซิชั่นใหม่สำเร็จ: {side} {symbol} ที่ราคา ${entry_price} (TP=${tp_price}, SL=${sl_price})")

async def tick_simulation_loop():
    while True:
        try:
            await asyncio.sleep(1)
            
            if not state["auto_run"]:
                continue
                
            # Tick timers
            state["pnl_update_timer"] -= 1
            state["ai_cycle_timer"] -= 1
            
            # PnL update cycle
            if state["pnl_update_timer"] <= 0:
                state["pnl_update_timer"] = state["pnl_update_seconds"]
                
                # Fetch actual live BTC/SOL prices from Elysia
                live_btc = await get_live_price_from_elysia("BINANCE:BTCUSDT")
                live_sol = await get_live_price_from_elysia("BINANCE:SOLUSDT")
                
                if live_btc > 0:
                    state["btc_price"] = round(live_btc, 2)
                else:
                    # fallback to small random change if API fails
                    btc_change = random.uniform(-10.0, 10.0)
                    state["btc_price"] = round(state["btc_price"] + btc_change, 2)
                    
                if live_sol > 0:
                    state["sol_price"] = round(live_sol, 2)
                else:
                    # fallback to small random change if API fails
                    sol_change = random.uniform(-0.02, 0.02)
                    state["sol_price"] = round(state["sol_price"] + sol_change, 2)
                
                # Update open position PnLs
                if state["open_positions"]:
                    pos = state["open_positions"][0]
                    
                    # Update current price based on symbol
                    if pos["symbol"] == "BTCUSDT":
                        pos["current"] = state["btc_price"]
                    else:
                        pos["current"] = state["sol_price"]
                        
                    # Calculate PnL based on SHORT vs LONG
                    if pos["side"] == "SHORT":
                        diff_pct = (pos["entry"] - pos["current"]) / pos["entry"]
                    else:
                        diff_pct = (pos["current"] - pos["entry"]) / pos["entry"]
                        
                    # PnL = Margin * diff_pct * Leverage
                    lev_val = 4.0
                    pnl = pos["margin"] * diff_pct * lev_val
                    pos["pnl"] = round(pnl, 2)
                    state["unrealized_pnl"] = round(pnl, 2)
                    
                    # Update general equity
                    state["equity"] = round(500.00 + state["realized_pnl"] + state["unrealized_pnl"], 2)
                else:
                    state["unrealized_pnl"] = 0.00
                    state["equity"] = round(500.00 + state["realized_pnl"], 2)
                    
            # AI cycle trigger
            if state["ai_cycle_timer"] <= 0:
                state["ai_cycle_timer"] = state["ai_cycle_seconds"]
                # Trigger the step-by-step pipeline in a separate task
                asyncio.create_task(agent_pipeline_simulation())
                
        except Exception as e:
            print(f"Error in tick loop: {e}")

@app.on_event("startup")
async def startup_event():
    # Run the background ticking thread
    asyncio.create_task(tick_simulation_loop())

# REST API endpoints
@app.get("/api/status")
async def get_status():
    return {
        "auto_run": state["auto_run"],
        "checked_positions_count": state["checked_positions_count"],
        "closed_positions_count": state["closed_positions_count"],
        "equity": state["equity"],
        "realized_pnl": state["realized_pnl"],
        "unrealized_pnl": state["unrealized_pnl"],
        "win_rate": state["win_rate"],
        "closed_trades": state["closed_trades"],
        "winning_trades": state["winning_trades"],
        "losing_trades": state["losing_trades"],
        "ai_cycle_timer": state["ai_cycle_timer"],
        "pnl_update_timer": state["pnl_update_timer"],
        "active_agent_step": state["active_agent_step"],
        "btc_price": state["btc_price"],
        "sol_price": state["sol_price"]
    }

@app.get("/api/positions")
async def get_positions():
    return state["open_positions"]

@app.get("/api/last-closed-trade")
async def get_last_closed_trade():
    return state["last_closed_trade"]

@app.get("/api/market-analysis")
async def get_market_analysis():
    # Update current price in analysis matching global BTC price
    state["market_analysis"]["current_price"] = state["btc_price"]
    # Simulating changing signal & scores slightly based on price
    if state["btc_price"] > 60400:
        state["market_analysis"]["signal"] = "BUY"
        state["market_analysis"]["long_score"] = 4
        state["market_analysis"]["short_score"] = 1
        state["market_analysis"]["rsi"] = 56.40
        state["market_analysis"]["rsi_zone"] = "bullish"
    elif state["btc_price"] < 60100:
        state["market_analysis"]["signal"] = "SELL"
        state["market_analysis"]["long_score"] = 0
        state["market_analysis"]["short_score"] = 5
        state["market_analysis"]["rsi"] = 38.20
        state["market_analysis"]["rsi_zone"] = "bearish"
    else:
        state["market_analysis"]["signal"] = "WAIT"
        state["market_analysis"]["long_score"] = 1
        state["market_analysis"]["short_score"] = 3
        state["market_analysis"]["rsi"] = 46.14
        state["market_analysis"]["rsi_zone"] = "neutral"
        
    return state["market_analysis"]

@app.get("/api/logs")
async def get_logs_endpoint():
    return state["logs"]

@app.post("/api/toggle-auto-run")
async def toggle_auto_run():
    state["auto_run"] = not state["auto_run"]
    add_log("System", f"เปลี่ยนสถานะ Auto Run เป็น {'ON' if state['auto_run'] else 'OFF'}")
    return {"status": "success", "auto_run": state["auto_run"]}

@app.post("/api/check-guardian-status")
async def trigger_manual_check():
    # Trigger manual scan immediately
    asyncio.create_task(agent_pipeline_simulation())
    return {"status": "success", "message": "Manual agent scan triggered"}

@app.post("/api/run-guardian-close")
async def force_close_positions():
    if not state["open_positions"]:
        return JSONResponse(status_code=400, content={"error": "ไม่มีโพซิชั่นให้ปิด"})
        
    pos = state["open_positions"][0]
    pnl = pos["pnl"]
    
    # Close
    state["open_positions"] = []
    state["closed_positions_count"] += 1
    state["closed_trades"] += 1
    state["realized_pnl"] = round(state["realized_pnl"] + pnl, 2)
    state["equity"] = round(state["equity"] + pnl, 2)
    state["unrealized_pnl"] = 0.00
    
    is_win = pnl > 0
    if is_win:
        state["winning_trades"] += 1
        result_str = "WIN"
    else:
        state["losing_trades"] += 1
        result_str = "LOSS"
        
    state["win_rate"] = round((state["winning_trades"] / state["closed_trades"]) * 100, 2)
    
    # Feedback
    feedback_data = await generate_gemini_feedback(result_str, "SOLUSDT / SHORT", pnl)
    state["last_closed_trade"] = {
        "result": result_str,
        "symbol": "SOLUSDT / SHORT",
        "close_reason": "MANUAL CLOSE",
        "pnl": pnl,
        "summary": feedback_data.get("summary", f"Trade SOLUSDT SHORT รับกำไร {pnl} USDT"),
        "root_cause": feedback_data.get("root_cause", "ผู้ใช้ควบคุมดำเนินการสั่งปิดโพซิชั่นด้วยตัวเองเพื่อล็อกกำไร"),
        "feedback": {
            "scout": feedback_data.get("scout_feedback", "สแกนกราฟพบจุดสั่งปิดแบบ Manual"),
            "sigma": feedback_data.get("sigma_feedback", "สอดคล้องกับพฤติกรรมความปลอดภัยของกระเป๋าพอร์ต"),
            "vault": feedback_data.get("vault_feedback", "ขนาดการตัดยอดเงินคืนสู่ Cash สมบูรณ์"),
            "shield": feedback_data.get("shield_feedback", "ความเสี่ยงถูกล้างออกเรียบร้อย"),
            "captain": feedback_data.get("captain_feedback", "ผู้ใช้กดควบคุมตัดรายการสำเร็จ")
        }
    }
    
    add_log("Captain", f"ดำเนินการล้างโพซิชั่น SOLUSDT SHORT แบบเรียลไทม์ (Manual Close) PnL={pnl} USDT")
    return {"status": "success", "closed_pnl": pnl}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
