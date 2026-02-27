import { useEffect, useState } from "react";
import OrderTable from "../components/OrderTable";
import { driverOrders, driverUpdateStatus } from "../api";

export default function DriverDashboard({ session }) {
  const [orders, setOrders] = useState([]);
  const [msg, setMsg] = useState("");

  async function load() {
    try {
      const data = await driverOrders(session.token);
      setOrders(data || []);
    } catch (e) {
      setMsg("Failed to load orders: " + String(e));
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 2000); // auto refresh
    return () => clearInterval(t);
  }, []);

  async function onSetStatus(orderId, status) {
    setMsg("");
    try {
      await driverUpdateStatus(session.token, orderId, status);
      setMsg(`Updated ${String(orderId).slice(0, 8)}... → ${status}`);
      await load();
    } catch (e) {
      setMsg("Update failed: " + String(e));
    }
  }

  return (
    <div className="page">
      <div className="page-title">
        <h2>Driver Assignment Panel</h2>
        <div style={{ opacity: 0.8 }}>Auto-refresh: 2s</div>
      </div>

      {msg && <div style={{ marginBottom: 12, color: "#cbd5ff" }}>{msg}</div>}

      {/* ✅ Per-order buttons inside table */}
      <OrderTable orders={orders} onSetStatus={onSetStatus} />

      {/* ❌ Remove old bottom global buttons if you have them */}
    </div>
  );
}