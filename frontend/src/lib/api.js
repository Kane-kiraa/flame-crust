function normalizeApiUrl(url) {
  if (!url) return '';
  let clean = url.trim().replace(/\/$/, "");
  if (clean && !clean.endsWith('/api') && clean.startsWith('http')) {
    clean = `${clean}/api`;
  }
  return clean;
}

const API_URL = (() => {
  const envUrl = (import.meta.env.VITE_API_URL || '').trim();

  if (typeof window !== 'undefined') {
    const { hostname, protocol, origin } = window.location;

    // 1. Manual override from localStorage if provided
    try {
      const customApi = localStorage.getItem("custom_api_url");
      if (customApi) return normalizeApiUrl(customApi);
    } catch (e) {}

    // 2. If VITE_API_URL is an explicit HTTPS URL, use it directly (auto-adding /api if omitted)
    if (envUrl && envUrl.startsWith('https://')) {
      return normalizeApiUrl(envUrl);
    }

    // 3. When running under HTTPS (Cloudflare Pages, Cloudflare Tunnel, SSL Domain)
    if (protocol === 'https:') {
      if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
        return normalizeApiUrl(envUrl);
      }
      // Cloudflare / Same-origin reverse proxy: route through /api
      return `${origin}/api`;
    }

    // 4. When running on HTTP via local network IP (e.g. http://192.168.1.15:5173)
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
        return normalizeApiUrl(envUrl);
      }
      return `http://${hostname}:8080/api`;
    }
  }

  return normalizeApiUrl(envUrl) || 'http://localhost:8080/api';
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
