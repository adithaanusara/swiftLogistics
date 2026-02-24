import json, os, uuid
from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pika

from .db import init_db, get_user_by_username, create_order, get_orders_for_admin, get_orders_for_driver, update_order_status
from .auth import verify_pw, create_token, decode_token

RABBIT_URL = os.environ["RABBIT_URL"]

app = FastAPI(title="SwiftTrack API Gateway (RBAC)")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

def rabbit_channel():
    conn = pika.BlockingConnection(pika.URLParameters(RABBIT_URL))
    ch = conn.channel()
    ch.queue_declare(queue="order.created", durable=True)
    return conn, ch

def require_user(authorization: str | None):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Missing token")
    token = authorization.split(" ", 1)[1]
    payload = decode_token(token)
    if not payload:
        raise HTTPException(401, "Invalid token")
    return payload  # {sub, role, username, ...}

@app.on_event("startup")
def startup():
    init_db()

@app.post("/auth/login")
def login(body: dict):
    user = get_user_by_username(body.get("username", ""))
    if not user or not verify_pw(body.get("password", ""), user["password_hash"]):
        raise HTTPException(401, "Invalid credentials")
    token = create_token(user["id"], user["role"], user["username"])
    return {"token": token, "role": user["role"], "username": user["username"]}

# Client creates order
@app.post("/client/orders")
def client_create_order(body: dict, authorization: str | None = Header(default=None)):
    u = require_user(authorization)
    if u["role"] != "client":
        raise HTTPException(403, "Forbidden")

    product_id = body.get("product_id")
    address = body.get("address")
    if not product_id or not address:
        raise HTTPException(400, "product_id and address required")

    order_id = str(uuid.uuid4())
    create_order(order_id, int(u["sub"]), product_id, address, "RECEIVED")

    conn, ch = rabbit_channel()
    ch.basic_publish(
        exchange="",
        routing_key="order.created",
        body=json.dumps({"order_id": order_id}).encode(),
        properties=pika.BasicProperties(delivery_mode=2),
    )
    conn.close()
    return {"order_id": order_id, "status": "RECEIVED"}

# Admin views all orders
@app.get("/admin/orders")
def admin_orders(authorization: str | None = Header(default=None)):
    u = require_user(authorization)
    if u["role"] != "admin":
        raise HTTPException(403, "Forbidden")
    return get_orders_for_admin()

# Driver views own assigned orders
@app.get("/driver/orders")
def driver_orders(authorization: str | None = Header(default=None)):
    u = require_user(authorization)
    if u["role"] != "driver":
        raise HTTPException(403, "Forbidden")
    return get_orders_for_driver(int(u["sub"]))

# Driver updates status
@app.post("/driver/orders/{order_id}/status")
def driver_update(order_id: str, body: dict, authorization: str | None = Header(default=None)):
    u = require_user(authorization)
    if u["role"] != "driver":
        raise HTTPException(403, "Forbidden")
    status = body.get("status")
    if status not in ["PICKED_UP", "IN_TRANSIT", "DELIVERED"]:
        raise HTTPException(400, "Invalid status")
    update_order_status(order_id, status)
    return {"ok": True, "order_id": order_id, "status": status}