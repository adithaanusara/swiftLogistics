import os
import psycopg

DSN = os.environ["POSTGRES_DSN"]

def pick_driver_id():
    # pick active driver with least assigned (not delivered) orders
    with psycopg.connect(DSN) as con:
        row = con.execute("""
        SELECT d.id
        FROM drivers d
        WHERE d.is_active = TRUE
        ORDER BY (
          SELECT COUNT(*) FROM orders o
          WHERE o.assigned_driver_id = d.id AND o.status != 'DELIVERED'
        ) ASC
        LIMIT 1
        """).fetchone()
        return row[0] if row else None

def assign_driver(order_id: str, driver_id: int):
    with psycopg.connect(DSN) as con:
        con.execute("UPDATE orders SET assigned_driver_id=%s, status='DRIVER_ASSIGNED' WHERE id=%s", (driver_id, order_id))

def update_status(order_id: str, status: str):
    with psycopg.connect(DSN) as con:
        con.execute("UPDATE orders SET status=%s WHERE id=%s", (status, order_id))