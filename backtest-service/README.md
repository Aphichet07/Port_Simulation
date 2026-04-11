# Backtest Service

Microservice สำหรับรัน backtest strategy แยกออกจาก main server (FastAPI + Python)

## วิธีรัน

```bash
cd backtest-service
python -m venv venv
.\venv\Scripts\activate        # Windows
pip install -r requirements.txt
python -m uvicorn main:app --port 8001
```

## API Endpoints

| Method | Path | คำอธิบาย |
|--------|------|----------|
| GET | `/health` | Health check |
| GET | `/strategies` | ดูรายชื่อ strategy ที่มี |
| POST | `/backtest` | รัน backtest |

### POST /backtest

```json
{
  "script": "sma_strategy.py",
  "symbol": "AAPL",
  "timeframe": "1d",
  "start_date": "2025-01-01",
  "end_date": "2025-12-31",
  "max_trades": 5
}
```

- `script` — ชื่อไฟล์ `.py` ใน `strategies/` หรือ inline Python code
- `symbol` — ชื่อหุ้น (เช่น AAPL, NVDA, TSLA)
- `timeframe` — ไทม์เฟรม (1d, 1wk, 1mo)
- `start_date` / `end_date` — ช่วงเวลาที่ต้องการเทส
- `max_trades` — จำกัดจำนวนรอบเทรด (0 = ไม่จำกัด)

## Strategy ที่มี

- `sma_strategy.py` — EMA(9,21) + RSI(14) + MACD + Adaptive ATR SL/TP

## เพิ่ม Strategy ใหม่

สร้างไฟล์ `.py` ใน `strategies/` ที่ print JSON ออก stdout:

```python
import json, os

symbol = os.getenv("BACKTEST_SYMBOL", "AAPL")
# ... logic ...
print(json.dumps({"symbol": symbol, "total_return": 12.5, ...}))
```

---

## ทำไมไทม์เฟรมสูง + เทสหลายปี ถึงชนะมากกว่า?

### 1. ไทม์เฟรมสูง (1d, 1wk) ลด Noise

- ไทม์เฟรมต่ำ (1m, 5m, 15m) มี **noise สูงมาก** — ราคาขึ้นลงแบบสุ่มตลอด ทำให้ indicator ส่ง false signal เยอะ
- ไทม์เฟรมสูง (1d, 1wk) ราคาถูก **กรอง noise ออก** แล้ว เหลือแต่ trend จริงๆ
- EMA, RSI, MACD ทำงานได้แม่นกว่า เพราะ data แต่ละแท่งมีน้ำหนักมากพอ

### 2. เทรนด์ในไทม์เฟรมสูง แข็งแรงกว่า

- Daily/Weekly trend ใช้เวลาหลายวัน-หลายสัปดาห์ในการก่อตัว → เมื่อเกิดแล้ว **มักวิ่งต่อ**
- ไทม์เฟรมต่ำ trend อาจกลับทิศได้ภายในไม่กี่นาที → ชน stop loss บ่อย

### 3. ATR Stop Loss ทำงานได้ดีกว่า (ATR: Average True Range เป็นเครื่องมือทางเทคนิคที่ไว้วัด “ความผันผวน” ของราคา )

- ไทม์เฟรมต่ำ ATR เล็กมาก → stop loss แคบ → โดน **stop hunt** ง่าย (ราคาแกว่งแตะ SL แล้ววิ่งกลับ)
- ไทม์เฟรมสูง ATR กว้างพอ → ให้เวลาราคา **หายใจ** ก่อนตัดสินใจ

### 4. ช่วงเวลายาว = ข้อมูลมากพอ

- เทส 1 เดือน ได้แค่ ~20 แท่ง (daily) → สุ่มสูง **ผลไม่น่าเชื่อถือ**
- เทส 1-3 ปี ได้ ~250-750 แท่ง → ผ่านทั้ง **ขาขึ้น ขาลง sideways** → ผลลัพธ์สะท้อนความจริงมากกว่า
- Strategy ที่ชนะในหลายสภาวะตลาด = strategy ที่ **robust** จริง

### 5. ค่าคอมมิสชัน & Slippage

- ไทม์เฟรมต่ำเทรดบ่อย → ค่าคอม **กินกำไร** หมด
- ไทม์เฟรมสูงเทรดน้อยรอบ → ค่าคอมต่ำ → กำไรสุทธิเหลือมากกว่า

### สรุป

| | ไทม์เฟรมต่ำ (1m-15m) | ไทม์เฟรมสูง (1d-1wk) |
|---|---|---|
| Noise | สูง | ต่ำ |
| False signal | เยอะ | น้อย |
| Stop loss ถูกเก็บ | บ่อย | น้อย |
| จำนวนรอบ | เยอะ (ค่าคอมสูง) | น้อย (ค่าคอมต่ำ) |
| ต้องการข้อมูล | มาก (intraday) | น้อย (yfinance ฟรี) |
| Win rate โดยทั่วไป | ~30-40% | ~45-55% |

> **แนะนำ**: ใช้ `1d` + ช่วง 1-3 ปี สำหรับ backtest เบื้องต้น แล้วค่อยลองปรับ
