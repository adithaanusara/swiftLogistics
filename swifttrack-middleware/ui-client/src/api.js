const API = "/api";

async function handle(res) {
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || `${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function login(username, password) {
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  return handle(res);
}

export async function adminOrders(token) {
  const res = await fetch(`${API}/admin/orders`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handle(res);
}

export async function clientCreateOrder(token, product_id, address) {
  const res = await fetch(`${API}/client/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ product_id, address }),
  });
  return handle(res);
}

export async function driverOrders(token) {
  const res = await fetch(`${API}/driver/orders`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handle(res);
}

export async function driverUpdateStatus(token, orderId, status) {
  const res = await fetch(`${API}/driver/orders/${orderId}/status`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });
  return handle(res);
}