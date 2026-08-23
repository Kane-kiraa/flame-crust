function getImageUrl(img) {
  if (!img) return "/images/library/pizza.jpg";
  if (img.includes("/image/upload/images/")) {
    return "/" + img.substring(img.indexOf("images/"));
  }
  if (img.includes("/image/upload//images/")) {
    return img.substring(img.indexOf("/images/"));
  }
  if (img.startsWith("http://") || img.startsWith("https://") || img.startsWith("/")) {
    return img;
  }
  return `https://res.cloudinary.com/cloud/image/upload/${img}`;
}

console.log(getImageUrl("https://res.cloudinary.com/gdkctwwo/image/upload/images/products/010-bacon-blue.jpg"));
console.log(getImageUrl("https://res.cloudinary.com/gdkctwwo/image/upload//images/products/010-bacon-blue.jpg"));
