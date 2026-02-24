import { useEffect, useState } from "react";
import { adminOrders } from "../api";

export default function AdminDashboard({ session }) {
  const [orders, setOrders] = useState([]);

  async function load() {
    const data = await adminOrders(session.token);
    setOrders(data);
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 2000);
    return ()=>clearInterval(t);
  }, []);

  return (
    <div className="container">
      <h2>Admin Panel</h2>
      <div className="card">
        <div className="row" style={{justifyContent:"space-between", alignItems:"center"}}>
          <h3>Orders</h3>
          <span className="badge">Auto-refresh 2s</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>Order</th><th>Client</th><th>Product</th><th>Address</th><th>Status</th><th>DriverId</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o=>(
              <tr key={o.id}>
                <td>{o.id.slice(0,8)}…</td>
                <td>{o.client}</td>
                <td>{o.product_id}</td>
                <td>{o.address}</td>
                <td><span className="badge">{o.status}</span></td>
                <td>{o.assigned_driver_id ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}