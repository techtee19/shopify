// Event Service
export class EventService {
  constructor(productService, cartService, authService, uiService) {
    this.productService = productService;
    this.cartService = cartService;
    this.authService = authService;
    this.uiService = uiService;
  }

  setupEventListeners() {
    // Common event listeners for all pages
    this.setupHeaderEvents();
    this.setupThemeToggle();
    this.setupAuthEvents();

    // Page-specific event listeners
    const currentPage =
      window.location.pathname.split("/").pop() || "index.html";

    switch (currentPage) {
      case "index.html":
        this.setupHomePageEvents();
        break;
      case "shop.html":
        this.setupShopPageEvents();
        break;
      case "product.html":
        this.setupProductPageEvents();
        break;
      case "cart.html":
        this.setupCartPageEvents();
        break;
      case "checkout.html":
        this.setupCheckoutPageEvents();
        break;
      default:
        // Default events
        break;
    }
  }

  setupHeaderEvents() {
    // Mobile menu toggle
    const mobileMenuToggle = document.getElementById("mobile-menu-toggle");
    const mobileMenu = document.getElementById("mobile-menu");

    if (mobileMenuToggle && mobileMenu) {
      mobileMenuToggle.addEventListener("click", () => {
        mobileMenu.classList.toggle("active");

        // Change icon
        const icon = mobileMenuToggle.querySelector("i");
        if (icon) {
          if (mobileMenu.classList.contains("active")) {
            icon.className = "icon-close";
          } else {
            icon.className = "icon-menu";
          }
        }
      });
    }

    // User menu toggle
    const userMenuToggle = document.getElementById("user-menu-toggle");
    const userMenu = document.getElementById("user-menu");

    if (userMenuToggle && userMenu) {
      userMenuToggle.addEventListener("click", () => {
        userMenu.classList.toggle("active");
      });

      // Close user menu when clicking outside
      document.addEventListener("click", (e) => {
        if (
          !userMenuToggle.contains(e.target) &&
          !userMenu.contains(e.target)
        ) {
          userMenu.classList.remove("active");
        }
      });
    }

    // Set current year in footer
    const currentYearElement = document.getElementById("current-year");
    if (currentYearElement) {
      currentYearElement.textContent = new Date().getFullYear();
    }
  }

  setupThemeToggle() {
    const themeToggle = document.getElementById("theme-toggle");

    if (themeToggle) {
      // Check for saved theme preference or use preferred color scheme
      const savedTheme = localStorage.getItem("theme");
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;

      if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
        document.body.setAttribute("data-theme", "dark");
        themeToggle.querySelector("i").className = "icon-sun";
      } else {
        document.body.setAttribute("data-theme", "light");
        themeToggle.querySelector("i").className = "icon-moon";
      }

      themeToggle.addEventListener("click", () => {
        const currentTheme = document.body.getAttribute("data-theme");
        const newTheme = currentTheme === "dark" ? "light" : "dark";

        document.body.setAttribute("data-theme", newTheme);
        localStorage.setItem("theme", newTheme);

        // Update icon
        themeToggle.querySelector("i").className =
          newTheme === "dark" ? "icon-sun" : "icon-moon";
      });
    }
  }

  setupAuthEvents() {
    // Auth modal events are handled in UIService.showAuthModal()
  }

  setupHomePageEvents() {
    // Load featured products
    const featuredProductsGrid = document.getElementById(
      "featured-products-grid"
    );
    if (featuredProductsGrid) {
      this.productService
        .loadProducts()
        .then(() => {
          const featuredProducts = this.productService.getFeaturedProducts(8);
          this.uiService.renderProducts(featuredProducts, featuredProductsGrid);
          this.setupProductCardEvents(featuredProductsGrid);
        })
        .catch((error) => {
          console.error("Error loading featured products:", error);
          featuredProductsGrid.innerHTML = `
                      <div class="error-message">
                          <p>Failed to load products. Please try again later.</p>
                      </div>
                  `;
        });
    }

    // Load categories
    const categoriesGrid = document.getElementById("categories-grid");
    if (categoriesGrid) {
      this.productService
        .getCategories()
        .then((categories) => {
          categoriesGrid.innerHTML = "";

          categories.forEach((category) => {
            const categoryCard = document.createElement("div");
            categoryCard.className = "category-card";

            categoryCard.innerHTML = `
                          <a href="shop.html?category=${category}">
                              <div class="category-card-image">
                                  <img src="images/category-placeholder.jpg" alt="${category}">
                              </div>
                              <div class="category-card-content">
                                  <h3>${
                                    category.charAt(0).toUpperCase() +
                                    category.slice(1)
                                  }</h3>
                              </div>
                          </a>
                      `;

            categoriesGrid.appendChild(categoryCard);
          });
        })
        .catch((error) => {
          console.error("Error loading categories:", error);
          categoriesGrid.innerHTML = `
                      <div class="error-message">
                          <p>Failed to load categories. Please try again later.</p>
                      </div>
                  `;
        });
    }
  }

  setupShopPageEvents() {
    // Filter events are handled in shop.js

    // Product card events
    const productsContainer = document.getElementById("products-container");
    if (productsContainer) {
      this.setupProductCardEvents(productsContainer);
    }
  }

  setupProductPageEvents() {
    const productDetailsContainer = document.getElementById(
      "product-details-container"
    );

    if (productDetailsContainer) {
      // Get product ID from URL
      const urlParams = new URLSearchParams(window.location.search);
      const productId = urlParams.get("id");

      if (productId) {
        this.productService
          .getProductById(productId)
          .then((product) => {
            this.uiService.renderProductDetails(
              product,
              productDetailsContainer
            );

            // Update breadcrumb
            const productBreadcrumb =
              document.getElementById("product-breadcrumb");
            if (productBreadcrumb) {
              productBreadcrumb.textContent = product.title;
            }

            // Update page title
            document.title = `${product.title} - ShopEase`;

            // Setup quantity controls
            const decreaseBtn =
              productDetailsContainer.querySelector(".decrease-quantity");
            const increaseBtn =
              productDetailsContainer.querySelector(".increase-quantity");
            const quantityInput =
              productDetailsContainer.querySelector(".quantity-input");

            if (decreaseBtn && increaseBtn && quantityInput) {
              decreaseBtn.addEventListener("click", () => {
                const currentValue = parseInt(quantityInput.value);
                if (currentValue > 1) {
                  quantityInput.value = currentValue - 1;
                }
              });

              increaseBtn.addEventListener("click", () => {
                const currentValue = parseInt(quantityInput.value);
                quantityInput.value = currentValue + 1;
              });

              quantityInput.addEventListener("change", () => {
                let value = parseInt(quantityInput.value);
                if (isNaN(value) || value < 1) {
                  value = 1;
                }
                quantityInput.value = value;
              });
            }

            // Add to cart button
            const addToCartBtn = productDetailsContainer.querySelector(
              ".add-to-cart-detail"
            );
            if (addToCartBtn) {
              addToCartBtn.addEventListener("click", () => {
                const quantity = parseInt(quantityInput.value);
                this.cartService.addToCart(product, quantity);
                this.uiService.updateCartUI();
                this.uiService.showNotification(
                  `${product.title} has been added to your cart.`,
                  "success"
                );
              });
            }
          })
          .catch((error) => {
            console.error("Error loading product details:", error);
            productDetailsContainer.innerHTML = `
                          <div class="error-message">
                              <p>Failed to load product details. Please try again later.</p>
                              <a href="shop.html" class="btn btn-primary">Back to Shop</a>
                          </div>
                      `;
          });
      } else {
        productDetailsContainer.innerHTML = `
                  <div class="error-message">
                      <p>Product not found.</p>
                      <a href="shop.html" class="btn btn-primary">Back to Shop</a>
                  </div>
              `;
      }
    }
  }

  setupCartPageEvents() {
    const cartContainer = document.getElementById("cart-container");

    if (cartContainer) {
      this.uiService.renderCart(cartContainer);

      // Quantity controls
      cartContainer.addEventListener("click", (e) => {
        if (e.target.classList.contains("decrease-cart-quantity")) {
          const productId = parseInt(e.target.dataset.id);
          const quantityInput = cartContainer.querySelector(
            `.cart-quantity-input[data-id="${productId}"]`
          );

          if (quantityInput) {
            let currentValue = parseInt(quantityInput.value);
            if (currentValue > 1) {
              currentValue--;
              quantityInput.value = currentValue;
              this.cartService.updateQuantity(productId, currentValue);
              this.uiService.renderCart(cartContainer);
              this.uiService.updateCartUI();
            }
          }
        } else if (e.target.classList.contains("increase-cart-quantity")) {
          const productId = parseInt(e.target.dataset.id);
          const quantityInput = cartContainer.querySelector(
            `.cart-quantity-input[data-id="${productId}"]`
          );

          if (quantityInput) {
            let currentValue = parseInt(quantityInput.value);
            currentValue++;
            quantityInput.value = currentValue;
            this.cartService.updateQuantity(productId, currentValue);
            this.uiService.renderCart(cartContainer);
            this.uiService.updateCartUI();
          }
        } else if (
          e.target.classList.contains("cart-remove") ||
          e.target.closest(".cart-remove")
        ) {
          const button = e.target.classList.contains("cart-remove")
            ? e.target
            : e.target.closest(".cart-remove");
          const productId = parseInt(button.dataset.id);

          this.cartService.removeFromCart(productId);
          this.uiService.renderCart(cartContainer);
          this.uiService.updateCartUI();
          this.uiService.showNotification("Item removed from cart.", "success");
        }
      });

      // Quantity input change
      cartContainer.addEventListener("change", (e) => {
        if (e.target.classList.contains("cart-quantity-input")) {
          const productId = parseInt(e.target.dataset.id);
          let value = parseInt(e.target.value);

          if (isNaN(value) || value < 1) {
            value = 1;
            e.target.value = value;
          }

          this.cartService.updateQuantity(productId, value);
          this.uiService.renderCart(cartContainer);
          this.uiService.updateCartUI();
        }
      });

      // Clear cart button
      const clearCartBtn = document.getElementById("clear-cart");
      if (clearCartBtn) {
        clearCartBtn.addEventListener("click", () => {
          this.cartService.clearCart();
          this.uiService.renderCart(cartContainer);
          this.uiService.updateCartUI();
          this.uiService.showNotification(
            "Your cart has been cleared.",
            "success"
          );
        });
      }
    }
  }

  setupCheckoutPageEvents() {
    // Check if user is logged in
    if (!this.authService.isLoggedIn()) {
      window.location.href = "login.html?redirect=checkout.html";
      return;
    }

    // Check if cart is empty
    if (this.cartService.getCart().length === 0) {
      window.location.href = "cart.html";
      return;
    }

    // Render order summary
    const orderSummary = document.getElementById("order-summary");
    if (orderSummary) {
      this.uiService.renderOrderSummary(orderSummary);
    }

    // Checkout steps
    const shippingForm = document.getElementById("shipping-form");
    const paymentForm = document.getElementById("payment-form");
    const backToShipping = document.getElementById("back-to-shipping");
    const backToPayment = document.getElementById("back-to-payment");
    const placeOrderBtn = document.getElementById("place-order");

    if (shippingForm) {
      shippingForm.addEventListener("submit", (e) => {
        e.preventDefault();

        // Validate form
        if (shippingForm.checkValidity()) {
          // Move to payment step
          document
            .querySelector('.checkout-step[data-step="1"]')
            .classList.add("completed");
          document
            .querySelector('.checkout-step[data-step="2"]')
            .classList.add("active");

          document
            .getElementById("shipping-section")
            .classList.remove("active");
          document.getElementById("payment-section").classList.add("active");

          // Save shipping data
          const formData = new FormData(shippingForm);
          const shippingData = {};

          for (const [key, value] of formData.entries()) {
            shippingData[key] = value;
          }

          localStorage.setItem("shippingData", JSON.stringify(shippingData));
        } else {
          // Trigger HTML5 validation
          const firstInvalid = shippingForm.querySelector(":invalid");
          if (firstInvalid) {
            firstInvalid.focus();
          }
        }
      });
    }

    if (paymentForm) {
      // Toggle credit card fields based on payment method
      const paymentMethodRadios = paymentForm.querySelectorAll(
        'input[name="paymentMethod"]'
      );
      const creditCardFields = document.getElementById("credit-card-fields");

      if (paymentMethodRadios.length && creditCardFields) {
        paymentMethodRadios.forEach((radio) => {
          radio.addEventListener("change", () => {
            if (radio.value === "credit") {
              creditCardFields.style.display = "block";
            } else {
              creditCardFields.style.display = "none";
            }
          });
        });
      }

      paymentForm.addEventListener("submit", (e) => {
        e.preventDefault();

        // Validate form
        if (paymentForm.checkValidity()) {
          // Move to review step
          document
            .querySelector('.checkout-step[data-step="2"]')
            .classList.add("completed");
          document
            .querySelector('.checkout-step[data-step="3"]')
            .classList.add("active");

          document.getElementById("payment-section").classList.remove("active");
          document.getElementById("review-section").classList.add("active");

          // Save payment data
          const formData = new FormData(paymentForm);
          const paymentData = {};

          for (const [key, value] of formData.entries()) {
            paymentData[key] = value;
          }

          localStorage.setItem("paymentData", JSON.stringify(paymentData));

          // Populate review sections
          this.populateReviewSections();
        } else {
          // Trigger HTML5 validation
          const firstInvalid = paymentForm.querySelector(":invalid");
          if (firstInvalid) {
            firstInvalid.focus();
          }
        }
      });
    }

    if (backToShipping) {
      backToShipping.addEventListener("click", () => {
        document
          .querySelector('.checkout-step[data-step="2"]')
          .classList.remove("active");
        document
          .querySelector('.checkout-step[data-step="1"]')
          .classList.remove("completed");

        document.getElementById("payment-section").classList.remove("active");
        document.getElementById("shipping-section").classList.add("active");
      });
    }

    if (backToPayment) {
      backToPayment.addEventListener("click", () => {
        document
          .querySelector('.checkout-step[data-step="3"]')
          .classList.remove("active");
        document
          .querySelector('.checkout-step[data-step="2"]')
          .classList.remove("completed");

        document.getElementById("review-section").classList.remove("active");
        document.getElementById("payment-section").classList.add("active");
      });
    }

    if (placeOrderBtn) {
      placeOrderBtn.addEventListener("click", () => {
        // Process order
        this.processOrder();
      });
    }
  }

  populateReviewSections() {
    const shippingReview = document.getElementById("shipping-review");
    const paymentReview = document.getElementById("payment-review");
    const itemsReview = document.getElementById("items-review");

    // Shipping review
    if (shippingReview) {
      const shippingData = JSON.parse(
        localStorage.getItem("shippingData") || "{}"
      );

      shippingReview.innerHTML = `
              <p>${shippingData.firstName} ${shippingData.lastName}</p>
              <p>${shippingData.address}</p>
              <p>${shippingData.city}, ${shippingData.state} ${shippingData.zipCode}</p>
              <p>${shippingData.country}</p>
              <p>Phone: ${shippingData.phone}</p>
          `;
    }

    // Payment review
    if (paymentReview) {
      const paymentData = JSON.parse(
        localStorage.getItem("paymentData") || "{}"
      );

      if (paymentData.paymentMethod === "credit") {
        paymentReview.innerHTML = `
                  <p>Payment Method: Credit Card</p>
                  <p>Name on Card: ${paymentData.cardName}</p>
                  <p>Card Number: **** **** **** ${paymentData.cardNumber.slice(
                    -4
                  )}</p>
              `;
      } else {
        paymentReview.innerHTML = `
                  <p>Payment Method: PayPal</p>
              `;
      }
    }

    // Items review
    if (itemsReview) {
      const cart = this.cartService.getCart();

      if (cart.length === 0) {
        itemsReview.innerHTML = "<p>Your cart is empty.</p>";
        return;
      }

      let itemsHtml = "";

      cart.forEach((item) => {
        itemsHtml += `
                  <div class="review-item">
                      <div>
                          <p class="item-title">${item.title}</p>
                          <p class="item-quantity">Qty: ${item.quantity}</p>
                      </div>
                      <p class="item-price">$${(
                        item.price * item.quantity
                      ).toFixed(2)}</p>
                  </div>
              `;
      });

      itemsReview.innerHTML = itemsHtml;
    }
  }

  processOrder() {
    // In a real app, you would send the order to your backend
    // For demo purposes, we'll just clear the cart and redirect to a success page

    this.cartService.clearCart();
    this.uiService.updateCartUI();

    // Clear checkout data
    localStorage.removeItem("shippingData");
    localStorage.removeItem("paymentData");

    // Show success message
    this.uiService.showNotification(
      "Your order has been placed successfully!",
      "success"
    );

    // Redirect to success page
    setTimeout(() => {
      window.location.href = "order-success.html";
    }, 1500);
  }

  setupProductCardEvents(container) {
    if (!container) return;

    container.addEventListener("click", (e) => {
      // Add to cart button
      if (
        e.target.classList.contains("add-to-cart") ||
        e.target.closest(".add-to-cart")
      ) {
        const button = e.target.classList.contains("add-to-cart")
          ? e.target
          : e.target.closest(".add-to-cart");
        const productId = parseInt(button.dataset.id);

        this.productService
          .getProductById(productId)
          .then((product) => {
            this.cartService.addToCart(product);
            this.uiService.updateCartUI();
            this.uiService.showNotification(
              `${product.title} has been added to your cart.`,
              "success"
            );
          })
          .catch((error) => {
            console.error("Error adding product to cart:", error);
            this.uiService.showNotification(
              "Failed to add product to cart.",
              "error"
            );
          });
      }

      // View product button
      if (
        e.target.classList.contains("view-product") ||
        e.target.closest(".view-product")
      ) {
        const button = e.target.classList.contains("view-product")
          ? e.target
          : e.target.closest(".view-product");
        const productId = parseInt(button.dataset.id);

        window.location.href = `product.html?id=${productId}`;
      }

      // Add to favorites button
      if (
        e.target.classList.contains("add-to-favorites") ||
        e.target.closest(".add-to-favorites")
      ) {
        const button = e.target.classList.contains("add-to-favorites")
          ? e.target
          : e.target.closest(".add-to-favorites");
        const productId = parseInt(button.dataset.id);

        // In a real app, you would add the product to favorites
        // For demo purposes, we'll just show a notification
        this.uiService.showNotification(
          "Product added to favorites.",
          "success"
        );
      }
    });
  }
}
