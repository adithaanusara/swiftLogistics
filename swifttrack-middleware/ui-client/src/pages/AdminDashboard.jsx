import { useEffect, useState } from "react";
import StatCard from "../components/StatCard";
import DataTable from "../components/DataTable";
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
    return () => clearInterval(t);
  }, []);

  const active = orders.filter(o => !["DELIVERED","FAILED"].includes(o.status)).length;
  const pending = orders.filter(o => o.status === "RECEIVED").length;
  const delivered = orders.filter(o => o.status === "DELIVERED").length;

  return (
    <div className="container">
      <div className="grid">
        <StatCard title="TOTAL ORDERS" value={orders.length} pillText="All Time" pillTone="good" />
        <StatCard title="ACTIVE SHIPMENTS" value={active} pillText="Live" pillTone="warn" />
        <StatCard title="PENDING ASSIGNMENTS" value={pending} pillText="Queue" pillTone="warn" />
        <StatCard title="DELIVERED" value={delivered} pillText="Completed" pillTone="good" />

        <div className="card" style={{gridColumn:"span 12"}}>
          <div className="row" style={{justifyContent:"space-between", alignItems:"center"}}>
            <div className="h2">Order Management</div>
            <span className="badge">Auto-refresh: 2s</span>
          </div>

          <DataTable
            columns={["Order", "Client", "Product", "Address", "Status", "Driver"]}
            rows={orders.map(o => ({
              order: o.id?.slice(0,8) + "…",
              client: o.client,
              product: o.product_id,
              address: o.address,
              status: o.status,
              driver: o.assigned_driver_id ?? "-"
            }))}
          />
        </div>
      </div>
    </div>
  );
}