const API_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:8080/api").replace(/\/$/, "");

async function request(path, options = {}) {
  const response = await globalThis.fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers
    }
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
