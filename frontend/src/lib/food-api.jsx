import { foodItems } from "./food-data";
import { getDashboard, getProducts } from "./api";

async function fetchDashboard(signal) {
  return getDashboard({ signal });
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
  const products = await getProducts(undefined, { signal });
  return products.map(normalizeProduct);
}
export {
  foodItems as fallbackFoodItems,
  fetchFoodItems
  , fetchDashboard
};
