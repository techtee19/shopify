// Event Service - Handles event listeners

import { UIService } from "./ui-services.js";
import { AuthService } from "./auth-service.js";

// Initialize common event listeners
function initCommonEvents() {
  // Initialize theme
  UIService.initTheme();

  // Theme toggle
  const themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", UIService.toggleTheme);
  }

  // Mobile menu toggle
  const mobileMenuToggle = document.getElementById("mobile-menu-toggle");
  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener("click", UIService.toggleMobileMenu);
  }

  // User menu toggle
  const userMenuToggle = document.getElementById("user-menu-toggle");
  if (userMenuToggle) {
    userMenuToggle.addEventListener("click", UIService.toggleUserMenu);
  }

  // Login link
  const loginLink = document.getElementById("login-link");
  if (loginLink) {
    loginLink.addEventListener("click", handleLoginClick);
  }

  // Register link
  const registerLink = document.getElementById("register-link");
  if (registerLink) {
    registerLink.addEventListener("click", handleRegisterClick);
  }

  // Update current year in footer
  const currentYearElement = document.getElementById("current-year");
  if (currentYearElement) {
    currentYearElement.textContent = new Date().getFullYear();
  }

  // Update auth UI
  updateAuthUI();

  // Close dropdowns when clicking outside
  document.addEventListener("click", handleOutsideClick);
}

// Handle login click
function handleLoginClick(event) {
  event.preventDefault();

  // Show auth modal with login tab active
  const authModal = document.getElementById("auth-modal");
  const loginTab = document.getElementById("login-tab");

  if (authModal && loginTab) {
    authModal.classList.add("active");
    loginTab.click();
  } else {
    // Redirect to login page if modal doesn't exist
    window.location.href = "login.html";
  }

  // Close user menu
  const userMenu = document.getElementById("user-menu");
  if (userMenu) {
    userMenu.classList.remove("active");
  }
}

// Handle register click
function handleRegisterClick(event) {
  event.preventDefault();

  // Show auth modal with register tab active
  const authModal = document.getElementById("auth-modal");
  const registerTab = document.getElementById("register-tab");

  if (authModal && registerTab) {
    authModal.classList.add("active");
    registerTab.click();
  } else {
    // Redirect to login page if modal doesn't exist
    window.location.href = "login.html?register=true";
  }

  // Close user menu
  const userMenu = document.getElementById("user-menu");
  if (userMenu) {
    userMenu.classList.remove("active");
  }
}

// Handle outside click
function handleOutsideClick(event) {
  // Close user menu when clicking outside
  const userMenu = document.getElementById("user-menu");
  const userMenuToggle = document.getElementById("user-menu-toggle");

  if (
    userMenu &&
    userMenu.classList.contains("active") &&
    !userMenu.contains(event.target) &&
    !userMenuToggle.contains(event.target)
  ) {
    userMenu.classList.remove("active");
  }

  // Close search form when clicking outside
  const searchForm = document.getElementById("search-form");
  const searchToggle = document.getElementById("search-toggle");

  if (
    searchForm &&
    searchForm.classList.contains("active") &&
    !searchForm.contains(event.target) &&
    !searchToggle.contains(event.target)
  ) {
    searchForm.classList.remove("active");
  }
}

// Update auth UI based on login status
function updateAuthUI() {
  const user = AuthService.getCurrentUser();
  const userMenuHeader = document.getElementById("user-menu-header");
  const userMenuLinks = document.getElementById("user-menu-links");

  if (user) {
    // User is logged in
    if (userMenuHeader) {
      userMenuHeader.innerHTML = `
        <p>Welcome, ${user.username}</p>
      `;
    }

    if (userMenuLinks) {
      userMenuLinks.innerHTML = `
        <li><a href="profile.html"><i class="fas fa-user"></i> My Profile</a></li>
        <li><a href="orders.html"><i class="fas fa-shopping-bag"></i> My Orders</a></li>
        <li><a href="#" id="logout-link"><i class="fas fa-sign-out-alt"></i> Logout</a></li>
      `;

      // Add logout event listener
      const logoutLink = document.getElementById("logout-link");
      if (logoutLink) {
        logoutLink.addEventListener("click", handleLogout);
      }
    }
  } else {
    // User is not logged in
    if (userMenuHeader) {
      userMenuHeader.innerHTML = `
        <p>Sign in to your account</p>
      `;
    }

    if (userMenuLinks) {
      userMenuLinks.innerHTML = `
        <li><a href="#" id="login-link"><i class="fas fa-sign-in-alt"></i> Sign In</a></li>
        <li><a href="#" id="register-link"><i class="fas fa-user-plus"></i> Create Account</a></li>
      `;

      // Add login/register event listeners
      const loginLink = document.getElementById("login-link");
      const registerLink = document.getElementById("register-link");

      if (loginLink) {
        loginLink.addEventListener("click", handleLoginClick);
      }

      if (registerLink) {
        registerLink.addEventListener("click", handleRegisterClick);
      }
    }
  }
}

// Handle logout
function handleLogout(event) {
  event.preventDefault();

  // Logout user
  AuthService.logout();

  // Update auth UI
  updateAuthUI();

  // Close user menu
  const userMenu = document.getElementById("user-menu");
  if (userMenu) {
    userMenu.classList.remove("active");
  }

  // Show notification
  UIService.showNotification(
    "You have been logged out successfully.",
    "success"
  );

  // Redirect to home page if on protected page
  const protectedPages = ["profile.html", "orders.html", "checkout.html"];
  const currentPage = window.location.pathname.split("/").pop();

  if (protectedPages.includes(currentPage)) {
    window.location.href = "index.html";
  }
}

// Initialize auth modal events
function initAuthModalEvents() {
  const authModal = document.getElementById("auth-modal");

  if (!authModal) return;

  // Auth modal close
  const authModalClose = document.getElementById("auth-modal-close");
  if (authModalClose) {
    authModalClose.addEventListener("click", () => {
      authModal.classList.remove("active");
    });
  }

  // Close modal when clicking outside
  authModal.addEventListener("click", (event) => {
    if (event.target === authModal) {
      authModal.classList.remove("active");
    }
  });

  // Auth tabs
  const loginTab = document.getElementById("login-tab");
  const registerTab = document.getElementById("register-tab");
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");

  if (loginTab && registerTab && loginForm && registerForm) {
    loginTab.addEventListener("click", () => {
      loginTab.classList.add("active");
      registerTab.classList.remove("active");
      loginForm.classList.remove("hidden");
      registerForm.classList.add("hidden");
    });

    registerTab.addEventListener("click", () => {
      registerTab.classList.add("active");
      loginTab.classList.remove("active");
      registerForm.classList.remove("hidden");
      loginForm.classList.add("hidden");
    });
  }

  // Login form submit
  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const username = document.getElementById("login-username").value;
      const password = document.getElementById("login-password").value;

      try {
        // Login user
        await AuthService.login(username, password);

        // Close modal
        authModal.classList.remove("active");

        // Update auth UI
        updateAuthUI();

        // Show notification
        UIService.showNotification(
          "You have been logged in successfully.",
          "success"
        );
      } catch (error) {
        console.error("Login error:", error);
        UIService.showNotification(
          "Login failed. Please check your credentials and try again.",
          "error"
        );
      }
    });
  }

  // Register form submit
  if (registerForm) {
    registerForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const name = document.getElementById("register-name").value;
      const email = document.getElementById("register-email").value;
      const username = document.getElementById("register-username").value;
      const password = document.getElementById("register-password").value;

      try {
        // Register user
        await AuthService.register(username, email, password, name);

        // Close modal
        authModal.classList.remove("active");

        // Update auth UI
        updateAuthUI();

        // Show notification
        UIService.showNotification(
          "Your account has been created successfully.",
          "success"
        );
      } catch (error) {
        console.error("Registration error:", error);
        UIService.showNotification(
          "Registration failed. Please try again.",
          "error"
        );
      }
    });
  }
}

// Export all functions
export const EventService = {
  initCommonEvents,
  // initAuthModalEvents, // Commented out to avoid duplicate modal event logic
  updateAuthUI,
};
