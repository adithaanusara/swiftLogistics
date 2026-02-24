import json, os, uuid
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pika

from .db import init_db, create_order, get_order
from .ws import ws_router, publish_ws

RABBIT_URL = os.environ["RABBIT_URL"]

app = FastAPI(title="SwiftTrack API Gateway")
app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
)
app.include_router(ws_router)

def rabbit_channel():
    params = pika.URLParameters(RABBIT_URL)
    conn = pika.BlockingConnection(params)
    ch = conn.channel()
    ch.queue_declare(queue="order.created", durable=True)
    return conn, ch

@app.on_event("startup")
def startup():
    init_db()

@app.post("/orders")
async def submit_order(payload: dict):
    order_id = str(uuid.uuid4())
    create_order(order_id, status="RECEIVED", payload=payload)

    conn, ch = rabbit_channel()
    msg = {"order_id": order_id, "payload": payload}
    ch.basic_publish(
        exchange="",
        routing_key="order.created",
        body=json.dumps(msg).encode(),
        properties=pika.BasicProperties(delivery_mode=2),
    )
    conn.close()

    # push immediate status to UI
    await publish_ws(order_id, {"status": "RECEIVED"})
    return {"order_id": order_id, "status": "RECEIVED"}

@app.get("/orders/{order_id}")
def order_status(order_id: str):
    row = get_order(order_id)
    return row or {"error": "not found"}