import { useState } from "react";
import "./styles.css";
import { loadSession, clearSession } from "./auth";

import Login from "./pages/Login";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";   // ✅ correct
import AdminDashboard from "./pages/AdminDashboard";
import ClientDashboard from "./pages/ClientDashboard";
import DriverDashboard from "./pages/DriverDashboard";

export default function App() {
  const [session, setSession] = useState(loadSession());

  if (!session) return <Login onLoggedIn={setSession} />;

  function logout() {
    clearSession();
    setSession(null);
  }

  return (
    <div className="layout">
      <Sidebar role={session.role} active="Dashboard" />
      <main>
        <TopBar session={session} onLogout={logout} />   {/* ✅ correct */}
        {session.role === "admin" && <AdminDashboard session={session} />}
        {session.role === "client" && <ClientDashboard session={session} />}
        {session.role === "driver" && <DriverDashboard session={session} />}
      </main>
    </div>
  );
}