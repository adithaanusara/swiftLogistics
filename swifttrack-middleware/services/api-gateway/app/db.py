import os
import psycopg
from .auth import hash_pw

DSN = os.environ["POSTGRES_DSN"]

def init_db():
    with psycopg.connect(DSN) as con:
        con.execute("""
        CREATE TABLE IF NOT EXISTS users(
          id SERIAL PRIMARY KEY,
          username TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          role TEXT NOT NULL CHECK (role IN ('client','admin','driver'))
        );

        CREATE TABLE IF NOT EXISTS drivers(
          id SERIAL PRIMARY KEY,
          user_id INT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          is_active BOOLEAN NOT NULL DEFAULT TRUE
        );

        CREATE TABLE IF NOT EXISTS orders(
          id TEXT PRIMARY KEY,
          client_user_id INT NOT NULL REFERENCES users(id),
          product_id TEXT NOT NULL,
          address TEXT NOT NULL,
          status TEXT NOT NULL,
          assigned_driver_id INT NULL REFERENCES drivers(id),
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        """)

        # seed demo users if not exists
        seed_user(con, "admin1", "admin123", "admin")
        seed_user(con, "client1", "client123", "client")
        d1 = seed_user(con, "driver1", "driver123", "driver")
        d2 = seed_user(con, "driver2", "driver123", "driver")
        seed_driver(con, d1)
        seed_driver(con, d2)

def seed_user(con, username, password, role):
    row = con.execute("SELECT id FROM users WHERE username=%s", (username,)).fetchone()
    if row:
        return row[0]
    ph = hash_pw(password)
    new_id = con.execute(
        "INSERT INTO users(username,password_hash,role) VALUES (%s,%s,%s) RETURNING id",
        (username, ph, role),
    ).fetchone()[0]
    return new_id

def seed_driver(con, user_id: int):
    row = con.execute("SELECT id FROM drivers WHERE user_id=%s", (user_id,)).fetchone()
    if row:
        return row[0]
    return con.execute("INSERT INTO drivers(user_id,is_active) VALUES (%s,TRUE) RETURNING id", (user_id,)).fetchone()[0]

def get_user_by_username(username: str):
    with psycopg.connect(DSN) as con:
        row = con.execute("SELECT id, username, password_hash, role FROM users WHERE username=%s", (username,)).fetchone()
        if not row:
            return None
        return {"id": row[0], "username": row[1], "password_hash": row[2], "role": row[3]}

def create_order(order_id: str, client_user_id: int, product_id: str, address: str, status: str):
    with psycopg.connect(DSN) as con:
        con.execute(
            "INSERT INTO orders(id, client_user_id, product_id, address, status) VALUES (%s,%s,%s,%s,%s)",
            (order_id, client_user_id, product_id, address, status),
        )

def get_orders_for_admin():
    with psycopg.connect(DSN) as con:
        rows = con.execute("""
            SELECT o.id, u.username, o.product_id, o.address, o.status, o.assigned_driver_id, o.created_at
            FROM orders o
            JOIN users u ON u.id=o.client_user_id
            ORDER BY o.created_at DESC
        """).fetchall()
        return [
            {"id": r[0], "client": r[1], "product_id": r[2], "address": r[3], "status": r[4], "assigned_driver_id": r[5], "created_at": str(r[6])}
            for r in rows
        ]

def get_orders_for_driver(driver_user_id: int):
    with psycopg.connect(DSN) as con:
        d = con.execute("SELECT id FROM drivers WHERE user_id=%s", (driver_user_id,)).fetchone()
        if not d:
            return []
        driver_id = d[0]
        rows = con.execute("""
            SELECT id, product_id, address, status, created_at
            FROM orders
            WHERE assigned_driver_id=%s
            ORDER BY created_at DESC
        """, (driver_id,)).fetchall()
        return [{"id": r[0], "product_id": r[1], "address": r[2], "status": r[3], "created_at": str(r[4])} for r in rows]

def update_order_status(order_id: str, status: str):
    with psycopg.connect(DSN) as con:
        con.execute("UPDATE orders SET status=%s WHERE id=%s", (status, order_id))