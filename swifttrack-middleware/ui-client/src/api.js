const API = "http://localhost:8000";

export async function login(username, password) {
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({username, password})
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function clientCreateOrder(token, product_id, address) {
  const res = await fetch(`${API}/client/orders`, {
    method: "POST",
    headers: {"Content-Type":"application/json", "Authorization": `Bearer ${token}`},
    body: JSON.stringify({product_id, address})
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function adminOrders(token) {
  const res = await fetch(`${API}/admin/orders`, {
    headers: {"Authorization": `Bearer ${token}`}
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function driverOrders(token) {
  const res = await fetch(`${API}/driver/orders`, {
    headers: {"Authorization": `Bearer ${token}`}
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function driverUpdateStatus(token, orderId, status) {
  const res = await fetch(`${API}/driver/orders/${orderId}/status`, {
    method: "POST",
    headers: {"Content-Type":"application/json", "Authorization": `Bearer ${token}`},
    body: JSON.stringify({status})
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}