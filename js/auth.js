import { AuthService } from "./services/auth-service.js";
import { UIService } from "./services/ui-services.js";

export function initAuth() {
  const authModal = document.getElementById("auth-modal");
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const authTabs = document.querySelectorAll(".auth-tab");
  const closeAuthModal = document.getElementById("auth-modal-close");
  const userMenu = document.getElementById("user-menu");
  const userMenuToggle = document.getElementById("user-menu-toggle");
  const logoutBtn = document.getElementById("logout-btn");
  const loginLink = document.getElementById("login-link");
  const registerLink = document.getElementById("register-link");

  // Initialize auth state
  AuthService.init();
  updateAuthUI();

  // Handle auth modal tabs
  authTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.id === "login-tab" ? "login" : "register";
      authTabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      if (target === "login") {
        loginForm.classList.remove("hidden");
        registerForm.classList.add("hidden");
      } else {
        loginForm.classList.add("hidden");
        registerForm.classList.remove("hidden");
      }
    });
  });

  // Clear form fields
  function clearFormFields(form) {
    const inputs = form.querySelectorAll(
      'input[type="text"], input[type="email"], input[type="password"]'
    );
    inputs.forEach((input) => (input.value = ""));
  }

  // Handle login form submission
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = loginForm.querySelector("#login-email").value.trim();
    const password = loginForm.querySelector("#login-password").value.trim();

    // Validate form
    if (!email || !password) {
      UIService.showNotification("Please fill in all fields", "error");
      return;
    }

    if (!isValidEmail(email)) {
      UIService.showNotification("Please enter a valid email address", "error");
      return;
    }

    try {
      // Show loading state
      const submitButton = loginForm.querySelector('button[type="submit"]');
      const originalText = submitButton.innerHTML;
      submitButton.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> Logging in...';
      submitButton.disabled = true;

      await AuthService.login(email, password);
      UIService.showNotification("Successfully logged in!", "success");
      authModal.classList.remove("active");
      updateAuthUI();
      clearFormFields(loginForm);

      // Reset button
      submitButton.innerHTML = originalText;
      submitButton.disabled = false;
    } catch (error) {
      UIService.showNotification(error.message, "error");

      // Reset button
      const submitButton = loginForm.querySelector('button[type="submit"]');
      submitButton.innerHTML = "Sign In";
      submitButton.disabled = false;
    }
  });

  // Handle register form submission
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = registerForm.querySelector("#register-name").value.trim();
    const email = registerForm.querySelector("#register-email").value.trim();
    const password = registerForm
      .querySelector("#register-password")
      .value.trim();
    const confirmPassword = registerForm
      .querySelector("#register-confirm-password")
      ?.value.trim();

    // Validate form
    if (!name || !email || !password) {
      UIService.showNotification("Please fill in all required fields", "error");
      return;
    }

    if (!isValidEmail(email)) {
      UIService.showNotification("Please enter a valid email address", "error");
      return;
    }

    if (password.length < 6) {
      UIService.showNotification(
        "Password must be at least 6 characters long",
        "error"
      );
      return;
    }

    if (confirmPassword && password !== confirmPassword) {
      UIService.showNotification("Passwords do not match", "error");
      return;
    }

    const userData = {
      name,
      email,
      password,
    };

    try {
      // Show loading state
      const submitButton = registerForm.querySelector('button[type="submit"]');
      const originalText = submitButton.innerHTML;
      submitButton.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> Creating account...';
      submitButton.disabled = true;

      await AuthService.register(userData);
      UIService.showNotification("Successfully registered!", "success");
      authModal.classList.remove("active");
      updateAuthUI();
      clearFormFields(registerForm);

      // Reset button
      submitButton.innerHTML = originalText;
      submitButton.disabled = false;
    } catch (error) {
      UIService.showNotification(error.message, "error");

      // Reset button
      const submitButton = registerForm.querySelector('button[type="submit"]');
      submitButton.innerHTML = "Create Account";
      submitButton.disabled = false;
    }
  });

  // Handle modal close button
  if (closeAuthModal) {
    closeAuthModal.addEventListener("click", () => {
      authModal.classList.remove("active");
      clearFormFields(loginForm);
      clearFormFields(registerForm);
    });
  }

  // Handle login/register links
  if (loginLink) {
    loginLink.addEventListener("click", (e) => {
      e.preventDefault();
      authModal.classList.add("active");
      document.getElementById("login-tab").click();
    });
  }

  if (registerLink) {
    registerLink.addEventListener("click", (e) => {
      e.preventDefault();
      authModal.classList.add("active");
      document.getElementById("register-tab").click();
    });
  }

  // Handle user menu toggle
  if (userMenuToggle) {
    userMenuToggle.addEventListener("click", () => {
      userMenu.classList.toggle("active");
    });
  }

  // Handle logout
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      AuthService.logout();
      updateAuthUI();
      UIService.showNotification("Successfully logged out!", "success");
    });
  }

  // Close user menu when clicking outside
  document.addEventListener("click", (e) => {
    if (
      userMenu &&
      !userMenu.contains(e.target) &&
      !userMenuToggle.contains(e.target)
    ) {
      userMenu.classList.remove("active");
    }
  });

  // Close modal when clicking outside
  authModal.addEventListener("click", (e) => {
    if (e.target === authModal) {
      authModal.classList.remove("active");
      clearFormFields(loginForm);
      clearFormFields(registerForm);
    }
  });

  // Close modal on escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && authModal.classList.contains("active")) {
      authModal.classList.remove("active");
      clearFormFields(loginForm);
      clearFormFields(registerForm);
    }
  });
}

// Update UI based on auth state
function updateAuthUI() {
  const userMenu = document.getElementById("user-menu");
  const userMenuToggle = document.getElementById("user-menu-toggle");
  const userMenuHeader = document.getElementById("user-menu-header");
  const userMenuLinks = document.getElementById("user-menu-links");
  const loginLink = document.getElementById("login-link");
  const registerLink = document.getElementById("register-link");

  if (AuthService.isAuthenticated()) {
    // User is logged in
    if (userMenu) userMenu.classList.remove("hidden");
    if (userMenuToggle) userMenuToggle.classList.remove("hidden");
    if (userMenuHeader) {
      const user = AuthService.getCurrentUser();
      userMenuHeader.innerHTML = `
        <p>Welcome, ${user.name}</p>
        <small>${user.email}</small>
      `;
    }
    if (userMenuLinks) {
      userMenuLinks.innerHTML = `
        <li><a href="profile.html"><i class="fas fa-user"></i> Profile</a></li>
        <li><a href="orders.html"><i class="fas fa-shopping-bag"></i> Orders</a></li>
        <li><a href="wishlist.html"><i class="fas fa-heart"></i> Wishlist</a></li>
        <li><button id="logout-btn"><i class="fas fa-sign-out-alt"></i> Logout</button></li>
      `;

      // Reattach logout button event listener
      const logoutBtn = document.getElementById("logout-btn");
      if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
          AuthService.logout();
          updateAuthUI();
          UIService.showNotification("Successfully logged out!", "success");
        });
      }
    }
  } else {
    // User is logged out
    if (userMenu) userMenu.classList.add("hidden");
    if (userMenuToggle) userMenuToggle.classList.add("hidden");
    if (userMenuHeader) {
      userMenuHeader.innerHTML = "<p>Sign in to your account</p>";
    }
    if (userMenuLinks) {
      userMenuLinks.innerHTML = `
        <li><a href="#" id="login-link"><i class="fas fa-sign-in-alt"></i> Sign In</a></li>
        <li><a href="#" id="register-link"><i class="fas fa-user-plus"></i> Create Account</a></li>
      `;

      // Reattach login/register link event listeners
      const loginLink = document.getElementById("login-link");
      const registerLink = document.getElementById("register-link");
      const authModal = document.getElementById("auth-modal");

      if (loginLink) {
        loginLink.addEventListener("click", (e) => {
          e.preventDefault();
          authModal.classList.add("active");
          document.getElementById("login-tab").click();
        });
      }

      if (registerLink) {
        registerLink.addEventListener("click", (e) => {
          e.preventDefault();
          authModal.classList.add("active");
          document.getElementById("register-tab").click();
        });
      }
    }
  }
}

// Helper function to validate email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
