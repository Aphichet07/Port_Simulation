import json
import os
import yfinance as yf

# ดึงตัวแปรจาก environment
symbol = os.getenv("BACKTEST_SYMBOL", "AAPL")
timeframe = os.getenv("BACKTEST_TIMEFRAME", "1d")
start_date = os.getenv("BACKTEST_START", "2024-01-01")
end_date = os.getenv("BACKTEST_END", "2024-12-31")
MAX_TRADES = int(os.getenv("BACKTEST_MAX_TRADES", "0"))

# ─── ค่าคงที่ (บอทคิดเอง) ───
CAPITAL = 10000
POSITION_SIZE = 0.5

# ดึงราคาจริงจาก yfinance
try:
    df = yf.download(symbol, start=start_date, end=end_date, progress=False)
    if df.empty:
        print(json.dumps({"error": f"ไม่พบข้อมูล {symbol} ในช่วง {start_date} - {end_date}"}))
        exit(1)
    close = df['Close']
    if hasattr(close, 'columns'):
        close = close.iloc[:, 0]
    prices = [float(x) for x in close.dropna().values]
except Exception as e:
    print(json.dumps({"error": f"Error ดึงข้อมูล: {str(e)}"}))
    exit(1)

# ─── Backtest Logic ───
# BUY เมื่อ:
#   1. EMA9 > EMA21 (เทรนด์ขาขึ้น)
#   2. RSI 30-65 (ไม่ overbought + ไม่ oversold เกิน)
#   3. MACD histogram > 0 (momentum ขาขึ้น)
# SELL เมื่อ:
#   1. ชน Stop Loss (ลดขาดทุน)
#   2. ชน Take Profit (ล็อกกำไร)
#   3. EMA9 < EMA21 AND RSI > 70 (เทรนด์เปลี่ยน)

# ─── EMA ───
def calc_ema(data, period):
    ema = [data[0]]
    k = 2 / (period + 1)
    for i in range(1, len(data)):
        ema.append(data[i] * k + ema[-1] * (1 - k))
    return ema

# ─── RSI ───
def calc_rsi(data, period=14):
    if len(data) < period + 1:
        return [None] * len(data)

    deltas = [data[i] - data[i - 1] for i in range(1, len(data))]
    gains = [max(d, 0) for d in deltas]
    losses = [max(-d, 0) for d in deltas]

    avg_gain = sum(gains[:period]) / period
    avg_loss = sum(losses[:period]) / period

    # period แรก ยังคำนวณไม่ได้
    rsi = [None] * (period)

    # ค่า RSI ตัวแรก ตรงกับ data[period]
    if avg_loss == 0:
        rsi.append(100.0)
    else:
        rs = avg_gain / avg_loss
        rsi.append(100 - (100 / (1 + rs)))

    # ค่าที่เหลือ ใช้ smoothed avg
    for i in range(period, len(deltas)):
        avg_gain = (avg_gain * (period - 1) + gains[i]) / period
        avg_loss = (avg_loss * (period - 1) + losses[i]) / period
        if avg_loss == 0:
            rsi.append(100.0)
        else:
            rs = avg_gain / avg_loss
            rsi.append(100 - (100 / (1 + rs)))

    return rsi

# ─── MACD ───
def calc_macd(data, fast=12, slow=26, signal=9):
    ema_fast = calc_ema(data, fast)
    ema_slow = calc_ema(data, slow)
    macd_line = [ema_fast[i] - ema_slow[i] for i in range(len(data))]
    signal_line = calc_ema(macd_line, signal)
    histogram = [macd_line[i] - signal_line[i] for i in range(len(data))]
    return macd_line, signal_line, histogram

# ─── ATR (Average True Range) → ใช้ตั้ง Stop Loss ───
def calc_atr(prices, period=14):
    tr = [0]
    for i in range(1, len(prices)):
        tr.append(abs(prices[i] - prices[i-1]))
    atr = [sum(tr[:period]) / period if period <= len(tr) else 0] * period
    for i in range(period, len(tr)):
        atr.append((atr[-1] * (period - 1) + tr[i]) / period)
    return atr

# คำนวณ indicators
ema_short = calc_ema(prices, 9)
ema_long = calc_ema(prices, 21)
rsi = calc_rsi(prices, 14)
macd_line, macd_signal, macd_hist = calc_macd(prices)
atr = calc_atr(prices, 14)

trades = []
position = None
entry_price = 0
stop_loss = 0
take_profit = 0
shares = 0
pnl = 0
wins = 0
losses = 0
balance = CAPITAL
stopped_out = 0
took_profit = 0
trade_count = 0

for i in range(26, len(prices)):
    price = prices[i]
    if rsi[i] is None:
        continue

    # ─── ถ้ามี position → เช็ค Stop Loss / Take Profit ก่อน ───
    if position == "long":
        reason = None
        if price <= stop_loss:
            reason = "STOP_LOSS"
            stopped_out += 1
        elif price >= take_profit:
            reason = "TAKE_PROFIT"
            took_profit += 1
        elif ema_short[i] < ema_long[i] and rsi[i] > 70:
            reason = "SIGNAL_EXIT"

        if reason:
            revenue = shares * price
            trade_pnl = (price - entry_price) * shares
            balance += revenue
            pnl += trade_pnl
            if trade_pnl > 0:
                wins += 1
            else:
                losses += 1
            trades.append({
                "action": "SELL",
                "reason": reason,
                "result": "WIN" if trade_pnl > 0 else "LOSS",
                "price": round(price, 2),
                "shares": shares,
                "revenue": round(revenue, 2),
                "pnl": round(trade_pnl, 2),
                "return_pct": round((trade_pnl / (entry_price * shares)) * 100, 2),
                "rsi": round(rsi[i], 1),
            })
            shares = 0
            position = None
            continue

    # ─── BUY signal ───
    if position is None:
        ema_uptrend = ema_short[i] > ema_long[i]
        rsi_ok = 35 < rsi[i] < 70
        macd_bullish = macd_hist[i] > 0

        if ema_uptrend and rsi_ok and macd_bullish:
            # เช็คจำนวนรอบ
            if MAX_TRADES > 0 and trade_count >= MAX_TRADES:
                continue
            buy_amount = balance * POSITION_SIZE
            shares = int(buy_amount / price)
            if shares < 1:
                continue
            trade_count += 1
            cost = shares * price
            balance -= cost
            position = "long"
            entry_price = price
            # ─── Adaptive SL/TP (บอทคิดเอง) ───
            atr_pct = (atr[i] / price) * 100  # ATR เป็น % ของราคา
            trend_strength = abs(ema_short[i] - ema_long[i]) / price * 100

            if atr_pct < 1.5:  # ความผันผวนต่ำ → เทรนด์นิ่ง
                sl_mult = 1.5
                tp_mult = 3.0  # risk-reward 1:2
            elif atr_pct < 3.0:  # ความผันผวนปานกลาง
                sl_mult = 2.0
                tp_mult = 2.5  # risk-reward 1:1.25
            else:  # ความผันผวนสูง → ป้องกันตัว
                sl_mult = 2.5
                tp_mult = 2.0  # risk-reward 1:0.8

            # ถ้าเทรนด์แรง → TP ไกลขึ้น
            if trend_strength > 1.0:
                tp_mult += 0.5

            stop_loss = price - (atr[i] * sl_mult)
            take_profit = price + (atr[i] * tp_mult)
            trades.append({
                "action": "BUY",
                "price": round(price, 2),
                "shares": shares,
                "cost": round(cost, 2),
                "stop_loss": round(stop_loss, 2),
                "take_profit": round(take_profit, 2),
                "rsi": round(rsi[i], 1),
                "macd": round(macd_hist[i], 4),
            })

# ถ้ายังถือหุ้นอยู่ → คำนวณมูลค่าปัจจุบัน
unrealized = shares * prices[-1] if position == "long" else 0
final_balance = balance + unrealized

# ─── จับคู่ BUY-SELL เป็นรอบ ───
rounds = []
trade_num = 1
for i in range(0, len(trades) - 1, 2):
    buy = trades[i]
    sell = trades[i + 1]
    if buy["action"] == "BUY" and sell["action"] == "SELL":
        rounds.append({
            "trade": f"#{trade_num}",
            "result": sell["result"],
            "buy_price": buy["price"],
            "sell_price": sell["price"],
            "shares": buy["shares"],
            "cost": buy["cost"],
            "revenue": sell["revenue"],
            "pnl": sell["pnl"],
            "return_pct": sell["return_pct"],
            "exit_reason": sell["reason"],
        })
        trade_num += 1

# ถ้ายังถือหุ้นอยู่ → เพิ่มรอบที่ยังเปิดอยู่
if position == "long":
    cur_pnl = (prices[-1] - entry_price) * shares
    rounds.append({
        "trade": f"#{trade_num}",
        "result": "OPEN",
        "buy_price": round(entry_price, 2),
        "sell_price": None,
        "shares": shares,
        "cost": round(entry_price * shares, 2),
        "revenue": None,
        "pnl": round(cur_pnl, 2),
        "return_pct": round((cur_pnl / (entry_price * shares)) * 100, 2),
        "exit_reason": "ยังถืออยู่",
    })

total = wins + losses
buy_hold = ((prices[-1] - prices[0]) / prices[0]) * 100

result = {
    "symbol": symbol,
    "strategy": "EMA(9,21) + RSI(14) + MACD + Adaptive ATR SL/TP",
    "start_date": start_date,
    "end_date": end_date,
    "initial_capital": CAPITAL,
    "final_balance": round(final_balance, 2),
    "total_return": round(((final_balance - CAPITAL) / CAPITAL) * 100, 2),
    "buy_hold_return": round(buy_hold, 2),
    "strategy_pnl": round(pnl, 2),
    "unrealized_pnl": round(unrealized - (shares * entry_price), 2) if position else 0,
    "total_trades": total,
    "wins": wins,
    "losses": losses,
    "win_rate": round((wins / total) * 100, 2) if total > 0 else 0,
    "stopped_out": stopped_out,
    "took_profit": took_profit,
    "signal_exits": total - stopped_out - took_profit,
    "rounds": rounds,
}

print(json.dumps(result))
