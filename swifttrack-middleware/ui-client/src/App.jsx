import { useState } from "react";
import "./styles.css";
import Login from "./pages/Login";
import ClientDashboard from "./pages/ClientDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import DriverDashboard from "./pages/DriverDashboard";
import { loadSession, clearSession } from "./auth";

export default function App() {
  const [session, setSession] = useState(loadSession());

  if (!session) return <Login onLoggedIn={setSession} />;

  function logout() {
    clearSession();
    setSession(null);
  }

  return (
    <div>
      <div className="card" style={{borderRadius:0, borderLeft:0, borderRight:0}}>
        <div className="container" style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
          <div>
            <b>{session.username}</b> <span className="badge">{session.role}</span>
          </div>
          <button className="btn2" onClick={logout}>Logout</button>
        </div>
      </div>

      {session.role === "client" && <ClientDashboard session={session} />}
      {session.role === "admin" && <AdminDashboard session={session} />}
      {session.role === "driver" && <DriverDashboard session={session} />}
    </div>
  );
}