import { getDashboard, getProducts } from "./api";

async function fetchDashboard(signal) {
  return getDashboard({ signal });
}
export function getImageUrl(img) {
  if (!img) return "/images/library/pizza.jpg";
  
  // Fix for accidentally prefixed local images from previous bugs
  if (img.includes("/image/upload/images/")) {
    return "/" + img.substring(img.indexOf("images/"));
  }
  if (img.includes("/image/upload//images/")) {
    return img.substring(img.indexOf("/images/"));
  }

  if (img.startsWith("http://") || img.startsWith("https://") || img.startsWith("/")) {
    return img;
  }

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "gdkctwwo";
  return `https://res.cloudinary.com/${cloudName}/image/upload/${img}`;
}

function normalizeProduct(product) {
  return {
    ...product,
    id: String(product.id),
    tags: String(product.tags ?? "").split(",").map((tag) => tag.trim()).filter(Boolean),
    image: getImageUrl(product.image)
  };
}
async function fetchFoodItems(signal) {
  const products = await getProducts(undefined, { signal });
  return products.map(normalizeProduct);
}

async function fetchCategories(signal) {
  const { API_URL } = await import('./api');
  const res = await fetch(`${API_URL}/products/categories`, { signal });
  if (!res.ok) throw new Error("Failed to load categories");
  return res.json();
}

export {
  fetchFoodItems,
  fetchCategories,
  fetchDashboard
};
