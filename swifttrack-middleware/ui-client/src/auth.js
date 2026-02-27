export function saveSession(session) {
  localStorage.setItem("swifttrack_session", JSON.stringify(session));
}
export function loadSession() {
  const s = localStorage.getItem("swifttrack_session");
  return s ? JSON.parse(s) : null;
}
export function clearSession() {
  localStorage.removeItem("swifttrack_session");
}