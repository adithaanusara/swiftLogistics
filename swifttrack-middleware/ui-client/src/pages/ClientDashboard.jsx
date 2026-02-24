import { useState } from "react";
import { clientCreateOrder } from "../api";

export default function ClientDashboard({ session }) {
  const [productId, setProductId] = useState("");
  const [address, setAddress] = useState("");
  const [msg, setMsg] = useState("");

  async function submit() {
    setMsg("");
    try {
      const r = await clientCreateOrder(session.token, productId, address);
      setMsg(`Order Created: ${r.order_id} (status: ${r.status})`);
      setProductId(""); setAddress("");
    } catch (e) {
      setMsg("Error: " + String(e));
    }
  }

  return (
    <div className="container">
      <h2>Client Panel</h2>
      <div className="row">
        <div className="card" style={{flex:1, minWidth:320}}>
          <h3>Create Order</h3>
          <div className="small">Enter only Product ID + Address</div>
          <div style={{height:12}} />
          <input className="input" value={productId} onChange={e=>setProductId(e.target.value)} placeholder="Product ID (e.g. P-1001)" />
          <div style={{height:10}} />
          <input className="input" value={address} onChange={e=>setAddress(e.target.value)} placeholder="Delivery Address" />
          <div style={{height:12}} />
          <button className="btn" onClick={submit}>Submit Order</button>
          {msg && <div style={{marginTop:12}}>{msg}</div>}
        </div>

        <div className="card" style={{flex:1, minWidth:320}}>
          <h3>How it works</h3>
          <div className="small">
            After you submit, middleware will:
            <ul>
              <li>Save order (Postgres)</li>
              <li>Publish event (RabbitMQ)</li>
              <li>Orchestrator assigns driver automatically</li>
              <li>Calls CMS/WMS/ROS mocks and updates status</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}