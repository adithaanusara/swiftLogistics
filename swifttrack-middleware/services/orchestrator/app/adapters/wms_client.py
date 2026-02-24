import os, socket, json

HOST = os.environ["WMS_HOST"]
PORT = int(os.environ["WMS_PORT"])

def wms_register_package(order_id: str, payload: dict):
    msg = {"type": "REGISTER", "order_id": order_id, "weightKg": payload.get("weightKg")}
    with socket.create_connection((HOST, PORT), timeout=5) as s:
        s.sendall((json.dumps(msg) + "\n").encode())
        resp = s.recv(4096).decode().strip()
        if resp != "OK":
            raise RuntimeError(f"WMS error: {resp}")