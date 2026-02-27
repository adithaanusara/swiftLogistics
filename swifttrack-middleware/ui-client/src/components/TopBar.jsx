export default function Topbar({ session, onLogout }) {
  return (
    <div className="topbar">
      <div>
        <div className="h2">Warehouse Operations Overview</div>
        <div className="small">Real-time shipment orchestration • RabbitMQ • Postgres • Integrations</div>
      </div>

      <div className="row" style={{alignItems:"center"}}>
        <span className="badge">User: <b style={{color:"var(--text)"}}>{session.username}</b> • Role: <b style={{color:"var(--text)"}}>{session.role}</b></span>
        <span className="badge">System Status: <b style={{color:"var(--good)"}}>Online</b></span>
        <button className="btn" onClick={onLogout}>Logout</button>
      </div>
    </div>
  );
}