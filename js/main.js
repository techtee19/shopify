// Main JavaScript file - Entry point for the application

import { EventService } from "./services/event-service.js";
import { UIService } from "./services/ui-services.js";
import { CartService } from "./services/cart-service.js";
import { ProductService } from "./services/product-service.js";
import { dataService } from "./services/data-service.js";
import { initSearch } from "./search.js";
import { initAuth } from "./auth.js";

// Initialize the application
document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Initialize common event listeners
    EventService.initCommonEvents();

    // Initialize auth (handles modal logic)
    initAuth();

    // Update cart count
    updateCartCount();

    // Load featured products on home page
    if (document.querySelector(".featured-products-section")) {
      await loadFeaturedProducts();
    }

    // Load categories on home page
    if (document.querySelector(".categories-section")) {
      await loadCategories();
    }

    // Initialize search
    initSearch();

    // Set current year in footer
    document.getElementById("current-year").textContent =
      new Date().getFullYear();
  } catch (error) {
    console.error("Error initializing application:", error);
    UIService.showNotification(
      "Failed to initialize application. Please try again later.",
      "error"
    );
  }
});

// Update cart count
function updateCartCount() {
  const cartCount = document.getElementById("cart-count");
  if (cartCount) {
    cartCount.textContent = CartService.getCartItemCount();
  }
}

// Load featured products
async function loadFeaturedProducts() {
  try {
    const featuredProductsContainer =
      document.getElementById("featured-products");

    if (!featuredProductsContainer) return;

    // Show loading
    featuredProductsContainer.innerHTML = `
      <div class="products-loading">
        <div class="spinner"></div>
        <p class="loading-text">Loading featured products...</p>
      </div>
    `;

    // Initialize data service if needed
    await dataService.init();

    // Get all products
    const products = dataService.products;

    // Get featured products
    const featuredProducts = ProductService.getFeaturedProducts(products, 8);

    // Generate HTML
    let html = "";

    featuredProducts.forEach((product) => {
      html += `
        <div class="product-card" data-product-id="${product.id}">
          <div class="product-card-image">
            <img src="${product.images[0]}" alt="${product.title}">
          </div>
          <div class="product-card-content">
            <div class="product-card-category">${product.category}</div>
            <h3 class="product-card-title">${product.title}</h3>
            <div class="product-card-rating">
              <div class="rating-stars">
                ${generateRatingStars(product.rating?.rate || 0)}
              </div>
              <span class="rating-count">(${product.rating?.count || 0})</span>
            </div>
            <div class="product-card-price">$${product.price.toFixed(2)}</div>
          </div>
          <div class="product-card-footer">
            <button class="add-to-cart-btn" data-product-id="${product.id}">
              <i class="fas fa-shopping-cart"></i> Add to Cart
            </button>
          </div>
        </div>
      `;
    });

    // Update container
    featuredProductsContainer.innerHTML = html;

    // Add event listeners to product cards
    addProductEventListeners();
  } catch (error) {
    console.error("Error loading featured products:", error);

    const featuredProductsContainer =
      document.getElementById("featured-products");

    if (featuredProductsContainer) {
      featuredProductsContainer.innerHTML = `
        <div class="error-message">
          <p>Failed to load featured products. Please try again later.</p>
        </div>
      `;
    }
  }
}

// Load categories
async function loadCategories() {
  try {
    const categoriesContainer = document.getElementById("categories-list");

    if (!categoriesContainer) return;

    // Show loading
    categoriesContainer.innerHTML = `
      <div class="category-loading">
        <div class="spinner"></div>
        <p class="loading-text">Loading categories...</p>
      </div>
    `;

    // Initialize data service if needed
    await dataService.init();

    // Get categories and products
    const categories = dataService.categories;
    const products = dataService.products;

    // Generate HTML
    let html = "";

    categories.forEach((category) => {
      // Count products in this category
      const count = products.filter(
        (product) => product.category === category.name
      ).length;

      // Get a sample product image for the category
      const sampleProduct = products.find(
        (product) => product.category === category.name
      );
      const imageUrl = sampleProduct
        ? sampleProduct.images[0]
        : "https://via.placeholder.com/300x200?text=Category";

      html += `
        <a href="shop.html?category=${encodeURIComponent(
          category.name
        )}" class="category-card">
          <img src="${imageUrl}" alt="${
        category.name
      }" class="category-card-image">
          <div class="category-card-content">
            <h3 class="category-card-title">${category.name}</h3>
            <p class="category-card-count">${count} Products</p>
          </div>
        </a>
      `;
    });

    // Update container
    categoriesContainer.innerHTML = html;
  } catch (error) {
    console.error("Error loading categories:", error);

    const categoriesContainer = document.getElementById("categories-list");

    if (categoriesContainer) {
      categoriesContainer.innerHTML = `
        <div class="error-message">
          <p>Failed to load categories. Please try again later.</p>
        </div>
      `;
    }
  }
}

// Generate rating stars HTML
function generateRatingStars(rating) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  let starsHTML = "";

  // Full stars
  for (let i = 0; i < fullStars; i++) {
    starsHTML += '<i class="fas fa-star"></i>';
  }

  // Half star
  if (halfStar) {
    starsHTML += '<i class="fas fa-star-half-alt"></i>';
  }

  // Empty stars
  for (let i = 0; i < emptyStars; i++) {
    starsHTML += '<i class="far fa-star"></i>';
  }

  return starsHTML;
}

// Add event listeners to product elements
function addProductEventListeners() {
  // Add to cart buttons
  document.querySelectorAll(".add-to-cart-btn").forEach((button) => {
    button.addEventListener("click", handleAddToCart);
  });

  // Product cards (for navigation to product detail)
  document.querySelectorAll(".product-card").forEach((product) => {
    product.addEventListener("click", handleProductClick);
  });
}

// Handle add to cart
async function handleAddToCart(event) {
  event.stopPropagation();

  try {
    const productId = parseInt(event.currentTarget.dataset.productId);

    // Add loading state to button
    const button = event.currentTarget;
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
    button.disabled = true;

    // Add to cart
    await CartService.addToCart(productId);

    // Update cart count
    updateCartCount();

    // Show success notification
    UIService.showNotification("Product added to cart!", "success");

    // Reset button
    setTimeout(() => {
      button.innerHTML = originalText;
      button.disabled = false;
    }, 500);
  } catch (error) {
    console.error("Error adding to cart:", error);
    UIService.showNotification(
      "Failed to add product to cart. Please try again.",
      "error"
    );
  }
}

// Handle product click (navigate to product detail)
function handleProductClick(event) {
  // Ignore if the click was on a button
  if (event.target.closest("button")) {
    return;
  }

  const productId = event.currentTarget.dataset.productId;
  window.location.href = `product.html?id=${productId}`;
}
