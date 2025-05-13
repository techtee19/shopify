// Shop page JavaScript

import { dataService } from "./services/data-service.js";
import { CartService } from "./services/cart-service.js";
import { UIService } from "./services/ui-services.js";
import { EventService } from "./services/event-service.js";

// DOM Elements
const productsGrid = document.getElementById("products-grid");
const productsList = document.getElementById("products-list");
const categoryFilters = document.getElementById("category-filters");
const productsCount = document.getElementById("products-count");
const minPriceInput = document.getElementById("min-price");
const maxPriceInput = document.getElementById("max-price");
const applyPriceFilterBtn = document.getElementById("apply-price-filter");
const clearFiltersBtn = document.getElementById("clear-filters");
const sortSelect = document.getElementById("sort-select");
const viewOptions = document.querySelectorAll(".view-option");
const ratingOptions = document.querySelectorAll('input[name="rating"]');
const productModal = document.getElementById("product-modal");
const productQuickView = document.getElementById("product-quick-view");
const productModalClose = document.getElementById("product-modal-close");

// State
let allProducts = [];
let filteredProducts = [];
let currentView = "grid";
let currentPage = 1;
const productsPerPage = 9;
let activeFilters = {
  categories: [],
  minPrice: 0,
  maxPrice: 1000,
  rating: "all",
  sort: "default",
};

// Initialize
async function init() {
  try {
    // Initialize common events
    EventService.initCommonEvents();

    // Update cart count
    updateCartCount();

    // Load products
    await loadProducts();

    // Load categories
    await loadCategories();

    // Set up event listeners
    setupEventListeners();
  } catch (error) {
    console.error("Initialization error:", error);
    UIService.showNotification(
      "Error initializing shop page. Please try again.",
      "error"
    );
  }
}

// Load products from JSON
async function loadProducts() {
  try {
    showLoading();

    // Initialize data service if needed
    await dataService.init();

    // Fetch all products
    allProducts = dataService.products;

    // Apply initial filters
    applyFilters();

    // Hide loading
    hideLoading();
  } catch (error) {
    console.error("Error loading products:", error);
    hideLoading();
    showNoProducts("Failed to load products. Please try again.");
  }
}

// Load categories from JSON
async function loadCategories() {
  try {
    // Show loading in category filters
    categoryFilters.innerHTML = `
      <div class="category-loading">
        <div class="spinner"></div>
      </div>
    `;

    // Initialize data service if needed
    await dataService.init();

    // Get categories
    const categories = dataService.categories;

    // Generate category filters HTML
    let categoryFiltersHTML = "";

    categories.forEach((category) => {
      categoryFiltersHTML += `
        <div class="category-filter">
          <label for="category-${category.id}">${category.name}</label>
          <input type="checkbox" id="category-${category.id}" value="${category.name}">
        </div>
      `;
    });

    // Update category filters
    categoryFilters.innerHTML = categoryFiltersHTML;

    // Add event listeners to category checkboxes
    document
      .querySelectorAll('.category-filter input[type="checkbox"]')
      .forEach((checkbox) => {
        checkbox.addEventListener("change", () => {
          updateCategoryFilters();
          applyFilters();
        });
      });
  } catch (error) {
    console.error("Error loading categories:", error);
    categoryFilters.innerHTML = "<p>Failed to load categories.</p>";
  }
}

// Update category filters based on checkbox state
function updateCategoryFilters() {
  const checkedCategories = Array.from(
    document.querySelectorAll('.category-filter input[type="checkbox"]:checked')
  ).map((checkbox) => checkbox.value);

  activeFilters.categories = checkedCategories;
}

// Filter functionality
function initFilters() {
  const filterForm = document.getElementById("filter-form");
  const clearFiltersBtn = document.getElementById("clear-filters");
  const priceRange = document.getElementById("price-range");
  const priceValue = document.getElementById("price-value");
  const categoryCheckboxes = document.querySelectorAll(".category-checkbox");
  const ratingCheckboxes = document.querySelectorAll(".rating-checkbox");

  // Update price range value display
  if (priceRange && priceValue) {
    priceRange.addEventListener("input", (e) => {
      priceValue.textContent = `$${e.target.value}`;
    });
  }

  // Handle filter form submission
  if (filterForm) {
    filterForm.addEventListener("submit", (e) => {
      e.preventDefault();
      applyFilters();
    });
  }

  // Handle clear filters
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener("click", resetFilters);
  }

  // Handle individual filter changes
  categoryCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", applyFilters);
  });

  ratingCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", applyFilters);
  });
}

// Reset all filters to their default state
function resetFilters() {
  // Reset price range
  const priceRange = document.getElementById("price-range");
  const priceValue = document.getElementById("price-value");
  if (priceRange && priceValue) {
    priceRange.value = priceRange.max;
    priceValue.textContent = `$${priceRange.max}`;
  }

  // Reset category checkboxes
  const categoryCheckboxes = document.querySelectorAll(".category-checkbox");
  categoryCheckboxes.forEach((checkbox) => {
    if (checkbox) {
      checkbox.checked = false;
    }
  });

  // Reset rating checkboxes
  const ratingCheckboxes = document.querySelectorAll(".rating-checkbox");
  ratingCheckboxes.forEach((checkbox) => {
    if (checkbox) {
      checkbox.checked = false;
    }
  });

  // Reset sort select
  const sortSelect = document.getElementById("sort-select");
  if (sortSelect) {
    sortSelect.value = "default";
  }

  // Apply the reset filters
  applyFilters();
}

// Apply filters to the product list
function applyFilters() {
  // Start with all products
  filteredProducts = allProducts.filter((product) => {
    // Category filter
    const categoryMatch =
      activeFilters.categories.length === 0 ||
      activeFilters.categories.includes(product.category);

    // Price filter
    const priceMatch =
      product.price >= activeFilters.minPrice &&
      product.price <= activeFilters.maxPrice;

    // Rating filter
    let ratingMatch = true;
    if (activeFilters.rating !== "all") {
      ratingMatch =
        product.rating &&
        product.rating.rate >= parseFloat(activeFilters.rating);
    }

    return categoryMatch && priceMatch && ratingMatch;
  });

  // Sort products
  switch (activeFilters.sort) {
    case "price-asc":
      filteredProducts.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      filteredProducts.sort((a, b) => b.price - a.price);
      break;
    case "rating":
      filteredProducts.sort((a, b) => {
        const ratingA = a.rating?.rate || 0;
        const ratingB = b.rating?.rate || 0;
        return ratingB - ratingA;
      });
      break;
    default:
      // No sorting
      break;
  }

  // Reset to first page
  currentPage = 1;

  // Render products
  renderProducts();
  updateProductCount();
}

// Update the product count display
function updateProductCount() {
  const visibleProducts = document.querySelectorAll(
    '.product-card[style=""]'
  ).length;
  const totalProducts = document.querySelectorAll(".product-card").length;
  const countDisplay = document.getElementById("product-count");

  if (countDisplay) {
    countDisplay.textContent = `Showing ${visibleProducts} of ${totalProducts} products`;
  }
}

// Render products based on current view and page
function renderProducts() {
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  if (paginatedProducts.length === 0) {
    showNoProducts(
      "No products match your filters. Try adjusting your criteria."
    );
    return;
  }

  if (currentView === "grid") {
    renderProductsGrid(paginatedProducts);
  } else {
    renderProductsList(paginatedProducts);
  }

  renderPagination();
}

// Render products in grid view
function renderProductsGrid(products) {
  let html = "";

  products.forEach((product) => {
    html += `
      <div class="product-card" data-product-id="${product.id}">
        <div class="product-card-image">
          <img src="${product.images[0]}" alt="${product.title}">
          <div class="product-card-actions">
            <button class="btn-icon quick-view-btn" data-product-id="${
              product.id
            }">
              <i class="fas fa-eye"></i>
            </button>
            <button class="btn-icon wishlist-btn" data-product-id="${
              product.id
            }">
              <i class="fas fa-heart"></i>
            </button>
          </div>
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

  productsGrid.innerHTML = html;
  productsList.classList.add("hidden");
  productsGrid.classList.remove("hidden");

  // Add event listeners to product cards
  addProductEventListeners();
}

// Render products in list view
function renderProductsList(products) {
  let html = "";

  products.forEach((product) => {
    html += `
      <div class="product-list-item" data-product-id="${product.id}">
        <div class="product-list-image">
          <img src="${product.images[0]}" alt="${product.title}">
        </div>
        <div class="product-list-content">
          <div class="product-list-category">${product.category}</div>
          <h3 class="product-list-title">${product.title}</h3>
          <div class="product-list-rating">
            <div class="rating-stars">
              ${generateRatingStars(product.rating?.rate || 0)}
            </div>
            <span class="rating-count">(${product.rating?.count || 0})</span>
          </div>
          <div class="product-list-description">
            ${product.description.substring(0, 150)}...
          </div>
          <div class="product-list-price">$${product.price.toFixed(2)}</div>
          <div class="product-list-actions">
            <button class="add-to-cart-btn" data-product-id="${product.id}">
              <i class="fas fa-shopping-cart"></i> Add to Cart
            </button>
            <button class="btn-icon quick-view-btn" data-product-id="${
              product.id
            }">
              <i class="fas fa-eye"></i>
            </button>
            <button class="btn-icon wishlist-btn" data-product-id="${
              product.id
            }">
              <i class="fas fa-heart"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  });

  productsList.innerHTML = html;
  productsGrid.classList.add("hidden");
  productsList.classList.remove("hidden");

  // Add event listeners to product list items
  addProductEventListeners();
}

// Render pagination
function renderPagination() {
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  if (totalPages <= 1) {
    document.getElementById("pagination").innerHTML = "";
    return;
  }

  let paginationHTML = "";

  // Previous button
  paginationHTML += `
    <button class="pagination-item ${currentPage === 1 ? "disabled" : ""}" 
            data-page="prev" ${currentPage === 1 ? "disabled" : ""}>
      <i class="fas fa-chevron-left"></i>
    </button>
  `;

  // Page numbers
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    paginationHTML += `
      <button class="pagination-item ${i === currentPage ? "active" : ""} style="background-color: #000; color: #fff;"
              data-page="${i}">
        ${i}
      </button>
      
    `;
  }

  // Next button
  paginationHTML += `
    <button class="pagination-item ${
      currentPage === totalPages ? "disabled" : ""
    }" 
            data-page="next" ${currentPage === totalPages ? "disabled" : ""}>
      <i class="fas fa-chevron-right"></i>
    </button>
  `;

  document.getElementById("pagination").innerHTML = paginationHTML;

  // Add event listeners to pagination items
  document.querySelectorAll(".pagination-item").forEach((item) => {
    item.addEventListener("click", handlePaginationClick);
  });
}

// Handle pagination click
function handlePaginationClick(event) {
  const pageButton = event.currentTarget;
  const page = pageButton.dataset.page;

  if (pageButton.classList.contains("disabled")) {
    return;
  }

  if (page === "prev") {
    currentPage--;
  } else if (page === "next") {
    currentPage++;
  } else {
    currentPage = Number.parseInt(page);
  }

  renderProducts();
  window.scrollTo({ top: 0, behavior: "smooth" });
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

// Show loading state
function showLoading() {
  if (productsGrid)
    productsGrid.innerHTML = `
    <div class="products-loading">
      <div class="spinner"></div>
      <p class="loading-text">Loading products...</p>
    </div>
  `;

  // productsList.innerHTML = `
  //   <div class="products-loading">
  //     <div class="spinner"></div>
  //     <p class="loading-text">Loading products...</p>
  //   </div>
  // `;
  console.log(productsGrid);
}

// Hide loading state
function hideLoading() {
  // Loading will be replaced when rendering products
}

// Show no products message
function showNoProducts(message) {
  const noProductsHTML = `
    <div class="no-products">
      <div class="no-products-icon">
        <i class="fas fa-search"></i>
      </div>
      <h3>No Products Found</h3>
      <p>${message}</p>
      <button id="reset-filters" class="btn btn-primary">Reset Filters</button>
    </div>
  `;

  if (currentView === "grid") {
    productsGrid.innerHTML = noProductsHTML;
    productsList.classList.add("hidden");
    productsGrid.classList.remove("hidden");
  } else {
    productsList.innerHTML = noProductsHTML;
    productsGrid.classList.add("hidden");
    productsList.classList.remove("hidden");
  }

  // Add event listener to reset filters button
  document
    .getElementById("reset-filters")
    ?.addEventListener("click", resetFilters);
}

// Add event listeners to product elements
function addProductEventListeners() {
  // Add to cart buttons
  document.querySelectorAll(".add-to-cart-btn").forEach((button) => {
    button.addEventListener("click", handleAddToCart);
  });

  // Quick view buttons
  document.querySelectorAll(".quick-view-btn").forEach((button) => {
    button.addEventListener("click", handleQuickView);
  });

  // Wishlist buttons
  document.querySelectorAll(".wishlist-btn").forEach((button) => {
    button.addEventListener("click", handleAddToWishlist);
  });

  // Product cards/items (for navigation to product detail)
  document
    .querySelectorAll(".product-card, .product-list-item")
    .forEach((product) => {
      product.addEventListener("click", handleProductClick);
    });
}

// Handle add to cart
async function handleAddToCart(event) {
  event.stopPropagation();

  try {
    const productId = Number.parseInt(event.currentTarget.dataset.productId);

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

// Handle quick view
async function handleQuickView(event) {
  event.stopPropagation();

  try {
    const productId = Number.parseInt(event.currentTarget.dataset.productId);

    // Show loading in modal
    productQuickView.innerHTML = `
      <div class="product-loading">
        <div class="spinner"></div>
        <p class="loading-text">Loading product details...</p>
      </div>
    `;

    // Show modal
    productModal.classList.add("active");

    // Fetch product details
    const product = await dataService.getProduct(productId);

    // Render product in modal
    productQuickView.innerHTML = `
      <div class="product-quick-image">
        <img src="${product.images[0]}" alt="${product.title}">
      </div>
      <div class="product-quick-details">
        <div class="product-quick-category">${product.category}</div>
        <h2 class="product-quick-title">${product.title}</h2>
        <div class="product-quick-rating">
          <div class="rating-stars">
            ${generateRatingStars(product.rating?.rate || 0)}
          </div>
          <span class="rating-count">(${
            product.rating?.count || 0
          } reviews)</span>
        </div>
        <div class="product-quick-price">$${product.price.toFixed(2)}</div>
        <p class="product-quick-description">${product.description}</p>
        <div class="product-quick-actions">
          <div class="quantity-selector">
            <button class="quantity-btn quantity-decrease">-</button>
            <input type="number" class="quantity-input" value="1" min="1" max="10">
            <button class="quantity-btn quantity-increase">+</button>
          </div>
          <button class="btn btn-primary btn-with-icon quick-add-to-cart" data-product-id="${
            product.id
          }">
            <i class="fas fa-shopping-cart"></i> Add to Cart
          </button>
        </div>
      </div>
    `;

    // Add event listeners to quick view elements
    const quantityInput = productQuickView.querySelector(".quantity-input");
    const decreaseBtn = productQuickView.querySelector(".quantity-decrease");
    const increaseBtn = productQuickView.querySelector(".quantity-increase");
    const addToCartBtn = productQuickView.querySelector(".quick-add-to-cart");

    decreaseBtn.addEventListener("click", () => {
      if (quantityInput.value > 1) {
        quantityInput.value = Number.parseInt(quantityInput.value) - 1;
      }
    });

    increaseBtn.addEventListener("click", () => {
      if (quantityInput.value < 10) {
        quantityInput.value = Number.parseInt(quantityInput.value) + 1;
      }
    });

    addToCartBtn.addEventListener("click", async () => {
      try {
        const quantity = Number.parseInt(quantityInput.value);

        // Add loading state to button
        addToCartBtn.innerHTML =
          '<i class="fas fa-spinner fa-spin"></i> Adding...';
        addToCartBtn.disabled = true;

        // Add to cart
        await CartService.addToCart(product.id, quantity);

        // Update cart count
        updateCartCount();

        // Show success notification
        UIService.showNotification(
          `${quantity} ${quantity > 1 ? "items" : "item"} added to cart!`,
          "success"
        );

        // Close modal
        productModal.classList.remove("active");
      } catch (error) {
        console.error("Error adding to cart:", error);
        UIService.showNotification(
          "Failed to add product to cart. Please try again.",
          "error"
        );

        // Reset button
        addToCartBtn.innerHTML =
          '<i class="fas fa-shopping-cart"></i> Add to Cart';
        addToCartBtn.disabled = false;
      }
    });
  } catch (error) {
    console.error("Error loading product details:", error);
    productQuickView.innerHTML = `
      <div class="error-message">
        <p>Failed to load product details. Please try again.</p>
      </div>
    `;
  }
}

// Handle add to wishlist
function handleAddToWishlist(event) {
  event.stopPropagation();

  // This is a placeholder for wishlist functionality
  UIService.showNotification("Wishlist feature coming soon!", "info");
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
  const cartCount = document.getElementById("cart-count");
  cartCount.textContent = CartService.getCartItemCount();
}

// Set up event listeners
function setupEventListeners() {
  // View options
  viewOptions.forEach((option) => {
    option.addEventListener("click", () => {
      viewOptions.forEach((opt) => opt.classList.remove("active"));
      option.classList.add("active");
      currentView = option.dataset.view;
      renderProducts();
    });
  });

  // Price filter
  applyPriceFilterBtn.addEventListener("click", () => {
    const minPrice = Number.parseFloat(minPriceInput.value) || 0;
    const maxPrice = Number.parseFloat(maxPriceInput.value) || 1000;

    if (minPrice > maxPrice) {
      UIService.showNotification(
        "Minimum price cannot be greater than maximum price.",
        "error"
      );
      return;
    }

    activeFilters.minPrice = minPrice;
    activeFilters.maxPrice = maxPrice;
    applyFilters();
  });

  // Rating filter
  ratingOptions.forEach((option) => {
    option.addEventListener("change", () => {
      activeFilters.rating = option.value;
      applyFilters();
    });
  });

  // Sort select
  sortSelect.addEventListener("change", () => {
    activeFilters.sort = sortSelect.value;
    applyFilters();
  });

  // Clear filters
  clearFiltersBtn.addEventListener("click", resetFilters);

  // Modal close
  productModalClose.addEventListener("click", () => {
    productModal.classList.remove("active");
  });

  // Close modal when clicking outside
  productModal.addEventListener("click", (event) => {
    if (event.target === productModal) {
      productModal.classList.remove("active");
    }
  });

  // Global event listeners
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && productModal.classList.contains("active")) {
      productModal.classList.remove("active");
    }
  });
}

// Initialize the shop page
document.addEventListener("DOMContentLoaded", init);
