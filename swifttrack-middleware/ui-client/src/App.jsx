import { useEffect, useRef, useState } from "react";

const API = "http://localhost:8000";

export default function App() {
  const [orderId, setOrderId] = useState(null);
  const [status, setStatus] = useState("-");
  const [logs, setLogs] = useState([]);
  const wsRef = useRef(null);
  const pollRef = useRef(null);

  const log = (x) =>
    setLogs((p) => [...p, `[${new Date().toLocaleTimeString()}] ${x}`]);

  async function submitOrder() {
    // cleanup old session
    if (wsRef.current) wsRef.current.close();
    if (pollRef.current) clearInterval(pollRef.current);

    setLogs([]);
    setStatus("-");
    setOrderId(null);

    const payload = { stops: ["Colombo 07", "Nugegoda"], weightKg: 2.5 };

    const res = await fetch(`${API}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    setOrderId(data.order_id);
    setStatus(data.status);
    log(`Order created: ${JSON.stringify(data)}`);

    // WebSocket updates
    const ws = new WebSocket(`ws://localhost:8000/ws/${data.order_id}`);
    wsRef.current = ws;

    ws.onopen = () => log("WS connected");
    ws.onmessage = (e) => {
      log(`WS: ${e.data}`);
      try {
        const msg = JSON.parse(e.data);
        if (msg.status) setStatus(msg.status);
      } catch {}
    };
    ws.onclose = () => log("WS closed");

    // Poll fallback (DB status)
    pollRef.current = setInterval(async () => {
      const s = await fetch(`${API}/orders/${data.order_id}`);
      const j = await s.json();
      log(`POLL: ${JSON.stringify(j)}`);
      if (j.status) setStatus(j.status);
    }, 2000);
  }

  useEffect(() => {
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  return (
    <div style={{ padding: 16, fontFamily: "system-ui, sans-serif" }}>
      <h2>SwiftTrack Client Portal (React)</h2>

      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <button onClick={submitOrder}>Submit Order</button>
        <div>
          <b>Order ID:</b> {orderId ?? "-"}
        </div>
        <div>
          <b>Status:</b> {status}
        </div>
      </div>

      <h3 style={{ marginTop: 16 }}>Logs</h3>
      <pre style={{ background: "#f5f5f5", padding: 12, borderRadius: 8 }}>
        {logs.join("\n")}
      </pre>
    </div>
  );
}