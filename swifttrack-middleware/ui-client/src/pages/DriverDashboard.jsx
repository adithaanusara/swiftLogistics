import { useEffect, useState } from "react";
import { driverOrders, driverUpdateStatus } from "../api";

export default function DriverDashboard({ session }) {
  const [orders, setOrders] = useState([]);
  const [msg, setMsg] = useState("");

  async function load() {
    const data = await driverOrders(session.token);
    setOrders(data);
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 2000);
    return ()=>clearInterval(t);
  }, []);

  async function setStatus(orderId, status) {
    setMsg("");
    try {
      await driverUpdateStatus(session.token, orderId, status);
      setMsg(`Updated ${orderId.slice(0,8)}… -> ${status}`);
      load();
    } catch (e) {
      setMsg("Error: " + String(e));
    }
  }

  return (
    <div className="container">
      <h2>Driver Panel</h2>
      {msg && <div className="card" style={{marginBottom:12}}>{msg}</div>}
      <div className="card">
        <h3>Assigned Orders <span className="badge">Auto-refresh 2s</span></h3>
        <table>
          <thead>
            <tr><th>Order</th><th>Product</th><th>Address</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {orders.map(o=>(
              <tr key={o.id}>
                <td>{o.id.slice(0,8)}…</td>
                <td>{o.product_id}</td>
                <td>{o.address}</td>
                <td><span className="badge">{o.status}</span></td>
                <td style={{display:"flex", gap:8, flexWrap:"wrap"}}>
                  <button className="btn2" onClick={()=>setStatus(o.id, "PICKED_UP")}>Picked</button>
                  <button className="btn2" onClick={()=>setStatus(o.id, "IN_TRANSIT")}>In Transit</button>
                  <button className="btn" onClick={()=>setStatus(o.id, "DELIVERED")}>Delivered</button>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan="5" className="small">No assigned orders yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}