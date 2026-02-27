export default function Sidebar({ role, active = "Dashboard" }) {
  const common = ["Dashboard", "Order Management", "Warehouse Operations", "Reports & Analytics"];
  const admin = ["Driver Assignment", "User Management", "System Settings"];
  const client = ["Create Shipment", "Tracking"];
  const driver = ["My Assignments", "Route Status"];

  const items =
    role === "admin" ? [...common, ...admin] :
    role === "client" ? [...common, ...client] :
    [...common, ...driver];

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="logo" />
        <div>
          <h1>SwiftTrack WMS</h1>
          <p>Warehouse & Logistics Control</p>
        </div>
      </div>

      <nav className="nav">
        {items.map((t) => (
          <div key={t} className={`item ${t === active ? "active" : ""}`}>
            {t}
          </div>
        ))}
      </nav>
    </aside>
  );
}