// // Login page JavaScript

// import { AuthService } from "./services/auth-service.js";
// import { UIService } from "./services/ui-service.js";
// import { EventService } from "./services/event-service.js";

// // DOM Elements
// const loginForm = document.getElementById("login-form");
// const registerForm = document.getElementById("register-form");
// const loginTab = document.getElementById("login-tab");
// const registerTab = document.getElementById("register-tab");
// const loginPanel = document.getElementById("login-panel");
// const registerPanel = document.getElementById("register-panel");
// const redirectInput = document.getElementById("redirect-input");

// // Initialize
// function init() {
//   try {
//     // Initialize common events
//     EventService.initCommonEvents();

//     // Check if user is already logged in
//     if (AuthService.isLoggedIn()) {
//       // Redirect to home page or specified redirect URL
//       const redirectUrl = getRedirectUrl() || "index.html";
//       window.location.href = redirectUrl;
//       return;
//     }

//     // Set up redirect URL if provided in query params
//     const urlParams = new URLSearchParams(window.location.search);
//     const redirectParam = urlParams.get("redirect");

//     if (redirectParam && redirectInput) {
//       redirectInput.value = redirectParam;
//     }

//     // Set up event listeners
//     setupEventListeners();
//   } catch (error) {
//     console.error("Initialization error:", error);
//     UIService.showNotification(
//       "Error initializing login page. Please try again.",
//       "error"
//     );
//   }
// }

// // Set up event listeners
// function setupEventListeners() {
//   // Tab switching
//   if (loginTab && registerTab) {
//     loginTab.addEventListener("click", () => {
//       switchTab("login");
//     });

//     registerTab.addEventListener("click", () => {
//       switchTab("register");
//     });
//   }

//   // Login form submission
//   if (loginForm) {
//     loginForm.addEventListener("submit", handleLogin);
//   }

//   // Register form submission
//   if (registerForm) {
//     registerForm.addEventListener("submit", handleRegister);
//   }
// }

// // Switch between login and register tabs
// function switchTab(tab) {
//   if (tab === "login") {
//     loginTab.classList.add("active");
//     registerTab.classList.remove("active");
//     loginPanel.classList.remove("hidden");
//     registerPanel.classList.add("hidden");
//   } else {
//     loginTab.classList.remove("active");
//     registerTab.classList.add("active");
//     loginPanel.classList.add("hidden");
//     registerPanel.classList.remove("hidden");
//   }
// }

// // Handle login form submission
// async function handleLogin(event) {
//   event.preventDefault();

//   try {
//     // Get form data
//     const username = document.getElementById("login-username").value;
//     const password = document.getElementById("login-password").value;

//     // Validate form data
//     if (!username || !password) {
//       UIService.showNotification("Please fill in all fields.", "error");
//       return;
//     }

//     // Show loading state
//     const submitButton = loginForm.querySelector('button[type="submit"]');
//     const originalText = submitButton.innerHTML;
//     submitButton.disabled = true;
//     submitButton.innerHTML =
//       '<i class="fas fa-spinner fa-spin"></i> Signing in...';

//     // Attempt login
//     await AuthService.login(username, password);

//     // Show success notification
//     UIService.showNotification("Login successful! Redirecting...", "success");

//     // Redirect to appropriate page
//     setTimeout(() => {
//       const redirectUrl = getRedirectUrl() || "index.html";
//       window.location.href = redirectUrl;
//     }, 1000);
//   } catch (error) {
//     console.error("Login error:", error);
//     UIService.showNotification(
//       "Login failed. Please check your credentials and try again.",
//       "error"
//     );

//     // Reset submit button
//     const submitButton = loginForm.querySelector('button[type="submit"]');
//     submitButton.disabled = false;
//     submitButton.innerHTML = "Sign In";
//   }
// }

// // Handle register form submission
// async function handleRegister(event) {
//   event.preventDefault();

//   try {
//     // Get form data
//     const username = document.getElementById("register-username").value;
//     const email = document.getElementById("register-email").value;
//     const password = document.getElementById("register-password").value;
//     const confirmPassword = document.getElementById(
//       "register-confirm-password"
//     ).value;
//     const fullName = document.getElementById("register-name").value;

//     // Validate form data
//     if (!username || !email || !password || !confirmPassword || !fullName) {
//       UIService.showNotification("Please fill in all fields.", "error");
//       return;
//     }

//     if (password !== confirmPassword) {
//       UIService.showNotification("Passwords do not match.", "error");
//       return;
//     }

//     // Show loading state
//     const submitButton = registerForm.querySelector('button[type="submit"]');
//     const originalText = submitButton.innerHTML;
//     submitButton.disabled = true;
//     submitButton.innerHTML =
//       '<i class="fas fa-spinner fa-spin"></i> Creating account...';

//     // Attempt registration
//     await AuthService.register(username, email, password, fullName);

//     // Show success notification
//     UIService.showNotification(
//       "Registration successful! Redirecting...",
//       "success"
//     );

//     // Redirect to appropriate page
//     setTimeout(() => {
//       const redirectUrl = getRedirectUrl() || "index.html";
//       window.location.href = redirectUrl;
//     }, 1000);
//   } catch (error) {
//     console.error("Registration error:", error);
//     UIService.showNotification(
//       "Registration failed. Please try again.",
//       "error"
//     );

//     // Reset submit button
//     const submitButton = registerForm.querySelector('button[type="submit"]');
//     submitButton.disabled = false;
//     submitButton.innerHTML = "Create Account";
//   }
// }

// // Get redirect URL from hidden input or localStorage
// function getRedirectUrl() {
//   if (redirectInput && redirectInput.value) {
//     return redirectInput.value;
//   }

//   const storedRedirect = localStorage.getItem("redirectUrl");
//   if (storedRedirect) {
//     localStorage.removeItem("redirectUrl");
//     return storedRedirect;
//   }

//   return null;
// }

// // Initialize the login page
// document.addEventListener("DOMContentLoaded", init);
