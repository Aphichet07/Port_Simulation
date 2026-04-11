from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
import json
import os
import shutil
import tempfile
import subprocess
import uuid
import sys

app = FastAPI(title="Backtest Service", version="1.0.0")

BACKTEST_TIMEOUT = 60  # seconds
STRATEGIES_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "strategies")
PYTHON_EXE = sys.executable 


# ─── Request / Response ───

class BacktestRequest(BaseModel):
    script: str                      # ชื่อไฟล์ .py หรือ inline script
    symbol: str = "AAPL"
    timeframe: str = "1d"
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    max_trades: Optional[int] = 0


# ─── Endpoints ───

@app.get("/health")
def health():
    return {"status": "ok", "service": "backtest"}


@app.post("/backtest")
def run_backtest(req: BacktestRequest):
    """รัน backtest strategy แล้วคืนผลลัพธ์ JSON"""

    # หา script path
    if req.script.strip().endswith(".py"):
        script_path = os.path.join(STRATEGIES_DIR, req.script.strip())
        if not os.path.isfile(script_path):
            raise HTTPException(404, f"ไม่พบ strategy: {req.script}")
    else:
        # inline script → เขียนลง temp file
        tmp_dir = os.path.join(tempfile.gettempdir(), "backtest", uuid.uuid4().hex[:8])
        os.makedirs(tmp_dir, exist_ok=True)
        script_path = os.path.join(tmp_dir, "backtest_script.py")
        with open(script_path, "w", encoding="utf-8") as f:
            f.write(req.script)

    # เตรียม env
    env = {
        **os.environ,
        "BACKTEST_SYMBOL": req.symbol,
        "BACKTEST_TIMEFRAME": req.timeframe,
        "BACKTEST_START": req.start_date or "",
        "BACKTEST_END": req.end_date or "",
        "BACKTEST_MAX_TRADES": str(req.max_trades or 0),
    }

    # รัน subprocess
    try:
        result = subprocess.run(
            [PYTHON_EXE, script_path],
            capture_output=True,
            text=True,
            timeout=BACKTEST_TIMEOUT,
            env=env,
        )
    except subprocess.TimeoutExpired:
        raise HTTPException(408, "Backtest timeout (60s)")
    except Exception as e:
        raise HTTPException(500, f"Subprocess error: {str(e)}")

    # cleanup temp file
    if not req.script.strip().endswith(".py"):
        shutil.rmtree(os.path.dirname(script_path), ignore_errors=True)

    if result.returncode != 0:
        error_msg = result.stderr or result.stdout or f"Exit code: {result.returncode}"
        raise HTTPException(400, f"Backtest ล้มเหลว: {error_msg}")

    # parse JSON output
    try:
        data = json.loads(result.stdout)
    except json.JSONDecodeError:
        raise HTTPException(500, f"Output ต้องเป็น JSON: {result.stdout[:500]}")

    # ถ้า script คืน error field → ส่ง 400
    if isinstance(data, dict) and "error" in data:
        raise HTTPException(400, data["error"])

    return {"success": True, "data": data}


@app.get("/strategies")
def list_strategies():
    """แสดงรายชื่อ strategy ที่มี"""
    if not os.path.isdir(STRATEGIES_DIR):
        return {"strategies": []}
    files = [f for f in os.listdir(STRATEGIES_DIR) if f.endswith(".py")]
    return {"strategies": files}
