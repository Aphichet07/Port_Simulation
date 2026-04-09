"""
Trading SDK สำหรับ user script
ใช้เรียก Elysia API ซื้อขายจากภายใน Docker container
"""
import os
import time
import requests

API_URL = os.environ.get("API_URL", "http://host.docker.internal:8000")
API_TOKEN = os.environ.get("API_TOKEN", "")
BOT_ID = os.environ.get("BOT_ID", "")

_headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {API_TOKEN}",
}


def get_price(symbol: str) -> float:
    """ดึงราคาล่าสุดของหุ้น"""
    res = requests.get(f"{API_URL}/market/price/{symbol}", headers=_headers)
    data = res.json()
    if not data.get("price"):
        raise Exception(f"ดึงราคา {symbol} ไม่ได้: {data}")
    return float(data["price"])


def buy(symbol: str, quantity: int) -> dict:
    """ซื้อหุ้น"""
    res = requests.post(
        f"{API_URL}/orders/buy",
        json={"symbol": symbol, "quantity": quantity},
        headers=_headers,
    )
    data = res.json()
    _report_trade("BUY", symbol, quantity, data)
    return data


def sell(symbol: str, quantity: int) -> dict:
    """ขายหุ้น"""
    res = requests.post(
        f"{API_URL}/orders/sell",
        json={"symbol": symbol, "quantity": quantity},
        headers=_headers,
    )
    data = res.json()
    _report_trade("SELL", symbol, quantity, data)
    return data


def wait(seconds: float = 1):
    """รอ N วินาที"""
    time.sleep(seconds)


def log(msg: str):
    """พิมพ์ log (จะถูกเก็บเป็น container log)"""
    print(f"[BOT {BOT_ID}] {msg}", flush=True)


def _report_trade(action: str, symbol: str, quantity: int, result: dict):
    """รายงาน trade กลับไปที่ Elysia"""
    try:
        requests.post(
            f"{API_URL}/algo/containers/{BOT_ID}/report",
            json={
                "action": action,
                "symbol": symbol,
                "quantity": quantity,
                "executed_price": result.get("price", 0),
            },
            headers=_headers,
        )
    except Exception:
        pass
