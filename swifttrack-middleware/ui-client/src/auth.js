export function saveSession(session) {
  localStorage.setItem("session", JSON.stringify(session));
}
export function loadSession() {
  const s = localStorage.getItem("session");
  return s ? JSON.parse(s) : null;
}
export function clearSession() {
  localStorage.removeItem("session");
}