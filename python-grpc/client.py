import grpc
import asyncio

import trade_pb2
import trade_pb2_grpc

SERVER = "localhost:50051"

STATUS_ICON = {
    "WATCHING":  "[WATCH]",
    "EXECUTED":  "[DONE] ",
    "CANCELLED": "[CANCEL]",
}


async def place_order(symbol: str, action: str, trigger_price: float, condition: str, quantity: int):
    """ส่ง order ไป gRPC server แล้ว stream ผลกลับมา"""
    async with grpc.aio.insecure_channel(SERVER) as channel:
        stub = trade_pb2_grpc.TradingServiceStub(channel)

        request = trade_pb2.OrderRequest(
            symbol=symbol,
            action=action,
            trigger_price=trigger_price,
            condition=condition,
            quantity=quantity,
        )

        print(f"Order: {action} {quantity}x {symbol} | {condition} {trigger_price}")
        print("-" * 50)

        async for event in stub.PlaceOrder(request):
            icon = STATUS_ICON.get(event.status, "[?]")
            print(f"{icon} {event.action} {event.quantity}x {event.symbol}")

            if event.status == "WATCHING":
                print(f"        target: {event.trigger_price:.2f}")
            elif event.status == "EXECUTED":
                print(f"        trigger : {event.trigger_price:.2f}")
                print(f"        executed: {event.executed_price:.2f}")
                print(f"        time    : {event.timestamp}")

        print("-" * 50)
        print("Stream ended.")


if __name__ == "__main__":
    # ── ตั้งค่า Order ──
    asyncio.run(place_order(
        symbol="NVDA",
        action="SELL",
        trigger_price=183,
        condition="ABOVE",   # BELOW = ราคาต่ำกว่า | ABOVE = ราคาสูงกว่า
        quantity=10,
    ))