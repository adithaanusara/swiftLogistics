import socket, json

HOST, PORT = "0.0.0.0", 9000

def main():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind((HOST, PORT))
        s.listen()
        while True:
            conn, _ = s.accept()
            with conn:
                data = conn.recv(4096).decode().strip()
                if not data:
                    conn.sendall(b"ERR\n")
                    continue
                try:
                    msg = json.loads(data)
                    if msg.get("type") == "REGISTER":
                        conn.sendall(b"OK\n")
                    else:
                        conn.sendall(b"ERR\n")
                except Exception:
                    conn.sendall(b"ERR\n")

if __name__ == "__main__":
    main()