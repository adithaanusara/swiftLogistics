import { useState } from "react";
import { login } from "../api";
import { saveSession } from "../auth";

export default function Login({ onLoggedIn }) {
  const [username, setUsername] = useState("client1");
  const [password, setPassword] = useState("client123");
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const res = await login(username, password);
      const session = { token: res.token, role: res.role, username: res.username };
      saveSession(session);
      onLoggedIn(session);
    } catch (err) {
      setError(typeof err === "string" ? err : err?.message || "Login failed");
    }
  }

  return (
    <div className="loginPage">
      <div className="loginCard">
        <div className="loginBrand">
          <div className="loginLogo" />
          <div>
            <h1>SwiftTrack WMS</h1>
            <p>Warehouse & Logistics Control</p>
          </div>
        </div>

        <div className="loginTitle">
          <h2>Sign in</h2>
          <p>Use your account to access the dashboard</p>
        </div>

        <form onSubmit={onSubmit} className="loginForm">
          <label className="loginLabel">Username</label>
          <input
            className="loginInput"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. client1"
            autoComplete="username"
          />

          <label className="loginLabel">Password</label>
          <input
            className="loginInput"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            type="password"
            autoComplete="current-password"
          />

          <button className="loginBtn" type="submit">
            Access Dashboard
          </button>

          {error && <div className="loginError">{error}</div>}
        </form>

        <div className="loginHint">
          <div className="hintRow">
            <span className="hintTag">Admin</span>
            <span>admin1 / admin123</span>
          </div>
          <div className="hintRow">
            <span className="hintTag">Client</span>
            <span>client1 / client123</span>
          </div>
          <div className="hintRow">
            <span className="hintTag">Driver</span>
            <span>driver1 / driver123</span>
          </div>
        </div>
      </div>

      <div className="loginFooter">
        <span>API: localhost:8000</span>
        <span>UI: localhost:5173</span>
        <span>RabbitMQ: localhost:15672</span>
      </div>
    </div>
  );
}