import { foodItems } from "./food-data";
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";
async function fetchDashboard(signal) {
  const response = await fetch(`${API_URL}/dashboard`, { signal, headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`Dashboard request failed with status ${response.status}`);
  return response.json();
}
function normalizeProduct(product) {
  return {
    ...product,
    id: String(product.id),
    tags: String(product.tags ?? "").split(",").map((tag) => tag.trim()).filter(Boolean),
    image: product.image || "/images/library/pizza.jpg"
  };
}
async function fetchFoodItems(signal) {
  const response = await fetch(`${API_URL}/products`, {
    signal,
    headers: { Accept: "application/json" }
  });
  if (!response.ok) {
    throw new Error(`Menu request failed with status ${response.status}`);
  }
  const products = await response.json();
  return products.map(normalizeProduct);
}
export {
  foodItems as fallbackFoodItems,
  fetchFoodItems
  , fetchDashboard
};
