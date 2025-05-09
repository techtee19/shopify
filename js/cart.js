// Cart page JavaScript

import { CartService } from "./services/cart-service.js";
import { UIService } from "./services/ui-services.js";
import { EventService } from "./services/event-service.js";

// DOM Elements
const cartLoading = document.getElementById("loading-indicator");
const cartEmpty = document.getElementById("cart-empty");
const cartItems = document.getElementById("cart-items");
const cartItemsList = document.getElementById("cart-items-list");
const cartSubtotal = document.getElementById("cart-subtotal");
const cartShipping = document.getElementById("cart-shipping");
const cartTax = document.getElementById("cart-tax");
const cartTotal = document.getElementById("cart-total");
const clearCartBtn = document.getElementById("clear-cart");
const checkoutBtn = document.getElementById("checkout-btn");
const cartCount = document.getElementById("cart-count");
const orderSuccessModal = document.getElementById("order-success-modal");
const orderNumber = document.getElementById("order-number");
const orderDate = document.getElementById("order-date");
const orderSuccessModalClose = document.getElementById(
  "order-success-modal-close"
);

// Initialize
async function init() {
  try {
    // Initialize common events
    EventService.initCommonEvents();

    // Show loading
    showLoading();

    // Load cart
    await loadCart();

    // Set up event listeners
    setupEventListeners();
  } catch (error) {
    console.error("Initialization error:", error);
    UIService.showNotification(
      "Error loading cart. Please try again.",
      "error"
    );
  }
}

// Load cart
async function loadCart() {
  try {
    // Get cart from service
    const cart = CartService.getCart();

    // Update cart count
    updateCartCount();

    // Check if cart is empty
    if (cart.items.length === 0) {
      showEmptyCart();
      return;
    }

    // Render cart items
    renderCartItems(cart);

    // Update cart summary
    updateCartSummary(cart);

    // Show cart items
    hideLoading();
    cartEmpty.classList.add("hidden");
    cartItems.classList.remove("hidden");
  } catch (error) {
    console.error("Error loading cart:", error);
    UIService.showNotification(
      "Error loading cart. Please try again.",
      "error"
    );
  }
}

// Render cart items
function renderCartItems(cart) {
  let html = "";

  cart.items.forEach((item) => {
    html += `
      <div class="cart-item" data-item-id="${item.id}">
        <div class="cart-item-product">
          <div class="cart-item-image">
            <img src="${item.image}" alt="${item.title}">
          </div>
          <div class="cart-item-details">
            <h3>${item.title}</h3>
            <p>Product ID: ${item.id}</p>
          </div>
        </div>
        <div class="cart-item-price">$${item.price.toFixed(2)}</div>
        <div class="cart-item-quantity">
          <div class="cart-quantity-selector">
            <button class="cart-quantity-btn quantity-decrease" data-item-id="${
              item.id
            }">-</button>
            <input type="number" class="cart-quantity-input" value="${
              item.quantity
            }" min="1" max="10" data-item-id="${item.id}">
            <button class="cart-quantity-btn quantity-increase" data-item-id="${
              item.id
            }">+</button>
          </div>
        </div>
        <div class="cart-item-total">$${item.total.toFixed(2)}</div>
        <button class="cart-item-remove" data-item-id="${
          item.id
        }" aria-label="Remove item">
          <i class="fas fa-trash-alt"></i>
        </button>
      </div>
    `;
  });

  cartItemsList.innerHTML = html;

  // Add event listeners to cart items
  addCartItemEventListeners();
}

// Update cart summary
function updateCartSummary(cart) {
  const subtotal = cart.total;
  const shipping = subtotal > 0 ? (subtotal > 50 ? 0 : 10) : 0;
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + shipping + tax;

  cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
  cartShipping.textContent =
    shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`;
  cartTax.textContent = `$${tax.toFixed(2)}`;
  cartTotal.textContent = `$${total.toFixed(2)}`;
}

// Add event listeners to cart items
function addCartItemEventListeners() {
  // Quantity decrease buttons
  document.querySelectorAll(".quantity-decrease").forEach((button) => {
    button.addEventListener("click", handleQuantityDecrease);
  });

  // Quantity increase buttons
  document.querySelectorAll(".quantity-increase").forEach((button) => {
    button.addEventListener("click", handleQuantityIncrease);
  });

  // Quantity input fields
  document.querySelectorAll(".cart-quantity-input").forEach((input) => {
    input.addEventListener("change", handleQuantityChange);
  });

  // Remove buttons
  document.querySelectorAll(".cart-item-remove").forEach((button) => {
    button.addEventListener("click", handleRemoveItem);
  });
}

// Handle quantity decrease
function handleQuantityDecrease(event) {
  const itemId = parseInt(event.currentTarget.dataset.itemId);
  const input = document.querySelector(
    `.cart-quantity-input[data-item-id="${itemId}"]`
  );
  let quantity = parseInt(input.value);

  if (quantity > 1) {
    quantity--;
    input.value = quantity;
    updateCartItem(itemId, quantity);
  }
}

// Handle quantity increase
function handleQuantityIncrease(event) {
  const itemId = parseInt(event.currentTarget.dataset.itemId);
  const input = document.querySelector(
    `.cart-quantity-input[data-item-id="${itemId}"]`
  );
  let quantity = parseInt(input.value);

  if (quantity < 10) {
    quantity++;
    input.value = quantity;
    updateCartItem(itemId, quantity);
  }
}

// Handle quantity change
function handleQuantityChange(event) {
  const itemId = parseInt(event.currentTarget.dataset.itemId);
  let quantity = parseInt(event.currentTarget.value);

  // Validate quantity
  if (isNaN(quantity) || quantity < 1) {
    quantity = 1;
    event.currentTarget.value = quantity;
  } else if (quantity > 10) {
    quantity = 10;
    event.currentTarget.value = quantity;
  }

  updateCartItem(itemId, quantity);
}

// Handle remove item
function handleRemoveItem(event) {
  const itemId = parseInt(event.currentTarget.dataset.itemId);

  // Show confirmation dialog
  if (confirm("Are you sure you want to remove this item from your cart?")) {
    removeCartItem(itemId);
  }
}

// Update cart item
function updateCartItem(itemId, quantity) {
  try {
    // Update cart item
    const cart = CartService.updateCartItem(itemId, quantity);

    // Update item total
    const item = cart.items.find((item) => item.id === itemId);
    if (item) {
      const totalElement = document.querySelector(
        `.cart-item[data-item-id="${itemId}"] .cart-item-total`
      );
      totalElement.textContent = `$${item.total.toFixed(2)}`;
    }

    // Update cart summary
    updateCartSummary(cart);

    // Update cart count
    updateCartCount();
  } catch (error) {
    console.error("Error updating cart item:", error);
    UIService.showNotification(
      "Error updating cart item. Please try again.",
      "error"
    );
  }
}

// Remove cart item
function removeCartItem(itemId) {
  try {
    // Remove item from cart
    const cart = CartService.removeFromCart(itemId);

    // Remove item from DOM
    const itemElement = document.querySelector(
      `.cart-item[data-item-id="${itemId}"]`
    );
    itemElement.classList.add("fade-out");

    setTimeout(() => {
      itemElement.remove();

      // Check if cart is empty
      if (cart.items.length === 0) {
        showEmptyCart();
      } else {
        // Update cart summary
        updateCartSummary(cart);
      }

      // Update cart count
      updateCartCount();

      // Show notification
      UIService.showNotification("Item removed from cart.", "success");
    }, 300);
  } catch (error) {
    console.error("Error removing cart item:", error);
    UIService.showNotification(
      "Error removing cart item. Please try again.",
      "error"
    );
  }
}

// Clear cart
function clearCart() {
  try {
    // Show confirmation dialog
    if (!confirm("Are you sure you want to clear your cart?")) {
      return;
    }

    // Clear cart
    CartService.clearCart();

    // Show empty cart
    showEmptyCart();

    // Update cart count
    updateCartCount();

    // Show notification
    UIService.showNotification("Cart cleared.", "success");
  } catch (error) {
    console.error("Error clearing cart:", error);
    UIService.showNotification(
      "Error clearing cart. Please try again.",
      "error"
    );
  }
}

// Checkout
async function checkout() {
  try {
    // Check if cart is empty
    if (CartService.getCartItemCount() === 0) {
      UIService.showNotification("Your cart is empty.", "error");
      return;
    }

    // Disable checkout button
    checkoutBtn.disabled = true;
    checkoutBtn.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i> Processing...';

    // Simulate checkout process
    const orderData = {
      userId: 1, // Default user ID
      date: new Date().toISOString(),
      products: CartService.getCart().items.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
      })),
    };

    // Process checkout
    const result = await CartService.checkout(orderData);

    // Show success modal
    if (result.success) {
      orderNumber.textContent =
        result.orderId || Math.floor(Math.random() * 1000000);
      orderDate.textContent = new Date().toLocaleDateString();
      orderSuccessModal.classList.add("active");

      // Update cart count
      updateCartCount();
    }
  } catch (error) {
    console.error("Error during checkout:", error);
    UIService.showNotification(
      "Error during checkout. Please try again.",
      "error"
    );
  } finally {
    // Reset checkout button
    checkoutBtn.disabled = false;
    checkoutBtn.innerHTML = "Proceed to Checkout";
  }
}

// Show loading
function showLoading() {
  cartLoading.classList.remove("hidden");
  cartEmpty.classList.add("hidden");
  cartItems.classList.add("hidden");
}

// Hide loading
function hideLoading() {
  cartLoading.classList.add("hidden");
}

// Show empty cart
function showEmptyCart() {
  hideLoading();
  cartItems.classList.add("hidden");
  cartEmpty.classList.remove("hidden");
}

// Update cart count
function updateCartCount() {
  cartCount.textContent = CartService.getCartItemCount();
}

// Set up event listeners
function setupEventListeners() {
  // Clear cart button
  clearCartBtn.addEventListener("click", clearCart);

  // Checkout button
  checkoutBtn.addEventListener("click", checkout);

  // Order success modal close
  orderSuccessModalClose.addEventListener("click", () => {
    orderSuccessModal.classList.remove("active");
  });

  // Close modal when clicking outside
  orderSuccessModal.addEventListener("click", (event) => {
    if (event.target === orderSuccessModal) {
      orderSuccessModal.classList.remove("active");
    }
  });

  // Global event listeners
  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      orderSuccessModal.classList.contains("active")
    ) {
      orderSuccessModal.classList.remove("active");
    }
  });
}

// Initialize the cart page
document.addEventListener("DOMContentLoaded", init);
