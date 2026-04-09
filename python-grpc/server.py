import grpc
import asyncio
import uuid
from datetime import datetime

import yfinance as yf
import trade_pb2
import trade_pb2_grpc

# ── Config ──────────────────────────────────────────
POLL_INTERVAL = 5  # วินาที
PORT = 50051

# In-memory store สำหรับ active orders
active_orders: dict[str, dict] = {}


# ── Helpers ─────────────────────────────────────────

def get_current_price(symbol: str) -> float | None:
    """ดึงราคาล่าสุดจาก Yahoo Finance"""
    try:
        return float(yf.Ticker(symbol).fast_info.last_price)
    except Exception as e:
        print(f"[ERROR] ดึงราคา {symbol} ไม่ได้: {e}")
        return None


def is_triggered(price: float, target: float, condition: str) -> bool:
    """เช็คว่าราคาถึง trigger หรือยัง"""
    if condition == "BELOW":
        return price <= target
    if condition == "ABOVE":
        return price >= target
    return False


def make_event(symbol, action, trigger_price, quantity, status, executed_price=0):
    """สร้าง TradeEvent message"""
    return trade_pb2.TradeEvent(
        symbol=symbol,
        action=action,
        trigger_price=trigger_price,
        executed_price=executed_price,
        quantity=quantity,
        status=status,
        timestamp=datetime.now().isoformat(),
    )


# ── gRPC Service ────────────────────────────────────

class TradingServicer(trade_pb2_grpc.TradingServiceServicer):

    async def PlaceOrder(self, request, context):
        order_id = str(uuid.uuid4())[:8]
        active_orders[order_id] = {"cancelled": False}

        sym = request.symbol.upper()
        act = request.action.upper()
        cond = request.condition.upper()
        tp = request.trigger_price
        qty = request.quantity

        print(f"\n[ORDER {order_id}] {act} {qty}x {sym} | {cond} {tp}")

        # ส่ง WATCHING ทันที
        yield make_event(sym, act, tp, qty, "WATCHING")

        # Poll ราคาจนกว่าจะ trigger หรือถูก cancel
        while not active_orders[order_id]["cancelled"]:
            price = get_current_price(sym)
            if price is None:
                await asyncio.sleep(POLL_INTERVAL)
                continue

            print(f"  [{order_id}] {sym} = {price:.2f} (trigger: {cond} {tp})")

            if is_triggered(price, tp, cond):
                print(f"  [{order_id}] EXECUTED {act} {qty}x {sym} @ {price:.2f}")
                yield make_event(sym, act, tp, qty, "EXECUTED", executed_price=price)
                del active_orders[order_id]
                return

            await asyncio.sleep(POLL_INTERVAL)

        # Cancel
        print(f"  [{order_id}] CANCELLED")
        yield make_event(sym, act, tp, qty, "CANCELLED")

    async def CancelOrder(self, request, context):
        oid = request.order_id
        if oid in active_orders:
            active_orders[oid]["cancelled"] = True
            return trade_pb2.CancelResponse(success=True, message=f"Order {oid} cancelled")
        return trade_pb2.CancelResponse(success=False, message=f"Order {oid} not found")


# ── Main ────────────────────────────────────────────

async def serve():
    server = grpc.aio.server()
    trade_pb2_grpc.add_TradingServiceServicer_to_server(TradingServicer(), server)
    server.add_insecure_port(f"[::]:{PORT}")
    print(f"Trading Server running on port {PORT}")
    await server.start()
    await server.wait_for_termination()


if __name__ == "__main__":
    asyncio.run(serve())