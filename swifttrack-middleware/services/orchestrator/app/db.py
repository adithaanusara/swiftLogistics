import os
import psycopg

DSN = os.environ["POSTGRES_DSN"]

def init_db():
    # gateway already creates table; keep here for safety
    with psycopg.connect(DSN) as con:
        con.execute("""
        CREATE TABLE IF NOT EXISTS orders(
          order_id TEXT PRIMARY KEY,
          status TEXT NOT NULL,
          payload JSONB NOT NULL
        );
        """)

def update_order(order_id: str, status: str):
    with psycopg.connect(DSN) as con:
        con.execute("UPDATE orders SET status=%s WHERE order_id=%s", (status, order_id))