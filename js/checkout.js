// Checkout page JavaScript

import { CartService } from "./services/cart-service.js";
import { AuthService } from "./services/auth-service.js";
import { UIService } from "./services/ui-service.js";
import { EventService } from "./services/event-service.js";

// DOM Elements
const checkoutForm = document.getElementById("checkout-form");
const shippingForm = document.getElementById("shipping-form");
const paymentForm = document.getElementById("payment-form");
const orderSummary = document.getElementById("order-summary");
const cartItemsList = document.getElementById("cart-items-list");
const cartSubtotal = document.getElementById("cart-subtotal");
const cartShipping = document.getElementById("cart-shipping");
const cartTax = document.getElementById("cart-tax");
const cartTotal = document.getElementById("cart-total");
const placeOrderBtn = document.getElementById("place-order-btn");
const cartCount = document.getElementById("cart-count");
const orderSuccessModal = document.getElementById("order-success-modal");
const orderNumber = document.getElementById("order-number");
const orderDate = document.getElementById("order-date");
const orderSuccessModalClose = document.getElementById(
  "order-success-modal-close"
);

// State
let shippingData = {};
let paymentData = {};
let currentStep = 1;

// Initialize
async function init() {
  try {
    // Initialize common events
    EventService.initCommonEvents();

    // Check if user is logged in
    if (!AuthService.isLoggedIn()) {
      // Redirect to login page
      window.location.href = "login.html?redirect=checkout.html";
      return;
    }

    // Check if cart is empty
    if (CartService.getCartItemCount() === 0) {
      // Redirect to cart page
      window.location.href = "cart.html";
      return;
    }

    // Update cart count
    updateCartCount();

    // Load cart summary
    loadCartSummary();

    // Set up event listeners
    setupEventListeners();
  } catch (error) {
    console.error("Initialization error:", error);
    UIService.showNotification(
      "Error initializing checkout page. Please try again.",
      "error"
    );
  }
}

// Load cart summary
function loadCartSummary() {
  try {
    // Get cart from service
    const cart = CartService.getCart();

    // Render cart items
    renderCartItems(cart);

    // Update cart summary
    updateCartSummary(cart);
  } catch (error) {
    console.error("Error loading cart summary:", error);
    UIService.showNotification(
      "Error loading cart summary. Please try again.",
      "error"
    );
  }
}

// Render cart items
function renderCartItems(cart) {
  let html = "";

  cart.items.forEach((item) => {
    html += `
      <div class="cart-summary-item">
        <div class="cart-summary-item-image">
          <img src="${item.image}" alt="${item.title}">
        </div>
        <div class="cart-summary-item-details">
          <h4>${item.title}</h4>
          <p>Quantity: ${item.quantity}</p>
          <p>$${item.price.toFixed(2)} each</p>
        </div>
        <div class="cart-summary-item-total">
          $${item.total.toFixed(2)}
        </div>
      </div>
    `;
  });

  cartItemsList.innerHTML = html;
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

// Handle shipping form submission
function handleShippingFormSubmit(event) {
  event.preventDefault();

  // Validate form
  if (!shippingForm.checkValidity()) {
    shippingForm.reportValidity();
    return;
  }

  // Get form data
  const formData = new FormData(shippingForm);
  shippingData = Object.fromEntries(formData.entries());

  // Go to next step
  goToStep(2);
}

// Handle payment form submission
function handlePaymentFormSubmit(event) {
  event.preventDefault();

  // Validate form
  if (!paymentForm.checkValidity()) {
    paymentForm.reportValidity();
    return;
  }

  // Get form data
  const formData = new FormData(paymentForm);
  paymentData = Object.fromEntries(formData.entries());

  // Go to next step
  goToStep(3);
}

// Go to step
function goToStep(step) {
  // Hide all steps
  document.querySelectorAll(".checkout-step").forEach((stepElement) => {
    stepElement.classList.add("hidden");
  });

  // Show current step
  document.getElementById(`step-${step}`).classList.remove("hidden");

  // Update step indicators
  document.querySelectorAll(".step-indicator").forEach((indicator, index) => {
    if (index + 1 < step) {
      indicator.classList.add("completed");
      indicator.classList.remove("active");
    } else if (index + 1 === step) {
      indicator.classList.add("active");
      indicator.classList.remove("completed");
    } else {
      indicator.classList.remove("active", "completed");
    }
  });

  // Update current step
  currentStep = step;

  // Scroll to top
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Place order
async function placeOrder() {
  try {
    // Disable place order button
    placeOrderBtn.disabled = true;
    placeOrderBtn.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i> Processing...';

    // Get cart
    const cart = CartService.getCart();

    // Create order data
    const orderData = {
      userId: AuthService.getCurrentUser().id,
      date: new Date().toISOString(),
      products: cart.items.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
      })),
      shipping: shippingData,
      payment: {
        method: paymentData.paymentMethod,
        // Don't include sensitive payment details
      },
      total: cart.total + (cart.total > 50 ? 0 : 10) + cart.total * 0.1,
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
    // Reset place order button
    placeOrderBtn.disabled = false;
    placeOrderBtn.innerHTML = "Place Order";
  }
}

// Update cart count
function updateCartCount() {
  cartCount.textContent = CartService.getCartItemCount();
}

// Set up event listeners
function setupEventListeners() {
  // Shipping form
  if (shippingForm) {
    shippingForm.addEventListener("submit", handleShippingFormSubmit);
  }

  // Payment form
  if (paymentForm) {
    paymentForm.addEventListener("submit", handlePaymentFormSubmit);
  }

  // Back buttons
  document.querySelectorAll(".btn-back").forEach((button) => {
    button.addEventListener("click", () => {
      goToStep(currentStep - 1);
    });
  });

  // Place order button
  if (placeOrderBtn) {
    placeOrderBtn.addEventListener("click", placeOrder);
  }

  // Order success modal close
  if (orderSuccessModalClose) {
    orderSuccessModalClose.addEventListener("click", () => {
      orderSuccessModal.classList.remove("active");
      window.location.href = "index.html";
    });
  }

  // Close modal when clicking outside
  if (orderSuccessModal) {
    orderSuccessModal.addEventListener("click", (event) => {
      if (event.target === orderSuccessModal) {
        orderSuccessModal.classList.remove("active");
        window.location.href = "index.html";
      }
    });
  }

  // Global event listeners
  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      orderSuccessModal.classList.contains("active")
    ) {
      orderSuccessModal.classList.remove("active");
      window.location.href = "index.html";
    }
  });
}

// Initialize the checkout page
document.addEventListener("DOMContentLoaded", init);
