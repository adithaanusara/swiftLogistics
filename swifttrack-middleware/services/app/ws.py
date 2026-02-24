from fastapi import APIRouter, WebSocket, WebSocketDisconnect

ws_router = APIRouter()
connections: dict[str, set[WebSocket]] = {}

def publish_ws(order_id: str, message: dict):
    conns = connections.get(order_id, set())
    for ws in list(conns):
        try:
            import asyncio
            asyncio.create_task(ws.send_json(message))
        except Exception:
            pass

@ws_router.websocket("/ws/{order_id}")
async def ws_order(websocket: WebSocket, order_id: str):
    await websocket.accept()
    connections.setdefault(order_id, set()).add(websocket)
    try:
        while True:
            await websocket.receive_text()  # keep alive
    except WebSocketDisconnect:
        connections[order_id].discard(websocket)