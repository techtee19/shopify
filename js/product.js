// Product page JavaScript
import { ProductService } from "./services/product-service.js";
import { CartService } from "./services/cart-service.js";
import { AuthService } from "./services/auth-service.js";
import { UIService } from "./services/ui-service.js";
import { EventService } from "./services/event-service.js";

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
  // Initialize services
  const productService = new ProductService();
  const cartService = new CartService();
  const authService = new AuthService();
  const uiService = new UIService(productService, cartService, authService);
  const eventService = new EventService(
    productService,
    cartService,
    authService,
    uiService
  );

  // Update UI
  uiService.updateCartUI();
  uiService.updateAuthUI();

  // Setup event listeners
  eventService.setupEventListeners();
});
