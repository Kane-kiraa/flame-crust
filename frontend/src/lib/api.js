const API_URL = (() => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    // If accessing via IP (e.g., 172.20.10.2) or non-localhost domain, route to port 8080 on that host
    if (host !== 'localhost' && host !== '127.0.0.1') {
      if (host.includes('trycloudflare.com')) {
        return (import.meta.env.VITE_API_URL || 'https://backup-tommy-jesse-engine.trycloudflare.com/api').replace(/\/$/, "");
      }
      return `${window.location.protocol}//${host}:8080/api`;
    }
  }
  return (import.meta.env.VITE_API_URL || 'http://localhost:8080/api').replace(/\/$/, "");
})();

async function request(path, options = {}) {
  let token = null;
  if (typeof window !== 'undefined') {
    const adminAuth = localStorage.getItem("adminAuth");
    const customerAuth = localStorage.getItem("customerAuth");
    const driverAuth = localStorage.getItem("driverAuth");
    const kitchenAuth = localStorage.getItem("kitchenAuth");
    
    if (adminAuth) {
      try { token = JSON.parse(adminAuth).token; } catch (e) {}
    } else if (kitchenAuth) {
      try { token = JSON.parse(kitchenAuth).token; } catch (e) {}
    } else if (driverAuth) {
      try { token = JSON.parse(driverAuth).token; } catch (e) {}
    } else if (customerAuth) {
      try { token = JSON.parse(customerAuth).token; } catch (e) {}
    }
  }

  const headers = {
    Accept: "application/json",
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    ...options.headers
  };

  const response = await globalThis.fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem("adminAuth");
        localStorage.removeItem("customerAuth");
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
      }
    }
    let message = `API request failed: ${response.status} ${response.statusText}`;
    try {
      const error = await response.json();
      message = error.error ?? error.message ?? message;
    } catch {
      // Keep the HTTP error when the response is not JSON.
    }
    throw new Error(message);
  }

  if (response.status === 204) return null;
  return response.json();
}

function jsonBody(data) {
  return JSON.stringify(data);
}

export function getHealth(options = {}) {
  return request("/health", options);
}

export function getProducts(category, options = {}) {
  return request(`/products${category ? `/${encodeURIComponent(category)}` : ""}`, options);
}

export function getDashboard(options = {}) {
  return request("/dashboard", options);
}

export function list(resource, options = {}) {
  return request(`/admin/${encodeURIComponent(resource)}`, options);
}

export function get(resource, id, options = {}) {
  return request(`/admin/${encodeURIComponent(resource)}/${encodeURIComponent(id)}`, options);
}

export function create(resource, data, options = {}) {
  return request(`/admin/${encodeURIComponent(resource)}`, {
    ...options,
    method: "POST",
    body: jsonBody(data)
  });
}

export function update(resource, id, data, options = {}) {
  return request(`/admin/${encodeURIComponent(resource)}/${encodeURIComponent(id)}`, {
    ...options,
    method: "PUT",
    body: jsonBody(data)
  });
}

export function remove(resource, id, options = {}) {
  return request(`/admin/${encodeURIComponent(resource)}/${encodeURIComponent(id)}`, {
    ...options,
    method: "DELETE"
  });
}

export const resources = Object.freeze([
  "roles", "users", "customers", "addresses", "categories", "products",
  "product_options", "product_variants", "reviews", "carts", "cart_items",
  "coupons", "orders", "order_items", "payments", "drivers", "otps", "audit_logs"
]);

export const api = Object.freeze({
  health: getHealth,
  products: getProducts,
  dashboard: getDashboard,
  admin: Object.freeze({ list, get, create, update, remove }),
  resources
});

export { API_URL };

// ── Driver-specific API helpers ──

function driverRequest(path, options = {}) {
  let token = null;
  if (typeof window !== 'undefined') {
    const driverAuth = localStorage.getItem("driverAuth");
    if (driverAuth) {
      try { token = JSON.parse(driverAuth).token; } catch (e) {}
    }
  }
  const headers = {
    Accept: "application/json",
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    ...options.headers
  };
  return globalThis.fetch(`${API_URL}${path}`, { ...options, headers }).then(async (res) => {
    if (!res.ok) {
      let message = `API request failed: ${res.status}`;
      try { const err = await res.json(); message = err.error ?? message; } catch {}
      throw new Error(message);
    }
    if (res.status === 204) return null;
    return res.json();
  });
}

export function driverLogin(email, password) {
  return driverRequest("/auth/driver-login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function driverRegister(name, email, phone, password) {
  return driverRequest("/auth/driver-register", {
    method: "POST",
    body: JSON.stringify({ name, email, phone, password }),
  });
}

export function getDriverMe() {
  return driverRequest("/auth/driver-me");
}

export function updateDriverProfile(data) {
  return driverRequest("/auth/driver-profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function updateDriverLocation(latitude, longitude) {
  return driverRequest("/auth/driver-location", {
    method: "PUT",
    body: JSON.stringify({ latitude, longitude }),
  });
}
