import os, json
import psycopg

DSN = os.environ["POSTGRES_DSN"]

def init_db():
    with psycopg.connect(DSN) as con:
        con.execute("""
        CREATE TABLE IF NOT EXISTS orders(
          order_id TEXT PRIMARY KEY,
          status TEXT NOT NULL,
          payload JSONB NOT NULL
        );
        """)

def create_order(order_id: str, status: str, payload: dict):
    with psycopg.connect(DSN) as con:
        con.execute("INSERT INTO orders(order_id,status,payload) VALUES (%s,%s,%s)",
                    (order_id, status, json.dumps(payload)))

def update_order(order_id: str, status: str):
    with psycopg.connect(DSN) as con:
        con.execute("UPDATE orders SET status=%s WHERE order_id=%s", (status, order_id))

def get_order(order_id: str):
    with psycopg.connect(DSN) as con:
        row = con.execute("SELECT order_id,status,payload FROM orders WHERE order_id=%s", (order_id,)).fetchone()
        if not row:
            return None
        return {"order_id": row[0], "status": row[1], "payload": row[2]}