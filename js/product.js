// Product page JavaScript

import { dataService } from "./services/data-service.js";
import { CartService } from "./services/cart-service.js";
import { UIService } from "./services/ui-services.js";
import { EventService } from "./services/event-service.js";

// DOM Elements
const productLoading = document.getElementById("product-loading");
const productDetails = document.getElementById("product-details");
const productDescription = document.getElementById("product-description");
const productReviews = document.getElementById("product-reviews");
const relatedProducts = document.getElementById("related-products");
const breadcrumbs = document.getElementById("breadcrumbs");
const tabButtons = document.querySelectorAll(".tab-btn");
const tabPanels = document.querySelectorAll(".tab-panel");
const cartCount = document.getElementById("cart-count");

// State
let currentProduct = null;

// Initialize
async function init() {
  try {
    // Initialize common events
    EventService.initCommonEvents();

    // Update cart count
    updateCartCount();

    // Get product ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id");

    if (!productId) {
      showError(
        "Product ID is missing. Please go back to the shop page and select a product."
      );
      return;
    }

    // Load product details
    await loadProductDetails(productId);

    // Set up event listeners
    setupEventListeners();
  } catch (error) {
    console.error("Initialization error:", error);
    showError("Error loading product details. Please try again.");
  }
}

// Load product details
async function loadProductDetails(productId) {
  try {
    // Show loading
    showLoading();

    // Initialize data service if needed
    await dataService.init();

    // Fetch product details
    currentProduct = await dataService.getProduct(productId);

    if (!currentProduct) {
      throw new Error("Product not found");
    }

    // Update page title
    document.title = `${currentProduct.title} - Trendora`;

    // Update breadcrumbs
    updateBreadcrumbs(currentProduct);

    // Render product details
    renderProductDetails(currentProduct);

    // Render product description
    renderProductDescription(currentProduct);

    // Render product reviews
    renderProductReviews(currentProduct);

    // Load related products
    await loadRelatedProducts(currentProduct.category);

    // Hide loading
    hideLoading();
  } catch (error) {
    console.error("Error loading product details:", error);
    showError("Error loading product details. Please try again.");
  }
}

// Update breadcrumbs
function updateBreadcrumbs(product) {
  const breadcrumbsElement = document.getElementById("breadcrumbs");
  if (!breadcrumbsElement) {
    console.warn("Breadcrumbs element not found");
    return;
  }

  breadcrumbsElement.innerHTML = `
    <a href="index.html">Home</a>
    <span class="breadcrumb-separator">/</span>
    <a href="shop.html">Products</a>
    <span class="breadcrumb-separator">/</span>
    <a href="shop.html?category=${encodeURIComponent(product.category)}">${
    product.category
  }</a>
    <span class="breadcrumb-separator">/</span>
    <span class="breadcrumb-current">${product.title}</span>
  `;
}

// Render product details
function renderProductDetails(product) {
  const productDetailsHTML = `
    <div class="product-gallery">
      <div class="product-main-image">
        <img src="${product.image}" alt="${
    product.title
  }" id="main-product-image">
      </div>
      <div class="product-thumbnails">
        <div class="product-thumbnail active" data-image="${product.image}">
          <img src="${product.image}" alt="${product.title}">
        </div>
        <!-- Additional thumbnails would be added here in a real product -->
      </div>
    </div>
    <div class="product-info">
      <div class="product-category">${product.category}</div>
      <h1 class="product-title">${product.title}</h1>
      <div class="product-rating">
        <div class="rating-stars">
          ${generateRatingStars(product.rating?.rate || 0)}
        </div>
        <span class="rating-count">(${
          product.rating?.count || 0
        } reviews)</span>
      </div>
      <div class="product-price">$${product.price.toFixed(2)}</div>
      <div class="product-short-description">
        ${product.description.substring(0, 150)}...
      </div>
      <div class="product-meta">
        <div class="product-meta-item">
          <div class="product-meta-label">Product ID:</div>
          <div class="product-meta-value">${product.id}</div>
        </div>
        <div class="product-meta-item">
          <div class="product-meta-label">Category:</div>
          <div class="product-meta-value">${product.category}</div>
        </div>
        <div class="product-meta-item">
          <div class="product-meta-label">Availability:</div>
          <div class="product-meta-value">In Stock</div>
        </div>
      </div>
      <div class="product-actions">
        <div class="quantity-selector">
          <button class="quantity-btn" id="quantity-decrease">-</button>
          <input type="number" id="quantity-input" class="quantity-input" value="1" min="1" max="10">
          <button class="quantity-btn" id="quantity-increase">+</button>
        </div>
        <div class="action-buttons">
          <button id="add-to-cart-btn" class="btn btn-primary add-to-cart-btn">
            <i class="fas fa-shopping-cart"></i> Add to Cart
          </button>
          <button id="wishlist-btn" class="wishlist-btn">
            <i class="fas fa-heart"></i>
          </button>
        </div>
      </div>
      <div class="product-share">
        <div class="product-share-title">Share this product:</div>
        <div class="share-buttons">
          <button class="share-button" aria-label="Share on Facebook">
            <i class="fab fa-facebook-f"></i>
          </button>
          <button class="share-button" aria-label="Share on Twitter">
            <i class="fab fa-twitter"></i>
          </button>
          <button class="share-button" aria-label="Share on Pinterest">
            <i class="fab fa-pinterest-p"></i>
          </button>
          <button class="share-button" aria-label="Share via Email">
            <i class="fas fa-envelope"></i>
          </button>
        </div>
      </div>
    </div>
  `;

  productDetails.innerHTML = productDetailsHTML;
  productDetails.classList.remove("hidden");
}

// Render product description
function renderProductDescription(product) {
  productDescription.innerHTML = `
    <h3>Product Description</h3>
    <p>${product.description}</p>
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl.</p>
    <p>Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl.</p>
    <h4>Features</h4>
    <ul>
      <li>High-quality materials</li>
      <li>Durable construction</li>
      <li>Elegant design</li>
      <li>Versatile use</li>
      <li>Easy to clean</li>
    </ul>
  `;
}

// Render product reviews
function renderProductReviews(product) {
  // Generate mock reviews
  const mockReviews = generateMockReviews(product);

  // Calculate review statistics
  const reviewStats = calculateReviewStats(mockReviews);

  let reviewsHTML = `
    <div class="review-summary">
      <div class="review-average">
        <div class="review-average-score">${reviewStats.averageRating.toFixed(
          1
        )}</div>
        <div class="review-average-stars">
          ${generateRatingStars(reviewStats.averageRating)}
        </div>
        <div class="review-average-count">${mockReviews.length} reviews</div>
      </div>
      <div class="review-bars">
        <div class="review-bar">
          <div class="review-bar-label">5 <i class="fas fa-star"></i></div>
          <div class="review-bar-track">
            <div class="review-bar-fill" style="width: ${
              reviewStats.ratingPercentages[5]
            }%"></div>
          </div>
          <div class="review-bar-count">${reviewStats.ratingCounts[5]}</div>
        </div>
        <div class="review-bar">
          <div class="review-bar-label">4 <i class="fas fa-star"></i></div>
          <div class="review-bar-track">
            <div class="review-bar-fill" style="width: ${
              reviewStats.ratingPercentages[4]
            }%"></div>
          </div>
          <div class="review-bar-count">${reviewStats.ratingCounts[4]}</div>
        </div>
        <div class="review-bar">
          <div class="review-bar-label">3 <i class="fas fa-star"></i></div>
          <div class="review-bar-track">
            <div class="review-bar-fill" style="width: ${
              reviewStats.ratingPercentages[3]
            }%"></div>
          </div>
          <div class="review-bar-count">${reviewStats.ratingCounts[3]}</div>
        </div>
        <div class="review-bar">
          <div class="review-bar-label">2 <i class="fas fa-star"></i></div>
          <div class="review-bar-track">
            <div class="review-bar-fill" style="width: ${
              reviewStats.ratingPercentages[2]
            }%"></div>
          </div>
          <div class="review-bar-count">${reviewStats.ratingCounts[2]}</div>
        </div>
        <div class="review-bar">
          <div class="review-bar-label">1 <i class="fas fa-star"></i></div>
          <div class="review-bar-track">
            <div class="review-bar-fill" style="width: ${
              reviewStats.ratingPercentages[1]
            }%"></div>
          </div>
          <div class="review-bar-count">${reviewStats.ratingCounts[1]}</div>
        </div>
      </div>
    </div>
    <div class="review-list">
  `;

  // Add review items
  mockReviews.forEach((review) => {
    reviewsHTML += `
      <div class="review-item">
        <div class="review-header">
          <div class="review-author">${review.author}</div>
          <div class="review-date">${review.date}</div>
        </div>
        <div class="review-rating">
          ${generateRatingStars(review.rating)}
        </div>
        <div class="review-content">
          <p>${review.content}</p>
        </div>
      </div>
    `;
  });

  // Add review form
  reviewsHTML += `
    </div>
    <div class="review-form-container">
      <h3 class="review-form-title">Write a Review</h3>
      <form class="review-form">
        <div class="form-group">
          <label for="review-name">Your Name</label>
          <input type="text" id="review-name" class="form-control" required>
        </div>
        <div class="form-group">
          <label for="review-email">Your Email</label>
          <input type="email" id="review-email" class="form-control" required>
        </div>
        <div class="form-group">
          <label>Your Rating</label>
          <div class="review-form-rating">
            <div class="rating-select" id="rating-select">
              <i class="fas fa-star rating-select-star" data-rating="1"></i>
              <i class="fas fa-star rating-select-star" data-rating="2"></i>
              <i class="fas fa-star rating-select-star" data-rating="3"></i>
              <i class="fas fa-star rating-select-star" data-rating="4"></i>
              <i class="fas fa-star rating-select-star" data-rating="5"></i>
            </div>
            <span id="rating-text">Select a rating</span>
          </div>
        </div>
        <div class="form-group">
          <label for="review-content">Your Review</label>
          <textarea id="review-content" class="form-control" rows="5" required></textarea>
        </div>
        <button type="submit" class="btn btn-primary">Submit Review</button>
      </form>
    </div>
  `;

  productReviews.innerHTML = reviewsHTML;

  // Add event listeners to rating stars
  const ratingStars = document.querySelectorAll(".rating-select-star");
  const ratingText = document.getElementById("rating-text");

  ratingStars.forEach((star) => {
    star.addEventListener("click", () => {
      const rating = parseInt(star.dataset.rating);

      // Update active stars
      ratingStars.forEach((s) => {
        if (parseInt(s.dataset.rating) <= rating) {
          s.classList.add("active");
        } else {
          s.classList.remove("active");
        }
      });

      // Update rating text
      ratingText.textContent = `${rating} star${rating !== 1 ? "s" : ""}`;
    });
  });

  // Add event listener to review form
  const reviewForm = document.querySelector(".review-form");

  reviewForm.addEventListener("submit", (event) => {
    event.preventDefault();

    // Show notification
    UIService.showNotification(
      "Thank you for your review! It will be published after moderation.",
      "success"
    );

    // Reset form
    reviewForm.reset();

    // Reset rating stars
    ratingStars.forEach((star) => star.classList.remove("active"));
    ratingText.textContent = "Select a rating";
  });
}

// Load related products
async function loadRelatedProducts(category) {
  try {
    // Show loading
    relatedProducts.innerHTML = `
      <div class="products-loading">
        <div class="spinner"></div>
        <p class="loading-text">Loading related products...</p>
      </div>
    `;

    // Fetch products in the same category
    const products = await dataService.getProductsByCategory(category);

    // Filter out current product
    const filteredProducts = products.filter(
      (product) => product.id !== currentProduct.id
    );

    // Get up to 4 related products
    const relatedProductsList = filteredProducts.slice(0, 4);

    // Generate HTML
    let html = "";

    relatedProductsList.forEach((product) => {
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

    // Update related products
    relatedProducts.innerHTML = html;

    // Add event listeners to product cards
    addProductEventListeners();
  } catch (error) {
    console.error("Error loading related products:", error);
    relatedProducts.innerHTML = `
      <div class="error-message">
        <p>Failed to load related products.</p>
      </div>
    `;
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

// Generate mock reviews
function generateMockReviews(product) {
  const reviewCount = product.rating?.count || 5;
  const averageRating = product.rating?.rate || 4;
  const reviews = [];

  const reviewTexts = [
    "Great product! Exactly as described and arrived quickly.",
    "Very satisfied with my purchase. Would buy again.",
    "Good quality for the price. Recommended.",
    "Decent product but shipping took longer than expected.",
    "Excellent value for money. Very happy with this purchase.",
    "Not quite what I expected, but still a good product.",
    "Absolutely love it! Exceeded my expectations.",
    "Average product. Nothing special but does the job.",
    "Fantastic quality and fast shipping. Very impressed.",
    "Slightly disappointed with the quality, but customer service was great.",
  ];

  const names = [
    "John D.",
    "Sarah M.",
    "Michael T.",
    "Emily R.",
    "David S.",
    "Jessica L.",
    "Robert K.",
    "Amanda P.",
    "Thomas B.",
    "Jennifer W.",
  ];

  const dates = [
    "January 15, 2023",
    "February 3, 2023",
    "March 21, 2023",
    "April 7, 2023",
    "May 19, 2023",
    "June 2, 2023",
    "July 14, 2023",
    "August 28, 2023",
    "September 9, 2023",
    "October 17, 2023",
  ];

  // Generate reviews based on the product's rating count
  const count = Math.min(reviewCount, 10);

  for (let i = 0; i < count; i++) {
    // Calculate a rating that will average close to the product's rating
    let rating;
    if (i === 0) {
      rating = Math.round(averageRating);
    } else {
      // Generate a random rating between 1 and 5, but weighted towards the average
      const min = Math.max(1, Math.floor(averageRating) - 1);
      const max = Math.min(5, Math.ceil(averageRating) + 1);
      rating = Math.floor(Math.random() * (max - min + 1)) + min;
    }

    reviews.push({
      author: names[i],
      date: dates[i],
      rating: rating,
      content: reviewTexts[i],
    });
  }

  return reviews;
}

// Calculate review statistics
function calculateReviewStats(reviews) {
  const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let totalRating = 0;

  reviews.forEach((review) => {
    ratingCounts[review.rating]++;
    totalRating += review.rating;
  });

  const averageRating = totalRating / reviews.length;
  const ratingPercentages = {};

  for (let i = 1; i <= 5; i++) {
    ratingPercentages[i] = (ratingCounts[i] / reviews.length) * 100;
  }

  return {
    averageRating,
    ratingCounts,
    ratingPercentages,
  };
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
    const productId = parseInt(
      event.currentTarget.dataset.productId || currentProduct.id
    );
    let quantity = 1;

    // If this is the main product, get quantity from input
    if (event.currentTarget.id === "add-to-cart-btn") {
      const quantityInput = document.getElementById("quantity-input");
      if (quantityInput) {
        quantity = parseInt(quantityInput.value);
      }
    }

    // Add loading state to button
    const button = event.currentTarget;
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
    button.disabled = true;

    // Add to cart
    await CartService.addToCart(productId, quantity);

    // Update cart count
    updateCartCount();

    // Show success notification
    UIService.showNotification(
      `${quantity} ${quantity > 1 ? "items" : "item"} added to cart!`,
      "success"
    );

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

// Update cart count
function updateCartCount() {
  cartCount.textContent = CartService.getCartItemCount();
}

// Show loading
function showLoading() {
  const loadingElement = document.getElementById("product-loading");
  if (loadingElement) {
    loadingElement.classList.remove("hidden");
  }
}

// Hide loading
function hideLoading() {
  const loadingElement = document.getElementById("product-loading");
  if (loadingElement) {
    loadingElement.classList.add("hidden");
  }
}

// Show error
function showError(message) {
  const productDetails = document.getElementById("product-details");
  if (productDetails) {
    productDetails.innerHTML = `
      <div class="error-message">
        <i class="fas fa-exclamation-circle"></i>
        <p>${message}</p>
        <a href="shop.html" class="btn btn-primary">Return to Shop</a>
      </div>
    `;
    productDetails.classList.remove("hidden");
  }

  // Also show notification
  UIService.showNotification(message, "error");
}

// Set up event listeners
function setupEventListeners() {
  // Quantity decrease button
  const quantityDecrease = document.getElementById("quantity-decrease");
  if (quantityDecrease) {
    quantityDecrease.addEventListener("click", () => {
      const quantityInput = document.getElementById("quantity-input");
      if (quantityInput) {
        const currentValue = parseInt(quantityInput.value);
        if (currentValue > 1) {
          quantityInput.value = currentValue - 1;
        }
      }
    });
  }

  // Quantity increase button
  const quantityIncrease = document.getElementById("quantity-increase");
  if (quantityIncrease) {
    quantityIncrease.addEventListener("click", () => {
      const quantityInput = document.getElementById("quantity-input");
      if (quantityInput) {
        const currentValue = parseInt(quantityInput.value);
        if (currentValue < 10) {
          quantityInput.value = currentValue + 1;
        }
      }
    });
  }

  // Add to cart button
  const addToCartBtn = document.getElementById("add-to-cart-btn");
  if (addToCartBtn) {
    addToCartBtn.addEventListener("click", handleAddToCart);
  }

  // Wishlist button
  const wishlistBtn = document.getElementById("wishlist-btn");
  if (wishlistBtn) {
    wishlistBtn.addEventListener("click", () => {
      UIService.showNotification("Product added to wishlist!", "success");
    });
  }

  // Tab buttons
  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const tab = button.dataset.tab;

      // Update active tab button
      tabButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      // Update active tab panel
      tabPanels.forEach((panel) => panel.classList.remove("active"));
      document.getElementById(`${tab}-panel`).classList.add("active");
    });
  });

  // Product thumbnails
  const thumbnails = document.querySelectorAll(".product-thumbnail");
  thumbnails.forEach((thumbnail) => {
    thumbnail.addEventListener("click", () => {
      const image = thumbnail.dataset.image;
      const mainImage = document.getElementById("main-product-image");

      if (mainImage) {
        mainImage.src = image;
      }

      thumbnails.forEach((thumb) => thumb.classList.remove("active"));
      thumbnail.classList.add("active");
    });
  });

  // Share buttons
  const shareButtons = document.querySelectorAll(".share-button");
  shareButtons.forEach((button) => {
    button.addEventListener("click", () => {
      UIService.showNotification("Sharing feature coming soon!", "info");
    });
  });
}

// Initialize the product page
document.addEventListener("DOMContentLoaded", init);
