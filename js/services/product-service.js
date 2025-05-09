// Product Service - Handles product functionality

import { UIService } from "./ui-services.js";
import { dataService } from "./data-service.js";

// Get all products
async function getAllProducts() {
  try {
    await dataService.init();
    return dataService.getAllProducts();
  } catch (error) {
    console.error("Error getting all products:", error);
    throw error;
  }
}

// Get product by ID
async function getProductById(id) {
  try {
    await dataService.init();
    return dataService.getProduct(id);
  } catch (error) {
    console.error(`Error getting product with ID ${id}:`, error);
    throw error;
  }
}

// Get products by category
async function getProductsByCategory(category) {
  try {
    await dataService.init();
    return dataService.getProductsByCategory(category);
  } catch (error) {
    console.error(`Error getting products in category ${category}:`, error);
    throw error;
  }
}

// Get all categories
async function getAllCategories() {
  try {
    await dataService.init();
    return dataService.getCategories();
  } catch (error) {
    console.error("Error getting all categories:", error);
    throw error;
  }
}

// Filter products by price range
function filterProductsByPriceRange(products, minPrice, maxPrice) {
  return products.filter(
    (product) => product.price >= minPrice && product.price <= maxPrice
  );
}

// Filter products by rating
function filterProductsByRating(products, minRating) {
  return products.filter(
    (product) => product.rating && product.rating.rate >= minRating
  );
}

// Sort products
function sortProducts(products, sortBy) {
  const sortedProducts = [...products];

  switch (sortBy) {
    case "price-asc":
      sortedProducts.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      sortedProducts.sort((a, b) => b.price - a.price);
      break;
    case "rating":
      sortedProducts.sort((a, b) => {
        const ratingA = a.rating?.rate || 0;
        const ratingB = b.rating?.rate || 0;
        return ratingB - ratingA;
      });
      break;
    case "name-asc":
      sortedProducts.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case "name-desc":
      sortedProducts.sort((a, b) => b.title.localeCompare(a.title));
      break;
    default:
      // Default sorting (no change)
      break;
  }

  return sortedProducts;
}

// Search products
function searchProducts(products, query) {
  const searchQuery = query.toLowerCase().trim();

  return products.filter(
    (product) =>
      product.title.toLowerCase().includes(searchQuery) ||
      product.description.toLowerCase().includes(searchQuery) ||
      product.category.toLowerCase().includes(searchQuery)
  );
}

// Get related products
function getRelatedProducts(products, currentProductId, category, limit = 4) {
  // Filter products by category and exclude current product
  const relatedProducts = products.filter(
    (product) =>
      product.category === category && product.id !== currentProductId
  );

  // Shuffle array to get random products
  const shuffled = [...relatedProducts].sort(() => 0.5 - Math.random());

  // Return limited number of products
  return shuffled.slice(0, limit);
}

// Get featured products
function getFeaturedProducts(products, limit = 8) {
  // Sort by rating to get top-rated products
  const sortedProducts = [...products].sort((a, b) => {
    const ratingA = a.rating?.rate || 0;
    const ratingB = b.rating?.rate || 0;
    return ratingB - ratingA;
  });

  // Return limited number of products
  return sortedProducts.slice(0, limit);
}

// Export all functions
export const ProductService = {
  getAllProducts,
  getProductById,
  getProductsByCategory,
  getAllCategories,
  filterProductsByPriceRange,
  filterProductsByRating,
  sortProducts,
  searchProducts,
  getRelatedProducts,
  getFeaturedProducts,
};
