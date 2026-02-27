import { useState } from "react";
import StatCard from "../components/StatCard";
import { clientCreateOrder } from "../api";

export default function ClientDashboard({ session }) {
  const [productId, setProductId] = useState("");
  const [address, setAddress] = useState("");
  const [msg, setMsg] = useState("");

  async function submit() {
    setMsg("");
    try {
      const r = await clientCreateOrder(session.token, productId, address);
      setMsg(`Shipment Request Created → Order: ${r.order_id} | Status: ${r.status}`);
      setProductId(""); setAddress("");
    } catch (e) {
      setMsg("Error: " + String(e));
    }
  }

  return (
    <div className="container">
      <div className="grid">
        <StatCard title="TOTAL ORDERS" value="—" pillText="Client View" pillTone="good" />
        <StatCard title="ACTIVE DELIVERIES" value="—" pillText="Tracking" pillTone="warn" />
        <StatCard title="COMPLETED" value="—" pillText="History" pillTone="good" />
        <StatCard title="SYSTEM STATUS" value="Online" pillText="Connected" pillTone="good" />

        <div className="card" style={{gridColumn:"span 6"}}>
          <div className="h2">Create New Shipment Request</div>
          <div className="small">Enter Product ID + Delivery Address</div>
          <div style={{height:14}} />

          <input className="input" value={productId} onChange={(e)=>setProductId(e.target.value)} placeholder="Product ID (e.g. P-1001)" />
          <div style={{height:12}} />
          <input className="input" value={address} onChange={(e)=>setAddress(e.target.value)} placeholder="Delivery Address" />
          <div style={{height:14}} />

          <button className="btn primary" onClick={submit}>Submit Shipment</button>
          {msg && <div style={{marginTop:12}} className="small">{msg}</div>}
        </div>

        <div className="card" style={{gridColumn:"span 6"}}>
          <div className="h2">Processing Pipeline</div>
          <div className="small">
            1) Order saved to Postgres<br/>
            2) Event published to RabbitMQ<br/>
            3) Orchestrator assigns driver automatically<br/>
            4) CMS/WMS/ROS mocks called<br/>
            5) Status updated in DB
          </div>
        </div>
      </div>
    </div>
  );
}