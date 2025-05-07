// UI Service
export class UIService {
  constructor(productService, cartService, authService) {
    this.productService = productService;
    this.cartService = cartService;
    this.authService = authService;

    // DOM elements that might be used across pages
    this.cartCountElement = document.getElementById("cart-count");
    this.userMenuHeader = document.getElementById("user-menu-header");
    this.userMenuLinks = document.getElementById("user-menu-links");
    this.notificationsContainer = document.getElementById(
      "notifications-container"
    );
  }

  updateCartUI() {
    if (this.cartCountElement) {
      const cartCount = this.cartService.getCartCount();
      this.cartCountElement.textContent = cartCount;

      if (cartCount > 0) {
        this.cartCountElement.classList.add("active");
      } else {
        this.cartCountElement.classList.remove("active");
      }
    }
  }

  updateAuthUI() {
    if (this.userMenuHeader && this.userMenuLinks) {
      const user = this.authService.getUser();

      if (user) {
        this.userMenuHeader.innerHTML = `
                  <p>Welcome, <strong>${
                    user.name?.firstname || user.username
                  }</strong></p>
              `;

        this.userMenuLinks.innerHTML = `
                  <li><a href="profile.html">Your Profile</a></li>
                  <li><a href="orders.html">Your Orders</a></li>
                  <li><a href="#" id="logout-link">Sign Out</a></li>
              `;

        // Add event listener to logout link
        const logoutLink = document.getElementById("logout-link");
        if (logoutLink) {
          logoutLink.addEventListener("click", (e) => {
            e.preventDefault();
            this.authService.logout();
            this.updateAuthUI();
            this.showNotification("You have been signed out.", "success");

            // Redirect to home page if on a protected page
            const protectedPages = [
              "checkout.html",
              "profile.html",
              "orders.html",
            ];
            const currentPage = window.location.pathname.split("/").pop();

            if (protectedPages.includes(currentPage)) {
              window.location.href = "index.html";
            }
          });
        }
      } else {
        this.userMenuHeader.innerHTML = `
                  <p>Sign in to your account</p>
              `;

        this.userMenuLinks.innerHTML = `
                  <li><a href="#" id="sign-in-link">Sign In</a></li>
                  <li><a href="#" id="register-link">Create Account</a></li>
              `;

        // Add event listeners to auth links
        const signInLink = document.getElementById("sign-in-link");
        const registerLink = document.getElementById("register-link");

        if (signInLink) {
          signInLink.addEventListener("click", (e) => {
            e.preventDefault();
            this.showAuthModal("login");
          });
        }

        if (registerLink) {
          registerLink.addEventListener("click", (e) => {
            e.preventDefault();
            this.showAuthModal("register");
          });
        }
      }
    }
  }

  showAuthModal(tab = "login") {
    const authModal = document.getElementById("auth-modal");
    const loginTab = document.getElementById("login-tab");
    const registerTab = document.getElementById("register-tab");
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");

    if (authModal && loginTab && registerTab && loginForm && registerForm) {
      // Show modal
      authModal.classList.add("active");

      // Set active tab
      if (tab === "login") {
        loginTab.classList.add("active");
        registerTab.classList.remove("active");
        loginForm.classList.remove("hidden");
        registerForm.classList.add("hidden");
      } else {
        loginTab.classList.remove("active");
        registerTab.classList.add("active");
        loginForm.classList.add("hidden");
        registerForm.classList.remove("hidden");
      }

      // Add event listeners
      const authModalClose = document.getElementById("auth-modal-close");
      if (authModalClose) {
        authModalClose.addEventListener("click", () => {
          authModal.classList.remove("active");
        });
      }

      // Tab switching
      loginTab.addEventListener("click", () => {
        loginTab.classList.add("active");
        registerTab.classList.remove("active");
        loginForm.classList.remove("hidden");
        registerForm.classList.add("hidden");
      });

      registerTab.addEventListener("click", () => {
        loginTab.classList.remove("active");
        registerTab.classList.add("active");
        loginForm.classList.add("hidden");
        registerForm.classList.remove("hidden");
      });

      // Form submission
      loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = document.getElementById("login-username").value;
        const password = document.getElementById("login-password").value;

        try {
          await this.authService.login(username, password);
          this.updateAuthUI();
          authModal.classList.remove("active");
          this.showNotification(
            "You have been signed in successfully.",
            "success"
          );
        } catch (error) {
          this.showNotification(
            "Login failed. Please check your credentials.",
            "error"
          );
        }
      });

      registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = document.getElementById("register-name").value;
        const email = document.getElementById("register-email").value;
        const username = document.getElementById("register-username").value;
        const password = document.getElementById("register-password").value;

        try {
          await this.authService.register(username, email, password, name);
          this.updateAuthUI();
          authModal.classList.remove("active");
          this.showNotification(
            "Your account has been created successfully.",
            "success"
          );
        } catch (error) {
          this.showNotification(
            "Registration failed. Please try again.",
            "error"
          );
        }
      });
    }
  }

  showNotification(message, type = "info", duration = 5000) {
    if (this.notificationsContainer) {
      const notification = document.createElement("div");
      notification.className = `notification ${type}`;

      let icon = "";
      switch (type) {
        case "success":
          icon = '<i class="icon-success"></i>';
          break;
        case "error":
          icon = '<i class="icon-error"></i>';
          break;
        case "warning":
          icon = '<i class="icon-warning"></i>';
          break;
        default:
          icon = '<i class="icon-info"></i>';
      }

      notification.innerHTML = `
              <div class="notification-content">
                  <div class="notification-icon">${icon}</div>
                  <div class="notification-message">
                      <h4>${type.charAt(0).toUpperCase() + type.slice(1)}</h4>
                      <p>${message}</p>
                  </div>
              </div>
          `;

      this.notificationsContainer.appendChild(notification);

      // Remove notification after duration
      setTimeout(() => {
        notification.style.opacity = "0";
        setTimeout(() => {
          this.notificationsContainer.removeChild(notification);
        }, 300);
      }, duration);
    }
  }

  renderProducts(products, container) {
    if (!container) return;

    if (products.length === 0) {
      container.innerHTML = `
              <div class="no-products">
                  <p>No products found.</p>
              </div>
          `;
      return;
    }

    container.innerHTML = "";

    products.forEach((product) => {
      const productCard = document.createElement("div");
      productCard.className = "product-card";

      productCard.innerHTML = `
              <div class="product-card-image">
                  <img src="${product.image}" alt="${product.title}">
                  <div class="product-card-actions">
                      <button class="btn-icon add-to-favorites" data-id="${
                        product.id
                      }" aria-label="Add to favorites">
                          <i class="icon-heart"></i>
                      </button>
                      <button class="btn-icon view-product" data-id="${
                        product.id
                      }" aria-label="View product">
                          <i class="icon-eye"></i>
                      </button>
                  </div>
              </div>
              <div class="product-card-content">
                  <div class="product-card-category">${product.category}</div>
                  <h3 class="product-card-title">${product.title}</h3>
                  <div class="product-card-price">$${product.price.toFixed(
                    2
                  )}</div>
                  <button class="btn btn-primary btn-block add-to-cart" data-id="${
                    product.id
                  }">
                      <i class="icon-cart"></i> Add to Cart
                  </button>
              </div>
          `;

      container.appendChild(productCard);
    });
  }

  renderProductDetails(product, container) {
    if (!container || !product) return;

    // Generate star rating
    const rating = product.rating?.rate || 0;
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    let starsHtml = "";
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        starsHtml += '<i class="icon-star-full"></i>';
      } else if (i === fullStars && hasHalfStar) {
        starsHtml += '<i class="icon-star-half"></i>';
      } else {
        starsHtml += '<i class="icon-star-empty"></i>';
      }
    }

    container.innerHTML = `
          <div class="product-details">
              <div class="product-image">
                  <img src="${product.image}" alt="${product.title}">
              </div>
              <div class="product-info">
                  <h1>${product.title}</h1>
                  <div class="product-category">${product.category}</div>
                  <div class="product-rating">
                      <div class="rating-stars">${starsHtml}</div>
                      <span>${product.rating?.rate} (${
      product.rating?.count
    } reviews)</span>
                  </div>
                  <div class="product-price">$${product.price.toFixed(2)}</div>
                  <div class="product-description">${product.description}</div>
                  
                  <div class="quantity-control">
                      <div class="quantity-label">Quantity:</div>
                      <div class="quantity-actions">
                          <button class="quantity-btn decrease-quantity">-</button>
                          <input type="number" class="quantity-input" value="1" min="1" max="99">
                          <button class="quantity-btn increase-quantity">+</button>
                      </div>
                  </div>
                  
                  <div class="product-action-buttons">
                      <button class="btn btn-primary add-to-cart-detail" data-id="${
                        product.id
                      }">
                          <i class="icon-cart"></i> Add to Cart
                      </button>
                      <button class="btn btn-outline add-to-favorites-detail" data-id="${
                        product.id
                      }">
                          <i class="icon-heart"></i>
                      </button>
                  </div>
                  
                  <div class="product-meta">
                      <div class="meta-item">
                          <i class="icon-truck"></i>
                          <span>Free shipping on orders over $50</span>
                      </div>
                      <div class="meta-item">
                          <i class="icon-return"></i>
                          <span>30-day return policy</span>
                      </div>
                      <div class="meta-item">
                          <i class="icon-shield"></i>
                          <span>Secure payment</span>
                      </div>
                  </div>
              </div>
          </div>
      `;
  }

  renderCart(container) {
    if (!container) return;

    const cart = this.cartService.getCart();

    if (cart.length === 0) {
      container.innerHTML = `
              <div class="cart-empty">
                  <h2>Your cart is empty</h2>
                  <p>Looks like you haven't added any products to your cart yet.</p>
                  <a href="shop.html" class="btn btn-primary">Continue Shopping</a>
              </div>
          `;
      return;
    }

    const subtotal = this.cartService.calculateSubtotal();
    const shipping = this.cartService.calculateShipping();
    const tax = this.cartService.calculateTax();
    const total = this.cartService.calculateTotal();

    container.innerHTML = `
          <div class="cart-layout">
              <div class="cart-items">
                  <table class="cart-table">
                      <thead>
                          <tr>
                              <th>Product</th>
                              <th>Price</th>
                              <th>Quantity</th>
                              <th>Total</th>
                              <th></th>
                          </tr>
                      </thead>
                      <tbody>
                          ${cart
                            .map(
                              (item) => `
                              <tr>
                                  <td>
                                      <div class="cart-product">
                                          <div class="cart-product-image">
                                              <img src="${item.image}" alt="${
                                item.title
                              }">
                                          </div>
                                          <div class="cart-product-details">
                                              <h3>${item.title}</h3>
                                              <p>${item.category}</p>
                                          </div>
                                      </div>
                                  </td>
                                  <td>$${item.price.toFixed(2)}</td>
                                  <td>
                                      <div class="cart-quantity">
                                          <div class="quantity-actions">
                                              <button class="quantity-btn decrease-cart-quantity" data-id="${
                                                item.id
                                              }">-</button>
                                              <input type="number" class="quantity-input cart-quantity-input" value="${
                                                item.quantity
                                              }" min="1" max="99" data-id="${
                                item.id
                              }">
                                              <button class="quantity-btn increase-cart-quantity" data-id="${
                                                item.id
                                              }">+</button>
                                          </div>
                                      </div>
                                  </td>
                                  <td>$${(item.price * item.quantity).toFixed(
                                    2
                                  )}</td>
                                  <td>
                                      <button class="cart-remove" data-id="${
                                        item.id
                                      }">
                                          <i class="icon-trash"></i>
                                      </button>
                                  </td>
                              </tr>
                          `
                            )
                            .join("")}
                      </tbody>
                  </table>
                  
                  <div class="cart-actions">
                      <button class="btn btn-outline" id="clear-cart">Clear Cart</button>
                      <a href="shop.html" class="btn btn-outline">Continue Shopping</a>
                  </div>
              </div>
              
              <div class="cart-summary">
                  <h3>Order Summary</h3>
                  
                  <div class="cart-summary-row">
                      <span>Subtotal</span>
                      <span>$${subtotal.toFixed(2)}</span>
                  </div>
                  <div class="cart-summary-row">
                      <span>Shipping</span>
                      <span>${
                        shipping === 0 ? "Free" : "$" + shipping.toFixed(2)
                      }</span>
                  </div>
                  <div class="cart-summary-row">
                      <span>Tax</span>
                      <span>$${tax.toFixed(2)}</span>
                  </div>
                  <div class="cart-summary-row total">
                      <span>Total</span>
                      <span>$${total.toFixed(2)}</span>
                  </div>
                  
                  <div class="cart-actions">
                      <a href="checkout.html" class="btn btn-primary btn-block">Proceed to Checkout</a>
                  </div>
              </div>
          </div>
      `;
  }

  renderOrderSummary(container) {
    if (!container) return;

    const cart = this.cartService.getCart();

    if (cart.length === 0) {
      container.innerHTML = `
              <h3>Order Summary</h3>
              <p>Your cart is empty.</p>
              <a href="shop.html" class="btn btn-primary btn-block">Shop Now</a>
          `;
      return;
    }

    const subtotal = this.cartService.calculateSubtotal();
    const shipping = this.cartService.calculateShipping();
    const tax = this.cartService.calculateTax();
    const total = this.cartService.calculateTotal();

    container.innerHTML = `
          <h3>Order Summary</h3>
          
          <div class="order-items">
              ${cart
                .map(
                  (item) => `
                  <div class="order-item">
                      <div class="order-item-image">
                          <img src="${item.image}" alt="${item.title}">
                      </div>
                      <div class="order-item-details">
                          <h4>${item.title}</h4>
                          <p>Qty: ${item.quantity}</p>
                          <p>$${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                  </div>
              `
                )
                .join("")}
          </div>
          
          <div class="cart-summary-row">
              <span>Subtotal</span>
              <span>$${subtotal.toFixed(2)}</span>
          </div>
          <div class="cart-summary-row">
              <span>Shipping</span>
              <span>${
                shipping === 0 ? "Free" : "$" + shipping.toFixed(2)
              }</span>
          </div>
          <div class="cart-summary-row">
              <span>Tax</span>
              <span>$${tax.toFixed(2)}</span>
          </div>
          <div class="cart-summary-row total">
              <span>Total</span>
              <span>$${total.toFixed(2)}</span>
          </div>
      `;
  }

  renderSearchResults(products, container) {
    if (!container) return;

    if (products.length === 0) {
      container.innerHTML = `
            <div class="search-results-list empty">
                <p>No products found matching your search.</p>
            </div>
        `;
      return;
    }

    container.innerHTML = "";

    products.forEach((product) => {
      const resultItem = document.createElement("div");
      resultItem.className = "search-result-item";

      resultItem.innerHTML = `
            <div class="search-result-image">
                <img src="${product.image}" alt="${product.title}">
            </div>
            <div class="search-result-details">
                <h4 class="search-result-title">${product.title}</h4>
                <div class="search-result-category">${product.category}</div>
                <div class="search-result-price">$${product.price.toFixed(
                  2
                )}</div>
            </div>
        `;

      resultItem.addEventListener("click", () => {
        window.location.href = `product.html?id=${product.id}`;
      });

      container.appendChild(resultItem);
    });
  }
}
