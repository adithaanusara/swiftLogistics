import { useState } from "react";
import { login } from "../api";
import { saveSession } from "../auth";

export default function Login({ onLoggedIn }) {
  const [username, setU] = useState("client1");
  const [password, setP] = useState("client123");
  const [err, setErr] = useState("");

  async function submit() {
    setErr("");
    try {
      const s = await login(username, password);
      const session = { token: s.token, role: s.role, username: s.username };
      saveSession(session);
      onLoggedIn(session);
    } catch (e) {
      setErr(String(e));
    }
  }

  return (
    <div className="container">
      <h1>SwiftTrack Warehouse Portal</h1>
      <div className="card" style={{maxWidth:420}}>
        <h3>Login</h3>
        <div className="small">Demo users: admin1/admin123, client1/client123, driver1/driver123</div>
        <div style={{height:12}} />
        <input className="input" value={username} onChange={e=>setU(e.target.value)} placeholder="username" />
        <div style={{height:10}} />
        <input className="input" value={password} onChange={e=>setP(e.target.value)} type="password" placeholder="password" />
        <div style={{height:12}} />
        <button className="btn" onClick={submit}>Sign in</button>
        {err && <div style={{marginTop:12, color:"#ff8a8a"}}>{err}</div>}
      </div>
    </div>
  );
}